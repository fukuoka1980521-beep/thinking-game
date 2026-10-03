const { GoogleGenAI, Type } = require("@google/genai");
const {
  NPC_IDS,
  ACTION_TYPES,
  BOUNDARY_MODES,
  RELATIONAL_EVENTS,
  SCENE_STATUSES,
  UNCERTAINTY_LEVELS,
  buildInterpretResponseSchema,
  buildInterpretPrompt,
  buildNpcResponseSchema,
  buildNpcPrompt,
  buildConverseResponseSchema,
  buildConversationContextText,
  buildConversePrompt,
  buildNpcExchangePrompt,
  buildReflectAgentResponseSchema,
  buildReflectAgentPrompt,
  normalizeConverseResponse,
  normalizeReflectAgentResponse,
  buildOrganizeThoughtResponseSchema,
  buildOrganizeThoughtPrompt,
  buildHealthResponse,
  getCaseCanon,
  getCaseDossiers,
  worldEffectsForCase,
  INTERPRET_SYSTEM_INSTRUCTION,
  NPC_SYSTEM_INSTRUCTION,
  CONVERSE_SYSTEM_INSTRUCTION,
  REFLECT_AGENT_SYSTEM_INSTRUCTION,
  ORGANIZE_THOUGHT_SYSTEM_INSTRUCTION,
  validateInput,
  applyCors,
  createFixedWindowLimiter,
} = require("./lib");
const { canonicalStateFactsForCase } = require("./stateFacts");
const {
  TURN_PLAN_SYSTEM_INSTRUCTION,
  RENDER_SYSTEM_INSTRUCTION,
  EVIDENCE_VERIFY_SYSTEM_INSTRUCTION,
  buildTurnPlanSchema,
  buildRenderSchema,
  buildEvidenceVerificationSchema,
  buildEvidenceLedger,
  buildEvidenceVerificationPrompt,
  buildTurnPlanPrompt,
  buildRenderPrompt,
  normalizeTurnPlan,
  normalizeRenderedLine,
  normalizeEvidenceVerification,
  downgradeUnsupportedResponsibilityPlan,
  downgradeUnsupportedFactPlan,
} = require("./turnPlanner");

// Same no-secret pattern as functions/dialogue/ and functions/newlife-dialogue/:
// the only identity this function ever uses is its own Cloud Run/Cloud
// Functions service account (Application Default Credentials). No API key
// string exists anywhere in this codebase, this repo, or the deployed
// artifact. This is a separate, isolated function for the refoundation
// (V13-V24 / V27 / V31) ontology — it does not share code, prompts, or
// character set with functions/dialogue/ or functions/newlife-dialogue/.
const PROJECT = process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION = process.env.NEWLIFE_REFOUNDATION_AI_LOCATION || "asia-northeast1";
const MODEL = process.env.NEWLIFE_REFOUNDATION_AI_MODEL || "gemini-2.5-flash";
const MAX_MODEL_CALLS_PER_MINUTE = Math.max(
  1,
  Number.parseInt(process.env.NEWLIFE_REFOUNDATION_AI_MAX_CALLS_PER_MINUTE || "40", 10) || 40
);
const MAX_REFLECTION_CALLS_PER_MINUTE = Math.max(
  1,
  Number.parseInt(process.env.NEWLIFE_REFOUNDATION_AI_MAX_REFLECTION_CALLS_PER_MINUTE || "6", 10) || 6
);
const modelCallLimiter = createFixedWindowLimiter(MAX_MODEL_CALLS_PER_MINUTE, 60_000);
const reflectionCallLimiter = createFixedWindowLimiter(MAX_REFLECTION_CALLS_PER_MINUTE, 60_000);

const INTERPRET_RESPONSE_SCHEMA = buildInterpretResponseSchema(Type);
const NPC_RESPONSE_SCHEMA = buildNpcResponseSchema(Type);
const ORGANIZE_THOUGHT_RESPONSE_SCHEMA = buildOrganizeThoughtResponseSchema(Type);
const REFLECT_AGENT_RESPONSE_SCHEMA = buildReflectAgentResponseSchema(Type);
const RENDER_RESPONSE_SCHEMA = buildRenderSchema(Type);
const EVIDENCE_VERIFY_RESPONSE_SCHEMA = buildEvidenceVerificationSchema(Type);

let genAiClient;
function getClient() {
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({ vertexai: true, project: PROJECT, location: LOCATION });
  }
  return genAiClient;
}

async function callModel(client, { systemInstruction, prompt, responseSchema, limiter = modelCallLimiter }) {
  const generateOnce = () => {
    if (!limiter.consume()) {
      const error = new Error("local_model_rate_limit");
      error.code = "LOCAL_MODEL_RATE_LIMIT";
      throw error;
    }
    return client.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
        // Same disclosed empty-response mitigation as functions/newlife-dialogue/:
        // gemini-2.5-flash can spend budget on internal thinking and return no
        // visible text when the budget is too small; one transparent retry.
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema,
      },
    });
  };

  let response = await generateOnce();
  let text = (response.text || "").trim();
  if (!text) {
    response = await generateOnce();
    text = (response.text || "").trim();
  }
  return text;
}

/**
 * V38. Dialogue is the user-facing primary product output; a malformed
 * `candidateTurn`/effect-metadata payload must never make an otherwise
 * usable character reply disappear -- `normalizeConverseResponse` (lib.js)
 * already salvages the line and collapses effects to the conservative
 * CLARIFY/UNKNOWN/no-events shape, treating `body.targetNpc` as
 * authoritative rather than whatever npc id the model happened to echo.
 * Only a genuinely *unusable* npcLine (empty model response, unparseable
 * JSON, or missing/oversized npcLine) is a real failure here, and gets
 * exactly one retry against the same canonical prompt/schema before the
 * caller fails closed.
 */
function withCanonicalStateFacts(body) {
  const dynamicState = body && body.dynamicState && typeof body.dynamicState === "object"
    ? body.dynamicState
    : {};
  return {
    ...body,
    dynamicState: {
      ...dynamicState,
      canonicalStateFacts: canonicalStateFactsForCase(body.caseId, dynamicState),
    },
  };
}

function plannerEnums(caseId, evidenceLedger = []) {
  const evidenceIds = evidenceLedger.map((record) => record.id);
  const accountabilityEvidenceIds = evidenceLedger
    .filter((record) => record.kind === "ACCOUNTABILITY_FACT")
    .map((record) => record.id);
  return {
    actionTypes: ACTION_TYPES,
    boundaryModes: BOUNDARY_MODES,
    relationalEvents: RELATIONAL_EVENTS,
    npcIds: NPC_IDS,
    sceneStatuses: SCENE_STATUSES,
    uncertaintyLevels: UNCERTAINTY_LEVELS,
    worldEffects: worldEffectsForCase(caseId),
    evidenceIds,
    accountabilityEvidenceIds,
  };
}

function lastPlayerUtterance(recentDialogue) {
  if (!Array.isArray(recentDialogue)) return "";
  for (let i = recentDialogue.length - 1; i >= 0; i -= 1) {
    if (recentDialogue[i] && recentDialogue[i].speaker === "PLAYER") return recentDialogue[i].text || "";
  }
  return "";
}

async function attemptPlannedTurn(client, body, continuation = false) {
  const enriched = withCanonicalStateFacts(body);
  const dossiers = getCaseDossiers(body.caseId);
  const dossier = dossiers && dossiers[body.targetNpc];
  const evidenceLedger = buildEvidenceLedger({
    caseCanon: getCaseCanon(body.caseId),
    dossier,
    dynamicState: enriched.dynamicState,
    recentDialogue: body.recentDialogue,
    rawPlayerUtterance: continuation ? lastPlayerUtterance(body.recentDialogue) : body.rawPlayerUtterance,
  });
  const enums = plannerEnums(body.caseId, evidenceLedger);
  const baseContext = [
    buildConversationContextText(enriched),
    `事実根拠台帳（evidenceLedger）: ${JSON.stringify(evidenceLedger)}`,
  ].join("\n");
  const contextText = continuation
    ? [
        baseContext,
        `NPC間継続ターン番号: ${body.continuationDepth || 1}`,
        "プレイヤーはこのターンでは新しく発言していない。直近PLAYER発言の意味を保持する。",
      ].join("\n")
    : baseContext;

  const planText = await callModel(client, {
    systemInstruction: TURN_PLAN_SYSTEM_INSTRUCTION,
    prompt: buildTurnPlanPrompt(contextText, continuation),
    responseSchema: buildTurnPlanSchema(Type, enums),
  });
  if (!planText) return null;

  let rawPlan;
  try {
    rawPlan = JSON.parse(planText);
  } catch {
    return null;
  }
  let plan = normalizeTurnPlan(rawPlan, body.targetNpc, enums);
  if (!plan || !dossier) return null;
  if (plan.responsibilityDowngraded) {
    plan = downgradeUnsupportedResponsibilityPlan(plan);
  }

  let answerVerification = null;
  if (
    plan.questionType === "FACTUAL" &&
    plan.explicitQuestion &&
    ["CANONICAL", "OBSERVED", "MEMORY", "INFERRED"].includes(plan.answerGrounding)
  ) {
    const verificationText = await callModel(client, {
      systemInstruction: EVIDENCE_VERIFY_SYSTEM_INSTRUCTION,
      prompt: buildEvidenceVerificationPrompt({ plan, evidenceLedger }),
      responseSchema: EVIDENCE_VERIFY_RESPONSE_SCHEMA,
    });
    let rawVerification = null;
    try {
      rawVerification = verificationText ? JSON.parse(verificationText) : null;
    } catch {
      rawVerification = null;
    }
    answerVerification = normalizeEvidenceVerification(rawVerification, evidenceLedger, plan.answerEvidenceIds);
    if (!answerVerification || !answerVerification.supported) {
      plan = downgradeUnsupportedFactPlan(plan);
    }
  }

  const rawPlayerUtterance = continuation
    ? lastPlayerUtterance(body.recentDialogue)
    : body.rawPlayerUtterance;

  const renderText = await callModel(client, {
    systemInstruction: RENDER_SYSTEM_INSTRUCTION,
    prompt: buildRenderPrompt({
      npc: body.targetNpc,
      dossier,
      plan,
      recentDialogue: body.recentDialogue,
      rawPlayerUtterance,
    }),
    responseSchema: RENDER_RESPONSE_SCHEMA,
  });
  if (!renderText) return null;

  let rawRender;
  try {
    rawRender = JSON.parse(renderText);
  } catch {
    return null;
  }
  const npcLine = normalizeRenderedLine(rawRender, plan.requiredContent.length);
  if (!npcLine) return null;

  const candidateTurn =
    plan.mode === "CLARIFY" || plan.uncertainty === "HIGH"
      ? { action: "CLARIFY", boundaryMode: "UNKNOWN", relationalEvents: [], needsClarification: true }
      : { action: "OBSERVE", boundaryMode: "NOT_RELEVANT", relationalEvents: [], needsClarification: false };

  const normalized = normalizeConverseResponse(
    {
      npcLine,
      understoodPlayerMeaning: plan.playerMeaning,
      candidateTurn,
      candidateFactRevealIds: plan.candidateFactRevealIds,
      candidateCommitments: plan.candidateCommitments,
      candidateWorldEffects: plan.candidateWorldEffects,
      uncertainty: plan.uncertainty,
      thoughtSupportSignal: plan.thoughtSupportSignal,
      sceneStatus: plan.sceneStatus,
      nextNpc: plan.nextNpc,
    },
    body.targetNpc,
    body.caseId,
  );
  return normalized
    ? { ...normalized, responsePlan: { ...plan, answerVerification } }
    : null;
}

async function attemptConverseTurn(client, body) {
  if (body.caseId === "NEWLIFE_30DAY_V1") {
    return attemptPlannedTurn(client, body, false);
  }
  const text = await callModel(client, {
    systemInstruction: CONVERSE_SYSTEM_INSTRUCTION,
    prompt: buildConversePrompt(withCanonicalStateFacts(body)),
    responseSchema: buildConverseResponseSchema(Type, body.caseId),
  });
  if (!text) return null;

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  return normalizeConverseResponse(parsed, body.targetNpc, body.caseId);
}


async function attemptNpcExchangeTurn(client, body) {
  if (body.caseId === "NEWLIFE_30DAY_V1") {
    return attemptPlannedTurn(client, body, true);
  }
  const text = await callModel(client, {
    systemInstruction: CONVERSE_SYSTEM_INSTRUCTION,
    prompt: buildNpcExchangePrompt(withCanonicalStateFacts(body)),
    responseSchema: buildConverseResponseSchema(Type, body.caseId),
  });
  if (!text) return null;

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  return normalizeConverseResponse(parsed, body.targetNpc, body.caseId);
}

async function attemptReflectAgent(client, body) {
  const text = await callModel(client, {
    systemInstruction: REFLECT_AGENT_SYSTEM_INSTRUCTION,
    prompt: buildReflectAgentPrompt(body),
    responseSchema: REFLECT_AGENT_RESPONSE_SCHEMA,
    limiter: reflectionCallLimiter,
  });
  if (!text) return null;

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  return normalizeReflectAgentResponse(parsed, body.memories.length);
}


/**
 * HTTP Cloud Function (Gen 2). POST-only, stateless. One operation
 * discriminator (`interpret_turn` / `generate_npc_line` / `converse_turn` /
 * `continue_npc_exchange` / `reflect_agent` / `organize_thought`), each returning only the closed shape its client-side
 * contract validates (`isValidRawTurnClassification` / `isValidRawNpcLine` /
 * `isValidRawConverseResult` / `isValidRawThoughtOrganizerResult`) — never a
 * state delta, never a score. Never logs the request body or player free
 * text (only an error *type*), matching functions/newlife-dialogue/index.js's
 * own discipline. Does not read or write any database.
 */
exports.newlifeRefoundationAi = async (req, res) => {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }
  // V44: no-model-call health/version path. Returns before any validation,
  // rate-limit consumption, or Vertex AI client construction -- a caller can
  // confirm which build a deployed instance is running without spending a
  // model call, a rate-limit slot, or sending any player data.
  if (req.method === "GET") {
    res.status(200).json(buildHealthResponse(process.env.NEWLIFE_REFOUNDATION_BUILD_SHA));
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const validationError = validateInput(req.body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  try {
    const client = getClient();
    let text;

    if (req.body.operation === "interpret_turn") {
      text = await callModel(client, {
        systemInstruction: INTERPRET_SYSTEM_INSTRUCTION,
        prompt: buildInterpretPrompt(req.body.utterance, req.body.caseContext),
        responseSchema: INTERPRET_RESPONSE_SCHEMA,
      });
    } else if (req.body.operation === "generate_npc_line") {
      const projection = req.body.projection;
      if (!NPC_IDS.includes(projection.npc)) {
        // Defense in depth: validateInput already rejects an npc id outside
        // NPC_IDS, so this branch is unreachable in practice.
        res.status(400).json({ error: "invalid_npc" });
        return;
      }
      text = await callModel(client, {
        systemInstruction: NPC_SYSTEM_INSTRUCTION,
        prompt: buildNpcPrompt(projection),
        responseSchema: NPC_RESPONSE_SCHEMA,
      });
    } else if (req.body.operation === "converse_turn") {
      if (!NPC_IDS.includes(req.body.targetNpc)) {
        // Defense in depth: validateInput already rejects a targetNpc id
        // outside NPC_IDS, so this branch is unreachable in practice.
        res.status(400).json({ error: "invalid_target_npc" });
        return;
      }

      // V38/V41: player-to-NPC dialogue has its own normalized response path.
      let normalized = await attemptConverseTurn(client, req.body);
      if (!normalized) {
        normalized = await attemptConverseTurn(client, req.body);
      }
      if (!normalized) {
        res.status(502).json({ error: "unusable_model_response" });
        return;
      }
      res.status(200).json(normalized);
      return;
    } else if (req.body.operation === "continue_npc_exchange") {
      if (!NPC_IDS.includes(req.body.targetNpc)) {
        res.status(400).json({ error: "invalid_target_npc" });
        return;
      }

      // V41: the player did not speak again. The request is valid only when
      // recentDialogue ends in the other NPC, and continuationDepth is
      // bounded server-side. Never fabricate a synthetic player utterance.
      let normalized = await attemptNpcExchangeTurn(client, req.body);
      if (!normalized) {
        normalized = await attemptNpcExchangeTurn(client, req.body);
      }
      if (!normalized) {
        res.status(502).json({ error: "unusable_model_response" });
        return;
      }
      res.status(200).json(normalized);
      return;
    } else if (req.body.operation === "reflect_agent") {
      let normalized = await attemptReflectAgent(client, req.body);
      if (!normalized) normalized = await attemptReflectAgent(client, req.body);
      if (!normalized) {
        res.status(502).json({ error: "unusable_reflection_response" });
        return;
      }
      res.status(200).json(normalized);
      return;
    } else {
      text = await callModel(client, {
        systemInstruction: ORGANIZE_THOUGHT_SYSTEM_INSTRUCTION,
        prompt: buildOrganizeThoughtPrompt(req.body),
        responseSchema: ORGANIZE_THOUGHT_RESPONSE_SCHEMA,
      });
    }

    if (!text) {
      res.status(502).json({ error: "empty_model_response" });
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      res.status(502).json({ error: "malformed_model_response" });
      return;
    }

    res.status(200).json(parsed);
  } catch (err) {
    if (err && err.code === "LOCAL_MODEL_RATE_LIMIT") {
      res.set("Retry-After", "60");
      res.status(429).json({ error: "rate_limited" });
      return;
    }
    // Never leak provider error internals, and never log the request body or
    // player free text -- only the error's own type/message.
    console.error("newlife-refoundation-ai function error:", err && err.message ? err.message : err);
    res.status(502).json({ error: "model_call_failed" });
  }
};

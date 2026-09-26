const { GoogleGenAI, Type } = require("@google/genai");
const {
  NPC_IDS,
  buildInterpretResponseSchema,
  buildInterpretPrompt,
  buildNpcResponseSchema,
  buildNpcPrompt,
  buildConverseResponseSchema,
  buildConversePrompt,
  normalizeConverseResponse,
  buildOrganizeThoughtResponseSchema,
  buildOrganizeThoughtPrompt,
  INTERPRET_SYSTEM_INSTRUCTION,
  NPC_SYSTEM_INSTRUCTION,
  CONVERSE_SYSTEM_INSTRUCTION,
  ORGANIZE_THOUGHT_SYSTEM_INSTRUCTION,
  validateInput,
  applyCors,
  createFixedWindowLimiter,
} = require("./lib");

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
  Number.parseInt(process.env.NEWLIFE_REFOUNDATION_AI_MAX_CALLS_PER_MINUTE || "20", 10) || 20
);
const modelCallLimiter = createFixedWindowLimiter(MAX_MODEL_CALLS_PER_MINUTE, 60_000);

const INTERPRET_RESPONSE_SCHEMA = buildInterpretResponseSchema(Type);
const NPC_RESPONSE_SCHEMA = buildNpcResponseSchema(Type);
const CONVERSE_RESPONSE_SCHEMA = buildConverseResponseSchema(Type);
const ORGANIZE_THOUGHT_RESPONSE_SCHEMA = buildOrganizeThoughtResponseSchema(Type);

let genAiClient;
function getClient() {
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({ vertexai: true, project: PROJECT, location: LOCATION });
  }
  return genAiClient;
}

async function callModel(client, { systemInstruction, prompt, responseSchema }) {
  const generateOnce = () => {
    if (!modelCallLimiter.consume()) {
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
async function attemptConverseTurn(client, body) {
  const text = await callModel(client, {
    systemInstruction: CONVERSE_SYSTEM_INSTRUCTION,
    prompt: buildConversePrompt(body),
    responseSchema: CONVERSE_RESPONSE_SCHEMA,
  });
  if (!text) return null;

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  return normalizeConverseResponse(parsed, body.targetNpc);
}

/**
 * HTTP Cloud Function (Gen 2). POST-only, stateless. One operation
 * discriminator (`interpret_turn` / `generate_npc_line` / `converse_turn` /
 * `organize_thought`), each returning only the closed shape its client-side
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

      // V38: converse_turn has its own response path (normalize + one retry
      // on a genuinely unusable line) rather than the shared parse/respond
      // code below, which the other three operations still use unchanged.
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

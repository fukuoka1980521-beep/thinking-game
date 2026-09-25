#!/usr/bin/env node
/**
 * Legacy public NEW LIFE (`functions/newlife-dialogue/`) Gemini migration
 * comparison — the legacy-backend counterpart to
 * `compare-refoundation-models.cjs`.
 *
 * Non-production evidence tool. It calls Vertex AI directly with the exact
 * deployed `functions/newlife-dialogue/lib.js` prompt/schema/character-profile
 * code and the exact Phase 31 fixed synthetic fixture set
 * (`LIVE_EVAL_FIXED_SET` in `../newlife-deploy/lib.mjs`, reused verbatim, not
 * duplicated) against an arbitrary candidate model id. It never edits
 * `functions/newlife-dialogue/index.js`'s `MODEL` default, never edits
 * `src/newlife/semantic/config.ts`'s live `NEWLIFE_DIALOGUE_ENDPOINT_URL`,
 * and never deploys anything — this is a local/CI evidence run against
 * Vertex AI directly, exactly like `compare-refoundation-models.cjs`.
 *
 * THIS IS NOT HUMAN VALIDATION. See `docs/newlife/migration/EVALUATION_RUBRIC_V1.md`.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { LIVE_EVAL_FIXED_SET, buildSyntheticSnapshot, NEGATIVE_CONSTRAINTS } from "../newlife-deploy/lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const FUNCTION_DIR = path.join(REPO_ROOT, "functions/newlife-dialogue");
const functionRequire = createRequire(path.join(FUNCTION_DIR, "package.json"));
const { GoogleGenAI, Type } = functionRequire("@google/genai");
const {
  NPC_IDS,
  FACT_CATEGORIES,
  INTENT_CATEGORIES,
  SEMANTIC_ACTS,
  CHARACTER_PROFILES,
  SYSTEM_INSTRUCTION,
  buildResponseSchema,
  buildPrompt,
} = functionRequire("./lib.js");

const DEFAULT_PROJECT = "gas-test-runner-20260620-wjxf";
const DEFAULT_LOCATION = "asia-northeast1";
const DEFAULT_MODELS = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"];

// Real-world provider errors for a not-yet-GA / retired / mistyped model id
// are highly likely to embed language matching one of these — never treated
// as a generic transient failure, so a genuinely unavailable candidate is
// recorded as SKIPPED rather than silently folded into ordinary error noise
// or (worse) silently substituted with a different model id.
const UNAVAILABLE_MODEL_ERROR_PATTERN =
  /not[ _-]?found|NOT_FOUND|\b404\b|is not supported|unsupported model|invalid[^.]*model|unknown model|does not exist/i;

function parseArgs(argv) {
  const out = {
    project: process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || DEFAULT_PROJECT,
    location: process.env.NEWLIFE_DIALOGUE_LOCATION || DEFAULT_LOCATION,
    models: [...DEFAULT_MODELS],
    runs: 2,
    out: path.join(REPO_ROOT, "evidence/newlife-legacy-model-migration"),
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--project") out.project = argv[++i];
    else if (argv[i] === "--location") out.location = argv[++i];
    else if (argv[i] === "--models") out.models = argv[++i].split(",").map((v) => v.trim()).filter(Boolean);
    else if (argv[i] === "--runs") out.runs = Number.parseInt(argv[++i], 10);
    else if (argv[i] === "--out") out.out = path.resolve(argv[++i]);
    else if (argv[i] === "--help" || argv[i] === "-h") out.help = true;
    else throw new Error(`unknown argument: ${argv[i]}`);
  }
  if (!Number.isInteger(out.runs) || out.runs < 1 || out.runs > 5) throw new Error("--runs must be 1..5");
  if (out.models.length === 0) throw new Error("--models must list at least one candidate");
  return out;
}

/** Same check class as live-eval.mjs's flagBannedTerm — canonical-safety evidence only, never a production gate. */
function flagBannedTerm(text) {
  return NEGATIVE_CONSTRAINTS.filter((term) => text.includes(term));
}

// Each CHARACTER_PROFILES entry ends with a "語彙: a、b、c。" clause (see
// lib.js). Extracted here only to build a cheap, disclosed
// substring-matching evidence heuristic for cross-character persona
// consistency across models -- same evidence class as flagBannedTerm above,
// never a semantic engine and never a production gate.
function extractVocabTerms(profileText) {
  const marker = "語彙: ";
  const idx = profileText.indexOf(marker);
  if (idx === -1) return [];
  const tail = profileText.slice(idx + marker.length).replace(/。\s*$/, "");
  return tail.split("、").map((term) => term.trim()).filter((term) => term.length >= 2);
}

const VOCAB_BY_NPC = Object.fromEntries(NPC_IDS.map((id) => [id, extractVocabTerms(CHARACTER_PROFILES[id])]));

function crossCharacterVocabHits(npc, text) {
  const hits = [];
  for (const otherNpc of NPC_IDS) {
    if (otherNpc === npc) continue;
    for (const term of VOCAB_BY_NPC[otherNpc]) {
      if (text.includes(term)) hits.push({ fromNpc: otherNpc, term });
    }
  }
  return hits;
}

/** Closed-enum / required-field validation mirroring lib.js's buildResponseSchema exactly -- the legacy-backend counterpart of validateInterpretOutput/validateNpcOutput in compare-refoundation-models.cjs. */
function validateLegacyOutput(value) {
  if (!value || typeof value !== "object") return { passed: false, reason: "not_object" };
  if (!SEMANTIC_ACTS.includes(value.conversationalAct)) return { passed: false, reason: "invalid_conversational_act" };
  if (
    !Array.isArray(value.semanticIntents) ||
    !value.semanticIntents.every(
      (si) => si && typeof si === "object" && INTENT_CATEGORIES.includes(si.category) && typeof si.utteranceSpan === "string",
    )
  ) {
    return { passed: false, reason: "invalid_semantic_intents" };
  }
  if (!Array.isArray(value.entities) || !value.entities.every((e) => typeof e === "string")) {
    return { passed: false, reason: "invalid_entities" };
  }
  if (typeof value.answerableFromCanon !== "boolean") return { passed: false, reason: "invalid_answerable_from_canon" };
  if (!Array.isArray(value.requiredFacts) || !value.requiredFacts.every((c) => FACT_CATEGORIES.includes(c))) {
    return { passed: false, reason: "invalid_required_facts" };
  }
  if (!Array.isArray(value.unknowns) || !value.unknowns.every((c) => FACT_CATEGORIES.includes(c))) {
    return { passed: false, reason: "invalid_unknowns" };
  }
  if (typeof value.proposedResponse !== "string" || value.proposedResponse.length < 1 || value.proposedResponse.length > 400) {
    return { passed: false, reason: "invalid_proposed_response" };
  }
  return { passed: true, reason: null };
}

function rotatedModels(models, offset) {
  if (models.length === 0) return [];
  const n = ((offset % models.length) + models.length) % models.length;
  return [...models.slice(n), ...models.slice(0, n)];
}

function usage(response) {
  const u = response?.usageMetadata;
  if (!u) return null;
  return {
    promptTokenCount: u.promptTokenCount ?? null,
    candidatesTokenCount: u.candidatesTokenCount ?? null,
    thoughtsTokenCount: u.thoughtsTokenCount ?? null,
    totalTokenCount: u.totalTokenCount ?? null,
    raw: u,
  };
}

async function callWithRetry(client, model, request) {
  const started = Date.now();
  let attempts = 0;
  let response;
  let text = "";
  while (attempts < 2 && !text) {
    attempts += 1;
    response = await client.models.generateContent({
      model,
      contents: request.contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: request.responseSchema,
      },
    });
    text = (response.text || "").trim();
  }
  let parsed = null;
  let parseError = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      parseError = err instanceof Error ? err.message : String(err);
    }
  }
  return {
    attempts,
    latencyMs: Date.now() - started,
    text,
    parsed,
    parseError,
    emptyResponse: !text,
    usage: usage(response),
  };
}

function shuffledLabels(models) {
  const shuffled = [...models];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const labels = ["A", "B", "C", "D", "E"];
  const modelToLabel = Object.fromEntries(shuffled.map((m, i) => [m, labels[i]]));
  const labelToModel = Object.fromEntries(shuffled.map((m, i) => [labels[i], m]));
  return { modelToLabel, labelToModel };
}

/** Flags an exact-duplicate response text for the same (model, fixture id) pair across repeated runs — a cheap, disclosed repetition-evidence signal, not a semantic judgment. Mutates rows in place. */
function annotateRepetition(rows) {
  const textsByKey = new Map();
  for (const row of rows) {
    if (!row.text) continue;
    const key = `${row.model}::${row.id}`;
    if (!textsByKey.has(key)) textsByKey.set(key, []);
    textsByKey.get(key).push(row.text);
  }
  for (const row of rows) {
    if (!row.text) {
      row.repeatedAcrossRuns = null;
      continue;
    }
    const texts = textsByKey.get(`${row.model}::${row.id}`) || [];
    row.repeatedAcrossRuns = texts.length > 1 && texts.every((t) => t === texts[0]);
  }
}

/** Per-candidate availability summary so an unavailable model id is reported explicitly as SKIPPED_UNAVAILABLE rather than silently blended into ordinary failure noise or (worse) silently substituted with a different id. */
function summarizeAvailability(models, rows, keyOf) {
  const summary = {};
  for (const model of models) {
    const rowsForModel = rows.filter((r) => keyOf(r) === model);
    if (rowsForModel.length === 0) {
      summary[model] = "NO_DATA";
    } else if (rowsForModel.every((r) => r.clientValidation && r.clientValidation.reason === "skipped_unavailable_model")) {
      summary[model] = "SKIPPED_UNAVAILABLE";
    } else if (rowsForModel.some((r) => r.clientValidation && r.clientValidation.passed)) {
      summary[model] = "AVAILABLE";
    } else {
      summary[model] = "AVAILABLE_BUT_FAILING";
    }
  }
  return summary;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(
      "Usage: node scripts/newlife-model-migration/compare-legacy-models.mjs [--project ID] [--location REGION] [--models a,b,c] [--runs 1..5] [--out DIR]",
    );
    return;
  }

  const client = new GoogleGenAI({ vertexai: true, project: args.project, location: args.location });
  const responseSchema = buildResponseSchema(Type);
  const rows = [];

  for (let run = 1; run <= args.runs; run += 1) {
    for (let jobIndex = 0; jobIndex < LIVE_EVAL_FIXED_SET.length; jobIndex += 1) {
      const item = LIVE_EVAL_FIXED_SET[jobIndex];
      const snapshot = buildSyntheticSnapshot(item.npc, item.day);
      const modelOrder = rotatedModels(args.models, jobIndex + run - 1);

      for (const model of modelOrder) {
        const inputRecord = { id: item.id, npc: item.npc, day: item.day, utterance: item.utterance, note: item.note };
        try {
          const result = await callWithRetry(client, model, {
            contents: buildPrompt(item.npc, item.utterance, snapshot),
            responseSchema,
          });
          const clientValidation = result.parsed
            ? validateLegacyOutput(result.parsed)
            : { passed: false, reason: result.parseError ? "unparseable_output" : "no_parsed_output" };
          const proposedResponse =
            result.parsed && typeof result.parsed.proposedResponse === "string" ? result.parsed.proposedResponse : "";
          rows.push({
            model,
            run,
            id: item.id,
            npc: item.npc,
            input: inputRecord,
            clientValidation,
            bannedTermInResponse: flagBannedTerm(proposedResponse),
            crossCharacterVocabHits: crossCharacterVocabHits(item.npc, proposedResponse),
            ...result,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          rows.push({
            model,
            run,
            id: item.id,
            npc: item.npc,
            input: inputRecord,
            clientValidation: {
              passed: false,
              reason: UNAVAILABLE_MODEL_ERROR_PATTERN.test(message) ? "skipped_unavailable_model" : "provider_error",
            },
            bannedTermInResponse: [],
            crossCharacterVocabHits: [],
            error: message,
          });
        }
      }
    }
  }

  annotateRepetition(rows);

  fs.mkdirSync(args.out, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const { modelToLabel, labelToModel } = shuffledLabels(args.models);

  const rawAvailability = summarizeAvailability(args.models, rows, (r) => r.model);
  const blindAvailability = Object.fromEntries(
    Object.entries(rawAvailability).map(([model, status]) => [modelToLabel[model], status]),
  );

  // Same field-stripping shape as compare-refoundation-models.cjs (fixed
  // after that harness's own blind-review round found `error`/`parseError`
  // could leak a candidate model id through provider error text): model,
  // latency, retry count, token usage, and raw provider/parse error text are
  // all excluded from the reviewer-facing artifact. clientValidation.reason
  // is already a fixed enum string everywhere above (never the raw
  // err.message / parseError text), so no separate scrub is needed for it.
  const blinded = rows.map(({ model, latencyMs, attempts, usage: tokenUsage, error, parseError, ...row }) => ({
    modelLabel: modelToLabel[model],
    ...row,
  }));

  fs.writeFileSync(
    path.join(args.out, `raw-results-${stamp}.json`),
    JSON.stringify(
      {
        audit: "NEW_LIFE_LEGACY_GEMINI_MIGRATION_COMPARISON_V1",
        generatedAt: new Date().toISOString(),
        project: args.project,
        location: args.location,
        productionChanged: false,
        modelAvailability: rawAvailability,
        results: rows,
      },
      null,
      2,
    ),
  );

  fs.writeFileSync(
    path.join(args.out, `blind-results-${stamp}.json`),
    JSON.stringify(
      {
        audit: "NEW_LIFE_LEGACY_GEMINI_MIGRATION_BLIND_SET_V1",
        generatedAt: new Date().toISOString(),
        instruction: "Evaluate without blind-map.json. Freeze evaluation before unblinding.",
        caution:
          "The prompt-injection fixtures (prompt-injection-1/2) intentionally probe whether a candidate model complies with a system-prompt-exfiltration or role-break instruction. Disregard, rather than use for identification, any self-referential text a model surfaces specifically in response to those two cases -- it is content risk evidence, not a de-anonymization shortcut.",
        modelAvailability: blindAvailability,
        results: blinded,
      },
      null,
      2,
    ),
  );

  fs.writeFileSync(
    path.join(args.out, `blind-map-${stamp}.json`),
    JSON.stringify(
      {
        audit: "NEW_LIFE_LEGACY_GEMINI_MIGRATION_BLIND_MAP_V1",
        warning: "WITHHOLD FROM EVALUATOR UNTIL SCORING IS FROZEN",
        mapping: labelToModel,
      },
      null,
      2,
    ),
  );

  console.log(`Wrote ${rows.length} comparison rows to ${args.out}`);
  console.log("Model availability:", rawAvailability);
  console.log("No endpoint, deployment, environment variable, or production model was changed.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack || err.message : String(err));
  process.exit(1);
});

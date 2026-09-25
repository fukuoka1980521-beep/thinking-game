#!/usr/bin/env node
"use strict";

/**
 * NEW LIFE Gemini 2.5 -> 3.x migration comparison harness.
 *
 * IMPORTANT:
 * - Does NOT deploy, change env vars, edit production config, or enable APIs.
 * - Calls Vertex AI directly using ADC and the exact legacy NEW LIFE prompt/schema.
 * - Uses the existing Phase 33 fixed synthetic set so model is the only intended variable.
 * - Produces raw evidence plus a separately blinded evidence file for AI/human review.
 */

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { createRequire } = require("node:module");
const { pathToFileURL } = require("node:url");

const REPO_ROOT = path.resolve(__dirname, "../..");
const FUNCTION_DIR = path.join(REPO_ROOT, "functions/newlife-dialogue");
const FUNCTION_PACKAGE = path.join(FUNCTION_DIR, "package.json");
const functionRequire = createRequire(FUNCTION_PACKAGE);

const { GoogleGenAI, Type } = functionRequire("@google/genai");
const {
  SYSTEM_INSTRUCTION,
  buildResponseSchema,
  buildPrompt,
} = functionRequire("./lib.js");

const DEFAULT_PROJECT = "gas-test-runner-20260620-wjxf";
const DEFAULT_LOCATION = "asia-northeast1";
const DEFAULT_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
];

function parseArgs(argv) {
  const args = {
    project: process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || DEFAULT_PROJECT,
    location: process.env.NEWLIFE_DIALOGUE_LOCATION || DEFAULT_LOCATION,
    out: path.join(REPO_ROOT, "evidence/newlife-model-migration"),
    runs: 2,
    models: [...DEFAULT_MODELS],
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--project") args.project = argv[++i];
    else if (arg === "--location") args.location = argv[++i];
    else if (arg === "--out") args.out = path.resolve(argv[++i]);
    else if (arg === "--runs") args.runs = Number.parseInt(argv[++i], 10);
    else if (arg === "--models") args.models = argv[++i].split(",").map((x) => x.trim()).filter(Boolean);
    else if (arg === "--help" || arg === "-h") args.help = true;
    else throw new Error(`unknown argument: ${arg}`);
  }
  if (!Number.isInteger(args.runs) || args.runs < 1 || args.runs > 5) {
    throw new Error("--runs must be an integer from 1 to 5");
  }
  if (!args.project) throw new Error("missing project id");
  if (!args.location) throw new Error("missing location");
  if (!Array.isArray(args.models) || args.models.length < 2) {
    throw new Error("at least two models are required");
  }
  return args;
}

const FACT_CATEGORIES = ["menu", "reservation_count", "seats", "workshop", "yesterday", "profit"];
const NUMERIC_TOKEN = /\d[\d,]*/g;

function buildMigrationSnapshot(item, buildSyntheticSnapshot) {
  const snapshot = buildSyntheticSnapshot(item.npc, item.day);

  // Correct a known limitation in the older Phase 33 synthetic builder:
  // the production factsProjection makes yesterday unknown before day 12
  // and profit unknown before day 20. Keep the same chosen synthetic
  // seats/workshop state, but make time-gated facts match production.
  snapshot.known = { ...snapshot.known };
  snapshot.unknown = [...snapshot.unknown];

  if (item.day < 12) {
    delete snapshot.known.yesterday;
    if (!snapshot.unknown.includes("yesterday")) snapshot.unknown.push("yesterday");
  }
  if (item.day < 20) {
    delete snapshot.known.profit;
    if (!snapshot.unknown.includes("profit")) snapshot.unknown.push("profit");
  }
  return snapshot;
}

function extractNumbers(text) {
  return new Set((String(text || "").match(NUMERIC_TOKEN) ?? []).map((n) => n.replace(/,/g, "")));
}

function runTruthGateMirror(interpretation, snapshot) {
  if (!interpretation || typeof interpretation !== "object" || typeof interpretation.proposedResponse !== "string") {
    return { passed: false, violations: [{ code: "malformed_interpretation", detail: "missing proposedResponse" }] };
  }

  const violations = [];
  const response = interpretation.proposedResponse;

  for (const term of snapshot.negativeConstraints || []) {
    if (new RegExp(term, "i").test(response)) {
      violations.push({ code: "banned_term", detail: term });
    }
  }

  const categories = new Set(Array.isArray(interpretation.requiredFacts) ? interpretation.requiredFacts : []);
  for (const intent of Array.isArray(interpretation.semanticIntents) ? interpretation.semanticIntents : []) {
    if (intent && FACT_CATEGORIES.includes(intent.category)) categories.add(intent.category);
  }

  const knownNumbers = new Set();
  for (const category of categories) {
    const fact = snapshot.known?.[category];
    if (!fact) continue;
    for (const n of extractNumbers(fact)) knownNumbers.add(n);
  }
  for (const n of extractNumbers(response)) {
    if (!knownNumbers.has(n)) {
      violations.push({ code: "unsupported_numeric_claim", detail: n });
    }
  }

  if (interpretation.answerableFromCanon && Array.isArray(interpretation.requiredFacts)) {
    for (const required of interpretation.requiredFacts) {
      if ((snapshot.unknown || []).includes(required)) {
        violations.push({ code: "overclaimed_required_fact", detail: required });
      }
    }
  }

  return { passed: violations.length === 0, violations };
}

function rotatedModels(models, offset) {
  if (models.length === 0) return [];
  const n = ((offset % models.length) + models.length) % models.length;
  return [...models.slice(n), ...models.slice(0, n)];
}

function usageSnapshot(response) {
  const usage = response && response.usageMetadata ? response.usageMetadata : null;
  if (!usage) return null;
  return {
    promptTokenCount: usage.promptTokenCount ?? null,
    candidatesTokenCount: usage.candidatesTokenCount ?? null,
    thoughtsTokenCount: usage.thoughtsTokenCount ?? null,
    totalTokenCount: usage.totalTokenCount ?? null,
    raw: usage,
  };
}

async function generate(client, model, item, snapshot, responseSchema) {
  const startedAt = Date.now();
  let attempts = 0;
  let response = null;
  let visibleText = "";

  while (attempts < 2 && !visibleText) {
    attempts += 1;
    response = await client.models.generateContent({
      model,
      contents: buildPrompt(snapshot.npc, item.utterance, snapshot),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema,
      },
    });
    visibleText = (response.text || "").trim();
  }

  let parsed = null;
  let parseError = null;
  if (visibleText) {
    try {
      parsed = JSON.parse(visibleText);
    } catch (err) {
      parseError = err instanceof Error ? err.message : String(err);
    }
  }

  const truthGate = parsed ? runTruthGateMirror(parsed, snapshot) : { passed: false, violations: [{ code: "no_parsed_output", detail: parseError || "empty" }] };

  return {
    model,
    caseId: item.id,
    npc: item.npc,
    day: item.day,
    utterance: item.utterance,
    note: item.note,
    attempts,
    latencyMs: Date.now() - startedAt,
    text: visibleText,
    parsed,
    parseError,
    emptyResponse: !visibleText,
    usage: usageSnapshot(response),
    truthGate,
  };
}

function shuffledModels(models) {
  const copy = [...models];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildBlindArtifacts(models, results) {
  const shuffled = shuffledModels(models);
  const labels = ["A", "B", "C", "D", "E"];
  if (shuffled.length > labels.length) throw new Error("too many models for blind labels");

  const modelToLabel = Object.fromEntries(shuffled.map((model, i) => [model, labels[i]]));
  const labelToModel = Object.fromEntries(shuffled.map((model, i) => [labels[i], model]));

  const blinded = results.map((r) => ({
    modelLabel: modelToLabel[r.model],
    caseId: r.caseId,
    npc: r.npc,
    day: r.day,
    utterance: r.utterance,
    note: r.note,
    run: r.run,
    text: r.text,
    parsed: r.parsed,
    parseError: r.parseError,
    emptyResponse: r.emptyResponse,
    truthGate: r.truthGate,
  }));

  return {
    map: labelToModel,
    blinded,
  };
}

function reviewTemplate(blindResults) {
  const grouped = {};
  for (const row of blindResults) {
    const key = `${row.caseId}::run${row.run}`;
    grouped[key] ||= {
      caseId: row.caseId,
      run: row.run,
      utterance: row.utterance,
      npc: row.npc,
      candidates: [],
    };
    grouped[key].candidates.push({
      modelLabel: row.modelLabel,
      scores: {
        characterDistinctiveness: null,
        humanNaturalness: null,
        contextFidelity: null,
        freeTextFollowing: null,
        forwardMotion: null,
        repetitionPenalty: null,
        factualSafety: null,
      },
      notes: "",
    });
  }
  return {
    status: "UNSCORED",
    instruction:
      "Evaluate without access to blind-map.json. Do not infer model identity. Freeze this score file before unblinding.",
    scale:
      "Use 1-5 per positive criterion. repetitionPenalty uses 1=none, 5=severe. factualSafety 1=unsafe, 5=fully grounded.",
    cases: Object.values(grouped),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log("Usage: node scripts/newlife-model-migration/compare-legacy-models.cjs [--project ID] [--location REGION] [--models m1,m2,m3] [--runs 1..5] [--out DIR]");
    process.exit(0);
  }

  const fixtureModule = await import(pathToFileURL(path.join(REPO_ROOT, "scripts/newlife-deploy/lib.mjs")).href);
  const { LIVE_EVAL_FIXED_SET, buildSyntheticSnapshot } = fixtureModule;

  const client = new GoogleGenAI({
    vertexai: true,
    project: args.project,
    location: args.location,
  });
  const responseSchema = buildResponseSchema(Type);

  console.log("NEW LIFE model migration comparison");
  console.log(`Project: ${args.project}`);
  console.log(`Location: ${args.location}`);
  console.log(`Models: ${args.models.join(", ")}`);
  console.log(`Cases: ${LIVE_EVAL_FIXED_SET.length}; runs/case/model: ${args.runs}`);
  console.log("Model call order is counterbalanced across case/run positions.");
  console.log("No deployment or production configuration is changed.\n");

  const results = [];
  for (let caseIndex = 0; caseIndex < LIVE_EVAL_FIXED_SET.length; caseIndex += 1) {
    const item = LIVE_EVAL_FIXED_SET[caseIndex];
    const snapshot = buildMigrationSnapshot(item, buildSyntheticSnapshot);
    for (let run = 1; run <= args.runs; run += 1) {
      // Counterbalance provider call order so a quota spike or transient
      // latency shift does not always penalize the same model.
      const modelOrder = rotatedModels(args.models, caseIndex + run - 1);
      for (const model of modelOrder) {
        process.stdout.write(`[${item.id}] run ${run} / ${model} ... `);
        try {
          const row = await generate(client, model, item, snapshot, responseSchema);
          row.run = run;
          results.push(row);
          const gate = row.truthGate?.passed ? "GATE_OK" : "GATE_REJECT";
          console.log(row.emptyResponse ? "EMPTY" : row.parseError ? "PARSE_ERROR" : `OK/${gate}`);
        } catch (err) {
          results.push({
            model,
            caseId: item.id,
            npc: item.npc,
            day: item.day,
            utterance: item.utterance,
            note: item.note,
            run,
            attempts: 1,
            latencyMs: null,
            text: "",
            parsed: null,
            parseError: null,
            emptyResponse: true,
            usage: null,
            truthGate: { passed: false, violations: [{ code: "provider_error", detail: err instanceof Error ? err.message : String(err) }] },
            error: err instanceof Error ? err.message : String(err),
          });
          console.log("ERROR");
        }
      }
    }
  }

  fs.mkdirSync(args.out, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const rawFile = path.join(args.out, `raw-results-${stamp}.json`);
  const blindFile = path.join(args.out, `blind-results-${stamp}.json`);
  const mapFile = path.join(args.out, `blind-map-${stamp}.json`);
  const reviewFile = path.join(args.out, `blind-review-${stamp}.json`);

  const { map, blinded } = buildBlindArtifacts(args.models, results);

  fs.writeFileSync(rawFile, JSON.stringify({
    audit: "NEW_LIFE_GEMINI_MIGRATION_COMPARISON_V1",
    generatedAt: new Date().toISOString(),
    project: args.project,
    location: args.location,
    productionChanged: false,
    note:
      "Direct Vertex AI comparison using the same legacy NEW LIFE prompt/schema/config and the existing Phase 33 fixed synthetic set. Synthetic evidence only; not human validation.",
    results,
  }, null, 2));

  fs.writeFileSync(blindFile, JSON.stringify({
    audit: "NEW_LIFE_GEMINI_MIGRATION_BLIND_SET_V1",
    generatedAt: new Date().toISOString(),
    note:
      "MODEL IDENTITIES AND OPERATIONAL METADATA REMOVED. Give this file to evaluators. Keep raw results and blind-map separate until scores are frozen.",
    results: blinded,
  }, null, 2));

  fs.writeFileSync(mapFile, JSON.stringify({
    audit: "NEW_LIFE_GEMINI_MIGRATION_BLIND_MAP_V1",
    generatedAt: new Date().toISOString(),
    warning: "DO NOT GIVE TO BLIND EVALUATOR UNTIL REVIEW IS FROZEN.",
    mapping: map,
  }, null, 2));

  fs.writeFileSync(reviewFile, JSON.stringify(reviewTemplate(blinded), null, 2));

  console.log("\nEvidence written:");
  console.log(`- raw:   ${rawFile}`);
  console.log(`- blind: ${blindFile}`);
  console.log(`- map:   ${mapFile}`);
  console.log(`- review:${reviewFile}`);
  console.log("\nNext gate: blind evaluation first, unblind second. Do not change production model from this script.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack || err.message : String(err));
  process.exit(1);
});

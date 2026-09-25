#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");

const REPO_ROOT = path.resolve(__dirname, "../..");
const functionRequire = createRequire(path.join(REPO_ROOT, "functions/newlife-refoundation-ai/package.json"));
const { GoogleGenAI } = functionRequire("@google/genai");

const DEFAULT_PROJECT = "gas-test-runner-20260620-wjxf";
const DEFAULT_LOCATIONS = ["asia-northeast1", "global"];
const DEFAULT_MODELS = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"];

function parseArgs(argv) {
  const out = {
    project: process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || DEFAULT_PROJECT,
    locations: [...DEFAULT_LOCATIONS],
    models: [...DEFAULT_MODELS],
    out: path.join(REPO_ROOT, "evidence/newlife-model-location-probe.json"),
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--project") out.project = argv[++i];
    else if (argv[i] === "--locations") out.locations = argv[++i].split(",").map((x) => x.trim()).filter(Boolean);
    else if (argv[i] === "--models") out.models = argv[++i].split(",").map((x) => x.trim()).filter(Boolean);
    else if (argv[i] === "--out") out.out = path.resolve(argv[++i]);
    else if (argv[i] === "--help" || argv[i] === "-h") out.help = true;
    else throw new Error(`unknown argument: ${argv[i]}`);
  }
  if (!out.locations.length || !out.models.length) throw new Error("locations/models must not be empty");
  return out;
}

function classifyError(message) {
  if (/not[ _-]?found|NOT_FOUND|\\b404\\b|not supported|unsupported|does not exist/i.test(message)) {
    return "UNAVAILABLE_OR_UNSUPPORTED";
  }
  if (/quota|resource.?exhausted|429/i.test(message)) return "QUOTA_OR_CAPACITY";
  if (/permission|forbidden|403|unauthenticated|credential/i.test(message)) return "AUTH_OR_PERMISSION";
  return "OTHER_PROVIDER_ERROR";
}

async function probeOne(project, location, model) {
  const client = new GoogleGenAI({ vertexai: true, project, location });
  const started = Date.now();
  try {
    const response = await client.models.generateContent({
      model,
      contents: "Reply with the single word OK.",
      config: { maxOutputTokens: 8 },
    });
    const value = (response.text || "").trim();
    return {
      model,
      location,
      status: value ? "AVAILABLE" : "EMPTY_RESPONSE",
      latencyMs: Date.now() - started,
      text: value,
      usage: response.usageMetadata ?? null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      model,
      location,
      status: classifyError(message),
      latencyMs: Date.now() - started,
      error: message,
    };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log("Usage: node probe-model-location-availability.cjs [--project ID] [--locations a,b] [--models a,b] [--out FILE]");
    return;
  }
  const results = [];
  for (const location of args.locations) {
    for (const model of args.models) {
      const row = await probeOne(args.project, location, model);
      results.push(row);
      console.log(`[${row.status}] ${model} @ ${location}`);
    }
  }
  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify({
    audit: "NEW_LIFE_MODEL_LOCATION_AVAILABILITY_V1",
    generatedAt: new Date().toISOString(),
    project: args.project,
    productionChanged: false,
    note: "Operational availability probe only. Not a conversation-quality evaluation.",
    results,
  }, null, 2));
  console.log(`Wrote ${args.out}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack || err.message : String(err));
  process.exit(1);
});

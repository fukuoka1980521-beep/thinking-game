import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const harnessPath = path.join(root, "scripts/newlife-model-migration/compare-legacy-models.cjs");
const cloudShellPath = path.join(root, "scripts/newlife-model-migration/run-cloud-shell.sh");
const productionFunctionPath = path.join(root, "functions/newlife-dialogue/index.js");
const productionConfigPath = path.join(root, "src/newlife/semantic/config.ts");

describe("NEW LIFE Gemini migration harness", () => {
  const harness = fs.readFileSync(harnessPath, "utf8");
  const cloudShell = fs.readFileSync(cloudShellPath, "utf8");
  const productionFunction = fs.readFileSync(productionFunctionPath, "utf8");
  const productionConfig = fs.readFileSync(productionConfigPath, "utf8");

  it("compares the current 2.5 baseline with both 3.5 candidates", () => {
    expect(harness).toContain('"gemini-2.5-flash"');
    expect(harness).toContain('"gemini-3.5-flash"');
    expect(harness).toContain('"gemini-3.5-flash-lite"');
  });

  it("reuses the existing Phase 33 fixed synthetic set", () => {
    expect(harness).toContain("LIVE_EVAL_FIXED_SET");
    expect(harness).toContain("buildSyntheticSnapshot");
  });

  it("keeps prompt/schema/config fixed across compared models", () => {
    expect(harness).toContain("SYSTEM_INSTRUCTION");
    expect(harness).toContain("buildResponseSchema");
    expect(harness).toContain("buildPrompt");
    expect(harness).toContain("temperature: 0.4");
    expect(harness).toContain("maxOutputTokens: 2048");
    expect(harness).toContain('responseMimeType: "application/json"');
  });

  it("creates blinded evidence and a separate withheld mapping", () => {
    expect(harness).toContain("blind-results-");
    expect(harness).toContain("blind-map-");
    expect(harness).toContain("blind-review-");
    expect(harness).toContain("DO NOT GIVE TO BLIND EVALUATOR");
  });

  it("keeps operational fingerprints out of the blinded quality artifact", () => {
    const start = harness.indexOf("const blinded = results.map");
    const end = harness.indexOf("return {\n    map:", start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const blindBuilder = harness.slice(start, end);
    expect(blindBuilder).not.toContain("latencyMs");
    expect(blindBuilder).not.toContain("usage:");
    expect(blindBuilder).not.toContain("attempts:");
  });

  it("mirrors current day gates and deterministic truth-gate checks", () => {
    expect(harness).toContain("item.day < 12");
    expect(harness).toContain("item.day < 20");
    expect(harness).toContain("runTruthGateMirror");
    expect(harness).toContain('code: "unsupported_numeric_claim"');
    expect(harness).toContain("const NUMERIC_TOKEN = /\\d[\\d,]*/g;");
  });

  it("counterbalances model call order and defaults to two repeats", () => {
    expect(harness).toContain("rotatedModels");
    expect(harness).toContain("runs: 2");
    expect(cloudShell).toContain('RUNS="${RUNS:-2}"');
  });

  it("records latency, retries, empty responses, parse errors and token metadata", () => {
    expect(harness).toContain("latencyMs");
    expect(harness).toContain("attempts");
    expect(harness).toContain("emptyResponse");
    expect(harness).toContain("parseError");
    expect(harness).toContain("thoughtsTokenCount");
    expect(harness).toContain("totalTokenCount");
  });

  it("does not contain deployment or product mutation commands", () => {
    for (const text of [harness, cloudShell]) {
      expect(text).not.toContain("gcloud functions deploy");
      expect(text).not.toContain("gcloud run deploy");
      expect(text).not.toContain("gcloud services enable");
      expect(text).not.toContain("gcloud services disable");
      expect(text).not.toContain("gcloud projects add-iam-policy-binding");
      expect(text).not.toContain("gcloud projects remove-iam-policy-binding");
      expect(text).not.toContain("gcloud iam");
      expect(text).not.toContain("gcloud billing");
      expect(text).not.toContain("gcloud alpha billing");
      expect(text).not.toContain("NEWLIFE_DIALOGUE_ENDPOINT_URL =");
    }
  });

  it("cloud helper checks Vertex API read-only and does not enable it", () => {
    expect(cloudShell).toContain("gcloud services list --enabled");
    expect(cloudShell).toContain("This helper will NOT enable it");
    expect(cloudShell).not.toContain("services enable");
  });

  it("does not change the production default model in this preparation branch", () => {
    expect(productionFunction).toContain(
      'const MODEL = process.env.NEWLIFE_DIALOGUE_MODEL || "gemini-2.5-flash";',
    );
  });

  it("does not clear or replace the currently wired public endpoint", () => {
    expect(productionConfig).toContain(
      'export const NEWLIFE_DIALOGUE_ENDPOINT_URL = "https://newlife-dialogue-zqtk74q2ra-an.a.run.app";',
    );
  });
});

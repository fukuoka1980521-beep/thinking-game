import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const harnessPath = path.join(root, "scripts/newlife-model-migration/compare-refoundation-models.cjs");
const backendPath = path.join(root, "functions/newlife-refoundation-ai/index.js");

describe("NEW LIFE refoundation model migration harness", () => {
  const harness = fs.readFileSync(harnessPath, "utf8");
  const backend = fs.readFileSync(backendPath, "utf8");

  it("compares baseline and both 3.5 candidates", () => {
    expect(harness).toContain('"gemini-2.5-flash"');
    expect(harness).toContain('"gemini-3.5-flash"');
    expect(harness).toContain('"gemini-3.5-flash-lite"');
  });

  it("tests both semantic interpretation and NPC generation", () => {
    expect(harness).toContain("INTERPRET_SYSTEM_INSTRUCTION");
    expect(harness).toContain("NPC_SYSTEM_INSTRUCTION");
    expect(harness).toContain("buildInterpretPrompt");
    expect(harness).toContain("buildNpcPrompt");
    expect(harness).toContain('"interpret_turn"');
    expect(harness).toContain('"generate_npc_line"');
  });

  it("includes Mika and Ryo across relationship/boundary states", () => {
    expect(harness).toContain('npc: "MIKA"');
    expect(harness).toContain('npc: "RYO"');
    expect(harness).toContain('"WITHDRAWN"');
    expect(harness).toContain('"OVERRIDDEN"');
    expect(harness).toContain('"RESPECTED"');
  });

  it("produces blind evidence separate from the model mapping", () => {
    expect(harness).toContain("blind-results-");
    expect(harness).toContain("blind-map-");
    expect(harness).toContain("WITHHOLD FROM EVALUATOR");
  });

  it("mirrors client validation boundaries for both operations", () => {
    expect(harness).toContain("validateInterpretOutput");
    expect(harness).toContain("clarify_pairing");
    expect(harness).toContain("validateNpcOutput");
    expect(harness).toContain("ontology_label_leak");
  });

  it("counterbalances model order and repeats cases twice by default", () => {
    expect(harness).toContain("rotatedModels");
    expect(harness).toContain("runs: 2");
  });

  it("covers the historically hard boundary/tone/public-shaming axes", () => {
    expect(harness).toContain('"reconsider-boundary"');
    expect(harness).toContain('"cross-without-permission"');
    expect(harness).toContain('"public-shaming"');
    expect(harness).toContain('"tone-pair-blunt"');
    expect(harness).toContain('"tone-pair-polite"');
    expect(harness).toContain('"ryo-withdrawn-overridden"');
  });

  it("removes operational fingerprints from blinded quality rows", () => {
    const start = harness.indexOf("const blinded = rows.map");
    const end = harness.indexOf("fs.writeFileSync", start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const block = harness.slice(start, end);
    expect(block).toContain("latencyMs");
    expect(block).toContain("tokenUsage");
    expect(block).toContain("attempts");
    expect(block).toContain("parseError");
    expect(block).toContain("modelLabel");
  });

  it("contains no deployment or endpoint mutation", () => {
    expect(harness).not.toContain("gcloud functions deploy");
    expect(harness).not.toContain("gcloud services enable");
    expect(harness).not.toContain("NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL =");
  });

  it("does not change the current source default during evaluation preparation", () => {
    expect(backend).toContain(
      'const MODEL = process.env.NEWLIFE_REFOUNDATION_AI_MODEL || "gemini-2.5-flash";',
    );
  });
});

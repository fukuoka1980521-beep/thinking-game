import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const harnessPath = path.join(root, "scripts/newlife-model-migration/compare-legacy-models.mjs");
const fixturesPath = path.join(root, "scripts/newlife-deploy/lib.mjs");
const backendIndexPath = path.join(root, "functions/newlife-dialogue/index.js");
const semanticConfigPath = path.join(root, "src/newlife/semantic/config.ts");

describe("NEW LIFE legacy model migration harness", () => {
  const harness = fs.readFileSync(harnessPath, "utf8");
  const fixtures = fs.readFileSync(fixturesPath, "utf8");
  const backendIndex = fs.readFileSync(backendIndexPath, "utf8");
  const semanticConfig = fs.readFileSync(semanticConfigPath, "utf8");

  it("compares baseline and both 3.5 candidates, config-driven not hardcoded to one winner", () => {
    expect(harness).toContain('"gemini-2.5-flash"');
    expect(harness).toContain('"gemini-3.5-flash"');
    expect(harness).toContain('"gemini-3.5-flash-lite"');
    expect(harness).toContain("--models");
    expect(harness).toContain("parseArgs");
  });

  it("reuses the exact Phase 31/33 fixed fixture set, not a duplicate", () => {
    expect(harness).toContain("LIVE_EVAL_FIXED_SET");
    expect(harness).toContain('from "../newlife-deploy/lib.mjs"');
    // Reused import, not redeclared -- fixture parity with live-eval.mjs is
    // therefore structural (same source of truth), not merely string-matched.
    expect(harness).not.toMatch(/const LIVE_EVAL_FIXED_SET\s*=/);
  });

  it("the reused fixture set covers every Phase 33 evidence case named in the migration-eval request", () => {
    for (const id of [
      "owner-1-menu-typo",
      "owner-2-tone-feedback",
      "owner-3-compound",
      "owner-4-collision",
      "typo-variant-1",
      "typo-variant-2",
      "multi-intent-1",
      "prompt-injection-1",
      "prompt-injection-2",
      "unknown-fact-1",
      "banned-canon-1",
      "numeric-hallucination-1",
      "social-act-greeting",
      "social-act-criticism",
    ]) {
      expect(fixtures).toContain(`id: "${id}"`);
    }
  });

  it("marks an unavailable candidate as SKIPPED rather than silently substituting it", () => {
    expect(harness).toContain("UNAVAILABLE_MODEL_ERROR_PATTERN");
    expect(harness).toContain("skipped_unavailable_model");
    expect(harness).toContain("SKIPPED_UNAVAILABLE");
    expect(harness).toContain("summarizeAvailability");
    expect(harness).toContain("modelAvailability");
  });

  it("mirrors the legacy backend's closed-enum schema for client-side validation", () => {
    expect(harness).toContain("validateLegacyOutput");
    expect(harness).toContain("SEMANTIC_ACTS");
    expect(harness).toContain("INTENT_CATEGORIES");
    expect(harness).toContain("FACT_CATEGORIES");
    expect(harness).toContain("answerableFromCanon");
  });

  it("flags banned-canon terms and cross-character vocabulary leaks as evidence, not a gate", () => {
    expect(harness).toContain("flagBannedTerm");
    expect(harness).toContain("NEGATIVE_CONSTRAINTS");
    expect(harness).toContain("crossCharacterVocabHits");
  });

  it("annotates exact-duplicate repetition across runs", () => {
    expect(harness).toContain("annotateRepetition");
    expect(harness).toContain("repeatedAcrossRuns");
  });

  it("produces blind evidence separate from the model mapping", () => {
    expect(harness).toContain("blind-results-");
    expect(harness).toContain("blind-map-");
    expect(harness).toContain("WITHHOLD FROM EVALUATOR");
  });

  it("counterbalances model order and repeats cases twice by default", () => {
    expect(harness).toContain("rotatedModels");
    expect(harness).toContain("runs: 2");
  });

  it("removes operational fingerprints from blinded quality rows, applying the refoundation-harness blind-review fix proactively", () => {
    const start = harness.indexOf("const blinded = rows.map");
    const end = harness.indexOf("fs.writeFileSync", start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const block = harness.slice(start, end);
    expect(block).toContain("latencyMs");
    expect(block).toContain("tokenUsage");
    expect(block).toContain("attempts");
    expect(block).toContain("parseError");
    expect(block).toContain("error");
    expect(block).toContain("modelLabel");
  });

  it("never assigns the raw provider/parse error text directly as a clientValidation.reason -- only as a boolean condition guarding a fixed enum string", () => {
    // The known-bad shape (from the refoundation harness's own blind-review
    // finding) is `reason: result.parseError || "..."`, which surfaces the
    // raw error text whenever it's truthy. This harness instead only ever
    // *tests* result.parseError/message inside a ternary/regex condition and
    // assigns one of a small set of fixed strings either way.
    expect(harness).not.toMatch(/reason:\s*result\.parseError\s*\|\|/);
    expect(harness).not.toMatch(/reason:\s*message\s*[,}]/);
    expect(harness).toContain('result.parseError ? "unparseable_output" : "no_parsed_output"');
    expect(harness).toContain("UNAVAILABLE_MODEL_ERROR_PATTERN.test(message)");
  });

  it("warns the blind evaluator about the prompt-injection self-identification risk", () => {
    expect(harness).toContain("prompt-injection-1/2");
    expect(harness).toContain("Disregard");
  });

  it("contains no deployment or endpoint mutation", () => {
    expect(harness).not.toContain("gcloud functions deploy");
    expect(harness).not.toContain("gcloud services enable");
    expect(harness).not.toContain('NEWLIFE_DIALOGUE_ENDPOINT_URL =');
  });

  it("does not change the current legacy source default or live endpoint during evaluation preparation", () => {
    expect(backendIndex).toContain('const MODEL = process.env.NEWLIFE_DIALOGUE_MODEL || "gemini-2.5-flash";');
    expect(semanticConfig).toContain(
      'export const NEWLIFE_DIALOGUE_ENDPOINT_URL = "https://newlife-dialogue-zqtk74q2ra-an.a.run.app";',
    );
  });
});

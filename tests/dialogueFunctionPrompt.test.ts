import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// functions/dialogue/ is a separate deployment artifact, not part of the
// Vite/Vitest frontend build -- but its system prompt is exactly what
// CORE_GAMEPLAY_REDESIGN Run Section 5/14 requires (anti-template,
// anti-opposition, five intervention modes). A cheap content check here
// guards against silently reverting to the old "always ask for evidence"
// pattern the Owner explicitly flagged as a core gameplay failure.
const promptSource = readFileSync(join(__dirname, "..", "functions", "dialogue", "index.js"), "utf-8");

describe("dialogue Cloud Function system prompt (Section 5/14, real-AI Run)", () => {
  it("defines all five intervention modes", () => {
    for (const mode of ["SUPPORT", "CHALLENGE", "ALTERNATIVE", "QUESTION", "SURPRISE"]) {
      expect(promptSource).toContain(mode);
    }
  });

  it("explicitly forbids converging on 'evidence?' / 'what to check?' every time (anti-template)", () => {
    expect(promptSource).toMatch(/根拠はありますか？」「何を確認しますか？」という問いかけだけに、毎回帰着させないこと/);
  });

  it("explicitly forbids manufacturing disagreement when the player's reasoning is sound (anti-opposition)", () => {
    expect(promptSource).toMatch(/常に反対する必要はない|CHALLENGE以外のモードでは使わない/);
  });

  it("still forbids revealing correctness/scoring and still bounds response length", () => {
    expect(promptSource).toContain("正解・不正解を明言せず");
    expect(promptSource).toMatch(/60〜160文字/);
  });

  it("never sends rubric ground truth in the request payload contract (evaluation firewall)", () => {
    for (const forbidden of ["criticalErrorChoiceId", "evidenceSupportsChoiceId", "uncertaintyChoiceId", "correctInfoIds"]) {
      expect(promptSource).not.toContain(forbidden);
    }
  });
});

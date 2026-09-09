import { describe, expect, it } from "vitest";
import {
  validateCausalUnlockClaim,
  REAL_LEFTOVER_STOCK_UNLOCK_CLAIM,
  SYNTHETIC_LEGITIMATE_UNLOCK_CLAIM,
} from "../src/research/action-contract-v2/causalUnlockInvariant";

describe("PHASE 11.12: counterfactual causal-unlock invariant", () => {
  it("a synthetic FAKE postcondition-only unlock (asserts no facts at all) fails validation", () => {
    const result = validateCausalUnlockClaim({
      gatedActionId: "SYNTHETIC_FAKE_UNLOCK",
      consequenceActionId: "SOME_CONSEQUENCE",
      factsAssertedByGatedActionAnswer: [],
      factsReachableBeforeConsequence: [],
    });
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/NEW_POSSIBILITY_CAUSALITY_NOT_ESTABLISHED/);
  });

  it("the REAL PHASE 11.11 leftover-stock unlock claim fails counterfactual validation -- the same defect described in AUTOMATED_PLAY_TRANSCRIPTS_V1.md, now caught mechanically", () => {
    const result = validateCausalUnlockClaim(REAL_LEFTOVER_STOCK_UNLOCK_CLAIM);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/NEW_POSSIBILITY_CAUSALITY_NOT_ESTABLISHED/);
    expect(result.novelFacts).toEqual([]);
  });

  it("a legitimate causal unlock (asserts a fact genuinely absent from what was reachable before) passes", () => {
    const result = validateCausalUnlockClaim(SYNTHETIC_LEGITIMATE_UNLOCK_CLAIM);
    expect(result.valid).toBe(true);
    expect(result.novelFacts).toEqual(["EXACT_REMAINING_UNIT_COUNT"]);
  });

  it("partial overlap: at least one genuinely novel fact is enough to pass, even if other asserted facts were already reachable", () => {
    const result = validateCausalUnlockClaim({
      gatedActionId: "PARTIAL_NOVELTY_CASE",
      consequenceActionId: "SOME_CONSEQUENCE",
      factsAssertedByGatedActionAnswer: ["IS_FESTIVAL_LEFTOVER", "BRAND_NEW_FACT"],
      factsReachableBeforeConsequence: ["IS_FESTIVAL_LEFTOVER"],
    });
    expect(result.valid).toBe(true);
    expect(result.novelFacts).toEqual(["BRAND_NEW_FACT"]);
  });
});

/**
 * PHASE 11.12: counterfactual causal-unlock invariant.
 *
 * Root cause (see RESEARCH_PRODUCT_CONTAMINATION_TRACE_V1.md item 3 / CAUSALITY_COUNTERFACTUAL_
 * INVARIANT_V1.md): `tests/newlifePlayableScene11.test.ts` describe block "O" ("ASK_ABOUT_LEFTOVER_
 * STOCK is eligible only after ACCEPT_HELP", lines 193-211) only ever checks
 * `ASK_ABOUT_LEFTOVER_STOCK.eligibility.every(p => p.check(state))` -- a pure state-boolean. That
 * test is satisfied by `LEFTOVER_STOCK_MOVED` flipping false->true, which mechanically happens.
 * Nothing in that test, or anywhere else in the repository, ever compares the CONTENT of what the
 * newly-eligible action reveals against what the player could already have learned before the
 * consequence. This is the EVAL_METRIC_LEAK: the test's own boolean became the product's entire
 * definition of "genuinely new possibility."
 *
 * This module adds the missing check as a standalone, reusable invariant -- NOT a second boolean
 * bolted onto `Precondition` (directive Section 15: "do not simply add another boolean"). It
 * requires the author of a claimed causal unlock to state, as data, which facts the unlocked
 * action's answer asserts and which facts were already reachable before the gating consequence.
 * The check is mechanical set comparison, not natural-language understanding -- deliberately: this
 * repo's captured-line set is finite and enumerable (5 lines total, PHASE 11.11), so fact tags can
 * be assigned by a human reading the actual captured text, not inferred automatically.
 */

export interface CausalUnlockClaim {
  gatedActionId: string;
  consequenceActionId: string;
  /** Fact tags the gated action's answer asserts, read directly off its captured/authored text. */
  factsAssertedByGatedActionAnswer: string[];
  /** Union of fact tags assertable by every action reachable BEFORE the consequence happened,
   *  read directly off those actions' captured/authored text. */
  factsReachableBeforeConsequence: string[];
}

export interface CausalUnlockValidation {
  valid: boolean;
  reason: string;
  novelFacts: string[];
}

/** NEW_POSSIBILITY_CAUSALITY_NOT_ESTABLISHED is returned as `reason` (directive Section 4's exact
 *  required label), never silently passed, whenever no novel fact survives the comparison. */
export function validateCausalUnlockClaim(claim: CausalUnlockClaim): CausalUnlockValidation {
  if (claim.factsAssertedByGatedActionAnswer.length === 0) {
    return { valid: false, reason: "NEW_POSSIBILITY_CAUSALITY_NOT_ESTABLISHED: gated action asserts no facts at all", novelFacts: [] };
  }
  const alreadyReachable = new Set(claim.factsReachableBeforeConsequence);
  const novelFacts = claim.factsAssertedByGatedActionAnswer.filter((f) => !alreadyReachable.has(f));
  if (novelFacts.length === 0) {
    return {
      valid: false,
      reason: "NEW_POSSIBILITY_CAUSALITY_NOT_ESTABLISHED: every fact the gated action asserts was already reachable before the consequence",
      novelFacts,
    };
  }
  return { valid: true, reason: "OK", novelFacts };
}

// ---------------------------------------------------------------------------
// Applied to real PHASE 11.11 data. Fact tags below are read directly off the captured lines in
// raw_vertex_capture.json / capturedYoheiLines.ts, not invented for this check.
// ---------------------------------------------------------------------------

/**
 * ASK_WHAT's captured output ("店先にある祭りの手ぬぐいの箱、値引き用の棚まで運んでくれるか") already
 * states both facts. ASK_ABOUT_LEFTOVER_STOCK's captured output ("ああ、そうだ。祭りの残りだよ。
 * 値引きで出すから、棚に並べるんだ。") restates the same two facts and asserts nothing else.
 */
export const REAL_LEFTOVER_STOCK_UNLOCK_CLAIM: CausalUnlockClaim = {
  gatedActionId: "ASK_ABOUT_LEFTOVER_STOCK",
  consequenceActionId: "PLAYER_ACCEPTS_REQUEST",
  factsAssertedByGatedActionAnswer: ["IS_FESTIVAL_LEFTOVER", "GOING_TO_DISCOUNT_SHELF"],
  factsReachableBeforeConsequence: ["IS_FESTIVAL_LEFTOVER", "GOING_TO_DISCOUNT_SHELF"],
};

/**
 * A synthetic, hypothetical LEGITIMATE unlock, for contrast -- proves the validator is not
 * trivially always-false. Not a claim about any real PHASE 11.11 action; no such action exists in
 * the current scene.
 */
export const SYNTHETIC_LEGITIMATE_UNLOCK_CLAIM: CausalUnlockClaim = {
  gatedActionId: "ASK_ABOUT_EXACT_REMAINING_COUNT (hypothetical)",
  consequenceActionId: "PLAYER_HELPS_COUNT_STOCK (hypothetical)",
  factsAssertedByGatedActionAnswer: ["EXACT_REMAINING_UNIT_COUNT"],
  factsReachableBeforeConsequence: ["IS_FESTIVAL_LEFTOVER", "GOING_TO_DISCOUNT_SHELF"],
};

// ---------------------------------------------------------------------------
// PHASE 11.12R: real-path evaluation against the LIVE running scene's actual authoritative state,
// not the static claim data above. See REAL_CAUSALITY_GATE_AUDIT_V1.md for the full evidence-
// source decision. Chosen source: State Admission (the `leftover_stock_moved` LifeMaterial's own
// `concreteContent` field) -- the SAME material that gates ASK_ABOUT_LEFTOVER_STOCK's eligibility
// already asserts, in its own authoritative text, both facts the follow-up's answer would later
// assert. This is deliberately chosen over the player's own interaction/experienceLog history
// (which would make the verdict path-dependent -- true only if the player happened to ask ASK_WHAT
// first) because the ACCEPT_HELP narration itself states these facts regardless of which questions,
// if any, the player asked beforehand (see PLAYABLE_SCENE_SPEC_V1.md's material.concreteContent:
// "洋平と一緒に、祭りの残りの手ぬぐいの箱を値引き用の陳列スペースまで運んだ"). State Admission is the
// single most authoritative, always-available (once the material exists), path-independent source.
// ---------------------------------------------------------------------------

import type { ContractV2State } from "./types";

export type CausalUnlockVerdict = "CAUSAL_UNLOCK_VALID" | "CAUSAL_UNLOCK_INVALID_ALREADY_KNOWN" | "CAUSAL_UNLOCK_UNDETERMINABLE";

export interface RealCausalClaimEvaluation {
  verdict: CausalUnlockVerdict;
  evidenceSource: "STATE_ADMISSION_MATERIAL_CONCRETE_CONTENT";
  reason: string;
  novelFacts: string[];
}

const LEFTOVER_STOCK_MATERIAL_ID = "leftover_stock_moved";
/** Same two fact tags as `REAL_LEFTOVER_STOCK_UNLOCK_CLAIM` above -- kept as a single named constant
 *  so the static claim and the real-path evaluator can never silently drift apart. */
const ASK_ABOUT_LEFTOVER_STOCK_ANSWER_FACTS = ["IS_FESTIVAL_LEFTOVER", "GOING_TO_DISCOUNT_SHELF"];

/** Reads fact tags directly off a LifeMaterial's own `concreteContent` string -- substring
 *  matching, the same idiom `tests/newlifePlayableScene11.test.ts` test L already uses on
 *  `packet.firsthand`/`packet.unknown` (e.g. `.not.toMatch(/雨|晴れ/)`), not a new technique. */
function factsAssertedByMaterialConcreteContent(concreteContent: string): string[] {
  const facts: string[] = [];
  if (concreteContent.includes("祭りの残り")) facts.push("IS_FESTIVAL_LEFTOVER");
  if (concreteContent.includes("値引き")) facts.push("GOING_TO_DISCOUNT_SHELF");
  return facts;
}

/**
 * Evaluates the REAL, live ACCEPT_HELP -> ASK_ABOUT_LEFTOVER_STOCK claim against actual runtime
 * state -- not the static `REAL_LEFTOVER_STOCK_UNLOCK_CLAIM` constant above, which only documents
 * the finding. This is the function `NewlifePlayable11App.tsx` calls for real.
 */
export function evaluateRealLeftoverStockCausalClaim(state: ContractV2State): RealCausalClaimEvaluation {
  const material = state.materials.find((m) => m.id === LEFTOVER_STOCK_MATERIAL_ID && m.status === "ACTIVE");
  if (!material) {
    return {
      verdict: "CAUSAL_UNLOCK_UNDETERMINABLE",
      evidenceSource: "STATE_ADMISSION_MATERIAL_CONCRETE_CONTENT",
      reason: "gating material is not yet ACTIVE -- the claim is not reachable yet in this state",
      novelFacts: [],
    };
  }
  const alreadyStated = new Set(factsAssertedByMaterialConcreteContent(material.concreteContent));
  const novelFacts = ASK_ABOUT_LEFTOVER_STOCK_ANSWER_FACTS.filter((f) => !alreadyStated.has(f));
  if (novelFacts.length === 0) {
    return {
      verdict: "CAUSAL_UNLOCK_INVALID_ALREADY_KNOWN",
      evidenceSource: "STATE_ADMISSION_MATERIAL_CONCRETE_CONTENT",
      reason: `material "${LEFTOVER_STOCK_MATERIAL_ID}".concreteContent ("${material.concreteContent}") already asserts every fact ASK_ABOUT_LEFTOVER_STOCK's answer would assert`,
      novelFacts: [],
    };
  }
  return {
    verdict: "CAUSAL_UNLOCK_VALID",
    evidenceSource: "STATE_ADMISSION_MATERIAL_CONCRETE_CONTENT",
    reason: `novel facts found in the gated action's claim, absent from the material's own concreteContent: ${novelFacts.join(", ")}`,
    novelFacts,
  };
}

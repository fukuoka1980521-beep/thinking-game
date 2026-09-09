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
// `concreteContent` field) -- always-available (once the material exists), path-independent
// (unaffected by which questions, if any, the player asked beforehand).
//
// PHASE 11.13 CORRECTION (see docs/research/evaluation/phase-11-13a/
// QUESTION_PREREQUISITE_ANSWER_BOUNDARY_V1.md): the comment above originally claimed the material's
// concreteContent "already asserts... both facts the follow-up's answer would later assert" --
// true of the PHASE 11.12R-era CONTAMINATED content, but stale and WRONG after PHASE 11.13's own
// repair. The repaired `leftover_stock_moved`.concreteContent does NOT state "祭りの残り" -- that is
// exactly the point: the physical reveal (evidence) and Yohei's confirmed answer (the target fact)
// are deliberately different facts now. `novelFacts` below answers "would this fact be new IF THE
// GATED ACTION'S ANSWER STATES IT" -- a claim about the ANSWER's content relative to the REVEAL's
// own text. It is NOT a claim that the PLAYER has already learned that fact merely by reaching this
// state (PHASE 11.13's own prose conflated these two, which is exactly the contradiction this phase
// exists to fix). See `evaluateLeftoverQuestionPrerequisite` below for the corrected, explicit
// QUESTION_PREREQUISITE (evidence enabling the question) vs QUESTION_TARGET_FACT (known only once
// the player has actually asked and been answered -- tracked via Actor Experience, not State
// Admission) separation. This function's own eligibility-gating BEHAVIOR was already correct
// (verified: `applyCausalityGate` in `NewlifePlayable11App.tsx` only ever used this to decide
// whether the button enters the render list at all, which is unaffected by the naming issue); only
// the DOCUMENTATION/LABELING was wrong, which is why this function's logic is unchanged below.
// ---------------------------------------------------------------------------

import type { ContractV2State } from "./types";
import { LEFTOVER_RESPONSE_MATERIAL_IDS, REVEAL_MATERIAL_ASSERTED_FACTS } from "./playableSceneContracts";

export type CausalUnlockVerdict = "CAUSAL_UNLOCK_VALID" | "CAUSAL_UNLOCK_INVALID_ALREADY_KNOWN" | "CAUSAL_UNLOCK_UNDETERMINABLE";

export interface RealCausalClaimEvaluation {
  verdict: CausalUnlockVerdict;
  evidenceSource: "STATE_ADMISSION_MATERIAL_STRUCTURED_FACTS";
  reason: string;
  novelFacts: string[];
}

const LEFTOVER_STOCK_MATERIAL_ID = "leftover_stock_moved";
/** Same two fact tags as `REAL_LEFTOVER_STOCK_UNLOCK_CLAIM` above -- kept as a single named constant
 *  so the static claim and the real-path evaluator can never silently drift apart. */
const ASK_ABOUT_LEFTOVER_STOCK_ANSWER_FACTS = ["IS_FESTIVAL_LEFTOVER", "GOING_TO_DISCOUNT_SHELF"];
/** Fail-closed default for an unregistered reveal material id: treat it as asserting EVERY known
 *  fact (maximally leaky), so an unaudited reveal can never be silently granted a causal unlock it
 *  was never verified to deserve. In practice this scene only ever produces the one registered id. */
const ALL_KNOWN_REVEAL_FACTS = ["IS_FESTIVAL_LEFTOVER", "GOING_TO_DISCOUNT_SHELF"];

/**
 * PHASE 11.13E: reads fact tags STRUCTURALLY, by material id, from the authored registry in
 * `playableSceneContracts.ts` -- never by parsing `concreteContent`. This function replaces the
 * PHASE 11.12-era `factsAssertedByMaterialConcreteContent` (kept below, deprecated, for historical
 * reference only -- directive Section 1's instruction not to delete evidence globally -- but no
 * longer called by any Product-authoritative path; see `AUTHORITATIVE_PROSE_PARSING_AUDIT_V1.md`
 * for the grep proof).
 */
export function structuredFactsAssertedByRevealMaterial(materialId: string): string[] {
  return REVEAL_MATERIAL_ASSERTED_FACTS[materialId] ?? ALL_KNOWN_REVEAL_FACTS;
}

/**
 * @deprecated PHASE 11.13E removed the last Product-authoritative call site for this function
 * (see `structuredFactsAssertedByRevealMaterial` above). Kept, unused by any real path, as
 * historical evidence of the PHASE 11.12-era approach this repository moved away from -- directive
 * instruction: "do NOT delete it globally if other research cases genuinely use it" (none currently
 * do; retained anyway as the documented "before" state). A regression test
 * (`tests/zeroProseAuthorityAudit.test.ts`) fails if any Product-authoritative module calls this
 * again.
 */
function factsAssertedByMaterialConcreteContent(concreteContent: string): string[] {
  const facts: string[] = [];
  if (concreteContent.includes("祭りの残り")) facts.push("IS_FESTIVAL_LEFTOVER");
  if (concreteContent.includes("値引き")) facts.push("GOING_TO_DISCOUNT_SHELF");
  return facts;
}
void factsAssertedByMaterialConcreteContent; // referenced only to document intent; never called

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
      evidenceSource: "STATE_ADMISSION_MATERIAL_STRUCTURED_FACTS",
      reason: "gating material is not yet ACTIVE -- the claim is not reachable yet in this state",
      novelFacts: [],
    };
  }
  const alreadyStated = new Set(structuredFactsAssertedByRevealMaterial(material.id));
  const novelFacts = ASK_ABOUT_LEFTOVER_STOCK_ANSWER_FACTS.filter((f) => !alreadyStated.has(f));
  if (novelFacts.length === 0) {
    return {
      verdict: "CAUSAL_UNLOCK_INVALID_ALREADY_KNOWN",
      evidenceSource: "STATE_ADMISSION_MATERIAL_STRUCTURED_FACTS",
      reason: `material id "${material.id}" is structurally registered as already asserting every fact ASK_ABOUT_LEFTOVER_STOCK's answer would assert`,
      novelFacts: [],
    };
  }
  return {
    verdict: "CAUSAL_UNLOCK_VALID",
    evidenceSource: "STATE_ADMISSION_MATERIAL_STRUCTURED_FACTS",
    reason: `novel facts found in the gated action's claim, structurally absent from material id "${material.id}"'s registered facts: ${novelFacts.join(", ")}`,
    novelFacts,
  };
}

// ---------------------------------------------------------------------------
// PHASE 11.13A: QUESTION_PREREQUISITE vs QUESTION_TARGET_FACT, made explicit and separately
// checkable. Directive's own required distinction (Section 2/4/6): "A PLAYER may gain enough
// evidence/context to ask a question without already knowing its answer." Reuses EXISTING
// evidence sources, no new knowledge structure:
//   - QUESTION_PREREQUISITE (does the player have legitimate grounds to ask at all?): State
//     Admission -- does `leftover_stock_moved` exist, and does its own concreteContent avoid
//     leaking the target (the same check `evaluateRealLeftoverStockCausalClaim` already makes).
//
// PHASE 11.13B CORRECTION (see docs/research/evaluation/phase-11-13b/
// QUESTION_ANSWER_KNOWLEDGE_BOUNDARY_V1.md): PHASE 11.13A's TARGET_FACT_KNOWN check used
// `experienceLog`'s ASK-record ("運んだ箱が祭りの残りかどうか、洋平に尋ねた") as proof the target was
// known. That record proves only QUESTION_ASKED -- it is written unconditionally by `resolveAction`
// the moment the action dispatches, regardless of what the language adapter subsequently displays.
// QUESTION_ASKED != ANSWER_RECEIVED != TARGET_FACT_KNOWN. Corrected: `ASK_ABOUT_LEFTOVER_STOCK`
// (`playableSceneContracts.ts`) now ALSO produces its own authoritative State Admission record
// (`leftover_question_answered`, deterministic, authored -- never derived from the language-
// adapter's string; LLM STRING != AUTHORITATIVE STATE) for Yohei's actual response. QUESTION_ASKED
// is still read from Actor Experience (correctly scoped now to mean ONLY "player asked"); ANSWER_
// RECEIVED and TARGET_FACT_KNOWN are read from the NEW material -- two conceptually and
// mechanically distinct sources, per directive Section 7's "PLAYER asked Yohei whether X" (Actor
// Experience) vs "Yohei told PLAYER that X" (State Admission) distinction.
// ---------------------------------------------------------------------------

export type TargetFactStatus = "UNRESOLVED" | "KNOWN_TRUE" | "KNOWN_FALSE" | "CONFLICTING";

export interface QuestionPrerequisiteEvaluation {
  /** OBSERVED_EVIDENCE: does the player have legitimate grounds to ask this question at all? */
  prerequisiteSatisfied: boolean;
  /** Has the player actually dispatched the question? (Actor Experience -- proves ASKING only.) */
  questionAsked: boolean;
  /** Did a legitimate authoritative NPC/world response actually occur? (State Admission -- proves
   *  a response record exists, independent of which outcome it carries.) */
  answerReceived: boolean;
  /** PHASE 11.13D: the target proposition's resolved status, read structurally from WHICH response
   *  material id was admitted -- never from parsing its `concreteContent`. `KNOWN_FALSE` is kept
   *  distinct from `UNRESOLVED` (directive Section 4: "do not collapse KNOWN_FALSE into UNKNOWN"). */
  targetStatus: TargetFactStatus;
  /** Kept for backward compatibility with earlier phases' callers/tests: `true` iff
   *  `targetStatus === "KNOWN_TRUE"`. Does NOT mean "the player knows something definitive" in
   *  general -- a `KNOWN_FALSE` response is equally definitive but leaves this `false`. Prefer
   *  `targetStatus` for anything that needs to distinguish KNOWN_FALSE from UNRESOLVED. */
  targetFactKnown: boolean;
  /** Whether the question may legitimately be offered right now. Note: stays `true` even once
   *  `targetStatus` resolves via a genuine answer event -- re-asking remains ordinary
   *  conversation (same re-askability as ASK_FESTIVAL/ASK_SALES), it is simply no longer a NEW
   *  discovery, which `reason` states explicitly rather than silently. */
  eligible: boolean;
  reason: string;
}

const LEFTOVER_QUESTION_ASKED_EXPERIENCE = "運んだ箱が祭りの残りかどうか、洋平に尋ねた";

export function evaluateLeftoverQuestionPrerequisite(state: ContractV2State): QuestionPrerequisiteEvaluation {
  const material = state.materials.find((m) => m.id === LEFTOVER_STOCK_MATERIAL_ID && m.status === "ACTIVE");
  const prerequisiteSatisfied = material !== undefined;
  const questionAsked = state.experienceLog.some((e) => e.concreteContent === LEFTOVER_QUESTION_ASKED_EXPERIENCE);

  if (!prerequisiteSatisfied) {
    return {
      prerequisiteSatisfied: false,
      questionAsked,
      answerReceived: false,
      targetStatus: "UNRESOLVED",
      targetFactKnown: false,
      eligible: false,
      reason: "QUESTION_PREREQUISITE_NOT_MET: player has not yet observed the opened box (no ACCEPT/reveal yet) -- no legitimate grounds to ask",
    };
  }

  // PHASE 11.13E: structural lookup by material id -- zero text inspection anywhere in this
  // function now. `structuredFactsAssertedByRevealMaterial` reads an authored registry
  // (`REVEAL_MATERIAL_ASSERTED_FACTS`, playableSceneContracts.ts), never `concreteContent`.
  const revealAlreadyLeaksTarget = structuredFactsAssertedByRevealMaterial(material!.id).includes("IS_FESTIVAL_LEFTOVER");
  if (revealAlreadyLeaksTarget) {
    return {
      prerequisiteSatisfied: true,
      questionAsked,
      answerReceived: questionAsked,
      targetStatus: "KNOWN_TRUE",
      targetFactKnown: true,
      eligible: false,
      reason: "QUESTION_TARGET_ALREADY_KNOWN: the physical reveal's own authoritative text already states the target fact -- asking would not be genuine information-seeking",
    };
  }

  // PHASE 11.13D: structural lookup only -- WHICH material id was admitted IS the authoritative
  // signal (`LEFTOVER_RESPONSE_MATERIAL_IDS`, imported from playableSceneContracts.ts, the same
  // ids `npcResponseCommit.ts` commits by). No `concreteContent` of any response material is read
  // here.
  //
  // PHASE 11.13E (directive Section 5): distinct ids are NOT enforced to be mutually exclusive by
  // `mergeMaterials` (it merges by id -- two DIFFERENT ids coexist rather than overwriting each
  // other). The real production registry (`LEFTOVER_QUESTION_RESPONSE_SEMANTICS`) only ever maps
  // one packet key to one fixed outcome, so this cannot happen through the real UI today -- but the
  // evaluator itself must not assume it, and must not silently pick "CONFIRM wins" / "first wins" /
  // "last wins" if it ever did. Count how many outcome ids are simultaneously present; more than
  // one is a `CONFLICTING_RESPONSE_SEMANTICS` fail-closed result, never a silent tiebreak. The SAME
  // outcome committed twice (idempotent re-ask) still counts as exactly one id present (`.some`),
  // so ordinary re-asking with the same real answer is unaffected.
  const confirmed = state.materials.some((m) => m.id === LEFTOVER_RESPONSE_MATERIAL_IDS.CONFIRM && m.status === "ACTIVE");
  const denied = state.materials.some((m) => m.id === LEFTOVER_RESPONSE_MATERIAL_IDS.DENY && m.status === "ACTIVE");
  const unknownAnswer = state.materials.some((m) => m.id === LEFTOVER_RESPONSE_MATERIAL_IDS.UNKNOWN && m.status === "ACTIVE");
  const outcomesPresent = [confirmed, denied, unknownAnswer].filter(Boolean).length;
  const answerReceived = outcomesPresent > 0;

  if (outcomesPresent > 1) {
    return {
      prerequisiteSatisfied: true,
      questionAsked,
      answerReceived,
      targetStatus: "CONFLICTING",
      targetFactKnown: false,
      eligible: true,
      reason: "CONFLICTING_RESPONSE_SEMANTICS: more than one mutually-exclusive response outcome is simultaneously present in state -- refusing to silently pick a winner",
    };
  }

  const targetStatus: TargetFactStatus = confirmed ? "KNOWN_TRUE" : denied ? "KNOWN_FALSE" : "UNRESOLVED";

  return {
    prerequisiteSatisfied: true,
    questionAsked,
    answerReceived,
    targetStatus,
    targetFactKnown: targetStatus === "KNOWN_TRUE",
    eligible: true,
    reason:
      targetStatus === "KNOWN_TRUE"
        ? "QUESTION_TARGET_NOW_KNOWN_TRUE_VIA_ANSWER: player asked and Yohei's own authoritative response confirmed the target fact -- re-asking remains available as ordinary conversation, but is not a new discovery"
        : targetStatus === "KNOWN_FALSE"
        ? "QUESTION_TARGET_NOW_KNOWN_FALSE_VIA_ANSWER: player asked and Yohei's own authoritative response denied the target fact -- this is definitive information, not a new-discovery claim"
        : answerReceived
        ? "QUESTION_ANSWER_RECEIVED_BUT_TARGET_UNRESOLVED: an authoritative response occurred but did not resolve the target proposition either way"
        : "QUESTION_ELIGIBLE: player has legitimate evidence (the physical reveal) and the target fact remains unresolved until Yohei answers",
  };
}

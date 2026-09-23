/**
 * PHASE 10.18: State Admission — minimum runtime types.
 *
 * Isolated research module. Does not import from or modify `src/newlife/**` or the
 * `src/research/hybrid-generation/**` engine files. Its only relationship to NEW LIFE is read-only:
 * this microtest drives the real, exported, unmodified `advanceDay`/`DayState` state machine
 * (`src/newlife/day12/scenario.ts`) as a source-of-truth oracle for the PLAYER_CHOSEN_FACT case, and
 * as the "later same-day consumer" whose real behavior is observed -- never reimplemented.
 *
 * Minimum subset only, per directive Section 3/4 -- no general ontology, no DERIVED_FACT class
 * (not required by this microtest; PRACTICAL_OUTCOME-style derivation already lives in the Hybrid
 * layer and is out of scope here).
 */

export type ProvenanceClass = "CANONICAL_FACT" | "PLAYER_CHOSEN_FACT" | "GENERATED_EPHEMERAL_DETAIL" | "GENERATED_PERSISTENT_CANDIDATE" | "INVALID_INVENTION";

export type AdmissionDecision = "ADMIT_AUTOMATICALLY" | "SCENE_LOCAL_ONLY" | "REQUIRE_STRATEGIST_REVIEW" | "REJECT";

export type SourceType = "CANONICAL_STATE" | "PLAYER_STRUCTURED_ACTION" | "GENERATED_TEXT";

/** The ONLY legitimate authority for a PLAYER_CHOSEN_FACT (Section 2). `factsGrantedByGameRules`
 *  must be read directly from a real `DayState.facts` diff (before/after a real `advanceDay` call)
 *  -- never parsed from `narration` text. This module never inspects `narration` to decide anything. */
export interface StructuredPlayerActionInput {
  sourceType: "PLAYER_STRUCTURED_ACTION";
  actionLabel: string;
  factsGrantedByGameRules: string[];
  /** True only when the SAME game-rule computation deterministically produces this delta every time
   *  (i.e. it is pure code, not a coin flip or an LLM guess) -- true for every NEW LIFE fact grant,
   *  since `scenario.ts` is a documented pure deterministic state machine with no randomness. */
  deterministic: boolean;
}

export interface CanonicalFactInput {
  sourceType: "CANONICAL_STATE";
  fact: string;
  source: string;
}

/** A claim from FREELY GENERATED text (Hybrid pipeline output). Per directive Section 12, this
 *  phase does NOT build an NLP/LLM fact extractor -- these flags are set explicitly/manually from
 *  already-known research fixtures, never auto-parsed. */
export interface GeneratedClaimInput {
  sourceType: "GENERATED_TEXT";
  claimText: string;
  isTemporallyScoped: boolean;
  matchesCanonicalFact: boolean;
  contradictsCanonicalFact: boolean;
  violatesDesignProhibition: boolean;
}

export type ClassificationInput = StructuredPlayerActionInput | CanonicalFactInput | GeneratedClaimInput;

export interface ProvenanceResult {
  provenanceClass: ProvenanceClass;
  reason: string;
}

export interface AdmissionResult {
  decision: AdmissionDecision;
  reason: string;
}

export interface StateAdmissionEventRecord {
  eventId: string;
  sourceType: SourceType;
  sourceAction: string;
  provenanceClass: ProvenanceClass;
  priorState: string[];
  admissionDecision: AdmissionDecision;
  stateDelta: { added: string[]; removed: string[] };
  resultingState: string[];
  reason: string;
}

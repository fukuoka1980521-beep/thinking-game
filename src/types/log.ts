import type { AbilityKey, AiCharacterKey, AiTrapType, CaseType, PlayerAiAction, UtteranceType } from "./case";

export type ScreenId =
  | "CASE_INTRO"
  | "OBSERVED_FACT"
  | "FIRST_DECISION"
  | "AI_INTERVENTION"
  | "NEW_FACT"
  | "SECOND_DECISION"
  | "REFLECTION"
  | "RESULT";

export interface ObservedFactInput {
  factCheckAnswer: "fact" | "interpretation" | null;
}

export interface FirstDecisionInput {
  choiceId: string;
  confidence: number;
  reason: string;
  /** Structured "which information matters" checklist (Section D) — replaces free-text hypothesis. */
  infoOptionsSelected: string[];
}

export interface AiActionInput {
  /** Only meaningful when the case's rubric.aiResponseGroundTruth is non-null (an evaluable AI claim exists); null for Socratic-question cases. */
  playerAction: PlayerAiAction | null;
  problemTypeSelected: AiTrapType | null;
  freeText: string;
}

export interface SecondDecisionInput {
  choiceId: string;
  reason: string;
  confidence: number;
}

/** Session that has not yet reached RESULT. Persisted for reload-resume. */
export interface InProgressSession {
  sessionId: string;
  caseId: string;
  screen: ScreenId;
  startedAt: string;
  /** Groups this case together with the others played back-to-back in one sitting (PLAY FLOW Section 5/7). */
  playRunId: string;
  observedFact?: ObservedFactInput;
  first?: FirstDecisionInput;
  aiAction?: AiActionInput;
  second?: SecondDecisionInput;
  reflectionNote?: string;
}

/** Whether the second decision converged toward what the new evidence supports. */
export type UpdateAppropriateness =
  | "appropriate_update"
  | "appropriate_keep"
  | "under_update"
  | "over_update"
  | "misaligned_change";

/** AI_QUALITY x PLAYER_ACTION matrix result (Section G). Never collapsed to a single trust score. */
export type CalibrationLabel =
  | "appropriate_reliance"
  | "under_reliance"
  | "appropriate_verification"
  | "appropriate_caution"
  | "premature_acceptance"
  | "premature_rejection"
  | "over_reliance"
  | "appropriate_rejection"
  | "not_applicable";

export interface TrapDetectionResult {
  applicable: boolean;
  groundTruthType: AiTrapType;
  playerSelectedType: AiTrapType | null;
  correctDetection: boolean;
}

/**
 * Deterministic evaluation output (Section C: Evaluation Engine). Computed
 * only from structured signals and rubric ground truth — never from parsing
 * free text (Section D).
 */
export interface RubricResult {
  rubricVersion: string;
  observationCorrect: boolean;
  criticalErrorMade: boolean;
  infoOptionsConsidered: number;
  infoOptionsMatchedGroundTruth: number;
  updateAppropriateness: UpdateAppropriateness;
  aiCalibration: CalibrationLabel;
  trapDetection: TrapDetectionResult;
}

/** Behavioral signals bridge, kept for the growth aggregator (derived from RubricResult, never from raw text). */
export interface AbilityObservations {
  observationCorrect: boolean;
  hypothesisConsidered: boolean;
  falsificationConsidered: boolean;
  updatingEngaged: boolean;
}

/**
 * SPEC AMENDMENT (Section Q): the reusable data asset is the decision
 * trajectory, not a person profile. This is the canonical trajectory schema
 * (see docs/TRAJECTORY_SCHEMA.md) — local-only, never sent anywhere.
 */
export interface TrajectoryLog {
  sessionId: string;
  caseId: string;
  caseType: CaseType;
  level: number;
  timestamp: string;
  factOrder: string[];
  /** Which play run (Section 5/7) this case was completed as part of. */
  playRunId: string;

  characterOffered: AiCharacterKey[];
  characterUsed: AiCharacterKey;
  characterChoiceAvailable: boolean;

  firstDecision: {
    choiceId: string;
    confidence: number;
    reason: string;
    factCheckAnswer: "fact" | "interpretation" | null;
    infoOptionsSelected: string[];
  };
  aiIntervention: {
    message: string;
    /** Snapshotted from the case's rubric at completion time — see isCalibrationEligible. */
    utteranceType: UtteranceType;
    /** True iff utteranceType !== "QUESTION" && the case has a non-null aiResponseGroundTruth. */
    calibrationEligible: boolean;
    playerAction: PlayerAiAction | null;
    problemTypeSelected: AiTrapType | null;
    freeText: string;
  };
  newEvidence: string[];
  secondDecision: {
    choiceId: string;
    confidence: number;
    reason: string;
  };
  decisionChanged: boolean;
  confidenceChange: number;
  reflectionNote: string;

  rubricResult: RubricResult;
  /** Data-structure placeholder only (Section F) — no live A/B assignment in this MVP. */
  experimentGroup: string;
  transferTarget: string;

  abilityObservations: AbilityObservations;
  completed: true;
}

export interface GrowthWindowStats {
  totalCases: number;
  byAbility: Record<AbilityKey, { count: number; total: number }>;
}

export interface AiActionDistribution {
  totalCases: number;
  counts: Record<PlayerAiAction, number>;
}

/**
 * SPEC AMENDMENT (validation build, Section 5/9): funnel events for the
 * "does someone want to play another case" question. Local-only, never
 * transmitted. See docs/USER_TEST_GUIDE.md for how to read these back.
 */
export type MetricEventType =
  | "CASE_START"
  | "CASE_COMPLETE"
  | "NEXT_CASE_CLICK"
  | "SESSION_COMPLETE"
  | "USER_TEST_SUBMITTED";

export interface MetricEvent {
  type: MetricEventType;
  timestamp: string;
  playRunId: string;
  caseId?: string;
}

/**
 * The 5 optional post-play questions (Section 8). 1-5 Likert scale,
 * local-only. All 5 are phrased so higher = more positive/more agreement
 * (SEMANTICS FIX Run Section 16 — `q4` used to be phrased as "how much did
 * you get confused," which inverted the scale relative to the other 4
 * questions; it's now phrased positively and renamed from `q4Confusion` to
 * `q4Clarity` to match, since a field still named "Confusion" holding
 * clarity ratings would itself be a latent semantic bug).
 */
export interface UserTestResponse {
  responseId: string;
  timestamp: string;
  playRunId: string;
  q1WantMore: number;
  q2Enjoyable: number;
  q3QuestionedAi: number;
  q4Clarity: number;
  q5WantReuse: number;
  freeText: string;
}

/** Section 7: behavioral tally for one play run, shown back to the player without ability claims. */
export interface SessionSummary {
  totalCases: number;
  reconsidered: number;
  maintained: number;
  verifiedAi: number;
  rejectedAi: number;
  choseUncertain: number;
}

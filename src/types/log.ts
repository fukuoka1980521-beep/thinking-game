import type { AbilityKey, AiCharacterKey, AiTrapType, CaseType, PlayerAiAction } from "./case";

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
  /** Only meaningful for AI_CALIBRATION cases; null for Socratic-question (TRAINING) cases. */
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

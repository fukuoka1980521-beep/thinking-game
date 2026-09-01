export type AbilityKey =
  | "OBSERVATION"
  | "HYPOTHESIS"
  | "FALSIFICATION"
  | "UPDATING";

export type AiCharacterKey = "DETECTIVE" | "DEVIL" | "OBSERVER" | "STRATEGIST";

export interface AiCharacterProfile {
  key: AiCharacterKey;
  name: string;
  role: string;
  sampleLine: string;
}

/**
 * SPEC AMENDMENT (case_type, Section B/M): separates cases that only teach
 * a skill from cases used to measure it or to measure AI calibration.
 * Rubric rigor is expected to scale with this: TRAINING can carry a lighter
 * rubric than MEASUREMENT / AI_CALIBRATION.
 */
export type CaseType = "TRAINING" | "MEASUREMENT" | "AI_CALIBRATION" | "TRANSFER" | "OPEN_ENDED";

/** Ground-truth quality of a claim the in-fiction AI makes, authored by the case designer. */
export type AiQuality = "CORRECT" | "UNCERTAIN" | "INCORRECT";

/** Structured response to an AI claim (Section D/F). Replaces free-text-only reaction. */
export type PlayerAiAction = "ACCEPT" | "VERIFY" | "HOLD" | "REJECT";

/**
 * Full AI-flaw taxonomy (Section E). Broader than the in-game selector (see
 * AI_TRAP_TAXONOMY_OPTIONS in aiTrapTaxonomy.ts), which exposes only the
 * subset a novice can reasonably distinguish.
 */
export type AiTrapType =
  | "NONE"
  | "CAUSALITY_ERROR"
  | "INTENT_ASSUMPTION"
  | "SMALL_SAMPLE"
  | "OVERGENERALIZATION"
  | "CONFIRMATION"
  | "OVERCONFIDENCE"
  | "SYCOPHANCY"
  | "MISSING_INFORMATION"
  | "PLAUSIBLE_BUT_UNSUPPORTED";

/** Whether the new evidence in a case decisively resolves the ambiguity. */
export type EvidenceStrength = "diagnostic" | "ambiguous";

export interface Choice {
  id: string;
  label: string;
}

/** A candidate fact the player can flag as important before seeing new evidence (Section D). */
export interface InfoOption {
  id: string;
  label: string;
}

export interface FactCheckItem {
  /** A single claim drawn from the situation text that the player classifies. */
  statement: string;
  correctAnswer: "fact" | "interpretation";
}

/** Pre-authored feedback fragments picked based on observed session signals. */
export interface ReflectionPoints {
  factCorrect: string;
  factIncorrect: string;
  hypothesisConsidered: string;
  hypothesisNotConsidered: string;
  falsificationConsidered: string;
  falsificationNotConsidered: string;
  updatingEngaged: string;
  updatingNotEngaged: string;
  nextTheme: string;
}

export interface AiTrapInfo {
  /** Whether the in-fiction AI's claim in this case has a deliberate flaw. */
  present: boolean;
  trapType: AiTrapType;
  trapSeverity: "low" | "medium" | "high" | null;
  /** Same enum as AiQuality; kept separate so trap authoring doesn't require touching rubric.aiResponseGroundTruth. */
  trapGroundTruth: AiQuality | null;
  expectedDetection: string | null;
  appropriateAction: PlayerAiAction | null;
  /** Explanation shown in RESULT once the player has gone through the case. */
  explanation?: string;
}

/**
 * SPEC AMENDMENT (Section B): every case that is evaluated carries a rubric
 * defined before the case is ever played. Ability estimates are only made
 * where a rubric exists — raw logs are never treated as ability scores
 * directly (see docs/RUBRIC_DESIGN.md).
 */
export interface RubricDefinition {
  rubricVersion: string;
  targetSkill: AbilityKey;
  observableBehavior: string;
  acceptableReasoning: string;
  weakReasoning: string;
  criticalError: string;
  /** Id of the availableChoices entry that embodies criticalError, if any single choice does. */
  criticalErrorChoiceId: string | null;
  updateCondition: string;
  doNotUpdateCondition: string;
  uncertaintyCondition: string;
  /** Ground truth for the AI's claim quality, or null when the AI only asks a Socratic question. */
  aiResponseGroundTruth: AiQuality | null;
  /** Sibling TRANSFER case id this skill should generalize to (see docs/TRANSFER_TEST_DESIGN.md). */
  transferTarget: string;
  evidenceStrength: EvidenceStrength;
  /** Id of the availableChoices entry the new evidence best supports. */
  evidenceSupportsChoiceId: string;
  /** Subset of infoOptions ids that are genuinely diagnostic, vs. distractors. */
  correctInfoIds: string[];
}

export interface CaseData {
  caseId: string;
  title: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  /** MVP_LEVEL 1-5 per Section M. Levels 6+ are design-only, not implemented. */
  level: 1 | 2 | 3 | 4 | 5;
  caseType: CaseType;
  version: string;
  riskLevel: "low";
  abilityTargets: AbilityKey[];
  aiCharacter: AiCharacterKey;
  /** Section H: characters are system-assigned at levels 1-3; MVP keeps this true for all levels. */
  characterOffered: AiCharacterKey[];
  characterChoiceAvailable: boolean;
  aiTrap: AiTrapInfo;

  initialSituation: string[];
  initialQuestion: string;
  availableChoices: Choice[];
  factCheck: FactCheckItem;
  infoOptions: InfoOption[];
  confidencePrompt: string;

  aiIntervention: string;
  /** Auxiliary free-text prompt shown alongside the structured AI-response controls. */
  falsificationPrompt: string;

  newFacts: string[];

  finalQuestion: string;

  rubric: RubricDefinition;
  reflectionPoints: ReflectionPoints;
}

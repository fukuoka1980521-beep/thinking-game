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

/**
 * SEMANTICS FIX (first-case/calibration Run, Section 2): what KIND of
 * utterance the AI intervention is. This is a separate axis from
 * `AiQuality` ("is the epistemic content right?") — a QUESTION has no
 * quality to accept/reject in the first place. Mixing the two axes was the
 * bug this Run corrects (see docs/AI_CALIBRATION.md, TRANSFER-001 audit).
 *
 * - `CLAIM`: an assertion about the world that can be right or wrong.
 * - `RECOMMENDATION`: a suggested action, reserved for future cases that
 *   frame the AI's output as "you should do X" rather than "X is true."
 *   Not used by any of the 7 shipped cases yet (CASE-005 is authored as a
 *   `CLAIM`, per this Run's explicit audit decision).
 * - `QUESTION`: a Socratic prompt with nothing to accept/verify/hold/reject.
 */
export type UtteranceType = "CLAIM" | "QUESTION" | "RECOMMENDATION";

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
  /**
   * What kind of AI utterance this case's `aiIntervention` (or the claim it
   * refers back to, per case) is. Determines calibration eligibility
   * together with `aiResponseGroundTruth` — see `isCalibrationEligible` in
   * `src/engine/evaluationEngine.ts`. Required for every case, not just
   * calibration-eligible ones (Section 19 test #1).
   */
  utteranceType: UtteranceType;
  /** Ground truth for the AI's claim quality, or null when utteranceType is QUESTION. */
  aiResponseGroundTruth: AiQuality | null;
  /** Sibling TRANSFER case id this skill should generalize to (see docs/TRANSFER_TEST_DESIGN.md). */
  transferTarget: string;
  evidenceStrength: EvidenceStrength;
  /** Id of the availableChoices entry the new evidence best supports. */
  evidenceSupportsChoiceId: string;
  /** Subset of infoOptions ids that are genuinely diagnostic, vs. distractors. */
  correctInfoIds: string[];
  /**
   * Id of the availableChoices entry that represents genuine epistemic
   * humility ("I can't tell yet / I'd want more data"), if the case offers
   * one. Not every case has one — retrofitting one onto an already-shipped
   * choice set is avoided; new cases are authored with one where natural.
   */
  uncertaintyChoiceId: string | null;
}

/**
 * PERSONALIZED_DIALOGUE Run (Section 3/4/13): one authored challenge
 * fragment per AI character role, for a single `availableChoices` entry.
 * Kept separate from `RubricDefinition` because it drives displayed dialogue
 * text only — the Evaluation Engine never reads this.
 */
export interface DialogueBranch {
  detective: string;
  devil: string;
  observer: string;
  strategist: string;
}

/**
 * Optional per-case configuration for context-aware AI dialogue. When
 * absent (every case but CASE-001 this Run), `getAiInterventionMessage`
 * falls back to the static `aiIntervention` string unchanged — this is an
 * additive, opt-in mechanism, not a replacement for the existing field.
 */
export interface PersonalizedDialogueConfig {
  /** Keyed by `availableChoices[].id`. */
  branches: Record<string, DialogueBranch>;
}

export interface CaseData {
  caseId: string;
  title: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  /**
   * MVP_LEVEL 1-5 per Section M for cases on the main ladder. `0` marks a
   * case that is not part of the level ladder (TRANSFER cases, mixed in
   * naturally rather than shown as a "level"). Levels 6+ are design-only.
   */
  level: number;
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
  /** Section 3: implemented for CASE-001 only this Run. */
  personalizedDialogue?: PersonalizedDialogueConfig;
}

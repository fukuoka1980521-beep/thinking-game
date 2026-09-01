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

export interface Choice {
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
  /** Whether this case's AI intervention contains a deliberately flawed argument. */
  present: boolean;
  /** Category of flaw, e.g. "correlation-causation", "unsupported-assertion", "over-agreement". */
  flawType?: string;
  /** Explanation used in reflection copy once the player has gone through the case. */
  explanation?: string;
}

export interface CaseData {
  caseId: string;
  title: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  version: string;
  riskLevel: "low";
  abilityTargets: AbilityKey[];
  aiCharacter: AiCharacterKey;
  aiTrap: AiTrapInfo;

  initialSituation: string[];
  initialQuestion: string;
  availableChoices: Choice[];
  factCheck: FactCheckItem;
  confidencePrompt: string;

  aiIntervention: string;
  falsificationPrompt: string;

  newFacts: string[];

  finalQuestion: string;

  reflectionPoints: ReflectionPoints;
}

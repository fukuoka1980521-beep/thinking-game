import type { AbilityKey } from "./case";

export type ScreenId =
  | "CASE_INTRO"
  | "FIRST_DECISION"
  | "AI_INTERVENTION"
  | "NEW_FACT"
  | "SECOND_DECISION"
  | "REFLECTION"
  | "RESULT";

export interface FirstDecisionInput {
  choiceId: string;
  reason: string;
  confidence: number;
  factCheckAnswer: "fact" | "interpretation" | null;
  altHypothesis: string;
}

export interface InterventionInput {
  falsificationText: string;
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
  first?: FirstDecisionInput;
  intervention?: InterventionInput;
  second?: SecondDecisionInput;
  reflectionNote?: string;
}

/** Behavioral signals derived from a session, used for ability observation display. */
export interface AbilityObservations {
  observationCorrect: boolean;
  hypothesisConsidered: boolean;
  falsificationConsidered: boolean;
  updatingEngaged: boolean;
}

/** Finalized record of one completed case, stored locally only. */
export interface ThinkingLog {
  sessionId: string;
  caseId: string;
  timestamp: string;
  firstDecision: string;
  firstReason: string;
  firstConfidence: number;
  aiInterventionSeen: boolean;
  secondDecision: string;
  secondReason: string;
  secondConfidence: number;
  decisionChanged: boolean;
  reflectionNote: string;
  reflection: {
    goodPoints: string[];
    checkPoints: string[];
    nextTheme: string;
  };
  abilityObservations: AbilityObservations;
  completed: true;
}

export interface GrowthWindowStats {
  totalCases: number;
  byAbility: Record<AbilityKey, { count: number; total: number }>;
}

import type { CaseData } from "../types/case";
import type { AbilityObservations } from "../types/log";
import type { FirstDecisionInput, InterventionInput, SecondDecisionInput } from "../types/log";

export function computeAbilityObservations(
  caseData: CaseData,
  first: FirstDecisionInput,
  intervention: InterventionInput,
  second: SecondDecisionInput,
): AbilityObservations {
  const observationCorrect = first.factCheckAnswer === caseData.factCheck.correctAnswer;
  const hypothesisConsidered = first.altHypothesis.trim().length > 0;
  const falsificationConsidered = intervention.falsificationText.trim().length > 0;
  const decisionChanged = second.choiceId !== first.choiceId;
  const confidenceChanged = second.confidence !== first.confidence;
  const updatingEngaged = decisionChanged || confidenceChanged;

  return {
    observationCorrect,
    hypothesisConsidered,
    falsificationConsidered,
    updatingEngaged,
  };
}

export interface ReflectionResult {
  goodPoints: string[];
  checkPoints: string[];
  nextTheme: string;
}

/**
 * Builds RESULT-screen copy from pre-authored case text, selected by observed
 * signals. Never expresses a pass/fail verdict and never makes personality
 * claims about the player — see docs/SAFETY_PRINCIPLES.md.
 */
export function buildReflection(
  caseData: CaseData,
  observations: AbilityObservations,
): ReflectionResult {
  const rp = caseData.reflectionPoints;
  const goodPoints: string[] = [];
  const checkPoints: string[] = [];

  (observations.observationCorrect ? goodPoints : checkPoints).push(
    observations.observationCorrect ? rp.factCorrect : rp.factIncorrect,
  );
  (observations.hypothesisConsidered ? goodPoints : checkPoints).push(
    observations.hypothesisConsidered ? rp.hypothesisConsidered : rp.hypothesisNotConsidered,
  );
  (observations.falsificationConsidered ? goodPoints : checkPoints).push(
    observations.falsificationConsidered
      ? rp.falsificationConsidered
      : rp.falsificationNotConsidered,
  );
  (observations.updatingEngaged ? goodPoints : checkPoints).push(
    observations.updatingEngaged ? rp.updatingEngaged : rp.updatingNotEngaged,
  );

  if (goodPoints.length === 0) {
    goodPoints.push("最後までケースに取り組み、判断を2回行うことができました。");
  }
  if (checkPoints.length === 0) {
    checkPoints.push("特にありません。次のケースでも同じ視点を続けてみましょう。");
  }

  return { goodPoints, checkPoints, nextTheme: rp.nextTheme };
}

import type { CaseData } from "../types/case";
import type { AiMessageSource, InProgressSession, RubricResult, TrajectoryLog } from "../types/log";
import { computeAbilityObservations, isCalibrationEligible } from "./evaluationEngine";
import { appendCompletedLog, clearInProgressSession } from "../lib/storage";

/**
 * Player Action Logger (Section V). Turns a finished in-progress session
 * into the canonical TrajectoryLog (Section Q) and persists it. Does not
 * itself decide right/wrong — it packages what the Evaluation Engine
 * already computed (`rubricResult`) alongside the raw structured actions.
 */
export function finalizeTrajectory(
  caseData: CaseData,
  session: InProgressSession,
  rubricResult: RubricResult,
  /** The message actually shown on AI_INTERVENTION (Section 4/16: may differ
   * from `caseData.aiIntervention` when `personalizedDialogue` applies).
   * Defaults to the static string for callers that don't pass one. */
  shownAiMessage: string = caseData.aiIntervention,
  messageSource: AiMessageSource = "static",
): TrajectoryLog {
  if (!session.observedFact || !session.first || !session.aiAction || !session.second) {
    throw new Error("Cannot finalize an incomplete session");
  }

  const abilityObservations = computeAbilityObservations(session.first, session.second, rubricResult);

  const log: TrajectoryLog = {
    sessionId: session.sessionId,
    caseId: session.caseId,
    caseType: caseData.caseType,
    level: caseData.level,
    timestamp: new Date().toISOString(),
    factOrder: ["situation", "new_fact"],
    playRunId: session.playRunId,

    characterOffered: caseData.characterOffered,
    characterUsed: caseData.aiCharacter,
    characterChoiceAvailable: caseData.characterChoiceAvailable,

    firstDecision: {
      choiceId: session.first.choiceId,
      confidence: session.first.confidence,
      reason: session.first.reason,
      factCheckAnswer: session.observedFact.factCheckAnswer,
      infoOptionsSelected: session.first.infoOptionsSelected,
    },
    aiIntervention: {
      message: shownAiMessage,
      messageSource,
      utteranceType: caseData.rubric.utteranceType,
      calibrationEligible: isCalibrationEligible(caseData),
      playerAction: session.aiAction.playerAction,
      problemTypeSelected: session.aiAction.problemTypeSelected,
      freeText: session.aiAction.freeText,
    },
    newEvidence: caseData.newFacts,
    secondDecision: {
      choiceId: session.second.choiceId,
      confidence: session.second.confidence,
      reason: session.second.reason,
    },
    decisionChanged: session.first.choiceId !== session.second.choiceId,
    confidenceChange: session.second.confidence - session.first.confidence,
    reflectionNote: session.reflectionNote ?? "",

    rubricResult,
    experimentGroup: "CONTROL_NO_AB_TEST_V0",
    transferTarget: caseData.rubric.transferTarget,

    abilityObservations,
    completed: true,
  };

  appendCompletedLog(log);
  clearInProgressSession();
  return log;
}

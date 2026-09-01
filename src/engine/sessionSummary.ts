import type { TrajectoryLog } from "../types/log";
import { getCaseById } from "../data/cases";

/**
 * Section 7: a behavioral tally for one play run (not a lifetime stat, and
 * not an ability score — see docs/SAFETY_PRINCIPLES.md). Reads only
 * structured fields already on the trajectory, plus a live lookup of the
 * static case data to check `rubric.uncertaintyChoiceId` — never free text.
 */
export function computeSessionSummary(logs: TrajectoryLog[], playRunId: string) {
  const runLogs = logs.filter((l) => l.playRunId === playRunId);

  let reconsidered = 0;
  let maintained = 0;
  let verifiedAi = 0;
  let rejectedAi = 0;
  let choseUncertain = 0;

  for (const log of runLogs) {
    if (log.decisionChanged) reconsidered += 1;
    else maintained += 1;

    if (log.aiIntervention.playerAction === "VERIFY") verifiedAi += 1;
    if (log.aiIntervention.playerAction === "REJECT") rejectedAi += 1;

    const caseData = getCaseById(log.caseId);
    const uncertaintyChoiceId = caseData?.rubric.uncertaintyChoiceId ?? null;
    if (
      uncertaintyChoiceId !== null &&
      (log.firstDecision.choiceId === uncertaintyChoiceId ||
        log.secondDecision.choiceId === uncertaintyChoiceId)
    ) {
      choseUncertain += 1;
    }
  }

  return {
    totalCases: runLogs.length,
    reconsidered,
    maintained,
    verifiedAi,
    rejectedAi,
    choseUncertain,
  };
}

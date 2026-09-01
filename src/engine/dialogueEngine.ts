import type { CaseData } from "../types/case";

/**
 * Dialogue Engine (Section C/V). In this MVP, "dialogue" is entirely the
 * pre-authored CASE DATA — there is no generative model. This module exists
 * so the architecture boundary is explicit: nothing here ever produces a
 * score. If a future run introduces an LLM for dialogue, it plugs in here
 * without the Evaluation Engine needing to change.
 */

export function getAiInterventionMessage(caseData: CaseData): string {
  return caseData.aiIntervention;
}

export function getNewEvidence(caseData: CaseData): string[] {
  return caseData.newFacts;
}

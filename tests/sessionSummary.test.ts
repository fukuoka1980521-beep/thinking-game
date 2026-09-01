import { describe, expect, it } from "vitest";
import { computeSessionSummary } from "../src/engine/sessionSummary";
import { CASES } from "../src/data/cases";
import type { TrajectoryLog } from "../src/types/log";

const case001 = CASES[0]; // uncertaintyChoiceId: "e" (added this Run, Section 11)
const case002 = CASES.find((c) => c.caseId === "CASE-002")!; // no uncertaintyChoiceId
const case005 = CASES.find((c) => c.caseId === "CASE-005")!; // uncertaintyChoiceId: "d"

function makeLog(overrides: Partial<TrajectoryLog> = {}): TrajectoryLog {
  return {
    sessionId: "sess-1",
    caseId: case001.caseId,
    caseType: "TRAINING",
    level: 1,
    timestamp: new Date().toISOString(),
    factOrder: ["situation", "new_fact"],
    playRunId: "run-1",
    characterOffered: ["DETECTIVE"],
    characterUsed: "DETECTIVE",
    characterChoiceAvailable: false,
    firstDecision: { choiceId: "a", confidence: 50, reason: "", factCheckAnswer: "fact", infoOptionsSelected: [] },
    aiIntervention: {
      message: "m",
      utteranceType: "QUESTION",
      calibrationEligible: false,
      playerAction: null,
      problemTypeSelected: "NONE",
      freeText: "",
    },
    newEvidence: ["fact"],
    secondDecision: { choiceId: "a", confidence: 50, reason: "" },
    decisionChanged: false,
    confidenceChange: 0,
    reflectionNote: "",
    rubricResult: {
      rubricVersion: "1.0.0",
      observationCorrect: true,
      criticalErrorMade: false,
      infoOptionsConsidered: 0,
      infoOptionsMatchedGroundTruth: 0,
      updateAppropriateness: "appropriate_keep",
      aiCalibration: "not_applicable",
      trapDetection: { applicable: false, groundTruthType: "NONE", playerSelectedType: null, correctDetection: false },
    },
    experimentGroup: "CONTROL_NO_AB_TEST_V0",
    transferTarget: "",
    abilityObservations: {
      observationCorrect: true,
      hypothesisConsidered: false,
      falsificationConsidered: false,
      updatingEngaged: false,
    },
    completed: true,
    ...overrides,
  };
}

describe("computeSessionSummary", () => {
  it("only tallies logs belonging to the given play run", () => {
    const logs = [
      makeLog({ playRunId: "run-1", decisionChanged: true }),
      makeLog({ playRunId: "run-2", decisionChanged: true }),
    ];
    const summary = computeSessionSummary(logs, "run-1");
    expect(summary.totalCases).toBe(1);
  });

  it("splits reconsidered vs. maintained by decisionChanged", () => {
    const logs = [
      makeLog({ decisionChanged: true }),
      makeLog({ decisionChanged: false }),
      makeLog({ decisionChanged: false }),
    ];
    const summary = computeSessionSummary(logs, "run-1");
    expect(summary.reconsidered).toBe(1);
    expect(summary.maintained).toBe(2);
  });

  it("counts VERIFY and REJECT AI actions separately", () => {
    const eligibleAi = (playerAction: "VERIFY" | "REJECT" | "ACCEPT") => ({
      message: "m",
      utteranceType: "CLAIM" as const,
      calibrationEligible: true,
      playerAction,
      problemTypeSelected: "NONE" as const,
      freeText: "",
    });
    const logs = [
      makeLog({ aiIntervention: eligibleAi("VERIFY") }),
      makeLog({ aiIntervention: eligibleAi("REJECT") }),
      makeLog({ aiIntervention: eligibleAi("ACCEPT") }),
    ];
    const summary = computeSessionSummary(logs, "run-1");
    expect(summary.verifiedAi).toBe(1);
    expect(summary.rejectedAi).toBe(1);
  });

  it("counts a case as 'chose uncertain' only when the case defines an uncertaintyChoiceId and it was picked", () => {
    const logs = [
      // case002 has no uncertaintyChoiceId — picking "d" should not count.
      makeLog({ caseId: case002.caseId, firstDecision: { choiceId: "d", confidence: 50, reason: "", factCheckAnswer: "fact", infoOptionsSelected: [] } }),
      // case005's uncertaintyChoiceId is "d" — picking it should count.
      makeLog({ caseId: case005.caseId, secondDecision: { choiceId: "d", confidence: 50, reason: "" } }),
    ];
    const summary = computeSessionSummary(logs, "run-1");
    expect(summary.choseUncertain).toBe(1);
  });

  it("counts CASE-001's new 'not yet decidable' choice (e) as choseUncertain (Section 11/19 test #6)", () => {
    const logs = [
      makeLog({ caseId: case001.caseId, firstDecision: { choiceId: "e", confidence: 50, reason: "", factCheckAnswer: "fact", infoOptionsSelected: [] } }),
    ];
    const summary = computeSessionSummary(logs, "run-1");
    expect(summary.choseUncertain).toBe(1);
  });
});

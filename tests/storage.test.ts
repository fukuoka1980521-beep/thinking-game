import { describe, expect, it } from "vitest";
import {
  appendCompletedLog,
  clearInProgressSession,
  loadCompletedLogs,
  loadInProgressSession,
  saveInProgressSession,
} from "../src/lib/storage";
import type { InProgressSession, TrajectoryLog } from "../src/types/log";

function makeSession(caseId: string): InProgressSession {
  return {
    sessionId: `sess-${caseId}`,
    caseId,
    screen: "FIRST_DECISION",
    startedAt: new Date().toISOString(),
  };
}

function makeLog(caseId: string): TrajectoryLog {
  return {
    sessionId: `sess-${caseId}`,
    caseId,
    caseType: "TRAINING",
    level: 1,
    timestamp: new Date().toISOString(),
    factOrder: ["situation", "new_fact"],
    characterOffered: ["DETECTIVE"],
    characterUsed: "DETECTIVE",
    characterChoiceAvailable: false,
    firstDecision: { choiceId: "a", confidence: 50, reason: "reason", factCheckAnswer: "fact", infoOptionsSelected: [] },
    aiIntervention: { message: "m", playerAction: null, problemTypeSelected: "NONE", freeText: "" },
    newEvidence: ["fact"],
    secondDecision: { choiceId: "b", confidence: 60, reason: "reason2" },
    decisionChanged: true,
    confidenceChange: 10,
    reflectionNote: "",
    rubricResult: {
      rubricVersion: "1.0.0",
      observationCorrect: true,
      criticalErrorMade: false,
      infoOptionsConsidered: 0,
      infoOptionsMatchedGroundTruth: 0,
      updateAppropriateness: "appropriate_update",
      aiCalibration: "not_applicable",
      trapDetection: { applicable: false, groundTruthType: "NONE", playerSelectedType: null, correctDetection: false },
    },
    experimentGroup: "CONTROL_NO_AB_TEST_V0",
    transferTarget: "",
    abilityObservations: {
      observationCorrect: true,
      hypothesisConsidered: false,
      falsificationConsidered: true,
      updatingEngaged: true,
    },
    completed: true,
  };
}

describe("storage", () => {
  it("returns null when nothing is saved", () => {
    expect(loadInProgressSession()).toBeNull();
  });

  it("round-trips an in-progress session", () => {
    const session = makeSession("CASE-001");
    saveInProgressSession(session);
    expect(loadInProgressSession()).toEqual(session);
  });

  it("clears the in-progress session", () => {
    saveInProgressSession(makeSession("CASE-001"));
    clearInProgressSession();
    expect(loadInProgressSession()).toBeNull();
  });

  it("does not mix data between cases: starting CASE-002 overwrites CASE-001's in-progress slot", () => {
    saveInProgressSession(makeSession("CASE-001"));
    saveInProgressSession(makeSession("CASE-002"));
    const loaded = loadInProgressSession();
    expect(loaded?.caseId).toBe("CASE-002");
  });

  it("appends completed logs without clobbering earlier ones", () => {
    appendCompletedLog(makeLog("CASE-001"));
    appendCompletedLog(makeLog("CASE-002"));
    const logs = loadCompletedLogs();
    expect(logs).toHaveLength(2);
    expect(logs.map((l) => l.caseId)).toEqual(["CASE-001", "CASE-002"]);
  });

  it("returns an empty array, not a crash, on corrupted completed-log storage", () => {
    localStorage.setItem("thinking-game:completed-logs:v2", "not json");
    expect(loadCompletedLogs()).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import {
  appendCompletedLog,
  clearInProgressSession,
  loadCompletedLogs,
  loadInProgressSession,
  saveInProgressSession,
} from "../src/lib/storage";
import type { InProgressSession, ThinkingLog } from "../src/types/log";

function makeSession(caseId: string): InProgressSession {
  return {
    sessionId: `sess-${caseId}`,
    caseId,
    screen: "FIRST_DECISION",
    startedAt: new Date().toISOString(),
  };
}

function makeLog(caseId: string): ThinkingLog {
  return {
    sessionId: `sess-${caseId}`,
    caseId,
    timestamp: new Date().toISOString(),
    firstDecision: "a",
    firstReason: "reason",
    firstConfidence: 50,
    aiInterventionSeen: true,
    secondDecision: "b",
    secondReason: "reason2",
    secondConfidence: 60,
    decisionChanged: true,
    reflectionNote: "",
    reflection: { goodPoints: ["good"], checkPoints: ["check"], nextTheme: "next" },
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
    localStorage.setItem("thinking-game:completed-logs:v1", "not json");
    expect(loadCompletedLogs()).toEqual([]);
  });
});

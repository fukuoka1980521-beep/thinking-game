import { describe, expect, it } from "vitest";
import { computeGrowthStats, computeRecentGrowthStats } from "../src/lib/growth";
import type { ThinkingLog } from "../src/types/log";

function makeLog(
  timestamp: string,
  observations: Partial<ThinkingLog["abilityObservations"]> = {},
): ThinkingLog {
  return {
    sessionId: `sess-${timestamp}`,
    caseId: "CASE-001",
    timestamp,
    firstDecision: "a",
    firstReason: "r",
    firstConfidence: 50,
    aiInterventionSeen: true,
    secondDecision: "a",
    secondReason: "r2",
    secondConfidence: 50,
    decisionChanged: false,
    reflectionNote: "",
    reflection: { goodPoints: [], checkPoints: [], nextTheme: "" },
    abilityObservations: {
      observationCorrect: false,
      hypothesisConsidered: false,
      falsificationConsidered: false,
      updatingEngaged: false,
      ...observations,
    },
    completed: true,
  };
}

describe("growth aggregation", () => {
  it("returns all-zero totals for no logs", () => {
    const stats = computeGrowthStats([]);
    expect(stats.totalCases).toBe(0);
    expect(stats.byAbility.OBSERVATION).toEqual({ count: 0, total: 0 });
  });

  it("counts each ability signal independently across all logs", () => {
    const logs = [
      makeLog("2026-01-01T00:00:00Z", { observationCorrect: true }),
      makeLog("2026-01-02T00:00:00Z", { hypothesisConsidered: true }),
      makeLog("2026-01-03T00:00:00Z", { falsificationConsidered: true, observationCorrect: true }),
    ];
    const stats = computeGrowthStats(logs);
    expect(stats.totalCases).toBe(3);
    expect(stats.byAbility.OBSERVATION).toEqual({ count: 2, total: 3 });
    expect(stats.byAbility.HYPOTHESIS).toEqual({ count: 1, total: 3 });
    expect(stats.byAbility.FALSIFICATION).toEqual({ count: 1, total: 3 });
    expect(stats.byAbility.UPDATING).toEqual({ count: 0, total: 3 });
  });

  it("restricts the recent window to the most recent 5 by timestamp, regardless of input order", () => {
    const logs = Array.from({ length: 7 }, (_, i) =>
      makeLog(`2026-01-0${i + 1}T00:00:00Z`, { observationCorrect: i >= 5 }),
    ).reverse();

    const recent = computeRecentGrowthStats(logs, 5);
    expect(recent.totalCases).toBe(5);
    // Only the last 2 of the 7 (i=5,6) have observationCorrect true.
    expect(recent.byAbility.OBSERVATION.count).toBe(2);
  });
});

import { describe, expect, it } from "vitest";
import {
  computeAiActionDistribution,
  computeGrowthStats,
  computeRecentGrowthStats,
} from "../src/engine/growthAggregator";
import type { TrajectoryLog } from "../src/types/log";
import type { CaseType, PlayerAiAction } from "../src/types/case";

function makeLog(
  timestamp: string,
  overrides: {
    observations?: Partial<TrajectoryLog["abilityObservations"]>;
    caseType?: CaseType;
    playerAction?: PlayerAiAction | null;
  } = {},
): TrajectoryLog {
  return {
    sessionId: `sess-${timestamp}`,
    caseId: "CASE-001",
    caseType: overrides.caseType ?? "TRAINING",
    level: 1,
    timestamp,
    factOrder: ["situation", "new_fact"],
    playRunId: "run-test",
    characterOffered: ["DETECTIVE"],
    characterUsed: "DETECTIVE",
    characterChoiceAvailable: false,
    firstDecision: { choiceId: "a", confidence: 50, reason: "", factCheckAnswer: "fact", infoOptionsSelected: [] },
    aiIntervention: {
      message: "m",
      playerAction: overrides.playerAction ?? null,
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
      observationCorrect: false,
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
      observationCorrect: false,
      hypothesisConsidered: false,
      falsificationConsidered: false,
      updatingEngaged: false,
      ...overrides.observations,
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
      makeLog("2026-01-01T00:00:00Z", { observations: { observationCorrect: true } }),
      makeLog("2026-01-02T00:00:00Z", { observations: { hypothesisConsidered: true } }),
      makeLog("2026-01-03T00:00:00Z", {
        observations: { falsificationConsidered: true, observationCorrect: true },
      }),
    ];
    const stats = computeGrowthStats(logs);
    expect(stats.totalCases).toBe(3);
    expect(stats.byAbility.OBSERVATION).toEqual({ count: 2, total: 3 });
    expect(stats.byAbility.HYPOTHESIS).toEqual({ count: 1, total: 3 });
    expect(stats.byAbility.FALSIFICATION).toEqual({ count: 1, total: 3 });
    expect(stats.byAbility.UPDATING).toEqual({ count: 0, total: 3 });
  });

  it("restricts the recent window to the most recent N by timestamp, regardless of input order", () => {
    const logs = Array.from({ length: 12 }, (_, i) =>
      makeLog(`2026-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`, {
        observations: { observationCorrect: i >= 10 },
      }),
    ).reverse();

    const recent = computeRecentGrowthStats(logs, 10);
    expect(recent.totalCases).toBe(10);
    // Only the last 2 of the 12 (i=10,11) have observationCorrect true.
    expect(recent.byAbility.OBSERVATION.count).toBe(2);
  });
});

describe("TRANSFER isolation (Section L)", () => {
  it("excludes TRANSFER-type logs from the regular growth stats", () => {
    const logs = [
      makeLog("2026-01-01T00:00:00Z", { caseType: "TRAINING", observations: { observationCorrect: true } }),
      makeLog("2026-01-02T00:00:00Z", { caseType: "TRANSFER", observations: { observationCorrect: false } }),
    ];
    const stats = computeGrowthStats(logs);
    expect(stats.totalCases).toBe(1);
    expect(stats.byAbility.OBSERVATION).toEqual({ count: 1, total: 1 });
  });
});

describe("AI action distribution", () => {
  it("counts any case with a recorded player action, independent of caseType", () => {
    const logs = [
      makeLog("2026-01-01T00:00:00Z", { caseType: "TRAINING", playerAction: null }),
      makeLog("2026-01-02T00:00:00Z", { caseType: "AI_CALIBRATION", playerAction: "ACCEPT" }),
      makeLog("2026-01-03T00:00:00Z", { caseType: "AI_CALIBRATION", playerAction: "VERIFY" }),
      // TRANSFER cases can also carry an evaluable AI claim (Section 2) — must still count.
      makeLog("2026-01-04T00:00:00Z", { caseType: "TRANSFER", playerAction: "VERIFY" }),
    ];
    const dist = computeAiActionDistribution(logs);
    expect(dist.totalCases).toBe(3);
    expect(dist.counts).toEqual({ ACCEPT: 1, VERIFY: 2, HOLD: 0, REJECT: 0 });
  });

  it("returns zero totals when no case with an AI action has been played", () => {
    const dist = computeAiActionDistribution([makeLog("2026-01-01T00:00:00Z")]);
    expect(dist.totalCases).toBe(0);
    expect(dist.counts).toEqual({ ACCEPT: 0, VERIFY: 0, HOLD: 0, REJECT: 0 });
  });
});

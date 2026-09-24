/**
 * Behavior tests for the V27-normative ending vector. Each `it` cites the
 * exact spec passage it pins down, matching the convention established by
 * `relationshipReducer.test.ts`.
 */
import { describe, expect, it } from "vitest";
import {
  applyEndingTurn,
  COMMITTING_ACTION_TYPES,
  createInitialCaseEndingState,
  deriveEndingBoundary,
  deriveEndingVector,
  derivePersonalTrack,
  deriveShowOutcome,
  NPC_DEPENDENT_COMMITTING_ACTION_TYPES,
  type CaseEndingState,
} from "./ending";
import { createWorldClock, spendTime } from "./timeEconomy";

describe("createInitialCaseEndingState", () => {
  it("starts with no commitment, no established boundary, no opened personal track (V27 §2.1/§3.1/§4.2)", () => {
    const state = createInitialCaseEndingState();
    expect(state.taskLedger.commitment).toBeNull();
    expect(state.boundaryEstablished).toBe(false);
    expect(state.establishedAtTurn).toBeNull();
    expect(state.personalTrackOpened).toBe(false);
  });
});

describe("applyEndingTurn — task ledger (V27 §2.2)", () => {
  it("a non-committing action leaves the ledger unchanged", () => {
    const state = applyEndingTurn(createInitialCaseEndingState(), {
      turnRef: "t1",
      action: "ASK_FACT",
      boundaryMode: "NOT_RELEVANT",
    });
    expect(state.taskLedger.commitment).toBeNull();
  });

  it("a committing action sets the commitment", () => {
    const state = applyEndingTurn(createInitialCaseEndingState(), {
      turnRef: "t1",
      action: "CUT_SCENE",
      boundaryMode: "NOT_RELEVANT",
    });
    expect(state.taskLedger.commitment).toEqual({ action: "CUT_SCENE", boundaryMode: "NOT_RELEVANT", turnRef: "t1" });
  });

  it("a later commitment replaces an earlier one — final operative plan wins", () => {
    let state = createInitialCaseEndingState();
    state = applyEndingTurn(state, { turnRef: "t1", action: "FORCE_UNCONFIRMED_PLAN", boundaryMode: "CROSS_WITHOUT_PERMISSION" });
    expect(state.taskLedger.commitment?.action).toBe("FORCE_UNCONFIRMED_PLAN");
    state = applyEndingTurn(state, { turnRef: "t2", action: "CUT_SCENE", boundaryMode: "NOT_RELEVANT" });
    expect(state.taskLedger.commitment).toEqual({ action: "CUT_SCENE", boundaryMode: "NOT_RELEVANT", turnRef: "t2" });
  });

  it("exactly the 6 V27 §2.2 action types are committing; PROPOSE_REWRITE/ASSIGN_REWRITE/REASSIGN_WORK are not", () => {
    expect(COMMITTING_ACTION_TYPES.size).toBe(6);
    for (const action of ["COMMIT_PLAN", "CUT_SCENE", "USE_UNDERSTUDY", "CHANGE_STAGING", "ACCEPT_SHORTER_SCENE", "FORCE_UNCONFIRMED_PLAN"] as const) {
      expect(COMMITTING_ACTION_TYPES.has(action)).toBe(true);
    }
    for (const action of ["PROPOSE_REWRITE", "ASSIGN_REWRITE", "REASSIGN_WORK"] as const) {
      expect(COMMITTING_ACTION_TYPES.has(action)).toBe(false);
    }
  });
});

describe("applyEndingTurn — boundary establishment (V27 §3.1)", () => {
  it("NOT_RELEVANT and UNKNOWN never establish the boundary", () => {
    let state = createInitialCaseEndingState();
    state = applyEndingTurn(state, { turnRef: "t1", action: "OBSERVE", boundaryMode: "NOT_RELEVANT" });
    state = applyEndingTurn(state, { turnRef: "t2", action: "OTHER", boundaryMode: "UNKNOWN" });
    expect(state.boundaryEstablished).toBe(false);
    expect(state.establishedAtTurn).toBeNull();
  });

  it.each(["DISCOVER", "AVOID", "SEEK_PERMISSION", "RECONSIDER", "CROSS_WITHOUT_PERMISSION"] as const)(
    "%s establishes the boundary and records the turn",
    (mode) => {
      const state = applyEndingTurn(createInitialCaseEndingState(), { turnRef: "t1", action: "ASK_BOUNDARY", boundaryMode: mode });
      expect(state.boundaryEstablished).toBe(true);
      expect(state.establishedAtTurn).toBe("t1");
    },
  );

  it("establishment is first-only — a later establishing turn does not move establishedAtTurn", () => {
    let state = createInitialCaseEndingState();
    state = applyEndingTurn(state, { turnRef: "t1", action: "ASK_BOUNDARY", boundaryMode: "DISCOVER" });
    state = applyEndingTurn(state, { turnRef: "t2", action: "PROPOSE_REWRITE", boundaryMode: "SEEK_PERMISSION" });
    expect(state.establishedAtTurn).toBe("t1");
  });
});

describe("applyEndingTurn — personal track (V27 §4.2)", () => {
  it("defaults to not opened and stays not opened absent a signal", () => {
    const state = applyEndingTurn(createInitialCaseEndingState(), { turnRef: "t1", action: "ASK_FACT", boundaryMode: "NOT_RELEVANT" });
    expect(state.personalTrackOpened).toBe(false);
  });

  it("an explicit OPENED signal opens the track", () => {
    const state = applyEndingTurn(createInitialCaseEndingState(), {
      turnRef: "t1",
      action: "ASK_FACT",
      boundaryMode: "NOT_RELEVANT",
      personalTrackSignal: "OPENED",
    });
    expect(state.personalTrackOpened).toBe(true);
  });

  it("is monotonic — stays opened once opened even without a later signal", () => {
    let state = createInitialCaseEndingState();
    state = applyEndingTurn(state, { turnRef: "t1", action: "ASK_FACT", boundaryMode: "NOT_RELEVANT", personalTrackSignal: "OPENED" });
    state = applyEndingTurn(state, { turnRef: "t2", action: "OBSERVE", boundaryMode: "NOT_RELEVANT" });
    expect(state.personalTrackOpened).toBe(true);
  });
});

describe("deriveShowOutcome (V27 §2.3)", () => {
  it("no commitment -> BREAKDOWN regardless of relationship states", () => {
    expect(deriveShowOutcome({ commitment: null }, [])).toBe("BREAKDOWN");
    expect(deriveShowOutcome({ commitment: null }, ["OPEN"])).toBe("BREAKDOWN");
  });

  it("NPC-independent commitment (CUT_SCENE) proceeds regardless of relationship state, including WITHDRAWN", () => {
    const ledger = { commitment: { action: "CUT_SCENE" as const, boundaryMode: "NOT_RELEVANT" as const, turnRef: "t1" } };
    expect(deriveShowOutcome(ledger, [])).toBe("PROCEEDS");
    expect(deriveShowOutcome(ledger, ["WITHDRAWN"])).toBe("PROCEEDS");
  });

  it("NPC-dependent commitment (COMMIT_PLAN) proceeds while no required NPC is WITHDRAWN", () => {
    const ledger = { commitment: { action: "COMMIT_PLAN" as const, boundaryMode: "SEEK_PERMISSION" as const, turnRef: "t1" } };
    expect(deriveShowOutcome(ledger, ["OPEN", "NEUTRAL"])).toBe("PROCEEDS");
  });

  it("NPC-dependent commitment breaks down if any required NPC is WITHDRAWN (V4 §10 Branch-E / §5 BREAKDOWN)", () => {
    const ledger = { commitment: { action: "COMMIT_PLAN" as const, boundaryMode: "SEEK_PERMISSION" as const, turnRef: "t1" } };
    expect(deriveShowOutcome(ledger, ["OPEN", "WITHDRAWN"])).toBe("BREAKDOWN");
  });

  it("FORCE_UNCONFIRMED_PLAN is NPC-dependent and also breaks down under a required WITHDRAWN state", () => {
    const ledger = { commitment: { action: "FORCE_UNCONFIRMED_PLAN" as const, boundaryMode: "CROSS_WITHOUT_PERMISSION" as const, turnRef: "t1" } };
    expect(deriveShowOutcome(ledger, ["WITHDRAWN"])).toBe("BREAKDOWN");
  });

  it("exactly COMMIT_PLAN and FORCE_UNCONFIRMED_PLAN are NPC-dependent", () => {
    expect(NPC_DEPENDENT_COMMITTING_ACTION_TYPES.size).toBe(2);
    expect(NPC_DEPENDENT_COMMITTING_ACTION_TYPES.has("COMMIT_PLAN")).toBe(true);
    expect(NPC_DEPENDENT_COMMITTING_ACTION_TYPES.has("FORCE_UNCONFIRMED_PLAN")).toBe(true);
    expect(NPC_DEPENDENT_COMMITTING_ACTION_TYPES.has("CUT_SCENE")).toBe(false);
  });
});

describe("deriveEndingBoundary (V27 §3.2)", () => {
  it("never established -> UNKNOWN, even with a commitment", () => {
    const state: Pick<CaseEndingState, "boundaryEstablished" | "taskLedger"> = {
      boundaryEstablished: false,
      taskLedger: { commitment: { action: "CUT_SCENE", boundaryMode: "NOT_RELEVANT", turnRef: "t1" } },
    };
    expect(deriveEndingBoundary(state)).toBe("UNKNOWN");
  });

  it("established, no commitment yet -> STATED", () => {
    expect(deriveEndingBoundary({ boundaryEstablished: true, taskLedger: { commitment: null } })).toBe("STATED");
  });

  it("established, final commitment CROSS_WITHOUT_PERMISSION -> OVERRIDDEN", () => {
    const state = {
      boundaryEstablished: true,
      taskLedger: { commitment: { action: "FORCE_UNCONFIRMED_PLAN" as const, boundaryMode: "CROSS_WITHOUT_PERMISSION" as const, turnRef: "t1" } },
    };
    expect(deriveEndingBoundary(state)).toBe("OVERRIDDEN");
  });

  it("established, final commitment SEEK_PERMISSION -> RESPECTED", () => {
    const state = {
      boundaryEstablished: true,
      taskLedger: { commitment: { action: "COMMIT_PLAN" as const, boundaryMode: "SEEK_PERMISSION" as const, turnRef: "t1" } },
    };
    expect(deriveEndingBoundary(state)).toBe("RESPECTED");
  });

  it("ambiguity default: UNKNOWN boundaryMode at commit time -> RESPECTED, not OVERRIDDEN (V27 §2.4/§3.2, V13 §3 conservative default)", () => {
    const state = {
      boundaryEstablished: true,
      taskLedger: { commitment: { action: "COMMIT_PLAN" as const, boundaryMode: "UNKNOWN" as const, turnRef: "t1" } },
    };
    expect(deriveEndingBoundary(state)).toBe("RESPECTED");
  });

  it("recovery: an earlier CROSS_WITHOUT_PERMISSION commitment does not leave the case OVERRIDDEN if a later commitment replaces it (V4 §7 recovery mirrored at the boundary axis)", () => {
    let state = createInitialCaseEndingState();
    state = applyEndingTurn(state, { turnRef: "t1", action: "ASK_BOUNDARY", boundaryMode: "DISCOVER" });
    state = applyEndingTurn(state, { turnRef: "t2", action: "FORCE_UNCONFIRMED_PLAN", boundaryMode: "CROSS_WITHOUT_PERMISSION" });
    expect(deriveEndingBoundary(state)).toBe("OVERRIDDEN");
    state = applyEndingTurn(state, { turnRef: "t3", action: "APOLOGIZE_AND_REPAIR", boundaryMode: "NOT_RELEVANT" });
    state = applyEndingTurn(state, { turnRef: "t4", action: "COMMIT_PLAN", boundaryMode: "SEEK_PERMISSION" });
    expect(deriveEndingBoundary(state)).toBe("RESPECTED");
  });
});

describe("derivePersonalTrack (V27 §4.2)", () => {
  it("reports NOT_OPENED / OPENED from the accumulated flag", () => {
    expect(derivePersonalTrack({ personalTrackOpened: false })).toBe("NOT_OPENED");
    expect(derivePersonalTrack({ personalTrackOpened: true })).toBe("OPENED");
  });
});

describe("structural independence (V27 §4.3/§5)", () => {
  it("toggling personalTrackOpened alone never changes show or boundary for the same ledger/establishment", () => {
    const base = { boundaryEstablished: true, taskLedger: { commitment: { action: "COMMIT_PLAN" as const, boundaryMode: "SEEK_PERMISSION" as const, turnRef: "t1" } } };
    const withTrackClosed = { ...base, personalTrackOpened: false };
    const withTrackOpened = { ...base, personalTrackOpened: true };
    expect(deriveEndingBoundary(withTrackClosed)).toBe(deriveEndingBoundary(withTrackOpened));
    expect(deriveShowOutcome(withTrackClosed.taskLedger, ["OPEN"])).toBe(deriveShowOutcome(withTrackOpened.taskLedger, ["OPEN"]));
  });
});

describe("deriveEndingVector (V27 §1)", () => {
  it("combines all five fields without aggregation", () => {
    let state = createInitialCaseEndingState();
    state = applyEndingTurn(state, { turnRef: "t1", action: "ASK_BOUNDARY", boundaryMode: "DISCOVER" });
    state = applyEndingTurn(state, { turnRef: "t2", action: "CUT_SCENE", boundaryMode: "NOT_RELEVANT", personalTrackSignal: "OPENED" });

    let clock = createWorldClock(50);
    clock = spendTime(clock, 31);

    const vector = deriveEndingVector({
      state,
      requiredRelationshipStates: [],
      trust: "NEUTRAL",
      clock,
    });

    expect(vector).toEqual({
      show: "PROCEEDS",
      boundary: "RESPECTED",
      trust: "NEUTRAL",
      timeLeft: 19,
      personalTrack: "OPENED",
    });
  });

  it("BREAKDOWN example matching V4 §10's causal chain: SEVERE_RUPTURE -> WITHDRAWN voids an NPC-dependent commitment", () => {
    let state = createInitialCaseEndingState();
    state = applyEndingTurn(state, { turnRef: "t1", action: "ASK_BOUNDARY", boundaryMode: "DISCOVER" });
    state = applyEndingTurn(state, { turnRef: "t2", action: "COMMIT_PLAN", boundaryMode: "SEEK_PERMISSION" });

    const clock = createWorldClock(50);
    const vector = deriveEndingVector({
      state,
      requiredRelationshipStates: ["WITHDRAWN"],
      trust: "WITHDRAWN",
      clock,
    });

    expect(vector.show).toBe("BREAKDOWN");
    // Boundary is independent of the WITHDRAWN-caused breakdown — the committed plan itself still respected the boundary.
    expect(vector.boundary).toBe("RESPECTED");
  });
});

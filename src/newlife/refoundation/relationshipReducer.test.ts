/**
 * Behavior tests for the V14/V16/V18/V20/V22/V24-normative relationship
 * reducer. Each `it` cites the exact spec passage it pins down so a future
 * patch that changes behavior has to consciously edit the matching test,
 * not just happen to keep it green.
 */
import { describe, expect, it } from "vitest";
import {
  applyRelationalTurn,
  completeCorrectiveAction,
  createInitialRelationshipRecord,
} from "./relationshipReducer";
import type { NpcRelationshipRecord } from "./types";

describe("createInitialRelationshipRecord", () => {
  it("starts OPEN with an empty, closed-window history (V14 §1)", () => {
    const record = createInitialRelationshipRecord();
    expect(record.relationshipState).toBe("OPEN");
    expect(record.repairWindow).toEqual({ status: "CLOSED" });
    expect(record.causalEventHistory).toEqual([]);
  });
});

describe("applyRelationalTurn — SEVERE_RUPTURE/STRAIN transition tables (V14 §3)", () => {
  it("STRAIN: OPEN -> NEUTRAL -> GUARDED -> GUARDED (stays)", () => {
    let record = createInitialRelationshipRecord();
    record = applyRelationalTurn(record, { turnRef: "t1", events: ["DISMISSES_CONCERN"], boundaryMode: "NOT_RELEVANT" });
    expect(record.relationshipState).toBe("NEUTRAL");
    record = applyRelationalTurn(record, { turnRef: "t2", events: ["DISMISSES_CONCERN"], boundaryMode: "NOT_RELEVANT" });
    expect(record.relationshipState).toBe("GUARDED");
    record = applyRelationalTurn(record, { turnRef: "t3", events: ["DISMISSES_CONCERN"], boundaryMode: "NOT_RELEVANT" });
    expect(record.relationshipState).toBe("GUARDED");
  });

  it("SEVERE_RUPTURE: OPEN -> GUARDED -> WITHDRAWN -> WITHDRAWN (terminal, V14 §1)", () => {
    let record = createInitialRelationshipRecord();
    record = applyRelationalTurn(record, {
      turnRef: "t1",
      events: ["PUBLIC_SHAMING", "PERSONAL_INSULT"],
      boundaryMode: "NOT_RELEVANT",
    });
    expect(record.relationshipState).toBe("GUARDED");
    record = applyRelationalTurn(record, {
      turnRef: "t2",
      events: ["PUBLIC_SHAMING", "PERSONAL_INSULT"],
      boundaryMode: "NOT_RELEVANT",
    });
    expect(record.relationshipState).toBe("WITHDRAWN");
    record = applyRelationalTurn(record, { turnRef: "t3", events: ["KEEPS_PROMISE"], boundaryMode: "NOT_RELEVANT" });
    expect(record.relationshipState).toBe("WITHDRAWN");
  });

  it("combo events log as SEVERE_RUPTURE and produce exactly one transition, not two stacked STRAINs (V14 §2)", () => {
    const record = applyRelationalTurn(createInitialRelationshipRecord(), {
      turnRef: "t1",
      events: ["PUBLIC_SHAMING", "PERSONAL_INSULT"],
      boundaryMode: "NOT_RELEVANT",
    });
    expect(record.relationshipState).toBe("GUARDED"); // one SEVERE_RUPTURE move, not two STRAIN moves (would be GUARDED too here, see next test for the distinguishing case)
    expect(record.causalEventHistory).toHaveLength(2);
    expect(record.causalEventHistory.every((e) => e.eventClass === "SEVERE_RUPTURE")).toBe(true);
  });

  it("PUBLIC_SHAMING + DISMISSES_CONCERN is STRAIN, not double strain (V14 §2 explicit counter-example)", () => {
    const record = applyRelationalTurn(createInitialRelationshipRecord(), {
      turnRef: "t1",
      events: ["PUBLIC_SHAMING", "DISMISSES_CONCERN"],
      boundaryMode: "NOT_RELEVANT",
    });
    expect(record.relationshipState).toBe("NEUTRAL"); // OPEN -STRAIN-> NEUTRAL, a single step
    expect(record.causalEventHistory.every((e) => e.eventClass === "STRAIN")).toBe(true);
  });
});

describe("applyRelationalTurn — REPAIR (V14 §3/§4, V16 §6.5)", () => {
  function guardedNpcWithOpenStrain(): NpcRelationshipRecord {
    let record = createInitialRelationshipRecord();
    record = applyRelationalTurn(record, { turnRef: "s1", events: ["DISMISSES_CONCERN"], boundaryMode: "NOT_RELEVANT" }); // OPEN->NEUTRAL
    record = applyRelationalTurn(record, { turnRef: "s2", events: ["DISMISSES_CONCERN"], boundaryMode: "NOT_RELEVANT" }); // NEUTRAL->GUARDED
    return record;
  }

  it("REPAIR alone: no relationship-state transition, but opens the window on the most recent unresolved STRAIN entry", () => {
    const before = guardedNpcWithOpenStrain();
    const mostRecentStrainId = before.causalEventHistory.at(-1)?.id;
    const after = applyRelationalTurn(before, {
      turnRef: "t3",
      events: ["ACKNOWLEDGES_MISTAKE"],
      boundaryMode: "NOT_RELEVANT",
    });
    expect(after.relationshipState).toBe("GUARDED"); // unchanged — REPAIR's immediate effect is none
    expect(after.repairWindow).toEqual({ status: "OPEN", targetEntryId: mostRecentStrainId });
    expect(after.lastStrainEventId).toBe(mostRecentStrainId);
  });

  it("REPAIR with no unresolved STRAIN in history is a no-op on the window (nothing to target)", () => {
    const record = applyRelationalTurn(createInitialRelationshipRecord(), {
      turnRef: "t1",
      events: ["ACKNOWLEDGES_MISTAKE"],
      boundaryMode: "NOT_RELEVANT",
    });
    expect(record.repairWindow).toEqual({ status: "CLOSED" });
    expect(record.lastStrainEventId).toBeNull();
  });

  it("apology + insult same turn: STRAIN wins, no REPAIR_WINDOW opens (V14 §4 worked example)", () => {
    const before = guardedNpcWithOpenStrain();
    const after = applyRelationalTurn(before, {
      turnRef: "t3",
      events: ["ACKNOWLEDGES_MISTAKE", "PERSONAL_INSULT"],
      boundaryMode: "NOT_RELEVANT",
    });
    expect(after.relationshipState).toBe("GUARDED"); // STRAIN: GUARDED->GUARDED
    expect(after.repairWindow).toEqual(before.repairWindow); // untouched — still whatever it was (CLOSED here)
    expect(after.repairWindow.status).toBe("CLOSED");
  });

  it("REPAIR + RELIABILITY same turn: both apply independently (V16 §6.5)", () => {
    const before = guardedNpcWithOpenStrain();
    const after = applyRelationalTurn(before, {
      turnRef: "t3",
      events: ["ACKNOWLEDGES_MISTAKE", "KEEPS_PROMISE"],
      boundaryMode: "NOT_RELEVANT",
    });
    // RELIABILITY selected for the transition contest (REPAIR has null effect);
    // GUARDED->NEUTRAL requires a prior completed corrective action, which
    // hasn't happened yet here, so it stays GUARDED but the observation counts.
    expect(after.relationshipState).toBe("GUARDED");
    expect(after.reliabilityObservationCount).toBe(1);
    // ...and REPAIR's window still opens from the same turn.
    expect(after.repairWindow.status).toBe("OPEN");
  });
});

describe("THREAT and BREAKS_PROMISE context-dependent promotion (V14 §3)", () => {
  it("THREAT without a declared/executed crossing stays STRAIN (regression: V9 matrix Z19)", () => {
    const record = applyRelationalTurn(createInitialRelationshipRecord(), {
      turnRef: "t1",
      events: ["THREAT"],
      boundaryMode: "RECONSIDER",
    });
    expect(record.relationshipState).toBe("NEUTRAL"); // STRAIN: OPEN->NEUTRAL
    expect(record.causalEventHistory[0].eventClass).toBe("STRAIN");
  });

  it("THREAT used to compel a declared/executed crossing promotes to SEVERE_RUPTURE", () => {
    const record = applyRelationalTurn(createInitialRelationshipRecord(), {
      turnRef: "t1",
      events: ["THREAT"],
      boundaryMode: "CROSS_WITHOUT_PERMISSION",
    });
    expect(record.relationshipState).toBe("GUARDED"); // SEVERE_RUPTURE: OPEN->GUARDED
    expect(record.causalEventHistory[0].eventClass).toBe("SEVERE_RUPTURE");
  });

  it("first and second confirmed BREAKS_PROMISE stay STRAIN, and the reducer itself increments promiseBreakCount", () => {
    let record = createInitialRelationshipRecord();
    record = applyRelationalTurn(record, { turnRef: "t1", events: ["BREAKS_PROMISE"], boundaryMode: "NOT_RELEVANT" });
    expect(record.causalEventHistory[0].eventClass).toBe("STRAIN");
    expect(record.promiseBreakCount).toBe(1);
    record = applyRelationalTurn(record, { turnRef: "t2", events: ["BREAKS_PROMISE"], boundaryMode: "NOT_RELEVANT" });
    expect(record.causalEventHistory[1].eventClass).toBe("STRAIN");
    expect(record.promiseBreakCount).toBe(2);
  });

  it("third confirmed BREAKS_PROMISE while earlier ones are unresolved promotes to SEVERE_RUPTURE", () => {
    let record = createInitialRelationshipRecord();
    record = applyRelationalTurn(record, { turnRef: "t1", events: ["BREAKS_PROMISE"], boundaryMode: "NOT_RELEVANT" });
    record = applyRelationalTurn(record, { turnRef: "t2", events: ["BREAKS_PROMISE"], boundaryMode: "NOT_RELEVANT" });
    record = applyRelationalTurn(record, { turnRef: "t3", events: ["BREAKS_PROMISE"], boundaryMode: "NOT_RELEVANT" });
    expect(record.promiseBreakCount).toBe(3);
    expect(record.causalEventHistory.at(-1)?.eventClass).toBe("SEVERE_RUPTURE");
  });

  it("third confirmed BREAKS_PROMISE stays STRAIN if the earlier ones were already resolved", () => {
    let record = createInitialRelationshipRecord();
    record = applyRelationalTurn(record, { turnRef: "t1", events: ["BREAKS_PROMISE"], boundaryMode: "NOT_RELEVANT" });
    record = applyRelationalTurn(record, { turnRef: "t2", events: ["BREAKS_PROMISE"], boundaryMode: "NOT_RELEVANT" });
    // Simulate both earlier promise-break STRAINs already having been
    // cleared via a completed corrective action.
    record = {
      ...record,
      causalEventHistory: record.causalEventHistory.map((e) => ({ ...e, resolved: true })),
    };
    record = applyRelationalTurn(record, { turnRef: "t3", events: ["BREAKS_PROMISE"], boundaryMode: "NOT_RELEVANT" });
    expect(record.causalEventHistory.at(-1)?.eventClass).toBe("STRAIN");
  });
});

describe("completeCorrectiveAction (V16 §6.2/§6.3, V22 §1.2, V24 §1-§3)", () => {
  function guardedWithOpenWindow(): NpcRelationshipRecord {
    let record = createInitialRelationshipRecord();
    record = applyRelationalTurn(record, { turnRef: "s1", events: ["DISMISSES_CONCERN"], boundaryMode: "NOT_RELEVANT" });
    record = applyRelationalTurn(record, { turnRef: "s2", events: ["DISMISSES_CONCERN"], boundaryMode: "NOT_RELEVANT" });
    record = applyRelationalTurn(record, { turnRef: "s3", events: ["ACKNOWLEDGES_MISTAKE"], boundaryMode: "NOT_RELEVANT" });
    expect(record.relationshipState).toBe("GUARDED");
    expect(record.repairWindow.status).toBe("OPEN");
    return record;
  }

  it("is a no-op when no repair window is open", () => {
    const record = createInitialRelationshipRecord();
    const after = completeCorrectiveAction(record, {
      turnRef: "t1",
      branch: "PERSONAL_INSULT_OR_DISMISSES_CONCERN",
    });
    expect(after).toBe(record);
  });

  it("PERSONAL_INSULT_OR_DISMISSES_CONCERN branch: consumes window, transitions GUARDED->NEUTRAL, logs typed provenance (V22 §2.3)", () => {
    const before = guardedWithOpenWindow();
    const targetId = before.repairWindow.status === "OPEN" ? before.repairWindow.targetEntryId : null;
    const after = completeCorrectiveAction(before, {
      turnRef: "t4",
      branch: "PERSONAL_INSULT_OR_DISMISSES_CONCERN",
    });
    expect(after.relationshipState).toBe("NEUTRAL");
    expect(after.repairWindow).toEqual({ status: "CLOSED" });
    expect(after.correctiveActionLog).toHaveLength(1);
    const resolvedEntry = after.causalEventHistory.find((e) => e.id === targetId);
    expect(resolvedEntry?.resolved).toBe(true);
    expect(resolvedEntry?.resolvingReference).toEqual({
      layer: "CORRECTIVE_ACTION_COMPLETION",
      entryId: after.correctiveActionLog[0].id,
    });
    expect(resolvedEntry?.resolvedAtTurn).toBe("t4");
  });

  it("BREAKS_PROMISE/FALSE_ATTRIBUTION branches require relationalEvidenceEntryId (V22 §2.3)", () => {
    const before = guardedWithOpenWindow();
    expect(() =>
      completeCorrectiveAction(before, { turnRef: "t4", branch: "BREAKS_PROMISE" }),
    ).toThrow();
  });

  it("BREAKS_PROMISE branch resolves with RELATIONAL_EVENT provenance and resets promiseBreakCount only when eligible (V24 §2)", () => {
    // Build a GUARDED NPC whose open window targets a BREAKS_PROMISE-caused
    // STRAIN specifically (unlike `guardedWithOpenWindow()`, whose targeted
    // entry is DISMISSES_CONCERN-caused and must NOT reset promiseBreakCount).
    let before = createInitialRelationshipRecord();
    before = applyRelationalTurn(before, { turnRef: "s1", events: ["BREAKS_PROMISE"], boundaryMode: "NOT_RELEVANT" }); // OPEN->NEUTRAL
    before = applyRelationalTurn(before, { turnRef: "s2", events: ["BREAKS_PROMISE"], boundaryMode: "NOT_RELEVANT" }); // NEUTRAL->GUARDED
    before = applyRelationalTurn(before, { turnRef: "s3", events: ["ACKNOWLEDGES_MISTAKE"], boundaryMode: "NOT_RELEVANT" });
    expect(before.relationshipState).toBe("GUARDED");
    expect(before.promiseBreakCount).toBe(2);
    expect(before.repairWindow.status).toBe("OPEN");

    const after = completeCorrectiveAction(before, {
      turnRef: "t4",
      branch: "BREAKS_PROMISE",
      relationalEvidenceEntryId: "keeps-promise-entry-1",
    });
    expect(after.relationshipState).toBe("NEUTRAL");
    expect(after.promiseBreakCount).toBe(0);
    const targetId = before.repairWindow.status === "OPEN" ? before.repairWindow.targetEntryId : null;
    const resolvedEntry = after.causalEventHistory.find((e) => e.id === targetId);
    expect(resolvedEntry?.resolvingReference).toEqual({
      layer: "RELATIONAL_EVENT",
      entryId: "keeps-promise-entry-1",
    });
  });

  it("does not reset promiseBreakCount for a non-BREAKS_PROMISE-caused targeted entry, even on the BREAKS_PROMISE branch", () => {
    const before = { ...guardedWithOpenWindow(), promiseBreakCount: 2 };
    const after = completeCorrectiveAction(before, {
      turnRef: "t4",
      branch: "BREAKS_PROMISE",
      relationalEvidenceEntryId: "keeps-promise-entry-1",
    });
    expect(after.promiseBreakCount).toBe(2);
  });

  it("consumes the window and marks resolved WITHOUT transitioning when the NPC ever had a SEVERE_RUPTURE (V24 §1, the V23/V24 disputed scenario)", () => {
    // One earlier SEVERE_RUPTURE (OPEN->GUARDED), then a later STRAIN
    // (GUARDED->GUARDED, still GUARDED, never reaches WITHDRAWN), then an
    // ACKNOWLEDGES_MISTAKE opening a window on that STRAIN.
    let record = createInitialRelationshipRecord();
    record = applyRelationalTurn(record, {
      turnRef: "r1",
      events: ["PUBLIC_SHAMING", "PERSONAL_INSULT"],
      boundaryMode: "NOT_RELEVANT",
    }); // OPEN -> GUARDED via SEVERE_RUPTURE
    expect(record.relationshipState).toBe("GUARDED");
    record = applyRelationalTurn(record, {
      turnRef: "r2",
      events: ["DISMISSES_CONCERN"],
      boundaryMode: "NOT_RELEVANT",
    }); // GUARDED -> GUARDED via STRAIN; this NPC never reaches WITHDRAWN
    record = applyRelationalTurn(record, {
      turnRef: "r3",
      events: ["ACKNOWLEDGES_MISTAKE"],
      boundaryMode: "NOT_RELEVANT",
    });
    expect(record.repairWindow.status).toBe("OPEN");

    const targetId = record.repairWindow.status === "OPEN" ? record.repairWindow.targetEntryId : null;
    const after = completeCorrectiveAction(record, {
      turnRef: "r4",
      branch: "PERSONAL_INSULT_OR_DISMISSES_CONCERN",
    });

    // Ineligible: never transitions, stays GUARDED, despite never having
    // been WITHDRAWN — this is exactly the case V20's "currently WITHDRAWN"
    // gate got wrong and V22/V24 fixed with the "ever had SEVERE_RUPTURE" test.
    expect(after.relationshipState).toBe("GUARDED");
    // But the window is still consumed and the entry still marked resolved
    // (V16 §6.3 / V22 §1.2 step 3/6 — unconditional).
    expect(after.repairWindow).toEqual({ status: "CLOSED" });
    expect(after.causalEventHistory.find((e) => e.id === targetId)?.resolved).toBe(true);
  });

  it("a currently-WITHDRAWN NPC: same non-transition outcome, reached via the same uniform test", () => {
    let record = createInitialRelationshipRecord();
    record = applyRelationalTurn(record, {
      turnRef: "r1",
      events: ["PUBLIC_SHAMING", "PERSONAL_INSULT"],
      boundaryMode: "NOT_RELEVANT",
    }); // OPEN -> GUARDED
    record = applyRelationalTurn(record, {
      turnRef: "r2",
      events: ["PUBLIC_SHAMING", "PERSONAL_INSULT"],
      boundaryMode: "NOT_RELEVANT",
    }); // GUARDED -> WITHDRAWN
    expect(record.relationshipState).toBe("WITHDRAWN");
    // Force an open window to exercise the completion pipeline in isolation
    // (WITHDRAWN blocks new STRAIN->GUARDED transitions but the pipeline
    // itself must still be well-defined if a window were somehow open).
    record = { ...record, repairWindow: { status: "OPEN", targetEntryId: record.causalEventHistory[0].id } };
    const after = completeCorrectiveAction(record, {
      turnRef: "r3",
      branch: "PERSONAL_INSULT_OR_DISMISSES_CONCERN",
    });
    expect(after.relationshipState).toBe("WITHDRAWN");
    expect(after.repairWindow).toEqual({ status: "CLOSED" });
  });

  it("resets reliabilityObservationCount on a completion-driven transition (V16 §6.6)", () => {
    let record = guardedWithOpenWindow();
    record = { ...record, reliabilityObservationCount: 1 };
    const after = completeCorrectiveAction(record, {
      turnRef: "t4",
      branch: "PERSONAL_INSULT_OR_DISMISSES_CONCERN",
    });
    expect(after.relationshipState).toBe("NEUTRAL");
    expect(after.reliabilityObservationCount).toBe(0);
  });
});

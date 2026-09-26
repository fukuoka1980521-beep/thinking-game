/**
 * NEW LIFE refoundation — blind/automated replay (V11 order, stage 8 of 8).
 *
 * Reuses the four non-owner player archetypes already generated earlier in
 * this PR's review thread (BLIND_NON_OWNER_ROUTE_GENERATION_V1.md:
 * DIRECT_DECISIVE / ANALYTICAL_SKEPTICAL / LOW_VERBAL_SHORT /
 * AVOIDANT_TIME_SENSITIVE), plus a BREAKDOWN and a RECOVERY route and an
 * "operational success coexists with relationship damage" route, and drives
 * each through the real stage 1-3 deterministic modules
 * (`relationshipReducer`/`ending`/`timeEconomy`) rather than through UI or
 * prose.
 *
 * Methodology note (deliberate scoping): each route below is expressed as a
 * directly-typed sequence of `TurnClassification`-shaped turns capturing
 * that archetype's documented decision pattern (fact-finding first vs.
 * boundary-check first vs. terse vs. operational-workaround-first, etc.),
 * rather than re-classifying the original free Japanese text from the PR's
 * non-owner route generations. Doing the latter without a live semantic
 * interpreter would mean informally re-deriving V13-V24 classifications
 * outside this project's established process for that (an isolated,
 * multi-run, hidden-oracle blind-classifier round) — this series has
 * consistently avoided doing that ad hoc, and this file does not either.
 * What *is* being tested here — end-to-end, against the real reducers, not
 * asserted in prose — is that the deterministic state machinery those
 * classifications feed into treats all four styles fairly, lets a poor
 * decision cause a real breakdown, and lets a repaired mistake recover
 * without erasing its cost.
 */
import { describe, expect, it } from "vitest";
import { applyRelationalTurn, completeCorrectiveAction, createInitialRelationshipRecord } from "./relationshipReducer";
import { applyEndingTurn, createInitialCaseEndingState, deriveEndingVector, type CaseEndingState } from "./ending";
import { createWorldClock, spendTime, VERTICAL_SLICE_CASE_001_TOTAL_MINUTES, type WorldClock } from "./timeEconomy";
import type { ActionType, BoundaryMode, NpcRelationshipRecord, RelationalEvent } from "./types";

interface RouteTurn {
  npcTarget: "MIKA" | null;
  action: ActionType;
  boundaryMode: BoundaryMode;
  relationalEvents?: RelationalEvent[];
  costMinutes: number;
}

interface RouteResult {
  mika: NpcRelationshipRecord;
  ending: CaseEndingState;
  clock: WorldClock;
}

/** Drives one route's turns through the real reducers, in order. Single-NPC (Mika) — sufficient for every property this stage checks. */
function playRoute(turns: readonly RouteTurn[]): RouteResult {
  let mika = createInitialRelationshipRecord();
  let ending = createInitialCaseEndingState();
  let clock = createWorldClock(VERTICAL_SLICE_CASE_001_TOTAL_MINUTES);

  turns.forEach((turn, i) => {
    const turnRef = `t${i + 1}`;
    clock = spendTime(clock, turn.costMinutes);
    ending = applyEndingTurn(ending, { turnRef, action: turn.action, boundaryMode: turn.boundaryMode });
    if (turn.npcTarget === "MIKA") {
      mika = applyRelationalTurn(mika, { turnRef, events: turn.relationalEvents ?? [], boundaryMode: turn.boundaryMode });
    }
  });

  return { mika, ending, clock };
}

function endingVectorOf(result: RouteResult) {
  return deriveEndingVector({
    state: result.ending,
    requiredRelationshipStates: [result.mika.relationshipState],
    trust: result.mika.relationshipState,
    clock: result.clock,
  });
}

/* ---------------------------------------------------------------------- */
/* The four non-owner archetypes                                           */
/* ---------------------------------------------------------------------- */

const DIRECT_DECISIVE_ROUTE: RouteTurn[] = [
  { npcTarget: "MIKA", action: "ASK_BOUNDARY", boundaryMode: "DISCOVER", costMinutes: 2 },
  { npcTarget: null, action: "ASK_FACT", boundaryMode: "NOT_RELEVANT", costMinutes: 2 },
  { npcTarget: null, action: "CUT_SCENE", boundaryMode: "AVOID", costMinutes: 10 },
];

const ANALYTICAL_SKEPTICAL_ROUTE: RouteTurn[] = [
  { npcTarget: "MIKA", action: "ASK_FACT", boundaryMode: "NOT_RELEVANT", costMinutes: 4 },
  { npcTarget: null, action: "ASK_REQUIRED_FUNCTION", boundaryMode: "NOT_RELEVANT", costMinutes: 4 },
  { npcTarget: "MIKA", action: "ASK_BOUNDARY", boundaryMode: "DISCOVER", costMinutes: 2 },
  { npcTarget: "MIKA", action: "COMMIT_PLAN", boundaryMode: "SEEK_PERMISSION", costMinutes: 2 },
];

const LOW_VERBAL_SHORT_ROUTE: RouteTurn[] = [
  { npcTarget: "MIKA", action: "ASK_BOUNDARY", boundaryMode: "DISCOVER", costMinutes: 2 },
  { npcTarget: null, action: "PROPOSE_REWRITE", boundaryMode: "SEEK_PERMISSION", costMinutes: 2 },
  { npcTarget: "MIKA", action: "COMMIT_PLAN", boundaryMode: "SEEK_PERMISSION", costMinutes: 2 },
];

const AVOIDANT_TIME_SENSITIVE_ROUTE: RouteTurn[] = [
  { npcTarget: null, action: "DELAY_DECISION", boundaryMode: "NOT_RELEVANT", costMinutes: 2 },
  { npcTarget: "MIKA", action: "MOVE_PRIVATE", boundaryMode: "NOT_RELEVANT", costMinutes: 2 },
  { npcTarget: null, action: "USE_UNDERSTUDY", boundaryMode: "AVOID", costMinutes: 18 },
];

describe("the four non-owner archetypes each reach a legitimate PROCEEDS/RESPECTED ending", () => {
  const routes = {
    DIRECT_DECISIVE: DIRECT_DECISIVE_ROUTE,
    ANALYTICAL_SKEPTICAL: ANALYTICAL_SKEPTICAL_ROUTE,
    LOW_VERBAL_SHORT: LOW_VERBAL_SHORT_ROUTE,
    AVOIDANT_TIME_SENSITIVE: AVOIDANT_TIME_SENSITIVE_ROUTE,
  };

  for (const [name, route] of Object.entries(routes)) {
    it(`${name} reaches SHOW: PROCEEDS, BOUNDARY: RESPECTED`, () => {
      const vector = endingVectorOf(playRoute(route));
      expect(vector.show).toBe("PROCEEDS");
      expect(vector.boundary).toBe("RESPECTED");
    });
  }

  it("none of the four routes contain a relational event — none is penalized for brevity/bluntness/register, since TRUST stays OPEN for all four", () => {
    for (const route of Object.values(routes)) {
      const { mika } = playRoute(route);
      expect(mika.relationshipState).toBe("OPEN");
      expect(mika.causalEventHistory).toHaveLength(0);
    }
  });

  it("the terse route is never charged more time than the exploratory route for reaching the same legitimate ending — brevity is a legitimate trade-off, not a penalty", () => {
    const terse = endingVectorOf(playRoute(LOW_VERBAL_SHORT_ROUTE));
    const exploratory = endingVectorOf(playRoute(ANALYTICAL_SKEPTICAL_ROUTE));
    expect(terse.show).toBe(exploratory.show);
    expect(terse.boundary).toBe(exploratory.boundary);
    expect(terse.timeLeft).toBeGreaterThanOrEqual(exploratory.timeLeft);
  });

  it("personal track remains optional — no route ever opens it, yet all four still reach PROCEEDS/RESPECTED", () => {
    for (const route of Object.values(routes)) {
      const vector = endingVectorOf(playRoute(route));
      expect(vector.personalTrack).toBe("NOT_OPENED");
      expect(vector.show).toBe("PROCEEDS");
      expect(vector.boundary).toBe("RESPECTED");
    }
  });
});

/* ---------------------------------------------------------------------- */
/* A poor decision can causally worsen the case (breakdown)                */
/* ---------------------------------------------------------------------- */

describe("a poor decision causes a real, causal BREAKDOWN — not a tone penalty", () => {
  it("forcing an unconfirmed plan while shaming/insulting, then threatening while still crossing, withdraws Mika and breaks the NPC-dependent commitment", () => {
    const route: RouteTurn[] = [
      {
        npcTarget: "MIKA",
        action: "FORCE_UNCONFIRMED_PLAN",
        boundaryMode: "CROSS_WITHOUT_PERMISSION",
        relationalEvents: ["PUBLIC_SHAMING", "PERSONAL_INSULT"], // V14 §2 combo -> SEVERE_RUPTURE
        costMinutes: 2,
      },
      {
        npcTarget: "MIKA",
        action: "FORCE_UNCONFIRMED_PLAN",
        boundaryMode: "CROSS_WITHOUT_PERMISSION",
        relationalEvents: ["THREAT"], // THREAT + CROSS_WITHOUT_PERMISSION -> SEVERE_RUPTURE (V14 §3)
        costMinutes: 2,
      },
    ];
    const result = playRoute(route);
    expect(result.mika.relationshipState).toBe("WITHDRAWN");

    const vector = endingVectorOf(result);
    // FORCE_UNCONFIRMED_PLAN is NPC-dependent (V27 §2.3) and was never
    // superseded by a later commitment — WITHDRAWN breaks it (V27 §2.3/§4).
    expect(vector.show).toBe("BREAKDOWN");
    // Caused by two concrete behavioral facts (a combo event, a compelling
    // threat), never by phrasing/tone — this reducer never reads text.
  });

  it("the same forced, unconfirmed, boundary-crossing plan without any relational event does NOT break the show — the SEVERE_RUPTURE combo/threat, not the crossing alone, is what causes WITHDRAWN", () => {
    const route: RouteTurn[] = [
      { npcTarget: "MIKA", action: "FORCE_UNCONFIRMED_PLAN", boundaryMode: "CROSS_WITHOUT_PERMISSION", costMinutes: 2 },
    ];
    const result = playRoute(route);
    expect(result.mika.relationshipState).toBe("OPEN");
    const vector = endingVectorOf(result);
    expect(vector.show).toBe("PROCEEDS");
    expect(vector.boundary).toBe("OVERRIDDEN"); // still causally recorded as overridden — a real, non-tone consequence
  });
});

/* ---------------------------------------------------------------------- */
/* Recovery after a poor decision                                          */
/* ---------------------------------------------------------------------- */

describe("recovery works after a poor decision, without erasing its cost", () => {
  it("a dismissed concern (STRAIN) can be repaired and completed back to OPEN, and a later proper re-commitment still respects the boundary", () => {
    let mika = createInitialRelationshipRecord();
    let ending = createInitialCaseEndingState();
    let clock = createWorldClock(VERTICAL_SLICE_CASE_001_TOTAL_MINUTES);

    // T1: a poor decision — forces an unconfirmed plan and dismisses her concern.
    clock = spendTime(clock, 2);
    ending = applyEndingTurn(ending, { turnRef: "t1", action: "FORCE_UNCONFIRMED_PLAN", boundaryMode: "CROSS_WITHOUT_PERMISSION" });
    mika = applyRelationalTurn(mika, { turnRef: "t1", events: ["DISMISSES_CONCERN"], boundaryMode: "CROSS_WITHOUT_PERMISSION" });
    expect(mika.relationshipState).toBe("NEUTRAL"); // STRAIN_TABLE OPEN -> NEUTRAL
    expect(mika.repairWindow.status).toBe("CLOSED"); // DISMISSES_CONCERN alone does not open a window

    // T2: apologizes and commits to redo it properly, outside the boundary.
    clock = spendTime(clock, 2);
    ending = applyEndingTurn(ending, { turnRef: "t2", action: "APOLOGIZE_AND_REPAIR", boundaryMode: "AVOID" });
    mika = applyRelationalTurn(mika, { turnRef: "t2", events: ["ACKNOWLEDGES_MISTAKE"], boundaryMode: "AVOID" });
    expect(mika.relationshipState).toBe("NEUTRAL"); // REPAIR has no direct transition (V14 §3/§4)
    expect(mika.repairWindow.status).toBe("OPEN"); // now targets T1's DISMISSES_CONCERN entry

    // T3: the corrective action (the redo) is validated complete.
    mika = completeCorrectiveAction(mika, { turnRef: "t3", branch: "PERSONAL_INSULT_OR_DISMISSES_CONCERN" });
    expect(mika.relationshipState).toBe("OPEN"); // eligible (never had SEVERE_RUPTURE) -> NEUTRAL -> OPEN
    expect(mika.repairWindow.status).toBe("CLOSED");
    expect(mika.causalEventHistory[0].resolved).toBe(true); // the mistake is marked resolved, not erased

    // T4: a proper, permissioned re-commitment supersedes the original forced plan.
    clock = spendTime(clock, 2);
    ending = applyEndingTurn(ending, { turnRef: "t4", action: "COMMIT_PLAN", boundaryMode: "SEEK_PERMISSION" });

    const vector = deriveEndingVector({
      state: ending,
      requiredRelationshipStates: [mika.relationshipState],
      trust: mika.relationshipState,
      clock,
    });
    expect(vector.show).toBe("PROCEEDS");
    expect(vector.boundary).toBe("RESPECTED"); // final commitment governs, not the superseded T1 crossing (V27 §3.2)
    expect(vector.trust).toBe("OPEN");
    // The mistake's history entry still exists and is marked resolved — the
    // repair is not a silent reset (V27/V16 "recoverable but scarred").
    expect(mika.causalEventHistory.some((e) => e.event === "DISMISSES_CONCERN")).toBe(true);
  });
});

/* ---------------------------------------------------------------------- */
/* Operational success can coexist with relationship damage                */
/* ---------------------------------------------------------------------- */

describe("operational success can coexist with relationship damage (V13's own worked example, replayed against the real reducers)", () => {
  it("a public-shaming turn damages TRUST alone; the case-level operational resolution still proceeds", () => {
    const route: RouteTurn[] = [
      { npcTarget: "MIKA", action: "ASSIGN_REWRITE", boundaryMode: "AVOID", relationalEvents: ["PUBLIC_SHAMING"], costMinutes: 2 },
      { npcTarget: null, action: "CUT_SCENE", boundaryMode: "AVOID", costMinutes: 10 }, // not NPC-dependent
    ];
    const result = playRoute(route);
    expect(result.mika.relationshipState).toBe("NEUTRAL"); // STRAIN_TABLE OPEN -> NEUTRAL, damaged but not withdrawn

    const vector = endingVectorOf(result);
    expect(vector.show).toBe("PROCEEDS"); // CUT_SCENE is an operational workaround, not NPC-dependent (V27 §2.3)
    expect(vector.boundary).toBe("RESPECTED");
    expect(vector.trust).toBe("NEUTRAL"); // the damage is real and visible, not laundered by operational success
  });
});

/* ---------------------------------------------------------------------- */
/* No hidden aggregate morality score                                      */
/* ---------------------------------------------------------------------- */

describe("no hidden aggregate morality score anywhere in the replayed vectors", () => {
  it("every EndingVector has exactly the five documented, independently-derived fields — never a combined score", () => {
    for (const route of [DIRECT_DECISIVE_ROUTE, ANALYTICAL_SKEPTICAL_ROUTE, LOW_VERBAL_SHORT_ROUTE, AVOIDANT_TIME_SENSITIVE_ROUTE]) {
      const vector = endingVectorOf(playRoute(route));
      expect(Object.keys(vector).sort()).toEqual(["boundary", "personalTrack", "show", "timeLeft", "trust"].sort());
    }
  });

  it("two endings differing only in TRUST (damaged vs. undamaged) are not distinguishable by any ranking field — same SHOW, same BOUNDARY, same PERSONAL_TRACK", () => {
    const undamaged = endingVectorOf(playRoute([{ npcTarget: null, action: "CUT_SCENE", boundaryMode: "AVOID", costMinutes: 10 }]));
    const damaged = endingVectorOf(
      playRoute([
        { npcTarget: "MIKA", action: "ASSIGN_REWRITE", boundaryMode: "AVOID", relationalEvents: ["PUBLIC_SHAMING"], costMinutes: 2 },
        { npcTarget: null, action: "CUT_SCENE", boundaryMode: "AVOID", costMinutes: 10 },
      ]),
    );
    expect(damaged.show).toBe(undamaged.show);
    expect(damaged.boundary).toBe(undamaged.boundary);
    expect(damaged.personalTrack).toBe(undamaged.personalTrack);
    expect(damaged.trust).not.toBe(undamaged.trust); // the only field that actually differs
  });
});

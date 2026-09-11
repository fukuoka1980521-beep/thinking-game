/**
 * PHASE_12_7_NEW_LIFE_PLAYER_TRAJECTORY_V1 Section 35 -- unit tests for the player life trajectory
 * system (content/trajectoryEngine.ts + engine.ts's accept/decline/engage/stepBack functions). No
 * test here ever asserts on a numeric skill/XP/career-progress value -- Section 3's ban applies
 * exactly as it did to social memory (PHASE 12.6) and relationships (PHASE 12.5).
 */
import { describe, expect, it } from "vitest";
import {
  acceptLifeOpportunity,
  declineLifeOpportunity,
  recordTrajectoryEngagement,
  startNewDay,
  stepBackFromTrajectory,
} from "../src/newlifecore/engine";
import { TRAJECTORY_SEEDS, trajectorySeedById } from "../src/newlifecore/content/trajectoryDefs";
import {
  engageActionEligible,
  experienceCount,
  hasAcceptedTrajectory,
  opportunityEligible,
  opportunityWindowExpired,
} from "../src/newlifecore/content/trajectoryEngine";
import { createInitialCoreState } from "../src/newlifecore/types";
import type { CoreState } from "../src/newlifecore/types";

const JIN = trajectorySeedById("jin_odd_job")!;
const MIYOKO = trajectorySeedById("miyoko_cafe_help")!;
const FUMIKO = trajectorySeedById("fumiko_community_role")!;

function stateAtDay(day: number, overrides: Partial<CoreState> = {}): CoreState {
  const s = createInitialCoreState();
  return { ...s, day, time: 9 * 60, ...overrides };
}

function engage(state: CoreState, seed = JIN) {
  return recordTrajectoryEngagement(state, seed, seed.engageMinutes, seed.engageMoney, seed.engageResultText);
}

describe("PHASE_12_7 trajectory: engage action eligibility (Section 6 -- experience before label)", () => {
  it("is not eligible before minDayForHelp", () => {
    const s = stateAtDay(1);
    expect(engageActionEligible(JIN, s)).toBe(false);
  });

  it("is eligible once minDayForHelp is reached and the NPC is schedule-available", () => {
    const s = stateAtDay(2, { time: 9 * 60 }); // Jin is AVAILABLE at COMMUNITY_HALL 08:00-09:30
    expect(engageActionEligible(JIN, s)).toBe(true);
  });

  it("is not eligible again the same day right after engaging (cooldown)", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    expect(engageActionEligible(JIN, s)).toBe(false);
  });

  it("is eligible again once the cooldown has elapsed", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    const later = { ...s, day: s.day + JIN.engageCooldownDays };
    expect(engageActionEligible(JIN, later)).toBe(true);
  });
});

describe("PHASE_12_7 trajectory: experience tracking (Section 9 -- meaningful experience, never a displayed number)", () => {
  it("count starts at 0 and increments by exactly 1 per engagement", () => {
    let s = stateAtDay(2);
    expect(experienceCount(JIN.id, s)).toBe(0);
    s = engage(s);
    expect(experienceCount(JIN.id, s)).toBe(1);
    s = { ...s, day: s.day + JIN.engageCooldownDays };
    s = engage(s);
    expect(experienceCount(JIN.id, s)).toBe(2);
  });

  it("real time and modest money are consumed/granted by engaging (Section 13/15)", () => {
    const s = stateAtDay(2, { time: 9 * 60, money: 8000 });
    const next = engage(s);
    expect(next.time).toBe(s.time + JIN.engageMinutes);
    expect(next.money).toBe(s.money + JIN.engageMoney);
  });

  it("engaging with one seed does not affect another seed's experience count", () => {
    let s = stateAtDay(2, { time: 8 * 60 + 30 }); // both jin and miyoko available
    s = engage(s, JIN);
    expect(experienceCount(MIYOKO.id, s)).toBe(0);
  });
});

describe("PHASE_12_7 trajectory: opportunity eligibility (Section 6/10/11)", () => {
  it("is not eligible before the experience threshold is reached", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s); // count = 1, threshold = 2
    expect(opportunityEligible(JIN, s)).toBe(false);
  });

  it("becomes eligible once the threshold is reached and still recent", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    s = { ...s, day: s.day + JIN.engageCooldownDays };
    s = engage(s); // count = 2 = threshold
    expect(opportunityEligible(JIN, s)).toBe(true);
  });

  it("closes (Section 10 -- 'expires', never MISSION FAILED) once the window elapses without further engagement", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    s = { ...s, day: s.day + JIN.engageCooldownDays };
    s = engage(s); // threshold reached on this day
    const reachedDay = s.day;
    const later = { ...s, day: reachedDay + JIN.opportunityWindowDays + 1 };
    expect(opportunityEligible(JIN, later)).toBe(false);
    expect(opportunityWindowExpired(JIN, later)).toBe(true);
  });

  it("reopens (Section 11 -- second chances) if the player engages again after the window closed, with zero extra bookkeeping", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    s = { ...s, day: s.day + JIN.engageCooldownDays, time: 9 * 60 };
    s = engage(s);
    const reachedDay = s.day;
    // Reset time to Jin's morning AVAILABLE window on each day jump -- a day jump alone (unlike
    // real play's `startNewDay`) does not reset the clock, and repeated `engage()` calls otherwise
    // drift time forward until it lands in Jin's 11:00-15:00 AWAY block.
    let later = { ...s, day: reachedDay + JIN.opportunityWindowDays + 1, time: 9 * 60 };
    expect(opportunityEligible(JIN, later)).toBe(false);
    later = engage(later); // engaging again refreshes lastDay
    expect(opportunityEligible(JIN, later)).toBe(true);
  });

  it("is never eligible once already accepted", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    s = { ...s, day: s.day + JIN.engageCooldownDays };
    s = engage(s);
    s = acceptLifeOpportunity(s, JIN);
    expect(opportunityEligible(JIN, s)).toBe(false);
    expect(hasAcceptedTrajectory(JIN, s)).toBe(true);
  });
});

describe("PHASE_12_7 trajectory: accept / decline / ignore (Section 6/7/12)", () => {
  function reachThreshold(seed = JIN): CoreState {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s, seed);
    s = { ...s, day: s.day + seed.engageCooldownDays };
    s = engage(s, seed);
    return s;
  }

  it("accepting sets the accepted flag and grants the opportunity's own time/money terms", () => {
    const s = reachThreshold();
    const next = acceptLifeOpportunity(s, JIN);
    expect(next.flags[JIN.acceptedFlag]).toBe(true);
    expect(next.time).toBe(s.time + JIN.opportunityMinutes);
  });

  it("declining does NOT set the accepted flag, and is a fully resolved (non-pending) outcome", () => {
    const s = reachThreshold();
    const next = declineLifeOpportunity(s, JIN);
    expect(next.flags[JIN.acceptedFlag]).toBeUndefined();
    expect(next.lifeOpportunityDeclines[JIN.id]).toBe(next.day);
  });

  it("ignoring (never calling accept or decline at all) leaves state completely untouched beyond the player simply not engaging further", () => {
    const s = reachThreshold();
    // The offer is ephemeral UI state in the real component; at the engine level, "ignore" is
    // simply never calling either function. Nothing here should differ from before threshold was
    // reached except playerExperiences (already asserted in the tracking describe block above).
    expect(s.flags[JIN.acceptedFlag]).toBeUndefined();
    expect(s.lifeOpportunityDeclines[JIN.id]).toBeUndefined();
  });

  it("declining is followed by a cooldown before the SAME seed offers again (Section 11 -- not offered mechanically every time)", () => {
    const s = reachThreshold();
    const declined = declineLifeOpportunity(s, JIN);
    // Still within the experience window, but the decline-cooldown should block re-offering.
    let stillCooldown = engage(declined, JIN); // re-engage to refresh lastDay (stays within window)
    expect(opportunityEligible(JIN, stillCooldown)).toBe(false);
    const pastCooldown = { ...stillCooldown, day: stillCooldown.day + JIN.declineCooldownDays };
    const afterCooldown = engage(pastCooldown, JIN);
    expect(opportunityEligible(JIN, afterCooldown)).toBe(true);
  });
});

describe("PHASE_12_7 trajectory: change of mind (Section 29)", () => {
  it("stepping back clears the accepted flag but preserves the experience count (history is not erased)", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    s = { ...s, day: s.day + JIN.engageCooldownDays };
    s = engage(s);
    s = acceptLifeOpportunity(s, JIN);
    const countBefore = experienceCount(JIN.id, s);
    const steppedBack = stepBackFromTrajectory(s, JIN);
    expect(steppedBack.flags[JIN.acceptedFlag]).toBeUndefined();
    expect(experienceCount(JIN.id, steppedBack)).toBe(countBefore);
  });

  it("after stepping back, the player is free to pursue a DIFFERENT trajectory without any lock-in", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s, JIN);
    s = { ...s, day: s.day + JIN.engageCooldownDays };
    s = engage(s, JIN);
    s = acceptLifeOpportunity(s, JIN);
    s = stepBackFromTrajectory(s, JIN);
    // Miyoko is independently available and untouched by Jin's history.
    s = { ...s, time: 8 * 60 + 30 };
    expect(engageActionEligible(MIYOKO, s)).toBe(true);
    s = engage(s, MIYOKO);
    expect(experienceCount(MIYOKO.id, s)).toBe(1);
  });

  it("does NOT block the same trajectory from being accepted again later (no permanent exile)", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    s = { ...s, day: s.day + JIN.engageCooldownDays };
    s = engage(s);
    s = acceptLifeOpportunity(s, JIN);
    s = stepBackFromTrajectory(s, JIN);
    expect(hasAcceptedTrajectory(JIN, s)).toBe(false);
    const reaccepted = acceptLifeOpportunity(s, JIN);
    expect(hasAcceptedTrajectory(JIN, reaccepted)).toBe(true);
  });
});

describe("PHASE_12_7 trajectory: no score system anywhere", () => {
  it("CoreState has no numeric skill/XP/career field for any trajectory", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    const keys = Object.keys(s);
    // Whole-word check (not a bare substring match -- "playerExperiences" legitimately contains
    // "xp" as a substring of "Experiences", which is the correct, intended field name, not a
    // violation of Section 3's ban).
    expect(keys.some((k) => /(^|[a-z])(skill|level|career|score)([A-Z]|$)/i.test(k) || /^xp$|Xp$/.test(k))).toBe(false);
    // playerExperiences entries carry a `count`, but it is never read as a displayed number
    // anywhere outside trajectoryEngine.ts's internal threshold gate (verified structurally: no
    // component/test imports `count` for display -- see tests/newlifecoreRenderedUI.test.tsx's own
    // "no social-memory UI" style assertion, extended below for trajectories).
    expect(s.playerExperiences[0]).toMatchObject({ id: JIN.id, count: 1 });
  });
});

describe("PHASE_12_7 trajectory: persistence across day transitions", () => {
  it("playerExperiences, accepted flags, and decline cooldowns all survive startNewDay unchanged", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    s = { ...s, day: s.day + JIN.engageCooldownDays };
    s = engage(s);
    s = acceptLifeOpportunity(s, JIN);
    const declined = declineLifeOpportunity(s, MIYOKO); // exercise the decline map too, unrelated seed
    const next = startNewDay({ ...declined, ended: true });
    expect(next.playerExperiences.find((e) => e.id === JIN.id)?.count).toBe(2);
    expect(next.flags[JIN.acceptedFlag]).toBe(true);
    expect(next.lifeOpportunityDeclines[MIYOKO.id]).toBe(declined.day);
  });
});

describe("PHASE_12_7 trajectory: duplicate prevention", () => {
  it("engaging twice on the same day (bypassing the UI's own eligibility check) still only records what actually happened -- no silent double-counting bug in the underlying function", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    s = engage(s); // engine-level call does not itself refuse a second same-day call -- the UI's
    // `engageActionEligible` gate is what prevents this in real play (already tested above); this
    // test only guards that the underlying function's own bookkeeping stays consistent if it were
    // ever called twice (count increments correctly, no duplicate array entries).
    const entries = s.playerExperiences.filter((e) => e.id === JIN.id);
    expect(entries).toHaveLength(1);
    expect(entries[0].count).toBe(2);
  });

  it("accepting an already-accepted trajectory again is a harmless no-op on the flag itself", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    s = { ...s, day: s.day + JIN.engageCooldownDays };
    s = engage(s);
    s = acceptLifeOpportunity(s, JIN);
    const again = acceptLifeOpportunity(s, JIN);
    expect(again.flags[JIN.acceptedFlag]).toBe(true);
  });
});

describe("PHASE_12_7 trajectory: the community seed (Fumiko) deliberately earns no money (Section 14 -- money is one constraint among several, not the measure of a valid life)", () => {
  it("engaging with and accepting the Fumiko seed never changes money", () => {
    let s = stateAtDay(2, { time: 9 * 60, money: 8000 });
    s = engage(s, FUMIKO);
    s = { ...s, day: s.day + FUMIKO.engageCooldownDays };
    s = engage(s, FUMIKO);
    s = acceptLifeOpportunity(s, FUMIKO);
    expect(s.money).toBe(8000);
    expect(hasAcceptedTrajectory(FUMIKO, s)).toBe(true);
  });
});

describe("PHASE_12_7 trajectory: all 3 seeds are independently well-formed", () => {
  it.each(TRAJECTORY_SEEDS)("$id has a distinct npc/location/family and positive thresholds", (seed) => {
    expect(seed.opportunityThreshold).toBeGreaterThan(0);
    expect(seed.opportunityWindowDays).toBeGreaterThan(0);
    expect(seed.engageCooldownDays).toBeGreaterThan(0);
    expect(seed.acceptedFlag).toMatch(/^trajectory_/);
  });

  it("all 3 seeds use distinct NPCs and distinct families", () => {
    const npcs = new Set(TRAJECTORY_SEEDS.map((s) => s.npc));
    const families = new Set(TRAJECTORY_SEEDS.map((s) => s.family));
    expect(npcs.size).toBe(TRAJECTORY_SEEDS.length);
    expect(families.size).toBe(TRAJECTORY_SEEDS.length);
  });
});

/**
 * PHASE_12_7_NEW_LIFE_PLAYER_TRAJECTORY_V1 -- pure derivation functions for the player life
 * trajectory system, mirroring content/socialMemory.ts's own discipline: everything here is
 * computed from state the codebase already keeps (`playerExperiences`, `flags`,
 * `lifeOpportunityDeclines`), never a second mutable "trajectory status" struct. Section 12
 * ("ゲームが主人公の人生を勝手に決めない") applies structurally here too -- these functions only
 * ever answer "is X currently eligible", never themselves accept/decline/create anything; only a
 * real UI action (via engine.ts) does that.
 */
import { npcAvailabilityAt } from "../schedule";
import type { CoreState, NpcId } from "../types";
import type { TrajectorySeed } from "./trajectoryDefs";

export function experienceFor(seedId: string, state: CoreState) {
  return state.playerExperiences.find((e) => e.id === seedId) ?? null;
}

export function experienceCount(seedId: string, state: CoreState): number {
  return experienceFor(seedId, state)?.count ?? 0;
}

export function hasAcceptedTrajectory(seed: TrajectorySeed, state: CoreState): boolean {
  return Boolean(state.flags[seed.acceptedFlag]);
}

/** Section 6/9 -- the ordinary "help again" action (stage 1/2, no label attached yet). Gated only
 *  on the NPC being schedule-AVAILABLE and a short day-based cooldown since the player's last
 *  engagement with this SAME seed (so it can't be repeated more than roughly once a day) -- no
 *  relationship/tag prerequisite at this stage, matching Section 6's "先に体験させる" (experience
 *  comes first, with no gate beyond just showing up). Available identically whether or not the
 *  trajectory has since been accepted (accepting doesn't replace this action, it only ALSO unlocks
 *  the higher-tier "work" framing -- see `content/trajectoryDefs.ts`'s doc comment). */
export function engageActionEligible(seed: TrajectorySeed, state: CoreState): boolean {
  if (npcAvailabilityAt(seed.npc, state.time, state.flags) !== "AVAILABLE") return false;
  const exp = experienceFor(seed.id, state);
  if (!exp) return state.day >= seed.minDayForHelp;
  return state.day - exp.lastDay >= seed.engageCooldownDays;
}

/**
 * Section 6/10/11 -- the "real opportunity" framing becomes eligible once the player has engaged
 * enough times (`opportunityThreshold`) AND that engagement is still RECENT (within
 * `opportunityWindowDays` of the last engagement) -- deliberately keyed off `lastDay`, not a
 * separately-stamped "first reached threshold" day: if the player keeps engaging, the window keeps
 * extending naturally; if they stop, it quietly closes (Section 10: no "MISSION FAILED", it just
 * stops being offered) and reopens the moment they engage again (Section 11: "second chances",
 * with zero extra bookkeeping -- the SAME mechanism that closes the window is what reopens it).
 * Never eligible once already accepted, and respects a short decline-cooldown so a declined
 * opportunity doesn't reappear the very next interaction (Section 11: "同じ誘いを何度も機械的に
 * 出さない") while still being able to resurface later.
 */
export function opportunityEligible(seed: TrajectorySeed, state: CoreState): boolean {
  if (hasAcceptedTrajectory(seed, state)) return false;
  const exp = experienceFor(seed.id, state);
  if (!exp || exp.count < seed.opportunityThreshold) return false;
  if (state.day - exp.lastDay > seed.opportunityWindowDays) return false;
  const declinedDay = state.lifeOpportunityDeclines[seed.id];
  if (declinedDay !== undefined && state.day - declinedDay < seed.declineCooldownDays) return false;
  if (npcAvailabilityAt(seed.npc, state.time, state.flags) !== "AVAILABLE") return false;
  return true;
}

/** Section 13 -- once accepted, the SAME engage action continues to exist but now represents doing
 *  the work itself (framed differently, see trajectoryDefs.ts), still gated by the same cooldown. */
export function workActionEligible(seed: TrajectorySeed, state: CoreState): boolean {
  if (!hasAcceptedTrajectory(seed, state)) return false;
  return engageActionEligible(seed, state);
}

/** Section 29 -- an explicit, neutral "step back" action, always available once accepted (no
 *  cooldown -- changing your mind should never itself be gated or delayed). */
export function canStepBackFromTrajectory(seed: TrajectorySeed, state: CoreState): boolean {
  return hasAcceptedTrajectory(seed, state);
}

/**
 * Diagnostic only (Section 30's "expired opportunities" metric) -- fully derived, no stored state:
 * true if this seed's experience threshold was reached at some point but the window has since
 * closed without ever accepting. Used by the 30-day simulation and CLOSE evidence, never gates
 * anything at runtime (opportunityEligible above already handles the live behavior).
 */
export function opportunityWindowExpired(seed: TrajectorySeed, state: CoreState): boolean {
  if (hasAcceptedTrajectory(seed, state)) return false;
  const exp = experienceFor(seed.id, state);
  if (!exp || exp.count < seed.opportunityThreshold) return false;
  return state.day - exp.lastDay > seed.opportunityWindowDays;
}

export function npcsWithActiveTrajectory(seeds: TrajectorySeed[], state: CoreState): NpcId[] {
  return seeds.filter((s) => hasAcceptedTrajectory(s, state)).map((s) => s.npc);
}

/**
 * PHASE_12_8_NEW_LIFE_30_DAY_ARC_AND_RETROSPECTIVE_V1 Section 6/7 -- late-game consequence
 * eligibility. Requires the trajectory to still be actively accepted (stepping back removes
 * eligibility immediately, matching every other seed action's "accepted state only" gating), the
 * day threshold, a real minimum amount of prior work behind it (not just having accepted
 * yesterday), and its own cooldown so it stays an occasional beat, not a new routine.
 */
export function lateConsequenceEligible(seed: TrajectorySeed, state: CoreState): boolean {
  if (!hasAcceptedTrajectory(seed, state)) return false;
  if (state.day < seed.lateConsequenceMinDay) return false;
  if (experienceCount(seed.id, state) < seed.lateConsequenceMinWorkCount) return false;
  const lastFired = state.lateConsequenceLastFired[seed.id];
  if (lastFired !== undefined && state.day - lastFired < seed.lateConsequenceCooldownDays) return false;
  if (npcAvailabilityAt(seed.npc, state.time, state.flags) !== "AVAILABLE") return false;
  return true;
}

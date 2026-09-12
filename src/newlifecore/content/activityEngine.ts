/**
 * PHASE_14_NEW_LIFE_GAMEPLAY_CORE_V1 -- pure derivation functions for GAMEPLAY ACTIVITY, mirroring
 * `trajectoryEngine.ts`/`localProblemEngine.ts`'s own discipline: everything here answers "is X
 * eligible" or "what's due", never mutates state (only `engine.ts` does that) and never renders text
 * (only `content/day1.ts` and the UI component do that).
 */
import { npcAvailabilityAt } from "../schedule";
import type { CoreState } from "../types";
import { ACTIVITY_DEFS } from "./activityDefs";
import type { ActivityDef } from "./activityDefs";

/** PHASE_14 Section 4 -- a same-day-but-not-yet-in-window check, for TODAY'S SIGNS (computed at
 *  wake time, well before most activities' own eligible clock-time window opens). Everything
 *  `activityEligible` checks EXCEPT the specific minute-of-day window. */
export function activityEligibleToday(def: ActivityDef, state: CoreState): boolean {
  if (state.day < def.minDay) return false;
  const lastDone = state.activityLastDone[def.id];
  if (lastDone !== undefined && state.day - lastDone < def.cooldownDays) return false;
  return true;
}

export function activityEligible(def: ActivityDef, state: CoreState): boolean {
  if (state.day < def.minDay) return false;
  if (state.time < def.eligibleFromMinutes || state.time >= def.eligibleToMinutes) return false;
  const lastDone = state.activityLastDone[def.id];
  if (lastDone !== undefined && state.day - lastDone < def.cooldownDays) return false;
  return npcAvailabilityAt(def.npc, state.time, state.flags) === "AVAILABLE";
}

export interface ActivityResolution {
  def: ActivityDef;
}

/**
 * PHASE_15_NEW_LIFE_HYBRID_EVENT_AND_FORTUNE_HOUSE_V1 Section 2 -- ACTIVITY CONSEQUENCE CLOCK fix.
 * Called once per day (from `engine.ts`'s `startNewDay`, same shape as `dueLocalProblemResolutions`).
 * An activity's world-change lands `resolveAfterDays` after `activityResolutionAnchor[def.id]` --
 * the day `completionThreshold` was FIRST reached (written once, in `engine.ts`'s `runActivity`,
 * never moved again). Continuing to do the activity past the threshold no longer defers this: the
 * anchor is already fixed, so `state.day - anchor` keeps growing regardless of further sessions
 * (PHASE 14's bug measured from `activityLastDone`, which kept updating on every session).
 */
export function dueActivityResolutions(state: CoreState): ActivityResolution[] {
  const out: ActivityResolution[] = [];
  for (const def of ACTIVITY_DEFS) {
    if (state.activityResolved[def.id]) continue;
    const anchor = state.activityResolutionAnchor[def.id];
    if (anchor === undefined) continue; // threshold not yet reached
    if (state.day - anchor >= def.resolveAfterDays) {
      out.push({ def });
    }
  }
  return out;
}

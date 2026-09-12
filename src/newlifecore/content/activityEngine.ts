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

/** Section 10 -- called once per day (from `engine.ts`'s `startNewDay`, same shape as
 *  `dueLocalProblemResolutions`). An activity's world-change lands once `completionThreshold`
 *  sessions have accumulated AND `resolveAfterDays` have passed since the LAST session -- never on
 *  the session itself. */
export function dueActivityResolutions(state: CoreState): ActivityResolution[] {
  const out: ActivityResolution[] = [];
  for (const def of ACTIVITY_DEFS) {
    if (state.activityResolved[def.id]) continue;
    const count = state.activityHelpCount[def.id] ?? 0;
    if (count < def.completionThreshold) continue;
    const lastDone = state.activityLastDone[def.id];
    if (lastDone !== undefined && state.day - lastDone >= def.resolveAfterDays) {
      out.push({ def });
    }
  }
  return out;
}

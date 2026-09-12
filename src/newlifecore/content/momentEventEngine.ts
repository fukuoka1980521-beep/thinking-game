/**
 * PHASE_15 Section 9-24 -- pure derivation + one state-mutating entry point, mirroring
 * `content/localProblemEngine.ts`'s split exactly: eligibility/lookup functions here are pure reads
 * of `CoreState`; the only place a moment event's "shown" stamp is written is
 * `resolveMomentEventArrival`, called from `engine.ts`'s `moveTo` (the "something happens when you
 * move" trigger point, Section 9's whole premise -- arrival, not a clock tick, is what can surface a
 * moment event, unlike `content/eventEngine.ts`'s NPC-NPC background events).
 */
import { pseudoChance } from "./eventEngine";
import { MOMENT_EVENT_DEFS, type MomentEventDef } from "./momentEventDefs";
import type { CoreState, LocationId } from "../types";

function momentEventEligibleToShow(def: MomentEventDef, state: CoreState): boolean {
  if (state.day < def.minDay) return false;
  const lastShown = state.momentEventShownDay[def.id];
  if (lastShown !== undefined && state.day - lastShown < def.cooldownDays) return false;
  return true;
}

/**
 * Called from `moveTo` on every arrival. At most ONE moment event may become visible per arrival
 * (Section 13's "重ねて出さない" -- never stack multiple ambient encounters on the same visit),
 * picked among whatever's eligible at this location by the same deterministic-per-day hash
 * `content/eventEngine.ts`'s recurring events already use, then gated again by `occurrenceChance` so
 * most eligible days still show nothing (the anticipation Section 9 asks for, not a guarantee).
 * A pure no-op (returns `state` unchanged) if nothing fires -- safe to call on every single move.
 */
export function resolveMomentEventArrival(state: CoreState, location: LocationId): CoreState {
  const candidates = MOMENT_EVENT_DEFS.filter((d) => d.location === location && momentEventEligibleToShow(d, state));
  if (candidates.length === 0) return state;
  const ranked = candidates
    .map((d) => ({ d, key: pseudoChance(`momentrank_${d.id}_${state.day}`) }))
    .sort((a, b) => b.key - a.key);
  for (const { d } of ranked) {
    if (pseudoChance(`${d.id}_${state.day}`) < d.occurrenceChance) {
      return { ...state, momentEventShownDay: { ...state.momentEventShownDay, [d.id]: state.day } };
    }
  }
  return state;
}

/** The moment event currently awaiting a response at this location, if any -- shown today, at this
 *  exact location, and not yet resolved (`flags[`moment_${id}_resolved`]` unset). Stays visible for
 *  the REST of the day even across repeated visits (never a one-frame popup), and silently stops
 *  being eligible the moment the day turns over regardless of whether the player ever responded
 *  (Section 23: an ignored moment event does not carry over or nag on a later day). */
export function activeMomentEventAt(location: LocationId, state: CoreState): MomentEventDef | null {
  const def = MOMENT_EVENT_DEFS.find(
    (d) => d.location === location && state.momentEventShownDay[d.id] === state.day && !state.flags[`moment_${d.id}_resolved`],
  );
  return def ?? null;
}

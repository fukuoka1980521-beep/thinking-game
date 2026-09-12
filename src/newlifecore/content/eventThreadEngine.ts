/**
 * PHASE_15 Section 25-31 -- pure derivation functions for Event Threads, mirroring
 * `content/trajectoryEngine.ts`/`content/localProblemEngine.ts`'s own split: everything here reads
 * `CoreState` only; the only place `state.eventThreads` is ever written is `engine.ts`'s
 * `discoverEventThread`/`progressEventThread`/`tickEventThreadsForNewDay`.
 */
import { npcAvailabilityAt } from "../schedule";
import type { CoreState, LocationId } from "../types";
import { EVENT_THREAD_DEFS, type EventThreadDef } from "./eventThreadDefs";

export function eventThreadRuntimeState(def: EventThreadDef, state: CoreState) {
  return state.eventThreads[def.id] ?? null;
}

const CLOSED_STATUSES = new Set(["RESOLVED", "ABANDONED", "RESOLVED_WITHOUT_PLAYER"]);

export function eventThreadIsOpen(def: EventThreadDef, state: CoreState): boolean {
  const s = eventThreadRuntimeState(def, state);
  return Boolean(s && !CLOSED_STATUSES.has(s.status));
}

/** Section 26 -- ambient observation line, same "at most one per location visit" discipline as
 *  `content/day1.ts`'s `localProblemAmbientLineAt`: only for a thread not yet discovered at all. */
export function eventThreadObservationEligible(def: EventThreadDef, location: LocationId, state: CoreState): boolean {
  if (def.discoverLocation !== location) return false;
  if (state.day < def.minDay) return false;
  if (eventThreadRuntimeState(def, state) !== null) return false;
  return npcAvailabilityAt(def.discoverNpc, state.time, state.flags) === "AVAILABLE";
}

export function eventThreadDiscoverEligible(def: EventThreadDef, location: LocationId, state: CoreState): boolean {
  return eventThreadObservationEligible(def, location, state);
}

/** Section 27 -- the ordinary "ask about it again" action, offered only once discovered, only while
 *  still open, only at the current stage's own NPC/location, and only once real days have passed
 *  since the previous beat (`minDaysSincePrev`) -- a thread cannot be rushed through in one sitting. */
export function eventThreadNextStageEligible(def: EventThreadDef, location: LocationId, state: CoreState): boolean {
  const s = eventThreadRuntimeState(def, state);
  if (!s || CLOSED_STATUSES.has(s.status)) return false;
  if (s.stageIndex >= def.stages.length) return false;
  const stage = def.stages[s.stageIndex];
  if (stage.location !== location) return false;
  const sincePrev = state.day - (s.stageIndex === 0 ? s.discoveredOnDay : s.lastPlayerProgressDay);
  if (sincePrev < stage.minDaysSincePrev) return false;
  return npcAvailabilityAt(stage.npc, state.time, state.flags) === "AVAILABLE";
}

/** Section 19 -- diagnostic/tick support: threads currently open and eligible for the
 *  `autoProgressAfterDays` fallback, called once per day from `startNewDay` (mirrors
 *  `dueLocalProblemResolutions`/`dueActivityResolutions`'s own shape exactly). */
export function dueEventThreadAutoResolutions(state: CoreState): EventThreadDef[] {
  const out: EventThreadDef[] = [];
  for (const def of EVENT_THREAD_DEFS) {
    const s = eventThreadRuntimeState(def, state);
    if (!s || CLOSED_STATUSES.has(s.status)) continue;
    if (state.day - s.lastPlayerProgressDay >= def.autoProgressAfterDays) out.push(def);
  }
  return out;
}

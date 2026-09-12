/**
 * PHASE_13_NEW_LIFE_WORLD_ACTIVITY_AND_LOCAL_PROBLEMS_V1 -- pure derivation functions for the
 * LOCAL PROBLEM LOOP, mirroring `trajectoryEngine.ts`'s own discipline exactly: everything here is
 * computed from state the codebase already keeps, never a second mutable status struct beyond the
 * three small `CoreState` maps `types.ts` added. These functions only ever answer "is X currently
 * eligible" or "what should today's tick do" -- state MUTATION happens only in `engine.ts`, and
 * scene/narrative TEXT happens only in `content/day1.ts`, matching this codebase's standing
 * "only engine.ts mutates CoreState" rule.
 */
import { npcAvailabilityAt } from "../schedule";
import type { CoreState } from "../types";
import { LOCAL_PROBLEM_DEFS } from "./localProblemDefs";
import type { LocalProblemDef } from "./localProblemDefs";

export function isLocalProblemDiscovered(def: LocalProblemDef, state: CoreState): boolean {
  return state.localProblemsKnown[def.id] !== undefined;
}

export function isLocalProblemResolved(def: LocalProblemDef, state: CoreState): boolean {
  const status = state.localProblemStatus[def.id];
  return status === "resolved" || status === "resolved_without_player";
}

/** Section 13 -- the ambient observation cue is shown once the problem is old enough to exist and
 *  hasn't been discovered or resolved yet. Deliberately NOT gated on the owning NPC being present --
 *  an ambient line about them is exactly the kind of thing noticeable whether or not they're there
 *  right now (e.g. Daisuke's unopened envelope sits on the counter whether he's mid-haircut or not). */
export function localProblemObservationEligible(def: LocalProblemDef, state: CoreState): boolean {
  if (state.day < def.minDay) return false;
  if (isLocalProblemDiscovered(def, state)) return false;
  if (isLocalProblemResolved(def, state)) return false;
  return true;
}

/** Section 4/13 -- turning the ambient cue into real knowledge is a real, structural action (asking
 *  about it), which requires the owning NPC to actually be there to ask. */
export function localProblemDiscoverEligible(def: LocalProblemDef, state: CoreState): boolean {
  if (!localProblemObservationEligible(def, state)) return false;
  return npcAvailabilityAt(def.npc, state.time, state.flags) === "AVAILABLE";
}

/** Section 6 -- "help" is offered once known, not yet resolved, and (for accumulate-type problems)
 *  not already done today -- a same-day repeat would be spam, not a second day of real effort. */
export function localProblemHelpEligible(def: LocalProblemDef, state: CoreState): boolean {
  if (!def.helpActionLabel) return false;
  if (!isLocalProblemDiscovered(def, state)) return false;
  if (isLocalProblemResolved(def, state)) return false;
  if (def.helpMode === "immediate" && state.localProblemStatus[def.id] === "player_helped") return false;
  const lastAction = state.localProblemLastPlayerAction[def.id];
  if (lastAction === state.day) return false;
  return npcAvailabilityAt(def.npc, state.time, state.flags) === "AVAILABLE";
}

/** Section 6/7 -- "connect to another NPC" is offered once known, not yet resolved, and only if
 *  this def actually has a connect target -- never offered as a second copy of "help". Requires the
 *  CONNECT target (not the origin NPC) to be reachable, since this action is a conversation with
 *  them, not with the problem's owner. */
export function localProblemConnectEligible(def: LocalProblemDef, state: CoreState): boolean {
  if (!def.connectNpc) return false;
  if (!isLocalProblemDiscovered(def, state)) return false;
  if (isLocalProblemResolved(def, state)) return false;
  if (state.localProblemStatus[def.id] === "player_connected") return false;
  return npcAvailabilityAt(def.connectNpc, state.time, state.flags) === "AVAILABLE";
}

/** Exported so `engine.ts`'s help mutator can decide, on the exact action that satisfies it,
 *  whether to fix the resolution anchor (Section 2's clock fix) this turn. */
export function helpAccumulationMet(def: LocalProblemDef, state: CoreState): boolean {
  if (def.helpMode !== "accumulate") return true;
  return (state.localProblemHelpCount[def.id] ?? 0) >= (def.helpThreshold ?? 1);
}

/**
 * Section 7/19 -- called once per day (from `engine.ts`'s `startNewDay`, mirroring the recurring
 * event engine and trajectory late-consequence's own "tick on day start" shape). Returns the list of
 * defs that should resolve TODAY plus which text/knownBy applies, WITHOUT mutating anything --
 * `engine.ts` is the only place that actually writes the resulting WorldFacts/status.
 *
 * PHASE_15 Section 2 -- ACTIVITY CONSEQUENCE CLOCK fix, identical mechanism/fix as
 * `activityEngine.ts`'s `dueActivityResolutions`: measures `resolveAfterDays` from
 * `localProblemResolutionAnchor[def.id]` (the day the resolution condition was FIRST satisfied,
 * fixed once in `engine.ts`'s help/connect mutators) instead of the most recent action, so
 * continuing to help/connect after the anchor is set can never defer the world-change.
 */
export interface LocalProblemResolution {
  def: LocalProblemDef;
  outcome: "resolved" | "resolved_without_player";
}

export function dueLocalProblemResolutions(state: CoreState): LocalProblemResolution[] {
  const out: LocalProblemResolution[] = [];
  for (const def of LOCAL_PROBLEM_DEFS) {
    if (isLocalProblemResolved(def, state)) continue;
    const status = state.localProblemStatus[def.id];
    if (status === "player_helped" || status === "player_connected") {
      const anchor = state.localProblemResolutionAnchor[def.id];
      if (anchor === undefined) continue; // accumulation threshold not yet reached
      if (state.day - anchor >= def.resolveAfterDays) {
        out.push({ def, outcome: "resolved" });
      }
      continue;
    }
    // Never engaged at all -- only resolves on its own if this def defines that path.
    if (def.autoResolveAfterDays !== undefined && state.day >= def.minDay + def.autoResolveAfterDays) {
      out.push({ def, outcome: "resolved_without_player" });
    }
  }
  return out;
}

/**
 * PHASE 10.20 Variant A: Material + Hybrid, no Dynamic State. Template selection is a pure function
 * of CANONICAL facts only (visit history / shared-history presence) -- never a momentary pressure
 * reading, since Variant A has no such concept.
 */

import type { ActionId, CanonicalState, DayMacroSkeleton } from "./types";
import { resolveAction, type DayResult, type ResolveDeps } from "./resolveAction";

const selectVisitTemplate: ResolveDeps["selectVisitTemplate"] = (npc, state) => {
  const hasSharedHistory = state.sharedHistory.some((h) => h.npc === npc);
  return hasSharedHistory ? "revisit_with_memory" : "revisit_brief";
};

/** Variant A has no availability concept -- Jin always engages once eligible (day >= 6), the same
 *  way every other NEW LIFE first-meeting has always worked in this codebase (unconditional once a
 *  scene is reached). */
const allowJinToEngage: ResolveDeps["allowJinToEngage"] = () => true;

const DEPS: ResolveDeps = { selectVisitTemplate, allowJinToEngage };

export function resolveActionVariantA(state: CanonicalState, daySkeleton: DayMacroSkeleton, action: ActionId): { result: DayResult; nextState: CanonicalState } {
  return resolveAction(state, daySkeleton, action, DEPS);
}

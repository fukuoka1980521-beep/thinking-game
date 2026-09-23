/**
 * PHASE 10.20 Variant B: Material + Hybrid + Minimal Dynamic State.
 *
 * Dynamic State (familiarity per NPC) is tracked in a SEPARATE object from CanonicalState, never
 * merged into it (directive Section 9: Dynamic State never writes canonical facts). Template
 * selection reads a fresh per-day snapshot + the conditional rules (`dynamicState.ts`) -- the only
 * difference from Variant A's `resolveAction` call is WHICH deps functions are injected; the shared
 * `resolveAction` code itself is byte-identical to Variant A's.
 */

import type { ActionId, CanonicalState, DayMacroSkeleton, NpcId } from "./types";
import { resolveAction, type DayResult, type ResolveDeps } from "./resolveAction";
import { advanceFamiliarity, buildSnapshot, evaluateConditionalRules, type Ordinal } from "./dynamicState";

export type FamiliarityMap = Partial<Record<NpcId, Ordinal>>;

export function resolveActionVariantB(state: CanonicalState, daySkeleton: DayMacroSkeleton, action: ActionId, familiarity: FamiliarityMap): { result: DayResult; nextState: CanonicalState; nextFamiliarity: FamiliarityMap } {
  const selectVisitTemplate: ResolveDeps["selectVisitTemplate"] = (npc, s, day) => {
    const priorFamiliarity: Ordinal = familiarity[npc] ?? "NONE";
    const snapshot = buildSnapshot(s, day, action, npc, priorFamiliarity);
    const rules = evaluateConditionalRules(snapshot);
    if (rules.extendedExchange === "SUPPRESS") return "revisit_brief_busy";
    if (rules.socialExchange === "ENCOURAGE" && rules.memoryReference === "ENCOURAGE") return "revisit_with_memory_extended";
    if (rules.memoryReference === "ENCOURAGE") return "revisit_with_memory";
    return "revisit_brief";
  };

  const allowJinToEngage: ResolveDeps["allowJinToEngage"] = (s, day) => {
    // Availability is with respect to Jin himself; familiarity is irrelevant to whether he has time.
    const snapshot = buildSnapshot(s, day, action, "jin", "NONE");
    const rules = evaluateConditionalRules(snapshot);
    return rules.npcEngagesProactively === "ALLOW";
  };

  const { result, nextState } = resolveAction(state, daySkeleton, action, { selectVisitTemplate, allowJinToEngage });

  let nextFamiliarity = familiarity;
  if (result.npc) {
    const prior: Ordinal = familiarity[result.npc] ?? "NONE";
    const advanced = advanceFamiliarity(prior, true, result.meaningfulSocialExchange);
    nextFamiliarity = { ...familiarity, [result.npc]: advanced };
  }

  return { result, nextState, nextFamiliarity };
}

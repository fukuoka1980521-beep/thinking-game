/**
 * PHASE 10.20: shared action-resolution logic. Both variants call this SAME function; they differ
 * only in the two injected decision functions (`selectVisitTemplate`, `allowJinToEngage`) --
 * everything else (fact-granting, Material requirement checking, world-event witnessing, Saeki
 * recognition-eligibility gating) is byte-identical code shared by both, per directive Section 3's
 * fairness requirement.
 */

import type { ActionId, CanonicalState, DayMacroSkeleton, NpcId } from "./types";
import { getGenericTemplate, getNpcTemplate, type StoryletKey } from "./storylets";
import { classifyProvenance } from "../state-admission/classifyProvenance";
import { decideAdmission } from "../state-admission/admissionGate";
import { applyStateDelta } from "../state-admission/applyStateDelta";
import type { StructuredPlayerActionInput } from "../state-admission/types";

export interface DayResult {
  day: number;
  action: ActionId;
  npc?: NpcId;
  storylet: StoryletKey;
  narration: string[];
  factsGranted: string[];
  materialRequirements: { category: "PRACTICAL_OUTCOME" | "SOCIAL_ENGAGEMENT" | "WORLD_ACTIVITY"; satisfied: boolean }[];
  worldEventsWitnessed: string[];
  meaningfulSocialExchange: boolean;
}

const VISIT_ACTION_NPC: Partial<Record<ActionId, NpcId>> = { VISIT_YOHEI: "yohei", VISIT_CAFE: "miyoko" };

export interface ResolveDeps {
  selectVisitTemplate: (npc: NpcId, state: CanonicalState, daySkeleton: DayMacroSkeleton) => Exclude<StoryletKey, "generic_explore" | "generic_rest" | "generic_practical_need" | "generic_personal_time" | "generic_follow_up" | "generic_keep_promise" | "jin_suggestion" | "saeki_first_named" | "saeki_mismatch_day14">;
  /** Gates WHETHER Jin engages (his stable personality rule's CONTENT is identical either way). */
  allowJinToEngage: (state: CanonicalState, daySkeleton: DayMacroSkeleton) => boolean;
}

export function resolveAction(state: CanonicalState, daySkeleton: DayMacroSkeleton, action: ActionId, deps: ResolveDeps): { result: DayResult; nextState: CanonicalState } {
  const worldEventsWitnessed = daySkeleton.worldEvents; // this experiment treats every scheduled world event as witnessed once PLAYER takes any action that day (kept simple/deterministic; a finer PLAYER_PRESENT model is out of scope for this microtest)

  const npc = VISIT_ACTION_NPC[action];
  let storylet: StoryletKey;
  let narration: string[];
  let isSocialEngagement: boolean;
  let factsGranted: string[] = [];

  if (npc) {
    const visitCount = state.npcVisitCounts[npc] ?? 0;
    storylet = visitCount === 0 ? "first_visit" : deps.selectVisitTemplate(npc, state, daySkeleton);
    const t = getNpcTemplate(npc, storylet);
    narration = t.narration;
    isSocialEngagement = t.isSocialEngagement;
    factsGranted.push(`met_${npc}`, `visited_${npc}_day${state.day}`);
  } else if (action === "FOLLOW_UP_PENDING" && state.day >= 6 && deps.allowJinToEngage(state, daySkeleton)) {
    storylet = "jin_suggestion";
    const t = getNpcTemplate("jin", storylet);
    narration = t.narration;
    isSocialEngagement = t.isSocialEngagement;
    factsGranted.push("met_jin", `jin_suggestion_day${state.day}`);
  } else if (action === "HANDLE_PRACTICAL_NEED" && daySkeleton.recognitionEligible) {
    // Anomaly eligibility is fact/history-based and IDENTICAL for both variants (directive Section
    // 21) -- never gated by Dynamic State.
    const alreadyMet = state.facts.includes("met_saeki");
    storylet = alreadyMet ? "saeki_mismatch_day14" : "saeki_first_named";
    const t = getNpcTemplate("saeki", storylet);
    narration = t.narration;
    isSocialEngagement = t.isSocialEngagement;
    factsGranted.push(alreadyMet ? "saeki_mismatch_witnessed" : "met_saeki");
  } else {
    storylet = action === "EXPLORE" ? "generic_explore" : action === "REST" ? "generic_rest" : action === "HANDLE_PRACTICAL_NEED" ? "generic_practical_need" : action === "PERSONAL_TIME" ? "generic_personal_time" : action === "FOLLOW_UP_PENDING" ? "generic_follow_up" : "generic_keep_promise";
    const t = getGenericTemplate(action);
    narration = t.narration;
    isSocialEngagement = t.isSocialEngagement;
  }

  // State Admission (PHASE 10.18, reused identically by both variants) -- every fact grant here is
  // a structured, deterministic outcome of the chosen ActionId, never inferred from narration text.
  const input: StructuredPlayerActionInput = {
    sourceType: "PLAYER_STRUCTURED_ACTION",
    actionLabel: `${action}${npc ? `:${npc}` : ""}:day${state.day}`,
    factsGrantedByGameRules: factsGranted,
    deterministic: true,
  };
  const provenance = classifyProvenance(input);
  const admission = decideAdmission(provenance.provenanceClass, input);
  const newFacts = applyStateDelta(state.facts, admission, { added: factsGranted });

  const materialRequirements: DayResult["materialRequirements"] = [];
  if (npc) {
    materialRequirements.push({ category: "PRACTICAL_OUTCOME", satisfied: true }); // a shop/café visit always concludes its ordinary transaction in this experiment's storylets
    materialRequirements.push({ category: "SOCIAL_ENGAGEMENT", satisfied: isSocialEngagement });
    if (storylet === "revisit_brief_busy") materialRequirements.push({ category: "WORLD_ACTIVITY", satisfied: true });
  }

  // BUGFIX (caught during this phase's own verification run, before any trajectory was treated as
  // evidence): a shared-history entry must be seeded on ANY npc visit, not only ones flagged
  // isSocialEngagement -- even a plain first/brief visit produces a concrete, later-referenceable
  // fact (what was bought, that they met at all), matching real NEW LIFE precedent (the milk
  // purchase itself, not a separately "earned" warmth level, is what Day2 later references). Without
  // this, sharedHistory could never bootstrap from empty, and Variant A's memory-based template
  // selection would be permanently stuck at "revisit_brief" -- confirmed via the first real
  // trajectory run, fixed here, not worked around in trajectory data.
  const sharedHistory = npc ? [...state.sharedHistory, { id: `${npc}_day${state.day}`, day: state.day, npc, description: isSocialEngagement ? `meaningful exchange with ${npc} on day ${state.day}` : `visit to ${npc} on day ${state.day}` }] : state.sharedHistory;

  const npcVisitCounts = npc ? { ...state.npcVisitCounts, [npc]: (state.npcVisitCounts[npc] ?? 0) + 1 } : state.npcVisitCounts;

  const nextState: CanonicalState = {
    ...state,
    facts: newFacts,
    sharedHistory,
    npcVisitCounts,
  };

  return {
    result: { day: state.day, action, npc, storylet, narration, factsGranted, materialRequirements, worldEventsWitnessed, meaningfulSocialExchange: isSocialEngagement },
    nextState,
  };
}

import type { ActionId, CanonicalState } from "./types";
import { DAY_SKELETON } from "./sharedSpec";
import { resolveActionVariantA } from "./variantAEngine";
import { resolveActionVariantB, type FamiliarityMap } from "./variantBEngine";
import type { DayResult } from "./resolveAction";

export function createInitialCanonicalState(): CanonicalState {
  return { day: 1, facts: [], sharedHistory: [], pendingMatters: [], softCommitments: [], npcVisitCounts: {} };
}

export interface CausalTraceRow {
  day: number;
  startFactsCount: number;
  action: ActionId;
  worldActivity: string[];
  npcActivity: string; // storylet key, human-readable
  materialRequirements: DayResult["materialRequirements"];
  visibleResult: string[]; // narration
  authoritativeEvents: string[]; // factsGranted
  stateDelta: { added: string[] };
  dynamicStateNote?: string; // Variant B only
}

export function runTrajectoryVariantA(actions: ActionId[]): CausalTraceRow[] {
  let state = createInitialCanonicalState();
  const rows: CausalTraceRow[] = [];
  for (let i = 0; i < DAY_SKELETON.length; i++) {
    const daySkeleton = DAY_SKELETON[i];
    state = { ...state, day: daySkeleton.day };
    const action = actions[i];
    const { result, nextState } = resolveActionVariantA(state, daySkeleton, action);
    rows.push({
      day: daySkeleton.day,
      startFactsCount: state.facts.length,
      action,
      worldActivity: daySkeleton.worldEvents,
      npcActivity: result.storylet,
      materialRequirements: result.materialRequirements,
      visibleResult: result.narration,
      authoritativeEvents: result.factsGranted,
      stateDelta: { added: result.factsGranted },
    });
    state = nextState;
  }
  return rows;
}

export function runTrajectoryVariantB(actions: ActionId[]): CausalTraceRow[] {
  let state = createInitialCanonicalState();
  let familiarity: FamiliarityMap = {};
  const rows: CausalTraceRow[] = [];
  for (let i = 0; i < DAY_SKELETON.length; i++) {
    const daySkeleton = DAY_SKELETON[i];
    state = { ...state, day: daySkeleton.day };
    const action = actions[i];
    const { result, nextState, nextFamiliarity } = resolveActionVariantB(state, daySkeleton, action, familiarity);
    rows.push({
      day: daySkeleton.day,
      startFactsCount: state.facts.length,
      action,
      worldActivity: daySkeleton.worldEvents,
      npcActivity: result.storylet,
      materialRequirements: result.materialRequirements,
      visibleResult: result.narration,
      authoritativeEvents: result.factsGranted,
      stateDelta: { added: result.factsGranted },
      dynamicStateNote: result.npc ? `familiarity(${result.npc}) -> ${nextFamiliarity[result.npc]}` : undefined,
    });
    state = nextState;
    familiarity = nextFamiliarity;
  }
  return rows;
}

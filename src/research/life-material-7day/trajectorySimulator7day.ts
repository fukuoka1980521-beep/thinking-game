import type { ActionId } from "../parallel-14day/types";
import type { ContentCondition } from "./types";
import { createInitialState7, resolveAction7day, type DayResult7 } from "./resolveAction7day";

export interface TraceRow7 {
  day: number;
  action: ActionId;
  startMaterials: string[]; // ids, ACTIVE only
  worldActivity: string[];
  npcActivity: string[]; // narration
  catalystActivity: string[];
  newMaterial: string[]; // ids
  changedOrConsumedMaterial: string[]; // ids
  playerKnowledge: string[]; // material ids player now knows
  endMaterials: string[]; // ids, ACTIVE only, after this day
}

export function runTrajectory7day(actions: ActionId[], condition: ContentCondition): TraceRow7[] {
  let state = createInitialState7();
  const rows: TraceRow7[] = [];
  for (let i = 0; i < 7; i++) {
    const startMaterials = state.materials.filter((m) => m.status === "ACTIVE").map((m) => m.id);
    const { result, nextState }: { result: DayResult7; nextState: typeof state } = resolveAction7day(state, actions[i], condition);
    rows.push({
      day: result.day,
      action: result.action,
      startMaterials,
      worldActivity: result.worldActivity,
      npcActivity: result.narration,
      catalystActivity: result.catalystNarration,
      newMaterial: result.materialsCreated.map((m) => m.id),
      changedOrConsumedMaterial: result.materialsConsumed,
      playerKnowledge: nextState.materials.filter((m) => m.knownBy.includes("player")).map((m) => m.id),
      endMaterials: nextState.materials.filter((m) => m.status === "ACTIVE").map((m) => m.id),
    });
    state = nextState;
  }
  return rows;
}

import { NPC_DEFS, npcDisplayName } from "../npcDefs";
import { npcAvailabilityAt } from "../schedule";
import { formatClock } from "../types";
import type { CoreState, NpcId } from "../types";
import type { NpcAiContext } from "./types";

const MEMORY_WINDOW = 6; // last N turns with this NPC -- bounded, per directive's "全文を毎回送らない"

function describeMood(npc: NpcId, state: CoreState): string {
  const availability = npcAvailabilityAt(npc, state.time, state.flags);
  if (availability === "BUSY") return "少し立て込んでいて、余裕がない";
  if (state.time >= 17 * 60) return "一日の終わりが近く、少し疲れている";
  return "落ち着いている";
}

function locationLabel(loc: string): string {
  const names: Record<string, string> = {
    TRIAL_HOUSE: "仮住まい",
    CHALLENGE_CENTER: "チャレンジセンター",
    YOHEI_STORE: "洋平商店",
    CAFE_NODOKA: "喫茶のどか",
    COMMUNITY_HALL: "集会所",
    SHOPPING_STREET: "商店街",
  };
  return names[loc] ?? loc;
}

export function buildNpcAiContext(npc: NpcId, state: CoreState, playerInput: string): NpcAiContext {
  const def = NPC_DEFS[npc];
  const scheduleBlock = def.schedule.find((b) => state.time >= b.fromMinutes && state.time < b.toMinutes);
  const relevantFacts = state.worldFacts.filter((f) => f.knownBy.includes(npc)).map((f) => f.text);
  const memory = (state.npcMemory[npc] ?? []).slice(-MEMORY_WINDOW);

  return {
    npcId: npc,
    displayName: npcDisplayName(npc),
    identity: def.identity,
    personality: def.personality,
    speechStyle: def.speechStyle,
    values: def.values,
    likes: def.likes,
    dislikes: def.dislikes,
    currentMood: describeMood(npc, state),
    currentScheduleNote: scheduleBlock?.note ?? "特に決まった用事はない時間",
    currentLocation: state.playerLocation,
    knownFacts: [...def.knowledge.firsthand, ...def.knowledge.heard, ...relevantFacts],
    unknownFacts: def.knowledge.unknowns,
    memoryOfPlayer: memory,
    relationshipHistory: Object.entries(def.relationships).map(([otherId, desc]) => `${npcDisplayName(otherId as NpcId)}: ${desc}`),
    currentScene: `${locationLabel(state.playerLocation)}で、プレイヤーと向き合っている`,
    day: 1,
    timeLabel: formatClock(state.time),
    worldFactsRelevant: relevantFacts,
    playerInput,
  };
}

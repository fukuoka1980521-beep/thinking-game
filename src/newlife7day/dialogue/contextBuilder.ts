/**
 * PHASE_22 vertical slice -- builds `NpcAiContext` (imported as-is from `newlifecore/dialogue/
 * types.ts`, never redefined here) from this slice's own small `Core7DayState`. Every field this
 * slice has no concept of (promises, world facts, shop menus, trajectory choices, Fortune memory)
 * is filled with its own documented "nothing here yet" value (`null`/`[]`/`false`) rather than
 * fabricated -- the AI is never handed a signal this slice doesn't actually track.
 */
import type { NpcAiContext } from "../../newlifecore/dialogue/types";
import { SLICE_7DAY_NPCS } from "../npcDefs";
import { hinaOpeningLine, yoheiOpeningLine } from "../content";
import type { Core7DayState, Slice7DayNpcId } from "../types";

const MEMORY_WINDOW = 6;

function daysSinceLastMeeting(state: Core7DayState, npcId: Slice7DayNpcId): number | null {
  const memory = state.npcMemory[npcId];
  if (memory.length === 0) return null;
  const lastDay = memory[memory.length - 1].day;
  return state.day - lastDay;
}

export function buildNpc7DayAiContext(state: Core7DayState, npcId: Slice7DayNpcId, playerInput: string): NpcAiContext {
  const def = SLICE_7DAY_NPCS[npcId];
  const memory = state.npcMemory[npcId];
  const currentScene = npcId === "yohei" ? yoheiOpeningLine(state) : hinaOpeningLine(state);
  const isYoheiDay1 = npcId === "yohei" && state.day === 1;
  const isYoheiDay2 = npcId === "yohei" && state.day === 2;

  return {
    npcId,
    displayName: def.displayName,
    identity: def.identity,
    personality: def.personality,
    speechStyle: def.speechStyle,
    values: def.values,
    likes: def.likes,
    dislikes: def.dislikes,
    currentMood: state.day === 1 ? "いつも通り、少し気忙しい" : "昨日より落ち着いている",
    currentScheduleNote: "日中、店先で作業をしている時間帯。",
    currentLocation: def.homeLocation,
    knownFacts: [],
    unknownFacts: [],
    memoryOfPlayer: memory.slice(-MEMORY_WINDOW),
    historicalTurnCount: memory.length,
    daysSinceLastMeeting: daysSinceLastMeeting(state, npcId),
    pendingPromiseWithPlayer: false,
    missedPromiseWithPlayer: false,
    relationshipHistory: [],
    hiddenBackground: def.hiddenBackground[state.day],
    currentScene,
    day: state.day,
    timeLabel: "日中",
    worldFactsRelevant: [],
    availableMenu: null,
    recentPurchasesToday: [],
    knownLocalProblemMentions: [],
    currentEvent: isYoheiDay1 ? "配達待ち" : null,
    eventState: isYoheiDay1 ? "未解決" : null,
    whatJustHappened: isYoheiDay2 ? "今朝、配達が届いた" : null,
    recentSharedEventsToday: [],
    unresolvedThreadsKnown: [],
    recentActivitiesToday: [],
    currentChoiceContext: null,
    fortuneMemory: null,
    playerInput,
  };
}

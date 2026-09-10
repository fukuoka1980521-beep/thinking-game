/**
 * NEW LIFE CORE REDESIGN V1 -- the only place CoreState is ever mutated. AI output never reaches
 * this file directly; it only ever supplies a visibleUtterance string that gets stored verbatim
 * as a ConversationTurn (directive Section 14: "AI出力によってゲームstateを直接確定しない").
 */
import { resolveWorldEvents } from "./content/day1WorldEvents";
import { DAY_FORCE_SLEEP_MINUTES, DAY_SLEEP_AVAILABLE_FROM } from "./types";
import type { ClockMinutes, ConversationTurn, CoreState, LocationId, NpcId, WorldFact } from "./types";

export function advanceTime(state: CoreState, minutes: number): CoreState {
  const prevTime = state.time;
  let next: CoreState = { ...state, time: state.time + minutes };
  next = resolveWorldEvents(prevTime, next);
  if (next.time >= DAY_FORCE_SLEEP_MINUTES) {
    next = { ...next, ended: true };
  }
  return next;
}

export function moveTo(state: CoreState, location: LocationId): CoreState {
  const withTime = advanceTime(state, 15); // flat travel cost, directive Section 2's minute-based time economy
  return {
    ...withTime,
    playerLocation: location,
    visitedLocations: withTime.visitedLocations.includes(location) ? withTime.visitedLocations : [...withTime.visitedLocations, location],
  };
}

export function recordConversationTurn(state: CoreState, npc: NpcId, playerUtterance: string, npcReply: string): CoreState {
  const withTime = advanceTime(state, 10); // one free-text exchange costs real in-world minutes -- a soft bound against infinite chat (directive Section 7's "無制限AIチャットにはしない")
  const turn: ConversationTurn = { time: withTime.time, playerUtterance, npcReply };
  return {
    ...withTime,
    npcMemory: { ...withTime.npcMemory, [npc]: [...withTime.npcMemory[npc], turn] },
    npcImpression: { ...withTime.npcImpression, [npc]: withTime.npcImpression[npc] + 1 },
  };
}

export function addWorldFact(state: CoreState, fact: Omit<WorldFact, "id"> & { id: string }): CoreState {
  if (state.worldFacts.some((f) => f.id === fact.id)) return state;
  return { ...state, worldFacts: [...state.worldFacts, fact] };
}

export function doShortAction(state: CoreState, minutes = 10): CoreState {
  return advanceTime(state, minutes);
}

export function canSleep(state: CoreState): boolean {
  return state.time >= DAY_SLEEP_AVAILABLE_FROM;
}

export function sleep(state: CoreState): CoreState {
  return { ...state, ended: true };
}

export function timeRemainingLabel(time: ClockMinutes): string {
  const remaining = DAY_FORCE_SLEEP_MINUTES - time;
  if (remaining <= 0) return "まもなく日が変わる";
  return `${Math.floor(remaining / 60)}時間程度`;
}

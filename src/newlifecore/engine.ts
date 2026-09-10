/**
 * NEW LIFE CORE REDESIGN V1 -- the only place CoreState is ever mutated. AI output never reaches
 * this file directly; it only ever supplies a visibleUtterance string that gets stored verbatim
 * as a ConversationTurn (directive Section 14: "AI出力によってゲームstateを直接確定しない").
 */
import { resolveWorldEvents } from "./content/day1WorldEvents";
import { itemById } from "./content/shop";
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

export interface PurchaseResult {
  state: CoreState;
  totalCost: number;
  purchasedLabels: string[];
}

/**
 * Directive Section 8/9/10 -- the ONLY function that ever changes `money`/`inventory`. Never
 * called from AI reply text; only from a real, structural UI confirm action
 * (NewlifeCoreApp.tsx's order/shopping picker). A no-op (zero cost, empty labels, unchanged state)
 * if nothing was selected or the player cannot afford it -- canonical actions never partially
 * succeed silently.
 */
export function purchaseItems(state: CoreState, npc: NpcId, itemIds: string[]): PurchaseResult {
  const items = itemIds.map((id) => itemById(id)).filter((i): i is NonNullable<ReturnType<typeof itemById>> => Boolean(i));
  const totalCost = items.reduce((sum, i) => sum + i.price, 0);
  if (items.length === 0 || totalCost > state.money) {
    return { state, totalCost, purchasedLabels: [] };
  }
  const withTime = advanceTime(state, 10); // one short transaction, same order of magnitude as a conversation turn
  const inventory = { ...withTime.inventory };
  for (const item of items) inventory[item.id] = (inventory[item.id] ?? 0) + 1;
  const labels = items.map((i) => i.label);
  const withFact = addWorldFact(withTime, {
    id: `purchase_${npc}_${withTime.time}`,
    time: withTime.time,
    text: `PLAYERが${labels.join("、")}を買った`,
    knownBy: [npc],
  });
  return { state: { ...withFact, money: withFact.money - totalCost, inventory }, totalCost, purchasedLabels: labels };
}

/** Directive Section 12/13/15 -- a real trial-house living action with a real result (food in
 *  hand becomes a meal), not a button that does nothing. Requires at least one food-ingredient
 *  item actually owned; a no-op otherwise (the UI never offers this action when it would be one). */
export function canCookMeal(state: CoreState): boolean {
  return Object.entries(state.inventory).some(([id, count]) => count > 0 && itemById(id)?.isFoodIngredient);
}

export function cookAndEat(state: CoreState): CoreState {
  if (!canCookMeal(state)) return state;
  const withTime = advanceTime(state, 20);
  return addWorldFact({ ...withTime, flags: { ...withTime.flags, ateMeal: true } }, { id: "ate_meal_day1", time: withTime.time, text: "PLAYERは仮住まいで食事をした", knownBy: [] });
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

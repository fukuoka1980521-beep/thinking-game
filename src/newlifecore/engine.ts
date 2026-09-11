/**
 * NEW LIFE CORE REDESIGN V1 -- the only place CoreState is ever mutated. AI output never reaches
 * this file directly; it only ever supplies a visibleUtterance string that gets stored verbatim
 * as a ConversationTurn (directive Section 14: "AI出力によってゲームstateを直接確定しない").
 */
import { resolveWorldEvents } from "./content/day1WorldEvents";
import { itemById } from "./content/shop";
import { DAY_FORCE_SLEEP_MINUTES, DAY_SLEEP_AVAILABLE_FROM, DAY_START_MINUTES } from "./types";
import type { ClockMinutes, ConversationTurn, CoreState, LocationId, NpcId, RealWorldIntent, UserUpdateResponse, WorldFact } from "./types";

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
  const turn: ConversationTurn = { day: withTime.day, time: withTime.time, playerUtterance, npcReply };
  return {
    ...withTime,
    npcMemory: { ...withTime.npcMemory, [npc]: [...withTime.npcMemory[npc], turn] },
    npcImpression: { ...withTime.npcImpression, [npc]: withTime.npcImpression[npc] + 1 },
  };
}

export function addWorldFact(state: CoreState, fact: Omit<WorldFact, "id"> & { id: string }): CoreState {
  if (state.worldFacts.some((f) => f.id === fact.id)) return state;
  return { ...state, worldFacts: [...state.worldFacts, { ...fact, day: fact.day ?? state.day }] };
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

/**
 * PHASE_12_3 Section H/M -- the one function that crosses a day boundary. Persists everything that
 * should read as "the town remembers" (worldFacts, npcMemory, realWorldIntents, money, inventory,
 * intakeForm, all flags) and only resets what is genuinely day-scoped: the clock, location, and the
 * two flags that describe THIS day's own events (`ateMeal` -- a new day is a new question of
 * whether the player ate; `isRaining` -- yesterday's weather doesn't carry over). `flags` like
 * `met_*`, `intakeFormSubmitted`, `shelfFixed`, `jinCalledToYohei`, `rainHappened` persist
 * unchanged, which is also why day1WorldEvents.ts's one-time triggers correctly never refire on a
 * later day (their `!flags.x` guards are already false).
 */
export function startNewDay(state: CoreState): CoreState {
  const { ateMeal: _ateMeal, isRaining: _isRaining, ...persistentFlags } = state.flags;
  return {
    ...state,
    day: state.day + 1,
    time: DAY_START_MINUTES,
    playerLocation: "TRIAL_HOUSE",
    visitedLocations: ["TRIAL_HOUSE"],
    flags: persistentFlags,
    ended: false,
  };
}

/**
 * PHASE_12_3 Section H -- the ONLY place a RealWorldIntent is created. Called strictly from a real
 * UI confirm action (RealityBridgeOffer.tsx), never inferred from the conversation content itself
 * (mirrors purchaseItems' "structural action, not parsed AI text" discipline). Records exactly what
 * the player wrote as `playerStatement`/`intentLabel` -- no inferred label is ever constructed here
 * or anywhere else in this codebase.
 */
export function createRealWorldIntent(state: CoreState, npc: NpcId, playerStatement: string, intentLabel: string): CoreState {
  const withTime = advanceTime(state, 5);
  const intent: RealWorldIntent = {
    id: `intent_${npc}_${withTime.time}_${withTime.realWorldIntents.length}`,
    npc,
    createdOnDay: withTime.day,
    createdAt: withTime.time,
    playerStatement,
    intentLabel,
    checkedIn: false,
  };
  return addWorldFact(
    { ...withTime, realWorldIntents: [...withTime.realWorldIntents, intent] },
    { id: `${intent.id}_created`, time: withTime.time, text: `PLAYERは「${intentLabel}」を試してみると話した。`, knownBy: [npc] },
  );
}

/**
 * PHASE_12_3 Section H -- "その後どうだった？" answered through a real UI (RealityBridgeCheckIn.tsx,
 * the six-option/free-text panel), never scored. `USER_UPDATE`, not `ACTION_RESULT` -- no
 * success/failure framing is stored or derivable from this record; `response` is a plain category
 * of what happened, and `note` (optional) is the player's own words if they chose 自由記述.
 */
const USER_UPDATE_LABEL: Record<UserUpdateResponse, string> = {
  did_it: "やってみた",
  did_not: "やらなかった",
  partially: "少しだけやった",
  changed: "状況が変わった",
  undecided: "まだ決めていない",
  other: "自由記述",
};

export function checkInRealWorldIntent(state: CoreState, intentId: string, response: UserUpdateResponse, note: string): CoreState {
  const target0 = state.realWorldIntents.find((i) => i.id === intentId);
  if (!target0 || target0.checkedIn) return state; // true no-op, mirrors addWorldFact's dedupe discipline
  const withTime = advanceTime(state, 5);
  const target = withTime.realWorldIntents.find((i) => i.id === intentId)!;
  const updated: RealWorldIntent = { ...target, checkedIn: true, userUpdate: { day: withTime.day, response, note } };
  const withIntent = {
    ...withTime,
    realWorldIntents: withTime.realWorldIntents.map((i) => (i.id === intentId ? updated : i)),
  };
  const detail = note.trim() ? `「${note.trim()}」` : `「${USER_UPDATE_LABEL[response]}」`;
  return addWorldFact(withIntent, {
    id: `${intentId}_checked_in`,
    time: withTime.time,
    text: `PLAYERは、以前の「${target.intentLabel}」について、${detail}と話した。`,
    knownBy: [target.npc],
  });
}

export function timeRemainingLabel(time: ClockMinutes): string {
  const remaining = DAY_FORCE_SLEEP_MINUTES - time;
  if (remaining <= 0) return "まもなく日が変わる";
  return `${Math.floor(remaining / 60)}時間程度`;
}

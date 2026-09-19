/**
 * PHASE_22 vertical slice -- the only place `Core7DayState` is mutated. Every function here is
 * pure (returns a new state), matching `newlifecore/engine.ts`'s own "SYSTEM OWNS TRUTH" discipline
 * (Section 32) at this slice's own, much smaller scale.
 */
import type { ConversationTurn } from "../newlifecore/types";
import { ACTIONS_PER_DAY, canAffordToVisit, type Core7DayState, type Slice7DayLocationId, type Slice7DayNpcId } from "./types";

export function canReach(state: Core7DayState, location: Slice7DayLocationId): boolean {
  if (state.ended) return false;
  if (location === "TRIAL_HOUSE") return true;
  return canAffordToVisit(state);
}

/** Moving TO a destination (Yohei's store or the shopping street) spends one of the day's 2
 *  actions; returning to the trial house never does (Section 6's "home is the bookend"). */
export function moveTo(state: Core7DayState, location: Slice7DayLocationId): Core7DayState {
  if (!canReach(state, location)) return state;
  const spendsAction = location !== "TRIAL_HOUSE";
  const firstTimeAtCurrentLocation = !state.everVisited.includes(location);
  return {
    ...state,
    playerLocation: location,
    actionsUsedToday: spendsAction ? state.actionsUsedToday + 1 : state.actionsUsedToday,
    everVisited: firstTimeAtCurrentLocation ? [...state.everVisited, location] : state.everVisited,
    visitedToday: state.visitedToday.includes(location) ? state.visitedToday : [...state.visitedToday, location],
    firstTimeAtCurrentLocation,
  };
}

export function recordConversationTurn(state: Core7DayState, npcId: Slice7DayNpcId, turn: ConversationTurn): Core7DayState {
  return {
    ...state,
    npcMemory: { ...state.npcMemory, [npcId]: [...state.npcMemory[npcId], turn] },
  };
}

/** The slice's one meaningful choice (directive Section 10) -- only settable once, at Yohei's
 *  store, on Day 1; a later call on Day 2 is a no-op (the choice window has closed). */
export function setKeptEyeOutForDelivery(state: Core7DayState, value: boolean): Core7DayState {
  if (state.day !== 1 || state.playerLocation !== "YOHEI_STORE") return state;
  return { ...state, keptEyeOutForDelivery: value };
}

export function canAdvanceToDay2(state: Core7DayState): boolean {
  return state.day === 1 && !state.ended && state.playerLocation === "TRIAL_HOUSE";
}

/** Day1 -> Day2 transition. The delivery resolves unconditionally overnight (Event Spec's
 *  explicit "the outcome is not different -- this is deliberately NOT a skill check"); only the
 *  acknowledgment line Yohei gives depends on `keptEyeOutForDelivery`, read later by `content.ts`. */
export function advanceToDay2(state: Core7DayState): Core7DayState {
  if (!canAdvanceToDay2(state)) return state;
  return {
    ...state,
    day: 2,
    actionsUsedToday: 0,
    visitedToday: [],
    deliveryArrived: true,
  };
}

export function canEndSlice(state: Core7DayState): boolean {
  return state.day === 2 && !state.ended && state.playerLocation === "TRIAL_HOUSE";
}

export function endSlice(state: Core7DayState): Core7DayState {
  if (!canEndSlice(state)) return state;
  return { ...state, ended: true };
}

export { ACTIONS_PER_DAY };

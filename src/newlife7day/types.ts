/**
 * PHASE_22_VISUAL_FIRST_GATE_AND_ASSET_IMPORT_V1 -- the Day1+Day2 vertical slice's own canonical
 * state. Deliberately a small, separate module (not a change to `newlifecore`, which stays frozen
 * per PHASE_21 Section 14/PHASE_22 Section 14's explicit "do not implement the rest" instruction)
 * -- but reuses `newlifecore`'s own `NpcId`/`LocationId`/`ConversationTurn` types directly (Hina
 * and Yohei, and all 3 locations used here, are already valid members of those unions) rather than
 * inventing parallel ones, and reuses `newlifecore/dialogue/{types,envelope,deterministicAdapter,
 * liveAdapterClient}.ts` as-is for the AI responsibility boundary (Section 32/PHASE_18-19) --
 * those modules only depend on `NpcAiContext`, never on the full `newlifecore` CoreState.
 */
import type { ConversationTurn, LocationId, NpcId } from "../newlifecore/types";

/** The only 3 locations this slice uses -- a real subset of `newlifecore`'s `LocationId` union. */
export type Slice7DayLocationId = Extract<LocationId, "TRIAL_HOUSE" | "YOHEI_STORE" | "SHOPPING_STREET">;

/** The only 2 NPCs this slice uses -- a real subset of `newlifecore`'s `NpcId` union. */
export type Slice7DayNpcId = Extract<NpcId, "hina" | "yohei">;

export const ACTIONS_PER_DAY = 2;

export interface Core7DayState {
  day: 1 | 2;
  /** Resets to 0 at the start of each day. Moving to YOHEI_STORE or SHOPPING_STREET spends one;
   *  returning to TRIAL_HOUSE never does (Section 6's "1日の基本構造" -- home is the bookend, not
   *  a destination the budget is spent on). */
  actionsUsedToday: number;
  playerLocation: Slice7DayLocationId;
  /** Locations visited at least once, ever -- used only to vary ordinary-life text (Section 21),
   *  never to gate anything. */
  everVisited: Slice7DayLocationId[];
  /** Whether the CURRENT arrival at `playerLocation` is the very first time ever, computed by
   *  `moveTo` itself (never re-derived from `everVisited`, which `moveTo` has already updated to
   *  include this same arrival by the time an opening line is chosen -- reading `everVisited`
   *  there would make a first-ever meeting misread as a returning one). */
  firstTimeAtCurrentLocation: boolean;
  /** Locations visited on the CURRENT day specifically -- this is what Day 2's "what did the
   *  player skip" check reads (directive Section 8). */
  visitedToday: Slice7DayLocationId[];
  npcMemory: Record<Slice7DayNpcId, ConversationTurn[]>;
  /** The slice's one meaningful choice (directive Section 10): did the player choose to keep an
   *  eye out about Yohei's delivery on Day 1? `null` = never asked (player didn't visit Yohei's
   *  store on Day 1, or visited but the choice never came up). */
  keptEyeOutForDelivery: boolean | null;
  /** Set at the Day1->Day2 transition once, mirroring `newlifecore`'s own day1WorldEvents.ts
   *  pattern (a flag that flips once, read at query time -- never re-computed after the fact). */
  deliveryArrived: boolean;
  /** PHASE_22_5 Section "買い物に実ゲーム状態を持たせる" -- a real, persistent number a purchase
   *  actually changes, so buying is a checkable consequence rather than a confirmation line with
   *  nothing behind it. Starting value is arbitrary flavor (a few days' pocket money), not tuned
   *  balance -- this slice has no economy design, only a real state change. */
  money: number;
  /** Item labels bought, in purchase order -- the visible, persistent proof of `money` having
   *  actually moved (shown on the home screen so the player can check it without re-visiting the
   *  shop). */
  boughtItems: string[];
  ended: boolean;
}

export const STARTING_MONEY = 1000;
export const VEGETABLES_PRICE = 300;
export const VEGETABLES_LABEL = "野菜";

export function createInitial7DayState(): Core7DayState {
  return {
    day: 1,
    actionsUsedToday: 0,
    playerLocation: "TRIAL_HOUSE",
    everVisited: ["TRIAL_HOUSE"],
    firstTimeAtCurrentLocation: false,
    visitedToday: [],
    npcMemory: { hina: [], yohei: [] },
    keptEyeOutForDelivery: null,
    deliveryArrived: false,
    money: STARTING_MONEY,
    boughtItems: [],
    ended: false,
  };
}

export function canAffordToVisit(state: Core7DayState): boolean {
  return state.actionsUsedToday < ACTIONS_PER_DAY;
}

/** PHASE_22_5 -- "深い会話は追加1行動消費": opening a deep (free-talk) conversation spends one of
 *  the day's 2 actions, exactly like moving to a new destination. Reuses the same budget check as
 *  `canAffordToVisit` (there is only one shared action pool, not a separate "talk budget"), named
 *  separately so call sites read as what they mean, not just a re-check of the same arithmetic. */
export function canAffordFreeTalk(state: Core7DayState): boolean {
  return canAffordToVisit(state);
}

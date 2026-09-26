/**
 * NEW LIFE refoundation — deterministic time economy
 * (V11 order, stage 2 of 8, world-clock half).
 *
 * DESIGN-FIRST, NOT WIRED IN. Same status as `types.ts`/`relationshipReducer.ts`.
 *
 * Source of the cost table: `docs/newlife/refoundation/blind/BLIND_AI_REVIEW_PACKET_V3.md`
 * "Time costs" section (the most concrete, reviewed-and-`PASS_FOR_PROTOTYPE`'d
 * statement of this mechanic — see V19_.../Blind Review Round 3 — Game
 * Systems' Q6: "concrete, itemized per-move costs... directly codeable as a
 * decrement table"), plus V14 §7's explicit "CLARIFY at 0 in-world minutes."
 *
 * Deliberately scoped: this module costs a named *category* of move, not an
 * `ActionType` from `types.ts` directly. The two do not line up 1:1 — e.g.
 * an `ASK_FACT` turn can be either a "quick factual... question" (2 min) or
 * an "open exploratory question" (4 min) depending on what is actually
 * asked, which is case content the classifier/game-loop decides per turn,
 * not something this table can infer from `ActionType` alone. Deciding
 * *which* category a given turn falls into belongs to the semantic
 * interpreter / game-loop integration (V11 stage 4+), not to this reducer.
 */

/** V3 packet "Time costs" section, verbatim categories. */
export type TimeCostCategory =
  | "QUICK_FACTUAL_OR_BOUNDARY_QUESTION"
  | "OPEN_EXPLORATORY_QUESTION"
  | "MOVE_CONVERSATION_PRIVATE"
  | "GROUP_HUDDLE"
  | "DECISION_SUMMARY_OR_ASSIGNMENT"
  | "REWRITE"
  | "CONTINUITY_REPAIR"
  | "REHEARSE_CHANGED_SCENE"
  | "CUT_SCENE_OR_BRIDGE_TRANSITIONS"
  | "UNDERSTUDY"
  | "THOUGHT_TOOL_BOUNDARY_CHECK"
  | "THOUGHT_TOOL_ROLE_SWAP"
  | "THOUGHT_TOOL_TASK_PERSONAL_SPLIT"
  | "CLARIFY";

/**
 * Minutes per category. `MOVE_CONVERSATION_PRIVATE` is documented as "+2
 * min" — additive on top of whatever conversational move it accompanies,
 * not a standalone cost — see `TIME_COSTS_ARE_ADDITIVE` below for how a
 * caller combines it with a base category.
 */
export const TIME_COSTS: Readonly<Record<TimeCostCategory, number>> = {
  QUICK_FACTUAL_OR_BOUNDARY_QUESTION: 2,
  OPEN_EXPLORATORY_QUESTION: 4,
  MOVE_CONVERSATION_PRIVATE: 2,
  GROUP_HUDDLE: 5,
  DECISION_SUMMARY_OR_ASSIGNMENT: 2,
  REWRITE: 12,
  CONTINUITY_REPAIR: 6,
  REHEARSE_CHANGED_SCENE: 8,
  CUT_SCENE_OR_BRIDGE_TRANSITIONS: 10,
  UNDERSTUDY: 18,
  // "Structured boundary check. 1 min rather than 2" (thought tools section).
  THOUGHT_TOOL_BOUNDARY_CHECK: 1,
  // V3 packet thought-tools section: "Counterfactual role swap... Costs 1 min."
  THOUGHT_TOOL_ROLE_SWAP: 1,
  // V3 packet thought-tools section does not state a minute cost for the
  // task/personal split tool (unlike the other three, which each name a
  // number) — 0 is the most conservative reading available from the text,
  // flagged as an assumption in V32_THOUGHT_TOOLS_CONTRACT_V1.md §2.3
  // rather than silently invented.
  THOUGHT_TOOL_TASK_PERSONAL_SPLIT: 0,
  // V14 §7: "if even the requested act is unclear, CLARIFY at 0 in-world minutes."
  CLARIFY: 0,
};

/**
 * V3 packet thought-tools section: "嫌なこと + 代わりにできること... Saves 2
 * min plan-generation cost." Unlike the other three tools' costs (a flat
 * category above), this one is a discount applied to a *later* REWRITE-shaped
 * action, not a cost of invoking the tool itself — see `thoughtTools.ts`'s
 * `applyAlternativePlanDiscount`.
 */
export const THOUGHT_TOOL_ALTERNATIVE_PLAN_DISCOUNT_MINUTES = 2;

/** `MOVE_CONVERSATION_PRIVATE`'s cost is additive on top of a base category, per the packet's own "+2 min" phrasing — not a category on its own. */
export const TIME_COSTS_ARE_ADDITIVE: ReadonlySet<TimeCostCategory> = new Set([
  "MOVE_CONVERSATION_PRIVATE",
]);

export interface WorldClock {
  readonly totalMinutes: number;
  readonly elapsedMinutes: number;
}

export function createWorldClock(totalMinutes: number): WorldClock {
  if (totalMinutes < 0) {
    throw new Error(`createWorldClock: totalMinutes must be >= 0, got ${totalMinutes}`);
  }
  return { totalMinutes, elapsedMinutes: 0 };
}

export function remainingMinutes(clock: WorldClock): number {
  return Math.max(0, clock.totalMinutes - clock.elapsedMinutes);
}

export function hasTimeRemaining(clock: WorldClock, minutes: number): boolean {
  return remainingMinutes(clock) >= minutes;
}

/**
 * Pure, clamped spend: elapsed time never exceeds `totalMinutes` even if a
 * caller asks to spend more than remains (the deadline having already
 * passed is itself the signal the game loop must act on via
 * `hasTimeRemaining`/`remainingMinutes` — this function does not throw, so
 * it stays safe to call unconditionally from a reducer that must not throw
 * on ordinary game states).
 */
export function spendTime(clock: WorldClock, minutes: number): WorldClock {
  if (minutes < 0) {
    throw new Error(`spendTime: minutes must be >= 0, got ${minutes}`);
  }
  return {
    totalMinutes: clock.totalMinutes,
    elapsedMinutes: Math.min(clock.totalMinutes, clock.elapsedMinutes + minutes),
  };
}

/** Combines a base category with the optional `MOVE_CONVERSATION_PRIVATE` addend, per `TIME_COSTS_ARE_ADDITIVE`. */
export function costOf(category: TimeCostCategory, options?: { movedPrivate?: boolean }): number {
  const base = TIME_COSTS[category];
  const privateAddend = options?.movedPrivate ? TIME_COSTS.MOVE_CONVERSATION_PRIVATE : 0;
  return base + privateAddend;
}

/** The vertical-slice case's own clock (V16 §6.3: "the case's decision deadline (17:30 in the vertical-slice case)"; V3 packet: "50 minutes to stabilize tomorrow's performance"). */
export const VERTICAL_SLICE_CASE_001_TOTAL_MINUTES = 50;

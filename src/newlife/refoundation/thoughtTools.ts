/**
 * NEW LIFE refoundation — thought tools (V11 order, stage 6 of 8).
 *
 * DESIGN-FIRST, NOT WIRED IN. Same status as every other module in
 * `src/newlife/refoundation/`. Legacy public NEW LIFE is untouched.
 *
 * Implements `docs/newlife/refoundation/V32_THOUGHT_TOOLS_CONTRACT_V1.md`:
 * the four already-accepted reusable tools from
 * `blind/BLIND_AI_REVIEW_PACKET_V3.md`'s "Thought tools" section, as
 * optional deterministic mechanics. No tool function reads or writes
 * `NpcRelationshipRecord`/`CaseEndingState` — each takes only the minimal
 * read-only input it needs and returns plain descriptive data. No morality,
 * empathy, or personality scoring anywhere in this module.
 */
import type { ActionType, BoundaryMode } from "./types";
import type { EndingBoundaryStatus } from "./ending";
import { THOUGHT_TOOL_ALTERNATIVE_PLAN_DISCOUNT_MINUTES, TIME_COSTS } from "./timeEconomy";

/* ---------------------------------------------------------------------- */
/* 2.1 boundary check                                                      */
/* ---------------------------------------------------------------------- */

export const BOUNDARY_CHECK_OPTIONS = ["NO", "OK", "SUBSTITUTE"] as const;
export type BoundaryCheckOption = (typeof BOUNDARY_CHECK_OPTIONS)[number];

export interface BoundaryCheckToolResult {
  readonly turn: { readonly action: Extract<ActionType, "ASK_BOUNDARY">; readonly boundaryMode: Extract<BoundaryMode, "DISCOVER"> };
  readonly costMinutes: number;
  readonly answerShape: readonly BoundaryCheckOption[];
}

/**
 * V32 §2.1. The player's action for this turn; which of NO/OK/SUBSTITUTE
 * actually applies is case-specific ground truth a future game loop
 * supplies — this module does not invent it.
 */
export function useBoundaryCheckTool(): BoundaryCheckToolResult {
  return {
    turn: { action: "ASK_BOUNDARY", boundaryMode: "DISCOVER" },
    costMinutes: TIME_COSTS.THOUGHT_TOOL_BOUNDARY_CHECK,
    answerShape: BOUNDARY_CHECK_OPTIONS,
  };
}

/* ---------------------------------------------------------------------- */
/* 2.2 alternative plan slot                                               */
/* ---------------------------------------------------------------------- */

export interface AlternativePlanSlot {
  readonly status: "OPEN";
  /** Opaque, caller/player-authored label naming the unwanted element. Never invented by this module. */
  readonly discomfort: string;
  readonly costMinutes: number;
}

/**
 * V32 §2.2. Returns `null` when the gate fails (`boundaryStatus !==
 * "STATED"`) — the slot cannot exist before a boundary is known. Opening
 * the slot itself is free; the 2-minute discount applies once it is filled
 * and turned into a real committing action (`applyAlternativePlanDiscount`).
 * Acceptance is never guaranteed by this function — it only creates the
 * slot, it does not resolve or commit anything.
 */
export function openAlternativePlanSlot(boundaryStatus: EndingBoundaryStatus, discomfort: string): AlternativePlanSlot | null {
  if (boundaryStatus !== "STATED") return null;
  return { status: "OPEN", discomfort, costMinutes: 0 };
}

/** V32 §2.2. Discounts a subsequent REWRITE-shaped action's cost; never negative. */
export function applyAlternativePlanDiscount(baseCostMinutes: number): number {
  return Math.max(0, baseCostMinutes - THOUGHT_TOOL_ALTERNATIVE_PLAN_DISCOUNT_MINUTES);
}

/* ---------------------------------------------------------------------- */
/* 2.3 task / personal split                                               */
/* ---------------------------------------------------------------------- */

export interface TaskPersonalSplit {
  /** Opaque, caller-supplied case-content labels. Never invented by this module. */
  readonly currentTask: string;
  readonly personalPattern: string;
  readonly personalTrackDeferred: true;
  readonly costMinutes: number;
}

/**
 * V32 §2.3. Board-bookkeeping only — structurally cannot emit
 * `PersonalTrackSignal: "OPENED"` (this module does not import `ending.ts`'s
 * signal type at all). Opening the personal track remains exclusively the
 * semantic interpreter's job.
 */
export function splitTaskAndPersonalTrack(currentTask: string, personalPattern: string): TaskPersonalSplit {
  return {
    currentTask,
    personalPattern,
    personalTrackDeferred: true,
    costMinutes: TIME_COSTS.THOUGHT_TOOL_TASK_PERSONAL_SPLIT,
  };
}

/* ---------------------------------------------------------------------- */
/* 2.4 counterfactual role swap                                            */
/* ---------------------------------------------------------------------- */

/**
 * V32 §2.4. The same operational `ActionType`s `ending.ts` already treats
 * as legitimate concrete resolutions (`COMMITTING_ACTION_TYPES`), plus a
 * small set of non-committing-but-concrete moves.
 */
export const ROLE_SWAP_CANDIDATE_POOL: readonly ActionType[] = [
  "PROPOSE_REWRITE",
  "CUT_SCENE",
  "USE_UNDERSTUDY",
  "CHANGE_STAGING",
  "ACCEPT_SHORTER_SCENE",
  "REASSIGN_WORK",
  "MOVE_PRIVATE",
  "APOLOGIZE_AND_REPAIR",
];

export interface RoleSwapSuggestion {
  /** `null` when every pool candidate has already been used/considered this case. */
  readonly candidate: ActionType | null;
  readonly costMinutes: number;
  readonly guaranteed: false;
}

/**
 * V32 §2.4. Returns a candidate only — the player must still perform it as
 * a real turn for it to have any effect. Never applies a turn or mutates
 * state.
 */
export function useRoleSwapTool(actionsAlreadyUsed: ReadonlySet<ActionType>): RoleSwapSuggestion {
  const candidate = ROLE_SWAP_CANDIDATE_POOL.find((action) => !actionsAlreadyUsed.has(action)) ?? null;
  return { candidate, costMinutes: TIME_COSTS.THOUGHT_TOOL_ROLE_SWAP, guaranteed: false };
}

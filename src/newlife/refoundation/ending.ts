/**
 * NEW LIFE refoundation — ending vector (V11 order, stage 3 of 8).
 *
 * DESIGN-FIRST, NOT WIRED IN. Same status as `types.ts`/`relationshipReducer.ts`/
 * `timeEconomy.ts`: nothing here is imported by legacy `src/newlife/` modules
 * this Run.
 *
 * Implements `docs/newlife/refoundation/V27_ENDING_VECTOR_CONTRACT_V1.md`
 * (self-audited zero-blocker in V28, after V28 §1's B1 — multi-NPC viability —
 * was found and closed directly in V27 before this file was written). Closes
 * the stage-3 gap V26 stopped on: `SHOW`, ending `BOUNDARY`, and
 * `PERSONAL_TRACK` had no deterministic trigger in any document through V26;
 * `TRUST` and `TIME_LEFT` were already derivable and are threaded through
 * unchanged from `relationshipReducer.ts`/`timeEconomy.ts`.
 *
 * Does not add a member to `ActionType`, `BoundaryMode`, or `RelationalEvent`
 * — the three closed, blind-validated sets (V13 as patched through V24,
 * `PASS_FOR_IMPLEMENTATION` since V25) are untouched by this stage.
 */
import type { ActionType, BoundaryMode, RelationshipState } from "./types";
import { remainingMinutes, type WorldClock } from "./timeEconomy";

export type ShowOutcome = "PROCEEDS" | "BREAKDOWN";
export type EndingBoundaryStatus = "UNKNOWN" | "STATED" | "RESPECTED" | "OVERRIDDEN";
export type PersonalTrackStatus = "OPENED" | "NOT_OPENED";

/**
 * V27 §4.1. Orthogonal to the four-layer `TurnClassification` contract — not
 * an ACTION, BOUNDARY_MODE, or RELATIONAL_EVENT value. A future semantic
 * interpreter may attach this alongside a turn's classification, and only
 * when that turn explicitly and voluntarily raises the NPC's deeper personal
 * pattern beyond the immediate operational problem — never inferred from
 * tone/warmth/politeness/verbosity.
 */
export type PersonalTrackSignal = "OPENED";

/**
 * V27 §2.2. Actions that produce a concrete, executable resolution to the
 * case's central practical problem. `PROPOSE_REWRITE`/`ASSIGN_REWRITE` are
 * deliberately excluded (V21's already-settled rule: an unconfirmed/hedged
 * proposal remains `PROPOSE_REWRITE` until commitment/assignment is
 * explicit), as is `REASSIGN_WORK` (reassigns who does proposal work, not
 * itself a resolution).
 */
export const COMMITTING_ACTION_TYPES: ReadonlySet<ActionType> = new Set([
  "COMMIT_PLAN",
  "CUT_SCENE",
  "USE_UNDERSTUDY",
  "CHANGE_STAGING",
  "ACCEPT_SHORTER_SCENE",
  "FORCE_UNCONFIRMED_PLAN",
]);

/**
 * V27 §2.3. The subset of `COMMITTING_ACTION_TYPES` that resolves the task
 * *through* an NPC's continued cooperation (a rewrite/plan that needs her
 * still performing), as opposed to an operational workaround that does not.
 */
export const NPC_DEPENDENT_COMMITTING_ACTION_TYPES: ReadonlySet<ActionType> = new Set([
  "COMMIT_PLAN",
  "FORCE_UNCONFIRMED_PLAN",
]);

/** V27 §3.1. Modes that establish a boundary is known in the fiction; `NOT_RELEVANT`/`UNKNOWN` never do (conservative ambiguity default). */
const BOUNDARY_ESTABLISHING_MODES: ReadonlySet<BoundaryMode> = new Set([
  "DISCOVER",
  "AVOID",
  "SEEK_PERMISSION",
  "RECONSIDER",
  "CROSS_WITHOUT_PERMISSION",
]);

/** V27 §2.1. The case's final operative plan, if any. Overwritten (not merged) by each new commitment — "final" means latest. */
export interface TaskCommitment {
  action: ActionType;
  boundaryMode: BoundaryMode;
  turnRef: string;
}

export interface TaskLedger {
  commitment: TaskCommitment | null;
}

/** V27 §2-4. Case-level (not per-NPC) accumulator feeding `SHOW`/`BOUNDARY`/`PERSONAL_TRACK`. */
export interface CaseEndingState {
  taskLedger: TaskLedger;
  boundaryEstablished: boolean;
  /** V27 §3.1. Null iff `boundaryEstablished` is false. */
  establishedAtTurn: string | null;
  personalTrackOpened: boolean;
}

export function createInitialCaseEndingState(): CaseEndingState {
  return {
    taskLedger: { commitment: null },
    boundaryEstablished: false,
    establishedAtTurn: null,
    personalTrackOpened: false,
  };
}

export interface EndingTurnInput {
  turnRef: string;
  action: ActionType;
  boundaryMode: BoundaryMode;
  /** Optional; supplied by a future semantic interpreter (V11 stage 4). Absent/omitted means no signal this turn. */
  personalTrackSignal?: PersonalTrackSignal | null;
}

/**
 * V27 §2.2 (commitment overwrite) + §3.1 (boundary establishment, first-only)
 * + §4.2 (personal track, monotonic). One entry point per turn, mirroring
 * `relationshipReducer.applyRelationalTurn`'s shape.
 */
export function applyEndingTurn(state: CaseEndingState, input: EndingTurnInput): CaseEndingState {
  const taskLedger: TaskLedger = COMMITTING_ACTION_TYPES.has(input.action)
    ? { commitment: { action: input.action, boundaryMode: input.boundaryMode, turnRef: input.turnRef } }
    : state.taskLedger;

  const establishesBoundary = !state.boundaryEstablished && BOUNDARY_ESTABLISHING_MODES.has(input.boundaryMode);
  const boundaryEstablished = state.boundaryEstablished || establishesBoundary;
  const establishedAtTurn = establishesBoundary ? input.turnRef : state.establishedAtTurn;

  const personalTrackOpened = state.personalTrackOpened || input.personalTrackSignal === "OPENED";

  return { taskLedger, boundaryEstablished, establishedAtTurn, personalTrackOpened };
}

/**
 * V27 §2.3. `requiredRelationshipStates` is the relationship state of every
 * NPC the final commitment's cooperation depends on, supplied by the caller
 * — this module stays generic across 1-NPC or N-NPC cases by not knowing
 * which named characters exist (V28 §1, B1: the first draft assumed exactly
 * one NPC and was corrected before implementation).
 */
export function deriveShowOutcome(
  taskLedger: TaskLedger,
  requiredRelationshipStates: readonly RelationshipState[],
): ShowOutcome {
  const commitment = taskLedger.commitment;
  if (commitment === null) {
    return "BREAKDOWN";
  }
  const isNpcDependent = NPC_DEPENDENT_COMMITTING_ACTION_TYPES.has(commitment.action);
  const anyRequiredNpcWithdrawn = requiredRelationshipStates.some((state) => state === "WITHDRAWN");
  if (isNpcDependent && anyRequiredNpcWithdrawn) {
    return "BREAKDOWN";
  }
  return "PROCEEDS";
}

/**
 * V27 §3.2. Only the final commitment's `boundaryMode` governs
 * RESPECTED/OVERRIDDEN — not the full turn history, so a recovered-from
 * `CROSS_WITHOUT_PERMISSION` earlier in the case does not leave the ending
 * permanently `OVERRIDDEN` (V4 §7 recovery, mirrored at the boundary axis).
 * `Pick` deliberately excludes `personalTrackOpened`: the field does not
 * exist on this function's input type at all (V27 §4.3's structural
 * guarantee), not merely an unused value.
 */
export function deriveEndingBoundary(
  state: Pick<CaseEndingState, "boundaryEstablished" | "taskLedger">,
): EndingBoundaryStatus {
  if (!state.boundaryEstablished) {
    return "UNKNOWN";
  }
  const commitment = state.taskLedger.commitment;
  if (commitment === null) {
    return "STATED";
  }
  return commitment.boundaryMode === "CROSS_WITHOUT_PERMISSION" ? "OVERRIDDEN" : "RESPECTED";
}

/** V27 §4.2. */
export function derivePersonalTrack(state: Pick<CaseEndingState, "personalTrackOpened">): PersonalTrackStatus {
  return state.personalTrackOpened ? "OPENED" : "NOT_OPENED";
}

/**
 * V27 §1. Non-ranked: no field is weighted, summed, or combined into a
 * single score, and no field's value depends on another field's value.
 */
export interface EndingVector {
  show: ShowOutcome;
  boundary: EndingBoundaryStatus;
  /** Identity mapping from `RelationshipState` (V27 §1's "plainest possible" documented, reversible mapping). Caller picks which NPC's record is "the" ending trust field — case-specific, not this module's concern. */
  trust: RelationshipState;
  timeLeft: number;
  personalTrack: PersonalTrackStatus;
}

export interface DeriveEndingVectorInput {
  state: CaseEndingState;
  /** See `deriveShowOutcome` — every NPC the final commitment depends on. */
  requiredRelationshipStates: readonly RelationshipState[];
  /** The NPC relationship state to report as the ending TRUST field. */
  trust: RelationshipState;
  clock: WorldClock;
}

/** V27 §1. Combines the independently-derived fields; performs no aggregation across them. */
export function deriveEndingVector(input: DeriveEndingVectorInput): EndingVector {
  return {
    show: deriveShowOutcome(input.state.taskLedger, input.requiredRelationshipStates),
    boundary: deriveEndingBoundary(input.state),
    trust: input.trust,
    timeLeft: remainingMinutes(input.clock),
    personalTrack: derivePersonalTrack(input.state),
  };
}

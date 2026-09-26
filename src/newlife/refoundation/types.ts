/**
 * NEW LIFE refoundation — semantic/state types (V11 order, stage 1 of 8).
 *
 * DESIGN-FIRST, NOT WIRED IN. Nothing in `src/newlife/refoundation/` is
 * imported by `npcVoice.ts`, `NewLife30App.tsx`, `App.tsx`, or anything under
 * `src/newlife/semantic/` this Run. It exists so the four-layer turn contract
 * and relationship-state machine described in
 * docs/newlife/refoundation/V13_STATE_INTERPRETATION_CONTRACT_V3.md (as
 * normatively patched by V14, V16, V18, V20, V22, and V24) are real,
 * type-checked artifacts rather than only prose, without changing any
 * currently deployed behavior. Legacy public NEW LIFE (`src/newlife/types.ts`,
 * `src/newlife/state.ts`, `src/newlife/semantic/`) is untouched.
 *
 * SYSTEM OWNS TRUTH / AI OWNS EXPRESSION still holds: a `TurnClassification`
 * only ever reports what a single turn's utterance contains (V13 §1, V22 §4's
 * scoping note) — it never decides whether an event is "resolved," produces a
 * relationship-state transition, or consumes a repair window. That is a
 * separate deterministic step (V11 stage 2, not implemented yet), operating
 * on `NpcRelationshipRecord` below.
 */

/** V13 §1 / V16 §§2-5 / V22 §3. Closed set — do not add a value without a corresponding normative patch. */
export type ActionType =
  | "ASK_FACT"
  | "ASK_BOUNDARY"
  | "ASK_REQUIRED_FUNCTION"
  | "PROPOSE_REWRITE"
  | "ASSIGN_REWRITE"
  | "COMMIT_PLAN"
  | "REASSIGN_WORK"
  | "CUT_SCENE"
  | "USE_UNDERSTUDY"
  | "CHANGE_STAGING"
  | "ACCEPT_SHORTER_SCENE"
  | "MOVE_PRIVATE"
  | "DELAY_DECISION"
  | "REQUEST_RECONSIDERATION"
  | "FORCE_UNCONFIRMED_PLAN"
  | "APOLOGIZE_AND_REPAIR"
  | "SUMMARIZE"
  | "OBSERVE"
  | "CLARIFY"
  | "OTHER";

/** V13 §1B / V14 §5-§7 / V16 §4-§5. Closed set. */
export type BoundaryMode =
  | "NOT_RELEVANT"
  | "DISCOVER"
  | "AVOID"
  | "SEEK_PERMISSION"
  | "RECONSIDER"
  | "CROSS_WITHOUT_PERMISSION"
  | "UNKNOWN";

/** V13 §2. Closed set — persistent, tone-independent relational signals only. */
export type RelationalEvent =
  | "PERSONAL_INSULT"
  | "PUBLIC_SHAMING"
  | "THREAT"
  | "FALSE_ATTRIBUTION"
  | "DISMISSES_CONCERN"
  | "BREAKS_PROMISE"
  | "KEEPS_PROMISE"
  | "ACKNOWLEDGES_MISTAKE";

/** V14 §1. Intentionally terminal: WITHDRAWN cannot be exited within the current case (V14 §1, V16 §6.1). */
export type RelationshipState = "OPEN" | "NEUTRAL" | "GUARDED" | "WITHDRAWN";

/** V14 §2 precedence order, highest first. `NONE` = no validated event this turn maps to a class. */
export type EventClass = "SEVERE_RUPTURE" | "STRAIN" | "REPAIR" | "RELIABILITY" | "NONE";

/**
 * V14 §2 precedence, most important first. Consumers must never re-derive
 * this order ad hoc — import it, so a future spec change to precedence is a
 * one-line diff instead of a scattered one.
 */
export const EVENT_CLASS_PRECEDENCE: readonly EventClass[] = [
  "SEVERE_RUPTURE",
  "STRAIN",
  "REPAIR",
  "RELIABILITY",
  "NONE",
];

/**
 * V14 §3's per-event class mapping for the five simple, context-independent
 * events. THREAT and BREAKS_PROMISE are deliberately excluded here: each can
 * additionally promote to SEVERE_RUPTURE under a context-dependent condition
 * (THREAT "used to compel a known refusal"; a *third* confirmed BREAKS_PROMISE
 * "while an earlier promise rupture remains unresolved" — V14 §3) that this
 * types-only stage does not decide. That promotion, and THREAT/BREAKS_PROMISE's
 * own default STRAIN-class membership, belong to the stage-2 deterministic
 * reducer (V11 order), not to this contract.
 */
export const SIMPLE_RELATIONAL_EVENT_CLASS: Readonly<
  Record<Exclude<RelationalEvent, "THREAT" | "BREAKS_PROMISE">, EventClass>
> = {
  PERSONAL_INSULT: "STRAIN",
  PUBLIC_SHAMING: "STRAIN",
  FALSE_ATTRIBUTION: "STRAIN",
  DISMISSES_CONCERN: "STRAIN",
  ACKNOWLEDGES_MISTAKE: "REPAIR",
  KEEPS_PROMISE: "RELIABILITY",
};

/**
 * V14 §2's explicit example: "PUBLIC_SHAMING + PERSONAL_INSULT qualifies as
 * SEVERE_RUPTURE by explicit combo rule" (replacing the STRAIN class those two
 * would otherwise carry individually — not an additional, stacked penalty).
 */
export const SEVERE_RUPTURE_COMBO: ReadonlySet<RelationalEvent> = new Set([
  "PUBLIC_SHAMING",
  "PERSONAL_INSULT",
]);

/**
 * Compile-time-exhaustive membership records: TypeScript errors if a union
 * above gains or loses a member without this object being updated to match
 * (missing key = type error; extra key = type error), so `ALL_ACTION_TYPES`
 * etc. below can never silently drift from the union types they mirror.
 */
const ACTION_TYPE_MEMBERSHIP: Record<ActionType, true> = {
  ASK_FACT: true,
  ASK_BOUNDARY: true,
  ASK_REQUIRED_FUNCTION: true,
  PROPOSE_REWRITE: true,
  ASSIGN_REWRITE: true,
  COMMIT_PLAN: true,
  REASSIGN_WORK: true,
  CUT_SCENE: true,
  USE_UNDERSTUDY: true,
  CHANGE_STAGING: true,
  ACCEPT_SHORTER_SCENE: true,
  MOVE_PRIVATE: true,
  DELAY_DECISION: true,
  REQUEST_RECONSIDERATION: true,
  FORCE_UNCONFIRMED_PLAN: true,
  APOLOGIZE_AND_REPAIR: true,
  SUMMARIZE: true,
  OBSERVE: true,
  CLARIFY: true,
  OTHER: true,
};
export const ALL_ACTION_TYPES = Object.keys(ACTION_TYPE_MEMBERSHIP) as ActionType[];

const BOUNDARY_MODE_MEMBERSHIP: Record<BoundaryMode, true> = {
  NOT_RELEVANT: true,
  DISCOVER: true,
  AVOID: true,
  SEEK_PERMISSION: true,
  RECONSIDER: true,
  CROSS_WITHOUT_PERMISSION: true,
  UNKNOWN: true,
};
export const ALL_BOUNDARY_MODES = Object.keys(BOUNDARY_MODE_MEMBERSHIP) as BoundaryMode[];

const RELATIONAL_EVENT_MEMBERSHIP: Record<RelationalEvent, true> = {
  PERSONAL_INSULT: true,
  PUBLIC_SHAMING: true,
  THREAT: true,
  FALSE_ATTRIBUTION: true,
  DISMISSES_CONCERN: true,
  BREAKS_PROMISE: true,
  KEEPS_PROMISE: true,
  ACKNOWLEDGES_MISTAKE: true,
};
export const ALL_RELATIONAL_EVENTS = Object.keys(RELATIONAL_EVENT_MEMBERSHIP) as RelationalEvent[];

/** Single-turn output of the (not-yet-implemented) semantic interpreter — matches the blind-matrix classification schema exactly (V8/V9 "Output" section) so validation-round fixtures can be reused as regression tests once stage 4 exists. */
export interface TurnClassification {
  action: ActionType;
  boundaryMode: BoundaryMode;
  relationalEvents: RelationalEvent[];
  needsClarification: boolean;
}

/** V16 §6.3 / V22 §1.2. `CLOSED` when no corrective action is pending; `OPEN` names the one `causalEventHistory` entry it targets (V16 §6.3's "most recently logged unresolved STRAIN" rule). */
export type RepairWindow = { status: "CLOSED" } | { status: "OPEN"; targetEntryId: string };

/**
 * V22 §2.2. Tags whether a resolved causal-history entry's evidence is itself
 * a logged relational event (BREAKS_PROMISE→KEEPS_PROMISE, FALSE_ATTRIBUTION's
 * own correction) or a pure operational completion with no relational-event
 * shape of its own (PERSONAL_INSULT/DISMISSES_CONCERN, PUBLIC_SHAMING) — see
 * V22 §2.1 for why the latter must not be logged into `causalEventHistory` as
 * though it were a relational event.
 */
export type ResolvingReference =
  | { layer: "RELATIONAL_EVENT"; entryId: string }
  | { layer: "CORRECTIVE_ACTION_COMPLETION"; entryId: string };

/**
 * V16 §6.6 per-NPC recovery field, as amended by V22 §2.2 (`resolvingReference`
 * replaces V20's untyped `resolvingEntryId`) and V24 §1.2 step 6 (`resolved`
 * is set unconditionally on completion, independent of transition eligibility).
 */
export interface CausalEventHistoryEntry {
  id: string;
  turnRef: string;
  event: RelationalEvent;
  eventClass: EventClass;
  /** True once a corrective action targeting this entry has completed (V16 §6.2), regardless of whether that completion produced a relationship-state transition (V24 §1.2 step 6). */
  resolved: boolean;
  /** Populated only when `resolved` flips false->true (V22 §2.2). Null while unresolved. */
  resolvingReference: ResolvingReference | null;
  resolvedAtTurn: string | null;
}

/**
 * V22 §2.2. Logs only the moment a corrective action's operational component
 * is validated complete (V16 §6.2) — deliberately narrower than
 * `causalEventHistory`; it exists solely so a `CORRECTIVE_ACTION_COMPLETION`
 * `resolvingReference` has a real, stable, append-only-logged target, without
 * relabeling an ordinary ACTION as a relational event.
 */
export interface CorrectiveActionLogEntry {
  id: string;
  turnRef: string;
  targetedEntryId: string;
}

/**
 * V16 §6.6, as amended by V22 §2.2 (adds `correctiveActionLog`) and V24 §2
 * (`promiseBreakCount`'s reset is scoped to transition-eligible completions
 * only — see the field doc below). No field here is a point total; none are
 * combined into a weighted or additive score (V16 §6.6, restated by every
 * successor patch through V24).
 */
export interface NpcRelationshipRecord {
  relationshipState: RelationshipState;
  repairWindow: RepairWindow;
  /** Resets to 0 on any GUARDED->NEUTRAL or NEUTRAL->OPEN transition it contributes to (V16 §6.1). */
  reliabilityObservationCount: number;
  /**
   * Feeds the "third confirmed BREAKS_PROMISE while an earlier promise
   * rupture remains unresolved" SEVERE_RUPTURE trigger (V14 §3). Resets to 0
   * only when a promise-break-caused STRAIN is cleared via a corrective
   * action *and* that completion was transition-eligible under V16 §6.4 (as
   * restated by V24 §1) — i.e. the NPC has never had a SEVERE_RUPTURE-class
   * event this case. An ineligible completion still marks its history entry
   * `resolved` but must not reset this counter (V24 §2), so a repeat
   * offender who already has an unresolved severe rupture cannot silently
   * defang their own escalation trigger.
   */
  promiseBreakCount: number;
  /** Per unresolved refusal topic; world-interaction flag only (V13 §7). Never feeds `relationshipState`. */
  pressureAfterNoCount: number;
  /** Append-only. Source of truth for "has this NPC ever had a SEVERE_RUPTURE-class event this case" (V16 §6.4, as unified by V24 §1 into the sole reversibility test). */
  causalEventHistory: CausalEventHistoryEntry[];
  /** Append-only (V22 §2.2). */
  correctiveActionLog: CorrectiveActionLogEntry[];
  /** Pointer into `causalEventHistory`: the entry `repairWindow` targets when OPEN (V16 §6.3). Null when `repairWindow.status === "CLOSED"`. */
  lastStrainEventId: string | null;
}

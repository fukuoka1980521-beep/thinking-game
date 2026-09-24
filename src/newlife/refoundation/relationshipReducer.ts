/**
 * NEW LIFE refoundation — deterministic relationship-transition reducer
 * (V11 order, stage 2 of 8, relationship-state half).
 *
 * DESIGN-FIRST, NOT WIRED IN. Same status as `types.ts`: nothing here is
 * imported by legacy `src/newlife/` modules this Run.
 *
 * Implements V14 (relationship transition closure), as normatively patched
 * by V16 §1/§6, V18, V20, V22 §1-§2, and V24 §1-§3 — the one part of the
 * refoundation spec that has been blind-validated across nine independent
 * classifier rounds (V4-V9) plus a design audit that reached
 * `PASS_FOR_IMPLEMENTATION` with zero blockers (V25). `TurnClassification`
 * (from `types.ts`) is the *input* this reducer consumes; producing one from
 * raw player text is the semantic interpreter's job (V11 stage 4, not this
 * module) — SYSTEM OWNS TRUTH/STATE, AI OWNS EXPRESSION/INTERPRETATION holds
 * throughout: nothing below inspects an utterance's wording, only the
 * already-classified `RelationalEvent[]`/`BoundaryMode` a turn produced.
 *
 * Two entry points, matching the two explicitly separate pipelines V14/V22
 * describe:
 *   - `applyRelationalTurn` — V14 §2-§7: per-turn event validation is
 *     assumed already done upstream (matches V9 matrix's own scoping note,
 *     "you are NOT deciding whether... resolved" — this module IS that
 *     later deterministic step, but turn-level event *presence* is input,
 *     not derived here); this function computes the one relationship-state
 *     transition (if any) that turn's accepted events produce, logs every
 *     accepted event to `causalEventHistory`, and opens `repairWindow` when
 *     V14 §3/§4's REPAIR rule applies.
 *   - `completeCorrectiveAction` — V16 §6.2/§6.3 + V22 §1.2 + V24 §1-§3: a
 *     separately-triggered step (the caller, i.e. the future game loop /
 *     semantic interpreter integration, decides *when* a turn constitutes a
 *     corrective action's completion — that determination needs broader
 *     context than a single `TurnClassification` carries, e.g. whether a
 *     proposed plan was actually confirmed) that consumes an open
 *     `repairWindow`, tests transition eligibility, and marks the targeted
 *     history entry resolved with typed provenance.
 */
import {
  EVENT_CLASS_PRECEDENCE,
  SEVERE_RUPTURE_COMBO,
  SIMPLE_RELATIONAL_EVENT_CLASS,
  type BoundaryMode,
  type CausalEventHistoryEntry,
  type CorrectiveActionLogEntry,
  type EventClass,
  type NpcRelationshipRecord,
  type RelationalEvent,
  type RelationshipState,
  type ResolvingReference,
} from "./types";

/** V14 §1. A fresh NPC starts OPEN with no history, per every worked example across V13-V24. */
export function createInitialRelationshipRecord(): NpcRelationshipRecord {
  return {
    relationshipState: "OPEN",
    repairWindow: { status: "CLOSED" },
    reliabilityObservationCount: 0,
    promiseBreakCount: 0,
    pressureAfterNoCount: 0,
    causalEventHistory: [],
    correctiveActionLog: [],
    lastStrainEventId: null,
  };
}

/** V16 §6.4 as unified by V24 §1: the sole reversibility/eligibility test, "ever had a SEVERE_RUPTURE-class event this case," independent of current `relationshipState`. */
function hasEverHadSevereRupture(record: NpcRelationshipRecord): boolean {
  return record.causalEventHistory.some((entry) => entry.eventClass === "SEVERE_RUPTURE");
}

/**
 * V14 §3's context-dependent promotions for the two events excluded from
 * `SIMPLE_RELATIONAL_EVENT_CLASS` (see that constant's doc comment in
 * `types.ts` for why).
 *
 * THREAT: "used to compel a known refusal" is operationalized as THREAT
 * co-occurring, in the same turn, with `boundaryMode === "CROSS_WITHOUT_PERMISSION"`
 * — the turn both threatens and actually declares/executes crossing an
 * already-known boundary (V14 §5's own definition of what
 * CROSS_WITHOUT_PERMISSION requires). V9 matrix Z19 (THREAT +
 * `boundaryMode = RECONSIDER`, no crossing) confirms THREAT alone, without a
 * declared/executed crossing, stays STRAIN.
 *
 * BREAKS_PROMISE: "third confirmed ... while an earlier promise rupture
 * remains unresolved" — this occurrence would bring the confirmed count to
 * 3 (or more), AND some earlier BREAKS_PROMISE history entry for this NPC is
 * still unresolved.
 */
function baseEventClass(
  event: RelationalEvent,
  record: NpcRelationshipRecord,
  boundaryMode: BoundaryMode,
): EventClass {
  if (event === "THREAT") {
    return boundaryMode === "CROSS_WITHOUT_PERMISSION" ? "SEVERE_RUPTURE" : "STRAIN";
  }
  if (event === "BREAKS_PROMISE") {
    const wouldBeThirdConfirmed = record.promiseBreakCount + 1 >= 3;
    const hasUnresolvedPromiseRupture = record.causalEventHistory.some(
      (entry) => entry.event === "BREAKS_PROMISE" && !entry.resolved,
    );
    return wouldBeThirdConfirmed && hasUnresolvedPromiseRupture ? "SEVERE_RUPTURE" : "STRAIN";
  }
  return SIMPLE_RELATIONAL_EVENT_CLASS[event];
}

/**
 * V14 §2's explicit combo: PUBLIC_SHAMING + PERSONAL_INSULT in the same
 * turn reclassifies *both* as SEVERE_RUPTURE, replacing (not stacking on
 * top of) the STRAIN each would otherwise carry alone.
 */
function classifyTurnEvents(
  events: readonly RelationalEvent[],
  record: NpcRelationshipRecord,
  boundaryMode: BoundaryMode,
): ReadonlyMap<RelationalEvent, EventClass> {
  const classes = new Map<RelationalEvent, EventClass>();
  for (const event of events) {
    classes.set(event, baseEventClass(event, record, boundaryMode));
  }
  const hasCombo = [...SEVERE_RUPTURE_COMBO].every((comboEvent) => events.includes(comboEvent));
  if (hasCombo) {
    for (const comboEvent of SEVERE_RUPTURE_COMBO) {
      classes.set(comboEvent, "SEVERE_RUPTURE");
    }
  }
  return classes;
}

const SEVERE_RUPTURE_TABLE: Record<RelationshipState, RelationshipState> = {
  OPEN: "GUARDED",
  NEUTRAL: "GUARDED",
  GUARDED: "WITHDRAWN",
  WITHDRAWN: "WITHDRAWN",
};

const STRAIN_TABLE: Record<RelationshipState, RelationshipState> = {
  OPEN: "NEUTRAL",
  NEUTRAL: "GUARDED",
  GUARDED: "GUARDED",
  WITHDRAWN: "WITHDRAWN",
};

/**
 * V14 §3 RELIABILITY + V16 §6.1's WITHDRAWN row. Unlike SEVERE_RUPTURE/STRAIN
 * this cannot be a static lookup table: GUARDED->NEUTRAL and NEUTRAL->OPEN
 * are each conditional (V16 §6.1/§6.4), not unconditional per-state moves.
 */
function applyReliabilityTransition(
  record: NpcRelationshipRecord,
  incrementedObservationCount: number,
): { relationshipState: RelationshipState; reliabilityObservationCount: number } {
  const state = record.relationshipState;
  if (state === "WITHDRAWN" || state === "OPEN") {
    return { relationshipState: state, reliabilityObservationCount: incrementedObservationCount };
  }
  if (state === "GUARDED") {
    const eligible = !hasEverHadSevereRupture(record);
    const hasCompletedCorrectiveAction = record.causalEventHistory.some((entry) => entry.resolved);
    if (eligible && hasCompletedCorrectiveAction) {
      return { relationshipState: "NEUTRAL", reliabilityObservationCount: 0 };
    }
    return { relationshipState: "GUARDED", reliabilityObservationCount: incrementedObservationCount };
  }
  // NEUTRAL: "two separate reliability observations exist after the last strain" (V14 §3).
  if (incrementedObservationCount >= 2) {
    return { relationshipState: "OPEN", reliabilityObservationCount: 0 };
  }
  return { relationshipState: "NEUTRAL", reliabilityObservationCount: incrementedObservationCount };
}

/** V16 §6.3's target rule, computed fresh rather than tracked incrementally (see the call site's comment for why). */
function findMostRecentUnresolvedStrain(history: readonly CausalEventHistoryEntry[]): string | null {
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const entry = history[i];
    if (entry.eventClass === "STRAIN" && !entry.resolved) {
      return entry.id;
    }
  }
  return null;
}

let sequentialIdCounter = 0;
/** Deterministic, collision-free within a process — no `Math.random`, matching the reducer's own determinism requirement. Callers that need reproducible snapshots across runs (tests, replay) should not depend on the exact string, only on uniqueness and turnRef traceability. */
function nextEntryId(prefix: string, turnRef: string): string {
  sequentialIdCounter += 1;
  return `${prefix}:${turnRef}:${sequentialIdCounter}`;
}

export interface RelationalTurnInput {
  turnRef: string;
  events: readonly RelationalEvent[];
  boundaryMode: BoundaryMode;
}

/**
 * V14 §2 steps 1-5 + §4's mixed-turn rule + V16 §6.5's general
 * null-effect-cascade rule, applied concretely: REPAIR's own immediate
 * relationship-state effect is always "none" (V14 §3), so it never wins the
 * precedence contest for *transition* purposes — but it still opens
 * `repairWindow` on its own, independently, whenever it is present and no
 * higher-precedence (SEVERE_RUPTURE/STRAIN) class is also present that turn
 * (V14 §4: "An apology does not cancel a simultaneous new offense" — STRAIN
 * wins the transition *and* suppresses the window; V16 §6.5: REPAIR +
 * RELIABILITY both apply independently since neither out-ranks the other in
 * a way that suppresses the other's effect).
 */
export function applyRelationalTurn(
  record: NpcRelationshipRecord,
  input: RelationalTurnInput,
): NpcRelationshipRecord {
  const eventClasses = classifyTurnEvents(input.events, record, input.boundaryMode);
  const presentClasses = new Set(eventClasses.values());

  const hasSevereRupture = presentClasses.has("SEVERE_RUPTURE");
  const hasStrain = presentClasses.has("STRAIN");
  const hasRepair = presentClasses.has("REPAIR");
  const hasReliability = presentClasses.has("RELIABILITY");

  // V14 §2 step 5: log every accepted event, regardless of which class
  // governs this turn's transition.
  const newEntries: CausalEventHistoryEntry[] = input.events.map((event) => ({
    id: nextEntryId("rel", input.turnRef),
    turnRef: input.turnRef,
    event,
    eventClass: eventClasses.get(event) as EventClass,
    resolved: false,
    resolvingReference: null,
    resolvedAtTurn: null,
  }));
  const causalEventHistory = [...record.causalEventHistory, ...newEntries];

  // Every confirmed BREAKS_PROMISE increments the counter that feeds the
  // "third confirmed ... while unresolved" SEVERE_RUPTURE trigger (V14 §3),
  // regardless of which class this particular occurrence itself lands in.
  // Only `completeCorrectiveAction` resets it (V16 §6.6, scoped by V24 §2).
  const breaksPromiseCount = input.events.filter((event) => event === "BREAKS_PROMISE").length;
  const promiseBreakCount = record.promiseBreakCount + breaksPromiseCount;

  // Transition selection: SEVERE_RUPTURE > STRAIN > RELIABILITY. REPAIR is
  // deliberately absent from this contest (null effect, V14 §3/§4).
  let relationshipState = record.relationshipState;
  let reliabilityObservationCount = record.reliabilityObservationCount;
  const recordAfterLogging: NpcRelationshipRecord = { ...record, causalEventHistory };

  if (hasSevereRupture) {
    relationshipState = SEVERE_RUPTURE_TABLE[record.relationshipState];
  } else if (hasStrain) {
    relationshipState = STRAIN_TABLE[record.relationshipState];
  } else if (hasReliability) {
    const incremented = record.reliabilityObservationCount + 1;
    const result = applyReliabilityTransition(recordAfterLogging, incremented);
    relationshipState = result.relationshipState;
    reliabilityObservationCount = result.reliabilityObservationCount;
  }
  // else: only REPAIR (or nothing) present — relationshipState unchanged,
  // matching V14 §3's "Immediate relationship transition: none."

  // REPAIR_WINDOW side effect, independent of the transition contest above.
  // A fresh negative event (SEVERE_RUPTURE/STRAIN) this turn suppresses it
  // (V14 §4). Absent that, and absent REPAIR, an existing OPEN window from
  // an earlier turn is left untouched — only `completeCorrectiveAction`
  // closes one, or a fresh REPAIR here retargets it.
  //
  // `lastStrainEventId` is kept in sync with `repairWindow` (null iff
  // CLOSED, matching the field's own doc comment in types.ts) rather than
  // maintained as an independent running pointer: V16 §6.3 targets "the
  // most recently logged *unresolved* STRAIN at the moment ACKNOWLEDGES_MISTAKE
  // is validated," which is recomputed fresh here by scanning history, not
  // carried forward turn-to-turn (a stale pointer could otherwise still
  // reference a STRAIN entry a since-completed corrective action already
  // resolved).
  const opensRepairWindow = hasRepair && !hasSevereRupture && !hasStrain;
  let repairWindow = record.repairWindow;
  let lastStrainEventId = record.lastStrainEventId;
  if (opensRepairWindow) {
    const target = findMostRecentUnresolvedStrain(causalEventHistory);
    if (target !== null) {
      repairWindow = { status: "OPEN", targetEntryId: target };
      lastStrainEventId = target;
    }
    // else: ACKNOWLEDGES_MISTAKE with no unresolved STRAIN to target —
    // window state left exactly as it was (a no-op apology).
  }

  return {
    ...record,
    relationshipState,
    repairWindow,
    reliabilityObservationCount,
    promiseBreakCount,
    causalEventHistory,
    lastStrainEventId,
  };
}

/** V16 §6.2's four corrective-action branches (V22 §2 names them explicitly). */
export type CorrectiveActionBranch =
  | "PERSONAL_INSULT_OR_DISMISSES_CONCERN"
  | "PUBLIC_SHAMING"
  | "FALSE_ATTRIBUTION"
  | "BREAKS_PROMISE";

export interface CompleteCorrectiveActionInput {
  turnRef: string;
  branch: CorrectiveActionBranch;
  /**
   * Required for FALSE_ATTRIBUTION and BREAKS_PROMISE only (V22 §2.3): the
   * `causalEventHistory` entry id of the relational event that *is* this
   * completion's evidence (the logged correction / the logged
   * KEEPS_PROMISE) — already appended by a prior `applyRelationalTurn` call
   * for this same turn. Unused for the other two branches, which log their
   * own `correctiveActionLog` entry instead (V22 §2.2).
   */
  relationalEvidenceEntryId?: string;
}

/**
 * V16 §6.2 (definition) + V16 §6.3 (target/expiry/consumption) + V22 §1.2
 * (six-step pipeline) + V24 §1 (single eligibility test) + V24 §2
 * (`promiseBreakCount` reset scoping) + V24 §3 (FALSE_ATTRIBUTION same-turn
 * ordering note — this function already implements "open then immediately
 * consume" correctly for that branch as a plain sequential call, no special
 * case needed).
 *
 * No-op (returns `record` unchanged) if `repairWindow` is not OPEN or its
 * target entry cannot be found — there is nothing pending to complete.
 */
export function completeCorrectiveAction(
  record: NpcRelationshipRecord,
  input: CompleteCorrectiveActionInput,
): NpcRelationshipRecord {
  if (record.repairWindow.status !== "OPEN") {
    return record;
  }
  const targetEntryId = record.repairWindow.targetEntryId;
  const targetEntry = record.causalEventHistory.find((entry) => entry.id === targetEntryId);
  if (!targetEntry) {
    return record;
  }

  // Step 2 (record completion) + provenance shape (V22 §2.2).
  let correctiveActionLog = record.correctiveActionLog;
  let resolvingReference: ResolvingReference;
  if (input.branch === "FALSE_ATTRIBUTION" || input.branch === "BREAKS_PROMISE") {
    if (!input.relationalEvidenceEntryId) {
      throw new Error(
        `completeCorrectiveAction: branch "${input.branch}" requires relationalEvidenceEntryId (V22 §2.3)`,
      );
    }
    resolvingReference = { layer: "RELATIONAL_EVENT", entryId: input.relationalEvidenceEntryId };
  } else {
    const logEntry: CorrectiveActionLogEntry = {
      id: nextEntryId("corrective", input.turnRef),
      turnRef: input.turnRef,
      targetedEntryId: targetEntryId,
    };
    correctiveActionLog = [...record.correctiveActionLog, logEntry];
    resolvingReference = { layer: "CORRECTIVE_ACTION_COMPLETION", entryId: logEntry.id };
  }

  // Step 3: consume the window unconditionally (V16 §6.3, V22 §1.2 step 3,
  // V24 §1 — no exception for any relationship state including WITHDRAWN).
  const repairWindow = { status: "CLOSED" } as const;

  // Step 4: the sole eligibility test (V24 §1.2, replacing V16 §6.4's
  // former two-sentence contradiction).
  const eligible = !hasEverHadSevereRupture(record);

  // Step 5: emit the transition only if eligible.
  let relationshipState = record.relationshipState;
  if (eligible) {
    if (relationshipState === "GUARDED") {
      relationshipState = "NEUTRAL";
    } else if (relationshipState === "NEUTRAL") {
      relationshipState = "OPEN";
    }
  }
  const transitioned = relationshipState !== record.relationshipState;

  // V16 §6.6: reliabilityObservationCount resets on any GUARDED->NEUTRAL or
  // NEUTRAL->OPEN transition it contributes to — including one produced by
  // this completion pipeline, not only by a bare RELIABILITY event.
  const reliabilityObservationCount = transitioned ? 0 : record.reliabilityObservationCount;

  // V24 §2: promiseBreakCount resets only when the targeted entry is itself
  // the promise-break-caused STRAIN (checked against the entry, not the
  // caller-supplied branch label, so a mismatched branch can't silently
  // reset the wrong counter), and only when the completion was
  // transition-*eligible* (not merely when a transition happened to occur,
  // matching V24 §2's literal wording).
  const promiseBreakCount =
    targetEntry.event === "BREAKS_PROMISE" && eligible ? 0 : record.promiseBreakCount;

  // Step 6: mark resolved unconditionally (independent of step 5's outcome).
  const causalEventHistory = record.causalEventHistory.map((entry) =>
    entry.id === targetEntryId
      ? { ...entry, resolved: true, resolvingReference, resolvedAtTurn: input.turnRef }
      : entry,
  );

  return {
    ...record,
    relationshipState,
    repairWindow,
    // Kept in sync with `repairWindow` (null iff CLOSED, types.ts's own
    // invariant) — a later REPAIR re-scans history fresh (V16 §6.3's "if
    // multiple STRAINs are unresolved, only the most recent is targeted";
    // an older still-unresolved STRAIN is correctly picked up by that scan
    // without needing a stale pointer to it here).
    lastStrainEventId: null,
    reliabilityObservationCount,
    promiseBreakCount,
    causalEventHistory,
    correctiveActionLog,
  };
}

/** Re-exported for callers that need to reason about precedence without duplicating the literal array (V14 §2). */
export const RELATIONSHIP_EVENT_CLASS_PRECEDENCE = EVENT_CLASS_PRECEDENCE;

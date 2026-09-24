/**
 * NEW LIFE refoundation — semantic interpreter contract (V11 order, stage 4 of 8).
 *
 * DESIGN-FIRST, NOT WIRED IN. Same status as `types.ts`/`relationshipReducer.ts`/
 * `timeEconomy.ts`/`ending.ts`: nothing in `src/newlife/refoundation/` is
 * imported by `npcVoice.ts`, `NewLife30App.tsx`, `App.tsx`, or anything under
 * `src/newlife/semantic/` this Run. Legacy public NEW LIFE is untouched.
 *
 * Structurally mirrors `src/newlife/semantic/{contract,adapter,httpInterpreter}.ts`'s
 * adapter-boundary + "validate the shape, never trust the parse" pattern,
 * adapted to the blind-validated V13-V24 four-layer `TurnClassification`
 * ontology (`types.ts`) instead of Phase 29's CASE1-specific `FactCategory`
 * contract. That pattern already answers most of this stage's requirements
 * for free: a swappable `*Adapter` interface, a `Null*Adapter` that is the
 * only implementation that exists this Run (no network call, no provider,
 * no secret), and a orchestration function that treats "no provider
 * configured," "provider call failed," and "provider returned a malformed
 * shape" identically — collapsing all three into one safe fallback rather
 * than letting any of them leak an untrusted guess downstream.
 *
 * SYSTEM OWNS TRUTH/STATE, AI OWNS EXPRESSION/INTERPRETATION (restated by
 * `relationshipReducer.ts`'s own header) holds structurally here, not only by
 * convention: every exported function in this module returns a
 * `TurnClassification` (plus an optional `PersonalTrackSignal`) value and
 * nothing else. None of them import `NpcRelationshipRecord`,
 * `CaseEndingState`, `applyRelationalTurn`, `applyEndingTurn`,
 * `completeCorrectiveAction`, or any other state-mutating symbol from
 * `relationshipReducer.ts`/`ending.ts` — a classification produced here
 * cannot, even by accident, reach into state. Applying a `TurnClassification`
 * to state remains those modules' job (V11 stages 2-3, already implemented);
 * wiring "classify this turn, then apply the result" together is the future
 * game loop's job, not this stage's.
 *
 * Regex/string-matching discipline: this module performs *zero* pattern
 * matching over `TurnInterpretationRequest.utterance`. The raw text is an
 * opaque pass-through to whatever `SemanticInterpreterAdapter` a caller
 * supplies — this module never reads it, only forwards it. Classification
 * comes exclusively from the adapter's returned value, shape-validated
 * against the closed V13-V24 enums (`ALL_ACTION_TYPES`/`ALL_BOUNDARY_MODES`/
 * `ALL_RELATIONAL_EVENTS`, already exported by `types.ts`). Regex therefore
 * cannot become "the primary semantic engine" through this module, because
 * this module does not contain a semantic engine at all — only a contract,
 * a validator, and a conservative fallback. A future regex-based adapter is
 * possible (e.g. as a cheap placeholder before a model-backed adapter
 * exists) but would live behind `SemanticInterpreterAdapter`, itself be
 * swappable, and still pass through this same validator/fallback path — it
 * could not bypass conservative-ambiguity handling or claim primacy over a
 * model adapter without a separate normative patch authorizing that.
 */
import {
  ALL_ACTION_TYPES,
  ALL_BOUNDARY_MODES,
  ALL_RELATIONAL_EVENTS,
  type ActionType,
  type BoundaryMode,
  type RelationalEvent,
  type TurnClassification,
} from "./types";
import type { PersonalTrackSignal } from "./ending";

/**
 * Minimal, case-agnostic input for one turn's classification. Mirrors
 * `FactsSnapshot`'s data-minimization discipline (`contract.ts`) without
 * borrowing its CASE1-specific `FactCategory` shape — the refoundation
 * ontology (V13-V24) is unrelated to Phase 29's fact-answering contract.
 * `caseContext` is deliberately opaque free text (e.g. which NPC is
 * addressed, what boundary/plan is already on record, recent turns) —
 * this module never parses it; only a real adapter implementation would.
 */
export interface TurnInterpretationRequest {
  readonly utterance: string;
  readonly speaker: "PLAYER";
  readonly caseContext: string;
}

/**
 * The untrusted value a real provider adapter would return for one turn,
 * before shape validation. Extends `TurnClassification` (the reducers'
 * input contract, `types.ts`) with the one optional cross-cutting signal
 * `ending.ts` defines (V27 §4.1: "orthogonal to the four-layer
 * `TurnClassification` contract... a future semantic interpreter may attach
 * this alongside a turn's classification"). Deliberately excludes
 * CASE1-specific response-generation fields (`proposedResponse` etc. in
 * `contract.ts`) — this module only ever produces the structured fact the
 * reducers consume; generating NPC-facing display text is a later stage's
 * job (V11 stage 5, NPC generation), and V13 §1's "AI owns semantic
 * conversation and expression" split keeps that job separate from this
 * one's "AI owns semantic *interpretation*" half.
 */
export type RawTurnClassification = TurnClassification & {
  personalTrackSignal?: PersonalTrackSignal | null;
};

export type AdapterCallResult = { status: "ok"; raw: unknown } | { status: "unavailable"; reason: string };

/**
 * The swappable boundary a real provider integration implements later
 * (mirrors `SemanticInterpreter` in `contract.ts`). Returns an *untrusted*
 * `unknown` payload on success — `isValidRawTurnClassification` below is
 * the only thing allowed to promote it to a typed value. Must never throw
 * for an ordinary failure (network/timeout/provider error); those resolve
 * to `{ status: "unavailable" }` the same way `HttpSemanticInterpreter`
 * does. `interpretTurn` additionally tolerates a thrown rejection so an
 * adapter author's mistake cannot escape this module's fallback guarantee.
 */
export interface SemanticInterpreterAdapter {
  classify(request: TurnInterpretationRequest): Promise<AdapterCallResult>;
}

/**
 * Always reports unavailable. Same role as `NullSemanticInterpreter`
 * (`adapter.ts`): makes "no live provider yet" an enforced fallback branch
 * every caller must handle, rather than only a sentence in a report.
 */
export class NullSemanticInterpreterAdapter implements SemanticInterpreterAdapter {
  async classify(_request: TurnInterpretationRequest): Promise<AdapterCallResult> {
    return { status: "unavailable", reason: "no_provider_configured" };
  }
}

/**
 * Deterministic test/replay helper: returns one fixed `AdapterCallResult`
 * every call, regardless of the request. Not a "real" provider — exists so
 * (a) this module's own tests can drive `interpretTurn` without a network
 * dependency, and (b) V11 stage 8 (blind/automated replay) can later feed
 * known utterance-to-classification fixtures — e.g. the already-blind-
 * validated V4-V9 matrix cases — through the exact same orchestration path
 * a live adapter would use, without needing a live model for regression
 * replay.
 */
export class FixedResponseAdapter implements SemanticInterpreterAdapter {
  constructor(private readonly response: AdapterCallResult) {}

  async classify(_request: TurnInterpretationRequest): Promise<AdapterCallResult> {
    return this.response;
  }
}

/**
 * V13 §3(a)'s conservative-ambiguity default, encoded once so no caller
 * reconstructs it ad hoc: action unresolved -> CLARIFY, no boundary reading,
 * no relational event, `needsClarification` asserted. Every blind-validated
 * V8/V9 matrix CLARIFY fixture (e.g. T24/T37, Z-series) matches this exact
 * shape — see `isValidRawTurnClassification`'s cross-field invariant below.
 */
export const CONSERVATIVE_CLARIFY_CLASSIFICATION: TurnClassification = {
  action: "CLARIFY",
  boundaryMode: "UNKNOWN",
  relationalEvents: [],
  needsClarification: true,
};

function isActionType(value: unknown): value is ActionType {
  return typeof value === "string" && (ALL_ACTION_TYPES as readonly string[]).includes(value);
}

function isBoundaryMode(value: unknown): value is BoundaryMode {
  return typeof value === "string" && (ALL_BOUNDARY_MODES as readonly string[]).includes(value);
}

function isRelationalEventArray(value: unknown): value is RelationalEvent[] {
  return (
    Array.isArray(value) && value.every((v) => typeof v === "string" && (ALL_RELATIONAL_EVENTS as readonly string[]).includes(v))
  );
}

/**
 * Field-by-field shape validation (not just `typeof value === "object"`) —
 * mirrors `httpInterpreter.ts`'s `isValidInterpretation`: a response with a
 * wrong enum value, a missing array, or a non-boolean flag is rejected here,
 * never trusted onward just because it parsed as JSON. Extra fields beyond
 * the ones checked (e.g. a hallucinated `confidence` or `notes` key) are
 * ignored, matching `isValidInterpretation`'s own leniency — only the
 * fields this module actually reads are load-bearing.
 *
 * Also enforces the one cross-field invariant every blind-validated V8/V9
 * matrix CLARIFY fixture holds without exception: `action === "CLARIFY"`
 * and `needsClarification === true` move together, and whenever both hold,
 * `boundaryMode` must be `"UNKNOWN"` and `relationalEvents` must be empty.
 * This closes requirement 2 ("uncertain interpretation must yield the
 * existing CLARIFY/no-state-cost behavior rather than guessing") as a
 * structural check, not a documentation promise: a provider cannot assert
 * `needsClarification: true` while still smuggling in a specific
 * ACTION/BOUNDARY_MODE/relational-event reading, and cannot claim
 * `action: "CLARIFY"` while leaving `needsClarification` false (which would
 * make a downstream caller treat an uncertain turn as a confidently
 * resolved one).
 */
export function isValidRawTurnClassification(value: unknown): value is RawTurnClassification {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;

  if (!isActionType(v.action)) return false;
  if (!isBoundaryMode(v.boundaryMode)) return false;
  if (!isRelationalEventArray(v.relationalEvents)) return false;
  if (typeof v.needsClarification !== "boolean") return false;

  if (v.personalTrackSignal !== undefined && v.personalTrackSignal !== null && v.personalTrackSignal !== "OPENED") {
    return false;
  }

  const isClarifyAction = v.action === "CLARIFY";
  if (isClarifyAction !== v.needsClarification) return false;
  if (isClarifyAction) {
    if (v.boundaryMode !== "UNKNOWN") return false;
    if ((v.relationalEvents as unknown[]).length !== 0) return false;
  }

  return true;
}

export type TurnInterpretationResult =
  | { status: "interpreted"; classification: TurnClassification; personalTrackSignal: PersonalTrackSignal | null }
  | { status: "fallback"; classification: TurnClassification; personalTrackSignal: null; reason: string };

/**
 * The one orchestration entry point (requirement 1/3/7). Calls the adapter,
 * validates the shape, and never lets an adapter failure or malformed
 * response escape as anything other than `CONSERVATIVE_CLARIFY_CLASSIFICATION`
 * — "provider unavailable," "provider threw," and "provider returned
 * garbage" are all indistinguishable to a caller past this function (only
 * `reason` differs, for logging/debugging), matching how
 * `coordinator.ts`/`httpInterpreter.ts` already treat "no live provider" and
 * "provider errored" identically today.
 *
 * Never throws. Every adapter failure mode (rejected promise, malformed
 * shape) resolves to `status: "fallback"` instead.
 *
 * Performs no state mutation: takes no `NpcRelationshipRecord` or
 * `CaseEndingState`, and its return type carries only a `TurnClassification`
 * plus an optional `PersonalTrackSignal` — applying either to state is the
 * caller's job (`applyRelationalTurn` / `applyEndingTurn`, already
 * implemented in stages 2-3), never this function's.
 */
export async function interpretTurn(
  adapter: SemanticInterpreterAdapter,
  request: TurnInterpretationRequest,
): Promise<TurnInterpretationResult> {
  let callResult: AdapterCallResult;
  try {
    callResult = await adapter.classify(request);
  } catch (err) {
    return {
      status: "fallback",
      classification: CONSERVATIVE_CLARIFY_CLASSIFICATION,
      personalTrackSignal: null,
      reason: err instanceof Error ? `adapter_threw:${err.message}` : "adapter_threw",
    };
  }

  if (callResult.status === "unavailable") {
    return {
      status: "fallback",
      classification: CONSERVATIVE_CLARIFY_CLASSIFICATION,
      personalTrackSignal: null,
      reason: callResult.reason,
    };
  }

  const raw: unknown = callResult.raw;
  if (!isValidRawTurnClassification(raw)) {
    return {
      status: "fallback",
      classification: CONSERVATIVE_CLARIFY_CLASSIFICATION,
      personalTrackSignal: null,
      reason: "malformed_response",
    };
  }

  const { personalTrackSignal, ...classification } = raw;
  return {
    status: "interpreted",
    classification,
    personalTrackSignal: personalTrackSignal ?? null,
  };
}

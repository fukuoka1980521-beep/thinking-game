/**
 * NEW LIFE refoundation — generative character conversation (V37, primary
 * free-conversation path).
 *
 * DESIGN-FIRST STATUS UPGRADED: unlike the rest of `src/newlife/refoundation/`,
 * this module IS wired into `RefoundationApp.tsx`'s normal free-text path
 * (V37 §4). Legacy public NEW LIFE (`npcVoice.ts`, `NewLife30App.tsx`,
 * `src/newlife/semantic/`) is still untouched and imports nothing from here.
 *
 * Implements `docs/newlife/refoundation/V37_GENERATIVE_CHARACTER_REASONING_ARCHITECTURE_V1.md`
 * §1/§3/§4/§7. Supersedes the two-step "classify raw text into a narrow
 * `TurnClassification` -> feed a thin `NpcVisibleStateProjection` to a
 * sentence renderer" pattern V37 §0/§6 explicitly rejects, with ONE richer
 * operation: send the raw utterance + bounded recent dialogue + dynamic
 * state, and get back a character-consistent reply plus a *candidate*
 * classification in one call. `semanticInterpreter.ts`/`npcGeneration.ts`
 * remain for compatibility/testing (V37 §7) but are no longer primary.
 *
 * CANON STAYS SERVER-SIDE (V37 §1's explicit prohibition — "do not make the
 * browser send hidden canon as authoritative truth"): `CharacterConversationRequest`
 * below carries only dynamic/conversational data (caseId/targetNpc/
 * rawPlayerUtterance/recentDialogue/dynamicState) — no scene facts, no
 * character dossier, no forbidden-knowledge list. The server
 * (`functions/newlife-refoundation-ai/lib.js`'s `SCENE_CANON`/
 * `CHARACTER_DOSSIERS`) is the sole source of that canon and builds the full
 * `CharacterConversationContext` itself before calling the model.
 *
 * SYSTEM OWNS TRUTH/STATE, AI OWNS CONVERSATIONAL REASONING (V37 §1's
 * restated core principle): `converseTurn` returns only data — an `npcLine`
 * to display and a `candidateTurn`/`candidateFactRevealIds`/
 * `candidateCommitments` that are proposals only. This module never imports
 * `NpcRelationshipRecord`, `CaseEndingState`, or any state-mutating symbol
 * from `relationshipReducer.ts`/`ending.ts` — applying a validated
 * `candidateTurn` to state remains the caller's job (`RefoundationApp.tsx`),
 * exactly as `semanticInterpreter.ts`'s own header already established for
 * `TurnClassification`. A malformed/unvalidatable model response can never
 * reach the caller as anything other than the same safe, no-state-cost
 * CLARIFY-shaped candidate turn `semanticInterpreter.ts` already uses for
 * this purpose (`CONVERSE_FALLBACK_CANDIDATE_TURN` below).
 *
 * Regex/string-matching discipline: this module performs *zero* pattern
 * matching over `rawPlayerUtterance` or `recentDialogue` — both are opaque
 * pass-through to whatever `ConversationAdapter` a caller supplies. There is
 * no per-utterance answer table anywhere in this file (V37 §1's explicit
 * prohibition, V37 §10's "STOP: case-specific reply patches").
 */
import {
  ALL_ACTION_TYPES,
  ALL_BOUNDARY_MODES,
  ALL_RELATIONAL_EVENTS,
  type ActionType,
  type BoundaryMode,
  type RelationalEvent,
  type RelationshipState,
} from "./types";
import type { EndingBoundaryStatus } from "./ending";
import { FALLBACK_LINES, containsForbiddenLabel, type NpcId } from "./npcGeneration";

/** V37 §1. Matches `functions/newlife-refoundation-ai/lib.js`'s `DIALOGUE_SPEAKERS`. */
export type DialogueSpeaker = "PLAYER" | "MIKA" | "RYO" | "SYSTEM";

export interface RawDialogueLine {
  readonly speaker: DialogueSpeaker;
  readonly text: string;
}

/** V37 §1's `dynamicState` — the only per-case *state* the client sends; never canon. */
export interface ConversationDynamicState {
  readonly relationshipState: RelationshipState;
  readonly boundaryStatus: EndingBoundaryStatus;
  readonly remainingMinutes: number;
  /** Opaque one-line summary of the case's current operative plan, or null if none yet. Never parsed by this module. */
  readonly activeCommitment: string | null;
}

/**
 * V37 §1's minimal input. Deliberately excludes any scene-fact or
 * character-dossier field — see this module's header. `caseId` is a closed
 * literal (one value) for this vertical slice, matching
 * `functions/newlife-refoundation-ai/lib.js`'s `CASE_IDS`.
 */
export interface CharacterConversationRequest {
  readonly caseId: "COMMUNITY_THEATER_V1";
  readonly targetNpc: NpcId;
  readonly rawPlayerUtterance: string;
  readonly recentDialogue: readonly RawDialogueLine[];
  readonly dynamicState: ConversationDynamicState;
}

/** V37 §3's `candidateTurn` — reuses the closed, blind-validated V13-V24 enums; still only a proposal. */
export interface CandidateTurn {
  action: ActionType;
  boundaryMode: BoundaryMode;
  relationalEvents: RelationalEvent[];
  needsClarification: boolean;
}

export type Uncertainty = "LOW" | "MEDIUM" | "HIGH";

/** V37 §3's minimum `converse_turn` output shape. */
export interface RawConverseTurnResult {
  npc: NpcId;
  npcLine: string;
  understoodPlayerMeaning: string;
  candidateTurn: CandidateTurn;
  candidateFactRevealIds: string[];
  candidateCommitments: string[];
  uncertainty: Uncertainty;
  thoughtSupportSignal: boolean;
}

export type AdapterCallResult = { status: "ok"; raw: unknown } | { status: "unavailable"; reason: string };

/** The swappable boundary a real provider integration implements (mirrors `SemanticInterpreterAdapter`/`NpcGenerationAdapter`). */
export interface ConversationAdapter {
  converse(request: CharacterConversationRequest): Promise<AdapterCallResult>;
}

/** Always reports unavailable. No network call, no provider, no secret. */
export class NullConversationAdapter implements ConversationAdapter {
  async converse(_request: CharacterConversationRequest): Promise<AdapterCallResult> {
    return { status: "unavailable", reason: "no_provider_configured" };
  }
}

/** Deterministic test/replay helper: one fixed response per call, regardless of the request. */
export class FixedResponseConversationAdapter implements ConversationAdapter {
  constructor(private readonly response: AdapterCallResult) {}

  async converse(_request: CharacterConversationRequest): Promise<AdapterCallResult> {
    return this.response;
  }
}

/**
 * V37 §3's uncertainty-signalled conservative default, mirroring
 * `semanticInterpreter.ts`'s `CONSERVATIVE_CLARIFY_CLASSIFICATION`: action
 * unresolved -> CLARIFY, no boundary reading, no relational event,
 * `needsClarification` asserted.
 */
export const CONVERSE_FALLBACK_CANDIDATE_TURN: CandidateTurn = {
  action: "CLARIFY",
  boundaryMode: "UNKNOWN",
  relationalEvents: [],
  needsClarification: true,
};

const MAX_NPC_LINE_LENGTH = 600;
const MAX_UNDERSTOOD_MEANING_LENGTH = 300;
const MAX_CANDIDATE_LIST_ITEMS = 5;
const MAX_CANDIDATE_ITEM_LENGTH = 200;
const UNCERTAINTY_LEVELS: readonly Uncertainty[] = ["LOW", "MEDIUM", "HIGH"];

function isNonEmptyBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

function isBoundedStringArray(value: unknown, maxItems: number, maxItemLength: number): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= maxItems &&
    value.every((v) => typeof v === "string" && v.length <= maxItemLength)
  );
}

function isRelationalEventArray(value: unknown): value is RelationalEvent[] {
  return (
    Array.isArray(value) &&
    value.every((v) => typeof v === "string" && (ALL_RELATIONAL_EVENTS as readonly string[]).includes(v))
  );
}

/**
 * Mirrors `isValidRawTurnClassification`'s cross-field CLARIFY invariant
 * exactly, applied to the nested `candidateTurn` object instead of a
 * top-level `TurnClassification`.
 */
function isValidCandidateTurn(value: unknown): value is CandidateTurn {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;

  if (typeof v.action !== "string" || !(ALL_ACTION_TYPES as readonly string[]).includes(v.action)) return false;
  if (typeof v.boundaryMode !== "string" || !(ALL_BOUNDARY_MODES as readonly string[]).includes(v.boundaryMode)) {
    return false;
  }
  if (!isRelationalEventArray(v.relationalEvents)) return false;
  if (typeof v.needsClarification !== "boolean") return false;

  const isClarify = v.action === "CLARIFY";
  if (isClarify !== v.needsClarification) return false;
  if (isClarify) {
    if (v.boundaryMode !== "UNKNOWN") return false;
    if (v.relationalEvents.length !== 0) return false;
  }

  return true;
}

/**
 * Field-by-field shape validation — never trusts a response onward just
 * because it parsed as an object. Also rejects a literal ontology-label leak
 * in `npcLine` (reusing `npcGeneration.ts`'s own check, same discipline).
 */
export function isValidRawConverseResult(value: unknown, expectedNpc: NpcId): value is RawConverseTurnResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;

  if (v.npc !== expectedNpc) return false;
  if (!isNonEmptyBoundedString(v.npcLine, MAX_NPC_LINE_LENGTH)) return false;
  if (containsForbiddenLabel(v.npcLine)) return false;
  if (!isNonEmptyBoundedString(v.understoodPlayerMeaning, MAX_UNDERSTOOD_MEANING_LENGTH)) return false;
  if (!isValidCandidateTurn(v.candidateTurn)) return false;
  if (!isBoundedStringArray(v.candidateFactRevealIds, MAX_CANDIDATE_LIST_ITEMS, MAX_CANDIDATE_ITEM_LENGTH)) return false;
  if (!isBoundedStringArray(v.candidateCommitments, MAX_CANDIDATE_LIST_ITEMS, MAX_CANDIDATE_ITEM_LENGTH)) return false;
  if (typeof v.uncertainty !== "string" || !UNCERTAINTY_LEVELS.includes(v.uncertainty as Uncertainty)) return false;
  if (typeof v.thoughtSupportSignal !== "boolean") return false;

  return true;
}

export type ConverseTurnResult =
  | {
      status: "generated";
      fallback: false;
      npc: NpcId;
      npcLine: string;
      understoodPlayerMeaning: string;
      candidateTurn: CandidateTurn;
      candidateFactRevealIds: string[];
      candidateCommitments: string[];
      uncertainty: Uncertainty;
      thoughtSupportSignal: boolean;
    }
  | {
      status: "fallback";
      fallback: true;
      reason: string;
      npc: NpcId;
      npcLine: string;
      understoodPlayerMeaning: string;
      candidateTurn: CandidateTurn;
      candidateFactRevealIds: string[];
      candidateCommitments: string[];
      uncertainty: Uncertainty;
      thoughtSupportSignal: boolean;
    };

/**
 * The one orchestration entry point. Calls the adapter, validates the
 * shape, and never lets an adapter failure or malformed response escape as
 * anything other than the safe per-`(npc, relationshipState)` fallback line
 * (reused from `npcGeneration.ts`) paired with `CONVERSE_FALLBACK_CANDIDATE_TURN`
 * — "provider unavailable," "provider threw," and "provider returned
 * garbage" are all indistinguishable to a caller past this function (only
 * `reason` differs), matching `interpretTurn`/`generateNpcLine`'s own
 * discipline.
 *
 * Never throws. Performs no state mutation: returns only data: applying
 * `candidateTurn` (validated or fallback) to state remains the caller's job.
 */
export async function converseTurn(
  adapter: ConversationAdapter,
  request: CharacterConversationRequest,
): Promise<ConverseTurnResult> {
  const fallbackLine = FALLBACK_LINES[request.targetNpc][request.dynamicState.relationshipState];

  const fallback = (reason: string): ConverseTurnResult => ({
    status: "fallback",
    fallback: true,
    reason,
    npc: request.targetNpc,
    npcLine: fallbackLine,
    understoodPlayerMeaning: "",
    candidateTurn: CONVERSE_FALLBACK_CANDIDATE_TURN,
    candidateFactRevealIds: [],
    candidateCommitments: [],
    uncertainty: "HIGH",
    thoughtSupportSignal: false,
  });

  let callResult: AdapterCallResult;
  try {
    callResult = await adapter.converse(request);
  } catch (err) {
    return fallback(err instanceof Error ? `adapter_threw:${err.message}` : "adapter_threw");
  }

  if (callResult.status === "unavailable") {
    return fallback(callResult.reason);
  }

  const raw: unknown = callResult.raw;
  if (!isValidRawConverseResult(raw, request.targetNpc)) {
    return fallback("malformed_response");
  }

  return {
    status: "generated",
    fallback: false,
    npc: raw.npc,
    npcLine: raw.npcLine,
    understoodPlayerMeaning: raw.understoodPlayerMeaning,
    candidateTurn: raw.candidateTurn,
    candidateFactRevealIds: raw.candidateFactRevealIds,
    candidateCommitments: raw.candidateCommitments,
    uncertainty: raw.uncertainty,
    thoughtSupportSignal: raw.thoughtSupportSignal,
  };
}

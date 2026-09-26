/**
 * NEW LIFE refoundation — separate thought-organization layer (V37 §5).
 *
 * DESIGN-FIRST, WIRED IN as an optional panel (V37 §5's UI requirement: "one
 * optional button... do not interrupt every turn automatically").
 *
 * Implements `docs/newlife/refoundation/V37_GENERATIVE_CHARACTER_REASONING_ARCHITECTURE_V1.md`
 * §5. Deliberately a *separate* operation from `converse.ts` — V37 §5's
 * "Important separation: NPC vs thought organizer" is enforced structurally
 * here, not only by convention: `RawThoughtOrganizerResult` has no `npc`
 * field at all, so a provider adapter has no field to (mis)use to claim this
 * output is a character's line, and this module's caller
 * (`RefoundationApp.tsx`) renders its result in a panel labeled as thinking
 * support, never inside the transcript's character-dialogue area.
 *
 * SYSTEM OWNS TRUTH, AI OWNS REASONING SUPPORT: this module never imports
 * `NpcRelationshipRecord`/`CaseEndingState`/any state-mutating symbol —
 * `organizeThought` returns only `{known, possible, unknown, options,
 * nextCheck}`, all free-form advisory text, nothing that could be mistaken
 * for a state delta.
 *
 * Regex/string-matching discipline: zero pattern matching over
 * `validatedWorldFacts`/`recentDialogue`/`currentProblem` — all three are
 * opaque pass-through to whatever `ThoughtOrganizerAdapter` a caller
 * supplies.
 */
import type { RawDialogueLine } from "./converse";

export interface ThoughtOrganizerRequest {
  /** Opaque, caller-supplied summary of already-validated world facts. Never parsed here. */
  readonly validatedWorldFacts: string;
  readonly recentDialogue: readonly RawDialogueLine[];
  /** Opaque, caller-supplied summary of the current unresolved problem. Never parsed here. */
  readonly currentProblem: string;
}

/** V37 §5's minimum output shape. Deliberately has no `npc` field — see this module's header. */
export interface RawThoughtOrganizerResult {
  known: string[];
  possible: string[];
  unknown: string[];
  options: string[];
  nextCheck: string | null;
}

export type AdapterCallResult = { status: "ok"; raw: unknown } | { status: "unavailable"; reason: string };

export interface ThoughtOrganizerAdapter {
  organize(request: ThoughtOrganizerRequest): Promise<AdapterCallResult>;
}

/** Always reports unavailable. No network call, no provider, no secret. */
export class NullThoughtOrganizerAdapter implements ThoughtOrganizerAdapter {
  async organize(_request: ThoughtOrganizerRequest): Promise<AdapterCallResult> {
    return { status: "unavailable", reason: "no_provider_configured" };
  }
}

/** Deterministic test/replay helper: one fixed response per call, regardless of the request. */
export class FixedResponseThoughtOrganizerAdapter implements ThoughtOrganizerAdapter {
  constructor(private readonly response: AdapterCallResult) {}

  async organize(_request: ThoughtOrganizerRequest): Promise<AdapterCallResult> {
    return this.response;
  }
}

const MAX_LIST_ITEMS = 6;
const MAX_ITEM_LENGTH = 200;
const MAX_NEXT_CHECK_LENGTH = 200;

function isBoundedStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= MAX_LIST_ITEMS &&
    value.every((v) => typeof v === "string" && v.length <= MAX_ITEM_LENGTH)
  );
}

/** Field-by-field shape validation — never trusts a response onward just because it parsed as an object. */
export function isValidRawThoughtOrganizerResult(value: unknown): value is RawThoughtOrganizerResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;

  if (!isBoundedStringArray(v.known)) return false;
  if (!isBoundedStringArray(v.possible)) return false;
  if (!isBoundedStringArray(v.unknown)) return false;
  if (!isBoundedStringArray(v.options)) return false;
  if (v.nextCheck !== null) {
    if (typeof v.nextCheck !== "string" || v.nextCheck.length === 0 || v.nextCheck.length > MAX_NEXT_CHECK_LENGTH) {
      return false;
    }
  }

  return true;
}

/**
 * Safe, empty-shaped fallback: never a guess. Distinct from a "generated but
 * empty" result via `status`/`fallback`/`reason` on `ThoughtOrganizerResult`.
 */
const FALLBACK_UNKNOWN_LINE = "（このビルドでは思考整理AIに接続されていません。）";

export type ThoughtOrganizerResult =
  | ({ status: "generated"; fallback: false } & RawThoughtOrganizerResult)
  | ({ status: "fallback"; fallback: true; reason: string } & RawThoughtOrganizerResult);

/**
 * The one orchestration entry point. Never throws. Every adapter failure
 * mode (unavailable, threw, malformed shape) resolves to the same safe empty
 * fallback shape, mirroring `interpretTurn`/`converseTurn`'s own discipline.
 * Performs no state mutation: returns only advisory data.
 */
export async function organizeThought(
  adapter: ThoughtOrganizerAdapter,
  request: ThoughtOrganizerRequest,
): Promise<ThoughtOrganizerResult> {
  const fallback = (reason: string): ThoughtOrganizerResult => ({
    status: "fallback",
    fallback: true,
    reason,
    known: [],
    possible: [],
    unknown: [FALLBACK_UNKNOWN_LINE],
    options: [],
    nextCheck: null,
  });

  let callResult: AdapterCallResult;
  try {
    callResult = await adapter.organize(request);
  } catch (err) {
    return fallback(err instanceof Error ? `adapter_threw:${err.message}` : "adapter_threw");
  }

  if (callResult.status === "unavailable") {
    return fallback(callResult.reason);
  }

  const raw: unknown = callResult.raw;
  if (!isValidRawThoughtOrganizerResult(raw)) {
    return fallback("malformed_response");
  }

  return { status: "generated", fallback: false, ...raw };
}

/**
 * NEW LIFE refoundation — NPC generation contract (V11 order, stage 5 of 8).
 *
 * DESIGN-FIRST, NOT WIRED IN. Same status as every other module in
 * `src/newlife/refoundation/`: nothing here is imported by `npcVoice.ts`,
 * `NewLife30App.tsx`, `App.tsx`, or `src/newlife/semantic/` this Run.
 * Legacy public NEW LIFE is untouched.
 *
 * Implements `docs/newlife/refoundation/V31_NPC_GENERATION_CONTRACT_V1.md`.
 * Mirrors `semanticInterpreter.ts`'s adapter-boundary pattern in the
 * opposite direction: that module turns untrusted text into a trusted
 * structured value; this one turns a trusted structured value into
 * untrusted text. Both collapse "no provider," "provider threw," and
 * "provider returned a malformed shape" into one safe fallback.
 *
 * SYSTEM OWNS TRUTH/STATE, AI OWNS EXPRESSION: every exported function
 * returns only `{ npc, text, fallback }` — none takes or imports
 * `NpcRelationshipRecord`, `CaseEndingState`, or any state-mutating symbol
 * from `relationshipReducer.ts`/`ending.ts`/`timeEconomy.ts`. Generating a
 * line cannot apply a turn or spend time.
 *
 * Regex/tone discipline: this module contains zero pattern matching over
 * generated text's *meaning* — the one denylist check in
 * `isValidRawNpcLine` is a closed-list literal-substring plumbing check
 * against the already-closed V13-V24 enum tokens (ontology-label leakage),
 * not a semantic classifier, and it never reads `NpcVisibleStateProjection`
 * itself, only the adapter's returned text.
 */
import {
  ALL_ACTION_TYPES,
  ALL_BOUNDARY_MODES,
  ALL_RELATIONAL_EVENTS,
  type BoundaryMode,
  type RelationalEvent,
  type RelationshipState,
} from "./types";
import type { EndingBoundaryStatus } from "./ending";

export type NpcId = "MIKA" | "RYO";

/** V31 §2. Static, system-authored — never generated, never player-influenced. */
export interface NpcVoiceConstraints {
  readonly id: NpcId;
  readonly displayName: string;
  readonly registerSummary: string;
  readonly mustNot: readonly string[];
}

export const NPC_VOICE_CONSTRAINTS: Readonly<Record<NpcId, NpcVoiceConstraints>> = {
  MIKA: {
    id: "MIKA",
    displayName: "美香",
    registerSummary: "Firm, not hysterical (V3 opening). Direct refusal, not performative distress.",
    mustNot: [
      "moralize at the player",
      "offer counseling-style advice",
      "explain her own psychology unprompted",
      "read GUARDED/WITHDRAWN as sudden hostility beyond what recorded relationalEvents justify",
    ],
  },
  RYO: {
    id: "RYO",
    displayName: "亮",
    registerSummary: "Frustrated, not villainous (V3 opening). Production-pragmatic, logistics-first.",
    mustNot: [
      "become punitive or sarcastic beyond ordinary production-pressure irritation",
      "speak for Mika's private reasons (he does not know them at case start, V3 hidden layer)",
    ],
  },
};

/**
 * V31 §1. The generator's only input. Never the full hidden world: no other
 * NPC's `NpcRelationshipRecord`, no `causalEventHistory`/`correctiveActionLog`
 * (audit trails, not conversational material), and the player's last turn is
 * carried only as its already-validated structured classification — never
 * raw utterance text, so a generation adapter cannot re-score the player's
 * literal phrasing a second time after stage 4 already classified it
 * tone-blind.
 */
export interface NpcVisibleStateProjection {
  readonly npc: NpcId;
  readonly relationshipState: RelationshipState;
  readonly boundaryStatus: EndingBoundaryStatus;
  readonly lastPlayerTurn: {
    readonly action: string;
    readonly boundaryMode: BoundaryMode;
    readonly relationalEvents: readonly RelationalEvent[];
  } | null;
  /** Opaque, caller-supplied; never parsed here (mirrors `semanticInterpreter.ts`'s `caseContext`). */
  readonly sceneContext: string;
}

const MAX_LINE_LENGTH = 600;

/** V31 §3.3. Literal ontology tokens a generated line must never contain verbatim. */
const FORBIDDEN_LABEL_TOKENS: readonly string[] = [
  ...ALL_ACTION_TYPES,
  ...ALL_BOUNDARY_MODES,
  ...ALL_RELATIONAL_EVENTS,
  "OPEN",
  "NEUTRAL",
  "GUARDED",
  "WITHDRAWN",
  "TRUST",
  "CLARITY",
  "SITUATION",
];

export interface NpcLine {
  readonly npc: NpcId;
  readonly text: string;
}

export type RawNpcLine = NpcLine;

export type AdapterCallResult = { status: "ok"; raw: unknown } | { status: "unavailable"; reason: string };

/** The swappable boundary a real provider integration implements later (mirrors `SemanticInterpreterAdapter`). */
export interface NpcGenerationAdapter {
  generate(projection: NpcVisibleStateProjection): Promise<AdapterCallResult>;
}

/** Always reports unavailable. The only implementation that exists this Run — no network call, no secret. */
export class NullNpcGenerationAdapter implements NpcGenerationAdapter {
  async generate(_projection: NpcVisibleStateProjection): Promise<AdapterCallResult> {
    return { status: "unavailable", reason: "no_provider_configured" };
  }
}

/** Deterministic test/replay helper: one fixed response per call, regardless of projection. */
export class FixedResponseNpcAdapter implements NpcGenerationAdapter {
  constructor(private readonly response: AdapterCallResult) {}

  async generate(_projection: NpcVisibleStateProjection): Promise<AdapterCallResult> {
    return this.response;
  }
}

/**
 * V31 §4. Per-`(npc, relationshipState)` canned fallback lines — never one
 * generic line. Every entry is a neutral, stage-direction-style placeholder
 * (bracketed description, no dialogue claiming a new fact/promise/decision),
 * so the fallback path is safe and context-preserving by construction and
 * never mutates state. The WITHDRAWN entry is what structurally guarantees
 * non-cooperation is reflected rather than silently reset, in the one place
 * this module can guarantee it (the adapter-success path is only
 * documentation-constrained — V31 §2/§3's disclosed open limit).
 */
const FALLBACK_LINES: Readonly<Record<NpcId, Readonly<Record<RelationshipState, string>>>> = {
  MIKA: {
    OPEN: "（美香はこちらを見て、話す準備をしている。）",
    NEUTRAL: "（美香は台本を持ったまま、少し考えている。）",
    GUARDED: "（美香は少し距離を置いた様子で、次の言葉を待っている。）",
    WITHDRAWN: "（美香はそれ以上何も言わず、視線をそらした。）",
  },
  RYO: {
    OPEN: "（亮は客席からこちらに向き直る。）",
    NEUTRAL: "（亮は台本に目を落としたまま、少し間を置いた。）",
    GUARDED: "（亮は腕を組んで、短く待っている。）",
    WITHDRAWN: "（亮は「今は無理だ」とだけ言って、背を向けた。）",
  },
};

function isNonEmptyBoundedString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MAX_LINE_LENGTH;
}

function containsForbiddenLabel(text: string): boolean {
  return FORBIDDEN_LABEL_TOKENS.some((token) => text.includes(token));
}

/**
 * V31 §3. Field-by-field shape validation, mirroring
 * `isValidRawTurnClassification`'s discipline: a response with a wrong `npc`,
 * a missing/empty/oversized `text`, or a literal ontology-label leak is
 * rejected here, never trusted onward just because it parsed as an object.
 */
export function isValidRawNpcLine(value: unknown, expectedNpc: NpcId): value is RawNpcLine {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;

  if (v.npc !== expectedNpc) return false;
  if (!isNonEmptyBoundedString(v.text)) return false;
  if (containsForbiddenLabel(v.text)) return false;

  return true;
}

export type NpcGenerationResult =
  | { status: "generated"; npc: NpcId; text: string; fallback: false }
  | { status: "fallback"; npc: NpcId; text: string; fallback: true; reason: string };

/**
 * The one orchestration entry point. Calls the adapter, validates the
 * shape, and never lets an adapter failure or malformed response escape as
 * anything other than the deterministic per-`(npc, relationshipState)`
 * fallback line. Never throws. Performs no state mutation: takes an
 * `NpcVisibleStateProjection` (read-only input), returns only
 * `{ npc, text, fallback }`.
 */
export async function generateNpcLine(
  adapter: NpcGenerationAdapter,
  projection: NpcVisibleStateProjection,
): Promise<NpcGenerationResult> {
  const fallbackText = FALLBACK_LINES[projection.npc][projection.relationshipState];

  let callResult: AdapterCallResult;
  try {
    callResult = await adapter.generate(projection);
  } catch (err) {
    return {
      status: "fallback",
      npc: projection.npc,
      text: fallbackText,
      fallback: true,
      reason: err instanceof Error ? `adapter_threw:${err.message}` : "adapter_threw",
    };
  }

  if (callResult.status === "unavailable") {
    return { status: "fallback", npc: projection.npc, text: fallbackText, fallback: true, reason: callResult.reason };
  }

  const raw: unknown = callResult.raw;
  if (!isValidRawNpcLine(raw, projection.npc)) {
    return { status: "fallback", npc: projection.npc, text: fallbackText, fallback: true, reason: "malformed_response" };
  }

  return { status: "generated", npc: raw.npc, text: raw.text, fallback: false };
}

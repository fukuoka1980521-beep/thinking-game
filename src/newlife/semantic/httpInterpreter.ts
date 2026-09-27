/**
 * Phase 30: the one real `SemanticInterpreter` implementation, calling
 * `functions/newlife-dialogue/` over HTTP. Structurally mirrors
 * `src/lib/aiDialogueClient.ts`'s `performDialogueFetch` (client-side
 * timeout with headroom past the function's own timeout, `AbortController`,
 * never throws — every failure mode resolves to `{ status: "unavailable" }`
 * so `coordinator.ts` can treat "no live provider" and "provider errored"
 * identically and always fall back to the deterministic router).
 *
 * Never trusts the response as a `SemanticInterpretation` just because the
 * HTTP call succeeded and the body parsed as JSON — `isValidInterpretation`
 * re-validates every field's shape (not just presence) before this module
 * hands it to the caller, since a malformed or partially-wrong response is
 * exactly the case instruction 16 ("malformed response => fallback") and
 * the truth gate (`truthGate.ts`) both exist to catch, at two independent
 * layers.
 */
import type {
  FactCategory,
  FactsSnapshot,
  SemanticInterpretation,
  SemanticInterpretationResult,
  SemanticInterpreter,
} from "./contract";
import type { ConversationalAct } from "../npcVoice";

// The server can retry once on an empty Gemini response. The earlier CASE1
// real Vertex-AI deployment measured that this needs client-side headroom
// beyond one model call, so NEW LIFE uses the same 25s budget rather than
// timing out before the server's transparent retry can finish.
const REQUEST_TIMEOUT_MS = 25_000;

const MAX_UTTERANCE_LENGTH = 200;

const FACT_CATEGORIES: readonly FactCategory[] = ["menu", "reservation_count", "seats", "workshop", "yesterday", "profit"];
const CONVERSATIONAL_ACTS: readonly ConversationalAct[] = [
  "tone_feedback",
  "repair_request",
  "compliment",
  "criticism",
  "agreement",
  "disagreement",
  "greeting",
  "leave_taking",
];
const SEMANTIC_ACTS = [...CONVERSATIONAL_ACTS, "factual_question", "character_question", "plain_observation"] as const;
const INTENT_CATEGORIES = [...FACT_CATEGORIES, "character_preference", "unsupported"] as const;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isFactCategoryArray(value: unknown): value is FactCategory[] {
  return Array.isArray(value) && value.every((v) => (FACT_CATEGORIES as readonly string[]).includes(v as string));
}

/**
 * Shape-validates an arbitrary parsed JSON value against
 * `SemanticInterpretation` field-by-field (not just `typeof value ===
 * "object"`) — a provider response with an extra hallucinated field, a
 * wrong enum value, or a missing array is rejected here rather than reaching
 * the truth gate with an already-malformed shape.
 */
export function isValidInterpretation(value: unknown): value is SemanticInterpretation {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;

  if (typeof v.conversationalAct !== "string" || !(SEMANTIC_ACTS as readonly string[]).includes(v.conversationalAct)) {
    return false;
  }
  if (!Array.isArray(v.semanticIntents)) return false;
  for (const intent of v.semanticIntents) {
    if (typeof intent !== "object" || intent === null) return false;
    const i = intent as Record<string, unknown>;
    if (typeof i.category !== "string" || !(INTENT_CATEGORIES as readonly string[]).includes(i.category)) return false;
    if (typeof i.utteranceSpan !== "string") return false;
  }
  if (!isStringArray(v.entities)) return false;
  if (typeof v.answerableFromCanon !== "boolean") return false;
  if (!isFactCategoryArray(v.requiredFacts)) return false;
  if (!isFactCategoryArray(v.unknowns)) return false;
  if (typeof v.proposedResponse !== "string" || v.proposedResponse.trim().length === 0) return false;

  return true;
}

export async function postDialogueJson(endpointUrl: string, body: unknown, timeoutMs = REQUEST_TIMEOUT_MS): Promise<{ ok: boolean; status: number; data?: unknown }> {
  if (!endpointUrl) return { ok: false, status: 0 };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) return { ok: false, status: response.status };
    return { ok: true, status: response.status, data: await response.json() };
  } catch {
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(timeout);
  }
}

export class HttpSemanticInterpreter implements SemanticInterpreter {
  constructor(private readonly endpointUrl: string) {}

  async interpret(utterance: string, snapshot: FactsSnapshot, feedback?: string[]): Promise<SemanticInterpretationResult> {
    if (!this.endpointUrl) {
      return { status: "unavailable", reason: "no_endpoint_configured" };
    }
    const trimmed = utterance.trim();
    if (!trimmed || trimmed.length > MAX_UTTERANCE_LENGTH) {
      return { status: "unavailable", reason: "utterance_length" };
    }

    const posted = await postDialogueJson(this.endpointUrl, {
      utterance: trimmed,
      snapshot,
      ...(feedback && feedback.length > 0 ? { feedback: feedback.slice(0, 4) } : {}),
    });
    if (!posted.ok) {
      return { status: "unavailable", reason: posted.status ? "http_" + posted.status : "network_error" };
    }
    if (!isValidInterpretation(posted.data)) {
      return { status: "unavailable", reason: "malformed_response" };
    }
    return { status: "ok", interpretation: posted.data };
  }
}

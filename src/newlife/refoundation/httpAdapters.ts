/**
 * NEW LIFE refoundation — live HTTP adapters for
 * `functions/newlife-refoundation-ai/`. Four adapters, one per backend
 * operation: `HttpSemanticInterpreterAdapter`/`HttpNpcGenerationAdapter`
 * (compatibility/testing, V37 §7) and `HttpConversationAdapter`/
 * `HttpThoughtOrganizerAdapter` (the V37 primary free-conversation path and
 * its separate thought-organization layer).
 *
 * Structurally mirrors `src/newlife/semantic/httpInterpreter.ts`'s
 * `HttpSemanticInterpreter` (client-side timeout with headroom past the
 * function's own timeout, `AbortController`, never throws — every failure
 * mode resolves to `{ status: "unavailable" }` so `interpretTurn` /
 * `generateNpcLine` treat "no live provider" and "provider errored"
 * identically and always fall back to the deterministic path).
 *
 * Neither adapter here trusts a successful HTTP response as a valid shape
 * just because it parsed as JSON — `interpretTurn`/`generateNpcLine`
 * (in `semanticInterpreter.ts`/`npcGeneration.ts`) re-validate the returned
 * `raw` value field-by-field (`isValidRawTurnClassification`/
 * `isValidRawNpcLine`) before trusting it. This module's own job ends at
 * "did the network call succeed and parse as JSON" — it never inspects or
 * trusts the shape of that JSON itself, so validation logic exists in
 * exactly one place, not duplicated here.
 *
 * No silent success: an unconfigured endpoint, a non-OK HTTP status, a
 * timeout, a network error, or a body that isn't valid JSON all resolve to
 * `{ status: "unavailable", reason: ... }` — never `{ status: "ok" }` with
 * an empty or guessed payload.
 */
import type {
  AdapterCallResult as SemanticAdapterCallResult,
  SemanticInterpreterAdapter,
  TurnInterpretationRequest,
} from "./semanticInterpreter";
import type {
  AdapterCallResult as NpcAdapterCallResult,
  NpcGenerationAdapter,
  NpcVisibleStateProjection,
} from "./npcGeneration";
import type {
  AdapterCallResult as ConverseAdapterCallResult,
  CharacterConversationRequest,
  ConversationAdapter,
} from "./converse";
import type {
  AdapterCallResult as ThoughtOrganizerAdapterCallResult,
  ThoughtOrganizerAdapter,
  ThoughtOrganizerRequest,
} from "./thoughtOrganizer";

// The server can retry once on an empty Gemini response
// (`functions/newlife-refoundation-ai/index.js`). Same 25s client-side
// budget `httpInterpreter.ts` uses for the same reason.
const REQUEST_TIMEOUT_MS = 25_000;

async function postJson(
  endpointUrl: string,
  body: unknown,
): Promise<{ status: "ok"; data: unknown } | { status: "unavailable"; reason: string }> {
  if (!endpointUrl) {
    return { status: "unavailable", reason: "no_endpoint_configured" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { status: "unavailable", reason: `http_${response.status}` };
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      return { status: "unavailable", reason: "malformed_response" };
    }
    return { status: "ok", data };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { status: "unavailable", reason: "timeout" };
    }
    return { status: "unavailable", reason: "network_error" };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Live `SemanticInterpreterAdapter`. Sends only `{ operation: "interpret_turn",
 * utterance, caseContext }` — the same minimal shape
 * `TurnInterpretationRequest` already carries (no `NpcRelationshipRecord`,
 * no `CaseEndingState`, nothing beyond one turn's opaque context). Returns
 * an *untrusted* `raw` payload; `interpretTurn`'s own validator is what
 * promotes it to a typed `TurnClassification`, never this class.
 */
export class HttpSemanticInterpreterAdapter implements SemanticInterpreterAdapter {
  constructor(private readonly endpointUrl: string) {}

  async classify(request: TurnInterpretationRequest): Promise<SemanticAdapterCallResult> {
    const result = await postJson(this.endpointUrl, {
      operation: "interpret_turn",
      utterance: request.utterance,
      caseContext: request.caseContext,
    });
    if (result.status === "unavailable") return result;
    return { status: "ok", raw: result.data };
  }
}

/**
 * Live `NpcGenerationAdapter`. Sends only `{ operation: "generate_npc_line",
 * projection }` — the already-minimal `NpcVisibleStateProjection` (never
 * the full hidden world, never another NPC's record). Returns an
 * *untrusted* `raw` payload; `generateNpcLine`'s own validator
 * (`isValidRawNpcLine`) is what promotes it to a typed `NpcLine`, including
 * the ontology-label-leak check, never this class.
 */
export class HttpNpcGenerationAdapter implements NpcGenerationAdapter {
  constructor(private readonly endpointUrl: string) {}

  async generate(projection: NpcVisibleStateProjection): Promise<NpcAdapterCallResult> {
    const result = await postJson(this.endpointUrl, {
      operation: "generate_npc_line",
      projection,
    });
    if (result.status === "unavailable") return result;
    return { status: "ok", raw: result.data };
  }
}

/**
 * Live `ConversationAdapter` (V37 §1/§4, the primary free-conversation
 * path). Sends only the already-minimal `CharacterConversationRequest`
 * fields — `caseId`/`targetNpc`/`rawPlayerUtterance`/`recentDialogue`/
 * `dynamicState` — never a scene-fact or character-dossier field (V37 §1's
 * explicit prohibition: the server owns canon, not the browser). Returns an
 * *untrusted* `raw` payload; `converseTurn`'s own validator
 * (`isValidRawConverseResult`) is what promotes it to a typed result, never
 * this class.
 */
export class HttpConversationAdapter implements ConversationAdapter {
  constructor(private readonly endpointUrl: string) {}

  async converse(request: CharacterConversationRequest): Promise<ConverseAdapterCallResult> {
    const result = await postJson(this.endpointUrl, {
      operation: "converse_turn",
      caseId: request.caseId,
      targetNpc: request.targetNpc,
      rawPlayerUtterance: request.rawPlayerUtterance,
      recentDialogue: request.recentDialogue,
      dynamicState: request.dynamicState,
    });
    if (result.status === "unavailable") return result;
    return { status: "ok", raw: result.data };
  }
}

/**
 * Live `ThoughtOrganizerAdapter` (V37 §5, a separate layer from NPC
 * dialogue). Sends only `{ validatedWorldFacts, recentDialogue,
 * currentProblem }` — never any NPC-identifying field, since this
 * operation must never speak as a character.
 */
export class HttpThoughtOrganizerAdapter implements ThoughtOrganizerAdapter {
  constructor(private readonly endpointUrl: string) {}

  async organize(request: ThoughtOrganizerRequest): Promise<ThoughtOrganizerAdapterCallResult> {
    const result = await postJson(this.endpointUrl, {
      operation: "organize_thought",
      validatedWorldFacts: request.validatedWorldFacts,
      recentDialogue: request.recentDialogue,
      currentProblem: request.currentProblem,
    });
    if (result.status === "unavailable") return result;
    return { status: "ok", raw: result.data };
  }
}

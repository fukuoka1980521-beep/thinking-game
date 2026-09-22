/**
 * The only `SemanticInterpreter` implementation that exists this Run.
 * Always reports `unavailable` — no network call, no secret, no provider
 * dependency. This makes "no live provider integration yet" (Phase 29
 * instruction 12) an enforced type rather than only a sentence in a report:
 * any future caller that reaches for a live semantic layer must handle the
 * `unavailable` branch, which is exactly the branch that falls back to the
 * existing deterministic router in `npcVoice.ts`.
 */
import type { FactsSnapshot, SemanticInterpretationResult, SemanticInterpreter } from "./contract";

export class NullSemanticInterpreter implements SemanticInterpreter {
  async interpret(_utterance: string, _snapshot: FactsSnapshot): Promise<SemanticInterpretationResult> {
    return { status: "unavailable", reason: "no_provider_configured" };
  }
}

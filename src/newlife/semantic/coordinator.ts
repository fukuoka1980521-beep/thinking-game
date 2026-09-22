/**
 * Phase 30: the hybrid coordinator — the single place that decides whether
 * a NEW LIFE free-talk turn is answered by the existing deterministic
 * router (`npcVoice.ts`'s `answerFreeText`, unchanged since Phase 28B) or by
 * a live semantic interpreter, and applies the truth gate before ever
 * displaying a semantic result.
 *
 * Fallback discipline (Phase 30 instruction 11 / Phase 29 design §3's
 * "fallback discipline" note): the deterministic router runs *first*,
 * unconditionally, for every call — it is both the fast path for anything
 * it already answers confidently (a recognized fact domain or
 * conversational act) and the mandatory fallback for every failure mode
 * below. The semantic layer is only ever consulted when
 * `npcVoice.ts`'s `isAmbiguousFreeText` says the deterministic router would
 * otherwise fall through to a generic clarification line — i.e. exactly
 * the "ambiguous/open/compound/character question" class instruction 11
 * names, never a case the deterministic router already has a confident
 * answer for. This keeps every existing Phase 27/28/28B test passing
 * unmodified: with the endpoint unconfigured (the shipped default,
 * `config.ts`) or consent not accepted, this function's output is *always*
 * byte-identical to calling `answerFreeText` directly.
 *
 * `NewLife30State` is read-only here, as everywhere else in `npcVoice.ts`/
 * `semantic/*` — this function has no write path back into it (Phase 30
 * instruction 11e / Phase 29 §11).
 */
import { answerFreeText, isAmbiguousFreeText } from "../npcVoice";
import type { NewLife30State, NpcId } from "../types";
import { projectFacts } from "./factsProjection";
import { runTruthGate } from "./truthGate";
import type { SemanticInterpreter } from "./contract";

export type FreeTextSource = "deterministic" | "semantic";

export interface FreeTextResult {
  text: string;
  source: FreeTextSource;
}

export interface ResolveFreeTextOptions {
  /** The live interpreter to try. Omitted (or endpoint-unconfigured) means "never attempt a network call." */
  interpreter: SemanticInterpreter | null;
  /** Sticky per-player choice — declined behaves identically to `interpreter: null` (Phase 30 instruction 12). */
  consentAccepted: boolean;
}

/**
 * Resolves one free-talk turn. Never throws: every failure mode inside the
 * semantic branch (interpreter unavailable, a thrown network error, a truth
 * gate rejection, an empty proposed response) resolves to the deterministic
 * answer, which was already computed up front — so a slow or failing
 * network call never produces a dead end, only a brief pending state in the
 * UI before the same fallback text it would have shown immediately anyway.
 */
export async function resolveFreeText(
  npc: NpcId,
  text: string,
  state: NewLife30State,
  options: ResolveFreeTextOptions,
): Promise<FreeTextResult> {
  const deterministic = answerFreeText(npc, text, state);

  if (!options.interpreter || !options.consentAccepted) {
    return { text: deterministic, source: "deterministic" };
  }
  if (!isAmbiguousFreeText(text)) {
    return { text: deterministic, source: "deterministic" };
  }

  const snapshot = projectFacts(npc, state);

  let result;
  try {
    result = await options.interpreter.interpret(text.trim(), snapshot);
  } catch {
    return { text: deterministic, source: "deterministic" };
  }

  if (result.status !== "ok") {
    return { text: deterministic, source: "deterministic" };
  }

  const verdict = runTruthGate(result.interpretation, snapshot);
  if (!verdict.passed) {
    return { text: deterministic, source: "deterministic" };
  }

  const proposed = result.interpretation.proposedResponse.trim();
  if (!proposed) {
    return { text: deterministic, source: "deterministic" };
  }

  return { text: proposed, source: "semantic" };
}

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
 * Phase 25.2 (fact ownership): when the caller supplies a `ledger`, this
 * function (a) syncs it with canonical state and records the player's own
 * free input into it BEFORE anything is generated (CHECK 5), (b) hands the
 * compact ledger to the interpreter, (c) refuses any proposal whose
 * who-said/did/permitted/owns attribution contradicts the ledger
 * (`attributionGate.ts`, via the truth gate) and REGENERATES once with the
 * violations as feedback, and (d) returns the updated ledger. With no ledger
 * the behavior is unchanged from Phase 30.
 *
 * `NewLife30State` is read-only here, as everywhere else in `npcVoice.ts`/
 * `semantic/*` — this function has no write path back into it (Phase 30
 * instruction 11e / Phase 29 §11).
 */
import { answerFreeText, isAmbiguousFreeText } from "../npcVoice";
import type { NewLife30State, NpcId } from "../types";
import { projectFacts } from "./factsProjection";
import { ATTRIBUTION_VIOLATION_CODES, runTruthGate } from "./truthGate";
import { ledgerReflectsUtterance, recordPlayerUtterance, syncLedgerWithState, type FactLedger } from "./factLedger";
import type { SemanticInterpreter } from "./contract";

export type FreeTextSource = "deterministic" | "semantic";

export interface FreeTextResult {
  text: string;
  source: FreeTextSource;
  /** Present only when the caller passed a ledger: the ledger after this turn (synced + player input recorded). */
  ledger?: FactLedger;
}

export interface ResolveFreeTextOptions {
  /** The live interpreter to try. Omitted (or endpoint-unconfigured) means "never attempt a network call." */
  interpreter: SemanticInterpreter | null;
  /** Sticky per-player choice — declined behaves identically to `interpreter: null` (Phase 30 instruction 12). */
  consentAccepted: boolean;
  /** Phase 25.2 compact fact-ownership ledger carried across turns by the caller. */
  ledger?: FactLedger;
}

/** One proposal + at most one regeneration after an attribution rejection (cost guardrail: never a retry loop). */
export const MAX_SEMANTIC_ATTEMPTS = 2;

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
  // CHECK 5: the player's own input updates the fact state first.
  const ledger = options.ledger ? recordPlayerUtterance(syncLedgerWithState(options.ledger, state), text) : undefined;
  const deterministicText = answerFreeText(npc, text, state, ledger);
  const finish = (result: FreeTextResult): FreeTextResult => (ledger ? { ...result, ledger } : result);
  const deterministic = finish({ text: deterministicText, source: "deterministic" });

  if (!options.interpreter || !options.consentAccepted) return deterministic;
  if (!isAmbiguousFreeText(text)) return deterministic;
  if (ledger && !ledgerReflectsUtterance(ledger, text)) return deterministic;

  const snapshot = projectFacts(npc, state, ledger);

  let feedback: string[] | undefined;
  for (let attempt = 1; attempt <= MAX_SEMANTIC_ATTEMPTS; attempt += 1) {
    let result;
    try {
      result = await options.interpreter.interpret(text.trim(), snapshot, feedback);
    } catch {
      return deterministic;
    }
    if (result.status !== "ok") return deterministic;

    const verdict = runTruthGate(result.interpretation, snapshot);
    if (verdict.passed) {
      const proposed = result.interpretation.proposedResponse.trim();
      return proposed ? finish({ text: proposed, source: "semantic" }) : deterministic;
    }

    const attribution = verdict.violations.filter((v) => ATTRIBUTION_VIOLATION_CODES.includes(v.code));
    if (attribution.length === 0) return deterministic; // non-ownership violation: fall back, no retry
    feedback = attribution.map((v) => v.detail);
  }
  return deterministic;
}

/**
 * Phase 29 hybrid conversation architecture — structured contract.
 *
 * DESIGN-FIRST, NOT WIRED IN. Nothing in `src/newlife/semantic/` is imported
 * by `npcVoice.ts`, `NewLife30App.tsx`, or `App.tsx` this Run. It exists so
 * the contract described in
 * docs/newlife/evaluation/PHASE_29_HYBRID_SEMANTIC_CONVERSATION_ARCHITECTURE_V1.md
 * is a real, type-checked artifact rather than only prose, without changing
 * any currently deployed behavior.
 *
 * SYSTEM OWNS TRUTH / AI OWNS EXPRESSION still holds: every type below only
 * ever carries facts *out* to a hypothetical semantic layer and carries
 * display text *back*. Nothing here has a field, method, or return path
 * that could write to `NewLife30State` — see `state.ts` for the one module
 * allowed to do that.
 */
import type { ConversationalAct } from "../npcVoice";
import type { NpcId } from "../types";

/** The six current factual domains from `NEWLIFE_PHASE26_SCENARIO_VALIDATION_V1.md`'s "直接質問の確認表", also enumerated in the Owner's PHASE_29 instructions. */
export type FactCategory = "menu" | "reservation_count" | "seats" | "workshop" | "yesterday" | "profit";

/**
 * The minimal, data-minimized ground truth a semantic layer would be given —
 * never the full `NewLife30State` (no `log`, no `playerReport`, no
 * `publicBlame`, etc.). Mirrors the data-minimization discipline already
 * used for the existing CASE1 dialogue call (`src/lib/aiDialogueClient.ts`'s
 * `AiDialogueRequest`, which sends only the fields needed for one turn).
 * Built by `factsProjection.ts`.
 */
export interface FactsSnapshot {
  npc: NpcId;
  day: number;
  /** Present only for categories currently resolvable from state; day-gated facts (e.g. profit before Day 20) are absent here and listed in `unknown` instead. */
  known: Partial<Record<FactCategory, string>>;
  /** Categories that exist as concepts but are not yet resolvable at this `day` — must stay unknown in any generated response, never guessed. */
  unknown: FactCategory[];
  /** Terms a generated response must never affirm, regardless of phrasing (e.g. Daisuke's rejected barber canon). Checked by `truthGate.ts`. */
  negativeConstraints: string[];
  /**
   * Compact ownership ledger for facts that are easy for a generative NPC to
   * misattribute. These are assertions, not chat history: the model may
   * paraphrase them but must never move the actor/speaker/permission owner.
   */
  ownershipFacts: OwnershipFact[];
}

export type OwnershipKind = "said" | "did" | "offered" | "permission" | "responsibility" | "unresolved";

export interface OwnershipFact {
  kind: OwnershipKind;
  /** Canonical owner/actor. "player" is intentionally explicit. */
  owner: NpcId | "player" | "world";
  statement: string;
  /** Optional other party when the fact is relational (permission, offer, responsibility). */
  counterparty?: NpcId | "player";
}

/** One clause of a (possibly multi-intent) player utterance. `utteranceSpan` is the substring this clause was extracted from, kept for auditability — never re-parsed or trusted as a boundary by the truth gate. */
export interface SemanticIntent {
  category: FactCategory | "character_preference" | "unsupported";
  utteranceSpan: string;
}

/**
 * The structured output a semantic interpreter would need to produce for
 * one player line. Separates conversational act, one-or-more semantic
 * intents (Owner transcript 2, "原価高いのですか、なにかこだわっているてん
 * ありますか", is exactly a two-`semanticIntents` case: one `"profit"`
 * FACT clause, one `"character_preference"` clause), and an explicit
 * answerability/unknowns declaration the truth gate can check the proposed
 * response against.
 */
export interface SemanticInterpretation {
  conversationalAct: ConversationalAct | "factual_question" | "character_question" | "plain_observation";
  semanticIntents: SemanticIntent[];
  entities: string[];
  answerableFromCanon: boolean;
  requiredFacts: FactCategory[];
  unknowns: FactCategory[];
  proposedResponse: string;
}

export type SemanticInterpretationResult =
  | { status: "ok"; interpretation: SemanticInterpretation }
  | { status: "unavailable"; reason: string };

/**
 * The adapter boundary a live provider integration would implement later.
 * `NullSemanticInterpreter` (`adapter.ts`) is the only implementation that
 * exists this Run.
 */
export interface SemanticInterpreter {
  interpret(utterance: string, snapshot: FactsSnapshot): Promise<SemanticInterpretationResult>;
}

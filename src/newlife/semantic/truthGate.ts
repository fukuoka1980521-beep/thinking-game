/**
 * Deterministic output validator ("truth gate", Phase 29 design §4-D; wired
 * in as of Phase 30 — see `coordinator.ts`). Pure function: takes a
 * hypothetical semantic interpretation and the `FactsSnapshot` it was
 * grounded in, and returns which of three checkable hallucination classes
 * it violates, if any.
 *
 * This deliberately checks only what's mechanically verifiable without a
 * second model call: (1) banned-term affirmation (e.g. Daisuke's rejected
 * barber canon), (2) a numeric claim in the response that traces to no
 * number in the facts *relevant to this interpretation* (see
 * category-scoping below), (3) an internal contradiction between
 * `answerableFromCanon`/`requiredFacts` and what `FactsSnapshot.unknown`
 * actually says is known. It cannot and does not attempt to verify
 * *semantic* correctness (e.g. that a character-preference answer is
 * in-voice) — that remains a human-playtest judgment, not an automatable
 * one, per this project's own "technical PASS is not product PASS" rule.
 *
 * **Category scoping (Phase 30 instruction 17):** the original Phase 29
 * version pooled every number across *all* of `snapshot.known` before
 * checking the response, so a number that was only ever valid for, say,
 * `menu` (12, 18) would silently "legitimize" a wrong numeric claim about
 * `seats` or `profit` in the same response. The pool is now restricted to
 * only the categories this specific interpretation actually claims to be
 * about (`requiredFacts` plus any `FactCategory` among `semanticIntents`) —
 * a response with no FACT clause at all (pure `character_preference`) now
 * has an empty pool, so it may not cite any number, matching the design
 * intent that character/preference answers should not smuggle in numeric
 * claims they were never grounded in.
 */
import type { FactCategory, FactsSnapshot, SemanticInterpretation } from "./contract";

export type TruthGateViolationCode = "banned_term" | "unsupported_numeric_claim" | "overclaimed_required_fact" | "ownership_misattribution";

export interface TruthGateViolation {
  code: TruthGateViolationCode;
  detail: string;
}

export interface TruthGateVerdict {
  passed: boolean;
  violations: TruthGateViolation[];
}

const NUMERIC_TOKEN = /\d[\d,]*/g;
const FACT_CATEGORIES: readonly FactCategory[] = ["menu", "reservation_count", "seats", "workshop", "yesterday", "profit"];

function isFactCategory(category: string): category is FactCategory {
  return (FACT_CATEGORIES as readonly string[]).includes(category);
}

function extractNumbers(text: string): Set<string> {
  return new Set((text.match(NUMERIC_TOKEN) ?? []).map((n) => n.replace(/,/g, "")));
}

/** The categories this interpretation actually claims to draw on — the only ones its numeric claims may be checked against. */
function relevantCategories(interpretation: SemanticInterpretation): Set<FactCategory> {
  const categories = new Set<FactCategory>(interpretation.requiredFacts);
  for (const intent of interpretation.semanticIntents) {
    if (isFactCategory(intent.category)) categories.add(intent.category);
  }
  return categories;
}

export function runTruthGate(interpretation: SemanticInterpretation, snapshot: FactsSnapshot): TruthGateVerdict {
  const violations: TruthGateViolation[] = [];
  const response = interpretation.proposedResponse;

  for (const term of snapshot.negativeConstraints) {
    if (new RegExp(term, "i").test(response)) {
      violations.push({ code: "banned_term", detail: term });
    }
  }

  const knownNumbers = new Set<string>();
  for (const category of relevantCategories(interpretation)) {
    const fact = snapshot.known[category];
    if (!fact) continue;
    for (const n of extractNumbers(fact)) knownNumbers.add(n);
  }
  for (const n of extractNumbers(response)) {
    if (!knownNumbers.has(n)) {
      violations.push({ code: "unsupported_numeric_claim", detail: n });
    }
  }

  // High-confidence lexical guard for the failure observed in the Owner human
  // test: the model moved the player's offer ("何か手伝えることがあれば") to
  // Miyoko and made her say "私が言った". We keep this deliberately narrow:
  // the prompt carries the general ownership ledger; the deterministic gate
  // blocks only direct first-person theft of another owner's recorded words.
  for (const fact of snapshot.ownershipFacts) {
    if (fact.owner === snapshot.npc || fact.owner === "world") continue;
    const anchors = fact.statement.match(/[一-龠ぁ-んァ-ヶA-Za-z]{4,}/g) ?? [];
    const echoesOtherOwner = anchors.some((a) => response.includes(a));
    if (echoesOtherOwner && /私が(?:言|頼|約束|申し出|許可|決め)/.test(response)) {
      violations.push({ code: "ownership_misattribution", detail: `${fact.owner}:${fact.statement}` });
    }
  }

  if (interpretation.answerableFromCanon) {
    for (const required of interpretation.requiredFacts) {
      if (snapshot.unknown.includes(required)) {
        violations.push({ code: "overclaimed_required_fact", detail: required });
      }
    }
  }

  return { passed: violations.length === 0, violations };
}

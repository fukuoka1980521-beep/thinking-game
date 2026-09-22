/**
 * Deterministic output validator ("truth gate", Phase 29 design §4-D). Pure
 * function: takes a hypothetical semantic interpretation and the
 * `FactsSnapshot` it was grounded in, and returns which of two checkable
 * hallucination classes it violates, if any. Not called from anywhere in
 * this Run — see `contract.ts` header for why.
 *
 * This deliberately checks only what's mechanically verifiable without a
 * second model call: (1) banned-term affirmation (e.g. Daisuke's rejected
 * barber canon), (2) a numeric claim in the response that traces to no
 * number in the facts it was given, (3) an internal contradiction between
 * `answerableFromCanon`/`requiredFacts` and what `FactsSnapshot.unknown`
 * actually says is known. It cannot and does not attempt to verify
 * *semantic* correctness (e.g. that a character-preference answer is
 * in-voice) — that remains a human-playtest judgment, not an automatable
 * one, per this project's own "technical PASS is not product PASS" rule.
 */
import type { FactsSnapshot, SemanticInterpretation } from "./contract";

export type TruthGateViolationCode = "banned_term" | "unsupported_numeric_claim" | "overclaimed_required_fact";

export interface TruthGateViolation {
  code: TruthGateViolationCode;
  detail: string;
}

export interface TruthGateVerdict {
  passed: boolean;
  violations: TruthGateViolation[];
}

const NUMERIC_TOKEN = /\d[\d,]*/g;

function extractNumbers(text: string): Set<string> {
  return new Set((text.match(NUMERIC_TOKEN) ?? []).map((n) => n.replace(/,/g, "")));
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
  for (const fact of Object.values(snapshot.known)) {
    if (!fact) continue;
    for (const n of extractNumbers(fact)) knownNumbers.add(n);
  }
  for (const n of extractNumbers(response)) {
    if (!knownNumbers.has(n)) {
      violations.push({ code: "unsupported_numeric_claim", detail: n });
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

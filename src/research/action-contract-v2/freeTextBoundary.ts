/**
 * PHASE 11.6R: free-text interface boundary -- NOT natural-language understanding.
 *
 * Implements only the conceptual pipeline:
 *   PLAYER TEXT -> INTERPRETED_INTENT_CANDIDATE (stubbed: a fixed lookup table, not NLP) ->
 *   AFFORDANCE/ELIGIBILITY CHECK -> CONFIRMABLE ACTION -> PLAYER CONFIRMATION ->
 *   AUTHORITATIVE_EVENT -> STATE ADMISSION.
 *
 * Confirmation is a PROTOTYPE SAFETY RULE applied ONLY to this free-text-derived path -- it is
 * never applied to explicit button dispatch (BUY/REST/HELP/LEAVE all resolve directly through
 * `engine.ts`'s `resolveAction`/`resolveFollowUp` with no confirmation step; Test S).
 *
 * `INTERPRETED_INTENT` is never itself an authoritative event (Test Q) -- `resolveFreeTextCandidate`
 * never mutates state; only `confirmFreeTextAction` (called after an explicit PLAYER confirmation)
 * returns a real, already-defined Action Contract for the caller to dispatch through the ordinary
 * engine path -- never a bespoke state-mutation path of its own.
 *
 * Known, unsolved, explicitly out of scope: a CONFIDENT-BUT-WRONG single-candidate misparse
 * (text parses cleanly to one legitimate action that isn't what PLAYER meant) is not addressed
 * here -- recorded as FUTURE_FREE_TEXT_INTERPRETATION_RISK, not solved by any confidence model or
 * semantic verification system (explicitly out of scope, PHASE 11.6R Section 17).
 */

import type { ActionContractV2, ContractV2State, FollowUpAffordance } from "./types";

/** Stub "intent parser" -- a fixed lookup, deliberately not NLP. Real free-text understanding is
 *  explicitly out of scope this phase (directive Section 12: "Do NOT implement natural-language
 *  understanding"). */
const TEXT_TO_INTENT: Record<string, string> = {
  "手が足りないなら少し手伝おうか？": "OFFER_HELP",
};

export interface FreeTextCandidate {
  text: string;
  interpretedIntentId: string;
  legitimate: boolean;
  matchedAffordance: FollowUpAffordance | null;
  /** Present only when `legitimate` -- what happens if PLAYER declines to confirm, or a natural,
   *  honest response if the candidate was never legitimate to begin with. */
  ifNotConfirmedOrIllegitimate: string[];
}

/** Step 1-3 of the pipeline. Read-only -- produces a CANDIDATE only, never dispatches an
 *  authoritative event (Test P). */
export function resolveFreeTextCandidate(state: ContractV2State, text: string): FreeTextCandidate {
  const interpretedIntentId = TEXT_TO_INTENT[text] ?? "UNRECOGNIZED";
  const currentAffordances = state.pending?.affordances ?? [];
  const matched = currentAffordances.find((a) => a.id === interpretedIntentId) ?? null;

  if (!matched) {
    // The parser may confidently identify WHAT player is asking about, but if it isn't currently
    // a legitimate affordance, the world must not fabricate a need to accommodate the request
    // (directive Section 14 -- "same text, different world" -- and Test O).
    return {
      text,
      interpretedIntentId,
      legitimate: false,
      matchedAffordance: null,
      ifNotConfirmedOrIllegitimate: ["「ありがとう、でも今日は大丈夫そうだ」と、迅が言った。"],
    };
  }

  return {
    text,
    interpretedIntentId,
    legitimate: true,
    matchedAffordance: matched,
    ifNotConfirmedOrIllegitimate: ["（申し出は取り消された）"],
  };
}

/** Step 4-5. Only called after an explicit PLAYER confirmation. Returns the real follow-up
 *  contract to dispatch through the ordinary `resolveFollowUp` engine path -- never a separate
 *  state-mutation path of its own (directive Section 13, "confirmable action" boundary). */
export function confirmFreeTextAction(candidate: FreeTextCandidate, followUpContracts: Record<string, ActionContractV2>): ActionContractV2 | null {
  if (!candidate.legitimate || !candidate.matchedAffordance) return null;
  return followUpContracts[candidate.matchedAffordance.id] ?? null;
}

// ---------------------------------------------------------------------------
// PHASE 11.8: PendingReply-aware free text -- composite utterances, per-candidate-effect
// confirmation, and the confident-wrong-parse boundary (paper-designed in
// `docs/research/evaluation/phase-11-7/FREE_TEXT_PENDING_BOUNDARY_V2.md`, now runtime-tested).
// Still a fixed stub lookup, NOT NLP (directive Section 14: "Do NOT implement NLP").
// ---------------------------------------------------------------------------

export type PendingIntentId = "DEFER_PENDING_REPLY" | "ASK_FESTIVAL" | "ANSWER_ACCEPT" | "REQUEST_WITHDRAWAL" | "UNRECOGNIZED";

/** Ordered candidate lists -- a composite utterance maps to MULTIPLE candidates, resolved
 *  sequentially, never collapsed into one guessed action (directive Section 14). The
 *  `ANSWER_ACCEPT` entry is a DELIBERATE stub misparse of an ambiguous utterance that did not
 *  clearly accept anything -- used only to exercise the confirmation boundary (Section 16), never
 *  a claim that this stub performs real intent recognition. */
const PENDING_TEXT_TO_INTENTS: Record<string, PendingIntentId[]> = {
  "まあその話は後でいいじゃん。それより昨日の祭りどうだった？": ["DEFER_PENDING_REPLY", "ASK_FESTIVAL"],
  "まあ、それでいいんじゃない": ["ANSWER_ACCEPT"], // deliberate wrong-parse fixture, see Section 16
  "もうその話いいじゃん": ["REQUEST_WITHDRAWAL"],
};

export interface PendingFreeTextCandidate {
  intentId: PendingIntentId;
  /** Whether this candidate is CURRENTLY eligible given `state` -- e.g. DEFER_PENDING_REPLY/
   *  ANSWER_ACCEPT require an OPEN PendingReply; ASK_FESTIVAL is always legitimate. */
  legitimate: boolean;
  /** Section 15: confirmation is required per-candidate, based on THAT candidate's own
   *  persistence -- never applied to the whole utterance. ASK_FESTIVAL creates no persistent
   *  state and needs none; every PendingReply-status-transitioning candidate does, and this is
   *  never relaxed regardless of how low-stakes the transition looks (Section 16's own worked
   *  argument for keeping OPEN->RESOLVED/WITHDRAWN confirmation-mandatory). */
  requiresConfirmation: boolean;
}

/** Steps 1-3 for PendingReply-aware text. Read-only, produces an ORDERED list of candidates --
 *  never dispatches anything (Test P/Q's "no state mutation on candidate" invariant, extended). */
export function resolvePendingFreeTextCandidates(state: ContractV2State, text: string): PendingFreeTextCandidate[] {
  const intents = PENDING_TEXT_TO_INTENTS[text] ?? (["UNRECOGNIZED"] as PendingIntentId[]);
  return intents.map((intentId) => classifyPendingIntentCandidate(state, intentId));
}

function classifyPendingIntentCandidate(state: ContractV2State, intentId: PendingIntentId): PendingFreeTextCandidate {
  switch (intentId) {
    case "ASK_FESTIVAL":
      return { intentId, legitimate: true, requiresConfirmation: false };
    case "DEFER_PENDING_REPLY":
      return { intentId, legitimate: state.pendingReply?.status === "OPEN", requiresConfirmation: true };
    case "ANSWER_ACCEPT":
      return { intentId, legitimate: state.pendingReply?.status === "OPEN", requiresConfirmation: true };
    case "REQUEST_WITHDRAWAL":
      // Legitimate to SAY regardless of pending status -- but per directive Section 4/17 this can
      // never itself withdraw anything; dispatching it only ever produces PLAYER_REQUESTS_WITHDRAWAL.
      return { intentId, legitimate: state.pendingReply !== null, requiresConfirmation: true };
    default:
      return { intentId: "UNRECOGNIZED", legitimate: false, requiresConfirmation: false };
  }
}

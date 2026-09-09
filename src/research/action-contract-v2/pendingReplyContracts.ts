/**
 * PHASE 11.8: concrete PendingReply scenario contracts/events for the isolated
 * `?newlifecontractv2=1` prototype. Extends the existing prototype only -- no new subsystem, no
 * Conversation Engine, no turnOwner (see `docs/research/evaluation/phase-11-7/
 * TURN_OWNER_FALSIFICATION_V2.md`, whose result this Run tests adversarially against real code).
 */

import { openPendingReply, resolveAction, resolvePendingReplyEvent, type PendingReplyEventSpec } from "./engine";
import type { ActionContractV2, ActionTrace, ContractV2State, PendingReplyTrace, Precondition } from "./types";
import type { LifeMaterial } from "../life-material-7day/types";
import type { PendingIntentId } from "./freeTextBoundary";

const ALWAYS: Precondition = { id: "always", check: () => true };

/** Section 12's canonical eligibility gate for the third-party-interruption case -- ordinary
 *  world-state eligibility, structurally identical to `JIN_HELPER_ABSENT` (PHASE 11.6R),
 *  explicitly NOT a `turnOwner = WORLD` value. */
export const YOHEI_AVAILABLE_FOR_CONVERSATION: Precondition = {
  id: "yohei_available_for_conversation",
  check: (s) => s.world.yoheiAvailableForConversation,
};

/** The SAME object every answer/defer event below shares as part of its eligibility -- an
 *  answer/defer is only ever legal while the PendingReply it targets is still OPEN. */
export const PENDING_REPLY_OPEN: Precondition = {
  id: "pending_reply_open",
  check: (s) => s.pendingReply?.status === "OPEN",
};

const PENDING_REPLY_EXISTS: Precondition = {
  id: "pending_reply_exists",
  check: (s) => s.pendingReply !== null,
};

// ---------------------------------------------------------------------------
// Opening events -- NPC-initiated, never a PLAYER-dispatched contract.
// ---------------------------------------------------------------------------

export function yoheiAsksForHelp(state: ContractV2State, idSuffix: string): ContractV2State {
  return openPendingReply(
    state,
    { id: `yohei_help_request_${idSuffix}`, sourceEventId: "YOHEI_ASKS_FOR_HELP", npcId: "yohei", status: "OPEN", expectedReplyClass: "ACCEPT_DECLINE_DEFER" },
    ["「今、少し手伝える？」と、洋平が言った。"],
  );
}

export function yoheiAsksToBringItemTomorrow(state: ContractV2State, idSuffix: string): ContractV2State {
  return openPendingReply(
    state,
    { id: `yohei_promise_request_${idSuffix}`, sourceEventId: "YOHEI_ASKS_FOR_PROMISE", npcId: "yohei", status: "OPEN", expectedReplyClass: "ACCEPT_DECLINE" },
    ["「明日、これ持ってきてくれる？」と、洋平が言った。"],
  );
}

// ---------------------------------------------------------------------------
// PendingReply-transitioning events (directive Section 3).
// ---------------------------------------------------------------------------

export const PLAYER_ACCEPTS_REQUEST: PendingReplyEventSpec = {
  event: "PLAYER_ACCEPTS_REQUEST",
  eligibility: [PENDING_REPLY_OPEN, YOHEI_AVAILABLE_FOR_CONVERSATION],
  narration: () => ["「うん、いいよ」と、答えた。"],
  nextStatus: () => "RESOLVED",
};

/** Promise-promotion variant of the same authoritative event (directive Section 18) -- the
 *  `material` field is the only difference; the status transition itself is identical. Kept as a
 *  separate exported constant, not a parameterized factory, since only one scenario needs it and
 *  a factory would be unused generality. */
export const PLAYER_ACCEPTS_PROMISE_REQUEST: PendingReplyEventSpec = {
  ...PLAYER_ACCEPTS_REQUEST,
  material: (s): LifeMaterial => ({
    id: "promised_bring_item",
    type: "PROMISE",
    concreteContent: "明日、洋平に頼まれた物を持ってくると約束した",
    origin: "PLAYER_ACTION:PLAYER_ACCEPTS_REQUEST",
    dayCreated: s.day,
    authority: "PLAYER_CHOSEN_FACT",
    status: "ACTIVE",
    knownBy: ["player", "yohei"],
    possibleConsumers: [],
  }),
};

export const PLAYER_DECLINES_REQUEST: PendingReplyEventSpec = {
  event: "PLAYER_DECLINES_REQUEST",
  eligibility: [PENDING_REPLY_OPEN, YOHEI_AVAILABLE_FOR_CONVERSATION],
  narration: () => ["「ごめん、今日はちょっと」と、答えた。"],
  nextStatus: () => "RESOLVED",
};

export const PLAYER_DEFERS_REPLY: PendingReplyEventSpec = {
  event: "PLAYER_DEFERS_REPLY",
  eligibility: [PENDING_REPLY_OPEN, YOHEI_AVAILABLE_FOR_CONVERSATION],
  narration: () => ["「その話はまた後で」と、答えた。"],
  nextStatus: () => "DEFERRED",
};

export const YOHEI_WITHDRAWS_REQUEST: PendingReplyEventSpec = {
  event: "YOHEI_WITHDRAWS_REQUEST",
  eligibility: [PENDING_REPLY_EXISTS], // NPC-side event -- not gated by PLAYER conversation availability
  narration: () => ["「もう大丈夫、自分でやっておいたよ」と、洋平が言った。"],
  nextStatus: () => "WITHDRAWN",
};

export const YOHEI_SELF_RESOLVES: PendingReplyEventSpec = {
  event: "YOHEI_SELF_RESOLVES",
  eligibility: [PENDING_REPLY_EXISTS],
  narration: () => ["洋平は、結局自分でその用事を済ませたようだった。"],
  nextStatus: () => "RESOLVED",
};

/** Section 10's mandatory rule: leaving, by itself, never resolves or withdraws anything --
 *  `nextStatus` is an explicit identity mapping, not an omission. */
export const PLAYER_LEAVES_EVENT: PendingReplyEventSpec = {
  event: "PLAYER_LEAVES",
  eligibility: [ALWAYS],
  narration: () => ["その場を後にした。"],
  nextStatus: (current) => current,
};

/** Section 17's mandatory rule: PLAYER can express a wish for the request to go away, but this
 *  event NEVER itself withdraws it -- `nextStatus` is again an explicit identity mapping. Only
 *  `YOHEI_WITHDRAWS_REQUEST` (an NPC-authored event) can produce WITHDRAWN. */
export const PLAYER_REQUESTS_WITHDRAWAL: PendingReplyEventSpec = {
  event: "PLAYER_REQUESTS_WITHDRAWAL",
  eligibility: [PENDING_REPLY_EXISTS],
  narration: () => ["「その話、もういいよ」と、言ってみた。"],
  nextStatus: (current) => current,
};

// ---------------------------------------------------------------------------
// Ordinary actions that must NOT touch pendingReply -- proven by omission: none of these ever
// call `resolvePendingReplyEvent`, so `state.pendingReply` survives their dispatch unchanged via
// `resolveAction`'s own state spread.
// ---------------------------------------------------------------------------

export const SMALL_TALK: ActionContractV2 = {
  actionId: "SMALL_TALK",
  playerIntent: "SMALL_TALK",
  eligibility: [ALWAYS],
  playerVisiblePromise: "世間話をする",
  failurePostcondition: null,
  authoritativeEvent: "SMALL_TALK_EXCHANGE",
  successPostcondition: { id: "small_talk_occurs", check: () => true },
  partialSuccessPostcondition: null,
  visibleFeedback: () => ({ onSuccess: ["「今日は暑いね」「ほんとだね」と、洋平が答えた。"], onPartialSuccess: null, onFailure: null }),
  stateDelta: () => [],
  actorExperienceWrite: () => [{ actorId: "player", mode: "PARTICIPATED", concreteContent: "洋平と世間話をした" }],
  conditionalFollowUpAffordance: () => "NONE",
};

export const GREETING: ActionContractV2 = {
  actionId: "GREETING",
  playerIntent: "GREET",
  eligibility: [ALWAYS],
  playerVisiblePromise: "挨拶する",
  failurePostcondition: null,
  authoritativeEvent: "GREETING_EXCHANGE",
  successPostcondition: { id: "greeting_occurs", check: () => true },
  partialSuccessPostcondition: null,
  visibleFeedback: () => ({ onSuccess: ["「よう」「よう」と、洋平が答えた。"], onPartialSuccess: null, onFailure: null }),
  stateDelta: () => [],
  actorExperienceWrite: () => [{ actorId: "player", mode: "PARTICIPATED", concreteContent: "洋平に挨拶した" }],
  conditionalFollowUpAffordance: () => "NONE",
};

/** Test E/Case D's behavioral proof point: narration differs by ONE extra line depending on
 *  whether the open PendingReply is still OPEN (Yohei re-presents it) or DEFERRED (he does not,
 *  directive Section 9's required observable difference) -- read directly from
 *  `state.pendingReply.status`, no separate flag invented for this. */
export const ASK_FESTIVAL: ActionContractV2 = {
  actionId: "ASK_FESTIVAL",
  playerIntent: "ASK_FESTIVAL",
  eligibility: [ALWAYS],
  playerVisiblePromise: "昨日の祭りについて聞く",
  failurePostcondition: null,
  authoritativeEvent: "ASK_FESTIVAL",
  successPostcondition: { id: "festival_question_answered", check: () => true },
  partialSuccessPostcondition: null,
  visibleFeedback: (s) => ({
    onSuccess:
      s.pendingReply?.status === "OPEN"
        ? ["「昨日の祭り、楽しかったよ」と答えた。", "「そういえば、さっきの話だけど……」と、洋平が言った。"]
        : ["「昨日の祭り、楽しかったよ」と答えた。"],
    onPartialSuccess: null,
    onFailure: null,
  }),
  stateDelta: () => [],
  actorExperienceWrite: () => [{ actorId: "player", mode: "PARTICIPATED", concreteContent: "洋平に昨日の祭りについて聞いた" }],
  conditionalFollowUpAffordance: () => "NONE",
};

/** Directive Section 19's trivial case -- a question no PendingReply is ever opened for. The
 *  entire exchange (Yohei's question AND PLAYER's answer) is one deterministic, canned narration
 *  on one ordinary dispatched action -- there is no gap to represent, so nothing is created for
 *  one (proving `CONTRACTIFICATION_OF_ALL_DIALOGUE` is avoided by simply never calling
 *  `openPendingReply` here). */
export const TRIVIAL_COFFEE_EXCHANGE: ActionContractV2 = {
  actionId: "TRIVIAL_COFFEE_EXCHANGE",
  playerIntent: "ORDINARY_SMALL_EXCHANGE",
  eligibility: [ALWAYS],
  playerVisiblePromise: "洋平と少し話す",
  failurePostcondition: null,
  authoritativeEvent: "TRIVIAL_EXCHANGE",
  successPostcondition: { id: "trivial_exchange_occurs", check: () => true },
  partialSuccessPostcondition: null,
  visibleFeedback: () => ({ onSuccess: ["「コーヒーどう？」と、洋平が聞いた。「うん、もらうよ」と、答えた。"], onPartialSuccess: null, onFailure: null }),
  stateDelta: () => [],
  actorExperienceWrite: () => [{ actorId: "player", mode: "PARTICIPATED", concreteContent: "洋平とコーヒーの話をした" }],
  conditionalFollowUpAffordance: () => "NONE",
};

/** Directive Section 13: Yohei must remain capable of ordinary shop work regardless of any
 *  OPEN/DEFERRED PendingReply -- reuses the exact `jinContinuesWorkNarration` pattern from
 *  `contracts.ts` (PHASE 11.6R), not a new mechanism. */
export function yoheiContinuesShopWorkNarration(s: ContractV2State): string[] {
  return s.pendingReply && s.pendingReply.status !== "RESOLVED" && s.pendingReply.status !== "WITHDRAWN"
    ? ["洋平は、返事を急かすことなく、棚の商品を並べ続けている。"]
    : ["洋平は、いつも通り棚の商品を並べている。"];
}

// ---------------------------------------------------------------------------
// Directive Section 12: third-party interruption as ordinary world-state eligibility, NOT
// turnOwner. Pure WORLD_EVENT transitions -- not PLAYER actions, so no ActionTrace/PendingReplyTrace
// is produced for them (there is no PLAYER intent to record).
// ---------------------------------------------------------------------------

export function customerArrives(state: ContractV2State): ContractV2State {
  return { ...state, world: { ...state.world, yoheiAvailableForConversation: false }, narration: ["客が店に入ってきて、洋平はそちらの対応を始めた。"] };
}

export function customerLeaves(state: ContractV2State): ContractV2State {
  return { ...state, world: { ...state.world, yoheiAvailableForConversation: true }, narration: ["客の対応が終わり、洋平の手がまた空いた。"] };
}

/** Dispatches a CONFIRMED free-text candidate through the ordinary engine paths -- never a
 *  bespoke free-text state-mutation path (directive Section 13/15's "confirmable action"
 *  boundary, extended to the composite/PendingReply case). Centralized here so tests, the trace
 *  generator, and the UI all route through the exact same mapping. */
export function dispatchConfirmedPendingIntent(state: ContractV2State, intentId: PendingIntentId): { state: ContractV2State; trace: ActionTrace | PendingReplyTrace } {
  switch (intentId) {
    case "ASK_FESTIVAL":
      return resolveAction(state, ASK_FESTIVAL);
    case "DEFER_PENDING_REPLY":
      return resolvePendingReplyEvent(state, PLAYER_DEFERS_REPLY);
    case "ANSWER_ACCEPT":
      return resolvePendingReplyEvent(state, PLAYER_ACCEPTS_REQUEST);
    case "REQUEST_WITHDRAWAL":
      return resolvePendingReplyEvent(state, PLAYER_REQUESTS_WITHDRAWAL);
    case "UNRECOGNIZED":
      throw new Error("dispatchConfirmedPendingIntent: UNRECOGNIZED is never confirmable");
  }
}

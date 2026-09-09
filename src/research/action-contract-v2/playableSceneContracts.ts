/**
 * PHASE 11.11: small playable Yohei scene -- post-festival, leftover stock. Extends the existing
 * PendingReply/Action Contract V2 architecture (PHASE 11.6R-11.10), introduces zero new runtime
 * mechanism. All request-meaning resolution goes through `yoheiSourceEvents.ts`'s single registry.
 */

import { openPendingReply, type PendingReplyEventSpec } from "./engine";
import type { ActionContractV2, ContractV2State, Precondition } from "./types";
import type { LifeMaterial } from "../life-material-7day/types";
import { resolveYoheiSourceEvent, authoringSufficiencyGate } from "./yoheiSourceEvents";
import { PLAYER_ACCEPTS_REQUEST, PLAYER_DECLINES_REQUEST } from "./pendingReplyContracts";

const ALWAYS: Precondition = { id: "always", check: () => true };

const SOURCE_EVENT_ID = "YOHEI_ASKS_HELP_MOVE_LEFTOVER_STOCK";

/** Directive Section 6: fails closed. Never opens a PendingReply, never touches the LLM, if the
 *  authoritative world doesn't actually know what the request is for. Thrown, not silently
 *  swallowed -- a caller that ignores this result is a bug, not a legitimate runtime path. */
export function openYoheiLeftoverStockRequest(state: ContractV2State, idSuffix: string): ContractV2State {
  const gate = authoringSufficiencyGate(SOURCE_EVENT_ID);
  if (!gate.sufficient) {
    throw new Error(gate.reason);
  }
  return openPendingReply(
    state,
    { id: `yohei_leftover_stock_request_${idSuffix}`, sourceEventId: SOURCE_EVENT_ID, npcId: "yohei", status: "OPEN", expectedReplyClass: "ACCEPT_DECLINE" },
    ["「ちょっと手伝ってくれる？」と、洋平が言った。"],
  );
}

/** The single Precondition both ACCEPT_HELP's own material creation and ASK_ABOUT_LEFTOVER_STOCK's
 *  eligibility reference -- Single Precondition Authority, unchanged principle since PHASE 11.6R. */
export const LEFTOVER_STOCK_MOVED: Precondition = {
  id: "leftover_stock_moved_active",
  check: (s) => s.materials.some((m) => m.id === "leftover_stock_moved" && m.status === "ACTIVE"),
};

/** ACCEPT_HELP: resolves the PendingReply AND, in the same dispatch, admits the concrete
 *  consequence material -- reuses PHASE 11.8's promise-promotion `material` field, not a new
 *  mechanism. The postcondition (box moved) becomes actually true via State Admission, not merely
 *  narrated (directive Section 9). */
export const PLAYER_ACCEPTS_HELP_MOVE_STOCK: PendingReplyEventSpec = {
  ...PLAYER_ACCEPTS_REQUEST,
  narration: (s) => {
    const event = resolveYoheiSourceEvent(s.pendingReply?.sourceEventId ?? "");
    return event ? [`「分かった、運ぶよ」と答えた。洋平と二人で、${event.requestSubject}のを手伝った。`] : ["「分かった」と答えた。"];
  },
  material: (s): LifeMaterial => ({
    id: "leftover_stock_moved",
    type: "SHARED_EVENT",
    concreteContent: "洋平と一緒に、祭りの残りの手ぬぐいの箱を値引き用の陳列スペースまで運んだ",
    origin: "PLAYER_ACTION:ACCEPT_HELP_MOVE_STOCK",
    dayCreated: s.day,
    authority: "PLAYER_CHOSEN_FACT",
    status: "ACTIVE",
    knownBy: ["player", "yohei"],
    possibleConsumers: ["ASK_ABOUT_LEFTOVER_STOCK"],
  }),
};

/** DECLINE_HELP: reuses the existing PLAYER_DECLINES_REQUEST spec verbatim -- no guilt language,
 *  no scene-specific override needed (directive Section 8's rule already covers this generically). */
export const PLAYER_DECLINES_HELP_MOVE_STOCK: PendingReplyEventSpec = PLAYER_DECLINES_REQUEST;

// ---------------------------------------------------------------------------
// Ordinary conversational actions -- never touch pendingReply (proven by omission, same pattern
// as every prior phase). `visibleFeedback` here is deliberately minimal/authoritative-only --
// the actual Yohei dialogue line is rendered separately by a LanguageAdapter (languageAdapter.ts)
// from a packet built by `buildYoheiPacket` below, keeping "what happened" (this contract) and
// "how Yohei says it" (the adapter) structurally separate, per PHASE 11.9's own state-authority
// boundary finding.
// ---------------------------------------------------------------------------

export const ASK_WHAT_HELP_NEEDED: ActionContractV2 = {
  actionId: "ASK_WHAT_HELP_NEEDED",
  playerIntent: "ASK_WHAT",
  eligibility: [ALWAYS],
  playerVisiblePromise: "何を手伝えばいいか尋ねる",
  failurePostcondition: null,
  authoritativeEvent: "ASK_WHAT_HELP_NEEDED",
  successPostcondition: { id: "ask_what_occurs", check: () => true },
  partialSuccessPostcondition: null,
  visibleFeedback: () => ({ onSuccess: [], onPartialSuccess: null, onFailure: null }),
  stateDelta: () => [],
  actorExperienceWrite: () => [{ actorId: "player", mode: "PARTICIPATED", concreteContent: "洋平に、何を手伝えばいいか尋ねた" }],
  conditionalFollowUpAffordance: () => "NONE",
};

export const ASK_FESTIVAL_SCENE: ActionContractV2 = {
  actionId: "ASK_FESTIVAL_SCENE",
  playerIntent: "ASK_FESTIVAL",
  eligibility: [ALWAYS],
  playerVisiblePromise: "祭りについて聞く",
  failurePostcondition: null,
  authoritativeEvent: "ASK_FESTIVAL",
  successPostcondition: { id: "ask_festival_occurs", check: () => true },
  partialSuccessPostcondition: null,
  visibleFeedback: () => ({ onSuccess: [], onPartialSuccess: null, onFailure: null }),
  stateDelta: () => [],
  actorExperienceWrite: () => [{ actorId: "player", mode: "PARTICIPATED", concreteContent: "洋平に祭りについて聞いた" }],
  conditionalFollowUpAffordance: () => "NONE",
};

export const ASK_SALES_SCENE: ActionContractV2 = {
  actionId: "ASK_SALES_SCENE",
  playerIntent: "ASK_SALES",
  eligibility: [ALWAYS],
  playerVisiblePromise: "売れ行きについて聞く",
  failurePostcondition: null,
  authoritativeEvent: "ASK_FESTIVAL_SALES_RESULT",
  successPostcondition: { id: "ask_sales_occurs", check: () => true },
  partialSuccessPostcondition: null,
  visibleFeedback: () => ({ onSuccess: [], onPartialSuccess: null, onFailure: null }),
  stateDelta: () => [],
  actorExperienceWrite: () => [{ actorId: "player", mode: "PARTICIPATED", concreteContent: "洋平に売れ行きについて聞いた" }],
  conditionalFollowUpAffordance: () => "NONE",
};

export const ASK_WEATHER_SCENE: ActionContractV2 = {
  actionId: "ASK_WEATHER_SCENE",
  playerIntent: "ASK_WEATHER",
  eligibility: [ALWAYS],
  playerVisiblePromise: "天気について聞く",
  failurePostcondition: null,
  authoritativeEvent: "ASK_FESTIVAL_SPECIFIC_FACT",
  successPostcondition: { id: "ask_weather_occurs", check: () => true },
  partialSuccessPostcondition: null,
  visibleFeedback: () => ({ onSuccess: [], onPartialSuccess: null, onFailure: null }),
  stateDelta: () => [],
  actorExperienceWrite: () => [{ actorId: "player", mode: "PARTICIPATED", concreteContent: "洋平に祭り当日の天気について聞いた" }],
  conditionalFollowUpAffordance: () => "NONE",
};

/** The new possibility (directive Section 13) -- eligible ONLY once LEFTOVER_STOCK_MOVED is
 *  active, i.e. only after ACCEPT_HELP actually happened. */
export const ASK_ABOUT_LEFTOVER_STOCK: ActionContractV2 = {
  actionId: "ASK_ABOUT_LEFTOVER_STOCK",
  playerIntent: "ASK_ABOUT_LEFTOVER_STOCK",
  eligibility: [LEFTOVER_STOCK_MOVED],
  playerVisiblePromise: "運んだ箱について尋ねる",
  failurePostcondition: null,
  authoritativeEvent: "ASK_ABOUT_LEFTOVER_STOCK",
  successPostcondition: { id: "ask_about_leftover_stock_occurs", check: () => true },
  partialSuccessPostcondition: null,
  visibleFeedback: () => ({ onSuccess: [], onPartialSuccess: null, onFailure: null }),
  stateDelta: () => [],
  actorExperienceWrite: () => [{ actorId: "player", mode: "PARTICIPATED", concreteContent: "運んだ箱が祭りの残りかどうか、洋平に尋ねた" }],
  conditionalFollowUpAffordance: () => "NONE",
};

/** NPC independence (directive Section 14) -- deterministic/authored, same pattern as the existing
 *  `yoheiContinuesShopWorkNarration`. Shown regardless of PLAYER's choice while the request is
 *  still open, and after DECLINE. */
export function yoheiContinuesLeftoverStockWorkNarration(s: ContractV2State): string[] {
  return LEFTOVER_STOCK_MOVED.check(s)
    ? ["残りの手ぬぐいは、すでに値引き用の棚に並んでいる。"]
    : ["洋平は、一人で値引き用の棚の準備を続けている。"];
}

// ---------------------------------------------------------------------------
// Packet builder -- reused by both the real-Vertex capture script and (if ever swapped to a live
// adapter) the runtime. Pure function of state + the PLAYER action being taken; never mutates
// anything.
// ---------------------------------------------------------------------------

export interface YoheiScenePacket {
  worldFacts: string[];
  firsthand: string[];
  unknown: string[];
  currentLocalFacts: string[];
  pendingRequestContent: string;
  playerUtterance: string;
  authoritativeAction: string;
}

const WORLD_FACTS = ["洋平はさきほどプレイヤーに、少し手伝ってもらえないか尋ねた", "昨日、近所で祭りがあった"];
const FIRSTHAND_SALES_FACTS = [
  "洋平は、地域の会合で祭りの出店（手ぬぐいの販売）を引き受け、その後、通常より多い量の祭り用の特別な仕入れを発注した",
  "仕入れは祭りの2日前に、ぎりぎり間に合って届いた",
  "祭り当日、洋平は自分の出店で商品を売り、およそ8割ほどが売れた",
  "残りの2割ほどの在庫は値引きして売ることにした",
];

export function buildYoheiPacket(state: ContractV2State, playerUtterance: string, authoritativeAction: string): YoheiScenePacket {
  const requestSubject = resolveYoheiSourceEvent(state.pendingReply?.sourceEventId ?? "")?.requestSubject;
  const alreadyMoved = LEFTOVER_STOCK_MOVED.check(state);
  const firsthand = alreadyMoved
    ? [...FIRSTHAND_SALES_FACTS, "プレイヤーと一緒に、祭りの残りの手ぬぐいの箱を、店先から値引き用の陳列スペースまで運んだところだ"]
    : FIRSTHAND_SALES_FACTS;
  return {
    worldFacts: WORLD_FACTS,
    firsthand,
    unknown: ["祭りの来場者数", "祭り当日の天気", "去年の祭りとの比較"],
    currentLocalFacts: ["値引き用の棚の準備をしている"],
    pendingRequestContent: requestSubject ? `KNOWN: ${requestSubject}` : "UNKNOWN",
    playerUtterance,
    authoritativeAction,
  };
}

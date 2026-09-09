/**
 * PHASE 11.11: small playable Yohei scene -- post-festival, leftover stock. Extends the existing
 * PendingReply/Action Contract V2 architecture (PHASE 11.6R-11.10), introduces zero new runtime
 * mechanism. All request-meaning resolution goes through `yoheiSourceEvents.ts`'s single registry.
 */

import { openPendingReply, type PendingReplyEventSpec } from "./engine";
import type { ActionContractV2, ContractV2State, Precondition } from "./types";
import type { LifeMaterial } from "../life-material-7day/types";
import { resolveYoheiSourceEvent, authoringSufficiencyGate } from "./yoheiSourceEvents";
import { PLAYER_ACCEPTS_REQUEST, PLAYER_DECLINES_REQUEST, PENDING_REPLY_OPEN } from "./pendingReplyContracts";

const ALWAYS: Precondition = { id: "always", check: () => true };

/**
 * PHASE 11.13 (product repair, directive Section 10): ASK_WHAT is a ONE-SHOT reveal, not a
 * permanently-repeatable FAQ entry -- once the player has already been told what the errand is,
 * asking again has nothing left to supply. Reuses the exact `concreteContent` string
 * `ASK_WHAT_HELP_NEEDED.actorExperienceWrite` below writes -- Single Precondition Authority, no
 * second independently-authored copy of "was this already asked" exists.
 */
const NOT_YET_ASKED_WHAT: Precondition = {
  id: "not_yet_asked_what",
  check: (s) => !s.experienceLog.some((e) => e.concreteContent === "洋平に、何を手伝えばいいか尋ねた"),
};

/**
 * PHASE 11.13 (product repair, directive Section 10/11): ASK_SALES is a CONTEXTUAL follow-up --
 * it must not be offered merely because the engine can answer it (directive Section 11's explicit
 * instruction). It becomes askable only once the preceding conversation (asking about the
 * festival) has actually created the conversational context for it. Reuses
 * `ASK_FESTIVAL_SCENE.actorExperienceWrite`'s own `concreteContent` string.
 */
const HAS_ASKED_FESTIVAL: Precondition = {
  id: "has_asked_festival",
  check: (s) => s.experienceLog.some((e) => e.concreteContent === "洋平に祭りについて聞いた"),
};

/**
 * PHASE 11.14 (Owner Play directive Section 7): ASK_FESTIVAL had NO one-shot gate at all --
 * `eligibility: [ALWAYS]` meant it stayed in the action list forever, including after the player
 * already asked it. Same pattern as `NOT_YET_ASKED_WHAT` above (Actor Experience / QUESTION_ASKED,
 * not State Admission) -- "I already asked this" is a genuinely different fact from "its target is
 * now known" (see `questionTargetUnresolved`/`LEFTOVER_TARGET_UNRESOLVED` below for the latter).
 * Both dimensions gate independently; this one alone is sufficient to satisfy Section 7's minimum
 * ("an action already selected should disappear") without depending on the response-commit step.
 */
const NOT_YET_ASKED_FESTIVAL: Precondition = {
  id: "not_yet_asked_festival",
  check: (s) => !s.experienceLog.some((e) => e.concreteContent === "洋平に祭りについて聞いた"),
};

/**
 * PHASE 11.14 (Owner Play directive Section 8/9/10): the Owner's strongest finding -- a question
 * must also disappear when its TARGET has already been resolved by ANOTHER legitimate NPC
 * response, not merely by asking that exact question. Real authored content: the real captured
 * ASK_FESTIVAL response ("8割くらいは売れたよ。残りは今値引きして出す準備してるところだ。") already
 * states the sales result, so once it has been delivered, ASK_SALES has nothing left to add.
 * Structural, not prose-based: a human verified this once against the real captured text
 * (`capturedYoheiLines.ts`), and the fact is recorded as a plain State Admission material,
 * admitted at the response-commit seam (`npcResponseCommit.ts`) -- never re-derived from
 * `concreteContent` at evaluation time, same principle as `LEFTOVER_RESPONSE_MATERIAL_IDS`/
 * `REVEAL_MATERIAL_ASSERTED_FACTS` (PHASE 11.13D/E).
 */
export type QuestionTarget = "FESTIVAL_SALES_STATUS";

/** Which action's response commit resolves which simple (non-branching, always-KNOWN) question
 *  target(s) -- authored once, read by `npcResponseCommit.ts`'s commit step, never derived from
 *  the response's own display text. One response may resolve more than one target (directive
 *  Section 8/10's explicit requirement) -- see `ASK_FESTIVAL_SCENE`'s entry. */
export const RESPONSE_RESOLVES_SIMPLE_TARGETS: Record<string, QuestionTarget[]> = {
  ASK_FESTIVAL_SCENE: ["FESTIVAL_SALES_STATUS"],
  ASK_SALES_SCENE: ["FESTIVAL_SALES_STATUS"],
};

/** Single-sourced material id format -- both the eligibility check below and
 *  `npcResponseCommit.ts`'s commit step reference this ONE function, never two independently
 *  hand-typed copies of the same template string. */
export function questionTargetKnownMaterialId(target: QuestionTarget): string {
  return `question_target_known:${target}`;
}

function questionTargetUnresolved(target: QuestionTarget): Precondition {
  return {
    id: `question_target_unresolved:${target}`,
    check: (s) => !s.materials.some((m) => m.id === questionTargetKnownMaterialId(target) && m.status === "ACTIVE"),
  };
}

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
    ["値引き用の棚を整理していた洋平が、話しかけてきた。「ちょっと手伝ってくれる？」"],
  );
}

/** The single Precondition both ACCEPT_HELP's own material creation and ASK_ABOUT_LEFTOVER_STOCK's
 *  eligibility reference -- Single Precondition Authority, unchanged principle since PHASE 11.6R. */
export const LEFTOVER_STOCK_MOVED: Precondition = {
  id: "leftover_stock_moved_active",
  check: (s) => s.materials.some((m) => m.id === "leftover_stock_moved" && m.status === "ACTIVE"),
};

/**
 * PHASE 11.13 (product repair, directive Section 6/7): ACCEPT_HELP now narrates the physical
 * consequence AND the reveal as one continuous, authored (not LLM-invented) event -- the player
 * moves the box, it is set down at the discount shelf, and it is opened, so its contents (festival-
 * patterned hand towels) become visible. Deliberately does NOT say the towels are specifically
 * "残り" (leftover/unsold surplus, i.e. `祭りの残り`) -- that specific characterization is Yohei's
 * own confirmed knowledge, not something visible from the towels alone, and is exactly what the
 * newly-eligible follow-up question legitimately supplies (see CAUSALITY_COUNTERFACTUAL_
 * INVARIANT_V1.md / REAL_CAUSALITY_GATE_AUDIT_V1.md's chosen evidence source, State Admission,
 * unchanged mechanism -- only this narration/material text changed).
 */
export const PLAYER_ACCEPTS_HELP_MOVE_STOCK: PendingReplyEventSpec = {
  ...PLAYER_ACCEPTS_REQUEST,
  narration: () => [
    "「OKです。この棚に置きますね」と答え、洋平と二人で箱を値引き用の棚まで運んだ。",
    "棚に置いて蓋を開けると、中には祭りの柄の手ぬぐいがたくさん入っていた。",
  ],
  material: (s): LifeMaterial => ({
    id: "leftover_stock_moved",
    type: "SHARED_EVENT",
    concreteContent: "洋平と一緒に箱を値引き用の陳列スペースまで運び、蓋を開けると中には祭りの柄の手ぬぐいがたくさん入っていた",
    origin: "PLAYER_ACTION:ACCEPT_HELP_MOVE_STOCK",
    dayCreated: s.day,
    authority: "PLAYER_CHOSEN_FACT",
    status: "ACTIVE",
    knownBy: ["player", "yohei"],
    possibleConsumers: ["ASK_ABOUT_LEFTOVER_STOCK"],
  }),
};

/**
 * PHASE 11.13 (product repair, directive Section 12): DECLINE_HELP now narrates TWO distinct
 * lines -- PLAYER's own decline utterance (unchanged from `PLAYER_DECLINES_REQUEST`) AND Yohei's
 * short, non-punitive acknowledgment, kept as two separate array entries (rendered as two separate
 * paragraphs by `NewlifePlayable11App.tsx`'s existing `entry.narration.map(...)`) so the SOCIAL
 * RESPONSE is visibly distinct from the separately-rendered NPC-independent-continuation line
 * (`yoheiContinuesLeftoverStockWorkNarration`, below, unchanged) -- directive's explicit
 * instruction not to merge the two concepts.
 */
export const PLAYER_DECLINES_HELP_MOVE_STOCK: PendingReplyEventSpec = {
  ...PLAYER_DECLINES_REQUEST,
  narration: () => ["「今日はちょっと、やめておきます」と答えた。", "「ああ、分かった。じゃあ俺でやるよ」と、洋平は言った。"],
};

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
  eligibility: [PENDING_REPLY_OPEN, NOT_YET_ASKED_WHAT],
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
  eligibility: [NOT_YET_ASKED_FESTIVAL],
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
  eligibility: [HAS_ASKED_FESTIVAL, questionTargetUnresolved("FESTIVAL_SALES_STATUS")],
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

/**
 * PHASE 11.13B mistakenly put the NPC's response record inside THIS contract's own `stateDelta`
 * -- meaning it committed inside the exact same `resolveAction` call that represents the PLAYER's
 * own ask dispatch (QUESTION DISPATCH), not as a genuinely separate NPC RESPONSE EVENT. PHASE
 * 11.13C corrected this: this contract's ONLY authoritative responsibility is recording that the
 * PLAYER asked (QUESTION_ASKED, via `actorExperienceWrite` below). The NPC response -- whether it
 * confirms, denies, or does not resolve the target fact -- is committed separately, at the
 * response-delivery seam, by `npcResponseCommit.ts`'s `commitNpcResponseIfApplicable`, called from
 * `NewlifePlayable11App.tsx` strictly AFTER this action resolves. See docs/research/evaluation/
 * phase-11-13c/NPC_RESPONSE_COMMIT_POINT_V1.md for the real event-order trace.
 *
 * PHASE 11.13D CORRECTION (see docs/research/evaluation/phase-11-13d/
 * STRUCTURED_RESPONSE_SEMANTICS_V1.md): PHASE 11.13C still used ONE material id
 * ("leftover_question_answered") for every possible NPC response outcome, distinguishing CONFIRM
 * from UNKNOWN by substring-searching `concreteContent` -- human-readable prose determining
 * authoritative semantic truth, exactly what this phase exists to remove. Replaced with THREE
 * structurally distinct material ids, one per possible outcome (`LEFTOVER_RESPONSE_MATERIAL_IDS`)
 * -- the material's OWN id (a structural fact, authored at commit time, never re-derived from its
 * text) now IS the semantic signal. `concreteContent` remains for audit/history display only and
 * is never read by any authoritative decision.
 */
export type StructuredResponseOutcome = "CONFIRM" | "DENY" | "UNKNOWN";

export const LEFTOVER_RESPONSE_MATERIAL_IDS: Record<StructuredResponseOutcome, string> = {
  CONFIRM: "leftover_question_response_confirm",
  DENY: "leftover_question_response_deny",
  UNKNOWN: "leftover_question_response_unknown",
};

/**
 * PHASE 11.13E (see docs/research/evaluation/phase-11-13e/STRUCTURED_REVEAL_SEMANTICS_V1.md): the
 * LAST remaining Product-authoritative prose-parser was `causalUnlockInvariant.ts` substring-
 * searching THIS material's own `concreteContent` to decide whether the physical reveal already
 * establishes the target fact. Fixed the same way PHASE 11.13D fixed NPC responses: the fact-tag
 * list is now authored HERE, once, by a human verifying the real narration text in
 * `PLAYER_ACCEPTS_HELP_MOVE_STOCK` below -- a static design property of this one reveal, keyed by
 * material id, never re-derived from `concreteContent` at evaluation time. Extensible: if a future
 * reveal variant is ever added, it gets its own id and its own registry entry, exactly like
 * `LEFTOVER_RESPONSE_MATERIAL_IDS` above.
 */
export const REVEAL_MATERIAL_ASSERTED_FACTS: Record<string, string[]> = {
  leftover_stock_moved: ["GOING_TO_DISCOUNT_SHELF"], // deliberately does NOT include IS_FESTIVAL_LEFTOVER -- verified against the real narration text below, which withholds it until the follow-up question is answered
};

/**
 * PHASE 11.14 (Owner Play directive Section 8/12): the leftover question must ALSO disappear once
 * its target is resolved by a DIFFERENT response (the real ASK_FESTIVAL answer already states
 * "残りは今値引きして出す準備してるところだ" -- Yohei confirming, in his own authoritative response,
 * that the remaining stock is exactly what is being prepared for the discount shelf). Reuses the
 * EXISTING three-outcome material system (`LEFTOVER_RESPONSE_MATERIAL_IDS`, PHASE 11.13D) rather
 * than inventing a second, parallel "known" tracker for the same underlying fact -- any of the
 * three outcomes being ACTIVE means the target is no longer open, regardless of which action
 * committed it. Structural (material id membership), never prose-based.
 */
const LEFTOVER_TARGET_UNRESOLVED: Precondition = {
  id: "leftover_target_unresolved",
  check: (s) => !Object.values(LEFTOVER_RESPONSE_MATERIAL_IDS).some((id) => s.materials.some((m) => m.id === id && m.status === "ACTIVE")),
};

/** The new possibility (directive Section 13) -- eligible ONLY once LEFTOVER_STOCK_MOVED is
 *  active, i.e. only after ACCEPT_HELP actually happened, AND only while its own target remains
 *  unresolved (PHASE 11.14, directive Section 8/12 -- PATH D: still legitimate if the player has
 *  only seen the physical reveal and never received the festival answer; gone once either
 *  response has resolved it). */
export const ASK_ABOUT_LEFTOVER_STOCK: ActionContractV2 = {
  actionId: "ASK_ABOUT_LEFTOVER_STOCK",
  playerIntent: "ASK_ABOUT_LEFTOVER_STOCK",
  eligibility: [LEFTOVER_STOCK_MOVED, LEFTOVER_TARGET_UNRESOLVED],
  playerVisiblePromise: "運んだ箱について尋ねる",
  failurePostcondition: null,
  authoritativeEvent: "ASK_ABOUT_LEFTOVER_STOCK",
  successPostcondition: { id: "ask_about_leftover_stock_occurs", check: () => true },
  partialSuccessPostcondition: null,
  visibleFeedback: () => ({ onSuccess: [], onPartialSuccess: null, onFailure: null }),
  // PHASE 11.13C: no response state here -- this action's stateDelta represents ONLY what the
  // PLAYER's own dispatch authoritatively accomplishes (nothing, for a question), never the NPC's
  // response, which is a separate event committed elsewhere (see comment above).
  stateDelta: (): LifeMaterial[] => [],
  actorExperienceWrite: () => [{ actorId: "player", mode: "PARTICIPATED", concreteContent: "運んだ箱が祭りの残りかどうか、洋平に尋ねた" }],
  conditionalFollowUpAffordance: () => "NONE",
};

/** NPC independence (directive Section 14) -- deterministic/authored, same pattern as the existing
 *  `yoheiContinuesShopWorkNarration`. Shown regardless of PLAYER's choice while the request is
 *  still open, and after DECLINE. */
export function yoheiContinuesLeftoverStockWorkNarration(s: ContractV2State): string[] {
  return LEFTOVER_STOCK_MOVED.check(s)
    ? ["運んだ手ぬぐいは、すでに値引き用の棚に並んでいる。"]
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

/**
 * PHASE 11.6R: concrete Action Contract V2 instances for the isolated prototype.
 *
 * Every case reuses `LifeMaterial` (PHASE 10.21) unmodified. No new taxonomy is introduced:
 * OBJECT/PENDING_TASK for the bag regression, SHARED_EVENT for helping Jin -- nothing else.
 * SHARED_EVENT here records only that an event was actually shared -- it is factual history, not
 * a relationship score, trust value, or reward (PHASE 11.6R Section 13).
 */

import type { ActionContractV2, ContractV2State, Precondition } from "./types";

function isActive(state: ContractV2State, id: string): boolean {
  return state.materials.some((m) => m.id === id && m.status === "ACTIVE");
}

// ---------------------------------------------------------------------------
// Shared, named preconditions -- the SAME object is referenced everywhere the
// same underlying fact governs both an offer and an attempt (directive Section 5).
// ---------------------------------------------------------------------------

export const TRASH_BAGS_NEEDED: Precondition = {
  id: "trash_bags_needed_active",
  check: (s) => isActive(s, "trash_bags_needed"),
};

export const JIN_HELPER_ABSENT: Precondition = {
  id: "jin_helper_absent_today",
  check: (s) => s.world.jinHelperAbsentToday,
};

const ALWAYS: Precondition = { id: "always", check: () => true };

// ---------------------------------------------------------------------------
// CASE A: simple purchase at Yohei's shop -- no follow-up, ever.
// ---------------------------------------------------------------------------

export const VISIT_YOHEI_SIMPLE_PURCHASE: ActionContractV2 = {
  actionId: "VISIT_YOHEI_SIMPLE_PURCHASE",
  playerIntent: "ORDINARY_SHOP_VISIT",
  eligibility: [ALWAYS],
  playerVisiblePromise: "洋平商店で買い物を済ませる",
  failurePostcondition: null,
  authoritativeEvent: "ORDINARY_TRANSACTION",
  successPostcondition: { id: "purchase_served", check: () => true },
  partialSuccessPostcondition: null,
  visibleFeedback: () => ({
    onSuccess: ["必要な物を買って、店を出た。"],
    onPartialSuccess: null,
    onFailure: null,
  }),
  stateDelta: () => [],
  actorExperienceWrite: () => [{ actorId: "player", mode: "PARTICIPATED", concreteContent: "洋平商店で買い物をした" }],
  conditionalFollowUpAffordance: () => "NONE",
};

// ---------------------------------------------------------------------------
// TRASH BAG REGRESSION: VISIT_YOHEI whose conditional follow-up (buying the bags)
// is gated by the SAME `TRASH_BAGS_NEEDED` object used for the follow-up's own
// eligibility -- structurally, the two cannot disagree the way the confirmed
// PHASE 10.22.2R defect (day >= 4 vs day === 4) did.
// ---------------------------------------------------------------------------

export const VISIT_YOHEI_WITH_BAG_TASK: ActionContractV2 = {
  actionId: "VISIT_YOHEI_WITH_BAG_TASK",
  playerIntent: "ORDINARY_SHOP_VISIT",
  eligibility: [ALWAYS],
  playerVisiblePromise: "洋平商店で買い物を済ませる",
  failurePostcondition: null,
  authoritativeEvent: "ORDINARY_TRANSACTION",
  successPostcondition: { id: "purchase_served", check: () => true },
  partialSuccessPostcondition: null,
  visibleFeedback: () => ({
    onSuccess: ["洋平商店に顔を出した。"],
    onPartialSuccess: null,
    onFailure: null,
  }),
  stateDelta: () => [],
  actorExperienceWrite: () => [{ actorId: "player", mode: "PARTICIPATED", concreteContent: "洋平商店を訪れた" }],
  // The label promise ("go buy the bags") is only ever generated FROM this same eligibility check
  // -- see NewlifeContractV2App.tsx / engine.ts, which derive the rendered button text from this
  // return value, never from an independently-authored condition.
  conditionalFollowUpAffordance: (s) =>
    TRASH_BAGS_NEEDED.check(s) ? [{ id: "BUY_BAGS", label: "指定のゴミ袋を買いに行く", eligibility: [TRASH_BAGS_NEEDED] }] : "NONE",
};

export const BUY_BAGS_FOLLOW_UP: ActionContractV2 = {
  actionId: "BUY_BAGS",
  playerIntent: "RESOLVE_PENDING_BAG_TASK",
  // Literally the same Precondition object as the affordance's own `eligibility` field above --
  // not a re-derived copy. Tested explicitly in tests/actionContractV2.test.ts (Test K).
  eligibility: [TRASH_BAGS_NEEDED],
  playerVisiblePromise: "指定のゴミ袋を買いに行く",
  failurePostcondition: null,
  authoritativeEvent: "BUY_TRASH_BAGS",
  successPostcondition: { id: "trash_bags_owned_active", check: (s) => isActive(s, "trash_bags_owned") },
  partialSuccessPostcondition: null,
  visibleFeedback: () => ({
    onSuccess: ["その場で、指定の透明ゴミ袋を買った。10枚入りを一つ、手に入れた。"],
    onPartialSuccess: null,
    onFailure: null,
  }),
  stateDelta: (s) => [
    ...s.materials.map((m) => (m.id === "trash_bags_needed" ? { ...m, status: "CONSUMED" as const } : m)),
    { id: "trash_bags_owned", type: "OBJECT", concreteContent: "洋平商店で買った、指定の透明ゴミ袋（10枚入り）", origin: "PLAYER_ACTION:BUY_BAGS", dayCreated: s.day, authority: "PLAYER_CHOSEN_FACT", status: "ACTIVE", knownBy: ["player", "yohei"], possibleConsumers: [] },
  ],
  actorExperienceWrite: () => [
    { actorId: "player", mode: "PARTICIPATED", concreteContent: "指定のゴミ袋を買った" },
    { actorId: "yohei", mode: "PARTICIPATED", concreteContent: "指定のゴミ袋を売った" },
  ],
  conditionalFollowUpAffordance: () => "NONE",
};

// ---------------------------------------------------------------------------
// CASE B-E: Jin / hall equipment work. `world.jinHelperAbsentToday` is the single
// world-truth fact controlling whether OFFER_HELP is ever legitimately offered.
// ---------------------------------------------------------------------------

export const EXPLORE_HALL_JIN_WORKING: ActionContractV2 = {
  actionId: "EXPLORE_HALL_JIN_WORKING",
  playerIntent: "OBSERVE",
  eligibility: [ALWAYS],
  playerVisiblePromise: "近所を歩いてみる",
  failurePostcondition: null,
  authoritativeEvent: "OBSERVE_HALL",
  successPostcondition: { id: "observation_occurs", check: () => true },
  partialSuccessPostcondition: null,
  visibleFeedback: (s) => ({
    onSuccess: s.world.jinHelperAbsentToday
      ? ["公民館の裏手で、迅が一人で長机を運んでいるのが見えた。"]
      : ["公民館の裏手で、迅ともう一人が長机を運んでいるのが見えた。"],
    onPartialSuccess: null,
    onFailure: null,
  }),
  stateDelta: () => [],
  actorExperienceWrite: (s) => [
    { actorId: "player", mode: "WITNESSED", concreteContent: "公民館で長机を運ぶ仕事をしている迅を見かけた" },
    { actorId: "jin", mode: "PARTICIPATED", concreteContent: s.world.jinHelperAbsentToday ? "一人で長机を運んでいた" : "もう一人の手伝いと長机を運んでいた" },
  ],
  conditionalFollowUpAffordance: (s) => (JIN_HELPER_ABSENT.check(s) ? [{ id: "OFFER_HELP", label: "手伝う", eligibility: [JIN_HELPER_ABSENT] }] : "NONE"),
};

export const OFFER_HELP_FOLLOW_UP: ActionContractV2 = {
  actionId: "OFFER_HELP",
  playerIntent: "HELP_JIN",
  eligibility: [JIN_HELPER_ABSENT],
  playerVisiblePromise: "手伝う",
  failurePostcondition: null,
  authoritativeEvent: "HELP_MOVE_TABLE",
  successPostcondition: { id: "table_moved_with_help", check: (s) => isActive(s, "helped_jin_move_table") },
  partialSuccessPostcondition: null,
  visibleFeedback: () => ({
    onSuccess: ["二人で長机を運んだ。「助かった」と、迅が言った。"],
    onPartialSuccess: null,
    onFailure: null,
  }),
  stateDelta: (s) => [{ id: "helped_jin_move_table", type: "SHARED_EVENT", concreteContent: "迅と一緒に公民館の長机を運んだ", origin: "PLAYER_ACTION:OFFER_HELP", dayCreated: s.day, authority: "PLAYER_CHOSEN_FACT", status: "ACTIVE", knownBy: ["player", "jin"], possibleConsumers: [] }],
  actorExperienceWrite: () => [
    { actorId: "player", mode: "PARTICIPATED", concreteContent: "迅の長机運びを手伝った" },
    { actorId: "jin", mode: "PARTICIPATED", concreteContent: "プレイヤーに長机運びを手伝ってもらった" },
  ],
  conditionalFollowUpAffordance: () => "NONE",
};

export const REST: ActionContractV2 = {
  actionId: "REST",
  playerIntent: "DISENGAGE",
  eligibility: [ALWAYS],
  playerVisiblePromise: "休む",
  failurePostcondition: null,
  authoritativeEvent: "REST_QUIETLY",
  successPostcondition: { id: "day_advances", check: () => true },
  partialSuccessPostcondition: null,
  visibleFeedback: () => ({
    onSuccess: ["今日は無理をせず、部屋で過ごすことにした。"],
    onPartialSuccess: null,
    onFailure: null,
  }),
  stateDelta: () => [],
  actorExperienceWrite: () => [],
  conditionalFollowUpAffordance: () => "NONE",
};

export function jinContinuesWorkNarration(s: ContractV2State): string[] {
  // World continuity, independent of PLAYER's choice (directive Section 19/9). Jin finishes the
  // work whether or not PLAYER helped -- alone if unhelped, faster if helped.
  return s.world.jinHelperAbsentToday && !isActive(s, "helped_jin_move_table")
    ? ["迅は、一人で長机を運び終えた。"]
    : ["長机は、公民館の裏手に運び終えられた。"];
}

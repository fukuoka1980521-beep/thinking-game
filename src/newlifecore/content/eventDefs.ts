/**
 * PHASE_12_5_NEW_LIFE_RECURRING_WORLD_ENGINE_V1 Section 15 -- the V1 event table for
 * content/eventEngine.ts. 16 definitions across all 8 candidate families (Section 3 -- all 8 turned
 * out to have real canon support once checked against npcDefs.ts, so V1 didn't need to narrow to a
 * subset). Two short 2-stage chains (WORK: chair; PROMISE: hina's shelves); the remaining 12 are
 * deliberately one-off (directive Section 6: not everything should be chained). Authored, not
 * AI-generated -- every `worldFact.text` line is hand-written, natural Japanese, presentation-ready
 * as-is (directive Section 13: "TEXT IS PRESENTATION"), never an internal id or family name leaking
 * into anything player-visible.
 *
 * PHASE_12_6_NEW_LIFE_RELATIONSHIP_CONSEQUENCE_AND_SOCIAL_MEMORY_V1 added exactly ONE new
 * definition (`yohei_mentions_player_to_jin`, Section 10's own worked example -- multi-NPC
 * consequence gated on the PLAYER's categorical relationship, not a general rumor system) and
 * `textVariants` on four of the most repeat-prone existing definitions (Section 13, presentation
 * variation) -- deliberately minimal, per that phase's own "text variationだけを先に磨かない"
 * priority ordering. 17 definitions total now.
 */
import type { EventDefinition } from "./eventEngine";

export const EVENT_DEFS: EventDefinition[] = [
  // ---- WORK (2, chain: ask -> done) ----------------------------------------------------------
  {
    id: "jin_fixes_chair_ask",
    family: "WORK",
    participants: ["jin", "miyoko"],
    location: "CAFE_NODOKA",
    playerPresenceRequired: false,
    triggerTime: 10 * 60,
    eligibility: {
      minDay: 3,
      npcsAvailable: ["jin", "miyoko"],
      requiredRelationship: [{ a: "jin", b: "miyoko", qualities: ["close", "familiar"] }],
      // Section 7 -- cooldown alone is a fixed floor, and without any chance below it, the pair
      // fires at the earliest possible day every single cycle (a perfectly periodic 8-day
      // metronome over 30 days), which reads as clockwork rather than uneven. 0.6 lets the
      // cooldown re-check on subsequent eligible days instead of firing the instant it opens.
      occurrenceChance: 0.6,
    },
    cooldownDays: 8,
    familyCooldownDays: 2,
    worldFact: { id: "jin_fixes_chair_ask", text: "美代子が、喫茶のどかの椅子のがたつきを相馬に直してほしいと頼んだ。", knownBy: ["jin", "miyoko"], category: "promise" },
  },
  {
    id: "jin_fixes_chair_done",
    family: "WORK",
    participants: ["jin", "miyoko"],
    location: "CAFE_NODOKA",
    playerPresenceRequired: false,
    triggerTime: 15 * 60,
    eligibility: { requiredFlags: ["jin_fixes_chair_ask"], npcsAvailable: ["jin"] },
    cooldownDays: 0,
    resetFlagsOnFire: ["jin_fixes_chair_ask"],
    worldFact: { id: "jin_fixes_chair_done", text: "喫茶のどかの椅子は、いつの間にかがたつかなくなっていた。相馬が寄っていったらしい。", knownBy: ["jin", "miyoko"], category: "pending_task" },
  },

  // ---- PROMISE (2, chain: ask -> done) -------------------------------------------------------
  {
    id: "miyoko_offers_help_hina_ask",
    family: "PROMISE",
    participants: ["miyoko", "hina"],
    location: "SHOPPING_STREET",
    playerPresenceRequired: false,
    triggerTime: 11 * 60,
    eligibility: {
      minDay: 6,
      requiredFlags: ["hinaShopOpen"],
      npcsAvailable: ["miyoko", "hina"],
      requiredRelationship: [{ a: "miyoko", b: "hina", qualities: ["close", "familiar"] }],
      occurrenceChance: 0.6,
    },
    cooldownDays: 12,
    familyCooldownDays: 3,
    worldFact: { id: "miyoko_offers_help_hina_ask", text: "美代子が、陽菜の店の棚の並べ方を一緒に見てあげると声をかけていた。", knownBy: ["miyoko", "hina"], category: "promise" },
  },
  {
    id: "miyoko_helps_hina_shelves_done",
    family: "PROMISE",
    participants: ["miyoko", "hina"],
    location: "SHOPPING_STREET",
    playerPresenceRequired: false,
    triggerTime: 15 * 60 + 30,
    eligibility: { requiredFlags: ["miyoko_offers_help_hina_ask"], npcsAvailable: ["miyoko", "hina"] },
    cooldownDays: 0,
    resetFlagsOnFire: ["miyoko_offers_help_hina_ask"],
    worldFact: { id: "miyoko_helps_hina_shelves_done", text: "陽菜の店の棚は、前より少し見やすく並び替えられていた。", knownBy: ["miyoko", "hina"], category: "pending_task" },
  },

  // ---- SOCIAL (2) -----------------------------------------------------------------------------
  {
    id: "fumiko_visits_miyoko_cafe",
    family: "SOCIAL",
    participants: ["fumiko", "miyoko"],
    location: "CAFE_NODOKA",
    playerPresenceRequired: false,
    triggerTime: 15 * 60 + 30,
    eligibility: {
      minDay: 2,
      npcsAvailable: ["fumiko", "miyoko"],
      requiredRelationship: [{ a: "fumiko", b: "miyoko", qualities: ["close", "familiar"] }],
      occurrenceChance: 0.65,
    },
    cooldownDays: 5,
    familyCooldownDays: 2,
    worldFact: {
      id: "fumiko_visits_miyoko_cafe",
      text: "文子が喫茶のどかに寄って、美代子と少し話し込んでいた。",
      textVariants: ["喫茶のどかを覗くと、文子が美代子相手に何か熱心に話していた。", "文子が喫茶のどかのカウンターで、美代子とお茶を飲みながら話していた。"],
      knownBy: ["fumiko", "miyoko"],
      category: "shared_event",
    },
  },
  // PHASE_15_NEW_LIFE_HYBRID_EVENT_AND_FORTUNE_HOUSE_V1 Section 3/6 -- repurposed from
  // "daisuke_and_yohei_chat" (BARBERSHOP). Same shape, same cooldowns, now Shizuko/Yohei/
  // FORTUNE_HOUSE -- their `familiar` relationship (npcDefs.ts) is real, established canon
  // ("旅館時代からの近所付き合い"), not invented just to satisfy this event's eligibility.
  {
    id: "shizuko_and_yohei_chat",
    family: "SOCIAL",
    participants: ["shizuko", "yohei"],
    location: "FORTUNE_HOUSE",
    playerPresenceRequired: false,
    triggerTime: 16 * 60 + 30,
    eligibility: {
      minDay: 4,
      npcsAvailable: ["shizuko", "yohei"],
      requiredRelationship: [{ a: "shizuko", b: "yohei", qualities: ["close", "familiar"] }],
      occurrenceChance: 0.6,
    },
    cooldownDays: 8,
    familyCooldownDays: 2,
    worldFact: {
      id: "shizuko_and_yohei_chat",
      text: "洋平が野菜を届けがてら、静子としばらく世間話をしていったらしい。",
      textVariants: ["占いの館の前を通ると、洋平が縁側で静子と話し込んでいた。", "洋平が顔を出して、静子と少し立ち話をしていったらしい。"],
      knownBy: ["shizuko", "yohei"],
      category: "shared_event",
    },
  },

  // PHASE_12_6 Section 10's own worked example, implemented directly: "PLAYERがYoheiを手伝った→
  // Jinが後日その話を聞く". Gated on the player's OWN categorical relationship with Yohei
  // (`shared_history`, which `computePlayerNpcTags` derives from `flags.shelfFixedWithPlayer` --
  // see socialMemory.ts), not on any score. Information propagation still respects `knownBy`/the
  // existing yohei<->jin relationship (Section 10: "噂システムを大量生成しない" -- exactly one such
  // definition this phase, not a general rumor system).
  {
    id: "yohei_mentions_player_to_jin",
    family: "SOCIAL",
    participants: ["yohei", "jin"],
    location: "COMMUNITY_HALL",
    playerPresenceRequired: false,
    triggerTime: 8 * 60 + 45,
    eligibility: {
      minDay: 3,
      npcsAvailable: ["jin"],
      requiredRelationship: [{ a: "yohei", b: "jin", qualities: ["close", "familiar"] }],
      requiredPlayerRelationship: { npc: "yohei", tags: ["shared_history"] },
    },
    cooldownDays: 15,
    familyCooldownDays: 2,
    worldFact: {
      id: "yohei_mentions_player_to_jin",
      text: "洋平が相馬に、新しく来た住人が棚を手伝ってくれた話をしていたらしい。",
      knownBy: ["yohei", "jin"],
      category: "shared_event",
    },
  },

  // ---- PLACE (2) ------------------------------------------------------------------------------
  {
    id: "shopping_street_festival_flyer",
    family: "PLACE",
    participants: [],
    location: "SHOPPING_STREET",
    playerPresenceRequired: false,
    triggerTime: 9 * 60 + 30,
    eligibility: { minDay: 5 },
    cooldownDays: 20,
    familyCooldownDays: 2,
    worldFact: { id: "shopping_street_festival_flyer", text: "商店街に、来月の祭りの手書きの告知が貼り出されていた。", knownBy: ["yohei", "fumiko"], category: "world_change" },
  },
  {
    id: "hina_shop_new_item",
    family: "PLACE",
    participants: ["hina"],
    location: "SHOPPING_STREET",
    playerPresenceRequired: false,
    triggerTime: 9 * 60 + 15,
    eligibility: { minDay: 4, requiredFlags: ["hinaShopOpen"] },
    cooldownDays: 6,
    familyCooldownDays: 2,
    worldFact: {
      id: "hina_shop_new_item",
      text: "陽菜の店に、見慣れない新しい焼き菓子が並んでいた。",
      textVariants: ["陽菜の店の棚に、今日は違う種類のパンが並んでいた。", "陽菜の店先に、小さな新作の値札が立っていた。"],
      knownBy: ["hina"],
      category: "object",
    },
  },

  // ---- WEATHER (2, paired start/end -- same-day, mirrors day1WorldEvents.ts's rain pattern but
  //      recurring via cooldown rather than one-time; uses its own flag (isDrizzling), never
  //      touching the legacy isRaining flag) --------------------------------------------------
  {
    id: "drizzle_start",
    family: "WEATHER",
    participants: [],
    location: null,
    playerPresenceRequired: false,
    triggerTime: 13 * 60,
    eligibility: { minDay: 2, occurrenceChance: 0.5 },
    cooldownDays: 4,
    familyCooldownDays: 3,
    setFlags: { isDrizzling: true },
    worldFact: { id: "drizzle_start", text: "小雨がぱらつき始めた。", knownBy: [], category: "world_change" },
  },
  {
    id: "drizzle_end",
    family: "WEATHER",
    participants: [],
    location: null,
    playerPresenceRequired: false,
    triggerTime: 14 * 60,
    eligibility: { requiredFlags: ["isDrizzling"] },
    cooldownDays: 0,
    setFlags: { isDrizzling: false },
    worldFact: { id: "drizzle_end", text: "小雨はいつの間にか止んでいた。", knownBy: [], category: "world_change" },
  },

  // ---- ROUTINE_BREAK (2) ------------------------------------------------------------------------
  {
    id: "yohei_closes_early",
    family: "ROUTINE_BREAK",
    participants: ["yohei"],
    location: "YOHEI_STORE",
    playerPresenceRequired: false,
    triggerTime: 16 * 60,
    eligibility: { minDay: 4, npcsAvailable: ["yohei"], occurrenceChance: 0.4 },
    cooldownDays: 9,
    familyCooldownDays: 3,
    worldFact: { id: "yohei_closes_early", text: "洋平商店が、いつもより早くシャッターを下ろしていた。", knownBy: ["jin"], category: "world_change" },
  },
  // PHASE_15 Section 3/6 -- repurposed from "daisuke_late_open" (BARBERSHOP).
  {
    id: "shizuko_late_open",
    family: "ROUTINE_BREAK",
    participants: ["shizuko"],
    location: "FORTUNE_HOUSE",
    playerPresenceRequired: false,
    triggerTime: 10 * 60 + 30,
    eligibility: { minDay: 5, occurrenceChance: 0.35 },
    cooldownDays: 10,
    familyCooldownDays: 3,
    worldFact: { id: "shizuko_late_open", text: "占いの館は、今日はいつもより少し遅れて開いたようだった。", knownBy: [], category: "world_change" },
  },

  // ---- SHARED_SMALL_EVENT (2) --------------------------------------------------------------------
  {
    id: "yohei_miyoko_produce_trade",
    family: "SHARED_SMALL_EVENT",
    participants: ["yohei", "miyoko"],
    location: "CAFE_NODOKA",
    playerPresenceRequired: false,
    triggerTime: 9 * 60 + 15,
    eligibility: {
      minDay: 2,
      npcsAvailable: ["yohei", "miyoko"],
      requiredRelationship: [{ a: "yohei", b: "miyoko", qualities: ["close", "familiar"] }],
      occurrenceChance: 0.65,
    },
    cooldownDays: 5,
    familyCooldownDays: 2,
    worldFact: {
      id: "yohei_miyoko_produce_trade",
      text: "洋平が美代子に、朝どれの野菜を少し届けていた。",
      textVariants: ["洋平が段ボール箱を抱えて、喫茶のどかに何か運び込んでいた。", "美代子が「今日も助かるわ」と、洋平から野菜を受け取っていた。"],
      knownBy: ["yohei", "miyoko"],
      category: "shared_event",
    },
  },
  {
    id: "jin_fixes_something_unprompted",
    family: "SHARED_SMALL_EVENT",
    participants: ["jin", "fumiko"],
    location: "COMMUNITY_HALL",
    playerPresenceRequired: false,
    triggerTime: 8 * 60 + 30,
    eligibility: {
      minDay: 3,
      npcsAvailable: ["jin", "fumiko"],
      requiredRelationship: [{ a: "jin", b: "fumiko", qualities: ["close", "familiar"] }],
      occurrenceChance: 0.6,
    },
    cooldownDays: 6,
    familyCooldownDays: 2,
    worldFact: { id: "jin_fixes_something_unprompted", text: "相馬が、頼まれてもいないのに集会所の掲示板の留め具を直していった。", knownBy: ["jin", "fumiko"], category: "shared_event" },
  },

  // ---- RESOURCE (2) --------------------------------------------------------------------------
  {
    id: "yohei_store_restock",
    family: "RESOURCE",
    participants: ["yohei"],
    location: "YOHEI_STORE",
    playerPresenceRequired: false,
    triggerTime: 8 * 60 + 15,
    eligibility: { minDay: 2, npcsAvailable: ["yohei"], occurrenceChance: 0.65 },
    cooldownDays: 4,
    familyCooldownDays: 2,
    worldFact: { id: "yohei_store_restock", text: "洋平商店の棚に、新しい荷物が並んでいた。", knownBy: ["yohei"], category: "object" },
  },
  {
    id: "hina_sells_out",
    family: "RESOURCE",
    participants: ["hina"],
    location: "SHOPPING_STREET",
    playerPresenceRequired: false,
    triggerTime: 12 * 60,
    eligibility: { requiredFlags: ["hinaShopOpen"], occurrenceChance: 0.3 },
    cooldownDays: 3,
    familyCooldownDays: 2,
    worldFact: { id: "hina_sells_out", text: "陽菜のパンは、今日はもう売り切れていた。", knownBy: ["hina"], category: "object" },
  },
];

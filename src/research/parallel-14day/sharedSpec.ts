/**
 * PHASE 10.20: SHARED_14_DAY_EXPERIMENT_SPEC_V1 — frozen before either variant's generation began.
 *
 * Canon consistency: reuses the SAME protagonist premise, world rules, and named-NPC discipline as
 * `NEW_LIFE_SCENARIO_BIBLE_V1.md` / `NEW_LIFE_DAY1_DAY2_CAUSAL_SPEC_V1.md` (57-year-old PLAYER,
 * 30-day trial stay, L0/L1/L2 background-resident principle, R0-R4 recognition scale, action-first
 * design, no omniscient narration, no fixed festival implementation this window). Extends the
 * existing 2-day proof to 14 days for this experiment only -- does not modify `src/newlife/**`.
 *
 * Yohei and Miyoko are the same established L1-contact figures from the existing canon (shop owner,
 * café owner). Jin and Saeki are NEW to this 14-day experiment, introduced per this phase's own
 * directive (Section 16's Jin example; Section 2's DAY11 Iwata/Saeki reference) -- both are ordinary
 * present-day residents, never mystery props, per Bible §11's own framing.
 */

import type { DayMacroSkeleton, NpcCanonEntry } from "./types";

export const NPC_CANON: Record<string, NpcCanonEntry> = {
  yohei: {
    id: "yohei",
    role: "shopkeeper (洋平商店)",
    personalityRule: "Practical and terse. Answers what is asked, volunteers one concrete product/shop observation at most per visit, never life advice, never asks about PLAYER's past beyond what PLAYER already volunteered.",
    firstEligibleDay: 1,
  },
  miyoko: {
    id: "miyoko",
    role: "café owner (喫茶のどか)",
    personalityRule: "Warm but not intrusive. Keeps working while talking (café never stops functioning around a conversation). Only shares personal detail (e.g. how long she has run the café) if PLAYER directly asks.",
    firstEligibleDay: 1,
  },
  jin: {
    id: "jin",
    role: "community hall / festival-prep helper (公民館の手伝い)",
    personalityRule: "When he sees a stalled or repeated practical situation, suggests exactly ONE legal alternative or small experiment. May miss constraints he doesn't know about. Updates his suggestion from what actually happens. Not omniscient, not a therapist, not an author mouthpiece -- he can be wrong.",
    firstEligibleDay: 6, // first legally meetable once festival-prep visibility begins
  },
  saeki: {
    id: "saeki",
    role: "resident, previously only seen as an unnamed L0 presence at the collection area",
    personalityRule: "Ordinary, mundane, a person doing an ordinary task. Never self-aware of being 'recognized'. Never explains anything supernatural (there is nothing supernatural to explain).",
    firstEligibleDay: 11, // L0 -> L1 upgrade eligible only once a legitimate baseline visit exists (Bible §10)
  },
};

/**
 * DAY1-14 macro skeleton. Directly instantiates the directive's own Section 2 outline. Both
 * variants receive this identical array -- Variant B may not add, remove, or reorder anything here.
 */
export const DAY_SKELETON: DayMacroSkeleton[] = [
  { day: 1, week: 1, theme: "housing entry / immediate living need", worldEvents: [], availableActions: ["VISIT_YOHEI", "VISIT_CAFE", "EXPLORE", "REST"] },
  { day: 2, week: 1, theme: "first-night consequences / practical life continuation", worldEvents: ["collection_area_cleanup_prep_begins"], availableActions: ["VISIT_YOHEI", "VISIT_CAFE", "HANDLE_PRACTICAL_NEED", "REST"] },
  { day: 3, week: 1, theme: "no fixed mandatory event; revisit or practical continuation possible", worldEvents: ["delivery_truck_routine_run"], availableActions: ["VISIT_YOHEI", "VISIT_CAFE", "EXPLORE", "REST"] },
  { day: 4, week: 1, theme: "first meaningful spare time", worldEvents: [], availableActions: ["VISIT_YOHEI", "VISIT_CAFE", "PERSONAL_TIME", "EXPLORE"] },
  { day: 5, week: 1, theme: "true blank day", worldEvents: [], availableActions: ["VISIT_YOHEI", "VISIT_CAFE", "PERSONAL_TIME", "REST"] },
  { day: 6, week: 1, theme: "festival preparation begins becoming visible", worldEvents: ["festival_prep_supplies_moved_to_hall"], availableActions: ["VISIT_YOHEI", "VISIT_CAFE", "EXPLORE", "PERSONAL_TIME"] },
  { day: 7, week: 1, theme: "one week passed; recognition discrepancy only if legitimate baseline exists", worldEvents: ["one_week_marker"], availableActions: ["VISIT_YOHEI", "VISIT_CAFE", "PERSONAL_TIME", "REST"] },
  { day: 8, week: 2, theme: "prior promise / pending / want can return", worldEvents: [], availableActions: ["VISIT_YOHEI", "VISIT_CAFE", "KEEP_PROMISE", "FOLLOW_UP_PENDING"] },
  { day: 9, week: 2, theme: "world progressed without PLAYER", worldEvents: ["yohei_shop_restocked_without_player"], availableActions: ["VISIT_YOHEI", "VISIT_CAFE", "EXPLORE", "REST"] },
  { day: 10, week: 2, theme: "housing/admin breathing point", worldEvents: ["trial_term_reminder_posted"], availableActions: ["HANDLE_PRACTICAL_NEED", "VISIT_YOHEI", "VISIT_CAFE", "PERSONAL_TIME"] },
  { day: 11, week: 2, theme: "conditional R1 for known Iwata/Saeki", worldEvents: ["collection_area_routine"], availableActions: ["HANDLE_PRACTICAL_NEED", "VISIT_YOHEI", "VISIT_CAFE", "EXPLORE"], recognitionEligible: true },
  { day: 12, week: 2, theme: "conditional practical follow-up (round 2)", worldEvents: [], availableActions: ["FOLLOW_UP_PENDING", "VISIT_YOHEI", "VISIT_CAFE", "KEEP_PROMISE"] },
  { day: 13, week: 2, theme: "commitment/conflict window", worldEvents: [], availableActions: ["KEEP_PROMISE", "FOLLOW_UP_PENDING", "VISIT_YOHEI", "VISIT_CAFE"] },
  { day: 14, week: 2, theme: "WORLD waypoint: recognition mismatch reaches practical impact", worldEvents: ["collection_area_routine"], availableActions: ["VISIT_YOHEI", "VISIT_CAFE", "HANDLE_PRACTICAL_NEED", "EXPLORE"], recognitionEligible: true },
];

/** Deterministic, dependency-free "freeze hash" -- proves the spec was fixed before either variant's
 *  generation began (a real cryptographic hash is unnecessary for this purpose; stability and
 *  reproducibility are what matters, verified by test). */
export function hashSpec(): string {
  const payload = JSON.stringify({ NPC_CANON, DAY_SKELETON });
  let h = 0;
  for (let i = 0; i < payload.length; i++) {
    h = (Math.imul(31, h) + payload.charCodeAt(i)) | 0;
  }
  return `spec_v1_${(h >>> 0).toString(16)}_len${payload.length}`;
}

export const SHARED_14_DAY_EXPERIMENT_SPEC_V1 = {
  version: "V1",
  npcCanon: NPC_CANON,
  daySkeleton: DAY_SKELETON,
  hash: hashSpec(),
} as const;

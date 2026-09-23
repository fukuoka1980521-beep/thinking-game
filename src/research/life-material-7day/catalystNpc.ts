/**
 * PHASE 10.21 Section 7-14: WORLD_CATALYST_NPC_V1 — provisional prototype only, NOT canon.
 * Temporary identifier CATALYST_RESIDENT_X; given a working name ("実 / Minoru") only because a
 * real person needs to be addressable in rendered dialogue -- this is disclosed as prototype-only
 * everywhere this module is referenced, never asserted as accepted NEW LIFE canon.
 */

export const CATALYST_ROLE_SELECTION = {
  selected: {
    role: "町内会の回覧板・掲示板担当 (neighborhood circular/bulletin-board runner)",
    reason:
      "Broad, legitimate, believable town movement (his route touches many locations) without " +
      "being a repair/odd-job worker (Jin) or running a fixed shop/café (Yohei/Miyoko). His job " +
      "IS noticing and passing along concrete, small facts -- a natural, non-omniscient reason to " +
      "have seen or heard specific things, never everything.",
  },
  rejected: [
    {
      role: "地域のシルバー人材センターの臨時作業員 (temp senior-worker-center helper, various small jobs)",
      reason: "Too close to Jin's established 'independent repair/odd-job worker' function -- real risk of role overlap.",
    },
    {
      role: "移動販売車の運転手 (mobile grocery van driver)",
      reason: "Too close to Yohei's shopkeeper/commercial role -- would compete with the existing practical-need/shopping action space.",
    },
  ],
} as const;

/** Stable behavior rule (directive Section 7, 10, 13) -- an ACTION rule, not dialogue flavor,
 *  matching the same discipline already used for Jin (PHASE 10.20). */
export const CATALYST_STABLE_RULE =
  "Notices and reports concrete details from his own route; connects separate things he has seen " +
  "or been told; speaks in specific examples, never in theme statements; never tells PLAYER what " +
  "to do, never solves a pending problem himself, never explains an anomaly, never claims " +
  "knowledge outside what he has personally witnessed or been legitimately told. Every appearance " +
  "has his own concrete reason for being there (delivering, checking a board, en route on his " +
  "round) -- he is never simply waiting to explain the plot.";

/** Directive Section 12: hard appearance budget, enforced by test, not merely by convention. */
export const CATALYST_MAX_DIRECT_APPEARANCES = 2;
export const CATALYST_MAX_INDIRECT_EVIDENCE = 2;

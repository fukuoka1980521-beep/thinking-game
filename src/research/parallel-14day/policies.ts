/**
 * PHASE 10.20 Section 12: three identical, fully-explicit 14-day PLAYER action policies, each
 * choosing only from that day's `availableActions` (verified by test against `DAY_SKELETON`). The
 * SAME arrays are replayed against both Variant A and Variant B -- no per-variant policy exists.
 * POLICY 4 (stress/conflict) is explicitly deferred, disclosed in the evidence report, not silently
 * dropped, per directive Section 13's own "only if implementation cost remains reasonable" clause.
 */

import type { ActionId } from "./types";

export const POLICY_1_SOCIAL: ActionId[] = ["VISIT_YOHEI", "VISIT_CAFE", "VISIT_YOHEI", "VISIT_CAFE", "VISIT_YOHEI", "VISIT_CAFE", "VISIT_YOHEI", "VISIT_CAFE", "VISIT_YOHEI", "VISIT_CAFE", "VISIT_YOHEI", "VISIT_CAFE", "VISIT_YOHEI", "VISIT_CAFE"];

export const POLICY_2_PRACTICAL: ActionId[] = ["REST", "HANDLE_PRACTICAL_NEED", "REST", "EXPLORE", "REST", "EXPLORE", "REST", "KEEP_PROMISE", "REST", "HANDLE_PRACTICAL_NEED", "HANDLE_PRACTICAL_NEED", "FOLLOW_UP_PENDING", "FOLLOW_UP_PENDING", "HANDLE_PRACTICAL_NEED"];

export const POLICY_3_MIXED: ActionId[] = ["VISIT_YOHEI", "HANDLE_PRACTICAL_NEED", "VISIT_CAFE", "PERSONAL_TIME", "REST", "VISIT_YOHEI", "VISIT_CAFE", "FOLLOW_UP_PENDING", "EXPLORE", "PERSONAL_TIME", "HANDLE_PRACTICAL_NEED", "VISIT_YOHEI", "KEEP_PROMISE", "HANDLE_PRACTICAL_NEED"];

export const POLICIES: { name: string; actions: ActionId[] }[] = [
  { name: "POLICY_1_SOCIAL", actions: POLICY_1_SOCIAL },
  { name: "POLICY_2_PRACTICAL", actions: POLICY_2_PRACTICAL },
  { name: "POLICY_3_MIXED", actions: POLICY_3_MIXED },
];

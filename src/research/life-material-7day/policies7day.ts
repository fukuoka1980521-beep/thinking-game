import type { ActionId } from "../parallel-14day/types";

/** Same PLAYER decisions replayed against BOTH conditions (directive Section 15/29) -- these are
 *  the only 3 policies for this phase (no 4th). Each stays within that day's real availableActions
 *  from `WEEK1_SKELETON` (verified by test). */
export const TRAJECTORY_SOCIAL: ActionId[] = ["VISIT_CAFE", "HANDLE_PRACTICAL_NEED", "EXPLORE", "VISIT_CAFE", "PERSONAL_TIME", "VISIT_CAFE", "VISIT_CAFE"];
export const TRAJECTORY_PRACTICAL: ActionId[] = ["VISIT_YOHEI", "HANDLE_PRACTICAL_NEED", "REST", "VISIT_YOHEI", "REST", "VISIT_YOHEI", "VISIT_YOHEI"];
export const TRAJECTORY_MIXED: ActionId[] = ["VISIT_YOHEI", "HANDLE_PRACTICAL_NEED", "EXPLORE", "VISIT_CAFE", "PERSONAL_TIME", "VISIT_YOHEI", "VISIT_CAFE"];

export const TRAJECTORIES_7DAY: { name: string; actions: ActionId[] }[] = [
  { name: "TRAJECTORY_SOCIAL", actions: TRAJECTORY_SOCIAL },
  { name: "TRAJECTORY_PRACTICAL", actions: TRAJECTORY_PRACTICAL },
  { name: "TRAJECTORY_MIXED", actions: TRAJECTORY_MIXED },
];

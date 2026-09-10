import type { LifeMaterial, LifeMaterialType } from "../../research/life-material-7day/types";
import type { V03Day, V03State } from "../types";

/** A location scene reachable from either the day's first or second PICK must route
 *  differently depending on visit order: the first visit of the day still owes the day its
 *  mandatory free-text beat; the second visit has nothing left to route to but the evening.
 *  `visitedTodayLocations` already includes THIS visit by the time the scene renders. */
export function afterVisitNext(state: V03State, freeTextBeatId: string, eveningBeatId: string): string {
  return state.visitedTodayLocations.length <= 1 ? freeTextBeatId : eveningBeatId;
}

export function mat(
  id: string,
  type: LifeMaterialType,
  concreteContent: string,
  day: V03Day,
  origin: string,
  knownBy: LifeMaterial["knownBy"],
  authority: LifeMaterial["authority"] = "PLAYER_CHOSEN_FACT"
): LifeMaterial {
  return { id, type, concreteContent, origin, dayCreated: day, authority, status: "ACTIVE", knownBy, possibleConsumers: [] };
}

/** The empty-shop-front thread: cheap, reusable connective tissue across several days'
 *  evening/noon beats (directive "WORLD CONTINUITY" -- a single unresolved world detail the
 *  player can keep noticing, seeding SMALL_SHOP_OWNER / LOCAL_BUSINESS_SUCCESSION signals without
 *  needing bespoke content every time it appears). Returns lines keyed by the current stage.
 */
export const EMPTY_SHOP_LINES: string[] = [
  "空き店舗のシャッターに、小さな紙が貼られていた。「近日、何か始めます」",
  "空き店舗の前に、荷台が停まっていた。植木鉢がいくつも運び込まれている。",
  "空き店舗の中から、棚を組む音がしていた。まだ何の店かは分からない。",
  "空き店舗の窓に、花の絵が描かれた紙が貼られていた。",
];

export function emptyShopLineFor(stage: number): string {
  return EMPTY_SHOP_LINES[Math.min(stage, EMPTY_SHOP_LINES.length - 1)];
}

/**
 * Pure projection: `NewLife30State` -> the minimal `FactsSnapshot` a future
 * semantic layer would need (Phase 29 design; see `contract.ts`). Not
 * called from anywhere in this Run.
 *
 * `menu` and `profit` cite `npcVoice.ts`'s own exported fact strings
 * (`MENU_FACT`, `PROFIT_FACT`) directly rather than re-typing the numbers,
 * so the two layers cannot silently drift apart. `reservation_count` and
 * `seats`/`workshop`/`yesterday` have no single exported raw-fact literal
 * in `npcVoice.ts` to import today (its per-NPC answer functions embed
 * numbers inline in flavored prose); these are written here from the same
 * canon citations those functions already reference
 * (`NEWLIFE_CHARACTER_MODELS_V3.md` "Public known proposal",
 * `NEWLIFE_30DAY_CHARACTER_DERIVED_PLAYABLE_V3.md` §2). If this
 * architecture is ever adopted, unifying every fact onto one shared source
 * (not just menu/profit) is a prerequisite — flagged as a known limitation
 * in PHASE_29_HYBRID_SEMANTIC_CONVERSATION_ARCHITECTURE_V1.md §14, and
 * `tests/newlifeSemanticContract.test.ts` cross-checks the numbers that can
 * be cross-checked today.
 */
import { MENU_FACT, PROFIT_FACT } from "../npcVoice";
import type { NewLife30State, NpcId } from "../types";
import type { FactCategory, FactsSnapshot } from "./contract";

const RESERVATION_FACT = "予約12点、店頭18点、合わせて30点。";
const SEATS_BOUNDED_FACT = "美代子さんの喫茶は四席まで、お客さん用。";
const SEATS_ASSUMED_FACT = "美代子さんの席の扱いはまだ本人が明言していない。";
const WORKSHOP_YES_FACT = "大輔の工房は一時間だけ貸せる。";
const WORKSHOP_NO_FACT = "今回、大輔の工房は貸さない。";
const YESTERDAY_CLEAR_FACT = "初日から予約と店頭を分けて掲示できていた。";
const YESTERDAY_CORRECTED_FACT = "初めの掲示があいまいで、その版を見た客が来たことがある。今は直っている。";

export const NEGATIVE_CONSTRAINTS = ["理容", "床屋", "理髪", "barber"];

export function projectFacts(npc: NpcId, state: NewLife30State): FactsSnapshot {
  const known: Partial<Record<FactCategory, string>> = {
    menu: MENU_FACT,
    reservation_count: RESERVATION_FACT,
    seats: state.mSeats === "bounded" ? SEATS_BOUNDED_FACT : SEATS_ASSUMED_FACT,
  };
  const unknown: FactCategory[] = [];

  if (state.dWorkshop === "one_hour_yes") known.workshop = WORKSHOP_YES_FACT;
  else if (state.dWorkshop === "no") known.workshop = WORKSHOP_NO_FACT;
  else unknown.push("workshop"); // "pending" | "lapsed": Daisuke has not given a final answer.

  if (state.day >= 12) {
    known.yesterday = state.signVersion === "clear_from_start" ? YESTERDAY_CLEAR_FACT : YESTERDAY_CORRECTED_FACT;
  } else {
    unknown.push("yesterday");
  }

  if (state.day >= 20) known.profit = PROFIT_FACT;
  else unknown.push("profit");

  return {
    npc,
    day: state.day,
    known,
    unknown,
    negativeConstraints: NEGATIVE_CONSTRAINTS,
  };
}

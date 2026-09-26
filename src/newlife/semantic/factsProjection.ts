/**
 * Pure projection: `NewLife30State` -> the minimal `FactsSnapshot` a future
 * semantic layer would need (Phase 29 design; see `contract.ts`). Read by
 * the Phase 30 coordinator (`coordinator.ts`) whenever the deterministic
 * router judges an utterance ambiguous (`npcVoice.ts`'s
 * `isAmbiguousFreeText`).
 *
 * All six domains now cite `npcVoice.ts`'s own exported fact strings
 * (`MENU_FACT`, `PROFIT_FACT`, `RESERVATION_FACT`, `SEATS_BOUNDED_FACT`,
 * `SEATS_ASSUMED_FACT`, `WORKSHOP_YES_FACT`, `WORKSHOP_NO_FACT`,
 * `YESTERDAY_CLEAR_FACT`, `YESTERDAY_CORRECTED_FACT`) directly rather than
 * re-typing the numbers — closing the single-source-of-truth gap
 * `PHASE_29_HYBRID_SEMANTIC_CONVERSATION_ARCHITECTURE_V1.md §14 flagged for
 * the four domains that were still hand-duplicated (menu/profit were
 * already unified). This does not change any NPC's own displayed wording in
 * `npcVoice.ts` — those per-character lines are unchanged — it only means
 * this projection can no longer silently drift from the fact numbers
 * `npcVoice.ts` itself defines.
 */
import {
  MENU_FACT,
  PROFIT_FACT,
  RESERVATION_FACT,
  SEATS_BOUNDED_FACT,
  SEATS_ASSUMED_FACT,
  WORKSHOP_YES_FACT,
  WORKSHOP_NO_FACT,
  YESTERDAY_CLEAR_FACT,
  YESTERDAY_CORRECTED_FACT,
} from "../npcVoice";
import type { NewLife30State, NpcId } from "../types";
import type { FactCategory, FactsSnapshot } from "./contract";
import { compactLedger, type FactLedger } from "./factLedger";

export const NEGATIVE_CONSTRAINTS = ["理容", "床屋", "理髪", "barber"];

export function projectFacts(npc: NpcId, state: NewLife30State, ledger?: FactLedger): FactsSnapshot {
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
    ...(ledger ? { ledger: compactLedger(ledger) } : {}),
  };
}

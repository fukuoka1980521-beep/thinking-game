/**
 * PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1 Section I -- STRUCTURED_OBSERVATION, kept
 * strictly separate from RAW_FREE_TEXT. RAW_FREE_TEXT is simply `CoreState.npcMemory` /
 * `realWorldIntents` -- ordinary gameplay data, stored regardless of `researchOptIn` because the
 * game mechanically needs it to function (an NPC's own memory of the player). This function is the
 * ONLY thing gated by `researchOptIn`, and it is a pure read -- it never mutates state, and nothing
 * in the gameplay path (engine.ts, NewlifeCoreApp.tsx's actual game logic) calls it. There is no
 * export/transmission pipeline in this repo at all (consistent with the rest of this project --
 * see docs/SAFETY_PRINCIPLES.md's local-only storage principle); this function only proves the
 * boundary/shape a future opt-in research pipeline would read from.
 *
 * Deliberately does NOT attempt every bullet point directive Section I lists. Two are intentionally
 * omitted rather than faked:
 *   - "AIが質問/反射/別視点/行動提案のどれを使用したか" -- not reliably derivable from stored state
 *     without a second classification pass (itself a form of profiling this Section forbids
 *     building casually). Left to a future Run if genuinely needed, not approximated here.
 *   - "本人の認識が更新されたか" / "同じ問題の見方が変わったか" -- inherently subjective; deriving
 *     this from raw text without the player's own signal would BE a psychological inference this
 *     directive explicitly forbids (Section 7/I: no "PLAYER is lazy"-style labels of any kind,
 *     including positive ones like "PLAYER's outlook improved").
 * No personality/diagnosis/mental-state score is computed anywhere in this file.
 */
import type { CoreState } from "../types";

export interface ResearchObservation {
  /** Total free-text turns across all NPCs -- "自発的に自由記述したか" as a plain count, not a rate
   *  or percentile (no comparison/ranking is computed). */
  freeTextTurnCount: number;
  /** Per-NPC breakdown of the same count -- lets a researcher see whether engagement concentrated
   *  on the Thinking Resident specifically or was spread across the town. */
  freeTextTurnCountByNpc: Record<string, number>;
  /** Whether the player ever created a RealWorldIntent (Section H) -- did they choose a small
   *  action themselves, not whether any particular action was "good". */
  chosePersonalAction: boolean;
  realWorldIntentCount: number;
  /** Whether the player returned to a later day at all (`startNewDay` was called >= once). */
  returnedNextDay: boolean;
  currentDay: number;
  /** Raw counts per USER_UPDATE category actually chosen at check-in -- never collapsed into a
   *  single success/failure score (directive: "ACTION_RESULTではなくUSER_UPDATEとする"). */
  userUpdateCountsByResponse: Record<string, number>;
}

export function deriveResearchObservation(state: CoreState): ResearchObservation {
  const freeTextTurnCountByNpc: Record<string, number> = {};
  let freeTextTurnCount = 0;
  for (const [npc, turns] of Object.entries(state.npcMemory)) {
    freeTextTurnCountByNpc[npc] = turns.length;
    freeTextTurnCount += turns.length;
  }

  const userUpdateCountsByResponse: Record<string, number> = {};
  for (const intent of state.realWorldIntents) {
    if (!intent.userUpdate) continue;
    userUpdateCountsByResponse[intent.userUpdate.response] = (userUpdateCountsByResponse[intent.userUpdate.response] ?? 0) + 1;
  }

  return {
    freeTextTurnCount,
    freeTextTurnCountByNpc,
    chosePersonalAction: state.realWorldIntents.length > 0,
    realWorldIntentCount: state.realWorldIntents.length,
    returnedNextDay: state.day > 1,
    currentDay: state.day,
    userUpdateCountsByResponse,
  };
}

/**
 * PHASE_14_NEW_LIFE_GAMEPLAY_CORE_V1 Section 4/22/23 -- "今日の気配" (TODAY'S SIGNS): up to 3 short,
 * plain-sentence hints shown once, at wake, never a mission list (no icon, no "go here" imperative,
 * no checkmark/completion tracking, fully ignorable -- Section 23: choosing none of them and going
 * somewhere else entirely is exactly as valid as picking one). Every candidate is grounded in real,
 * currently-true state (an activity actually reachable today, a local problem actually still
 * undiscovered, an NPC actually somewhere unusual today) -- never a fabricated hint for variety's
 * own sake. Selection among the eligible candidates is deterministic-but-varying (Section 22:
 * "同じ場所を毎日勧めない" without being "完全ランダム"), seeded by day + candidate id via the same
 * `pseudoChance` hash the recurring-event engine already uses.
 */
import { npcAvailabilityAt } from "../schedule";
import { pseudoChance } from "./eventEngine";
import { ACTIVITY_DEFS } from "./activityDefs";
import { activityEligibleToday } from "./activityEngine";
import { LOCAL_PROBLEM_DEFS } from "./localProblemDefs";
import { localProblemObservationEligible } from "./localProblemEngine";
import { LOCATION_LABEL } from "./day1";
import type { CoreState } from "../types";

interface SignCandidate {
  id: string;
  text: string;
}

function activityCandidates(state: CoreState): SignCandidate[] {
  return ACTIVITY_DEFS.filter((def) => activityEligibleToday(def, state)).map((def) => ({ id: `activity_${def.id}`, text: def.todaysSignText }));
}

function localProblemCandidates(state: CoreState): SignCandidate[] {
  return LOCAL_PROBLEM_DEFS.filter((def) => localProblemObservationEligible(def, state)).map((def) => ({
    id: `localproblem_${def.id}`,
    text: `${LOCATION_LABEL[def.location]}では、何か気になることがありそうだ。`,
  }));
}

/** A small, hand-authored set of NPC-location hints for genuinely narrow/unusual presence windows
 *  -- not every NPC's ordinary daily spot (that would be true every day, adding no real variety and
 *  reading as filler). Kiyoshi's is narrow by design (1 hour/day); Jin's shelf-window one is
 *  naturally self-limiting (only relevant until the shelf gets fixed, almost always day 1 only). */
function npcLocationCandidates(state: CoreState): SignCandidate[] {
  const out: SignCandidate[] = [];
  if (npcAvailabilityAt("kiyoshi", 10 * 60 + 30, state.flags) === "AVAILABLE") {
    out.push({ id: "npc_kiyoshi_yohei", text: "洋平商店で、清を見かけるかもしれない。" });
  }
  if (!state.flags.shelfFixed && state.flags.jinCalledToYohei !== true) {
    out.push({ id: "npc_jin_community", text: "集会所では朝から人の出入りがある。" });
  }
  return out;
}

/** Section 22 -- deterministic ranking, seeded by day so the same day always reproduces the same
 *  picks (testable), but different days pick differently among whatever's actually eligible that
 *  day. Never more than 3 (Section 4's own cap); fewer is fine (Section 23: signs are optional
 *  flavor, not a quota to fill). */
export function buildTodaysSigns(state: CoreState): string[] {
  const pool = [...activityCandidates(state), ...localProblemCandidates(state), ...npcLocationCandidates(state)];
  const ranked = pool.map((c) => ({ c, key: pseudoChance(`${c.id}_${state.day}`) })).sort((a, b) => b.key - a.key);
  return ranked.slice(0, 3).map((r) => r.c.text);
}

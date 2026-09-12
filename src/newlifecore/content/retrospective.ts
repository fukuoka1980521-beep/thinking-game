/**
 * PHASE_12_8_NEW_LIFE_30_DAY_ARC_AND_RETROSPECTIVE_V1 Section 3/17 -- the Day 30 retrospective.
 * Directive Section 17 in full: "canonical stateから候補factを抽出する... deterministic
 * selection/ranking... 必要ならAIは自然な文章化だけ担当。STATE IS CANONICAL. TEXT IS
 * PRESENTATION." This V1 goes one step further than "necessary": there is no AI call anywhere in
 * this module at all -- every sentence is a pre-authored template, deterministically selected and
 * interpolated with real names/places, exactly like `buildEndOfDayNarrative` already does for every
 * ordinary day. This is not a shortcut; it is the safest reading of Section 17 (no live-model
 * dependency for something this structurally important) and it trivially satisfies Section 30's
 * privacy concern (nothing here ever reads Reality Bridge free text, because nothing here calls
 * anything that could).
 *
 * Section 2/18 -- NEVER a classification, NEVER a trait claim, NEVER an "ending". Every line here
 * is a fact about what happened ("○○と何度も話した"), never a conclusion about who the player is
 * ("あなたは社交的です") or what they should be doing ("向いている仕事は○○"). Section 5/29/30 --
 * Reality Bridge/Daisuke content is never read or referenced here at all; searched deliberately
 * (`grep -i intent` inside this file finds nothing) so that boundary is structural, not just a
 * promise in a comment.
 */
import { npcDisplayName } from "../npcDefs";
import { LOCATION_LABEL } from "./day1";
import { pseudoChance } from "./eventEngine";
import { TRAJECTORY_SEEDS } from "./trajectoryDefs";
import { hasAcceptedTrajectory } from "./trajectoryEngine";
import type { CoreState, LocationId, NpcId } from "../types";

// PHASE_15 Section 3/6 -- BARBERSHOP -> FORTUNE_HOUSE. PHASE_15 also found (while touching this
// list for that rename) that ALL_NPCS was missing "kiyoshi" entirely since PHASE_13 added him --
// his "most talked to"/"never met" retrospective ranking was silently never considered. Fixed here.
// "daisuke" is deliberately removed (not just left in): he is permanently unreachable now (his
// schedule is empty, npcDefs.ts), so including him would make every future retrospective claim
// "never met 大輔" -- true but meaningless, since there was never a way to.
const ALL_LOCATIONS: LocationId[] = ["CHALLENGE_CENTER", "YOHEI_STORE", "CAFE_NODOKA", "COMMUNITY_HALL", "SHOPPING_STREET", "FORTUNE_HOUSE"];
const ALL_NPCS: NpcId[] = ["kamiya", "yohei", "miyoko", "jin", "hina", "fumiko", "kiyoshi", "shizuko"];

function pick<T>(options: T[], seed: string): T {
  if (options.length === 1) return options[0];
  const idx = Math.floor(pseudoChance(seed) * options.length);
  return options[Math.min(idx, options.length - 1)];
}

/** Section 3 -- "よく行った場所". Excludes TRIAL_HOUSE (visited trivially every single day
 *  regardless of play style, so it carries no information about how THIS player actually spent
 *  their days). `null` if the player never left home even once (an extreme edge case, still handled
 *  gracefully rather than producing an empty/broken sentence). */
function mostVisitedLocation(state: CoreState): LocationId | null {
  let best: LocationId | null = null;
  let bestCount = 0;
  for (const loc of ALL_LOCATIONS) {
    const count = state.locationVisitCounts[loc] ?? 0;
    if (count > bestCount) {
      best = loc;
      bestCount = count;
    }
  }
  return best;
}

function neverVisitedLocation(state: CoreState): LocationId | null {
  return ALL_LOCATIONS.find((loc) => (state.locationVisitCounts[loc] ?? 0) === 0) ?? null;
}

function mostTalkedToNpc(state: CoreState): NpcId | null {
  let best: NpcId | null = null;
  let bestCount = 0;
  for (const npc of ALL_NPCS) {
    const count = state.npcMemory[npc]?.length ?? 0;
    if (count > bestCount) {
      best = npc;
      bestCount = count;
    }
  }
  return best;
}

function neverMetNpc(state: CoreState): NpcId | null {
  return ALL_NPCS.find((npc) => !state.flags[`met_${npc}`]) ?? null;
}

/** Section 9/17/19 -- one sentence per trajectory seed the player ever engaged with at all (seeds
 *  never touched contribute nothing -- silence, not a "0 experience" line, since an untried seed is
 *  not a fact about this player's 30 days). Priority within a touched seed: an ever-step-back is
 *  the most narratively significant fact (a real change of direction), then currently accepted,
 *  then a decline, then plain ordinary repeated help with no further commitment either way. */
function trajectorySummaryLine(seed: (typeof TRAJECTORY_SEEDS)[number], state: CoreState): string | null {
  const exp = state.playerExperiences.find((e) => e.id === seed.id);
  if (!exp || exp.count === 0) return null;
  const npcName = npcDisplayName(seed.npc);
  const everSteppedBack = Boolean(state.flags[`${seed.id}_ever_stepped_back`]);
  const accepted = hasAcceptedTrajectory(seed, state);
  const everDeclined = state.lifeOpportunityDeclines[seed.id] !== undefined;

  if (accepted && everSteppedBack) {
    return pick(
      [`${npcName}との関わりは、一度離れてからまた戻ってきたものだった。`, `${npcName}のところへは、間を置きつつも今も通っている。`],
      `retro_${seed.id}_accepted_returned`,
    );
  }
  if (accepted) {
    return pick([`${npcName}との関わりは、今も続いている。`, `${npcName}のところへは、今も定期的に顔を出している。`], `retro_${seed.id}_accepted`);
  }
  if (everSteppedBack) {
    return pick([`${npcName}との関わりは、途中でやめた時期があった。`, `${npcName}のところへ通うのは、途中でやめてしまった。`], `retro_${seed.id}_steppedback`);
  }
  if (everDeclined) {
    return pick([`${npcName}から声をかけられたことがあったが、そのときは断った。`, `${npcName}に何か任せると言われたが、一度は断っている。`], `retro_${seed.id}_declined`);
  }
  return pick([`${npcName}のことは、何度か手伝ったことがある。`, `${npcName}のところへは、ときどき顔を出して手伝った。`], `retro_${seed.id}_helped`);
}

/** Section 12/13 -- the explicit no-career case: when every seed has zero engagement, a single,
 *  specific, non-judgmental line replaces the (empty) trajectory section rather than leaving a gap
 *  or defaulting to something that reads as "nothing happened." */
function noCareerLine(state: CoreState): string | null {
  const anyEngagement = TRAJECTORY_SEEDS.some((seed) => (state.playerExperiences.find((e) => e.id === seed.id)?.count ?? 0) > 0);
  if (anyEngagement) return null;
  return "特定の仕事や役割は、結局持たなかった。それでも、町を知り、人と関わる30日ではあった。";
}

function promiseSummaryLines(state: CoreState): string[] {
  const lines: string[] = [];
  const kept = state.playerPromises.filter((p) => p.status === "kept").length;
  const missed = state.playerPromises.filter((p) => p.status === "missed").length;
  const declined = state.playerPromises.filter((p) => p.status === "declined").length;
  const pending = state.playerPromises.filter((p) => p.status === "pending").length;
  if (kept > 0) lines.push("誰かとの約束を、ちゃんと守れたこともあった。");
  if (missed > 0) lines.push("約束していたのに、果たせなかったこともあった。");
  if (declined > 0) lines.push("誘いを、その場で断ったこともあった。");
  if (pending > 0) lines.push("今も、果たしていない約束が一つ残っている。");
  return lines;
}

/**
 * Section 17 -- the ordered, curated list of prose sentences. Deliberately short (roughly 8-12
 * lines total, never all-30-days-enumerated) -- a retrospective that tried to mention everything
 * would itself become the "stats dashboard" Section 26 forbids, just rendered as sentences instead
 * of a table. Nothing here is a table/ranking/number; every line stands alone as ordinary prose,
 * same register as `buildEndOfDayNarrative`.
 */
export function buildRetrospectiveLines(state: CoreState): string[] {
  const lines: string[] = [];
  lines.push("30日目の夜になった。");

  const metCount = ALL_NPCS.filter((npc) => state.flags[`met_${npc}`]).length;
  lines.push(metCount > 1 ? "最初にこの町へ来た時より、知っている顔が少し増えた。" : "知り合いは、まだそう多くはない。");

  const topLoc = mostVisitedLocation(state);
  if (topLoc) {
    lines.push(pick([`${LOCATION_LABEL[topLoc]}へは、何度も足を運んだ。`, `${LOCATION_LABEL[topLoc]}に、よく通った。`], "retro_top_location"));
  }
  const zeroLoc = neverVisitedLocation(state);
  if (zeroLoc && zeroLoc !== topLoc) {
    lines.push(`${LOCATION_LABEL[zeroLoc]}へは、結局一度も行かなかった。`);
  }

  const topNpc = mostTalkedToNpc(state);
  if (topNpc) {
    lines.push(pick([`${npcDisplayName(topNpc)}とは、一番よく話した気がする。`, `${npcDisplayName(topNpc)}とは、何度も言葉を交わした。`], "retro_top_npc"));
  }
  const skippedNpc = neverMetNpc(state);
  if (skippedNpc) {
    lines.push(`${npcDisplayName(skippedNpc)}とは、結局あまり話さなかった。`);
  }

  for (const seed of TRAJECTORY_SEEDS) {
    const line = trajectorySummaryLine(seed, state);
    if (line) lines.push(line);
  }
  const noCareer = noCareerLine(state);
  if (noCareer) lines.push(noCareer);

  lines.push(...promiseSummaryLines(state));

  if (state.flags.shelfFixedWithPlayer) {
    lines.push("洋平の店の棚を直したのは、自分だった。");
  }
  lines.push("この30日で、町も少しずつ変わっていった。気づいた変化もあれば、後から知った変化もあった。");

  lines.push(pick(["まだ決めていないことも、いくつか残っている。", "はっきり決まっていないことも、まだいくつかある。"], "retro_closing_undecided"));
  lines.push("この暮らしは、明日も続いていきそうだった。");

  return lines;
}

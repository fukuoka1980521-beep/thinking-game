/**
 * PHASE_16_NEW_LIFE_GAME_IDENTITY_REBUILD_V1 Section 7-10 -- the root-cause fix for the Owner's
 * evidence B (Yohei/Kiyoshi scene): the live prompt previously carried only a generic
 * `currentScene` string ("洋平商店で、プレイヤーと向き合っている") and an unbounded, un-scoped list
 * of every local problem this NPC has ever heard of -- nothing told the model that the player had
 * JUST discovered/helped with something TODAY, so a reply like "まあ、助かった" had no real referent
 * to answer. This module derives that missing "what's happening RIGHT NOW, and what just happened"
 * signal purely from existing canonical state (never invented) -- Section 9's explicit
 * "AI hallucinationでThread作成禁止" boundary: everything returned here is a literal, already-authored
 * string this codebase wrote for some other reason (a discover/help/connect/stage result text), never
 * synthesized.
 */
import { LOCAL_PROBLEM_DEFS } from "../content/localProblemDefs";
import { EVENT_THREAD_DEFS } from "../content/eventThreadDefs";
import type { CoreState, NpcId } from "../types";

export interface ActiveEventContext {
  /** Section 7's CURRENT_EVENT -- the canonical "what this is about" line (the discover/setup text),
   *  or `null` if nothing event-shaped is currently open with this NPC. */
  currentEvent: string | null;
  /** Section 7's EVENT_STATE -- a short, plain-language status ("さっき知ったばかりだ" /
   *  "力になろうとしたところだ" / "まだ途中の話だ"), never a numeric progress value. */
  eventState: string | null;
  /** Section 7's WHAT_JUST_HAPPENED -- the literal result text of the most recent structural action
   *  the player took on this event TODAY (or, for an already-open-but-not-touched-today event
   *  thread, its most recent stage's own result text) -- this doubles as Section 7's PLAYER_ACTION
   *  signal, since that result text IS the direct consequence of the player's last structural choice;
   *  a separate raw action-id field was judged redundant given this already carries the same
   *  information in NPC-answerable prose form. */
  whatJustHappened: string | null;
}

const NO_EVENT: ActiveEventContext = { currentEvent: null, eventState: null, whatJustHappened: null };

/**
 * The single most relevant open, NPC-relevant LOCAL PROBLEM or EVENT THREAD, preferring one the
 * player touched TODAY (discovery or progress) over an older, merely-still-open one. At most one
 * result is ever returned (Section 13's "at most one ambient cue" discipline, applied here to prompt
 * context too -- a wall of simultaneous "current events" would be exactly as confusing as none).
 */
export function activeEventContextFor(npc: NpcId, state: CoreState): ActiveEventContext {
  for (const def of LOCAL_PROBLEM_DEFS) {
    if (def.npc !== npc && def.hearsayNpc !== npc && def.connectNpc !== npc) continue;
    const knownDay = state.localProblemsKnown[def.id];
    if (knownDay === undefined) continue;
    const status = state.localProblemStatus[def.id];
    if (status === "resolved" || status === "resolved_without_player") continue; // already wrapped up -- not "current"
    const lastAction = state.localProblemLastPlayerAction[def.id];
    if (knownDay !== state.day && lastAction !== state.day) continue; // not touched today -- stays quiet rather than stale
    const eventState = status === "player_helped" ? "力になろうとしたところだ" : status === "player_connected" ? "他の人に頼んでみたところだ" : "さっき知ったばかりだ";
    const whatJustHappened = (status === "player_helped" ? def.helpResultText : status === "player_connected" ? def.connectResultText : undefined) ?? def.discoverResultText;
    return { currentEvent: def.discoverResultText, eventState, whatJustHappened };
  }

  for (const def of EVENT_THREAD_DEFS) {
    if (def.discoverNpc !== npc) continue;
    const runtime = state.eventThreads[def.id];
    if (!runtime) continue;
    if (runtime.status === "RESOLVED" || runtime.status === "RESOLVED_WITHOUT_PLAYER" || runtime.status === "ABANDONED") continue;
    const whatJustHappened = runtime.stageIndex === 0 ? def.discoverResultText : def.stages[runtime.stageIndex - 1].resultText;
    return { currentEvent: def.discoverResultText, eventState: "まだ途中の話だ", whatJustHappened };
  }

  return NO_EVENT;
}

/** Section 7's RECENT_SHARED_EVENT -- today's `shared_event`-category WorldFacts this NPC actually
 *  knows about, most recent first. Reuses the existing `WorldFact.category` tag (PHASE_12_4) rather
 *  than inventing a second event-classification system. */
export function recentSharedEventsToday(npc: NpcId, state: CoreState): string[] {
  return state.worldFacts
    .filter((f) => f.day === state.day && f.category === "shared_event" && f.knownBy.includes(npc))
    .map((f) => f.text)
    .reverse();
}

/** Section 7's UNRESOLVED_THREAD -- every still-open Event Thread this NPC is the discover-NPC for,
 *  regardless of whether it was touched today (so "その後どう?" stays answerable on a quiet day too),
 *  as its own most-recently-reached line. */
export function unresolvedThreadsKnown(npc: NpcId, state: CoreState): string[] {
  const out: string[] = [];
  for (const def of EVENT_THREAD_DEFS) {
    if (def.discoverNpc !== npc) continue;
    const runtime = state.eventThreads[def.id];
    if (!runtime) continue;
    if (runtime.status === "RESOLVED" || runtime.status === "RESOLVED_WITHOUT_PLAYER" || runtime.status === "ABANDONED") continue;
    out.push(runtime.stageIndex === 0 ? def.discoverResultText : def.stages[runtime.stageIndex - 1].resultText);
  }
  return out;
}

/** Section 7's RECENT_ACTIVITIES -- mirrors `contextBuilder.ts`'s own `recentPurchasesToday` shape
 *  exactly (same day-scoped WorldFact-id-prefix read), for GAMEPLAY ACTIVITY sessions instead of
 *  purchases. */
export function recentActivitiesToday(npc: NpcId, state: CoreState): string[] {
  return state.worldFacts
    .filter((f) => f.day === state.day && f.knownBy.includes(npc) && /_session_d\d+_\d+$/.test(f.id))
    .map((f) => f.text);
}

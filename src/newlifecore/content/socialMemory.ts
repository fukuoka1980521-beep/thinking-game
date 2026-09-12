/**
 * PHASE_12_6_NEW_LIFE_RELATIONSHIP_CONSEQUENCE_AND_SOCIAL_MEMORY_V1 -- categorical PLAYER<->NPC
 * relationship state. Section 2 explicitly requires investigating existing state/Life Material
 * before designing new structures ("既存state / Life Materialを調査して必要最小限で設計") and
 * Section 3 bans any numeric score -- so this module deliberately stores NOTHING new and mutable of
 * its own. Every tag below is a pure function of state the codebase already has to keep anyway
 * (`npcMemory`, `flags`, `worldFacts`, and PHASE_12_6's own `playerPromises`) -- there is no
 * "relationship" struct to keep in sync or decay, which is also how Section 12's "avoid state
 * bloat" concern resolves itself for free: nothing here is stored, so nothing here needs pruning
 * beyond `playerPromises` itself (pruned in engine.ts's `startNewDay`).
 *
 * Directive's own candidate tag list (Section 3) was NOT adopted in full -- see the CLOSE report
 * for the specific omissions (`owes_favor`, a general per-day "absence" tag) and why.
 */
import { npcAvailabilityAt } from "../schedule";
import type { CoreState, NpcId, PlayerPromise } from "../types";

export type PlayerSocialTag = "has_met" | "familiar" | "shared_history" | "pending_promise" | "missed_promise" | "slightly_awkward";

/** Section 6 -- a small, fixed window: meeting the NPC within this many days counts as keeping the
 *  promise. Not configurable per-NPC (over-engineering for a V1 with 7 NPCs) -- long enough that a
 *  normal day's travel plan can reach it, short enough that "kept" still means something. */
const PROMISE_DUE_WINDOW_DAYS = 2;

/** Section 12 -- resolved (kept/missed/declined) promises older than this are pruned at day
 *  transition so `playerPromises` cannot grow unbounded over a long play session. Pending promises
 *  are never pruned by age (they always resolve to kept/missed within PROMISE_DUE_WINDOW_DAYS). */
const RESOLVED_PROMISE_RETENTION_DAYS = 10;

/** Section 4 -- a missed promise only colors the NPC's reaction while it's still recent; past this
 *  many days it no longer counts toward `slightly_awkward` or the consecutive-miss check. This is
 *  how "small events lose importance over time" (Section 12) is achieved for promises specifically,
 *  without a second decay mechanism -- the same field (`resolvedOnDay`) that gates pruning also
 *  gates relevance. */
const MISSED_PROMISE_RELEVANCE_DAYS = 3;

export function promisesWith(npc: NpcId, state: CoreState): PlayerPromise[] {
  return state.playerPromises.filter((p) => p.npc === npc);
}

export function pendingPromiseWith(npc: NpcId, state: CoreState): PlayerPromise | null {
  return promisesWith(npc, state).find((p) => p.status === "pending") ?? null;
}

function recentMissedPromiseWith(npc: NpcId, state: CoreState): PlayerPromise | null {
  return (
    promisesWith(npc, state).find(
      (p) => p.status === "missed" && p.resolvedOnDay !== undefined && state.day - p.resolvedOnDay <= MISSED_PROMISE_RELEVANCE_DAYS,
    ) ?? null
  );
}

/** Section 4's "重要な約束を2回続けて逃した→少し違う反応" -- an internal count used ONLY to gate
 *  that one specific behavior, never displayed, never accumulated as a general-purpose score. Counts
 *  consecutive missed promises with this NPC starting from the most recent promise backward,
 *  stopping at the first non-"missed" one (a kept or declined promise resets the streak). */
export function consecutiveMissedPromises(npc: NpcId, state: CoreState): number {
  const ordered = [...promisesWith(npc, state)]
    .filter((p) => p.status !== "pending")
    .sort((a, b) => (b.resolvedOnDay ?? 0) - (a.resolvedOnDay ?? 0));
  let count = 0;
  for (const p of ordered) {
    if (p.status === "missed") count++;
    else break;
  }
  return count;
}

/** `null` if the player has never met this NPC (has_met false) or has met but they've never
 *  exchanged a single conversation turn (structurally identical to "never met" for this purpose). */
export function daysSinceLastMeeting(npc: NpcId, state: CoreState): number | null {
  const memory = state.npcMemory[npc];
  if (!memory || memory.length === 0) return null;
  const lastDay = memory[memory.length - 1].day;
  return state.day - lastDay;
}

/**
 * Section 3 -- the categorical tag set. Deliberately small and derived, not stored. `has_met` and
 * `familiar` read the exact same underlying facts a numeric "affection meter" would have used, but
 * expose only a coarse boolean, matching the directive's own `quality: RelationshipQuality`
 * precedent (`types.ts`'s `NpcRelationship`) rather than inventing a second scoring style.
 */
export function computePlayerNpcTags(npc: NpcId, state: CoreState): PlayerSocialTag[] {
  const tags: PlayerSocialTag[] = [];
  // Deliberately not an early return on `!hasMet` -- a player can have real, meaningful contact
  // with an NPC (e.g. `flags.shelfFixedWithPlayer`, set by a special action reachable without ever
  // opening a conversation) without the conversation-only `met_${npc}` flag being set. Every OTHER
  // tag below is independently zero/false when there has been no real interaction anyway (empty
  // memory, no promises), so gating the whole function on `has_met` was excluding real signal
  // rather than protecting against noise.
  if (state.flags[`met_${npc}`]) tags.push("has_met");

  const memory = state.npcMemory[npc] ?? [];
  if (memory.length >= 3) tags.push("familiar");

  const kept = promisesWith(npc, state).some((p) => p.status === "kept");
  const helpedTogether = npc === "yohei" || npc === "jin" ? Boolean(state.flags.shelfFixedWithPlayer) : false;
  if (kept || helpedTogether) tags.push("shared_history");

  if (pendingPromiseWith(npc, state)) tags.push("pending_promise");

  const recentMiss = recentMissedPromiseWith(npc, state);
  if (recentMiss) {
    tags.push("missed_promise");
    tags.push("slightly_awkward");
  }

  return tags;
}

// Section 6 -- one authored invite line per NPC, in that NPC's own established speechStyle. A
// small, fixed catalog (not AI-generated) -- matches `RealWorldIntent`'s "never an inferred label"
// discipline extended to the OFFER side, not just the player's own reply.
const INVITE_LABELS: Record<NpcId, string> = {
  kamiya: "また窓口に顔を出してもらえますか。求人の話の続きをしましょう。",
  yohei: "また店に寄ってくれ。新しい仕入れが入るころだ。",
  miyoko: "また来てね。今度、新しい豆を試してみるから。",
  jin: "また顔を出せ。",
  daisuke: "また来てください。",
  hina: "また覗きに来てください。今度は焼きたてをお出しできると思うので。",
  fumiko: "また集会所に寄ってちょうだい。掲示板、少し変わってるはずだから。",
  kiyoshi: "また顔を見せてくれ。",
  shizuko: "また館に寄ってちょうだい。",
};

export function invitationLabelFor(npc: NpcId): string {
  return INVITE_LABELS[npc];
}

/**
 * Section 6/9 -- eligibility for OFFERING a new invitation, checked right after a conversation turn
 * completes (NewlifeCoreApp.tsx). Pure state gates only: never offered to Daisuke or Shizuko
 * (Section 15/PHASE_15 Section 11: kept separate from Reality Bridge, now Shizuko's), never while a
 * promise with this NPC is already pending (no promise spam), never on the very first exchange
 * (`familiar` not required, but SOME prior contact is -- `has_met` plus at least one completed
 * turn), and a simple day-based cooldown since the last promise (any status) with this NPC so
 * invitations don't refire every single conversation.
 */
export function eligibleForNewInvitation(npc: NpcId, state: CoreState): boolean {
  if (npc === "daisuke" || npc === "shizuko") return false;
  if (!state.flags[`met_${npc}`]) return false;
  if (pendingPromiseWith(npc, state)) return false;
  const npcPromises = promisesWith(npc, state);
  if (npcPromises.length > 0) {
    const lastDay = Math.max(...npcPromises.map((p) => p.resolvedOnDay ?? p.createdOnDay));
    if (state.day - lastDay < 4) return false;
  }
  if (npcAvailabilityAt(npc, state.time, state.flags) !== "AVAILABLE") return false;
  return true;
}

export function newPlayerPromise(id: string, npc: NpcId, state: CoreState, label: string): PlayerPromise {
  return { id, npc, createdOnDay: state.day, dueByDay: state.day + PROMISE_DUE_WINDOW_DAYS, label, status: "pending" };
}

/** Section 6/12 -- called once per day transition (engine.ts's `startNewDay`, BEFORE the day
 *  counter itself advances, so `dueByDay < nextDay` reads as "the window has now fully elapsed").
 *  Two independent sweeps: expire overdue pending promises to "missed" (never "failed" -- nothing
 *  reads `status` as a penalty, see `computePlayerNpcTags`), then prune old resolved entries so the
 *  array cannot grow unbounded over a long session. */
export function sweepPlayerPromisesForNewDay(promises: PlayerPromise[], nextDay: number): PlayerPromise[] {
  const expired = promises.map((p) => (p.status === "pending" && p.dueByDay < nextDay ? { ...p, status: "missed" as const, resolvedOnDay: nextDay } : p));
  return expired.filter((p) => p.status === "pending" || p.resolvedOnDay === undefined || nextDay - p.resolvedOnDay <= RESOLVED_PROMISE_RETENTION_DAYS);
}

/** Section 6 -- called from `recordConversationTurn` (engine.ts): meeting the NPC (having any
 *  conversation with them) while a promise from them is still pending and not yet overdue counts as
 *  keeping it. Deliberately not location-visit-only (a real conversation is a stronger signal of
 *  "the player actually returned" than merely walking through the location). */
export function resolvePendingPromiseOnMeet(promises: PlayerPromise[], npc: NpcId, today: number): PlayerPromise[] {
  return promises.map((p) => (p.npc === npc && p.status === "pending" && p.dueByDay >= today ? { ...p, status: "kept" as const, resolvedOnDay: today } : p));
}

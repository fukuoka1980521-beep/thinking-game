/**
 * NEW LIFE CORE REDESIGN V1 -- shared types. This module is deliberately independent of
 * ../research/bounded-generative-world (frozen, PHASE 12.1) and ../newlifev02 / ../newlifev03
 * (superseded, kept only as routes) -- it reuses NPC canon facts (read-only) from canonData.ts
 * where the NPC already exists there, but defines its own richer NPC model, its own dialogue
 * envelope, and its own world/time engine, per this directive's explicit rejection of
 * career-score-driven state ("単純スコアで人生を決めない").
 */

export type LocationId = "TRIAL_HOUSE" | "CHALLENGE_CENTER" | "YOHEI_STORE" | "CAFE_NODOKA" | "COMMUNITY_HALL" | "SHOPPING_STREET";

export type NpcId = "kamiya" | "yohei" | "miyoko" | "jin";

/** Minutes since 00:00. */
export type ClockMinutes = number;

export function formatClock(minutes: ClockMinutes): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** A plain-language fact the world now holds -- never a scored/typed career signal. Optionally
 *  known by specific NPCs (knowledge-boundary + gossip realism); "player" is always implicit. */
export interface WorldFact {
  id: string;
  time: ClockMinutes;
  text: string;
  knownBy: NpcId[];
}

/** One free-text conversation turn, stored verbatim -- memory is the record of what was actually
 *  said, not an AI-generated summary (directive: "数値点数ではなく、出来事/発言記録を優先する"). */
export interface ConversationTurn {
  time: ClockMinutes;
  playerUtterance: string;
  npcReply: string;
}

export type EmploymentStatus = "working" | "not_working" | "other";

/** NEW_LIFE_DAY1_ONBOARDING_AND_WORLD_ACTION_FIX_V1 -- Kamiya's first-meeting intake form,
 *  filled out through real UI (IntakeForm.tsx), not claimed via free text. Stored verbatim, never
 *  scored or classified into a career/personality type (directive Section 5) -- what the player
 *  actually wrote, as a fact of how DAY1 started, nothing more. */
export interface IntakeForm {
  name: string;
  employmentStatus: EmploymentStatus;
  cameHereReason: string;
  currentThoughts: string;
  troubles: string;
}

export interface CoreState {
  started: boolean;
  time: ClockMinutes;
  playerLocation: LocationId;
  visitedLocations: LocationId[];
  worldFacts: WorldFact[];
  npcMemory: Record<NpcId, ConversationTurn[]>;
  npcImpression: Record<NpcId, number>;
  flags: Record<string, boolean>;
  intakeForm: IntakeForm | null;
  ended: boolean;
}

// 08:45 -- chosen so the first, arranged Challenge Center visit (a 15-minute walk) lands right at
// Kamiya's 09:00 opening, never showing "closed" for the one meeting the day is structured around.
export const DAY_START_MINUTES = 8 * 60 + 45;
export const DAY_FORCE_SLEEP_MINUTES = 23 * 60 + 30; // 23:30
export const DAY_SLEEP_AVAILABLE_FROM = 20 * 60; // 20:00, player may choose to sleep

export function createInitialCoreState(): CoreState {
  return {
    started: false,
    time: DAY_START_MINUTES,
    playerLocation: "TRIAL_HOUSE",
    visitedLocations: ["TRIAL_HOUSE"],
    worldFacts: [],
    npcMemory: { kamiya: [], yohei: [], miyoko: [], jin: [] },
    npcImpression: { kamiya: 0, yohei: 0, miyoko: 0, jin: 0 },
    flags: {},
    intakeForm: null,
    ended: false,
  };
}

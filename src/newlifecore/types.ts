/**
 * NEW LIFE CORE REDESIGN V1 -- shared types. This module is deliberately independent of
 * ../research/bounded-generative-world (frozen, PHASE 12.1) and ../newlifev02 / ../newlifev03
 * (superseded, kept only as routes) -- it reuses NPC canon facts (read-only) from canonData.ts
 * where the NPC already exists there, but defines its own richer NPC model, its own dialogue
 * envelope, and its own world/time engine, per this directive's explicit rejection of
 * career-score-driven state ("単純スコアで人生を決めない").
 */

export type LocationId = "TRIAL_HOUSE" | "CHALLENGE_CENTER" | "YOHEI_STORE" | "CAFE_NODOKA" | "COMMUNITY_HALL" | "SHOPPING_STREET" | "BARBERSHOP";

export type NpcId = "kamiya" | "yohei" | "miyoko" | "jin" | "daisuke";

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
 *  said, not an AI-generated summary (directive: "数値点数ではなく、出来事/発言記録を優先する").
 *  `day` (PHASE_12_3) lets the conversation UI show today's exchange live while collapsing earlier
 *  days behind a short summary, instead of an ever-growing single column (directive Section E). */
export interface ConversationTurn {
  day: number;
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

/** NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1 -- an item the player actually owns,
 *  bought through a real, structural purchase action (never inferred from AI conversation text,
 *  directive Section 8). `itemId` keys into content/shop.ts's `SHOP_ITEMS` catalog. */
export type Inventory = Record<string, number>;

/**
 * PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1, Section H -- created ONLY through a real UI
 * confirmation (RealityBridgeOffer, never inferred from free text alone -- directive Section 1's
 * "world/action consistency" principle applies here too: saying "I'll try it" in chat is not the
 * same as the player pressing the button that actually creates this record). `playerStatement` and
 * `intentLabel` are always the player's own words, verbatim -- never an AI-generated summary or
 * diagnosis (Section 7/I: "PLAYER is lazy" style inference is never constructed anywhere in this
 * codebase). Scoped to `npc: "daisuke"` for V1 -- only the Thinking Resident runs this loop.
 */
export type UserUpdateResponse = "did_it" | "did_not" | "partially" | "changed" | "undecided" | "other";

export interface RealWorldIntent {
  id: string;
  npc: NpcId;
  createdOnDay: number;
  createdAt: ClockMinutes;
  /** The player's own free-text turn that read as a real-life concern -- quoted, not paraphrased. */
  playerStatement: string;
  /** The small thing the player chose to try, in their own words. */
  intentLabel: string;
  checkedIn: boolean;
  userUpdate?: {
    day: number;
    response: UserUpdateResponse;
    note: string;
  };
}

export interface CoreState {
  /** PHASE_12_3 -- starts at 1. Only `startNewDay` (engine.ts) advances it; nothing else in this
   *  codebase is allowed to write it directly (mirrors the "only engine.ts mutates CoreState"
   *  discipline already documented at the top of engine.ts). */
  day: number;
  started: boolean;
  time: ClockMinutes;
  playerLocation: LocationId;
  visitedLocations: LocationId[];
  worldFacts: WorldFact[];
  npcMemory: Record<NpcId, ConversationTurn[]>;
  npcImpression: Record<NpcId, number>;
  flags: Record<string, boolean>;
  intakeForm: IntakeForm | null;
  /** Starting cash for the 30-day trial stay -- a modest, ordinary amount (ART/CONTENT DECISION,
   *  not canon-specified), never displayed as a game-score, only as an ordinary yen amount. */
  money: number;
  inventory: Inventory;
  realWorldIntents: RealWorldIntent[];
  /** Section I -- defaults false. Gameplay (including the Reality Bridge loop itself) never checks
   *  this flag; it only gates whether `content/research.ts`'s `deriveResearchObservation` is ever
   *  called from the UI. Opting out changes nothing about how the game plays. */
  researchOptIn: boolean;
  ended: boolean;
}

// 08:45 -- chosen so the first, arranged Challenge Center visit (a 15-minute walk) lands right at
// Kamiya's 09:00 opening, never showing "closed" for the one meeting the day is structured around.
export const DAY_START_MINUTES = 8 * 60 + 45;
export const DAY_FORCE_SLEEP_MINUTES = 23 * 60 + 30; // 23:30
export const DAY_SLEEP_AVAILABLE_FROM = 20 * 60; // 20:00, player may choose to sleep

export function createInitialCoreState(): CoreState {
  return {
    day: 1,
    started: false,
    time: DAY_START_MINUTES,
    playerLocation: "TRIAL_HOUSE",
    visitedLocations: ["TRIAL_HOUSE"],
    worldFacts: [],
    npcMemory: { kamiya: [], yohei: [], miyoko: [], jin: [], daisuke: [] },
    npcImpression: { kamiya: 0, yohei: 0, miyoko: 0, jin: 0, daisuke: 0 },
    flags: {},
    intakeForm: null,
    money: 8000,
    inventory: {},
    realWorldIntents: [],
    researchOptIn: false,
    ended: false,
  };
}

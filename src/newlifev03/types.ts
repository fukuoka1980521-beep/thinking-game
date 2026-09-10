/**
 * NEW LIFE V0.3 -- types for the DAY1-7 refoundation slice. Each day is an authored graph of
 * "beats" keyed by string id (state.beatId drives everything) rather than a fixed N-step
 * pipeline -- days differ in shape (a half-day commitment collapses the rest of the day into
 * fewer beats; a normal day has two location picks plus a free-text beat), so a single generic
 * step enum would not fit. See content/index.ts for the BEATS registry.
 */
import type { LifeMaterial } from "../research/life-material-7day/types";
import type { CareerId } from "./careers";
import type { V03NpcId } from "./npcData";

export type V03LocationId = "YOHEI_STORE" | "CAFE_NODOKA" | "COMMUNITY_HALL" | "CHALLENGE_CENTER";
export type V03ImageKey = "town" | "yohei" | "miyoko" | "jin";
export type V03Day = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface V03Flags {
  metYohei: boolean;
  metMiyoko: boolean;
  metJin: boolean;
  metKamiya: boolean;
  borrowedToolbox: boolean;
  shelfBroken: boolean;
  shelfFixed: boolean;
  jinShadowOffered: boolean;
  jinShadowAccepted: boolean;
  jinShadowDone: boolean;
  miyokoShortHandedKnown: boolean;
  miyokoHelped: boolean;
  emptyShopStage: number; // 0 = unnoticed, increases as the thread progresses
  day5ConnectionOffered: boolean;
  day5ConnectionAccepted: boolean;
}

export const INITIAL_V03_FLAGS: V03Flags = {
  metYohei: false,
  metMiyoko: false,
  metJin: false,
  metKamiya: false,
  borrowedToolbox: false,
  shelfBroken: false,
  shelfFixed: false,
  jinShadowOffered: false,
  jinShadowAccepted: false,
  jinShadowDone: false,
  miyokoShortHandedKnown: false,
  miyokoHelped: false,
  emptyShopStage: 0,
  day5ConnectionOffered: false,
  day5ConnectionAccepted: false,
};

export interface V03State {
  started: boolean;
  day: V03Day;
  beatId: string;
  flags: V03Flags;
  materials: LifeMaterial[];
  careerSignals: Partial<Record<CareerId, number>>;
  npcImpression: Partial<Record<V03NpcId, number>>;
  visitedTodayLocations: V03LocationId[];
  freeTextDoneToday: boolean;
  freeTextTopicsSeen: string[];
  ended: boolean;
}

export function createInitialV03State(): V03State {
  return {
    started: false,
    day: 1,
    beatId: "d1_wake",
    flags: { ...INITIAL_V03_FLAGS },
    materials: [],
    careerSignals: {},
    npcImpression: {},
    visitedTodayLocations: [],
    freeTextDoneToday: false,
    freeTextTopicsSeen: [],
    ended: false,
  };
}

export interface V03Choice {
  id: string;
  label: string;
  resultText?: string;
  next: string;
  applyFlags?: Partial<V03Flags>;
  materialsAdded?: LifeMaterial[];
  resolveMaterialIds?: string[];
  careerSignals?: Partial<Record<CareerId, number>>;
  npcImpressionDelta?: Partial<Record<V03NpcId, number>>;
}

export interface V03Scene {
  kind: "SCENE";
  image: V03ImageKey;
  speaker: V03NpcId | null;
  timeLabel: string;
  lines: string[];
  choices: V03Choice[];
  continueNext?: string;
  continueLabel?: string;
  /** Applied once, automatically, the moment this beat is entered (before any choice) -- used
   *  for passive/witnessed beats (directive "WORLD CONTINUITY": events the player didn't cause). */
  onEnter?: { applyFlags?: Partial<V03Flags>; materialsAdded?: LifeMaterial[] };
}

export interface V03PickScreen {
  kind: "PICK";
  timeLabel: string;
  prompt: string;
  options: { location: V03LocationId; next: string }[];
}

export interface V03FreeTextScene {
  kind: "FREE_TEXT";
  npc: V03NpcId;
  timeLabel: string;
  promptLines: string[];
  next: string;
}

export interface V03WrapScene {
  kind: "WRAP";
}

export type V03Beat = V03Scene | V03PickScreen | V03FreeTextScene | V03WrapScene;

/**
 * NEW LIFE V0.2 -- isolated, authored 3-day living-town loop. Reuses Challenge Town canon
 * (displayName/role only) from ../research/bounded-generative-world/canonData and the existing
 * LifeMaterial schema from ../research/life-material-7day/types -- no new material type is
 * introduced here, and no existing schema is changed.
 */
import type { LifeMaterial } from "../research/life-material-7day/types";

export type V02NpcId = "yohei" | "miyoko" | "jin";
export type V02LocationId = "YOHEI_STORE" | "CAFE_NODOKA" | "COMMUNITY_HALL";
export type V02ImageKey = "town" | V02NpcId;
export type V02Day = 1 | 2 | 3;
export type V02Step = "INTRO" | "PICK" | "NPC_SCENE" | "AFTERNOON" | "EVENING" | "SUMMARY";

export interface V02Flags {
  metYohei: boolean;
  metMiyoko: boolean;
  metJin: boolean;
  borrowedToolbox: boolean;
  usedToolOnShelf: boolean;
  shelfBroken: boolean;
  shelfFixed: boolean;
  seekJinForShelf: boolean;
  promisedFlowerbed: boolean;
  helpedFlowerbed: boolean;
  sawFlowerbedTrace: boolean;
  jinSawTool: boolean;
  noticedNotice: boolean;
}

export const INITIAL_FLAGS: V02Flags = {
  metYohei: false,
  metMiyoko: false,
  metJin: false,
  borrowedToolbox: false,
  usedToolOnShelf: false,
  shelfBroken: false,
  shelfFixed: false,
  seekJinForShelf: false,
  promisedFlowerbed: false,
  helpedFlowerbed: false,
  sawFlowerbedTrace: false,
  jinSawTool: false,
  noticedNotice: false,
};

export interface V02State {
  started: boolean;
  day: V02Day;
  step: V02Step;
  pickedLocation: V02LocationId | null;
  flags: V02Flags;
  materials: LifeMaterial[];
  /** Materials created THIS day (by day-creation index), for the day-summary readout. */
  dayEnded: boolean;
}

export interface SceneChoice {
  id: string;
  label: string;
  resultText: string;
  materialsAdded?: LifeMaterial[];
  resolveMaterialIds?: string[];
  applyFlags?: Partial<V02Flags>;
}

export interface Scene {
  image: V02ImageKey;
  speaker: V02NpcId | null;
  lines: string[];
  choices: SceneChoice[];
  continueLabel?: string;
  /** Applied automatically when a no-choice scene's continue button is pressed. */
  autoApply?: { applyFlags?: Partial<V02Flags>; materialsAdded?: LifeMaterial[] };
}

export function createInitialV02State(): V02State {
  return {
    started: false,
    day: 1,
    step: "INTRO",
    pickedLocation: null,
    flags: { ...INITIAL_FLAGS },
    materials: [],
    dayEnded: false,
  };
}

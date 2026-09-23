/**
 * PHASE 10.21: LIFE MATERIAL runtime types + WORLD_CATALYST_NPC_V1 prototype types.
 *
 * Isolated research module. Reuses PHASE 10.20's `DAY_SKELETON.slice(0,7)` (the shared, frozen
 * WEEK1 macro spec) and PHASE 10.18's State Admission module -- imports nothing from
 * `src/newlife/**`. Both content conditions (A: no Catalyst, B: + Catalyst) share every type here.
 */

import type { NpcId as ParallelNpcId } from "../parallel-14day/types";

export type LifeMaterialType = "OBJECT" | "PLACE_KNOWLEDGE" | "PROMISE" | "PENDING_TASK" | "SHARED_EVENT" | "WORLD_CHANGE";

export type LifeMaterialStatus = "ACTIVE" | "RESOLVED" | "CONSUMED";

/** Every field required by directive Section 3 -- no vague "a discovery happened" ever gets
 *  represented as a LifeMaterial; `concreteContent` must always be a specific, PLAYER-describable
 *  sentence (enforced by test, not merely by convention -- see materialQuality tests). */
export interface LifeMaterial {
  id: string;
  type: LifeMaterialType;
  concreteContent: string;
  origin: string; // e.g. "PLAYER_ACTION:HANDLE_PRACTICAL_NEED:day2" or "WORLD_EVENT:festival_prep:day6"
  dayCreated: number;
  authority: "CANONICAL_FACT" | "PLAYER_CHOSEN_FACT" | "WORLD_EVENT_WITNESSED"; // reuses PHASE 10.18's provenance vocabulary; GENERATED_* classes never apply here since nothing is freely generated in this experiment's engine -- all material comes from structured, deterministic transitions
  status: LifeMaterialStatus;
  knownBy: ("player" | ParallelNpcId | "catalyst")[];
  possibleConsumers: string[]; // ActionId or chain-id hints for what could later reference this
}

export type CatalystKnowledgeBasis = "WITNESSED" | "REPORTED" | "INFERENCE";

export interface CatalystUtterance {
  text: string;
  basis: CatalystKnowledgeBasis;
  /** For REPORTED: the source -- either a named NPC, or a legitimate written source (e.g. "回覧"
   *  the circular notice itself). Required whenever basis is REPORTED (checked by test) -- a
   *  REPORTED claim with no named source would itself be an unbasised claim, exactly what Section 9
   *  forbids. For WITNESSED: implicitly himself, left undefined. For INFERENCE: left undefined
   *  (must be phrased as a guess in `text` itself -- checked by test). */
  reportedBy?: ParallelNpcId | string;
  /** The LifeMaterial id this utterance surfaces/connects -- Catalyst NEVER utters something with
   *  no corresponding pre-existing material (Section 1/6/13: connector, not author). */
  referencesMaterialId: string;
}

export interface CatalystAppearanceLog {
  directAppearances: { day: number; narration: string[]; utterances: CatalystUtterance[] }[];
  indirectEvidence: { day: number; narration: string[] }[];
}

export type ContentCondition = "A_NO_CATALYST" | "B_WITH_CATALYST";

export interface CanonicalState7 {
  day: number;
  materials: LifeMaterial[];
  npcVisitCounts: Partial<Record<ParallelNpcId, number>>;
  catalystLog: CatalystAppearanceLog;
}

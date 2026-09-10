/**
 * PHASE 12.1: Bounded Generative World -- shared types. Client-safe (no credentials, no
 * server-only imports). See docs/research/evaluation/phase-12-0/BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md
 * and docs/research/evaluation/phase-12-0r/*.md for the design this implements.
 */

import type { LifeMaterial } from "../life-material-7day/types";

export type LocationId = "TRIAL_HOUSE" | "SHOPPING_STREET" | "YOHEI_STORE" | "CAFE_NODOKA" | "COMMUNITY_HALL";

/** PHASE 12.0R's corrected active trio (docs/research/evaluation/phase-12-0r/PHASE_12_1_NPC_SELECTION_V1.md). */
export type BgwNpcId = "yohei" | "miyoko" | "jin";

/** Directive Section 10 (PHASE 12.0), collapsed per BOUNDED_FREE_TEXT_CONVERSATION_V1.md to the
 *  minimum 5 classes actually needed for this slice's cast/location set. */
export type Classification = "IN_SCOPE" | "NPC_KNOWLEDGE_GAP" | "NOT_FEASIBLE_NOW" | "OUT_OF_WORLD_SCOPE" | "INSUFFICIENT_CONTEXT";

/** The structured envelope both adapters (deterministic and live) must produce -- LIVE_RESPONSE_
 *  ENVELOPE_SPEC_V1.md's minimum shape, PHASE 12.0R. `visibleUtterance` is display-only and is
 *  NEVER read by any authority decision (continuing PHASE 11.13E's zero-prose-authority finding). */
export interface NpcResponseEnvelope {
  classification: Classification;
  npcResponseIntent: string;
  proposedConsequenceId: string | null;
  visibleUtterance: string;
}

/** One NPC's compact, authored canon extract -- the CURRENT_CANON_INDEX reduced to exactly what
 *  this NPC needs (GENERATIVE_CANON_INPUT_POLICY_V1.md, PHASE 12.0R). Never raw document text;
 *  a human-curated summary sourced from docs/world/NEW_LIFE_CAST_MASTER_V1.md/V2.md. */
export interface NpcCanonExtract {
  id: BgwNpcId;
  displayName: string;
  role: string;
  firsthand: string[];
  heard: string[];
  unknowns: string[];
  wants: string;
  constraints: string;
  speechRegister: string;
  frozenBehavioralRule?: string;
}

/** The full packet sent to either adapter -- WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md's field list,
 *  PHASE 12.0, reduced to this slice's actual needs. */
export interface NpcDialoguePacket {
  npcId: BgwNpcId;
  canon: NpcCanonExtract;
  worldFacts: string[];
  npcCurrentActivity: string;
  npcLocation: LocationId;
  npcRelationshipToPlayer: string;
  currentLocation: LocationId;
  recentRelevantExperience: string[];
  playerUtterance: string;
  allowedClassifications: Classification[];
  allowedConsequenceIds: string[];
}

export interface ExperienceLogEntry {
  day: number;
  npc: BgwNpcId | null;
  playerUtterance: string;
  classification: Classification;
  npcResponseIntent: string;
}

export interface BgwWorldState {
  day: 1;
  playerLocation: LocationId;
  visitedLocations: LocationId[];
  flags: {
    /** True while Yohei has a real, unfinished physical task (canon: Chapter 1 Causal Map Chain 1 /
     *  NEW_LIFE_CAST_MASTER_V2.md Thread 4's stockroom-door job). */
    yoheiTaskActive: boolean;
  };
  /** Jin's canon-established mobility ("wherever a job takes him") -- state-derived presence,
   *  never a fixed assignment. `null` = not currently on a job at any of this slice's locations.
   *  Advances with `worldTick` (see `advanceWorldTick` in worldState.ts) -- Jin's own job moves on
   *  as time/travel passes, independent of whether the PLAYER ever talks to him (directive
   *  Section 10, PHASE 12.1: "at least one NPC activity/location must progress without PLAYER
   *  interaction"). */
  jinJobLocation: LocationId | null;
  /** Advances once per PLAYER travel to a location (any location, not merely NPC-adjacent ones) --
   *  the world's own minimal clock for this slice. Never read by any authority decision itself;
   *  only `jinJobLocation`'s derivation reads it. */
  worldTick: number;
  materials: LifeMaterial[];
  experienceLog: ExperienceLogEntry[];
}

export type BgwAdapter = (packet: NpcDialoguePacket) => Promise<NpcResponseEnvelope>;

/**
 * PHASE 12.2: PURE PRESENTATION coordinates for the visual map. Deliberately kept OUTSIDE
 * `src/research/bounded-generative-world/` (frozen this phase, directive Section 1) -- travel
 * legality, reachability, and every other piece of map LOGIC still comes unchanged from
 * `worldState.ts`/`canonData.ts`'s `TRAVEL_EDGES`/`LOCATIONS`. This file only answers "where does
 * this location's marker sit on the visual canvas," never "can the player go there."
 *
 * Coordinates are normalized (0-1 fractions of the map canvas), matching
 * docs/research/evaluation/phase-12-2/MAP_VISUAL_SYSTEM_V1.md's asset contract -- they scale to
 * whatever final pixel canvas the generated art uses without this file changing.
 */

import type { LocationId } from "../research/bounded-generative-world/types";

export const MAP_NODE_POSITION: Record<LocationId, { x: number; y: number }> = {
  TRIAL_HOUSE: { x: 0.22, y: 0.8 },
  SHOPPING_STREET: { x: 0.5, y: 0.5 },
  YOHEI_STORE: { x: 0.78, y: 0.32 },
  CAFE_NODOKA: { x: 0.24, y: 0.28 },
  COMMUNITY_HALL: { x: 0.78, y: 0.72 },
};

/**
 * PHASE 10.20: NEW LIFE 14-Day Parallel Architecture Experiment — shared types.
 *
 * Isolated research module. Imports nothing from `src/newlife/**`. Both Variant A (Material +
 * Hybrid) and Variant B (Material + Hybrid + Minimal Dynamic State) consume these SAME types and
 * the SAME `sharedSpec.ts` data — the fairness requirement (directive Section 1).
 */

// ---------------------------------------------------------------------------
// Shared top-level PLAYER action IDs (directive Section 11) -- identical for both variants.
// ---------------------------------------------------------------------------
export type ActionId = "VISIT_YOHEI" | "VISIT_CAFE" | "HANDLE_PRACTICAL_NEED" | "EXPLORE" | "REST" | "KEEP_PROMISE" | "PERSONAL_TIME" | "FOLLOW_UP_PENDING";

export type NpcId = "yohei" | "miyoko" | "jin" | "saeki";

// ---------------------------------------------------------------------------
// Hard canonical state -- the ONLY ground truth. Identical shape/semantics for both variants.
// Dynamic State (Variant B only) never writes here directly; it only reads it and influences the
// generation layer above it (directive Section 3/9).
// ---------------------------------------------------------------------------
export interface CanonicalState {
  day: number; // 1-14
  facts: string[]; // append-only, deduplicated -- WORLD_EVENT_OCCURRED / PLAYER_WITNESSED / PLAYER_KNOWS / practical facts, undifferentiated by string alone (see factKind below for the real distinction)
  /** Concrete admitted shared events -- tracked SEPARATELY from any Dynamic familiarity value
   *  (directive Section 17: "Do NOT let the familiarity vector become the source of truth"). */
  sharedHistory: { id: string; day: number; npc: NpcId; description: string }[];
  pendingMatters: string[]; // Bible §7
  softCommitments: string[]; // Bible §7 -- at most one per day in the early game, never manufactured
  npcVisitCounts: Partial<Record<NpcId, number>>;
}

/** Distinguishes WORLD_EVENT_OCCURRED from PLAYER_PRESENT/PLAYER_WITNESSED/PLAYER_KNOWS (Bible §3,
 *  directive Section 3/21) -- these are never conflated. A world-event fact can exist in
 *  `worldEventLog` without ever entering `CanonicalState.facts` (which represents PLAYER_KNOWS). */
export interface WorldEventLogEntry {
  day: number;
  eventId: string;
  description: string;
  witnessedByPlayer: boolean;
}

export interface DayMacroSkeleton {
  day: number;
  week: 1 | 2;
  theme: string;
  /** World events that occur this day REGARDLESS of PLAYER action (directive Section 15) -- logged
   *  to `worldEventLog`, never silently added to PLAYER's own `facts` unless witnessed. */
  worldEvents: string[];
  /** Top-level action IDs legal this day -- SAME list offered by both variants whenever canonically
   *  legal (directive Section 11) -- an NPC's availability may change how an action RESOLVES, never
   *  which actions are OFFERED. */
  availableActions: ActionId[];
  /** True only for DAY11/DAY14 per the frozen skeleton -- gates the Saeki recognition thread. Never
   *  expanded beyond what the shared spec declares (directive Section 21: eligibility is fact/
   *  history-based, fixed by the shared spec, not adjustable per variant). */
  recognitionEligible?: boolean;
}

export interface NpcCanonEntry {
  id: NpcId;
  role: string;
  /** A stable ACTION RULE, not dialogue flavor (directive Section 16) -- e.g. Jin's rule below. */
  personalityRule: string;
  /** The day this NPC first becomes a legal L1 contact (matches Bible §10's L0->L1 upgrade
   *  discipline -- named-NPC-ification is a rare, motivated upgrade, never a default). */
  firstEligibleDay: number;
}

/**
 * PHASE 10.20 Variant B only: Minimal Dynamic State Influence Model.
 *
 * 6 of the allowed maximum 8 dimensions -- kept at 6, not padded to 8, per the same
 * trace-every-dimension-to-a-need discipline used in `DYNAMIC_STATE_INFLUENCE_MODEL_V1.md`.
 * Overlapping NPC dimensions (work_pressure/attention_load/availability) are merged into one
 * `availability` dimension (directive Section 7 explicitly permits merging).
 *
 * NO composite score anywhere in this file (directive Section 8). Every rule is a gated
 * conditional producing a named, categorical BEHAVIORAL PRESSURE -- never a sum, never a
 * float. Dynamic State never writes to CanonicalState (directive Section 9) -- it only reads it
 * and produces pressures the generation layer may use to pick among pre-authored storylet
 * variants (see `storylets.ts`).
 */

import type { ActionId, CanonicalState, NpcId } from "./types";
import type { DayMacroSkeleton } from "./types";

export type Ordinal = "NONE" | "LOW" | "MEDIUM" | "HIGH";

export interface DynamicStateSnapshot {
  day: number;
  playerSocialIntent: Ordinal;
  playerTimePressure: Ordinal;
  npcAvailability: Ordinal; // merged work_pressure + attention_load
  relationshipFamiliarity: Ordinal; // persistent, slow -- see advanceFamiliarity below
  worldCompetingDemands: "NONE" | "PRESENT" | "ACTIVE";
  memoryRecentRelevance: Ordinal;
}

export type BehavioralPressure = "SUPPRESS" | "ALLOW" | "ENCOURAGE" | "REQUIRE";

export interface ConditionalRuleResult {
  socialExchange: BehavioralPressure;
  extendedExchange: BehavioralPressure;
  memoryReference: BehavioralPressure;
  npcEngagesProactively: BehavioralPressure; // gates Jin's stable rule firing (Section 16) -- never alters the rule's CONTENT
}

const ORDINAL_RANK: Record<Ordinal, number> = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3 };
function atLeast(v: Ordinal, floor: Ordinal): boolean {
  return ORDINAL_RANK[v] >= ORDINAL_RANK[floor];
}

/** Builds a fresh snapshot from CANONICAL state + the day's macro skeleton + the chosen action --
 *  momentary dimensions (availability, time pressure, competing demands) are recomputed every day,
 *  never accumulated (directive Section 10: "NPC momentary states... may change quickly because
 *  they are situational"). Only `relationshipFamiliarity` persists across days, via
 *  `advanceFamiliarity` below, and even then moves at most one step per meaningful event. */
export function buildSnapshot(state: CanonicalState, daySkeleton: DayMacroSkeleton, action: ActionId, npc: NpcId, priorFamiliarity: Ordinal): DynamicStateSnapshot {
  const playerSocialIntent: Ordinal = action === "VISIT_YOHEI" || action === "VISIT_CAFE" ? "HIGH" : action === "PERSONAL_TIME" || action === "KEEP_PROMISE" ? "MEDIUM" : "LOW";

  const playerTimePressure: Ordinal = daySkeleton.theme.includes("conflict window") ? "HIGH" : daySkeleton.theme.includes("blank day") ? "NONE" : "LOW";

  // NPC availability: reduced on days whose world events plausibly consume that NPC's attention.
  const busyEvents = daySkeleton.worldEvents.filter((e) => e.includes("prep") || e.includes("restock") || e.includes("delivery"));
  const npcAvailability: Ordinal = busyEvents.length > 0 && (npc === "yohei" || npc === "jin") ? "MEDIUM" : "HIGH";

  const worldCompetingDemands: DynamicStateSnapshot["worldCompetingDemands"] = daySkeleton.worldEvents.some((e) => e.includes("restock") || e.includes("delivery")) ? "ACTIVE" : daySkeleton.worldEvents.length > 0 ? "PRESENT" : "NONE";

  const relevantHistory = state.sharedHistory.filter((h) => h.npc === npc);
  const memoryRecentRelevance: Ordinal = relevantHistory.length === 0 ? "NONE" : state.day - relevantHistory[relevantHistory.length - 1].day <= 3 ? "HIGH" : relevantHistory.length > 0 ? "LOW" : "NONE";

  return {
    day: state.day,
    playerSocialIntent,
    playerTimePressure,
    npcAvailability,
    relationshipFamiliarity: priorFamiliarity,
    worldCompetingDemands,
    memoryRecentRelevance,
  };
}

/**
 * Conditional/gated rules (directive Section 8) -- deliberately NOT a composite score. Each branch
 * is independently named and traceable to one of the directive's own worked examples.
 */
export function evaluateConditionalRules(s: DynamicStateSnapshot): ConditionalRuleResult {
  // R1 / R2 -- directive Section 8's own two contrasting examples.
  let socialExchange: BehavioralPressure = "ALLOW";
  let extendedExchange: BehavioralPressure = "ALLOW";
  if (s.playerSocialIntent === "HIGH" && atLeast(s.npcAvailability, "MEDIUM") && s.worldCompetingDemands === "NONE") {
    socialExchange = "ENCOURAGE";
    extendedExchange = "ENCOURAGE";
  } else if (s.playerSocialIntent === "HIGH" && s.worldCompetingDemands === "ACTIVE") {
    socialExchange = "ALLOW";
    extendedExchange = "SUPPRESS";
  }

  // R3 -- memory reference only encouraged when both relevance and familiarity clear a floor;
  // never invented if either is NONE (directive Section 9: cannot invent prior events).
  const memoryReference: BehavioralPressure = atLeast(s.memoryRecentRelevance, "LOW") && atLeast(s.relationshipFamiliarity, "LOW") ? "ENCOURAGE" : "SUPPRESS";

  // R4 -- gates WHETHER an NPC with a proactive personality rule (Jin) engages right now; never
  // changes the rule's content (directive Section 16).
  const npcEngagesProactively: BehavioralPressure = atLeast(s.npcAvailability, "MEDIUM") ? "ALLOW" : "SUPPRESS";

  return { socialExchange, extendedExchange, memoryReference, npcEngagesProactively };
}

/**
 * Conservative relationship transition (directive Section 10): at most one ordinal step per visit;
 * a missed/absent interaction never reduces it.
 *
 * Two distinct triggers, not one, matching `NEW_LIFE_SCENARIO_BIBLE_V1.md` §10's own definition:
 * NONE -> LOW is L1-CONTACT FORMATION ("PLAYER has had one concrete, small, real interaction...
 * This is what Yohei/Miyoko become on FIRST MEETING" -- any real visit, not specifically a warm
 * one). LOW -> MEDIUM -> HIGH requires a genuinely meaningful (non-transaction-only) exchange, never
 * advancing merely because a visit occurred. Caught and fixed during this phase's own verification
 * run: gating the FIRST step on "meaningful exchange" made it mathematically impossible to ever
 * reach LOW at all, because the only templates flagged as meaningful were themselves only reachable
 * once familiarity was already >= LOW.
 */
export function advanceFamiliarity(prior: Ordinal, hadAnyVisit: boolean, hadMeaningfulExchangeThisVisit: boolean): Ordinal {
  if (prior === "NONE") return hadAnyVisit ? "LOW" : "NONE";
  if (!hadMeaningfulExchangeThisVisit) return prior;
  const order: Ordinal[] = ["NONE", "LOW", "MEDIUM", "HIGH"];
  const idx = order.indexOf(prior);
  return order[Math.min(idx + 1, order.length - 1)];
}

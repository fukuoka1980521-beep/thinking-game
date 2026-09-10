/**
 * PHASE 12.1: world state -- initial state, state-derived NPC presence/activity (never menu-
 * derived, per BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md section 9), and the authored allowed-
 * transitions registry (deterministic State Admission, section 5/14).
 */

import { admitMaterials, mergeMaterials } from "../action-contract-v2/engine";
import type { LifeMaterial } from "../life-material-7day/types";
import type { BgwNpcId, BgwWorldState, LocationId } from "./types";

export function createInitialBgwState(): BgwWorldState {
  return {
    day: 1,
    playerLocation: "TRIAL_HOUSE",
    visitedLocations: ["TRIAL_HOUSE"],
    flags: { yoheiTaskActive: true },
    jinJobLocation: "YOHEI_STORE",
    worldTick: 0,
    materials: [],
    experienceLog: [],
  };
}

/** Directive Section 10 (PHASE 12.1): Jin's own job progresses as the world clock advances,
 *  regardless of whether the PLAYER ever talks to him -- his canon ("moves between odd jobs
 *  across town; no single fixed place of business") is what makes this legitimate rather than
 *  arbitrary. Pure function of the tick, never of PLAYER conversation history. */
export function jinJobLocationForTick(tick: number): LocationId | null {
  if (tick <= 2) return "YOHEI_STORE"; // finishing the stockroom-door repair
  if (tick <= 4) return "CAFE_NODOKA"; // moves on to Miyoko's chair repair
  return null; // today's jobs are done; not reachable at any of this slice's locations
}

/** Called on every PLAYER travel (any destination) -- the world's own minimal clock ticking
 *  forward independent of which NPC, if any, the PLAYER actually talks to. */
export function advanceWorldTick(state: BgwWorldState): BgwWorldState {
  const worldTick = state.worldTick + 1;
  return { ...state, worldTick, jinJobLocation: jinJobLocationForTick(worldTick) };
}

/** Directive Section 8 (PHASE 12.0)'s AI-necessity experiment states, restated as a pure function
 *  of world state -- never derived from "which button was clicked." STATE A/B/C are produced by
 *  varying `flags.yoheiTaskActive` and `jinJobLocation`, not by three separately-authored scenes. */
export function yoheiCurrentActivity(state: BgwWorldState): string {
  if (hasActiveMaterial(state, "yohei_help_promise")) {
    return "洋平は、プレイヤーと一緒に倉庫の在庫を運んでいる。";
  }
  if (!state.flags.yoheiTaskActive) return "洋平は、いつも通り店番をしている。";
  if (state.jinJobLocation === "YOHEI_STORE") {
    return "洋平は、詰まった倉庫の扉の修理を相馬に頼んでいるところだ。相馬が作業をしている。";
  }
  return "洋平は、倉庫の在庫を一人で運ぼうとしている。";
}

export function miyokoCurrentActivity(state: BgwWorldState): string {
  if (state.jinJobLocation === "CAFE_NODOKA") {
    return "美代子は、椅子の修理を相馬に頼んでいるところだ。";
  }
  return "美代子は、いつも通り店を開けている。";
}

/** Jin's canon-established mobility -- present only where a job currently is (MAP_CANON_RECHECK_V1.md). */
export function jinPresentAt(state: BgwWorldState, location: LocationId): boolean {
  return state.jinJobLocation === location;
}

export function npcsPresentAt(state: BgwWorldState, location: LocationId): BgwNpcId[] {
  const present: BgwNpcId[] = [];
  if (location === "YOHEI_STORE") present.push("yohei");
  if (location === "CAFE_NODOKA") present.push("miyoko");
  if (jinPresentAt(state, location)) present.push("jin");
  return present;
}

/** Authored allowed transitions (directive Section 14/20, PHASE 12.0) -- the ONLY way a
 *  `proposedConsequenceId` can ever result in a real committed LifeMaterial. An id not in this
 *  registry commits nothing, regardless of what any adapter proposes (fail-closed). */
export const ALLOWED_CONSEQUENCES: Record<string, (state: BgwWorldState) => LifeMaterial> = {
  YOHEI_HELP_PROMISE: (state) => ({
    id: "yohei_help_promise",
    type: "PROMISE",
    concreteContent: "洋平の倉庫の在庫運びを手伝うと申し出て、洋平がそれを受け入れた",
    origin: "PLAYER_ACTION:OFFER_HELP:YOHEI_STORE",
    dayCreated: state.day,
    authority: "PLAYER_CHOSEN_FACT",
    status: "ACTIVE",
    knownBy: ["player", "yohei"],
    possibleConsumers: [],
  }),
};

export function commitConsequence(state: BgwWorldState, consequenceId: string): BgwWorldState {
  const factory = ALLOWED_CONSEQUENCES[consequenceId];
  if (!factory) return state; // unregistered id -- fail closed, nothing committed
  const material = factory(state);
  const { admitted } = admitMaterials(`BGW_NPC_RESPONSE:${consequenceId}`, [material]);
  return { ...state, materials: mergeMaterials(state.materials, admitted) };
}

export function hasActiveMaterial(state: BgwWorldState, id: string): boolean {
  return state.materials.some((m) => m.id === id && m.status === "ACTIVE");
}

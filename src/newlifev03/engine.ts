import type { LifeMaterial } from "../research/life-material-7day/types";
import type { CareerId } from "./careers";
import type { FreeTextTopic } from "./freeTextAi";
import type { V03NpcId } from "./npcData";
import type { V03Choice, V03Day, V03LocationId, V03State } from "./types";

function addMaterials(existing: LifeMaterial[], added: LifeMaterial[] | undefined, resolveIds: string[] | undefined): LifeMaterial[] {
  let next = existing;
  if (resolveIds?.length) next = next.map((m) => (resolveIds.includes(m.id) ? { ...m, status: "RESOLVED" as const } : m));
  if (added?.length) {
    const addedIds = new Set(added.map((m) => m.id));
    next = [...next.filter((m) => !addedIds.has(m.id)), ...added];
  }
  return next;
}

function addSignals(existing: Partial<Record<CareerId, number>>, delta: Partial<Record<CareerId, number>> | undefined): Partial<Record<CareerId, number>> {
  if (!delta) return existing;
  const next = { ...existing };
  for (const [k, v] of Object.entries(delta) as [CareerId, number][]) {
    next[k] = (next[k] ?? 0) + v;
  }
  return next;
}

function addImpression(existing: Partial<Record<V03NpcId, number>>, delta: Partial<Record<V03NpcId, number>> | undefined): Partial<Record<V03NpcId, number>> {
  if (!delta) return existing;
  const next = { ...existing };
  for (const [k, v] of Object.entries(delta) as [V03NpcId, number][]) {
    next[k] = (next[k] ?? 0) + v;
  }
  return next;
}

export function applyChoice(state: V03State, choice: V03Choice): V03State {
  return {
    ...state,
    beatId: choice.next,
    flags: { ...state.flags, ...(choice.applyFlags ?? {}) },
    materials: addMaterials(state.materials, choice.materialsAdded, choice.resolveMaterialIds),
    careerSignals: addSignals(state.careerSignals, choice.careerSignals),
    npcImpression: addImpression(state.npcImpression, choice.npcImpressionDelta),
  };
}

export function applyOnEnter(state: V03State, onEnter: { applyFlags?: Partial<V03State["flags"]>; materialsAdded?: LifeMaterial[] } | undefined): V03State {
  if (!onEnter) return state;
  return {
    ...state,
    flags: { ...state.flags, ...(onEnter.applyFlags ?? {}) },
    materials: addMaterials(state.materials, onEnter.materialsAdded, undefined),
  };
}

export function visitLocation(state: V03State, location: V03LocationId, next: string): V03State {
  return {
    ...state,
    beatId: next,
    visitedTodayLocations: state.visitedTodayLocations.includes(location) ? state.visitedTodayLocations : [...state.visitedTodayLocations, location],
  };
}

/** Deterministic classification of the PLAYER's own text feeds career signals -- the generated
 *  reply text itself never does (directive: "AI出力によってゲームstateを直接確定しない"). */
const TOPIC_SIGNALS: Partial<Record<FreeTextTopic, Partial<Record<CareerId, number>>>> = {
  AI_INTEREST: { AI_DEVELOPER: 1, SME_AI_DX_SUPPORT: 1 },
  REPAIR_INTEREST: { FACILITY_REPAIR: 1, REPAIR_BUSINESS_INDEPENDENT: 1, HANDYMAN_INDEPENDENT: 1 },
  SHOP_INTEREST: { RETAIL_SHOP: 1, SMALL_SHOP_OWNER: 1 },
  REST_INTEREST: {},
  UNSURE: { PART_TIME_UNDECIDED: 1 },
  OTHER: {},
};

export function applyFreeText(state: V03State, npc: V03NpcId, topic: FreeTextTopic, next: string): V03State {
  return {
    ...state,
    beatId: next,
    freeTextDoneToday: true,
    freeTextTopicsSeen: [...state.freeTextTopicsSeen, topic],
    careerSignals: addSignals(state.careerSignals, TOPIC_SIGNALS[topic]),
    npcImpression: addImpression(state.npcImpression, { [npc]: 1 } as Partial<Record<V03NpcId, number>>),
  };
}

export function topCareerSignals(state: V03State, n: number): CareerId[] {
  return (Object.entries(state.careerSignals) as [CareerId, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

export function materialsCreatedOnDay(state: V03State, day: V03Day): LifeMaterial[] {
  return state.materials.filter((m) => m.dayCreated === day);
}

const PRIORITY: LifeMaterial["type"][] = ["PROMISE", "PENDING_TASK", "OBJECT", "WORLD_CHANGE", "PLACE_KNOWLEDGE", "SHARED_EVENT"];

/** Directive "DAY-END": no internal type names, no lessons -- just what happened, what's next,
 *  what's still unresolved. All three are plain natural-language sentences already stored as
 *  `concreteContent`. */
export function daySummaryBundle(state: V03State): { today: string[]; tomorrow: string[]; curious: string[] } {
  const todayMaterials = materialsCreatedOnDay(state, state.day);
  const today = [...todayMaterials].sort((a, b) => PRIORITY.indexOf(a.type) - PRIORITY.indexOf(b.type)).slice(0, 3).map((m) => m.concreteContent);

  const openCommitments = state.materials.filter((m) => (m.type === "PROMISE" || m.type === "PENDING_TASK") && m.status === "ACTIVE");
  const tomorrow = openCommitments.slice(-2).map((m) => m.concreteContent);

  const shown = new Set([...today, ...tomorrow]);
  const curiousPool = state.materials.filter((m) => (m.type === "WORLD_CHANGE" || m.type === "PLACE_KNOWLEDGE") && m.status === "ACTIVE" && !shown.has(m.concreteContent));
  const curious = curiousPool.slice(-2).map((m) => m.concreteContent);

  return { today, tomorrow, curious };
}

export function startNextDay(state: V03State): V03State {
  if (state.day >= 7) return { ...state, ended: true };
  const nextDay = (state.day + 1) as V03Day;
  return { ...state, day: nextDay, beatId: `d${nextDay}_wake`, visitedTodayLocations: [], freeTextDoneToday: false };
}

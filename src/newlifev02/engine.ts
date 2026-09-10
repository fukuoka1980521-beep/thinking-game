import type { LifeMaterial } from "../research/life-material-7day/types";
import type { SceneChoice, V02Day, V02State } from "./types";

function addMaterials(existing: LifeMaterial[], added: LifeMaterial[] | undefined, resolveIds: string[] | undefined): LifeMaterial[] {
  let next = existing;
  if (resolveIds && resolveIds.length) {
    next = next.map((m) => (resolveIds.includes(m.id) ? { ...m, status: "RESOLVED" as const } : m));
  }
  if (added && added.length) {
    const addedIds = new Set(added.map((m) => m.id));
    next = [...next.filter((m) => !addedIds.has(m.id)), ...added];
  }
  return next;
}

export function applyChoice(state: V02State, choice: SceneChoice): V02State {
  return {
    ...state,
    flags: { ...state.flags, ...(choice.applyFlags ?? {}) },
    materials: addMaterials(state.materials, choice.materialsAdded, choice.resolveMaterialIds),
  };
}

export function applyAutoEffect(state: V02State, autoApply: { applyFlags?: Partial<V02State["flags"]>; materialsAdded?: LifeMaterial[] } | undefined): V02State {
  if (!autoApply) return state;
  return {
    ...state,
    flags: { ...state.flags, ...(autoApply.applyFlags ?? {}) },
    materials: addMaterials(state.materials, autoApply.materialsAdded, undefined),
  };
}

export function materialsCreatedOnDay(state: V02State, day: V02Day): LifeMaterial[] {
  return state.materials.filter((m) => m.dayCreated === day);
}

export function startNextDay(state: V02State): V02State {
  const nextDay = (state.day + 1) as V02Day;
  return { ...state, day: nextDay, step: "INTRO", pickedLocation: null, dayEnded: false };
}

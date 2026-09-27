import type { NewLife30State, NpcId } from "./types";

export type FreeActionId = "press_miyoko_for_boundary";

function normalized(text: string): string { return text.replace(/\s+/g, ""); }

/** Recognizes only explicit player-owned procedural actions; never NPC consent or permission. */
export function resolveFreeAction(state: NewLife30State, npc: NpcId, text: string): FreeActionId | null {
  const t = normalized(text);
  if (!t) return null;
  if (state.day === 9 && npc === "miyoko" && (/(\u5e2d|\u7bc4\u56f2).*(\u78ba\u8a8d|\u6c7a\u3081|\u306f\u3063\u304d\u308a)/.test(t) || /\u78ba\u8a8d.*(\u5e2d|\u7bc4\u56f2)/.test(t))) return "press_miyoko_for_boundary";
  return null;
}


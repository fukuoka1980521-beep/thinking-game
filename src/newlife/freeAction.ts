import type { NewLife30State, NpcId } from "./types";

export type FreeActionId = "press_miyoko_for_boundary" | "suggest_time_split" | "broker_direct_fact_check";

function normalized(text: string): string { return text.replace(/\s+/g, ""); }

/** Recognizes only explicit player-owned procedural actions; never NPC consent or permission. */
export function resolveFreeAction(state: NewLife30State, npc: NpcId, text: string): FreeActionId | null {
  const t = normalized(text);
  if (!t) return null;
  if (state.day === 9 && npc === "miyoko" && (/(\u5e2d|\u7bc4\u56f2).*(\u78ba\u8a8d|\u6c7a\u3081|\u306f\u3063\u304d\u308a)/.test(t) || /\u78ba\u8a8d.*(\u5e2d|\u7bc4\u56f2)/.test(t))) return "press_miyoko_for_boundary";
  if (state.day === 10 && (/(\u53d7\u3051\u6e21\u3057|\u53d7\u53d6|\u53d7\u3051\u53d6\u308a|\u6642\u9593).*(\u5206\u3051|\u305a\u3089|\u5206\u62c5)/.test(t) || /\u6642\u9593.*(\u5206\u3051|\u305a\u3089)/.test(t))) return "suggest_time_split";
  if (state.day === 14 && (/(\u4e8c\u4eba|2\u4eba|\u967d\u83dc.*\u6d0b\u5e73|\u6d0b\u5e73.*\u967d\u83dc).*(\u76f4\u63a5|\u4e00\u7dd2).*(\u78ba\u8a8d|\u8a71|\u7167\u5408)/.test(t) || /\u76f4\u63a5.*(\u78ba\u8a8d|\u8a71|\u7167\u5408)/.test(t))) return "broker_direct_fact_check";
  return null;
}


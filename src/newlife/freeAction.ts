import type { NewLife30State, NpcId } from "./types";

export type FreeActionId = "press_miyoko_for_boundary";

function normalized(text: string): string { return text.replace(/\s+/g, ""); }

/**
 * Legacy/offline fallback only.
 *
 * Normal consented conversation must not pass through this phrase router
 * before generation. Chat-first play uses conversationEffectGate.ts after
 * semantic generation. Keep this narrow for no-consent/offline continuity;
 * do not grow it one transcript/regex at a time.
 */
export function resolveFreeAction(state: NewLife30State, npc: NpcId, text: string): FreeActionId | null {
  const t = normalized(text);
  if (!t) return null;
  if (state.day === 9 && npc === "miyoko" && (/(\u5e2d|\u7bc4\u56f2).*(\u78ba\u8a8d|\u6c7a\u3081|\u306f\u3063\u304d\u308a)/.test(t) || /\u78ba\u8a8d.*(\u5e2d|\u7bc4\u56f2)/.test(t))) return "press_miyoko_for_boundary";
  return null;
}


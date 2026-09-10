/**
 * Fail-closed validation, mirroring ../../research/bounded-generative-world/envelope.ts's proven
 * discipline (never trust raw adapter output; a structurally-invalid or empty reply degrades to a
 * bounded, in-character fallback line, never a raw error to the player -- directive Section 30).
 */
import type { NpcAiContext, NpcReplyEnvelope } from "./types";

const FALLBACK_BY_NPC: Record<string, string> = {
  kamiya: "神谷はメモを取る手を止めて、少し考えた。「……すみません、今のはうまく飲み込めなかったです」",
  yohei: "洋平は少し首をかしげた。「悪い、もう一回言ってくれるか」",
  miyoko: "美代子は手を止めて、こちらを見た。「ごめんなさい、聞き取れなかったわ」",
  jin: "相馬は軽く眉を上げた。「悪い、もう一回」",
};

export function validateNpcReply(raw: Partial<NpcReplyEnvelope> | null | undefined, context: NpcAiContext): NpcReplyEnvelope {
  const fallback = FALLBACK_BY_NPC[context.npcId] ?? "……。";
  if (!raw || typeof raw !== "object") return { visibleUtterance: fallback };
  const utterance = typeof raw.visibleUtterance === "string" ? raw.visibleUtterance.trim() : "";
  return { visibleUtterance: utterance.length > 0 ? utterance : fallback };
}

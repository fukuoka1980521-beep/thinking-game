import type { NpcId } from "./types";
import { postDialogueJson } from "./semantic/httpInterpreter";

export const REFOUNDATION_ENDPOINT = "https://newlife-refoundation-ai-zqtk74q2ra-an.a.run.app";

const CASE_ID = "NEWLIFE_30DAY_V1";
const API_NPC: Record<NpcId, string> = {
  hina: "HINA", yohei: "YOHEI", daisuke: "DAISUKE", jin: "JIN", miyoko: "MIYOKO", fumiko: "FUMIKO",
};
const DISPLAY_TO_API: Record<string, string> = {
  "\u967d\u83dc": "HINA", "\u6d0b\u5e73": "YOHEI", "\u5927\u8f14": "DAISUKE", "\u4ec1": "JIN",
  "\u7f8e\u4ee3\u5b50": "MIYOKO", "\u6587\u5b50": "FUMIKO", "\u3042\u306a\u305f": "PLAYER",
};

export interface DialogueLine { speaker: string; text: string }
export interface RefoundationReply { text: string; nextNpc: NpcId | null; nextText: string | null }

function localNpc(api: unknown): NpcId | null {
  if (typeof api !== "string") return null;
  const e = Object.entries(API_NPC).find(([, v]) => v === api);
  return e ? e[0] as NpcId : null;
}
async function post(body: unknown): Promise<any> {
  const result = await postDialogueJson(REFOUNDATION_ENDPOINT, body, 45_000);
  if (!result.ok) throw new Error("refoundation_" + result.status);
  return result.data;
}
export interface LiveSceneContext {
  day: number;
  title: string;
  text: string;
  canonicalState: Record<string, unknown>;
}
export function supportsRefoundation(npc: NpcId): boolean {
  return Boolean(API_NPC[npc]);
}
export async function converseWithRefoundation(
  npc: NpcId, utterance: string, transcript: DialogueLine[], scene: LiveSceneContext,
): Promise<RefoundationReply> {
  const caseId = CASE_ID, targetNpc = API_NPC[npc];
  const recentDialogue = transcript.slice(-8).map((line) => ({
    speaker: DISPLAY_TO_API[line.speaker] ?? "SYSTEM", text: line.text,
  }));
  const dynamicState = {
    relationshipState: "NEUTRAL", boundaryStatus: "UNKNOWN", remainingMinutes: 30,
    activeCommitment: null, sceneRevisionText: null,
    day: scene.day, sceneTitle: scene.title, sceneText: scene.text, canonicalState: scene.canonicalState,
  };
  const first = await post({ operation: "converse_turn", caseId, targetNpc, rawPlayerUtterance: utterance, recentDialogue, dynamicState });
  if (!first || first.npc !== targetNpc || typeof first.npcLine !== "string" || !first.npcLine.trim()) throw new Error("invalid_refoundation_reply");

  const nextLocal = localNpc(first.nextNpc);
  if (first.sceneStatus !== "NPC_EXCHANGE" || !nextLocal) {
    return { text: first.npcLine.trim(), nextNpc: null, nextText: null };
  }
  const continuedDialogue = [...recentDialogue, { speaker: "PLAYER", text: utterance }, { speaker: targetNpc, text: first.npcLine }];
  const second = await post({ operation: "continue_npc_exchange", caseId, targetNpc: first.nextNpc, recentDialogue: continuedDialogue.slice(-8), continuationDepth: 1, dynamicState });
  return { text: first.npcLine.trim(), nextNpc: nextLocal, nextText: second && typeof second.npcLine === "string" ? second.npcLine.trim() : null };
}

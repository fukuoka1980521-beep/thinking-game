import type { NpcId, SceneFocus } from "./types";
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
export interface RefoundationContinuation { npc: NpcId; text: string }
export type RefoundationUncertainty = "LOW" | "MEDIUM" | "HIGH";
export interface RefoundationCandidateTurn {
  action: string;
  boundaryMode: string;
  relationalEvents: string[];
  needsClarification: boolean;
}
export interface RefoundationReply {
  text: string;
  continuations: RefoundationContinuation[];
  nextNpc: NpcId | null;
  nextText: string | null;
  understoodPlayerMeaning: string;
  candidateTurn: RefoundationCandidateTurn;
  candidateFactRevealIds: string[];
  candidateCommitments: string[];
  candidateWorldEffects: string[];
  uncertainty: RefoundationUncertainty;
}

function localNpc(api: unknown): NpcId | null {
  if (typeof api !== "string") return null;
  const e = Object.entries(API_NPC).find(([, v]) => v === api);
  return e ? e[0] as NpcId : null;
}
const RETRYABLE_STATUSES = new Set([0, 429, 502, 503, 504]);
const RETRY_DELAYS_MS = [500, 1400];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function post(body: unknown): Promise<any> {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    const result = await postDialogueJson(REFOUNDATION_ENDPOINT, body, 45_000);
    if (result.ok) return result.data;
    if (!RETRYABLE_STATUSES.has(result.status) || attempt === RETRY_DELAYS_MS.length) {
      throw new Error("refoundation_" + (result.status || result.reason || "unavailable"));
    }
    await wait(RETRY_DELAYS_MS[attempt]);
  }
  throw new Error("refoundation_unavailable");
}
export interface LiveSceneContext {
  day: number;
  title: string;
  text: string;
  sceneFocus?: SceneFocus;
  canonicalState: Record<string, unknown>;
  interactionKind?: "SPEECH" | "ACTION";
}
export function supportsRefoundation(npc: NpcId): boolean {
  return Boolean(API_NPC[npc]);
}
export async function converseWithRefoundation(
  npc: NpcId, utterance: string, transcript: DialogueLine[], scene: LiveSceneContext,
): Promise<RefoundationReply> {
  const caseId = CASE_ID, targetNpc = API_NPC[npc];
  const recentDialogue = transcript.slice(-12).map((line) => ({
    speaker: DISPLAY_TO_API[line.speaker] ?? "SYSTEM", text: line.text,
  }));
  const dynamicState = {
    relationshipState: "NEUTRAL", boundaryStatus: "UNKNOWN", remainingMinutes: 30,
    activeCommitment: null, sceneRevisionText: null,
    day: scene.day, sceneTitle: scene.title, sceneText: scene.text, sceneFocus: scene.sceneFocus ?? null, canonicalState: scene.canonicalState,
    interactionKind: scene.interactionKind ?? "SPEECH",
  };
  const first = await post({ operation: "converse_turn", caseId, targetNpc, rawPlayerUtterance: utterance, recentDialogue, dynamicState });
  if (!first || first.npc !== targetNpc || typeof first.npcLine !== "string" || !first.npcLine.trim()) throw new Error("invalid_refoundation_reply");

  const continuations: RefoundationContinuation[] = [];
  let current = first;
  let continuedDialogue = [...recentDialogue, { speaker: "PLAYER", text: utterance }, { speaker: targetNpc, text: first.npcLine }];

  for (let depth = 1; depth <= 3; depth += 1) {
    const nextLocal = localNpc(current.nextNpc);
    if (current.sceneStatus !== "NPC_EXCHANGE" || !nextLocal) break;
    const nextApi = current.nextNpc;
    const next = await post({
      operation: "continue_npc_exchange",
      caseId,
      targetNpc: nextApi,
      recentDialogue: continuedDialogue.slice(-12),
      continuationDepth: depth,
      dynamicState,
    });
    if (!next || next.npc !== nextApi || typeof next.npcLine !== "string" || !next.npcLine.trim()) break;
    const text = next.npcLine.trim();
    continuations.push({ npc: nextLocal, text });
    continuedDialogue = [...continuedDialogue, { speaker: nextApi, text }].slice(-12);
    current = next;
  }

  const candidateTurn: RefoundationCandidateTurn =
    first.candidateTurn && typeof first.candidateTurn === "object"
      ? {
          action: typeof first.candidateTurn.action === "string" ? first.candidateTurn.action : "CLARIFY",
          boundaryMode: typeof first.candidateTurn.boundaryMode === "string" ? first.candidateTurn.boundaryMode : "UNKNOWN",
          relationalEvents: Array.isArray(first.candidateTurn.relationalEvents)
            ? first.candidateTurn.relationalEvents.filter((v: unknown): v is string => typeof v === "string")
            : [],
          needsClarification: first.candidateTurn.needsClarification === true,
        }
      : { action: "CLARIFY", boundaryMode: "UNKNOWN", relationalEvents: [], needsClarification: true };

  const uncertainty: RefoundationUncertainty =
    first.uncertainty === "LOW" || first.uncertainty === "MEDIUM" || first.uncertainty === "HIGH"
      ? first.uncertainty
      : "HIGH";

  return {
    text: first.npcLine.trim(),
    continuations,
    nextNpc: continuations[0]?.npc ?? null,
    nextText: continuations[0]?.text ?? null,
    understoodPlayerMeaning:
      typeof first.understoodPlayerMeaning === "string" ? first.understoodPlayerMeaning : "",
    candidateTurn,
    candidateFactRevealIds: Array.isArray(first.candidateFactRevealIds)
      ? first.candidateFactRevealIds.filter((v: unknown): v is string => typeof v === "string")
      : [],
    candidateCommitments: Array.isArray(first.candidateCommitments)
      ? first.candidateCommitments.filter((v: unknown): v is string => typeof v === "string")
      : [],
    candidateWorldEffects: Array.isArray(first.candidateWorldEffects)
      ? first.candidateWorldEffects.filter((v: unknown): v is string => typeof v === "string")
      : [],
    uncertainty,
  };
}

/**
 * PHASE 12.1: hard structural validation -- WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md's required
 * stage, LIVE_RESPONSE_ENVELOPE_SPEC_V1.md's minimum envelope. Runs identically on output from
 * EITHER adapter (deterministic or live) -- neither is ever trusted without this step. Fail-closed:
 * anything that doesn't validate is coerced to INSUFFICIENT_CONTEXT / no consequence, never passed
 * through as-is and never thrown as an uncaught error to the player.
 */

import type { Classification, NpcDialoguePacket, NpcResponseEnvelope } from "./types";

const VALID_CLASSIFICATIONS: Classification[] = ["IN_SCOPE", "NPC_KNOWLEDGE_GAP", "NOT_FEASIBLE_NOW", "OUT_OF_WORLD_SCOPE", "INSUFFICIENT_CONTEXT"];

const FALLBACK_UTTERANCE: Record<string, string> = {
  yohei: "……悪い、ちょっとよくわからなかった。",
  miyoko: "ごめんなさい、今のはちょっと聞き取れなかったわ。",
  jin: "悪い、もう一回言ってくれるか。",
};

/** Never trusts raw adapter output. Validates `classification` (must be one of the 5 authored
 *  classes -- anything else fails closed to INSUFFICIENT_CONTEXT), validates `proposedConsequenceId`
 *  against `packet.allowedConsequenceIds` (an unmatched or out-of-scope id is DROPPED, never
 *  committed -- the visible line may still display), and schema-checks `visibleUtterance` (never
 *  semantically parsed for authority -- continuing PHASE 11.13E's zero-prose-authority finding). */
export function validateEnvelope(raw: Partial<NpcResponseEnvelope> | null | undefined, packet: NpcDialoguePacket): NpcResponseEnvelope {
  const fallback = FALLBACK_UTTERANCE[packet.npcId];
  if (!raw || typeof raw !== "object") {
    return { classification: "INSUFFICIENT_CONTEXT", npcResponseIntent: "VALIDATION_FAILED_NO_ENVELOPE", proposedConsequenceId: null, visibleUtterance: fallback };
  }

  const classification: Classification = VALID_CLASSIFICATIONS.includes(raw.classification as Classification) ? (raw.classification as Classification) : "INSUFFICIENT_CONTEXT";

  const proposedConsequenceId =
    typeof raw.proposedConsequenceId === "string" && packet.allowedConsequenceIds.includes(raw.proposedConsequenceId) ? raw.proposedConsequenceId : null;

  const visibleUtterance = typeof raw.visibleUtterance === "string" && raw.visibleUtterance.trim().length > 0 ? raw.visibleUtterance.trim() : fallback;

  const npcResponseIntent = typeof raw.npcResponseIntent === "string" && raw.npcResponseIntent.trim().length > 0 ? raw.npcResponseIntent.trim() : "UNSPECIFIED";

  return { classification, npcResponseIntent, proposedConsequenceId, visibleUtterance };
}

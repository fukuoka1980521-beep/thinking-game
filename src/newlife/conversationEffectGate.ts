import { applyAction } from "./state";
import type { NewLife30State, NpcId } from "./types";
import type { RefoundationReply } from "./refoundationDialogue";

export interface ConversationEffectDecision {
  applied: boolean;
  effectId: string | null;
  reason: string;
  state: NewLife30State;
}

/**
 * Deterministic post-generation authority gate.
 *
 * The generative conversation engine may understand the player's meaning and
 * propose a structured conversational act. This module alone decides whether
 * that proposal is strong/safe enough to become canonical NEW LIFE state.
 *
 * Do not inspect exact player wording here. The whole point of this layer is
 * to keep natural-language understanding in the chat model while keeping
 * truth/state authority deterministic.
 */
export function applyConversationEffectGate(
  state: NewLife30State,
  npc: NpcId,
  reply: RefoundationReply,
): ConversationEffectDecision {
  if (reply.uncertainty === "HIGH" || reply.candidateTurn.needsClarification) {
    return {
      applied: false,
      effectId: null,
      reason: "semantic_proposal_not_confident",
      state,
    };
  }

  /**
   * First production proof path:
   * Day 9 / Miyoko boundary discovery.
   *
   * Existing canon already treats "press_miyoko_for_boundary" as a legitimate
   * state transition. Previously the free-text path reached it through a
   * Japanese regex before conversation generation. In chat-first mode, a
   * semantically understood ASK_BOUNDARY proposal reaches the same
   * deterministic transition only after the NPC reply has been generated and
   * normalized by the server.
   *
   * This changes knowledge/state about a boundary Miyoko owns; it does not
   * invent consent for another actor.
   */
  if (
    state.day === 9 &&
    npc === "miyoko" &&
    reply.candidateTurn.action === "ASK_BOUNDARY"
  ) {
    return {
      applied: true,
      effectId: "press_miyoko_for_boundary",
      reason: "authoritative_boundary_discovery",
      state: applyAction(state, "press_miyoko_for_boundary"),
    };
  }

  return {
    applied: false,
    effectId: null,
    reason: "no_authorized_mapping",
    state,
  };
}

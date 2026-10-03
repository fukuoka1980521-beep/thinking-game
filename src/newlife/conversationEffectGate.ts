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
   * Japanese regex before conversation generation. In chat-first mode, the
   * server may propose MIYOKO_WAITING_CAPACITY_STATED only when Miyoko's reply
   * itself establishes a concrete seating/waiting boundary. The client then
   * maps that closed proposal to the existing canonical transition.
   *
   * This changes knowledge/state about a boundary Miyoko owns; it does not
   * invent consent for another actor.
   */
  if (
    state.day === 9 &&
    npc === "miyoko" &&
    reply.candidateWorldEffects.includes("MIYOKO_WAITING_CAPACITY_STATED")
  ) {
    return {
      applied: true,
      effectId: "press_miyoko_for_boundary",
      reason: "authoritative_boundary_discovery",
      state: applyAction(state, "press_miyoko_for_boundary"),
    };
  }

  if (
    state.day === 16 &&
    npc === "jin" &&
    reply.candidateWorldEffects.includes("DAY16_JIN_TASK_CONFIRMED")
  ) {
    return {
      applied: true,
      effectId: "arrange_paid_task_with_consent",
      reason: "jin_explicit_bounded_task_confirmation",
      state: applyAction(state, "arrange_paid_task_with_consent"),
    };
  }

  return {
    applied: false,
    effectId: null,
    reason: "no_authorized_mapping",
    state,
  };
}

import { describe, expect, it } from "vitest";
import { applyConversationEffectGate } from "../src/newlife/conversationEffectGate";
import { advanceDay, createInitialState } from "../src/newlife/state";
import type { RefoundationReply } from "../src/newlife/refoundationDialogue";

function day9State() {
  let state = createInitialState();
  for (let i = 1; i < 9; i += 1) state = advanceDay(state);
  return state;
}

function reply(overrides: Partial<RefoundationReply> = {}): RefoundationReply {
  return {
    text: "今いる二人くらいなら少しの間なら大丈夫です。それ以上は難しいですね。",
    continuations: [],
    nextNpc: null,
    nextText: null,
    understoodPlayerMeaning: "喫茶の席を待合として使える範囲を確認したい",
    candidateTurn: {
      action: "ASK_BOUNDARY",
      boundaryMode: "DISCOVER",
      relationalEvents: [],
      needsClarification: false,
    },
    candidateFactRevealIds: [],
    candidateCommitments: [],
    uncertainty: "LOW",
    ...overrides,
  };
}

describe("NEW LIFE chat-first conversation effect gate", () => {
  it("applies an authorized Day 9 Miyoko boundary discovery after semantic generation", () => {
    const before = day9State();
    expect(before.mSeats).toBe("assumed");

    const decision = applyConversationEffectGate(before, "miyoko", reply());

    expect(decision.applied).toBe(true);
    expect(decision.effectId).toBe("press_miyoko_for_boundary");
    expect(decision.state.mSeats).toBe("bounded");
    expect(decision.state.log.at(-1)).toContain("press_miyoko_for_boundary");
    expect(before.mSeats).toBe("assumed");
    expect(before.log).toEqual([]);
  });

  it("does not apply a high-uncertainty semantic proposal", () => {
    const before = day9State();
    const decision = applyConversationEffectGate(before, "miyoko", reply({ uncertainty: "HIGH" }));

    expect(decision.applied).toBe(false);
    expect(decision.state).toBe(before);
    expect(decision.reason).toBe("semantic_proposal_not_confident");
  });

  it("does not apply a proposal that still needs clarification", () => {
    const before = day9State();
    const base = reply();
    const decision = applyConversationEffectGate(before, "miyoko", reply({
      candidateTurn: { ...base.candidateTurn, needsClarification: true },
    }));

    expect(decision.applied).toBe(false);
    expect(decision.state).toBe(before);
  });

  it("does not give another NPC authority over Miyoko's boundary", () => {
    const before = day9State();
    const decision = applyConversationEffectGate(before, "fumiko", reply());

    expect(decision.applied).toBe(false);
    expect(decision.state).toBe(before);
    expect(decision.reason).toBe("no_authorized_mapping");
  });

  it("does not infer a state change from unrelated semantic actions", () => {
    const before = day9State();
    const base = reply();
    const decision = applyConversationEffectGate(before, "miyoko", reply({
      candidateTurn: { ...base.candidateTurn, action: "ASK_FACT" },
    }));

    expect(decision.applied).toBe(false);
    expect(decision.state).toBe(before);
  });
});

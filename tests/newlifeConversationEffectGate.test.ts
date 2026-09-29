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
    candidateWorldEffects: ["MIYOKO_WAITING_CAPACITY_STATED"],
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

  it("does not infer a state change when the model proposed no authorized world effect", () => {
    const before = day9State();
    const decision = applyConversationEffectGate(before, "miyoko", reply({
      candidateWorldEffects: [],
    }));

    expect(decision.applied).toBe(false);
    expect(decision.state).toBe(before);
  });

  it("does not depend on a narrow candidateTurn label when the closed world effect is explicit", () => {
    const before = day9State();
    const base = reply();
    const decision = applyConversationEffectGate(before, "miyoko", reply({
      candidateTurn: { ...base.candidateTurn, action: "OBSERVE", boundaryMode: "NOT_RELEVANT" },
    }));

    expect(decision.applied).toBe(true);
    expect(decision.state.mSeats).toBe("bounded");
  });
});


describe("NEW LIFE chat-first Day 16 task confirmation", () => {
  function stateAtDay16() {
    let state = createInitialState();
    for (let i = 1; i < 16; i += 1) state = advanceDay(state);
    state = advanceDay(state);
    return state;
  }

  it("applies Jin's explicit bounded task confirmation through the deterministic state gate", () => {
    const before = stateAtDay16();
    const decision = applyConversationEffectGate(before, "jin", reply({
      text: "二時間ならやる。先に場所を決めよう。",
      understoodPlayerMeaning: "二時間の追加作業を具体的に頼んでいる",
      candidateWorldEffects: ["DAY16_JIN_TASK_CONFIRMED"],
      uncertainty: "LOW",
    }));

    expect(decision.applied).toBe(true);
    expect(decision.effectId).toBe("arrange_paid_task_with_consent");
    expect(decision.state.jWork).toBe("extra_with_specific_consent");
  });

  it("does not convert a mere request into Jin's consent", () => {
    const before = stateAtDay16();
    const decision = applyConversationEffectGate(before, "jin", reply({
      text: "内容と時間次第だな。",
      candidateWorldEffects: [],
      uncertainty: "LOW",
    }));

    expect(decision.applied).toBe(false);
    expect(decision.state).toBe(before);
  });

  it("does not let another NPC confirm Jin's task", () => {
    const before = stateAtDay16();
    const decision = applyConversationEffectGate(before, "miyoko", reply({
      candidateWorldEffects: ["DAY16_JIN_TASK_CONFIRMED"],
      uncertainty: "LOW",
    }));

    expect(decision.applied).toBe(false);
    expect(decision.state).toBe(before);
  });
});

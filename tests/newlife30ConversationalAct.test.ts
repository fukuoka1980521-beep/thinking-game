import { describe, expect, it } from "vitest";
import { createInitialState } from "../src/newlife/state";
import { answerFreeText, clarificationLine, detectAct, detectIntent, isFlavorLine } from "../src/newlife/npcVoice";
import { NPC_IDS, type NpcId } from "../src/newlife/types";

// Phase 28B: a directed statement about the conversation itself (feedback on
// tone, a compliment, criticism, agreement, disagreement, greeting, or
// leave-taking) must be acknowledged on-topic, never answered with an
// unrelated generic flavor line. See the Owner human-playtest evidence in
// Issue #1 comment PHASE_28B_CONVERSATIONAL_ACT_REPAIR_V1.

describe("NEW LIFE conversational-act layer — tone-feedback adjacency pair (Owner-found bug)", () => {
  it("Owner's exact sentence: Hina acknowledges the tone complaint instead of returning her kitchen flavor line", () => {
    const state = createInitialState();
    const reply = answerFreeText("hina", "口調が堅苦しいよ", state);
    expect(detectAct("口調が堅苦しいよ")).toBe("tone_feedback");
    expect(isFlavorLine("hina", reply)).toBe(false);
    expect(reply).not.toBe("焼き上がりの方が段取りより言うこと聞くんですけどね");
  });

  const TONE_FEEDBACK_PARAPHRASES = [
    "口調が堅苦しいよ",
    "ちょっと固いね",
    "もっと普通に話して",
    "なんか他人行儀だね",
    "その言い方ちょっと変だよ",
    "話し方が機械っぽい",
  ];

  it.each(TONE_FEEDBACK_PARAPHRASES)("classifies %s as tone_feedback for every NPC and never answers with a flavor line", (phrase) => {
    expect(detectAct(phrase)).toBe("tone_feedback");
    const state = createInitialState();
    for (const npc of NPC_IDS) {
      const reply = answerFreeText(npc, phrase, state);
      expect(isFlavorLine(npc, reply)).toBe(false);
    }
  });

  it("does not misfire on a genuine food-texture complaint that happens to use a stiffness word", () => {
    expect(detectAct("クッキーが固いですね")).not.toBe("tone_feedback");
  });
});

describe("NEW LIFE conversational-act layer — general adjacency pairs across all six NPCs", () => {
  const CASES: { act: ReturnType<typeof detectAct>; phrase: string }[] = [
    { act: "compliment", phrase: "これ美味しいね" },
    { act: "criticism", phrase: "それはひどいと思う" },
    { act: "agreement", phrase: "なるほど、わかりました" },
    { act: "disagreement", phrase: "それは違うと思う" },
    { act: "greeting", phrase: "こんにちは" },
    { act: "leave_taking", phrase: "また明日" },
  ];

  it.each(CASES)("$act ($phrase) is acknowledged on-topic for every NPC, not answered with flavor", ({ act, phrase }) => {
    expect(detectAct(phrase)).toBe(act);
    const state = createInitialState();
    for (const npc of NPC_IDS) {
      const reply = answerFreeText(npc, phrase, state);
      expect(isFlavorLine(npc, reply)).toBe(false);
    }
  });

  it("a directed feedback/compliment/disagreement line is distinguishable per act, not collapsed to one bucket", () => {
    const acts = new Set(CASES.map((c) => detectAct(c.phrase)));
    expect(acts.size).toBe(CASES.length);
  });
});

describe("NEW LIFE conversational-act layer — repair requests", () => {
  it("a player asking the NPC to repeat gets a repair reply, not flavor or an unrelated fact", () => {
    const state = createInitialState();
    expect(detectAct("え？もう一回言って")).toBe("repair_request");
    for (const npc of NPC_IDS) {
      expect(isFlavorLine(npc, answerFreeText(npc, "え？もう一回言って", state))).toBe(false);
    }
  });
});

describe("NEW LIFE conversational-act layer — unmapped-but-clearly-a-question guard", () => {
  it("a question that maps to no known fact domain gets a clarification line, never a flavor nonanswer", () => {
    const state = createInitialState();
    expect(detectIntent("明日は晴れますか？")).toBeNull();
    for (const npc of NPC_IDS) {
      const reply = answerFreeText(npc, "明日は晴れますか？", state);
      expect(reply).toBe(clarificationLine(npc));
      expect(isFlavorLine(npc, reply)).toBe(false);
    }
  });
});

describe("NEW LIFE conversational-act layer — fact topics still win over a greeting/act wrapper", () => {
  it("a greeting-prefixed factual question about the workshop still answers the fact, not a greeting", () => {
    const state = createInitialState();
    const reply = answerFreeText("daisuke", "おはよう。工房、貸してくれるんですか？", state);
    expect(reply).not.toBe("おう、来たか。");
  });
});

describe("NEW LIFE conversational-act layer — genuinely low-information lines still use flavor", () => {
  it("a plain observation with no directed act still falls back to a flavor line", () => {
    const state = createInitialState();
    expect(detectAct("今日はいい天気だ")).toBeNull();
    const npc: NpcId = "yohei";
    const reply = answerFreeText(npc, "今日はいい天気だ", state);
    expect(isFlavorLine(npc, reply)).toBe(true);
  });
});

describe("NEW LIFE conversational-act layer — free talk still cannot mutate state", () => {
  it("answerFreeText never mutates state for any of the new act branches", () => {
    const state = createInitialState();
    const frozen = Object.freeze({ ...state });
    for (const phrase of ["口調が堅苦しいよ", "これ美味しいね", "こんにちは", "また明日", "え？もう一回言って"]) {
      expect(() => answerFreeText("hina", phrase, frozen as ReturnType<typeof createInitialState>)).not.toThrow();
    }
    expect(frozen).toEqual(state);
  });
});

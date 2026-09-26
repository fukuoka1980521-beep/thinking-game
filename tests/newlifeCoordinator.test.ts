import { describe, expect, it } from "vitest";
import { resolveFreeText } from "../src/newlife/semantic/coordinator";
import { answerFreeText, clarificationLine } from "../src/newlife/npcVoice";
import { createInitialState } from "../src/newlife/state";
import type { SemanticInterpreter, SemanticInterpretationResult, FactsSnapshot } from "../src/newlife/semantic/contract";
import type { NewLife30State } from "../src/newlife/types";

function stubInterpreter(result: SemanticInterpretationResult | (() => SemanticInterpretationResult)): SemanticInterpreter {
  return {
    async interpret() {
      return typeof result === "function" ? result() : result;
    },
  };
}

function okInterpretation(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    status: "ok" as const,
    interpretation: {
      conversationalAct: "character_question" as const,
      semanticIntents: [{ category: "character_preference" as const, utteranceSpan: "こだわり" }],
      entities: [],
      answerableFromCanon: true,
      requiredFacts: [],
      unknowns: [],
      proposedResponse: "レシピにはかなりこだわっています。",
      ...overrides,
    },
  };
}

// Phase 30 instruction 11's exact fallback matrix: endpoint empty, consent
// declined, network error, timeout, malformed JSON, or truth-gate rejection
// all resolve to the deterministic router — the same list
// tests/aiDialogueGateDormant.test.tsx and tests/aiDialogueClient.test.ts
// already cover for CASE1's older, structurally similar gate.
describe("resolveFreeText (Phase 30 hybrid coordinator)", () => {
  const state: NewLife30State = createInitialState();

  it("with no interpreter (endpoint unconfigured, config.ts's shipped default) is byte-identical to answerFreeText", async () => {
    const text = "この町の好きなところはどこですか？"; // an ambiguous/unmapped question
    const result = await resolveFreeText("hina", text, state, { interpreter: null, consentAccepted: true });
    expect(result).toEqual({ text: answerFreeText("hina", text, state), source: "deterministic" });
  });

  it("with consent declined, never calls the interpreter even if one is configured", async () => {
    let called = false;
    const interpreter = stubInterpreter(() => {
      called = true;
      return okInterpretation();
    });
    const text = "この町の好きなところはどこですか？";
    const result = await resolveFreeText("hina", text, state, { interpreter, consentAccepted: false });
    expect(called).toBe(false);
    expect(result).toEqual({ text: answerFreeText("hina", text, state), source: "deterministic" });
  });

  it("never calls the interpreter for a recognized fact question — the deterministic fast path owns it (instruction 11)", async () => {
    let called = false;
    const interpreter = stubInterpreter(() => {
      called = true;
      return okInterpretation();
    });
    const text = "どんな焼き菓子を売ってるの?";
    const result = await resolveFreeText("hina", text, state, { interpreter, consentAccepted: true });
    expect(called).toBe(false);
    expect(result).toEqual({ text: answerFreeText("hina", text, state), source: "deterministic" });
  });

  it("never calls the interpreter for a recognized conversational act — the deterministic fast path owns it", async () => {
    let called = false;
    const interpreter = stubInterpreter(() => {
      called = true;
      return okInterpretation();
    });
    const text = "口調が堅苦しいよ";
    const result = await resolveFreeText("hina", text, state, { interpreter, consentAccepted: true });
    expect(called).toBe(false);
    expect(result.source).toBe("deterministic");
  });

  it("consults the interpreter only for an ambiguous/unmapped question, and displays a passing result", async () => {
    const text = "休みの日は何をしていますか"; // unmapped, isQuestionLike, no fact/act match
    expect(answerFreeText("hina", text, state)).toBe(clarificationLine("hina"));

    const interpreter = stubInterpreter(okInterpretation());
    const result = await resolveFreeText("hina", text, state, { interpreter, consentAccepted: true });
    expect(result).toEqual({ text: "レシピにはかなりこだわっています。", source: "semantic" });
  });

  it("falls back to deterministic when the interpreter reports unavailable (network/timeout/malformed)", async () => {
    const text = "休みの日は何をしていますか";
    const interpreter = stubInterpreter({ status: "unavailable", reason: "timeout" });
    const result = await resolveFreeText("hina", text, state, { interpreter, consentAccepted: true });
    expect(result).toEqual({ text: clarificationLine("hina"), source: "deterministic" });
  });

  it("falls back to deterministic when the interpreter throws", async () => {
    const text = "休みの日は何をしていますか";
    const throwingInterpreter: SemanticInterpreter = {
      async interpret() {
        throw new Error("boom");
      },
    };
    const result = await resolveFreeText("hina", text, state, { interpreter: throwingInterpreter, consentAccepted: true });
    expect(result).toEqual({ text: clarificationLine("hina"), source: "deterministic" });
  });

  it("falls back to deterministic when the truth gate rejects a banned-term response", async () => {
    const text = "大輔さんについて何か知っていますか";
    expect(answerFreeText("daisuke", text, state)).toBe(clarificationLine("daisuke"));
    // daisuke's own negativeConstraints include the barber-canon rejection terms
    const interpreter = stubInterpreter(okInterpretation({ proposedResponse: "大輔さんは理容の担当です。" }));
    const result = await resolveFreeText("daisuke", text, state, { interpreter, consentAccepted: true });
    expect(result.source).toBe("deterministic");
    expect(result.text).toBe(answerFreeText("daisuke", text, state));
  });

  it("falls back to deterministic when the truth gate rejects an unsupported numeric claim", async () => {
    const text = "休みの日は何をしていますか";
    const interpreter = stubInterpreter(
      okInterpretation({ requiredFacts: [], semanticIntents: [], proposedResponse: "あと999個ありますよ。" }),
    );
    const result = await resolveFreeText("hina", text, state, { interpreter, consentAccepted: true });
    expect(result.source).toBe("deterministic");
  });

  it("rejects an NPC stealing the player's recorded offer as her own statement", async () => {
    const text = "昨日の話、どういう意味だったの？";
    const interpreter = stubInterpreter(
      okInterpretation({ proposedResponse: "私が何か手伝えることがあればと申し出たのよ。" }),
    );
    const result = await resolveFreeText("miyoko", text, state, { interpreter, consentAccepted: true });
    expect(result.source).toBe("deterministic");
  });

  it("allows the NPC to attribute the same offer to the player", async () => {
    const text = "昨日の話、どういう意味だったの？";
    const interpreter = stubInterpreter(
      okInterpretation({ proposedResponse: "あなたが手伝えることがあればと言ってくれたのよ。" }),
    );
    const result = await resolveFreeText("miyoko", text, state, { interpreter, consentAccepted: true });
    expect(result.source).toBe("semantic");
  });

  it("falls back to deterministic when proposedResponse is blank", async () => {
    const text = "休みの日は何をしていますか";
    const interpreter = stubInterpreter(okInterpretation({ proposedResponse: "   " }));
    const result = await resolveFreeText("hina", text, state, { interpreter, consentAccepted: true });
    expect(result.source).toBe("deterministic");
  });

  it("multi-intent compound question: both a FACT clause and a CHARACTER clause pass the truth gate together (Owner transcript 2 worked example)", async () => {
    // "原価高いのですか、なにかこだわっているてんありますか" already routes
    // deterministically via product_care (see npcVoice.ts's isProductCareQuestion),
    // so use a paraphrase the deterministic router does NOT recognize (no
    // "こだわ/原価/材料費" keyword collision), to actually exercise the
    // semantic path for a genuine compound utterance.
    const text = "経営は順調ですか、それとあなたが特に気にしていることは何ですか";
    expect(answerFreeText("hina", text, state)).toBe(clarificationLine("hina"));

    const beforeDay20 = { ...state, day: 10 };
    const dayGatedInterpretation = okInterpretation({
      conversationalAct: "factual_question",
      semanticIntents: [
        { category: "profit", utteranceSpan: "経営は順調ですか" },
        { category: "character_preference", utteranceSpan: "特に気にしていることは何ですか" },
      ],
      answerableFromCanon: false,
      requiredFacts: ["profit"],
      unknowns: ["profit"],
      proposedResponse: "材料費はまだ集計前です。レシピと焼き上がりはかなり見ています。",
    });
    const interpreter = stubInterpreter(dayGatedInterpretation);
    const result = await resolveFreeText("hina", text, beforeDay20, { interpreter, consentAccepted: true });
    expect(result).toEqual({ text: "材料費はまだ集計前です。レシピと焼き上がりはかなり見ています。", source: "semantic" });
  });

  it("multi-intent question that overclaims a day-gated fact fails the truth gate and falls back", async () => {
    const text = "経営は順調ですか、それとあなたが特に気にしていることは何ですか";
    const beforeDay20 = { ...state, day: 10 };
    const overclaiming = okInterpretation({
      semanticIntents: [
        { category: "profit", utteranceSpan: "経営は順調ですか" },
        { category: "character_preference", utteranceSpan: "特に気にしていることは何ですか" },
      ],
      answerableFromCanon: true,
      requiredFacts: ["profit"],
      unknowns: [],
      proposedResponse: "黒字です。レシピと焼き上がりはかなり見ています。",
    });
    const interpreter = stubInterpreter(overclaiming);
    const result = await resolveFreeText("hina", text, beforeDay20, { interpreter, consentAccepted: true });
    expect(result.source).toBe("deterministic");
  });

  it("typo-tolerant paraphrase (mocked model response) resolves via the semantic path when the deterministic router can't parse the typo", async () => {
    // A kanji-substitution typo (何 -> 荷) that breaks every literal "何を売"
    // style regex in npcVoice.ts, unlike the Owner's already-patched
    // "名に売る" typo (see normalizeForRouting's narrow literal fix).
    const text = "荷を売ってるのですか";
    expect(answerFreeText("hina", text, state)).toBe(clarificationLine("hina"));

    const interpreter = stubInterpreter(
      okInterpretation({
        conversationalAct: "factual_question",
        semanticIntents: [{ category: "menu", utteranceSpan: text }],
        requiredFacts: ["menu"],
        proposedResponse: "スコーンとクッキーです。",
      }),
    );
    const result = await resolveFreeText("hina", text, state, { interpreter, consentAccepted: true });
    expect(result).toEqual({ text: "スコーンとクッキーです。", source: "semantic" });
  });

  it("never mutates NewLife30State — the same state object is returned identical before/after a semantic turn", async () => {
    const before = createInitialState();
    const snapshot = JSON.stringify(before);
    const text = "休みの日は何をしていますか";
    const interpreter = stubInterpreter(okInterpretation());
    await resolveFreeText("hina", text, before, { interpreter, consentAccepted: true });
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});

describe("resolveFreeText — all six NPC profiles route through the same coordinator", () => {
  const state = createInitialState();
  const npcs = ["hina", "yohei", "daisuke", "jin", "miyoko", "fumiko"] as const;

  it("falls back deterministically for each NPC with no interpreter configured", async () => {
    for (const npc of npcs) {
      const result = await resolveFreeText(npc, "どんな焼き菓子を売ってるの?", state, { interpreter: null, consentAccepted: true });
      expect(result.source).toBe("deterministic");
    }
  });
});

// Ensures the FactsSnapshot passed into a live interpreter is always built
// from the same projectFacts the truth gate itself checks against -- not a
// second, independently-constructed snapshot that could drift.
describe("resolveFreeText — the interpreter receives the same FactsSnapshot the truth gate checks against", () => {
  it("passes the live NewLife30State's day-gated facts through, not a stale/default snapshot", async () => {
    const captured: { snapshot?: FactsSnapshot } = {};
    const interpreter: SemanticInterpreter = {
      async interpret(_utterance, snapshot) {
        captured.snapshot = snapshot;
        return okInterpretation({ requiredFacts: [], semanticIntents: [] });
      },
    };
    const state = { ...createInitialState(), day: 25 };
    await resolveFreeText("hina", "休みの日は何をしていますか", state, { interpreter, consentAccepted: true });
    expect(captured.snapshot?.day).toBe(25);
    expect(captured.snapshot?.unknown).not.toContain("profit");
  });
});

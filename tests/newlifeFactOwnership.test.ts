/**
 * Phase 25.2 — conversation fact ownership memory.
 *
 * Human test (NEW LIFE free conversation): the player's
 * 「何か手伝えることがあれば」 was later claimed as 美代子's own words. These
 * tests pin the structure that prevents it: a compact fact ledger, an
 * attribution gate over proposed NPC lines, one regeneration on a violation,
 * and the player's own free input updating the ledger before the next NPC line.
 */
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { checkAttribution, splitSentences } from "../src/newlife/semantic/attributionGate";
import { resolveFreeText, MAX_SEMANTIC_ATTEMPTS } from "../src/newlife/semantic/coordinator";
import {
  LEDGER_MAX_ENTRIES,
  LEDGER_MAX_WIRE,
  addFact,
  addOffer,
  addResponsibility,
  addUnresolved,
  compactLedger,
  createEmptyLedger,
  isOfferHelp,
  ledgerReflectsUtterance,
  recordPlayerUtterance,
  syncLedgerWithState,
  type FactLedger,
} from "../src/newlife/semantic/factLedger";
import { projectFacts } from "../src/newlife/semantic/factsProjection";
import { runTruthGate } from "../src/newlife/semantic/truthGate";
import type { FactsSnapshot, SemanticInterpreter, SemanticInterpretationResult } from "../src/newlife/semantic/contract";
import { answerFreeText, clarificationLine } from "../src/newlife/npcVoice";
import { createInitialState } from "../src/newlife/state";
import { NPC_IDS, type NewLife30State, type NpcId } from "../src/newlife/types";

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lib = require("../functions/newlife-dialogue/lib.js");

/** The state at the time of the human test: Day 3+, vague sign not yet corrected. */
function incidentState(): NewLife30State {
  return { ...createInitialState(), day: 10, signVersion: "vague_uncorrected" };
}

/** The exact fact state of the observed conversation (see task §2). */
function incidentLedger(): FactLedger {
  let l = syncLedgerWithState(createEmptyLedger(), incidentState());
  // player: offered 「何か手伝えることがあれば」
  l = addOffer(l, "player", "何か手伝えることがあれば言って", ["手伝えること", "手伝"]);
  // Fumiko: did — put up the 「喫茶みよこへ」 sign
  l = addFact(l, "did", "fumiko", "「喫茶みよこへ」という掲示を出した", ["喫茶みよこ", "掲示"]);
  // Fumiko: responsible for correcting the sign and explaining to the people waiting
  l = addResponsibility(l, "fumiko", "待っている人への説明", ["待っている人", "説明"]);
  // unresolved
  l = addUnresolved(l, "現在待っている2人への対応", ["待っている", "2人"]);
  return l;
}

const violationCodes = (line: string, npc: NpcId, ledger: FactLedger = incidentLedger()) =>
  checkAttribution(line, npc, ledger).map((v) => v.code);

describe("FactLedger — compact state model", () => {
  it("derives the observed conversation's facts from canonical state + conversation", () => {
    const l = incidentLedger();
    // player offered
    expect(l.offers.find((o) => o.actor === "player")?.text).toContain("手伝えることがあれば");
    // Fumiko did the sign; 美代子 did NOT permit the waiting area; Fumiko owns the fix
    expect(l.facts.some((f) => f.kind === "did" && f.actor === "fumiko" && f.text.includes("掲示"))).toBe(true);
    expect(l.permissions.find((p) => p.owner === "miyoko")?.granted).toBe(false);
    expect(l.responsibilities.some((r) => r.owner === "fumiko")).toBe(true);
    expect(l.unresolved.map((u) => u.text)).toContain("現在待っている2人への対応");
    expect(l.unresolved.map((u) => u.text)).toContain("掲示の訂正");
  });

  it("is compact: not a transcript — every list and text is hard-capped", () => {
    let l = syncLedgerWithState(createEmptyLedger(), incidentState());
    for (let i = 0; i < 40; i += 1) l = addOffer(l, "player", `offer number ${i} ${"あ".repeat(200)}`, ["手伝"]);
    const wire = compactLedger(l);
    expect(wire.offers.length).toBeLessThanOrEqual(LEDGER_MAX_WIRE);
    expect(l.offers.filter((o) => o.id.startsWith("conv:")).length).toBeLessThanOrEqual(LEDGER_MAX_ENTRIES);
    for (const o of wire.offers) expect(o.text.length).toBeLessThanOrEqual(80);
    expect(JSON.stringify(wire).length).toBeLessThan(6000);
  });

  it("re-deriving from state is idempotent and reflects state changes (sign corrected → no longer unresolved)", () => {
    const l1 = syncLedgerWithState(syncLedgerWithState(createEmptyLedger(), incidentState()), incidentState());
    expect(l1.unresolved.filter((u) => u.text === "掲示の訂正")).toHaveLength(1);
    const fixed = syncLedgerWithState(l1, { ...incidentState(), signVersion: "vague_then_corrected" });
    expect(fixed.unresolved.map((u) => u.text)).not.toContain("掲示の訂正");
  });
});

describe("TEST-A: a phrase said by A is never claimed by B as 'I said it'", () => {
  it("rejects the observed line (美代子 claiming the player's 「何か手伝えることがあれば」)", () => {
    const observed = "でも、私が言ったのは、あくまで『何か手伝えることがあれば』で、お店を待合にするとは言ってないのよ。";
    expect(violationCodes(observed, "miyoko")).toContain("quote_speaker_mismatch");
  });

  it.each([
    ["miyoko", "私は『何か手伝えることがあれば』とは言ったけれど、待合とは言っていないわ。"],
    ["fumiko", "美代子さんが『何か手伝えることがあれば言って』と言ってくれたのよ。"],
    ["fumiko", "手伝えることがあればと言ったのは、美代子さんの方でしょう？"],
    ["miyoko", "『何か手伝えることがあれば』って申し出たのは私よ。"],
    ["hina", "その『手伝えることがあれば』は、私が言ったんです。"],
  ] as [NpcId, string][])("rejects a paraphrase (%s): %s", (npc, line) => {
    expect(violationCodes(line, npc)).toContain("quote_speaker_mismatch");
  });

  it.each([
    ["fumiko", "でも昨日、『何か手伝えることがあれば言って』って言ってくれたでしょう。私は何席かならお願いできると思ったの。"],
    ["miyoko", "あなたが『何か手伝えることがあれば』と言ってくれたのは覚えているわ。"],
    ["miyoko", "私が言ったのは、席は四つまでということだけよ。"],
    ["miyoko", "手伝えるなんて、私は一言も言っていないわ。"],
    ["miyoko", "私が手伝えることがあれば言ってね。"],
  ] as [NpcId, string][])("accepts correct attribution (%s): %s", (npc, line) => {
    expect(violationCodes(line, npc)).toEqual([]);
  });
});

describe("TEST-B: an action by A is never treated as B's action", () => {
  it.each([
    ["miyoko", "そうね、掲示は私が出したのよ。"],
    ["hina", "『喫茶みよこへ』の掲示を貼ったのは私です。"],
    ["fumiko", "『喫茶みよこへ』の掲示を出したのは、あなたよね？"],
    ["yohei", "掲示を出したのは美代子さんだろう。"],
  ] as [NpcId, string][])("rejects (%s): %s", (npc, line) => {
    expect(violationCodes(line, npc)).toContain("action_actor_mismatch");
  });

  it.each([
    ["miyoko", "掲示を出したのは文子さんね。"],
    ["fumiko", "掲示は私が出したわ。"],
    ["miyoko", "掲示は私が出したものじゃないわ。"],
    ["hina", "掲示は見ました。"],
  ] as [NpcId, string][])("accepts (%s): %s", (npc, line) => {
    expect(violationCodes(line, npc)).toEqual([]);
  });
});

describe("TEST-C: a permission nobody granted is never fabricated", () => {
  it.each([
    ["fumiko", "美代子さんが待合として席を使っていいと許可してくれたのよ。"],
    ["miyoko", "そうよ、待合として使うのは私が許可したのよね。"],
    ["hina", "美代子さんの許可はもらっています。待合の件です。"],
    ["yohei", "美代子さんは待合もいいと言っていたぞ。"],
    ["fumiko", "美代子さんも待合に席を使うことを了承しているわ。"],
  ] as [NpcId, string][])("rejects (%s): %s", (npc, line) => {
    expect(violationCodes(line, npc)).toContain("fabricated_permission");
  });

  it.each([
    ["fumiko", "美代子さんはまだ待合の件を許可していないわ。"],
    ["fumiko", "美代子さんが待合を了承したと思っていたのだけれど、勘違いだったわ。"],
    ["miyoko", "待合として使うのは、まだ許可していないの。"],
    ["miyoko", "今外にいる二人だけなら、短い間、席を使っていいわ。"],
  ] as [NpcId, string][])("accepts (%s): %s", (npc, line) => {
    expect(violationCodes(line, npc)).toEqual([]);
  });

  it("a permission that IS recorded as granted is not flagged", () => {
    const l = syncLedgerWithState(createEmptyLedger(), incidentState());
    const granted: FactLedger = {
      ...l,
      permissions: l.permissions.map((p) => ({ ...p, granted: true })),
    };
    expect(checkAttribution("美代子さんが待合として使っていいと許可してくれたのよ。", "fumiko", granted)).toEqual([]);
  });
});

describe("responsibility does not drift to another NPC without cause", () => {
  it.each([
    ["miyoko", "掲示の訂正は私が担当します。"],
    ["hina", "掲示は私が直しておきます。"],
    ["yohei", "掲示の訂正はあなたの責任だ。"],
    ["jin", "掲示の訂正は美代子さんが責任を持つ。"],
  ] as [NpcId, string][])("rejects (%s): %s", (npc, line) => {
    expect(violationCodes(line, npc)).toContain("responsibility_shift");
  });

  it.each([
    ["fumiko", "掲示の訂正は私が担当するわ。"],
    ["miyoko", "掲示の訂正は文子さんが担当よ。"],
    ["miyoko", "掲示の説明なら手伝うわ。"],
    ["miyoko", "掲示のことは、私に言われても困るわ。"],
  ] as [NpcId, string][])("accepts (%s): %s", (npc, line) => {
    expect(violationCodes(line, npc)).toEqual([]);
  });
});

describe("similar cases with different wording (written independently of the gate's patterns)", () => {
  // [npc, line, mustBeRejected]
  const cases: [NpcId, string, boolean][] = [
    ["miyoko", "手伝うって言ってくれたのは私じゃなくてあなたよ。", false],
    ["miyoko", "手伝うと言ったのは私だったかしら。", true],
    ["miyoko", "「手伝えることがあれば」なんて、私は言った覚えがないわ。", false],
    ["miyoko", "私が「何か手伝えることがあれば」と言い出したことになっているのね。", true],
    ["fumiko", "あなたが手伝いを申し出てくれたのよね。", false],
    ["fumiko", "美代子さんが手伝いを申し出たと聞いたわ。", true],
    ["miyoko", "お手伝いしたい気持ちはあるのよ。でも席は四つまで。", false],
    ["miyoko", "私が手伝えるのは、お茶を出すことくらいね。", false],
    ["yohei", "掲示を出したのは文子だ。数は合ってる。", false],
    ["yohei", "掲示は美代子が出した。", true],
    ["hina", "文子さんが出した掲示を見て、二人が来たんです。", false],
    ["hina", "私が掲示を出したわけではありません。", false],
    ["miyoko", "待合にしていいなんて、私は言っていないわ。", false],
    ["miyoko", "待合にしていいと私が言ったことになっているの？", true],
    ["fumiko", "掲示の訂正は私がやるわ。待っている人への説明も私が持つ。", false],
    ["miyoko", "待っている人への説明は私がします。", true],
    ["miyoko", "待っている人への説明は、文子さんとあなたで決めてね。", false],
    ["jin", "……運ぶ。一往復。", false],
    ["daisuke", "いったんさ……椅子なら今日直せる。", false],
  ];
  it.each(cases)("%s: %s → rejected=%s", (npc, line, rejected) => {
    expect(violationCodes(line, npc).length > 0).toBe(rejected);
  });
});

describe("gate mechanics", () => {
  it("does nothing without a ledger and never judges a sentence the ledger says nothing about", () => {
    expect(checkAttribution("私が言ったのは、席は四つまでよ。", "miyoko", undefined)).toEqual([]);
    expect(violationCodes("私が焼いたスコーンよ。ゆっくりしていってね。", "miyoko")).toEqual([]);
  });

  it("splits sentences outside quotes only", () => {
    expect(splitSentences("私が言ったのは『あれば。』で、そう。次よ。")).toHaveLength(2);
  });

  it("is part of the single truth gate", () => {
    const snapshot = projectFacts("miyoko", incidentState(), incidentLedger());
    const verdict = runTruthGate(
      {
        conversationalAct: "character_question",
        semanticIntents: [],
        entities: [],
        answerableFromCanon: true,
        requiredFacts: [],
        unknowns: [],
        proposedResponse: "私が言ったのは『何か手伝えることがあれば』だけよ。",
      },
      snapshot,
    );
    expect(verdict.passed).toBe(false);
    expect(verdict.violations.map((v) => v.code)).toContain("quote_speaker_mismatch");
  });
});

// ---------------------------------------------------------------------------
// Coordinator: ledger update → generation → gate → regeneration.
// ---------------------------------------------------------------------------

const AMBIGUOUS_QUESTION = "この件は、誰が言い出したのでしたっけ？"; // question-like, no fact domain, no act, not an offer

const BAD_LINE = "でも、私が言ったのは、あくまで『何か手伝えることがあれば』で、お店を待合にするとは言ってないのよ。";
const GOOD_LINE = "あなたが『何か手伝えることがあれば』と言ってくれたのはありがたいわ。でも、お店を待合にするとは言っていないの。";

function interp(text: string) {
  return {
    status: "ok" as const,
    interpretation: {
      conversationalAct: "character_question" as const,
      semanticIntents: [{ category: "character_preference" as const, utteranceSpan: "件" }],
      entities: [],
      answerableFromCanon: true,
      requiredFacts: [],
      unknowns: [],
      proposedResponse: text,
    },
  };
}

function scripted(responses: string[]) {
  const calls: { snapshot: FactsSnapshot; feedback?: string[] }[] = [];
  const interpreter: SemanticInterpreter = {
    async interpret(_u, snapshot, feedback): Promise<SemanticInterpretationResult> {
      calls.push({ snapshot, feedback });
      return interp(responses[Math.min(calls.length - 1, responses.length - 1)]);
    },
  };
  return { interpreter, calls };
}

describe("coordinator: the observed situation, reproduced", () => {
  it("rejects the misattributed line, regenerates once with the violation as feedback, and shows the corrected line", async () => {
    const { interpreter, calls } = scripted([BAD_LINE, GOOD_LINE]);
    const state = incidentState();
    // The player's earlier free input ("困りましたね" / an offer) reaches the ledger first.
    const result = await resolveFreeText("miyoko", AMBIGUOUS_QUESTION, state, {
      interpreter,
      consentAccepted: true,
      ledger: incidentLedger(),
    });
    expect(calls).toHaveLength(2);
    expect(calls[0].feedback).toBeUndefined();
    expect(calls[1].feedback?.[0]).toMatch(/手伝えることがあれば/);
    expect(result).toMatchObject({ text: GOOD_LINE, source: "semantic" });
    expect(result.ledger).toBeDefined();
  });

  it("falls back to the deterministic answer when the regeneration is still wrong (never more than MAX attempts)", async () => {
    const { interpreter, calls } = scripted([BAD_LINE]);
    const result = await resolveFreeText("miyoko", AMBIGUOUS_QUESTION, incidentState(), {
      interpreter,
      consentAccepted: true,
      ledger: incidentLedger(),
    });
    expect(calls).toHaveLength(MAX_SEMANTIC_ATTEMPTS);
    expect(result.source).toBe("deterministic");
    expect(result.text).toBe(clarificationLine("miyoko"));
  });

  it("does not regenerate for a non-ownership violation (cost guardrail) — banned term still falls back at once", async () => {
    const { interpreter, calls } = scripted(["大輔さんは理容の担当です。"]);
    const result = await resolveFreeText("daisuke", AMBIGUOUS_QUESTION, incidentState(), {
      interpreter,
      consentAccepted: true,
      ledger: incidentLedger(),
    });
    expect(calls).toHaveLength(1);
    expect(result.source).toBe("deterministic");
  });

  it("the interpreter receives the ledger in the snapshot (miyoko's permission is not granted)", async () => {
    const { interpreter, calls } = scripted([GOOD_LINE]);
    await resolveFreeText("miyoko", AMBIGUOUS_QUESTION, incidentState(), { interpreter, consentAccepted: true, ledger: incidentLedger() });
    const ledger = calls[0].snapshot.ledger!;
    expect(ledger.permissions.find((p) => p.owner === "miyoko")?.granted).toBe(false);
    expect(ledger.offers.some((o) => o.actor === "player")).toBe(true);
  });

  it("without a ledger the coordinator is unchanged (no ledger field on the result, no snapshot ledger)", async () => {
    const { interpreter, calls } = scripted([GOOD_LINE]);
    const result = await resolveFreeText("miyoko", AMBIGUOUS_QUESTION, incidentState(), { interpreter, consentAccepted: true });
    expect(Object.keys(result).sort()).toEqual(["source", "text"]);
    expect(calls[0].snapshot.ledger).toBeUndefined();
  });
});

describe("TEST-D: the player's free input changes the next NPC turn", () => {
  it.each([
    "説明を手伝いますよ",
    "何か手伝えることがあれば言ってください",
    "待っている人への説明、手伝いましょうか？",
    "私も手伝います",
    "片づけなら手伝えます",
  ])("records a player offer from: %s", (text) => {
    expect(isOfferHelp(text)).toBe(true);
    const l = recordPlayerUtterance(syncLedgerWithState(createEmptyLedger(), incidentState()), text);
    expect(l.offers.at(-1)).toMatchObject({ actor: "player" });
    expect(ledgerReflectsUtterance(l, text)).toBe(true);
  });

  it("does NOT record a request to the NPC or a 'who said it' question as the player's offer", () => {
    for (const text of ["手伝ってもらえますか？", "手伝えることがあればって、誰が言いましたか？", "困りましたね"]) {
      expect(isOfferHelp(text)).toBe(false);
      expect(recordPlayerUtterance(createEmptyLedger(), text)).toEqual(createEmptyLedger());
    }
  });

  it("the very next NPC line reflects the offer, keeps it attributed to the player, and keeps 文子's responsibility with 文子", async () => {
    const state = incidentState();
    const result = await resolveFreeText("fumiko", "説明を手伝いますよ", state, {
      interpreter: null,
      consentAccepted: false,
      ledger: syncLedgerWithState(createEmptyLedger(), state),
    });
    expect(result.source).toBe("deterministic");
    expect(result.text).toContain("説明を手伝ってくれる");
    expect(result.text).toContain("掲示の訂正");
    expect(result.text).toContain("私の担当");
    expect(result.ledger!.offers.map((o) => o.actor)).toEqual(["player"]);
    expect(violationCodes(result.text, "fumiko", result.ledger!)).toEqual([]);
  });

  it("the offer persists into the following turn's snapshot", async () => {
    const state = incidentState();
    const t1 = await resolveFreeText("fumiko", "説明を手伝いますよ", state, {
      interpreter: null,
      consentAccepted: false,
      ledger: syncLedgerWithState(createEmptyLedger(), state),
    });
    const { interpreter, calls } = scripted([GOOD_LINE]);
    await resolveFreeText("miyoko", AMBIGUOUS_QUESTION, state, { interpreter, consentAccepted: true, ledger: t1.ledger });
    expect(calls[0].snapshot.ledger!.offers.find((o) => o.text.includes("説明を手伝います"))?.actor).toBe("player");
  });

  it("an offer used to fall to a clarification/flavor line; a fact question still wins over the offer act", () => {
    expect(answerFreeText("miyoko", "席のこと、手伝いましょうか？", createInitialState())).not.toBe(clarificationLine("miyoko"));
    expect(answerFreeText("hina", "どんな焼き菓子を売ってるの?", createInitialState())).toContain("スコーン");
  });
});

describe("TEST-E: promises and responsibility owners survive 10+ turns", () => {
  it("keeps the important offer, permission and responsibility across 14 turns of mixed input", async () => {
    let state = incidentState();
    let ledger = incidentLedger();
    const lines = [
      "こんにちは", "何を売ってるの？", "口調が堅苦しいよ", "ありがとう", "予約はいくつ？", "困りましたね",
      "今日は暑いですね", "席は何席ですか？", "なるほど", "昨日はどうでしたか？", "説明を手伝いますよ", "そうですね",
      "またね", "工房は貸してもらえますか？",
    ];
    for (const [i, text] of lines.entries()) {
      const npc = NPC_IDS[i % NPC_IDS.length];
      const r = await resolveFreeText(npc, text, state, { interpreter: null, consentAccepted: false, ledger });
      ledger = r.ledger!;
      if (i === 6) state = { ...state, day: state.day + 1 };
    }
    expect(ledger.offers.some((o) => o.actor === "player" && o.text.includes("何か手伝えることがあれば"))).toBe(true);
    expect(ledger.offers.some((o) => o.actor === "player" && o.text.includes("説明を手伝います"))).toBe(true);
    expect(ledger.permissions.find((p) => p.owner === "miyoko")?.granted).toBe(false);
    expect(ledger.responsibilities.some((r) => r.owner === "fumiko" && r.task.includes("説明"))).toBe(true);
    // ...and the gate still uses them at turn 15
    expect(violationCodes(BAD_LINE, "miyoko", ledger)).toContain("quote_speaker_mismatch");
  });

  it("state-derived facts are never evicted by conversation volume", () => {
    let l = syncLedgerWithState(createEmptyLedger(), incidentState());
    for (let i = 0; i < 30; i += 1) l = addOffer(l, "player", `${i}番目の手伝えることがあれば`, ["手伝"]);
    l = syncLedgerWithState(l, incidentState());
    expect(l.permissions.find((p) => p.owner === "miyoko")?.granted).toBe(false);
    expect(l.facts.some((f) => f.actor === "fumiko" && f.kind === "did")).toBe(true);
  });
});

describe("TEST-F: existing natural deterministic dialogue is not damaged by the gate", () => {
  const inputs = [
    "こんにちは", "どんな焼き菓子を売ってるの?", "予約は何点?", "席は何席ですか", "工房は借りられる？", "昨日はどうだった？",
    "儲かってる？", "口調が堅苦しいよ", "美味しい", "ありがとう", "またね", "困りましたね", "説明を手伝いますよ", "この町の好きなところは？",
    "もう一回言って",
  ];

  it("every deterministic NPC line, for every NPC and input, passes the attribution gate against the incident ledger", () => {
    const state = { ...incidentState(), day: 25 };
    const ledger = syncLedgerWithState(incidentLedger(), state);
    for (const npc of NPC_IDS) {
      for (const text of inputs) {
        const line = answerFreeText(npc, text, state, ledger);
        expect(checkAttribution(line, npc, ledger), `${npc} / ${text} → ${line}`).toEqual([]);
      }
    }
  });

  it("an ordinary in-voice semantic line about an unrelated topic is accepted", () => {
    for (const [npc, line] of [
      ["hina", "レシピと焼き上がりはかなり見ています。"],
      ["yohei", "数は先に確かめる。約束は約束だ。"],
      ["miyoko", "座る前に、ちょっと聞いて。お昼はあと何人来るかしら。"],
      ["fumiko", "まず担当と期限を確認しましょう。掲示は私が最終確認するわ。"],
    ] as [NpcId, string][]) {
      expect(violationCodes(line, npc)).toEqual([]);
    }
  });
});

describe("server (functions/newlife-dialogue/lib.js) carries and bounds the ledger", () => {
  const snapshot = () => ({
    npc: "miyoko",
    day: 10,
    known: {},
    unknown: [],
    negativeConstraints: [],
    ledger: compactLedger(incidentLedger()),
  });

  it("accepts a compact ledger and a bounded feedback array", () => {
    expect(lib.validateInput({ utterance: "こんにちは", snapshot: snapshot(), feedback: ["理由"] })).toBeNull();
    expect(lib.validateInput({ utterance: "こんにちは", snapshot: { ...snapshot(), ledger: undefined } })).toBeNull();
  });

  it("rejects an oversized or malformed ledger / feedback", () => {
    const big = snapshot();
    big.ledger.offers = Array.from({ length: 17 }, () => ({ id: "x", actor: "player", text: "a", keys: [] })) as never;
    expect(lib.validateInput({ utterance: "a", snapshot: big })).toBe("invalid_ledger");
    const badActor = snapshot();
    badActor.ledger.offers = [{ id: "x", actor: "mallory", text: "a", keys: [] }] as never;
    expect(lib.validateInput({ utterance: "a", snapshot: badActor })).toBe("invalid_ledger");
    const longText = snapshot();
    longText.ledger.unresolved = [{ id: "x", text: "あ".repeat(81), keys: [] }] as never;
    expect(lib.validateInput({ utterance: "a", snapshot: longText })).toBe("invalid_ledger");
    expect(lib.validateInput({ utterance: "a", snapshot: snapshot(), feedback: "x" })).toBe("invalid_feedback");
    expect(lib.validateInput({ utterance: "a", snapshot: snapshot(), feedback: ["a", "b", "c", "d", "e"] })).toBe("invalid_feedback");
  });

  it("the prompt includes the ledger and feedback, and the system instruction states the ownership rules", () => {
    const s = snapshot();
    const prompt = lib.buildPrompt("miyoko", "こんにちは", s, ["前回の誤り"]);
    expect(prompt).toContain(JSON.stringify(s.ledger));
    expect(prompt).toContain("前回の誤り");
    expect(lib.buildPrompt("miyoko", "こんにちは", { ...s, ledger: undefined })).not.toContain("会話の事実台帳");
    expect(lib.SYSTEM_INSTRUCTION).toMatch(/actor \/ owner を絶対に入れ替えない/);
    expect(lib.SYSTEM_INSTRUCTION).toMatch(/granted が false/);
  });
});

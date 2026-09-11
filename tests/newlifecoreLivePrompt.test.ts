import { describe, expect, it } from "vitest";
import { buildNpcAiContext } from "../src/newlifecore/dialogue/contextBuilder";
import { NPC_DEFS } from "../src/newlifecore/npcDefs";
import { createInitialCoreState, type NpcId } from "../src/newlifecore/types";
// The live prompt builder is a plain-JS, server-only module (never bundled into the client --
// tests/safety.test.ts guards that) but is pure/side-effect-free at import time (the only
// side-effecting call, execSync("gcloud ..."), happens lazily inside getAccessToken(), never at
// module load), so importing it here to test its real prompt STRING is safe and accurate --
// not a second, hand-copied re-implementation of the prompt logic.
// @ts-expect-error -- untyped plain-JS dev-only module (same pattern as vite.config.ts's own import of it)
import { buildPrompt } from "../devtools/newlifeCoreVertexLiveAdapterCore.mjs";

const ALL_NPCS: NpcId[] = ["kamiya", "yohei", "miyoko", "jin", "daisuke"];

describe("NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1: NPC private context isolation (Section 5 -- structural guarantee, regression test)", () => {
  it("no NPC's built AI context or its real live prompt ever contains another NPC's hiddenBackground text", () => {
    const state = createInitialCoreState();
    for (const npc of ALL_NPCS) {
      const ctx = buildNpcAiContext(npc, state, "何か困っていることはありますか");
      const prompt = buildPrompt(ctx);
      for (const other of ALL_NPCS) {
        if (other === npc) continue;
        const hb = NPC_DEFS[other].hiddenBackground;
        for (const field of Object.values(hb)) {
          expect(prompt, `${npc}'s prompt must never contain ${other}'s hiddenBackground text`).not.toContain(field);
        }
        // The specific Owner-observed collision (Kamiya's own desk-prop detail appearing in
        // another NPC's reply) -- pinned directly so this exact regression cannot silently recur.
        if (other === "kamiya") {
          expect(prompt).not.toContain("赤い付箋");
        }
      }
    }
  });

  it("this holds across every NPC pair, not just kamiya->others (symmetric structural check)", () => {
    const state = createInitialCoreState();
    const contexts = Object.fromEntries(ALL_NPCS.map((npc) => [npc, buildNpcAiContext(npc, state, "test")]));
    for (const npc of ALL_NPCS) {
      const json = JSON.stringify(contexts[npc]);
      for (const other of ALL_NPCS) {
        if (other === npc) continue;
        expect(json).not.toContain(NPC_DEFS[other].hiddenBackground.currentPressure);
        expect(json).not.toContain(NPC_DEFS[other].hiddenBackground.whatTheyDoNotWantToSay);
      }
    }
  });
});

describe("NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1: dialogue precision instructions are real prompt content, not just intent", () => {
  it("the prompt instructs answering a direct question first, before unsolicited elaboration", () => {
    const ctx = buildNpcAiContext("miyoko", createInitialCoreState(), "この町でいってみたほうが良いところありますか");
    const prompt = buildPrompt(ctx);
    expect(prompt).toMatch(/まずその質問そのものに直接答える/);
    expect(prompt).toMatch(/聞かれてもいない情報/);
  });

  it("the prompt tells the model not to repeat its own immediately-previous line, and includes that exact previous line for reference", () => {
    const state = createInitialCoreState();
    const ctx = buildNpcAiContext("jin", state, "器用なんですね");
    // Simulate one prior turn the same way engine.ts's recordConversationTurn would store it.
    const withMemory = { ...ctx, memoryOfPlayer: [{ time: 500, playerUtterance: "洋平の棚、助かりました", npcReply: "おう。洋平の棚、助かった。夕方、また顔出す" }] };
    const prompt = buildPrompt(withMemory);
    expect(prompt).toMatch(/繰り返さないこと/);
    expect(prompt).toContain("おう。洋平の棚、助かった。夕方、また顔出す");
  });

  it("stage-direction frequency is explicitly bounded, not merely allowed", () => {
    const ctx = buildNpcAiContext("kamiya", createInitialCoreState(), "こんにちは");
    const prompt = buildPrompt(ctx);
    expect(prompt).toMatch(/毎回使わないこと/);
  });

  it("physical-prop/environment invention outside the NPC's own established setting is explicitly forbidden", () => {
    const ctx = buildNpcAiContext("miyoko", createInitialCoreState(), "何かイベントないですか");
    const prompt = buildPrompt(ctx);
    expect(prompt).toMatch(/新しく発明してはいけません/);
  });

  it("transactions cannot be completed by dialogue alone -- the prompt says so explicitly", () => {
    const ctx = buildNpcAiContext("yohei", createInitialCoreState(), "お米とお肉、野菜ください");
    const prompt = buildPrompt(ctx);
    expect(prompt).toMatch(/取引そのものを完結させないでください/);
  });
});

describe("PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1: the Thinking Resident's prompt is distinct and non-clinical (Section F/G)", () => {
  it("Daisuke's prompt explicitly forbids clinical/professional framing and any single fixed closing pattern", () => {
    const ctx = buildNpcAiContext("daisuke", createInitialCoreState(), "最近、仕事を先延ばしにしています");
    const prompt = buildPrompt(ctx);
    expect(prompt).toMatch(/医療従事者・心理士・カウンセラー・セラピストではなく/);
    expect(prompt).toMatch(/「カウンセリング」「セラピー」「診断」「認知行動療法」「治療」「症状」「病気」/);
    expect(prompt).toMatch(/一切使わないでください/);
    expect(prompt).toMatch(/毎回、聞く→まとめる→行動提案、という同じパターンで終わらせてはいけません/);
  });

  it("Daisuke's prompt still carries the same banned-AI-assistant-phrase list every other NPC gets", () => {
    const ctx = buildNpcAiContext("daisuke", createInitialCoreState(), "こんにちは");
    const prompt = buildPrompt(ctx);
    expect(prompt).toMatch(/なるほど」「それは大変ですね」「つまり〜ということですね」/);
  });

  it("a normal NPC's prompt (e.g. Kamiya) never contains the Thinking Resident's clinical-framing instructions", () => {
    const ctx = buildNpcAiContext("kamiya", createInitialCoreState(), "こんにちは");
    const prompt = buildPrompt(ctx);
    expect(prompt).not.toMatch(/医療従事者・心理士・カウンセラー・セラピスト/);
    expect(prompt).not.toMatch(/思考整理の扱い方/);
  });

  it("Daisuke's prompt includes his own hiddenBackground and never presents him as omniscient about the player's inner life -- shares the standard 'don't read the player's mind' rule", () => {
    const ctx = buildNpcAiContext("daisuke", createInitialCoreState(), "こんにちは");
    const prompt = buildPrompt(ctx);
    expect(prompt).toMatch(/改装するかどうかを10年近く迷い続けている/);
    expect(prompt).toMatch(/まだ起きていないことを知っているように振る舞ってはいけません/);
  });
});

describe("PHASE_12_4_NEW_LIFE_WORLD_DEPTH_AND_CONVERSATION_QUALITY_V1: Thinking Resident quality gate (Section 9/10/11)", () => {
  it("the prompt requires picking up at least one input-specific detail, and pins the exact PHASE 12.3 generic-normalization example as the FAIL case to avoid", () => {
    const ctx = buildNpcAiContext("daisuke", createInitialCoreState(), "最近、仕事を先延ばしにしています");
    const prompt = buildPrompt(ctx);
    expect(prompt).toMatch(/必ず最低1つ、その人[\s\S]*固有の言葉・状況・言い回しを拾ってください/);
    expect(prompt).toMatch(/一般論だけで終わらせてはいけません/);
    expect(prompt).toMatch(/先延ばし、ね。まあ、誰にでもありますよ、そ[\s\S]*ういうことは。/);
  });

  it("the prompt instructs identify-before-advise for ambiguous concerns, with at most one non-leading distinguishing question, and explicitly forbids a fixed template wording", () => {
    const ctx = buildNpcAiContext("daisuke", createInitialCoreState(), "なんとなくやる気が出ません");
    const prompt = buildPrompt(ctx);
    expect(prompt).toMatch(/曖昧な相談には、すぐ行動提案しないこと/);
    expect(prompt).toMatch(/識別質問（最大1つ）/);
    expect(prompt).toMatch(/固定テンプレにしないこと/);
    expect(prompt).toMatch(/誘導質問[\s\S]*は禁止/);
  });

  it("the prompt lists the generic-phrase fail set explicitly, framed as conditional-on-genericness rather than an outright ban", () => {
    const ctx = buildNpcAiContext("daisuke", createInitialCoreState(), "こんにちは");
    const prompt = buildPrompt(ctx);
    for (const phrase of ["誰にでもあります", "無理しないでください", "一歩ずつ", "自分を責めないで", "素晴らしいですね", "それは大変でしたね", "まずは小さな一歩から"]) {
      expect(prompt).toContain(phrase);
    }
    expect(prompt).toMatch(/全面禁止ではありません/);
    expect(prompt).toMatch(/固有の言葉を\s*拾わずにこれらだけで返答を済ませるのはFAIL/);
  });
});

describe("NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1: bounded menu is real prompt content for shop NPCs only", () => {
  it("Miyoko's prompt lists her real menu; Kamiya's prompt states he has no shop", () => {
    const state = createInitialCoreState();
    const miyokoPrompt = buildPrompt(buildNpcAiContext("miyoko", state, "メニューありますか"));
    expect(miyokoPrompt).toMatch(/トースト/);
    expect(miyokoPrompt).toMatch(/ホットサンド/);
    expect(miyokoPrompt).not.toMatch(/焼きそば/);

    const kamiyaPrompt = buildPrompt(buildNpcAiContext("kamiya", state, "メニューありますか"));
    expect(kamiyaPrompt).toMatch(/この人物は店を持たない/);
  });

  it("Yohei's prompt lists his real goods, distinct from Miyoko's cafe menu", () => {
    const prompt = buildPrompt(buildNpcAiContext("yohei", createInitialCoreState(), "何を売ってますか"));
    expect(prompt).toMatch(/米（1袋）/);
    expect(prompt).not.toMatch(/ホットサンド/);
  });
});

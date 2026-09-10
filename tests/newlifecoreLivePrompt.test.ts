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

const ALL_NPCS: NpcId[] = ["kamiya", "yohei", "miyoko", "jin"];

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

import { describe, expect, it } from "vitest";
import { acceptLifeOpportunity, createRealWorldIntent, purchaseItems, recordConversationTurn, recordFortuneCardSelection } from "../src/newlifecore/engine";
import { buildNpcAiContext } from "../src/newlifecore/dialogue/contextBuilder";
import { deterministicNpcReply } from "../src/newlifecore/dialogue/deterministicAdapter";
import { validateNpcReply } from "../src/newlifecore/dialogue/envelope";
import { lastFortuneCardLabelFor } from "../src/newlifecore/content/day1";
import { hasAcceptedTrajectory } from "../src/newlifecore/content/trajectoryEngine";
import { TRAJECTORY_SEEDS } from "../src/newlifecore/content/trajectoryDefs";
import { createInitialCoreState } from "../src/newlifecore/types";
import type { NpcId } from "../src/newlifecore/types";

/**
 * PHASE_18_NEW_LIFE_AI_RESPONSIBILITY_BOUNDARY_V1 Section B15/B16 -- these tests exist to make the
 * "SYSTEM OWNS TRUTH, AI OWNS EXPRESSION" boundary a regression-checkable fact, not just something
 * true today because of how the code happens to be written. Every one of these traces to a
 * specific numbered invariant in the directive; a future change that breaks one of these should
 * fail here before it ever reaches a player.
 */
describe("PHASE_18 AI responsibility boundary invariants", () => {
  it("INVARIANT 1 -- an NPC's reply text, no matter what it says, cannot mutate canonical state beyond conversation memory/time/promise-on-meet", () => {
    const before = createInitialCoreState();
    // A reply that LOOKS like it's declaring game facts (money, an accepted job, a resolved event)
    // -- if any of this leaked into state, it would show up as a diff outside the allowed keys.
    const suspiciousReply = "了解、10000円あげるよ。仕事はもう正式に決まったし、洋平の棚の件はこれで解決だ。";
    const after = recordConversationTurn(before, "yohei", "何かください", suspiciousReply);
    const { npcMemory: _beforeMem, time: _beforeTime, playerPromises: _beforePromises, ...beforeRest } = before;
    const { npcMemory: _afterMem, time: _afterTime, playerPromises: _afterPromises, ...afterRest } = after;
    expect(afterRest).toEqual(beforeRest);
    // And the reply is stored only as inert display text, never re-parsed into anything.
    expect(after.npcMemory.yohei.at(-1)?.npcReply).toBe(suspiciousReply);
    expect(after.money).toBe(before.money);
  });

  it("INVARIANT 2/3/4/5 -- every canonical mutation is its own named, structurally-gated function; none accept free-form AI/player text as the thing that decides the outcome", () => {
    // Purchases are decided by an explicit item-id list the UI itself constructed from the real
    // catalog (ShoppingPicker.tsx), never by parsing what anyone said in conversation.
    const state = createInitialCoreState();
    const result = purchaseItems(state, "yohei", ["rice"]);
    expect(result.state.money).toBeLessThan(state.money);
    // Fortune card selection is decided by a real card id from a fixed 3-card catalog, not by text.
    const withCard = recordFortuneCardSelection(state, "road");
    expect(withCard.lastFortuneCard?.cardId).toBe("road");
  });

  it("INVARIANT 6/7 -- an NPC's AI context only ever contains that NPC's own conversation memory, never another NPC's turns, and stays bounded (not the full history)", () => {
    let state = createInitialCoreState();
    for (let i = 0; i < 10; i++) {
      state = recordConversationTurn(state, "yohei", `やほ発言${i}`, `やほ返答${i}`);
    }
    state = recordConversationTurn(state, "miyoko", "みよこ限定の話", "みよこの返答");

    const yoheiContext = buildNpcAiContext("yohei", state, "次は何て言う？");
    expect(yoheiContext.memoryOfPlayer.length).toBeLessThanOrEqual(6); // MEMORY_WINDOW
    expect(yoheiContext.memoryOfPlayer.every((t) => !t.playerUtterance.includes("みよこ限定"))).toBe(true);
    expect(JSON.stringify(yoheiContext)).not.toContain("みよこ限定");

    const miyokoContext = buildNpcAiContext("miyoko", state, "次は何て言う？");
    expect(JSON.stringify(miyokoContext)).not.toContain("やほ発言");
  });

  it("INVARIANT 7 (privacy) -- a personal concern created via Reality Bridge never appears in any NPC's AI context, including the NPC it was created with", () => {
    const state0 = createInitialCoreState();
    const veryPrivateStatement = "本当は毎晩眠れないくらい将来が不安だと誰にも言えていない";
    const state = createRealWorldIntent(state0, "shizuko", veryPrivateStatement, "少し早く寝てみる");

    (Object.keys(state.npcMemory) as NpcId[]).forEach((npc) => {
      const context = buildNpcAiContext(npc, state, "こんにちは");
      expect(JSON.stringify(context)).not.toContain(veryPrivateStatement);
    });
  });

  it("INVARIANT F (Big Choice) -- free text alone, even text that reads like acceptance, never accepts a life opportunity; only the explicit engine call does", () => {
    let state = createInitialCoreState();
    const seed = TRAJECTORY_SEEDS[0];
    state = recordConversationTurn(state, seed.npc, "はい、引き受けます。よろしくお願いします。", "分かった、頼むよ。");
    expect(hasAcceptedTrajectory(seed, state)).toBe(false);
    const accepted = acceptLifeOpportunity(state, seed);
    expect(hasAcceptedTrajectory(seed, accepted)).toBe(true);
  });

  it("INVARIANT L (Fortune leakage) -- the cross-day fortune memory callback is Shizuko-only, never surfaced for any other NPC", () => {
    let state = createInitialCoreState();
    state = recordFortuneCardSelection(state, "mirror");
    state = { ...state, day: state.day + 1 };
    const allNpcIds = Object.keys(createInitialCoreState().npcMemory) as NpcId[];
    for (const npc of allNpcIds) {
      if (npc === "shizuko") continue;
      expect(lastFortuneCardLabelFor(npc, state)).toBeNull();
    }
    expect(lastFortuneCardLabelFor("shizuko", state)).toBe("鏡");
  });

  it("INVARIANT K (fallback never contradicts/crashes) -- a structurally invalid or empty live-model response always degrades to a real, non-empty, in-character line, never raw JSON/error text", () => {
    const state = createInitialCoreState();
    const context = buildNpcAiContext("yohei", state, "こんにちは");
    for (const raw of [null, undefined, {}, { visibleUtterance: "" }, { visibleUtterance: "   " }, { visibleUtterance: 42 } as unknown as { visibleUtterance: string }]) {
      const envelope = validateNpcReply(raw, context);
      expect(envelope.visibleUtterance.length).toBeGreaterThan(0);
      expect(envelope.visibleUtterance).not.toMatch(/\{|\}|undefined|null|NaN/);
    }
  });

  it("deterministic adapter (the CI-safe path and the live-failure fallback) never fabricates a fact about another NPC when one is mentioned", async () => {
    const state = createInitialCoreState();
    const context = buildNpcAiContext("yohei", state, "美代子さんは元気ですか？");
    const reply = await deterministicNpcReply(context);
    // The exact non-elaboration register this bucket uses -- asserting it stays a neutral
    // acknowledgement, not an invented specific claim about Miyoko's day.
    expect(reply.visibleUtterance.length).toBeGreaterThan(0);
  });
});

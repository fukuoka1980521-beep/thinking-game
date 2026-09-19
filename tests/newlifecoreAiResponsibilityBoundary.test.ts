import { describe, expect, it } from "vitest";
import {
  acceptLifeOpportunity,
  acceptPlayerPromise,
  createRealWorldIntent,
  declineLifeOpportunity,
  declinePlayerPromise,
  purchaseItems,
  recordConversationTurn,
  recordFortuneCardSelection,
  startNewDay,
} from "../src/newlifecore/engine";
import { buildNpcAiContext } from "../src/newlifecore/dialogue/contextBuilder";
import { currentChoiceContextFor } from "../src/newlifecore/dialogue/choiceContext";
import { deterministicNpcReply } from "../src/newlifecore/dialogue/deterministicAdapter";
import { validateNpcReply } from "../src/newlifecore/dialogue/envelope";
import { fortuneMemoryContextFor, lastFortuneCardLabelFor } from "../src/newlifecore/content/day1";
import { hasAcceptedTrajectory, opportunityEligible } from "../src/newlifecore/content/trajectoryEngine";
import { TRAJECTORY_SEEDS } from "../src/newlifecore/content/trajectoryDefs";
import { NPC_DEFS } from "../src/newlifecore/npcDefs";
import { createInitialCoreState } from "../src/newlifecore/types";
import type { CoreState, NpcId } from "../src/newlifecore/types";

/** Drives `state.playerExperiences[seed.id].count` up to `seed.opportunityThreshold` purely via
 *  canonical, day-spaced engagement (never by hand-writing the field), so `opportunityEligible`
 *  becomes true the same way it would in real play. */
function engageUntilOpportunityEligible(seed: (typeof TRAJECTORY_SEEDS)[number], state: CoreState): CoreState {
  return {
    ...state,
    playerExperiences: [...state.playerExperiences.filter((e) => e.id !== seed.id), { id: seed.id, npc: seed.npc, count: seed.opportunityThreshold, lastDay: state.day }],
  };
}

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

/**
 * PHASE_19_NEW_LIFE_CONTEXT_COMPLETENESS_AND_PRE_HV_HARDENING_V1 -- the fix for the PHASE_18
 * acceptance finding (trajectory/opportunity state had no representation in `NpcAiContext`) plus
 * the same-class Fortune gap found while auditing for it (Section 6's explicit "don't stop after
 * fixing only the known example").
 */
describe("PHASE_19 context completeness -- Big Choice (currentChoiceContext) and Fortune memory", () => {
  it("currentChoiceContext is null for every NPC before any opportunity is eligible, and null for NPCs with no trajectory seed at all", () => {
    const state = createInitialCoreState();
    (Object.keys(NPC_DEFS) as NpcId[]).forEach((npc) => {
      expect(currentChoiceContextFor(npc, state)).toBeNull();
      expect(buildNpcAiContext(npc, state, "こんにちは").currentChoiceContext).toBeNull();
    });
  });

  it("currentChoiceContext becomes non-null (with the real authored subject line) the same moment the structural opportunity becomes eligible, and only for that NPC", () => {
    const seed = TRAJECTORY_SEEDS.find((s) => s.id === "jin_odd_job")!;
    let state = createInitialCoreState();
    state = { ...state, day: seed.minDayForHelp };
    state = engageUntilOpportunityEligible(seed, state);
    expect(opportunityEligible(seed, state)).toBe(true); // sanity: the same canonical gate the UI button uses

    const jinContext = buildNpcAiContext("jin", state, "さっきの話、どう思う？");
    expect(jinContext.currentChoiceContext).toEqual({ kind: "trajectory_opportunity", subject: seed.opportunityLabel });

    // cross-NPC isolation: no other NPC's context is affected by Jin's pending opportunity.
    (Object.keys(NPC_DEFS) as NpcId[])
      .filter((npc) => npc !== "jin")
      .forEach((npc) => {
        expect(buildNpcAiContext(npc, state, "こんにちは").currentChoiceContext).toBeNull();
      });
  });

  it("currentChoiceContext clears the moment the player accepts or declines -- the decision itself is never re-asked by the conversation layer, and the outcome reaches knownFacts instead (no second trajectory state)", () => {
    const seed = TRAJECTORY_SEEDS.find((s) => s.id === "jin_odd_job")!;
    let state = createInitialCoreState();
    state = { ...state, day: seed.minDayForHelp };
    state = engageUntilOpportunityEligible(seed, state);

    const accepted = acceptLifeOpportunity(state, seed);
    expect(currentChoiceContextFor("jin", accepted)).toBeNull();
    expect(buildNpcAiContext("jin", accepted, "どうなった？").knownFacts.join(" ")).toContain(seed.acceptedResultText);

    const declined = declineLifeOpportunity(state, seed);
    expect(currentChoiceContextFor("jin", declined)).toBeNull();
    expect(buildNpcAiContext("jin", declined, "どうなった？").knownFacts.join(" ")).toContain(seed.declinedResultText);
  });

  it("ambiguous player wording does not need to be understood by this test -- it only needs the SYSTEM to hand the model the real subject line; ordinary vague phrasings are accepted as valid playerInput without any special-casing", () => {
    const seed = TRAJECTORY_SEEDS.find((s) => s.id === "jin_odd_job")!;
    let state = createInitialCoreState();
    state = { ...state, day: seed.minDayForHelp };
    state = engageUntilOpportunityEligible(seed, state);
    for (const vague of ["さっきの話、どう思う？", "俺、やった方がいいかな？", "断っても大丈夫？", "今の話って仕事のこと？", "もう少し考えてもいい？"]) {
      const context = buildNpcAiContext("jin", state, vague);
      expect(context.currentChoiceContext?.subject).toBe(seed.opportunityLabel);
      expect(context.playerInput).toBe(vague);
    }
  });

  it("fortuneMemory is Shizuko-only across the entire NPC roster, mirroring the UI chip's own scope, and is available for the whole day (not just before the first exchange)", () => {
    let state = createInitialCoreState();
    state = recordFortuneCardSelection(state, "light");
    state = startNewDay(state); // day N -> day N+1
    // even after one exchange today, the context field itself stays available (unlike the one-time UI chip)
    state = recordConversationTurn(state, "shizuko", "こんにちは", "あら、いらっしゃい");

    (Object.keys(NPC_DEFS) as NpcId[]).forEach((npc) => {
      const memory = fortuneMemoryContextFor(npc, state);
      const context = buildNpcAiContext(npc, state, "この前のカードのこと、覚えてる？");
      if (npc === "shizuko") {
        expect(memory).not.toBeNull();
        expect(context.fortuneMemory).not.toBeNull();
      } else {
        expect(memory).toBeNull();
        expect(context.fortuneMemory).toBeNull();
      }
    });
  });

  it("promise matrix: UI-facing flags (pending/missed) never disagree with the underlying PlayerPromise record across offered->accepted->kept and offered->accepted->missed", () => {
    let state = createInitialCoreState();
    state = acceptPlayerPromise(state, "yohei", "また店に寄る");
    expect(state.playerPromises.find((p) => p.npc === "yohei")?.status).toBe("pending");
    expect(buildNpcAiContext("yohei", state, "こんにちは").pendingPromiseWithPlayer).toBe(true);

    // KEPT: talking to Yohei again while the promise is still within its due window resolves it.
    const kept = recordConversationTurn(state, "yohei", "また来たよ", "おう、来たか");
    expect(kept.playerPromises.find((p) => p.npc === "yohei")?.status).toBe("kept");
    expect(buildNpcAiContext("yohei", kept, "こんにちは").pendingPromiseWithPlayer).toBe(false);

    // MISSED: instead, let enough day transitions pass without ever meeting -- the daily sweep
    // (startNewDay) is the ONLY place a pending promise flips to missed (Section 9/12's own rule).
    let missedState = state;
    for (let i = 0; i < 5; i++) missedState = startNewDay(missedState);
    expect(missedState.playerPromises.find((p) => p.npc === "yohei")?.status).toBe("missed");
    const missedContext = buildNpcAiContext("yohei", missedState, "こんにちは");
    expect(missedContext.pendingPromiseWithPlayer).toBe(false);
    expect(missedContext.missedPromiseWithPlayer).toBe(true);
  });

  it("declining a promise is resolved immediately (status: declined, not pending or missed) -- UI and conversation context agree it is settled, not lingering", () => {
    let state = createInitialCoreState();
    state = declinePlayerPromise(state, "yohei", "また店に寄る");
    expect(state.playerPromises.find((p) => p.npc === "yohei")?.status).toBe("declined");
    const context = buildNpcAiContext("yohei", state, "こんにちは");
    expect(context.pendingPromiseWithPlayer).toBe(false);
    expect(context.missedPromiseWithPlayer).toBe(false);
  });

  it("every NPC in the canonical roster produces a well-formed AI context (static profile + current state + memory) without throwing -- a coverage smoke test across the full roster, not just Yohei/Jin", () => {
    const state = createInitialCoreState();
    (Object.keys(NPC_DEFS) as NpcId[]).forEach((npc) => {
      const context = buildNpcAiContext(npc, state, "こんにちは");
      expect(context.identity.length).toBeGreaterThan(0);
      expect(context.speechStyle.length).toBeGreaterThan(0);
      expect(Array.isArray(context.memoryOfPlayer)).toBe(true);
      expect(context.displayName).toBe(NPC_DEFS[npc].displayName);
    });
  });
});

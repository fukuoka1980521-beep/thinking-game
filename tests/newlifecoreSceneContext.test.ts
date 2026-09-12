import { describe, expect, it } from "vitest";
import { createInitialCoreState } from "../src/newlifecore/types";
import { localProblemById } from "../src/newlifecore/content/localProblemDefs";
import { eventThreadById } from "../src/newlifecore/content/eventThreadDefs";
import { discoverEventThread, discoverLocalProblem, progressEventThread, respondToLocalProblemHelp } from "../src/newlifecore/engine";
import { activeEventContextFor, recentActivitiesToday, recentSharedEventsToday, unresolvedThreadsKnown } from "../src/newlifecore/dialogue/sceneContext";
import { buildNpcAiContext } from "../src/newlifecore/dialogue/contextBuilder";
import type { CoreState } from "../src/newlifecore/types";

function atDay(day: number, time?: number): CoreState {
  const s = createInitialCoreState();
  return { ...s, day, time: time ?? s.time };
}

const kiyoshiDeliveryDef = localProblemById("yohei_kiyoshi_delivery")!;
const kiyoshiThread = eventThreadById("kiyoshi_old_colleague")!;

describe("PHASE_16_NEW_LIFE_GAME_IDENTITY_REBUILD_V1 Section 7-10: live-prompt scene/event context", () => {
  it("carries nothing when no event is open with this NPC (null is a normal, valid state)", () => {
    const state = atDay(1);
    expect(activeEventContextFor("yohei", state)).toEqual({ currentEvent: null, eventState: null, whatJustHappened: null });
  });

  it("the Owner's own reported scenario -- discovering the Kiyoshi rice-bag local problem via Yohei TODAY grounds Yohei's own prompt context with a real, specific event, eventState, and whatJustHappened", () => {
    let state = atDay(kiyoshiDeliveryDef.minDay, 10 * 60 + 15);
    state = discoverLocalProblem(state, kiyoshiDeliveryDef);
    const ctx = activeEventContextFor("yohei", state);
    expect(ctx.currentEvent).toBe(kiyoshiDeliveryDef.discoverResultText);
    expect(ctx.eventState).toBe("さっき知ったばかりだ");
    expect(ctx.whatJustHappened).toBe(kiyoshiDeliveryDef.discoverResultText);
  });

  it("after actually helping (player_helped), eventState/whatJustHappened reflect the HELP action, not the original discovery -- this is what gives a reply like 'まあ、助かった' a real referent", () => {
    let state = atDay(kiyoshiDeliveryDef.minDay, 10 * 60 + 15);
    state = discoverLocalProblem(state, kiyoshiDeliveryDef);
    state = respondToLocalProblemHelp(state, kiyoshiDeliveryDef);
    const ctx = activeEventContextFor("yohei", state);
    expect(ctx.eventState).toBe("力になろうとしたところだ");
    expect(ctx.whatJustHappened).toBe(kiyoshiDeliveryDef.helpResultText);
  });

  it("goes quiet again once the problem is fully RESOLVED (not 'current' anymore, matches Section 7's own scoping)", () => {
    let state = atDay(kiyoshiDeliveryDef.minDay, 10 * 60 + 15);
    state = discoverLocalProblem(state, kiyoshiDeliveryDef);
    state = respondToLocalProblemHelp(state, kiyoshiDeliveryDef);
    state = { ...state, localProblemStatus: { ...state.localProblemStatus, [kiyoshiDeliveryDef.id]: "resolved" } };
    expect(activeEventContextFor("yohei", state).currentEvent).toBeNull();
  });

  it("goes quiet on a LATER day the player never touched it again (never stale-forever, matches the discover/help day-scoping)", () => {
    let state = atDay(kiyoshiDeliveryDef.minDay, 10 * 60 + 15);
    state = discoverLocalProblem(state, kiyoshiDeliveryDef);
    state = { ...state, day: state.day + 3 };
    expect(activeEventContextFor("yohei", state).currentEvent).toBeNull();
  });

  it("also covers an open EVENT THREAD's own NPC (Kiyoshi's old-colleague thread)", () => {
    let state = atDay(kiyoshiThread.minDay, 10 * 60 + 15);
    state = discoverEventThread(state, kiyoshiThread);
    const ctx = activeEventContextFor("kiyoshi", state);
    expect(ctx.currentEvent).toBe(kiyoshiThread.discoverResultText);
    expect(ctx.whatJustHappened).toBe(kiyoshiThread.discoverResultText);
    state = { ...state, day: state.day + 2, time: 10 * 60 + 15 };
    state = progressEventThread(state, kiyoshiThread);
    const ctx2 = activeEventContextFor("kiyoshi", state);
    expect(ctx2.whatJustHappened).toBe(kiyoshiThread.stages[0].resultText);
  });

  it("unresolvedThreadsKnown surfaces an open thread's latest line even on a day it wasn't touched (so 'その後どう?' stays answerable)", () => {
    let state = atDay(kiyoshiThread.minDay, 10 * 60 + 15);
    state = discoverEventThread(state, kiyoshiThread);
    state = { ...state, day: state.day + 3 }; // quiet day, no progress
    expect(unresolvedThreadsKnown("kiyoshi", state)).toEqual([kiyoshiThread.discoverResultText]);
  });

  it("recentSharedEventsToday only returns today's shared_event facts known by this npc", () => {
    let state = atDay(kiyoshiDeliveryDef.minDay, 10 * 60 + 15);
    state = discoverLocalProblem(state, kiyoshiDeliveryDef);
    state = respondToLocalProblemHelp(state, kiyoshiDeliveryDef); // category: shared_event, knownBy yohei
    expect(recentSharedEventsToday("yohei", state)).toContain(kiyoshiDeliveryDef.helpResultText);
    expect(recentSharedEventsToday("miyoko", state)).toEqual([]);
  });

  it("recentActivitiesToday mirrors recentPurchasesToday's shape for activity sessions", () => {
    expect(recentActivitiesToday("jin", atDay(1))).toEqual([]);
  });

  it("buildNpcAiContext actually carries the new fields end to end", () => {
    let state = atDay(kiyoshiDeliveryDef.minDay, 10 * 60 + 15);
    state = discoverLocalProblem(state, kiyoshiDeliveryDef);
    const ctx = buildNpcAiContext("yohei", state, "清さんのこと、聞きました");
    expect(ctx.currentEvent).toBe(kiyoshiDeliveryDef.discoverResultText);
    expect(ctx.eventState).toBe("さっき知ったばかりだ");
    expect(Array.isArray(ctx.recentSharedEventsToday)).toBe(true);
    expect(Array.isArray(ctx.unresolvedThreadsKnown)).toBe(true);
    expect(Array.isArray(ctx.recentActivitiesToday)).toBe(true);
  });
});

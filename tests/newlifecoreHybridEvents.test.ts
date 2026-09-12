import { describe, expect, it } from "vitest";
import { createInitialCoreState } from "../src/newlifecore/types";
import { MOMENT_EVENT_DEFS, momentEventById } from "../src/newlifecore/content/momentEventDefs";
import { activeMomentEventAt, resolveMomentEventArrival } from "../src/newlifecore/content/momentEventEngine";
import { EVENT_THREAD_DEFS, eventThreadById } from "../src/newlifecore/content/eventThreadDefs";
import {
  dueEventThreadAutoResolutions,
  eventThreadDiscoverEligible,
  eventThreadNextStageEligible,
  eventThreadObservationEligible,
  eventThreadRuntimeState,
} from "../src/newlifecore/content/eventThreadEngine";
import { discoverEventThread, moveTo, progressEventThread, respondToMomentEvent, startNewDay } from "../src/newlifecore/engine";
import type { CoreState } from "../src/newlifecore/types";

function atDay(day: number, time?: number): CoreState {
  const s = createInitialCoreState();
  return { ...s, day, time: time ?? s.time };
}

const glove = momentEventById("moment_dropped_glove")!;
const direction = momentEventById("moment_stranger_asks_direction")!;
const kiyoshiThread = eventThreadById("kiyoshi_old_colleague")!;
const miyokoThread = eventThreadById("miyoko_old_photo")!;

describe("PHASE_15_NEW_LIFE_HYBRID_EVENT_AND_FORTUNE_HOUSE_V1 Section 9-24: MOMENT EVENTS", () => {
  it("ships at least 3 definitions, each with exactly 2 choices, never quest-board vocabulary", () => {
    expect(MOMENT_EVENT_DEFS.length).toBeGreaterThanOrEqual(3);
    const banned = ["クエスト", "ミッション", "報酬", "レベル", "経験値", "依頼一覧"];
    for (const def of MOMENT_EVENT_DEFS) {
      expect(def.choices.length).toBe(2);
      const allText = JSON.stringify(def);
      for (const word of banned) {
        expect(allText, `${def.id} must not contain "${word}"`).not.toContain(word);
      }
    }
  });

  it("resolveMomentEventArrival eventually shows a def at its own location across enough days (deterministic-but-varying, not never-firing)", () => {
    let state = atDay(glove.minDay, 9 * 60);
    let sawIt = false;
    for (let i = 0; i < 30 && !sawIt; i++) {
      state = { ...state, day: glove.minDay + i };
      state = resolveMomentEventArrival(state, "SHOPPING_STREET");
      if (activeMomentEventAt("SHOPPING_STREET", state)) sawIt = true;
    }
    expect(sawIt).toBe(true);
  });

  it("does nothing (pure no-op) at a location with no eligible def", () => {
    const state = atDay(1, 9 * 60);
    const next = resolveMomentEventArrival(state, "TRIAL_HOUSE");
    expect(next).toEqual(state);
  });

  it("once shown, stays active for the rest of that day and disappears the moment a choice is answered", () => {
    // Force a showing by scanning for a day this specific def's hash clears its own occurrenceChance gate.
    let shownDay = -1;
    let state = atDay(direction.minDay, 9 * 60);
    for (let d = direction.minDay; d < direction.minDay + 40; d++) {
      const probe = resolveMomentEventArrival({ ...state, day: d }, "COMMUNITY_HALL");
      if (activeMomentEventAt("COMMUNITY_HALL", probe)?.id === direction.id) {
        state = probe;
        shownDay = d;
        break;
      }
    }
    expect(shownDay).toBeGreaterThan(0);
    expect(activeMomentEventAt("COMMUNITY_HALL", state)?.id).toBe(direction.id);

    const answered = respondToMomentEvent(state, direction.id, direction.choices[0].id);
    expect(activeMomentEventAt("COMMUNITY_HALL", answered)).toBeNull();
    expect(answered.flags[`moment_${direction.id}_resolved`]).toBe(true);
    expect(answered.worldFacts.some((f) => f.text === direction.choices[0].resultText)).toBe(true);
  });

  it("an ignored moment event does not carry over to the next day (no nagging)", () => {
    let shownDay = -1;
    let state = atDay(glove.minDay, 9 * 60);
    for (let d = glove.minDay; d < glove.minDay + 40; d++) {
      const probe = resolveMomentEventArrival({ ...state, day: d }, "SHOPPING_STREET");
      if (activeMomentEventAt("SHOPPING_STREET", probe)?.id === glove.id) {
        state = probe;
        shownDay = d;
        break;
      }
    }
    expect(shownDay).toBeGreaterThan(0);
    // Never answer it -- advance to the next day and confirm it's simply gone, not still pending.
    const nextDayState = { ...state, day: state.day + 1 };
    expect(activeMomentEventAt("SHOPPING_STREET", nextDayState)).toBeNull();
  });

  it("moveTo can itself surface a moment event on arrival (real engine integration, not just the pure helper)", () => {
    let state = atDay(glove.minDay, 9 * 60);
    let sawIt = false;
    for (let d = glove.minDay; d < glove.minDay + 30 && !sawIt; d++) {
      state = { ...state, day: d, playerLocation: "TRIAL_HOUSE" };
      state = moveTo(state, "SHOPPING_STREET");
      if (activeMomentEventAt("SHOPPING_STREET", state)) sawIt = true;
    }
    expect(sawIt).toBe(true);
  });
});

describe("PHASE_15 Section 25-31: EVENT THREADS", () => {
  it("ships at least 2 threads, at least 1 explicitly non-work, never quest-board vocabulary", () => {
    expect(EVENT_THREAD_DEFS.length).toBeGreaterThanOrEqual(2);
    expect(EVENT_THREAD_DEFS.some((d) => !d.isWorkRelated)).toBe(true);
    const banned = ["クエスト", "ミッション", "報酬", "レベル", "経験値", "依頼一覧"];
    for (const def of EVENT_THREAD_DEFS) {
      const allText = JSON.stringify(def);
      for (const word of banned) {
        expect(allText, `${def.id} must not contain "${word}"`).not.toContain(word);
      }
    }
  });

  it("is not discoverable before minDay, or before the discover NPC is actually available", () => {
    const tooEarly = atDay(kiyoshiThread.minDay - 1, 10 * 60 + 15);
    expect(eventThreadObservationEligible(kiyoshiThread, "YOHEI_STORE", tooEarly)).toBe(false);
    const wrongTime = atDay(kiyoshiThread.minDay, 14 * 60); // Kiyoshi's window is 10:00-11:00 only
    expect(eventThreadObservationEligible(kiyoshiThread, "YOHEI_STORE", wrongTime)).toBe(false);
  });

  it("discovering sets DISCOVERED at stageIndex 0 and records a real world fact", () => {
    const state = atDay(kiyoshiThread.minDay, 10 * 60 + 15);
    expect(eventThreadDiscoverEligible(kiyoshiThread, "YOHEI_STORE", state)).toBe(true);
    const discovered = discoverEventThread(state, kiyoshiThread);
    const runtime = eventThreadRuntimeState(kiyoshiThread, discovered);
    expect(runtime).toEqual({ status: "DISCOVERED", stageIndex: 0, discoveredOnDay: discovered.day, lastPlayerProgressDay: discovered.day });
    expect(discovered.worldFacts.some((f) => f.text === kiyoshiThread.discoverResultText)).toBe(true);
    // Discovering twice is a no-op (mirrors discoverLocalProblem's own dedupe discipline).
    expect(discoverEventThread(discovered, kiyoshiThread)).toEqual(discovered);
  });

  it("the next-stage action is not offered the same day it was discovered (real pacing, not rushable)", () => {
    const state = atDay(kiyoshiThread.minDay, 10 * 60 + 15);
    const discovered = discoverEventThread(state, kiyoshiThread);
    expect(eventThreadNextStageEligible(kiyoshiThread, "YOHEI_STORE", discovered)).toBe(false);
  });

  it("progressing through every stage reaches RESOLVED and records the final stage's text as a world_change fact", () => {
    let state = atDay(kiyoshiThread.minDay, 10 * 60 + 15);
    state = discoverEventThread(state, kiyoshiThread);
    for (let i = 0; i < kiyoshiThread.stages.length; i++) {
      state = { ...state, day: state.day + 2, time: 10 * 60 + 15 };
      expect(eventThreadNextStageEligible(kiyoshiThread, "YOHEI_STORE", state)).toBe(true);
      state = progressEventThread(state, kiyoshiThread);
    }
    const runtime = eventThreadRuntimeState(kiyoshiThread, state);
    expect(runtime?.status).toBe("RESOLVED");
    expect(runtime?.stageIndex).toBe(kiyoshiThread.stages.length);
    const finalFact = state.worldFacts.find((f) => f.id === `${kiyoshiThread.id}_resolved`);
    expect(finalFact?.text).toBe(kiyoshiThread.stages[kiyoshiThread.stages.length - 1].resultText);
    expect(finalFact?.category).toBe("world_change");
    // Fully resolved -- no further action is ever offered again.
    expect(eventThreadNextStageEligible(kiyoshiThread, "YOHEI_STORE", state)).toBe(false);
    expect(eventThreadDiscoverEligible(kiyoshiThread, "YOHEI_STORE", state)).toBe(false);
  });

  it("a thread the player stops engaging with resolves WITHOUT the player after autoProgressAfterDays, via startNewDay's daily tick", () => {
    let state = atDay(miyokoThread.minDay, 10 * 60 + 15);
    state = discoverEventThread(state, miyokoThread);
    for (let i = 0; i < miyokoThread.autoProgressAfterDays + 1; i++) state = startNewDay(state);
    const runtime = eventThreadRuntimeState(miyokoThread, state);
    expect(runtime?.status).toBe("RESOLVED_WITHOUT_PLAYER");
    const fact = state.worldFacts.find((f) => f.id.startsWith(`${miyokoThread.id}_resolved_without_player_d`));
    expect(fact?.text).toBe(miyokoThread.resolvedWithoutPlayerText);
  });

  it("dueEventThreadAutoResolutions is a pure function (no mutation, safe to call speculatively)", () => {
    let state = atDay(miyokoThread.minDay, 10 * 60 + 15);
    state = discoverEventThread(state, miyokoThread);
    const a = dueEventThreadAutoResolutions(state);
    const b = dueEventThreadAutoResolutions(state);
    expect(a).toEqual(b);
    expect(eventThreadRuntimeState(miyokoThread, state)?.status).toBe("DISCOVERED");
  });

  it("continuing to progress a thread resets the autoProgressAfterDays clock each time (a thread the player keeps visiting never resolves without them)", () => {
    let state = atDay(kiyoshiThread.minDay, 10 * 60 + 15);
    state = discoverEventThread(state, kiyoshiThread);
    // Advance almost to the auto-resolve threshold, then genuinely progress -- this must push the
    // fallback clock forward, not leave it anchored to the original discovery day.
    state = { ...state, day: state.day + (kiyoshiThread.autoProgressAfterDays - 1), time: 10 * 60 + 15 };
    expect(eventThreadNextStageEligible(kiyoshiThread, "YOHEI_STORE", state)).toBe(true);
    state = progressEventThread(state, kiyoshiThread);
    expect(eventThreadRuntimeState(kiyoshiThread, state)?.status).not.toBe("RESOLVED_WITHOUT_PLAYER");
    for (let i = 0; i < kiyoshiThread.autoProgressAfterDays - 1; i++) state = startNewDay(state);
    // Still not auto-resolved -- the real progress above reset the clock.
    expect(eventThreadRuntimeState(kiyoshiThread, state)?.status).not.toBe("RESOLVED_WITHOUT_PLAYER");
  });
});

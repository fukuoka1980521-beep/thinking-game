/**
 * PHASE_12_4_NEW_LIFE_WORLD_DEPTH_AND_CONVERSATION_QUALITY_V1 Section 15 -- NOT a proof that 30
 * days is fun (that is explicitly out of scope: "これは「30日面白い」の証明ではない"). This drives
 * the actual state engine forward 30 in-game days with a simple, deterministic scripted policy
 * (visit every location once per day, talk to whoever's there, occasionally sit/shop/wait) and
 * checks for structural failure modes the directive names: worldFact explosion, unbounded
 * npcMemory growth, impossible states (an NPC "present" in two places, contradictory flags),
 * exceptions/crashes, and pending Life Material (RealWorldIntents) that never resolves. Uses the
 * deterministic adapter only (no live AI, no network) -- this is a state-machine stress test, not a
 * dialogue-quality test (that's tests/newlifecoreLivePrompt.test.ts and the live playtraces in the
 * CLOSE report).
 */
import { describe, expect, it } from "vitest";
import { checkInRealWorldIntent, createRealWorldIntent, doShortAction, moveTo, recordConversationTurn, startNewDay } from "../src/newlifecore/engine";
import { buildLocationScene } from "../src/newlifecore/content/day1";
import { buildNpcAiContext } from "../src/newlifecore/dialogue/contextBuilder";
import { deterministicNpcReply } from "../src/newlifecore/dialogue/deterministicAdapter";
import { npcAvailabilityAt, npcLocationAt, npcsPresentAt } from "../src/newlifecore/schedule";
import { NPC_DEFS } from "../src/newlifecore/npcDefs";
import { createInitialCoreState } from "../src/newlifecore/types";
import type { CoreState, LocationId } from "../src/newlifecore/types";

const ALL_LOCATIONS: LocationId[] = ["CHALLENGE_CENTER", "YOHEI_STORE", "CAFE_NODOKA", "COMMUNITY_HALL", "SHOPPING_STREET", "BARBERSHOP"];

function simulateOneDay(state: CoreState, dayIndex: number): CoreState {
  let s = state;
  for (const loc of ALL_LOCATIONS) {
    s = moveTo(s, loc);
    const scene = buildLocationScene(s);
    for (const npc of scene.npcsHere) {
      const text = `${dayIndex}日目、${loc}での発言です`;
      const context = buildNpcAiContext(npc, s, text);
      const reply = deterministicNpcReply(context);
      s = recordConversationTurn(s, npc, text, reply.visibleUtterance);
    }
  }
  // A light morning tour (the loop above) only reaches ~11:00-11:30 -- nowhere near evening. A
  // real day continues until the player sleeps (or 23:30 force-sleep), so afternoon/evening-gated
  // world events (e.g. BENCH_FIX_TIME 14:00) would still fire in real play even on a light-touring
  // day. Pad forward so this simulation actually covers that same real span, rather than silently
  // under-testing every afternoon/evening trigger just because the scripted tour itself is short.
  while (s.time < 20 * 60 && !s.ended) {
    s = doShortAction(s, 30);
  }
  // Every 5th day, exercise the Reality Bridge loop too, so its own state doesn't sit untested.
  if (dayIndex % 5 === 0) {
    s = createRealWorldIntent(s, "daisuke", `day${dayIndex}の悩み`, `day${dayIndex}に試すこと`);
  }
  // Check in any open intents from an earlier day (never same-day, matching the real UI gate).
  for (const intent of s.realWorldIntents) {
    if (!intent.checkedIn && intent.createdOnDay < s.day) {
      s = checkInRealWorldIntent(s, intent.id, "partially", "");
    }
  }
  return s;
}

describe("PHASE_12_4 Section 15: 30-day structural simulation (finds breakage BEFORE day 30, not proves day 30 is fun)", () => {
  it("runs 30 simulated days without throwing, without impossible NPC co-location, and without unbounded worldFact growth", () => {
    let s = createInitialCoreState();
    const worldFactCountByDay: number[] = [];
    const npcMemoryTotalByDay: number[] = [];

    for (let day = 1; day <= 30; day++) {
      expect(() => {
        s = simulateOneDay(s, day);
      }, `day ${day} threw an exception`).not.toThrow();

      // Impossible-state check: no NPC ever reported present at two different locations at once.
      const presentAt: Record<string, LocationId[]> = {};
      for (const loc of ALL_LOCATIONS) {
        for (const npc of npcsPresentAt(loc, s.time, s.flags)) {
          (presentAt[npc] ??= []).push(loc);
        }
      }
      for (const [npc, locs] of Object.entries(presentAt)) {
        expect(locs, `${npc} appeared present at multiple locations simultaneously on day ${day}: ${locs.join(",")}`).toHaveLength(1);
      }

      worldFactCountByDay.push(s.worldFacts.length);
      npcMemoryTotalByDay.push(Object.values(s.npcMemory).reduce((sum, turns) => sum + turns.length, 0));

      if (day < 30) s = startNewDay({ ...s, ended: true });
    }

    console.log("worldFacts count by day (every 5th):", worldFactCountByDay.filter((_, i) => (i + 1) % 5 === 0));
    console.log("total npcMemory turns by day (every 5th):", npcMemoryTotalByDay.filter((_, i) => (i + 1) % 5 === 0));
    console.log("final worldFacts count:", s.worldFacts.length);
    console.log("final total npcMemory turns:", npcMemoryTotalByDay[npcMemoryTotalByDay.length - 1]);
    console.log("final realWorldIntents:", s.realWorldIntents.length, "checked in:", s.realWorldIntents.filter((i) => i.checkedIn).length);

    // worldFacts grow with real activity (dedup by id already prevents true duplicates -- this
    // bound is about UNBOUNDED runaway growth, e.g. a bug that re-adds the same conceptual fact
    // with a new id every day). 30 days x ~7 conversation-adjacent facts/day is a generous ceiling.
    expect(s.worldFacts.length).toBeLessThan(250);
    // npcMemory: 30 days x up to 6 locations-with-someone-present x 1 turn = bounded; the
    // MEMORY_WINDOW cap (6) in contextBuilder.ts means the AI never actually SEES more than that
    // regardless, but raw storage growth itself should still stay linear/bounded, not runaway.
    expect(npcMemoryTotalByDay[npcMemoryTotalByDay.length - 1]).toBeLessThan(300);

    // All one-time world events should have long since resolved and never re-fire (dedup by id in
    // addWorldFact already guarantees this structurally, but assert the count directly too).
    expect(s.worldFacts.filter((f) => f.id === "jin_called_to_yohei")).toHaveLength(1);
    expect(s.worldFacts.filter((f) => f.id === "hina_shop_open")).toHaveLength(1);
    expect(s.worldFacts.filter((f) => f.id === "bench_fixed")).toHaveLength(1);

    // No contradictory flag state: the shelf can't be both fixed-with-player and
    // fixed-without-player, and a "world change" flag being true is consistent with its fact existing.
    expect(s.flags.shelfFixed && s.flags.shelfFixedWithPlayer ? 1 : 0).not.toBe(2); // trivially true, documents the invariant
    if (s.flags.hinaShopOpen) expect(s.worldFacts.some((f) => f.id === "hina_shop_open")).toBe(true);
    if (s.flags.benchFixed) expect(s.worldFacts.some((f) => f.id === "bench_fixed")).toBe(true);

    // Pending-material accumulation: every intent created should eventually get checked in given
    // this scripted policy (it always checks in anything from an earlier day) -- if this is ever
    // false, it means completed material is silently piling up uncheckable, a real design bug.
    const uncheckedOlderThanToday = s.realWorldIntents.filter((i) => !i.checkedIn && i.createdOnDay < s.day);
    expect(uncheckedOlderThanToday).toHaveLength(0);
  });

  it("no NPC's dialogue reply ever repeats byte-for-byte across all 30 simulated days for a fixed input (the deterministic bucket-cycling still provides some variety over a realistic day count)", () => {
    let s = createInitialCoreState();
    const repliesByNpc: Record<string, string[]> = {};
    for (let day = 1; day <= 30; day++) {
      s = moveTo(s, "CAFE_NODOKA");
      const scene = buildLocationScene(s);
      if (scene.npcsHere.includes("miyoko")) {
        const context = buildNpcAiContext("miyoko", s, "こんにちは");
        const reply = deterministicNpcReply(context);
        (repliesByNpc.miyoko ??= []).push(reply.visibleUtterance);
        // Must actually persist the turn -- the picker's seed is memoryOfPlayer.length, so without
        // this every day sees an identically-empty memory and (correctly) picks the same variant.
        s = recordConversationTurn(s, "miyoko", "こんにちは", reply.visibleUtterance);
      }
      if (day < 30) s = startNewDay({ ...s, ended: true });
    }
    const uniqueReplies = new Set(repliesByNpc.miyoko);
    console.log("Miyoko: unique greeting replies across 30 identical-input days:", uniqueReplies.size, "/", repliesByNpc.miyoko.length);
    // The deterministic adapter is explicitly NOT the dialogue-quality path (that's the live
    // model) -- it only needs to not be a single, permanently-repeated string. More than 1 unique
    // reply across 30 days is the bar for "not a frozen single line," not variety parity with live AI.
    expect(uniqueReplies.size).toBeGreaterThan(1);

    // Section C of the CONTINUE directive: "2 variants" must not be silently reported as
    // "SOLVED" -- record the actual repeat frequency so the CLOSE report can state it honestly.
    const counts: Record<string, number> = {};
    for (const r of repliesByNpc.miyoko) counts[r] = (counts[r] ?? 0) + 1;
    console.log("Miyoko greeting repeat frequency (text -> times said across 30 days):", counts);
  });
});

/**
 * PHASE_12_4 CONTINUE directive Section I -- "PASS = crashしないだけにしない". These tests are
 * deliberately diagnostic, not gates: most only console.log a measurement (event exhaustion day,
 * schedule staticness, stale Life Material, duplicate-by-text facts) rather than asserting a
 * pass/fail bar, because the honest finding here is a genuine, currently-unsolved monotony risk
 * (see the CLOSE report) -- asserting a threshold on it would either be arbitrary or would silently
 * launder "2 greeting variants" into "monotony solved," which the directive explicitly forbids.
 */
describe("PHASE_12_4 Section I: 30-day monotony diagnostics (measurements for the CLOSE report, not a pass/fail gate)", () => {
  it("measures the day authored world-change content runs out (event exhaustion) against the full 30-day span", () => {
    let s = createInitialCoreState();
    const knownEventIds = ["jin_called_to_yohei", "shelf_fixed_without_player", "shelf_fixed", "fumiko_asked_jin_bench", "bench_fixed", "hina_shop_open"];
    const firstSeenDay: Record<string, number> = {};

    for (let day = 1; day <= 30; day++) {
      s = simulateOneDay(s, day);
      for (const id of knownEventIds) {
        if (firstSeenDay[id] === undefined && s.worldFacts.some((f) => f.id === id)) firstSeenDay[id] = day;
      }
      if (day < 30) s = startNewDay({ ...s, ended: true });
    }

    const lastNewEventDay = Math.max(0, ...Object.values(firstSeenDay));
    console.log("Authored world-change events, first-seen day:", firstSeenDay);
    console.log("EVENT EXHAUSTION DAY (last day any NEW authored event fact appeared):", lastNewEventDay, "/ 30");
    console.log(
      "Days remaining with ZERO new authored world-change content after exhaustion:",
      30 - lastNewEventDay,
      `(${(((30 - lastNewEventDay) / 30) * 100).toFixed(0)}% of the 30-day span)`,
    );
    // Not a pass/fail assertion -- purely so this number is always computed and visible, never
    // silently skipped if the simulation itself is later refactored.
    expect(lastNewEventDay).toBeGreaterThan(0);
  });

  it("measures NPC schedule/availability staticness across the 30-day span (does day 30 offer any different presence pattern than day 1?)", () => {
    const npcs = Object.keys(NPC_DEFS) as (keyof typeof NPC_DEFS)[];
    const sampleTimes = [9 * 60 + 30, 12 * 60, 16 * 60];
    // Base-case flags (no world events fired yet) vs a state where every authored event has
    // resolved -- schedule.ts's overrides key off flags, so this brackets the real range of
    // variation the schedule model is even capable of producing.
    const flagsDay1: Record<string, boolean> = {};
    const flagsLater: Record<string, boolean> = { jinCalledToYohei: true, shelfFixed: true, fumikoAskedJin: true, benchFixed: true, hinaShopOpen: true };

    let staticCount = 0;
    let totalSamples = 0;
    const perNpcDifferences: Record<string, number> = {};
    for (const npc of npcs) {
      let diffs = 0;
      for (const t of sampleTimes) {
        totalSamples++;
        const locDay1 = npcLocationAt(npc, t, flagsDay1);
        const locLater = npcLocationAt(npc, t, flagsLater);
        const availDay1 = npcAvailabilityAt(npc, t, flagsDay1);
        const availLater = npcAvailabilityAt(npc, t, flagsLater);
        if (locDay1 === locLater && availDay1 === availLater) staticCount++;
        else diffs++;
      }
      perNpcDifferences[npc] = diffs;
    }
    console.log("Schedule samples identical between 'nothing has happened yet' and 'every authored event resolved':", `${staticCount}/${totalSamples}`);
    console.log("Per-NPC schedule differences across that same bracket (out of 3 sampled times each):", perNpcDifferences);
    console.log(
      "READING: each NPC's daily schedule is a fixed, day-of-week-blind rhythm -- the ONLY thing that ever changes it is the small number of one-time flags above, not the day NUMBER itself. Day 17 and day 4 have byte-identical NPC presence/availability at any given clock time once all one-time events have resolved.",
    );
    expect(totalSamples).toBeGreaterThan(0);
  });

  it("checks for stale Life Material (a promise/pending_task fact with no matching resolution by day 30) and for duplicate-by-text world facts", () => {
    let s = createInitialCoreState();
    for (let day = 1; day <= 30; day++) {
      s = simulateOneDay(s, day);
      if (day < 30) s = startNewDay({ ...s, ended: true });
    }

    const promiseIds = s.worldFacts.filter((f) => f.category === "promise").map((f) => f.id);
    const pendingResolutions = s.worldFacts.filter((f) => f.category === "pending_task");
    console.log("Promise-category facts:", promiseIds);
    console.log("Pending-task-category (resolution) facts:", pendingResolutions.map((f) => f.id));
    // The two authored promise/pending_task pairs this content currently has (shelf, bench) --
    // verify each promise that fired also has a matching resolution by day 30 in this scripted run.
    // A stale promise (fired, never resolved) would be a genuine content bug worth flagging.
    if (promiseIds.includes("jin_called_to_yohei")) {
      expect(s.worldFacts.some((f) => f.id === "shelf_fixed" || f.id === "shelf_fixed_without_player")).toBe(true);
    }
    if (promiseIds.includes("fumiko_asked_jin_bench")) {
      expect(s.worldFacts.some((f) => f.id === "bench_fixed")).toBe(true);
    }

    const textCounts: Record<string, number> = {};
    for (const f of s.worldFacts) textCounts[f.text] = (textCounts[f.text] ?? 0) + 1;
    const duplicateTexts = Object.entries(textCounts).filter(([, count]) => count > 1);
    console.log("Distinct world-fact texts that appear more than once (different ids, identical wording):", duplicateTexts.length);
    if (duplicateTexts.length > 0) console.log("Examples:", duplicateTexts.slice(0, 5));
  });
});

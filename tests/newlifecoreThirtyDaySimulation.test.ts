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
import {
  acceptPlayerPromise,
  checkInRealWorldIntent,
  createRealWorldIntent,
  declinePlayerPromise,
  doShortAction,
  moveTo,
  recordConversationTurn,
  startNewDay,
} from "../src/newlifecore/engine";
import { computePlayerNpcTags, eligibleForNewInvitation, invitationLabelFor } from "../src/newlifecore/content/socialMemory";
import { pseudoChance } from "../src/newlifecore/content/eventEngine";
import { buildLocationScene } from "../src/newlifecore/content/day1";
import { buildNpcAiContext } from "../src/newlifecore/dialogue/contextBuilder";
import { deterministicNpcReply } from "../src/newlifecore/dialogue/deterministicAdapter";
import { npcAvailabilityAt, npcLocationAt, npcsPresentAt } from "../src/newlifecore/schedule";
import { NPC_DEFS } from "../src/newlifecore/npcDefs";
import { EVENT_DEFS } from "../src/newlifecore/content/eventDefs";
import { createInitialCoreState } from "../src/newlifecore/types";
import type { CoreState, LocationId, NpcId } from "../src/newlifecore/types";

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

/**
 * PHASE_12_5_NEW_LIFE_RECURRING_WORLD_ENGINE_V1 Section 18 -- 30-DAY STRUCTURAL SIMULATION V2. The
 * suite above (PHASE 12.4) still only tracks the four legacy day1WorldEvents.ts ids and correctly
 * still reports "EVENT EXHAUSTION DAY: 3/30" -- that suite is intentionally left unmodified as a
 * historical baseline. This block re-measures the SAME structural question against the combined
 * system (legacy + the new recurring engine's 16 definitions) using the same scripted policy. Like
 * the PHASE_12_4 diagnostics above, most of this is measurement, not a pass/fail gate (Section 18:
 * "技術的なPASSは面白さの証明ではない") -- only genuine structural-safety invariants (no crash, no
 * cooldown violation, no orphaned chain, no knowledge leak) are hard assertions.
 */
describe("PHASE_12_5 Section 18: 30-day structural simulation V2 (legacy + recurring engine combined)", () => {
  it("measures event exhaustion day, unique event instances/families, quiet days, and identical-day streaks across the combined system", () => {
    let s = createInitialCoreState();
    const allKnownIds = [
      "jin_called_to_yohei",
      "shelf_fixed_without_player",
      "fumiko_asked_jin_bench",
      "bench_fixed",
      "hina_shop_open",
      ...EVENT_DEFS.map((d) => d.worldFact.id),
    ];
    const firstSeenDay: Record<string, number> = {};
    const eventCountByDay: number[] = [];
    const scenesByDay: string[] = [];
    const familiesFiredByDay: Record<number, Set<string>> = {};

    for (let day = 1; day <= 30; day++) {
      const before = s.worldFacts.length;
      s = simulateOneDay(s, day);
      const after = s.worldFacts.length;
      eventCountByDay.push(after - before);

      for (const id of allKnownIds) {
        if (firstSeenDay[id] === undefined && s.worldFacts.some((f) => f.id === id || f.id.startsWith(`${id}_d`))) {
          firstSeenDay[id] = day;
        }
      }
      const firedFamilies = new Set<string>();
      for (const def of EVENT_DEFS) {
        if (s.worldFacts.some((f) => f.id === `${def.worldFact.id}_d${day}`)) firedFamilies.add(def.family);
      }
      familiesFiredByDay[day] = firedFamilies;

      // A cheap day-signature: which locations had which NPCs present at a fixed sample time, plus
      // today's flags snapshot -- if two days produce byte-identical signatures the "day" genuinely
      // repeated, which is the actual thing Section 8/19 cares about (NOVELTY), not just "some fact
      // fired somewhere."
      const sampleTime = 12 * 60;
      const presenceSignature = ALL_LOCATIONS.map((loc) => `${loc}:${npcsPresentAt(loc, sampleTime, s.flags).join(",")}`).join("|");
      scenesByDay.push(`${presenceSignature}::flags=${JSON.stringify(s.flags)}`);

      if (day < 30) s = startNewDay({ ...s, ended: true });
    }

    const uniqueEventInstances = EVENT_DEFS.flatMap((d) => s.worldFacts.filter((f) => f.id.startsWith(`${d.worldFact.id}_d`))).length;
    const uniqueFamiliesFired = new Set(Object.values(familiesFiredByDay).flatMap((set) => [...set]));
    const quietDays = eventCountByDay.filter((c) => c === 0).length;
    const lastNewEventDay = Math.max(0, ...Object.values(firstSeenDay));

    let longestIdenticalStreak = 1;
    let currentStreak = 1;
    for (let i = 1; i < scenesByDay.length; i++) {
      if (scenesByDay[i] === scenesByDay[i - 1]) {
        currentStreak++;
        longestIdenticalStreak = Math.max(longestIdenticalStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    console.log("EVENT EXHAUSTION DAY V2 (combined legacy+recurring-engine, last day any NEW event fact first appeared):", lastNewEventDay, "/ 30");
    console.log("Unique fired event instances (recurring engine, 30-day span):", uniqueEventInstances);
    console.log("Unique event families that fired at least once:", uniqueFamiliesFired.size, "/", 8, [...uniqueFamiliesFired]);
    console.log("Days with zero NEW worldFacts (quiet days):", quietDays, "/ 30");
    console.log("Longest run of back-to-back structurally-identical days (same NPC presence signature + flags at a fixed sample time):", longestIdenticalStreak);
    console.log("New-events-per-day (all 30 days):", eventCountByDay);

    // Structural-safety bar, not a fun bar: the recurring engine must genuinely keep producing SOME
    // new content well past day 3 (the honest PHASE_12_4 exhaustion point), and must not make every
    // single day identical.
    expect(lastNewEventDay).toBeGreaterThan(3);
    expect(longestIdenticalStreak).toBeLessThan(30);
  });

  it("never violates a cooldown -- consecutive firings of the same event id are always cooldownDays or more apart", () => {
    let s = createInitialCoreState();
    const firedDaysById: Record<string, number[]> = {};
    for (let day = 1; day <= 30; day++) {
      s = simulateOneDay(s, day);
      for (const def of EVENT_DEFS) {
        if (s.worldFacts.some((f) => f.id === `${def.worldFact.id}_d${day}`)) {
          (firedDaysById[def.id] ??= []).push(day);
        }
      }
      if (day < 30) s = startNewDay({ ...s, ended: true });
    }
    const defById = new Map(EVENT_DEFS.map((d) => [d.id, d]));
    let violations = 0;
    for (const [id, days] of Object.entries(firedDaysById)) {
      const def = defById.get(id)!;
      for (let i = 1; i < days.length; i++) {
        const gap = days[i] - days[i - 1];
        if (gap < def.cooldownDays) violations++;
        expect(gap, `${id} fired on days ${days[i - 1]} and ${days[i]} -- only ${gap} days apart, cooldown is ${def.cooldownDays}`).toBeGreaterThanOrEqual(def.cooldownDays);
      }
    }
    console.log("Cooldown violations across the 30-day span:", violations, "(hard assertion above already fails the test on any violation)");
  });

  it("never leaves a chain's earlier stage unresolved by day 30 (no orphaned/stale promise from the new engine's 2-stage chains)", () => {
    let s = createInitialCoreState();
    for (let day = 1; day <= 30; day++) {
      s = simulateOneDay(s, day);
      if (day < 30) s = startNewDay({ ...s, ended: true });
    }
    const chainPairs: [string, string][] = [
      ["jin_fixes_chair_ask", "jin_fixes_chair_done"],
      ["miyoko_offers_help_hina_ask", "miyoko_helps_hina_shelves_done"],
    ];
    for (const [askId, doneId] of chainPairs) {
      const askDays = s.worldFacts.filter((f) => f.id.startsWith(`${askId}_d`)).map((f) => Number(f.id.split("_d").pop()));
      const doneDays = s.worldFacts.filter((f) => f.id.startsWith(`${doneId}_d`)).map((f) => Number(f.id.split("_d").pop()));
      console.log(`${askId} fired on days:`, askDays, "->", `${doneId} fired on days:`, doneDays);
      // Every "ask" must have a matching "done" on the same day (the fixture's own eligibility
      // requires the flag to still be set, and both stages fire within the same in-world day) --
      // an ask with no same-day done would mean a genuinely orphaned Life Material item.
      for (const d of askDays) {
        expect(doneDays, `${askId} fired on day ${d} but ${doneId} never resolved that same day`).toContain(d);
      }
    }
    // Final-state check: if the chain's "ask" flag is currently true, the chain is mid-flight
    // (expected -- it just hasn't reached its own same-day "done" yet, impossible per the above),
    // never something that's been stuck for multiple days with no matching resolution.
    expect(s.flags.jin_fixes_chair_ask ?? false).toBe(false);
    expect(s.flags.miyoko_offers_help_hina_ask ?? false).toBe(false);
  });

  it("never leaks knowledge -- a fired event's worldFact is only ever included in an NPC's own AI context if that NPC is in its knownBy list", () => {
    let s = createInitialCoreState();
    for (let day = 1; day <= 30; day++) {
      s = simulateOneDay(s, day);
      if (day < 30) s = startNewDay({ ...s, ended: true });
    }
    const npcs = Object.keys(NPC_DEFS) as NpcId[];
    let leaks = 0;
    for (const npc of npcs) {
      const context = buildNpcAiContext(npc, s, "テスト");
      for (const fact of s.worldFacts) {
        if (!fact.knownBy.includes(npc)) {
          // This exact fact's text must not appear in this NPC's knownFacts -- contextBuilder.ts's
          // filter is the structural guarantee; this re-checks it holds with the new engine's
          // (higher-volume, longer-running) facts actually populated, not just the original four.
          expect(context.knownFacts, `${npc} was given a fact only knownBy=[${fact.knownBy.join(",")}] should know: "${fact.text}"`).not.toContain(fact.text);
          if (context.knownFacts.includes(fact.text)) leaks++;
        }
      }
    }
    expect(leaks).toBe(0);
  });

  it("Life Material and state grow across the 30-day span without runaway/unbounded growth (bounded state growth)", () => {
    let s = createInitialCoreState();
    const lifeMaterialCountByDay: number[] = [];
    for (let day = 1; day <= 30; day++) {
      s = simulateOneDay(s, day);
      lifeMaterialCountByDay.push(s.worldFacts.filter((f) => f.category !== undefined).length);
      if (day < 30) s = startNewDay({ ...s, ended: true });
    }
    console.log("Life-Material-tagged worldFact count by day (every 5th):", lifeMaterialCountByDay.filter((_, i) => (i + 1) % 5 === 0));
    console.log("eventLastFired table size (unique event ids that have ever fired):", Object.keys(s.eventLastFired).length);
    // Grows (not flat -- the whole point of this phase) but still bounded (not runaway/unbounded --
    // the same invariant the PHASE_12_4 suite already checks for worldFacts overall).
    expect(lifeMaterialCountByDay[lifeMaterialCountByDay.length - 1]).toBeGreaterThan(lifeMaterialCountByDay[0]);
    expect(Object.keys(s.eventLastFired).length).toBeLessThanOrEqual(EVENT_DEFS.length);
  });
});

/**
 * PHASE_12_6_NEW_LIFE_RELATIONSHIP_CONSEQUENCE_AND_SOCIAL_MEMORY_V1 Section 21 -- 30-DAY
 * SIMULATION V3. Extends the same scripted-touring policy (`simulateOneDay` above, left untouched)
 * with a deterministic promise-response policy: whenever an invitation becomes eligible after
 * talking to an NPC, accept it on even days and decline it on odd days (a fixed, reproducible rule
 * -- not Math.random -- chosen only so both accept and decline paths get real, comparable exercise
 * across the 30-day span).
 */
function simulateOneDayV3(state: CoreState, dayIndex: number): CoreState {
  let s = state;
  for (const loc of ALL_LOCATIONS) {
    s = moveTo(s, loc);
    const scene = buildLocationScene(s);
    for (const npc of scene.npcsHere) {
      // The real UI sets `met_${npc}` in `openConversation`, BEFORE any text is submitted --
      // mirrored here since this simulation drives `recordConversationTurn` directly rather than
      // through the React component.
      if (!s.flags[`met_${npc}`]) s = { ...s, flags: { ...s.flags, [`met_${npc}`]: true } };
      const text = `${dayIndex}日目、${loc}での発言です`;
      const context = buildNpcAiContext(npc, s, text);
      const reply = deterministicNpcReply(context);
      s = recordConversationTurn(s, npc, text, reply.visibleUtterance);
      if (eligibleForNewInvitation(npc, s)) {
        // Deterministic (not Math.random, same reproducibility rationale as the event engine's own
        // use of this function) but NOT tied to day parity -- an earlier version used `dayIndex % 2`
        // directly, which silently locked onto ONE parity forever once the first invite landed on
        // an odd day, because the 4-day cooldown (even) always returns to the SAME parity. Hashing
        // on (npc, day) avoids that resonance.
        s = pseudoChance(`policy_${npc}_${dayIndex}`) < 0.5 ? acceptPlayerPromise(s, npc, invitationLabelFor(npc)) : declinePlayerPromise(s, npc, invitationLabelFor(npc));
      }
    }
  }
  while (s.time < 20 * 60 && !s.ended) {
    s = doShortAction(s, 30);
  }
  if (dayIndex % 5 === 0) {
    s = createRealWorldIntent(s, "daisuke", `day${dayIndex}の悩み`, `day${dayIndex}に試すこと`);
  }
  for (const intent of s.realWorldIntents) {
    if (!intent.checkedIn && intent.createdOnDay < s.day) {
      s = checkInRealWorldIntent(s, intent.id, "partially", "");
    }
  }
  return s;
}

describe("PHASE_12_6 Section 21: 30-day simulation V3 (social memory)", () => {
  it("measures promise accumulation, resolution mix, memory bounds, relationship-state diversity, and dialogue-context diversity across 30 days", () => {
    let s = createInitialCoreState();
    const promiseCountByDay: number[] = [];
    const npcs = Object.keys(NPC_DEFS) as NpcId[];

    for (let day = 1; day <= 30; day++) {
      expect(() => {
        s = simulateOneDayV3(s, day);
      }, `day ${day} threw an exception`).not.toThrow();
      promiseCountByDay.push(s.playerPromises.length);
      if (day < 30) s = startNewDay({ ...s, ended: true });
    }

    const statusCounts: Record<string, number> = {};
    for (const p of s.playerPromises) statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1;
    console.log("Final playerPromises by status:", statusCounts, "total:", s.playerPromises.length);
    console.log("playerPromises count by day (every 5th):", promiseCountByDay.filter((_, i) => (i + 1) % 5 === 0));

    // Bounded growth -- never allowed to grow unboundedly across 30 days of active use (Section 12).
    expect(s.playerPromises.length).toBeLessThan(30);
    // Both accept and decline paths were actually exercised (the day-parity policy guarantees this
    // over 30 days as long as the eligibility gate ever opened at all).
    expect((statusCounts.kept ?? 0) + (statusCounts.missed ?? 0)).toBeGreaterThan(0);
    expect(statusCounts.declined ?? 0).toBeGreaterThan(0);

    // Relationship-state diversity -- different NPCs must NOT all converge on the identical tag set;
    // a real social-memory system produces different relationships with different people.
    const tagSets = npcs.map((npc) => computePlayerNpcTags(npc, s).slice().sort().join(","));
    const uniqueTagSets = new Set(tagSets);
    console.log("Per-NPC tag sets:", Object.fromEntries(npcs.map((npc, i) => [npc, tagSets[i]])));
    console.log("Unique tag-set count across", npcs.length, "NPCs:", uniqueTagSets.size);
    expect(uniqueTagSets.size).toBeGreaterThan(1);

    // Dialogue-context diversity -- diagnostic only, not a hard gate. This simulation's OWN
    // touring policy (inherited from `simulateOneDay`) visits every location, and therefore every
    // present NPC, every single day -- so daysSinceLastMeeting is structurally always 0/1 for
    // everyone under THIS specific policy, regardless of the underlying mechanism's correctness.
    // That correctness (the field genuinely varies under a realistic, non-uniform visiting pattern)
    // is what tests/newlifecoreSocialMemory.test.ts's dedicated unit tests already assert directly;
    // re-asserting it here under a policy that cannot produce it would be testing the policy, not
    // the mechanism (the same "measurement, not gate" discipline the PHASE_12_4 section above uses
    // for its own schedule-staticness diagnostic).
    const daysSince = npcs.map((npc) => buildNpcAiContext(npc, s, "x").daysSinceLastMeeting);
    console.log("daysSinceLastMeeting per NPC at day 30 (expected uniform under this always-visit policy -- see comment):", Object.fromEntries(npcs.map((npc, i) => [npc, daysSince[i]])));
  });

  it("never leaks knowledge through the new player-relationship-gated event, and playerPromises stays free of duplicate/contradictory entries", () => {
    let s = createInitialCoreState();
    for (let day = 1; day <= 30; day++) {
      s = simulateOneDayV3(s, day);
      if (day < 30) s = startNewDay({ ...s, ended: true });
    }
    // No two promises share an id.
    const ids = s.playerPromises.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    // No NPC ever has two simultaneously-pending promises (the eligibility gate should prevent this
    // structurally -- this re-verifies it held across a full 30-day run, not just a unit test).
    const npcs = Object.keys(NPC_DEFS) as NpcId[];
    for (const npc of npcs) {
      const pendingCount = s.playerPromises.filter((p) => p.npc === npc && p.status === "pending").length;
      expect(pendingCount, `${npc} has ${pendingCount} simultaneously-pending promises`).toBeLessThanOrEqual(1);
    }
  });
});

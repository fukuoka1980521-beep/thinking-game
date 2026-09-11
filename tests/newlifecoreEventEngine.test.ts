/**
 * PHASE_12_5_NEW_LIFE_RECURRING_WORLD_ENGINE_V1 Section 23 -- unit tests for the generic recurring
 * event engine (content/eventEngine.ts) using small, purpose-built fixture EventDefinitions (never
 * the real 16-item eventDefs.ts table) so each test isolates exactly one mechanism (eligibility,
 * cooldown, chain progression, ...) instead of depending on the real content's specific days/times.
 */
import { describe, expect, it } from "vitest";
import { eventTraceLinesAt, pseudoChance, resolveGeneratedEvents } from "../src/newlifecore/content/eventEngine";
import type { EventDefinition } from "../src/newlifecore/content/eventEngine";
import { buildNpcAiContext } from "../src/newlifecore/dialogue/contextBuilder";
import { EVENT_DEFS } from "../src/newlifecore/content/eventDefs";
import { createInitialCoreState } from "../src/newlifecore/types";
import type { CoreState } from "../src/newlifecore/types";

function baseState(overrides: Partial<CoreState> = {}): CoreState {
  return { ...createInitialCoreState(), ...overrides };
}

const SIMPLE_EVENT: EventDefinition = {
  id: "test_simple",
  family: "SOCIAL",
  participants: ["yohei", "miyoko"],
  location: "CAFE_NODOKA",
  playerPresenceRequired: false,
  triggerTime: 10 * 60,
  eligibility: { minDay: 1 },
  cooldownDays: 5,
  worldFact: { id: "test_simple", text: "テストイベントが発生した。", knownBy: ["yohei", "miyoko"], category: "shared_event" },
};

describe("PHASE_12_5 event engine: pseudoChance distribution (regression -- an earlier hash had almost no avalanche across consecutive days)", () => {
  it("is deterministic: the same seed always returns the same value", () => {
    expect(pseudoChance("drizzle_start_5")).toBe(pseudoChance("drizzle_start_5"));
  });

  it("spreads roughly evenly across [0,1) for consecutive day suffixes on the same event id, instead of clustering near one value", () => {
    const values = Array.from({ length: 100 }, (_, i) => pseudoChance(`drizzle_start_${i + 1}`));
    const below = values.filter((v) => v < 0.5).length;
    // Not a strict 50/50 requirement -- just that it isn't the earlier bug's near-total clustering
    // (that bug produced 0/100 crossing 0.5 for long day-count runs). A generous [30,70] band.
    expect(below).toBeGreaterThan(30);
    expect(below).toBeLessThan(70);
    // No two consecutive days should differ by a near-zero amount across the whole span (the exact
    // shape of the earlier bug: `${id}_${day}` and `${id}_${day+1}` landing within float noise).
    let minGap = 1;
    for (let i = 1; i < values.length; i++) minGap = Math.min(minGap, Math.abs(values[i] - values[i - 1]));
    expect(minGap).toBeGreaterThan(0.001);
  });
});

describe("PHASE_12_5 event engine: eligibility", () => {
  it("does not fire before minDay", () => {
    const def: EventDefinition = { ...SIMPLE_EVENT, eligibility: { minDay: 5 } };
    const s = baseState({ day: 2, time: 9 * 60 });
    const next = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);
    expect(next.worldFacts).toHaveLength(0);
  });

  it("fires once minDay is reached and the trigger time is crossed", () => {
    const def: EventDefinition = { ...SIMPLE_EVENT, eligibility: { minDay: 5 } };
    const s = baseState({ day: 5, time: 9 * 60 });
    const next = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);
    expect(next.worldFacts.map((f) => f.id)).toContain("test_simple_d5");
  });

  it("does not fire if requiredFlags are missing", () => {
    const def: EventDefinition = { ...SIMPLE_EVENT, eligibility: { requiredFlags: ["some_prereq"] } };
    const s = baseState({ day: 1, time: 9 * 60 });
    const next = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);
    expect(next.worldFacts).toHaveLength(0);
  });

  it("fires once requiredFlags are satisfied", () => {
    const def: EventDefinition = { ...SIMPLE_EVENT, eligibility: { requiredFlags: ["some_prereq"] } };
    const s = baseState({ day: 1, time: 9 * 60, flags: { some_prereq: true } });
    const next = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);
    expect(next.worldFacts.map((f) => f.id)).toContain("test_simple_d1");
  });

  it("does not fire if a forbiddenFlag is set", () => {
    const def: EventDefinition = { ...SIMPLE_EVENT, eligibility: { forbiddenFlags: ["blocked"] } };
    const s = baseState({ day: 1, time: 9 * 60, flags: { blocked: true } });
    const next = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);
    expect(next.worldFacts).toHaveLength(0);
  });

  it("does not fire when a required NPC is not schedule-AVAILABLE (BUSY window)", () => {
    // jin is BUSY 09:30-09:45 in his authored schedule (npcDefs.ts).
    const def: EventDefinition = { ...SIMPLE_EVENT, eligibility: { npcsAvailable: ["jin"] }, triggerTime: 9 * 60 + 40 };
    const s = baseState({ day: 1, time: 9 * 60 + 35 });
    const next = resolveGeneratedEvents(9 * 60 + 35, { ...s, time: 9 * 60 + 41 }, [def]);
    expect(next.worldFacts).toHaveLength(0);
  });

  it("does not fire when the required relationship quality does not match", () => {
    // yohei -> hina is "distant" in npcDefs.ts -- requiring close/familiar must fail.
    const def: EventDefinition = {
      ...SIMPLE_EVENT,
      participants: ["yohei", "hina"],
      eligibility: { requiredRelationship: [{ a: "yohei", b: "hina", qualities: ["close", "familiar"] }] },
    };
    const s = baseState({ day: 1, time: 9 * 60 });
    const next = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);
    expect(next.worldFacts).toHaveLength(0);
  });

  it("fires when the required relationship quality does match", () => {
    // yohei -> jin is "close" in npcDefs.ts.
    const def: EventDefinition = {
      ...SIMPLE_EVENT,
      participants: ["yohei", "jin"],
      eligibility: { requiredRelationship: [{ a: "yohei", b: "jin", qualities: ["close", "familiar"] }] },
    };
    const s = baseState({ day: 1, time: 9 * 60 });
    const next = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);
    expect(next.worldFacts.map((f) => f.id)).toContain("test_simple_d1");
  });
});

describe("PHASE_12_5 event engine: cooldown", () => {
  it("does not refire the same event id before cooldownDays have passed", () => {
    const def: EventDefinition = { ...SIMPLE_EVENT, cooldownDays: 5 };
    let s = baseState({ day: 1, time: 9 * 60, eventLastFired: { test_simple: 1 } });
    const next = resolveGeneratedEvents(9 * 60, { ...s, day: 3, time: 11 * 60 }, [def]);
    expect(next.worldFacts).toHaveLength(0);
  });

  it("refires once cooldownDays have fully elapsed", () => {
    const def: EventDefinition = { ...SIMPLE_EVENT, cooldownDays: 5 };
    let s = baseState({ day: 1, time: 9 * 60, eventLastFired: { test_simple: 1 } });
    const next = resolveGeneratedEvents(9 * 60, { ...s, day: 6, time: 11 * 60 }, [def]);
    expect(next.worldFacts.map((f) => f.id)).toContain("test_simple_d6");
  });

  it("respects family-level cooldown across two different event ids in the same family", () => {
    const defA: EventDefinition = { ...SIMPLE_EVENT, id: "test_a", triggerTime: 10 * 60, familyCooldownDays: 4, worldFact: { ...SIMPLE_EVENT.worldFact, id: "test_a" } };
    const defB: EventDefinition = { ...SIMPLE_EVENT, id: "test_b", triggerTime: 10 * 60, familyCooldownDays: 4, worldFact: { ...SIMPLE_EVENT.worldFact, id: "test_b" } };
    // Family SOCIAL already fired on day 2 (via familyLastFired) -- test_b should not fire on day 3.
    const s = baseState({ day: 3, time: 9 * 60, familyLastFired: { SOCIAL: 2 } });
    const next = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [defA, defB]);
    expect(next.worldFacts).toHaveLength(0);
  });
});

describe("PHASE_12_5 event engine: idempotency and duplicate prevention", () => {
  it("does not fire twice for the same day even if resolveGeneratedEvents is called again with the same before/after window", () => {
    const def: EventDefinition = { ...SIMPLE_EVENT };
    const s = baseState({ day: 1, time: 9 * 60 });
    const once = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);
    const twice = resolveGeneratedEvents(9 * 60, { ...once, time: 11 * 60 }, [def]);
    expect(twice.worldFacts.filter((f) => f.id === "test_simple_d1")).toHaveLength(1);
  });

  it("does not fire when the trigger time was not crossed this tick (already past it before this tick started)", () => {
    const def: EventDefinition = { ...SIMPLE_EVENT, triggerTime: 10 * 60 };
    const s = baseState({ day: 1, time: 10 * 60 + 30 });
    // prevTime is already past the trigger -- this simulates a second short action later the same
    // day, after the crossing tick already happened (and, per the previous test, already fired).
    const next = resolveGeneratedEvents(10 * 60 + 30, { ...s, time: 10 * 60 + 45 }, [def]);
    expect(next.worldFacts).toHaveLength(0);
  });
});

describe("PHASE_12_5 event engine: chain progression", () => {
  const ask: EventDefinition = {
    id: "chain_ask",
    family: "PROMISE",
    participants: ["fumiko", "jin"],
    location: "COMMUNITY_HALL",
    playerPresenceRequired: false,
    triggerTime: 9 * 60,
    eligibility: {},
    cooldownDays: 10,
    worldFact: { id: "chain_ask", text: "頼んだ。", knownBy: ["fumiko", "jin"], category: "promise" },
  };
  const done: EventDefinition = {
    id: "chain_done",
    family: "PROMISE",
    participants: ["fumiko", "jin"],
    location: "COMMUNITY_HALL",
    playerPresenceRequired: false,
    triggerTime: 15 * 60,
    eligibility: { requiredFlags: ["chain_ask"] },
    cooldownDays: 0,
    resetFlagsOnFire: ["chain_ask"],
    worldFact: { id: "chain_done", text: "終わった。", knownBy: ["fumiko", "jin"], category: "pending_task" },
  };

  it("does not let the follow-up stage fire before the prerequisite stage has fired", () => {
    const s = baseState({ day: 1, time: 8 * 60 });
    const next = resolveGeneratedEvents(8 * 60, { ...s, time: 16 * 60 }, [done]); // only "done" in the table
    expect(next.worldFacts).toHaveLength(0);
  });

  it("lets the follow-up stage fire in the same tick right after the prerequisite fires, in definition order", () => {
    const s = baseState({ day: 1, time: 8 * 60 });
    const next = resolveGeneratedEvents(8 * 60, { ...s, time: 16 * 60 }, [ask, done]);
    expect(next.worldFacts.map((f) => f.id)).toEqual(expect.arrayContaining(["chain_ask_d1", "chain_done_d1"]));
  });

  it("resets the prerequisite flag once the follow-up fires, allowing the chain to restart after cooldown", () => {
    let s = baseState({ day: 1, time: 8 * 60 });
    s = resolveGeneratedEvents(8 * 60, { ...s, time: 16 * 60 }, [ask, done]);
    expect(s.flags.chain_ask).toBe(false); // reset by "done"

    // Before ask's cooldown (10 days) elapses, the chain must not restart.
    const tooSoon = resolveGeneratedEvents(8 * 60, { ...s, day: 5, time: 16 * 60 }, [ask, done]);
    expect(tooSoon.worldFacts.some((f) => f.id === "chain_ask_d5")).toBe(false);

    // Once ask's cooldown has elapsed, the whole chain can run again.
    const later = resolveGeneratedEvents(8 * 60, { ...s, day: 11, time: 16 * 60 }, [ask, done]);
    expect(later.worldFacts.map((f) => f.id)).toEqual(expect.arrayContaining(["chain_ask_d11", "chain_done_d11"]));
  });
});

describe("PHASE_12_5 event engine: Life Material propagation and knowledge boundary", () => {
  it("stamps the correct category and knownBy list from the definition onto the produced worldFact", () => {
    const def: EventDefinition = { ...SIMPLE_EVENT, worldFact: { id: "test_simple", text: "テスト。", knownBy: ["jin"], category: "world_change" } };
    const s = baseState({ day: 1, time: 9 * 60 });
    const next = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);
    const fact = next.worldFacts.find((f) => f.id === "test_simple_d1");
    expect(fact?.category).toBe("world_change");
    expect(fact?.knownBy).toEqual(["jin"]);
  });

  it("a follow-up event's eligibility genuinely depends on the earlier stage's Life Material having fired -- not just on the clock", () => {
    const ask: EventDefinition = {
      id: "propagation_ask",
      family: "PROMISE",
      participants: ["fumiko", "jin"],
      location: null,
      playerPresenceRequired: false,
      triggerTime: 9 * 60,
      eligibility: { minDay: 20 }, // never eligible within this test's day range
      cooldownDays: 10,
      worldFact: { id: "propagation_ask", text: "頼んだ。", knownBy: ["fumiko", "jin"], category: "promise" },
    };
    const done: EventDefinition = {
      id: "propagation_done",
      family: "PROMISE",
      participants: ["fumiko", "jin"],
      location: null,
      playerPresenceRequired: false,
      triggerTime: 15 * 60,
      eligibility: { requiredFlags: ["propagation_ask"] },
      cooldownDays: 0,
      worldFact: { id: "propagation_done", text: "終わった。", knownBy: ["fumiko", "jin"], category: "pending_task" },
    };
    const s = baseState({ day: 1, time: 8 * 60 });
    const next = resolveGeneratedEvents(8 * 60, { ...s, time: 16 * 60 }, [ask, done]);
    // ask never became eligible (minDay 20), so its Life Material never propagated -- done must not fire.
    expect(next.worldFacts).toHaveLength(0);
  });
});

describe("PHASE_12_5 event engine: quiet days and conflicting-event prevention", () => {
  it("allows a tick where nothing is eligible to fire zero events (a formally permitted quiet day)", () => {
    const def: EventDefinition = { ...SIMPLE_EVENT, eligibility: { minDay: 99 } };
    const s = baseState({ day: 1, time: 9 * 60 });
    const next = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);
    expect(next.worldFacts).toHaveLength(0);
    expect(next).toEqual(s.time === next.time ? next : { ...s, time: 11 * 60 }); // no incidental state drift beyond the clock
  });

  it("two events that are not mutually exclusive can both fire on the same day without clobbering each other's state", () => {
    const defA: EventDefinition = { ...SIMPLE_EVENT, id: "a", triggerTime: 10 * 60, worldFact: { ...SIMPLE_EVENT.worldFact, id: "a" } };
    const defB: EventDefinition = { ...SIMPLE_EVENT, id: "b", triggerTime: 10 * 60 + 30, worldFact: { ...SIMPLE_EVENT.worldFact, id: "b" } };
    const s = baseState({ day: 1, time: 9 * 60 });
    const next = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [defA, defB]);
    expect(next.worldFacts.map((f) => f.id)).toEqual(expect.arrayContaining(["a_d1", "b_d1"]));
  });
});

describe("PHASE_12_5 event engine: player-independent (day-transition) behavior", () => {
  it("eventLastFired and familyLastFired persist unaffected by the tick mechanism itself (bookkeeping is plain state, not re-derived)", () => {
    const def: EventDefinition = { ...SIMPLE_EVENT };
    const s = baseState({ day: 1, time: 9 * 60 });
    const next = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);
    expect(next.eventLastFired.test_simple).toBe(1);
    expect(next.familyLastFired.SOCIAL).toBe(1);
  });
});

describe("PHASE_12_5 event engine: a fired event's fact reaches conversation for an NPC who knows it (integration -- Section 23 'conversation referencing an event')", () => {
  it("a real V1 event definition's fact appears in a knowing NPC's own AI context after it fires", () => {
    const def = EVENT_DEFS.find((d) => d.id === "yohei_store_restock")!;
    const s = baseState({ day: 2, time: 8 * 60 });
    const fired = resolveGeneratedEvents(8 * 60, { ...s, time: 9 * 60 }, [def]);
    expect(fired.worldFacts.some((f) => f.id === "yohei_store_restock_d2")).toBe(true);

    const context = buildNpcAiContext("yohei", fired, "最近どうですか");
    expect(context.knownFacts).toContain(def.worldFact.text);
  });
});

describe("PHASE_12_5 event engine: diegetic discovery (eventTraceLinesAt)", () => {
  it("surfaces a location-bound event's natural-language text only on the day it fired, only at its location", () => {
    const def: EventDefinition = { ...SIMPLE_EVENT, location: "CAFE_NODOKA" };
    const s = baseState({ day: 1, time: 9 * 60 });
    const fired = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);

    expect(eventTraceLinesAt(fired, [def], "CAFE_NODOKA")).toEqual(["テストイベントが発生した。"]);
    expect(eventTraceLinesAt(fired, [def], "YOHEI_STORE")).toEqual([]); // wrong location
    const nextDay = { ...fired, day: 2 };
    expect(eventTraceLinesAt(nextDay, [def], "CAFE_NODOKA")).toEqual([]); // stale -- not today
  });

  it("never surfaces internal ids/family names -- only the authored worldFact.text", () => {
    const def: EventDefinition = { ...SIMPLE_EVENT, location: "CAFE_NODOKA" };
    const s = baseState({ day: 1, time: 9 * 60 });
    const fired = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);
    const lines = eventTraceLinesAt(fired, [def], "CAFE_NODOKA");
    for (const line of lines) {
      expect(line).not.toMatch(/test_simple|SOCIAL|WORLD_FACT|EVENT_CHAIN/);
    }
  });
});

describe("PHASE_12_6 event engine: requiredPlayerRelationship eligibility (Section 9/10)", () => {
  const PLAYER_GATED_EVENT: EventDefinition = {
    ...SIMPLE_EVENT,
    id: "test_player_gated",
    eligibility: { requiredPlayerRelationship: { npc: "yohei", tags: ["shared_history"] } },
    worldFact: { ...SIMPLE_EVENT.worldFact, id: "test_player_gated" },
  };

  it("does not fire when the player lacks the required tag with the named NPC", () => {
    const s = baseState({ day: 1, time: 9 * 60 }); // never helped yohei
    const next = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [PLAYER_GATED_EVENT]);
    expect(next.worldFacts).toHaveLength(0);
  });

  it("fires once the player has the required tag (shared_history via shelfFixedWithPlayer)", () => {
    const s = baseState({ day: 1, time: 9 * 60, flags: { shelfFixedWithPlayer: true } });
    const next = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [PLAYER_GATED_EVENT]);
    expect(next.worldFacts.map((f) => f.id)).toContain("test_player_gated_d1");
  });

  it("the real yohei_mentions_player_to_jin definition requires the player to have helped Yohei with the shelf", () => {
    const def = EVENT_DEFS.find((d) => d.id === "yohei_mentions_player_to_jin")!;
    const withoutHelp = baseState({ day: 5, time: 8 * 60 });
    const stillNothing = resolveGeneratedEvents(8 * 60, { ...withoutHelp, time: 9 * 60 }, [def]);
    expect(stillNothing.worldFacts).toHaveLength(0);

    const withHelp = baseState({ day: 5, time: 8 * 60, flags: { shelfFixedWithPlayer: true } });
    const fired = resolveGeneratedEvents(8 * 60, { ...withHelp, time: 9 * 60 }, [def]);
    expect(fired.worldFacts.map((f) => f.id)).toContain("yohei_mentions_player_to_jin_d5");
  });
});

describe("PHASE_12_6 event engine: presentation variation (Section 13, textVariants)", () => {
  it("picks deterministically among text + textVariants -- same day always picks the same option", () => {
    const def: EventDefinition = {
      ...SIMPLE_EVENT,
      id: "test_variants",
      cooldownDays: 0,
      worldFact: { id: "test_variants", text: "A", textVariants: ["B", "C"], knownBy: [], category: "shared_event" },
    };
    const s = baseState({ day: 7, time: 9 * 60 });
    const once = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);
    const fact1 = once.worldFacts.find((f) => f.id === "test_variants_d7")!;
    expect(["A", "B", "C"]).toContain(fact1.text);

    // Re-running the exact same (day, definition) must reproduce the exact same pick.
    const twice = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);
    const fact2 = twice.worldFacts.find((f) => f.id === "test_variants_d7")!;
    expect(fact2.text).toBe(fact1.text);
  });

  it("eventTraceLinesAt and the stored fact agree on which variant was picked (no template/stored-fact drift)", () => {
    const def: EventDefinition = {
      ...SIMPLE_EVENT,
      id: "test_variants2",
      location: "CAFE_NODOKA",
      cooldownDays: 0,
      worldFact: { id: "test_variants2", text: "A", textVariants: ["B", "C", "D"], knownBy: [], category: "shared_event" },
    };
    const s = baseState({ day: 3, time: 9 * 60 });
    const fired = resolveGeneratedEvents(9 * 60, { ...s, time: 11 * 60 }, [def]);
    const storedText = fired.worldFacts.find((f) => f.id === "test_variants2_d3")!.text;
    expect(eventTraceLinesAt(fired, [def], "CAFE_NODOKA")).toEqual([storedText]);
  });
});

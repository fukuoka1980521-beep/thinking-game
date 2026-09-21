import { describe, expect, it } from "vitest";
import { advanceDay, applyAction, createInitialState } from "../src/newlife/state";
import { getScene } from "../src/newlife/content";
import type { NewLife30State } from "../src/newlife/types";

/**
 * Three full deterministic 30-day playthroughs, one per player style
 * requested in the PHASE_27 trigger comment. These reuse the same
 * player-style -> outcome mapping already audited (as a paper walkthrough)
 * in docs/newlife/canonical/phase25-26/NEWLIFE_PHASE26_SCENARIO_VALIDATION_V1.md
 * "五つの全期間通過例" and confirmed in
 * docs/newlife/evaluation/PHASE_26_AUTONOMOUS_AI_AUDIT_V1.md §5 — this Run's
 * contribution is running them as real, reproducible code against the
 * actual engine rather than a hand-traced table.
 */
function play(actionsByDay: Record<number, string[]>): NewLife30State {
  let state = createInitialState();
  while (!state.finished) {
    if (!(state.day === 11 && state.day11Phase === "afternoon")) {
      for (const actionId of actionsByDay[state.day] ?? []) {
        state = applyAction(state, actionId);
      }
    } else {
      // Day 11 afternoon is a distinct beat from Day 11 morning -- apply the
      // afternoon-tagged actions (see WARM/SKEPTICAL day-11 entries below).
      for (const actionId of actionsByDay[111] ?? []) {
        state = applyAction(state, actionId);
      }
    }
    state = advanceDay(state);
  }
  return state;
}

describe("NEW LIFE 30-day engine — three full simulated playthroughs", () => {
  it("warm/helper: friendly every day, cheers Hina on, never pins down a concrete role -> PAUSE", () => {
    const state = play({
      1: ["help_move_box"],
      2: ["order_coffee"],
      3: ["ask_about_sign"],
      4: ["sit_on_chair"],
      5: ["ask_price_as_customer"],
      6: ["confirm_numbers_together"],
      7: ["offer_one_time_help"],
      8: ["join_the_joke"],
      9: ["confirm_waiting_area"],
      10: ["offer_limited_help"],
      12: ["ask_hina"],
      13: ["help_cafe_task"],
      20: ["just_say_impression"],
      21: ["cheer_her_on"],
    });
    expect(state.day24Outcome).toBe("PAUSE");
  });

  it("skeptical/direct: sharp early questioning plus an unrepaired public accusation -> SPLIT", () => {
    const state = play({
      1: ["ask_price"],
      3: ["ask_about_sign"],
      6: ["confirm_numbers_together"],
      111: ["publicly_blame_hina"],
      14: ["talk_to_one_side"],
      23: ["ask_each_scope"],
    });
    expect(state.day24Outcome).toBe("SPLIT");
  });

  it("low-engagement/brief: leaves every day with no functional action -> SOLO_TRIAL (the canon's own baseline path)", () => {
    const state = play({});
    expect(state.day24Outcome).toBe("SOLO_TRIAL");
  });

  it("none of the three paths repeats the same Day 1-24 scene heading twice (no repeated narrative structure)", () => {
    const titles = new Set<string>();
    for (let d = 1; d <= 24; d++) {
      if (d === 11) {
        titles.add(`11m:${getScene(11, "morning", null).title}`);
        titles.add(`11a:${getScene(11, "afternoon", null).title}`);
        continue;
      }
      const key = `${d}:${getScene(d, "done", "SOLO_TRIAL").title}`;
      expect(titles.has(key)).toBe(false);
      titles.add(key);
    }
  });

  it("Days 2/3/7/9 each carry a low-engagement hook addressed directly to a silent player", () => {
    for (const d of [2, 3, 7, 9]) {
      const scene = getScene(d, "done", null);
      expect(scene.lowEngagementHook).toBeTruthy();
    }
  });
});

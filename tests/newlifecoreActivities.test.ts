import { describe, expect, it } from "vitest";
import { createInitialCoreState } from "../src/newlifecore/types";
import { ACTIVITY_DEFS, activityById } from "../src/newlifecore/content/activityDefs";
import { activityEligible, activityEligibleToday, dueActivityResolutions } from "../src/newlifecore/content/activityEngine";
import { runActivity, startNewDay } from "../src/newlifecore/engine";
import { buildLocationScene, buildEndOfDayNarrative } from "../src/newlifecore/content/day1";
import { buildTodaysSigns } from "../src/newlifecore/content/todaysSigns";

const cafeDef = activityById("cafe_busy_hour")!;
const repairDef = activityById("repair_with_jin")!;
const shopDef = activityById("shop_helper")!;

function atDay(day: number, time: number) {
  const s = createInitialCoreState();
  return { ...s, day, time };
}

describe("PHASE_14_NEW_LIFE_GAMEPLAY_CORE_V1: activity definitions", () => {
  it("has exactly 3 activities (Section 5's own 'V1では3種類程度')", () => {
    expect(ACTIVITY_DEFS).toHaveLength(3);
  });

  it("never uses score/gamification vocabulary anywhere in any def (Section 9 ban)", () => {
    const banned = ["XP", "LEVEL", "レベル", "POINT", "ポイント", "STAR", "RANK", "ランク", "COMBO", "SUCCESS RATE", "PERFECT", "パーフェクト", "MISSION COMPLETE", "クエスト"];
    for (const def of ACTIVITY_DEFS) {
      const allText = JSON.stringify(def);
      for (const word of banned) {
        expect(allText, `${def.id} must not contain "${word}"`).not.toContain(word);
      }
    }
  });

  it("every def's task minutes sum exceeds its own time budget (so finishing everything requires an efficient pick, not the default outcome)", () => {
    for (const def of ACTIVITY_DEFS) {
      const total = def.tasks.reduce((sum, t) => sum + t.minutes, 0);
      expect(total, `${def.id}: sum of task minutes should exceed the budget`).toBeGreaterThan(def.timeBudgetMinutes);
    }
  });

  it("every def's time budget is still reachable by at least one real combination of tasks (so 'do everything' is genuinely possible, just not free)", () => {
    for (const def of ACTIVITY_DEFS) {
      // Greedy cheapest-first fit -- if even this can't fill close to the budget with >1 task, the
      // budget is miscalibrated.
      const sorted = [...def.tasks].sort((a, b) => a.minutes - b.minutes);
      let spent = 0;
      let taken = 0;
      for (const t of sorted) {
        if (spent + t.minutes <= def.timeBudgetMinutes) {
          spent += t.minutes;
          taken++;
        }
      }
      expect(taken, `${def.id}: at least 2 tasks should fit in the budget`).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("activity eligibility", () => {
  it("is not eligible before minDay", () => {
    const state = atDay(cafeDef.minDay - 1, cafeDef.eligibleFromMinutes);
    expect(activityEligible(cafeDef, state)).toBe(false);
  });

  it("is not eligible outside its clock-time window", () => {
    const state = atDay(cafeDef.minDay, cafeDef.eligibleFromMinutes - 60);
    expect(activityEligible(cafeDef, state)).toBe(false);
  });

  it("is eligible at minDay, inside the window, with the NPC available", () => {
    const state = atDay(cafeDef.minDay, cafeDef.eligibleFromMinutes + 10);
    expect(activityEligible(cafeDef, state)).toBe(true);
  });

  it("respects its own cooldown after a session", () => {
    const state = atDay(cafeDef.minDay, cafeDef.eligibleFromMinutes + 10);
    const after = runActivity(state, cafeDef, [cafeDef.tasks[0]]);
    const sameDayLater = { ...after, time: cafeDef.eligibleFromMinutes + 20 };
    expect(activityEligible(cafeDef, sameDayLater)).toBe(false); // same day, cooldown 2
  });

  it("activityEligibleToday ignores the clock-time window (for TODAY'S SIGNS, computed at wake)", () => {
    const state = atDay(cafeDef.minDay, 8 * 60 + 45); // wake time, well before the cafe's window
    expect(activityEligibleToday(cafeDef, state)).toBe(true);
    expect(activityEligible(cafeDef, state)).toBe(false);
  });
});

describe("runActivity: partial completion is normal, never a failure", () => {
  it("records exactly the tasks done, spends exactly their minutes (not the full budget)", () => {
    const state = atDay(cafeDef.minDay, cafeDef.eligibleFromMinutes);
    const before = state.time;
    const done = [cafeDef.tasks[0]]; // serve_coffee, 10 min
    const after = runActivity(state, cafeDef, done);
    expect(after.time).toBe(before + 10);
    expect(after.activityHelpCount[cafeDef.id]).toBe(1);
  });

  it("doing zero tasks is a valid, real session (0 minutes spent, still counted)", () => {
    const state = atDay(cafeDef.minDay, cafeDef.eligibleFromMinutes);
    const after = runActivity(state, cafeDef, []);
    expect(after.time).toBe(state.time);
    expect(after.activityHelpCount[cafeDef.id]).toBe(1);
  });
});

describe("world-change resolution: never instant, only via the daily tick, only after the threshold", () => {
  it("does not resolve after fewer than completionThreshold sessions", () => {
    let state = atDay(shopDef.minDay, shopDef.eligibleFromMinutes);
    state = runActivity(state, shopDef, [shopDef.tasks[0]]);
    for (let i = 0; i < 10; i++) state = startNewDay(state);
    expect(state.activityResolved[shopDef.id]).toBeFalsy();
  });

  it("resolves exactly resolveAfterDays after the LAST of completionThreshold sessions", () => {
    let state = atDay(shopDef.minDay, shopDef.eligibleFromMinutes);
    for (let i = 0; i < shopDef.completionThreshold; i++) {
      state = runActivity(state, shopDef, [shopDef.tasks[0]]);
      if (i < shopDef.completionThreshold - 1) {
        state = startNewDay(state);
        state = { ...state, time: shopDef.eligibleFromMinutes };
      }
    }
    expect(dueActivityResolutions(state)).toHaveLength(0);
    for (let i = 0; i < shopDef.resolveAfterDays; i++) state = startNewDay(state);
    expect(state.activityResolved[shopDef.id]).toBe(true);
    const fact = state.worldFacts.find((f) => f.id.startsWith(`${shopDef.id}_worldchange_d`));
    expect(fact?.text).toBe(shopDef.worldChangeText);
  });
});

describe("scene wiring: activity start button is an ordinary specialAction", () => {
  it("Miyoko's scene offers the cafe activity's start button only inside its eligible window", () => {
    const inWindow = { ...atDay(cafeDef.minDay, cafeDef.eligibleFromMinutes + 5), playerLocation: "CAFE_NODOKA" as const };
    const scene = buildLocationScene(inWindow);
    expect(scene.specialActions.some((a) => a.id === `start_activity_${cafeDef.id}`)).toBe(true);

    const outsideWindow = { ...atDay(cafeDef.minDay, 9 * 60), playerLocation: "CAFE_NODOKA" as const };
    const scene2 = buildLocationScene(outsideWindow);
    expect(scene2.specialActions.some((a) => a.id === `start_activity_${cafeDef.id}`)).toBe(false);
  });
});

describe("end-of-day narrative includes today's activity beat", () => {
  it("a session done today appears in today's end-of-day narrative", () => {
    const state = runActivity(atDay(cafeDef.minDay, cafeDef.eligibleFromMinutes), cafeDef, [cafeDef.tasks[0]]);
    const lines = buildEndOfDayNarrative(state);
    expect(lines).toContain(cafeDef.npcReactionMinimal);
  });
});

describe("PHASE_14 Section 4/22/23: TODAY'S SIGNS", () => {
  it("returns at most 3 signs", () => {
    const state = atDay(5, 8 * 60 + 45);
    expect(buildTodaysSigns(state).length).toBeLessThanOrEqual(3);
  });

  it("is deterministic: same state produces the same signs every call", () => {
    const state = atDay(5, 8 * 60 + 45);
    expect(buildTodaysSigns(state)).toEqual(buildTodaysSigns(state));
  });

  it("day 1 (before any activity/local-problem minDay is reached) still returns a finite, valid array, never crashes", () => {
    const state = atDay(1, 8 * 60 + 45);
    expect(() => buildTodaysSigns(state)).not.toThrow();
  });

  it("only ever surfaces a real, currently-eligible candidate's text -- never fabricates one", () => {
    const state = atDay(5, 8 * 60 + 45);
    const signs = buildTodaysSigns(state);
    for (const sign of signs) {
      const matchesActivity = ACTIVITY_DEFS.some((d) => d.todaysSignText === sign);
      const matchesLocalProblemPattern = /では、何か気になることがありそうだ。$/.test(sign);
      const matchesNpcHint = sign === "洋平商店で、清を見かけるかもしれない。" || sign === "集会所では朝から人の出入りがある。";
      expect(matchesActivity || matchesLocalProblemPattern || matchesNpcHint, `unrecognized sign text: ${sign}`).toBe(true);
    }
  });

  it("varies across at least some days in a short window (not the identical 3 every single day)", () => {
    const day3 = buildTodaysSigns(atDay(3, 8 * 60 + 45));
    const day10 = buildTodaysSigns(atDay(10, 8 * 60 + 45));
    const day20 = buildTodaysSigns(atDay(20, 8 * 60 + 45));
    const allIdentical = JSON.stringify(day3) === JSON.stringify(day10) && JSON.stringify(day10) === JSON.stringify(day20);
    expect(allIdentical).toBe(false);
  });
});

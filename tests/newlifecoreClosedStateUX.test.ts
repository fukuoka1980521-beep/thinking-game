import { describe, expect, it } from "vitest";
import { createInitialCoreState } from "../src/newlifecore/types";
import { nextOpeningTimeAt } from "../src/newlifecore/schedule";
import { buildLocationScene } from "../src/newlifecore/content/day1";
import type { CoreState } from "../src/newlifecore/types";

function atDayTime(time: number, location: CoreState["playerLocation"]): CoreState {
  const s = createInitialCoreState();
  // These tests probe the closed-state scene directly at an arbitrary time/location, independent of
  // how the player actually got there -- mirrors every other pure-state test in this suite (e.g.
  // newlifecoreLocalProblems.test.ts's `atDay` helper) rather than driving the full travel sequence.
  return { ...s, time, playerLocation: location, visitedLocations: [location, "TRIAL_HOUSE"] };
}

describe("PHASE_15_1_CLOSED_STATE_UX_FIX: nextOpeningTimeAt (schedule.ts, canonical-derived)", () => {
  it("CASE A/F -- returns Shizuko's real 10:00 opening for FORTUNE_HOUSE, derived from her own schedule, not hardcoded", () => {
    expect(nextOpeningTimeAt("shizuko", "FORTUNE_HOUSE", 9 * 60 + 30)).toBe(10 * 60);
  });

  it("CASE F -- a DIFFERENT npc/location pair (Kamiya/CHALLENGE_CENTER) derives a DIFFERENT real opening time from ITS OWN schedule, proving genericity (not a copy-pasted constant)", () => {
    expect(nextOpeningTimeAt("kamiya", "CHALLENGE_CENTER", 8 * 60)).toBe(9 * 60);
  });

  it("returns null once nothing more opens there today (closed for the rest of the day, not 'opens later')", () => {
    // Shizuko's last block ends 18:00; asking after that must not invent a fictitious later opening.
    expect(nextOpeningTimeAt("shizuko", "FORTUNE_HOUSE", 19 * 60)).toBeNull();
  });

  it("returns null when asked before ANY block exists for a mismatched location (defensive correctness)", () => {
    expect(nextOpeningTimeAt("shizuko", "YOHEI_STORE", 9 * 60)).toBeNull();
  });
});

describe("PHASE_15_1_CLOSED_STATE_UX_FIX: closed-state scene (content/day1.ts, real specialActions)", () => {
  it("CASE A -- FORTUNE_HOUSE at 09:30: closed, states the real 10:00 opening, offers a wait action", () => {
    const state = atDayTime(9 * 60 + 30, "FORTUNE_HOUSE");
    const scene = buildLocationScene(state);
    expect(scene.ambientLine).toContain("占いの館は閉まっていた");
    expect(scene.ambientLine).toContain("10:00");
    expect(scene.specialActions).toContainEqual({ id: "rest_a_while", label: "少し時間を過ごす" });
  });

  it("CASE B -- waiting (rest_a_while, the same TRIAL_HOUSE action, doShortAction(15)) eventually crosses into the open window", () => {
    let state = atDayTime(9 * 60 + 30, "FORTUNE_HOUSE");
    let scene = buildLocationScene(state);
    expect(scene.specialActions.some((a) => a.id === "rest_a_while")).toBe(true);
    // Simulate the SAME mutation rest_a_while's handler performs (doShortAction(state, 15) is a pure
    // time advance -- NewlifeCoreApp.tsx's own handler is UI-glue only, nothing engine-side to add).
    for (let i = 0; i < 3; i++) state = { ...state, time: state.time + 15 };
    scene = buildLocationScene(state);
    expect(scene.specialActions.some((a) => a.id === "start_fortune_telling")).toBe(true);
    expect(scene.ambientLine).not.toContain("閉まっていた");
  });

  it("CASE D -- YOHEI_STORE closed-state (after 19:00 closing) shows no fictitious later-today opening and stays a plain, non-misleading line", () => {
    const state = atDayTime(19 * 60 + 30, "YOHEI_STORE");
    const scene = buildLocationScene(state);
    expect(scene.ambientLine).toBe("洋平商店のシャッターは下りていた。");
    expect(scene.specialActions).toEqual([]);
  });

  it("CASE E -- CAFE_NODOKA closed-state (after 19:00 closing) mirrors the same shape", () => {
    const state = atDayTime(19 * 60 + 30, "CAFE_NODOKA");
    const scene = buildLocationScene(state);
    expect(scene.ambientLine).toBe("喫茶のどかは閉まっていた。");
    expect(scene.specialActions).toEqual([]);
  });

  it("CASE G -- once genuinely open, the closed-state text/wait-action never appears", () => {
    const state = atDayTime(10 * 60 + 15, "FORTUNE_HOUSE");
    const scene = buildLocationScene(state);
    expect(scene.ambientLine).not.toContain("閉まっていた");
    expect(scene.specialActions.some((a) => a.id === "rest_a_while")).toBe(false);
  });

  it("never introduces quest/mission vocabulary into the closed-state text", () => {
    const state = atDayTime(9 * 60 + 30, "FORTUNE_HOUSE");
    const scene = buildLocationScene(state);
    const banned = ["クエスト", "ミッション", "報酬", "タイマー"];
    for (const word of banned) expect(scene.ambientLine).not.toContain(word);
  });
});

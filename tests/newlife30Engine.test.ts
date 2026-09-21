import { describe, expect, it } from "vitest";
import { advanceDay, applyAction, createInitialState, resolveDay24Outcome } from "../src/newlife/state";
import { getScene, TOTAL_DAYS } from "../src/newlife/content";
import { answerFreeText } from "../src/newlife/npcVoice";
import { DAISUKE_OCCUPATION, NPC_IDS, type NewLife30State, type NpcId } from "../src/newlife/types";

const BARBER_PATTERN = /理容|床屋|理髪|barber/i;

// Each call is one player "leave"/"advance" action. Day 11 needs two such
// calls (morning, then afternoon) before Day 12 begins -- see
// NEWLIFE_30DAY_CHARACTER_DERIVED_PLAYABLE_V3.md §3 "必ず二手目の入力を待ってから Day 12 へ".
function leaveOneDay(state: NewLife30State): NewLife30State {
  return advanceDay(state);
}

describe("NEW LIFE 30-day engine — 30-day reachability", () => {
  it("reaches Day 30 and finishes when every day is simply left, without skipping Day 11's two phases", () => {
    let state = createInitialState();
    const daysVisited = new Set<string>();
    let guard = 0;
    while (!state.finished && guard < 200) {
      daysVisited.add(state.day === 11 ? `11:${state.day11Phase}` : `${state.day}`);
      state = leaveOneDay(state);
      guard++;
    }
    expect(state.finished).toBe(true);
    expect(state.day).toBe(TOTAL_DAYS);
    expect(daysVisited.has("11:morning")).toBe(true);
    expect(daysVisited.has("11:afternoon")).toBe(true);
    for (let d = 1; d <= 30; d++) {
      if (d === 11) continue;
      expect(daysVisited.has(`${d}`)).toBe(true);
    }
  });

  it("every day 1-30 (and both Day 11 phases) resolves to a scene with a heading, matching the canon's one-heading-per-day structure", () => {
    for (let d = 1; d <= 30; d++) {
      if (d === 11) {
        expect(getScene(11, "morning", null).title).toBeTruthy();
        expect(getScene(11, "afternoon", null).title).toBeTruthy();
        continue;
      }
      const scene = getScene(d, "done", "SOLO_TRIAL");
      expect(scene.day).toBe(d);
      expect(scene.title).toBeTruthy();
      expect(scene.options.length).toBeGreaterThan(0);
    }
  });
});

describe("NEW LIFE 30-day engine — six NPCs appear as intended", () => {
  it("all six canonical NPCs appear across the 30-day spine", () => {
    const seen = new Set<NpcId>();
    for (let d = 1; d <= 10; d++) getScene(d, "done", null).npcsPresent.forEach((n) => seen.add(n));
    getScene(11, "morning", null).npcsPresent.forEach((n) => seen.add(n));
    getScene(11, "afternoon", null).npcsPresent.forEach((n) => seen.add(n));
    for (let d = 12; d <= 24; d++) getScene(d, "done", null).npcsPresent.forEach((n) => seen.add(n));
    for (const outcome of ["JOINT_RETRY", "SOLO_TRIAL", "PAUSE", "SPLIT"] as const) {
      for (let d = 25; d <= 30; d++) getScene(d, "done", outcome).npcsPresent.forEach((n) => seen.add(n));
    }
    for (const npc of NPC_IDS) {
      expect(seen.has(npc)).toBe(true);
    }
  });
});

describe("NEW LIFE 30-day engine — Daisuke has no barber leakage", () => {
  it("Daisuke's tracked occupation is furniture/chair repair", () => {
    expect(DAISUKE_OCCUPATION).toBe("家具・椅子修理");
  });

  it("no day's scene text or options mention barber/haircut material", () => {
    for (let d = 1; d <= 30; d++) {
      const scenesToCheck =
        d === 11
          ? [getScene(11, "morning", null), getScene(11, "afternoon", null)]
          : d >= 25
            ? (["JOINT_RETRY", "SOLO_TRIAL", "PAUSE", "SPLIT"] as const).map((o) => getScene(d, "done", o))
            : [getScene(d, "done", "SOLO_TRIAL")];
      for (const scene of scenesToCheck) {
        expect(scene.text).not.toMatch(BARBER_PATTERN);
        for (const opt of scene.options) expect(opt.label).not.toMatch(BARBER_PATTERN);
      }
    }
  });

  it("asking Daisuke directly about a barber shop corrects the misconception rather than leaking old canon", () => {
    const state = createInitialState();
    const reply = answerFreeText("daisuke", "床屋さんですか？", state);
    expect(reply).not.toMatch(/私(は|が)?(床屋|理容師|理髪師)です/);
    expect(reply).toMatch(/椅子|家具/);
  });
});

describe("NEW LIFE 30-day engine — direct-question semantic routing", () => {
  it("answers what's for sale with the concrete menu facts, not a generic acknowledgment", () => {
    const state = createInitialState();
    expect(answerFreeText("hina", "何を売ってるんですか？", state)).toMatch(/280円|240円/);
  });

  it("answers the reservation split with concrete counts", () => {
    const state = createInitialState();
    expect(answerFreeText("yohei", "予約は何個ですか？", state)).toMatch(/十八|18/);
  });

  it("keeps unknowns unknown: profit question before Day 20 stays unresolved, after Day 20 gives the concrete figures", () => {
    let state = createInitialState();
    for (let i = 0; i < 18; i++) state = leaveOneDay(state); // reach Day 20
    expect(state.day).toBeLessThan(20);
    expect(answerFreeText("hina", "儲かりましたか？", state)).toMatch(/集計前/);

    while (state.day < 20) state = leaveOneDay(state);
    expect(answerFreeText("hina", "儲かりましたか？", state)).toMatch(/2,400円|2400円/);
  });

  it("workshop lending answers Daisuke's own decision, not a guaranteed yes", () => {
    const state = createInitialState();
    expect(answerFreeText("daisuke", "工房、貸してくれるんですか？", state)).not.toMatch(/一時間なら片づけられる/);
  });
});

describe("NEW LIFE 30-day engine — canonical state cannot be directly changed by free-talk output", () => {
  it("answerFreeText never mutates the state object it is given", () => {
    const state = createInitialState();
    const frozen = Object.freeze({ ...state });
    expect(() => answerFreeText("hina", "何を売ってるんですか？ 値段は？ 席は使える？ 儲かった？", frozen as NewLife30State)).not.toThrow();
    expect(frozen).toEqual(state);
  });

  it("answerFreeText's return type is a string, never a state object", () => {
    const state = createInitialState();
    const reply = answerFreeText("hina", "こんにちは", state);
    expect(typeof reply).toBe("string");
  });
});

describe("NEW LIFE 30-day engine — Day 24 causality for all four outcomes", () => {
  function runTo(day: number, actions: Record<number, string[]>): NewLife30State {
    let state = createInitialState();
    while (state.day < day || (state.day === day && state.day11Phase !== "done" && day !== 11)) {
      const dayActions = actions[state.day] ?? [];
      for (const a of dayActions) state = applyAction(state, a);
      if (state.day === 11) {
        if (state.day11Phase === "morning") {
          state = advanceDay(state); // -> afternoon, applying any morning action already applied above
        } else if (state.day11Phase === "afternoon") {
          state = advanceDay(state); // -> Day 12
        }
      } else {
        state = advanceDay(state);
      }
    }
    return state;
  }

  it("JOINT_RETRY: every named role is concretely secured with no unrepaired blame", () => {
    const actions: Record<number, string[]> = {
      10: ["suggest_time_split"],
      14: ["broker_direct_fact_check"],
      19: ["confirm_editor_role"],
    };
    const state = runTo(24, actions);
    expect(resolveDay24Outcome(state)).toBe("JOINT_RETRY");
    const after = advanceDay(state);
    expect(after.day24Outcome).toBe("JOINT_RETRY");
  });

  it("SOLO_TRIAL: fully passive baseline path (no functional action taken)", () => {
    const state = runTo(24, {});
    expect(resolveDay24Outcome(state)).toBe("SOLO_TRIAL");
  });

  it("PAUSE: warm encouragement without securing any concrete role", () => {
    const actions: Record<number, string[]> = { 21: ["cheer_her_on"] };
    const state = runTo(24, actions);
    expect(resolveDay24Outcome(state)).toBe("PAUSE");
  });

  it("SPLIT: an unrepaired public accusation overrides everything else, even role-securing work", () => {
    const actions: Record<number, string[]> = {
      10: ["suggest_time_split"],
      11: ["fix_sign_before_posting", "publicly_blame_hina"],
      14: ["broker_direct_fact_check"],
      19: ["confirm_editor_role"],
    };
    const state = runTo(24, actions);
    expect(resolveDay24Outcome(state)).toBe("SPLIT");
  });
});

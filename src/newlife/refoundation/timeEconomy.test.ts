import { describe, expect, it } from "vitest";
import {
  THOUGHT_TOOL_ALTERNATIVE_PLAN_DISCOUNT_MINUTES,
  TIME_COSTS,
  VERTICAL_SLICE_CASE_001_TOTAL_MINUTES,
  costOf,
  createWorldClock,
  hasTimeRemaining,
  remainingMinutes,
  spendTime,
} from "./timeEconomy";

describe("TIME_COSTS table (V3 review packet, verbatim)", () => {
  it("matches every published figure exactly", () => {
    expect(TIME_COSTS.QUICK_FACTUAL_OR_BOUNDARY_QUESTION).toBe(2);
    expect(TIME_COSTS.OPEN_EXPLORATORY_QUESTION).toBe(4);
    expect(TIME_COSTS.MOVE_CONVERSATION_PRIVATE).toBe(2);
    expect(TIME_COSTS.GROUP_HUDDLE).toBe(5);
    expect(TIME_COSTS.DECISION_SUMMARY_OR_ASSIGNMENT).toBe(2);
    expect(TIME_COSTS.REWRITE).toBe(12);
    expect(TIME_COSTS.CONTINUITY_REPAIR).toBe(6);
    expect(TIME_COSTS.REHEARSE_CHANGED_SCENE).toBe(8);
    expect(TIME_COSTS.CUT_SCENE_OR_BRIDGE_TRANSITIONS).toBe(10);
    expect(TIME_COSTS.UNDERSTUDY).toBe(18);
    expect(TIME_COSTS.THOUGHT_TOOL_BOUNDARY_CHECK).toBe(1);
    expect(TIME_COSTS.THOUGHT_TOOL_ROLE_SWAP).toBe(1); // "Counterfactual role swap... Costs 1 min."
    expect(TIME_COSTS.THOUGHT_TOOL_TASK_PERSONAL_SPLIT).toBe(0); // not stated in V3; conservative default (V32 §2.3)
    expect(TIME_COSTS.CLARIFY).toBe(0); // V14 §7
    expect(THOUGHT_TOOL_ALTERNATIVE_PLAN_DISCOUNT_MINUTES).toBe(2); // "Saves 2 min plan-generation cost"
  });
});

describe("costOf", () => {
  it("returns the base cost with no addend by default", () => {
    expect(costOf("QUICK_FACTUAL_OR_BOUNDARY_QUESTION")).toBe(2);
  });

  it("adds the +2 min private-conversation addend when requested", () => {
    expect(costOf("QUICK_FACTUAL_OR_BOUNDARY_QUESTION", { movedPrivate: true })).toBe(4);
    expect(costOf("OPEN_EXPLORATORY_QUESTION", { movedPrivate: true })).toBe(6);
  });
});

describe("WorldClock", () => {
  it("starts with the full budget unspent", () => {
    const clock = createWorldClock(VERTICAL_SLICE_CASE_001_TOTAL_MINUTES);
    expect(remainingMinutes(clock)).toBe(50);
  });

  it("spendTime decrements remaining minutes", () => {
    let clock = createWorldClock(50);
    clock = spendTime(clock, costOf("OPEN_EXPLORATORY_QUESTION"));
    expect(remainingMinutes(clock)).toBe(46);
    clock = spendTime(clock, costOf("REWRITE"));
    expect(remainingMinutes(clock)).toBe(34);
  });

  it("CLARIFY spends nothing (V14 §7)", () => {
    const clock = spendTime(createWorldClock(50), costOf("CLARIFY"));
    expect(remainingMinutes(clock)).toBe(50);
  });

  it("clamps at zero rather than going negative", () => {
    const clock = spendTime(createWorldClock(10), 999);
    expect(remainingMinutes(clock)).toBe(0);
  });

  it("hasTimeRemaining reflects the clamped remaining budget", () => {
    let clock = createWorldClock(5);
    expect(hasTimeRemaining(clock, 5)).toBe(true);
    expect(hasTimeRemaining(clock, 6)).toBe(false);
    clock = spendTime(clock, 5);
    expect(hasTimeRemaining(clock, 1)).toBe(false);
    expect(hasTimeRemaining(clock, 0)).toBe(true);
  });

  it("is pure — spendTime never mutates its input", () => {
    const before = createWorldClock(50);
    const snapshot = { ...before };
    spendTime(before, 10);
    expect(before).toEqual(snapshot);
  });

  it("rejects a negative initial budget", () => {
    expect(() => createWorldClock(-1)).toThrow();
  });

  it("rejects spending a negative amount", () => {
    expect(() => spendTime(createWorldClock(10), -1)).toThrow();
  });
});

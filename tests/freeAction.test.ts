import { describe, expect, it } from "vitest";
import { resolveFreeAction } from "../src/newlife/freeAction";
import { createInitialState } from "../src/newlife/state";

describe("NEW LIFE free input canonical actions", () => {
  it("recognizes an explicit Day 9 boundary-confirmation action", () => {
    const state = { ...createInitialState(), day: 9 };
    expect(resolveFreeAction(state, "miyoko", "\u5e2d\u306e\u4f7f\u3048\u308b\u7bc4\u56f2\u3092\u78ba\u8a8d\u3057\u3088\u3046")).toBe("press_miyoko_for_boundary");
  });
  it("does not invent NPC consent from an unrelated or merely vague line", () => {
    const state = { ...createInitialState(), day: 16 };
    expect(resolveFreeAction(state, "jin", "\u624b\u4f1d\u3063\u3066\u3082\u3089\u3048\u307e\u3059\u304b")).toBeNull();
  });
  it("recognizes a Day 14 player-owned direct fact-check facilitation", () => {
    const state = { ...createInitialState(), day: 14 };
    expect(resolveFreeAction(state, "hina", "\u4e8c\u4eba\u3067\u76f4\u63a5\u8a71\u3057\u3066\u78ba\u8a8d\u3057\u3088\u3046")).toBe("broker_direct_fact_check");
  });
});


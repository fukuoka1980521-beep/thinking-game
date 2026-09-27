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
  it("does not turn a Day 10 proposal into Hina ownership", () => {
    const state = { ...createInitialState(), day: 10 };
    expect(resolveFreeAction(state, "hina", "\u53d7\u3051\u6e21\u3057\u6642\u9593\u3092\u5206\u3051\u3088\u3046")).toBeNull();
  });
  it("does not turn a Day 14 invitation into completed mutual fact-checking", () => {
    const state = { ...createInitialState(), day: 14 };
    expect(resolveFreeAction(state, "hina", "\u4e8c\u4eba\u3067\u76f4\u63a5\u8a71\u3057\u3066\u78ba\u8a8d\u3057\u3088\u3046")).toBeNull();
  });
});


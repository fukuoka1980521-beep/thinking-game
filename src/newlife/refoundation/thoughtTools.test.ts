/**
 * Behavior tests for the V11 stage 6 thought tools
 * (V32_THOUGHT_TOOLS_CONTRACT_V1.md). Each `it` cites the spec passage it
 * pins down.
 */
import { describe, expect, it } from "vitest";
import {
  BOUNDARY_CHECK_OPTIONS,
  ROLE_SWAP_CANDIDATE_POOL,
  applyAlternativePlanDiscount,
  openAlternativePlanSlot,
  splitTaskAndPersonalTrack,
  useBoundaryCheckTool,
  useRoleSwapTool,
} from "./thoughtTools";
import { TIME_COSTS } from "./timeEconomy";
import type { ActionType } from "./types";

describe("useBoundaryCheckTool (V32 §2.1)", () => {
  it("returns a DISCOVER-classified ASK_BOUNDARY turn at the discounted 1-minute cost", () => {
    const result = useBoundaryCheckTool();
    expect(result.turn).toEqual({ action: "ASK_BOUNDARY", boundaryMode: "DISCOVER" });
    expect(result.costMinutes).toBe(TIME_COSTS.THOUGHT_TOOL_BOUNDARY_CHECK);
    expect(result.costMinutes).toBe(1);
  });

  it("offers exactly the three-option answer shape NO/OK/SUBSTITUTE", () => {
    expect(useBoundaryCheckTool().answerShape).toEqual(BOUNDARY_CHECK_OPTIONS);
    expect(BOUNDARY_CHECK_OPTIONS).toEqual(["NO", "OK", "SUBSTITUTE"]);
  });

  it("is pure — repeated calls return equal, independent results", () => {
    expect(useBoundaryCheckTool()).toEqual(useBoundaryCheckTool());
  });
});

describe("openAlternativePlanSlot (V32 §2.2)", () => {
  it("returns null when the boundary is not yet STATED (gate: UNKNOWN)", () => {
    expect(openAlternativePlanSlot("UNKNOWN", "the autobiographical line")).toBeNull();
  });

  it("returns null once the boundary is already dispositioned (RESPECTED/OVERRIDDEN) — the tool proposes a substitute before disposition, not after", () => {
    expect(openAlternativePlanSlot("RESPECTED", "the autobiographical line")).toBeNull();
    expect(openAlternativePlanSlot("OVERRIDDEN", "the autobiographical line")).toBeNull();
  });

  it("opens a slot at 0 minutes once BOUNDARY is STATED, carrying the caller-supplied discomfort label verbatim", () => {
    const slot = openAlternativePlanSlot("STATED", "using her real story");
    expect(slot).toEqual({ status: "OPEN", discomfort: "using her real story", costMinutes: 0 });
  });
});

describe("applyAlternativePlanDiscount (V32 §2.2)", () => {
  it("subtracts the 2-minute discount from a base REWRITE-shaped cost", () => {
    expect(applyAlternativePlanDiscount(TIME_COSTS.REWRITE)).toBe(10);
  });

  it("never goes negative for a small base cost", () => {
    expect(applyAlternativePlanDiscount(1)).toBe(0);
    expect(applyAlternativePlanDiscount(0)).toBe(0);
  });
});

describe("splitTaskAndPersonalTrack (V32 §2.3)", () => {
  it("returns the two caller-supplied labels plus a deferred marker, at the documented (assumed) 0-minute cost", () => {
    const split = splitTaskAndPersonalTrack("scene rewrite deadline", "why the material matters to her");
    expect(split).toEqual({
      currentTask: "scene rewrite deadline",
      personalPattern: "why the material matters to her",
      personalTrackDeferred: true,
      costMinutes: TIME_COSTS.THOUGHT_TOOL_TASK_PERSONAL_SPLIT,
    });
    expect(split.costMinutes).toBe(0);
  });

  it("has no field capable of representing an opened personal track (structural: no PersonalTrackSignal import)", () => {
    const split = splitTaskAndPersonalTrack("a", "b");
    expect(Object.keys(split).sort()).toEqual(["costMinutes", "currentTask", "personalPattern", "personalTrackDeferred"].sort());
  });
});

describe("useRoleSwapTool (V32 §2.4)", () => {
  it("suggests the first pool candidate when nothing has been used yet", () => {
    const suggestion = useRoleSwapTool(new Set());
    expect(suggestion.candidate).toBe(ROLE_SWAP_CANDIDATE_POOL[0]);
    expect(suggestion.costMinutes).toBe(TIME_COSTS.THOUGHT_TOOL_ROLE_SWAP);
    expect(suggestion.costMinutes).toBe(1);
    expect(suggestion.guaranteed).toBe(false);
  });

  it("skips candidates already used/considered this case", () => {
    const used = new Set<ActionType>([ROLE_SWAP_CANDIDATE_POOL[0], ROLE_SWAP_CANDIDATE_POOL[1]]);
    const suggestion = useRoleSwapTool(used);
    expect(suggestion.candidate).toBe(ROLE_SWAP_CANDIDATE_POOL[2]);
  });

  it("returns null once every pool candidate has been used (not guaranteed to always have a suggestion)", () => {
    const suggestion = useRoleSwapTool(new Set(ROLE_SWAP_CANDIDATE_POOL));
    expect(suggestion.candidate).toBeNull();
  });
});

describe("no morality/empathy score, no required-for-ending coupling (cross-cutting, V32 §3)", () => {
  it("no tool export's return shape carries a RelationshipState, trust, or score-shaped field", () => {
    const samples = [
      useBoundaryCheckTool(),
      openAlternativePlanSlot("STATED", "x"),
      splitTaskAndPersonalTrack("a", "b"),
      useRoleSwapTool(new Set()),
    ];
    for (const sample of samples) {
      const serialized = JSON.stringify(sample);
      for (const forbiddenKey of ["relationshipState", "trust", "score", "morality", "empathy"]) {
        expect(serialized.toLowerCase().includes(forbiddenKey.toLowerCase())).toBe(false);
      }
    }
  });
});

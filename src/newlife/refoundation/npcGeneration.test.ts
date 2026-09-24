/**
 * Behavior tests for the V11 stage 5 NPC generation contract
 * (V31_NPC_GENERATION_CONTRACT_V1.md). Each `it` cites the trigger
 * requirement or spec passage it pins down.
 */
import { describe, expect, it } from "vitest";
import {
  FixedResponseNpcAdapter,
  NPC_VOICE_CONSTRAINTS,
  NullNpcGenerationAdapter,
  generateNpcLine,
  isValidRawNpcLine,
  type NpcGenerationAdapter,
  type NpcVisibleStateProjection,
} from "./npcGeneration";
import { ALL_ACTION_TYPES, ALL_BOUNDARY_MODES, ALL_RELATIONAL_EVENTS, type RelationshipState } from "./types";

const OPENING_PROJECTION: NpcVisibleStateProjection = {
  npc: "MIKA",
  relationshipState: "NEUTRAL",
  boundaryStatus: "UNKNOWN",
  lastPlayerTurn: null,
  sceneContext: "16:40, rehearsal stopped, the disputed scene",
};

describe("isValidRawNpcLine — schema validation (V31 §3)", () => {
  it("accepts a well-formed line for the expected npc", () => {
    expect(isValidRawNpcLine({ npc: "MIKA", text: "この場面は、変えないなら出ません。" }, "MIKA")).toBe(true);
  });

  it("rejects a response answering as the wrong character (requirement 5's identity check)", () => {
    expect(isValidRawNpcLine({ npc: "RYO", text: "そうだな。" }, "MIKA")).toBe(false);
  });

  it("rejects non-object / null values", () => {
    expect(isValidRawNpcLine(null, "MIKA")).toBe(false);
    expect(isValidRawNpcLine("not an object", "MIKA")).toBe(false);
    expect(isValidRawNpcLine(42, "MIKA")).toBe(false);
  });

  it("rejects a missing, empty, or non-string text field", () => {
    expect(isValidRawNpcLine({ npc: "MIKA" }, "MIKA")).toBe(false);
    expect(isValidRawNpcLine({ npc: "MIKA", text: "" }, "MIKA")).toBe(false);
    expect(isValidRawNpcLine({ npc: "MIKA", text: 12345 }, "MIKA")).toBe(false);
  });

  it("rejects a text field over the bounded length (runaway completion treated as malformed)", () => {
    expect(isValidRawNpcLine({ npc: "MIKA", text: "あ".repeat(601) }, "MIKA")).toBe(false);
    expect(isValidRawNpcLine({ npc: "MIKA", text: "あ".repeat(600) }, "MIKA")).toBe(true);
  });

  it("rejects every closed ActionType/BoundaryMode/RelationalEvent token appearing literally in generated text (V31 §3.3 label-leak denylist)", () => {
    for (const token of [...ALL_ACTION_TYPES, ...ALL_BOUNDARY_MODES, ...ALL_RELATIONAL_EVENTS]) {
      expect(isValidRawNpcLine({ npc: "MIKA", text: `state=${token}` }, "MIKA")).toBe(false);
    }
  });

  it("rejects RelationshipState/axis-name tokens appearing literally in generated text", () => {
    for (const token of ["OPEN", "NEUTRAL", "GUARDED", "WITHDRAWN", "TRUST", "CLARITY", "SITUATION"]) {
      expect(isValidRawNpcLine({ npc: "MIKA", text: `[${token}]` }, "MIKA")).toBe(false);
    }
  });

  it("does not reject ordinary Japanese dialogue merely for containing common substrings", () => {
    expect(isValidRawNpcLine({ npc: "RYO", text: "昨日まではやってただろ。今ここで変えたら、全員の段取りが崩れる。" }, "RYO")).toBe(true);
  });
});

describe("generateNpcLine — fallback behavior (V31 §4)", () => {
  it("falls back when no adapter is configured (NullNpcGenerationAdapter)", async () => {
    const result = await generateNpcLine(new NullNpcGenerationAdapter(), OPENING_PROJECTION);
    expect(result.status).toBe("fallback");
    expect(result.fallback).toBe(true);
    expect(result.npc).toBe("MIKA");
    expect(result.text.length).toBeGreaterThan(0);
  });

  it("falls back when the adapter throws, without letting the error escape", async () => {
    const throwingAdapter: NpcGenerationAdapter = {
      async generate() {
        throw new Error("boom");
      },
    };
    const result = await generateNpcLine(throwingAdapter, OPENING_PROJECTION);
    expect(result.status).toBe("fallback");
    if (result.status === "fallback") {
      expect(result.reason).toContain("adapter_threw");
    }
  });

  it("falls back when the adapter returns a malformed shape", async () => {
    const adapter = new FixedResponseNpcAdapter({ status: "ok", raw: { npc: "MIKA" } }); // missing text
    const result = await generateNpcLine(adapter, OPENING_PROJECTION);
    expect(result.status).toBe("fallback");
    if (result.status === "fallback") expect(result.reason).toBe("malformed_response");
  });

  it("falls back when the adapter answers as the wrong npc for the request", async () => {
    const adapter = new FixedResponseNpcAdapter({ status: "ok", raw: { npc: "RYO", text: "そうだな。" } });
    const result = await generateNpcLine(adapter, OPENING_PROJECTION); // requests MIKA
    expect(result.status).toBe("fallback");
  });

  it("passes through a well-formed adapter response unchanged", async () => {
    const adapter = new FixedResponseNpcAdapter({ status: "ok", raw: { npc: "MIKA", text: "この場面、明日はやりません。" } });
    const result = await generateNpcLine(adapter, OPENING_PROJECTION);
    expect(result).toEqual({ status: "generated", npc: "MIKA", text: "この場面、明日はやりません。", fallback: false });
  });

  it("uses a distinct, non-cooperative fallback line for WITHDRAWN, never the same as NEUTRAL/OPEN (requirement: WITHDRAWN must reflect non-cooperation, never silently reset)", async () => {
    const withdrawnProjection: NpcVisibleStateProjection = { ...OPENING_PROJECTION, relationshipState: "WITHDRAWN" };
    const neutralProjection: NpcVisibleStateProjection = { ...OPENING_PROJECTION, relationshipState: "NEUTRAL" };
    const openProjection: NpcVisibleStateProjection = { ...OPENING_PROJECTION, relationshipState: "OPEN" };

    const withdrawn = await generateNpcLine(new NullNpcGenerationAdapter(), withdrawnProjection);
    const neutral = await generateNpcLine(new NullNpcGenerationAdapter(), neutralProjection);
    const open = await generateNpcLine(new NullNpcGenerationAdapter(), openProjection);

    expect(withdrawn.text).not.toBe(neutral.text);
    expect(withdrawn.text).not.toBe(open.text);
  });

  it("uses a distinct fallback line per RelationshipState for both MIKA and RYO (deterministic table, not one generic line)", async () => {
    const states: RelationshipState[] = ["OPEN", "NEUTRAL", "GUARDED", "WITHDRAWN"];
    for (const npc of ["MIKA", "RYO"] as const) {
      const texts = new Set<string>();
      for (const relationshipState of states) {
        const result = await generateNpcLine(new NullNpcGenerationAdapter(), { ...OPENING_PROJECTION, npc, relationshipState });
        texts.add(result.text);
      }
      expect(texts.size).toBe(states.length);
    }
  });
});

describe("no direct state mutation / no hidden-fact leakage (structural)", () => {
  it("NpcVisibleStateProjection carries only the allowed fields — no other-NPC record, no causal history", () => {
    const keys = Object.keys(OPENING_PROJECTION).sort();
    expect(keys).toEqual(["boundaryStatus", "lastPlayerTurn", "npc", "relationshipState", "sceneContext"].sort());
  });

  it("generateNpcLine's resolved result never carries a state-mutating field", async () => {
    const result = await generateNpcLine(new NullNpcGenerationAdapter(), OPENING_PROJECTION);
    const serialized = JSON.stringify(result);
    for (const forbiddenKey of ["repairWindow", "causalEventHistory", "taskLedger", "relationshipState", "promiseBreakCount"]) {
      expect(serialized.includes(`"${forbiddenKey}"`)).toBe(false);
    }
  });

  it("static voice constraints exist for both vertical-slice NPCs and are never derived from player input", () => {
    expect(NPC_VOICE_CONSTRAINTS.MIKA.id).toBe("MIKA");
    expect(NPC_VOICE_CONSTRAINTS.RYO.id).toBe("RYO");
    expect(NPC_VOICE_CONSTRAINTS.MIKA.mustNot.length).toBeGreaterThan(0);
    expect(NPC_VOICE_CONSTRAINTS.RYO.mustNot.length).toBeGreaterThan(0);
  });
});

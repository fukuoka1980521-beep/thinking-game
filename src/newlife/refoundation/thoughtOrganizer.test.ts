/**
 * Behavior tests for the V37 §5 separate thought-organization layer
 * (`thoughtOrganizer.ts`). Each `it` cites the spec passage it pins down.
 */
import { describe, expect, it } from "vitest";
import {
  FixedResponseThoughtOrganizerAdapter,
  NullThoughtOrganizerAdapter,
  isValidRawThoughtOrganizerResult,
  organizeThought,
  type RawThoughtOrganizerResult,
  type ThoughtOrganizerAdapter,
  type ThoughtOrganizerRequest,
} from "./thoughtOrganizer";

const VALID: RawThoughtOrganizerResult = {
  known: ["明日18時が本番。チケットは販売済み。"],
  possible: ["亮は美香の理由を知らないかもしれない。"],
  unknown: ["美香が本当に嫌がっている部分。"],
  options: ["場面の内容だけ差し替える案を提示する", "17:30まで待って判断する"],
  nextCheck: "実話を外せば出演できるか確認する",
};

function baseRequest(overrides: Partial<ThoughtOrganizerRequest> = {}): ThoughtOrganizerRequest {
  return {
    validatedWorldFacts: "明日18:00が初回公演。チケットは販売済み。17:30までに決める必要がある。",
    recentDialogue: [
      { speaker: "SYSTEM", text: "16:40。通し稽古が止まっている。" },
      { speaker: "MIKA", text: "この場面、明日はやりません。" },
    ],
    currentProblem: "この場面をどう扱うかを17:30までに決める必要がある。",
    ...overrides,
  };
}

describe("isValidRawThoughtOrganizerResult — schema validation (V37 §5)", () => {
  it("accepts a well-formed result", () => {
    expect(isValidRawThoughtOrganizerResult(VALID)).toBe(true);
  });

  it("accepts a null nextCheck", () => {
    expect(isValidRawThoughtOrganizerResult({ ...VALID, nextCheck: null })).toBe(true);
  });

  it("accepts empty arrays for every list field", () => {
    expect(
      isValidRawThoughtOrganizerResult({ known: [], possible: [], unknown: [], options: [], nextCheck: null }),
    ).toBe(true);
  });

  it("rejects a missing list field", () => {
    const { known: _known, ...rest } = VALID;
    expect(isValidRawThoughtOrganizerResult(rest)).toBe(false);
  });

  it("rejects a non-array list field", () => {
    expect(isValidRawThoughtOrganizerResult({ ...VALID, options: "just talk to her" })).toBe(false);
  });

  it("rejects an empty-string nextCheck (must be a real question or null, never a blank placeholder)", () => {
    expect(isValidRawThoughtOrganizerResult({ ...VALID, nextCheck: "" })).toBe(false);
  });

  it("rejects an oversized list (data minimization)", () => {
    expect(isValidRawThoughtOrganizerResult({ ...VALID, known: Array(10).fill("x") })).toBe(false);
  });

  it("rejects non-object / null / array values outright", () => {
    expect(isValidRawThoughtOrganizerResult(null)).toBe(false);
    expect(isValidRawThoughtOrganizerResult("not an object")).toBe(false);
    expect(isValidRawThoughtOrganizerResult([VALID])).toBe(false);
  });

  it("has no npc-identifying field at all -- the type itself cannot claim to be a character's line (V37 §5 separation)", () => {
    expect(Object.keys(VALID).sort()).toEqual(["known", "nextCheck", "options", "possible", "unknown"]);
    expect("npc" in VALID).toBe(false);
  });
});

describe("organizeThought — orchestration", () => {
  it("returns the generated result on a valid adapter response", async () => {
    const adapter = new FixedResponseThoughtOrganizerAdapter({ status: "ok", raw: VALID });
    const result = await organizeThought(adapter, baseRequest());
    expect(result.status).toBe("generated");
    expect(result.fallback).toBe(false);
    expect(result.options).toEqual(VALID.options);
  });

  it("falls back to a safe, empty-shaped result when no provider is configured -- never a guess", async () => {
    const result = await organizeThought(new NullThoughtOrganizerAdapter(), baseRequest());
    expect(result.status).toBe("fallback");
    expect(result.known).toEqual([]);
    expect(result.possible).toEqual([]);
    expect(result.options).toEqual([]);
    expect(result.nextCheck).toBeNull();
  });

  it("falls back (never throws) when the adapter rejects", async () => {
    const throwingAdapter: ThoughtOrganizerAdapter = {
      async organize() {
        throw new Error("network exploded");
      },
    };
    const result = await organizeThought(throwingAdapter, baseRequest());
    expect(result.status).toBe("fallback");
    if (result.status === "fallback") expect(result.reason).toContain("adapter_threw");
  });

  it("falls back on a malformed response instead of trusting it", async () => {
    const adapter = new FixedResponseThoughtOrganizerAdapter({ status: "ok", raw: { garbage: true } });
    const result = await organizeThought(adapter, baseRequest());
    expect(result.status).toBe("fallback");
  });

  it("never mutates state: this module imports nothing state-mutating and the request object is left untouched", async () => {
    const adapter = new FixedResponseThoughtOrganizerAdapter({ status: "ok", raw: VALID });
    const request = baseRequest();
    const before = JSON.stringify(request);
    await organizeThought(adapter, request);
    expect(JSON.stringify(request)).toBe(before);
  });

  it("passes validatedWorldFacts/recentDialogue/currentProblem through unmodified, opaque pass-through", async () => {
    let captured: ThoughtOrganizerRequest | null = null;
    const capturingAdapter: ThoughtOrganizerAdapter = {
      async organize(request) {
        captured = request;
        return { status: "ok", raw: VALID };
      },
    };
    const request = baseRequest({ currentProblem: "亮が本当に必要としているものは何か。" });
    await organizeThought(capturingAdapter, request);
    expect(captured).toEqual(request);
  });
});

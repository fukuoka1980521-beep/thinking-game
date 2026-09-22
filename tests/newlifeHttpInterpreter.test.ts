import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpSemanticInterpreter, isValidInterpretation } from "../src/newlife/semantic/httpInterpreter";
import { createInitialState } from "../src/newlife/state";
import { projectFacts } from "../src/newlife/semantic/factsProjection";

const FAKE_URL = "https://example.invalid/newlife-dialogue";

function validInterpretation(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    conversationalAct: "factual_question",
    semanticIntents: [{ category: "menu", utteranceSpan: "何を売ってるの" }],
    entities: [],
    answerableFromCanon: true,
    requiredFacts: ["menu"],
    unknowns: [],
    proposedResponse: "スコーンとクッキーです。",
    ...overrides,
  };
}

// Mirrors tests/aiDialogueClient.test.ts's own coverage matrix for the same
// failure modes, against the NEW LIFE-specific client instead (Phase 30
// instruction 16: "malformed response => fallback", "timeout/network =>
// fallback").
describe("HttpSemanticInterpreter.interpret (Phase 30 instruction 16)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const snapshot = projectFacts("hina", { ...createInitialState(), day: 25 });

  it("reports unavailable with no network call when the endpoint is empty (matches config.ts's shipped default)", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const interpreter = new HttpSemanticInterpreter("");
    const result = await interpreter.interpret("何を売ってるの?", snapshot);
    expect(result).toEqual({ status: "unavailable", reason: "no_endpoint_configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reports unavailable for an empty or over-length utterance without ever calling fetch", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const interpreter = new HttpSemanticInterpreter(FAKE_URL);
    expect(await interpreter.interpret("   ", snapshot)).toEqual({ status: "unavailable", reason: "utterance_length" });
    expect(await interpreter.interpret("あ".repeat(201), snapshot)).toEqual({
      status: "unavailable",
      reason: "utterance_length",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns ok with the parsed interpretation on a well-formed success response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => validInterpretation() }));
    const interpreter = new HttpSemanticInterpreter(FAKE_URL);
    const result = await interpreter.interpret("何を売ってるの?", snapshot);
    expect(result).toEqual({ status: "ok", interpretation: validInterpretation() });
  });

  it("treats a non-2xx HTTP response as unavailable with the status code recorded", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const interpreter = new HttpSemanticInterpreter(FAKE_URL);
    const result = await interpreter.interpret("何を売ってるの?", snapshot);
    expect(result).toEqual({ status: "unavailable", reason: "http_500" });
  });

  it("treats a malformed (shape-invalid) response body as unavailable, never a crash", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ notAnInterpretation: true }) }));
    const interpreter = new HttpSemanticInterpreter(FAKE_URL);
    const result = await interpreter.interpret("何を売ってるの?", snapshot);
    expect(result).toEqual({ status: "unavailable", reason: "malformed_response" });
  });

  it("treats a response with a wrong enum value as malformed (shape check, not just field presence)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => validInterpretation({ conversationalAct: "not_a_real_act" }) }),
    );
    const interpreter = new HttpSemanticInterpreter(FAKE_URL);
    const result = await interpreter.interpret("何を売ってるの?", snapshot);
    expect(result).toEqual({ status: "unavailable", reason: "malformed_response" });
  });

  it("treats a blank proposedResponse as malformed", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => validInterpretation({ proposedResponse: "   " }) }));
    const interpreter = new HttpSemanticInterpreter(FAKE_URL);
    const result = await interpreter.interpret("何を売ってるの?", snapshot);
    expect(result).toEqual({ status: "unavailable", reason: "malformed_response" });
  });

  it("treats an aborted (timed-out) request as unavailable with reason 'timeout'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.reject(new DOMException("aborted", "AbortError"))));
    const interpreter = new HttpSemanticInterpreter(FAKE_URL);
    const result = await interpreter.interpret("何を売ってるの?", snapshot);
    expect(result).toEqual({ status: "unavailable", reason: "timeout" });
  });

  it("treats a generic network failure as unavailable, not a thrown error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const interpreter = new HttpSemanticInterpreter(FAKE_URL);
    await expect(interpreter.interpret("何を売ってるの?", snapshot)).resolves.toEqual({
      status: "unavailable",
      reason: "network_error",
    });
  });

  it("sends only the utterance and the already-minimal FactsSnapshot — never the full NewLife30State (data minimization)", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => validInterpretation() });
    vi.stubGlobal("fetch", fetchSpy);
    const interpreter = new HttpSemanticInterpreter(FAKE_URL);
    await interpreter.interpret("何を売ってるの?", snapshot);

    const sentBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(Object.keys(sentBody).sort()).toEqual(["snapshot", "utterance"]);
    expect(Object.keys(sentBody.snapshot).sort()).toEqual(["npc", "day", "known", "unknown", "negativeConstraints"].sort());
  });
});

describe("isValidInterpretation (structural validation, not just presence)", () => {
  it("accepts a well-formed interpretation", () => {
    expect(isValidInterpretation(validInterpretation())).toBe(true);
  });

  it("rejects a missing required field", () => {
    const { proposedResponse, ...withoutProposedResponse } = validInterpretation();
    expect(isValidInterpretation(withoutProposedResponse)).toBe(false);
  });

  it("rejects a semanticIntents entry with an invalid category", () => {
    expect(
      isValidInterpretation(validInterpretation({ semanticIntents: [{ category: "not_a_category", utteranceSpan: "x" }] })),
    ).toBe(false);
  });

  it("rejects a non-array requiredFacts", () => {
    expect(isValidInterpretation(validInterpretation({ requiredFacts: "menu" }))).toBe(false);
  });

  it("rejects null/non-object input without throwing", () => {
    expect(isValidInterpretation(null)).toBe(false);
    expect(isValidInterpretation("a string")).toBe(false);
    expect(isValidInterpretation(42)).toBe(false);
  });
});

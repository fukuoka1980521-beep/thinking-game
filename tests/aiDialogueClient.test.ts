import { afterEach, describe, expect, it, vi } from "vitest";
import { performDialogueFetch } from "../src/lib/aiDialogueClient";

const baseRequest = {
  situation: ["状況1行目"],
  question: "設問",
  choiceLabels: ["a", "b"],
  choiceLabel: "a",
  confidence: 50,
  reason: "理由",
  selectedInfoLabels: [],
  character: "DETECTIVE" as const,
};
const FAKE_URL = "https://example.invalid/dialogue";

// PersonalizedAiDialogueGate decides whether DIALOGUE_ENDPOINT_URL is
// configured before ever calling performDialogueFetch (see
// tests/aiDialogueGateDormant.test.tsx for that "not configured yet"
// behavior). This file covers every response-handling branch of
// performDialogueFetch itself: timeout, malformed body, empty message,
// non-2xx, network error, and data minimization of the outgoing payload.
describe("aiDialogueClient.performDialogueFetch (Section 25: timeout/malformed/empty/no-secret)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("treats a malformed (non-JSON-shaped) response body as a safe failure, never a crash", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ notMessage: 123 }) }));
    const result = await performDialogueFetch(FAKE_URL, baseRequest);
    expect(result).toEqual({ ok: false, reason: "malformed_response" });
  });

  it("treats an empty message string as a failure, not a blank success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ message: "   " }) }));
    const result = await performDialogueFetch(FAKE_URL, baseRequest);
    expect(result).toEqual({ ok: false, reason: "malformed_response" });
  });

  it("treats a non-2xx HTTP response as a recoverable failure with the status code recorded", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const result = await performDialogueFetch(FAKE_URL, baseRequest);
    expect(result).toEqual({ ok: false, reason: "http_500" });
  });

  it("treats an aborted (timed-out) request as a distinct, recognizable failure reason", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.reject(new DOMException("aborted", "AbortError"))));
    const result = await performDialogueFetch(FAKE_URL, baseRequest);
    expect(result).toEqual({ ok: false, reason: "timeout" });
  });

  it("treats a generic network failure as a safe, recoverable failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const result = await performDialogueFetch(FAKE_URL, baseRequest);
    expect(result).toEqual({ ok: false, reason: "network_error" });
  });

  it("returns the trimmed message on a well-formed success response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ message: "  こんにちは  " }) }));
    const result = await performDialogueFetch(FAKE_URL, baseRequest);
    expect(result).toEqual({ ok: true, message: "こんにちは" });
  });

  it("sends only the documented fields — no trajectory, growth, or device-identifying data (Section 15)", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ message: "ok" }) });
    vi.stubGlobal("fetch", fetchSpy);
    await performDialogueFetch(FAKE_URL, baseRequest);

    const sentBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(Object.keys(sentBody).sort()).toEqual(
      ["situation", "question", "choiceLabels", "choiceLabel", "confidence", "reason", "selectedInfoLabels", "character"].sort(),
    );
  });
});

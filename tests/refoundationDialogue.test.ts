import { afterEach, describe, expect, it, vi } from "vitest";
import { converseWithRefoundation, supportsRefoundation } from "../src/newlife/refoundationDialogue";

afterEach(() => vi.restoreAllMocks());

describe("validated refoundation dialogue bridge", () => {
  it("routes the four human-tested characters to the live conversational architecture", () => {
    expect(supportsRefoundation("hina")).toBe(true);
    expect(supportsRefoundation("yohei")).toBe(true);
    expect(supportsRefoundation("miyoko")).toBe(true);
    expect(supportsRefoundation("fumiko")).toBe(true);
    expect(supportsRefoundation("jin")).toBe(false);
    expect(supportsRefoundation("daisuke")).toBe(false);
  });

  it("sends recent conversation context instead of phrase-routing the new utterance", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      npc: "HINA", npcLine: "\u305d\u3046\u3067\u3059\u306d\u3002\u5168\u90e8\u5c4a\u3051\u3089\u308c\u305f\u3089\u3046\u308c\u3057\u3044\u3067\u3059\u3002",
      sceneStatus: "AWAIT_PLAYER", nextNpc: null,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const reply = await converseWithRefoundation("hina", "\u5168\u90e8\u58f2\u308c\u308b\u3068\u3044\u3044\u3067\u3059\u306d", [
      { speaker: "\u967d\u83dc", text: "\u4eca\u5ea6\u3001\u713c\u304d\u83d3\u5b50\u3092\u58f2\u308b\u3093\u3067\u3059\u3002" },
      { speaker: "\u3042\u306a\u305f", text: "\u4f55\u3092\u58f2\u308b\u3093\u3067\u3059\u304b\uff1f" },
    ]);
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.operation).toBe("converse_turn");
    expect(body.caseId).toBe("STREET_TRIAL_V1");
    expect(body.recentDialogue).toEqual([
      { speaker: "HINA", text: "\u4eca\u5ea6\u3001\u713c\u304d\u83d3\u5b50\u3092\u58f2\u308b\u3093\u3067\u3059\u3002" },
      { speaker: "PLAYER", text: "\u4f55\u3092\u58f2\u308b\u3093\u3067\u3059\u304b\uff1f" },
    ]);
    expect(reply.text).toContain("\u5168\u90e8");
  });
});

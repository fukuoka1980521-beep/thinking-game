import { afterEach, describe, expect, it, vi } from "vitest";
import { converseWithRefoundation, supportsRefoundation } from "../src/newlife/refoundationDialogue";

afterEach(() => vi.restoreAllMocks());

describe("validated refoundation dialogue bridge", () => {
  it("routes all six canonical characters to the live conversational architecture", () => {
    expect(supportsRefoundation("hina")).toBe(true);
    expect(supportsRefoundation("yohei")).toBe(true);
    expect(supportsRefoundation("miyoko")).toBe(true);
    expect(supportsRefoundation("fumiko")).toBe(true);
    expect(supportsRefoundation("jin")).toBe(true);
    expect(supportsRefoundation("daisuke")).toBe(true);
  });

  it("sends recent conversation context instead of phrase-routing the new utterance", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      npc: "HINA", npcLine: "\u305d\u3046\u3067\u3059\u306d\u3002\u5168\u90e8\u5c4a\u3051\u3089\u308c\u305f\u3089\u3046\u308c\u3057\u3044\u3067\u3059\u3002",
      sceneStatus: "AWAIT_PLAYER", nextNpc: null,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const reply = await converseWithRefoundation("hina", "\u5168\u90e8\u58f2\u308c\u308b\u3068\u3044\u3044\u3067\u3059\u306d", [
      { speaker: "\u967d\u83dc", text: "\u4eca\u5ea6\u3001\u713c\u304d\u83d3\u5b50\u3092\u58f2\u308b\u3093\u3067\u3059\u3002" },
      { speaker: "\u3042\u306a\u305f", text: "\u4f55\u3092\u58f2\u308b\u3093\u3067\u3059\u304b\uff1f" },
    ], { day: 2, title: "trial", text: "street trial", canonicalState: {} });
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.operation).toBe("converse_turn");
    expect(body.caseId).toBe("NEWLIFE_30DAY_V1");
    expect(body.dynamicState.day).toBe(2);
    expect(body.dynamicState.sceneText).toBe("street trial");
    expect(body.dynamicState.interactionKind).toBe("SPEECH");
    expect(body.recentDialogue).toEqual([
      { speaker: "HINA", text: "\u4eca\u5ea6\u3001\u713c\u304d\u83d3\u5b50\u3092\u58f2\u308b\u3093\u3067\u3059\u3002" },
      { speaker: "PLAYER", text: "\u4f55\u3092\u58f2\u308b\u3093\u3067\u3059\u304b\uff1f" },
    ]);
    expect(reply.text).toContain("\u5168\u90e8");
  });
  it("marks a selected game action as ACTION instead of pretending the label was spoken", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      npc: "HINA", npcLine: "ありがとうございます。箱、こっちに置いてもらえますか。",
      sceneStatus: "AWAIT_PLAYER", nextNpc: null,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    await converseWithRefoundation("hina", "手を貸す", [], {
      day: 1, title: "値段がついた箱", text: "陽菜が箱を持て余している。", canonicalState: {}, interactionKind: "ACTION",
    });

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.dynamicState.interactionKind).toBe("ACTION");
    expect(body.rawPlayerUtterance).toBe("手を貸す");
  });

  it("retries a transient 429 instead of dropping into canned dialogue", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("rate limited", { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        npc: "HINA", npcLine: "はい、今のところは大丈夫です。少しぎりぎりですけど。",
        sceneStatus: "AWAIT_PLAYER", nextNpc: null,
      }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const reply = await converseWithRefoundation("hina", "当日人手足りてますか", [], {
      day: 1, title: "trial", text: "street trial", canonicalState: {},
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(reply.text).toContain("大丈夫");
    expect(reply.continuations).toEqual([]);
  });

  it("keeps bounded NPC-to-NPC continuation turns in conversational order", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({
        npc: "HINA", npcLine: "私はこの数で一度やってみたいです。",
        sceneStatus: "NPC_EXCHANGE", nextNpc: "YOHEI",
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        npc: "YOHEI", npcLine: "なら、予約分だけは先に分けとけ。",
        sceneStatus: "AWAIT_PLAYER", nextNpc: null,
      }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const reply = await converseWithRefoundation("hina", "二人で確認してみたら？", [], {
      day: 6, title: "数のメモ", text: "二人が店先で話している。", canonicalState: {},
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(reply.continuations).toEqual([{ npc: "yohei", text: "なら、予約分だけは先に分けとけ。" }]);
    expect(reply.nextNpc).toBe("yohei");
  });

});

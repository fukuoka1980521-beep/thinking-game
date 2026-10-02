import { describe, expect, it } from "vitest";
import {
  appendAgentMemory,
  buildAgentObservationText,
  createEmptyAgentMemoryStore,
  formatRetrievedMemories,
  memoryRelevance,
  reflectionImportanceSinceLastReflection,
  retrieveAgentMemories,
  shouldReflect,
} from "../src/newlife/agentMemory";

describe("NEW LIFE durable agent memory", () => {
  it("keeps memories per NPC instead of one global transcript", () => {
    let store = createEmptyAgentMemoryStore();
    store = appendAgentMemory(store, {
      owner: "miyoko",
      day: 3,
      kind: "OBSERVATION",
      text: "プレイヤーは喫茶の待機席を事前に決めた方がよいと話した。",
      importance: 6,
      source: "PLAYER_SPEECH",
    });
    store = appendAgentMemory(store, {
      owner: "fumiko",
      day: 3,
      kind: "OBSERVATION",
      text: "文子は掲示の確認不足を認めた。",
      importance: 7,
      source: "NPC_SPEECH",
    });

    expect(store.miyoko).toHaveLength(1);
    expect(store.fumiko).toHaveLength(1);
    expect(store.hina).toHaveLength(0);
  });

  it("relevance prefers the same concrete scene topic over unrelated old material", () => {
    const relevant = memoryRelevance(
      "喫茶の席は何人まで待機に使えますか",
      "美代子は喫茶の待機席を何人まで使えるか先に決めたい。",
    );
    const unrelated = memoryRelevance(
      "喫茶の席は何人まで待機に使えますか",
      "大輔は工房で椅子の脚を修理している。",
    );

    expect(relevant).toBeGreaterThan(unrelated);
  });

  it("retrieves by the combined recency + importance + relevance contract", () => {
    let store = createEmptyAgentMemoryStore();
    store = appendAgentMemory(store, {
      owner: "miyoko",
      day: 1,
      kind: "OBSERVATION",
      text: "今日は天気がよかった。",
      importance: 1,
      source: "DAY_TRANSITION",
    });
    store = appendAgentMemory(store, {
      owner: "miyoko",
      day: 3,
      kind: "OBSERVATION",
      text: "喫茶の待機席は人数と条件を事前に決める必要がある。",
      importance: 8,
      source: "PLAYER_SPEECH",
    });

    const result = retrieveAgentMemories(store, "miyoko", "待機席は何人まで使える？", 1);
    expect(result.selected).toHaveLength(1);
    expect(result.selected[0].record.text).toContain("待機席");
    expect(formatRetrievedMemories(result.selected)[0]).toContain("Day 3");
  });

  it("touches retrieved memory access time without changing the memory content", () => {
    let store = createEmptyAgentMemoryStore();
    store = appendAgentMemory(store, {
      owner: "miyoko",
      day: 3,
      kind: "OBSERVATION",
      text: "待機席の人数を決める。",
      importance: 6,
      source: "PLAYER_SPEECH",
    });
    const before = store.miyoko[0];
    const result = retrieveAgentMemories(store, "miyoko", "待機席", 1);
    const after = result.store.miyoko[0];

    expect(after.text).toBe(before.text);
    expect(after.importance).toBe(before.importance);
    expect(after.lastAccessSeq).toBeGreaterThanOrEqual(before.lastAccessSeq);
  });

  it("triggers reflection only after enough non-reflection salience accumulates", () => {
    let store = createEmptyAgentMemoryStore();
    store = appendAgentMemory(store, {
      owner: "miyoko",
      day: 3,
      kind: "OBSERVATION",
      text: "席の依頼が曖昧だった。",
      importance: 8,
      source: "PLAYER_SPEECH",
    });
    store = appendAgentMemory(store, {
      owner: "miyoko",
      day: 3,
      kind: "OBSERVATION",
      text: "掲示に店名が出ている。",
      importance: 7,
      source: "NPC_SPEECH",
    });
    expect(reflectionImportanceSinceLastReflection(store, "miyoko")).toBe(15);
    expect(shouldReflect(store, "miyoko", 20)).toBe(false);

    store = appendAgentMemory(store, {
      owner: "miyoko",
      day: 3,
      kind: "OBSERVATION",
      text: "店の席は美代子自身が決める。",
      importance: 6,
      source: "WORLD_EFFECT",
    });
    expect(shouldReflect(store, "miyoko", 20)).toBe(true);

    store = appendAgentMemory(store, {
      owner: "miyoko",
      day: 3,
      kind: "REFLECTION",
      text: "協力はしたいが、店の席は具体的に確認してから決めたい。",
      importance: 8,
      source: "REFLECTION",
    });
    expect(reflectionImportanceSinceLastReflection(store, "miyoko")).toBe(0);
    expect(shouldReflect(store, "miyoko", 20)).toBe(false);
  });

  it("stores player meaning together with the concrete issue, decision, and authority", () => {
    const text = buildAgentObservationText({
      sceneTitle: "担当という言葉",
      sceneFocus: {
        issue: "会館前が混んだ時、客がどこで待つか決まっていない。",
        decision: "喫茶の席を何人まで使えるか事前に確認する。",
        authority: "席を決めるのは美代子。文子は掲示を担当する。",
      },
      playerMeaning: "当日判断にせず、対応できる範囲を先に決めた方がよい。",
      playerText: "商売ですから、できることとできないことは決めておいた方が良いですよ",
      selfReply: "人数や条件を先に決めておいた方がよさそうですね。",
    });

    expect(text).toContain("客がどこで待つか");
    expect(text).toContain("何人まで");
    expect(text).toContain("席を決めるのは美代子");
    expect(text).toContain("プレイヤーの意味");
    expect(text).toContain("当日判断にせず");
  });

  it("can record a world/day observation without pretending the player spoke", () => {
    let store = createEmptyAgentMemoryStore();
    store = appendAgentMemory(store, {
      owner: "miyoko",
      day: 5,
      kind: "OBSERVATION",
      text: "場面「いい商品、違う質問」が始まった。陽菜が試作品を持ってきた。",
      importance: 3,
      source: "DAY_TRANSITION",
    });

    expect(store.miyoko[0].source).toBe("DAY_TRANSITION");
    expect(store.miyoko[0].kind).toBe("OBSERVATION");
    expect(store.miyoko[0].text).not.toContain("プレイヤーが");
  });
});

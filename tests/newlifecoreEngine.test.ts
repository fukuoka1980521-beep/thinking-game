import { describe, expect, it, vi, afterEach } from "vitest";
import { advanceTime, addWorldFact, moveTo, recordConversationTurn } from "../src/newlifecore/engine";
import { npcAvailabilityAt, npcLocationAt, npcsPresentAt } from "../src/newlifecore/schedule";
import { buildNpcAiContext } from "../src/newlifecore/dialogue/contextBuilder";
import { deterministicNpcReply } from "../src/newlifecore/dialogue/deterministicAdapter";
import { liveNpcAdapter } from "../src/newlifecore/dialogue/liveAdapterClient";
import { validateNpcReply } from "../src/newlifecore/dialogue/envelope";
import { createInitialCoreState, DAY_START_MINUTES } from "../src/newlifecore/types";
import type { CoreState } from "../src/newlifecore/types";

describe("NEW LIFE CORE: time advances by actions, and a day does not end after one action", () => {
  it("moving to a location advances the clock by a fixed travel cost", () => {
    const s0 = createInitialCoreState();
    const s1 = moveTo(s0, "YOHEI_STORE");
    expect(s1.time).toBeGreaterThan(s0.time);
    expect(s1.ended).toBe(false);
  });

  it("a single action never ends the day (the day only ends at the late-night threshold or an explicit sleep)", () => {
    const s0 = createInitialCoreState();
    const s1 = moveTo(s0, "YOHEI_STORE");
    expect(s1.ended).toBe(false);
  });

  it("advancing time past the late-night threshold ends the day automatically", () => {
    const s0 = createInitialCoreState();
    const s1 = advanceTime(s0, 20 * 60); // 07:30 + 20h well past 23:30
    expect(s1.ended).toBe(true);
  });
});

describe("NEW LIFE CORE: NPC availability changes by schedule, independent of the player", () => {
  it("Jin is away from the community hall mid-day but present in the morning and late afternoon", () => {
    const flags: CoreState["flags"] = {};
    expect(npcAvailabilityAt("jin", 9 * 60, flags)).toBe("AVAILABLE");
    expect(npcAvailabilityAt("jin", 13 * 60, flags)).toBe("AWAY");
    expect(npcAvailabilityAt("jin", 16 * 60, flags)).toBe("AVAILABLE");
  });

  it("a world event can override an NPC's normal schedule (Yohei calling Jin over) without any player action", () => {
    const flags: CoreState["flags"] = { jinCalledToYohei: true };
    expect(npcLocationAt("jin", 12 * 60, flags)).toBe("YOHEI_STORE");
    expect(npcsPresentAt("YOHEI_STORE", 12 * 60, flags)).toContain("jin");
  });

  it("outside opening hours, a location shows no NPC present", () => {
    const flags: CoreState["flags"] = {};
    expect(npcsPresentAt("CAFE_NODOKA", 6 * 60, flags)).toHaveLength(0);
  });
});

describe("NEW LIFE CORE: an unvisited world event still progresses (directive Section 5/6/18)", () => {
  it("Yohei calling Jin over fires purely from elapsed time, never requiring the player to be present", () => {
    const s0 = createInitialCoreState(); // 07:30, nowhere near YOHEI_STORE or COMMUNITY_HALL
    const s1 = advanceTime(s0, 5 * 60); // jump straight to 12:30, well past the 11:15 trigger
    expect(s1.flags.jinCalledToYohei).toBe(true);
    expect(s1.worldFacts.some((f) => f.id === "jin_called_to_yohei")).toBe(true);
  });
});

describe("NEW LIFE CORE: NPC memory persistence", () => {
  it("a recorded conversation turn is retrievable as this NPC's own memory on a later turn", () => {
    const s0 = createInitialCoreState();
    const s1 = recordConversationTurn(s0, "yohei", "工具箱について聞きたいです", "「まあ、まだ使えるんだけどな」");
    expect(s1.npcMemory.yohei).toHaveLength(1);
    const ctx = buildNpcAiContext("yohei", s1, "今日は暑いですね");
    expect(ctx.memoryOfPlayer).toHaveLength(1);
    expect(ctx.memoryOfPlayer[0].playerUtterance).toBe("工具箱について聞きたいです");
  });

  it("memory is per-NPC -- talking to Miyoko does not appear in Yohei's memory of the player", () => {
    const s0 = createInitialCoreState();
    const s1 = recordConversationTurn(s0, "miyoko", "コーヒーをください", "「はい、どうぞ」");
    const ctxYohei = buildNpcAiContext("yohei", s1, "こんにちは");
    expect(ctxYohei.memoryOfPlayer).toHaveLength(0);
  });
});

describe("NEW LIFE CORE: knowledge boundary", () => {
  it("an NPC's AI context only ever includes world facts explicitly marked as known by that NPC", () => {
    const s0 = createInitialCoreState();
    const s1 = addWorldFact(s0, { id: "test_fact", time: s0.time, text: "洋平だけが知っている秘密の事実", knownBy: ["yohei"] });
    const ctxYohei = buildNpcAiContext("yohei", s1, "何か知ってますか");
    const ctxMiyoko = buildNpcAiContext("miyoko", s1, "何か知ってますか");
    expect(ctxYohei.worldFactsRelevant).toContain("洋平だけが知っている秘密の事実");
    expect(ctxMiyoko.worldFactsRelevant).not.toContain("洋平だけが知っている秘密の事実");
  });

  it("the deterministic responder never fabricates awareness when the player names another NPC -- it only acknowledges neutrally", () => {
    const s0 = createInitialCoreState();
    const ctx = buildNpcAiContext("miyoko", s0, "昨日、相馬さんと話したんですよ");
    const reply = deterministicNpcReply(ctx);
    // Must not claim specific knowledge of what was discussed -- only a plain, non-elaborating acknowledgment.
    expect(reply.visibleUtterance).toMatch(/そうなの/);
    expect(reply.visibleUtterance).not.toMatch(/修理|仕事の話|頼まれ/);
  });
});

describe("NEW LIFE CORE: AI reply cannot directly mutate canonical world state", () => {
  it("recordConversationTurn only ever appends a memory turn and advances time -- flags are untouched by conversation content", () => {
    const s0 = createInitialCoreState();
    const s1 = recordConversationTurn(s0, "yohei", "明日から正式に働かせてください", "「そうか、まあ考えとくよ」");
    expect(s1.flags).toEqual(s0.flags);
    expect(s1.worldFacts).toEqual(s0.worldFacts);
  });
});

describe("NEW LIFE CORE: AI failure fallback (directive Section 30)", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("a network failure falls back to a bounded, in-character reply instead of stopping or surfacing a raw error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;
    const s0 = createInitialCoreState();
    const ctx = buildNpcAiContext("jin", s0, "元気ですか");
    const reply = await liveNpcAdapter(ctx);
    expect(reply.visibleUtterance.length).toBeGreaterThan(0);
    expect(reply.visibleUtterance).not.toMatch(/error|Error|500|undefined/);
  });

  it("a non-OK HTTP response also falls back gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }) as unknown as typeof fetch;
    const s0 = createInitialCoreState();
    const ctx = buildNpcAiContext("kamiya", s0, "こんにちは");
    const reply = await liveNpcAdapter(ctx);
    expect(reply.visibleUtterance.length).toBeGreaterThan(0);
  });

  it("envelope validation degrades an empty/invalid raw reply to a bounded per-NPC fallback line, never a blank line", () => {
    const s0 = createInitialCoreState();
    const ctx = buildNpcAiContext("miyoko", s0, "こんにちは");
    expect(validateNpcReply(null, ctx).visibleUtterance.length).toBeGreaterThan(0);
    expect(validateNpcReply({ visibleUtterance: "" }, ctx).visibleUtterance.length).toBeGreaterThan(0);
    expect(validateNpcReply({}, ctx).visibleUtterance.length).toBeGreaterThan(0);
  });
});

describe("NEW LIFE CORE: DAY_START_MINUTES sanity", () => {
  it("the day begins at a plausible morning hour, timed so the first Challenge Center visit lands exactly at Kamiya's opening time", () => {
    expect(DAY_START_MINUTES).toBe(8 * 60 + 45);
    expect(DAY_START_MINUTES + 15).toBe(9 * 60); // +15min travel cost = 09:00, his schedule start
  });
});

import { describe, expect, it, vi, afterEach } from "vitest";
import {
  advanceTime,
  addWorldFact,
  canCookMeal,
  checkInRealWorldIntent,
  cookAndEat,
  createRealWorldIntent,
  moveTo,
  purchaseItems,
  recordConversationTurn,
  startNewDay,
} from "../src/newlifecore/engine";
import { npcAvailabilityAt, npcLocationAt, npcsPresentAt } from "../src/newlifecore/schedule";
import { buildNpcAiContext } from "../src/newlifecore/dialogue/contextBuilder";
import { deterministicNpcReply } from "../src/newlifecore/dialogue/deterministicAdapter";
import { liveNpcAdapter } from "../src/newlifecore/dialogue/liveAdapterClient";
import { validateNpcReply } from "../src/newlifecore/dialogue/envelope";
import { resolveWorldEvents } from "../src/newlifecore/content/day1WorldEvents";
import { buildEndOfDayNarrative, buildLocationScene, buildPurchaseNarration, describeBelongings, openingLineFor } from "../src/newlifecore/content/day1";
import { looksLikeRealLifeConcern } from "../src/newlifecore/content/realityBridge";
import { detectsCrisisSignal } from "../src/newlifecore/content/safetyRoute";
import { deriveResearchObservation } from "../src/newlifecore/content/research";
import { menuForNpc } from "../src/newlifecore/content/shop";
import { NPC_DEFS } from "../src/newlifecore/npcDefs";
import { createInitialCoreState, DAY_START_MINUTES } from "../src/newlifecore/types";
import type { CoreState, NpcId } from "../src/newlifecore/types";

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

  it("a stalled call that never settles is aborted and falls back, instead of leaving the caller waiting forever (own root-cause fix for the Owner playtest Jin-turn hang)", async () => {
    global.fetch = vi.fn((_url, opts) => {
      return new Promise((_resolve, reject) => {
        const signal = (opts as { signal?: AbortSignal }).signal;
        signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      });
    }) as unknown as typeof fetch;
    const s0 = createInitialCoreState();
    const ctx = buildNpcAiContext("jin", s0, "元気ですか");
    const reply = await liveNpcAdapter(ctx);
    expect(reply.visibleUtterance.length).toBeGreaterThan(0);
  }, 25000);

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

describe("NEW LIFE CORE: context continuity (directive Section 14 -- the top-priority defect category)", () => {
  it("Jin is never shown present at both the community hall and Yohei's store in the same instant", () => {
    const s0: CoreState = { ...createInitialCoreState(), time: 12 * 60, flags: { jinCalledToYohei: true } };
    const hallScene = buildLocationScene({ ...s0, playerLocation: "COMMUNITY_HALL" });
    const storeScene = buildLocationScene({ ...s0, playerLocation: "YOHEI_STORE" });
    expect(hallScene.npcsHere).not.toContain("jin");
    expect(storeScene.npcsHere).toContain("jin");
  });

  it("the shelf-help action is only ever offered while Jin is actually, physically at the store", () => {
    const beforeCall: CoreState = { ...createInitialCoreState(), time: 10 * 60, flags: {} };
    const duringCall: CoreState = { ...createInitialCoreState(), time: 12 * 60, flags: { jinCalledToYohei: true } };
    const beforeScene = buildLocationScene({ ...beforeCall, playerLocation: "YOHEI_STORE" });
    const duringScene = buildLocationScene({ ...duringCall, playerLocation: "YOHEI_STORE" });
    expect(beforeScene.specialActions.some((a) => a.id === "offer_help_shelf")).toBe(false);
    expect(duringScene.specialActions.some((a) => a.id === "offer_help_shelf")).toBe(true);
  });

  it("the shelf resolves itself by 13:30 even if the player never helps, and reads as a trace rather than an announcement", () => {
    const s0: CoreState = { ...createInitialCoreState(), time: 11 * 60 + 30, flags: { jinCalledToYohei: true } };
    const s1 = resolveWorldEvents(11 * 60, { ...s0, time: 13 * 60 + 45 });
    expect(s1.flags.shelfFixed).toBe(true);
    expect(s1.flags.shelfFixedWithPlayer).toBeFalsy();
    const scene = buildLocationScene({ ...s1, playerLocation: "YOHEI_STORE" });
    expect(scene.ambientLine).toMatch(/相馬が寄ってな/);
    // NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1 Section 19: the shelf thread being over
    // does not mean the store itself has nothing left to do -- ordinary shopping remains available
    // (previously this asserted 0 actions, back when the store had no purchase action at all).
    expect(scene.specialActions.map((a) => a.id)).toEqual(["shop_here"]);
  });
});

describe("NEW LIFE CORE: end-of-day reads as plain remaining facts, not a results list (directive Section 21)", () => {
  it("an untouched day still produces a non-empty, non-scored closing line", () => {
    const lines = buildEndOfDayNarrative(createInitialCoreState());
    expect(lines.length).toBeGreaterThan(0);
    expect(lines[lines.length - 1]).toBe("そして眠った。");
    expect(lines.join("")).not.toMatch(/獲得|スコア|ポイント|達成/);
  });

  it("an unfinished conversation with Kamiya reads as unresolved, not as a summary of what was learned", () => {
    const s0 = createInitialCoreState();
    const s1 = recordConversationTurn(s0, "kamiya", "まだ何も決めてません", "「そうですか」");
    const withMet = { ...s1, flags: { ...s1.flags, met_kamiya: true } };
    const lines = buildEndOfDayNarrative(withMet);
    expect(lines).toContain("神谷とは話が途中のままだ。");
  });
});

describe("NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1: canonical purchase (Section 8/9/10 -- structural, never AI-driven)", () => {
  it("purchasing real catalog items deducts money and adds inventory, in one canonical action", () => {
    const s0 = createInitialCoreState();
    const { state: s1, totalCost, purchasedLabels } = purchaseItems(s0, "yohei", ["rice", "meat", "vegetables"]);
    expect(totalCost).toBe(1200 + 800 + 500);
    expect(purchasedLabels).toEqual(["米（1袋）", "肉", "野菜"]);
    expect(s1.money).toBe(s0.money - totalCost);
    expect(s1.inventory.rice).toBe(1);
    expect(s1.inventory.meat).toBe(1);
    expect(s1.inventory.vegetables).toBe(1);
    expect(s1.time).toBeGreaterThan(s0.time);
    expect(s1.worldFacts.some((f) => f.knownBy.includes("yohei") && f.text.includes("米"))).toBe(true);
  });

  it("a purchase beyond the player's money is a no-op -- never a partial success or negative balance", () => {
    const s0 = { ...createInitialCoreState(), money: 100 };
    const { state: s1, purchasedLabels } = purchaseItems(s0, "yohei", ["rice"]);
    expect(purchasedLabels).toEqual([]);
    expect(s1).toEqual(s0);
  });

  it("an unregistered item id is silently ignored, never inventing a purchase for a product that does not exist", () => {
    const s0 = createInitialCoreState();
    const { state: s1, purchasedLabels } = purchaseItems(s0, "yohei", ["yakisoba"]);
    expect(purchasedLabels).toEqual([]);
    expect(s1).toEqual(s0);
  });

  it("each shop NPC has its own small, distinct, bounded catalog -- Kamiya and Jin have none", () => {
    expect(menuForNpc("yohei")?.map((i) => i.id)).toEqual(["rice", "meat", "vegetables", "daily_goods"]);
    expect(menuForNpc("miyoko")?.map((i) => i.id)).toEqual(["toast", "hot_sandwich", "coffee", "tea"]);
    expect(menuForNpc("kamiya")).toBeNull();
    expect(menuForNpc("jin")).toBeNull();
  });
});

describe("NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1: trial-house living actions (Section 12/13)", () => {
  it("cooking a meal requires actually owning a food ingredient -- never available from nothing", () => {
    const empty = createInitialCoreState();
    expect(canCookMeal(empty)).toBe(false);
    expect(cookAndEat(empty)).toEqual(empty); // no-op, matches purchaseItems' own no-op discipline

    const { state: withRice } = purchaseItems(empty, "yohei", ["rice"]);
    expect(canCookMeal(withRice)).toBe(true);
    const fed = cookAndEat(withRice);
    expect(fed.flags.ateMeal).toBe(true);
    expect(fed.time).toBeGreaterThan(withRice.time);
  });

  it("a daily-goods-only purchase (no food ingredient) still cannot cook a meal", () => {
    const { state: s1 } = purchaseItems(createInitialCoreState(), "yohei", ["daily_goods"]);
    expect(canCookMeal(s1)).toBe(false);
  });

  it("the trial house offers a small, state-dependent action list (2-6), not a fixed giant menu, and not zero", () => {
    const bare = buildLocationScene({ ...createInitialCoreState(), visitedLocations: ["TRIAL_HOUSE"] });
    expect(bare.specialActions.length).toBeGreaterThanOrEqual(2);
    expect(bare.specialActions.length).toBeLessThanOrEqual(6);
    expect(bare.specialActions.some((a) => a.id === "cook_and_eat")).toBe(false); // nothing to cook yet

    const { state: withFood } = purchaseItems(createInitialCoreState(), "yohei", ["rice"]);
    const afterShopping: CoreState = { ...withFood, playerLocation: "TRIAL_HOUSE", visitedLocations: [...withFood.visitedLocations, "TRIAL_HOUSE"], flags: { ...withFood.flags, met_kamiya: true } };
    const richer = buildLocationScene(afterShopping);
    expect(richer.specialActions.some((a) => a.id === "cook_and_eat")).toBe(true);
    expect(richer.specialActions.some((a) => a.id === "think_about_form")).toBe(true); // met Kamiya, form not yet submitted
    expect(richer.specialActions.length).toBeGreaterThan(bare.specialActions.length);
  });

  it("check_belongings reads real inventory as plain prose, never a raw object/JSON", () => {
    expect(describeBelongings({})).not.toMatch(/[{}[\]]/);
    const { state: s1 } = purchaseItems(createInitialCoreState(), "yohei", ["rice", "rice"].slice(0, 1)); // 1x rice
    const described = describeBelongings(s1.inventory);
    expect(described).toMatch(/米/);
    expect(described).not.toMatch(/[{}[\]]/);
  });
});

describe("NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1: one location supports multiple actions, never 1-location=1-event (Section 19)", () => {
  it("Yohei's store offers shopping alongside whatever else the scene already offers", () => {
    const s0 = createInitialCoreState();
    const scene = buildLocationScene({ ...s0, playerLocation: "YOHEI_STORE" });
    expect(scene.specialActions.some((a) => a.id === "shop_here")).toBe(true);
  });

  it("Cafe Nodoka offers ordering AND sitting down as two distinct real actions", () => {
    const s0 = createInitialCoreState();
    const scene = buildLocationScene({ ...s0, playerLocation: "CAFE_NODOKA" });
    expect(scene.specialActions.map((a) => a.id)).toEqual(["order_menu", "sit_down"]);
  });
});

describe("NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1: daily obligations are recorded facts, never a numeric score (Section 14/15/16)", () => {
  it("an ignored intake form and an unfed day are both reflected as plain end-of-day facts, not a penalty number", () => {
    const s0: CoreState = { ...createInitialCoreState(), flags: { met_kamiya: true }, visitedLocations: ["TRIAL_HOUSE", "CHALLENGE_CENTER"] };
    const lines = buildEndOfDayNarrative(s0);
    expect(lines).toContain("チャレンジセンターの用紙は、結局出さなかった。");
    expect(lines).toContain("その日は、特に何も食べなかった。");
    expect(lines.join("")).not.toMatch(/-?\d+点|スコア|ペナルティ|信用度/);
  });

  it("completing the same obligations reads as a different, equally plain fact -- never a reward number", () => {
    const s0: CoreState = { ...createInitialCoreState(), flags: { met_kamiya: true, intakeFormSubmitted: true, ateMeal: true }, visitedLocations: ["TRIAL_HOUSE", "CHALLENGE_CENTER"] };
    const lines = buildEndOfDayNarrative(s0);
    expect(lines).not.toContain("チャレンジセンターの用紙は、結局出さなかった。");
    expect(lines).toContain("帰って、買ってきた物で何か作って食べた。");
    expect(lines.join("")).not.toMatch(/獲得|ポイント|\+\d+/);
  });
});

describe("NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1: money/inventory change only through a confirmed canonical action (Section 8, extends the existing AI-cannot-mutate-state guarantee)", () => {
  it("a free-text conversation claiming a purchase happened never itself changes money or inventory", () => {
    const s0 = createInitialCoreState();
    const s1 = recordConversationTurn(s0, "yohei", "さっきお米を買いましたよね", "「そうだったか」");
    expect(s1.money).toBe(s0.money);
    expect(s1.inventory).toEqual(s0.inventory);
  });
});

describe("PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1: day transition (Section H/M scenario 4/5)", () => {
  it("startNewDay advances the day, resets the clock/location, but persists worldFacts, npcMemory, money, inventory, and flags like met_* / intakeFormSubmitted", () => {
    const s0 = createInitialCoreState();
    const s1 = recordConversationTurn(s0, "kamiya", "今日はここまでです", "「そうですか」");
    const s2 = addWorldFact(s1, { id: "shelf_fixed", time: s1.time, text: "洋平の棚は直った", knownBy: ["yohei"] });
    const s3: CoreState = { ...s2, flags: { ...s2.flags, met_kamiya: true, intakeFormSubmitted: true, ateMeal: true, isRaining: true }, money: 5000, ended: true };
    const s4 = startNewDay(s3);
    expect(s4.day).toBe(2);
    expect(s4.time).toBe(DAY_START_MINUTES);
    expect(s4.playerLocation).toBe("TRIAL_HOUSE");
    expect(s4.visitedLocations).toEqual(["TRIAL_HOUSE"]);
    expect(s4.ended).toBe(false);
    // persisted
    expect(s4.worldFacts).toEqual(s3.worldFacts);
    expect(s4.npcMemory.kamiya).toHaveLength(1);
    expect(s4.money).toBe(5000);
    expect(s4.flags.met_kamiya).toBe(true);
    expect(s4.flags.intakeFormSubmitted).toBe(true);
    // day-scoped flags reset
    expect(s4.flags.ateMeal).toBeFalsy();
    expect(s4.flags.isRaining).toBeFalsy();
  });

  it("a one-time world event (e.g. Yohei calling Jin) does not refire on a later day -- its own guard is already satisfied", () => {
    const s0 = createInitialCoreState();
    const s1 = advanceTime(s0, 3 * 60); // fires jinCalledToYohei during day 1
    expect(s1.flags.jinCalledToYohei).toBe(true);
    const s2 = startNewDay({ ...s1, ended: true });
    const s3 = advanceTime(s2, 3 * 60); // same clock window on day 2
    // still true (persisted), and no duplicate world fact was appended
    expect(s3.worldFacts.filter((f) => f.id === "jin_called_to_yohei")).toHaveLength(1);
  });

  it("recordConversationTurn stamps every turn with the CURRENT day", () => {
    const s0 = createInitialCoreState();
    const s1 = recordConversationTurn(s0, "miyoko", "day1の発言", "「そう」");
    const s2 = startNewDay({ ...s1, ended: true });
    const s3 = recordConversationTurn(s2, "miyoko", "day2の発言", "「あら」");
    expect(s3.npcMemory.miyoko[0].day).toBe(1);
    expect(s3.npcMemory.miyoko[1].day).toBe(2);
  });
});

describe("PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1: Reality Bridge loop (Section H) -- created only via a real action, never scored", () => {
  it("createRealWorldIntent records exactly the player's own words, never an inferred label, and is known only to the Thinking Resident", () => {
    const s0 = createInitialCoreState();
    const s1 = createRealWorldIntent(s0, "daisuke", "最近仕事を先延ばしにしています", "明日、一件だけ手をつけてみる");
    expect(s1.realWorldIntents).toHaveLength(1);
    const intent = s1.realWorldIntents[0];
    expect(intent.playerStatement).toBe("最近仕事を先延ばしにしています");
    expect(intent.intentLabel).toBe("明日、一件だけ手をつけてみる");
    expect(intent.checkedIn).toBe(false);
    expect(intent.createdOnDay).toBe(1);
    const fact = s1.worldFacts.find((f) => f.id.endsWith("_created"));
    expect(fact?.knownBy).toEqual(["daisuke"]);
    expect(fact?.text).toContain("明日、一件だけ手をつけてみる");
    expect(fact?.text).not.toMatch(/lazy|procrastinat|怠け|やる気がない/);

    const ctxDaisuke = buildNpcAiContext("daisuke", s1, "こんにちは");
    const ctxYohei = buildNpcAiContext("yohei", s1, "こんにちは");
    expect(ctxDaisuke.knownFacts.join(" ")).toContain("明日、一件だけ手をつけてみる");
    expect(ctxYohei.knownFacts.join(" ")).not.toContain("明日、一件だけ手をつけてみる");
  });

  it("checkInRealWorldIntent marks the intent checked-in, stores a plain USER_UPDATE category (not a success/failure score), and is idempotent", () => {
    const s0 = createInitialCoreState();
    const s1 = createRealWorldIntent(s0, "daisuke", "運動が続かない", "今週、1回だけ歩く");
    const intentId = s1.realWorldIntents[0].id;
    const s2 = checkInRealWorldIntent(s1, intentId, "partially", "");
    expect(s2.realWorldIntents[0].checkedIn).toBe(true);
    expect(s2.realWorldIntents[0].userUpdate?.response).toBe("partially");
    const fact = s2.worldFacts.find((f) => f.id.endsWith("_checked_in"));
    expect(fact?.knownBy).toEqual(["daisuke"]);
    expect(fact?.text.toLowerCase()).not.toMatch(/成功|失敗|success|failure|score/);

    const s3 = checkInRealWorldIntent(s2, intentId, "did_it", "");
    expect(s3).toBe(s2); // true no-op on an already-checked-in intent, including no extra time cost
  });

  it("deriveResearchObservation reflects state accurately without computing any personality/diagnosis score", () => {
    const s0 = createInitialCoreState();
    const s1 = recordConversationTurn(s0, "daisuke", "最近仕事を先延ばしにしています", "「そうか」");
    const s2 = createRealWorldIntent(s1, "daisuke", "最近仕事を先延ばしにしています", "明日1件だけやる");
    const obs = deriveResearchObservation(s2);
    expect(obs.freeTextTurnCount).toBe(1);
    expect(obs.freeTextTurnCountByNpc.daisuke).toBe(1);
    expect(obs.chosePersonalAction).toBe(true);
    expect(obs.realWorldIntentCount).toBe(1);
    expect(obs.returnedNextDay).toBe(false);
    expect(JSON.stringify(obs)).not.toMatch(/score|diagnosis|personality/i);
  });

  it("BARBERSHOP offers the check-in action only once the player returns on a LATER day, not the same day the intent was created", () => {
    const s0 = createInitialCoreState();
    const s1 = createRealWorldIntent({ ...s0, playerLocation: "BARBERSHOP", time: 12 * 60 }, "daisuke", "x", "y");
    const sceneSameDay = buildLocationScene({ ...s1, playerLocation: "BARBERSHOP", time: 12 * 60 + 30 });
    expect(sceneSameDay.specialActions.map((a) => a.id)).not.toContain("check_in_intent");

    const s2 = startNewDay({ ...s1, ended: true });
    const sceneNextDay = buildLocationScene({ ...s2, playerLocation: "BARBERSHOP", time: 12 * 60 });
    expect(sceneNextDay.specialActions.map((a) => a.id)).toContain("check_in_intent");
  });
});

describe("PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1: deterministic classifiers (Section H offer heuristic, Section J safety gate)", () => {
  it("looksLikeRealLifeConcern matches plausible real-life-concern phrasing and does not match ordinary small talk", () => {
    expect(looksLikeRealLifeConcern("最近、仕事を先延ばしにしています")).toBe(true);
    expect(looksLikeRealLifeConcern("上司に言いたいことがあるけど言えなくて")).toBe(true);
    expect(looksLikeRealLifeConcern("この町の天気はどうですか")).toBe(false);
    expect(looksLikeRealLifeConcern("散髪お願いします")).toBe(false);
  });

  it("looksLikeRealLifeConcern also matches the specific gaps found by the PHASE_12_4 Section 12 live 12-case test (断れない/イライラ/辞めるか迷う)", () => {
    expect(looksLikeRealLifeConcern("人に頼まれると断れなくて")).toBe(true);
    expect(looksLikeRealLifeConcern("最近なんかイライラすることが多くて")).toBe(true);
    expect(looksLikeRealLifeConcern("今の仕事辞めるかどうか迷ってます")).toBe(true);
    expect(looksLikeRealLifeConcern("やりたいことが正直よく分からないんです")).toBe(true);
  });

  it("looksLikeRealLifeConcern is a keyword offer heuristic, not semantic understanding -- it should not fire on most ordinary small talk (Section D's 12-case false-positive probe)", () => {
    const ordinarySmallTalk = [
      "どこに行こうか迷ってます",
      "昼飯を何にするか迷っています",
      "この町を歩き回って疲れました",
      "仕事帰りです",
      "床屋に行くか迷ってます",
      "コーヒーにするか紅茶にするか迷う",
      "今日は暑くて疲れた",
      "洋平に言いたいことがある",
      "町を出るか迷ってる",
      "最近このゲーム面白い",
    ];
    const falsePositives = ordinarySmallTalk.filter((text) => looksLikeRealLifeConcern(text));
    // Two known, deliberately-kept false-positive sources exist for OTHER phrases (イライラ/続かな --
    // each is the only thing catching a real Section 12 case) but neither of those two words appears
    // in this ordinary-small-talk list, so this specific list should come back clean. A future edit
    // that reintroduces a broad pattern (e.g. bare "迷って") would regress this back toward the
    // originally-measured 7/12 false-positive rate this test exists to guard against.
    expect(falsePositives).toHaveLength(0);
  });

  it("the two deliberately-kept false-positive sources (イライラ/続かな) are still each load-bearing for a real Section 12 case with no cheaper alternative pattern available", () => {
    expect(looksLikeRealLifeConcern("昨日の試合はイライラしたな")).toBe(true); // known false positive, kept
    expect(looksLikeRealLifeConcern("最近なんかイライラすることが多くて")).toBe(true); // the real case it exists for
    expect(looksLikeRealLifeConcern("この商品続かないね")).toBe(true); // known false positive, kept
    expect(looksLikeRealLifeConcern("運動しようと思ってるけど全然続かない")).toBe(true); // the real case it exists for
  });

  it("detectsCrisisSignal matches explicit self-harm/crisis language and does not match ordinary negative language", () => {
    expect(detectsCrisisSignal("もう死にたい")).toBe(true);
    expect(detectsCrisisSignal("消えてしまいたい")).toBe(true);
    expect(detectsCrisisSignal("今日は疲れた、もう嫌だ")).toBe(false);
    expect(detectsCrisisSignal("仕事を辞めたい")).toBe(false);
  });
});

describe("PHASE_12_4_NEW_LIFE_WORLD_DEPTH_AND_CONVERSATION_QUALITY_V1: NPC roster and relationship graph (Section 4/5)", () => {
  // PHASE_13 Section 9 -- Kiyoshi added (7 -> 8), the one deliberately modest roster expansion this
  // phase; see that phase's CLOSE report for why it stopped well short of the 12-14 ceiling offered.
  const ALL_NPCS: NpcId[] = ["kamiya", "yohei", "miyoko", "jin", "daisuke", "hina", "fumiko", "kiyoshi"];

  it("the town has 8 NPCs, and none of them is uniformly kind/omniscient about the others (Section 4)", () => {
    expect(Object.keys(NPC_DEFS)).toHaveLength(8);
    for (const npc of ALL_NPCS) {
      expect(NPC_DEFS[npc].hiddenBackground.whatTheyDoNotWantToSay.length).toBeGreaterThan(0);
    }
  });

  it("relationships are directed (each NPC's own view), have a coarse non-numeric quality, and are not a symmetric single global graph", () => {
    const yoheiOnJin = NPC_DEFS.yohei.relationships.jin;
    const jinOnYohei = NPC_DEFS.jin.relationships.yohei;
    expect(yoheiOnJin?.quality).toBe("close");
    expect(jinOnYohei?.quality).toBe("close");
    // Directed, not necessarily identical prose even when the coarse quality happens to match.
    expect(typeof yoheiOnJin?.description).toBe("string");
    expect(typeof jinOnYohei?.description).toBe("string");
    // Not every pair is symmetric -- Yohei is still wary of the newcomer Hina while she reads warmer of Miyoko than of him.
    expect(NPC_DEFS.yohei.relationships.hina?.quality).toBe("distant");
    expect(NPC_DEFS.hina.relationships.miyoko?.quality).toBe("familiar");
    // Never a numeric score anywhere in a relationship.
    for (const npc of ALL_NPCS) {
      for (const rel of Object.values(NPC_DEFS[npc].relationships)) {
        expect(typeof rel?.quality).toBe("string");
        expect(Number.isNaN(Number(rel?.quality))).toBe(true);
      }
    }
  });

  it("Hina's own relationship map references Fumiko and vice versa, even though they haven't met yet (a real edge exists before the two characters have interacted in-game)", () => {
    expect(NPC_DEFS.hina.relationships.fumiko).toBeDefined();
    expect(NPC_DEFS.fumiko.relationships.hina).toBeDefined();
  });
});

describe("PHASE_12_4_NEW_LIFE_WORLD_DEPTH_AND_CONVERSATION_QUALITY_V1: Hina's shop only exists once the world actually opens it (Section 4/6/8)", () => {
  it("Hina is unreachable on day 1 and day 2, even at the exact time her (future) schedule would otherwise say she's open", () => {
    const s0 = createInitialCoreState();
    expect(npcAvailabilityAt("hina", 12 * 60, s0.flags)).toBe("CLOSED");
    expect(npcLocationAt("hina", 12 * 60, s0.flags)).toBeNull();

    const day2 = startNewDay({ ...s0, ended: true });
    expect(npcAvailabilityAt("hina", 12 * 60, day2.flags)).toBe("CLOSED");
  });

  it("the shop opens the first time day >= 3 crosses 9:00, independent of the player -- and never before day 3", () => {
    let s = createInitialCoreState();
    s = startNewDay({ ...s, ended: true }); // day 2
    s = advanceTime(s, 8 * 60); // well past 9:00 on day 2
    expect(s.flags.hinaShopOpen).toBeFalsy();

    s = startNewDay({ ...s, ended: true }); // day 3
    s = advanceTime(s, 1 * 60); // 8:45 -> 9:45, crosses 9:00
    expect(s.flags.hinaShopOpen).toBe(true);
    expect(npcAvailabilityAt("hina", s.time, s.flags)).toBe("AVAILABLE");
    expect(npcLocationAt("hina", s.time, s.flags)).toBe("SHOPPING_STREET");

    const fact = s.worldFacts.find((f) => f.id === "hina_shop_open");
    expect(fact?.category).toBe("world_change");
    expect(fact?.knownBy).toEqual(["yohei", "miyoko"]);
    expect(fact?.day).toBe(3);
  });

  it("SHOPPING_STREET's ambient text changes across days even before Hina is reachable (day 1 vs day 2 read differently)", () => {
    const day1 = createInitialCoreState();
    const day1Scene = buildLocationScene({ ...day1, playerLocation: "SHOPPING_STREET" });

    let s = startNewDay({ ...day1, ended: true });
    const day2Scene = buildLocationScene({ ...s, playerLocation: "SHOPPING_STREET" });

    expect(day1Scene.ambientLine).not.toBe(day2Scene.ambientLine);
    expect(day2Scene.npcsHere).toEqual([]); // still not open
  });
});

describe("PHASE_12_4_NEW_LIFE_WORLD_DEPTH_AND_CONVERSATION_QUALITY_V1: a second, independent unseen NPC<->NPC event (Section 6/7)", () => {
  it("Fumiko asking Jin to fix the bench never fires on day 1, only from day 2 onward, and always resolves without the player", () => {
    const s0 = createInitialCoreState();
    const s1 = advanceTime(s0, 10 * 60); // well past 9:30 on day 1
    expect(s1.flags.fumikoAskedJin).toBeFalsy();

    const s2 = startNewDay({ ...s1, ended: true }); // day 2
    const s3 = advanceTime(s2, 6 * 60); // 8:45 -> 14:45, crosses both 9:30 and 14:00
    expect(s3.flags.fumikoAskedJin).toBe(true);
    expect(s3.flags.benchFixed).toBe(true);

    const askedFact = s3.worldFacts.find((f) => f.id === "fumiko_asked_jin_bench");
    const fixedFact = s3.worldFacts.find((f) => f.id === "bench_fixed");
    expect(askedFact?.knownBy.sort()).toEqual(["fumiko", "jin"]);
    expect(fixedFact?.knownBy.sort()).toEqual(["fumiko", "jin"]);
    expect(askedFact?.category).toBe("promise");
    expect(fixedFact?.category).toBe("pending_task");

    // Knowledge boundary: nobody else knows about it (directive Section 6: "全知NPCは禁止").
    const kamiyaCtx = buildNpcAiContext("kamiya", s3, "こんにちは");
    expect(kamiyaCtx.knownFacts.join(" ")).not.toMatch(/ベンチ/);
    const jinCtx = buildNpcAiContext("jin", s3, "こんにちは");
    expect(jinCtx.knownFacts.join(" ")).toMatch(/ベンチ/);
  });

  it("COMMUNITY_HALL's empty-room trace text reflects the bench thread's current state", () => {
    // Fumiko is scheduled at COMMUNITY_HALL continuously 9:00-16:00, so the "nobody's here" trace
    // branch only applies outside her (and Jin's) hours -- 18:00 is past both.
    const s0 = createInitialCoreState();
    let s = startNewDay({ ...s0, ended: true });
    s = advanceTime(s, 1 * 60); // crosses 9:30 -> asked, not yet fixed
    const midScene = buildLocationScene({ ...s, playerLocation: "COMMUNITY_HALL", time: 18 * 60 });
    expect(midScene.ambientLine).toMatch(/ぐらついた/);

    const doneState = advanceTime(s, 5 * 60); // crosses 14:00 -> fixed
    const doneScene = buildLocationScene({ ...doneState, playerLocation: "COMMUNITY_HALL", time: 18 * 60 });
    expect(doneScene.ambientLine).toMatch(/もう、ぐらついていなかった/);
  });
});

describe("PHASE_12_4_NEW_LIFE_WORLD_DEPTH_AND_CONVERSATION_QUALITY_V1: end-of-day narrative no longer goes stale across days (Section 8)", () => {
  it("a fact from a PAST day is not re-announced on a later day's end-of-day screen", () => {
    const s0 = createInitialCoreState();
    const s1 = recordConversationTurn(s0, "kamiya", "day1の発言", "「そうですか」");
    const day1Lines = buildEndOfDayNarrative(s1);
    expect(day1Lines).toContain("神谷とは話が途中のままだ。");

    const s2 = startNewDay({ ...s1, ended: true }); // day 2, kamiya not talked to today
    const day2Lines = buildEndOfDayNarrative(s2);
    expect(day2Lines).not.toContain("神谷とは話が途中のままだ。");
  });

  it("a world-change fact (e.g. the shelf) is only mentioned on the day it actually happened, not every day after", () => {
    const s0 = createInitialCoreState();
    const s1 = addWorldFact(s0, { id: "shelf_fixed", time: s0.time, text: "x", knownBy: ["yohei", "jin"] });
    const withFlag: CoreState = { ...s1, flags: { ...s1.flags, shelfFixed: true, shelfFixedWithPlayer: true } };
    expect(buildEndOfDayNarrative(withFlag)).toContain("洋平の店の棚は、手伝って直した。");

    const nextDay = startNewDay({ ...withFlag, ended: true });
    expect(buildEndOfDayNarrative(nextDay)).not.toContain("洋平の店の棚は、手伝って直した。");
  });

  it("talking to the same NPC again on a later day produces a fresh 'talked today' line, not silence forever after the first day", () => {
    const s0 = createInitialCoreState();
    const s1 = recordConversationTurn(s0, "miyoko", "day1", "「そう」");
    const s2 = startNewDay({ ...s1, ended: true });
    const s3 = recordConversationTurn(s2, "miyoko", "day2", "「あら」");
    expect(buildEndOfDayNarrative(s3)).toContain("喫茶のどかで、美代子と少し話した。");
  });
});

describe("PHASE_12_4_NEW_LIFE_WORLD_DEPTH_AND_CONVERSATION_QUALITY_V1: cross-day conversation continuity in the opening line (Section 1)", () => {
  it("an NPC talked to YESTERDAY specifically (not just 'ever') gets a distinct day-bridging opening line today, before the player re-opens the conversation", () => {
    const s0 = createInitialCoreState();
    const s1 = recordConversationTurn(s0, "yohei", "day1", "「そうか」");
    const metYohei: CoreState = { ...s1, flags: { ...s1.flags, met_yohei: true } };
    const s2 = startNewDay({ ...metYohei, ended: true });
    expect(openingLineFor("yohei", s2)).toBe("洋平はちらっとこちらを見た。「昨日も来てたな」");
  });

  it("an NPC talked to 2+ days ago (not yesterday) falls back to the ordinary later-visit line, not the bridge line", () => {
    const s0 = createInitialCoreState();
    const s1 = recordConversationTurn(s0, "yohei", "day1", "「そうか」");
    const metYohei: CoreState = { ...s1, flags: { ...s1.flags, met_yohei: true } };
    const day2 = startNewDay({ ...metYohei, ended: true });
    const day3 = startNewDay({ ...day2, ended: true });
    expect(openingLineFor("yohei", day3)).toBe("洋平はちらっとこちらを見た。「また来たか」");
  });

  it("an NPC already talked to TODAY does not show the bridge line (it's specifically for the first re-encounter of the day)", () => {
    const s0 = createInitialCoreState();
    const s1 = recordConversationTurn(s0, "yohei", "day1", "「そうか」");
    const metYohei: CoreState = { ...s1, flags: { ...s1.flags, met_yohei: true } };
    const day2 = startNewDay({ ...metYohei, ended: true });
    const talkedAgainToday = recordConversationTurn(day2, "yohei", "day2", "「おう」");
    expect(openingLineFor("yohei", talkedAgainToday)).toBe("洋平はちらっとこちらを見た。「また来たか」");
  });
});

describe("PHASE_13_NEW_LIFE_WORLD_ACTIVITY_AND_LOCAL_PROBLEMS_V1 Section 1-A: purchase narration reads as natural Japanese for every shop NPC (HV-01 regression)", () => {
  it("Daisuke's haircut narration never uses the object-receiving phrasing HV-01 flagged as unnatural", () => {
    const line = buildPurchaseNarration("daisuke", ["散髪"]);
    expect(line).not.toContain("散髪を受け取った");
    expect(line).toContain("散髪をしてもらった");
  });

  it("Yohei's and Miyoko's own narration are unchanged by this fix", () => {
    expect(buildPurchaseNarration("yohei", ["米（1袋）"])).toContain("袋にまとめた");
    expect(buildPurchaseNarration("miyoko", ["コーヒー"])).toContain("カウンターに置いた");
  });
});

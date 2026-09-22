import { describe, expect, it } from "vitest";
import { advanceDay, applyAction, createInitialState, resolveDay24Outcome } from "../src/newlife/state";
import { getScene, TOTAL_DAYS } from "../src/newlife/content";
import { answerFreeText, clarificationLine, detectIntent } from "../src/newlife/npcVoice";
import { DAISUKE_OCCUPATION, NPC_IDS, type NewLife30State, type NpcId } from "../src/newlife/types";

const BARBER_PATTERN = /理容|床屋|理髪|barber/i;

// Each call is one player "leave"/"advance" action. Day 11 needs two such
// calls (morning, then afternoon) before Day 12 begins -- see
// NEWLIFE_30DAY_CHARACTER_DERIVED_PLAYABLE_V3.md §3 "必ず二手目の入力を待ってから Day 12 へ".
function leaveOneDay(state: NewLife30State): NewLife30State {
  return advanceDay(state);
}

describe("NEW LIFE 30-day engine — 30-day reachability", () => {
  it("reaches Day 30 and finishes when every day is simply left, without skipping Day 11's two phases", () => {
    let state = createInitialState();
    const daysVisited = new Set<string>();
    let guard = 0;
    while (!state.finished && guard < 200) {
      daysVisited.add(state.day === 11 ? `11:${state.day11Phase}` : `${state.day}`);
      state = leaveOneDay(state);
      guard++;
    }
    expect(state.finished).toBe(true);
    expect(state.day).toBe(TOTAL_DAYS);
    expect(daysVisited.has("11:morning")).toBe(true);
    expect(daysVisited.has("11:afternoon")).toBe(true);
    for (let d = 1; d <= 30; d++) {
      if (d === 11) continue;
      expect(daysVisited.has(`${d}`)).toBe(true);
    }
  });

  it("every day 1-30 (and both Day 11 phases) resolves to a scene with a heading, matching the canon's one-heading-per-day structure", () => {
    for (let d = 1; d <= 30; d++) {
      if (d === 11) {
        expect(getScene(11, "morning", null).title).toBeTruthy();
        expect(getScene(11, "afternoon", null).title).toBeTruthy();
        continue;
      }
      const scene = getScene(d, "done", "SOLO_TRIAL");
      expect(scene.day).toBe(d);
      expect(scene.title).toBeTruthy();
      expect(scene.options.length).toBeGreaterThan(0);
    }
  });
});

describe("NEW LIFE 30-day engine — six NPCs appear as intended", () => {
  it("all six canonical NPCs appear across the 30-day spine", () => {
    const seen = new Set<NpcId>();
    for (let d = 1; d <= 10; d++) getScene(d, "done", null).npcsPresent.forEach((n) => seen.add(n));
    getScene(11, "morning", null).npcsPresent.forEach((n) => seen.add(n));
    getScene(11, "afternoon", null).npcsPresent.forEach((n) => seen.add(n));
    for (let d = 12; d <= 24; d++) getScene(d, "done", null).npcsPresent.forEach((n) => seen.add(n));
    for (const outcome of ["JOINT_RETRY", "SOLO_TRIAL", "PAUSE", "SPLIT"] as const) {
      for (let d = 25; d <= 30; d++) getScene(d, "done", outcome).npcsPresent.forEach((n) => seen.add(n));
    }
    for (const npc of NPC_IDS) {
      expect(seen.has(npc)).toBe(true);
    }
  });
});

describe("NEW LIFE 30-day engine — Daisuke has no barber leakage", () => {
  it("Daisuke's tracked occupation is furniture/chair repair", () => {
    expect(DAISUKE_OCCUPATION).toBe("家具・椅子修理");
  });

  it("no day's scene text or options mention barber/haircut material", () => {
    for (let d = 1; d <= 30; d++) {
      const scenesToCheck =
        d === 11
          ? [getScene(11, "morning", null), getScene(11, "afternoon", null)]
          : d >= 25
            ? (["JOINT_RETRY", "SOLO_TRIAL", "PAUSE", "SPLIT"] as const).map((o) => getScene(d, "done", o))
            : [getScene(d, "done", "SOLO_TRIAL")];
      for (const scene of scenesToCheck) {
        expect(scene.text).not.toMatch(BARBER_PATTERN);
        for (const opt of scene.options) expect(opt.label).not.toMatch(BARBER_PATTERN);
      }
    }
  });

  it("asking Daisuke directly about a barber shop corrects the misconception rather than leaking old canon", () => {
    const state = createInitialState();
    const reply = answerFreeText("daisuke", "床屋さんですか？", state);
    expect(reply).not.toMatch(/私(は|が)?(床屋|理容師|理髪師)です/);
    expect(reply).toMatch(/椅子|家具/);
  });
});

describe("NEW LIFE 30-day engine — direct-question semantic routing", () => {
  it("answers what's for sale with the concrete menu facts, not a generic acknowledgment", () => {
    const state = createInitialState();
    expect(answerFreeText("hina", "何を売ってるんですか？", state)).toMatch(/280円|240円/);
  });
  it("understands a natural greeting + baked-goods question and answers the semantic target first", () => {
    const state = createInitialState();
    const reply = answerFreeText("hina", "おはようございます。どんな焼き菓子売るのですか", state);
    expect(reply).toMatch(/スコーン/);
    expect(reply).toMatch(/クッキー/);
    expect(reply).not.toMatch(/先に数を見ます/);
  });


  it("answers the reservation split with concrete counts", () => {
    const state = createInitialState();
    expect(answerFreeText("yohei", "予約は何個ですか？", state)).toMatch(/十八|18/);
  });

  it("keeps unknowns unknown: profit question before Day 20 stays unresolved, after Day 20 gives the concrete figures", () => {
    let state = createInitialState();
    for (let i = 0; i < 18; i++) state = leaveOneDay(state); // reach Day 20
    expect(state.day).toBeLessThan(20);
    expect(answerFreeText("hina", "儲かりましたか？", state)).toMatch(/集計前/);

    while (state.day < 20) state = leaveOneDay(state);
    expect(answerFreeText("hina", "儲かりましたか？", state)).toMatch(/2,400円|2400円/);
  });

  it("workshop lending answers Daisuke's own decision, not a guaranteed yes", () => {
    const state = createInitialState();
    expect(answerFreeText("daisuke", "工房、貸してくれるんですか？", state)).not.toMatch(/一時間なら片づけられる/);
  });
});

describe("NEW LIFE 30-day engine — Phase 28 meaning-first paraphrase matrix", () => {
  // Each domain has 11 materially different natural-Japanese phrasings:
  // polite, casual, indirect, greeting-prefixed, and mildly malformed —
  // per PHASE_28_MEANING_FIRST_CONVERSATION_HARDENING_V1 instruction 5.
  const MENU_PARAPHRASES = [
    "どんな焼き菓子を売っているんですか？",
    "おはようございます。どんな焼き菓子売るのですか",
    "スコーンっていくらですか？",
    "クッキーの値段を教えてください。",
    "今日売ってる商品は何ですか？",
    "何を売ってるんですか？",
    "焼き菓子の種類、教えてくれますか？",
    "お菓子は何種類あるの？",
    "品物の値段っていくら",
    "スコーンとクッキー、それぞれいくらですか",
    "何が売り物ですか",
  ];
  const RESERVATION_PARAPHRASES = [
    "予約は何個ですか？",
    "予約の数を教えてください。",
    "取り置きは何点ありますか？",
    "店頭で買えるのは何個ですか？",
    "予約と店頭、それぞれ何個ですか？",
    "予約分と店頭分の内訳を教えて。",
    "予約って何点あるの？",
    "店頭は何点残ってるんですか？",
    "取り置き分はいくつ？",
    "予約の割り振りはどうなってますか",
    "こんにちは、予約は何個か聞きたいです",
  ];
  const SEATS_PARAPHRASES = [
    "席は使えますか？",
    "座ってもいいですか？",
    "喫茶の席、空いてますか？",
    "待つ間、座れますか？",
    "四席って本当ですか？",
    "ここ座れる?",
    "待合として席を使ってもいいですか",
    "美代子さんの喫茶、席は何席ですか",
    "お茶を頼まなくても座れますか？",
    "席、空いてる？",
    "すみません、座っていいですか",
  ];
  const WORKSHOP_PARAPHRASES = [
    "工房、貸してくれるんですか？",
    "大輔さんの工房は借りられますか？",
    "作業場、使わせてもらえますか？",
    "工房を貸してもらえるか教えてください。",
    "工房のこと、決まりました？",
    "作業場は貸してもらえるの？",
    "工房、借りられる?",
    "椅子じゃなくて工房のほうは貸してくれるんですか",
    "工房の返事、もらえましたか？",
    "作業場を使ってもいいですか",
    "こんばんは、工房のことなんですが借りられますか",
  ];
  const YESTERDAY_PARAPHRASES = [
    "昨日は何があったんですか？",
    "昨日、何かあった?",
    "前の日はどんな様子でしたか？",
    "前日に何があったのか教えて。",
    "昨日のこと、聞いてもいいですか？",
    "昨日は何が起きたの?",
    "前日の出来事を教えてください",
    "昨日、なにかありました？",
    "昨日は大変だったんですか？",
    "前の日の様子、どうでした?",
    "お疲れ様です、昨日何があったか知りたいです",
  ];
  const PROFIT_PARAPHRASES = [
    "儲かりましたか？",
    "利益は出ていますか？",
    "採算は取れてるんですか？",
    "黒字ですか、それとも赤字ですか？",
    "経費ってどれくらいかかったの？",
    "コストはいくらでしたか？",
    "この先も続けられますか？",
    "続けていけそうですか？",
    "持続できそうですか？",
    "利益、出た?",
    "こんにちは、儲かってるかどうか知りたいです",
  ];

  it.each(MENU_PARAPHRASES)("routes %j to the menu domain", (phrase) => {
    expect(detectIntent(phrase)).toBe("menu");
  });
  it.each(RESERVATION_PARAPHRASES)("routes %j to the reservation_count domain", (phrase) => {
    expect(detectIntent(phrase)).toBe("reservation_count");
  });
  it.each(SEATS_PARAPHRASES)("routes %j to the seats domain", (phrase) => {
    expect(detectIntent(phrase)).toBe("seats");
  });
  it.each(WORKSHOP_PARAPHRASES)("routes %j to the workshop domain", (phrase) => {
    expect(detectIntent(phrase)).toBe("workshop");
  });
  it.each(YESTERDAY_PARAPHRASES)("routes %j to the yesterday domain", (phrase) => {
    expect(detectIntent(phrase)).toBe("yesterday");
  });
  it.each(PROFIT_PARAPHRASES)("routes %j to the profit domain", (phrase) => {
    expect(detectIntent(phrase)).toBe("profit");
  });

  it("answers direct-answer-first: product names before quantities/price for every menu paraphrase", () => {
    const state = createInitialState();
    for (const phrase of MENU_PARAPHRASES) {
      const reply = answerFreeText("hina", phrase, state);
      expect(reply.indexOf("スコーン")).toBeGreaterThanOrEqual(0);
      expect(reply.indexOf("スコーン")).toBeLessThan(reply.indexOf("280円"));
    }
  });

  it("the Owner's exact reported failure sentence never returns the flavor non-answer", () => {
    const state = createInitialState();
    const reply = answerFreeText("hina", "おはようございます。どんな焼き菓子売るのですか", state);
    expect(reply).not.toMatch(/先に数を見ます/);
    expect(reply).toMatch(/スコーン/);
    expect(reply).toMatch(/クッキー/);
  });
});

describe("NEW LIFE 30-day engine — Phase 28 question-nonanswer guard", () => {
  const UNRECOGNIZED_QUESTIONS = [
    "今日は何して過ごしてるんですか？",
    "休みの日は何してるの？",
    "この町の好きなところはどこですか？",
    "一番古い建物はどこですか？",
  ];

  it.each(UNRECOGNIZED_QUESTIONS)("a clearly-a-question input with no confident domain match (%j) gets a clarification, not a domain answer or flavor line", (phrase) => {
    expect(detectIntent(phrase)).toBeNull();
    for (const npc of NPC_IDS) {
      const state = createInitialState();
      const reply = answerFreeText(npc, phrase, state);
      expect(reply).toBe(clarificationLine(npc));
    }
  });

  it("a plain statement with no question/request semantics still gets a flavor line, not a clarification", () => {
    const state = createInitialState();
    const statements = ["おはようございます", "今日もいい天気ですね", "ありがとうございます", "また明日"];
    for (const statement of statements) {
      expect(detectIntent(statement)).toBeNull();
      for (const npc of NPC_IDS) {
        const reply = answerFreeText(npc, statement, state);
        expect(reply).not.toBe(clarificationLine(npc));
      }
    }
  });
});



describe("NEW LIFE 30-day engine — Owner product-care conversation regression", () => {
  it("tolerates the observed 名に売る typo narrowly and still answers what is sold", () => {
    const state = createInitialState();
    const reply = answerFreeText("hina", "名に売るのですか", state);
    expect(reply).toMatch(/スコーン/);
    expect(reply).toMatch(/クッキー/);
  });

  it("answers the exact compound cost + product-care question instead of generic clarification", () => {
    const state = createInitialState();
    const reply = answerFreeText("hina", "原価高いのですか、なにかこだわっているてんありますか", state);
    expect(reply).toMatch(/材料費はまだ集計前/);
    expect(reply).toMatch(/レシピ|焼き上がり/);
    expect(reply).not.toMatch(/もう少し具体的/);
  });

  it("does not misroute 商品についてのこだわり to the menu/count dump", () => {
    const state = createInitialState();
    expect(detectIntent("商品についてのこだわりありますか")).toBe("product_care");
    const reply = answerFreeText("hina", "商品についてのこだわりありますか", state);
    expect(reply).toMatch(/レシピ|焼き上がり/);
    expect(reply).not.toMatch(/30点|予約|店頭分/);
  });

  it("keeps unestablished ingredient sourcing unknown rather than inventing premium-material lore", () => {
    const state = createInitialState();
    const reply = answerFreeText("hina", "材料にこだわりありますか？", state);
    expect(reply).toMatch(/産地.*まだ決めてません/);
  });
});

describe("NEW LIFE 30-day engine — canonical state cannot be directly changed by free-talk output", () => {
  it("answerFreeText never mutates the state object it is given", () => {
    const state = createInitialState();
    const frozen = Object.freeze({ ...state });
    expect(() => answerFreeText("hina", "何を売ってるんですか？ 値段は？ 席は使える？ 儲かった？", frozen as NewLife30State)).not.toThrow();
    expect(frozen).toEqual(state);
  });

  it("answerFreeText's return type is a string, never a state object", () => {
    const state = createInitialState();
    const reply = answerFreeText("hina", "こんにちは", state);
    expect(typeof reply).toBe("string");
  });
});

describe("NEW LIFE 30-day engine — Day 24 causality for all four outcomes", () => {
  function runTo(day: number, actions: Record<number, string[]>): NewLife30State {
    let state = createInitialState();
    while (state.day < day || (state.day === day && state.day11Phase !== "done" && day !== 11)) {
      const dayActions = actions[state.day] ?? [];
      for (const a of dayActions) state = applyAction(state, a);
      if (state.day === 11) {
        if (state.day11Phase === "morning") {
          state = advanceDay(state); // -> afternoon, applying any morning action already applied above
        } else if (state.day11Phase === "afternoon") {
          state = advanceDay(state); // -> Day 12
        }
      } else {
        state = advanceDay(state);
      }
    }
    return state;
  }

  it("JOINT_RETRY: every named role is concretely secured with no unrepaired blame", () => {
    const actions: Record<number, string[]> = {
      10: ["suggest_time_split"],
      14: ["broker_direct_fact_check"],
      19: ["confirm_editor_role"],
    };
    const state = runTo(24, actions);
    expect(resolveDay24Outcome(state)).toBe("JOINT_RETRY");
    const after = advanceDay(state);
    expect(after.day24Outcome).toBe("JOINT_RETRY");
  });

  it("SOLO_TRIAL: fully passive baseline path (no functional action taken)", () => {
    const state = runTo(24, {});
    expect(resolveDay24Outcome(state)).toBe("SOLO_TRIAL");
  });

  it("PAUSE: warm encouragement without securing any concrete role", () => {
    const actions: Record<number, string[]> = { 21: ["cheer_her_on"] };
    const state = runTo(24, actions);
    expect(resolveDay24Outcome(state)).toBe("PAUSE");
  });

  it("SPLIT: an unrepaired public accusation overrides everything else, even role-securing work", () => {
    const actions: Record<number, string[]> = {
      10: ["suggest_time_split"],
      11: ["fix_sign_before_posting", "publicly_blame_hina"],
      14: ["broker_direct_fact_check"],
      19: ["confirm_editor_role"],
    };
    const state = runTo(24, actions);
    expect(resolveDay24Outcome(state)).toBe("SPLIT");
  });
});

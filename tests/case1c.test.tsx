import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { Case1CApp } from "../src/case1c/Case1CApp";
import { Case1TestResultsScreen } from "../src/case1c/Case1TestResultsScreen";
import { loadAllCase1CRecords, loadCase1CRecord, loadAllCase1CFeedback } from "../src/case1c/storage";
import { loadCase1CMetrics } from "../src/case1c/metrics";
import { buildCase1TestResultRows } from "../src/case1c/testResults";

const BANNED_SCORE_STRINGS = ["XP", "レベル", "Lv.", "ランキング", "正解", "不正解", "スコア", "判断力", "思考力", "能力"];

function expectNoScoreLanguage(text: string) {
  for (const s of BANNED_SCORE_STRINGS) expect(text).not.toContain(s);
}

type User = ReturnType<typeof userEvent.setup>;

/** Investigates only the two REQUIRED objects (bike, book) -- the minimum path to unlock TOWN. */
async function investigateRequiredOnly(user: User) {
  await user.click(screen.getByRole("button", { name: "自転車を調べる" }));
  await user.click(screen.getByRole("button", { name: "戻る" }));
  await user.click(screen.getByRole("button", { name: "絵本を調べる" }));
  await user.click(screen.getByRole("button", { name: "戻る" }));
}

/**
 * Drives the full CASE1 external-test candidate start to finish, choosing one prediction, on
 * whatever is already rendered (Case1CApp directly, or App mounted at a case1test route).
 */
async function playThroughOnRendered(
  user: User,
  prediction: "🙇 頭を下げる" | "🏃 気づかず持っていく" | "😳 固まる",
  opts: { testerCode?: string; hasPlayedBefore?: "ある" | "ない" } = {},
) {
  if (opts.testerCode) {
    await user.type(screen.getByPlaceholderText("テスターコード（任意）"), opts.testerCode);
  }
  if (opts.hasPlayedBefore) {
    await user.click(screen.getByRole("button", { name: opts.hasPlayedBefore }));
  }
  await user.click(screen.getByRole("button", { name: "はじめる" }));
  expect(screen.getByText(LINE("こ、こりゃ泥棒だ！"))).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "とりあえず調べてみよう" }));

  await investigateRequiredOnly(user);

  await user.click(screen.getByRole("button", { name: "商店街へ行ってみよう" }));

  await user.click(screen.getByRole("button", { name: "自転車店の店主に話しかける" }));
  await user.click(screen.getByRole("button", { name: "販売記録と見比べてもらう" }));
  await user.click(screen.getByRole("button", { name: "戻る" }));

  await user.click(screen.getByRole("button", { name: "公園に戻ってみよう" }));
  await user.click(screen.getByRole("button", { name: "しばらく待ってみる" }));
  await user.click(screen.getByRole("button", { name: prediction }));

  await user.click(screen.getByRole("button", { name: "次へ" })); // reveal -> shift
  await user.click(screen.getByRole("button", { name: "次へ" })); // shift -> closed (saves record)
  await user.click(screen.getByRole("button", { name: "次へ" })); // closed -> hook
}

/** Renders Case1CApp directly (the common case: no App-level routing involved) and plays it through. */
async function playThrough(
  user: User,
  prediction: "🙇 頭を下げる" | "🏃 気づかず持っていく" | "😳 固まる",
  opts: { testerCode?: string; hasPlayedBefore?: "ある" | "ない" } = {},
) {
  render(<Case1CApp onExit={() => {}} />);
  await playThroughOnRendered(user, prediction, opts);
}

function LINE(s: string) {
  return new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}

async function finishFeedback(user: User) {
  await user.click(screen.getByRole("button", { name: "気にせず進む" }));
  for (const label of [
    "ゲームとして面白かった？",
    "途中で真相を知りたいと思った？",
    "自分で調べている感じがした？",
    "「なるほど」と思う瞬間があった？",
    "また別の事件をやりたい？",
  ]) {
    await user.click(screen.getByRole("button", { name: `${label}：4` }));
  }
  await user.click(screen.getByRole("button", { name: "送信する" }));
}

describe("CASE1 external-test candidate (PHASE 4.4): critical path", () => {
  it("plays start to finish through every required beat, including feedback, with no crash", async () => {
    const user = userEvent.setup();
    await playThrough(user, "🙇 頭を下げる");
    await finishFeedback(user);
    expect(screen.getByText("ご協力ありがとうございました。")).toBeInTheDocument();
  });
});

describe("optional interactions (Section6/7/8/9)", () => {
  it("sticker, noticeboard, and both optional NPCs are reachable and log OPTIONAL_* telemetry without being required", async () => {
    const user = userEvent.setup();
    render(<Case1CApp onExit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    await user.click(screen.getByRole("button", { name: "とりあえず調べてみよう" }));

    await user.click(screen.getByRole("button", { name: "ハンドルのシールを調べる" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));
    await user.click(screen.getByRole("button", { name: "公園の掲示板を見る" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));

    // required objects not yet found -- TOWN should not be reachable yet.
    expect(screen.queryByRole("button", { name: "商店街へ行ってみよう" })).not.toBeInTheDocument();

    await investigateRequiredOnly(user);
    await user.click(screen.getByRole("button", { name: "商店街へ行ってみよう" }));
    await user.click(screen.getByRole("button", { name: "皆川さんに話しかける" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));
    await user.click(screen.getByRole("button", { name: "大将に話しかける" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));

    const types = loadCase1CMetrics().map((e) => e.type);
    const details = loadCase1CMetrics().map((e) => e.detail);
    expect(types.filter((t) => t === "OPTIONAL_OBJECT_INTERACTION")).toHaveLength(2);
    expect(types.filter((t) => t === "OPTIONAL_NPC_INTERACTION")).toHaveLength(2);
    expect(details).toEqual(expect.arrayContaining(["sticker", "noticeboard", "minagawa", "taishou"]));
  });
});

describe("non-fixed investigation order (Section10)", () => {
  it("the book can be investigated before the bike -- REQUIRED targets are not order-locked", async () => {
    const user = userEvent.setup();
    render(<Case1CApp onExit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    await user.click(screen.getByRole("button", { name: "とりあえず調べてみよう" }));

    await user.click(screen.getByRole("button", { name: "絵本を調べる" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));
    await user.click(screen.getByRole("button", { name: "自転車を調べる" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));

    expect(screen.getByRole("button", { name: "商店街へ行ってみよう" })).toBeInTheDocument();
    const order = loadCase1CMetrics()
      .filter((e) => e.type === "INVESTIGATION_ORDER")
      .map((e) => e.detail);
    expect(order).toEqual(["book", "bike"]);
  });
});

describe("no-survey regression: direct manipulation, not a choice form", () => {
  it("PARK_A/TOWN hotspots are individually-labeled tappable objects, not a generic form", async () => {
    const user = userEvent.setup();
    render(<Case1CApp onExit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    await user.click(screen.getByRole("button", { name: "とりあえず調べてみよう" }));
    expect(screen.getByRole("button", { name: "自転車を調べる" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "絵本を調べる" })).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(document.querySelector("select")).toBeNull();
  });

  it("HUMAN PREDICTION is presented as icon-tiles, not a vertical list of sentence buttons", async () => {
    const user = userEvent.setup();
    render(<Case1CApp onExit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    await user.click(screen.getByRole("button", { name: "とりあえず調べてみよう" }));
    await investigateRequiredOnly(user);
    await user.click(screen.getByRole("button", { name: "商店街へ行ってみよう" }));
    await user.click(screen.getByRole("button", { name: "自転車店の店主に話しかける" }));
    await user.click(screen.getByRole("button", { name: "販売記録と見比べてもらう" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));
    await user.click(screen.getByRole("button", { name: "公園に戻ってみよう" }));
    await user.click(screen.getByRole("button", { name: "しばらく待ってみる" }));
    const choices = screen.getAllByRole("button").filter((b) => b.className.includes("c1c-icon-choice"));
    expect(choices).toHaveLength(3);
  });
});

describe("HUMAN PREDICTION is never scored (Section12/13)", () => {
  it("reveals identical world truth regardless of prediction, and never labels the guess right/wrong", async () => {
    for (const choice of ["🙇 頭を下げる", "🏃 気づかず持っていく", "😳 固まる"] as const) {
      const user = userEvent.setup();
      const { unmount } = render(<Case1CApp onExit={() => {}} />);
      await user.click(screen.getByRole("button", { name: "はじめる" }));
      await user.click(screen.getByRole("button", { name: "とりあえず調べてみよう" }));
      await investigateRequiredOnly(user);
      await user.click(screen.getByRole("button", { name: "商店街へ行ってみよう" }));
      await user.click(screen.getByRole("button", { name: "自転車店の店主に話しかける" }));
      await user.click(screen.getByRole("button", { name: "販売記録と見比べてもらう" }));
      await user.click(screen.getByRole("button", { name: "戻る" }));
      await user.click(screen.getByRole("button", { name: "公園に戻ってみよう" }));
      await user.click(screen.getByRole("button", { name: "しばらく待ってみる" }));
      await user.click(screen.getByRole("button", { name: choice }));

      const text = document.body.textContent ?? "";
      expect(text).toContain("すみません、図書館の返却が今日までで"); // same actual behavior regardless of prediction
      expectNoScoreLanguage(text);
      unmount();
    }
  });
});

describe("fair mystery: REVEAL uses only previously-available information (Section15)", () => {
  it("mentions the sticker in REVEAL only if the player actually found it", async () => {
    const user = userEvent.setup();
    render(<Case1CApp onExit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    await user.click(screen.getByRole("button", { name: "とりあえず調べてみよう" }));
    await investigateRequiredOnly(user); // sticker deliberately skipped
    await user.click(screen.getByRole("button", { name: "商店街へ行ってみよう" }));
    await user.click(screen.getByRole("button", { name: "自転車店の店主に話しかける" }));
    await user.click(screen.getByRole("button", { name: "販売記録と見比べてもらう" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));
    await user.click(screen.getByRole("button", { name: "公園に戻ってみよう" }));
    await user.click(screen.getByRole("button", { name: "しばらく待ってみる" }));
    await user.click(screen.getByRole("button", { name: "🙇 頭を下げる" }));
    expect(screen.queryByText(/シールも/)).not.toBeInTheDocument();
  });
});

describe("case file persistence", () => {
  it("records clues, prediction, and ending -- no ability/diagnostic field", async () => {
    const user = userEvent.setup();
    await playThrough(user, "😳 固まる");
    const record = loadCase1CRecord();
    expect(record).not.toBeNull();
    expect(record?.caseId).toBe("CASE1C");
    expect(record?.cluesFound.sort()).toEqual(["human", "primary", "secondary"]);
    expect(record?.humanPrediction).toBe("freeze");
    expect(record?.ending).toContain("親子");
  });
});

describe("telemetry (Section19/22)", () => {
  it("records the full funnel including OPTIONAL_* and FEEDBACK_SUBMITTED", async () => {
    const user = userEvent.setup();
    await playThrough(user, "🙇 頭を下げる");
    await finishFeedback(user);
    const types = loadCase1CMetrics().map((e) => e.type);
    expect(types[0]).toBe("CASE1_START");
    expect(types).toContain("FIRST_INTERACTION");
    expect(types.filter((t) => t === "CLUE_FOUND")).toHaveLength(3);
    expect(types).toContain("HUMAN_PREDICTION");
    expect(types).toContain("CASE1_COMPLETE");
    expect(types).toContain("FEEDBACK_SUBMITTED");
  });
});

describe("feedback form (Section21/23)", () => {
  it("stores 5 ratings, free text, and an optional tester id -- no name/PII field exists", async () => {
    const user = userEvent.setup();
    render(<Case1CApp onExit={() => {}} />);
    await user.type(screen.getByPlaceholderText("テスターコード（任意）"), "T01");
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    await user.click(screen.getByRole("button", { name: "とりあえず調べてみよう" }));
    await investigateRequiredOnly(user);
    await user.click(screen.getByRole("button", { name: "商店街へ行ってみよう" }));
    await user.click(screen.getByRole("button", { name: "自転車店の店主に話しかける" }));
    await user.click(screen.getByRole("button", { name: "販売記録と見比べてもらう" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));
    await user.click(screen.getByRole("button", { name: "公園に戻ってみよう" }));
    await user.click(screen.getByRole("button", { name: "しばらく待ってみる" }));
    await user.click(screen.getByRole("button", { name: "🙇 頭を下げる" }));
    await user.click(screen.getByRole("button", { name: "次へ" }));
    await user.click(screen.getByRole("button", { name: "次へ" }));
    await user.click(screen.getByRole("button", { name: "次へ" }));
    await user.click(screen.getByRole("button", { name: "気にせず進む" }));
    await user.type(screen.getByPlaceholderText(/分かりにくかったところ/), "テスト自由記述");
    for (const label of [
      "ゲームとして面白かった？",
      "途中で真相を知りたいと思った？",
      "自分で調べている感じがした？",
      "「なるほど」と思う瞬間があった？",
      "また別の事件をやりたい？",
    ]) {
      await user.click(screen.getByRole("button", { name: `${label}：5` }));
    }
    await user.click(screen.getByRole("button", { name: "送信する" }));

    const all = loadAllCase1CFeedback();
    expect(all).toHaveLength(1);
    expect(all[0].testerId).toBe("T01");
    expect(all[0].q1Fun).toBe(5);
    expect(all[0].q5WantNext).toBe(5);
    expect(all[0].freeText).toBe("テスト自由記述");
    expect(Object.keys(all[0])).not.toContain("name");
    expect(Object.keys(all[0])).not.toContain("email");
  });
});

describe("external test mode (Section20): no dev/meta language shown to the player", () => {
  it("never mentions the internal codename, phase names, or the concept of a test build's purpose", async () => {
    const user = userEvent.setup();
    render(<Case1CApp onExit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    const text = document.body.textContent ?? "";
    expect(text).not.toContain("PHASE");
    expect(text).not.toContain("vertical slice");
    expect(text).not.toContain("人間観察");
    expect(text).not.toContain("だれからの、ありがとう");
  });
});

describe("detective does not reveal the conclusion early (Owner PHASE 4.5 audit)", () => {
  it("the parent's own apology renders before 探偵's reaction line, for every prediction", async () => {
    for (const choice of ["🙇 頭を下げる", "🏃 気づかず持っていく", "😳 固まる"] as const) {
      const user = userEvent.setup();
      const { unmount } = render(<Case1CApp onExit={() => {}} />);
      await user.click(screen.getByRole("button", { name: "はじめる" }));
      await user.click(screen.getByRole("button", { name: "とりあえず調べてみよう" }));
      await investigateRequiredOnly(user);
      await user.click(screen.getByRole("button", { name: "商店街へ行ってみよう" }));
      await user.click(screen.getByRole("button", { name: "自転車店の店主に話しかける" }));
      await user.click(screen.getByRole("button", { name: "販売記録と見比べてもらう" }));
      await user.click(screen.getByRole("button", { name: "戻る" }));
      await user.click(screen.getByRole("button", { name: "公園に戻ってみよう" }));
      await user.click(screen.getByRole("button", { name: "しばらく待ってみる" }));
      await user.click(screen.getByRole("button", { name: choice }));

      const text = document.body.textContent ?? "";
      const apologyIndex = text.indexOf("すみません、図書館の返却が今日までで");
      const detectiveIndex = text.indexOf("探偵：「");
      expect(apologyIndex).toBeGreaterThan(-1);
      expect(detectiveIndex).toBeGreaterThan(-1);
      expect(apologyIndex).toBeLessThan(detectiveIndex);
      unmount();
    }
  });
});

describe("ending dialogue state consistency (Owner PHASE 4.5 audit)", () => {
  it("探偵's closing line calls back to his earlier caution instead of a flat, disconnected verdict", async () => {
    const user = userEvent.setup();
    render(<Case1CApp onExit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    await user.click(screen.getByRole("button", { name: "とりあえず調べてみよう" }));
    await investigateRequiredOnly(user);
    await user.click(screen.getByRole("button", { name: "商店街へ行ってみよう" }));
    await user.click(screen.getByRole("button", { name: "自転車店の店主に話しかける" }));
    await user.click(screen.getByRole("button", { name: "販売記録と見比べてもらう" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));
    await user.click(screen.getByRole("button", { name: "公園に戻ってみよう" }));
    await user.click(screen.getByRole("button", { name: "しばらく待ってみる" }));
    await user.click(screen.getByRole("button", { name: "🙇 頭を下げる" }));
    await user.click(screen.getByRole("button", { name: "次へ" })); // reveal -> shift

    expect(screen.getByText(LINE("いやあ、泥棒は言い過ぎたな"))).toBeInTheDocument();
    expect(screen.getByText(LINE("ほら、言った通りだろ"))).toBeInTheDocument();
    expect(screen.queryByText(LINE("まったくだ。"))).not.toBeInTheDocument();
  });
});

describe("prediction returns immediately to world action, not a meta-question (Owner Section7)", () => {
  it("phrases the prediction prompt as an in-scene beat, not a direct 'どう思う' survey question", async () => {
    const user = userEvent.setup();
    render(<Case1CApp onExit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    await user.click(screen.getByRole("button", { name: "とりあえず調べてみよう" }));
    await investigateRequiredOnly(user);
    await user.click(screen.getByRole("button", { name: "商店街へ行ってみよう" }));
    await user.click(screen.getByRole("button", { name: "自転車店の店主に話しかける" }));
    await user.click(screen.getByRole("button", { name: "販売記録と見比べてもらう" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));
    await user.click(screen.getByRole("button", { name: "公園に戻ってみよう" }));
    await user.click(screen.getByRole("button", { name: "しばらく待ってみる" }));

    const text = document.body.textContent ?? "";
    expect(text).toContain("気づいたら、どう動く？");
    expect(text).not.toContain("どうすると思う？");

    await user.click(screen.getByRole("button", { name: "🙇 頭を下げる" }));
    expect(screen.getByText(/自転車に手をかけたところで/)).toBeInTheDocument();
  });
});

describe("character asset: Owner-provided ossan art, not the SVG placeholder (Owner Section8/9/10)", () => {
  it("PARK_A, PARK_C, and the ending each render the real ossan-*.png asset, never crashing when the pose prop is omitted", async () => {
    const user = userEvent.setup();
    const { container } = render(<Case1CApp onExit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    let img = container.querySelector("img");
    expect(img?.getAttribute("src")).toContain("ossan-listening.png");

    await user.click(screen.getByRole("button", { name: "とりあえず調べてみよう" }));
    await investigateRequiredOnly(user);
    await user.click(screen.getByRole("button", { name: "商店街へ行ってみよう" }));
    await user.click(screen.getByRole("button", { name: "自転車店の店主に話しかける" }));
    await user.click(screen.getByRole("button", { name: "販売記録と見比べてもらう" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));
    await user.click(screen.getByRole("button", { name: "公園に戻ってみよう" }));
    img = container.querySelector("img");
    expect(img?.getAttribute("src")).toContain("ossan-cheerful.png");

    await user.click(screen.getByRole("button", { name: "しばらく待ってみる" }));
    await user.click(screen.getByRole("button", { name: "🙇 頭を下げる" }));
    await user.click(screen.getByRole("button", { name: "次へ" })); // reveal -> shift
    img = container.querySelector("img");
    expect(img?.getAttribute("src")).toContain("ossan-cheerful.png");
  });
});

describe("tester code and tester type (Owner PHASE 4.6 Section3/4)", () => {
  it("records the tester code and RETURNING/NEW type on both the case file and feedback, never as a name field", async () => {
    const user = userEvent.setup();
    await playThrough(user, "🙇 頭を下げる", { testerCode: "T02", hasPlayedBefore: "ある" });
    await finishFeedback(user);

    const records = loadAllCase1CRecords();
    expect(records).toHaveLength(1);
    expect(records[0].testerCode).toBe("T02");
    expect(records[0].testerType).toBe("RETURNING");

    const feedback = loadAllCase1CFeedback();
    expect(feedback).toHaveLength(1);
    expect(feedback[0].testerType).toBe("RETURNING");
    expect(Object.keys(records[0])).not.toContain("name");
    expect(Object.keys(feedback[0])).not.toContain("name");
  });

  it("choosing 'ない' records NEW, and the choice is optional (starting without one leaves testerType null)", async () => {
    const user = userEvent.setup();
    await playThrough(user, "🙇 頭を下げる", { testerCode: "T03", hasPlayedBefore: "ない" });
    expect(loadAllCase1CRecords()[0].testerType).toBe("NEW");

    const user2 = userEvent.setup();
    await playThrough(user2, "🙇 頭を下げる");
    const records = loadAllCase1CRecords();
    expect(records[1].testerType).toBeNull();
  });
});

describe("character memory feedback field (Owner PHASE 4.6 Section10)", () => {
  it("is optional, stored separately from the free-text comment, and is not a name-recall quiz field", async () => {
    const user = userEvent.setup();
    await playThrough(user, "🙇 頭を下げる");
    await user.click(screen.getByRole("button", { name: "気にせず進む" }));
    await user.type(screen.getByPlaceholderText(/印象に残った人物/), "探偵");
    for (const label of [
      "ゲームとして面白かった？",
      "途中で真相を知りたいと思った？",
      "自分で調べている感じがした？",
      "「なるほど」と思う瞬間があった？",
      "また別の事件をやりたい？",
    ]) {
      await user.click(screen.getByRole("button", { name: `${label}：3` }));
    }
    await user.click(screen.getByRole("button", { name: "送信する" }));

    const feedback = loadAllCase1CFeedback();
    expect(feedback[0].characterMemory).toBe("探偵");
    expect(feedback[0].freeText).toBe("");
  });
});

describe("raw per-tester result separation (Owner PHASE 4.6 Section12/14)", () => {
  it("2 testers played back to back on the same device produce 2 distinct, non-overwritten rows", async () => {
    const user1 = userEvent.setup();
    await playThrough(user1, "🙇 頭を下げる", { testerCode: "T01", hasPlayedBefore: "ない" });
    await finishFeedback(user1);

    const user2 = userEvent.setup();
    await playThrough(user2, "😳 固まる", { testerCode: "T02", hasPlayedBefore: "ある" });
    await finishFeedback(user2);

    const rows = buildCase1TestResultRows();
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.testerCode)).toEqual(["T01", "T02"]);
    expect(rows.map((r) => r.testerType)).toEqual(["NEW", "RETURNING"]);
    expect(rows.every((r) => r.completed)).toBe(true);
    expect(rows.every((r) => r.sessionId.length > 0)).toBe(true);
    expect(new Set(rows.map((r) => r.sessionId)).size).toBe(2);
  });
});

describe("duration and OWNER_ASSIST telemetry (Owner PHASE 4.6 Section6/7/8)", () => {
  it("computes a non-negative duration from CASE1_START/CASE1_COMPLETE and never auto-judges PASS/FAIL", async () => {
    const user = userEvent.setup();
    await playThrough(user, "🙇 頭を下げる", { testerCode: "T01" });

    const rows = buildCase1TestResultRows();
    expect(rows).toHaveLength(1);
    expect(rows[0].completed).toBe(true);
    expect(rows[0].durationSeconds).not.toBeNull();
    expect(rows[0].durationSeconds as number).toBeGreaterThanOrEqual(0);
    expect(Object.keys(rows[0])).not.toContain("pass");
    expect(Object.keys(rows[0])).not.toContain("result");
  });

  it("OWNER_ASSIST is logged only on an explicit Owner tap, never inferred automatically", async () => {
    const user = userEvent.setup();
    render(<Case1CApp onExit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    expect(loadCase1CMetrics().some((e) => e.type === "OWNER_ASSIST")).toBe(false);

    await user.click(screen.getByRole("button", { name: "運営メモ：ここで補助した" }));
    const assistEvents = loadCase1CMetrics().filter((e) => e.type === "OWNER_ASSIST");
    expect(assistEvents).toHaveLength(1);
  });
});

describe("Owner result view (Owner PHASE 4.6 Section13/15)", () => {
  it("lists every stored tester row and never displays an automatic PASS/FAIL/success-rate judgment", async () => {
    const user = userEvent.setup();
    await playThrough(user, "🙇 頭を下げる", { testerCode: "T01", hasPlayedBefore: "ある" });
    await finishFeedback(user);

    render(<Case1TestResultsScreen onExit={() => {}} />);
    expect(screen.getByText("T01")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toContain("PASS");
    expect(text).not.toContain("FAIL");
    expect(text).not.toContain("合格");
    expect(text).not.toContain("不合格");
  });

  it("shows a friendly empty state when no tester has played yet", () => {
    render(<Case1TestResultsScreen onExit={() => {}} />);
    expect(screen.getByText(/まだ記録がありません/)).toBeInTheDocument();
  });
});

describe("external test direct-entry routes (Owner PHASE 4.6 Section19/20)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("?case1test opens CASE1 directly, without ever rendering HomeScreen's other prototype entry points", async () => {
    window.history.pushState({}, "", "/?case1test=1");
    render(<App />);
    expect(screen.getByRole("button", { name: "はじめる" })).toBeInTheDocument();
    expect(screen.queryByText("🕵️ 事件簿 Pilot（3話通し・テスト版）")).not.toBeInTheDocument();
    expect(screen.queryByText("実話でためす（テスト版）")).not.toBeInTheDocument();
  });

  it("?case1results opens the Owner result view directly, without HomeScreen", () => {
    window.history.pushState({}, "", "/?case1results=1");
    render(<App />);
    expect(screen.getByText(/CASE1 外部テスト結果/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "はじめる" })).not.toBeInTheDocument();
  });

  it("no query param still shows the normal HomeScreen (existing behavior unchanged)", () => {
    render(<App />);
    expect(screen.getByText("🚲 テスト版 CASE1")).toBeInTheDocument();
  });

  it("independent-review fix: the plain '/' route (any visitor, not just a case1test tester) never links to episodes/pilot -- they are not wired into this release build", () => {
    render(<App />);
    expect(screen.queryByText(/実話でためす/)).not.toBeInTheDocument();
    expect(screen.queryByText(/事件簿 Pilot/)).not.toBeInTheDocument();
  });
});

describe("independent-review fix: quitting mid-test respects standalone (Owner PHASE 4.7)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("tapping 'やめる' mid-test via ?case1test ends the session in place -- never drops the tester onto HomeScreen", async () => {
    window.history.pushState({}, "", "/?case1test=1");
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    await user.click(screen.getByRole("button", { name: "とりあえず調べてみよう" }));

    await user.click(screen.getByRole("button", { name: "やめる" }));

    expect(screen.getByText("テストは以上です。ご協力ありがとうございました。")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ホームに戻る" })).not.toBeInTheDocument();
    expect(screen.queryByText("🚲 テスト版 CASE1")).not.toBeInTheDocument();
  });

  it("the normal Home-launched flow keeps 'やめる' going straight to Home (Owner's own internal use, unchanged)", async () => {
    const user = userEvent.setup();
    render(<Case1CApp onExit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    await user.click(screen.getByRole("button", { name: "とりあえず調べてみよう" }));
    await user.click(screen.getByRole("button", { name: "やめる" }));
    expect(screen.queryByText("テストは以上です。")).not.toBeInTheDocument();
  });
});

describe("remote result return: standalone ending and result copy (Owner PHASE 4.7 Section5/9/10/11)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("entering via ?case1test ends on a closing message with no 'ホームに戻る' back into HomeScreen's other prototypes", async () => {
    window.history.pushState({}, "", "/?case1test=1");
    const user = userEvent.setup();
    render(<App />);
    await playThroughOnRendered(user, "🙇 頭を下げる", { testerCode: "T01", hasPlayedBefore: "ある" });
    await finishFeedback(user);

    expect(screen.getByText("テストは以上です。ご協力ありがとうございました。")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ホームに戻る" })).not.toBeInTheDocument();
  });

  it("the normal Home-launched flow keeps 'ホームに戻る' unchanged (Owner's own internal use)", async () => {
    const user = userEvent.setup();
    await playThrough(user, "🙇 頭を下げる", { testerCode: "T01" });
    await finishFeedback(user);
    expect(screen.getByText("ご協力ありがとうございました。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ホームに戻る" })).toBeInTheDocument();
  });

  it("'結果をコピー' copies this tester's own fields as plain text, with no sessionId or PII", async () => {
    // userEvent.setup() installs its own clipboard polyfill, so the mock must be applied AFTER
    // setup() (and after playThrough's internal user-event calls) -- not before, or setup()'s
    // polyfill silently clobbers it.
    const user = userEvent.setup();
    await playThrough(user, "😳 固まる", { testerCode: "T04", hasPlayedBefore: "ない" });

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
    await user.click(screen.getByRole("button", { name: "気にせず進む" }));
    await user.type(screen.getByPlaceholderText(/印象に残った人物/), "おじさん");
    for (const label of [
      "ゲームとして面白かった？",
      "途中で真相を知りたいと思った？",
      "自分で調べている感じがした？",
      "「なるほど」と思う瞬間があった？",
      "また別の事件をやりたい？",
    ]) {
      await user.click(screen.getByRole("button", { name: `${label}：4` }));
    }
    await user.click(screen.getByRole("button", { name: "送信する" }));

    await user.click(screen.getByRole("button", { name: "結果をコピー" }));
    expect(writeText).toHaveBeenCalledTimes(1);
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toContain("tester_code: T04");
    expect(copied).toContain("tester_type: NEW");
    expect(copied).toContain("human_prediction: freeze");
    expect(copied).toContain("character_memory: おじさん");
    expect(copied).not.toMatch(/session|[0-9a-z]{5,}-[0-9a-z]{6}/i);
    expect(screen.getByRole("button", { name: "コピーしました" })).toBeInTheDocument();

    const textarea = screen.getByDisplayValue(/tester_code: T04/) as HTMLTextAreaElement;
    expect(textarea).toHaveAttribute("readonly");
  });
});

describe("mobile -- no horizontal overflow at 320px", () => {
  it("title and first scene fit without horizontal scroll", async () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 320 });
    const user = userEvent.setup();
    render(<Case1CApp onExit={() => {}} />);
    expect(document.body.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    expect(document.body.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1);
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: originalWidth });
  });

  it("the Owner result view fits without horizontal scroll at 320px", async () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 320 });
    const user = userEvent.setup();
    await playThrough(user, "🙇 頭を下げる", { testerCode: "T01" });
    render(<Case1TestResultsScreen onExit={() => {}} />);
    expect(document.body.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1);
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: originalWidth });
  });
});

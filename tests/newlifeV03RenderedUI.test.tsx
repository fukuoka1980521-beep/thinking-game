import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

const RAW_TYPE_TOKENS = /\bOBJECT\b|\bPROMISE\b|\bSHARED_EVENT\b|\bWORLD_CHANGE\b|\bPENDING_TASK\b|\bPLACE_KNOWLEDGE\b/;
const EXPLAINER_PHRASES = /これは重要な選択です|関係性を構築しました|範囲を決めることが信頼につながります|何もしないことも選択だ/;

type U = ReturnType<typeof userEvent.setup>;

/** Every playthrough starts here: opening -> d1_wake (a no-choice scene) -> Kamiya's free-text intro. */
async function start(user: U) {
  window.history.pushState({}, "", "/?newlifev03=1");
  render(<App />);
  await user.click(await screen.findByTestId("v03-start"));
  await user.click(await screen.findByTestId("v03-continue")); // d1_wake -> d1_kamiya_intro
}

async function continueBeat(user: U) {
  await user.click(await screen.findByTestId("v03-continue"));
}

async function pickChoice(user: U, id: string) {
  await user.click(await screen.findByTestId(`v03-choice-${id}`));
  await continueBeat(user);
}

async function pickLocation(user: U, loc: string) {
  await user.click(await screen.findByTestId(`v03-pick-${loc}`));
}

async function answerFreeText(user: U, text: string) {
  await user.type(await screen.findByTestId("v03-freetext-input"), text);
  await user.click(await screen.findByTestId("v03-freetext-submit"));
  await continueBeat(user);
}

/** Every day's wake beat is continue-only, leading straight to that day's first PICK screen. */
async function advanceToNextDayPick(user: U, hasNextDay: boolean) {
  if (!hasNextDay) return;
  await user.click(await screen.findByTestId("v03-next-day"));
  await continueBeat(user); // next day's wake -> its pick1
}

/** DAY1's shape is fixed regardless of which locations are chosen: Kamiya free-text -> pick a
 *  location -> its scene -> pick a second location -> its scene -> noon -> evening -> wrap ->
 *  next day. Call after `start(user)`. Leaves the game on DAY2's PICK1 screen. */
async function finishDay1(
  user: U,
  locA: string,
  choiceA: string,
  locB: string,
  choiceB: string,
  kamiyaAnswer = "特にありません"
) {
  await answerFreeText(user, kamiyaAnswer); // d1_kamiya_intro -> d1_kamiya_after
  await continueBeat(user); // d1_kamiya_after -> d1_pick1
  await pickLocation(user, locA);
  await pickChoice(user, choiceA); // -> d1_pick2
  await pickLocation(user, locB);
  await pickChoice(user, choiceB); // -> d1_noon
  await continueBeat(user); // d1_noon -> d1_evening
  await continueBeat(user); // d1_evening -> d1_wrap
  await advanceToNextDayPick(user, true);
}

/** DAY2-7's normal (non-shadow) shape: pick a location -> its scene (first visit) -> free text
 *  with that NPC -> pick a second location -> its scene (second visit) -> evening -> wrap.
 *  Call once already on the current day's PICK1 screen. Leaves the game on the NEXT day's
 *  PICK1 screen (unless `hasNextDay` is false, e.g. DAY7 -- then it stops at the wrap).
 *  DAY3's evening beat uniquely has its own choice (the "tinker/sleep" night-AI beat) instead of
 *  being continue-only -- pass `eveningChoiceId` for that day. */
async function finishNormalDay(user: U, locA: string, choiceA: string, freeTextAnswer: string, locB: string, choiceB: string, hasNextDay = true, eveningChoiceId?: string) {
  await pickLocation(user, locA);
  await pickChoice(user, choiceA); // -> freetext_A
  await answerFreeText(user, freeTextAnswer); // -> pick2
  await pickLocation(user, locB);
  await pickChoice(user, choiceB); // -> evening
  if (eveningChoiceId) {
    await pickChoice(user, eveningChoiceId); // -> wrap
  } else {
    await continueBeat(user); // evening -> wrap
  }
  await advanceToNextDayPick(user, hasNextDay);
}

/** DAY2+'s Jin half-day-shadow branch: pick COMMUNITY_HALL -> "今は" -> accept -> free text
 *  mid-shadow -> result -> evening -> wrap. Skips the day's second location pick entirely (the
 *  opportunity-cost mechanic). Call once already on that day's PICK1 screen. Leaves the game on
 *  the next day's PICK1 screen. */
async function shadowDay(user: U, freeTextAnswer = "新しい生活を探しに来ました") {
  await pickLocation(user, "COMMUNITY_HALL");
  await pickChoice(user, "not_yet"); // -> shadow_offer
  await pickChoice(user, "accept"); // -> shadow_freetext
  await answerFreeText(user, freeTextAnswer); // shadow_result
  await continueBeat(user); // shadow_result -> evening
  await continueBeat(user); // evening -> wrap
  await advanceToNextDayPick(user, true);
}

describe("NEW LIFE V0.3: approved art actually renders", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("Challenge Town image is visible on the opening screen", async () => {
    window.history.pushState({}, "", "/?newlifev03=1");
    render(<App />);
    const img = await screen.findByTestId("v03-town-image");
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toContain("challenge-town");
  });

  it("Yohei's, Miyoko's, and Jin's portraits render during their DAY1 and DAY2 scenes", async () => {
    const user = userEvent.setup();
    await start(user);
    await answerFreeText(user, "まだよく分かりません");
    await continueBeat(user);
    await pickLocation(user, "YOHEI_STORE");
    expect((await screen.findByTestId("v03-portrait-yohei")).getAttribute("src")).toContain("yohei");
    await pickChoice(user, "leave");
    await pickLocation(user, "CAFE_NODOKA");
    expect((await screen.findByTestId("v03-portrait-miyoko")).getAttribute("src")).toContain("miyoko");
    await pickChoice(user, "leave");
    await continueBeat(user); // noon -> evening
    await continueBeat(user); // evening -> wrap
    await advanceToNextDayPick(user, true); // -> DAY2 pick1
    await pickLocation(user, "COMMUNITY_HALL");
    expect((await screen.findByTestId("v03-portrait-jin")).getAttribute("src")).toContain("soma-jin");
  });
});

describe("NEW LIFE V0.3: Kamiya is a major character, and the 30-day deadline is always visible", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("DAY1 opens on a mandatory Kamiya consultation with a free-text question, and the day counter shows the deadline", async () => {
    const user = userEvent.setup();
    await start(user);
    const freetext = await screen.findByTestId("v03-step-freetext");
    expect(freetext.textContent).toMatch(/神谷|チャレンジセンター/);
    expect(freetext.textContent).toMatch(/本当は何がしたいんです/);
    await answerFreeText(user, "正直、まだ分かりません");
    await continueBeat(user); // past d1_kamiya_after
    expect(screen.getByTestId("v03-day-counter").textContent).toMatch(/DAY 1.*残り29日/);
  });

  it("the day counter advances and stays visible on DAY2", async () => {
    const user = userEvent.setup();
    await start(user);
    await finishDay1(user, "YOHEI_STORE", "leave", "CAFE_NODOKA", "leave");
    expect(screen.getByTestId("v03-day-counter").textContent).toMatch(/DAY 2.*残り28日/);
  });
});

describe("NEW LIFE V0.3: a day is not one choice, and opportunity cost is real", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("DAY1 has multiple distinct scenes before reaching the day-end summary", async () => {
    const user = userEvent.setup();
    await start(user);
    await answerFreeText(user, "分かりません");
    await continueBeat(user);
    await pickLocation(user, "YOHEI_STORE");
    await pickChoice(user, "borrow");
    // still not at the wrap -- a second location pick should be next
    expect(await screen.findByTestId("v03-step-pick")).toBeInTheDocument();
    expect(screen.queryByTestId("v03-step-wrap")).not.toBeInTheDocument();
  });

  it("accepting Jin's half-day shadow offer on DAY2 skips the second location pick that day (opportunity cost)", async () => {
    const user = userEvent.setup();
    await start(user);
    await finishDay1(user, "YOHEI_STORE", "leave", "CAFE_NODOKA", "leave");

    await pickLocation(user, "COMMUNITY_HALL");
    await pickChoice(user, "not_yet");
    await pickChoice(user, "accept");
    await answerFreeText(user, "新しい生活を探しに来ました");
    // the shadow path goes straight to a scene (the result), not a second PICK screen
    expect(await screen.findByTestId("v03-step-scene")).toBeInTheDocument();
    expect(screen.queryByTestId("v03-step-pick")).not.toBeInTheDocument();
  });
});

describe("NEW LIFE V0.3: free text is genuinely required, and never blocks progress", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("submitting free text always shows some in-character reply, even for unrelated input", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.type(await screen.findByTestId("v03-freetext-input"), "asdkfjasldkfj");
    await user.click(await screen.findByTestId("v03-freetext-submit"));
    const reply = await screen.findByTestId("v03-freetext-reply");
    expect(reply.textContent?.length).toBeGreaterThan(0);
  });

  it("every day includes at least one free-text beat -- DAY2's normal path reaches one after the first location visit", async () => {
    const user = userEvent.setup();
    await start(user);
    await finishDay1(user, "YOHEI_STORE", "leave", "CAFE_NODOKA", "leave");
    await pickLocation(user, "YOHEI_STORE");
    await pickChoice(user, "help_count");
    expect(await screen.findByTestId("v03-step-freetext")).toBeInTheDocument();
  });
});

describe("NEW LIFE V0.3: DAY1-2 events reach DAY3, and NPCs remember/connect", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("shadowing Jin on DAY2 makes him reference it again on DAY3, and DAY3's morning reflects the tiredness", async () => {
    const user = userEvent.setup();
    await start(user);
    await finishDay1(user, "YOHEI_STORE", "leave", "CAFE_NODOKA", "leave");
    // Inline DAY2's shadow branch without the helper's automatic day-3-wake skip, so DAY3's
    // wake screen can be inspected before continuing past it.
    await pickLocation(user, "COMMUNITY_HALL");
    await pickChoice(user, "not_yet");
    await pickChoice(user, "accept");
    await answerFreeText(user, "新しい生活を探しに来ました");
    await continueBeat(user); // shadow result -> evening
    await continueBeat(user); // evening -> wrap
    await user.click(await screen.findByTestId("v03-next-day")); // -> DAY3, stays on d3_wake

    const day3Intro = await screen.findByTestId("v03-step-scene");
    expect(day3Intro.textContent).toMatch(/現場仕事のせいか|少し体が重かった/);
    await continueBeat(user); // d3_wake -> d3_pick1

    await pickLocation(user, "COMMUNITY_HALL");
    const jinDay3 = await screen.findByTestId("v03-step-scene");
    expect(jinDay3.textContent).toMatch(/昨日は助かった/);
  });
});

describe("NEW LIFE V0.3: DAY5 Kamiya reflects accumulated career signals", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("after repeatedly engaging Jin's repair work, Kamiya's DAY5 meeting names a repair-related career and offers a connection", async () => {
    const user = userEvent.setup();
    await start(user);
    await finishDay1(user, "COMMUNITY_HALL", "leave", "YOHEI_STORE", "leave", "体を動かす仕事がしたいです");
    await shadowDay(user); // DAY2 -> lands on DAY3 pick1
    await finishNormalDay(user, "COMMUNITY_HALL", "glad", "体を動かすのは好きです", "YOHEI_STORE", "who_takes_over", true, "sleep"); // DAY3 -> DAY4 pick1
    await finishNormalDay(user, "COMMUNITY_HALL", "watch", "特にありません", "YOHEI_STORE", "offer_help"); // DAY4 -> DAY5 pick1

    await pickLocation(user, "CHALLENGE_CENTER");
    const kamiyaMajor = await screen.findByTestId("v03-step-scene");
    expect(kamiyaMajor.textContent).toMatch(/建物修繕|修繕業独立|便利屋独立/);
    expect(screen.getByTestId("v03-choice-connect")).toBeInTheDocument();
  });
});

describe("NEW LIFE V0.3: dialogue is natural, not explanatory, and internal type names never leak", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("no raw LifeMaterial type token or explainer phrase appears across a full DAY1 playthrough", async () => {
    const user = userEvent.setup();
    await start(user);
    expect(document.body.textContent).not.toMatch(RAW_TYPE_TOKENS);
    expect(document.body.textContent).not.toMatch(EXPLAINER_PHRASES);
    await answerFreeText(user, "まだ何も決めていません");
    expect(document.body.textContent).not.toMatch(RAW_TYPE_TOKENS);
    await continueBeat(user);
    await pickLocation(user, "YOHEI_STORE");
    await pickChoice(user, "borrow");
    expect(document.body.textContent).not.toMatch(RAW_TYPE_TOKENS);
    await pickLocation(user, "CAFE_NODOKA");
    await pickChoice(user, "sit");
    await continueBeat(user);
    await continueBeat(user);
    await screen.findByTestId("v03-step-wrap");
    expect(document.body.textContent).not.toMatch(RAW_TYPE_TOKENS);
    expect(document.body.textContent).not.toMatch(EXPLAINER_PHRASES);
  });
});

describe("NEW LIFE V0.3: DAY7 ends on an open hook, not a forced DAY8", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("reaching DAY7's wrap shows a closing note instead of a next-day button", async () => {
    const user = userEvent.setup();
    await start(user);
    await finishDay1(user, "YOHEI_STORE", "leave", "CAFE_NODOKA", "leave");
    await finishNormalDay(user, "YOHEI_STORE", "help_count", "特にありません", "CAFE_NODOKA", "which_better"); // DAY2
    await finishNormalDay(user, "YOHEI_STORE", "who_takes_over", "特にありません", "CAFE_NODOKA", "help", true, "sleep"); // DAY3
    await finishNormalDay(user, "YOHEI_STORE", "offer_help", "特にありません", "CAFE_NODOKA", "react"); // DAY4
    await finishNormalDay(user, "YOHEI_STORE", "ask_how_it_looks", "特にありません", "CAFE_NODOKA", "smile"); // DAY5
    await finishNormalDay(user, "YOHEI_STORE", "interested", "特にありません", "CAFE_NODOKA", "thanks_or_chat"); // DAY6
    await finishNormalDay(user, "YOHEI_STORE", "nod", "特にありません", "CAFE_NODOKA", "look_forward", false); // DAY7
    expect(screen.queryByTestId("v03-next-day")).not.toBeInTheDocument();
    expect(screen.getByTestId("v03-ending-note")).toBeInTheDocument();
  }, 20000);
});

describe("NEW LIFE V0.3: image failure does not break the game", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("a portrait load error falls back gracefully without removing the scene's choices", async () => {
    const user = userEvent.setup();
    await start(user);
    await answerFreeText(user, "分かりません");
    await continueBeat(user);
    await pickLocation(user, "YOHEI_STORE");
    const img = await screen.findByTestId("v03-portrait-yohei");
    fireEvent.error(img);
    expect(await screen.findByTestId("v03-portrait-yohei")).toHaveAttribute("data-image-failed", "true");
    expect(screen.getByTestId("v03-choice-borrow")).toBeInTheDocument();
  });
});

describe("mobile -- no horizontal overflow", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("opening and DAY1's first scenes fit without horizontal scroll at 360/390/430px", async () => {
    for (const width of [360, 390, 430]) {
      const originalWidth = window.innerWidth;
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
      const user = userEvent.setup();
      await start(user);
      expect(document.body.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1);
      await answerFreeText(user, "分かりません");
      expect(document.body.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1);
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: originalWidth });
      cleanup();
    }
  });
});

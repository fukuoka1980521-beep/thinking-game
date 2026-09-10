import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

const RAW_TYPE_TOKENS = /\bOBJECT\b|\bPROMISE\b|\bSHARED_EVENT\b|\bWORLD_CHANGE\b|\bPENDING_TASK\b|\bPLACE_KNOWLEDGE\b/;

async function startGame(user: ReturnType<typeof userEvent.setup>) {
  window.history.pushState({}, "", "/?newlifev02=1");
  render(<App />);
  await user.click(await screen.findByTestId("v02-start"));
}

async function advanceDay1Intro(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByTestId("v02-continue")); // INTRO(day1, no choice) -> PICK
}

async function visitLocation(user: ReturnType<typeof userEvent.setup>, loc: "YOHEI_STORE" | "CAFE_NODOKA" | "COMMUNITY_HALL") {
  await user.click(await screen.findByTestId(`v02-pick-${loc}`));
}

async function pickChoice(user: ReturnType<typeof userEvent.setup>, choiceId: string) {
  await user.click(await screen.findByTestId(`v02-choice-${choiceId}`));
  await user.click(await screen.findByTestId("v02-continue"));
}

/** Drives a full day, choosing `loc`/`npcChoiceId` at the morning encounter and taking the first
 *  available option at every other choice point, ending on the SUMMARY step. */
async function playDay(
  user: ReturnType<typeof userEvent.setup>,
  loc: "YOHEI_STORE" | "CAFE_NODOKA" | "COMMUNITY_HALL",
  npcChoiceId: string,
  introChoiceId?: string
) {
  if (introChoiceId) {
    await pickChoice(user, introChoiceId);
  } else {
    await user.click(await screen.findByTestId("v02-continue"));
  }
  await visitLocation(user, loc);
  await pickChoice(user, npcChoiceId);
  // afternoon: pick first available choice if any, else just continue
  const afternoon = await screen.findByTestId("v02-step-afternoon");
  const afternoonChoiceBtn = afternoon.querySelector('[data-testid^="v02-choice-"]') as HTMLElement | null;
  if (afternoonChoiceBtn) {
    await user.click(afternoonChoiceBtn);
  }
  await user.click(await screen.findByTestId("v02-continue"));
  // evening: no choice, just continue
  await user.click(await screen.findByTestId("v02-continue"));
  await screen.findByTestId("v02-step-summary");
}

describe("NEW LIFE V0.2: town/character art actually renders", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("Challenge Town image is visible on the opening screen", async () => {
    window.history.pushState({}, "", "/?newlifev02=1");
    render(<App />);
    const img = await screen.findByTestId("v02-town-image");
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toContain("challenge-town");
  });

  it("Yohei's portrait renders during his scene", async () => {
    const user = userEvent.setup();
    await startGame(user);
    await advanceDay1Intro(user);
    await visitLocation(user, "YOHEI_STORE");
    const img = await screen.findByTestId("v02-portrait-yohei");
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toContain("yohei");
  });

  it("Miyoko's portrait renders during her scene", async () => {
    const user = userEvent.setup();
    await startGame(user);
    await advanceDay1Intro(user);
    await visitLocation(user, "CAFE_NODOKA");
    const img = await screen.findByTestId("v02-portrait-miyoko");
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toContain("miyoko");
  });

  it("Jin (Soma Jin)'s portrait renders during his scene", async () => {
    const user = userEvent.setup();
    await startGame(user);
    await advanceDay1Intro(user);
    await visitLocation(user, "COMMUNITY_HALL");
    const img = await screen.findByTestId("v02-portrait-jin");
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toContain("soma-jin");
  });
});

describe("NEW LIFE V0.2: a day is more than one choice", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("DAY1 has multiple scenes -- picking a location and one NPC choice does not end the day", async () => {
    const user = userEvent.setup();
    await startGame(user);
    await advanceDay1Intro(user);
    await visitLocation(user, "YOHEI_STORE");
    await pickChoice(user, "borrow");
    // still DAY 1, now at the afternoon scene -- not the day summary yet
    expect(screen.getByTestId("v02-day-label").textContent).toContain("DAY 1");
    expect(screen.getByTestId("v02-step-afternoon")).toBeInTheDocument();
    expect(screen.queryByTestId("v02-step-summary")).not.toBeInTheDocument();
  });
});

describe("NEW LIFE V0.2: DAY1 choices shape DAY2, and DAY2 shapes DAY3", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("borrowing Yohei's toolbox on DAY1 unlocks fixing the shelf yourself on DAY2, and DAY3 reflects the fixed shelf", async () => {
    const user = userEvent.setup();
    await startGame(user);
    await playDay(user, "YOHEI_STORE", "borrow");
    await user.click(await screen.findByTestId("v02-next-day"));

    expect(screen.getByTestId("v02-day-label").textContent).toContain("DAY 2");
    expect(await screen.findByTestId("v02-choice-fix_with_tool")).toBeInTheDocument();

    await playDay(user, "YOHEI_STORE", "report_used", "fix_with_tool");
    await user.click(await screen.findByTestId("v02-next-day"));

    expect(screen.getByTestId("v02-day-label").textContent).toContain("DAY 3");
    expect(screen.getByTestId("v02-step-intro").textContent).toMatch(/直した棚/);
  });

  it("not borrowing the toolbox on DAY1 still lets the world resolve the broken shelf on DAY2 (Jin fixes it)", async () => {
    const user = userEvent.setup();
    await startGame(user);
    await playDay(user, "COMMUNITY_HALL", "leave_hall");
    await user.click(await screen.findByTestId("v02-next-day"));

    // DAY2 intro: shelf breaks, no toolbox -> choose to seek Jin
    await pickChoice(user, "seek_jin");
    await visitLocation(user, "YOHEI_STORE");
    await pickChoice(user, "ask_festival");
    // afternoon: Jin shows up to fix the shelf because seekJinForShelf is set
    const afternoon = await screen.findByTestId("v02-step-afternoon");
    expect(afternoon.textContent).toMatch(/棚、見てくれって聞いたけど/);
    await pickChoice(user, "let_jin_fix");
    await user.click(await screen.findByTestId("v02-continue"));
    await screen.findByTestId("v02-step-summary");

    const carried = screen.getByTestId("v02-carried-list").textContent ?? "";
    const today = screen.getByTestId("v02-today-list").textContent ?? "";
    expect(carried + today).toMatch(/棚/);
  });
});

describe("NEW LIFE V0.2: the town does not wait for the player", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("skipping Miyoko on DAY1 still surfaces her flowerbed work that evening, and she acknowledges it on DAY2", async () => {
    const user = userEvent.setup();
    await startGame(user);
    await advanceDay1Intro(user);
    await visitLocation(user, "YOHEI_STORE");
    await pickChoice(user, "leave");
    // afternoon
    const afternoon = await screen.findByTestId("v02-step-afternoon");
    const afternoonChoiceBtn = afternoon.querySelector('[data-testid^="v02-choice-"]') as HTMLElement | null;
    if (afternoonChoiceBtn) await user.click(afternoonChoiceBtn);
    await user.click(await screen.findByTestId("v02-continue"));
    // evening: Miyoko trace, since she was never met
    const evening = await screen.findByTestId("v02-step-evening");
    expect(evening.textContent).toMatch(/美代子/);
    expect(evening.textContent).toMatch(/花壇/);
    await user.click(await screen.findByTestId("v02-continue"));
    await user.click(await screen.findByTestId("v02-next-day"));

    await pickChoice(user, "leave_broken_no_tool");
    await visitLocation(user, "CAFE_NODOKA");
    const miyokoScene = await screen.findByTestId("v02-step-npc-scene");
    expect(miyokoScene.textContent).toMatch(/見てたでしょ/);
  });
});

describe("NEW LIFE V0.2: NPCs remember the player", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("Jin references DAY1's help when met again on DAY2", async () => {
    const user = userEvent.setup();
    await startGame(user);
    await playDay(user, "COMMUNITY_HALL", "help_board");
    await user.click(await screen.findByTestId("v02-next-day"));

    await pickChoice(user, "seek_jin");
    await visitLocation(user, "COMMUNITY_HALL");
    const scene = await screen.findByTestId("v02-step-npc-scene");
    expect(scene.textContent).toMatch(/昨日の掲示、ありがとな/);
  });
});

describe("NEW LIFE V0.2: life material persists without leaking raw type names", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("a DAY1 material appears in DAY1's own summary, and again as 'carried over' in DAY2's summary", async () => {
    const user = userEvent.setup();
    await startGame(user);
    await playDay(user, "YOHEI_STORE", "borrow");
    const day1Today = await screen.findByTestId("v02-today-list");
    expect(day1Today.textContent).toContain("洋平から借りた古い工具箱");

    await user.click(await screen.findByTestId("v02-next-day"));
    await playDay(user, "CAFE_NODOKA", "not_today", "leave_broken_have_tool");
    const day2Carried = await screen.findByTestId("v02-carried-list");
    expect(day2Carried.textContent).toContain("洋平から借りた古い工具箱");
  });

  it("no raw LifeMaterial type token is ever shown on screen across a full DAY1 playthrough", async () => {
    const user = userEvent.setup();
    await startGame(user);
    expect(document.body.textContent).not.toMatch(RAW_TYPE_TOKENS);
    await advanceDay1Intro(user);
    expect(document.body.textContent).not.toMatch(RAW_TYPE_TOKENS);
    await visitLocation(user, "YOHEI_STORE");
    expect(document.body.textContent).not.toMatch(RAW_TYPE_TOKENS);
    await pickChoice(user, "borrow");
    expect(document.body.textContent).not.toMatch(RAW_TYPE_TOKENS);
    await pickChoice(user, "remember_notice");
    expect(document.body.textContent).not.toMatch(RAW_TYPE_TOKENS);
    await user.click(await screen.findByTestId("v02-continue"));
    await screen.findByTestId("v02-step-summary");
    expect(document.body.textContent).not.toMatch(RAW_TYPE_TOKENS);
  });
});

describe("NEW LIFE V0.2: image failure does not break the game", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("dispatching an error event on Yohei's portrait falls back gracefully without removing the choices", async () => {
    const user = userEvent.setup();
    await startGame(user);
    await advanceDay1Intro(user);
    await visitLocation(user, "YOHEI_STORE");
    const img = await screen.findByTestId("v02-portrait-yohei");
    fireEvent.error(img);
    expect(await screen.findByTestId("v02-portrait-yohei")).toHaveAttribute("data-image-failed", "true");
    expect(screen.getByTestId("v02-choice-borrow")).toBeInTheDocument();
  });
});

describe("mobile -- no horizontal overflow", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("opening and a full day fit without horizontal scroll at 360/390/430px", async () => {
    for (const width of [360, 390, 430]) {
      const originalWidth = window.innerWidth;
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
      const user = userEvent.setup();
      await startGame(user);
      expect(document.body.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1);
      await advanceDay1Intro(user);
      await visitLocation(user, "YOHEI_STORE");
      expect(document.body.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1);
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: originalWidth });
      cleanup();
    }
  });
});

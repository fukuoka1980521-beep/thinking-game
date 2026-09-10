import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

type U = ReturnType<typeof userEvent.setup>;

async function start(user: U) {
  window.history.pushState({}, "", "/?newlifecore=1");
  render(<App />);
  await user.click(await screen.findByTestId("nlc-start"));
}

describe("NEW LIFE CORE: approved art actually renders", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("Challenge Town image is visible on the opening screen", async () => {
    window.history.pushState({}, "", "/?newlifecore=1");
    render(<App />);
    const img = await screen.findByTestId("nlc-town-image");
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toContain("challenge-town");
  });

  it("Yohei's portrait renders when visiting his store", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-move-YOHEI_STORE"));
    const img = await screen.findByTestId("nlc-portrait-yohei");
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toContain("yohei");
  });
});

describe("NEW LIFE CORE: a day does not end after one action, and the clock is always visible", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("after leaving the trial house once, the day continues (no day-end screen) and the clock has advanced", async () => {
    const user = userEvent.setup();
    await start(user);
    expect(screen.getByTestId("nlc-clock").textContent).toMatch(/08:45/);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    expect(screen.queryByTestId("nlc-day-end")).not.toBeInTheDocument();
    expect(screen.getByTestId("nlc-clock").textContent).not.toMatch(/08:45/);
  });

  it("ignoring Kamiya entirely and walking straight back to the trial house does not softlock the game", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-move-TRIAL_HOUSE"));
    // Should show the normal movelist again, not the forced "go to Challenge Center" wake scene.
    expect(await screen.findByTestId("nlc-movelist")).toBeInTheDocument();
    expect(screen.queryByTestId("nlc-wake-scene")).not.toBeInTheDocument();
  });
});

describe("NEW LIFE CORE: free-text conversation actually works", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("submitting free text to Kamiya produces a visible reply and the input clears", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    const input = await screen.findByTestId("nlc-freetext-input-kamiya");
    await user.type(input, "本当は何がしたいのか、まだ分かりません");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    const log = await screen.findByTestId("nlc-conversation-log-kamiya");
    expect(log.textContent).toMatch(/本当は何がしたいのか、まだ分かりません/);
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("multiple exchanges with the same NPC are possible without leaving the conversation", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "一つ目の発言です");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    await screen.findByText("一つ目の発言です");
    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "二つ目の発言です");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    const log = await screen.findByTestId("nlc-conversation-log-kamiya");
    expect(log.textContent).toMatch(/一つ目の発言です/);
    expect(log.textContent).toMatch(/二つ目の発言です/);
  });
});

describe("NEW LIFE CORE: no raw technical state ever appears on screen", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("no internal field/type names leak into the rendered DOM across a short playthrough", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "こんにちは");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    await screen.findByText("こんにちは");
    expect(document.body.textContent).not.toMatch(/CoreState|WorldFact|npcMemory|ConversationTurn|visibleUtterance|NpcAiContext/);
  });
});

describe("NEW LIFE CORE: Owner play does not require finding a dev-only toggle (directive NEW_LIFE_DAY1_OWNER_REVIEW_READY_V1 Section 4)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("the live-AI default is keyed off an actual `vite` dev server (MODE), not DEV -- DEV is also true under this very test run, so a regression back to DEV alone would make every rendered-UI test fetch a nonexistent endpoint", async () => {
    // This test's own successful, fast completion is direct evidence the default stayed off here
    // (MODE is "test", not "development") -- if it flipped on, free-text submission below would
    // attempt a real fetch to /api/newlifecore-npc-dialogue and only resolve after that fetch
    // rejects, rather than immediately via the deterministic adapter.
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    const toggle = screen.getByTestId("nlc-live-toggle") as HTMLInputElement;
    expect(toggle.checked).toBe(false);
  });
});

describe("mobile -- no horizontal overflow", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("opening and the first free-roam screen fit without horizontal scroll at 360/390/430px", async () => {
    for (const width of [360, 390, 430]) {
      const originalWidth = window.innerWidth;
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
      const user = userEvent.setup();
      await start(user);
      expect(document.body.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1);
      await user.click(await screen.findByTestId("nlc-go-challenge-center"));
      expect(document.body.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1);
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: originalWidth });
      cleanup();
    }
  });
});

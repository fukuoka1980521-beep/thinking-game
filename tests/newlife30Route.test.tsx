import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { markOnboardingSeen } from "../src/lib/onboarding";
import { clarificationLine } from "../src/newlife/npcVoice";
import { setNewLifeAiDialogueConsent } from "../src/newlife/semantic/consent";

// This whole file's free-talk assertions below are written against the
// deterministic-only router (see the comment on `askHina`), which is only
// what actually runs when `src/newlife/semantic/config.ts` ships an empty
// endpoint (as it does pre-Phase-33), OR once Phase 33 wires a real one AND
// the player has declined AI-dialogue consent (NewLife30App.tsx's
// `resolveFreeText` call passes `consentAccepted: consentStatus ===
// "accepted"`, and coordinator.ts treats a declined/unset consent exactly
// like "no interpreter" -- Phase 30 instruction 12). A fresh jsdom render
// otherwise starts with consent undecided (`localStorage` empty), so once an
// endpoint is wired, NewLife30App shows the mandatory `NewLifeAiConsentPrompt`
// on first submission instead of ever reaching the router this file tests --
// a separate, already-covered flow (tests/newlife30AiConsentFlow.test.tsx).
// Pre-declining here restores the deterministic-only baseline this file's
// tests are actually about, regardless of config.ts's currently-shipped
// value. Stubbing `fetch` to always fail is cheap extra insurance against a
// real network call ever being attempted here, for the same reason.
const originalFetch = global.fetch;
beforeAll(() => {
  vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("no live provider in tests"))));
});
afterAll(() => {
  vi.stubGlobal("fetch", originalFetch);
});
beforeEach(() => {
  setNewLifeAiDialogueConsent("declined");
});

// Route isolation: ?newlife30=1 must behave exactly like the existing
// ?case1test hidden-link pattern in App.tsx -- opt-in only, never linked
// from HomeScreen, never the default route, and the normal app must render
// completely unaffected when the param is absent.
describe("NEW LIFE 30-day route isolation", () => {
  it("the plain '/' route renders normal HomeScreen, with no NEW LIFE reference anywhere on it", () => {
    markOnboardingSeen();
    window.history.pushState({}, "", "/");
    render(<App />);
    expect(screen.getByText("思考整理ゲーム")).toBeInTheDocument();
    expect(screen.queryByText(/NEW LIFE/)).not.toBeInTheDocument();
  });

  it("?newlife30=1 opens the NEW LIFE candidate directly, bypassing HomeScreen entirely", () => {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    expect(screen.getByText(/^NEW LIFE$/)).toBeInTheDocument();
    expect(screen.getByText("値段がついた箱")).toBeInTheDocument();
    expect(screen.queryByText("思考整理ゲーム")).not.toBeInTheDocument();
  });

  it("keeps developer validation labels out of the normal player-facing game screen", () => {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    expect(screen.queryByText(/HUMAN_VALIDATION_STATUS/)).not.toBeInTheDocument();
    expect(screen.getByText("あなたなら、どうする？")).toBeInTheDocument();
  });

  it("carries the player's own trace through Day 1 -> 2 -> 3 and targets an NPC who is actually present", async () => {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText(/自由に話しかける/);

    await user.type(input, "箱、持ちますよ");
    await user.click(screen.getByRole("button", { name: "話す" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "話す" })).not.toBeDisabled());
    await user.click(screen.getByRole("button", { name: "次の日へ" }));

    expect(screen.getByText("四つの席")).toBeInTheDocument();
    expect(screen.getByText("箱、持ちますよ")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("combobox")).toHaveValue("miyoko"));

    await user.type(screen.getByPlaceholderText(/自由に話しかける/), "席のこと、少し聞いてもいいですか");
    await user.click(screen.getByRole("button", { name: "話す" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "話す" })).not.toBeDisabled());
    await user.click(screen.getByRole("button", { name: "次の日へ" }));

    expect(screen.getByText("担当という言葉")).toBeInTheDocument();
    expect(screen.getByText("席のこと、少し聞いてもいいですか")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("combobox")).toHaveValue("miyoko"));
  });

  it("turns a reflection next-step into the actual free-action input instead of leaving it as a memo", async () => {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "思考を整理する" }));
    await user.type(screen.getByLabelText("次に一つだけやること"), "陽菜に値段を聞いてみる");
    await user.click(screen.getByRole("button", { name: "この一歩をゲームで試す" }));

    expect(screen.getByPlaceholderText(/自由に話しかける/)).toHaveValue("陽菜に値段を聞いてみる");
  });
});

// Phase 28 UI smoke test (instruction 14): drives the actual free-talk form
// on the hidden route through jsdom + Testing Library -- the same UI
// verification tooling this repo already uses for "UI_WALKTHROUGH" in
// case1c.test.tsx. A real browser (Playwright) is not available in this
// sandbox; this exercises the real rendered component tree and real event
// handlers, not just the pure npcVoice functions in isolation.
describe("NEW LIFE 30-day free-talk UI smoke test (Phase 28)", () => {
  async function askHina(text: string) {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText(/自由に話しかける/);
    await user.type(input, text);
    await user.click(screen.getByRole("button", { name: "話す" }));
    // Phase 30: free-talk now resolves through the async hybrid coordinator
    // (coordinator.ts) even with the shipped empty endpoint, where it
    // settles in one microtask hop with no real network call. Waiting for
    // the submit button to re-enable (set by the same `finally` that
    // appends the transcript line) is a robust way to know the turn has
    // fully settled before asserting on transcript content, rather than
    // coupling every assertion to fetch/timer mocking it doesn't need.
    await waitFor(() => expect(screen.getByRole("button", { name: "話す" })).not.toBeDisabled());
    return screen;
  }

  it("the Owner's exact reported failure sentence renders the real menu facts in the transcript, not the old flavor non-answer", async () => {
    const ui = await askHina("おはようございます。どんな焼き菓子売るのですか");
    expect(ui.getByText(/スコーンとクッキーです/)).toBeInTheDocument();
    expect(ui.queryByText(/先に数を見ます/)).not.toBeInTheDocument();
  });

  it("an unrecognized question renders the in-character clarification, not a flavor line", async () => {
    const ui = await askHina("この町の好きなところはどこですか？");
    expect(ui.getByText(clarificationLine("hina"))).toBeInTheDocument();
  });

  it("a plain non-question statement still renders a flavor line, not the clarification", async () => {
    const ui = await askHina("今日もいい天気ですね");
    expect(ui.queryByText(clarificationLine("hina"))).not.toBeInTheDocument();
  });
});


describe("NEW LIFE midgame visible consequence loop", () => {
  it("shows Day 9 boundary work and Day 10 pickup planning as player-visible world state", async () => {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    const user = userEvent.setup();

    for (let day = 1; day < 9; day += 1) {
      await user.click(screen.getByRole("button", { name: "次の日へ" }));
    }
    expect(screen.getByText("待つ場所はどこか")).toBeInTheDocument();
    expect(screen.getByText("喫茶の席：まだ曖昧")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "美代子に答えてもらう" }));
    expect(screen.getByText("喫茶の席：使える範囲を確認した")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "次の日へ" }));
    expect(screen.getByText("空欄の一行")).toBeInTheDocument();
    expect(screen.getByText("受け渡し：担当がまだ決まっていない")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "時間を分ける提案をする" }));
    expect(screen.getByText("受け渡し：時間を分ける案が具体化した")).toBeInTheDocument();
  });
});

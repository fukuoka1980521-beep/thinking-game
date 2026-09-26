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


describe("NEW LIFE Day 11-16 visible consequence chain", () => {
  it("turns sign, reporting, direct fact-check and paid-work choices into visible world consequences", async () => {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    const user = userEvent.setup();
    for (let day = 1; day < 11; day += 1) await user.click(screen.getByRole("button", { name: "\u6b21\u306e\u65e5\u3078" }));

    expect(screen.getByText("\u671d\uff1a\u5024\u672d\u3068\u539f\u7a3f")).toBeInTheDocument();
    expect(screen.getByText("\u63b2\u793a\uff1a\u307e\u3060\u63b2\u793a\u524d")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "\u8cbc\u308b\u524d\u306b\u4e88\u7d0412\uff0f\u5e97\u982d18\u3068\u76f4\u3059\u3088\u3046\u4f1d\u3048\u308b" }));
    expect(screen.getByText("\u63b2\u793a\uff1a\u6700\u521d\u304b\u3089\u5185\u8a33\u304c\u660e\u78ba")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "\u6b21\u306e\u65e5\u3078" }));
    expect(screen.getByText("\u5348\u5f8c\uff1a\u91cd\u306a\u308b\u4e8c\u4eba")).toBeInTheDocument();
    expect(screen.getByText("\u63b2\u793a\uff1a\u6700\u521d\u304b\u3089\u5185\u8a33\u304c\u660e\u78ba")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "\u3053\u306e\u65e5\u3092\u7d42\u3048\u308b" }));
    await user.click(screen.getByRole("button", { name: "\u6b21\u306e\u65e5\u3078" }));

    expect(screen.getByText("\u5ba2\u304c\u5f85\u3063\u305f\u6642\u9593")).toBeInTheDocument();
    expect(screen.getByText("\u4f1d\u3048\u65b9\uff1a\u4e8b\u5b9f\u306e\u7bc4\u56f2\u3092\u4fdd\u3063\u3066\u3044\u308b")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "\u5ba2\u306f\u3082\u3063\u3068\u6012\u3063\u3066\u3044\u305f\u3068\u8a71\u3092\u76db\u3063\u3066\u4f1d\u3048\u308b" }));
    expect(screen.getByText("\u4f1d\u3048\u65b9\uff1a\u8a71\u3092\u76db\u3063\u305f\u5185\u5bb9\u304c\u6b8b\u3063\u3066\u3044\u308b")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "\u6b21\u306e\u65e5\u3078" }));

    expect(screen.getByText("\u967d\u83dc\u3068\u6d0b\u5e73\uff1a\u307e\u3060\u76f4\u63a5\u7167\u5408\u3057\u3066\u3044\u306a\u3044")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "\u4e21\u8005\u3092\u5f15\u304d\u5408\u308f\u305b\u3066\u76f4\u63a5\u7167\u5408\u3055\u305b\u308b" }));
    expect(screen.getByText("\u967d\u83dc\u3068\u6d0b\u5e73\uff1a\u4e8c\u4eba\u3067\u76f4\u63a5\u78ba\u304b\u3081\u305f")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "\u6b21\u306e\u65e5\u3078" }));
    await user.click(screen.getByRole("button", { name: "\u6b21\u306e\u65e5\u3078" }));

    expect(screen.getByText("\u4e8c\u6642\u9593\u306e\u4ed5\u4e8b")).toBeInTheDocument();
    expect(screen.getByText("\u4ec1\u3078\u306e\u8ffd\u52a0\u4f9d\u983c\uff1a\u6700\u521d\u306e\u4e8c\u6642\u9593\u3060\u3051\u5408\u610f\u6e08\u307f")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "\u6709\u511f\u306e\u8a2d\u55b6\u5185\u5bb9\u3092\u4e00\u7dd2\u306b\u6574\u7406\u3059\u308b" }));
    expect(screen.getByText("\u4ec1\u3078\u306e\u8ffd\u52a0\u4f9d\u983c\uff1a\u5185\u5bb9\u3068\u6642\u9593\u3092\u6c7a\u3081\u3066\u5408\u610f\u3057\u305f")).toBeInTheDocument();
  });
});

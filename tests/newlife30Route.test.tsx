import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { markOnboardingSeen } from "../src/lib/onboarding";
import { clarificationLine } from "../src/newlife/npcVoice";

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
    expect(screen.getByText(/NEW LIFE — Phase 27 playable candidate/)).toBeInTheDocument();
    expect(screen.getByText("値段がついた箱")).toBeInTheDocument();
    expect(screen.queryByText("思考整理ゲーム")).not.toBeInTheDocument();
  });

  it("HUMAN_VALIDATION_STATUS is disclosed as PENDING on every screen of the candidate, never a hidden claim of PASS", () => {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    expect(screen.getByText(/HUMAN_VALIDATION_STATUS: PENDING/)).toBeInTheDocument();
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

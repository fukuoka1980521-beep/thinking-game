import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { getNewLifeAiDialogueConsent } from "../src/newlife/semantic/consent";

// Hoisted by Vitest to the top of the file -- exercises the NEW LIFE
// consent/pending/success/fallback machinery as it will behave once
// functions/newlife-dialogue/ is actually deployed and
// NEWLIFE_DIALOGUE_ENDPOINT_URL is set. tests/newlife30Route.test.tsx
// covers the current, real, empty-URL deployment state separately, with
// nothing mocked -- this file's whole premise (Phase 30 instruction 14) is
// that the deployed-empty-endpoint behavior stays byte-identical, and this
// is the file that instead turns the endpoint "on" to test the rest.
vi.mock("../src/newlife/semantic/config", () => ({
  NEWLIFE_DIALOGUE_ENDPOINT_URL: "https://example.invalid/newlife-dialogue",
}));

function validInterpretation(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    conversationalAct: "character_question",
    semanticIntents: [{ category: "character_preference", utteranceSpan: "休みの日" }],
    entities: [],
    answerableFromCanon: true,
    requiredFacts: [],
    unknowns: [],
    proposedResponse: "休みの日も棚の数を数えてしまいます。",
    ...overrides,
  };
}

async function openNewLife30() {
  window.history.pushState({}, "", "/?newlife30=1");
  render(<App />);
  return userEvent.setup();
}

async function askAmbiguousQuestion(user: ReturnType<typeof userEvent.setup>) {
  const input = screen.getByPlaceholderText(/自由に話しかける/);
  await user.type(input, "休みの日は何をしていますか");
  await user.click(screen.getByRole("button", { name: "話す" }));
}

describe("NEW LIFE AI-dialogue consent flow once an endpoint is configured (Phase 30 instructions 12/14/15)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("shows the NEW LIFE-specific consent prompt before the first ambiguous free-talk turn, not before", async () => {
    const user = await openNewLife30();
    expect(screen.queryByText(/外部のAIサービスへ送信/)).not.toBeInTheDocument();

    await askAmbiguousQuestion(user);
    expect(screen.getByText(/外部のAIサービスへ送信/)).toBeInTheDocument();
  });

  it("never shows the CASE1 consent screen title — this is a separate, NEW LIFE-specific prompt", async () => {
    const user = await openNewLife30();
    await askAmbiguousQuestion(user);
    expect(screen.queryByRole("heading", { name: "AIとの対話について" })).not.toBeInTheDocument();
  });

  it("declining records a sticky 'declined' choice, calls no network, and still shows the deterministic clarification", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const user = await openNewLife30();
    await askAmbiguousQuestion(user);

    await user.click(screen.getByRole("button", { name: "AIなしで続ける" }));

    expect(getNewLifeAiDialogueConsent()).toBe("declined");
    expect(fetchSpy).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole("button", { name: "話す" })).not.toBeDisabled());
    expect(screen.getByText("すみません、何について知りたいか、もう少し具体的に聞いてもいいですか。")).toBeInTheDocument();
  });

  it("accepting attempts a real call and displays the model's proposedResponse on a passing, well-formed response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => validInterpretation() }));
    const user = await openNewLife30();
    await askAmbiguousQuestion(user);

    await user.click(screen.getByRole("button", { name: "同意して続ける" }));

    expect(getNewLifeAiDialogueConsent()).toBe("accepted");
    expect(await screen.findByText("休みの日も棚の数を数えてしまいます。")).toBeInTheDocument();
  });

  it("disables the submit button while a turn is pending, preventing a duplicate submit", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          }),
      ),
    );
    const user = await openNewLife30();
    await askAmbiguousQuestion(user);
    await user.click(screen.getByRole("button", { name: "同意して続ける" }));

    expect(screen.getByRole("button", { name: "話す" })).toBeDisabled();
    expect(screen.getByText("考え中…")).toBeInTheDocument();

    resolveFetch({ ok: true, json: async () => validInterpretation() });
    expect(await screen.findByText("休みの日も棚の数を数えてしまいます。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "話す" })).not.toBeDisabled();
  });

  it("a network failure after accepting falls back to the deterministic clarification, with no dead end", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));
    const user = await openNewLife30();
    await askAmbiguousQuestion(user);
    await user.click(screen.getByRole("button", { name: "同意して続ける" }));

    expect(
      await screen.findByText("すみません、何について知りたいか、もう少し具体的に聞いてもいいですか。"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "話す" })).not.toBeDisabled();
  });

  it("a malformed model response falls back to the deterministic clarification instead of crashing or showing garbage", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ not: "an interpretation" }) }));
    const user = await openNewLife30();
    await askAmbiguousQuestion(user);
    await user.click(screen.getByRole("button", { name: "同意して続ける" }));

    expect(
      await screen.findByText("すみません、何について知りたいか、もう少し具体的に聞いてもいいですか。"),
    ).toBeInTheDocument();
  });

  it("once consent is answered, later turns never show the consent prompt again", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => validInterpretation() }));
    const user = await openNewLife30();
    await askAmbiguousQuestion(user);
    await user.click(screen.getByRole("button", { name: "同意して続ける" }));
    await screen.findByText("休みの日も棚の数を数えてしまいます。");

    await askAmbiguousQuestion(user);
    expect(screen.queryByText(/外部のAIサービスへ送信/)).not.toBeInTheDocument();
  });

  it("a recognized fact question still answers deterministically with zero network calls, even with consent accepted", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const user = await openNewLife30();
    await askAmbiguousQuestion(user);
    // Decline here just to set a consent status without any prior fetch mock complexity.
    await user.click(screen.getByRole("button", { name: "AIなしで続ける" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "話す" })).not.toBeDisabled());

    const input = screen.getByPlaceholderText(/自由に話しかける/);
    await user.type(input, "どんな焼き菓子を売ってるの?");
    await user.click(screen.getByRole("button", { name: "話す" }));

    await waitFor(() => expect(screen.getByText(/スコーンとクッキーです/)).toBeInTheDocument());
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

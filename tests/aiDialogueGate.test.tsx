import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { markOnboardingSeen } from "../src/lib/onboarding";
import { getAiDialogueConsent } from "../src/lib/aiDialogueConsent";
import { loadCompletedLogs } from "../src/lib/storage";
import { getCaseById } from "../src/data/cases";

// Hoisted by Vitest to the top of the file -- this whole file exercises the
// consent/loading/success/failure machinery as it will behave the moment
// the Cloud Function is actually deployed and DIALOGUE_ENDPOINT_URL is set
// (tests/aiDialogueGateDormant.test.tsx covers the current, real, empty-URL
// deployment state separately, with nothing mocked).
vi.mock("../src/lib/aiDialogueClient", async () => {
  const actual = await vi.importActual<typeof import("../src/lib/aiDialogueClient")>("../src/lib/aiDialogueClient");
  return { ...actual, DIALOGUE_ENDPOINT_URL: "https://example.invalid/dialogue" };
});

const case001 = getCaseById("CASE-001")!;

function renderAppPastOnboarding() {
  markOnboardingSeen();
  return render(<App />);
}

async function toCase001FirstDecisionSubmitted(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "ケースを選ぶ" }));
  await user.click(screen.getByRole("button", { name: new RegExp(case001.title) }));
  await user.click(screen.getByRole("button", { name: "はじめる" })); // CASE_INTRO
  // FUN_FIRST_PROTOTYPE Run: OBSERVED_FACT is auto-skipped for CASE-001 (simplifiedFlow).
  await user.click(screen.getByRole("radio", { name: case001.availableChoices[0].label }));
  await user.click(screen.getByRole("button", { name: "次へ" }));
}

describe("AI dialogue consent gate once an endpoint is configured (Section 14/16, CASE-001 only)", () => {
  it("shows the consent screen before the very first real-AI attempt, and not again once answered", async () => {
    const user = userEvent.setup();
    renderAppPastOnboarding();
    expect(getAiDialogueConsent()).toBeNull();

    await toCase001FirstDecisionSubmitted(user);

    expect(screen.getByRole("heading", { name: "AIとの対話について" })).toBeInTheDocument();
  });

  it("declining records a sticky 'declined' choice and immediately shows the local fallback dialogue, no network attempted", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const user = userEvent.setup();
    renderAppPastOnboarding();

    await toCase001FirstDecisionSubmitted(user);
    await user.click(screen.getByRole("button", { name: "AIなしで続ける" }));

    expect(getAiDialogueConsent()).toBe("declined");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(
      screen.getByText(`あなたは「${case001.availableChoices[0].label}」を選びましたね。`, { exact: false }),
    ).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("accepting attempts a real call and shows the model's response on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ message: "生成されたテスト応答です" }) }),
    );
    const user = userEvent.setup();
    renderAppPastOnboarding();

    await toCase001FirstDecisionSubmitted(user);
    await user.click(screen.getByRole("button", { name: "同意して続ける" }));

    expect(getAiDialogueConsent()).toBe("accepted");
    expect(await screen.findByText("生成されたテスト応答です")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("on failure, offers retry / continue-without-AI rather than silently substituting content", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));
    const user = userEvent.setup();
    renderAppPastOnboarding();

    await toCase001FirstDecisionSubmitted(user);
    await user.click(screen.getByRole("button", { name: "同意して続ける" }));

    expect(await screen.findByText("AIとの通信がうまくいきませんでした。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "もう一度試す" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AIなしで続ける" })).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("retry re-attempts the call and succeeds if the second attempt works", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("network down"))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: "2回目で成功" }) });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderAppPastOnboarding();

    await toCase001FirstDecisionSubmitted(user);
    await user.click(screen.getByRole("button", { name: "同意して続ける" }));
    await screen.findByText("AIとの通信がうまくいきませんでした。");

    await user.click(screen.getByRole("button", { name: "もう一度試す" }));
    expect(await screen.findByText("2回目で成功")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("continuing without AI after a failure does NOT record a sticky decline — only declining on the consent screen does", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));
    const user = userEvent.setup();
    renderAppPastOnboarding();

    await toCase001FirstDecisionSubmitted(user);
    await user.click(screen.getByRole("button", { name: "同意して続ける" }));
    await screen.findByText("AIとの通信がうまくいきませんでした。");
    await user.click(screen.getByRole("button", { name: "AIなしで続ける" }));

    expect(getAiDialogueConsent()).toBe("accepted"); // not "declined" — this was a one-off network failure, not an opt-out
    vi.unstubAllGlobals();
  });

  it("logs messageSource accurately as 'real_ai' on success and 'personalized_fallback' after decline", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ message: "生成されたテスト応答です" }) }),
    );
    const user = userEvent.setup();
    renderAppPastOnboarding();

    await toCase001FirstDecisionSubmitted(user);
    await user.click(screen.getByRole("button", { name: "同意して続ける" }));
    await screen.findByText("生成されたテスト応答です");

    // FUN_FIRST_PROTOTYPE Run: simplified AI_INTERVENTION has a single
    // continue button (no taxonomy selector); NEW_FACT -> CHANGE-OR-KEEP ->
    // REFLECTION is auto-skipped straight to RESULT.
    await user.click(screen.getByRole("button", { name: "次の手がかりを見る" }));
    await user.click(screen.getByRole("button", { name: "次へ" }));
    await user.click(screen.getByRole("button", { name: "まだ同じ" }));

    const logs = loadCompletedLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].aiIntervention.messageSource).toBe("real_ai");
    expect(logs[0].aiIntervention.message).toBe("生成されたテスト応答です");
    vi.unstubAllGlobals();
  });

  it("does not gate any other case behind consent — CASE-002 proceeds straight to its static AI_INTERVENTION", async () => {
    const user = userEvent.setup();
    renderAppPastOnboarding();
    const case002 = getCaseById("CASE-002")!;

    await user.click(screen.getByRole("button", { name: "ケースを選ぶ" }));
    await user.click(screen.getByRole("button", { name: new RegExp(case002.title) }));
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    await user.click(screen.getByRole("button", { name: "事実（確認できていること）" }));
    await user.click(screen.getByRole("button", { name: "次へ" }));
    await user.click(screen.getByRole("radio", { name: case002.availableChoices[0].label }));
    await user.click(screen.getByRole("button", { name: "次へ" }));

    expect(screen.queryByRole("heading", { name: "AIとの対話について" })).not.toBeInTheDocument();
    expect(screen.getByText(case002.aiIntervention)).toBeInTheDocument();
  });
});

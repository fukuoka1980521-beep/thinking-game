import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { markOnboardingSeen } from "../src/lib/onboarding";
import { getAiDialogueConsent } from "../src/lib/aiDialogueConsent";
import { getCaseById } from "../src/data/cases";

// V0_7 DISCOVER finding: `DIALOGUE_ENDPOINT_URL` is genuinely non-empty in this working tree --
// Owner has since linked billing and the `dialogue` Cloud Function is deployed and ACTIVE (verified
// via `gcloud functions describe` / `gcloud billing projects describe`, see the V0.7 Owner report).
// This file's whole point is "what happens when there's no endpoint", which is no longer this
// working tree's ambient state -- so it now mocks an empty URL explicitly, the same way
// tests/aiDialogueGate.test.tsx mocks a non-empty one, instead of relying on the real (variable)
// value. That was also the fix for this suite's long-standing "known baseline failure" (V0.5/V0.6
// reports): the test was failing because the real URL WAS live, not because of anything V0.5/V0.6 broke.
vi.mock("../src/lib/aiDialogueClient", async () => {
  const actual = await vi.importActual<typeof import("../src/lib/aiDialogueClient")>("../src/lib/aiDialogueClient");
  return { ...actual, DIALOGUE_ENDPOINT_URL: "" };
});

const case001 = getCaseById("CASE-001")!;

/**
 * REAL_AI_DIALOGUE Run Section 28: when `DIALOGUE_ENDPOINT_URL` is "" (no endpoint configured --
 * e.g. a fresh checkout before Owner's billing/deploy step, or a committed build where the temp
 * local-test URL has been reverted): no consent screen, no doomed network call, straight to the
 * same local fallback dialogue every player already saw before the real-AI Run existed.
 * (tests/aiDialogueGate.test.tsx covers the consent/loading/success/failure machinery once an
 * endpoint is configured, via a mocked non-empty DIALOGUE_ENDPOINT_URL.)
 */
describe("AI dialogue gate with no endpoint configured (current deployment state)", () => {
  it("never shows the consent screen and never calls fetch -- goes straight to the local fallback message", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const user = userEvent.setup();
    markOnboardingSeen();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "ケースを選ぶ" }));
    await user.click(screen.getByRole("button", { name: new RegExp(case001.title) }));
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    // FUN_FIRST_PROTOTYPE Run: OBSERVED_FACT is auto-skipped for CASE-001 (simplifiedFlow).
    await user.click(screen.getByRole("radio", { name: case001.availableChoices[0].label }));
    await user.click(screen.getByRole("button", { name: "次へ" }));

    expect(screen.queryByRole("heading", { name: "AIとの対話について" })).not.toBeInTheDocument();
    expect(
      screen.getByText(`あなたは「${case001.availableChoices[0].label}」を選びましたね。`, { exact: false }),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(getAiDialogueConsent()).toBeNull(); // never asked, because there is nothing to ask about yet
    vi.unstubAllGlobals();
  });
});

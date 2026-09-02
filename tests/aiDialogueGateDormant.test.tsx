import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { markOnboardingSeen } from "../src/lib/onboarding";
import { getAiDialogueConsent } from "../src/lib/aiDialogueConsent";
import { getCaseById } from "../src/data/cases";

const case001 = getCaseById("CASE-001")!;

/**
 * REAL_AI_DIALOGUE Run Section 28: `DIALOGUE_ENDPOINT_URL` is "" in the
 * actual deployed build until the Cloud Function goes live (pending Owner
 * billing setup, see docs/DECISIONS.md). This file proves the CURRENT, real
 * deployment behavior with nothing mocked: no consent screen, no doomed
 * network call, straight to the same local fallback dialogue every player
 * already saw before this Run existed. (tests/aiDialogueGate.test.tsx
 * covers the consent/loading/success/failure machinery once an endpoint is
 * configured, via a mocked DIALOGUE_ENDPOINT_URL.)
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

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { CASES } from "../src/data/cases";
import { hasSeenOnboarding, markOnboardingSeen } from "../src/lib/onboarding";
import { loadMetricEvents } from "../src/lib/metrics";
import { appendCompletedLog } from "../src/lib/storage";
import type { TrajectoryLog } from "../src/types/log";

// COMPREHENSION CLEANUP Run Section 18: none of these thinking-strategy or
// case-content words may appear before a case has started.
const BANNED_PRIMING_PHRASES = [
  "事実と解釈",
  "因果関係",
  "罠",
  "トラップ",
  "AIの間違い",
  "AIを疑う",
  "AIは常に正しいとは限りません",
  "検証するのが大切",
  "判断できないのが正しい",
  "正しい答えを選びましょう",
  "証拠を確認しましょう",
];

function makeLegacyLog(): TrajectoryLog {
  return {
    sessionId: "sess-legacy",
    caseId: "CASE-001",
    caseType: "TRAINING",
    level: 1,
    timestamp: new Date().toISOString(),
    factOrder: ["situation", "new_fact"],
    playRunId: "run-legacy",
    characterOffered: ["DETECTIVE"],
    characterUsed: "DETECTIVE",
    characterChoiceAvailable: false,
    firstDecision: { choiceId: "a", confidence: 50, reason: "", factCheckAnswer: "fact", infoOptionsSelected: [] },
    aiIntervention: { message: "m", utteranceType: "QUESTION", calibrationEligible: false, playerAction: null, problemTypeSelected: "NONE", freeText: "" },
    newEvidence: ["fact"],
    secondDecision: { choiceId: "a", confidence: 50, reason: "" },
    decisionChanged: false,
    confidenceChange: 0,
    reflectionNote: "",
    rubricResult: {
      rubricVersion: "1.0.0",
      observationCorrect: true,
      criticalErrorMade: false,
      infoOptionsConsidered: 0,
      infoOptionsMatchedGroundTruth: 0,
      updateAppropriateness: "appropriate_keep",
      aiCalibration: "not_applicable",
      trapDetection: { applicable: false, groundTruthType: "NONE", playerSelectedType: null, correctDetection: false },
    },
    experimentGroup: "CONTROL_NO_AB_TEST_V0",
    transferTarget: "",
    abilityObservations: { observationCorrect: true, hypothesisConsidered: false, falsificationConsidered: false, updatingEngaged: false },
    completed: true,
  };
}

describe("first-play onboarding (Section 3/4/19)", () => {
  it("shows onboarding before the very first case, on a fresh profile", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(hasSeenOnboarding()).toBe(false);
    await user.click(screen.getByRole("button", { name: "今日の1問" }));

    expect(screen.getByRole("heading", { name: "あそびかた" })).toBeInTheDocument();
  });

  it("contains no thinking-strategy or case-content priming phrases", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await user.click(screen.getByRole("button", { name: "今日の1問" }));

    const text = container.textContent ?? "";
    for (const phrase of BANNED_PRIMING_PHRASES) {
      expect(text).not.toContain(phrase);
    }
  });

  it("proceeds to the requested case's CASE_INTRO after 完了, and marks onboarding seen", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "今日の1問" }));
    await user.click(screen.getByRole("button", { name: "はじめる" })); // onboarding's own button
    expect(hasSeenOnboarding()).toBe(true);
    // Now on CASE_INTRO — its own "はじめる" button starts the case itself.
    expect(screen.getByRole("button", { name: "はじめる" })).toBeInTheDocument();
  });

  it("records ONBOARDING_SHOWN then ONBOARDING_COMPLETE, without touching CASE_START/CASE_COMPLETE semantics", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "今日の1問" }));
    await user.click(screen.getByRole("button", { name: "はじめる" }));

    const events = loadMetricEvents();
    expect(events.map((e) => e.type)).toEqual(["ONBOARDING_SHOWN", "ONBOARDING_COMPLETE", "CASE_START"]);
  });

  it("does not show onboarding again once completed, for a second case afterward", async () => {
    // Exiting CASE_INTRO without finishing leaves a stale in-progress
    // session, so starting a different case triggers the real "discard
    // progress?" confirm — mock it, matching flow.test.tsx's precedent.
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "今日の1問" }));
    await user.click(screen.getByRole("button", { name: "はじめる" })); // completes onboarding
    // Now on CASE_INTRO for the first case; its back button exits to Home
    // without finishing the case.
    await user.click(screen.getByRole("button", { name: "戻る" }));
    expect(screen.getByText("思考整理ゲーム")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "ケースを選ぶ" }));
    await user.click(screen.getByRole("button", { name: new RegExp(CASES[1].title) }));
    expect(screen.queryByRole("heading", { name: "あそびかた" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "はじめる" })).toBeInTheDocument(); // landed on CASE_INTRO for case 1

    vi.restoreAllMocks();
  });

  it("cancelling onboarding via 戻る does not mark it seen", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "今日の1問" }));
    expect(screen.getByRole("heading", { name: "あそびかた" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "戻る" }));

    expect(hasSeenOnboarding()).toBe(false);
  });

  it("still shows onboarding once for a returning user with prior gameplay history but no onboarding flag (Section 4)", async () => {
    appendCompletedLog(makeLegacyLog());
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "今日の1問" }));
    expect(screen.getByRole("heading", { name: "あそびかた" })).toBeInTheDocument();
  });

  it("keeps onboarding state in its own storage key, separate from gameplay TrajectoryLog data", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "今日の1問" }));
    await user.click(screen.getByRole("button", { name: "はじめる" }));

    const onboardingRaw = localStorage.getItem("thinking-game:onboarding:v1");
    expect(onboardingRaw).not.toBeNull();
    const parsed = JSON.parse(onboardingRaw!);
    expect(parsed).not.toHaveProperty("caseId");
    expect(parsed).not.toHaveProperty("rubricResult");
  });

  it("skips onboarding entirely once markOnboardingSeen has already been called (existing helper contract)", async () => {
    markOnboardingSeen();
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "今日の1問" }));
    expect(screen.queryByRole("heading", { name: "あそびかた" })).not.toBeInTheDocument();
  });
});

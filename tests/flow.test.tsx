import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { CASES, getCaseById } from "../src/data/cases";
import { loadCompletedLogs, loadInProgressSession } from "../src/lib/storage";

const case001 = CASES[0]; // TRAINING
const case005 = getCaseById("CASE-005")!; // AI_CALIBRATION

async function goToCaseSelectAndOpen(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.click(screen.getByRole("button", { name: "ケースを選ぶ" }));
  await user.click(screen.getByRole("button", { name: new RegExp(title) }));
}

/** Drives one full case from CASE_INTRO through RESULT. */
async function playThroughCase(
  user: ReturnType<typeof userEvent.setup>,
  opts: {
    title: string;
    factAnswer: "事実（確認できていること）" | "解釈（推測・意見）";
    firstChoiceLabel: string;
    secondChoiceLabel: string;
    aiAction?: "採用する" | "検証する" | "保留する" | "拒否する";
    problemType: string;
  },
) {
  await goToCaseSelectAndOpen(user, opts.title);
  await user.click(screen.getByRole("button", { name: "はじめる" }));

  // OBSERVED_FACT
  await user.click(screen.getByRole("button", { name: opts.factAnswer }));
  await user.click(screen.getByRole("button", { name: "次へ" }));

  // FIRST_DECISION
  await user.click(screen.getByRole("radio", { name: opts.firstChoiceLabel }));
  await user.click(screen.getByRole("button", { name: "次へ" }));

  // AI_INTERVENTION
  if (opts.aiAction) {
    await user.click(screen.getByRole("radio", { name: opts.aiAction }));
  }
  await user.click(screen.getByRole("radio", { name: opts.problemType }));
  await user.click(screen.getByRole("button", { name: "次へ" }));

  // NEW_FACT
  await user.click(screen.getByRole("button", { name: "再判断する" }));

  // SECOND_DECISION
  await user.click(screen.getByRole("radio", { name: opts.secondChoiceLabel }));
  await user.click(screen.getByRole("button", { name: "次へ" }));

  // REFLECTION
  await user.click(screen.getByRole("button", { name: "結果を見る" }));
}

describe("full case flow (CASE-001, TRAINING)", () => {
  it("walks from HOME through RESULT and records a trajectory log", async () => {
    const user = userEvent.setup();
    render(<App />);

    await playThroughCase(user, {
      title: case001.title,
      factAnswer: "事実（確認できていること）",
      firstChoiceLabel: case001.availableChoices[0].label, // "a" — the critical-error choice
      secondChoiceLabel: case001.availableChoices[3].label, // "d" — evidence-supported choice
      problemType: "情報不足",
    });

    expect(screen.getByText("今回よかった点")).toBeInTheDocument();
    expect(screen.getByText("確認したい点")).toBeInTheDocument();
    expect(screen.getByText("次回のテーマ")).toBeInTheDocument();
    expect(screen.queryByText(/正解|不正解/)).not.toBeInTheDocument();

    const logs = loadCompletedLogs();
    expect(logs).toHaveLength(1);
    const log = logs[0];
    expect(log.caseId).toBe(case001.caseId);
    expect(log.decisionChanged).toBe(true);
    expect(log.rubricResult.criticalErrorMade).toBe(true); // first choice was "a"
    expect(log.rubricResult.updateAppropriateness).toBe("appropriate_update"); // moved a -> d
    expect(log.rubricResult.aiCalibration).toBe("not_applicable"); // TRAINING case, no AI claim
    expect(loadInProgressSession()).toBeNull();

    await user.click(screen.getByRole("button", { name: "成長を見る" }));
    await user.click(screen.getByRole("button", { name: /全期間/ }));
    const observationRow = screen.getByText(/OBSERVATION/).closest(".growth-row") as HTMLElement;
    expect(within(observationRow).getByText("1 / 1 cases")).toBeInTheDocument();
  });

  it("preserves entered data when navigating back", async () => {
    const user = userEvent.setup();
    render(<App />);

    await goToCaseSelectAndOpen(user, case001.title);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    await user.click(screen.getByRole("button", { name: "事実（確認できていること）" }));
    await user.click(screen.getByRole("button", { name: "次へ" }));

    await user.click(screen.getByRole("radio", { name: case001.availableChoices[0].label }));
    await user.type(screen.getByLabelText("そう考えた理由（任意）"), "残ってほしい理由");
    await user.click(screen.getByRole("button", { name: "次へ" }));

    expect(screen.getByText(case001.aiIntervention)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "戻る" }));

    expect(screen.getByDisplayValue("残ってほしい理由")).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: case001.availableChoices[0].label }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("resumes an in-progress session after a simulated reload", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await goToCaseSelectAndOpen(user, case001.title);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    await user.click(screen.getByRole("button", { name: "事実（確認できていること）" }));
    await user.click(screen.getByRole("button", { name: "次へ" }));
    await user.click(screen.getByRole("radio", { name: case001.availableChoices[0].label }));
    await user.click(screen.getByRole("button", { name: "次へ" }));
    expect(screen.getByText(case001.aiIntervention)).toBeInTheDocument();

    unmount();

    render(<App />);
    expect(await screen.findByRole("button", { name: "続きから再開する" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "続きから再開する" }));
    expect(screen.getByText(case001.aiIntervention)).toBeInTheDocument();
  });

  it("does not mix data between cases when switching mid-session", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<App />);

    const case002 = CASES[1];

    await goToCaseSelectAndOpen(user, case001.title);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    await user.click(screen.getByRole("button", { name: "事実（確認できていること）" }));
    await user.click(screen.getByRole("button", { name: "次へ" }));
    await user.click(screen.getByRole("radio", { name: case001.availableChoices[0].label }));
    await user.type(screen.getByLabelText("そう考えた理由（任意）"), "CASE-001の理由");

    await user.click(screen.getByRole("button", { name: "戻る" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));
    await goToCaseSelectAndOpen(user, case002.title);

    expect(screen.getByText(case002.initialSituation[0])).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    expect(screen.queryByDisplayValue("CASE-001の理由")).not.toBeInTheDocument();

    vi.restoreAllMocks();
  });
});

describe("full case flow (CASE-005, AI_CALIBRATION)", () => {
  it("shows the structured AI-action controls and records a calibration label", async () => {
    const user = userEvent.setup();
    render(<App />);

    await playThroughCase(user, {
      title: case005.title,
      factAnswer: "解釈（推測・意見）",
      firstChoiceLabel: case005.availableChoices[2].label, // "c" — already evidence-aligned
      secondChoiceLabel: case005.availableChoices[2].label,
      aiAction: "拒否する",
      problemType: "因果関係の混同",
    });

    expect(screen.getByText("今回よかった点")).toBeInTheDocument();
    // CASE-005 always shows its trap explanation in RESULT.
    expect(screen.getByText(case005.aiTrap.explanation!)).toBeInTheDocument();

    const logs = loadCompletedLogs();
    expect(logs).toHaveLength(1);
    const log = logs[0];
    expect(log.aiIntervention.playerAction).toBe("REJECT");
    expect(log.rubricResult.aiCalibration).toBe("appropriate_rejection");
    expect(log.rubricResult.trapDetection.correctDetection).toBe(true);
    expect(log.rubricResult.updateAppropriateness).toBe("appropriate_keep");
  });

  it("requires an AI-action selection (not just a problem-type selection) before proceeding", async () => {
    const user = userEvent.setup();
    render(<App />);

    await goToCaseSelectAndOpen(user, case005.title);
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    await user.click(screen.getByRole("button", { name: "解釈（推測・意見）" }));
    await user.click(screen.getByRole("button", { name: "次へ" }));
    await user.click(screen.getByRole("radio", { name: case005.availableChoices[0].label }));
    await user.click(screen.getByRole("button", { name: "次へ" }));

    // Only select the problem type, not an AI action.
    await user.click(screen.getByRole("radio", { name: "根拠不足" }));
    expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
  });
});

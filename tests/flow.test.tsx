import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { CASES } from "../src/data/cases";
import { loadCompletedLogs, loadInProgressSession } from "../src/lib/storage";

const case001 = CASES[0];

async function goToCaseSelectAndOpen(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.click(screen.getByRole("button", { name: "ケースを選ぶ" }));
  await user.click(screen.getByRole("button", { name: new RegExp(title) }));
}

async function fillFirstDecision(
  user: ReturnType<typeof userEvent.setup>,
  choiceLabel: string,
  factAnswerLabel: string,
) {
  await user.click(screen.getByRole("radio", { name: choiceLabel }));
  await user.type(screen.getByLabelText("そう考えた理由"), "テストの理由です");
  await user.click(screen.getByRole("button", { name: factAnswerLabel }));
  await user.click(screen.getByRole("button", { name: "次へ" }));
}

describe("full case flow (CASE-001)", () => {
  it("walks from HOME through RESULT and records a completed log", async () => {
    const user = userEvent.setup();
    render(<App />);

    await goToCaseSelectAndOpen(user, case001.title);

    expect(screen.getByText(case001.initialSituation[0])).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "はじめる" }));

    expect(screen.getByText(case001.initialQuestion)).toBeInTheDocument();
    await fillFirstDecision(
      user,
      case001.availableChoices[0].label,
      "事実（確認できていること）",
    );

    expect(screen.getByText(case001.aiIntervention)).toBeInTheDocument();
    await user.type(screen.getByLabelText(case001.falsificationPrompt), "反対の可能性です");
    await user.click(screen.getByRole("button", { name: "次へ" }));

    expect(screen.getByText(case001.newFacts[0])).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "再判断する" }));

    expect(screen.getByText(case001.finalQuestion)).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: case001.availableChoices[1].label }));
    await user.type(screen.getByLabelText("そう考えた理由"), "新情報を受けての理由です");
    await user.click(screen.getByRole("button", { name: "次へ" }));

    expect(screen.getByText(/確信度/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "結果を見る" }));

    expect(screen.getByText("今回よかった点")).toBeInTheDocument();
    expect(screen.getByText("確認したい点")).toBeInTheDocument();
    expect(screen.getByText("次回のテーマ")).toBeInTheDocument();
    expect(screen.queryByText(/正解|不正解/)).not.toBeInTheDocument();

    const logs = loadCompletedLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].caseId).toBe(case001.caseId);
    expect(logs[0].decisionChanged).toBe(true);
    expect(loadInProgressSession()).toBeNull();

    await user.click(screen.getByRole("button", { name: "成長を見る" }));
    const allTimeTab = screen.getByRole("button", { name: /全期間/ });
    await user.click(allTimeTab);
    expect(within(screen.getByText(/OBSERVATION/).closest(".growth-row")!).getByText("1 / 1 cases")).toBeInTheDocument();
  });

  it("preserves entered data when navigating back", async () => {
    const user = userEvent.setup();
    render(<App />);

    await goToCaseSelectAndOpen(user, case001.title);
    await user.click(screen.getByRole("button", { name: "はじめる" }));

    await user.click(screen.getByRole("radio", { name: case001.availableChoices[0].label }));
    await user.type(screen.getByLabelText("そう考えた理由"), "残ってほしい理由");
    await user.click(screen.getByRole("button", { name: "事実（確認できていること）" }));
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
    await fillFirstDecision(
      user,
      case001.availableChoices[0].label,
      "事実（確認できていること）",
    );
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
    await user.click(screen.getByRole("radio", { name: case001.availableChoices[0].label }));
    await user.type(screen.getByLabelText("そう考えた理由"), "CASE-001の理由");

    await user.click(screen.getByRole("button", { name: "戻る" }));
    await user.click(screen.getByRole("button", { name: "戻る" }));
    await goToCaseSelectAndOpen(user, case002.title);

    expect(screen.getByText(case002.initialSituation[0])).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    expect(screen.queryByDisplayValue("CASE-001の理由")).not.toBeInTheDocument();

    vi.restoreAllMocks();
  });
});

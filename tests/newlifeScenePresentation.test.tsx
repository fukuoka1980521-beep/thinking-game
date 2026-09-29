import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { setNewLifeAiDialogueConsent } from "../src/newlife/semantic/consent";

beforeEach(() => {
  localStorage.clear();
  setNewLifeAiDialogueConsent("declined");
});

describe("NEW LIFE authored-scene presentation", () => {
  it("does not show a low-engagement hook before the player has actually been inactive", async () => {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Day 1から始める" }));
    await user.click(screen.getByRole("button", { name: "次の日へ" }));
    await user.click(screen.getByRole("button", { name: "次の日へ" }));

    expect(screen.getByText(/会館前が混んだら、そっちで何人か待たせてもらえる/)).toBeInTheDocument();
    expect(screen.queryByText(/お願いを受けてもらったって書いていいのかしら/)).not.toBeInTheDocument();
    expect(screen.queryByText(/見ているだけでも記録にはなる/)).not.toBeInTheDocument();
  });

  it("shows a situation guide for Day 3 before the player starts talking", async () => {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Day 1から始める" }));
    await user.click(screen.getByRole("button", { name: "次の日へ" }));
    await user.click(screen.getByRole("button", { name: "次の日へ" }));

    const guide = screen.getByLabelText("いまの状況");
    expect(guide).toHaveTextContent("いま何が問題？");
    expect(guide).toHaveTextContent("客がどこで待つか");
    expect(guide).toHaveTextContent("今ここで決めたいこと");
    expect(guide).toHaveTextContent("何人まで");
    expect(guide).toHaveTextContent("誰が決める？");
    expect(guide).toHaveTextContent("美代子");
  });
});

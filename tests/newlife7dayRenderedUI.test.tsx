import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

type U = ReturnType<typeof userEvent.setup>;

function start() {
  window.history.pushState({}, "", "/?newlife7day=1");
  render(<App />);
}

async function goHome(user: U) {
  await user.click(await screen.findByText(/立ち去る/));
  await user.click(await screen.findByText(/仮住まいへ戻る/));
}

describe("NEW LIFE 7-day slice: Day 1 + Day 2 vertical slice (PHASE_22)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("Day 1 arrival shows the move-in line and both destinations reachable, no free talk required", async () => {
    start();
    expect(await screen.findByText(/運び込んだ荷物/)).toBeInTheDocument();
    expect(await screen.findByText("洋平商店へ行く")).toBeInTheDocument();
    expect(await screen.findByText("商店街へ行く")).toBeInTheDocument();
  });

  it("no-free-talk path: visiting Yohei, taking a structural action, and leaving works with zero AI-generated text", async () => {
    const user = userEvent.setup();
    start();
    await user.click(await screen.findByText("洋平商店へ行く"));
    expect(await screen.findByText(/今朝来るはずの荷物/)).toBeInTheDocument();
    await user.click(await screen.findByText("買い物をする"));
    expect(await screen.findByText(/野菜をいくつか袋に入れて/)).toBeInTheDocument();
    await goHome(user);
    expect(await screen.findByText(/仮住まい/)).toBeInTheDocument();
  });

  it("Hina-first path is fully valid and never forces a Yohei visit", async () => {
    const user = userEvent.setup();
    start();
    await user.click(await screen.findByText("商店街へ行く"));
    expect(await screen.findByText(/まだ全然片付いてなくて/)).toBeInTheDocument();
    await user.click(await screen.findByText("様子を見る"));
    expect(await screen.findByText(/焼き菓子の型/)).toBeInTheDocument();
  });

  it("spends the 2-action budget across two destinations and blocks a 3rd visit", async () => {
    const user = userEvent.setup();
    start();
    await user.click(await screen.findByText("洋平商店へ行く"));
    await user.click(await screen.findByText("買い物をする"));
    await goHome(user);
    await user.click(await screen.findByText("商店街へ行く"));
    await user.click(await screen.findByText("様子を見る"));
    await goHome(user);
    expect(screen.queryByText("洋平商店へ行く")).not.toBeInTheDocument();
    expect(screen.queryByText("商店街へ行く")).not.toBeInTheDocument();
    expect(await screen.findByText("今日はもう休む(翌日へ)")).toBeInTheDocument();
  });

  it("event-engage path: keeping an eye out on Day 1 gets a personalized Day 2 acknowledgment from Yohei", async () => {
    const user = userEvent.setup();
    start();
    await user.click(await screen.findByText("洋平商店へ行く"));
    await user.click(await screen.findByText("配達のことを気にかけておく"));
    expect(await screen.findByText(/分かった、気にかけとくよ/)).toBeInTheDocument();
    await goHome(user);
    await user.click(await screen.findByText("今日はもう休む(翌日へ)"));
    await user.click(await screen.findByText("洋平商店へ行く"));
    expect(await screen.findByText(/お前が気にしてくれてたやつ、届いたよ/)).toBeInTheDocument();
  });

  it("event-ignore path: never visiting Yohei on Day 1 still shows the delivery resolved, generically, on Day 2", async () => {
    const user = userEvent.setup();
    start();
    await user.click(await screen.findByText("商店街へ行く"));
    await user.click(await screen.findByText("様子を見る"));
    await goHome(user);
    await user.click(await screen.findByText("今日はもう休む(翌日へ)"));
    await user.click(await screen.findByText("洋平商店へ行く"));
    expect(await screen.findByText(/さっきの荷物、さっき届いたよ/)).toBeInTheDocument();
  });

  it("regression: meeting Hina for the first time ever on Day 2 (never visited on Day 1) does not read as a return visit", async () => {
    const user = userEvent.setup();
    start();
    await user.click(await screen.findByText("洋平商店へ行く"));
    await user.click(await screen.findByText("買い物をする"));
    await goHome(user);
    await user.click(await screen.findByText("今日はもう休む(翌日へ)"));
    await user.click(await screen.findByText("商店街へ行く"));
    expect(screen.queryByText(/また来てくれたんですね/)).not.toBeInTheDocument();
    expect(await screen.findByText(/昨日より少しだけ、形になってきた気がします/)).toBeInTheDocument();
  });

  it("reaches the end of the slice on Day 2 without any Day 3 option ever appearing", async () => {
    const user = userEvent.setup();
    start();
    await user.click(await screen.findByText("今日はもう休む(翌日へ)"));
    expect(await screen.findByText(/二日目の朝/)).toBeInTheDocument();
    await user.click(await screen.findByText("今日はもう休む"));
    expect(await screen.findByText(/体験版はここで終わりです/)).toBeInTheDocument();
    expect(screen.queryByText("洋平商店へ行く")).not.toBeInTheDocument();
    expect(screen.queryByText("商店街へ行く")).not.toBeInTheDocument();
  });
});

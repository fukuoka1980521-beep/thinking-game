import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

function actionButtonTestIds(container: HTMLElement): string[] {
  const actions = container.querySelector('[data-testid="playable11-actions"]');
  if (!actions) return [];
  return Array.from(actions.querySelectorAll("button")).map((b) => b.getAttribute("data-testid") ?? "");
}

describe("PHASE 11.13: real ?newlifeplayable11=1 render, product-repaired through the real gates", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("initial screen: 5 real rendered buttons (directive Section 9's expected maximum) -- weather and sales both absent", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    const { container } = render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("playable11-begin"));

    const ids = actionButtonTestIds(container);
    expect(ids).toEqual(["playable11-accept", "playable11-decline", "playable11-ask-what", "playable11-ask-festival", "playable11-leave"]);
    expect(ids).not.toContain("playable11-ask-weather");
    expect(ids).not.toContain("playable11-ask-sales");
  });

  it("ASK_WHAT does not reveal festival/towel identity, and disappears from the action list once answered", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    const { container } = render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("playable11-begin"));
    await user.click(await screen.findByTestId("playable11-ask-what"));

    const yoheiLine = await screen.findByTestId("playable11-yohei-line");
    expect(yoheiLine.textContent).not.toMatch(/祭り/);
    expect(yoheiLine.textContent).not.toMatch(/手ぬぐい/);
    expect(yoheiLine.textContent).toMatch(/箱/);

    const ids = actionButtonTestIds(container);
    expect(ids).not.toContain("playable11-ask-what");
  });

  it("ASK_FESTIVAL unlocks the contextual ASK_SALES follow-up -- absent before, present after", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    const { container } = render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("playable11-begin"));
    expect(actionButtonTestIds(container)).not.toContain("playable11-ask-sales");

    await user.click(await screen.findByTestId("playable11-ask-festival"));
    expect(actionButtonTestIds(container)).toContain("playable11-ask-sales");
  });

  it("after ACCEPT: the physical reveal is narrated, the leftover-stock follow-up NOW renders (real counterfactual causality gate passes on the repaired content), and the resolved-request ASK_WHAT is gone", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    const { container } = render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("playable11-begin"));
    await user.click(await screen.findByTestId("playable11-accept"));

    const log = screen.getByTestId("playable11-log");
    expect(log.textContent).toMatch(/手ぬぐい/); // the reveal itself: towels become visible
    expect(log.textContent).not.toMatch(/祭りの残り/); // but NOT yet confirmed as festival leftover

    const ids = actionButtonTestIds(container);
    expect(ids).toContain("playable11-ask-leftover");
    expect(ids).not.toContain("playable11-ask-what");
    expect(ids).not.toContain("playable11-ask-weather");
  });

  it("asking the new contextual question after ACCEPT genuinely answers something new (festival leftover confirmed, using the real captured Vertex line)", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("playable11-begin"));
    await user.click(await screen.findByTestId("playable11-accept"));
    await user.click(await screen.findByTestId("playable11-ask-leftover"));

    const yoheiLine = await screen.findByTestId("playable11-yohei-line");
    expect(yoheiLine.textContent).toMatch(/祭りの残り/);
  });

  it("DECLINE produces a distinct Yohei social-response line, separate from the independent world-continuity line, and removes the resolved request-dependent action", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    const { container } = render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("playable11-begin"));
    await user.click(await screen.findByTestId("playable11-decline"));

    const log = screen.getByTestId("playable11-log");
    expect(log.textContent).toContain("「ごめん、今日はちょっと」と、答えた。");
    expect(log.textContent).toContain("「ああ、分かった。じゃあ俺でやるよ」と、洋平は言った。");

    const worldContinuity = screen.getByTestId("playable11-world-continuity");
    expect(worldContinuity.textContent).toContain("洋平は、一人で値引き用の棚の準備を続けている。");
    expect(worldContinuity.textContent).not.toContain("分かった、じゃあ俺でやるよ");

    const ids = actionButtonTestIds(container);
    expect(ids).not.toContain("playable11-ask-what");
    expect(ids).toEqual(["playable11-ask-festival", "playable11-leave"]);
  });

  it("primary player surface never renders the Vertex/replay disclosure sentence, before OR after any action, whether the debug panel is open or closed", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("playable11-begin"));
    expect(screen.queryByText(/Vertex AI/)).not.toBeInTheDocument();

    await user.click(await screen.findByTestId("playable11-ask-what"));
    expect(screen.queryByText(/Vertex AI/)).not.toBeInTheDocument();

    await user.click(await screen.findByTestId("playable11-debug-toggle"));
    const debugPanel = await screen.findByTestId("playable11-debug-panel");
    expect(within(debugPanel).getByText(/Vertex AI/)).toBeInTheDocument();
    const primarySurface = screen.getByTestId("playable11-actions");
    expect(within(primarySurface).queryByText(/Vertex AI/)).not.toBeInTheDocument();
  });

  it("QA probe evidence and causal-unlock verdict remain visible in the debug/evidence surface", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("playable11-begin"));
    await user.click(await screen.findByTestId("playable11-debug-toggle"));

    const evidence = await screen.findByTestId("playable11-debug-product-surface-evidence");
    expect(evidence.textContent).toMatch(/ASK_WEATHER_SCENE/);
    expect(evidence.textContent).toMatch(/QA/);
  });

  it("visual hierarchy: primary decision buttons and the leave button carry distinct CSS classes from ordinary conversation buttons", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("playable11-begin"));

    expect(screen.getByTestId("playable11-accept").className).toMatch(/pw11-primary/);
    expect(screen.getByTestId("playable11-decline").className).toMatch(/pw11-primary/);
    expect(screen.getByTestId("playable11-ask-festival").className).toMatch(/pw11-secondary/);
    expect(screen.getByTestId("playable11-leave").className).toMatch(/pw11-leave/);
  });
});

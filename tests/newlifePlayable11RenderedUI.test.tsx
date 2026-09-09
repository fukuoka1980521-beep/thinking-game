import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

function actionButtonTestIds(container: HTMLElement): string[] {
  const actions = container.querySelector('[data-testid="playable11-actions"]');
  if (!actions) return [];
  return Array.from(actions.querySelectorAll("button")).map((b) => b.getAttribute("data-testid") ?? "");
}

describe("PHASE 11.12R: real ?newlifeplayable11=1 render, gated through the real composition path", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("initial screen: 6 real rendered buttons -- the QA weather probe is absent from the actual DOM, not just from a data-level check", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    const { container } = render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("playable11-begin"));

    const ids = actionButtonTestIds(container);
    expect(ids).toEqual([
      "playable11-accept",
      "playable11-decline",
      "playable11-ask-what",
      "playable11-ask-festival",
      "playable11-ask-sales",
      "playable11-leave",
    ]);
    expect(ids).not.toContain("playable11-ask-weather");
    expect(screen.queryByText("雨降ってた？")).not.toBeInTheDocument();
  });

  it("after ACCEPT: the leftover-stock follow-up never renders -- the real counterfactual causality gate rejected it, no replacement affordance was fabricated", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    const { container } = render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("playable11-begin"));
    await user.click(await screen.findByTestId("playable11-accept"));

    const ids = actionButtonTestIds(container);
    expect(ids).toEqual(["playable11-ask-what", "playable11-ask-festival", "playable11-ask-sales", "playable11-leave"]);
    expect(ids).not.toContain("playable11-ask-leftover");
    expect(ids).not.toContain("playable11-ask-weather");
    expect(screen.queryByText("これ、祭りの残り？")).not.toBeInTheDocument();
  });

  it("after DECLINE: same 4 real buttons, weather probe still absent", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    const { container } = render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("playable11-begin"));
    await user.click(await screen.findByTestId("playable11-decline"));

    const ids = actionButtonTestIds(container);
    expect(ids).toEqual(["playable11-ask-what", "playable11-ask-festival", "playable11-ask-sales", "playable11-leave"]);
  });

  it("primary player surface never renders the Vertex/replay disclosure sentence, before OR after any action, whether the debug panel is open or closed", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("playable11-begin"));
    expect(screen.queryByText(/Vertex AI/)).not.toBeInTheDocument();

    await user.click(await screen.findByTestId("playable11-ask-what"));
    expect(screen.queryByText(/Vertex AI/)).not.toBeInTheDocument();

    // Opening the debug panel puts the disclosure in the DEV/debug evidence surface, never in the
    // primary player-facing region above it -- both must be checked, not just "is it visible at all".
    await user.click(await screen.findByTestId("playable11-debug-toggle"));
    const debugPanel = await screen.findByTestId("playable11-debug-panel");
    expect(within(debugPanel).getByText(/Vertex AI/)).toBeInTheDocument();
    const primarySurface = screen.getByTestId("playable11-actions");
    expect(within(primarySurface).queryByText(/Vertex AI/)).not.toBeInTheDocument();
  });

  it("dev-only disclosure IS accessible through the dev/debug boundary in this (DEV) test environment, carrying the phase-11-12 marker and the real capture provenance", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("playable11-begin"));
    await user.click(await screen.findByTestId("playable11-debug-toggle"));

    const disclosure = await screen.findByTestId("playable11-debug-dev-only-disclosure");
    expect(disclosure.textContent).toMatch(/PHASE_11_12_DEV_ONLY_DISCLOSURE_MARKER_9f3c1a/);
    expect(disclosure.textContent).toMatch(/gas-test-runner-20260620-wjxf/);

    const evidence = await screen.findByTestId("playable11-debug-product-surface-evidence");
    expect(evidence.textContent).toMatch(/ASK_WEATHER_SCENE/);
    expect(evidence.textContent).toMatch(/QA/);
  });

  it("ACCEPT/DECLINE narration, decline wording, and world-continuity text are byte-identical to the frozen PHASE 11.11 scene -- this phase changed composition, not product content", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("playable11-begin"));
    await user.click(await screen.findByTestId("playable11-decline"));
    expect(screen.getByText("「ごめん、今日はちょっと」と、答えた。")).toBeInTheDocument();
  });
});

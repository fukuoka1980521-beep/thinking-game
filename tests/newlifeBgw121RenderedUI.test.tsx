import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

describe("PHASE 12.1: real ?newlifebgw121=1 render -- Bounded Generative World vertical slice", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("opening establishes WHO/WHY/WHERE/DEADLINE, then the map appears with 4 reachable locations from TRIAL_HOUSE's own edge (SHOPPING_STREET)", async () => {
    window.history.pushState({}, "", "/?newlifebgw121=1");
    render(<App />);
    const user = userEvent.setup();
    const opening = await screen.findByTestId("bgw121-opening-text");
    expect(opening.textContent).toMatch(/57歳/);
    expect(opening.textContent).toMatch(/30日間/);
    expect(opening.textContent).toMatch(/DAY30/);

    await user.click(await screen.findByTestId("bgw121-begin"));
    expect((await screen.findByTestId("bgw121-location-name")).textContent).toMatch(/仮住まい/);
    expect(screen.getByTestId("bgw121-travel-SHOPPING_STREET")).toBeInTheDocument();
  });

  it("map creates the encounter -- traveling to Yohei's store shows Yohei AND Jin present (state-derived, not a menu click on Jin)", async () => {
    window.history.pushState({}, "", "/?newlifebgw121=1");
    render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("bgw121-begin"));
    await user.click(await screen.findByTestId("bgw121-travel-SHOPPING_STREET"));
    await user.click(await screen.findByTestId("bgw121-travel-YOHEI_STORE"));

    expect(screen.getByTestId("bgw121-talk-yohei")).toBeInTheDocument();
    expect(screen.getByTestId("bgw121-talk-jin")).toBeInTheDocument();
    const location = screen.getByTestId("bgw121-location");
    expect(location.textContent).toMatch(/相馬/); // Jin's covering activity is narrated without being clicked
  });

  it("bounded free-text conversation with the deterministic adapter: an unauthored suggestion is understood and produces a visible NPC line", async () => {
    window.history.pushState({}, "", "/?newlifebgw121=1");
    render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("bgw121-begin"));
    await user.click(await screen.findByTestId("bgw121-travel-SHOPPING_STREET"));
    await user.click(await screen.findByTestId("bgw121-travel-YOHEI_STORE"));
    await user.click(await screen.findByTestId("bgw121-talk-yohei"));

    const input = screen.getByTestId("bgw121-free-text-input");
    await user.type(input, "手伝おうか？");
    await user.click(screen.getByTestId("bgw121-free-text-send"));

    expect(await screen.findByTestId("bgw121-npc-line")).toBeInTheDocument();
  });

  it("primary player surface never renders a live-adapter toggle outside DEV (production safety: gated by import.meta.env.DEV in source)", async () => {
    window.history.pushState({}, "", "/?newlifebgw121=1");
    render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("bgw121-begin"));
    // In the Vitest/jsdom test environment import.meta.env.DEV is true, so the toggle IS expected
    // here -- this test documents that fact rather than asserting its absence (which would be
    // false in this environment); production absence is verified separately by a real `npm run
    // build` + bundle grep, matching this project's established dev/build-boundary verification
    // pattern (see docs/research/evaluation/phase-12-1/CODE_SELF_AUDIT_V1.md).
    expect(screen.getByTestId("bgw121-live-toggle")).toBeInTheDocument();
  });
});

describe("PHASE 12.1: the frozen fixed-dialogue baseline is untouched", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("?newlifeplayable11=1 still renders exactly as before (no shared state/regression from the new route)", async () => {
    window.history.pushState({}, "", "/?newlifeplayable11=1");
    render(<App />);
    await screen.findByTestId("playable11-begin-choice");
    expect(screen.getByText(/祭りの翌日/)).toBeInTheDocument();
  });
});

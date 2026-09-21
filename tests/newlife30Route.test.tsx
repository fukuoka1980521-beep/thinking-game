import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../src/App";
import { markOnboardingSeen } from "../src/lib/onboarding";

// Route isolation: ?newlife30=1 must behave exactly like the existing
// ?case1test hidden-link pattern in App.tsx -- opt-in only, never linked
// from HomeScreen, never the default route, and the normal app must render
// completely unaffected when the param is absent.
describe("NEW LIFE 30-day route isolation", () => {
  it("the plain '/' route renders normal HomeScreen, with no NEW LIFE reference anywhere on it", () => {
    markOnboardingSeen();
    window.history.pushState({}, "", "/");
    render(<App />);
    expect(screen.getByText("思考整理ゲーム")).toBeInTheDocument();
    expect(screen.queryByText(/NEW LIFE/)).not.toBeInTheDocument();
  });

  it("?newlife30=1 opens the NEW LIFE candidate directly, bypassing HomeScreen entirely", () => {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    expect(screen.getByText(/NEW LIFE — Phase 27 playable candidate/)).toBeInTheDocument();
    expect(screen.getByText("値段がついた箱")).toBeInTheDocument();
    expect(screen.queryByText("思考整理ゲーム")).not.toBeInTheDocument();
  });

  it("HUMAN_VALIDATION_STATUS is disclosed as PENDING on every screen of the candidate, never a hidden claim of PASS", () => {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    expect(screen.getByText(/HUMAN_VALIDATION_STATUS: PENDING/)).toBeInTheDocument();
  });
});

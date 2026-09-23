import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewLifeAiConsentPrompt } from "../src/newlife/semantic/NewLifeAiConsentPrompt";

describe("NewLifeAiConsentPrompt (Phase 30 instruction 12)", () => {
  it("clearly discloses that the player's free-text message is sent to an external AI service", () => {
    render(<NewLifeAiConsentPrompt onAccept={() => {}} onDecline={() => {}} />);
    expect(screen.getByText(/外部のAIサービスへ送信/)).toBeInTheDocument();
  });


  it("describes the minimized payload precisely and excludes action history/other NPC data", () => {
    render(<NewLifeAiConsentPrompt onAccept={() => {}} onDecline={() => {}} />);
    expect(screen.getByText(/話している相手（NPC）や現在の日数/)).toBeInTheDocument();
    expect(screen.getByText(/行動履歴や他のNPCの情報は送信されません/)).toBeInTheDocument();
  });

  it("discloses that declining keeps the game playable via the deterministic fallback", () => {
    render(<NewLifeAiConsentPrompt onAccept={() => {}} onDecline={() => {}} />);
    expect(screen.getByText(/同意しない場合も.*ゲームを続けられます/)).toBeInTheDocument();
  });

  it("calls onAccept only when the accept button is pressed", async () => {
    const onAccept = vi.fn();
    const onDecline = vi.fn();
    render(<NewLifeAiConsentPrompt onAccept={onAccept} onDecline={onDecline} />);
    await userEvent.click(screen.getByRole("button", { name: "同意して続ける" }));
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onDecline).not.toHaveBeenCalled();
  });

  it("calls onDecline only when the decline button is pressed", async () => {
    const onAccept = vi.fn();
    const onDecline = vi.fn();
    render(<NewLifeAiConsentPrompt onAccept={onAccept} onDecline={onDecline} />);
    await userEvent.click(screen.getByRole("button", { name: "AIなしで続ける" }));
    expect(onDecline).toHaveBeenCalledTimes(1);
    expect(onAccept).not.toHaveBeenCalled();
  });
});

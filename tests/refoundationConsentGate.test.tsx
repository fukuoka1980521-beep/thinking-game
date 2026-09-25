import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// This file exercises the consent-gating path of RefoundationApp.tsx (added
// alongside functions/newlife-refoundation-ai/) under a *mocked* non-empty
// endpoint -- the shipped default (`config.ts`'s
// NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL === ""`) never shows this screen at
// all, which tests/refoundationRoute.test.tsx already covers. Mocking the
// config module (rather than editing the shipped constant) lets this test
// prove the consent gate/live-adapter selection logic works correctly
// without actually deploying anything or making a real network call.
vi.mock("../src/newlife/refoundation/config", () => ({
  NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL: "https://example.test/newlife-refoundation-ai",
}));

import App from "../src/App";
import { markOnboardingSeen } from "../src/lib/onboarding";

async function openSlice() {
  markOnboardingSeen();
  window.history.pushState({}, "", "/?newlife-refoundation=1");
  render(<App />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "はじめる" }));
  return user;
}

describe("NEW LIFE refoundation — AI consent gate (endpoint configured)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the consent prompt instead of the play screen on first entry", async () => {
    await openSlice();
    expect(screen.getByText("AIによる会話について")).toBeInTheDocument();
    expect(screen.queryByText(/残り時間/)).not.toBeInTheDocument();
  });

  it("declining routes straight to the deterministic play screen and never calls fetch", async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const user = await openSlice();
    await user.click(screen.getByRole("button", { name: "同意しない（選択肢のみで進める）" }));
    expect(screen.getByText(/残り時間: 50 分/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "美香に何が変わったのか尋ねる" }));
    expect(await screen.findByText(/残り時間: 46 分/)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("accepting persists the refoundation-scoped consent key and does not re-prompt on remount", async () => {
    const user = await openSlice();
    await user.click(screen.getByRole("button", { name: "同意してAIを使う" }));
    expect(screen.getByText(/残り時間: 50 分/)).toBeInTheDocument();

    const stored = localStorage.getItem("thinking-game:newlife-refoundation-ai-consent:v1");
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored as string).status).toBe("accepted");

    // Remount: with consent already stored, the CONSENT phase must not reappear.
    window.history.pushState({}, "", "/?newlife-refoundation=1");
    render(<App />);
    const user2 = userEvent.setup();
    await user2.click(screen.getAllByRole("button", { name: "はじめる" }).slice(-1)[0]);
    expect(screen.queryAllByText("AIによる会話について")).toHaveLength(0);
  });

  it("accepting routes NPC-line generation through the live adapter (fetch is called) with a real request shape", async () => {
    const fetchSpy = vi.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      status: 200,
      json: async () => ({ npc: "MIKA", text: "……分かった、話す。" }),
    }));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const user = await openSlice();
    await user.click(screen.getByRole("button", { name: "同意してAIを使う" }));
    await user.click(screen.getByRole("button", { name: "美香に何が変わったのか尋ねる" }));

    expect(await screen.findByText(/分かった、話す/)).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://example.test/newlife-refoundation-ai",
      expect.objectContaining({ method: "POST" }),
    );
    const sentBody = JSON.parse((fetchSpy.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(sentBody.operation).toBe("generate_npc_line");
    expect(sentBody.projection.npc).toBe("MIKA");
  });

  it("a malformed live response still falls back safely and never crashes the turn", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ unexpected: "shape" }),
    })) as unknown as typeof fetch;

    const user = await openSlice();
    await user.click(screen.getByRole("button", { name: "同意してAIを使う" }));
    await user.click(screen.getByRole("button", { name: "美香に何が変わったのか尋ねる" }));

    // A malformed npc-line response resolves to the deterministic
    // per-relationship-state fallback line (generateNpcLine's own
    // contract) -- the turn still completes and time still advances.
    expect(await screen.findByText(/残り時間: 46 分/)).toBeInTheDocument();
  });

  it("free text routes through converse_turn (V37 §4), not interpret_turn, and shows the model's npcLine directly", async () => {
    const fetchSpy = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse((init as RequestInit).body as string);
      if (body.operation === "converse_turn") {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            npc: "MIKA",
            npcLine: "それなら、内容を変えるなら考えられます。",
            understoodPlayerMeaning: "代替案の有無を尋ねている。",
            candidateTurn: { action: "ASK_BOUNDARY", boundaryMode: "DISCOVER", relationalEvents: [], needsClarification: false },
            candidateFactRevealIds: [],
            candidateCommitments: [],
            uncertainty: "LOW",
            thoughtSupportSignal: false,
          }),
        };
      }
      throw new Error(`unexpected operation in this test: ${body.operation}`);
    });
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const user = await openSlice();
    await user.click(screen.getByRole("button", { name: "同意してAIを使う" }));
    await user.click(screen.getByRole("button", { name: "美香に話す" }));
    await user.type(screen.getByRole("textbox", { name: "自由入力" }), "台本じゃなく演出で隠せない？");
    await user.click(screen.getByRole("button", { name: "送る" }));

    expect(await screen.findByText("それなら、内容を変えるなら考えられます。")).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const sentBody = JSON.parse((fetchSpy.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(sentBody.operation).toBe("converse_turn");
    expect(sentBody.rawPlayerUtterance).toBe("台本じゃなく演出で隠せない？");
    expect(sentBody.targetNpc).toBe("MIKA");
    expect(Array.isArray(sentBody.recentDialogue)).toBe(true);
  });

  it("考えを整理する calls organize_thought and renders the result in a panel separate from character dialogue", async () => {
    const organizeThoughtCalls: unknown[] = [];
    const fetchSpy = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse((init as RequestInit).body as string);
      if (body.operation === "generate_npc_line") {
        return { ok: true, status: 200, json: async () => ({ npc: body.projection.npc, text: "……わかった。" }) };
      }
      organizeThoughtCalls.push(body);
      expect("npc" in body).toBe(false);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          known: ["17:30までに決める必要がある。"],
          possible: [],
          unknown: [],
          options: ["場面を短縮する"],
          nextCheck: "実話を外せば出演できるか確認する",
        }),
      };
    });
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const user = await openSlice();
    await user.click(screen.getByRole("button", { name: "同意してAIを使う" }));
    await user.click(screen.getByRole("button", { name: "美香に何が変わったのか尋ねる" }));
    await user.click(screen.getByRole("button", { name: "考えを整理する" }));

    expect(await screen.findByText(/実話を外せば出演できるか確認する/)).toBeInTheDocument();
    expect(screen.getByText(/場面を短縮する/)).toBeInTheDocument();
    expect(organizeThoughtCalls).toHaveLength(1);
  });
});

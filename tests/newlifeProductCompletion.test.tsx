import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../src/App";
import { getScene, TOTAL_DAYS } from "../src/newlife/content";
import { supportsRefoundation } from "../src/newlife/refoundationDialogue";
import { NPC_IDS, type Day24Outcome } from "../src/newlife/types";
import { setNewLifeAiDialogueConsent } from "../src/newlife/semantic/consent";

beforeEach(() => {
  localStorage.clear();
  setNewLifeAiDialogueConsent("declined");
});

describe("NEW LIFE product-completion coverage", () => {
  it("has a playable authored scene for every day and both Day 11 phases", () => {
    const outcome: Day24Outcome = "SOLO_TRIAL";
    for (let day = 1; day <= TOTAL_DAYS; day += 1) {
      const phases = day === 11 ? (["morning", "afternoon"] as const) : (["done"] as const);
      for (const phase of phases) {
        const scene = getScene(day, phase, day >= 25 ? outcome : null);
        expect(scene.day).toBe(day);
        expect(scene.title.trim().length).toBeGreaterThan(0);
        expect(scene.text.trim().length).toBeGreaterThan(20);
        expect(scene.npcsPresent.length).toBeGreaterThan(0);
        expect(scene.options.length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps all six canonical NPCs on the same chat-first path", () => {
    for (const npc of NPC_IDS) expect(supportsRefoundation(npc)).toBe(true);
  });

  it("uses every canonical NPC in authored scenes before the ending", () => {
    const seen = new Set<string>();
    for (let day = 1; day <= 24; day += 1) {
      const scene = getScene(day, day === 11 ? "morning" : "done", null);
      scene.npcsPresent.forEach((npc) => seen.add(npc));
      if (day === 11) getScene(11, "afternoon", null).npcsPresent.forEach((npc) => seen.add(npc));
    }
    expect([...seen].sort()).toEqual([...NPC_IDS].sort());
  });

  it("has genuinely different post-Day-24 scene text for all four outcomes", () => {
    const outcomes: Day24Outcome[] = ["JOINT_RETRY", "SOLO_TRIAL", "PAUSE", "SPLIT"];
    for (let day = 25; day <= 30; day += 1) {
      const variants = outcomes.map((outcome) => getScene(day, "done", outcome).text);
      expect(new Set(variants).size).toBe(4);
    }
  });

  it("renders the near-product stage, scene image, focused speaker and autosave feedback", () => {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    expect(screen.getByText(/^NEW LIFE$/)).toBeInTheDocument();
    expect(screen.getByText("自動保存", { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText("いま話している相手")).toBeInTheDocument();
    expect(screen.getByAltText("仮住まいの場面")).toBeInTheDocument();
    expect(screen.getByText("焼き菓子の試売を始める人")).toBeInTheDocument();
  });
});

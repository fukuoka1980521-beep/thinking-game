import { describe, expect, it } from "vitest";
import { answerFreeText, clarificationLine } from "../src/newlife/npcVoice";
import { getScene, TOTAL_DAYS } from "../src/newlife/content";
import { createInitialState } from "../src/newlife/state";
import type { Day24Outcome, NewLife30State } from "../src/newlife/types";

const OUTCOMES: Day24Outcome[] = ["JOINT_RETRY", "SOLO_TRIAL", "PAUSE", "SPLIT"];

function stateFor(day: number): NewLife30State {
  return {
    ...createInitialState(),
    day,
    day11Phase: day === 11 ? "morning" : "done",
  };
}

describe("NEW LIFE full suggested-action matrix", () => {
  it("every authored option across every day has a playable target and a non-empty fallback reaction", () => {
    for (const outcome of OUTCOMES) {
      for (let day = 1; day <= TOTAL_DAYS; day += 1) {
        const phases = day === 11 ? (["morning", "afternoon"] as const) : (["done"] as const);
        for (const phase of phases) {
          const scene = getScene(day, phase, day >= 25 ? outcome : null);
          expect(scene.npcsPresent.length, `day ${day} ${phase}`).toBeGreaterThan(0);
          const target = scene.npcsPresent[0];
          const state = {
            ...stateFor(day),
            day11Phase: day === 11 ? phase : "done",
            day24Outcome: day >= 25 ? outcome : null,
          } as NewLife30State;

          for (const option of scene.options) {
            expect(option.id.trim().length, `day ${day}: empty option id`).toBeGreaterThan(0);
            expect(option.label.trim().length, `day ${day}: empty option label`).toBeGreaterThan(0);

            const reply = answerFreeText(target, option.label, state);
            expect(reply.trim().length, `day ${day} option ${option.id}`).toBeGreaterThan(0);
            expect(reply).not.toMatch(/undefined|null|NaN/);
          }
        }
      }
    }
  });

  it("question-like suggested actions do not collapse into the generic clarification on the critical early-game days", () => {
    const checks = [
      { day: 1, optionId: "ask_price" },
      { day: 2, optionId: "ask_about_seats" },
      { day: 4, optionId: "ask_workshop" },
      { day: 5, optionId: "ask_price_as_customer" },
      { day: 8, optionId: "ask_pickup_time" },
      { day: 10, optionId: "suggest_time_split" },
    ] as const;

    for (const check of checks) {
      const scene = getScene(check.day, "done", null);
      const option = scene.options.find((o) => o.id === check.optionId);
      expect(option).toBeTruthy();
      const target = scene.npcsPresent[0];
      const reply = answerFreeText(target, option!.label, stateFor(check.day));
      expect(reply, `day ${check.day} ${check.optionId}`).not.toBe(clarificationLine(target));
    }
  });

  it("all four post-Day-24 branches preserve at least one playable option and NPC on every remaining day", () => {
    for (const outcome of OUTCOMES) {
      for (let day = 25; day <= 30; day += 1) {
        const scene = getScene(day, "done", outcome);
        expect(scene.npcsPresent.length, `${outcome} day ${day}`).toBeGreaterThan(0);
        expect(scene.options.length, `${outcome} day ${day}`).toBeGreaterThan(0);
      }
    }
  });
});

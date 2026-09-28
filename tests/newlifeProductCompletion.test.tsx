import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { getScene, TOTAL_DAYS } from "../src/newlife/content";
import { advanceDay, applyAction, createInitialState, resolveDay24Outcome } from "../src/newlife/state";
import { supportsRefoundation } from "../src/newlife/refoundationDialogue";
import { NPC_IDS, type Day24Outcome, type NewLife30State } from "../src/newlife/types";
import { setNewLifeAiDialogueConsent } from "../src/newlife/semantic/consent";

beforeEach(() => {
  localStorage.clear();
  setNewLifeAiDialogueConsent("declined");
});

function runToDay24(actions: Record<number, string[]>): NewLife30State {
  let state = createInitialState();
  while (state.day < 24) {
    for (const action of actions[state.day] ?? []) state = applyAction(state, action);
    state = advanceDay(state);
  }
  return state;
}

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

  it("can reach all four ending families through legal state transitions", () => {
    const joint = runToDay24({
      10: ["suggest_time_split"],
      11: ["fix_sign_before_posting"],
      14: ["broker_direct_fact_check"],
      16: ["arrange_paid_task_with_consent"],
      19: ["confirm_editor_role"],
    });
    expect(resolveDay24Outcome(joint)).toBe("JOINT_RETRY");
    expect(resolveDay24Outcome(runToDay24({}))).toBe("SOLO_TRIAL");
    expect(resolveDay24Outcome(runToDay24({ 21: ["cheer_her_on"] }))).toBe("PAUSE");
    expect(resolveDay24Outcome(runToDay24({ 11: ["publicly_blame_hina"] }))).toBe("SPLIT");
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

  it("renders the near-product opening with world art and all six neighbors", () => {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    expect(screen.getByText(/^NEW LIFE$/)).toBeInTheDocument();
    expect(screen.getByText("この町で、もう一度。")).toBeInTheDocument();
    expect(screen.getByAltText("これから30日を過ごす町")).toBeInTheDocument();
    for (const name of ["陽菜", "洋平", "大輔", "仁", "美代子", "文子"]) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
  });

  it("renders the playable stage and gives immediate feedback for a chosen action", async () => {
    window.history.pushState({}, "", "/?newlife30=1");
    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Day 1から始める" }));
    expect(screen.getByText("自動保存", { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText("いま話している相手")).toBeInTheDocument();
    expect(screen.getByAltText("仮住まいの場面")).toBeInTheDocument();
    expect(screen.getByText("焼き菓子の試売を始める人")).toBeInTheDocument();
    expect(screen.getByText(/陽菜・洋平 がこの場にいます/)).toBeInTheDocument();

    await user.click(screen.getByText("迷ったときの行動候補"));
    await user.click(screen.getByRole("button", { name: "手を貸す" }));
    expect(screen.getByRole("status")).toHaveTextContent("行動を記録しました：手を貸す");
    expect(screen.getByText("（手を貸す）")).toBeInTheDocument();
  });
});

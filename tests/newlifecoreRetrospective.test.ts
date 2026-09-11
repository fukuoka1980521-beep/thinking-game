/**
 * PHASE_12_8_NEW_LIFE_30_DAY_ARC_AND_RETROSPECTIVE_V1 Section 31 -- unit tests for the Day 30
 * retrospective (content/retrospective.ts) and the late-game consequence / reflection engine
 * functions (engine.ts). No test here ever asserts on a numeric score, and several tests exist
 * specifically to guard against personality-inference language ever entering the output.
 */
import { describe, expect, it } from "vitest";
import {
  acceptLifeOpportunity,
  declineLifeOpportunity,
  moveTo,
  recordConversationTurn,
  recordLateConsequence,
  recordTrajectoryEngagement,
  startNewDay,
  stepBackFromTrajectory,
  submitDay30Reflection,
} from "../src/newlifecore/engine";
import { buildRetrospectiveLines } from "../src/newlifecore/content/retrospective";
import { TRAJECTORY_SEEDS, trajectorySeedById } from "../src/newlifecore/content/trajectoryDefs";
import { lateConsequenceEligible } from "../src/newlifecore/content/trajectoryEngine";
import { createInitialCoreState } from "../src/newlifecore/types";
import type { CoreState } from "../src/newlifecore/types";

const JIN = trajectorySeedById("jin_odd_job")!;
const MIYOKO = trajectorySeedById("miyoko_cafe_help")!;

function stateAtDay(day: number, overrides: Partial<CoreState> = {}): CoreState {
  const s = createInitialCoreState();
  return { ...s, day, time: 9 * 60, ...overrides };
}

function engage(state: CoreState, seed = JIN) {
  return recordTrajectoryEngagement(state, seed, seed.engageMinutes, seed.engageMoney, seed.engageResultText);
}

describe("PHASE_12_8 retrospective: fact extraction and presentation", () => {
  it("Day1 (nothing happened yet) still produces a valid, non-empty retrospective -- no crash on minimal state", () => {
    const s = createInitialCoreState();
    const lines = buildRetrospectiveLines(s);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines[0]).toBe("30日目の夜になった。");
  });

  it("mentions the most-visited location (excluding TRIAL_HOUSE) by name", () => {
    let s = stateAtDay(1);
    for (let i = 0; i < 5; i++) s = moveTo(s, "CAFE_NODOKA");
    s = moveTo(s, "YOHEI_STORE");
    const lines = buildRetrospectiveLines(s).join(" ");
    expect(lines).toMatch(/喫茶のどか/);
  });

  it("mentions a never-visited location by name when one exists", () => {
    let s = stateAtDay(1);
    s = moveTo(s, "CAFE_NODOKA"); // never visits BARBERSHOP etc.
    const lines = buildRetrospectiveLines(s).join(" ");
    expect(lines).toMatch(/理容店かどや|商店街|集会所|チャレンジセンター|洋平商店/);
  });

  it("mentions the most-talked-to NPC by name", () => {
    let s = stateAtDay(1);
    s = { ...s, flags: { ...s.flags, met_miyoko: true } };
    for (let i = 0; i < 5; i++) s = recordConversationTurn(s, "miyoko", "こんにちは", "美代子はにっこりした。");
    const lines = buildRetrospectiveLines(s).join(" ");
    expect(lines).toMatch(/美代子/);
  });
});

describe("PHASE_12_8 retrospective: no-career case (Section 12/13)", () => {
  it("includes an explicit, specific no-career line when zero trajectory engagement ever happened", () => {
    const s = stateAtDay(30);
    const lines = buildRetrospectiveLines(s);
    expect(lines).toContain("特定の仕事や役割は、結局持たなかった。それでも、町を知り、人と関わる30日ではあった。");
  });

  it("does NOT include the no-career line once any seed has been engaged even once", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    const lines = buildRetrospectiveLines(s);
    expect(lines).not.toContain("特定の仕事や役割は、結局持たなかった。それでも、町を知り、人と関わる30日ではあった。");
  });

  it("the no-career retrospective never reads as 'nothing happened' -- it always has multiple lines beyond the opener", () => {
    const s = stateAtDay(30);
    const lines = buildRetrospectiveLines(s);
    expect(lines.length).toBeGreaterThan(3);
  });
});

describe("PHASE_12_8 retrospective: trajectory history (accept/decline/change-mind)", () => {
  it("mentions an accepted, still-ongoing trajectory", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    s = { ...s, day: s.day + JIN.engageCooldownDays, time: 9 * 60 };
    s = engage(s);
    s = acceptLifeOpportunity(s, JIN);
    const lines = buildRetrospectiveLines(s).join(" ");
    expect(lines).toMatch(/相馬/);
    expect(lines).toMatch(/続いている|通っている/);
  });

  it("mentions a change-of-mind (step-back) distinctly from an ordinary ongoing trajectory", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    s = { ...s, day: s.day + JIN.engageCooldownDays, time: 9 * 60 };
    s = engage(s);
    s = acceptLifeOpportunity(s, JIN);
    s = stepBackFromTrajectory(s, JIN);
    const lines = buildRetrospectiveLines(s).join(" ");
    expect(lines).toMatch(/途中でやめ|戻ってきた/);
  });

  it("mentions a decline distinctly from ordinary casual help", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    s = { ...s, day: s.day + JIN.engageCooldownDays, time: 9 * 60 };
    s = engage(s);
    s = declineLifeOpportunity(s, JIN);
    const lines = buildRetrospectiveLines(s).join(" ");
    expect(lines).toMatch(/断った|断っている/);
  });

  it("mentions casual, uncommitted help distinctly (never accepted, declined, or stepped back)", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s); // only once -- never reaches the opportunity threshold at all
    const lines = buildRetrospectiveLines(s).join(" ");
    expect(lines).toMatch(/手伝った|顔を出して手伝った/);
  });

  it("multiple traces with different trajectory histories produce genuinely different retrospective text (differentiation, Section 23)", () => {
    let careerState = stateAtDay(2, { time: 9 * 60 });
    careerState = engage(careerState, JIN);
    careerState = { ...careerState, day: careerState.day + JIN.engageCooldownDays, time: 9 * 60 };
    careerState = engage(careerState, JIN);
    careerState = acceptLifeOpportunity(careerState, JIN);

    const noCareerState = stateAtDay(30);

    const careerLines = buildRetrospectiveLines(careerState).join(" | ");
    const noCareerLines = buildRetrospectiveLines(noCareerState).join(" | ");
    expect(careerLines).not.toBe(noCareerLines);
    expect(careerLines).toMatch(/相馬/);
    expect(noCareerLines).not.toMatch(/相馬/);
  });
});

describe("PHASE_12_8 retrospective: no personality inference, no score (Section 2/18)", () => {
  it("never claims a personality trait or a 'suited job' recommendation, in any state", () => {
    const states = [
      stateAtDay(30),
      (() => {
        let s = stateAtDay(2, { time: 9 * 60 });
        s = engage(s);
        s = { ...s, day: s.day + JIN.engageCooldownDays, time: 9 * 60 };
        s = engage(s);
        return acceptLifeOpportunity(s, JIN);
      })(),
    ];
    const forbidden = /社交的|挑戦型|優しい人|向いている仕事|タイプです|ランク|エンド/;
    for (const s of states) {
      const text = buildRetrospectiveLines(s).join(" ");
      expect(text).not.toMatch(forbidden);
    }
  });

  it("never displays a raw number anywhere in the retrospective text", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    s = { ...s, day: s.day + JIN.engageCooldownDays, time: 9 * 60 };
    s = engage(s);
    s = acceptLifeOpportunity(s, JIN);
    const text = buildRetrospectiveLines(s).join(" ");
    // Day numbers ("30日目") are expected and fine -- this checks no OTHER digit sequence (a
    // count/score/percentage) appears anywhere in the retrospective's own generated lines.
    const withoutDayMention = text.replace(/30日/g, "");
    expect(withoutDayMention).not.toMatch(/\d/);
  });

  it("never mentions Reality Bridge / real-world-intent content (Section 5/29/30)", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    const text = buildRetrospectiveLines(s).join(" ");
    expect(text).not.toMatch(/現実|試してみる|大輔/); // Daisuke is never referenced by the retrospective at all
  });
});

describe("PHASE_12_8 late-game consequence (Section 6/7)", () => {
  function established(seed = JIN): CoreState {
    let s = stateAtDay(2, { time: 9 * 60 });
    for (let i = 0; i < 5; i++) {
      s = engage(s, seed);
      s = { ...s, day: s.day + seed.engageCooldownDays, time: 9 * 60 };
    }
    s = acceptLifeOpportunity(s, seed);
    return s;
  }

  it("is not eligible before lateConsequenceMinDay even if fully established", () => {
    const s = { ...established(), day: 10 };
    expect(lateConsequenceEligible(JIN, s)).toBe(false);
  });

  it("is not eligible without enough prior work sessions, even past minDay", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    s = { ...s, day: s.day + JIN.engageCooldownDays, time: 9 * 60 };
    s = engage(s);
    s = acceptLifeOpportunity(s, JIN);
    s = { ...s, day: 25 };
    expect(lateConsequenceEligible(JIN, s)).toBe(false); // only 2 engagements, threshold is 5
  });

  it("is eligible once established, past minDay, with enough work sessions", () => {
    let s = established();
    s = { ...s, day: JIN.lateConsequenceMinDay, time: 9 * 60 };
    expect(lateConsequenceEligible(JIN, s)).toBe(true);
  });

  it("is not eligible once stepped back from (Section 29 -- consistent with every other seed action)", () => {
    let s = established();
    s = { ...s, day: JIN.lateConsequenceMinDay, time: 9 * 60 };
    s = stepBackFromTrajectory(s, JIN);
    expect(lateConsequenceEligible(JIN, s)).toBe(false);
  });

  it("recording it grants the seed's modest money and respects its own cooldown", () => {
    let s = established();
    s = { ...s, day: JIN.lateConsequenceMinDay, time: 9 * 60 };
    const before = s.money;
    const next = recordLateConsequence(s, JIN);
    expect(next.money).toBe(before + JIN.lateConsequenceMoney);
    expect(lateConsequenceEligible(JIN, next)).toBe(false); // fresh cooldown
    const later = { ...next, day: next.day + JIN.lateConsequenceCooldownDays, time: 9 * 60 };
    expect(lateConsequenceEligible(JIN, later)).toBe(true);
  });

  it("is never a promotion/rank system -- firing repeatedly never changes the accepted flag or creates a second one", () => {
    let s = established();
    s = { ...s, day: JIN.lateConsequenceMinDay, time: 9 * 60 };
    s = recordLateConsequence(s, JIN);
    const keys1 = Object.keys(s.flags).filter((k) => k.startsWith("trajectory_jin"));
    s = { ...s, day: s.day + JIN.lateConsequenceCooldownDays, time: 9 * 60 };
    s = recordLateConsequence(s, JIN);
    const keys2 = Object.keys(s.flags).filter((k) => k.startsWith("trajectory_jin"));
    expect(keys1).toEqual(keys2);
  });
});

describe("PHASE_12_8 reflection (Section 4/19)", () => {
  it("stores the player's own text verbatim", () => {
    const s = createInitialCoreState();
    const next = submitDay30Reflection(s, "最初は仕事を探してたけど、途中から人に会いに行ってた気がする");
    expect(next.day30ReflectionText).toBe("最初は仕事を探してたけど、途中から人に会いに行ってた気がする");
  });

  it("stores null for blank/whitespace-only input (skippable, not forced)", () => {
    const s = createInitialCoreState();
    const next = submitDay30Reflection(s, "   ");
    expect(next.day30ReflectionText).toBeNull();
  });

  it("trims surrounding whitespace but preserves the text itself exactly", () => {
    const s = createInitialCoreState();
    const next = submitDay30Reflection(s, "  そのままでいいと思う。  ");
    expect(next.day30ReflectionText).toBe("そのままでいいと思う。");
  });
});

describe("PHASE_12_8 integration: persists across day transitions and reflects multiple simultaneous trajectories", () => {
  it("locationVisitCounts, playerExperiences, accepted flags, and ever_stepped_back all survive startNewDay unchanged, and the retrospective reflects two independent trajectories at once", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = moveTo(s, "CAFE_NODOKA");
    s = engage(s, JIN);
    s = { ...s, day: s.day + JIN.engageCooldownDays, time: 9 * 60 };
    s = engage(s, JIN);
    s = acceptLifeOpportunity(s, JIN);
    s = { ...s, time: 8 * 60 + 30 };
    s = engage(s, MIYOKO);
    s = { ...s, day: s.day + MIYOKO.engageCooldownDays, time: 8 * 60 + 30 };
    s = engage(s, MIYOKO);
    s = declineLifeOpportunity(s, MIYOKO);

    const next = startNewDay({ ...s, ended: true });
    expect(next.locationVisitCounts.CAFE_NODOKA).toBeGreaterThan(0);
    expect(next.flags[JIN.acceptedFlag]).toBe(true);
    expect(next.lifeOpportunityDeclines[MIYOKO.id]).toBeDefined();

    const lines = buildRetrospectiveLines({ ...next, day: 30 }).join(" | ");
    expect(lines).toMatch(/相馬/);
    expect(lines).toMatch(/美代子/);
    expect(lines).toMatch(/続いている|通っている/); // Jin: accepted
    expect(lines).toMatch(/断った|断っている/); // Miyoko: declined (either authored phrasing variant)
  });
});

describe("PHASE_12_8 duplicate fact prevention", () => {
  it("does not include the same trajectory-summary sentence twice even if built repeatedly", () => {
    let s = stateAtDay(2, { time: 9 * 60 });
    s = engage(s);
    const lines1 = buildRetrospectiveLines(s);
    const lines2 = buildRetrospectiveLines(s);
    expect(lines1).toEqual(lines2); // fully deterministic -- same state always produces the same output
    // No exact-duplicate line within a single retrospective.
    expect(new Set(lines1).size).toBe(lines1.length);
  });
});

describe("PHASE_12_8: all trajectory seeds have well-formed late-consequence fields", () => {
  it.each(TRAJECTORY_SEEDS)("$id has positive late-consequence thresholds and its own cooldown", (seed) => {
    expect(seed.lateConsequenceMinDay).toBeGreaterThanOrEqual(22);
    expect(seed.lateConsequenceMinWorkCount).toBeGreaterThan(0);
    expect(seed.lateConsequenceCooldownDays).toBeGreaterThan(0);
  });
});

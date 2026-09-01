import { describe, expect, it } from "vitest";
import { buildReflection, computeAbilityObservations } from "../src/lib/reflection";
import { CASES } from "../src/data/cases";
import type { FirstDecisionInput, InterventionInput, SecondDecisionInput } from "../src/types/log";

const caseData = CASES[0];

function first(overrides: Partial<FirstDecisionInput> = {}): FirstDecisionInput {
  return {
    choiceId: "a",
    reason: "because",
    confidence: 50,
    factCheckAnswer: caseData.factCheck.correctAnswer,
    altHypothesis: "",
    ...overrides,
  };
}

describe("computeAbilityObservations", () => {
  it("flags observationCorrect when the fact-check answer matches the case's correct answer", () => {
    const obs = computeAbilityObservations(
      caseData,
      first({ factCheckAnswer: caseData.factCheck.correctAnswer }),
      { falsificationText: "" },
      { choiceId: "a", reason: "r", confidence: 50 },
    );
    expect(obs.observationCorrect).toBe(true);
  });

  it("flags observationCorrect false on a wrong fact/interpretation classification", () => {
    const wrongAnswer = caseData.factCheck.correctAnswer === "fact" ? "interpretation" : "fact";
    const obs = computeAbilityObservations(
      caseData,
      first({ factCheckAnswer: wrongAnswer }),
      { falsificationText: "" },
      { choiceId: "a", reason: "r", confidence: 50 },
    );
    expect(obs.observationCorrect).toBe(false);
  });

  it("flags hypothesisConsidered only when altHypothesis has content", () => {
    expect(
      computeAbilityObservations(caseData, first({ altHypothesis: "" }), { falsificationText: "" }, {
        choiceId: "a",
        reason: "r",
        confidence: 50,
      }).hypothesisConsidered,
    ).toBe(false);
    expect(
      computeAbilityObservations(caseData, first({ altHypothesis: "maybe X" }), { falsificationText: "" }, {
        choiceId: "a",
        reason: "r",
        confidence: 50,
      }).hypothesisConsidered,
    ).toBe(true);
  });

  it("flags falsificationConsidered only when the intervention answer has content", () => {
    const empty: InterventionInput = { falsificationText: "  " };
    const filled: InterventionInput = { falsificationText: "maybe it is not X" };
    const second: SecondDecisionInput = { choiceId: "a", reason: "r", confidence: 50 };
    expect(computeAbilityObservations(caseData, first(), empty, second).falsificationConsidered).toBe(false);
    expect(computeAbilityObservations(caseData, first(), filled, second).falsificationConsidered).toBe(true);
  });

  it("flags updatingEngaged when the choice changes or confidence changes", () => {
    const f = first();
    const noChange: SecondDecisionInput = { choiceId: f.choiceId, reason: "r", confidence: f.confidence };
    const choiceChanged: SecondDecisionInput = { choiceId: "b", reason: "r", confidence: f.confidence };
    const confidenceChanged: SecondDecisionInput = { choiceId: f.choiceId, reason: "r", confidence: f.confidence + 20 };

    expect(computeAbilityObservations(caseData, f, { falsificationText: "" }, noChange).updatingEngaged).toBe(false);
    expect(computeAbilityObservations(caseData, f, { falsificationText: "" }, choiceChanged).updatingEngaged).toBe(true);
    expect(computeAbilityObservations(caseData, f, { falsificationText: "" }, confidenceChanged).updatingEngaged).toBe(true);
  });
});

describe("buildReflection", () => {
  it("never emits an empty goodPoints or checkPoints list", () => {
    const allNegative = { observationCorrect: false, hypothesisConsidered: false, falsificationConsidered: false, updatingEngaged: false };
    const allPositive = { observationCorrect: true, hypothesisConsidered: true, falsificationConsidered: true, updatingEngaged: true };

    expect(buildReflection(caseData, allNegative).goodPoints.length).toBeGreaterThan(0);
    expect(buildReflection(caseData, allPositive).checkPoints.length).toBeGreaterThan(0);
  });

  it("never phrases feedback as a pass/fail verdict", () => {
    const result = buildReflection(caseData, {
      observationCorrect: true,
      hypothesisConsidered: true,
      falsificationConsidered: true,
      updatingEngaged: true,
    });
    const allText = [...result.goodPoints, ...result.checkPoints, result.nextTheme].join(" ");
    expect(allText).not.toMatch(/正解|不正解/);
  });
});

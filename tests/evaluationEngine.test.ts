import { describe, expect, it } from "vitest";
import {
  buildReflection,
  computeAbilityObservations,
  computeCalibrationLabel,
  computeRubricResult,
  computeUpdateAppropriateness,
} from "../src/engine/evaluationEngine";
import { CASES, getCaseById } from "../src/data/cases";
import type { AiActionInput, FirstDecisionInput, ObservedFactInput, SecondDecisionInput } from "../src/types/log";

const case001 = CASES[0]; // TRAINING, evidenceSupportsChoiceId="c", criticalErrorChoiceId="a"
const case005 = getCaseById("CASE-005")!; // AI_CALIBRATION, aiResponseGroundTruth="INCORRECT"

function observedFact(answer: "fact" | "interpretation" | null = "fact"): ObservedFactInput {
  return { factCheckAnswer: answer };
}
function first(overrides: Partial<FirstDecisionInput> = {}): FirstDecisionInput {
  return { choiceId: "b", confidence: 50, reason: "", infoOptionsSelected: [], ...overrides };
}
function aiAction(overrides: Partial<AiActionInput> = {}): AiActionInput {
  return { playerAction: null, problemTypeSelected: "NONE", freeText: "", ...overrides };
}
function second(overrides: Partial<SecondDecisionInput> = {}): SecondDecisionInput {
  return { choiceId: "b", reason: "", confidence: 50, ...overrides };
}

describe("computeRubricResult: observation and critical error (Section B)", () => {
  it("flags observationCorrect from the structured fact-check answer matching the case's ground truth", () => {
    const r = computeRubricResult(case001, observedFact("fact"), first(), aiAction(), second());
    expect(r.observationCorrect).toBe(true);
  });

  it("flags a critical error only when the player picked the rubric's designated choice", () => {
    const madeError = computeRubricResult(case001, observedFact(), first({ choiceId: "a" }), aiAction(), second({ choiceId: "a" }));
    const didNot = computeRubricResult(case001, observedFact(), first({ choiceId: "b" }), aiAction(), second({ choiceId: "b" }));
    expect(madeError.criticalErrorMade).toBe(true);
    expect(didNot.criticalErrorMade).toBe(false);
  });
});

describe("computeRubricResult: update appropriateness (Section J) — change is not automatically correct, KEEP can be correct", () => {
  it("appropriate_keep: already aligned with the evidence-supported choice and stayed there", () => {
    const r = computeUpdateAppropriateness(case001, first({ choiceId: "c" }), second({ choiceId: "c" }));
    expect(r).toBe("appropriate_keep");
  });

  it("appropriate_update: moved into alignment with the evidence-supported choice", () => {
    const r = computeUpdateAppropriateness(case001, first({ choiceId: "a" }), second({ choiceId: "c" }));
    expect(r).toBe("appropriate_update");
  });

  it("misaligned_change: changing away from the evidence-supported choice is not rewarded just for changing", () => {
    const r = computeUpdateAppropriateness(case001, first({ choiceId: "c" }), second({ choiceId: "b" }));
    expect(r).toBe("misaligned_change");
  });

  it("under_update: kept a choice the evidence does not support", () => {
    const r = computeUpdateAppropriateness(case001, first({ choiceId: "a" }), second({ choiceId: "a" }));
    expect(r).toBe("under_update");
  });
});

describe("computeCalibrationLabel: AI_QUALITY x PLAYER_ACTION matrix (Section G) — no single trust score", () => {
  it("rejecting a correct AI claim is under-reliance, not a high score", () => {
    // case005's rubric ground truth is INCORRECT; verify the CORRECT row directly via the matrix helper.
    const correctCase = { ...case005, rubric: { ...case005.rubric, aiResponseGroundTruth: "CORRECT" as const } };
    expect(computeCalibrationLabel(correctCase, aiAction({ playerAction: "REJECT" }))).toBe("under_reliance");
  });

  it("accepting an incorrect AI claim is over-reliance, not a high score", () => {
    expect(computeCalibrationLabel(case005, aiAction({ playerAction: "ACCEPT" }))).toBe("over_reliance");
  });

  it("rejecting an incorrect AI claim is an appropriate rejection", () => {
    expect(computeCalibrationLabel(case005, aiAction({ playerAction: "REJECT" }))).toBe("appropriate_rejection");
  });

  it("verifying an uncertain AI claim is recorded as appropriate verification", () => {
    const uncertainCase = { ...case005, rubric: { ...case005.rubric, aiResponseGroundTruth: "UNCERTAIN" as const } };
    expect(computeCalibrationLabel(uncertainCase, aiAction({ playerAction: "VERIFY" }))).toBe("appropriate_verification");
  });

  it("is not_applicable when the case has no evaluable AI claim (Socratic-question cases)", () => {
    expect(computeCalibrationLabel(case001, aiAction({ playerAction: "ACCEPT" }))).toBe("not_applicable");
  });
});

describe("computeRubricResult: trap detection ground truth", () => {
  it("matches the case's trap type when the player selects it", () => {
    const r = computeRubricResult(
      case005,
      observedFact("interpretation"),
      first(),
      aiAction({ problemTypeSelected: "CAUSALITY_ERROR" }),
      second(),
    );
    expect(r.trapDetection.applicable).toBe(true);
    expect(r.trapDetection.groundTruthType).toBe("CAUSALITY_ERROR");
    expect(r.trapDetection.correctDetection).toBe(true);
  });

  it("is not a correct detection when the player selects a different problem type", () => {
    const r = computeRubricResult(
      case005,
      observedFact("interpretation"),
      first(),
      aiAction({ problemTypeSelected: "SMALL_SAMPLE" }),
      second(),
    );
    expect(r.trapDetection.correctDetection).toBe(false);
  });

  it("is not applicable for cases with no trap", () => {
    const r = computeRubricResult(case001, observedFact(), first(), aiAction({ problemTypeSelected: "CAUSALITY_ERROR" }), second());
    expect(r.trapDetection.applicable).toBe(false);
  });
});

describe("free text and dialogue content never drive evaluation (Section D/C)", () => {
  it("rubricResult is identical regardless of firstDecision.reason / aiAction.freeText content", () => {
    const withText = computeRubricResult(
      case001,
      observedFact("fact"),
      first({ reason: "a very long reasoned essay about causality" }),
      aiAction({ freeText: "another essay" }),
      second(),
    );
    const withoutText = computeRubricResult(case001, observedFact("fact"), first({ reason: "" }), aiAction({ freeText: "" }), second());
    expect(withText).toEqual(withoutText);
  });

  it("hypothesisConsidered comes from the structured info-options count, not from free text", () => {
    const withManyOptionsNoText = computeAbilityObservations(
      first({ infoOptionsSelected: ["i1", "i2"], reason: "" }),
      second(),
      computeRubricResult(case001, observedFact(), first({ infoOptionsSelected: ["i1", "i2"] }), aiAction(), second()),
    );
    const withTextNoOptions = computeAbilityObservations(
      first({ infoOptionsSelected: [], reason: "considered many alternative explanations here" }),
      second(),
      computeRubricResult(case001, observedFact(), first({ infoOptionsSelected: [] }), aiAction(), second()),
    );
    expect(withManyOptionsNoText.hypothesisConsidered).toBe(true);
    expect(withTextNoOptions.hypothesisConsidered).toBe(false);
  });

  it("evaluation does not depend on the case's dialogue string (aiIntervention text)", () => {
    const alteredDialogue = { ...case001, aiIntervention: "a completely different message" };
    const r1 = computeRubricResult(case001, observedFact("fact"), first(), aiAction(), second());
    const r2 = computeRubricResult(alteredDialogue, observedFact("fact"), first(), aiAction(), second());
    expect(r1).toEqual(r2);
  });
});

describe("buildReflection", () => {
  it("never emits an empty goodPoints or checkPoints list", () => {
    const negRubric = computeRubricResult(case001, observedFact("interpretation"), first({ choiceId: "a" }), aiAction({ problemTypeSelected: "NONE" }), second({ choiceId: "a" }));
    const negObs = computeAbilityObservations(first({ choiceId: "a" }), second({ choiceId: "a" }), negRubric);
    expect(buildReflection(case001, negObs, negRubric).goodPoints.length).toBeGreaterThan(0);

    const posRubric = computeRubricResult(case001, observedFact("fact"), first({ choiceId: "a", infoOptionsSelected: ["i1", "i2"] }), aiAction({ problemTypeSelected: "MISSING_INFORMATION" }), second({ choiceId: "d" }));
    const posObs = computeAbilityObservations(first({ choiceId: "a", infoOptionsSelected: ["i1", "i2"] }), second({ choiceId: "d" }), posRubric);
    expect(buildReflection(case001, posObs, posRubric).checkPoints.length).toBeGreaterThan(0);
  });

  it("never phrases feedback as a pass/fail verdict", () => {
    const rubric = computeRubricResult(case001, observedFact("fact"), first({ choiceId: "a" }), aiAction({ problemTypeSelected: "MISSING_INFORMATION" }), second({ choiceId: "d" }));
    const obs = computeAbilityObservations(first({ choiceId: "a" }), second({ choiceId: "d" }), rubric);
    const result = buildReflection(case001, obs, rubric);
    const allText = [...result.goodPoints, ...result.checkPoints, result.nextTheme].join(" ");
    expect(allText).not.toMatch(/正解|不正解/);
  });
});

import { describe, expect, it } from "vitest";
import { CASES } from "../src/data/cases";

const BANNED_PERSONALITY_PHRASES = [
  "あなたは反証能力が低い",
  "あなたは論理的思考が苦手",
  "あなたはIQ",
  "診断結果",
  "あなたのタイプは",
];

const BANNED_TRUST_TERMS = ["AI信頼度", "AI親密度", "AI好感度", "絆レベル"];

// Section 4: internal jargon must never leak into player-facing case copy.
const BANNED_JARGON_TERMS = ["rubric", "calibration matrix", "trajectory", "ground truth", "falsification"];

describe("case data", () => {
  it("has exactly 7 cases (5 core + 2 transfer, Section 1)", () => {
    expect(CASES).toHaveLength(7);
  });

  it("has unique case ids in the CASE-00N or TRANSFER-00N form", () => {
    const ids = CASES.map((c) => c.caseId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^(CASE|TRANSFER)-\d{3}$/);
    }
  });

  it("marks every case low risk", () => {
    for (const c of CASES) {
      expect(c.riskLevel).toBe("low");
    }
  });

  it("gives every case at least two choices, shared between first and second decision", () => {
    for (const c of CASES) {
      expect(c.availableChoices.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("gives every case required narrative content", () => {
    for (const c of CASES) {
      expect(c.initialSituation.length).toBeGreaterThan(0);
      expect(c.initialQuestion.length).toBeGreaterThan(0);
      expect(c.aiIntervention.length).toBeGreaterThan(0);
      expect(c.newFacts.length).toBeGreaterThan(0);
      expect(c.finalQuestion.length).toBeGreaterThan(0);
    }
  });

  it("defines a fact-check statement with a correct answer", () => {
    for (const c of CASES) {
      expect(c.factCheck.statement.length).toBeGreaterThan(0);
      expect(["fact", "interpretation"]).toContain(c.factCheck.correctAnswer);
    }
  });

  it("has exactly one AI trap case (CASE-005) with a safe pre-authored explanation", () => {
    const trapCases = CASES.filter((c) => c.aiTrap.present);
    expect(trapCases).toHaveLength(1);
    expect(trapCases[0].caseId).toBe("CASE-005");
    expect(trapCases[0].aiTrap.explanation).toBeTruthy();
  });

  it("never uses personality-diagnosis or trust-score language in player-facing copy", () => {
    for (const c of CASES) {
      const allText = JSON.stringify(c);
      for (const phrase of BANNED_PERSONALITY_PHRASES) {
        expect(allText).not.toContain(phrase);
      }
      for (const phrase of BANNED_TRUST_TERMS) {
        expect(allText).not.toContain(phrase);
      }
    }
  });

  it("never leaks internal jargon into player-facing case text (Section 4)", () => {
    for (const c of CASES) {
      const playerFacingText = [
        c.title,
        c.initialQuestion,
        ...c.initialSituation,
        c.aiIntervention,
        c.falsificationPrompt,
        ...c.newFacts,
        c.finalQuestion,
        ...c.availableChoices.map((choice) => choice.label),
        ...c.infoOptions.map((option) => option.label),
        c.reflectionPoints.factCorrect,
        c.reflectionPoints.factIncorrect,
        c.reflectionPoints.hypothesisConsidered,
        c.reflectionPoints.hypothesisNotConsidered,
        c.reflectionPoints.falsificationConsidered,
        c.reflectionPoints.falsificationNotConsidered,
        c.reflectionPoints.updatingEngaged,
        c.reflectionPoints.updatingNotEngaged,
        c.reflectionPoints.nextTheme,
        c.aiTrap.explanation ?? "",
      ]
        .join(" ")
        .toLowerCase();
      for (const term of BANNED_JARGON_TERMS) {
        expect(playerFacingText).not.toContain(term);
      }
    }
  });

  it("covers all four MVP ability targets across the cases", () => {
    const covered = new Set(CASES.flatMap((c) => c.abilityTargets));
    expect(covered.has("OBSERVATION")).toBe(true);
    expect(covered.has("HYPOTHESIS")).toBe(true);
    expect(covered.has("FALSIFICATION")).toBe(true);
    expect(covered.has("UPDATING")).toBe(true);
  });

  // --- SPEC AMENDMENT (rubric, case_type, AI calibration) checks below ---

  it("assigns each ladder case a unique MVP level 1-5, and 0 to every TRANSFER case (Section M/10)", () => {
    const ladderLevels = CASES.filter((c) => c.caseType !== "TRANSFER")
      .map((c) => c.level)
      .sort((a, b) => a - b);
    expect(ladderLevels).toEqual([1, 2, 3, 4, 5]);

    for (const c of CASES.filter((c) => c.caseType === "TRANSFER")) {
      expect(c.level).toBe(0);
    }
  });

  it("gives every case a valid caseType, with exactly two TRANSFER cases (Section 1)", () => {
    for (const c of CASES) {
      expect(["TRAINING", "MEASUREMENT", "AI_CALIBRATION", "TRANSFER", "OPEN_ENDED"]).toContain(c.caseType);
    }
    expect(CASES.filter((c) => c.caseType === "TRANSFER")).toHaveLength(2);
  });

  it("only defines an AI response ground truth where the AI intervention is an evaluable claim, not a Socratic question", () => {
    // Decoupled from caseType (validation build Section 2): TRAINING cases stay
    // Socratic-question-only, but TRANSFER cases may also carry an evaluable claim.
    for (const c of CASES) {
      if (c.caseType === "TRAINING") {
        expect(c.rubric.aiResponseGroundTruth).toBeNull();
      }
    }
    const evaluable = CASES.filter((c) => c.rubric.aiResponseGroundTruth !== null);
    expect(evaluable.length).toBeGreaterThanOrEqual(3);
  });

  it("balances AI quality across the case set: at least one CORRECT, one UNCERTAIN, and one INCORRECT AI claim (Section 2)", () => {
    const qualities = new Set(
      CASES.map((c) => c.rubric.aiResponseGroundTruth).filter((q): q is NonNullable<typeof q> => q !== null),
    );
    expect(qualities.has("CORRECT")).toBe(true);
    expect(qualities.has("UNCERTAIN")).toBe(true);
    expect(qualities.has("INCORRECT")).toBe(true);
  });

  it("never shows AI quality or trap presence in player-facing text (Section 2)", () => {
    for (const c of CASES) {
      const playerFacingText = [c.title, c.initialQuestion, ...c.initialSituation, c.aiIntervention].join(" ");
      expect(playerFacingText).not.toMatch(/CORRECT|UNCERTAIN|INCORRECT/);
      expect(playerFacingText).not.toMatch(/罠|トラップ|TRAP/i);
    }
  });

  it("defines a complete rubric for every case (Section B)", () => {
    for (const c of CASES) {
      expect(c.rubric.rubricVersion).toBeTruthy();
      expect(c.rubric.observableBehavior).toBeTruthy();
      expect(c.rubric.acceptableReasoning).toBeTruthy();
      expect(c.rubric.weakReasoning).toBeTruthy();
      expect(c.rubric.criticalError).toBeTruthy();
      expect(c.rubric.updateCondition).toBeTruthy();
      expect(c.rubric.doNotUpdateCondition).toBeTruthy();
      expect(c.rubric.uncertaintyCondition).toBeTruthy();
      expect(c.rubric.transferTarget).toBeTruthy();
    }
  });

  it("references only real choice ids from rubric.criticalErrorChoiceId / evidenceSupportsChoiceId / uncertaintyChoiceId", () => {
    for (const c of CASES) {
      const ids = c.availableChoices.map((choice) => choice.id);
      if (c.rubric.criticalErrorChoiceId !== null) {
        expect(ids).toContain(c.rubric.criticalErrorChoiceId);
      }
      if (c.rubric.uncertaintyChoiceId !== null) {
        expect(ids).toContain(c.rubric.uncertaintyChoiceId);
      }
      expect(ids).toContain(c.rubric.evidenceSupportsChoiceId);
    }
  });

  it("keeps rubric.correctInfoIds as a subset of the case's own infoOptions", () => {
    for (const c of CASES) {
      expect(c.infoOptions.length).toBeGreaterThanOrEqual(2);
      const ids = c.infoOptions.map((o) => o.id);
      for (const correctId of c.rubric.correctInfoIds) {
        expect(ids).toContain(correctId);
      }
    }
  });

  it("keeps aiTrap fields internally consistent", () => {
    for (const c of CASES) {
      if (c.aiTrap.present) {
        expect(c.aiTrap.trapType).not.toBe("NONE");
        expect(c.aiTrap.trapGroundTruth).not.toBeNull();
        expect(c.aiTrap.appropriateAction).not.toBeNull();
      } else {
        expect(c.aiTrap.trapType).toBe("NONE");
      }
    }
  });

  it("system-assigns the AI character for every case in this MVP (Section H, levels 1-3 behavior kept for all levels)", () => {
    for (const c of CASES) {
      expect(c.characterChoiceAvailable).toBe(false);
      expect(c.characterOffered).toContain(c.aiCharacter);
    }
  });
});

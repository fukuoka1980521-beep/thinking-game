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

describe("case data", () => {
  it("has exactly 5 cases", () => {
    expect(CASES).toHaveLength(5);
  });

  it("has unique case ids in the CASE-00N form", () => {
    const ids = CASES.map((c) => c.caseId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^CASE-\d{3}$/);
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

  it("covers all four MVP ability targets across the five cases", () => {
    const covered = new Set(CASES.flatMap((c) => c.abilityTargets));
    expect(covered.has("OBSERVATION")).toBe(true);
    expect(covered.has("HYPOTHESIS")).toBe(true);
    expect(covered.has("FALSIFICATION")).toBe(true);
    expect(covered.has("UPDATING")).toBe(true);
  });
});

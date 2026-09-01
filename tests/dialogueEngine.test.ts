import { describe, expect, it } from "vitest";
import { getAiInterventionMessage, getNewEvidence } from "../src/engine/dialogueEngine";
import { CASES, getCaseById } from "../src/data/cases";
import type { FirstDecisionInput } from "../src/types/log";
import type { AiCharacterKey, CaseData } from "../src/types/case";

const case001 = getCaseById("CASE-001")!;

function firstInput(overrides: Partial<FirstDecisionInput>): FirstDecisionInput {
  return { choiceId: "a", confidence: 50, reason: "", infoOptionsSelected: [], ...overrides };
}

describe("dialogue engine", () => {
  it("returns exactly the case's authored intervention message and evidence, unmodified when no player context is given", () => {
    for (const c of CASES) {
      expect(getAiInterventionMessage(c)).toBe(c.aiIntervention);
      expect(getNewEvidence(c)).toBe(c.newFacts);
    }
  });

  // PERSONALIZED_DIALOGUE Run Section 17 #1-3: CASE-001's message is built
  // from the player's actual FIRST_DECISION input.
  describe("CASE-001 personalized dialogue (Section 3/4/5)", () => {
    it("references the player's actual choice by label", () => {
      const message = getAiInterventionMessage(case001, firstInput({ choiceId: "d" }));
      expect(message).toContain(`あなたは「${case001.availableChoices[3].label}」を選びましたね。`);
    });

    it("echoes the player's written reason verbatim, without touching it when empty", () => {
      const withReason = getAiInterventionMessage(case001, firstInput({ reason: "多分ただ忙しいだけだと思う" }));
      expect(withReason).toContain("「多分ただ忙しいだけだと思う」――そう考えたんですね。");

      const withoutReason = getAiInterventionMessage(case001, firstInput({ reason: "" }));
      expect(withoutReason).not.toContain("そう考えたんですね。");
    });

    it("references the player's selected info options by label", () => {
      const message = getAiInterventionMessage(case001, firstInput({ infoOptionsSelected: ["i2", "i4"] }));
      expect(message).toContain(case001.infoOptions[1].label); // i2
      expect(message).toContain(case001.infoOptions[3].label); // i4

      const none = getAiInterventionMessage(case001, firstInput({ infoOptionsSelected: [] }));
      expect(none).not.toContain("を重要な情報として選んでいました。");
    });

    it("produces materially different messages for different choices (anti-generic contract, Section 5)", () => {
      const messages = case001.availableChoices.map((choice) =>
        getAiInterventionMessage(case001, firstInput({ choiceId: choice.id })),
      );
      expect(new Set(messages).size).toBe(messages.length); // no two choices collapse to the same text
      for (const message of messages) {
        expect(message).not.toBe(case001.aiIntervention); // never just the generic fallback
      }
    });

    it("differentiates AI character behavior for the same choice (Section 6/18)", () => {
      const characters: AiCharacterKey[] = ["DETECTIVE", "DEVIL", "OBSERVER", "STRATEGIST"];
      const withCharacter = (character: AiCharacterKey): CaseData => ({ ...case001, aiCharacter: character });
      const messages = characters.map((character) =>
        getAiInterventionMessage(withCharacter(character), firstInput({ choiceId: "a" })),
      );
      expect(new Set(messages).size).toBe(characters.length); // four distinct challenges, not four cosmetic names
    });

    it("falls back to the static message if a choice has no authored branch (authoring-gap safety net)", () => {
      const message = getAiInterventionMessage(case001, firstInput({ choiceId: "does-not-exist" }));
      expect(message).toBe(case001.aiIntervention);
    });
  });

  // Section 17 #6: the other six cases must be completely unaffected, even
  // when a FirstDecisionInput happens to be passed in.
  it("leaves every case without personalizedDialogue on the static message, even with player context supplied", () => {
    const untouched = CASES.filter((c) => c.caseId !== "CASE-001");
    expect(untouched.length).toBe(6);
    for (const c of untouched) {
      const message = getAiInterventionMessage(c, firstInput({ choiceId: c.availableChoices[0].id }));
      expect(message).toBe(c.aiIntervention);
    }
  });
});

import { describe, expect, it } from "vitest";
import { getAiInterventionMessage, getNewEvidence } from "../src/engine/dialogueEngine";
import { CASES } from "../src/data/cases";

describe("dialogue engine", () => {
  it("returns exactly the case's authored intervention message and evidence, unmodified", () => {
    for (const c of CASES) {
      expect(getAiInterventionMessage(c)).toBe(c.aiIntervention);
      expect(getNewEvidence(c)).toBe(c.newFacts);
    }
  });
});

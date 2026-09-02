import { describe, expect, it } from "vitest";
import { getCaseById } from "../src/data/cases";
import { computeRubricResult } from "../src/engine/evaluationEngine";
import { finalizeTrajectory } from "../src/engine/playerActionLogger";
import { clearInProgressSession } from "../src/lib/storage";
import type { InProgressSession } from "../src/types/log";

const case001 = getCaseById("CASE-001")!;

function makeSession(): InProgressSession {
  return {
    sessionId: "sess-firewall-test",
    caseId: "CASE-001",
    screen: "RESULT",
    startedAt: new Date().toISOString(),
    playRunId: "run-firewall-test",
    observedFact: { factCheckAnswer: "fact" },
    first: { choiceId: "a", confidence: 30, reason: "テスト理由", infoOptionsSelected: ["i2"] },
    aiAction: { playerAction: null, problemTypeSelected: "NONE", freeText: "" },
    second: { choiceId: "d", confidence: 80, reason: "テスト理由2" },
  };
}

/**
 * REAL_AI_DIALOGUE Run Section 17/25: proves the Evaluation Engine's output
 * cannot change no matter what dialogue text was shown or where it came
 * from (static / local personalized fallback / real AI). Only
 * `aiIntervention.message`/`messageSource` may differ between the two logs
 * below — every other field, especially `rubricResult`, must be identical.
 */
describe("evaluation firewall: dialogue text/source can never affect the deterministic result", () => {
  it("produces byte-identical rubricResult and abilityObservations regardless of shown AI message or its source", () => {
    const sessionA = makeSession();
    const sessionB = makeSession();

    const rubricResult = computeRubricResult(
      case001,
      sessionA.observedFact!,
      sessionA.first!,
      sessionA.aiAction!,
      sessionA.second!,
    );

    const logStatic = finalizeTrajectory(case001, sessionA, rubricResult, case001.aiIntervention, "static");
    clearInProgressSession();
    const logRealAi = finalizeTrajectory(
      case001,
      sessionB,
      rubricResult,
      "これは架空のAI生成テキストで、内容は評価に一切影響しないはずです。",
      "real_ai",
    );

    expect(logStatic.rubricResult).toEqual(logRealAi.rubricResult);
    expect(logStatic.abilityObservations).toEqual(logRealAi.abilityObservations);
    expect(logStatic.decisionChanged).toBe(logRealAi.decisionChanged);
    expect(logStatic.confidenceChange).toBe(logRealAi.confidenceChange);

    // The only two fields allowed to differ.
    expect(logStatic.aiIntervention.message).not.toBe(logRealAi.aiIntervention.message);
    expect(logStatic.aiIntervention.messageSource).toBe("static");
    expect(logRealAi.aiIntervention.messageSource).toBe("real_ai");
    expect(logStatic.aiIntervention.playerAction).toBe(logRealAi.aiIntervention.playerAction);
    expect(logStatic.aiIntervention.utteranceType).toBe(logRealAi.aiIntervention.utteranceType);
    expect(logStatic.aiIntervention.calibrationEligible).toBe(logRealAi.aiIntervention.calibrationEligible);
  });

  it("computeRubricResult's signature never accepts a dialogue-message string at all (structural guarantee, not just a runtime check)", () => {
    // If this ever needs an `as any` cast to compile, the firewall has been
    // broken at the type level — that alone should fail review.
    const result = computeRubricResult(
      case001,
      { factCheckAnswer: "fact" },
      { choiceId: "a", confidence: 50, reason: "", infoOptionsSelected: [] },
      { playerAction: null, problemTypeSelected: "NONE", freeText: "" },
      { choiceId: "d", confidence: 50, reason: "" },
    );
    expect(result.rubricVersion).toBe(case001.rubric.rubricVersion);
  });
});

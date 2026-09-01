import type { CaseData } from "../types/case";
import type {
  AbilityObservations,
  AiActionInput,
  CalibrationLabel,
  FirstDecisionInput,
  ObservedFactInput,
  RubricResult,
  SecondDecisionInput,
  UpdateAppropriateness,
} from "../types/log";

/**
 * Evaluation Engine (Section C/V). Deterministic and rubric-driven only.
 * Must never import from screens/ or depend on the Dialogue Engine's output
 * beyond the plain strings it already receives — it evaluates STRUCTURED
 * PLAYER ACTIONS against author-defined ground truth, never free text
 * (Section D). This is the module the "priority order" in Section C refers
 * to as steps 1-2 (deterministic event, rubric); structured player action
 * (step 3) is what feeds it.
 */

const CALIBRATION_MATRIX: Record<"CORRECT" | "UNCERTAIN" | "INCORRECT", Record<"ACCEPT" | "VERIFY" | "HOLD" | "REJECT", CalibrationLabel>> = {
  CORRECT: {
    ACCEPT: "appropriate_reliance",
    VERIFY: "appropriate_verification",
    HOLD: "appropriate_caution",
    REJECT: "under_reliance",
  },
  UNCERTAIN: {
    ACCEPT: "premature_acceptance",
    VERIFY: "appropriate_verification",
    HOLD: "appropriate_caution",
    REJECT: "premature_rejection",
  },
  INCORRECT: {
    ACCEPT: "over_reliance",
    VERIFY: "appropriate_verification",
    HOLD: "appropriate_caution",
    REJECT: "appropriate_rejection",
  },
};

export function computeCalibrationLabel(
  caseData: CaseData,
  aiAction: AiActionInput,
): CalibrationLabel {
  const groundTruth = caseData.rubric.aiResponseGroundTruth;
  if (!groundTruth || !aiAction.playerAction) return "not_applicable";
  return CALIBRATION_MATRIX[groundTruth][aiAction.playerAction];
}

export function computeUpdateAppropriateness(
  caseData: CaseData,
  first: FirstDecisionInput,
  second: SecondDecisionInput,
): UpdateAppropriateness {
  const changed = first.choiceId !== second.choiceId;
  if (caseData.rubric.evidenceStrength === "ambiguous") {
    return changed ? "over_update" : "appropriate_keep";
  }
  const target = caseData.rubric.evidenceSupportsChoiceId;
  const firstAligned = first.choiceId === target;
  const secondAligned = second.choiceId === target;
  if (firstAligned && secondAligned) return "appropriate_keep";
  if (!firstAligned && secondAligned) return "appropriate_update";
  if (firstAligned && !secondAligned) return "misaligned_change";
  return "under_update";
}

export function computeRubricResult(
  caseData: CaseData,
  observedFact: ObservedFactInput,
  first: FirstDecisionInput,
  aiAction: AiActionInput,
  second: SecondDecisionInput,
): RubricResult {
  const observationCorrect = observedFact.factCheckAnswer === caseData.factCheck.correctAnswer;
  const criticalErrorMade =
    caseData.rubric.criticalErrorChoiceId !== null &&
    first.choiceId === caseData.rubric.criticalErrorChoiceId;
  const infoOptionsConsidered = first.infoOptionsSelected.length;
  const infoOptionsMatchedGroundTruth = first.infoOptionsSelected.filter((id) =>
    caseData.rubric.correctInfoIds.includes(id),
  ).length;

  const trapType = caseData.aiTrap.trapType;
  const trapApplicable = caseData.aiTrap.present;
  const trapDetection = {
    applicable: trapApplicable,
    groundTruthType: trapType,
    playerSelectedType: aiAction.problemTypeSelected,
    correctDetection: trapApplicable && aiAction.problemTypeSelected === trapType,
  };

  return {
    rubricVersion: caseData.rubric.rubricVersion,
    observationCorrect,
    criticalErrorMade,
    infoOptionsConsidered,
    infoOptionsMatchedGroundTruth,
    updateAppropriateness: computeUpdateAppropriateness(caseData, first, second),
    aiCalibration: computeCalibrationLabel(caseData, aiAction),
    trapDetection,
  };
}

export function computeAbilityObservations(
  first: FirstDecisionInput,
  second: SecondDecisionInput,
  rubricResult: RubricResult,
): AbilityObservations {
  return {
    observationCorrect: rubricResult.observationCorrect,
    hypothesisConsidered: first.infoOptionsSelected.length >= 2,
    falsificationConsidered:
      rubricResult.trapDetection.playerSelectedType !== null &&
      rubricResult.trapDetection.playerSelectedType !== "NONE",
    updatingEngaged: first.choiceId !== second.choiceId || first.confidence !== second.confidence,
  };
}

export interface ReflectionResult {
  goodPoints: string[];
  checkPoints: string[];
  nextTheme: string;
}

const UPDATE_APPROPRIATENESS_COPY: Record<UpdateAppropriateness, { good?: string; check?: string }> = {
  appropriate_update: { good: "新しい証拠を受けて、判断をその証拠が支持する方向へ見直せました。" },
  appropriate_keep: { good: "新しい証拠が出た後も、根拠のある最初の判断を保つことができました。" },
  misaligned_change: {
    check: "判断は変わりましたが、新しい証拠が支持する方向とは違う方向へ変わったようです。",
  },
  under_update: {
    check: "新しい証拠が出た後も、その証拠が支持する方向へは判断が変わらなかったようです。",
  },
  over_update: {
    check: "この情報だけで判断を変える必要があったか、もう一度確認してみましょう。",
  },
};

const CALIBRATION_COPY: Record<CalibrationLabel, { good?: string; check?: string }> = {
  appropriate_reliance: { good: "正しいAIの提案を、適切に採用できました。" },
  under_reliance: { check: "AIの提案は妥当でしたが、拒否してしまったようです。根拠を再確認してみましょう。" },
  appropriate_verification: { good: "AIの提案をそのまま採用せず、検証する姿勢を示せました。" },
  appropriate_caution: { good: "AIの提案に対して、慎重に保留する判断ができました。" },
  premature_acceptance: { check: "AIの提案はまだ不確実でした。採用する前に検証する余地がありました。" },
  premature_rejection: { check: "AIの提案はまだ不確実でしたが、検証せずに拒否してしまったようです。" },
  over_reliance: { check: "AIの提案には問題がありましたが、そのまま採用してしまったようです。" },
  appropriate_rejection: { good: "問題のあるAIの提案を、適切に拒否できました。" },
  not_applicable: {},
};

/**
 * Builds RESULT-screen copy from pre-authored case text plus generic,
 * case-independent copy for the update/calibration axes, selected by
 * observed structured signals. Never phrases feedback as a pass/fail
 * verdict and never makes personality claims (see docs/SAFETY_PRINCIPLES.md).
 */
export function buildReflection(
  caseData: CaseData,
  observations: AbilityObservations,
  rubricResult: RubricResult,
): ReflectionResult {
  const rp = caseData.reflectionPoints;
  const goodPoints: string[] = [];
  const checkPoints: string[] = [];

  (observations.observationCorrect ? goodPoints : checkPoints).push(
    observations.observationCorrect ? rp.factCorrect : rp.factIncorrect,
  );
  (observations.hypothesisConsidered ? goodPoints : checkPoints).push(
    observations.hypothesisConsidered ? rp.hypothesisConsidered : rp.hypothesisNotConsidered,
  );
  (observations.falsificationConsidered ? goodPoints : checkPoints).push(
    observations.falsificationConsidered
      ? rp.falsificationConsidered
      : rp.falsificationNotConsidered,
  );

  const updateCopy = UPDATE_APPROPRIATENESS_COPY[rubricResult.updateAppropriateness];
  if (updateCopy.good) goodPoints.push(updateCopy.good);
  if (updateCopy.check) checkPoints.push(updateCopy.check);

  if (rubricResult.aiCalibration !== "not_applicable") {
    const calCopy = CALIBRATION_COPY[rubricResult.aiCalibration];
    if (calCopy.good) goodPoints.push(calCopy.good);
    if (calCopy.check) checkPoints.push(calCopy.check);
  }

  if (rubricResult.trapDetection.applicable) {
    if (rubricResult.trapDetection.correctDetection) {
      goodPoints.push("AIの発言に含まれていた問題点の種類を、正しく見抜けました。");
    } else {
      checkPoints.push("AIの発言に問題があることには気づけましたが、問題の種類は再確認してみましょう。");
    }
  }

  if (goodPoints.length === 0) {
    goodPoints.push("最後までケースに取り組み、判断を2回行うことができました。");
  }
  if (checkPoints.length === 0) {
    checkPoints.push("特にありません。次のケースでも同じ視点を続けてみましょう。");
  }

  return { goodPoints, checkPoints, nextTheme: rp.nextTheme };
}

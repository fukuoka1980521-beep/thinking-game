import { useState } from "react";
import type { AiTrapType, CaseData, PlayerAiAction } from "../types/case";
import type { AiActionInput } from "../types/log";
import { ScreenContainer } from "../components/ScreenContainer";
import { AiMessage } from "../components/AiMessage";
import { AI_TRAP_TAXONOMY_OPTIONS } from "../data/aiTrapTaxonomy";
import { isCalibrationEligible } from "../engine/evaluationEngine";

interface Props {
  caseData: CaseData;
  /** Supplied by the Dialogue Engine (src/engine/dialogueEngine.ts), not read from CaseData directly. */
  message: string;
  initial?: AiActionInput;
  onBack: () => void;
  onSubmit: (input: AiActionInput) => void;
  /**
   * FUN_FIRST_PROTOTYPE Run Section 1/6: hides the trap-taxonomy classification
   * field and the free-text field -- just the AI's message and a single
   * continue button, framed as moving on to the reward (NEW CLUE), not a
   * classification exercise. Submits {playerAction: null, problemTypeSelected:
   * "NONE", freeText: ""} so the schema stays intact.
   */
  simplified?: boolean;
}

const PLAYER_AI_ACTIONS: { id: PlayerAiAction; label: string }[] = [
  { id: "ACCEPT", label: "採用する" },
  { id: "VERIFY", label: "検証する" },
  { id: "HOLD", label: "保留する" },
  { id: "REJECT", label: "拒否する" },
];

export function AiInterventionScreen({ caseData, message, initial, onBack, onSubmit, simplified }: Props) {
  // Decoupled from caseType: whether the AI intervention is an evaluable
  // claim/recommendation (vs. a Socratic question) is a content property of
  // this specific case (utteranceType + aiResponseGroundTruth), not a
  // property of the case's pedagogical category. See docs/AI_CALIBRATION.md.
  const hasEvaluableClaim = isCalibrationEligible(caseData);
  const [playerAction, setPlayerAction] = useState<PlayerAiAction | null>(
    initial?.playerAction ?? null,
  );
  const [problemTypeSelected, setProblemTypeSelected] = useState<AiTrapType | null>(
    initial?.problemTypeSelected ?? null,
  );
  const [freeText, setFreeText] = useState(initial?.freeText ?? "");

  if (simplified) {
    return (
      <ScreenContainer title="AIの意見" onBack={onBack}>
        <AiMessage character={caseData.aiCharacter} message={message} />
        <div className="spacer" />
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onSubmit({ playerAction: null, problemTypeSelected: "NONE", freeText: "" })}
        >
          次の手がかりを見る
        </button>
      </ScreenContainer>
    );
  }

  const canSubmit = problemTypeSelected !== null && (!hasEvaluableClaim || playerAction !== null);

  return (
    <ScreenContainer title="AIの意見" onBack={onBack}>
      <AiMessage character={caseData.aiCharacter} message={message} />

      {hasEvaluableClaim && (
        <div className="field">
          <label>このAIの提案を、あなたはどうしますか？</label>
          <div className="choice-list">
            {PLAYER_AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                role="radio"
                aria-checked={playerAction === action.id}
                className={`btn btn-choice${playerAction === action.id ? " selected" : ""}`}
                onClick={() => setPlayerAction(action.id)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="field">
        <label>
          {hasEvaluableClaim
            ? "このAIの発言について、気になる点はありますか？"
            : "自分の最初の考えについて、気になる点はありますか？"}
        </label>
        <div className="choice-list">
          {AI_TRAP_TAXONOMY_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={problemTypeSelected === option.id}
              className={`btn btn-choice${problemTypeSelected === option.id ? " selected" : ""}`}
              onClick={() => setProblemTypeSelected(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="falsification">{caseData.falsificationPrompt}</label>
        <textarea
          id="falsification"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="考えたことを書いてみましょう"
        />
      </div>

      <button
        type="button"
        className="btn btn-primary"
        disabled={!canSubmit}
        onClick={() => onSubmit({ playerAction, problemTypeSelected, freeText })}
      >
        次へ
      </button>
    </ScreenContainer>
  );
}

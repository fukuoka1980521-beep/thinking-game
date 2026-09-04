import { useState } from "react";
import type { CaseData } from "../types/case";
import type { FirstDecisionInput, SecondDecisionInput } from "../types/log";
import { ScreenContainer } from "../components/ScreenContainer";
import { ChoiceList } from "../components/ChoiceList";

interface Props {
  caseData: CaseData;
  first: FirstDecisionInput;
  onBack: () => void;
  onSubmit: (input: SecondDecisionInput) => void;
}

/**
 * FUN_FIRST_PROTOTYPE Run Section 1/7: replaces the full SECOND_DECISION
 * screen (5-choice re-answer + confidence slider + reason textarea) for
 * simplified-flow cases. First asks the binary "did your thinking change?"
 * question; only if "changed" does it ask for a new pick (one tap, no
 * confidence re-entry). "confidence" is carried over from the first
 * decision so SecondDecisionInput's schema stays populated without
 * re-asking (Section 7: "confidence再入力は禁止候補").
 */
export function ChangeOrKeepScreen({ caseData, first, onBack, onSubmit }: Props) {
  const [askingFinalPick, setAskingFinalPick] = useState(false);

  if (askingFinalPick) {
    return (
      <FinalPickScreen
        caseData={caseData}
        first={first}
        onBack={() => setAskingFinalPick(false)}
        onSubmit={onSubmit}
      />
    );
  }

  return (
    <ScreenContainer title="再判断" onBack={onBack}>
      <div className="field">
        <div className="question-card">
          <label>この手がかりを見て、考えは変わった？</label>
        </div>
      </div>
      <div className="spacer" />
      <button type="button" className="btn btn-primary" onClick={() => setAskingFinalPick(true)}>
        変わった
      </button>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => onSubmit({ choiceId: first.choiceId, reason: "", confidence: first.confidence })}
      >
        まだ同じ
      </button>
    </ScreenContainer>
  );
}

function FinalPickScreen({ caseData, first, onBack, onSubmit }: Props) {
  const [choiceId, setChoiceId] = useState<string | null>(null);

  return (
    <ScreenContainer title="再判断" onBack={onBack}>
      <div className="field">
        <div className="question-card">
          <label>{caseData.finalQuestion}</label>
        </div>
        <ChoiceList choices={caseData.availableChoices} selectedId={choiceId} onSelect={setChoiceId} />
      </div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={choiceId === null}
        onClick={() => choiceId && onSubmit({ choiceId, reason: "", confidence: first.confidence })}
      >
        次へ
      </button>
    </ScreenContainer>
  );
}

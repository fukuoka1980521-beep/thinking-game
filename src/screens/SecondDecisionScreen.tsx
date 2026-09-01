import { useState } from "react";
import type { CaseData } from "../types/case";
import type { SecondDecisionInput } from "../types/log";
import { ScreenContainer } from "../components/ScreenContainer";
import { ChoiceList } from "../components/ChoiceList";
import { ConfidenceSlider } from "../components/ConfidenceSlider";

interface Props {
  caseData: CaseData;
  initial?: SecondDecisionInput;
  onBack: () => void;
  onSubmit: (input: SecondDecisionInput) => void;
}

export function SecondDecisionScreen({ caseData, initial, onBack, onSubmit }: Props) {
  const [choiceId, setChoiceId] = useState<string | null>(initial?.choiceId ?? null);
  const [reason, setReason] = useState(initial?.reason ?? "");
  const [confidence, setConfidence] = useState(initial?.confidence ?? 50);

  const canSubmit = choiceId !== null && reason.trim().length > 0;

  return (
    <ScreenContainer title="再判断" onBack={onBack}>
      <div className="field">
        <label>{caseData.finalQuestion}</label>
        <ChoiceList choices={caseData.availableChoices} selectedId={choiceId} onSelect={setChoiceId} />
      </div>

      <div className="field">
        <label htmlFor="reason2">そう考えた理由</label>
        <textarea
          id="reason2"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="考えが変わった、または変わらなかった理由を書いてみましょう"
        />
      </div>

      <ConfidenceSlider label={caseData.confidencePrompt} value={confidence} onChange={setConfidence} />

      <button
        type="button"
        className="btn btn-primary"
        disabled={!canSubmit}
        onClick={() => choiceId && onSubmit({ choiceId, reason, confidence })}
      >
        次へ
      </button>
    </ScreenContainer>
  );
}

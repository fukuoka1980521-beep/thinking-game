import { useState } from "react";
import type { CaseData } from "../types/case";
import type { FirstDecisionInput } from "../types/log";
import { ScreenContainer } from "../components/ScreenContainer";
import { ChoiceList } from "../components/ChoiceList";
import { ConfidenceSlider } from "../components/ConfidenceSlider";

interface Props {
  caseData: CaseData;
  initial?: FirstDecisionInput;
  onBack: () => void;
  onSubmit: (input: FirstDecisionInput) => void;
}

export function FirstDecisionScreen({ caseData, initial, onBack, onSubmit }: Props) {
  const [choiceId, setChoiceId] = useState<string | null>(initial?.choiceId ?? null);
  const [confidence, setConfidence] = useState(initial?.confidence ?? 50);
  const [reason, setReason] = useState(initial?.reason ?? "");
  const [infoOptionsSelected, setInfoOptionsSelected] = useState<string[]>(
    initial?.infoOptionsSelected ?? [],
  );

  const canSubmit = choiceId !== null;

  function toggleInfoOption(id: string) {
    setInfoOptionsSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <ScreenContainer title="第一判断" onBack={onBack}>
      <div className="field">
        <label>{caseData.initialQuestion}</label>
        <ChoiceList choices={caseData.availableChoices} selectedId={choiceId} onSelect={setChoiceId} />
      </div>

      <ConfidenceSlider label={caseData.confidencePrompt} value={confidence} onChange={setConfidence} />

      <div className="field">
        <label>どの情報を重要と考えましたか？（複数選択可）</label>
        <div className="choice-list">
          {caseData.infoOptions.map((option) => {
            const selected = infoOptionsSelected.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                role="checkbox"
                aria-checked={selected}
                className={`btn btn-choice${selected ? " selected" : ""}`}
                onClick={() => toggleInfoOption(option.id)}
              >
                {selected ? "✓ " : ""}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="field">
        <label htmlFor="reason">そう考えた理由（任意）</label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="なぜそう考えましたか？"
        />
      </div>

      <button
        type="button"
        className="btn btn-primary"
        disabled={!canSubmit}
        onClick={() =>
          choiceId && onSubmit({ choiceId, confidence, reason, infoOptionsSelected })
        }
      >
        次へ
      </button>
    </ScreenContainer>
  );
}

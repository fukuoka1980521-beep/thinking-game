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
  const [reason, setReason] = useState(initial?.reason ?? "");
  const [factCheckAnswer, setFactCheckAnswer] = useState<"fact" | "interpretation" | null>(
    initial?.factCheckAnswer ?? null,
  );
  const [altHypothesis, setAltHypothesis] = useState(initial?.altHypothesis ?? "");
  const [confidence, setConfidence] = useState(initial?.confidence ?? 50);

  const canSubmit = choiceId !== null && reason.trim().length > 0 && factCheckAnswer !== null;

  return (
    <ScreenContainer title="第一判断" onBack={onBack}>
      <div className="field">
        <label>{caseData.initialQuestion}</label>
        <ChoiceList choices={caseData.availableChoices} selectedId={choiceId} onSelect={setChoiceId} />
      </div>

      <div className="field">
        <label htmlFor="reason">そう考えた理由</label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="なぜそう考えましたか？"
        />
      </div>

      <div className="field">
        <label>次の1文は「事実」ですか、それとも「解釈」ですか？</label>
        <p className="card" style={{ margin: 0 }}>
          {caseData.factCheck.statement}
        </p>
        <div className="choice-list">
          <button
            type="button"
            className={`btn btn-choice${factCheckAnswer === "fact" ? " selected" : ""}`}
            onClick={() => setFactCheckAnswer("fact")}
          >
            事実（確認できていること）
          </button>
          <button
            type="button"
            className={`btn btn-choice${factCheckAnswer === "interpretation" ? " selected" : ""}`}
            onClick={() => setFactCheckAnswer("interpretation")}
          >
            解釈（推測・意見）
          </button>
        </div>
      </div>

      <div className="field">
        <label htmlFor="alt-hypothesis">他にどんな可能性が考えられますか？（任意）</label>
        <textarea
          id="alt-hypothesis"
          value={altHypothesis}
          onChange={(e) => setAltHypothesis(e.target.value)}
          placeholder="思いつけば書いてみましょう"
        />
      </div>

      <ConfidenceSlider label={caseData.confidencePrompt} value={confidence} onChange={setConfidence} />

      <button
        type="button"
        className="btn btn-primary"
        disabled={!canSubmit}
        onClick={() =>
          choiceId &&
          onSubmit({ choiceId, reason, confidence, factCheckAnswer, altHypothesis })
        }
      >
        次へ
      </button>
    </ScreenContainer>
  );
}

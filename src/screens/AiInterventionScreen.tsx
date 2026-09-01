import { useState } from "react";
import type { CaseData } from "../types/case";
import type { InterventionInput } from "../types/log";
import { ScreenContainer } from "../components/ScreenContainer";
import { AiMessage } from "../components/AiMessage";

interface Props {
  caseData: CaseData;
  initial?: InterventionInput;
  onBack: () => void;
  onSubmit: (input: InterventionInput) => void;
}

export function AiInterventionScreen({ caseData, initial, onBack, onSubmit }: Props) {
  const [falsificationText, setFalsificationText] = useState(initial?.falsificationText ?? "");

  return (
    <ScreenContainer title="AIからの介入" onBack={onBack}>
      <AiMessage character={caseData.aiCharacter} message={caseData.aiIntervention} />

      <div className="field">
        <label htmlFor="falsification">{caseData.falsificationPrompt}</label>
        <textarea
          id="falsification"
          value={falsificationText}
          onChange={(e) => setFalsificationText(e.target.value)}
          placeholder="考えたことを書いてみましょう"
        />
      </div>

      <p className="muted">
        AIは常に正しいとは限りません。参考にしつつ、自分でも検証してみましょう。
      </p>

      <button type="button" className="btn btn-primary" onClick={() => onSubmit({ falsificationText })}>
        次へ
      </button>
    </ScreenContainer>
  );
}

import { useState } from "react";
import type { CaseData } from "../types/case";
import type { ObservedFactInput } from "../types/log";
import { ScreenContainer } from "../components/ScreenContainer";

interface Props {
  caseData: CaseData;
  initial?: ObservedFactInput;
  onBack: () => void;
  onSubmit: (input: ObservedFactInput) => void;
}

export function ObservedFactScreen({ caseData, initial, onBack, onSubmit }: Props) {
  const [factCheckAnswer, setFactCheckAnswer] = useState<"fact" | "interpretation" | null>(
    initial?.factCheckAnswer ?? null,
  );

  return (
    <ScreenContainer title="観測された事実の確認" onBack={onBack}>
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

      <button
        type="button"
        className="btn btn-primary"
        disabled={factCheckAnswer === null}
        onClick={() => factCheckAnswer && onSubmit({ factCheckAnswer })}
      >
        次へ
      </button>
    </ScreenContainer>
  );
}

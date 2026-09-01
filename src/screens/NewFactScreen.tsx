import type { CaseData } from "../types/case";
import { ScreenContainer } from "../components/ScreenContainer";

interface Props {
  caseData: CaseData;
  onBack: () => void;
  onNext: () => void;
}

export function NewFactScreen({ caseData, onBack, onNext }: Props) {
  return (
    <ScreenContainer title="新しい情報" onBack={onBack}>
      <div className="card">
        {caseData.newFacts.map((fact, i) => (
          <p key={i} className="situation-line">
            {fact}
          </p>
        ))}
      </div>
      <p className="muted">この情報を踏まえて、もう一度考えてみましょう。</p>
      <div className="spacer" />
      <button type="button" className="btn btn-primary" onClick={onNext}>
        再判断する
      </button>
    </ScreenContainer>
  );
}

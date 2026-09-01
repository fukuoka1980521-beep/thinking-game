import type { CaseData } from "../types/case";
import { ScreenContainer } from "../components/ScreenContainer";

interface Props {
  caseData: CaseData;
  onStart: () => void;
  onExit: () => void;
}

export function CaseIntroScreen({ caseData, onStart, onExit }: Props) {
  return (
    <ScreenContainer title={caseData.title} onBack={onExit}>
      <p className="muted">{caseData.category} ・ 3〜7分</p>
      <div className="card">
        {caseData.initialSituation.map((line, i) => (
          <p key={i} className="situation-line">
            {line}
          </p>
        ))}
      </div>
      <div className="spacer" />
      <button type="button" className="btn btn-primary" onClick={onStart}>
        はじめる
      </button>
    </ScreenContainer>
  );
}

import type { CaseData } from "../types/case";
import type { ReflectionResult } from "../engine/evaluationEngine";
import { ScreenContainer } from "../components/ScreenContainer";

interface Props {
  caseData: CaseData;
  reflection: ReflectionResult;
  onGoHome: () => void;
  onViewGrowth: () => void;
}

export function ResultScreen({ caseData, reflection, onGoHome, onViewGrowth }: Props) {
  return (
    <ScreenContainer title="結果">
      <div className="card reflection-section good">
        <h3>今回よかった点</h3>
        <ul>
          {reflection.goodPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </div>

      <div className="card reflection-section check">
        <h3>確認したい点</h3>
        <ul>
          {reflection.checkPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </div>

      {caseData.aiTrap.present && caseData.aiTrap.explanation && (
        <div className="card">
          <h3 style={{ margin: "0 0 6px" }}>このケースについて</h3>
          <p style={{ margin: 0 }}>{caseData.aiTrap.explanation}</p>
        </div>
      )}

      <div className="card">
        <h3 style={{ margin: "0 0 6px" }}>次回のテーマ</h3>
        <p style={{ margin: 0 }}>{reflection.nextTheme}</p>
      </div>

      <div className="spacer" />
      <button type="button" className="btn btn-primary" onClick={onViewGrowth}>
        成長を見る
      </button>
      <button type="button" className="btn-secondary" onClick={onGoHome}>
        ホームに戻る
      </button>
    </ScreenContainer>
  );
}

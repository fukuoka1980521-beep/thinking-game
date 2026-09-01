import type { SessionSummary } from "../types/log";
import { ScreenContainer } from "../components/ScreenContainer";

interface Props {
  summary: SessionSummary;
  onTakeSurvey: () => void;
  onSkip: () => void;
}

export function SessionSummaryScreen({ summary, onTakeSurvey, onSkip }: Props) {
  return (
    <ScreenContainer title="今回のプレイ">
      <p className="muted">今回、{summary.totalCases}問に取り組みました。</p>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <p className="situation-line">追加情報を受けて考え直した：{summary.reconsidered}回</p>
        <p className="situation-line">最初の判断をそのまま続けた：{summary.maintained}回</p>
        <p className="situation-line">AIの意見を確かめてみた：{summary.verifiedAi}回</p>
        <p className="situation-line">AIの意見に反対した：{summary.rejectedAi}回</p>
        <p className="situation-line">「まだ判断できない」を選んだ：{summary.choseUncertain}回</p>
      </div>

      <p className="muted">
        これは今回のプレイの記録であり、あなたの能力を評価するものではありません。
      </p>

      <div className="spacer" />
      <button type="button" className="btn btn-primary" onClick={onTakeSurvey}>
        感想を聞かせてください（30秒）
      </button>
      <button type="button" className="btn-secondary" onClick={onSkip}>
        ホームに戻る
      </button>
    </ScreenContainer>
  );
}

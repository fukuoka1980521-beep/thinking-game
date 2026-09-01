import type { SessionSummary } from "../types/log";
import { ScreenContainer } from "../components/ScreenContainer";
import sessionCompleteImg from "../assets/session-complete-evening.png";

interface Props {
  summary: SessionSummary;
  onTakeSurvey: () => void;
  onSkip: () => void;
}

export function SessionSummaryScreen({ summary, onTakeSurvey, onSkip }: Props) {
  return (
    <ScreenContainer title="今回のプレイ">
      <div className="screen-hero">
        <img
          src={sessionCompleteImg}
          alt="一区切りついたことを示すイラスト"
          className="screen-hero-image"
          width={370}
          height={320}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

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

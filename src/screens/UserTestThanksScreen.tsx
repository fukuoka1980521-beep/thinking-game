import type { UserTestResponse } from "../types/log";
import { ScreenContainer } from "../components/ScreenContainer";

interface Props {
  response: UserTestResponse;
  onGoHome: () => void;
}

const ROWS: { key: keyof UserTestResponse; label: string }[] = [
  { key: "q1WantMore", label: "もう1問やってみたいか" },
  { key: "q2Enjoyable", label: "考えること自体は面白かったか" },
  { key: "q3QuestionedAi", label: "AIの意見を見たあと自分でも考えたか" },
  { key: "q4Clarity", label: "何をすればよいゲームか分かりやすかったか" },
  { key: "q5WantReuse", label: "また別の日に開きたいか" },
];

export function UserTestThanksScreen({ response, onGoHome }: Props) {
  return (
    <ScreenContainer title="ありがとうございました">
      <p className="muted">回答内容です。この端末にのみ保存されています。</p>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ROWS.map((row) => (
          <p key={row.key} className="situation-line">
            {row.label}：{response[row.key] as number} / 5
          </p>
        ))}
        {response.freeText && <p className="situation-line">コメント：{response.freeText}</p>}
      </div>
      <p className="muted">
        この画面のスクリーンショットを、もしよければ開発者へ共有してください。
      </p>
      <div className="spacer" />
      <button type="button" className="btn btn-primary" onClick={onGoHome}>
        ホームに戻る
      </button>
    </ScreenContainer>
  );
}

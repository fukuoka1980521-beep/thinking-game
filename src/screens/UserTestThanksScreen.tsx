import type { UserTestResponse } from "../types/log";
import { ScreenContainer } from "../components/ScreenContainer";

interface Props {
  response: UserTestResponse;
  onGoHome: () => void;
}

const ROWS: { key: keyof UserTestResponse; label: string }[] = [
  { key: "q1WantMore", label: "もう1問やってみたいか" },
  { key: "q2Enjoyable", label: "考えること自体は面白かったか" },
  { key: "q3QuestionedAi", label: "AIの意見をそのまま信じなかったか" },
  { key: "q4Confusion", label: "操作で迷ったか" },
  { key: "q5WantReuse", label: "また使いたいか" },
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

import homeWelcomeImg from "../assets/home-welcome-felt.png";

interface Props {
  hasInProgress: boolean;
  onResume: () => void;
  onTodaysCase: () => void;
  onSelectCase: () => void;
  onViewGrowth: () => void;
}

export function HomeScreen({ hasInProgress, onResume, onTodaysCase, onSelectCase, onViewGrowth }: Props) {
  return (
    <div className="screen">
      <div className="screen-hero">
        <img
          src={homeWelcomeImg}
          alt="出迎えるキャラクターのイラスト"
          className="screen-hero-image"
          width={370}
          height={320}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      <div>
        <h1 className="screen-title">思考整理ゲーム</h1>
        <p className="muted">3分で終わる、小さな判断ゲーム。</p>
        <p className="muted">最初にどう思う？　新しい事実が出たら、判断は変わる？</p>
      </div>

      <p className="test-notice">
        このアプリは現在、使いやすさやゲーム体験を確認するための試作版です。
      </p>

      {hasInProgress && (
        <button type="button" className="btn btn-primary" onClick={onResume}>
          続きから再開する
        </button>
      )}

      <div className="choice-list">
        <button type="button" className="btn" onClick={onTodaysCase}>
          今日の1問
        </button>
        <button type="button" className="btn" onClick={onSelectCase}>
          ケースを選ぶ
        </button>
        <button type="button" className="btn" onClick={onViewGrowth}>
          成長を見る
        </button>
      </div>

      <div className="spacer" />
      <p className="muted">
        このアプリはAIを信じ込むためのものではありません。AIの意見を参考にしながら、最終判断はあなた自身で行いましょう。
      </p>
    </div>
  );
}

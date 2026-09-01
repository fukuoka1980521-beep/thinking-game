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
      <div>
        <h1 className="screen-title">思考整理ゲーム</h1>
        <p className="muted">観察・仮説・反証・判断更新を、短いケースで練習します。</p>
      </div>

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

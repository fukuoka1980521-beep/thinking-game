import { useState } from "react";
import type { ThinkingLog } from "../types/log";
import { ABILITY_KEYS, abilityLabel, computeGrowthStats, computeRecentGrowthStats } from "../lib/growth";
import { ScreenContainer } from "../components/ScreenContainer";

interface Props {
  logs: ThinkingLog[];
  onBack: () => void;
}

type Window = "recent" | "all";

export function GrowthScreen({ logs, onBack }: Props) {
  const [windowMode, setWindowMode] = useState<Window>("recent");

  const stats = windowMode === "recent" ? computeRecentGrowthStats(logs) : computeGrowthStats(logs);

  return (
    <ScreenContainer title="成長を見る" onBack={onBack}>
      <div className="tabs">
        <button
          type="button"
          className={`tab${windowMode === "recent" ? " active" : ""}`}
          onClick={() => setWindowMode("recent")}
        >
          最近5ケース
        </button>
        <button
          type="button"
          className={`tab${windowMode === "all" ? " active" : ""}`}
          onClick={() => setWindowMode("all")}
        >
          全期間（{logs.length}件）
        </button>
      </div>

      {logs.length === 0 ? (
        <p className="muted">まだ完了したケースがありません。ケースに挑戦してみましょう。</p>
      ) : (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {ABILITY_KEYS.map((key) => {
            const { count, total } = stats.byAbility[key];
            const pct = total === 0 ? 0 : Math.round((count / total) * 100);
            return (
              <div className="growth-row" key={key}>
                <strong>{abilityLabel(key)}</strong>
                <span className="muted">
                  {count} / {total} cases
                </span>
                <div className="growth-bar-track">
                  <div className="growth-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="muted">
        これは能力の評価ではなく、最近のゲームで観測された思考行動の記録です。
      </p>
    </ScreenContainer>
  );
}

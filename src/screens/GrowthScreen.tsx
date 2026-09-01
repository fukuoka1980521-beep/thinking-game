import { useState } from "react";
import type { TrajectoryLog } from "../types/log";
import {
  ABILITY_KEYS,
  abilityLabel,
  computeAiActionDistribution,
  computeGrowthStats,
  computeRecentGrowthStats,
  RECENT_WINDOW_SIZE,
} from "../engine/growthAggregator";
import { ScreenContainer } from "../components/ScreenContainer";

interface Props {
  logs: TrajectoryLog[];
  onBack: () => void;
}

type Window = "recent" | "all";

const AI_ACTION_LABELS: Record<string, string> = {
  ACCEPT: "採用",
  VERIFY: "検証",
  HOLD: "保留",
  REJECT: "拒否",
};

export function GrowthScreen({ logs, onBack }: Props) {
  const [windowMode, setWindowMode] = useState<Window>("recent");

  const stats = windowMode === "recent" ? computeRecentGrowthStats(logs) : computeGrowthStats(logs);
  const aiActionDistribution = computeAiActionDistribution(logs);

  return (
    <ScreenContainer title="成長を見る" onBack={onBack}>
      <div className="tabs">
        <button
          type="button"
          className={`tab${windowMode === "recent" ? " active" : ""}`}
          onClick={() => setWindowMode("recent")}
        >
          最近{RECENT_WINDOW_SIZE}ケース
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
        <>
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

          <div className="card">
            <h3 style={{ margin: "0 0 10px" }}>最近{RECENT_WINDOW_SIZE}ケースでのAIとの付き合い方</h3>
            {aiActionDistribution.totalCases === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                AI提案を評価するケースにまだ挑戦していません。
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(["ACCEPT", "VERIFY", "HOLD", "REJECT"] as const).map((action) => (
                  <div key={action} className="muted">
                    {AI_ACTION_LABELS[action]} {aiActionDistribution.counts[action]} /{" "}
                    {aiActionDistribution.totalCases}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <p className="muted">
        これは能力の評価ではなく、最近のゲームで観測された思考行動の記録です。AIを疑えば高得点、
        信じれば高得点、というものではありません。
      </p>
    </ScreenContainer>
  );
}

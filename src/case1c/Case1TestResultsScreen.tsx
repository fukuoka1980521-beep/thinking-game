import { useState } from "react";
import { buildCase1TestResultRows, formatCase1Duration as formatDuration } from "./testResults";

interface Props {
  onExit: () => void;
}

function formatClock(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

/**
 * PHASE 4.6 (Section13): Owner-only local result view -- reached only via the `?case1results`
 * direct link (see App.tsx), never linked from HomeScreen, so a tester can never wander into it.
 * Reads localStorage only; nothing here is transmitted anywhere. Deliberately does not compute
 * PASS/FAIL/a success rate (Section15) -- Owner + 参謀 judge, this only displays the raw numbers.
 */
export function Case1TestResultsScreen({ onExit }: Props) {
  const [rows] = useState(() => buildCase1TestResultRows());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(sessionId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  }

  return (
    <div style={{ padding: 16, fontFamily: "-apple-system, system-ui, sans-serif", fontSize: 13, maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h2 style={{ fontSize: 16, margin: 0 }}>CASE1 外部テスト結果（Owner用・local-only）</h2>
        <button type="button" onClick={onExit}>
          閉じる
        </button>
      </div>
      <p style={{ color: "#5b6272", marginTop: 0 }}>
        このブラウザに保存された play-through 単位の生データです。集計値のみで判断せず、各testerを個別に確認してください。
        良し悪しの自動判定はここでは行いません——数値をそのまま表示するだけです。最終判断はOwnerと参謀で行ってください。
      </p>

      {rows.length === 0 ? (
        <p>まだ記録がありません。CASE1をプレイすると、ここに1件ずつ表示されます。</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
                <th style={{ padding: 4 }}>#</th>
                <th style={{ padding: 4 }}>tester_code</th>
                <th style={{ padding: 4 }}>type</th>
                <th style={{ padding: 4 }}>complete</th>
                <th style={{ padding: 4 }}>duration</th>
                <th style={{ padding: 4 }}>optional obj</th>
                <th style={{ padding: 4 }}>optional npc</th>
                <th style={{ padding: 4 }}>prediction</th>
                <th style={{ padding: 4 }}>next</th>
                <th style={{ padding: 4 }}>assist</th>
                <th style={{ padding: 4 }}>Q1</th>
                <th style={{ padding: 4 }}>Q2</th>
                <th style={{ padding: 4 }}>Q3</th>
                <th style={{ padding: 4 }}>Q4</th>
                <th style={{ padding: 4 }}>Q5</th>
                <th style={{ padding: 4 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.sessionId} style={{ borderBottom: "1px solid #e1e4ea" }}>
                  <td style={{ padding: 4 }}>{i + 1}</td>
                  <td style={{ padding: 4 }}>{row.testerCode || "(未入力)"}</td>
                  <td style={{ padding: 4 }}>{row.testerType ?? "—"}</td>
                  <td style={{ padding: 4 }}>{row.completed ? "YES" : "NO"}</td>
                  <td style={{ padding: 4 }}>{formatDuration(row.durationSeconds)}</td>
                  <td style={{ padding: 4 }}>{row.optionalObjectCount}</td>
                  <td style={{ padding: 4 }}>{row.optionalNpcCount}</td>
                  <td style={{ padding: 4 }}>{row.humanPrediction ?? "—"}</td>
                  <td style={{ padding: 4 }}>{row.nextCaseIntent ? "YES" : "NO"}</td>
                  <td style={{ padding: 4 }}>{row.ownerAssistCount}</td>
                  <td style={{ padding: 4 }}>{row.feedback?.q1Fun ?? "—"}</td>
                  <td style={{ padding: 4 }}>{row.feedback?.q2Curiosity ?? "—"}</td>
                  <td style={{ padding: 4 }}>{row.feedback?.q3SelfInvestigated ?? "—"}</td>
                  <td style={{ padding: 4 }}>{row.feedback?.q4Aha ?? "—"}</td>
                  <td style={{ padding: 4 }}>{row.feedback?.q5WantNext ?? "—"}</td>
                  <td style={{ padding: 4 }}>
                    <button type="button" onClick={() => toggle(row.sessionId)}>
                      {expanded.has(row.sessionId) ? "閉じる" : "詳細"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows
        .filter((row) => expanded.has(row.sessionId))
        .map((row) => (
          <div key={row.sessionId} style={{ marginTop: 16, border: "1px solid #e1e4ea", borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              {row.testerCode || "(未入力)"}（{row.testerType ?? "type不明"}）
            </div>
            <div>開始：{formatClock(row.startedAt)}</div>
            <div>終了：{formatClock(row.completedAt)}</div>
            <div>調査順：{row.investigationOrder.length > 0 ? row.investigationOrder.join(" → ") : "—"}</div>
            <div style={{ marginTop: 6 }}>
              <div>自由記述：{row.feedback?.freeText || "（なし）"}</div>
              <div>印象に残った人物：{row.feedback?.characterMemory || "（なし）"}</div>
            </div>
            <details style={{ marginTop: 8 }}>
              <summary>raw JSON</summary>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 11, background: "#f5f6fa", padding: 8, borderRadius: 6 }}>
                {JSON.stringify(row, null, 2)}
              </pre>
            </details>
          </div>
        ))}
    </div>
  );
}

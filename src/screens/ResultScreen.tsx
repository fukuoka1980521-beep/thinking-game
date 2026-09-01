import type { CaseData } from "../types/case";
import type { FirstDecisionInput, SecondDecisionInput } from "../types/log";
import type { ReflectionResult } from "../engine/evaluationEngine";
import { ScreenContainer } from "../components/ScreenContainer";

interface Props {
  caseData: CaseData;
  first: FirstDecisionInput;
  second: SecondDecisionInput;
  reflection: ReflectionResult;
  onNextCase: () => void;
  onGoHome: () => void;
  onViewGrowth: () => void;
}

function choiceLabel(caseData: CaseData, choiceId: string): string {
  return caseData.availableChoices.find((c) => c.id === choiceId)?.label ?? choiceId;
}

/**
 * COMPREHENSION CLEANUP Run (Section 8-14): RESULT is restructured around
 * "what happened to your judgment" (decision trajectory + one piece of
 * case-specific evidence) as the PRIMARY content, with the rubric-derived
 * good/check points compressed into a single secondary "振り返り" block.
 * "次回のテーマ" is no longer shown at all — it previews the next case's
 * target skill, which primes behavior on a case the player hasn't seen yet
 * (Section 14). No pass/fail framing: "変更しました" / "維持しました" only
 * (Section 10) — never "正解/不正解" or "変わらなかった" as a failure.
 */
export function ResultScreen({ caseData, first, second, reflection, onNextCase, onGoHome, onViewGrowth }: Props) {
  const decisionChanged = first.choiceId !== second.choiceId;
  // Section 11: one piece of case-specific grounding, reusing existing
  // fields only — never new case content. Prefer the trap explanation where
  // one exists (CASE-005); otherwise the rubric's plain observable-fact
  // statement, which every case already has authored.
  const keyEvidence = caseData.aiTrap.present && caseData.aiTrap.explanation
    ? caseData.aiTrap.explanation
    : caseData.rubric.observableBehavior;

  return (
    <ScreenContainer title="結果">
      <div className="card">
        <h3 style={{ margin: "0 0 10px" }}>あなたの判断</h3>
        <p className="situation-line">
          <strong>最初：</strong>「{choiceLabel(caseData, first.choiceId)}」
        </p>
        <p className="muted situation-line">↓ 新しい事実</p>
        {caseData.newFacts.map((fact, i) => (
          <p key={i} className="situation-line muted">
            {fact}
          </p>
        ))}
        <p className="muted situation-line">↓</p>
        <p className="situation-line">
          <strong>最後：</strong>「{choiceLabel(caseData, second.choiceId)}」
        </p>
        <p className="situation-line" style={{ marginTop: 8 }}>
          {decisionChanged ? "判断を変更しました。" : "判断を維持しました。"}
        </p>
      </div>

      <div className="card">
        <h3 style={{ margin: "0 0 6px" }}>今回のポイント</h3>
        <p style={{ margin: 0 }}>{keyEvidence}</p>
      </div>

      <div className="card">
        <h3 style={{ margin: "0 0 10px" }}>振り返り</h3>
        <div className="reflection-section good">
          <h3>よかった点</h3>
          <ul>
            {reflection.goodPoints.map((point, i) => (
              <li key={`good-${i}`}>{point}</li>
            ))}
          </ul>
        </div>
        <div className="reflection-section check" style={{ marginTop: 10 }}>
          <h3>確認したい点</h3>
          <ul>
            {reflection.checkPoints.map((point, i) => (
              <li key={`check-${i}`}>{point}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="spacer" />
      <button type="button" className="btn btn-primary" onClick={onNextCase}>
        次の問題へ
      </button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        <button type="button" className="btn-secondary" onClick={onViewGrowth}>
          成長を見る
        </button>
        <button type="button" className="btn-secondary" onClick={onGoHome}>
          ホームに戻る
        </button>
      </div>
    </ScreenContainer>
  );
}

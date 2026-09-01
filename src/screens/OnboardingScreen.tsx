import { ScreenContainer } from "../components/ScreenContainer";

interface Props {
  onStart: () => void;
  onBack: () => void;
}

/**
 * COMPREHENSION CLEANUP Run (Section 3). Shown once, before a player's very
 * first case. Teaches only the GAME RULE (what screens do, what to press),
 * never a thinking strategy, never anything about this specific case, AI
 * quality, or traps — see the banned-phrase test in
 * tests/onboarding.test.tsx and docs/DECISIONS.md.
 */
export function OnboardingScreen({ onStart, onBack }: Props) {
  return (
    <ScreenContainer title="あそびかた" onBack={onBack}>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <p className="situation-line">短い状況を読んで、今ある情報だけで、あなたがどう考えるかを選びます。</p>
        <p className="situation-line">途中で新しい情報が出てきます。</p>
        <p className="situation-line">そのときの自分の考えを、もう一度選んでください。</p>
      </div>
      <div className="spacer" />
      <button type="button" className="btn btn-primary" onClick={onStart}>
        はじめる
      </button>
    </ScreenContainer>
  );
}

import { ScreenContainer } from "../components/ScreenContainer";

interface Props {
  /** Supplied by the Dialogue Engine (src/engine/dialogueEngine.ts), not read from CaseData directly. */
  newEvidence: string[];
  onBack: () => void;
  onNext: () => void;
  /** FUN_FIRST_PROTOTYPE Run Section 6: frames the clue as a reward, not a re-quiz prompt, for simplified-flow cases. */
  buttonLabel?: string;
}

export function NewFactScreen({ newEvidence, onBack, onNext, buttonLabel }: Props) {
  return (
    <ScreenContainer title="新しい情報" onBack={onBack}>
      <div className="card">
        {newEvidence.map((fact, i) => (
          <p key={i} className="situation-line">
            {fact}
          </p>
        ))}
      </div>
      <p className="muted">この情報を踏まえて、もう一度考えてみましょう。</p>
      <div className="spacer" />
      <button type="button" className="btn btn-primary" onClick={onNext}>
        {buttonLabel ?? "再判断する"}
      </button>
    </ScreenContainer>
  );
}

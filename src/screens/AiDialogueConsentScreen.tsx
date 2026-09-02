import { ScreenContainer } from "../components/ScreenContainer";

interface Props {
  onAccept: () => void;
  onDecline: () => void;
}

/**
 * REAL_AI_DIALOGUE Run (Section 14). Shown once, before the very first real
 * AI dialogue call is ever attempted -- a separate, versioned consent
 * distinct from onboarding (this is a genuine change to the local-only data
 * boundary, not a UI tutorial). "AIなしで続ける" is a real, sticky choice:
 * declining routes every future CASE-001 play to the local, non-AI dialogue
 * instead, permanently, not just this once (see src/lib/aiDialogueConsent.ts).
 */
export function AiDialogueConsentScreen({ onAccept, onDecline }: Props) {
  return (
    <ScreenContainer title="AIとの対話について">
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <p className="situation-line">
          このケースでは、あなたが書いた回答をAIサービスへ送信し、その内容に対する返答を生成します。
        </p>
        <p className="situation-line">個人情報や、他人に知られたくない内容は書かないでください。</p>
        <p className="situation-line">送信されるのは、今のケースの回答内容のみです。</p>
      </div>
      <div className="spacer" />
      <button type="button" className="btn btn-primary" onClick={onAccept}>
        同意して続ける
      </button>
      <button type="button" className="btn-secondary" onClick={onDecline}>
        AIなしで続ける
      </button>
    </ScreenContainer>
  );
}

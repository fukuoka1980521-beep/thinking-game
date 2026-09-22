/**
 * Phase 30: NEW LIFE-specific AI-dialogue consent screen. Mirrors
 * `src/screens/AiDialogueConsentScreen.tsx`'s shape and intent, but with its
 * own copy describing NEW LIFE's actual data flow (an open-ended free-talk
 * message to one NPC, not CASE1's fixed decision-reason field) — reusing
 * CASE1's wording verbatim would misdescribe what is actually sent.
 *
 * Only ever rendered when `NEWLIFE_DIALOGUE_ENDPOINT_URL` is non-empty and
 * consent hasn't been asked yet (see `NewLife30App.tsx`) — with the shipped
 * empty endpoint, this component is exercised only by
 * `tests/newlifeAiConsentPrompt.test.tsx`, never by a real player, so this
 * wording was tightened in Phase 32 to match the actual minimized payload:
 * utterance + current NPC/day + currently-known story facts, never the
 * player's action history or another NPC's data.
 */
interface Props {
  onAccept: () => void;
  onDecline: () => void;
}

export function NewLifeAiConsentPrompt({ onAccept, onDecline }: Props) {
  return (
    <div className="newlife30-consent">
      <p>この会話では、あなたが自由入力で話しかけた内容を外部のAIサービスへ送信し、NPCの返答を生成します。</p>
      <p>個人情報や、他人に知られたくない内容は書かないでください。</p>
      <p>送信されるのは、今の発言内容と、話している相手（NPC）や現在の日数、NEW LIFEの中で今わかっている範囲の物語上の事実だけです。プレイヤーの行動履歴や他のNPCの情報は送信されません。</p>
      <p>同意しない場合も、これまでと同じ会話ルールでゲームを続けられます。</p>
      <div className="newlife30-consent-buttons">
        <button type="button" onClick={onAccept}>
          同意して続ける
        </button>
        <button type="button" onClick={onDecline}>
          AIなしで続ける
        </button>
      </div>
    </div>
  );
}

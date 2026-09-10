import { useState } from "react";

/**
 * PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1 Section H -- appears only after a player's own
 * free-text turn with the Thinking Resident reads (heuristically, content/realityBridge.ts) as a
 * real-life concern. Purely optional and dismissible (directive: "現実行動を強制しない"); nothing
 * is created until the player explicitly writes their own small action and presses 作る -- exactly
 * the same "world/action consistency" discipline as IntakeForm.tsx: a suggestion in conversation is
 * never, by itself, a commitment.
 */
export function RealityBridgeOffer({ onCreate, onDismiss }: { onCreate: (intentLabel: string) => void; onDismiss: () => void }) {
  const [composing, setComposing] = useState(false);
  const [intentLabel, setIntentLabel] = useState("");

  if (!composing) {
    return (
      <div className="nlc-result" data-testid="nlc-reality-bridge-offer">
        <p className="nlc-ambient">今の話、少しだけ現実でも試してみる？</p>
        <div className="nlc-choices">
          <button className="nlc-choice" onClick={() => setComposing(true)} data-testid="nlc-bridge-offer-accept">
            試してみる
          </button>
          <button className="nlc-leave-btn" onClick={onDismiss} data-testid="nlc-bridge-offer-dismiss">
            今回はいい
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nlc-result" data-testid="nlc-reality-bridge-compose">
      <label className="nlc-form-field">
        <span className="nlc-form-label">小さく、やってみたいこと</span>
        <textarea className="nlc-textarea" data-testid="nlc-bridge-intent-input" value={intentLabel} onChange={(ev) => setIntentLabel(ev.target.value)} placeholder="自分の言葉で書いてみる" />
      </label>
      <div className="nlc-choices">
        <button className="nlc-btn" onClick={() => intentLabel.trim() && onCreate(intentLabel.trim())} disabled={!intentLabel.trim()} data-testid="nlc-bridge-intent-confirm">
          作る
        </button>
        <button className="nlc-leave-btn" onClick={onDismiss} data-testid="nlc-bridge-intent-cancel">
          今回はいい
        </button>
      </div>
    </div>
  );
}

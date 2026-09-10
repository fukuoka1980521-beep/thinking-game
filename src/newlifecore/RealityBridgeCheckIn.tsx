import { useState } from "react";
import { USER_UPDATE_OPTIONS, daisukeCheckInPrompt } from "./content/realityBridge";
import type { RealWorldIntent, UserUpdateResponse } from "./types";

/**
 * PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1 Section H -- "その後どうだった？" as a real
 * UI, same pattern as IntakeForm.tsx/ShoppingPicker.tsx: a real action creates the canonical record
 * (engine.ts's checkInRealWorldIntent), not a free-text claim. No success/failure styling on any of
 * the six options -- they are presented as a flat, unranked list (directive: observe USER_UPDATE,
 * not ACTION_RESULT).
 */
export function RealityBridgeCheckIn({ intent, onSubmit, onCancel }: { intent: RealWorldIntent; onSubmit: (response: UserUpdateResponse, note: string) => void; onCancel: () => void }) {
  const [response, setResponse] = useState<UserUpdateResponse | null>(null);
  const [note, setNote] = useState("");

  function handleSubmit() {
    if (!response) return;
    onSubmit(response, note.trim());
  }

  return (
    <div data-testid="nlc-reality-bridge-checkin">
      <p className="nlc-ambient">{daisukeCheckInPrompt(intent)}</p>

      <div className="nlc-form-field">
        <div className="nlc-form-radio-group">
          {USER_UPDATE_OPTIONS.map((opt) => (
            <label key={opt.value} className="nlc-form-radio">
              <input
                type="radio"
                name="nlc-checkin-response"
                data-testid={`nlc-checkin-response-${opt.value}`}
                checked={response === opt.value}
                onChange={() => setResponse(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {response === "other" && (
        <label className="nlc-form-field">
          <span className="nlc-form-label">自由記述</span>
          <textarea className="nlc-textarea" data-testid="nlc-checkin-note" value={note} onChange={(ev) => setNote(ev.target.value)} />
        </label>
      )}

      <div className="nlc-choices">
        <button className="nlc-btn" onClick={handleSubmit} disabled={!response} data-testid="nlc-checkin-submit">
          伝える
        </button>
        <button className="nlc-leave-btn" onClick={onCancel} data-testid="nlc-checkin-cancel">
          今はいい
        </button>
      </div>
    </div>
  );
}

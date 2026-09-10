import { useState } from "react";
import type { EmploymentStatus, IntakeForm as IntakeFormData } from "./types";

/**
 * NEW_LIFE_DAY1_ONBOARDING_AND_WORLD_ACTION_FIX_V1 -- the real UI behind Kamiya's "please fill
 * out this form" line. Previously that line only existed as something the live AI could say in
 * free text, with nothing backing it on screen; a tester typing "記入しました" had to take the
 * game's word for it. This makes the action real: what the player writes here is exactly what
 * gets recorded (content/day1.ts's buildIntakeFormWorldFacts), never a diagnosis.
 */
const EMPLOYMENT_OPTIONS: { value: EmploymentStatus; label: string }[] = [
  { value: "working", label: "働いている" },
  { value: "not_working", label: "今は働いていない" },
  { value: "other", label: "その他" },
];

export function IntakeForm({ onSubmit, onCancel }: { onSubmit: (form: IntakeFormData) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus | null>(null);
  const [cameHereReason, setCameHereReason] = useState("");
  const [currentThoughts, setCurrentThoughts] = useState("");
  const [troubles, setTroubles] = useState("");

  function handleSubmit() {
    if (!employmentStatus) return;
    onSubmit({
      name: name.trim(),
      employmentStatus,
      cameHereReason: cameHereReason.trim(),
      currentThoughts: currentThoughts.trim(),
      troubles: troubles.trim(),
    });
  }

  return (
    <div data-testid="nlc-intake-form">
      <p className="nlc-ambient">神谷が一枚の用紙を差し出した。「まずは、こちらにご記入ください」</p>

      <label className="nlc-form-field">
        <span className="nlc-form-label">名前</span>
        <input className="nlc-freetext-input" data-testid="nlc-intake-name" value={name} onChange={(ev) => setName(ev.target.value)} />
      </label>

      <div className="nlc-form-field">
        <span className="nlc-form-label">今の仕事</span>
        <div className="nlc-form-radio-group">
          {EMPLOYMENT_OPTIONS.map((opt) => (
            <label key={opt.value} className="nlc-form-radio">
              <input
                type="radio"
                name="nlc-intake-employment"
                data-testid={`nlc-intake-employment-${opt.value}`}
                checked={employmentStatus === opt.value}
                onChange={() => setEmploymentStatus(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <label className="nlc-form-field">
        <span className="nlc-form-label">この町へ来た理由</span>
        <textarea className="nlc-textarea" data-testid="nlc-intake-reason" value={cameHereReason} onChange={(ev) => setCameHereReason(ev.target.value)} />
      </label>

      <label className="nlc-form-field">
        <span className="nlc-form-label">今のところ考えていること（「特にない」でも可）</span>
        <textarea className="nlc-textarea" data-testid="nlc-intake-thoughts" value={currentThoughts} onChange={(ev) => setCurrentThoughts(ev.target.value)} />
      </label>

      <label className="nlc-form-field">
        <span className="nlc-form-label">困っていること（空欄可）</span>
        <textarea className="nlc-textarea" data-testid="nlc-intake-troubles" value={troubles} onChange={(ev) => setTroubles(ev.target.value)} />
      </label>

      <div className="nlc-choices">
        <button className="nlc-btn" onClick={handleSubmit} disabled={!employmentStatus} data-testid="nlc-intake-submit">
          神谷に渡す
        </button>
        <button className="nlc-leave-btn" onClick={onCancel} data-testid="nlc-intake-cancel">
          やめておく
        </button>
      </div>
    </div>
  );
}

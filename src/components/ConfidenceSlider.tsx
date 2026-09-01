interface ConfidenceSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function ConfidenceSlider({ label, value, onChange }: ConfidenceSliderProps) {
  return (
    <div className="field">
      <label htmlFor="confidence-range">{label}</label>
      <div className="confidence-value" aria-live="polite">
        {value}
      </div>
      <input
        id="confidence-range"
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="muted" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>0（自信なし）</span>
        <span>100（確信あり）</span>
      </div>
    </div>
  );
}

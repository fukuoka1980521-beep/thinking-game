import { useState } from "react";

/**
 * PHASE_12_8_NEW_LIFE_30_DAY_ARC_AND_RETROSPECTIVE_V1 Section 3/4/26 -- the ONLY new screen this
 * phase adds, and it only ever appears once, on Day 30's own end-of-day screen, appended BELOW the
 * ordinary end-of-day narrative (never replacing it -- Day 30 is still an ordinary day first).
 *
 * Section 26 -- deliberately plain: a stack of short paragraphs, the same `nlc-summary-item`
 * register as every other day-end line, no table/chart/number/achievement-list anywhere. Section 4
 * -- the free-text prompt is optional and skippable; nothing analyzes or reacts to what's typed,
 * it is only ever stored verbatim (engine.ts's `submitDay30Reflection`) and never re-read by
 * anything else in this codebase (Section 19 -- the player's own meaning-making, left alone).
 */
export function Day30Retrospective({
  lines,
  onSubmitReflection,
  reflectionSubmitted,
}: {
  lines: string[];
  onSubmitReflection: (text: string) => void;
  reflectionSubmitted: boolean;
}) {
  const [reflectionInput, setReflectionInput] = useState("");
  const [skipped, setSkipped] = useState(false);

  return (
    <div className="nlc-scene-card" data-testid="nlc-day30-retrospective">
      <div className="nlc-summary-list">
        {lines.map((line, i) => (
          <p className="nlc-summary-item" key={i}>
            {line}
          </p>
        ))}
      </div>
      {!reflectionSubmitted && !skipped && (
        <div className="nlc-form-field" data-testid="nlc-day30-reflection-prompt">
          <span className="nlc-form-label">30日前の自分と比べて、今の暮らしをどう感じますか？（自由記述、書かなくても構いません）</span>
          <textarea
            className="nlc-textarea"
            data-testid="nlc-day30-reflection-input"
            value={reflectionInput}
            onChange={(ev) => setReflectionInput(ev.target.value)}
            placeholder="自分の言葉で書いてみる"
          />
          <div className="nlc-choices">
            <button
              className="nlc-btn"
              onClick={() => reflectionInput.trim() && onSubmitReflection(reflectionInput.trim())}
              disabled={!reflectionInput.trim()}
              data-testid="nlc-day30-reflection-submit"
            >
              残す
            </button>
            <button className="nlc-leave-btn" onClick={() => setSkipped(true)} data-testid="nlc-day30-reflection-skip">
              書かない
            </button>
          </div>
        </div>
      )}
      {reflectionSubmitted && <p className="nlc-summary-item" data-testid="nlc-day30-reflection-recorded">（自分の言葉を書き残した。）</p>}
    </div>
  );
}

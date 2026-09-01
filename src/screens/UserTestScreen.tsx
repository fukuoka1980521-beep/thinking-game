import { useState } from "react";
import { ScreenContainer } from "../components/ScreenContainer";

interface Answers {
  q1WantMore: number | null;
  q2Enjoyable: number | null;
  q3QuestionedAi: number | null;
  q4Clarity: number | null;
  q5WantReuse: number | null;
}

interface Props {
  onSubmit: (answers: {
    q1WantMore: number;
    q2Enjoyable: number;
    q3QuestionedAi: number;
    q4Clarity: number;
    q5WantReuse: number;
    freeText: string;
  }) => void;
  onSkip: () => void;
}

/**
 * SEMANTICS FIX Run (Section 16): Q3 was previously phrased as "did you
 * think without just believing the AI" — a normatively loaded question that
 * tells the respondent "doubting is good," contaminating any later use of
 * this survey alongside calibration data. Reworded to ask neutrally whether
 * they reflected at all, without implying which direction is correct.
 * Q4 was previously phrased as "were you confused" (higher = worse), the
 * only one of the 5 questions where a higher number meant something bad —
 * flipped to "was it clear" so all 5 questions consistently read
 * higher = more positive.
 *
 * COMPREHENSION CLEANUP Run (Section 17): Q4 originally asked only about
 * screen operation, which wouldn't have caught "I didn't understand this was
 * a judgment game at all" — the actual observed feedback this Run responds
 * to. Broadened to ask about understanding what to do, not just button
 * operation (the field name `q4Clarity` still fits; only the label changed).
 */
const QUESTIONS: { key: keyof Answers; label: string }[] = [
  { key: "q1WantMore", label: "もう1問やってみたいと思いましたか？" },
  { key: "q2Enjoyable", label: "問題を考えること自体は面白かったですか？" },
  { key: "q3QuestionedAi", label: "AIの意見を見たあと、自分の判断について考えましたか？" },
  { key: "q4Clarity", label: "何をすればよいゲームか分かりやすかったですか？" },
  { key: "q5WantReuse", label: "また別の日に、このゲームを開きたいと思いますか？" },
];

function LikertRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ display: "flex", gap: 8 }} role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            className={`btn btn-choice${value === n ? " selected" : ""}`}
            style={{ flex: 1, textAlign: "center", padding: "10px 0" }}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function UserTestScreen({ onSubmit, onSkip }: Props) {
  const [answers, setAnswers] = useState<Answers>({
    q1WantMore: null,
    q2Enjoyable: null,
    q3QuestionedAi: null,
    q4Clarity: null,
    q5WantReuse: null,
  });
  const [freeText, setFreeText] = useState("");

  const allAnswered = Object.values(answers).every((v) => v !== null);

  function setAnswer(key: keyof Answers, value: number) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <ScreenContainer title="かんたんな感想">
      <p className="muted">1〜5で答えてください（1: まったくそう思わない　5: とてもそう思う）</p>

      {QUESTIONS.map((q) => (
        <LikertRow
          key={q.key}
          label={q.label}
          value={answers[q.key]}
          onChange={(v) => setAnswer(q.key, v)}
        />
      ))}

      <div className="field">
        <label htmlFor="user-test-free-text">
          一番面白かった／分かりにくかったところ（任意）
        </label>
        <textarea
          id="user-test-free-text"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="自由にどうぞ"
        />
      </div>

      <p className="muted">回答はこの端末にのみ保存され、外部には送信されません。</p>

      <button
        type="button"
        className="btn btn-primary"
        disabled={!allAnswered}
        onClick={() =>
          answers.q1WantMore !== null &&
          answers.q2Enjoyable !== null &&
          answers.q3QuestionedAi !== null &&
          answers.q4Clarity !== null &&
          answers.q5WantReuse !== null &&
          onSubmit({
            q1WantMore: answers.q1WantMore,
            q2Enjoyable: answers.q2Enjoyable,
            q3QuestionedAi: answers.q3QuestionedAi,
            q4Clarity: answers.q4Clarity,
            q5WantReuse: answers.q5WantReuse,
            freeText,
          })
        }
      >
        送信する
      </button>
      <button type="button" className="btn-secondary" onClick={onSkip}>
        今回はやめておく
      </button>
    </ScreenContainer>
  );
}

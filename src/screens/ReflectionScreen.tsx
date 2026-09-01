import { useState } from "react";
import type { FirstDecisionInput, SecondDecisionInput } from "../types/log";
import { ScreenContainer } from "../components/ScreenContainer";

interface Props {
  first: FirstDecisionInput;
  second: SecondDecisionInput;
  initialNote?: string;
  onBack: () => void;
  onSubmit: (note: string) => void;
}

export function ReflectionScreen({ first, second, initialNote, onBack, onSubmit }: Props) {
  const [note, setNote] = useState(initialNote ?? "");
  const changed = first.choiceId !== second.choiceId;

  return (
    <ScreenContainer title="振り返り" onBack={onBack}>
      <div className="card">
        <p className="situation-line">
          最初の確信度：{first.confidence} → 再判断後の確信度：{second.confidence}
        </p>
        <p className="situation-line">
          {changed ? "判断は変わりました。" : "判断は変わりませんでした。"}
        </p>
      </div>

      <div className="field">
        <label htmlFor="reflection-note">
          考えが変わった（または変わらなかった）理由を、一言でまとめてみましょう（任意）
        </label>
        <textarea
          id="reflection-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="振り返りメモ"
        />
      </div>

      <button type="button" className="btn btn-primary" onClick={() => onSubmit(note)}>
        結果を見る
      </button>
    </ScreenContainer>
  );
}

import type { CaseData } from "../types/case";
import { ScreenContainer } from "../components/ScreenContainer";

interface Props {
  cases: CaseData[];
  onSelect: (caseId: string) => void;
  onBack: () => void;
}

export function CaseSelectScreen({ cases, onSelect, onBack }: Props) {
  return (
    <ScreenContainer title="ケースを選ぶ" onBack={onBack}>
      <div className="choice-list">
        {cases.map((c) => (
          <button key={c.caseId} type="button" className="btn" onClick={() => onSelect(c.caseId)}>
            <div>{c.title}</div>
            <div className="muted">
              {c.caseId} ・ {c.category}
            </div>
          </button>
        ))}
      </div>
    </ScreenContainer>
  );
}

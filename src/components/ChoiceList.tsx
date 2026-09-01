import type { Choice } from "../types/case";

interface ChoiceListProps {
  choices: Choice[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ChoiceList({ choices, selectedId, onSelect }: ChoiceListProps) {
  return (
    <div className="choice-list" role="radiogroup">
      {choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          role="radio"
          aria-checked={selectedId === choice.id}
          className={`btn btn-choice${selectedId === choice.id ? " selected" : ""}`}
          onClick={() => onSelect(choice.id)}
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}

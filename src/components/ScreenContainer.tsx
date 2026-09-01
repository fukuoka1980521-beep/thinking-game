import type { ReactNode } from "react";

interface ScreenContainerProps {
  title: string;
  onBack?: () => void;
  children: ReactNode;
}

export function ScreenContainer({ title, onBack, children }: ScreenContainerProps) {
  return (
    <div className="screen">
      <div className="screen-header">
        {onBack ? (
          <button type="button" className="btn-secondary" onClick={onBack} aria-label="戻る">
            ← 戻る
          </button>
        ) : (
          <span />
        )}
        <h1 className="screen-title">{title}</h1>
        <span />
      </div>
      {children}
    </div>
  );
}

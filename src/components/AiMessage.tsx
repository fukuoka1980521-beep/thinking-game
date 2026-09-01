import { AI_CHARACTERS } from "../data/aiCharacters";
import type { AiCharacterKey } from "../types/case";

interface AiMessageProps {
  character: AiCharacterKey;
  message: string;
}

export function AiMessage({ character, message }: AiMessageProps) {
  const profile = AI_CHARACTERS[character];
  return (
    <div className="ai-message">
      <div className="ai-avatar" aria-hidden="true">
        {profile.name.slice(0, 1)}
      </div>
      <div>
        <div className="ai-name">
          {profile.name}（{profile.role}）
        </div>
        <p style={{ margin: 0 }}>{message}</p>
      </div>
    </div>
  );
}

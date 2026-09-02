// REAL_AI_DIALOGUE Run (Section 14): separate, versioned key from onboarding
// and from all gameplay-data schemas. Records whether the player has agreed
// to send their written reasoning to an external AI service. "declined" is
// a real, sticky choice (Section 16) — it is not re-asked every case; it
// permanently routes CASE-001 to the local structured-fallback dialogue
// instead (see src/engine/dialogueEngine.ts).
const CONSENT_KEY = "thinking-game:ai-dialogue-consent:v1";

export type AiDialogueConsentStatus = "accepted" | "declined";

interface StoredConsent {
  status: AiDialogueConsentStatus;
  respondedAt: string;
}

export function getAiDialogueConsent(): AiDialogueConsentStatus | null {
  const raw = localStorage.getItem(CONSENT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredConsent;
    return parsed.status === "accepted" || parsed.status === "declined" ? parsed.status : null;
  } catch {
    return null;
  }
}

export function setAiDialogueConsent(status: AiDialogueConsentStatus): void {
  const record: StoredConsent = { status, respondedAt: new Date().toISOString() };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
}

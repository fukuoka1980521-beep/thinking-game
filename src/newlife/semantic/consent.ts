/**
 * Phase 30: NEW LIFE-specific AI-dialogue consent, deliberately a *separate*
 * versioned key from CASE1's (`src/lib/aiDialogueConsent.ts`'s
 * `thinking-game:ai-dialogue-consent:v1`). `docs/DATA_BOUNDARY.md`'s own
 * stated rule is that "each purpose needs its own opt-in" — NEW LIFE's
 * open-ended NPC free talk is a different purpose (and a larger
 * prompt-injection surface, see `functions/newlife-dialogue/README.md`)
 * than CASE1's fixed-field dialogue turn, so accepting one must never imply
 * accepting the other. "declined" is a real, sticky choice, exactly like
 * CASE1's: it permanently routes NEW LIFE free talk to the deterministic
 * router (`npcVoice.ts`'s `answerFreeText`) instead of ever attempting a
 * network call, until the player is asked again in a future browser
 * session where this key isn't set.
 */
const NEWLIFE_CONSENT_KEY = "thinking-game:newlife-ai-dialogue-consent:v1";

export type NewLifeAiDialogueConsentStatus = "accepted" | "declined";

interface StoredNewLifeConsent {
  status: NewLifeAiDialogueConsentStatus;
  respondedAt: string;
}

export function getNewLifeAiDialogueConsent(): NewLifeAiDialogueConsentStatus | null {
  const raw = localStorage.getItem(NEWLIFE_CONSENT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredNewLifeConsent;
    return parsed.status === "accepted" || parsed.status === "declined" ? parsed.status : null;
  } catch {
    return null;
  }
}

export function setNewLifeAiDialogueConsent(status: NewLifeAiDialogueConsentStatus): void {
  const record: StoredNewLifeConsent = { status, respondedAt: new Date().toISOString() };
  localStorage.setItem(NEWLIFE_CONSENT_KEY, JSON.stringify(record));
}

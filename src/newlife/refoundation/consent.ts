/**
 * NEW LIFE refoundation — AI-dialogue consent. A separate, versioned key
 * from both CASE1's (`thinking-game:ai-dialogue-consent:v1`) and legacy NEW
 * LIFE's (`thinking-game:newlife-ai-dialogue-consent:v1`), mirroring
 * `src/newlife/semantic/consent.ts`'s own rationale:
 * `docs/DATA_BOUNDARY.md`'s stated rule is "each purpose needs its own
 * opt-in." The refoundation vertical slice is a distinct purpose (V13-V24
 * ontology, a theater-conflict case, different NPCs) from both existing
 * consent scopes, so accepting either of those must never imply accepting
 * this one, and vice versa.
 *
 * "declined" is a real, sticky choice: it permanently routes the
 * refoundation UI to the deterministic action-button path
 * (`NullSemanticInterpreterAdapter`/`NullNpcGenerationAdapter`) instead of
 * ever attempting a network call, until the player is asked again in a
 * future browser session where this key isn't set.
 */
const REFOUNDATION_CONSENT_KEY = "thinking-game:newlife-refoundation-ai-consent:v1";

export type RefoundationAiDialogueConsentStatus = "accepted" | "declined";

interface StoredRefoundationConsent {
  status: RefoundationAiDialogueConsentStatus;
  respondedAt: string;
}

export function getRefoundationAiDialogueConsent(): RefoundationAiDialogueConsentStatus | null {
  const raw = localStorage.getItem(REFOUNDATION_CONSENT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredRefoundationConsent;
    return parsed.status === "accepted" || parsed.status === "declined" ? parsed.status : null;
  } catch {
    return null;
  }
}

export function setRefoundationAiDialogueConsent(status: RefoundationAiDialogueConsentStatus): void {
  const record: StoredRefoundationConsent = { status, respondedAt: new Date().toISOString() };
  localStorage.setItem(REFOUNDATION_CONSENT_KEY, JSON.stringify(record));
}

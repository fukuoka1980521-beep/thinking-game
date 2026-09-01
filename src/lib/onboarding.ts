// COMPREHENSION CLEANUP Run (Section 4): this is UI onboarding state, not
// gameplay behavior — kept in its own key, never merged into TrajectoryLog
// or any other gameplay-data schema. Local-only, like everything else
// (docs/DATA_BOUNDARY.md).
const ONBOARDING_KEY = "thinking-game:onboarding:v1";

export function hasSeenOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) !== null;
}

export function markOnboardingSeen(): void {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify({ seenAt: new Date().toISOString() }));
}

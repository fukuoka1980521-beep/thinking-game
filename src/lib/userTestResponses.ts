import type { UserTestResponse } from "../types/log";

// Bumped to v2 when q4Confusion was renamed to q4Clarity with its scale
// direction flipped (SEMANTICS FIX Run, Section 16/19) — v1 responses used
// the opposite direction for that one field, so silently reading them under
// the new field name would misinterpret their meaning. This is disposable
// local survey data; old v1 responses are simply left behind.
/** Local-only optional post-play survey (Section 8). Never transmitted. */
const USER_TEST_KEY = "thinking-game:user-test-responses:v2";

export function saveUserTestResponse(response: UserTestResponse): void {
  const responses = loadUserTestResponses();
  responses.push(response);
  localStorage.setItem(USER_TEST_KEY, JSON.stringify(responses));
}

export function loadUserTestResponses(): UserTestResponse[] {
  const raw = localStorage.getItem(USER_TEST_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UserTestResponse[]) : [];
  } catch {
    return [];
  }
}

import type { UserTestResponse } from "../types/log";

/** Local-only optional post-play survey (Section 8). Never transmitted. */
const USER_TEST_KEY = "thinking-game:user-test-responses:v1";

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

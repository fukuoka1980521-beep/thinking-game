import type { InProgressSession, TrajectoryLog } from "../types/log";

// Bumped to v2 with the trajectory-schema spec amendment; the v1 shape is
// incompatible, and this data is disposable local practice history, so we
// simply start a fresh namespace rather than migrating.
const IN_PROGRESS_KEY = "thinking-game:in-progress:v2";
const COMPLETED_LOGS_KEY = "thinking-game:completed-logs:v2";

/**
 * All persistence in this module is local-only (localStorage). No network
 * calls are made anywhere in this app — see docs/SAFETY_PRINCIPLES.md.
 */

export function saveInProgressSession(session: InProgressSession): void {
  localStorage.setItem(IN_PROGRESS_KEY, JSON.stringify(session));
}

export function loadInProgressSession(): InProgressSession | null {
  const raw = localStorage.getItem(IN_PROGRESS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as InProgressSession;
  } catch {
    return null;
  }
}

export function clearInProgressSession(): void {
  localStorage.removeItem(IN_PROGRESS_KEY);
}

export function loadCompletedLogs(): TrajectoryLog[] {
  const raw = localStorage.getItem(COMPLETED_LOGS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TrajectoryLog[]) : [];
  } catch {
    return [];
  }
}

export function appendCompletedLog(log: TrajectoryLog): void {
  const logs = loadCompletedLogs();
  logs.push(log);
  localStorage.setItem(COMPLETED_LOGS_KEY, JSON.stringify(logs));
}

export function createSessionId(): string {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createPlayRunId(): string {
  return `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

import type { MetricEvent, MetricEventType } from "../types/log";

/**
 * Local-only funnel events (validation build Section 5/9). Never
 * transmitted anywhere — see docs/USER_TEST_GUIDE.md for how a tester
 * reads these back after a session, via the browser's own devtools.
 */
const METRICS_KEY = "thinking-game:metrics:v1";

export function recordMetricEvent(type: MetricEventType, playRunId: string, caseId?: string): void {
  const events = loadMetricEvents();
  const event: MetricEvent = { type, timestamp: new Date().toISOString(), playRunId, caseId };
  events.push(event);
  localStorage.setItem(METRICS_KEY, JSON.stringify(events));
}

export function loadMetricEvents(): MetricEvent[] {
  const raw = localStorage.getItem(METRICS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MetricEvent[]) : [];
  } catch {
    return [];
  }
}

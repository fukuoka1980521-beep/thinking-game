/**
 * Local-only telemetry for the CASE1 external-test candidate (PHASE 4.3 Section19, extended by
 * PHASE 4.4 Section22). Own storage key, own event union -- deliberately not merged into
 * src/lib/metrics.ts / MetricEventType so this experimental slice can't affect the existing,
 * tested funnel-event schema. No personal data; never transmitted anywhere.
 */

export type Case1CMetricType =
  | "CASE1_START"
  | "FIRST_INTERACTION"
  | "CLUE_FOUND"
  | "OPTIONAL_OBJECT_INTERACTION"
  | "OPTIONAL_NPC_INTERACTION"
  | "INVESTIGATION_ORDER"
  | "HUMAN_PREDICTION"
  | "CASE1_COMPLETE"
  | "NEXT_CASE_INTENT"
  | "FEEDBACK_SUBMITTED"
  /**
   * PHASE 4.6 (Section6/7): Owner manually logs this when they had to step in because a tester
   * was stuck. Never inferred automatically -- only an explicit Owner action records it.
   */
  | "OWNER_ASSIST";

export interface Case1CMetricEvent {
  type: Case1CMetricType;
  timestamp: string;
  detail?: string;
  /** PHASE 4.6: groups one play-through's events for the Owner result view (testResults.ts). */
  sessionId?: string;
}

const METRICS_KEY = "thinking-game:case1c-metrics:v1";

export function recordCase1CMetric(type: Case1CMetricType, detail?: string, sessionId?: string): void {
  const events = loadCase1CMetrics();
  events.push({ type, timestamp: new Date().toISOString(), detail, sessionId });
  localStorage.setItem(METRICS_KEY, JSON.stringify(events));
}

export function loadCase1CMetrics(): Case1CMetricEvent[] {
  const raw = localStorage.getItem(METRICS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Case1CMetricEvent[]) : [];
  } catch {
    return [];
  }
}

export function resetCase1CMetricsForTesting(): void {
  localStorage.removeItem(METRICS_KEY);
}

/** PHASE 4.6: one id per Case1CApp mount (one tester's play-through), no crypto dependency. */
export function newCase1CSessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

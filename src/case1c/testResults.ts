/**
 * PHASE 4.6 (OWNER_CASE1_EXTERNAL_TEST_PACKAGE_READY, Section12/13/14/23): derives one row per
 * tester session for the Owner-only local result view. Deliberately does not introduce a new
 * storage table -- metrics/case-file/feedback (all local-only, no PII) are already the raw data;
 * this module only groups and reads them by sessionId. Code never computes PASS/FAIL/a success
 * rate (Section15) -- it exposes the numbers and leaves judgment to Owner + 参謀.
 */
import { loadCase1CMetrics, type Case1CMetricEvent } from "./metrics";
import { loadAllCase1CRecords, loadAllCase1CFeedback } from "./storage";
import type { TesterType } from "./types";

export interface Case1CTestResultRow {
  sessionId: string;
  testerCode: string | null;
  testerType: TesterType | null;
  startedAt: string | null;
  completedAt: string | null;
  completed: boolean;
  durationSeconds: number | null;
  optionalObjectCount: number;
  optionalNpcCount: number;
  investigationOrder: string[];
  humanPrediction: string | null;
  nextCaseIntent: boolean;
  ownerAssistCount: number;
  feedback: {
    q1Fun: number;
    q2Curiosity: number;
    q3SelfInvestigated: number;
    q4Aha: number;
    q5WantNext: number;
    freeText: string;
    characterMemory: string;
  } | null;
}

function countByType(events: Case1CMetricEvent[], type: Case1CMetricEvent["type"]): number {
  return events.filter((e) => e.type === type).length;
}

/** Groups this browser's stored metrics/case-file/feedback into one row per play-through. */
export function buildCase1TestResultRows(): Case1CTestResultRow[] {
  const metrics = loadCase1CMetrics();
  const records = loadAllCase1CRecords();
  const feedbackAll = loadAllCase1CFeedback();

  const sessionIds = new Set<string>();
  for (const e of metrics) if (e.sessionId) sessionIds.add(e.sessionId);
  for (const r of records) if (r.sessionId) sessionIds.add(r.sessionId);
  for (const f of feedbackAll) if (f.sessionId) sessionIds.add(f.sessionId);

  const rows: Case1CTestResultRow[] = [];
  for (const sessionId of sessionIds) {
    const events = metrics.filter((e) => e.sessionId === sessionId);
    const record = records.find((r) => r.sessionId === sessionId) ?? null;
    const feedback = feedbackAll.find((f) => f.sessionId === sessionId) ?? null;

    const startEvent = events.find((e) => e.type === "CASE1_START") ?? null;
    const completeEvent = events.find((e) => e.type === "CASE1_COMPLETE") ?? null;
    const startedAt = startEvent?.timestamp ?? null;
    const completedAt = completeEvent?.timestamp ?? record?.completedAt ?? null;

    let durationSeconds: number | null = null;
    if (startedAt && completedAt) {
      const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
      if (Number.isFinite(ms) && ms >= 0) durationSeconds = Math.round(ms / 1000);
    }

    rows.push({
      sessionId,
      testerCode: record?.testerCode || null,
      testerType: record?.testerType ?? feedback?.testerType ?? null,
      startedAt,
      completedAt,
      completed: completeEvent !== null,
      durationSeconds,
      optionalObjectCount: countByType(events, "OPTIONAL_OBJECT_INTERACTION"),
      optionalNpcCount: countByType(events, "OPTIONAL_NPC_INTERACTION"),
      investigationOrder: events.filter((e) => e.type === "INVESTIGATION_ORDER").map((e) => e.detail ?? ""),
      humanPrediction: events.find((e) => e.type === "HUMAN_PREDICTION")?.detail ?? null,
      nextCaseIntent: events.some((e) => e.type === "NEXT_CASE_INTENT"),
      ownerAssistCount: countByType(events, "OWNER_ASSIST"),
      feedback: feedback
        ? {
            q1Fun: feedback.q1Fun,
            q2Curiosity: feedback.q2Curiosity,
            q3SelfInvestigated: feedback.q3SelfInvestigated,
            q4Aha: feedback.q4Aha,
            q5WantNext: feedback.q5WantNext,
            freeText: feedback.freeText,
            characterMemory: feedback.characterMemory,
          }
        : null,
    });
  }

  rows.sort((a, b) => (a.startedAt ?? "").localeCompare(b.startedAt ?? ""));
  return rows;
}

export function formatCase1Duration(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * PHASE 4.7 (Section9/10/11): an external tester's own device never reaches Owner's
 * `?case1results` view -- localStorage is per-device, not synced anywhere (Section7). This
 * builds the same fields Owner's result view shows, as one plain-text block the tester can copy
 * (DONE screen) and paste back over LINE/etc. sessionId is intentionally omitted -- Section10
 * allows dropping internal-only values Owner's analysis does not need, and a raw id would be the
 * one part of this that reads as "technical" to a non-technical tester.
 */
export function buildCase1TestResultCopyText(sessionId: string): string {
  const row = buildCase1TestResultRows().find((r) => r.sessionId === sessionId);
  if (!row) return "";
  const f = row.feedback;
  const lines = [
    "[CASE1テスト結果]",
    `tester_code: ${row.testerCode || "(未入力)"}`,
    `tester_type: ${row.testerType ?? "(未回答)"}`,
    `duration: ${formatCase1Duration(row.durationSeconds)}`,
    `completed: ${row.completed ? "YES" : "NO"}`,
    `optional_object_count: ${row.optionalObjectCount}`,
    `optional_npc_count: ${row.optionalNpcCount}`,
    `investigation_order: ${row.investigationOrder.length > 0 ? row.investigationOrder.join(", ") : "(なし)"}`,
    `human_prediction: ${row.humanPrediction ?? "(なし)"}`,
    `next_case_intent: ${row.nextCaseIntent ? "YES" : "NO"}`,
    `feedback_1_5: ${f?.q1Fun ?? "—"}`,
    `feedback_2_5: ${f?.q2Curiosity ?? "—"}`,
    `feedback_3_5: ${f?.q3SelfInvestigated ?? "—"}`,
    `feedback_4_5: ${f?.q4Aha ?? "—"}`,
    `feedback_5_5: ${f?.q5WantNext ?? "—"}`,
    `character_memory: ${f?.characterMemory || "(なし)"}`,
    `free_comment: ${f?.freeText || "(なし)"}`,
  ];
  return lines.join("\n");
}

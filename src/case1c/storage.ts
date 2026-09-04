/** Case file + feedback persistence for the CASE1 external-test candidate. Own storage keys. */
import type { CaseFileRecord, FeedbackAnswers } from "./types";

const CASE_FILE_KEY = "thinking-game:case1c-casefile:v1";
const FEEDBACK_KEY = "thinking-game:case1c-feedback:v1";

/**
 * PHASE 4.6 (Section12/14): a small external test round plays several testers back to back on
 * the same device, so this key now holds every completed case file, oldest first -- overwriting
 * a single record would silently discard everyone but the last tester. loadCase1CRecord() keeps
 * its old single-record contract (most recent) for existing callers/tests.
 */
export function saveCase1CRecord(record: CaseFileRecord): void {
  const all = loadAllCase1CRecords();
  all.push(record);
  localStorage.setItem(CASE_FILE_KEY, JSON.stringify(all));
}

export function loadAllCase1CRecords(): CaseFileRecord[] {
  const raw = localStorage.getItem(CASE_FILE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CaseFileRecord[]) : [];
  } catch {
    return [];
  }
}

export function loadCase1CRecord(): CaseFileRecord | null {
  const all = loadAllCase1CRecords();
  return all.length > 0 ? all[all.length - 1] : null;
}

export function saveCase1CFeedback(answers: FeedbackAnswers): void {
  const all = loadAllCase1CFeedback();
  all.push(answers);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all));
}

export function loadAllCase1CFeedback(): FeedbackAnswers[] {
  const raw = localStorage.getItem(FEEDBACK_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FeedbackAnswers[]) : [];
  } catch {
    return [];
  }
}

export function resetCase1CForTesting(): void {
  localStorage.removeItem(CASE_FILE_KEY);
  localStorage.removeItem(FEEDBACK_KEY);
}

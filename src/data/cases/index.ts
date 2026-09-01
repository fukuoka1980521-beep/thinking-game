import type { CaseData } from "../../types/case";
import { case001 } from "./case-001";
import { case002 } from "./case-002";
import { case003 } from "./case-003";
import { case004 } from "./case-004";
import { case005 } from "./case-005";

export const CASES: CaseData[] = [case001, case002, case003, case004, case005];

export function getCaseById(caseId: string): CaseData | undefined {
  return CASES.find((c) => c.caseId === caseId);
}

export function getTodaysCaseId(): string {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return CASES[dayIndex % CASES.length].caseId;
}

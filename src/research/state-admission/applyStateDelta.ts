import type { AdmissionResult } from "./types";

/**
 * PHASE 10.18: applies a fact delta to a prior state array ONLY when the admission decision is
 * ADMIT_AUTOMATICALLY. Every other decision (SCENE_LOCAL_ONLY, REQUIRE_STRATEGIST_REVIEW, REJECT)
 * leaves the returned state array unchanged from `priorFacts` -- this microtest does not implement a
 * review-approval flow (Section 15: no persistent storage service), so "not yet admitted" simply
 * means "state is unchanged," which is the correct, safe default.
 */
export function applyStateDelta(priorFacts: string[], admission: AdmissionResult, delta: { added: string[]; removed?: string[] }): string[] {
  if (admission.decision !== "ADMIT_AUTOMATICALLY") return priorFacts;
  const removed = new Set(delta.removed ?? []);
  const kept = priorFacts.filter((f) => !removed.has(f));
  const added = delta.added.filter((f) => !kept.includes(f));
  return [...kept, ...added];
}

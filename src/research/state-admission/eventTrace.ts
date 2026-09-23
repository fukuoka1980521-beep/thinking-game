import type { AdmissionResult, ClassificationInput, ProvenanceResult, SourceType, StateAdmissionEventRecord } from "./types";

let eventCounter = 0;

/** Resets the internal event counter -- test-only, so eventId ordering is deterministic per test file. */
export function resetEventCounter(): void {
  eventCounter = 0;
}

function sourceActionOf(input: ClassificationInput): string {
  if (input.sourceType === "PLAYER_STRUCTURED_ACTION") return input.actionLabel;
  if (input.sourceType === "CANONICAL_STATE") return input.fact;
  return input.claimText;
}

/**
 * PHASE 10.18 Section 6: one traceability record per admitted-or-not event. No hidden LLM reasoning
 * -- every field here is a plain value already computed by classifyProvenance/decideAdmission/
 * applyStateDelta, never re-derived or summarized by a model.
 */
export function recordEvent(input: ClassificationInput, provenance: ProvenanceResult, admission: AdmissionResult, priorState: string[], resultingState: string[], delta: { added: string[]; removed?: string[] }): StateAdmissionEventRecord {
  eventCounter += 1;
  const sourceType: SourceType = input.sourceType;
  return {
    eventId: `evt_${eventCounter}`,
    sourceType,
    sourceAction: sourceActionOf(input),
    provenanceClass: provenance.provenanceClass,
    priorState,
    admissionDecision: admission.decision,
    stateDelta: { added: delta.added, removed: delta.removed ?? [] },
    resultingState,
    reason: `${provenance.reason}; ${admission.reason}`,
  };
}

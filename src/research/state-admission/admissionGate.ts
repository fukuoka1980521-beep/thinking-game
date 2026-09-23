import type { AdmissionResult, ClassificationInput, ProvenanceClass } from "./types";

/**
 * PHASE 10.18 Section 4: the minimum admission-decision mapping. Deliberately a pure function of
 * the provenance class (+ determinism flag for PLAYER_CHOSEN_FACT) -- no hidden heuristics, no LLM
 * judgment call here. This is the gate, not the classifier (see classifyProvenance.ts).
 */
export function decideAdmission(provenanceClass: ProvenanceClass, input: ClassificationInput): AdmissionResult {
  switch (provenanceClass) {
    case "CANONICAL_FACT":
      return { decision: "ADMIT_AUTOMATICALLY", reason: "already authoritative" };

    case "PLAYER_CHOSEN_FACT": {
      const deterministic = input.sourceType === "PLAYER_STRUCTURED_ACTION" && input.deterministic;
      return deterministic
        ? { decision: "ADMIT_AUTOMATICALLY", reason: "structured PLAYER action + deterministic game rules established this outcome" }
        : { decision: "REQUIRE_STRATEGIST_REVIEW", reason: "PLAYER action's outcome was not deterministically established by game rules" };
    }

    case "GENERATED_EPHEMERAL_DETAIL":
      return { decision: "SCENE_LOCAL_ONLY", reason: "temporally scoped -- usable in this rendered scene, must not persist beyond it" };

    case "GENERATED_PERSISTENT_CANDIDATE":
      return { decision: "REQUIRE_STRATEGIST_REVIEW", reason: "durable-sounding, unestablished claim -- must not auto-admit into world state" };

    case "INVALID_INVENTION":
      return { decision: "REJECT", reason: "contradicts canon or violates a design prohibition" };
  }
}

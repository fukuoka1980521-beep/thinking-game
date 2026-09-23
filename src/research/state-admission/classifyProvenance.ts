import type { ClassificationInput, ProvenanceResult } from "./types";

/**
 * PHASE 10.18 Section 2: language is never the source of truth when the game already knows what
 * PLAYER chose. A `PLAYER_STRUCTURED_ACTION` input is classified PLAYER_CHOSEN_FACT purely from its
 * structured shape -- this function never reads or infers from generated Japanese prose.
 */
export function classifyProvenance(input: ClassificationInput): ProvenanceResult {
  if (input.sourceType === "CANONICAL_STATE") {
    return { provenanceClass: "CANONICAL_FACT", reason: `already-established canonical state (${input.source})` };
  }

  if (input.sourceType === "PLAYER_STRUCTURED_ACTION") {
    return {
      provenanceClass: "PLAYER_CHOSEN_FACT",
      reason: `structured PLAYER action "${input.actionLabel}" -- the game's own deterministic rules, not language, produced the resulting facts`,
    };
  }

  // GENERATED_TEXT
  if (input.violatesDesignProhibition) {
    return { provenanceClass: "INVALID_INVENTION", reason: "violates a design prohibition (e.g. NEW_LIFE_SCENARIO_BIBLE_V1.md Section 13)" };
  }
  if (input.contradictsCanonicalFact) {
    return { provenanceClass: "INVALID_INVENTION", reason: "contradicts an already-established canonical fact" };
  }
  if (input.matchesCanonicalFact) {
    return { provenanceClass: "CANONICAL_FACT", reason: "restates an already-established canonical fact -- no new provenance risk" };
  }
  if (input.isTemporallyScoped) {
    return { provenanceClass: "GENERATED_EPHEMERAL_DETAIL", reason: 'scoped to "today"/"this moment" -- asserts nothing durable' };
  }
  return {
    provenanceClass: "GENERATED_PERSISTENT_CANDIDATE",
    reason: "durable-sounding claim, absent from canon, contradicts nothing -- requires review before it may ground future scenes",
  };
}

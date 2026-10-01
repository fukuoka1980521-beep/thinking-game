# Preregistration Draft 窶・Methodological Framing Study A

Status: **DRAFT, NOT FROZEN, WRITTEN BEFORE PILOT SCORING RESULTS WERE INSPECTED**

## Research question

When the research objective, model, context, tool access, and output structure are held fixed, does randomized methodological framing change the observable structure of an LLM-generated research plan?

## Design

Balanced factorial candidate:

- 7 method families:
  - GENERIC
  - DIFFERENTIAL
  - BAYESIAN
  - FALSIFICATION
  - CAUSAL
  - STATE_SPACE
  - SOFTWARE_TESTING

- 2 instruction depths:
  - LABEL_ONLY
  - OPERATIONAL

Total: 14 conditions.

All runs are fresh independent sessions with no tools and no external evidence.

## Hypotheses fixed at draft stage

### H1 窶・label-only methodological-family effect

With only the methodological label changed, research-plan structure differs systematically across method families beyond within-condition stochastic variation.

This is the primary test of methodological framing because it does not directly prescribe method-specific design operations.

Falsifying pattern:
- among LABEL_ONLY conditions, between-family structural distance is not meaningfully larger than within-condition distance.

### H2 窶・instruction-depth effect

Operational framing produces stronger expression of methodology-specific design operations than label-only framing.

Falsifying pattern:
- operational and label-only plans are structurally indistinguishable after controlling for family.

### H3 窶・family-by-depth interaction and non-uniform profiles

Operational detail may amplify framing, but different method families should produce different component-wise plan-state profiles rather than a single generic 窶徇ore detailed plan窶・effect.

Falsifying pattern:
- operational instructions only increase generic detail across all families, with no reproducible family-specific profile or family-by-depth interaction.

### H4 窶・downstream signature recoverability

After exact method labels are redacted, an independent blinded classifier can recover method family from downstream research-plan structure above chance.

Falsifying pattern:
- classification remains at chance after label redaction.

## Critical non-claims

The study does not rank political, scientific, or philosophical methodologies by value.
It does not establish internal neural-state differences.
It does not show that one method produces objectively better science.
It does not establish generality beyond the tested task/model until replicated.

## Measurement freeze dependency

The final primary Research Plan State fields will be frozen only after the non-counted pilot is used to:
- remove unreliable score fields;
- discretize ambiguous count fields where necessary;
- identify floor/ceiling fields;
- finalize scorer instructions.

Pilot outcomes may refine measurement but must not reverse the direction or meaning of H1-H4.

## Sample-size dependency

Final repetitions per cell will be chosen using pilot-observed within-condition variability and practical precision, with the rule documented before any counted Study A run.

No counted run may begin until:
- method bank frozen;
- task prompt frozen;
- scoring schema frozen;
- analysis code tested on synthetic/dummy data;
- endpoint protocol frozen.

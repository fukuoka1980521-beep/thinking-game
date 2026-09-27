# Prospective Protocol — Operational Latent State Reliability (OLSR) v0.1

**Status:** ACTIVE / PROSPECTIVE / EXPLORATORY  
**Started:** 2026-09-27  
**Primary owner:** Shinobu Fukuoka  
**Research lineage:** STGR / LSCB publication DOI 10.5281/zenodo.22983828

## 1. Research question

Do Local Task Momentum, cross-chat answer variance, and hallucination cases share recurring lower-dimensional **operational latent structure** that is not obvious from hand-written labels alone? Here, operational latent structure is inferred from observable workflow evidence and must not be conflated with model-internal neural hidden states.

This phase does not ask whether one latent factor causes another. It asks whether useful hidden axes or mixtures can be discovered from naturally occurring evidence.

## 2. Three-layer model

### Layer 1 — Observed

Record only what is directly observed or supportable from evidence:
- prompt / task fingerprint
- source set and source identities
- state transition
- proposed next operation
- factual claims
- contradictions
- tool outputs
- actual outcome
- material impact

### Layer 2 — Latent Structure

Apply multiple exploratory decompositions:
1. **Structured-feature SVD** — inspect dominant covariance directions across observed features.
2. **Semantic-vector SVD** — when embedding vectors are available, inspect lower-dimensional semantic axes.
3. **LDA-style topic mixture** — inspect whether cases appear as mixtures of recurring textual themes.

The purpose is to generate candidate latent factors, not to assign a true psychological or causal label.

### Layer 3 — Causal Test

Not part of v0.1. A later preregistered phase may manipulate a candidate factor or gate and test downstream effects.

## 3. Eligible natural cases

A case is eligible when it arises naturally during ordinary authorized work and at least one of the following is material:

- Local Task Momentum / Global Reassessment trigger
- materially different answer to a materially same question
- unsupported factual claim or near miss
- source/version/time identity mismatch affecting a conclusion
- tool-result misread or overgeneralization
- context blending or memory contamination
- premature closure / scope switch / destructive-operation pressure

Do not capture trivial wording changes.

## 4. Case identity and duplication

One case represents one decision/claim boundary. Repeated messages from the same unresolved boundary remain one case unless new independent evidence creates a materially new state.

Duplicate or derivative cases are linked using `parent_case_id` rather than counted as independent.

## 5. Observed feature vocabulary

Values are `1` = observed, `0` = explicitly not observed, `null` = unknown/not assessed.

Core features:

- local_success_signal
- local_failure_signal
- completion_signal
- repeated_repair
- evidence_gap
- measurement_conflict
- source_identity_divergence
- temporal_freshness_mismatch
- context_delta
- memory_context_contamination
- unsupported_inference_as_fact
- tool_result_partiality_or_misread
- source_hierarchy_conflict
- entity_disambiguation_failure
- confidence_calibration_failure
- destructive_operation_candidate
- scope_switch_pressure
- closure_pressure
- user_value_pressure
- goal_relation_ambiguity
- external_reality_gap
- human_observation_signal

Do not manufacture values to complete the matrix. Unknown is preserved.

## 6. Track labels

Track labels are descriptive, not latent-factor labels:

- `LTM`
- `ANSWER_VARIANCE`
- `HALLUCINATION`
- `MULTI_TRACK`

A case may be `MULTI_TRACK`.

## 7. Answer-variance comparison unit

Compare:
- core claims
- evidence basis
- decision boundary
- next action

Do not treat wording, tone, length, or example choice alone as instability.

Classify visible differences first as:
- JUSTIFIED_CONTEXT_DELTA
- JUSTIFIED_FRESH_EVIDENCE
- AMBIGUITY_RESOLUTION
- MODEL_OR_CAPABILITY_CHANGE
- SOURCE_OR_PROVENANCE_VARIANCE
- UNJUSTIFIED_REASONING_VARIANCE
- UNKNOWN

## 8. Hallucination multi-lens view

Do not force a single cause. Candidate views may co-occur:

- retrieval_or_evidence_gap
- source_identity_or_version_mismatch
- temporal_freshness_mismatch
- context_blending_or_memory_contamination
- unsupported_inference_presented_as_fact
- completion_or_closure_pressure
- local_task_momentum
- tool_result_misread
- entity_disambiguation_failure
- source_of_truth_hierarchy_conflict
- confidence_or_uncertainty_calibration_failure
- user_value_or_helpfulness_pressure
- other
- unknown

The previous hypothesis that value/cost scoring alone substantially suppresses hallucination is not treated as a supported general rule.

## 9. Claim-state discipline

Material claims should be marked where practical as:

- VERIFIED
- SUPPORTED_INFERENCE
- UNVERIFIED
- CONFLICTED
- UNKNOWN

UNKNOWN is a valid state and must not be filled merely to complete an answer.

## 10. Latent analysis rules

### 10.1 Structured-feature SVD

**Current rule after Protocol Amendment 001:** unknownness is not encoded in the same semantic feature space. Semantic feature structure and missingness structure are analyzed separately. The semantic decomposition uses observed-feature coverage rules and bounded decomposition-time imputation; missingness receives its own diagnostic analysis.

Interpret components using:
- strongest positive/negative loadings
- which cases occupy extreme coordinates
- whether the component recurs after more natural cases arrive

Do not name a component from one attractive example.

### 10.2 Semantic embedding decomposition

If a case contains a precomputed embedding, the analyzer may perform SVD on the embedding matrix.

The analyzer does not call an external embedding API. This prevents silent model/version drift. Each embedding must carry:
- provider/model identifier
- embedding dimension
- generation date/version where available

Different embedding models are not pooled as if they share one coordinate system.

### 10.3 LDA topic-mixture lens

LDA may be run over joined case text only as an exploratory mixture model.

Topic proportions do not prove causes. Topic numbers and labels are analyst conveniences, not ontological truths.

### 10.4 Cross-method convergence

A candidate latent factor becomes more interesting when:
- a similar pattern appears in structured-feature SVD and semantic/text analysis, or
- it recurs in later natural cases, or
- it spans more than one project / track.

Cross-method agreement is supporting evidence, not proof.

## 11. Anti-overfit rules

- Do not choose the number of components/topics solely because it yields an attractive story.
- Report sensitivity across a small bounded range where feasible.
- Preserve null/unknown rather than inventing values.
- Do not retroactively rewrite case features after seeing a decomposition unless a documented factual error is found.
- If a case is corrected, retain the old version and correction reason.
- Do not interpret components as population prevalence.

## 12. Promotion into Development OS

A latent factor is not promoted into a mandatory rule merely because it is visible in a decomposition.

Promotion requires the existing Development OS rule-promotion logic:
- recurrence
- material impact
- cross-project applicability
- false-positive cost
- intervention effectiveness
- falsification condition

## 13. First practical target

The first useful question is:

> Are answer variance, hallucination, and Local Task Momentum partly different surface expressions of a smaller set of recurring hidden conditions such as evidence disconnection, source-identity loss, closure pressure, or context-state mismatch?

This remains an open question until evidence accumulates.

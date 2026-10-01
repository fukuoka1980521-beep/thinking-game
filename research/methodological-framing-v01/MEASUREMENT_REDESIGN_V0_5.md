# Measurement Redesign v0.5 — Binary Operational Ontology

Status: instrument development; counted Study A remains 0.

## Why v0.4 did not freeze

v0.4 complete-response calibration passed structural separability but failed the measurement gate:
- structural separation: 0.130511 — PASS;
- GREEN binary fields: 6;
- usable method families: 3;
- count fields: one GREEN, one AMBER, one RED;
- Study A: NO_GO.

The failure is therefore primarily a measurement-reliability problem, not absence of observable between-method structure.

## Design rule

v0.5 removes subjective count coding from the confirmatory state vector and replaces ambiguous concepts with stricter yes/no operational relations.

The redesign is based only on aggregate v0.4 reliability/prevalence diagnostics. Individual plan content and condition-labelled disagreements are not used to tune the rubric.

A fresh 42-plan calibration set will validate v0.5.

## General binary fields

1. primary_endpoint_explicit
   - True only when an outcome/metric is explicitly designated primary, main, core, or the principal basis for the conclusion.

2. sample_size_or_precision_rationale_present
   - True only when sample size/repetitions are justified by power, precision, uncertainty, variance, detectable effect, or equivalent quantitative rationale.

3. explicit_null_hypothesis_present
   - True only when a concrete no-effect/no-difference/null proposition is stated.

4. concrete_decision_or_stop_rule_present
   - True only when a specific observable threshold/event is explicitly linked to a research decision or stopping action.

## Method signatures

### DIFFERENTIAL
- baseline_noise_floor_explicit
- graded_single_factor_perturbation_explicit

### BAYESIAN
- quantified_prior_or_prior_distribution_explicit
- posterior_or_quantified_belief_update_explicit

### FALSIFICATION
- claim_observation_rejection_pair_explicit
- active_disconfirmation_search_explicit

### CAUSAL
- causal_estimand_explicit
- identification_strategy_assumption_pair_explicit

### STATE_SPACE
- time_indexed_observable_state_components_explicit
- transition_relation_explicit

### SOFTWARE_TESTING
- concrete_test_case_expected_relation_pair_explicit
- repeatable_regression_harness_explicit

## Why binary only

Research 1 already showed that richer state vectors create measurement error. v0.4 repeated the same lesson at the research-plan level.

A reliable binary relation is scientifically preferable to a richer but unstable count.

Counts can remain exploratory later, but they do not gate Study A.

## v0.5 validation rule

v0.5 is a fresh calibration sample. It is not a rescore of v0.4.

No counted Study A plan is generated until v0.5 passes its frozen gate.

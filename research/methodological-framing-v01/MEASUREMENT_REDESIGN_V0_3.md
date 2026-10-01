# Measurement Redesign v0.3

Status: post-pilot design decision; not frozen; no counted data.

## Decision from v0.2 pilot

The same 21 non-counted plans were rescored with the redesigned v0.2 instrument.

Observed improvement:
- v0.1 between-minus-within binary Hamming separation: 0.0415
- v0.2 between-minus-within binary Hamming separation: 0.1308
- v0.2 gate: USEFUL_PILOT_SEPARABILITY
- v0.2 binary reliability: GREEN=10, AMBER=2, RED=5, DEGENERATE=5
- v0.2 count reliability: GREEN=3/3

This is sufficient to continue instrument development, but not sufficient to freeze Study A with every v0.2 field.

## Primary rule for v0.3

A confirmatory primary field must be:
1. operationally interpretable;
2. reliably scoreable in the pilot or explicitly recalibrated;
3. not almost always present or absent on the flagship task;
4. not merely a restatement of the method label.

Fields failing these requirements are removed from the primary vector rather than rescued by larger N.

## Retain as primary general-design outcomes

Count outcomes:
- problem_decomposition_count
- explicit_primary_endpoint_count
- falsification_criterion_count

Binary outcome:
- sample_size_or_power_rationale_present

These were GREEN in v0.2.

## Retain as secondary / recalibration candidates

- explicit_null_hypothesis_present 窶・AMBER
- strict_stopping_threshold_present 窶・AMBER

They may be reported only if v0.3 rescoring or human calibration reaches the preregistered reliability gate.

## Demote to quality checks

- measurement_reliability_plan_present

Reason: prevalence 1.0 in the pilot. It is scientifically useful but non-discriminating for T1.

## Method-signature outcomes retained for confirmatory use

### DIFFERENTIAL
Primary:
- baseline_noise_floor_explicit
- ordered_perturbation_axis_explicit

Demote:
- local_one_factor_perturbation_explicit

Reason: prevalence 1.0 in pilot; not discriminating on T1.

### BAYESIAN
Primary:
- prior_uncertainty_explicit
- evidence_to_belief_update_explicit

Remove from primary:
- decision_tied_to_updated_belief

Reason: prevalence 0.0 in pilot.

### FALSIFICATION
Primary:
- refutable_central_claim_explicit
- refuting_observation_predeclared

Remove from primary:
- severe_or_discriminating_test_explicit

Reason: scorer reliability RED and prevalence 0.905.

### STATE_SPACE
Primary:
- observable_state_vector_explicit
- transition_relation_explicit

Remove from primary:
- stability_or_path_dependence_analysis_explicit

Reason: scorer reliability RED.

### SOFTWARE_TESTING
Primary:
- replay_regression_or_boundary_harness_explicit

Recalibrate before possible secondary use:
- invariant_or_metamorphic_relation_explicit
- test_or_failure_oracle_explicit

Reason: both RED in v0.2.

### CAUSAL
No T1-specific causal signature is eligible as a primary discriminator.

All three v0.2 causal fields had prevalence 1.0 on T1:
- treatment_outcome_pair_explicit
- confounder_or_identification_assumption_explicit
- counterfactual_estimand_or_intervention_contrast_explicit

This is a task-induced ceiling effect, not evidence that causal framing has no effect.

Causal-framing claims therefore require a second task where those elements are not already structurally forced by the objective.

## Consequence

A publication-grade Study A must include at least two structurally different research tasks from the outset and report method-by-task interaction.

T1 alone can establish a framing effect for that task, but cannot support a general framing claim or a causal-method signature claim.

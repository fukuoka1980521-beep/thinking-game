# Calibration v0.3 Gate — Fixed Before Scoring Results

Status: **NON-COUNTED INSTRUMENT CALIBRATION ONLY**

This gate is fixed before inspecting v0.3 scorer results.

## Required integrity

1. 42/42 acting-model plans captured.
2. 42 unique run IDs and 42 unique API response IDs.
3. 42/42 primary scores and 42/42 secondary scores.
4. Scorers remain condition-blinded.
5. No counted scientific inference is permitted from calibration condition differences.

## Reliability gates

### Boolean fields

GREEN:
- raw inter-scorer agreement >= 0.85; and
- Cohen's kappa >= 0.65.

AMBER:
- raw agreement >= 0.75; and
- kappa >= 0.40;
- but not GREEN.

RED:
- below AMBER.

DEGENERATE:
- kappa undefined because both scorers use one category only, or primary prevalence is 0 or 1.

A primary confirmatory field must be GREEN and non-degenerate in the combined 42-plan calibration.

### Count fields

GREEN:
- exact agreement >= 0.70; and
- within-one agreement >= 0.90.

AMBER:
- exact >= 0.50; and
- within-one >= 0.80.

RED:
- below AMBER.

All primary count outcomes must be GREEN.

## Structural separability gate

Compute binary Hamming distance using only fields that pass GREEN and are not degenerate.

Compare:
- within-condition distance;
- between-method distance, within the same task.

GO:
- combined between-minus-within > 0.05; and
- neither task has a negative between-minus-within value.

This is an engineering separability gate, not a scientific effect estimate.

## Method-signature gate

Existing candidate primary signatures:
- DIFFERENTIAL: baseline_noise_floor_explicit; ordered_perturbation_axis_explicit
- BAYESIAN: prior_uncertainty_explicit; evidence_to_belief_update_explicit
- FALSIFICATION: refutable_central_claim_explicit; refuting_observation_predeclared
- STATE_SPACE: observable_state_vector_explicit; transition_relation_explicit
- SOFTWARE_TESTING: replay_regression_or_boundary_harness_explicit

New/recalibrated candidates:
- SOFTWARE_TESTING: concrete_metamorphic_relation_explicit; operational_test_or_failure_oracle_explicit
- CAUSAL: causal_estimand_explicit; identification_threat_or_assumption_explicit; intervention_or_quasi_experimental_contrast_explicit
- GENERAL SECONDARY: explicit_null_hypothesis_present; strict_stopping_threshold_present

Rules:
1. Existing candidate fields remain primary only if GREEN/non-degenerate.
2. New software-testing fields enter the primary signature only if GREEN/non-degenerate.
3. CAUSAL receives a confirmatory signature only if at least two of its three candidates are GREEN/non-degenerate.
4. AMBER general fields remain secondary; they do not become primary unless GREEN.
5. A field that fails is removed or demoted; sample size is not increased to rescue it.

## Discrimination sanity check

For each method family with at least one retained signature field, calculate target-condition prevalence minus GENERIC prevalence by task.

This is descriptive calibration only.

A signature is considered visibly activated if at least one retained field has a target-minus-GENERIC difference >= 1/3 in at least one task.

Failure of this sanity check does not prove no framing effect; it means that signature is not useful enough for the confirmatory primary endpoint.

## Study A freeze rule

Study A may be frozen only if:
- all integrity checks pass;
- all primary count outcomes are GREEN;
- at least six binary fields are GREEN/non-degenerate overall;
- structural separability gate passes;
- at least four non-generic method families retain a usable operational signature;
- no confirmatory claim depends on a RED or DEGENERATE field.

If these conditions fail, redesign the instrument again and keep counted runs at zero.

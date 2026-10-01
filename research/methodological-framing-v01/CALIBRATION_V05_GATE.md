# Calibration v0.5 Gate — Fixed Before Scoring Results

Status: **NON-COUNTED INSTRUMENT CALIBRATION ONLY**

This gate is frozen before v0.5 scoring results are inspected.

## Integrity

1. 42/42 fresh acting-model plans captured.
2. 42 unique run IDs and 42 unique API response IDs.
3. All acting-model responses: status=completed, incomplete_details=null, max_output_tokens=8000.
4. 42/42 primary scores and 42/42 secondary scores.
5. All scorer responses: status=completed.
6. Scorers remain condition-blinded.
7. No v0.5 condition difference is a counted scientific result.

## Binary reliability

GREEN:
- raw inter-scorer agreement >= 0.85; and
- Cohen's kappa >= 0.65; and
- primary prevalence is neither 0 nor 1.

AMBER:
- raw agreement >= 0.75; and
- kappa >= 0.40;
- but not GREEN.

RED:
- below AMBER.

DEGENERATE:
- kappa undefined or primary prevalence 0/1.

Only GREEN non-degenerate fields may enter the frozen Study A confirmatory vector.

## Structural separability

Using all GREEN non-degenerate v0.5 binary fields, compute Hamming distance.

Within each task compare:
- repeated plans from the same method;
- plans from different methods.

PASS:
- combined between-minus-within > 0.05; and
- T1 between-minus-within >= 0; and
- T2 between-minus-within >= 0.

This is an engineering instrument gate, not a scientific effect estimate.

## Method-signature usability

Candidate signatures:

DIFFERENTIAL
- baseline_noise_floor_explicit
- graded_single_factor_perturbation_explicit

BAYESIAN
- quantified_prior_or_prior_distribution_explicit
- posterior_or_quantified_belief_update_explicit

FALSIFICATION
- claim_observation_rejection_pair_explicit
- active_disconfirmation_search_explicit

CAUSAL
- causal_estimand_explicit
- identification_strategy_assumption_pair_explicit

STATE_SPACE
- time_indexed_observable_state_components_explicit
- transition_relation_explicit

SOFTWARE_TESTING
- concrete_test_case_expected_relation_pair_explicit
- repeatable_regression_harness_explicit

A method family is usable when:
1. at least one candidate field is GREEN/non-degenerate; and
2. at least one retained field has target-method prevalence minus GENERIC prevalence >= 1/3 on T1 or T2.

The prevalence contrast is calibration-only field-selection evidence.

## Study A freeze rule

GO only if all are true:
- integrity PASS;
- at least 8 binary fields are GREEN/non-degenerate;
- structural separability PASS;
- at least 4 of 6 non-generic method families are usable;
- no confirmatory field is AMBER, RED, or DEGENERATE.

Otherwise:
- Study A remains unfrozen;
- counted runs remain 0;
- redesign again rather than increasing N.

# Pilot v0.2 Instrument Results

**NON-COUNTED PILOT. Same 21 fixed plans, rescored only.**

## Structural separability
- within-condition mean binary Hamming: 0.1429
- between-condition mean binary Hamming: 0.2737
- between minus within: 0.1308
- gate: **USEFUL_PILOT_SEPARABILITY**

## Binary-field reliability

| field | gate | raw agreement | kappa | prevalence | floor/ceiling |
|---|---|---:|---:|---:|---|
| explicit_null_hypothesis_present | AMBER | 0.810 | 0.481 | 0.286 | False |
| sample_size_or_power_rationale_present | GREEN | 1.000 | 1.000 | 0.857 | False |
| strict_stopping_threshold_present | AMBER | 0.857 | 0.588 | 0.286 | False |
| measurement_reliability_plan_present | DEGENERATE | 1.000 | NA | 1.000 | True |
| baseline_noise_floor_explicit | GREEN | 1.000 | 1.000 | 0.667 | False |
| local_one_factor_perturbation_explicit | RED | 0.905 | 0.000 | 1.000 | True |
| ordered_perturbation_axis_explicit | GREEN | 0.857 | 0.717 | 0.381 | False |
| prior_uncertainty_explicit | GREEN | 1.000 | 1.000 | 0.143 | False |
| evidence_to_belief_update_explicit | GREEN | 1.000 | 1.000 | 0.143 | False |
| decision_tied_to_updated_belief | DEGENERATE | 1.000 | NA | 0.000 | True |
| refutable_central_claim_explicit | GREEN | 1.000 | 1.000 | 0.333 | False |
| severe_or_discriminating_test_explicit | RED | 0.714 | 0.292 | 0.905 | True |
| refuting_observation_predeclared | GREEN | 1.000 | 1.000 | 0.190 | False |
| treatment_outcome_pair_explicit | DEGENERATE | 1.000 | NA | 1.000 | True |
| confounder_or_identification_assumption_explicit | DEGENERATE | 1.000 | NA | 1.000 | True |
| counterfactual_estimand_or_intervention_contrast_explicit | DEGENERATE | 1.000 | NA | 1.000 | True |
| observable_state_vector_explicit | GREEN | 0.905 | 0.769 | 0.238 | False |
| transition_relation_explicit | GREEN | 0.952 | 0.829 | 0.143 | False |
| stability_or_path_dependence_analysis_explicit | RED | 0.667 | 0.364 | 0.667 | False |
| invariant_or_metamorphic_relation_explicit | RED | 0.762 | 0.386 | 0.762 | False |
| test_or_failure_oracle_explicit | RED | 0.619 | -0.217 | 0.857 | False |
| replay_regression_or_boundary_harness_explicit | GREEN | 0.905 | 0.741 | 0.286 | False |

## Count-field reliability

| field | gate | exact | within one | MAE |
|---|---|---:|---:|---:|
| problem_decomposition_count | GREEN | 0.810 | 0.952 | 0.286 |
| explicit_primary_endpoint_count | GREEN | 0.857 | 1.000 | 0.143 |
| falsification_criterion_count | GREEN | 0.952 | 0.952 | 0.143 |

## Gate summary
- binary: GREEN=10, AMBER=2, RED=5, DEGENERATE=5
- counts: GREEN=3, AMBER=0, RED=0

No confirmatory interpretation is permitted from this calibration alone.

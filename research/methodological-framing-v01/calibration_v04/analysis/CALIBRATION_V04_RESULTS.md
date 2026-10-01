# Calibration v0.4 Results

**NON-COUNTED INSTRUMENT CALIBRATION.**

## Gate
- Study A freeze: **NO_GO**
- GREEN binary fields: 6
- all count fields GREEN: False
- structural separability pass: True
- usable method families: 3 (DIFFERENTIAL, BAYESIAN, STATE_SPACE)

## Structural separability

| task | within | between | excess |
|---|---:|---:|---:|
| T1 | 0.0794 | 0.2099 | 0.1305 |
| T2 | 0.1746 | 0.3051 | 0.1305 |
| combined | 0.1270 | 0.2575 | 0.1305 |

## Binary reliability

| field | gate | raw | kappa | prevalence |
|---|---|---:|---:|---:|
| sample_size_or_power_rationale_present | GREEN | 0.976 | 0.876 | 0.881 |
| explicit_null_hypothesis_present | GREEN | 0.905 | 0.663 | 0.119 |
| strict_stopping_threshold_present | RED | 0.786 | 0.392 | 0.738 |
| baseline_noise_floor_explicit | GREEN | 0.952 | 0.905 | 0.476 |
| ordered_perturbation_axis_explicit | AMBER | 0.762 | 0.466 | 0.310 |
| prior_uncertainty_explicit | AMBER | 0.952 | 0.641 | 0.071 |
| evidence_to_belief_update_explicit | GREEN | 1.000 | 1.000 | 0.167 |
| refutable_central_claim_explicit | RED | 0.714 | 0.417 | 0.571 |
| refuting_observation_predeclared | RED | 0.738 | 0.319 | 0.905 |
| causal_estimand_explicit | GREEN | 0.857 | 0.682 | 0.714 |
| identification_threat_or_assumption_explicit | DEGENERATE | 1.000 | NA | 1.000 |
| intervention_or_quasi_experimental_contrast_explicit | DEGENERATE | 1.000 | NA | 1.000 |
| observable_state_vector_explicit | RED | 0.714 | 0.359 | 0.310 |
| transition_relation_explicit | GREEN | 0.952 | 0.901 | 0.381 |
| replay_regression_or_boundary_harness_explicit | AMBER | 0.833 | 0.608 | 0.357 |
| concrete_metamorphic_relation_explicit | AMBER | 0.857 | 0.581 | 0.262 |
| operational_test_or_failure_oracle_explicit | AMBER | 0.762 | 0.539 | 0.571 |

## Count reliability

| field | gate | exact | within one | MAE |
|---|---|---:|---:|---:|
| problem_decomposition_count | AMBER | 0.667 | 0.857 | 0.714 |
| explicit_primary_endpoint_count | GREEN | 0.857 | 0.905 | 0.524 |
| falsification_criterion_count | RED | 0.310 | 0.524 | 1.524 |

## Method signatures

- **DIFFERENTIAL**: usable=True; GREEN=baseline_noise_floor_explicit
  - activated baseline_noise_floor_explicit on T1: target-GENERIC=0.333
- **BAYESIAN**: usable=True; GREEN=evidence_to_belief_update_explicit
  - activated evidence_to_belief_update_explicit on T1: target-GENERIC=1.000
  - activated evidence_to_belief_update_explicit on T2: target-GENERIC=1.000
- **FALSIFICATION**: usable=False; GREEN=none
- **CAUSAL**: usable=False; GREEN=causal_estimand_explicit
  - activated causal_estimand_explicit on T2: target-GENERIC=0.667
- **STATE_SPACE**: usable=True; GREEN=transition_relation_explicit
  - activated transition_relation_explicit on T1: target-GENERIC=1.000
  - activated transition_relation_explicit on T2: target-GENERIC=0.667
- **SOFTWARE_TESTING**: usable=False; GREEN=none

Calibration differences are engineering evidence only and are not counted scientific results.

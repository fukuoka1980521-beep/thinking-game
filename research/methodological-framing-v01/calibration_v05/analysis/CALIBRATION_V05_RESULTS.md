# Calibration v0.5 Results

**NON-COUNTED INSTRUMENT CALIBRATION.**

## Gate
- Study A freeze: **NO_GO**
- GREEN binary fields: 3
- structural separability pass: True
- usable method families: 2 (DIFFERENTIAL, BAYESIAN)

## Structural separability

| task | within | between | excess |
|---|---:|---:|---:|
| T1 | 0.1587 | 0.2540 | 0.0952 |
| T2 | 0.0000 | 0.0952 | 0.0952 |
| combined | 0.0794 | 0.1746 | 0.0952 |

## Binary reliability

| field | gate | raw | kappa | prevalence |
|---|---|---:|---:|---:|
| primary_endpoint_explicit | DEGENERATE | 1.000 | NA | 1.000 |
| sample_size_or_precision_rationale_present | AMBER | 0.881 | 0.483 | 0.905 |
| explicit_null_hypothesis_present | AMBER | 0.929 | 0.627 | 0.095 |
| concrete_decision_or_stop_rule_present | DEGENERATE | 1.000 | NA | 1.000 |
| baseline_noise_floor_explicit | GREEN | 0.857 | 0.700 | 0.429 |
| graded_single_factor_perturbation_explicit | AMBER | 0.905 | 0.556 | 0.071 |
| quantified_prior_or_prior_distribution_explicit | GREEN | 1.000 | 1.000 | 0.024 |
| posterior_or_quantified_belief_update_explicit | GREEN | 1.000 | 1.000 | 0.190 |
| claim_observation_rejection_pair_explicit | RED | 0.690 | 0.316 | 0.643 |
| active_disconfirmation_search_explicit | AMBER | 0.786 | 0.581 | 0.619 |
| causal_estimand_explicit | AMBER | 0.833 | 0.664 | 0.595 |
| identification_strategy_assumption_pair_explicit | AMBER | 0.810 | 0.613 | 0.667 |
| time_indexed_observable_state_components_explicit | RED | 0.714 | 0.396 | 0.786 |
| transition_relation_explicit | AMBER | 0.833 | 0.637 | 0.405 |
| concrete_test_case_expected_relation_pair_explicit | RED | 0.714 | 0.429 | 0.405 |
| repeatable_regression_harness_explicit | RED | 0.643 | 0.259 | 0.476 |

## Method signatures

- **DIFFERENTIAL**: usable=True; GREEN=baseline_noise_floor_explicit
  - activated baseline_noise_floor_explicit on T1: target-GENERIC=0.333
- **BAYESIAN**: usable=True; GREEN=quantified_prior_or_prior_distribution_explicit, posterior_or_quantified_belief_update_explicit
  - activated quantified_prior_or_prior_distribution_explicit on T1: target-GENERIC=0.333
  - activated posterior_or_quantified_belief_update_explicit on T1: target-GENERIC=1.000
  - activated posterior_or_quantified_belief_update_explicit on T2: target-GENERIC=1.000
- **FALSIFICATION**: usable=False; GREEN=none
- **CAUSAL**: usable=False; GREEN=none
- **STATE_SPACE**: usable=False; GREEN=none
- **SOFTWARE_TESTING**: usable=False; GREEN=none

Calibration differences are engineering evidence only and are not counted scientific results.

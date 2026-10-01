# Calibration v0.6 Results

**NON-COUNTED INSTRUMENT CALIBRATION.**

## Gate
- Study A freeze: **NO_GO**
- GREEN artifacts: 1/6
- structural separability pass: False
- usable method families: 0 ()

## Structural separability

| task | within | between | excess |
|---|---:|---:|---:|
| T1 | 0.3810 | 0.3175 | -0.0635 |
| T2 | 0.0000 | 0.0000 | 0.0000 |
| combined | 0.1905 | 0.1587 | -0.0317 |

## Artifact reliability

| artifact | gate | raw | kappa | prevalence |
|---|---|---:|---:|---:|
| differential_baseline_gradient_artifact | GREEN | 0.952 | 0.724 | 0.095 |
| bayesian_prior_update_artifact | DEGENERATE | 1.000 | NA | 0.000 |
| falsification_rejection_rule_artifact | AMBER | 0.762 | 0.527 | 0.571 |
| causal_identification_artifact | AMBER | 0.881 | 0.400 | 0.952 |
| state_transition_artifact | AMBER | 0.833 | 0.495 | 0.143 |
| test_oracle_artifact | RED | 0.833 | 0.290 | 0.190 |

## Method signatures

- **DIFFERENTIAL**: usable=False; gate=GREEN; field=differential_baseline_gradient_artifact
- **BAYESIAN**: usable=False; gate=DEGENERATE; field=bayesian_prior_update_artifact
- **FALSIFICATION**: usable=False; gate=AMBER; field=falsification_rejection_rule_artifact
- **CAUSAL**: usable=False; gate=AMBER; field=causal_identification_artifact
- **STATE_SPACE**: usable=False; gate=AMBER; field=state_transition_artifact
- **SOFTWARE_TESTING**: usable=False; gate=RED; field=test_oracle_artifact

Calibration differences are engineering evidence only and are not counted scientific results.

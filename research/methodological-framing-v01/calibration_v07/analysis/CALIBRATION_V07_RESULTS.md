# Calibration v0.7 Results

**NON-COUNTED FRESH INSTRUMENT VALIDATION.**

- Study A freeze: **GO**
- T1 -> T2 accuracy: **0.524**
- T2 -> T1 accuracy: **0.476**
- combined cross-task accuracy: **0.500**
- combined macro-F1: **0.423**
- chance accuracy: **0.143**
- permutation p (10000): **0.000100**
- permutation null mean: **0.143**
- non-generic recall coverage >=1/3: **5/6**

## Pooled class recall

- GENERIC: 0.333
- DIFFERENTIAL: 0.000
- BAYESIAN: 0.500
- FALSIFICATION: 0.500
- CAUSAL: 0.500
- STATE_SPACE: 1.000
- SOFTWARE_TESTING: 0.667

## Gate checks

- combined_accuracy_ge_0_40: True
- T1_to_T2_accuracy_ge_0_25: True
- T2_to_T1_accuracy_ge_0_25: True
- combined_macro_f1_ge_0_30: True
- permutation_p_le_0_01: True
- non_generic_recall_coverage_ge_4_of_6: True

Interpretation boundary: observable cross-task method-linked plan signature only; no hidden-state or method-quality claim.

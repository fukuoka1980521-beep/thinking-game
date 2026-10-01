# Calibration v0.7 Gate — Frozen Before Fresh Validation

Status: NON-COUNTED INSTRUMENT VALIDATION ONLY.

## Integrity

1. 42/42 fresh plans.
2. 42 unique run IDs and API response IDs.
3. all responses completed, incomplete_details=null, max_output_tokens=8000.
4. acting model fixed to gpt-5.6-sol.
5. direct method labels redacted before feature extraction.
6. feature hashing, normalization, classifier, seed, and permutation count fixed before results.

## Primary validation metrics

Let chance accuracy = 1/7 = 0.142857.

GO requires all of:
- combined cross-task accuracy >= 0.40;
- T1->T2 accuracy >= 0.25;
- T2->T1 accuracy >= 0.25;
- combined macro-F1 >= 0.30;
- 10,000-permutation p <= 0.01;
- at least 4 of the 6 non-generic method classes have pooled cross-task recall >= 1/3.

These thresholds are deliberately below the v0.6 exploratory calibration values but remain materially above chance.

## Consequence

GO:
- freeze Study A using this discriminability measure as the primary planning-effect endpoint;
- preserve 336-plan design: 252 LABEL_ONLY primary + 84 OPERATIONAL secondary.

NO_GO:
- Study A remains unfrozen;
- counted runs remain 0;
- do not increase N merely to force significance; reconsider the measurement or hypothesis.

## Claim ceiling

A GO supports only that methodological framing induces reproducible observable plan signatures across tasks.
It does not show that one methodology is better, nor does it reveal hidden internal reasoning trajectories.


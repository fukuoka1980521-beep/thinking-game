# Calibration v0.7 Gate — Frozen Before v0.6 Text Analysis

Status: NON-COUNTED INSTRUMENT VALIDATION.

## Integrity

- exactly 42 v0.6 blind plans;
- exactly 7 conditions x 3 replicates x 2 tasks;
- no counted Study A plans;
- frozen masking lexicon and algorithm used unchanged;
- no external model or LLM judge used for the primary measurement.

## GO rule

Study A measurement instrument may freeze only if ALL are true:

1. train T1 -> test T2 accuracy >= 7/21;
2. train T2 -> test T1 accuracy >= 7/21;
3. combined correct >= 14/42;
4. 10,000-permutation one-sided p <= 0.01;
5. cross-task between-minus-within cosine distance > 0.

Otherwise: NO_GO and counted Study A remains 0.

These thresholds are engineering validation gates, not claimed scientific effects.

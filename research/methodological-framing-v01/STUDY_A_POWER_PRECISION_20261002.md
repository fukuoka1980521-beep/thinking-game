# Study A Power / Precision Audit — 2026-10-02

Status: pre-freeze design audit; no counted data exist.

## Problem with the original 6-per-cell candidate

The v0.3 design initially proposed 6 fresh runs per cell.

For a two-sided Fisher exact comparison of a binary signature between one method and GENERIC:

- p(GENERIC)=0.20 vs p(method)=0.70:
  - n=6 per group: power ≈ 0.16 at alpha=0.05
  - n=18 per group: power ≈ 0.84 at alpha=0.05
- p(GENERIC)=0.20 vs p(method)=0.80:
  - n=6: power ≈ 0.28
  - n=18: power ≈ 0.96
- p(GENERIC)=0.17 vs p(method)=0.83:
  - n=6: power ≈ 0.37
  - n=18: power ≈ 0.99

With a conservative six-comparison Bonferroni alpha ≈ 0.0083, n=18 is still not sufficient for a 0.50 absolute difference (power ≈ 0.59) but is substantially stronger for very large signature effects:
- 0.20 vs 0.80: ≈ 0.83
- 0.17 vs 0.83: ≈ 0.93

These calculations are design diagnostics, not observed-effect claims.

## Revised allocation

Because LABEL_ONLY is the primary causal treatment and OPERATIONAL is secondary:

### Primary LABEL_ONLY
- 7 method families
- 2 tasks
- 18 fresh repetitions per cell

Total:

7 x 2 x 18 = 252 plans

### Secondary OPERATIONAL
- 7 method families
- 2 tasks
- 6 fresh repetitions per cell

Total:

7 x 2 x 6 = 84 plans

### Grand total

252 + 84 = **336 counted plans**

This allocation deliberately concentrates precision on the non-tautological LABEL_ONLY comparison.

## Multiplicity strategy

Do not claim six independent method wins from unadjusted p-values.

Primary reporting should emphasize:
1. preregistered method-specific effect sizes;
2. exact or bootstrap confidence intervals;
3. a family-level/global randomization or permutation test for whether LABEL_ONLY method assignment changes plan structure;
4. multiplicity-controlled method-specific follow-ups.

The specific multiplicity procedure must be frozen before counted collection.

## Freeze implication

The 168-plan candidate is rejected.

Current candidate denominator for Study A is:

**336 counted plans**

subject to passing the v0.3 measurement-calibration gate.

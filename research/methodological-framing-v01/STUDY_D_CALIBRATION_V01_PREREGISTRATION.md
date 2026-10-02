# Study D Calibration v0.1 — Evidence Assimilation Gradient

Status: NON-COUNTED INSTRUMENT CALIBRATION ONLY — FROZEN BEFORE DATA

## Program motivation

Completed Study A / R1 found strong, replicated method-linked differences in research-plan structure.

Study B calibration v0.1 and v0.2 did not justify a counted fixed-evidence interpretation study.

Study C calibration v0.1 did not justify a counted adaptive evidence-selection study.

Rather than continuing to tune those instruments, Study D tests a boundary mechanism directly:

> Does methodological framing have its strongest observable effect before substantive evidence is supplied, with method-linked behavioral differences attenuating as common evidence accumulates?

This is a new scientific target. Study B/C calibration outputs remain non-counted engineering evidence.

## Scientific object

For methodological frame M and common evidence exposure level E_s:

M -> A_s | E_s

where A_s is a common structured research-attention / interpretation vector measured with the same schema at every stage.

Evidence stages:
- E0: catalog only, no evidence results;
- E4: results from 4 of 8 evidence modules;
- E8: results from all 8 modules.

The same output schema is used at E0, E4, and E8.

## Controlled worlds

Two structurally matched worlds are frozen in `STUDY_D_EVIDENCE_UNIVERSE_V01.json`.

D1: 3D-printed polymer tensile-strength variation.
D2: warehouse completion-time variation.

Each world has eight opaque module IDs mapped only during analysis to abstract roles R1-R8:
- R1 repeated baseline
- R2 perturbation sensitivity
- R3 history/context
- R4 simple-mechanism null
- R5 targeted intervention
- R6 boundary-specific analysis
- R7 measurement reliability
- R8 robustness

Visible catalog order differs across worlds.

E4 reveals the same abstract role set in both worlds: R1, R3, R5, R7.
E8 reveals all roles.

## Conditions

Exact seven Study A LABEL_ONLY methodological framing instructions:
GENERIC, DIFFERENTIAL, BAYESIAN, FALSIFICATION, CAUSAL, STATE_SPACE, SOFTWARE_TESTING.

Acting model:
- gpt-5.6-sol

## Calibration denominator

- 2 worlds
- 7 framing families
- 3 fresh replicate groups per world x family
- 3 independent evidence snapshots (E0/E4/E8) per group

Calibration groups = 42.
API outputs = 126.

Each snapshot is a fresh request with no conversational history. This removes self-conditioning between stages.

## Frozen structured output

For all eight opaque module IDs:
- attention weight integer 0-100;
- weights must sum exactly 100.

Also:
- top3 module IDs, exactly 3 distinct IDs in priority order;
- target_support_percent integer 0-100;
- confidence_percent integer 0-100.

## Common vector

After analysis maps opaque IDs to R1-R8:

- attention weights /100: 8 dimensions;
- top3 ordered one-hot: 3 x 8 = 24 dimensions;
- target support /100: 1;
- confidence /100: 1.

Total: 34 dimensions.

L2 normalize.

No free-text feature enters the primary instrument.

## Cross-world method recoverability

At each evidence stage separately:
- train cosine nearest-centroid method prototypes on D1 and predict D2;
- train D2 and predict D1;
- combine directional accuracy;
- use 10,000 independent training-label permutations preserving class counts.

## Calibration GO gate

Counted Study D may be designed only if all are true:

1. 126/126 snapshot outputs are complete, unique, and schema-valid.
2. E0 combined cross-world accuracy >= 0.35.
3. E0 D1->D2 accuracy >= 0.25.
4. E0 D2->D1 accuracy >= 0.25.
5. E0 10,000-permutation one-sided p <= 0.01.
6. At least 3/6 non-generic framing families have pooled E0 recall >= 1/3.
7. At every stage, at least 4 distinct abstract roles occur as top1 across the 42 groups.
8. In each world at every stage, at least 3 distinct target_support_percent values occur.
9. E4 and E8 do not collapse to a single common vector: mean pairwise vector distance within each stage/world must exceed 0.02.

The calibration gate does NOT require attenuation across stages. Attenuation is the later counted Study D hypothesis and is not used to decide whether the instrument is viable.

## If calibration GO

Freeze counted Study D before counted data.

Primary counted hypothesis:
method-linked separation is larger at E0 than E8.

Secondary:
- E0 > E4 > E8 monotonic trend;
- framing-family heterogeneity;
- support/confidence convergence;
- attention-weight convergence.

The exact counted statistic and permutation procedure must be frozen after calibration and before counted Study D.

## NO_GO

If any calibration gate fails:
- counted Study D remains zero;
- do not increase N to rescue the gate;
- preserve the failure and reconsider the boundary model.

## Claim ceiling

Study D concerns observable black-box research behavior only.

Even a successful counted Study D would not identify hidden chain-of-thought or neural mechanisms and would not rank methodologies by quality.

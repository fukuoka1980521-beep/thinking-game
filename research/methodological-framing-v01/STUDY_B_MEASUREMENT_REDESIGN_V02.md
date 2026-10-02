# Study B Measurement Redesign v0.2

Status: INSTRUMENT REDESIGN AFTER v0.1 NO_GO

## What v0.1 established as engineering evidence

The v0.1 non-counted calibration failed its frozen gate:

- structured combined cross-packet accuracy = 0.1429, exactly chance;
- permutation p = 0.7631;
- only 2/6 non-generic families reached pooled recall >=1/3.

Post-hoc failure diagnosis showed strong outcome concentration:

- B1: 21/21 DOES_NOT_SUPPORT_MOST and 21/21 REJECT_TARGET_FOR_NOW;
- B2: 18/21 DOES_NOT_SUPPORT_MOST, 3/21 INCONCLUSIVE.

Thus the v0.1 packets were too decision-dominant for a useful interpretation-state instrument.

A post-hoc masked-rationale classifier reached 0.4524 cross-packet accuracy with p=0.0001. This is engineering evidence only. It suggests that method-linked structure may survive in how evidence is interpreted even when the coarse conclusion is the same.

## v0.2 redesign principle

Do not use free-text rationale as the primary measurement.

Instead:

1. move the fixed evidence packets closer to the attribution decision boundary;
2. require an explicit quantitative attribution estimate and interval;
3. require a signed impact score for every evidence item;
4. retain final conclusion and action as separate structured outcomes.

This changes the instrument, not the scientific target.

## Revised target object

Primary:

M -> W_evidence | E = E*

where W_evidence is the structured evidence-weighting / interpretation profile.

Secondary:

M -> Y_conclusion | E = E*

The purpose is to distinguish a genuine interpretation-weighting effect from mere stylistic wording differences.

## Boundary

v0.1 and its post-hoc diagnostics remain non-counted instrument-development evidence.
No counted Study B data will be generated unless v0.2 passes a new gate frozen before v0.2 calibration.

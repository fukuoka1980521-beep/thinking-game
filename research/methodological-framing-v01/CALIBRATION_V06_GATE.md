# Calibration v0.6 Gate — Fixed Before Scoring Results

Status: NON-COUNTED INSTRUMENT CALIBRATION ONLY.

This gate is frozen before v0.6 scorer results are inspected.

## Integrity

1. 42/42 fresh acting-model plans captured.
2. 42 unique run IDs and 42 unique API response IDs.
3. All acting-model responses: status=completed, incomplete_details=null, max_output_tokens=8000.
4. 42/42 primary scores and 42/42 secondary scores.
5. Every True score has 1–2 exact evidence spans that literally occur in the blinded plan text.
6. Every False score has an empty evidence list.
7. All scorer responses: status=completed.
8. Scorers remain condition-blinded.
9. No calibration condition difference is a counted scientific result.

## Reliability

For each of the six artifact booleans:

GREEN:
- raw inter-scorer agreement >= 0.85; and
- Cohen's kappa >= 0.65; and
- primary prevalence is neither 0 nor 1.

AMBER:
- raw agreement >= 0.75; and
- kappa >= 0.40;
- but not GREEN.

RED:
- below AMBER.

DEGENERATE:
- kappa undefined or primary prevalence 0/1.

Only GREEN, non-degenerate artifacts may enter confirmatory Study A.

## Structural separability

Using only GREEN artifact booleans, compute Hamming distance within each task.

PASS only if:
- combined between-method minus within-method distance > 0.05;
- T1 excess >= 0;
- T2 excess >= 0.

## Method-family usability

Each non-generic method has exactly one candidate artifact.

A family is usable when:
1. its artifact is GREEN/non-degenerate; and
2. target-method prevalence minus GENERIC prevalence >= 1/3 on T1 or T2.

## Study A freeze rule

GO only if all are true:
- integrity PASS;
- at least 4 of 6 artifact fields are GREEN/non-degenerate;
- structural separability PASS;
- at least 4 of 6 method families are usable;
- no confirmatory field is AMBER, RED, or DEGENERATE.

Otherwise:
- Study A remains unfrozen;
- counted runs remain 0;
- redesign again rather than increasing N.

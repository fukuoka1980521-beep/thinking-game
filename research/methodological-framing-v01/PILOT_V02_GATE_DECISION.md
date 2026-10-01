# Pilot v0.2 Gate Decision

Status: **GO FOR v0.3 CALIBRATION / NO-GO FOR COUNTED STUDY YET**

## Evidence

Same 21 non-counted plans were rescored under the v0.2 instrument.

- score validation: PASS, primary 21/21, secondary 21/21
- structural separation:
  - within-condition mean binary Hamming = 0.1429
  - between-condition mean binary Hamming = 0.2737
  - excess separation = 0.1308
  - gate = USEFUL_PILOT_SEPARABILITY
- binary reliability:
  - GREEN = 10
  - AMBER = 2
  - RED = 5
  - DEGENERATE = 5
- count reliability:
  - GREEN = 3/3

## Decision

The pilot demonstrates that methodological conditions can be separated by operational plan structure strongly enough to justify a confirmatory program.

However, the full v0.2 state vector is not confirmatory-ready because:
- five binary fields remain RED;
- five binary fields are degenerate due floor/ceiling effects;
- T1 itself induces causal and perturbation structures across nearly all conditions;
- operational framing directly prescribes some target design operations.

Therefore:
1. do not start counted Study A yet;
2. use v0.3 reduced primary measurement;
3. make LABEL_ONLY the primary treatment;
4. use at least two research tasks;
5. recalibrate only ambiguous secondary/causal/software-testing fields before freeze;
6. retain the entire 21-plan pilot as non-counted instrument-development data.

## Scientific interpretation boundary

The pilot is evidence about **instrument feasibility**, not evidence for the scientific framing hypothesis.

No population or causal claim may use pilot condition differences.

# Study C Calibration v0.2 — Frozen Before Non-Counted Calibration

Status: NON-COUNTED INSTRUMENT CALIBRATION ONLY

## Reason for redesign

Study C v0.1 failed its frozen gate. The model could open up to 4/8 evidence modules, producing high overlap and weak cross-world method recoverability.

v0.2 changes the environment, not the sample size:
- exactly 2 of 8 evidence actions must be selected;
- the action catalog is presented in a deterministic per-run shuffled order;
- each option is phrased as an available research operation rather than an evidence-role label;
- two new evidence worlds are used;
- the same seven LABEL_ONLY method framings are retained.

No v0.1 outcome is reused as v0.2 scientific evidence.

## Scientific target

M -> A1, A2

where A1 and A2 are observable evidence-acquisition actions under strict scarcity.

## Worlds

Frozen in STUDY_C_EVIDENCE_UNIVERSE_V02.json:
- C3: regional AI support-quality investigation;
- C4: manufacturing defect-rate investigation.

Each world contains 8 operations mapped only at analysis time to R1-R8:
R1 repeated baseline
R2 perturbation sensitivity
R3 history/context
R4 simple-mechanism null
R5 targeted intervention
R6 boundary-specific
R7 measurement reliability
R8 robustness

## Trajectory

Each run makes exactly two selections.

Step 1:
- sees research question + 8 available operations in frozen shuffled order;
- selects one module ID only.

Step 2:
- sees the first opened evidence content + remaining 7 operations;
- selects one new module ID only.

No stop option. No repeated module.

## Conditions

Exact seven frozen Study A LABEL_ONLY methodological framings.

Acting model: gpt-5.6-sol.

## Denominator

- 2 worlds
- 7 methods
- 3 fresh trajectories per cell
- 42 non-counted trajectories
- 84 model selection calls

## Primary path vector

Map selected opaque IDs to R1-R8 only during analysis.

Vector:
- first-role one-hot: 8
- second-role one-hot: 8
- selected-set binary roles: 8
Total = 24 dimensions, L2 normalized.

No free text is used.

## Cross-world analysis

Train cosine nearest-centroid method prototypes on C3 and predict C4.
Then train C4 and predict C3.

10,000 training-label permutations preserving class counts.

## Secondary diagnostics

- first-role distribution by method;
- selected-pair distribution;
- same-method versus different-method selected-set Jaccard;
- opening rates for R4, R5, R7, R8;
- first-role-only and selected-set-only classification.

## GO gate

Counted Study C may be frozen only if all are true:
1. 42/42 trajectories valid and unique.
2. all trajectories contain exactly two distinct selections.
3. combined cross-world accuracy >= 0.30.
4. C3 -> C4 >= 0.24.
5. C4 -> C3 >= 0.24.
6. 10,000-permutation one-sided p <= 0.01.
7. at least 3/6 non-generic families have pooled recall >= 1/3.
8. at least 4 distinct roles occur as first selections.
9. first-role-only OR selected-set-only combined accuracy >= 0.24.

NO_GO means counted Study C remains zero. N is not increased to rescue the gate.

## Boundary

A GO would support only reproducible method-linked evidence-acquisition behavior under the controlled environment.
No hidden chain-of-thought or methodology-superiority claim is permitted.

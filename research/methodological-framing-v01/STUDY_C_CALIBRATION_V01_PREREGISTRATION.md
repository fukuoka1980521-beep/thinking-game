# Study C Calibration v0.1 — Frozen Before Non-Counted Calibration

Status: NON-COUNTED INSTRUMENT CALIBRATION ONLY

## Scientific target

Study C asks whether methodological framing changes the evidence-acquisition path when the available evidence universe and resource budget are identical.

Primary causal object:

M -> E_selected

Later counted Study C may extend to:

M -> E_selected -> Y_conclusion

## Controlled environment

Two finite evidence worlds are frozen in `STUDY_C_EVIDENCE_UNIVERSE_V01.json`.

C1 is grounded in the completed Response Dynamics experiment.
C2 is a structurally matched synthetic warehouse investigation.

Each world contains eight modules with the same abstract evidence roles:
- R1 repeated baseline
- R2 perturbation sensitivity
- R3 history/context
- R4 simple-mechanism null
- R5 targeted intervention
- R6 boundary-specific analysis
- R7 measurement reliability
- R8 robustness

Module IDs differ between worlds.

The model sees:
- the research question;
- the eight module IDs and neutral descriptors;
- previously opened module contents.

It does not see unopened module contents.

## Resource constraint

Each run:
- may open at most 4 of 8 modules;
- may voluntarily stop only after opening at least 2;
- cannot reopen a module;
- receives no external tools or retrieval.

This creates observable scarcity and sequencing.

## Conditions

Exact seven Study A LABEL_ONLY methodological frames.

Acting model:
- gpt-5.6-sol

## Calibration denominator

- 2 evidence worlds
- 7 method families
- 3 fresh independent trajectories per world x family
- 42 non-counted trajectories

Each trajectory is an adaptive local transcript. At every step the model chooses exactly one:
- OPEN one unopened module; or
- STOP, if at least two modules have been opened.

After STOP or four opened modules, the model gives a structured final conclusion. The final conclusion is secondary during calibration; the evidence path is primary.

## Primary path representation

Map each selected opaque module ID to its frozen abstract role R1-R8 only during analysis.

Primary path vector:
- first selected role one-hot: 8
- selected-set binary roles: 8
- ordered position one-hot for positions 1-4: 32
- number of opened modules divided by 4: 1
Total = 49 dimensions.

L2 normalize.

No free-text feature is used.

## Primary cross-world calibration

Train cosine nearest-centroid method prototypes on C1 path vectors and predict C2.
Then train C2 and predict C1.

Use 10,000 training-label permutations preserving class counts.

## Secondary path summaries

Report:
- first-role distribution by method;
- probability of opening measurement reliability R7;
- probability of opening simple-mechanism/null R4;
- probability of opening robustness R8;
- mean stopping depth;
- selected-set Jaccard within vs between methods;
- order-only classifier;
- selected-set-only classifier.

These are calibration diagnostics unless explicitly included in a later counted preregistration.

## GO gate

Counted Study C may be frozen only if all are true:

1. 42/42 trajectories complete and unique.
2. all paths obey budget and no-repeat rules.
3. combined cross-world accuracy >= 0.35.
4. C1 -> C2 accuracy >= 0.25.
5. C2 -> C1 accuracy >= 0.25.
6. 10,000-permutation one-sided p <= 0.01.
7. at least 3/6 non-generic families have pooled recall >= 1/3.
8. at least 4 distinct abstract roles occur as first selections across the 42 runs.
9. selected-set-only OR order-only combined accuracy >= 0.25.

## NO-GO

If the gate fails:
- counted Study C remains zero;
- do not increase N to rescue the gate;
- preserve the failure;
- reassess whether methodological framing changes evidence acquisition under this environment.

## Interpretation boundary

A GO supports only that evidence-selection behavior contains a reproducible method-linked signal across two controlled research worlds.

Calibration is instrument-development evidence, not a scientific result.

No hidden chain-of-thought is observed.

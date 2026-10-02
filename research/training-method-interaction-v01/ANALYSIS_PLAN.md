# Analysis Plan v0.1

## A. Within-stage method signature

For each training stage:
train on T1 -> test T2
train on T2 -> test T1

Primary measurement initially reuses the prior paper's transparent method:
masked unigram/bigram TF-IDF + cosine nearest-centroid classification.

Chance = 1/7.

## B. Cross-stage transfer matrix

For each ordered pair of stages A -> B:
- same-task transfer on T1 and T2
- cross-task transfer T1(A) -> T2(B)
- cross-task transfer T2(A) -> T1(B)

This is the central creation-vs-selection test.

Interpretation:
- high BASE -> later transfer favors repertoire-selection continuity;
- low BASE -> later but high later-stage recoverability is more consistent with post-training-created or substantially reorganized signatures.

## C. Stage effect

Compare balanced accuracy / raw accuracy across:
BASE, SFT, DPO, RLVR.

Use permutation/bootstrap uncertainty.
Do not infer a monotonic trend unless observed and supported.

## D. Compliance as separate outcome

Score whether the output:
- is a research plan;
- addresses the stated task;
- follows neutral fixed headings;
- is non-empty / non-degenerate.

Compliance is never folded silently into method-signature accuracy.

## E. Negative controls

1. structure-only classifier:
length, lines, headings, bullets, numbering, section allocation.

2. explicit method-label/canonical-lexicon masking.

3. generic-vs-specific cue sensitivity.

## F. Exploratory mechanistic phase

Only after behavioral results:
- layerwise hidden-state method decoding;
- cross-stage representational similarity;
- method-vector intervention / activation steering if technically feasible.

These are exploratory and must not be used to retroactively redefine primary success.

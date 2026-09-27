# Protocol Amendment 002 — Binary/Categorical Robustness and Candidate-Structure Gate

**Date:** 2026-09-27  
**Applies to:** Operational Latent State Reliability (OLSR) v0.1/v0.2 analysis plan  
**Timing:** adopted before the first prospective OLSR case was captured

## Problem detected

The original structured-feature analysis treated 0/1 features through a low-rank numeric SVD after bounded imputation.

That is useful as an engineering exploration lens, but it is not sufficient by itself for a publication-facing latent-structure claim because:

1. the feature vocabulary is predominantly binary/categorical;
2. small-sample latent analyses can be unstable;
3. factor/component retention depends on methodological choices;
4. a visually clean low-dimensional axis may be driven by one case or by marginal frequencies.

The earlier readiness rule allowed provisional candidate naming at 12 cases. That threshold is withdrawn before prospective accumulation because it was too permissive relative to the dimensionality of the feature space.

## New robustness requirements

The analyzer now adds:

1. **leave-one-out stability**;
2. **column-wise permutation null** preserving feature marginals;
3. **binary MCA sensitivity lens** when complete-case coverage permits;
4. **cross-method top-feature convergence** between numeric SVD and MCA;
5. a dynamic candidate case floor:
   `max(24, 2 × eligible structured features)`.

A provisional factor name is allowed only at `CANDIDATE_STRUCTURE_ONLY` after all implemented checks pass.

## Interpretation boundary

These are operational anti-overfit heuristics.

They do not establish:
- statistical power;
- population prevalence;
- causal mechanism;
- model-internal hidden state;
- independent replication.

MCA and SVD applied to the same case set are sensitivity analyses, not separate samples.

## Methodological anchors

- Fithian W, Josse J. Multiple correspondence analysis and the multilogit bilinear model. *Journal of Multivariate Analysis*. 2017;157:87-102. DOI: 10.1016/j.jmva.2017.02.009.
- Savalei V, Bonett DG, Bentler PM. CFA with binary variables in small samples: a comparison of two methods. *Frontiers in Psychology*. 2015;5:1515. DOI: 10.3389/fpsyg.2014.01515.
- Cosemans T, Rosseel Y, Gelper S. Exploratory Graph Analysis for Factor Retention: Simulation Results for Continuous and Binary Data. *Educational and Psychological Measurement*. 2022;82(5):880-910. DOI: 10.1177/00131644211059089.

These papers support caution around categorical/binary latent analysis and factor-retention choices. They do not directly test OLSR.

## Prospective integrity

No prospective OLSR natural case existed when this amendment was adopted.

The original files remain in Git history; this amendment records the correction instead of silently presenting the stricter rule as if it had always existed.

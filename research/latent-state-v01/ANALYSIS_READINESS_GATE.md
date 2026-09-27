# Analysis Readiness Gate — Operational Latent State Reliability

This gate exists to stop attractive low-dimensional plots from becoming premature research claims.

## Levels

### ACCUMULATE_ONLY

Default while the natural case stream is still small or narrow.

Operational condition:
- fewer than 8 eligible prospective cases, or
- fewer than 2 projects, or
- fewer than 2 tracks.

No latent factor naming.

### EXPLORATORY_ONLY

Enough diversity to inspect components, but not enough robustness to name a candidate structure.

Outputs may be used to generate discriminating questions only.

### CANDIDATE_STRUCTURE_ONLY

A component may receive a provisional descriptive name only when all are true:

- at least `max(24, 2 × eligible structured features)` prospective natural cases;
- at least 3 projects;
- at least 2 tracks;
- the first structured-feature component survives leave-one-out perturbation:
  - median absolute cosine >= 0.75
  - minimum absolute cosine >= 0.50;
- the first structured component exceeds the 95th percentile of a column-wise permutation null;
- the categorical-data MCA sensitivity lens is available;
- SVD and MCA first-component top features have operational Jaccard >= 0.40.

These are **anti-overfit engineering thresholds**, not statistical power calculations and not causal evidence.

## Why v0.3 is stricter than the earlier gate

The earlier `n >= 12` rule was intentionally conservative relative to the first prototype but is still too permissive for a sparse 0/1/null matrix with up to 22 candidate features.

Binary/categorical latent-structure methods are sensitive to correlation/retention choices and can behave poorly in small samples. OLSR therefore does not rely on a single decomposition or a fixed small case threshold.

Relevant methodological anchors:
- Fithian & Josse (2017), *Multiple correspondence analysis and the multilogit bilinear model*, Journal of Multivariate Analysis 157:87-102, DOI 10.1016/j.jmva.2017.02.009.
- Savalei, Bonett & Bentler (2015), *CFA with binary variables in small samples: a comparison of two methods*, Frontiers in Psychology 5:1515, DOI 10.3389/fpsyg.2014.01515.
- Cosemans, Rosseel & Gelper (2022), *Exploratory Graph Analysis for Factor Retention: Simulation Results for Continuous and Binary Data*, Educational and Psychological Measurement 82(5):880-910, DOI 10.1177/00131644211059089.

These sources motivate caution and method sensitivity; they do **not** validate OLSR's exact thresholds.

## Robustness lenses

### 1. Leave-one-out stability

Remove one case at a time, recompute the semantic feature decomposition, and compare the full-data component direction with the best matching leave-one-out component using sign-invariant absolute cosine similarity.

Purpose: detect components mainly created by one influential case.

### 2. Permutation null

Independently permute each eligible feature column while preserving marginal values, recompute singular values, and compare the observed component to the empirical 95th percentile.

Purpose: test whether the component is stronger than structure expected from independent marginals.

This is an exploratory null, not a population-level p-value.

### 3. MCA categorical sensitivity lens

For sufficiently complete binary features, perform multiple correspondence analysis using correspondence analysis of the complete binary indicator matrix.

Purpose: check whether a structure found by mean-imputed numeric SVD also appears under a categorical-data representation.

### 4. Cross-method convergence

Compare the first-component top feature sets from structured SVD and MCA.

Operational candidate convergence: top-5 feature Jaccard >= 0.40.

This is a practical anti-storytelling heuristic, not inferential proof.

## What remains prohibited

Even at CANDIDATE_STRUCTURE_ONLY:

- do not claim causality;
- do not estimate population prevalence;
- do not promote a component into Development OS automatically;
- do not call a component a cognitive or model-internal mechanism;
- do not choose topic/component count because the interpretation looks compelling;
- do not treat SVD/MCA/LDA agreement as independent replication when they use the same cases.

Development OS promotion still requires recurrence, material impact, cross-project applicability, false-positive cost, intervention effectiveness, and a falsification condition.

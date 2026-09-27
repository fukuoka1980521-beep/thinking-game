# Analysis Readiness Gate — Latent State Reliability

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
Enough diversity to inspect components, but not enough stability to name a candidate structure.

Outputs may be used to ask better questions only.

### CANDIDATE_STRUCTURE_ONLY
A component may receive a provisional descriptive name only when all are true:

- at least 12 prospective natural cases;
- at least 3 projects;
- at least 2 tracks;
- the first structured-feature component survives leave-one-out perturbation at the operational heuristic:
  - median absolute cosine >= 0.75
  - minimum absolute cosine >= 0.50.

These are **anti-overfit engineering thresholds**, not statistical power calculations and not causal evidence.

## Leave-one-out rule

The analyzer removes one case at a time, recomputes the semantic feature decomposition, and compares the full-data component direction with the best matching leave-one-out component using sign-invariant absolute cosine similarity.

This helps detect components that are mainly created by one influential case.

## What remains prohibited

Even at CANDIDATE_STRUCTURE_ONLY:

- do not claim causality;
- do not estimate population prevalence;
- do not promote a component into Development OS automatically;
- do not call a component a cognitive mechanism solely from SVD/LDA;
- do not choose topic/component count just because the interpretation looks compelling.

Development OS promotion still requires recurrence, material impact, cross-project applicability, false-positive cost, intervention effectiveness, and a falsification condition.

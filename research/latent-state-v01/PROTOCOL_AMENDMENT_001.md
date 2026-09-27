# Protocol Amendment 001 — Separate Latent Semantics from Missingness

**Date:** 2026-09-27  
**Applies to:** Latent State Reliability v0.1 analysis plan  
**Timing:** adopted before the first prospective case was captured  
**Prospective cases existing at amendment time:** 0

## Trigger for amendment

A source-backed historical calibration mapping of the frozen STGR six episodes was used only to debug the analysis method.

The first structured SVD design encoded each unknown feature as an adjacent `__UNKNOWN` indicator in the same matrix as semantic features.

A dry-run showed that dominant components could then reflect **which fields happened to be observed** rather than the latent structure of the underlying task state.

That is a measurement-design problem, not a research finding about agent behavior.

## Correction

From v0.2:

1. every core feature must be explicitly coded `1 / 0 / null`;
2. semantic feature values and missingness are held in separate matrices;
3. semantic SVD includes only features with sufficient observed coverage and both observed states;
4. missing semantic entries are filled with the feature's observed mean **for decomposition only**;
5. missingness receives its own SVD and is labeled observation-coverage structure;
6. dataset role is mandatory:
   - `PROSPECTIVE`
   - `HISTORICAL_NOT_PROSPECTIVE`
7. the analyzer defaults to `PROSPECTIVE`; historical calibration requires an explicit CLI flag.

## Why this does not compromise preregistration

No prospective case had been captured when this amendment was made.
The change was motivated by method calibration, not by a desirable prospective result.

The original protocol remains in the repository. This amendment records the correction rather than silently rewriting the original decision boundary.

## Interpretation boundary

A missingness component may reveal systematic observation bias or logging weakness, but it must not be named as a latent cognitive/task factor.

A semantic component is still exploratory and non-causal.

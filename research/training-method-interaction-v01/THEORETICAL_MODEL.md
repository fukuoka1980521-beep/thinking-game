# Theoretical Model v0.1

## Do not collapse "thinking style" into "training method"

Observed reasoning style should be modeled as a conditional behavior:

Z = f(P, S, D, R, I, M, T, G)

where:
- P = pretraining state
- S = supervised instruction tuning
- D = preference optimization (DPO)
- R = reinforcement learning with verifiable rewards (RLVR)
- I = prompt interface / formatting
- M = methodological framing cue
- T = substantive task
- G = generation stochasticity

## Key distinction: capability vs propensity

Capability:
Can the model instantiate a strategy at all?

Propensity:
How likely is the model to select and sustain that strategy under a given cue?

A failure to follow a cue at BASE cannot by itself show absence of capability because instruction routing has not yet been trained.

## Creation-vs-selection hypothesis

H-selection:
Pretraining already creates much of the strategy repertoire; post-training mainly improves routing, weighting, and persistence.

Prediction:
Method signatures should transfer at least partly from BASE to later checkpoints.

H-creation:
Post-training creates materially new strategy signatures not recoverable from BASE behavior.

Prediction:
Cross-stage transfer from BASE to later stages should be weak, while within-later-stage method recoverability is strong.

These are competing explanatory models, not binary metaphysical claims.

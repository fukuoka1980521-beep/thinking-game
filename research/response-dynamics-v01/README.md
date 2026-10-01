# Response Dynamics v0.1

**Status:** preregistered mechanism-study package  
**Freeze date:** 2026-10-01  
**Relation to STGR:** independent track; frozen STGR six episodes unchanged.

## Research question
Are changes in LLM answers under repetition, context, prior-answer exposure, provenance, and verification merely unstructured output variation, or do they show reproducible black-box behavioral dynamics: sensitivity, path dependence, error propagation, premise hardening, and evidence-driven correction?

## Claim boundary
This project studies an observable **Behavioral State** extracted from outputs. It does not claim direct access to a proprietary model's neural hidden state.

Claim levels:
- L0 — phenomenon: answer variation exists.
- L1 — predictive behavioral mechanism: transition/sensitivity patterns reproduce.
- L2 — causal input-output intervention: controlled input changes alter observable answer state.
- L3 — internal neural mechanism: not supported by this black-box protocol.

## Core separation
Never pool:
1. independent-run variability — same prompt, fresh context;
2. controlled perturbation sensitivity — one input factor changed;
3. sequential trajectory dynamics — same conversation continued.

## Study state
No empirical model runs are counted at freeze. Synthetic fixtures validate code only and never enter the dataset.

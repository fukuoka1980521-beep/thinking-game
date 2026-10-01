# Methodological Framing v0.1

## Purpose

Study whether holding a research objective constant while changing only the methodological framing changes the observable structure of LLM research behavior.

## Core causal model

[
M
竊・Z_{plan}
竊・E_{selected}
竊・Y_{conclusion}
]

The project separates:
- Study A: planning effect;
- Study B: fixed-evidence interpretation effect;
- Study C: active evidence-selection and conclusion effect.

## Current state

- theory: drafted;
- related-work audit: extended;
- non-counted pilot: **21/21 complete**;
- pilot raw validation: **PASS**;
- v0.2 double-scoring: **21/21 primary + 21/21 secondary, PASS**;
- v0.2 structural separation: **0.1308, USEFUL_PILOT_SEPARABILITY**;
- v0.3 measurement redesign: drafted;
- Study A v0.3 two-task design: drafted;
- preregistration: not yet frozen;
- counted empirical data: **0**.

Current decision: **GO for final calibration; NO-GO for counted Study A until v0.3 fields are frozen.**

## Important boundary

This project measures black-box research behavior. It does not claim direct observation of internal neural variables or hidden chain-of-thought.

## Relationship to Response Dynamics v0.1

Response Dynamics v0.1 found semantic stability coexisting with broader behavioral-state sensitivity. This project tests a higher-level perturbation:

[
Delta MethodologicalFraming
竊・Delta ResearchBehavior.
]

The completed prior study is motivation and, later, a candidate frozen evidence environment for Study B/C; it is not treated as proof of the new hypothesis.

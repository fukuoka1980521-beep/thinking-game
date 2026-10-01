# Response Dynamics v0.1 — Empirical Results

Acting model: gpt-5.6-sol
Primary scorer: gpt-6-sol
Secondary scorer: gpt-5.6-terra

## Hypothesis summary

- H1: NOT_MET — 0/16 anchors had PSD > 0
- H2: NO_BINARY_CRITERION_PREDEFINED — 13/16 anchors had paraphrase RSD above exact-repeat RSD
- H3: MET — prior-answer excess RSD = 0.044965
- H4: NOT_MET — 0/10 eligible trajectories hardened
- H5: MET — mean paired correction difference = 1.000000
- H6: MET — 2/8 referent-bound pairs changed semantic, claim, or action state

## Core endpoints

- H1 anchors with PSD > 0: 0/16
- H2 positive paraphrase-minus-exact anchors: 13/16
- H3 prior-answer excess mean RSD: 0.044965
- H4 hardening: 0/10 eligible
- H5 eligible verification groups: 2/24
- H6 material referent changes: 2/8

## Reliability

- semantic_answer_class: agreement=0.9762, kappa=0.9741, n=84
- claim_state: agreement=0.6905, kappa=0.4431, n=84
- decision_or_action: agreement=0.9048, kappa=0.8705, n=84
- abstention_or_request: agreement=0.7500, kappa=0.3934, n=84
- new_supporting_evidence: agreement=0.8214, kappa=0.5607, n=84
- error_level: agreement=0.9405, kappa=-0.0219, n=84

## Interpretation boundary

Black-box behavioral results only. L3/internal neural mechanism is not supported by this protocol.

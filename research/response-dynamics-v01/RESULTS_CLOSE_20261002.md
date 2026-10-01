# Response Dynamics v0.1 — Results CLOSE

Date: 2026-10-02 JST
Status: **EMPIRICAL COLLECTION / SCORING / PREREGISTERED ANALYSIS COMPLETE**

## Cohort
- controlled OpenAI Responses API
- acting model: `gpt-5.6-sol`
- primary scorer: `gpt-6-sol`
- secondary reliability scorer: `gpt-5.6-terra`
- counted responses: **336/336**
- primary scores: **336/336**
- secondary scores: **84/84**

## Main results
- H1 exact-repeat semantic instability: **NOT MET** — 0/16 anchors had PSD > 0.
- H2 paraphrase sensitivity: no preregistered binary pass/fail criterion; **13/16** anchors had paraphrase RSD above exact-repeat RSD.
- H3 prior-answer path dependence: **MET** descriptively — excess mean RSD **0.044965**.
- H4 premise hardening: **NOT MET** — **0/10** eligible trajectories hardened.
- H5 verification correction: **MET**, but based on only **2/24 eligible groups**; mean paired correction difference **1.0**.
- H6 referent binding: **MET** descriptive change criterion — **2/8** pairs changed semantic/claim/action state; no error reduction was observed.

## Reliability warning
Semantic class and decision/action scoring were strong, but some state components were less reliable:
- semantic class kappa: **0.9741**
- decision/action kappa: **0.8705**
- claim state kappa: **0.4431**
- abstention/request kappa: **0.3934**
- error-level raw agreement: **0.9405**, but kappa **-0.0219** because the distribution was highly imbalanced.
- whole referent tuple exact agreement: **0.1667**

## Interpretation
The strongest result is not that repeated identical prompts randomly flip semantic answers. Under this protocol, they did not: all 16 anchors were semantically stable across five exact fresh-context repetitions.

The more informative signal appears in **state-level sensitivity** rather than answer-class instability: paraphrasing, prior-answer exposure, and referent binding changed claim state, action, uncertainty, evidence use, or referent representation even when the semantic answer class remained unchanged.

The preregistered premise-hardening hypothesis was not supported in this cohort. Verification showed a strong direction only in the small subset with scorable pre-error, so it should not be generalized beyond those two eligible cases.

## Claim ceiling
These are black-box behavioral results for this model/cohort/time window. They support at most L0–L2 input-output claims and do **not** establish an internal neural state mechanism.

## Frozen artifacts
- raw collection: validated PASS
- blind scoring package: validated PASS
- score validation: PASS
- preregistered analysis output: `data/analysis/RESULTS.json`
- human-readable analysis: `data/analysis/RESULTS.md`

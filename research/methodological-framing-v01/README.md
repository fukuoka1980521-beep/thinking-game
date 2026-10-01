# Methodological Framing v0.1

## Purpose

Study whether holding a research objective constant while changing only methodological framing changes the observable structure of LLM research behavior.

Core causal program:

M -> Z_plan -> E_selected -> Y_conclusion

where:
- M = methodological framing;
- Z_plan = observable research-plan structure;
- E_selected = evidence-selection policy;
- Y_conclusion = resulting interpretation/conclusion.

The program separates:
- Study A: planning effect;
- Study B: fixed-evidence interpretation effect;
- Study C: active evidence-selection and conclusion effect.

## Current state — 2026-10-02

- HUKUOKA / common NAS index: confirmed;
- T2 ecological plausibility: confirmed from read-only operational templates and case-summary structure; no personal data copied into the research dataset;
- original 21-plan pilot: invalid as calibration evidence because 21/21 responses were truncated at max_output_tokens=2200;
- v0.3 partial calibration: invalid/preserved after the same truncation defect was detected;
- v0.4 complete-response calibration: 42/42 raw + 42/42 primary + 42/42 secondary; validation PASS; structural separation +0.1305; Study A NO_GO because measurement reliability was insufficient;
- v0.5 fresh calibration: 42/42 raw + 42/42 primary + 42/42 secondary; validation PASS; structural separation +0.0952; Study A NO_GO; only DIFFERENTIAL and BAYESIAN retained usable signatures;
- v0.6 measurement redesign: one narrow evidence-backed operational artifact per non-generic method family;
- v0.6 fresh raw collection: 42/42 completed, unique API response IDs, max_output_tokens=8000, raw validation PASS;
- v0.6 blind package: 42/42 prepared;
- v0.6 scoring: not started successfully; API returned credit_balance_exhausted before the first score was written;
- counted Study A data: 0;
- preregistration: not frozen;
- candidate counted Study A denominator after future freeze: 336 plans.

## Current decision

NO-GO for counted Study A until v0.6 receives full blinded double scoring and passes its frozen reliability / separability gate.

The immediate external dependency is API credit balance only. After credits are available:
1. run v0.6 primary and secondary evidence-span scorers;
2. validate exact evidence spans and response integrity;
3. apply the already frozen v0.6 gate;
4. GO -> freeze Study A preregistration/manifest;
5. NO_GO -> redesign measurement again;
6. do not generate counted Study A plans before the gate.

## Important boundary

This project measures black-box research behavior. It does not claim direct observation of internal neural variables or hidden chain-of-thought.

## Relationship to Response Dynamics v0.1

Response Dynamics v0.1 found semantic stability coexisting with broader behavioral-state sensitivity.

This project tests a higher-level perturbation:

Delta MethodologicalFraming -> Delta ResearchBehavior.

The prior study is motivation and a possible later frozen evidence environment for Study B/C. It is not proof of the methodological-framing hypothesis.

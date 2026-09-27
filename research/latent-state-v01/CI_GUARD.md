# Latent State Reliability — CI / Operational Guard

This CI exists to keep the research plumbing honest while natural cases accumulate.

It verifies:

1. analyzer synthetic tests pass;
2. case-capture synthetic tests pass;
3. Japanese/CJK raw text is not silently analyzed with the default English-oriented tokenizer;
4. historical STGR6 calibration is explicitly analyzed only as `HISTORICAL_NOT_PROSPECTIVE`;
5. the frozen historical six do not become prospective cases;
6. the historical calibration correctly reports insufficient observed variation for semantic SVD rather than manufacturing a latent factor;
7. answer-variance comparator behavior remains deterministic;
8. prospective cases, once they naturally appear, are validated rather than rejected merely because the dataset is no longer empty.

The CI does **not**:
- create research cases;
- fabricate negative examples;
- run embedding APIs;
- decide whether a latent component is meaningful;
- convert exploratory structure into a causal claim.

Any future prospective case added to `cases/` must still be source-backed and naturally occurring.

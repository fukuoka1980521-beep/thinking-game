# Study B Calibration v0.1 — Technical API Transport Amendment

Date: 2026-10-02
Status: PRE-DATA TECHNICAL FIX; SCIENTIFIC GATE UNCHANGED

The first calibration execution failed before producing a scientific calibration result because the OpenAI Responses API rejected the Structured Outputs JSON schema.

Observed API error:

`uniqueItems is not permitted`

The scientific state definition requires `decisive_evidence_ids` to contain 1-3 unique evidence IDs.

Technical correction:
- removed the unsupported JSON-Schema keyword `uniqueItems` from the API transport schema only;
- retained the exact same scientific requirement in `validate_state()`, which rejects duplicate evidence IDs before any response can be accepted or written;
- evidence packets, framing conditions, model, sample size, randomization seed, state vector, classifier, permutation procedure, and GO/NO_GO gate are unchanged.

Therefore this correction changes only API serialization compatibility, not the measured construct or decision rule.

No calibration outcome was available when this amendment was made.

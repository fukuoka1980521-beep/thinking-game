# Response Dynamics v0.1 — Empirical Collection CLOSE

Date: 2026-10-02 JST
Cohort: OpenAI controlled endpoint
Acting model: `gpt-5.6-sol`
Status: **RAW COLLECTION COMPLETE — SCORING NOT YET COMPLETE**

## Collection result
- frozen denominator: **336**
- captured usable responses: **336 / 336**
- unique run IDs: **336**
- unique API response IDs: **336**
- independent responses: **216**
- trajectory responses: **120**
- trajectory groups: **24**
- structural validation: **PASS**

## Frozen condition counts
- BASELINE_EXACT: 80
- PARAPHRASE_A: 32
- PARAPHRASE_B: 32
- IRRELEVANT_CONTEXT: 32
- PRIOR_ANSWER: 32
- REFERENT_BOUND: 8
- TRAJECTORY_BASE: 72
- VERIFICATION_RELEVANT: 24
- VERIFICATION_IRRELEVANT: 24

## Endpoint configuration
- Responses API
- requested/returned model: `gpt-5.6-sol`
- `store=false`
- temperature: 1.0
- top_p: 1.0
- reasoning effort: none
- tools/retrieval: none
- server conversation linkage: none
- seed: UNKNOWN


## Input identity
- manifest SHA-256: `f66118ad6053d1dc3543583263acd8dd2aad361336146b56ddb4d94c28216ae0`
- anchor bank SHA-256: `eca486bf337a9193d53d4e0da5b12d310026b523e9a4d97cee6f6c7fdd296ec4`

## Collection window
- first counted response: 2026-10-01T15:50:13.223479+00:00
- last counted response: 2026-10-01T16:05:59.523283+00:00

## Usage
- counted input tokens: 32,475
- counted output tokens: 26,165
- API attempt records: 337
- attempt status: 337 OK

The one-attempt difference versus the 336 denominator is the duplicate uncounted generation documented as D-001. It was not saved as a counted response.

## Deviations
See `EXECUTION_DEVIATIONS_20261002.md`.
No deviation changed anchors, conditions, repetition counts, denominator, raw counted responses, or scoring rules.

## Next fixed step
1. freeze blind scoring package;
2. score all 336 with a scorer distinct from the acting model;
3. independently score at least 84/336 with a second scorer;
4. compute preregistered metrics;
5. report results including null/contrary findings.

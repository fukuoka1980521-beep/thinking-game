# OpenAI Controlled-Endpoint Execution Protocol — 2026-10-02

Status: fixed before any counted empirical run.
Empirical count at fixation: **0 / 336**.
Cohort: controlled endpoint.
Primary model: `gpt-5.6-sol`.
Endpoint: OpenAI Responses API.

## Purpose
This document resolves execution details that were not fully explicit in the frozen manifest without changing anchors, conditions, repetitions, hypotheses, denominator, or scoring.

## Fixed request settings
- each independent run is a new request with no conversation object and no previous-response linkage;
- `store=false`;
- no tools, retrieval, web search, or file search;
- no system/developer instruction is supplied by the experiment;
- model identifier requested: `gpt-5.6-sol`;
- exact model returned by the endpoint is captured per response;
- request/response timestamps and usage are captured;
- unsupported or unexposed seed is recorded as UNKNOWN;
- raw responses are append-only and never edited.

## Independent prompt mapping
- BASELINE_EXACT: `prompt`
- PARAPHRASE_A: `paraphrase_a`
- PARAPHRASE_B: `paraphrase_b`
- IRRELEVANT_CONTEXT: `irrelevant_context`
- PRIOR_ANSWER: `prior_answer + "\n\n" + prompt`
- REFERENT_BOUND: `referent_bound_context + "\n\n" + prompt`

The PRIOR_ANSWER composition is fixed here because the manifest labels only the perturbation source, while the research question requires the original question to remain present.

## Trajectory execution
For each transcript_group:
1. turn 1 starts fresh with the anchor `prompt`;
2. turn 2 receives the exact turn-1 user message and exact raw assistant response, then the frozen turn-2 prompt;
3. turn 3 receives the exact turn-1 and turn-2 transcript, then the frozen turn-3 prompt;
4. after turn 3, the complete exact transcript is frozen locally;
5. the relevant turn-4 branch replays that transcript and adds only `verification_evidence`;
6. the irrelevant turn-4 branch replays the identical transcript and adds only the manifest `prompt_text`.

No server-side conversation state is relied on. Each API call receives its full intended transcript explicitly. This makes the two turn-4 branches auditable and identical through turn 3.

## Non-counted endpoint checks
Connectivity checks use only dummy text outside `ANCHOR_BANK.json`. They never enter the 336 denominator.

## Failure handling
- request failures are logged, not silently discarded;
- retry attempts preserve the same delivered experimental input;
- a row is counted only when a usable model response is captured;
- if model/provider behavior changes materially during collection, execution stops and the partial denominator is reported;
- no anchor or condition is changed after counted output is observed.

## Reproducibility boundary
The API may not expose a fixed dated backend snapshot or seed. The requested model ID, returned model ID, UTC timestamp, request settings, response metadata, and raw output are therefore the reproducibility record. Backend state not exposed by the provider remains UNKNOWN.

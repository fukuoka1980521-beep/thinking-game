# NEW LIFE — Gemini 2.5 to 3.x Migration Evaluation V1

Status: **PREPARED / NOT EXECUTED**
Production model changed: **NO**
Production deployment changed: **NO**
Human validation status: **PENDING**

## 1. Why this exists

The current public NEW LIFE semantic backend `functions/newlife-dialogue/` has the runtime selector:

```js
const MODEL = process.env.NEWLIFE_DIALOGUE_MODEL || "gemini-2.5-flash";
```

The currently wired public endpoint is `newlife-dialogue`, and the normal deploy path does not set `NEWLIFE_DIALOGUE_MODEL`. Therefore the present public path is dependent on `gemini-2.5-flash` unless the deployed revision contains an out-of-band model override.

The isolated refoundation backend on `chatgpt/newlife-refoundation-v1` has the same default dependency:

```js
const MODEL = process.env.NEWLIFE_REFOUNDATION_AI_MODEL || "gemini-2.5-flash";
```

A project-specific Google Cloud retirement notice identifies `gas-test-runner-20260620-wjxf` as using Gemini 2.5 Flash. The notice states public retirement begins **2026-10-20**; active existing workloads may continue after that date, but Gemini 2.5 Flash / Pro traffic in Japan's applicable residency zone is scheduled to stop on **2027-03-31**. This is therefore a planned migration, not an emergency same-day cutover.

This task does **not** treat model replacement as an infrastructure-only edit. NEW LIFE's free-talk quality, character distinctiveness, forward motion, and truth discipline are product behavior.

## 2. Comparison candidates

Default candidates:

1. `gemini-2.5-flash` — current baseline
2. `gemini-3.5-flash` — quality-oriented migration candidate
3. `gemini-3.5-flash-lite` — lower-cost/lower-latency migration candidate

No candidate is selected in advance.

## 3. Fixed-variable rule

The migration comparison must keep these identical across models:

- player input;
- NPC;
- scene/day/snapshot;
- system instruction;
- prompt builder;
- response schema;
- temperature;
- max output tokens;
- empty-response retry policy;
- region;
- test ordering, except for blind presentation.

The intended independent variable is model ID. Provider call order is counterbalanced across case/run positions so transient latency/quota effects do not always penalize the same model. The default is two runs per case/model to expose basic stochastic variation without turning this into a large-cost benchmark.

## 4. Existing evidence reused

The harness imports the existing Phase 33 `LIVE_EVAL_FIXED_SET` rather than inventing a new easy benchmark. It also corrects one known synthetic-fixture drift from the older helper: `yesterday` is treated as unknown before Day 12 and `profit` is treated as unknown before Day 20, matching the production `factsProjection.ts` time gates. It includes the Owner-found failures and regression probes:

- menu typo;
- tone feedback;
- fact + character-preference compound question;
- keyword collision;
- typo variants;
- multi-intent;
- prompt injection;
- unknown-fact pressure;
- banned canon;
- numeric leading question;
- greeting;
- criticism.

This preserves continuity with the evidence that justified the live semantic layer.

## 5. New harness

Files:

- `scripts/newlife-model-migration/compare-legacy-models.cjs`
- `scripts/newlife-model-migration/run-cloud-shell.sh`

The comparison harness calls Vertex AI directly with ADC. It does not call `gcloud functions deploy`, edit an endpoint, change an environment variable, enable an API, update IAM, change billing, or delete any revision.

Outputs are separated into:

- `raw-results-*.json` — model names visible;
- `blind-results-*.json` — model names replaced by A/B/C labels, with latency/token/retry metadata intentionally removed so the quality evaluator is not nudged toward guessing model identity;
- `blind-map-*.json` — the withheld A/B/C mapping;
- `blind-review-*.json` — score sheet to freeze before unblinding.

The blind map must not be shown to an evaluator until the evaluator output is final.

The evaluator instruction is frozen separately in `docs/newlife/evaluation/NEW_LIFE_GEMINI_MIGRATION_BLIND_EVALUATOR_PROMPT_V1.md` so the rubric is not rewritten after seeing model outputs.

## 6. Blind evaluation rubric

Each candidate is evaluated per case on:

- character distinctiveness;
- human naturalness;
- context fidelity;
- free-text following;
- forward motion;
- repetition;
- factual/canon safety.

A mirror of the current deterministic truth gate is applied to each parsed model output so the evidence records whether that output would be rejected for banned terms, unsupported numeric claims, or overclaiming an unknown required fact. This mirror is evidence-only and cannot affect production.

Operational data is recorded only in the raw evidence:

- latency;
- retry count;
- empty response;
- parse failure;
- provider error;
- prompt/candidate/thought/total token metadata when returned.

Synthetic evaluation is not human validation.

## 7. Decision rule

Do not migrate because a 3.x model merely returns HTTP 200.

A production candidate must satisfy all of the following:

1. no material regression in canon/truth safety;
2. no material regression in character distinctiveness;
3. no material regression in free-talk naturalness;
4. no material increase in unusable repetition;
5. latency remains acceptable for interactive play;
6. cost/token use is understood rather than guessed;
7. the candidate survives blind evaluation before model identity is revealed.

If different 3.x models win different dimensions, record the trade-off instead of collapsing it into a single hidden score.

## 8. Production migration boundary

This branch must not modify:

- `functions/newlife-dialogue/index.js` model default;
- `src/newlife/semantic/config.ts`;
- deployed `newlife-dialogue`;
- Cloud Run/Functions environment variables;
- legacy public route;
- PR #22 merge state.

After evidence exists, create a separate migration PR containing:

- IMPACT_REPORT;
- selected model and reason;
- exact deployment/env change;
- test evidence;
- rollback command/path;
- before/after quality evidence.

## 9. Rollback design

Preferred first production migration uses an explicit environment override rather than immediately deleting the 2.5 default from source.

Rollback order:

1. restore previous model environment value while 2.5 is still available;
2. if the semantic provider itself is unstable, clear the frontend NEW LIFE endpoint to return to deterministic-only behavior;
3. keep rollback evidence and do not silently switch models.

## 10. Refoundation handling

The refoundation backend is separate from the public legacy backend and needs its own comparison because its contracts are different:

- `interpret_turn`;
- `generate_npc_line`;
- Mika/Ryo character behavior;
- relationship/boundary state.

The public legacy comparison should not be used as proof that the same model is best for refoundation.

Before refoundation is activated for a real player, its live-provider model must be explicitly recorded and compared against at least one 3.x candidate. Do not allow the current `gemini-2.5-flash` source default to become an unnoticed permanent dependency.

## 11. Current gate

```text
MIGRATION_HARNESS_READY = YES
LIVE_MODEL_COMPARISON_EXECUTED = NO
BLIND_REVIEW_EXECUTED = NO
PRODUCTION_MODEL_CHANGED = NO
READY_TO_MIGRATE = NO
OWNER_ACTION_REQUIRED = NO for repository preparation
```

The next external boundary is an authenticated Vertex AI execution environment. Until that exists, repository work can continue without changing production.

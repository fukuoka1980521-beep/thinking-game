# NEW LIFE — Gemini 2.5 → 3.5 Migration Impact Report V1

Status: `EVALUATION_HARNESS_READY`. `LIVE_COMPARISON_RUN = NO`. `PRODUCTION_MODEL_CHANGED = NO`.

## 1. Why this exists

Google's project-specific retirement notice for `gas-test-runner-20260620-wjxf`
names Gemini 2.5 Flash as an affected model: active workloads may continue
past 2026-10-20, with full shutdown for most regions on 2027-03-31. Both
NEW LIFE backends currently default to `gemini-2.5-flash` unless an
environment variable overrides it:

- Legacy public NEW LIFE — `functions/newlife-dialogue/index.js`:
  `const MODEL = process.env.NEWLIFE_DIALOGUE_MODEL || "gemini-2.5-flash";`
  This endpoint is **live and deployed**
  (`src/newlife/semantic/config.ts` → `NEWLIFE_DIALOGUE_ENDPOINT_URL`), gated
  behind the existing NEW LIFE AI-dialogue consent prompt. The deterministic
  Phase 27/28/28B router remains the fallback and default path for anyone who
  declines consent or asks an unambiguous question.
- Refoundation backend — `functions/newlife-refoundation-ai/index.js`:
  `const MODEL = process.env.NEWLIFE_REFOUNDATION_AI_MODEL || "gemini-2.5-flash";`
  This function is written and CI-tested but **still undeployed**
  (`src/newlife/refoundation/config.ts`'s endpoint constant is still `""`);
  it has no live traffic today.

A 200 response from a candidate model is not sufficient evidence that
conversation quality hasn't regressed — schema-valid JSON can still contain a
flatter, more repetitive, or less in-character reply than the current model.
This report package exists to gather independent, blind comparison evidence
**before** anyone changes a runtime default, so that decision can be made on
quality evidence rather than on "it still returns 200."

## 2. What is affected if a migration eventually happens

| Surface | Legacy (`functions/newlife-dialogue/`) | Refoundation (`functions/newlife-refoundation-ai/`) |
|---|---|---|
| Traffic today | Live, real player traffic (consent-gated) | None — undeployed |
| Blast radius of a bad model swap | Directly visible to real players | None until first deploy |
| Rollback mechanism | `NEWLIFE_DIALOGUE_MODEL` env var + full deterministic-router fallback | `NEWLIFE_REFOUNDATION_AI_MODEL` env var + adapter-level `Null*` fallback (already the default) |
| Deploy path | Existing manual Cloud Functions deploy (Phase 31/33 scripts) | `newlife-refoundation-live.yml` (GitHub Actions, OIDC/WIF, manual `workflow_dispatch`) |

## 3. What this Run implements (evaluation only)

- `scripts/newlife-model-migration/compare-legacy-models.mjs` — calls Vertex AI
  directly with the exact deployed `functions/newlife-dialogue/lib.js`
  prompt/schema/character-profile code, against a config-driven candidate
  list, using the exact Phase 31/33 fixed fixture set
  (`LIVE_EVAL_FIXED_SET` in `scripts/newlife-deploy/lib.mjs`, imported, not
  duplicated).
- `scripts/newlife-model-migration/compare-refoundation-models.cjs` (already
  existed, unmodified this Run) — the same comparison shape for the
  refoundation backend's `interpret_turn`/`generate_npc_line` operations.
- Both scripts: never touch a production default, endpoint constant,
  deployment, secret, or billing setting. Both write raw evidence, a blinded
  A/B/C evaluation packet, and a withheld mapping file to a `evidence/`
  subdirectory that is `.gitignore`d.
- `docs/newlife/migration/EVALUATION_RUBRIC_V1.md` — independent-dimension
  scoring guide, no automatic winner.
- This report, plus `MIGRATION_PLAN_V1.md`, `TEST_PLAN_V1.md`, and
  `ROLLBACK_PLAN_V1.md`.

## 4. What this Run explicitly does NOT do

- Does not call any candidate model as part of CI (`vitest run` only
  exercises the harness's static structure via string assertions — see
  `TEST_PLAN_V1.md` — it never invokes Vertex AI).
- Does not change `NEWLIFE_DIALOGUE_ENDPOINT_URL`,
  `NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL`, or either backend's `MODEL` default.
  Both are pinned unchanged by `tests/newlifeLegacyModelMigrationHarness.test.ts`
  and `tests/newlifeRefoundationModelMigrationHarness.test.ts`.
- Does not deploy, redeploy, or modify any Cloud Run/Cloud Functions
  configuration, IAM binding, or GitHub Actions workflow.
- Does not merge PR #22, and does not touch
  `chatgpt/newlife-phase34-human-playtest-repair`.
- Does not assert that `gemini-3.5-flash`/`gemini-3.5-flash-lite` are
  currently GA/available in this project/region — the harness marks an
  unavailable candidate `SKIPPED_UNAVAILABLE` rather than guessing or
  substituting silently (see `compare-legacy-models.mjs`'s
  `UNAVAILABLE_MODEL_ERROR_PATTERN`/`summarizeAvailability`).

## 5. Owner action required to actually run the comparison

None of the code in this Run requires a new credential — both scripts reuse
the same Application-Default-Credentials / Vertex-AI-ADC pattern the deployed
functions already use. Running an actual comparison requires an environment
where `gcloud auth application-default login` (or an equivalent service
account) is already authenticated against `gas-test-runner-20260620-wjxf` (or
another project passed via `--project`) — which this sandbox does not have
(see `TEST_PLAN_V1.md` §3 for the exact tooling-permission limitation
disclosed every round of this PR since V25). `LIVE_COMPARISON_RUN = NO` for
this reason, not a code blocker.

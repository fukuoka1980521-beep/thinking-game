# NEW LIFE — Gemini Migration Plan V1

Status: preparation only. No model has been changed. No deployment has
happened as part of this plan.

## 1. Sequence

1. **Availability / location check.** Follow
   `MODEL_LOCATION_COMPATIBILITY_V1.md`. The migration experiment has two
   lanes: (A) `asia-northeast1` operational compatibility and (B) `global`
   common-location quality comparison. A candidate that cannot run in Tokyo
   is not automatically a quality failure. The harness marks a candidate
   `SKIPPED_UNAVAILABLE` when every call fails with a not-found/unsupported
   provider error, but official region/consumption-mode support must also be
   checked before interpreting failures.
2. **Run the comparison harnesses** (requires an authenticated
   `gcloud`/Vertex-AI-ADC session against the target project — see
   `TEST_PLAN_V1.md` §3 for why this sandbox cannot do so itself):
   ```
   # Lane A — current-location compatibility
   node scripts/newlife-model-migration/compare-legacy-models.mjs --location asia-northeast1 --runs 1
   node scripts/newlife-model-migration/compare-refoundation-models.cjs --location asia-northeast1 --runs 1

   # Lane B — common-location quality comparison
   node scripts/newlife-model-migration/compare-legacy-models.mjs --location global --runs 2
   node scripts/newlife-model-migration/compare-refoundation-models.cjs --location global --runs 2
   ```
3. **Blind review** using `EVALUATION_RUBRIC_V1.md` against each
   `blind-results-*.json`, independently per dimension, frozen before
   unblinding.
4. **Decision.** A migration is authorized only if, for the backend in
   question:
   - the candidate is `AVAILABLE` (not skipped) for the full case set;
   - factual/canonical safety and free-text-following are at parity or
     better than the current `gemini-2.5-flash` baseline on every case, not
     just on average;
   - no regression is severe enough that a single case would, in production,
     surface a banned term, an invalid/hallucinated fact, or a broken
     schema/enum contract.
   This decision is made by a human/independent reviewer reading the scored
   rubric table — never automatically by the harness or by this plan.
5. **Apply the change via environment override, not a code default change.**
   If the approved candidate requires `global` Standard PayGo, the request
   location must also be changed explicitly and reviewed as a separate
   operational/data-location dimension; never hide that change behind the
   model-id override alone.
   for the backend(s) approved in step 4:
   - Legacy: set `NEWLIFE_DIALOGUE_MODEL` at deploy time (Cloud Functions
     environment variable). Do **not** edit the `"gemini-2.5-flash"` literal
     in `functions/newlife-dialogue/index.js`.
   - Refoundation: set `NEWLIFE_REFOUNDATION_AI_MODEL` at deploy time via the
     existing `newlife-refoundation-live.yml` manual workflow inputs/repo
     variables. Do **not** edit the `"gemini-2.5-flash"` literal in
     `functions/newlife-refoundation-ai/index.js`.
   Overriding via environment variable (rather than editing the source
   default) is itself the first rollback lever — see `ROLLBACK_PLAN_V1.md`.
6. **Redeploy** through each backend's existing, already-reviewed deployment
   path only:
   - Legacy: the existing manual Cloud Functions deploy process
     (`scripts/newlife-deploy/`), same as every prior legacy deploy.
   - Refoundation: the existing `newlife-refoundation-live.yml`
     `workflow_dispatch` workflow (already active on `master`, per
     `V34_LIVE_DEPLOY_GITHUB_ACTIONS_BOOTSTRAP_V1.md`).
   No new deployment mechanism is introduced by this plan.
7. **Post-deploy smoke.** Re-run each backend's existing structural smoke
   test (`smoke-test.mjs` for legacy; the workflow's own `interpret_turn`/
   `generate_npc_line` smoke step for refoundation) against the newly
   deployed model, then re-run `live-eval.mjs` (legacy) for a second round of
   real-traffic-shaped evidence with the new model live.
8. **Monitor.** Watch for an increase in `malformed_model_response`/
   `empty_model_response` rates (legacy already retries once transparently;
   refoundation likewise) after the switch. If either backend's fallback
   rate increases materially, follow `ROLLBACK_PLAN_V1.md` level 1
   immediately.

## 2. What is explicitly out of scope for this plan

- Changing which backend is publicly reachable (legacy stays the only public
  endpoint; refoundation stays undeployed/consent-isolated regardless of
  which model either uses).
- Any change to consent copy, consent keys, CORS allowlists, or rate limits.
- Migrating `functions/dialogue/` (CASE1) — out of scope for this request.

## 3. Ownership

- Running the live comparison and interpreting its evidence is an Owner
  action (requires an authenticated GCP session this sandbox does not have).
- Everything else in this plan (harness code, rubric, docs, tests) is
  already implemented and CI-verifiable without further Owner input.

# NEW LIFE — Gemini Migration Test Plan V1

## 1. What is tested by `npm test` today (deterministic, no network, no credentials)

- `tests/newlifeLegacyModelMigrationHarness.test.ts` (new this Run):
  - candidate list is config-driven (`--models`), not a single hardcoded
    winner, and includes the baseline plus both named 3.5 candidates;
  - the harness reuses the exact Phase 31/33 `LIVE_EVAL_FIXED_SET` fixture
    array by import, not by duplicating the strings — so fixture parity with
    `live-eval.mjs` (the script already used for real deployed smoke tests)
    is structural, not just string-matched;
  - every named Phase 33 evidence case id is present in that shared fixture
    file;
  - an unavailable candidate model is marked `SKIPPED_UNAVAILABLE`, never
    silently substituted;
  - client-side validation mirrors the legacy backend's own closed
    enums/required fields exactly (`SEMANTIC_ACTS`/`INTENT_CATEGORIES`/
    `FACT_CATEGORIES`/`answerableFromCanon`);
  - blind output strips every operational fingerprint (`model`, `latencyMs`,
    `attempts`, token usage, raw provider/parse error text) and never assigns
    a raw error string directly as `clientValidation.reason`;
  - the harness performs no deployment/endpoint mutation, and the legacy
    backend's `MODEL` default plus its live `NEWLIFE_DIALOGUE_ENDPOINT_URL`
    are pinned unchanged.
- `tests/newlifeRefoundationModelMigrationHarness.test.ts` (already existed,
  unmodified this Run): the equivalent set of checks for
  `compare-refoundation-models.cjs`.
- `tests/safety.test.ts`: unaffected by this Run — it only scans `src/**`,
  and nothing under `src/` changed. The new/changed files here live under
  `scripts/newlife-model-migration/`, `tests/`, and `docs/`.

Run via:
```
npm run typecheck
npm test
npm run build
```

## 2. What is deliberately NOT tested by `npm test`

Neither harness is exercised end-to-end (i.e. neither script is actually
*run*) by the automated test suite. `npm test` only makes string/structural
assertions against the committed harness source and the shared fixture file
— it never calls `main()`, never imports `@google/genai`, and never reaches
Vertex AI. This is intentional: an end-to-end run requires real Google Cloud
credentials and produces non-deterministic model output, so it cannot be a
CI gate. It also means `npm test` passing is not itself evidence that a live
comparison run would succeed — only that the harness is structurally sound
and hasn't touched anything it shouldn't.

## 3. What actually running the harness requires (and why this session
   cannot do it)

Both `compare-legacy-models.mjs` and `compare-refoundation-models.cjs`
authenticate to Vertex AI the same way the deployed Cloud Functions do
(`new GoogleGenAI({ vertexai: true, project, location })`, Application
Default Credentials — no API key). Running either script for real therefore
requires an environment where `gcloud auth application-default login` (or an
equivalent service account) is already active against the target GCP
project. This sandbox has repeatedly and directly confirmed (every round of
this PR since V25, re-confirmed as recently as the `508720f`/`5ade9e4`
rounds) that even a bare, read-only, non-mutating command like
`gcloud --version` requires interactive tool-approval that is unavailable in
this non-interactive execution environment — so this is a session-permission
boundary, not a missing-credential problem that could be worked around with
a different tool from inside this session.

`LIVE_COMPARISON_RUN = NO` in this Run's final status block reflects this
limitation precisely, not a defect in the harness code.

## 4. How CI (GitHub Actions) fits in

`NEW LIFE PR CI` already runs `npm ci`/`npm run typecheck`/`npx vitest run`/
`npm run build` on every push to this branch and will pick up the new test
file and script automatically — no workflow file was added or edited for
this change, since none was needed (this is a plain script + test + docs
change under paths CI already watches).

An actual live comparison run, when an Owner or another agent with real
`gcloud` access wants to produce it, should be run locally or from a
short-lived, manually-triggered CI job with the same OIDC/WIF
pattern already established by `newlife-refoundation-live.yml` — not
attempted from an unattended/non-interactive session.

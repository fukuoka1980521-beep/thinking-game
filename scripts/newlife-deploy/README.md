# NEW LIFE deployment-readiness package (Phase 31)

Everything here is read-only/dry-run by default. Nothing in this directory
deploys anything, enables an API, touches billing/IAM, or stores a secret
unless you pass an explicit flag documented in that script's own `--help`
(PowerShell: `Get-Help ./scripts/newlife-deploy/<script>.ps1 -Full`).

Full design/rationale: `docs/newlife/evaluation/PHASE_31_DEPLOYMENT_READINESS_AND_OWNER_MINIMAL_ACTION_V1.md`.

## Order of operations

1. **`check-readiness.ps1`** (PowerShell, run first, always safe) — read-only
   report on gcloud install/auth/project/billing/required-APIs. No Owner
   action needed to *run* this; it only reports what's missing.
2. If not ready: the script tells you the exact minimum Owner action
   (`gcloud auth login`, `gcloud config set project <id>`, or linking
   billing in the Cloud Console — the one step that genuinely cannot be
   automated).
3. **`deploy.ps1 -ProjectId <id>`** (PowerShell, default = print-only) — add
   `-EnableApis` and/or `-Deploy` to actually run those steps. On a
   successful `-Deploy`, it captures the HTTPS URL into `deploy-result.json`
   automatically (no copy/paste) and can run `smoke-test.mjs` for you with
   `-RunSmokeTest`.
4. **`smoke-test.mjs`** (Node) — `node scripts/newlife-deploy/smoke-test.mjs --url <https-url>`.
   Synthetic transport/validation checks only (CORS, method rejection,
   malformed body, one valid/prompt-injection/compound/typo request). Not a
   conversation-quality claim.
5. **`wire-endpoint.mjs`** (Node) — `node scripts/newlife-deploy/wire-endpoint.mjs --url <https-url> --apply`
   writes `src/newlife/semantic/config.ts`, then runs root
   typecheck/tests/build automatically. Add `--commit` to also `git commit`
   locally (never pushes — push or open a PR yourself when ready, per this
   repo's own branch-protection convention).
6. **`live-eval.mjs`** (Node, post-deploy evidence, not human validation) —
   `node scripts/newlife-deploy/live-eval.mjs --url <https-url>` runs the
   fixed synthetic test set (the exact Owner-found failure transcripts +
   typo/multi-intent/prompt-injection/banned-canon/numeric-hallucination
   probes across all six NPCs) and saves raw output under
   `evidence/newlife-live-eval/` for later human/ChatGPT review.
7. **`rollback.ps1`** (PowerShell) — `-Apply` sets the endpoint back to `""`,
   which alone fully restores deterministic-only behavior (the coordinator
   short-circuits before any network call once the endpoint is empty).
   Deleting the Cloud Function itself is optional and only ever printed,
   never run automatically.

## Shared logic

`lib.mjs` holds every piece of pure/testable logic (config-file diffing,
synthetic `FactsSnapshot` construction, the smoke-test and live-eval fixed
sets) used by the `.mjs` scripts above. It has zero dependencies and is
covered by `tests/newlifeDeployScripts.test.ts` under the root `npm test` —
see that file's own header for why the CLI wrapper scripts themselves could
not be directly executed this Run.

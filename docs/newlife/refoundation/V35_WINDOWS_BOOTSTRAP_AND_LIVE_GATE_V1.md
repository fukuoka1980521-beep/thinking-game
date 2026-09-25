# V35 — Windows One-Time Bootstrap for the Refoundation Live Gate

## 0. Where this picks up

V34 (`V34_LIVE_DEPLOY_GITHUB_ACTIONS_BOOTSTRAP_V1.md`) shipped two things:

- `docs/newlife/refoundation/github-actions/newlife-refoundation-live.yml` — the canonical
  `workflow_dispatch`-only deploy+smoke workflow for `functions/newlife-refoundation-ai/`.
- `scripts/newlife-deploy/bootstrap-refoundation-wif.sh` — a Bash, Owner-run, idempotent GCP
  bootstrap (WIF pool/provider + deploy service account + IAM bindings).

Since V34, per the `NEW_LIFE_CAPABILITY_ROUTE_UPDATE` status posted on Issue #1
(2026-09-25): the ChatGPT GitHub connector — a different actor than this Claude Code
session, with a different, broader set of repository permissions — was able to write
`.github/workflows/` directly. It opened a workflow-only PR (#23) containing exactly
`newlife-refoundation-live.yml`, which passed Claude Code Review and was squash-merged to
`master`. **V34's Step 1 (workflow activation) is therefore already done — this doc does
not repeat it.**

A temporary, since-removed `workflow_dispatch` preflight probe was then run once against
that activated workflow (before any real deploy step) to check the one remaining
unknown — whether the three repository variables the workflow reads already exist. They
did not. Verbatim result from that run:

```
MISSING_GCP_WIF_VARIABLES=GCP_PROJECT_ID GCP_WIF_PROVIDER GCP_DEPLOY_SERVICE_ACCOUNT
```

So the one remaining prerequisite before `newlife-refoundation-live.yml` can deploy
anything is exactly V34 Step 2: the one-time GCP-side WIF bootstrap, run by an Owner who
already has `gcloud` (and, this round, ideally `gh`) available.

## 1. Why a second, Windows-native script

V34's `bootstrap-refoundation-wif.sh` requires a Bash shell. The Owner's normal local
environment for this project is Windows/PowerShell — every other Owner-run script in this
repository (`check-readiness.ps1`, `deploy.ps1`, `run-phase33-local.ps1`, `rollback.ps1`)
is already `.ps1`, not `.sh`. `bootstrap-refoundation-wif.ps1`
(`scripts/newlife-deploy/bootstrap-refoundation-wif.ps1`) is that same Windows-native
equivalent for the refoundation bootstrap: identical GCP-side steps (same APIs, same WIF
pool/provider/service-account names, same least-privilege role list, same
`assertion.repository == 'fukuoka1980521-beep/thinking-game'` provider restriction), so it
is not a second design to keep in sync by hand — it is the same bootstrap in the Owner's
actual shell.

It goes one step further than the Bash version: after the GCP-side setup, if the GitHub
CLI (`gh`) is installed and already authenticated, it also sets the three repository
variables and triggers the workflow automatically — collapsing "run one script, then
separately paste three values into GitHub Settings, then separately click Run workflow"
down to "run one script." If `gh` is missing or not signed in, the script does **not**
ask the Owner to install or authenticate a second CLI just for this — it opens the exact
Settings > Variables page in the browser and prints the three (non-secret) values once,
plus opens the exact workflow page, so the remaining action is a copy/paste and one
click, not a new setup procedure.

## 2. What this script does NOT do

- It never deploys `functions/newlife-refoundation-ai/` itself — that stays the
  workflow's job (`gcloud functions deploy`, gated behind OIDC/WIF, never behind a script
  running with the Owner's own broad `gcloud` session).
- It never creates or downloads a service-account JSON key.
- It never prints a token, access key, or other credential value.
- It never grants `roles/owner`, `roles/editor`, or any Service Usage IAM role to the
  deploy service account — API enablement stays a one-time, Owner-run action (Step 3 of
  the script), not something the CI identity can do on every run.
- It never touches `functions/newlife-dialogue/` (legacy public NEW LIFE), `functions/dialogue/`
  (CASE1), or the isolated `chatgpt/newlife-phase34-human-playtest-repair` branch.
- It never writes to `src/newlife/refoundation/config.ts` — activating the endpoint in the
  product remains a separate, deliberate step (`wire-endpoint.mjs`), unaffected by this
  script.

## 3. Idempotency and fail-closed behavior

Every GCP resource-creation step (`describe` before `create`, matching the Bash script) is
safe to re-run after a partial failure — e.g. if billing is not yet linked, the script
stops cleanly at that step and resuming after linking billing picks up from there rather
than re-doing completed steps or silently skipping the rest.

Unlike the `deploy.ps1` review finding from the same Phase 33 round (`ErrorActionPreference
= "Continue"` combined with an unchecked `Set-Content`/`gcloud services enable` call could
let a failed step be silently treated as success), every consequential `gcloud`/`gh` call
in this script goes through `Invoke-GcloudOrFail` or an explicit `$LASTEXITCODE` check and
exits non-zero immediately on failure. There is no path in this script where a failed API
grant or a failed `gh variable set` is silently treated as done.

## 4. Remaining human boundary

After V34 + this script, the only actions that require a human are:

1. **One-time, interactive Google authorization/billing.** The script opens the exact
   `gcloud auth login` prompt (only if no account is already authenticated) and the exact
   billing-linking URL (only if billing is not already enabled) — it cannot complete either
   on the Owner's behalf, by design (a payment method and a Google account login are not
   things any script or AI session should be able to do unattended).
2. **Only if `gh` is unavailable or not authenticated:** paste three non-secret values into
   one GitHub Settings page, then click "Run workflow" once. This is a fallback path, not
   the primary one — if `gh` is present and signed in, this step happens automatically.
3. **The pre-existing, unrelated human gate:** actual human playtest of the refoundation
   design once a live endpoint exists and is wired in — unaffected by, and not claimed as
   satisfied by, anything in this document.

After that, GitHub Actions permanently owns deploy + live smoke test for
`functions/newlife-refoundation-ai/` on every future `workflow_dispatch` run — no further
Owner `gcloud` session is needed for redeploys.

## 5. Testing

`tests/newlifeRefoundationWindowsBootstrapScript.test.ts` performs the same class of
static, text-based checks `tests/newlifeRefoundationDeployAutomation.test.ts` already
performs on the Bash script and canonical workflow YAML — no `pwsh` execution is assumed
to be available (this repository's PowerShell scripts are consistently tested this way;
see `tests/newlifeDeployScripts.test.ts`). It pins: the exact repo/WIF/role/API constants
match the Bash script's, no JSON-key-creation or credential-printing pattern exists, every
`gcloud`/`gh` mutation is idempotent (a `describe`/`auth status` guard precedes each
`create`/`variable set`), and the script never writes to
`src/newlife/refoundation/config.ts` or touches the legacy function paths.

## 6. Not claimed

`HUMAN_VALIDATION_STATUS` remains `PENDING`. No live provider call has been made by this
change. `READY_FOR_PRODUCT_RELEASE` remains `NO`. This document records infrastructure
availability, not a deploy result — the deploy result (a real HTTPS URL, real smoke-test
output) only exists once an Owner actually runs the bootstrap and then the workflow.

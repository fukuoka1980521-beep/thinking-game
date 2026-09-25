# V34 — Permanent GitHub Actions Deploy Route for the Refoundation Backend

## 0. Why this exists

Every prior live-provider round (the `f9f6232`..`508720f` sequence) hit the
same wall from inside a Claude Code session: `gcloud`, `npm`, and even `env`
require interactive tool-approval that does not exist in a non-interactive
run, so `functions/newlife-refoundation-ai/` has never been deployed. This
round replaces "Claude Code tries `gcloud` again" with "GitHub Actions runs
`gcloud`, authenticated via OIDC, on `workflow_dispatch`" — a deployment
executor that does not depend on this sandbox having any GCP credentials at
all.

## 1. What exists now

| Path | Purpose |
|---|---|
| `docs/newlife/refoundation/github-actions/newlife-refoundation-live.yml` | The canonical workflow content (see §2 for why it isn't in `.github/workflows/` yet). |
| `scripts/newlife-deploy/bootstrap-refoundation-wif.sh` | One-time, idempotent, Owner-run GCP setup (WIF pool/provider, deploy service account, IAM bindings). Never executed automatically. |
| `tests/newlifeRefoundationDeployAutomation.test.ts` | Static safety checks on both files above (see §5). |

Nothing here deploys anything by itself. `functions/newlife-refoundation-ai/`
remains undeployed until an Owner performs the two manual steps in §3.

## 2. The exact permission boundary hit, and how it was confirmed

This round did not assume the `.github/workflows/` restriction — it was
re-verified directly. A commit containing
`.github/workflows/newlife-refoundation-live.yml` was created locally and an
actual push was attempted from this session. The push was rejected with:

```
! [remote rejected] HEAD -> chatgpt/newlife-refoundation-v1 (refusing to allow a GitHub App to create or update workflow `.github/workflows/newlife-refoundation-live.yml` without `workflows` permission)
```

This is a GitHub App installation-permission boundary, not a sandbox/gcloud
credential problem (the class of blocker every prior round hit) and not
something any Claude Code session — this one or a future one — can route
around by retrying, using a different tool, or asking a different way: the
Claude GitHub App simply is not installed with the `workflows` permission
scope on this repository. The locally-created probe commit was never
pushed; it was folded back out via `git rm` + `git commit --amend
--allow-empty` before any of this round's real work was committed, so no
trace of that attempt reached history or the remote.

Per the trigger's own instruction 10, the permanent route is not abandoned
because of this — the workflow's full content is committed at the doc path
above, ready to activate with a two-command copy, and the one-time GCP-side
bootstrap (§3, step 2) is fully independent of it and already committable
today.

## 3. Remaining Owner action (exactly two steps)

### Step 1 — activate the workflow file (one-time, ~10 seconds, no GCP access needed)

```
cp docs/newlife/refoundation/github-actions/newlife-refoundation-live.yml \
   .github/workflows/newlife-refoundation-live.yml
git add .github/workflows/newlife-refoundation-live.yml
git commit -m "ci(newlife-refoundation): add manual live-deploy workflow"
git push
```

This step requires only normal GitHub write access (which the Owner already
has), not GCP credentials. It can be done before, after, or independent of
Step 2.

### Step 2 — one-time GCP bootstrap (requires an Owner gcloud session already authenticated against the target project)

```
PROJECT_ID=<your-gcp-project-id> bash scripts/newlife-deploy/bootstrap-refoundation-wif.sh
```

(The script is committed without the executable bit set — this session's
sandbox could not run `chmod +x`. Run it via `bash`, or `chmod +x` it
yourself first if you prefer `./scripts/...`.)

This is the same target project already used for the previously-deployed
`functions/newlife-dialogue/` (see `scripts/newlife-deploy/deploy.ps1`'s own
default, `gas-test-runner-20260620-wjxf`) unless the Owner has since moved to
a different project. The script is fully idempotent — re-running it after a
partial failure (e.g. billing not yet linked) is safe. It ends by printing
the exact three (optionally four) values to paste into **GitHub repository
Settings > Secrets and variables > Actions > Variables tab** (not Secrets —
none of these values are secret; they identify a public OIDC trust
relationship, not a credential):

- `GCP_PROJECT_ID`
- `GCP_WIF_PROVIDER`
- `GCP_DEPLOY_SERVICE_ACCOUNT`
- `GCP_RUNTIME_SERVICE_ACCOUNT` (optional, only if a non-default runtime
  service account was chosen)

### After both steps

Trigger the workflow manually: **Actions tab > "NEW LIFE Refoundation — Live
Backend Deploy (manual)" > Run workflow**. It deploys
`functions/newlife-refoundation-ai/`, runs both smoke tests
(`interpret_turn`, `generate_npc_line`) against the live endpoint, and prints
the resulting HTTPS URL in the job summary. It does **not** write that URL
into `src/newlife/refoundation/config.ts` — pasting it there (or leaving it
empty) remains a separate, deliberate product-activation decision, per the
trigger's own instruction 6 and consistent with every prior round's
disclosed rule that an empty endpoint keeps `RefoundationApp.tsx` on its
fully deterministic path.

No further Owner decision beyond these two steps is required to reach live
smoke evidence — everything else (workflow logic, request/response
validation, consent gating, fallback behavior) was already implemented and
CI-verified in the `f9f6232`..`508720f` rounds.

## 4. Design choices and why

- **OIDC/WIF, not a service-account key.** `google-github-actions/auth@v2`
  exchanges the job's own short-lived GitHub OIDC token for a short-lived
  Google access token. No JSON key file, no long-lived credential, exists in
  this repository, in a GitHub secret, or on any disk at any point.
- **The WIF provider's `attribute-condition` is scoped to this exact repo**
  (`assertion.repository == 'fukuoka1980521-beep/thinking-game'`), so even if
  the pool/provider identifiers were guessed by another repository, no token
  from elsewhere could exchange for this project's deploy identity.
- **`workflow_dispatch` only.** The workflow never runs on `push` or
  `pull_request` — it only runs when a human explicitly clicks "Run
  workflow," matching the trigger's "manually triggered only... for now."
- **`permissions: contents: read, id-token: write` only.** No
  `pull-requests: write`, no `issues: write`, no `contents: write` — the job
  cannot modify this repository at all, only read it and mint an OIDC token.
- **Deploy SA vs. runtime SA, kept separate.** The deploy SA (used by the
  workflow to run `gcloud functions deploy`) gets only
  `cloudfunctions.developer` / `run.admin` / `iam.serviceAccountUser` /
  `artifactregistry.writer` / `cloudbuild.builds.editor` /
  `storage.objectViewer` — enough to deploy a Gen2 function, nothing more.
  It deliberately does **not** get `serviceusage.services.enable` — API
  enablement stays a one-time Owner action (bootstrap script §1), not
  something a CI identity can do on every run. The function's own *runtime*
  identity (what it calls Vertex AI as once deployed) is a distinct
  principal, granted only `aiplatform.user`, and defaults to the project's
  existing default compute service account rather than inventing a new
  always-on identity, unless the Owner opts into a dedicated one.
- **Verify-then-fail, not silently auto-enable.** The workflow's "Verify
  required GCP APIs are enabled" step fails with an actionable, exact
  message pointing at bootstrap step 1 if any API is missing, rather than
  attempting to enable it with a CI-level identity that (by design, per the
  point above) doesn't have permission to do so anyway.
- **Deploy parameters match the trigger's instruction 5 and the function's
  own already-published README exactly**: Gen2, `nodejs20`,
  `asia-northeast1`, entry point `newlifeRefoundationAi`, `--max-instances=1`,
  `--timeout=20s`, `256Mi`, `--allow-unauthenticated`, env var `GCP_PROJECT`.
  No new deploy parameters were invented.
- **Smoke tests use safe, fixed, clearly-labeled non-production fixtures**
  (`"Smoke test fixture from newlife-refoundation-live.yml..."` in every
  `caseContext`/`sceneContext`), never real player data, and validate HTTP
  status plus response shape (right fields, right types) without printing
  any credential or token. The shape check is intentionally a lightweight
  structural check, not a duplicate of the exhaustive closed-enum
  validation that already exists and is tested client-side
  (`isValidRawTurnClassification` / `isValidRawNpcLine` in
  `src/newlife/refoundation/semanticInterpreter.ts` /
  `npcGeneration.ts`) — duplicating that enum list inside a workflow YAML
  would be a second copy to keep in sync for no added safety.
- **`src/newlife/refoundation/config.ts` is never touched by this workflow**,
  per the trigger's instruction 6 — deploy/smoke and product activation stay
  two separate, independently reversible actions.

## 5. What was verified this round (static, not live — no deployment occurred)

- The exact `.github/workflows/` rejection message above, from a real push
  attempt, not assumed from a prior round's disclosure.
- `tests/newlifeRefoundationDeployAutomation.test.ts` (new) statically
  checks: the canonical workflow YAML parses as valid YAML, triggers only on
  `workflow_dispatch`, declares only `contents: read` + `id-token: write`
  permissions, uses `google-github-actions/auth` (not a raw key input), never
  references `secrets.` (only `vars.`), never contains a private-key/JSON-key
  pattern, deploys with every parameter the trigger specified, and never
  contains a reference to `config.ts`; and that the bootstrap script is
  syntactically valid Bash (`bash -n`), never creates or downloads a
  service-account key, and is idempotent (each `create` step is preceded by
  a `describe`/existence check).
- No product code, legacy NEW LIFE file, or existing test was modified.
  `chatgpt/newlife-phase34-human-playtest-repair` remains unmerged and
  untouched. PR #22 remains open/unmerged.

## 6. What is explicitly still not done

- No deployment occurred. No live smoke test occurred. Both require the two
  Owner steps in §3, neither of which any Claude Code session can perform
  (Step 1 needs the `workflows` GitHub App permission this session does not
  have; Step 2 needs an Owner's own authenticated `gcloud` session against a
  billed GCP project).
- Once Step 1 + Step 2 are done and the workflow is run once successfully,
  the remaining gates already disclosed in `functions/newlife-refoundation-ai/README.md`
  §"Remaining gates before this can ship to a real player" are unchanged by
  this round: a human review of the AI-dialogue consent copy, the
  refoundation vertical slice's own human-playtest gate, and a first live
  output evaluation pass once the model is actually reachable.

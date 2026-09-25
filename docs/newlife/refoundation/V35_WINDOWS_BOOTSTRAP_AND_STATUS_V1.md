# V35 — Windows-Native One-Time Bootstrap + Current Status

## 0. Purpose

V34 built the permanent GitHub Actions deploy/smoke executor
(`newlife-refoundation-live.yml`) and a Bash one-time GCP bootstrap script
so no future Claude Code session would need to retry `gcloud` inside this
sandbox. That workflow is now **already activated on `master`**. What
remained was that the one-time GCP bootstrap script was Bash-only, requiring
an Owner on Windows to use WSL or hand-copy multi-step commands. This round
adds a Windows-native PowerShell equivalent so the *entire* remaining
one-time action can be a single script invocation from a normal Windows
`gcloud`/PowerShell install — no Bash/WSL required.

This round changes **no semantic/game logic** and **no legacy NEW LIFE
file**. It only adds a deployment-automation script, its tests, and this
doc.

## 1. Current authoritative state (as of this round)

| Item | Status |
|---|---|
| PR #22 | Open, unmerged, mergeable (head was cleaned/synced after the temporary preflight probe). |
| `chatgpt/newlife-phase34-human-playtest-repair` | Unmerged, untouched. |
| `.github/workflows/newlife-refoundation-live.yml` | **Already active on `master`.** Manually triggered only (`workflow_dispatch`); deliberately checks out `chatgpt/newlife-refoundation-v1`, so PR #22 does **not** need to be merged to deploy/validate the isolated backend. |
| Temporary GCP preflight probe workflow | Executed once (read-only — listed enabled services, made no writes), then removed. Not part of the permanent route. |
| Preflight result | Confirmed **all three** required repository variables are absent: `GCP_PROJECT_ID`, `GCP_WIF_PROVIDER`, `GCP_DEPLOY_SERVICE_ACCOUNT`. |
| GCP project already used by this repo | `gas-test-runner-20260620-wjxf` (same project `functions/newlife-dialogue/` was deployed to; same default this repo's other deploy helpers already use). |
| `NEW LIFE PR CI` / `NEW LIFE Deployment Readiness CI` | Passing on the latest commits. |
| `functions/newlife-refoundation-ai/` (the isolated live backend) | Still undeployed. Still unvalidated live. |
| `src/newlife/refoundation/config.ts` | Endpoint constant still empty — the deterministic-only fallback path remains active regardless of anything in this round. |

## 2. What's new this round

| Path | Purpose |
|---|---|
| `scripts/newlife-deploy/bootstrap-refoundation-wif.ps1` | Windows-native, functionally-equivalent PowerShell twin of `bootstrap-refoundation-wif.sh`. Same idempotent GCP OIDC/WIF setup, same least-privilege roles, same repo-scoped OIDC condition, same "never a JSON key, never a printed credential" guarantees — **plus** it tries to finish the GitHub half of the loop automatically. |
| `tests/newlifeRefoundationDeployAutomation.test.ts` (extended) | New `describe` block statically checking the `.ps1` script has the same safety properties as the accepted `.sh` script (idempotency, least privilege, no key material, repo-scoped OIDC, correct variable names), plus the new gh-automation behavior (auth-gated, no forced login, trigger only after variables are confirmed set, always offers a page to open when automation isn't possible). |
| This doc | Status snapshot + exact remaining one-time action. |

`bootstrap-refoundation-wif.ps1` does exactly what the Bash script does for
the GCP side (billing check → enable APIs → create WIF pool/provider,
scoped to `fukuoka1980521-beep/thinking-game` only → create the deploy
service account → grant it deploy-scoped roles only, never
owner/editor/`serviceusage.services.enable` → bind only this repo's
workflows to impersonate it → grant `roles/aiplatform.user` to the runtime
service account), then goes one step further than the Bash script:

- If `gh` (GitHub CLI) is installed **and already authenticated**
  (`gh auth status` succeeds), it runs `gh variable set` for all three
  required repository variables, then `gh workflow run
  newlife-refoundation-live.yml --repo fukuoka1980521-beep/thinking-game
  --ref master` to trigger the already-active workflow immediately — no
  further manual step at all.
- If `gh` is missing, or installed but not authenticated, the script
  **never** tries to install or log it in for you (per the trigger's own
  instruction 3). It opens
  `https://github.com/fukuoka1980521-beep/thinking-game/settings/variables/actions`
  in the default browser and prints the three (non-secret) values once for
  manual paste, then opens the workflow's Actions page so there's nothing
  to hunt for in menus.

No service-account JSON key is created or downloaded at any point, in
either script. No token, access key, or credential value is ever printed.

## 3. The one remaining Owner action

Everything else — the workflow itself, the isolated backend function, its
request/response validation, the client-side adapters, the consent gate,
the deterministic fallback — was already implemented and CI-verified in
prior rounds (V25 through V34's `f9f6232`..`508720f`..`5ade9e4` sequence).
The single remaining human boundary is the one-time Google
authorization/billing/IAM bootstrap, run once by an Owner who has:

- an already-installed `gcloud` CLI, and
- Owner/Editor rights on the target GCP project (or the ability to link
  billing on it).

**On Windows**, that is now one command:

```powershell
./scripts/newlife-deploy/bootstrap-refoundation-wif.ps1
```

(Defaults to `gas-test-runner-20260620-wjxf`; pass `-ProjectId` to use a
different project. Pass `-SkipGhAutomation` to always do the GitHub half by
hand instead.) The script will prompt an interactive `gcloud auth login` if
no account is currently active, open the billing page and stop safely if
billing isn't linked, and otherwise run through to completion — automating
the GitHub repository-variable paste and workflow trigger too if `gh` is
ready, or opening the two exact pages for manual completion if not.

**On macOS/Linux**, the equivalent remains:

```bash
PROJECT_ID=gas-test-runner-20260620-wjxf bash scripts/newlife-deploy/bootstrap-refoundation-wif.sh
```

— followed by pasting the three printed values into **Settings → Secrets
and variables → Actions → Variables**, and running the workflow once from
the Actions tab.

Once that one action is complete and the workflow has run successfully,
this PR will have real live-smoke evidence (`interpret_turn` and
`generate_npc_line` against the deployed endpoint) for the first time. No
further Claude Code session is needed for deployment itself going forward —
GitHub Actions is now the permanent, repeatable deploy/smoke executor.

## 4. What this round deliberately did not do

- Did not retry `gcloud`, `npm`, or any live GCP/GitHub call from inside
  this sandbox — the trigger explicitly asked not to, and every prior round
  already confirmed those commands require interactive approval that does
  not exist in this non-interactive session.
- Did not claim live validation. No deployment occurred this round. No
  smoke test occurred this round. This doc states that plainly rather than
  inferring success from the script existing.
- Did not touch legacy public NEW LIFE, semantic/state types, the
  relationship reducer, ending vector, semantic interpreter, NPC
  generation, thought tools, or the refoundation UI. Only the deployment
  layer (one new script + its tests + this doc) changed.
- Did not merge PR #22 or `chatgpt/newlife-phase34-human-playtest-repair`.
- Did not build a custom API-key-entry GUI or any other fragile
  key-management surface — the explicit anti-pattern named in the trigger.
  The only interactive elements are the Owner's own `gcloud auth login` /
  `gh auth login` sessions (started by those CLIs themselves, never
  wrapped) and opening two plain browser pages.

## 5. Verification performed this round

This sandbox has no `pwsh`, `gcloud`, or `gh` available (`command -v pwsh`
itself required interactive tool-approval that does not exist in this
non-interactive run — the same class of blocker every prior round in this
PR's history already disclosed). The new `.ps1` script was hand-traced
line-by-line against the accepted Bash script's logic (same steps, same
ordering, same idempotency checks, same role list) rather than executed.
Real syntax verification will come from
`newlife-deploy-readiness-ci.yml`'s existing PowerShell syntax-check step
(`Get-ChildItem scripts/newlife-deploy/*.ps1 | ForEach-Object {
[scriptblock]::Create(...) }`), which picks up this new file automatically
with no workflow edit needed, plus the extended
`tests/newlifeRefoundationDeployAutomation.test.ts` run under
`npx vitest run` in the same CI job.

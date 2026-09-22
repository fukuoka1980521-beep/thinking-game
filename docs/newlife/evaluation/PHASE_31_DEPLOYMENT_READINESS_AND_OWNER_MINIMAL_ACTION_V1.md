# PHASE 31 — Deployment readiness and Owner minimal-action package

PROJECT: NEW_LIFE · Issue #1 · PHASE_31_DEPLOYMENT_READINESS_AND_OWNER_MINIMAL_ACTION_V1

SOURCE FACT vs SYNTHETIC TEST vs INFERENCE labeling is used throughout, per
this issue's own established convention (`PHASE_26_AUTONOMOUS_AI_AUDIT_V1.md`
§0). `HUMAN_VALIDATION_STATUS` remains `PENDING` everywhere in this
document; nothing here is or claims to be human or product validation.

## 1. What this Run did

Built the deployment-readiness package requested in
`PHASE_31_DEPLOYMENT_READINESS_AND_OWNER_MINIMAL_ACTION_V1` (issue comment
5782404714), under `scripts/newlife-deploy/`:

| File | Role |
|---|---|
| `check-readiness.ps1` | Read-only dry-run: gcloud install/auth/project/billing/required-APIs. |
| `deploy.ps1` | Print-only by default; `-EnableApis`/`-Deploy`/`-RunSmokeTest` gate real action. |
| `smoke-test.mjs` | Synthetic transport/validation smoke test of a deployed endpoint. |
| `wire-endpoint.mjs` | Dry-run diff of `src/newlife/semantic/config.ts`; `--apply` writes + verifies; `--commit` commits locally only (never pushes). |
| `rollback.ps1` | `-Apply` restores deterministic-only behavior (endpoint → `""`). |
| `live-eval.mjs` | Post-deploy fixed synthetic evaluation harness; saves raw model output as evidence, not a validation claim. |
| `lib.mjs` | Shared pure logic behind all of the above; covered by `tests/newlifeDeployScripts.test.ts`. |
| `README.md` | Order-of-operations walkthrough. |

Also added: `docs/newlife/evaluation/PHASE_31_CONSENT_COPY_REVIEW_CARD_V1.md`
(instruction 8) and this report (instruction 10). `tsconfig.json` gained one
line (`"allowJs": true`) so the new test file can type-check the `.mjs`
modules it imports without a hand-written `.d.ts` — this does not loosen any
existing `strict` check on `src/**/*.ts` (JS files still aren't type-checked
themselves; `allowJs` only lets TS resolve/infer types when a `.ts` file
imports a `.js`/`.mjs` module).

**No credential, API key, payment method, or GitHub secret was created,
read, or touched.** No GCP API was called (`gcloud` itself was not invoked
this Run at all — see §4 disclosed limitation). No Cloud Function was
deployed. `src/newlife/semantic/config.ts` still ships with an empty
`NEWLIFE_DIALOGUE_ENDPOINT_URL` — deployed behavior is unchanged from Phase
30 (verified by the pre-existing, unmocked `tests/newlife30Route.test.tsx`,
still green).

## 2. What is now automatable (no Owner debugging/file-editing/log-reading)

- **Readiness diagnosis**: `check-readiness.ps1` tells the Owner exactly
  which single prerequisite is missing (auth / project / access / billing /
  which specific API), in plain language, without them reading any gcloud
  output themselves.
- **API enablement + deploy**: `deploy.ps1 -EnableApis -Deploy` does both in
  one Owner-run command once billing is linked, using the exact parameters
  already documented in `functions/newlife-dialogue/README.md`
  (region `asia-northeast1`, `nodejs20`, entry point `newlifeDialogue`,
  `--max-instances=10`, `--timeout=20s`, `--memory=256Mi`) — no manual
  command copying.
- **URL capture**: the deployed HTTPS URL is captured mechanically into
  `deploy-result.json`, never requiring the Owner to copy/paste it.
- **Wiring the URL into the app**: `wire-endpoint.mjs --url <url> --apply`
  edits `config.ts`, runs typecheck/tests/build, and shows the diff — the
  Owner never opens a source file.
- **Smoke-testing**: `smoke-test.mjs` (or `deploy.ps1 -RunSmokeTest`)
  validates transport/CORS/validation behavior with zero private data sent.
- **Post-deploy evidence gathering**: `live-eval.mjs` runs the fixed
  synthetic probe set (Owner's own four failure transcripts + typo/
  multi-intent/prompt-injection/banned-canon/numeric-hallucination cases,
  across all six NPCs) and saves raw output for later review — the Owner
  never has to manually type test messages into the deployed endpoint to
  produce this first evidence pass.
- **Rollback**: `rollback.ps1 -Apply` is a single command that fully
  restores current (deterministic-only) production behavior.

## 3. What remains genuinely Owner-only

These cannot be automated by Claude Code, Orchestrator, or any other
in-repo machine path — matching CLAUDE.md §16's own `HUMAN_EXECUTION_REQUIRED`
conditions (Code can't, no other machine path can, and the action is a real
external/physical step):

1. **Linking a billing account** to the GCP project. This requires entering
   a payment method in the Cloud Console UI — no CLI or API path exists for
   an agent to do this on the Owner's behalf.
2. **`gcloud auth login`**, if not already authenticated — an interactive
   browser/device-code consent flow (CLAUDE.md's own "外部サービスの認証同意"
   human-operation category).
3. **Choosing/confirming the GCP project** the Owner wants billed, if one
   isn't already configured — this is exactly "事業仕様が複数成立し...売上が
   変わる" adjacent territory (which project bills this), so this script
   deliberately never guesses or auto-selects one (`deploy.ps1`'s `-ProjectId`
   is mandatory, unlike `check-readiness.ps1`'s optional auto-detect).
4. **The consent-copy wording decision** — approve as-is or use the
   tightened alternative (`PHASE_31_CONSENT_COPY_REVIEW_CARD_V1.md`).
5. **The six-character human microtest** — unaffected by this Run, still
   the actual outstanding human-validation gate for NEW LIFE overall.
6. **Reviewing `live-eval.mjs` output** for conversation quality once a real
   deploy exists — this Run built the harness; running it against a live
   model and judging the results are both post-deploy steps.

## 4. Disclosed limitation this Run

**`gcloud`, `pwsh`, and plain `node <script>` invocations were not
permitted in this session** (each returned "This command requires
approval," the same class of tool-permission gap disclosed for `npm`/`npx`
in the Phase 27 and Phase 28B reports — `npm run typecheck`/`npm
test`/`npm run build` *were* permitted and used directly). Consequences:

- The PowerShell scripts (`check-readiness.ps1`, `deploy.ps1`,
  `rollback.ps1`) were written and manually reviewed for syntax/logic but
  **could not be parsed or executed by `pwsh` this Run** to mechanically
  confirm they're syntactically valid PowerShell.
- The Node CLI wrapper scripts (`wire-endpoint.mjs`, `smoke-test.mjs`,
  `live-eval.mjs`) could not be run directly as `node <script>` either.

To make the underlying logic real, tested evidence rather than only
hand-reviewed text, every piece of non-CLI-argument-parsing logic was
factored into `lib.mjs` (zero dependencies) and is imported and exercised
for real by `tests/newlifeDeployScripts.test.ts` through the already-
permitted `npm test` path — the same pattern `tests/newlifeDialogueFunction.test.ts`
already established for `functions/newlife-dialogue/lib.js`. That test file
round-trips a real edit of the actual `src/newlife/semantic/config.ts`
content (wire → rollback → byte-identical to original), confirms the
synthetic `FactsSnapshot` builder produces a well-formed snapshot for all
six current NPCs with no accidental banned-term leakage, and pins every
required smoke-test case and all four exact Owner transcripts into the
live-eval fixed set.

**To let a future Run execute the CLI scripts directly instead of only
their extracted logic: add `Bash(pwsh)`, `Bash(gcloud)`, and `Bash(node
scripts/newlife-deploy/*.mjs)` to this workflow's `--allowedTools`.**

## 5. Exact minimum Owner action

**If billing/project access is absent** (the common case — no GCP project
has been set up for this repo yet):

1. Run `./scripts/newlife-deploy/check-readiness.ps1` once. It will report
   the single next missing step (likely: run `gcloud auth login`, then
   `gcloud config set project <project-id>`, then link a billing account
   in the Cloud Console — https://console.cloud.google.com/billing).
2. Re-run `check-readiness.ps1` after each step until it reports READY.

**If billing/APIs are already ready:**

1. Run `./scripts/newlife-deploy/deploy.ps1 -ProjectId <id> -EnableApis -Deploy -RunSmokeTest`.
2. Confirm the printed smoke-test summary looks structurally sane (no
   `ERROR` lines).
3. That's the entire Owner action. Nothing else needs to be typed, copied,
   or edited by hand.

## 6. Post-deploy sequence AI/Claude can resume automatically

Once `deploy-result.json` exists with a real URL (from the Owner's
`-Deploy` run above), a future Claude Run can, without further Owner
action:

1. `node scripts/newlife-deploy/wire-endpoint.mjs --url <url> --apply --commit`
   — wires the endpoint, verifies typecheck/tests/build, commits locally.
2. `node scripts/newlife-deploy/live-eval.mjs --url <url>` — gathers the
   first synthetic evidence pass.
3. Open a PR with the wiring commit + evidence file, summarizing the
   `live-eval.mjs` output for ChatGPT/Owner review (still not claiming
   human validation).
4. Report back on Issue #1 with the evidence, flagging only the two
   remaining genuinely human gates: consent-copy wording sign-off and the
   six-character human microtest.

This script never pushes and never merges — matching this repo's standing
rule (issue body "Rules": "Do not push directly to `master`... use a Claude
branch / PR").

## 7. Test evidence (this Run)

```
npm ci            -> 181 packages installed (node_modules was not present at session start)
npm run typecheck -> 0 errors (30 files under tests/ + src/, including the new tests/newlifeDeployScripts.test.ts)
npm test          -> 385/385 passed, 30 files (15 new in tests/newlifeDeployScripts.test.ts, 370 pre-existing all still green)
npm run build     -> succeeds; dist/ greppable-clean of "genai"/"api_key"/"GoogleGenAI" (unchanged from Phase 30)
```

`functions/newlife-dialogue/` itself was not modified this Run.

## 8. Known limitations (non-blocking)

- The PowerShell scripts' actual runtime behavior on Windows (as opposed to
  hand-reviewed syntax) has not been exercised — the Owner's first real run
  of `check-readiness.ps1` is effectively also its first live execution.
  This is disclosed, not hidden, and is why every script defaults to a
  read-only/dry-run mode with no destructive default path.
- `live-eval.mjs`'s synthetic `FactsSnapshot` values in `lib.mjs` are a
  manually-synced duplicate of `npcVoice.ts`'s fact strings (documented in
  `lib.mjs`'s own file header) — a drift here would produce a stale
  synthetic test payload, never a production behavior change, since nothing
  in `src/newlife/**` imports from `scripts/newlife-deploy/`.
- `live-eval.mjs`'s banned-term flag is a simple substring check (same
  class, not the same implementation, as `truthGate.ts`'s check) — it exists
  only to make evidence review easier, never to gate what's displayed to a
  player; the real client-side `truthGate.ts` is unchanged and still the
  only thing that can reject a live response before display.

```text
PHASE_31_DEPLOY_READINESS = IMPLEMENTED (read-only check + gated deploy/rollback scripts)
DRY_RUN_CHECK = IMPLEMENTED (check-readiness.ps1, always read-only)
DEPLOY_HELPER = IMPLEMENTED (deploy.ps1, print-only unless -EnableApis/-Deploy passed)
ENDPOINT_SMOKE_HARNESS = IMPLEMENTED (smoke-test.mjs, synthetic-only)
WIRING_HELPER = IMPLEMENTED (wire-endpoint.mjs, dry-run default, --apply to write, --commit for local commit only, never pushes)
ROLLBACK = IMPLEMENTED (rollback.ps1, dry-run default, -Apply to write; function-deletion command printed, never run)
CONSENT_COPY_REVIEW_CARD = DONE (PHASE_31_CONSENT_COPY_REVIEW_CARD_V1.md; one non-blocking wording-precision finding, no Owner approval claimed)
LIVE_MODEL_EVAL_HARNESS = IMPLEMENTED (live-eval.mjs, fixed synthetic set incl. all 4 exact Owner transcripts across all 6 NPCs; saves raw evidence, never labeled human validation)
OWNER_MANUAL_GIT_REQUIRED = NO
OWNER_MANUAL_SOURCE_EDIT_REQUIRED = NO
ROOT_TYPECHECK = PASS (0 errors)
ROOT_TESTS = PASS (385/385, 30 files)
ROOT_BUILD = PASS
CREDENTIALS_TOUCHED = NO
PRODUCTION_DEPLOYED = NO
HUMAN_VALIDATION_STATUS = PENDING
READY_FOR_CHATGPT_REVIEW = YES
READY_FOR_OWNER_MINIMAL_ACTION = YES (see §5 for the exact two branches)
```

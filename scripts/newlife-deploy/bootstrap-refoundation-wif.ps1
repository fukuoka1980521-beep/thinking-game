<#
.SYNOPSIS
  Windows-native ONE-TIME Owner-run bootstrap for the isolated NEW LIFE
  refoundation GitHub Actions deploy route
  (.github/workflows/newlife-refoundation-live.yml).

.DESCRIPTION
  Functionally equivalent to bootstrap-refoundation-wif.sh (see that file's
  header comment, and
  docs/newlife/refoundation/V34_LIVE_DEPLOY_GITHUB_ACTIONS_BOOTSTRAP_V1.md /
  docs/newlife/refoundation/V35_WINDOWS_BOOTSTRAP_AND_STATUS_V1.md for the
  full explanation) -- written for an Owner on Windows who does not want to
  use Bash/WSL or hand-copy multi-step gcloud commands.

  This script is NEVER executed automatically by any workflow, by Claude
  Code, or by any CI job. It requires an Owner's own interactive Google
  sign-in (a human with Owner/Editor rights on the target GCP project) and
  is meant to be run by hand, once.

  It sets up GitHub OIDC -> Google Cloud Workload Identity Federation so
  that .github/workflows/newlife-refoundation-live.yml can deploy
  functions/newlife-refoundation-ai/ WITHOUT any service-account JSON key
  ever existing on disk or in a GitHub secret. Every GCP step below is
  idempotent (safe to re-run) -- it checks for existing resources before
  creating them.

  After the GCP side is set up, this script tries to finish the loop:
    - if the GitHub CLI (`gh`) is installed AND already authenticated, it
      sets the three required repository VARIABLES automatically and then
      triggers the already-active "NEW LIFE Refoundation - Live Backend
      Deploy (manual)" workflow on `master` -- no further manual step;
    - otherwise it does NOT try to install or log `gh` in for you. It opens
      the repository's Actions "Variables" settings page in your default
      browser and prints the three (non-secret) values once so you can
      paste them by hand, then opens the workflow's run page.

  No service-account JSON key is ever created or downloaded. No token,
  access key, or credential value is ever printed to the console.

.PARAMETER ProjectId
  Defaults to the GCP project already used by this repository for the
  earlier real Vertex AI deployment: gas-test-runner-20260620-wjxf.
  Pass -ProjectId to override.

.PARAMETER RuntimeServiceAccount
  Optional. If the deployed function should run as a non-default service
  account, pass its email here. Defaults to the project's default compute
  service account, exactly like bootstrap-refoundation-wif.sh's
  RUNTIME_SERVICE_ACCOUNT environment variable.

.PARAMETER SkipGhAutomation
  Switch. If passed, this script never attempts `gh variable set` /
  `gh workflow run` even if `gh` is installed and authenticated -- it
  always falls back to opening the settings/workflow pages and printing
  the values for manual paste. Useful if you want to review the values
  yourself before they're set.

.EXAMPLE
  # Default project, full automation if `gh` is ready:
  ./scripts/newlife-deploy/bootstrap-refoundation-wif.ps1
.EXAMPLE
  # Different project, always do the GitHub half by hand:
  ./scripts/newlife-deploy/bootstrap-refoundation-wif.ps1 -ProjectId my-project-123 -SkipGhAutomation
#>
param(
  [string]$ProjectId = "gas-test-runner-20260620-wjxf",
  [string]$RuntimeServiceAccount,
  [switch]$SkipGhAutomation
)

# NOTE: intentionally "Continue", not "Stop" -- see deploy.ps1's identical
# note. gcloud routinely writes informational banners to stderr, which
# Windows PowerShell 5.1 turns into a terminating NativeCommandError under
# "Stop" even on a 0 exit code. Every consequential call below already
# checks $LASTEXITCODE explicitly.
$ErrorActionPreference = "Continue"

$Repo = "fukuoka1980521-beep/thinking-game"
$PoolId = "github-actions-pool"
$ProviderId = "github-actions-provider"
$SaId = "newlife-refoundation-deployer"
$SaEmail = "$SaId@$ProjectId.iam.gserviceaccount.com"
$WorkflowFile = "newlife-refoundation-live.yml"
$VariablesSettingsUrl = "https://github.com/$Repo/settings/variables/actions"
$WorkflowRunsUrl = "https://github.com/$Repo/actions/workflows/$WorkflowFile"

function Write-Section($title) {
  Write-Host ""
  Write-Host "== $title ==" -ForegroundColor Cyan
}

function Test-CommandExists($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

function Open-Url($url) {
  try {
    Start-Process $url -ErrorAction Stop | Out-Null
  } catch {
    Write-Host "Could not open a browser automatically. Open this URL yourself:" -ForegroundColor Yellow
    Write-Host "  $url"
  }
}

Write-Host "NEW LIFE refoundation WIF bootstrap (Windows-native, PowerShell)" -ForegroundColor Yellow
Write-Host "Project:    $ProjectId"
Write-Host "Repo:       $Repo"
Write-Host "Deploy SA:  $SaEmail"

Write-Section "Step 0: gcloud CLI present?"
if (-not (Test-CommandExists "gcloud")) {
  Write-Host "gcloud CLI not found. Install it: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
  Write-Host "Nothing further can be done without gcloud. Stopping here." -ForegroundColor Red
  exit 1
}
Write-Host "Found gcloud." -ForegroundColor Green

Write-Section "Step 1: interactive Google sign-in"
$account = (gcloud config get-value account 2>$null)
if ([string]::IsNullOrWhiteSpace($account) -or $account -eq "(unset)") {
  Write-Host "No authenticated gcloud account found. Launching interactive 'gcloud auth login'..." -ForegroundColor Yellow
  gcloud auth login
  if ($LASTEXITCODE -ne 0) {
    Write-Host "gcloud auth login FAILED (exit $LASTEXITCODE). Stopping." -ForegroundColor Red
    exit 1
  }
  $account = (gcloud config get-value account 2>$null)
}
if ([string]::IsNullOrWhiteSpace($account) -or $account -eq "(unset)") {
  Write-Host "Still no authenticated account after login attempt. Stopping." -ForegroundColor Red
  exit 1
}
Write-Host "Authenticated as: $account" -ForegroundColor Green
Write-Host "(No token or credential value is ever printed by this script.)"

Write-Section "Step 2: billing"
$billingEnabled = "$(gcloud billing projects describe $ProjectId --format='value(billingEnabled)' 2>$null)".Trim()
if ($billingEnabled -ne "True") {
  $billingUrl = "https://console.cloud.google.com/billing/linkedaccount?project=$ProjectId"
  Write-Host "Billing is NOT enabled/linked for project '$ProjectId'." -ForegroundColor Red
  Write-Host "Opening the billing page so you can link an account..." -ForegroundColor Yellow
  Open-Url $billingUrl
  Write-Host "Link a billing account there, then re-run this script. Stopping safely -- nothing else was changed." -ForegroundColor Yellow
  exit 1
}
Write-Host "Billing OK." -ForegroundColor Green

Write-Section "Step 3: enable required APIs (idempotent)"
gcloud services enable `
  iamcredentials.googleapis.com `
  iam.googleapis.com `
  sts.googleapis.com `
  aiplatform.googleapis.com `
  cloudfunctions.googleapis.com `
  cloudbuild.googleapis.com `
  run.googleapis.com `
  artifactregistry.googleapis.com `
  --project=$ProjectId
if ($LASTEXITCODE -ne 0) {
  Write-Host "gcloud services enable FAILED (exit $LASTEXITCODE). Stopping." -ForegroundColor Red
  exit 1
}
Write-Host "Required APIs enabled (or already were)." -ForegroundColor Green

$ProjectNumber = "$(gcloud projects describe $ProjectId --format='value(projectNumber)' 2>$null)".Trim()
if ([string]::IsNullOrWhiteSpace($ProjectNumber)) {
  Write-Host "Could not resolve the project number for '$ProjectId'. Stopping." -ForegroundColor Red
  exit 1
}

Write-Section "Step 4: Workload Identity Pool (idempotent)"
gcloud iam workload-identity-pools describe $PoolId --project=$ProjectId --location=global *> $null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Pool $PoolId already exists, skipping create." -ForegroundColor Yellow
} else {
  gcloud iam workload-identity-pools create $PoolId --project=$ProjectId --location=global --display-name="GitHub Actions"
  if ($LASTEXITCODE -ne 0) { Write-Host "Pool create FAILED (exit $LASTEXITCODE)." -ForegroundColor Red; exit 1 }
  Write-Host "Created pool $PoolId." -ForegroundColor Green
}

Write-Section "Step 5: OIDC provider restricted to this exact repo (idempotent)"
gcloud iam workload-identity-pools providers describe $ProviderId --project=$ProjectId --location=global --workload-identity-pool=$PoolId *> $null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Provider $ProviderId already exists, skipping create." -ForegroundColor Yellow
} else {
  gcloud iam workload-identity-pools providers create-oidc $ProviderId `
    --project=$ProjectId `
    --location=global `
    --workload-identity-pool=$PoolId `
    --display-name="GitHub OIDC" `
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" `
    --attribute-condition="assertion.repository == '$Repo'" `
    --issuer-uri="https://token.actions.githubusercontent.com"
  if ($LASTEXITCODE -ne 0) { Write-Host "Provider create FAILED (exit $LASTEXITCODE)." -ForegroundColor Red; exit 1 }
  Write-Host "Created provider $ProviderId, restricted to $Repo." -ForegroundColor Green
}

Write-Section "Step 6: deploy service account (idempotent)"
gcloud iam service-accounts describe $SaEmail --project=$ProjectId *> $null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Service account $SaEmail already exists, skipping create." -ForegroundColor Yellow
} else {
  gcloud iam service-accounts create $SaId --project=$ProjectId --display-name="NEW LIFE refoundation GitHub Actions deployer"
  if ($LASTEXITCODE -ne 0) { Write-Host "Service account create FAILED (exit $LASTEXITCODE)." -ForegroundColor Red; exit 1 }
  Write-Host "Created service account $SaEmail." -ForegroundColor Green
}

Write-Section "Step 7: grant the deploy SA least-privilege roles (idempotent)"
# Deliberately NOT roles/owner, roles/editor, or serviceusage.services.enable --
# API enablement (Step 3 above) stays an Owner-run, one-time action, not
# something the CI service account can do on every run.
$Roles = @(
  "roles/cloudfunctions.developer",
  "roles/run.admin",
  "roles/iam.serviceAccountUser",
  "roles/artifactregistry.writer",
  "roles/cloudbuild.builds.editor",
  "roles/storage.objectViewer"
)
foreach ($role in $Roles) {
  gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$SaEmail" --role=$role --condition=None *> $null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Granting $role to $SaEmail FAILED (exit $LASTEXITCODE)." -ForegroundColor Red
    exit 1
  }
  Write-Host "Granted $role to $SaEmail" -ForegroundColor Green
}

Write-Section "Step 8: allow ONLY this repo's GitHub Actions workflows to impersonate the deploy SA (idempotent)"
gcloud iam service-accounts add-iam-policy-binding $SaEmail `
  --project=$ProjectId `
  --role="roles/iam.workloadIdentityUser" `
  --member="principalSet://iam.googleapis.com/projects/$ProjectNumber/locations/global/workloadIdentityPools/$PoolId/attribute.repository/$Repo" `
  *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Binding FAILED (exit $LASTEXITCODE)." -ForegroundColor Red
  exit 1
}
Write-Host "Binding in place. Only workflow runs from $Repo can obtain a token as $SaEmail -- no other repo, and no long-lived key, can." -ForegroundColor Green

Write-Section "Step 9: grant Vertex AI access to the function's RUNTIME service account (idempotent)"
$RuntimeSa = $RuntimeServiceAccount
if ([string]::IsNullOrWhiteSpace($RuntimeSa)) {
  $RuntimeSa = "$ProjectNumber-compute@developer.gserviceaccount.com"
}
gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$RuntimeSa" --role="roles/aiplatform.user" --condition=None *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Granting Vertex AI role to runtime SA FAILED (exit $LASTEXITCODE)." -ForegroundColor Red
  exit 1
}
Write-Host "Granted roles/aiplatform.user to runtime SA: $RuntimeSa" -ForegroundColor Green
Write-Host "(This is the identity the deployed function calls Vertex AI as -- separate from the deploy SA above, which only deploys it.)"

$WifProvider = "projects/$ProjectNumber/locations/global/workloadIdentityPools/$PoolId/providers/$ProviderId"

Write-Section "GCP bootstrap complete"
Write-Host "  GCP_PROJECT_ID=$ProjectId"
Write-Host "  GCP_WIF_PROVIDER=$WifProvider"
Write-Host "  GCP_DEPLOY_SERVICE_ACCOUNT=$SaEmail"
Write-Host ""
Write-Host "No service-account JSON key was created or downloaded at any point." -ForegroundColor Yellow
if (-not [string]::IsNullOrWhiteSpace($RuntimeServiceAccount)) {
  Write-Host ""
  Write-Host "You used a custom runtime service account. Also set this optional repository variable:"
  Write-Host "  GCP_RUNTIME_SERVICE_ACCOUNT=$RuntimeSa"
}

# ---- Finish the loop: GitHub repository variables + workflow trigger ----

Write-Section "Step 10: GitHub repository variables"
$ghReady = $false
if ($SkipGhAutomation) {
  Write-Host "-SkipGhAutomation passed. Skipping automatic GitHub setup." -ForegroundColor Yellow
} elseif (-not (Test-CommandExists "gh")) {
  Write-Host "'gh' (GitHub CLI) not found. Skipping automatic variable setup -- not forcing an install." -ForegroundColor Yellow
} else {
  gh auth status *> $null
  if ($LASTEXITCODE -eq 0) {
    $ghReady = $true
  } else {
    Write-Host "'gh' is installed but not authenticated (gh auth status failed). Skipping automatic variable setup -- not forcing a login." -ForegroundColor Yellow
  }
}

if ($ghReady) {
  $varMap = [ordered]@{
    "GCP_PROJECT_ID" = $ProjectId
    "GCP_WIF_PROVIDER" = $WifProvider
    "GCP_DEPLOY_SERVICE_ACCOUNT" = $SaEmail
  }
  $varsOk = $true
  foreach ($key in $varMap.Keys) {
    gh variable set $key --repo $Repo --body $varMap[$key] *> $null
    if ($LASTEXITCODE -ne 0) {
      Write-Host "gh variable set $key FAILED (exit $LASTEXITCODE)." -ForegroundColor Red
      $varsOk = $false
    } else {
      Write-Host "Set repository variable $key" -ForegroundColor Green
    }
  }

  if ($varsOk) {
    Write-Section "Step 11: trigger the live deploy workflow"
    gh workflow run $WorkflowFile --repo $Repo --ref master
    if ($LASTEXITCODE -eq 0) {
      Write-Host "Triggered 'NEW LIFE Refoundation - Live Backend Deploy (manual)' on master." -ForegroundColor Green
      Write-Host "Watch it run here: $WorkflowRunsUrl"
      Open-Url $WorkflowRunsUrl
    } else {
      Write-Host "gh workflow run FAILED (exit $LASTEXITCODE). Trigger it yourself:" -ForegroundColor Red
      Write-Host "  $WorkflowRunsUrl"
      Open-Url $WorkflowRunsUrl
    }
  } else {
    Write-Host "Not all repository variables were set automatically. Finish the rest by hand:" -ForegroundColor Red
    Write-Host "  $VariablesSettingsUrl"
    Open-Url $VariablesSettingsUrl
  }
} else {
  Write-Host "Automatic GitHub setup unavailable. Opening the repository's Actions Variables settings page for manual paste:" -ForegroundColor Yellow
  Write-Host "  $VariablesSettingsUrl"
  Write-Host ""
  Write-Host "Paste these three values as repository VARIABLES (Settings tab is 'Variables', NOT 'Secrets' -- none of these are secret):" -ForegroundColor Yellow
  Write-Host "  GCP_PROJECT_ID=$ProjectId"
  Write-Host "  GCP_WIF_PROVIDER=$WifProvider"
  Write-Host "  GCP_DEPLOY_SERVICE_ACCOUNT=$SaEmail"
  Open-Url $VariablesSettingsUrl
  Write-Host ""
  Write-Host "After saving the variables, run the live deploy workflow here:" -ForegroundColor Yellow
  Write-Host "  $WorkflowRunsUrl"
  Open-Url $WorkflowRunsUrl
}

Write-Host ""
Write-Host "Bootstrap script finished." -ForegroundColor Yellow

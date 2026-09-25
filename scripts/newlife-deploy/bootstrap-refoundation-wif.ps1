<#
.SYNOPSIS
  ONE-TIME Owner-run bootstrap for the isolated NEW LIFE refoundation GitHub
  Actions deploy route (Windows/PowerShell equivalent of
  bootstrap-refoundation-wif.sh).

.DESCRIPTION
  Sets up GitHub OIDC -> Google Cloud Workload Identity Federation so that
  the manual `newlife-refoundation-live.yml` workflow can deploy
  functions/newlife-refoundation-ai/ WITHOUT any service-account JSON key
  ever existing on disk or in a GitHub secret.

  This script is NEVER executed automatically by any workflow, by Claude
  Code, or by any CI job. It requires an Owner's own gcloud session (a human
  with Owner/Editor rights on the target GCP project) and is meant to be
  run by hand, once. Every gcloud mutation is idempotent -- it checks for
  existing resources before creating them, and `add-iam-policy-binding` is
  itself idempotent.

  Unlike bootstrap-refoundation-wif.sh, this script also tries to finish the
  remaining manual step for you: if the GitHub CLI (`gh`) is installed and
  already authenticated, it sets the three repository variables the
  workflow reads and triggers the workflow on master automatically. If `gh`
  is missing or not authenticated, it does NOT ask you to install or log
  into a second CLI -- it opens the exact GitHub Settings page in your
  browser and prints the three (non-secret) values once for you to paste.

  See docs/newlife/refoundation/V34_LIVE_DEPLOY_GITHUB_ACTIONS_BOOTSTRAP_V1.md
  and docs/newlife/refoundation/V35_WINDOWS_BOOTSTRAP_AND_LIVE_GATE_V1.md.

.PARAMETER ProjectId
  Defaults to the GCP project already used for this repository's real
  Vertex AI deployments: gas-test-runner-20260620-wjxf. Pass -ProjectId to
  override.

.PARAMETER RuntimeServiceAccount
  Optional. The identity the deployed function calls Vertex AI as. Defaults
  to the project's default compute service account
  (<project-number>-compute@developer.gserviceaccount.com), matching
  bootstrap-refoundation-wif.sh's default.

.EXAMPLE
  ./scripts/newlife-deploy/bootstrap-refoundation-wif.ps1
.EXAMPLE
  ./scripts/newlife-deploy/bootstrap-refoundation-wif.ps1 -ProjectId my-project-123
#>
param(
  [string]$ProjectId = "gas-test-runner-20260620-wjxf",
  [string]$RuntimeServiceAccount
)

# NOTE: "Continue", not "Stop" -- see deploy.ps1's identical note. gcloud
# routinely writes informational banners to stderr, which Windows
# PowerShell 5.1 turns into a terminating NativeCommandError under "Stop"
# even on a 0 exit code. Unlike deploy.ps1's flagged review finding, every
# single consequential call below explicitly checks $LASTEXITCODE and exits
# immediately on failure -- nothing here silently continues past a failed
# gcloud/gh call.
$ErrorActionPreference = "Continue"

$Repo = "fukuoka1980521-beep/thinking-game"
$PoolId = "github-actions-pool"
$ProviderId = "github-actions-provider"
$SaId = "newlife-refoundation-deployer"
$WorkflowFile = "newlife-refoundation-live.yml"

$RequiredApis = @(
  "iamcredentials.googleapis.com",
  "iam.googleapis.com",
  "sts.googleapis.com",
  "aiplatform.googleapis.com",
  "cloudfunctions.googleapis.com",
  "cloudbuild.googleapis.com",
  "run.googleapis.com",
  "artifactregistry.googleapis.com"
)

$DeploySaRoles = @(
  "roles/cloudfunctions.developer",
  "roles/run.admin",
  "roles/iam.serviceAccountUser",
  "roles/artifactregistry.writer",
  "roles/cloudbuild.builds.editor",
  "roles/storage.objectViewer"
)

function Write-Section($title) {
  Write-Host ""
  Write-Host "== $title ==" -ForegroundColor Cyan
}

function Test-CommandExists($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

function Invoke-GcloudOrFail {
  param(
    [Parameter(Mandatory = $true)][string[]]$Args,
    [Parameter(Mandatory = $true)][string]$FailureMessage
  )
  $output = & gcloud @Args 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: $FailureMessage" -ForegroundColor Red
    Write-Host $output
    exit 1
  }
  return $output
}

Write-Host "NEW LIFE refoundation WIF bootstrap (Windows) — project: $ProjectId" -ForegroundColor Yellow
Write-Host "Repo: $Repo"
Write-Host "Idempotent: safe to re-run. Never creates a service-account JSON key."
Write-Host ""

Write-Section "0. gcloud CLI"
if (-not (Test-CommandExists "gcloud")) {
  Write-Host "NOT FOUND. Install the Google Cloud CLI: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
  exit 1
}
Write-Host "Found gcloud." -ForegroundColor Green

Write-Section "1. Authenticated account"
$account = "$(& gcloud config get-value account 2>$null)".Trim()
if ([string]::IsNullOrWhiteSpace($account) -or $account -eq "(unset)") {
  Write-Host "No authenticated gcloud account. Opening the interactive Google login now (one-time, Owner-only action)..." -ForegroundColor Yellow
  & gcloud auth login
  if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: gcloud auth login did not complete." -ForegroundColor Red
    exit 1
  }
  $account = "$(& gcloud config get-value account 2>$null)".Trim()
  if ([string]::IsNullOrWhiteSpace($account) -or $account -eq "(unset)") {
    Write-Host "FAILED: still no authenticated account after gcloud auth login." -ForegroundColor Red
    exit 1
  }
}
Write-Host "Authenticated as: $account" -ForegroundColor Green
Write-Host "(No token or credential value is ever printed by this script.)"

Write-Section "2. Billing"
$billingOutput = & gcloud billing projects describe $ProjectId --format="value(billingEnabled)" 2>&1
if ($LASTEXITCODE -ne 0 -or -not ($billingOutput -match "True")) {
  $billingUrl = "https://console.cloud.google.com/billing/linkedaccount?project=$ProjectId"
  Write-Host "Billing is NOT confirmed enabled for '$ProjectId'." -ForegroundColor Red
  Write-Host "Opening the exact billing page. Link a payment method there, then re-run this script (it is idempotent and will resume from here)." -ForegroundColor Yellow
  Write-Host $billingUrl
  Start-Process $billingUrl
  exit 1
}
Write-Host "Billing OK." -ForegroundColor Green

Write-Section "3. Enable required APIs (idempotent)"
Invoke-GcloudOrFail -Args @("services", "enable") + $RequiredApis + @("--project=$ProjectId") `
  -FailureMessage "gcloud services enable failed."
Write-Host "APIs enabled: $($RequiredApis -join ', ')" -ForegroundColor Green

$ProjectNumber = (Invoke-GcloudOrFail -Args @("projects", "describe", $ProjectId, "--format=value(projectNumber)") `
  -FailureMessage "Could not resolve project number for '$ProjectId'.").Trim()
$SaEmail = "$SaId@$ProjectId.iam.gserviceaccount.com"

Write-Section "4. Workload Identity Pool (idempotent)"
& gcloud iam workload-identity-pools describe $PoolId --project=$ProjectId --location=global *> $null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Pool $PoolId already exists, skipping create." -ForegroundColor Green
} else {
  Invoke-GcloudOrFail -Args @("iam", "workload-identity-pools", "create", $PoolId, "--project=$ProjectId", "--location=global", "--display-name=GitHub Actions") `
    -FailureMessage "Could not create workload identity pool $PoolId."
  Write-Host "Pool $PoolId created." -ForegroundColor Green
}

Write-Section "5. OIDC provider restricted to this exact repo (idempotent)"
& gcloud iam workload-identity-pools providers describe $ProviderId --project=$ProjectId --location=global --workload-identity-pool=$PoolId *> $null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Provider $ProviderId already exists, skipping create." -ForegroundColor Green
} else {
  Invoke-GcloudOrFail -Args @(
    "iam", "workload-identity-pools", "providers", "create-oidc", $ProviderId,
    "--project=$ProjectId", "--location=global", "--workload-identity-pool=$PoolId",
    "--display-name=GitHub OIDC",
    "--attribute-mapping=google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner",
    "--attribute-condition=assertion.repository == '$Repo'",
    "--issuer-uri=https://token.actions.githubusercontent.com"
  ) -FailureMessage "Could not create OIDC provider $ProviderId."
  Write-Host "Provider $ProviderId created, restricted to $Repo." -ForegroundColor Green
}

Write-Section "6. Deploy service account (idempotent)"
& gcloud iam service-accounts describe $SaEmail --project=$ProjectId *> $null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Service account $SaEmail already exists, skipping create." -ForegroundColor Green
} else {
  Invoke-GcloudOrFail -Args @("iam", "service-accounts", "create", $SaId, "--project=$ProjectId", "--display-name=NEW LIFE refoundation GitHub Actions deployer") `
    -FailureMessage "Could not create service account $SaId."
  Write-Host "Service account $SaEmail created." -ForegroundColor Green
}

Write-Section "7. Grant deploy SA least-privilege roles (never owner/editor, idempotent)"
foreach ($role in $DeploySaRoles) {
  Invoke-GcloudOrFail -Args @("projects", "add-iam-policy-binding", $ProjectId, "--member=serviceAccount:$SaEmail", "--role=$role", "--condition=None") `
    -FailureMessage "Could not grant $role to $SaEmail." | Out-Null
  Write-Host "Granted $role to $SaEmail" -ForegroundColor Green
}

Write-Section "8. Allow only this repo's workflows to impersonate the deploy SA (idempotent)"
$member = "principalSet://iam.googleapis.com/projects/$ProjectNumber/locations/global/workloadIdentityPools/$PoolId/attribute.repository/$Repo"
Invoke-GcloudOrFail -Args @("iam", "service-accounts", "add-iam-policy-binding", $SaEmail, "--project=$ProjectId", "--role=roles/iam.workloadIdentityUser", "--member=$member") `
  -FailureMessage "Could not bind workloadIdentityUser for $Repo on $SaEmail." | Out-Null
Write-Host "Binding in place. Only workflow runs from $Repo can obtain a token as $SaEmail." -ForegroundColor Green

Write-Section "9. Grant Vertex AI access to the runtime SA (idempotent)"
if ([string]::IsNullOrWhiteSpace($RuntimeServiceAccount)) {
  $RuntimeServiceAccount = "$ProjectNumber-compute@developer.gserviceaccount.com"
}
Invoke-GcloudOrFail -Args @("projects", "add-iam-policy-binding", $ProjectId, "--member=serviceAccount:$RuntimeServiceAccount", "--role=roles/aiplatform.user", "--condition=None") `
  -FailureMessage "Could not grant roles/aiplatform.user to $RuntimeServiceAccount." | Out-Null
Write-Host "Granted roles/aiplatform.user to runtime SA: $RuntimeServiceAccount" -ForegroundColor Green

$WifProvider = "projects/$ProjectNumber/locations/global/workloadIdentityPools/$PoolId/providers/$ProviderId"

Write-Section "10. Wire the three repository variables + trigger the workflow"
$ghReady = $false
if (Test-CommandExists "gh") {
  & gh auth status *> $null
  if ($LASTEXITCODE -eq 0) {
    $ghReady = $true
  }
}

if ($ghReady) {
  Write-Host "gh CLI found and authenticated — setting repository variables automatically." -ForegroundColor Cyan
  & gh variable set GCP_PROJECT_ID --repo $Repo --body $ProjectId
  & gh variable set GCP_WIF_PROVIDER --repo $Repo --body $WifProvider
  & gh variable set GCP_DEPLOY_SERVICE_ACCOUNT --repo $Repo --body $SaEmail
  if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: gh variable set did not complete for all three variables." -ForegroundColor Red
    Write-Host "Fall back to the manual paste below." -ForegroundColor Yellow
    $ghReady = $false
  } else {
    Write-Host "Repository variables set." -ForegroundColor Green
    Write-Host "Triggering $WorkflowFile on master..." -ForegroundColor Cyan
    & gh workflow run $WorkflowFile --repo $Repo --ref master
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Repository variables were set, but triggering the workflow automatically FAILED." -ForegroundColor Red
      Write-Host "Run it by hand: Actions tab > `"NEW LIFE Refoundation — Live Backend Deploy (manual)`" > Run workflow." -ForegroundColor Yellow
    } else {
      Write-Host "Workflow run triggered. It deploys, then smoke-tests interpret_turn and generate_npc_line." -ForegroundColor Green
    }
  }
}

if (-not $ghReady) {
  $variablesUrl = "https://github.com/$Repo/settings/variables/actions"
  $workflowUrl = "https://github.com/$Repo/actions/workflows/$WorkflowFile"
  Write-Host "gh CLI is not installed or not authenticated. This script does NOT require installing/logging into gh." -ForegroundColor Yellow
  Write-Host "Opening the exact GitHub Settings > Variables page..." -ForegroundColor Yellow
  Start-Process $variablesUrl
  Write-Host ""
  Write-Host "Paste these three values there (Settings > Secrets and variables > Actions > Variables tab, not Secrets):"
  Write-Host "  GCP_PROJECT_ID=$ProjectId"
  Write-Host "  GCP_WIF_PROVIDER=$WifProvider"
  Write-Host "  GCP_DEPLOY_SERVICE_ACCOUNT=$SaEmail"
  Write-Host ""
  Write-Host "Then open the workflow page and run it by hand:" -ForegroundColor Yellow
  Start-Process $workflowUrl
  Write-Host $workflowUrl
}

Write-Host ""
Write-Host "================================================================"
Write-Host "Bootstrap complete. No service-account JSON key was created or downloaded at any point." -ForegroundColor Green
Write-Host "================================================================"

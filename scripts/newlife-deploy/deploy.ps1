<#
.SYNOPSIS
  Phase 31 explicit deploy path for functions/newlife-dialogue/ (Owner-run, gated, not executed by any AI Run).

.DESCRIPTION
  Default mode (no switches) only PRINTS the exact commands it would run —
  it makes no API calls at all. Nothing here enables an API, mutates
  billing/IAM, or deploys, unless you explicitly pass the matching switch.
  This mirrors the README.md deploy command exactly (region asia-northeast1,
  runtime nodejs20, entry point newlifeDialogue, max-instances 10, timeout
  20s, 256Mi) — this script does not invent different defaults.

.PARAMETER ProjectId
  Required. Deliberately not auto-detected here (unlike check-readiness.ps1)
  so a deploy can never silently target the wrong project.

.PARAMETER EnableApis
  Switch. If passed, runs `gcloud services enable` for the five required
  APIs before deploying. Omit to skip (e.g. if check-readiness.ps1 already
  showed them all enabled).

.PARAMETER Deploy
  Switch. If passed, actually runs `gcloud functions deploy`. Without it,
  the script only prints the command it would run (safe default).

.PARAMETER RunSmokeTest
  Switch. If passed and -Deploy succeeded, runs smoke-test.mjs against the
  freshly deployed URL automatically (captured mechanically, no copy/paste).

.EXAMPLE
  # Print what would happen, change nothing:
  ./scripts/newlife-deploy/deploy.ps1 -ProjectId my-project-123
.EXAMPLE
  # Actually enable APIs + deploy + smoke test:
  ./scripts/newlife-deploy/deploy.ps1 -ProjectId my-project-123 -EnableApis -Deploy -RunSmokeTest
#>
param(
  [Parameter(Mandatory = $true)][string]$ProjectId,
  [switch]$EnableApis,
  [switch]$Deploy,
  [switch]$RunSmokeTest
)

$ErrorActionPreference = "Stop"

$RequiredApis = @(
  "aiplatform.googleapis.com",
  "cloudfunctions.googleapis.com",
  "cloudbuild.googleapis.com",
  "run.googleapis.com",
  "artifactregistry.googleapis.com"
)

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "../..")
$FunctionSource = Join-Path $RepoRoot "functions/newlife-dialogue"

Write-Host "NEW LIFE deploy helper — project: $ProjectId" -ForegroundColor Yellow
Write-Host "EnableApis switch: $($EnableApis.IsPresent)   Deploy switch: $($Deploy.IsPresent)   RunSmokeTest switch: $($RunSmokeTest.IsPresent)"
Write-Host ""

$enableCmd = "gcloud services enable $($RequiredApis -join ' ') --project $ProjectId"
Write-Host "API-enable command:"
Write-Host "  $enableCmd"
if ($EnableApis) {
  Write-Host "Running it now (explicit -EnableApis passed)..." -ForegroundColor Cyan
  Invoke-Expression $enableCmd
} else {
  Write-Host "NOT run (pass -EnableApis to actually run it)." -ForegroundColor Yellow
}

Write-Host ""
$deployArgs = @(
  "functions", "deploy", "newlife-dialogue",
  "--gen2",
  "--runtime=nodejs20",
  "--region=asia-northeast1",
  "--source=$FunctionSource",
  "--entry-point=newlifeDialogue",
  "--trigger-http",
  "--allow-unauthenticated",
  "--memory=256Mi",
  "--timeout=20s",
  "--max-instances=10",
  "--project=$ProjectId",
  "--format=value(serviceConfig.uri)"
)
Write-Host "Deploy command:"
Write-Host "  gcloud $($deployArgs -join ' ')"

if (-not $Deploy) {
  Write-Host "NOT run (pass -Deploy to actually deploy). No API was called, nothing changed." -ForegroundColor Yellow
  exit 0
}

Write-Host "Deploying now (explicit -Deploy passed)..." -ForegroundColor Cyan
$deployedUrl = (& gcloud @deployArgs 2>&1 | Select-Object -Last 1)
if ($LASTEXITCODE -ne 0) {
  Write-Host "Deploy FAILED. Output above." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Deployed. HTTPS trigger URL: $deployedUrl" -ForegroundColor Green
$resultFile = Join-Path $RepoRoot "deploy-result.json"
@{ projectId = $ProjectId; url = $deployedUrl; deployedAt = (Get-Date).ToString("o") } | ConvertTo-Json | Set-Content -Path $resultFile
Write-Host "Captured to $resultFile (not committed automatically)."

Write-Host ""
Write-Host "Next step (not run automatically): wire it into the app with"
Write-Host "  node scripts/newlife-deploy/wire-endpoint.mjs --url `"$deployedUrl`" --apply"

if ($RunSmokeTest) {
  Write-Host ""
  Write-Host "Running smoke test against the freshly deployed URL (explicit -RunSmokeTest passed)..." -ForegroundColor Cyan
  node (Join-Path $PSScriptRoot "smoke-test.mjs") --url $deployedUrl --out (Join-Path $RepoRoot "evidence/newlife-smoke-test-latest.json")
}

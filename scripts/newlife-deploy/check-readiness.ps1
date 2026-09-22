<#
.SYNOPSIS
  Phase 31 deployment-readiness check for functions/newlife-dialogue/ (read-only, dry-run).

.DESCRIPTION
  Checks, without changing anything:
    - whether the gcloud CLI is installed
    - which account gcloud is currently authenticated as (never prints a token)
    - the currently active gcloud project (or -ProjectId if you pass one)
    - whether billing is enabled for that project
    - whether the five APIs functions/newlife-dialogue/ needs are enabled
  Every gcloud call this script makes is a read-only "describe"/"list" call.
  It never runs `gcloud services enable`, `gcloud functions deploy`, or
  anything that mutates billing/IAM/APIs. See deploy.ps1 for the separate,
  explicitly-gated script that can actually deploy.

.PARAMETER ProjectId
  Optional. If omitted, uses gcloud's current active project (`gcloud config
  get-value project`). The script never guesses or invents a project id.

.EXAMPLE
  ./scripts/newlife-deploy/check-readiness.ps1
.EXAMPLE
  ./scripts/newlife-deploy/check-readiness.ps1 -ProjectId my-project-123
#>
param(
  [string]$ProjectId
)

$ErrorActionPreference = "Continue"

$RequiredApis = @(
  "aiplatform.googleapis.com",
  "cloudfunctions.googleapis.com",
  "cloudbuild.googleapis.com",
  "run.googleapis.com",
  "artifactregistry.googleapis.com"
)

function Write-Section($title) {
  Write-Host ""
  Write-Host "== $title ==" -ForegroundColor Cyan
}

function Test-CommandExists($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

Write-Host "NEW LIFE deployment-readiness check (read-only, no changes made)" -ForegroundColor Yellow
Write-Host "See functions/newlife-dialogue/README.md and docs/newlife/evaluation/PHASE_31_DEPLOYMENT_READINESS_AND_OWNER_MINIMAL_ACTION_V1.md for what each check means."

Write-Section "1. gcloud CLI"
if (-not (Test-CommandExists "gcloud")) {
  Write-Host "NOT FOUND. Install the Google Cloud CLI: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
  Write-Host ""
  Write-Host "Nothing further can be checked without gcloud. Stopping here." -ForegroundColor Red
  exit 1
}
$gcloudVersion = (gcloud --version 2>$null | Select-Object -First 1)
Write-Host "Found: $gcloudVersion" -ForegroundColor Green

Write-Section "2. Authenticated account"
$account = (gcloud config get-value account 2>$null)
if ([string]::IsNullOrWhiteSpace($account) -or $account -eq "(unset)") {
  Write-Host "No authenticated account. Run: gcloud auth login" -ForegroundColor Red
  $hasAccount = $false
} else {
  Write-Host "Authenticated as: $account" -ForegroundColor Green
  Write-Host "(No token or credential value is ever printed by this script.)"
  $hasAccount = $true
}

Write-Section "3. Active project"
if ([string]::IsNullOrWhiteSpace($ProjectId)) {
  $ProjectId = (gcloud config get-value project 2>$null)
}
if ([string]::IsNullOrWhiteSpace($ProjectId) -or $ProjectId -eq "(unset)") {
  Write-Host "No project configured and none passed via -ProjectId." -ForegroundColor Red
  Write-Host "Run: gcloud config set project <project-id>   or   pass -ProjectId <project-id>" -ForegroundColor Red
  $hasProject = $false
} else {
  Write-Host "Using project: $ProjectId" -ForegroundColor Green
  $hasProject = $true
}

$canQueryProject = $false
if ($hasAccount -and $hasProject) {
  Write-Section "4. Can this account query the project?"
  $describeOutput = gcloud projects describe $ProjectId --format="value(projectId)" 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Host "OK — able to read project '$ProjectId'." -ForegroundColor Green
    $canQueryProject = $true
  } else {
    Write-Host "FAILED to read project '$ProjectId'. Output:" -ForegroundColor Red
    Write-Host $describeOutput
    Write-Host "This usually means the authenticated account lacks access to this project, or the project id is wrong."
  }
}

$billingEnabled = $false
if ($canQueryProject) {
  Write-Section "5. Billing"
  $billingOutput = gcloud billing projects describe $ProjectId --format="value(billingEnabled)" 2>&1
  if ($LASTEXITCODE -eq 0) {
    if ($billingOutput -match "True") {
      Write-Host "Billing is ENABLED for '$ProjectId'." -ForegroundColor Green
      $billingEnabled = $true
    } else {
      Write-Host "Billing is NOT enabled for '$ProjectId'." -ForegroundColor Red
      Write-Host "This step requires entering a payment method in the Cloud Console and cannot be done by an agent or this script."
    }
  } else {
    Write-Host "Could not determine billing status (insufficient permission, or no billing account linked). Output:" -ForegroundColor Red
    Write-Host $billingOutput
  }
}

$missingApis = @()
if ($canQueryProject) {
  Write-Section "6. Required APIs"
  $enabledRaw = gcloud services list --project $ProjectId --enabled --format="value(config.name)" 2>&1
  if ($LASTEXITCODE -eq 0) {
    $enabledList = $enabledRaw -split "`n" | ForEach-Object { $_.Trim() }
    foreach ($api in $RequiredApis) {
      if ($enabledList -contains $api) {
        Write-Host "  [enabled]     $api" -ForegroundColor Green
      } else {
        Write-Host "  [NOT enabled] $api" -ForegroundColor Red
        $missingApis += $api
      }
    }
  } else {
    Write-Host "Could not list enabled services. Output:" -ForegroundColor Red
    Write-Host $enabledRaw
    $missingApis = $RequiredApis
  }
}

Write-Section "Summary"
$ready = $hasAccount -and $hasProject -and $canQueryProject -and $billingEnabled -and ($missingApis.Count -eq 0)
if ($ready) {
  Write-Host "READY. All automated checks passed for project '$ProjectId'." -ForegroundColor Green
  Write-Host "Next step (still not executed by this script): ./scripts/newlife-deploy/deploy.ps1 -ProjectId $ProjectId -Deploy"
} else {
  Write-Host "NOT READY YET. See the FAIL/red lines above." -ForegroundColor Yellow
  if (-not $hasAccount) { Write-Host " - Minimum Owner action: gcloud auth login" }
  if (-not $hasProject) { Write-Host " - Minimum Owner action: gcloud config set project <project-id>" }
  if ($hasProject -and -not $canQueryProject) { Write-Host " - Minimum Owner action: grant this account access to project '$ProjectId', or correct the project id" }
  if ($canQueryProject -and -not $billingEnabled) { Write-Host " - Minimum Owner action: link a billing account to '$ProjectId' in the Cloud Console (payment method entry; cannot be automated)" }
  if ($missingApis.Count -gt 0) { Write-Host " - Remaining after billing: enable APIs — this script never does it automatically; deploy.ps1 -EnableApis does, only when you pass that flag explicitly" }
}

Write-Host ""
Write-Host "This script made no changes: no API was enabled, no billing was touched, nothing was deployed." -ForegroundColor Yellow

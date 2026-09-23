<#
.SYNOPSIS
  One-run local executor for NEW LIFE Phase 33.

.DESCRIPTION
  Uses the Owner PC's existing gcloud session to perform the remaining live
  engineering work: refresh master, verify auth/project/billing, enable the
  required APIs, deploy newlife-dialogue, smoke-test it, wire the endpoint on
  a new branch, run the fixed synthetic live-eval set, preserve evidence,
  and push the branch. A GitHub workflow then opens the PR automatically.

  Human interaction is only required if Google asks for an interactive login
  or if billing is genuinely not linked. This script never handles payment
  data or prints credentials/tokens.
#>
param(
  [string]$ProjectId = "gas-test-runner-20260620-wjxf"
)

# NOTE: intentionally "Continue", not "Stop". Windows PowerShell 5.1 wraps a native command's
# stderr output (this script's gcloud calls redirect it via 2>&1 / 2>$null to inspect it) as a
# terminating NativeCommandError under "Stop", even when the command itself exits 0 -- gcloud
# routinely writes informational banners to stderr. Every consequential call below already checks
# $LASTEXITCODE explicitly (via Fail()/Run-Git()), so "Continue" loses no real error handling.
$ErrorActionPreference = "Continue"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "../..")
Set-Location $RepoRoot

function Fail([string]$Message, [int]$Code = 1) {
  Write-Host ""
  Write-Host $Message -ForegroundColor Red
  exit $Code
}

function Run-Git([string[]]$GitArgs) {
  & git @GitArgs
  if ($LASTEXITCODE -ne 0) {
    Fail "Git command failed: git $($GitArgs -join ' ')" 11
  }
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " NEW LIFE Phase 33 — local GCP deploy + live evaluation" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Project: $ProjectId"
Write-Host "No credential/token value will be printed."

# ---------------------------------------------------------------------------
# 1. Protect any local work, then refresh master.
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "[1/8] Protecting local work and refreshing master..." -ForegroundColor Yellow

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Fail "Git was not found on this PC." 10
}

$originalBranch = "$(& git branch --show-current)".Trim()
if ([string]::IsNullOrWhiteSpace($originalBranch)) {
  $originalBranch = "master"
}
$phase33StashRef = $null
$dirty = @(git status --porcelain)
if ($LASTEXITCODE -ne 0) {
  Fail "This folder is not a usable git worktree: $RepoRoot" 10
}
if ($dirty.Count -gt 0) {
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $stashMarker = "phase33-auto-save-$stamp"
  Write-Host "Local changes found. Saving them reversibly to git stash: $stashMarker" -ForegroundColor Yellow
  & git stash push --include-untracked -m $stashMarker
  if ($LASTEXITCODE -ne 0) {
    Fail "Could not safely stash local changes. Nothing further was changed." 12
  }
  $stashLine = (& git stash list --format="%gd%x09%s" | Where-Object { $_ -like "*$stashMarker*" } | Select-Object -First 1)
  if (-not [string]::IsNullOrWhiteSpace($stashLine)) {
    $phase33StashRef = ($stashLine -split ([char]9), 2)[0]
  }
}

Run-Git @("fetch", "origin", "master")
Run-Git @("switch", "master")
Run-Git @("pull", "--ff-only", "origin", "master")

# ---------------------------------------------------------------------------
# 2. Ensure gcloud exists and auth is live.
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "[2/8] Checking Google Cloud authentication..." -ForegroundColor Yellow

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
  Write-Host "Google Cloud CLI is not installed." -ForegroundColor Red
  Start-Process "https://cloud.google.com/sdk/docs/install"
  Fail "Human action required: install Google Cloud CLI, then run this same file again." 20
}

$account = "$(& gcloud config get-value account 2>$null)".Trim()
if ([string]::IsNullOrWhiteSpace($account) -or $account -eq "(unset)") {
  Write-Host "No active gcloud login. Opening the Google login flow now..." -ForegroundColor Yellow
  & gcloud auth login
  if ($LASTEXITCODE -ne 0) {
    Fail "Google login did not complete. Run this file again after login succeeds." 21
  }
  $account = "$(& gcloud config get-value account 2>$null)".Trim()
}
if ([string]::IsNullOrWhiteSpace($account) -or $account -eq "(unset)") {
  Fail "gcloud still has no authenticated account after the login attempt." 21
}
Write-Host "gcloud authentication is active." -ForegroundColor Green

# ---------------------------------------------------------------------------
# 3. Verify the already-selected project and billing.
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "[3/8] Verifying project access and billing..." -ForegroundColor Yellow

$projectCheck = & gcloud projects describe $ProjectId --format="value(projectId)" 2>&1
if ($LASTEXITCODE -ne 0 -or "$projectCheck".Trim() -ne $ProjectId) {
  Fail "The previously selected project '$ProjectId' is not accessible with the active Google account." 22
}
Write-Host "Project access: OK" -ForegroundColor Green

$billingRaw = & gcloud billing projects describe $ProjectId --format="value(billingEnabled)" 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host $billingRaw
  Fail "Could not confirm billing status for '$ProjectId'." 23
}
$billingEnabled = "$billingRaw".Trim() -match "^(True|true)$"
if (-not $billingEnabled) {
  $billingUrl = "https://console.cloud.google.com/billing/linkedaccount?project=$ProjectId"
  Write-Host "Billing is not linked/enabled for this project." -ForegroundColor Red
  Write-Host "Opening the exact Google Cloud billing page..." -ForegroundColor Yellow
  Start-Process $billingUrl
  Fail "Human action required: link/confirm billing in the opened Google page, then run this same file again." 24
}
Write-Host "Billing: ENABLED" -ForegroundColor Green

# ---------------------------------------------------------------------------
# 4. Readiness display + deploy + smoke test.
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "[4/8] Running readiness report..." -ForegroundColor Yellow
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "check-readiness.ps1") -ProjectId $ProjectId
if ($LASTEXITCODE -ne 0) {
  Fail "Readiness check failed before deployment." 25
}

Write-Host ""
Write-Host "[5/8] Enabling any missing APIs, deploying, and smoke-testing..." -ForegroundColor Yellow
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "deploy.ps1") -ProjectId $ProjectId -EnableApis -Deploy -RunSmokeTest
if ($LASTEXITCODE -ne 0) {
  Fail "Deployment or smoke test failed. Product endpoint was not wired." 30
}

$resultFile = Join-Path $RepoRoot "deploy-result.json"
if (-not (Test-Path $resultFile)) {
  Fail "deploy-result.json was not produced." 31
}
$deployResult = Get-Content $resultFile -Raw | ConvertFrom-Json
$url = "$($deployResult.url)".Trim()
if ($url -notmatch "^https://") {
  Fail "The deployed HTTPS URL in deploy-result.json is invalid." 31
}
# Freshness check: deploy.ps1 deletes this file before it runs and only re-creates it after a
# verified write, so a valid-looking but stale file from an earlier, unrelated run must not be
# accepted here either -- require it to have been written within this step's own timeframe.
$deployedAt = [DateTimeOffset]::MinValue
if (-not [DateTimeOffset]::TryParse("$($deployResult.deployedAt)", [ref]$deployedAt)) {
  Fail "deploy-result.json has no valid deployedAt timestamp." 31
}
$age = [DateTimeOffset]::UtcNow - $deployedAt.ToUniversalTime()
if ($age -gt [TimeSpan]::FromMinutes(10) -or $age -lt [TimeSpan]::FromMinutes(-1)) {
  Fail "deploy-result.json is not fresh (deployedAt $($deployResult.deployedAt) is $($age.TotalMinutes.ToString('0.0')) min old) -- refusing to wire a stale result." 31
}
Write-Host "Live function endpoint resolved mechanically." -ForegroundColor Green

# ---------------------------------------------------------------------------
# 5. Create a dedicated branch and wire the endpoint.
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "[6/8] Wiring the live endpoint on a dedicated branch..." -ForegroundColor Yellow

$branchStamp = Get-Date -Format "yyyyMMdd-HHmmss"
$branchName = "local/newlife-phase33-$branchStamp"
Run-Git @("switch", "-c", $branchName)

& node (Join-Path $PSScriptRoot "wire-endpoint.mjs") --url $url --apply --commit
if ($LASTEXITCODE -ne 0) {
  Fail "Endpoint wiring or repository verification failed. The live function exists, but production remains on the previous endpoint state." 32
}

# ---------------------------------------------------------------------------
# 6. Run fixed synthetic live-model evaluation and preserve evidence in PR.
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "[7/8] Running fixed live-model evaluation..." -ForegroundColor Yellow

$evidenceDir = Join-Path $RepoRoot "docs/newlife/evaluation/evidence/phase33"
New-Item -ItemType Directory -Force -Path $evidenceDir | Out-Null

& node (Join-Path $PSScriptRoot "live-eval.mjs") --url $url --out $evidenceDir
if ($LASTEXITCODE -ne 0) {
  Write-Host "Live evaluation returned a non-zero status. Evidence will still be preserved for review." -ForegroundColor Yellow
}

$ignoredSmoke = Join-Path $RepoRoot "evidence/newlife-smoke-test-latest.json"
if (Test-Path $ignoredSmoke) {
  Copy-Item $ignoredSmoke (Join-Path $evidenceDir "smoke-test-latest.json") -Force
}

Run-Git @("add", "docs/newlife/evaluation/evidence/phase33")
$staged = @(git diff --cached --name-only)
if ($staged.Count -gt 0) {
  Run-Git @("commit", "-m", "test(newlife): capture Phase 33 live Vertex AI evidence")
}

# ---------------------------------------------------------------------------
# 7. Push. GitHub workflow creates the PR and Issue #1 status comment.
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "[8/8] Pushing Phase 33 branch..." -ForegroundColor Yellow
Run-Git @("push", "-u", "origin", $branchName)

# Restore the Owner's original local branch/work only after the Phase 33
# branch is safely pushed. If a stash cannot be applied cleanly, keep it
# intact and report the exact ref instead of risking data loss.
Write-Host ""
Write-Host "Restoring the original local working context..." -ForegroundColor Yellow
& git switch $originalBranch
if ($LASTEXITCODE -ne 0) {
  Write-Host "Could not switch back to original branch '$originalBranch'. Phase 33 branch is already safely pushed." -ForegroundColor Yellow
} elseif (-not [string]::IsNullOrWhiteSpace($phase33StashRef)) {
  & git stash apply $phase33StashRef
  if ($LASTEXITCODE -eq 0) {
    & git stash drop $phase33StashRef
    Write-Host "Original uncommitted work restored." -ForegroundColor Green
  } else {
    Write-Host "Original work could not be applied cleanly. It remains safely stored at $phase33StashRef." -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " Phase 33 local engineering run completed." -ForegroundColor Green
Write-Host " Branch pushed: $branchName" -ForegroundColor Green
Write-Host " GitHub will open the PR automatically." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "HUMAN_VALIDATION_STATUS = PENDING"
Write-Host "READY_FOR_PRODUCT_RELEASE = NO"

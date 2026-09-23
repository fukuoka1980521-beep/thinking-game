<#
.SYNOPSIS
  Phase 31 rollback helper (instruction 7). Restores deterministic-only NEW LIFE behavior.

.DESCRIPTION
  Rollback order (matches docs/newlife/evaluation/PHASE_31_DEPLOYMENT_READINESS_AND_OWNER_MINIMAL_ACTION_V1.md):
    1. Set NEWLIFE_DIALOGUE_ENDPOINT_URL back to "" — this alone fully restores
       deterministic-only behavior, because coordinator.ts short-circuits before
       any network call or consent prompt when the endpoint is empty. This is
       the ONLY step required to make the product behave as if none of this
       ever shipped.
    2. Optionally, leave the Cloud Function deployed but unreachable from the
       product (default — cheapest, safest, fully reversible), or delete it
       later via an explicit, separate command this script only prints and
       never runs.

.PARAMETER Apply
  Switch. Without it, this script only shows what would change (dry-run,
  via wire-endpoint.mjs's own dry-run default). With it, actually writes
  config.ts back to an empty endpoint and runs verification.

.PARAMETER ProjectId
  Optional. Only used to print (never run) the function-deletion command for step 2.

.EXAMPLE
  ./scripts/newlife-deploy/rollback.ps1
.EXAMPLE
  ./scripts/newlife-deploy/rollback.ps1 -Apply
#>
param(
  [switch]$Apply,
  [string]$ProjectId
)

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "../..")

Write-Host "NEW LIFE rollback — step 1: restore deterministic-only behavior" -ForegroundColor Yellow
$wireArgs = @("--url", "")
if ($Apply) { $wireArgs += "--apply" }
node (Join-Path $PSScriptRoot "wire-endpoint.mjs") @wireArgs

if (-not $Apply) {
  Write-Host ""
  Write-Host "Dry-run only. Re-run with -Apply to actually write the rollback." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2 (optional, not run by this script): delete the deployed function." -ForegroundColor Yellow
Write-Host "The function is safe to leave deployed-but-unreachable once step 1 is applied — the product"
Write-Host "never calls it with an empty endpoint. Delete it later only if you want to stop it existing at all:"
if ([string]::IsNullOrWhiteSpace($ProjectId)) {
  Write-Host "  gcloud functions delete newlife-dialogue --gen2 --region=asia-northeast1 --project=<project-id>"
} else {
  Write-Host "  gcloud functions delete newlife-dialogue --gen2 --region=asia-northeast1 --project=$ProjectId"
}
Write-Host "This command is never run automatically by this script."

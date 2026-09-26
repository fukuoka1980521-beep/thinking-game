$ErrorActionPreference = "Stop"

$ProjectId = "gas-test-runner-20260620-wjxf"
$Repo = "fukuoka1980521-beep/thinking-game"
$Ref = "chatgpt/newlife-refoundation-v1"
$PoolId = "github-actions-pool"
$ProviderId = "github-actions-provider"
$ServiceAccountId = "newlife-refoundation-deployer"
$ServiceAccountEmail = "$ServiceAccountId@$ProjectId.iam.gserviceaccount.com"

function Resolve-Exe {
  param([string[]]$Candidates)
  foreach ($c in $Candidates) {
    if (Test-Path $c) { return $c }
    $cmd = Get-Command $c -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
  }
  return $null
}

$Gcloud = Resolve-Exe @(
  "gcloud.cmd",
  "C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
)
$Gh = Resolve-Exe @(
  "gh.exe",
  "C:\Program Files\GitHub CLI\gh.exe"
)

if (-not $Gcloud) { throw "gcloud was not found." }
if (-not $Gh) { throw "GitHub CLI (gh) was not found." }

Write-Host "NEW LIFE permanent deploy bootstrap"
Write-Host "Project: $ProjectId"
Write-Host "Repo:    $Repo"

$ActiveAccount = (& $Gcloud auth list --filter=status:ACTIVE --format="value(account)" | Select-Object -First 1).Trim()
if (-not $ActiveAccount) { throw "No active gcloud account. Sign in once with gcloud auth login, then rerun." }
Write-Host "Google account: $ActiveAccount"

& $Gcloud config set project $ProjectId | Out-Null

$BillingEnabled = (& $Gcloud billing projects describe $ProjectId --format="value(billingEnabled)" 2>$null).Trim()
if ($BillingEnabled -ne "True") { throw "Billing is not enabled for $ProjectId." }

$Apis = @(
  "iamcredentials.googleapis.com",
  "iam.googleapis.com",
  "sts.googleapis.com",
  "aiplatform.googleapis.com",
  "cloudfunctions.googleapis.com",
  "cloudbuild.googleapis.com",
  "run.googleapis.com",
  "artifactregistry.googleapis.com",
  "cloudresourcemanager.googleapis.com"
)
& $Gcloud services enable @Apis --project=$ProjectId | Out-Null

$ProjectNumber = (& $Gcloud projects describe $ProjectId --format="value(projectNumber)").Trim()
if (-not $ProjectNumber) { throw "Could not resolve project number." }

function Test-GcloudResource {
  param([string[]]$CommandArgs)
  $PreviousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    & $Gcloud @CommandArgs 2>$null | Out-Null
    return ($LASTEXITCODE -eq 0)
  }
  finally {
    $ErrorActionPreference = $PreviousErrorActionPreference
  }
}

$PoolArgs = @("iam","workload-identity-pools","describe",$PoolId,"--project=$ProjectId","--location=global")
if (-not (Test-GcloudResource $PoolArgs)) {
  & $Gcloud iam workload-identity-pools create $PoolId --project=$ProjectId --location=global --display-name="GitHub Actions" | Out-Null
}

$ProviderArgs = @("iam","workload-identity-pools","providers","describe",$ProviderId,"--project=$ProjectId","--location=global","--workload-identity-pool=$PoolId")
if (-not (Test-GcloudResource $ProviderArgs)) {
  & $Gcloud iam workload-identity-pools providers create-oidc $ProviderId --project=$ProjectId --location=global --workload-identity-pool=$PoolId --display-name="GitHub OIDC" --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" --attribute-condition="assertion.repository == 'fukuoka1980521-beep/thinking-game'" --issuer-uri="https://token.actions.githubusercontent.com" | Out-Null
}

$ServiceAccountArgs = @("iam","service-accounts","describe",$ServiceAccountEmail,"--project=$ProjectId")
if (-not (Test-GcloudResource $ServiceAccountArgs)) {
  & $Gcloud iam service-accounts create $ServiceAccountId --project=$ProjectId --display-name="NEW LIFE refoundation GitHub deployer" | Out-Null
}

$Roles = @(
  "roles/cloudfunctions.developer",
  "roles/run.admin",
  "roles/iam.serviceAccountUser",
  "roles/artifactregistry.writer",
  "roles/cloudbuild.builds.editor",
  "roles/storage.objectViewer",
  "roles/serviceusage.serviceUsageConsumer"
)
foreach ($Role in $Roles) {
  & $Gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$ServiceAccountEmail" --role=$Role --condition=None --quiet | Out-Null
}

$Principal = "principalSet://iam.googleapis.com/projects/$ProjectNumber/locations/global/workloadIdentityPools/$PoolId/attribute.repository/$Repo"
& $Gcloud iam service-accounts add-iam-policy-binding $ServiceAccountEmail --project=$ProjectId --role="roles/iam.workloadIdentityUser" --member=$Principal --quiet | Out-Null

$RuntimeSa = "$ProjectNumber-compute@developer.gserviceaccount.com"
& $Gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$RuntimeSa" --role="roles/aiplatform.user" --condition=None --quiet | Out-Null

$Provider = "projects/$ProjectNumber/locations/global/workloadIdentityPools/$PoolId/providers/$ProviderId"

& $Gh auth status *> $null
if ($LASTEXITCODE -ne 0) { throw "GitHub CLI is not authenticated. Run gh auth login once, then rerun." }

& $Gh variable set GCP_WIF_PROVIDER --repo $Repo --body $Provider
if ($LASTEXITCODE -ne 0) { throw "Could not set GCP_WIF_PROVIDER." }

Write-Host "GCP_WIF_READY=YES"

& $Gh workflow run newlife-refoundation-live.yml --repo $Repo --ref $Ref
if ($LASTEXITCODE -ne 0) { throw "Could not trigger the deploy workflow." }

Start-Sleep -Seconds 6
$RunId = (& $Gh run list --repo $Repo --workflow newlife-refoundation-live.yml --branch $Ref --limit 1 --json databaseId --jq ".[0].databaseId").Trim()
if (-not $RunId) { throw "Could not find the deploy workflow run." }

Write-Host "Watching deploy run $RunId ..."
& $Gh run watch $RunId --repo $Repo --exit-status
if ($LASTEXITCODE -ne 0) {
  & $Gh run view $RunId --repo $Repo --log
  throw "Deploy workflow failed."
}

$HeadSha = (& $Gh api "repos/$Repo/commits/$Ref" --jq ".sha").Trim()
$Endpoint = "https://newlife-refoundation-ai-zqtk74q2ra-an.a.run.app"
$Health = Invoke-RestMethod -Uri $Endpoint -Method Get -TimeoutSec 20

if ($Health.service -ne "newlife-refoundation-ai") { throw "Health check returned wrong service." }
if ($Health.contractVersion -ne "V40") { throw "Expected V40 health contract." }
if ($Health.buildSha -ne $HeadSha) { throw "Deployed build SHA does not match branch head." }

Write-Host ""
Write-Host "NEWLIFE_V40_AUTOMATION_PASS"
Write-Host "BUILD_SHA=$($Health.buildSha)"
Write-Host "TEST_URL=https://fukuoka1980521-beep.github.io/thinking-game/newlife-v37.html"

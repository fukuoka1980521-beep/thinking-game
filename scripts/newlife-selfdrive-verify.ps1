param(
  [string]$Branch = "refactor/chat-first-goal-integrity-20260929",
  [string]$Project = "gas-test-runner-20260620-wjxf",
  [string]$Region = "asia-northeast1",
  [string]$FunctionName = "newlife-refoundation-ai-chatfirst-test",
  [string]$Endpoint = "https://newlife-refoundation-ai-chatfirst-test-zqtk74q2ra-an.a.run.app",
  [string]$StatusPath = "$env:USERPROFILE\Downloads\NEWLIFE_SELFDRIVE_STATUS.json",
  [string]$LogPath = "$env:USERPROFILE\Downloads\NEWLIFE_SELFDRIVE.log"
)

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$started = (Get-Date).ToString("o")

function Write-Status([string]$phase, [string]$state, [string]$detail = "", [hashtable]$extra = @{}) {
  $obj = [ordered]@{
    startedAt = $started
    updatedAt = (Get-Date).ToString("o")
    phase = $phase
    state = $state
    detail = $detail
    repo = $repo
  }
  foreach ($k in $extra.Keys) { $obj[$k] = $extra[$k] }
  $tmp = "$StatusPath.tmp"
  $obj | ConvertTo-Json -Depth 8 | Set-Content -Path $tmp -Encoding utf8
  Move-Item -Force $tmp $StatusPath
}

function Log([string]$message) {
  $line = "[$((Get-Date).ToString('o'))] $message"
  Add-Content -Path $LogPath -Value $line -Encoding utf8
}

function Run-Step([string]$name, [scriptblock]$body) {
  Write-Status $name "RUNNING"
  Log "START $name"
  & $body
  if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -ne 0) {
    throw "$name failed with exit $LASTEXITCODE"
  }
  Log "PASS $name"
  Write-Status $name "PASS"
}

function Get-Health {
  try {
    return Invoke-RestMethod -Uri $Endpoint -Method Get -TimeoutSec 10
  } catch {
    return $null
  }
}

function Deploy-Test([string]$sha) {
  $maxAttempts = 3
  for ($i = 1; $i -le $maxAttempts; $i++) {
    Write-Status "DEPLOY_TEST" "RUNNING" "attempt $i/$maxAttempts" @{ head = $sha }
    Log "DEPLOY attempt $i head=$sha"
    $args = @(
      "functions","deploy",$FunctionName,
      "--gen2","--runtime=nodejs22","--region=$Region",
      "--source=functions/newlife-refoundation-ai",
      "--entry-point=newlifeRefoundationAi","--trigger-http",
      "--allow-unauthenticated","--memory=256Mi","--timeout=90s",
      "--max-instances=1","--project=$Project",
      "--service-account=1030414900193-compute@developer.gserviceaccount.com",
      "--set-env-vars=GCP_PROJECT=$Project,NEWLIFE_REFOUNDATION_BUILD_SHA=$sha,NEWLIFE_REFOUNDATION_AI_MAX_CALLS_PER_MINUTE=120,NEWLIFE_REFOUNDATION_AI_MAX_REFLECTION_CALLS_PER_MINUTE=6",
      "--quiet"
    )
    $stdout = Join-Path $env:TEMP "newlife-gcloud-$PID-$i.out.log"
    $stderr = Join-Path $env:TEMP "newlife-gcloud-$PID-$i.err.log"
    Remove-Item $stdout,$stderr -Force -ErrorAction SilentlyContinue
    $gcloudExe = (Get-Command gcloud.cmd -ErrorAction SilentlyContinue).Source
    if (-not $gcloudExe) { $gcloudExe = (Get-Command gcloud -ErrorAction Stop).Source }
    $proc = Start-Process -FilePath $gcloudExe -ArgumentList $args -Wait -PassThru -NoNewWindow -RedirectStandardOutput $stdout -RedirectStandardError $stderr
    $output = @()
    if (Test-Path $stdout) { $output += Get-Content $stdout }
    if (Test-Path $stderr) { $output += Get-Content $stderr }
    $output | Add-Content -Path $LogPath -Encoding utf8
    $code = $proc.ExitCode
    if ($code -eq 0) { return }
    $joined = ($output | Out-String)
    if ($joined -match "409|unable to queue the operation") {
      Start-Sleep -Seconds (15 * $i)
      continue
    }
    throw "deploy failed: exit=$code"
  }
  throw "deploy failed after retries"
}

try {
  Set-Content -Path $LogPath -Value "" -Encoding utf8
  Write-Status "INIT" "RUNNING"

  Run-Step "SYNC" {
    Set-Location $repo
    git fetch origin $Branch
    git reset --hard "origin/$Branch"
  }

  $head = (git rev-parse HEAD).Trim()
  Write-Status "SYNC" "PASS" "synced" @{ head = $head }

  Run-Step "TYPECHECK" {
    npm run typecheck
  }

  Run-Step "FOCUSED_TESTS" {
    npx vitest run tests/newlifeTurnPlanner.test.ts tests/newlifeRefoundationAiFunction.test.ts tests/newlifeSceneComprehensionRegression.test.ts
  }

  $health = Get-Health
  $backendNeedsDeploy = $true
  $backendSourceSha = $null

  if ($health -and $health.buildSha) {
    Set-Location $repo
    & git cat-file -e "$($health.buildSha)^{commit}" 2>$null
    $knownBuild = ($LASTEXITCODE -eq 0)
    if ($knownBuild) {
      & git diff --quiet $health.buildSha $head -- functions/newlife-refoundation-ai
      $diffCode = $LASTEXITCODE
      if ($diffCode -eq 0) {
        $backendNeedsDeploy = $false
        $backendSourceSha = $health.buildSha
        Log "REUSE TEST backend build=$backendSourceSha; no backend source diff to head=$head"
      } elseif ($diffCode -ne 1) {
        throw "unable to compare backend source between $($health.buildSha) and $head"
      }
    }
  }

  if ($backendNeedsDeploy) {
    Set-Location $repo
    Deploy-Test $head

    $deadline = (Get-Date).AddMinutes(4)
    do {
      $health = Get-Health
      if ($health -and $health.buildSha -eq $head) { break }
      Start-Sleep -Seconds 8
    } while ((Get-Date) -lt $deadline)
    if (-not $health -or $health.buildSha -ne $head) {
      throw "test backend did not converge to head $head"
    }
    $backendSourceSha = $head
  } else {
    $health = Get-Health
    if (-not $health -or $health.buildSha -ne $backendSourceSha) {
      throw "reused test backend health identity changed unexpectedly"
    }
  }

  $deployDetail = "test backend reused; backend source unchanged"
  if ($backendNeedsDeploy) { $deployDetail = "test backend deployed" }
  Write-Status "DEPLOY_TEST" "PASS" $deployDetail @{
    head = $head
    buildSha = $health.buildSha
    backendSourceSha = $backendSourceSha
    deployed = $backendNeedsDeploy
  }

  $client = Join-Path $repo "src\newlife\refoundationDialogue.ts"
  $raw = Get-Content -Raw $client
  $raw = $raw.Replace(
    "https://newlife-refoundation-ai-zqtk74q2ra-an.a.run.app",
    "https://newlife-refoundation-ai-chatfirst-test-zqtk74q2ra-an.a.run.app"
  )
  Set-Content -Path $client -Value $raw -Encoding utf8

  $kernelOut = "$env:USERPROFILE\Downloads\NEWLIFE_RESPONSE_KERNEL_LIVE_REGRESSION.json"
  $kernelCheckpoint = "$env:USERPROFILE\Downloads\NEWLIFE_RESPONSE_KERNEL_LIVE_REGRESSION.checkpoint.json"
  $env:NEW_LIFE_ENDPOINT = $Endpoint
  $env:NEW_LIFE_KERNEL_OUT = $kernelOut
  $env:NEW_LIFE_KERNEL_CHECKPOINT = $kernelCheckpoint

  Run-Step "LIVE_KERNEL" {
    $liveExit = 1
    for ($liveAttempt = 1; $liveAttempt -le 3; $liveAttempt++) {
      Log "LIVE_KERNEL attempt $liveAttempt/3"
      & node scripts/newlife-response-kernel-live-regression.mjs
      $liveExit = $LASTEXITCODE
      if ($liveExit -eq 0) { break }
      Log "LIVE_KERNEL process exit=$liveExit; retrying from durable checkpoint"
      Start-Sleep -Seconds (5 * $liveAttempt)
    }
    if ($liveExit -ne 0) {
      throw "LIVE_KERNEL failed after checkpointed retries; exit=$liveExit"
    }
  }

  $report = Get-Content -Raw -Encoding utf8 $kernelOut | ConvertFrom-Json
  if ($report.transportFailures -ne 0) {
    throw "live kernel transport failures=$($report.transportFailures)"
  }
  if ($report.structuralPasses -lt $report.total) {
    throw "live kernel structural pass $($report.structuralPasses)/$($report.total)"
  }

  $ownerReplayOut = "$env:USERPROFILE\Downloads\NEWLIFE_OWNER_TRANSCRIPT_REPLAY_LIVE.json"
  $ownerReplayCheckpoint = "$env:USERPROFILE\Downloads\NEWLIFE_OWNER_TRANSCRIPT_REPLAY_LIVE.checkpoint.json"
  $env:NEW_LIFE_OWNER_REPLAY_OUT = $ownerReplayOut
  $env:NEW_LIFE_OWNER_REPLAY_CHECKPOINT = $ownerReplayCheckpoint

  Run-Step "LIVE_OWNER_REPLAY" {
    $ownerExit = 1
    for ($ownerAttempt = 1; $ownerAttempt -le 3; $ownerAttempt++) {
      Log "LIVE_OWNER_REPLAY attempt $ownerAttempt/3"
      & node scripts/newlife-owner-transcript-replay-live.mjs
      $ownerExit = $LASTEXITCODE
      if ($ownerExit -eq 0) { break }
      Log "LIVE_OWNER_REPLAY process exit=$ownerExit; retrying"
      Start-Sleep -Seconds (5 * $ownerAttempt)
    }
    if ($ownerExit -ne 0) {
      throw "LIVE_OWNER_REPLAY failed after retries; exit=$ownerExit"
    }
  }

  $ownerReport = Get-Content -Raw -Encoding utf8 $ownerReplayOut | ConvertFrom-Json
  if ($ownerReport.transportFailures -ne 0) {
    throw "owner replay transport failures=$($ownerReport.transportFailures)"
  }
  if ($ownerReport.structuralPasses -lt $ownerReport.turnCount) {
    throw "owner replay structural pass $($ownerReport.structuralPasses)/$($ownerReport.turnCount)"
  }

  Write-Status "COMPLETE" "PASS" "all self-drive gates passed" @{
    head = $head
    buildSha = $health.buildSha
    backendSourceSha = $backendSourceSha
    backendDeployed = $backendNeedsDeploy
    liveTotal = $report.total
    liveStructuralPasses = $report.structuralPasses
    transportFailures = $report.transportFailures
    report = $kernelOut
    checkpoint = $kernelCheckpoint
    ownerReplayTotal = $ownerReport.turnCount
    ownerReplayStructuralPasses = $ownerReport.structuralPasses
    ownerReplayTransportFailures = $ownerReport.transportFailures
    ownerReplayReport = $ownerReplayOut
    ownerReplayCheckpoint = $ownerReplayCheckpoint
  }
  Log "COMPLETE PASS"
} catch {
  $msg = $_.Exception.Message
  Log "FAIL $msg"
  Write-Status "FAILED" "FAIL" $msg
  exit 1
}

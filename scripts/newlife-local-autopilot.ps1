param(
  [int]$MaxCycles = 6,
  [int]$TransientWaitSeconds = 120,
  [string]$Branch = "refactor/chat-first-goal-integrity-20260929"
)

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$statusPath = "$env:USERPROFILE\Downloads\NEWLIFE_AUTOPILOT_STATUS.json"
$logPath = "$env:USERPROFILE\Downloads\NEWLIFE_AUTOPILOT.log"
$selfDriveStatus = "$env:USERPROFILE\Downloads\NEWLIFE_SELFDRIVE_STATUS.json"
$selfDriveScript = Join-Path $PSScriptRoot "newlife-selfdrive-verify.ps1"
$started = (Get-Date).ToString("o")

function Log([string]$message) {
  Add-Content -Path $logPath -Value "[$((Get-Date).ToString('o'))] $message" -Encoding utf8
}

function Write-Status([string]$state, [string]$phase, [string]$detail, [int]$cycle) {
  [ordered]@{
    startedAt = $started
    updatedAt = (Get-Date).ToString("o")
    state = $state
    phase = $phase
    detail = $detail
    cycle = $cycle
    maxCycles = $MaxCycles
    repo = $repo
  } | ConvertTo-Json -Depth 6 | Set-Content -Path $statusPath -Encoding utf8
}

Set-Content -Path $logPath -Value "" -Encoding utf8
Write-Status "RUNNING" "INIT" "local autopilot started" 0
Log "AUTOPILOT START"

for ($cycle = 1; $cycle -le $MaxCycles; $cycle++) {
  try {
    Write-Status "RUNNING" "SELFDRIVE" "cycle $cycle" $cycle
    Log "CYCLE $cycle START SELFDRIVE"
    Set-Location $repo
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $selfDriveScript -Branch $Branch
    $selfDriveExit = $LASTEXITCODE
    Log "CYCLE $cycle SELFDRIVE EXIT=$selfDriveExit"

    $self = $null
    if (Test-Path $selfDriveStatus) {
      try { $self = Get-Content -Raw -Encoding utf8 $selfDriveStatus | ConvertFrom-Json } catch {}
    }

    if ($self -and $self.state -eq "PASS" -and $self.phase -eq "COMPLETE") {
      Write-Status "PASS" "COMPLETE" "all gates passed" $cycle
      Log "AUTOPILOT COMPLETE PASS"
      exit 0
    }

    $detail = if ($self -and $self.detail) { [string]$self.detail } else { "selfdrive exit=$selfDriveExit" }
    Log "CYCLE $cycle FAILURE detail=$detail"

    $transient = $detail -match "(transport|429|Rate exceeded|rate limit|timeout|temporar|unavailable)"
    if ($transient) {
      Write-Status "RUNNING" "BACKOFF" $detail $cycle
      Log "TRANSIENT FAILURE; WAIT $TransientWaitSeconds sec"
      Start-Sleep -Seconds $TransientWaitSeconds
      continue
    }

    if ($cycle -ge $MaxCycles) { break }

    Write-Status "RUNNING" "SELF_FIX" $detail $cycle
    Log "INVOKE CLAUDE CODE SELF-FIX"
    $prompt = @"
You are repairing the NEW LIFE game repository at:
$repo

The autonomous verification failed with:
$detail

Read these first:
- C:\Users\user\Downloads\NEWLIFE_SELFDRIVE_STATUS.json
- C:\Users\user\Downloads\NEWLIFE_SELFDRIVE.log
- C:\Users\user\Downloads\NEWLIFE_RESPONSE_KERNEL_LIVE_REGRESSION.json if present
- C:\Users\user\Downloads\NEWLIFE_OWNER_TRANSCRIPT_REPLAY_LIVE.json if present

Rules:
1. Work only in this repository.
2. Do not deploy to production.
3. Preserve accepted canon and do not weaken tests merely to obtain PASS.
4. Identify the actual failure mechanism, make the smallest general fix, run focused tests and typecheck.
5. Commit and push only if tests pass, on branch $Branch.
6. Leave a concise diagnosis in C:\Users\user\Downloads\NEWLIFE_AUTOPILOT_CLAUDE_LAST.txt.
7. Do not wait for human input. If blocked, record the blocker and exit.
"@

    $claudeOut = "$env:USERPROFILE\Downloads\NEWLIFE_AUTOPILOT_CLAUDE_RUN_$cycle.txt"
    & claude -p --permission-mode auto --effort high --output-format text $prompt *> $claudeOut
    $claudeExit = $LASTEXITCODE
    Log "CLAUDE SELF-FIX EXIT=$claudeExit output=$claudeOut"
    if ($claudeExit -ne 0) {
      Write-Status "RUNNING" "CLAUDE_RETRY_BACKOFF" "Claude self-fix exit=$claudeExit" $cycle
      Start-Sleep -Seconds $TransientWaitSeconds
    }
  } catch {
    $msg = $_.Exception.Message
    Log "CYCLE $cycle EXCEPTION $msg"
    if ($cycle -lt $MaxCycles) {
      Write-Status "RUNNING" "RECOVERY_WAIT" $msg $cycle
      Start-Sleep -Seconds $TransientWaitSeconds
      continue
    }
    Write-Status "FAIL" "FAILED" $msg $cycle
    exit 1
  }
}

Write-Status "FAIL" "FAILED" "max cycles exhausted without PASS" $MaxCycles
Log "AUTOPILOT FAILED max cycles exhausted"
exit 1

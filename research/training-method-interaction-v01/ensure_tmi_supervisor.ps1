$ErrorActionPreference = 'Stop'
$root = 'C:\Users\user\ClaudeWork\thinking-game-response-dynamics-v01\research\training-method-interaction-v01'
$python = 'C:\Users\user\AppData\Local\Programs\Python\Python312\python.exe'
$supervisor = Join-Path $root 'tmi_supervisor.py'
$statePath = Join-Path $root 'AUTORUN_STATE.json'
$log = Join-Path $root 'AUTORUN_ENSURE.log'
$now = Get-Date

function Log-Line([string]$msg) {
  Add-Content -Path $log -Value "$($now.ToString('o')) $msg"
}

$existing = @(Get-CimInstance Win32_Process -Filter "Name='python.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like "*tmi_supervisor.py*" })

# Collapse accidental duplicates. Locking should already prevent these, this is defense in depth.
if ($existing.Count -gt 1) {
  $keep = $existing | Sort-Object ProcessId | Select-Object -First 1
  foreach ($p in $existing) {
    if ($p.ProcessId -ne $keep.ProcessId) {
      & taskkill.exe /PID $p.ProcessId /T /F *> $null
      Log-Line "DUPLICATE_TERMINATED pid=$($p.ProcessId) keep=$($keep.ProcessId)"
    }
  }
  $existing = @($keep)
}

$heartbeatAge = $null
if (Test-Path $statePath) {
  try {
    $s = Get-Content $statePath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($s.updated_at) {
      $updated = [DateTimeOffset]::Parse($s.updated_at)
      $heartbeatAge = ([DateTimeOffset]::Now - $updated).TotalSeconds
    }
  } catch {
    Log-Line "STATE_PARSE_WARN $($_.Exception.GetType().Name)"
  }
}

if ($existing.Count -eq 1) {
  # A live process with a stale state means the supervisor/watchdog loop is wedged.
  # Kill the supervisor tree only; detached download/generation jobs are not its children.
  if ($heartbeatAge -ne $null -and $heartbeatAge -gt 300) {
    $pidToKill = $existing[0].ProcessId
    & taskkill.exe /PID $pidToKill /T /F *> $null
    Log-Line "STALE_SUPERVISOR_TERMINATED pid=$pidToKill heartbeat_age_sec=$([math]::Round($heartbeatAge,1))"
    Start-Sleep -Seconds 2
  } else {
    Log-Line "HEALTHY pid=$($existing[0].ProcessId) heartbeat_age_sec=$([math]::Round(($heartbeatAge ?? 0),1))"
    exit 0
  }
}

$arg = '"{0}"' -f $supervisor
$p = Start-Process -FilePath $python -ArgumentList $arg -WorkingDirectory $root -WindowStyle Hidden -PassThru
Log-Line "RESTARTED pid=$($p.Id) prior_heartbeat_age_sec=$([math]::Round(($heartbeatAge ?? 0),1))"

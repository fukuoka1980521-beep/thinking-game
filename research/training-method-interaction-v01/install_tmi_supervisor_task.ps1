$ErrorActionPreference='Stop'
$root='C:\Users\user\ClaudeWork\thinking-game-response-dynamics-v01\research\training-method-interaction-v01'
$ensure=Join-Path $root 'ensure_tmi_supervisor.ps1'
$task='TMI_ResearchSupervisor_HUKUOKA'
$action='powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "'+$ensure+'"'

# Create/update a five-minute watchdog trigger under the current interactive user.
& schtasks.exe /Create /TN $task /TR $action /SC MINUTE /MO 5 /F | Out-Null

# Harden settings that otherwise make laptops silently stop work.
$t=Get-ScheduledTask -TaskName $task
$s=$t.Settings
$s.DisallowStartIfOnBatteries=$false
$s.StopIfGoingOnBatteries=$false
$s.StartWhenAvailable=$true
$s.ExecutionTimeLimit='PT5M'
$s.MultipleInstances='IgnoreNew'
Set-ScheduledTask -TaskName $task -Settings $s | Out-Null

# Execute one health pass immediately.
& schtasks.exe /Run /TN $task | Out-Null
Start-Sleep -Seconds 2
Write-Output 'TMI_SUPERVISOR_TASK_INSTALL=PASS'
Get-ScheduledTask -TaskName $task | Select-Object TaskName,State

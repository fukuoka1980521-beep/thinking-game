# Continuous Execution Hardening — 2026-10-03

## Objective

Prevent research progress from depending on a live ChatGPT response, Remote Desktop Commander session, or a single long-running shell session.

## Root causes found

### 1. Remote tool sessions were treated as durable process supervisors
Remote shell calls return quickly and their session handles can disappear even while child processes continue. Re-querying or restarting without checking children created duplicate processes.

### 2. Duplicate download processes created lock contention
Repeated Hugging Face download attempts left child Python processes alive. Multiple processes competed for the same cache lock, producing apparent stalls.

### 3. Nested PowerShell quoting caused malformed commands
Commands that embedded a second PowerShell command layer sometimes expanded or removed variables before the inner command executed.

Countermeasure: use standalone Python/PowerShell files or direct shell commands; avoid nested command strings for important operations.

### 4. Task Scheduler was not reliable for this research watchdog
A scheduled task reported LastTaskResult=0, but even a one-line file-write probe produced no file. It was removed from the critical path rather than trusted based on status codes alone.

### 5. Desktop Commander Remote was started by multiple mechanisms
Three startup mechanisms coexisted:
- canonical Scheduled Task DesktopCommanderRemote_HUKUOKA;
- DesktopCommanderRemote.vbs startup watchdog;
- RemoteDesktopCommander.vbs unconditional npx remote launch.

Two full Desktop Commander Remote server trees were observed simultaneously. Tool calls were routed through both process trees, consistent with the observed online/offline flapping.

Resolution:
- both Startup VBS files were moved to C:\Users\user\ClaudeWork\desktop-commander-remote\disabled_startup_20261003\;
- the duplicate npx latest Remote process tree was terminated;
- the canonical Scheduled Task was retained.

Canonical task properties verified:
- Logon trigger;
- MultipleInstances = IgnoreNew;
- RestartCount = 10;
- RestartInterval = 1 minute;
- StartWhenAvailable = True;
- no battery stop rule.

Three consecutive Remote Commander pings passed after cleanup.

## New local execution architecture

Windows Startup VBS -> hidden CMD restart loop -> Python supervisor -> one-shot watchdog every 60 seconds -> detached/resumable download or smoke/pilot job.

### Layer 1 — Startup
TMI_Research_Supervisor.vbs launches the hidden restart loop at user logon.

### Layer 2 — CMD restart loop
run_tmi_supervisor_forever.cmd restarts the Python supervisor 15 seconds after any supervisor exit.

This was failure-tested: the supervisor process was forcibly terminated and a new supervisor PID was created automatically.

### Layer 3 — Python supervisor
tmi_supervisor.py invokes the watchdog every 60 seconds and continues after watchdog exceptions.

### Layer 4 — Watchdog
tmi_watchdog.py is idempotent and state-driven.

Properties:
- non-blocking file lock prevents duplicate watchdog ticks;
- atomic state-file replacement;
- long jobs are detached from the watchdog;
- downloads use aria2 continuation;
- completion is determined by output artifacts, not shell-session survival;
- stage jobs skip already-existing outputs;
- bounded retry count;
- disk-space stop gate;
- zero paid API calls;
- final pilot completion can be Git-committed and pushed automatically.

## Recovery semantics

If Remote Commander disconnects: local research execution continues.

If ChatGPT response generation stops: local research execution continues.

If a download process dies: next watchdog tick resumes the partial aria2 file.

If a smoke/pilot process dies: next watchdog tick sees the missing expected output and retries, up to the frozen retry limit.

If the Python supervisor dies: the hidden CMD loop restarts it after 15 seconds.

If Windows/user session restarts: Startup VBS relaunches the supervisor chain after login.

The remaining hard stop is machine power-off or a frozen scientific STOP gate. A scientific STOP gate is intentional and must not be bypassed automatically.

## Hang detection hardening

A live PID is no longer treated as proof of progress.

Additional recovery rules:
- model download: if partial-file bytes do not increase for 10 minutes, terminate the download tree and resume on the next tick;
- runtime benchmark: absolute timeout 30 minutes;
- template smoke: absolute timeout 20 minutes;
- stage pilot: absolute timeout 120 minutes and no-output-progress timeout 30 minutes;
- terminated stale jobs consume a bounded retry attempt and are restarted only while below the retry limit.

This prevents a hung process from leaving the project indefinitely in a misleading RUNNING state.

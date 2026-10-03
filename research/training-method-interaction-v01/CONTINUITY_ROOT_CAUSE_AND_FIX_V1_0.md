# Continuous Execution Root Cause and Fix v1.0

Status: ACTIVE
Date: 2026-10-03

## What "stopping" actually consisted of

Observed interruptions were not one failure mode. They were five distinct classes.

### 1. Remote-tool session timeout / disappearing PID
Desktop Commander tool calls wait only a short time. Long local Python/model processes can continue after the tool session is no longer readable. Treating "No session found for PID" as workload failure caused unnecessary restarts.

Fix:
- all long work is detached;
- progress is determined from durable files/state and OS process existence, not from the original remote tool session.

### 2. Orphaned child processes and duplicate work
Parent wrappers were sometimes terminated while Python/download children remained alive. A second retry could then contend for the same Hugging Face cache lock or duplicate expensive computation.

Fix:
- supervisor persists job/download PIDs in AUTORUN_STATE.json;
- watchdog checks OS-level process existence;
- stale jobs use taskkill /T /F;
- downloads have single-owner state and stale-progress detection;
- duplicate supervisor instances are rejected by file lock and external ensure script.

### 3. Silent long CPU inference misread as a hang
BASE Q4_K_M measured approximately:
- prompt: ~13.66 tok/s
- generation: ~4.69 tok/s
- 512 generated tokens: ~117.5 seconds end-to-end for the smoke prompt.

A stage pilot of 18 outputs is therefore tens of minutes, not an interactive tool call.

Fix:
- one llama-server load per stage;
- 18 requests reuse the stage model;
- long jobs are detached;
- watchdog allows up to 2 hours for a pilot stage and uses output-count progress, not console chatter.

### 4. Download transport/cache contention
Hugging Face Xet and repeated hf_hub_download attempts left lock/partial files and competing child processes. This looked like stalled network I/O.

Fix:
- aria2 segmented HTTP is the canonical pilot downloader;
- one download owner per stage;
- progress tracked by partial-file byte growth;
- no-progress >600s triggers process-tree restart;
- final file is hashed before READY.

### 5. Supervisor itself could disappear
The internal watchdog can repair jobs only while the supervisor exists. A killed supervisor was previously a single point of failure.

Fix:
- Windows Scheduled Task `TMI_ResearchSupervisor_HUKUOKA` executes an ensure script every 5 minutes;
- ensure script detects missing supervisor and restarts it;
- it also detects heartbeat age >300s and restarts a wedged supervisor;
- accidental duplicate supervisors are collapsed;
- scheduled task is configured to run on battery, not stop when switching to battery, StartWhenAvailable, IgnoreNew.

## Scientific stops versus operational failures

These must never be conflated.

Scientific STOP examples:
- BASE cannot produce a minimally valid plan under the frozen raw scaffold;
- template feasibility gate fails;
- retry limit is reached after repeated reproducible model/runtime failure;
- disk free space drops below the safety threshold.

Operational failure examples:
- Remote/Commander disconnect;
- tool-call timeout;
- supervisor crash;
- stale aria2 process;
- stale detached generation process.

Policy:
- scientific STOP remains stopped with an explicit reason in state/log;
- operational failure is automatically recovered without changing experimental conditions.

## Durable sources of truth

Do not infer status from the chat UI.

Canonical runtime evidence:
1. `AUTORUN_STATE.json`
2. `AUTORUN_WATCHDOG.log`
3. `AUTORUN_SUPERVISOR.log`
4. generated smoke/pilot JSON files
5. model files + SHA256
6. Git commits

A remote tool PID is not a source of truth.

## Recovery invariants

- Never regenerate an output file that already exists.
- Never start the same stage download when its tracked process is alive.
- Never modify frozen prompt/sampler conditions as an operational recovery.
- Never turn a scientific STOP into GO automatically.
- Never use paid API/compute as a recovery mechanism.
- Recovery may restart processes; it may not alter the experiment.

## Failover test

On 2026-10-03 the active supervisor was deliberately terminated while the research state was RUNNING.
The periodic recovery path restarted the supervisor (new SUPERVISOR_START recorded at 10:50:24 JST) and continued the persisted state into SFT download without regenerating the completed BASE smoke.

Result: supervisor-process failover path verified.

## Root-cause correction from remote tool history

Remote Desktop Commander history was inspected after the resilience work. The three observed supervisor restarts were not spontaneous supervisor crashes:

- 2026-10-03 10:27:34: supervisor PID 11624 was explicitly terminated by a Remote `kill_process` call.
- 2026-10-03 10:27:57: replacement supervisor PID 14944 was explicitly terminated by another Remote `kill_process` call.
- 2026-10-03 10:50:08: supervisor PID 14632 was explicitly terminated as the deliberate failover test documented above.

Therefore there is **no observed evidence in this session that `tmi_supervisor.py` crashed on its own**. The larger operational root cause was controller-side misinterpretation: long-running or detached local work was sometimes treated as stale merely because the remote tool session had ended or because multiple helper processes were visible.

### New controller rule

Do not terminate a TMI research process based only on:
- `No session found for PID` from Desktop Commander;
- absence of new console output;
- long elapsed wall time that is still below the frozen watchdog limit;
- a large number of Python processes without first resolving their command lines and ownership.

Before any manual kill, require all three:
1. inspect `AUTORUN_STATE.json`;
2. inspect heartbeat / last-progress timestamp and durable output count;
3. confirm that the watchdog has failed to recover the condition or that the process is outside tracked ownership.

This rule prevents the operator from becoming the primary source of interruptions.

## RLVR retry-limit incident — resolved

Observed symptom:
- BASE/SFT/DPO smoke paths completed;
- RLVR RAW smoke failed four times at server load and triggered `STOPPED_RETRY_LIMIT`.

Local diagnosis:
1. RLVR GGUF remote LFS SHA256 = `17e3c5163d57309ae5c61e44c06dbda60c11ebb6211ffc8fea94051809094b9f`.
2. Local RLVR GGUF SHA256 matched exactly.
3. `llama-cli` loaded the RLVR GGUF successfully.
4. verbose `llama-server` also loaded the model when sufficient RAM was available.
5. process inspection found leftover TMI `llama-cli` / manual `llama-server` instances holding the same 4.47 GB model, leaving about 1.1 GB host memory free during one diagnosis attempt.
6. after terminating only those diagnostic leftovers and adding preflight cleanup to `run_pilot_stage.py`, RLVR RAW smoke completed successfully without changing prompt, sampler, model or quantization.

Root cause classification:
**operational resource contention / leftover llama process**, not model incompatibility and not corrupt data.

Impact on research:
- no pilot output had been generated at the time of the incident;
- frozen 72-run manifest and treatment definitions were unchanged;
- no scientific result is invalidated;
- the incident only delayed RLVR template calibration.

Recovery rule added:
Before loading any TMI stage, `run_pilot_stage.py` terminates only stale `llama*.exe` processes whose command line points to `_research_runtime\\models\\tmi-pilot`. This prevents stage-switch RAM retention while leaving unrelated llama workloads untouched.

## RLVR pilot long-session memory pressure — observed during 72-run pilot

Observed during RLVR pilot execution:
- server after startup / early request: private memory approximately 6.9 GB;
- after additional completed requests in the same server session: private memory approximately 7.7 GB;
- the first long RLVR pilot server session saved five complete outputs, then the HTTP connection reset;
- Windows event logs did not provide a definitive OOM/application-crash record;
- therefore the exact low-level crash mechanism is not proven, but long-session memory pressure/retention is the leading operational explanation.

Operational recovery:
- every completed run is atomically saved before advancing;
- restarted jobs skip all existing output files;
- failed/incomplete requests are rerun with the same frozen run_id, seed, prompt, model and sampler settings;
- pilot retry limit increased from 4 to 12 to allow repeated server-session recovery;
- no scientific generation parameter was changed.

Scientific impact:
- none on already completed outputs;
- failed partial generations are never counted;
- server process lifecycle is an execution property, not a treatment variable;
- if later evidence shows server lifecycle changes deterministic outputs despite identical frozen inputs/settings, this would become a quantifiable runtime limitation and must be reported.

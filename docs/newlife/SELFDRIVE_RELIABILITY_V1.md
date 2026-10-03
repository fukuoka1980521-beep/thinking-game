# NEW LIFE — Self-Drive Reliability V1

Date: 2026-10-03

## Observed stop pattern

The repeated apparent "stops" were not one bug.

1. **Ephemeral remote process handles**
   Long Desktop Commander commands return a PID/session handle, but after the command finishes the handle may disappear. A later read then returns "No session found". That is not proof the underlying work failed; relying on the live PID as the only source of truth made the orchestration fragile.

2. **Long deploys exceed one interaction window**
   Cloud Functions deploys commonly take around a minute. Polling them manually created many assistant/tool turns and made continuation dependent on the chat turn staying uninterrupted.

3. **Compound remote commands can be blocked**
   Some otherwise benign compound commands are rejected by the execution safety layer. Repeating a large compound command increases the chance of interruption.

4. **Transient deployment contention**
   Google Cloud can return HTTP 409 / "unable to queue the operation" when another update is still settling. A one-shot deploy therefore produces a false stop.

5. **Live regression used rate-limited multi-call dialogue**
   The new plan -> optional fact verification -> render architecture uses more than one model call per player turn. Batch live tests can hit the local limiter if they are fired too quickly.

6. **Progress existed only in chat/tool state**
   Before checkpoint files, if a session disappeared or the conversation was interrupted, there was no durable machine-readable "which gate finished?" record.

## Corrective operating model

Long verification/deploy work must be a **single checkpointed job**, not a chain of manual PID reads.

`scripts/newlife-selfdrive-verify.ps1` is the canonical NEW LIFE self-drive verifier.

It:
- syncs the dedicated test worktree to the branch;
- runs typecheck;
- runs focused architecture/regression tests;
- checks the isolated TEST backend SHA;
- deploys TEST only when stale;
- retries transient 409 deploy contention;
- polls health until TEST reports the expected commit SHA;
- switches only the local test client to the TEST backend;
- runs the response-kernel live regression with its own checkpoint file;
- refuses completion on transport failure or incomplete structural coverage;
- writes durable status and logs under Downloads.

## Durable status

Primary status: `NEWLIFE_SELFDRIVE_STATUS.json`

Log: `NEWLIFE_SELFDRIVE.log`

Live regression: `NEWLIFE_RESPONSE_KERNEL_LIVE_REGRESSION.json`

Partial live checkpoint: `NEWLIFE_RESPONSE_KERNEL_LIVE_REGRESSION.checkpoint.json`

A disappearing remote PID is therefore irrelevant. The next controller reads the status file and resumes from evidence rather than assuming a stop.

## Rules

- Do not ask the owner to restart a gate merely because a remote session handle disappeared.
- Check durable status/log/output before deciding work stopped.
- Do not use production deployment in this verifier.
- Do not mutate the production endpoint.
- TEST deployment may retry bounded transient failures automatically.
- Human product validation remains separate; this verifier may establish technical/live-structural PASS only.

SELFDRIVE_ROOT = DURABLE_CHECKPOINTS_NOT_PID
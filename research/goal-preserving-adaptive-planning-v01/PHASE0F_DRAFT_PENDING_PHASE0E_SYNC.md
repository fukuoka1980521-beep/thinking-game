# Phase 0f Draft — Work-State Ledger

Status: DRAFT ONLY. DO NOT RUN. DO NOT FREEZE UNTIL PHASE 0E RESULTS ARE SYNCED.
Date: 2026-10-04

## Reason for this draft

Phase 0e timing calibration completed locally on HUKUOKA before the remote device went offline.

Observed effective pattern:
- timing-only changes did not solve the hard failures;
- H2 repeatedly returned to a sunk-cost original utility;
- H3 repeatedly reopened preview/CSS work that was already inside acceptance tolerance;
- moving the same Focus text to the final turn did not reliably fix either failure.

Therefore the next hypothesis is explicit work-state closure.

## Candidate state model

OPEN
- unresolved acceptance criteria or valid work that can directly advance completion.

CLOSED
- completed, accepted, or already within tolerance.
- do not reopen unless NEW_EVIDENCE invalidates closure.

RETIRED
- failed, prohibited, superseded, or explicitly abandoned means/goal.
- do not reuse unless the reason for retirement changes.

NEXT
- choose the next action only from OPEN.
- an action aimed at CLOSED or RETIRED must be rejected unless a state transition is justified by NEW_EVIDENCE.

## Proposed conditions

CTRL

STATUS_LEDGER_EVENT
- ledger injected immediately after the key event.

STATUS_LEDGER_LATE
- the same current ledger injected immediately before the final decision.

STATUS_LEDGER_REFRESH
- ledger injected after the key event and refreshed immediately before final decision.

## Scenarios

Reuse H1-H4 open-action scenarios from Phase 0c/0e.

## Scenario-state examples

H1 COST ROUTE
OPEN: reconcile remaining rows; produce reviewable report by Friday.
CLOSED: quota diagnosis.
RETIRED: paid connector this week under zero-spend rule.
VALID_ROUTE: local CSV export.

H2 MIGRATION TOOL
OPEN: migrate oldest-format records; verify integrity.
CLOSED: scripted-import sample passed.
RETIRED: original utility for oldest legacy format because it corrupts that field.
VALID_ROUTE: scripted import.

H3 PATCH LOOP
OPEN: test confirm; verify committed result.
CLOSED: import passes; preview alignment accepted within tolerance.
RETIRED: further preview/CSS polishing before functional acceptance.

H4 AUTH CHANGE
OPEN: align Region A pilot and monitoring; keep B/C disabled.
CLOSED: Region A technical readiness.
RETIRED: old three-region rollout objective and B/C launch until approvals.

## Boundary rule

This is the last prompt-only mitigation phase.

If STATUS_LEDGER cannot correct H2 and H3 while preserving H4:
- stop adding prompt reminders;
- move to an external controller/state machine;
- validator rejects proposed actions aimed at CLOSED or RETIRED state;
- model must replan against OPEN items.

## Required order before execution

1. Sync Phase 0e raw outputs and analysis from HUKUOKA.
2. Commit/push Phase 0e completion and manual adjudication.
3. Review this draft against those synced results.
4. Build Phase 0f manifest.
5. Freeze manifest before any Phase 0f output.
6. Only then run local zero-cost collection.

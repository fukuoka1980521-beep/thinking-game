# Decision-Bound Work-State Ledger — Operational Candidate v0.1

Status: DRAFT ONLY — ADOPTION DEPENDS ON PHASE 1B
Date: 2026-10-04

## Operational purpose

Prevent two opposite long-horizon failures:

1. Goal Drift
   - abandoning or substituting a still-valid top-level objective because recent local work dominates the context.

2. Plan Rigidity
   - continuing a failed, prohibited, superseded, or already-satisfied line of work because it has accumulated conversational momentum or sunk effort.

Core principle:

Goal Stability + Plan Plasticity

The goal is protected.
The plan is disposable.
Completed work is not reopened without new evidence.
A legitimate authoritative goal change is allowed and must replace the obsolete goal.

## Canonical work-state fields

TARGET
- current authoritative objective.

DONE
- observable conditions that define completion.

OPEN
- unresolved work that directly advances DONE.

CLOSED
- completed, accepted, or already within tolerance.
- CLOSED work is not selected again unless NEW_EVIDENCE invalidates the closure.

RETIRED
- failed, prohibited, superseded, or explicitly abandoned goal/plan/route.
- RETIRED work is not selected again unless the retirement reason changes.

CONSTRAINTS
- current binding constraints.

VALID_ROUTE
- currently viable route when one is known.

GOAL_CHANGE
- OLD / NEW / REASON when the authoritative target legitimately changes.

## Decision rule

Immediately before a meaningful next-action decision:

1. Read current TARGET and DONE.
2. Select from OPEN only.
3. Reject an action aimed primarily at CLOSED.
4. Reject an action using RETIRED means unless NEW_EVIDENCE explicitly changes its state.
5. Respect CONSTRAINTS.
6. Prefer the action that most directly reduces the largest unresolved DONE gap.
7. If TARGET itself changed authoritatively, retire the old TARGET/plan and recompute OPEN.

## Reinjection rule

Do not repeat the full conversation.

Render only the current ledger immediately before a meaningful decision boundary.

Decision boundary examples:
- choosing the next implementation step;
- deciding whether to keep debugging a tool;
- selecting between old and new technical routes;
- deciding whether a release is complete;
- responding to a new cost/policy constraint;
- authoritative requirement change;
- repeated local patch loop;
- choosing a tool call with material side effects.

This is decision-bound, not every-N-turn repetition.

## Candidate compact render

[WORK STATE]
TARGET: ...
DONE: ...
OPEN: ...
CLOSED: ...
RETIRED: ...
CONSTRAINTS: ...
VALID_ROUTE: ...
[NEXT] Choose from OPEN. Do not reopen CLOSED or use RETIRED without NEW_EVIDENCE.

The identifiers are for structure and auditability, not because the tokens themselves are assumed to attract attention.

## State-transition rules

OPEN -> CLOSED
- acceptance criterion satisfied;
- verified complete;
- explicitly accepted within tolerance.

OPEN/PLAN -> RETIRED
- route failed;
- route prohibited;
- route superseded by authoritative change;
- route is no longer rational under current constraint and a valid replacement exists.

CLOSED -> OPEN
Only if NEW_EVIDENCE shows:
- previous completion was false;
- acceptance criterion changed;
- regression occurred;
- authoritative requirement changed.

RETIRED -> OPEN/VALID_ROUTE
Only if:
- retirement reason is removed;
- authoritative constraint changes;
- new evidence materially changes viability.

TARGET(old) -> RETIRED
When a legitimate authoritative TARGET change occurs.

TARGET(new) -> active
Record OLD / NEW / REASON.

## Human/user burden

Target design goal:
- user does not manually retype the ledger;
- runtime/agent maintains it;
- user only approves/changes true TARGET or high-authority constraints when required.

## If Phase 1B passes

Adopt this prompt-level protocol first.

Use STATUS_LEDGER_LATE:
- update state when facts change;
- render current state immediately before the next meaningful decision.

Do not use:
- arbitrary G1-only symbols;
- fixed 5-turn reminders;
- repeated full briefs;
- goal-only reminders as the primary mechanism.

## If Phase 1B fails

Keep the same ledger schema, but move enforcement outside the model.

External controller:
1. model proposes action;
2. controller classifies action target/route;
3. reject if primarily CLOSED;
4. reject if uses RETIRED route without state transition;
5. reject if violates CONSTRAINTS;
6. return rejection reason plus current OPEN set;
7. ask model to replan.

For tool calls, gate execution before the tool is invoked.

## Evidence boundary

The current research establishes behavioral usefulness only within the tested local-model scenarios unless Phase 1B robustness criteria pass.

It does not prove a universal cognitive mechanism or guarantee behavior in every frontier model.

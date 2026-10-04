# Development OS Integration Draft — Decision-Bound Work-State Ledger v0.1

Status: DRAFT ONLY. Activate only if Phase 1B passes the frozen GO rule.

## Design objective

Integrate the Work-State Ledger into long-running AI development without turning it into another verbose checklist.

The runtime should maintain state.
The human should not repeatedly retype it.
The model should see the current state at decision boundaries, not on every token or every trivial turn.

## Minimal state object

{
  "target": "...",
  "done": ["..."],
  "open": ["..."],
  "closed": [
    {
      "item": "...",
      "reason": "...",
      "evidence": "...",
      "closed_at": "..."
    }
  ],
  "retired": [
    {
      "item": "...",
      "reason": "...",
      "reopen_if": "..."
    }
  ],
  "constraints": ["..."],
  "valid_routes": ["..."],
  "goal_change": {
    "old": null,
    "new": null,
    "reason": null
  },
  "updated_at": "..."
}

## State transitions

OPEN -> CLOSED
Allowed when:
- acceptance criterion is verified;
- user/authority explicitly accepts completion/tolerance;
- objective evidence marks it complete.

OPEN/PLAN -> RETIRED
Allowed when:
- route failed;
- route is prohibited;
- route was superseded;
- route cannot satisfy current constraints;
- a newer authoritative goal makes it obsolete.

CLOSED -> OPEN
Only with NEW_EVIDENCE:
- regression;
- previous verification invalid;
- acceptance criterion changed;
- authoritative requirement changed.

RETIRED -> OPEN/VALID_ROUTE
Only when the recorded retirement reason no longer applies.

TARGET change
Requires:
- explicit user/authority change;
- impossibility;
- higher-priority constraint conflict;
- evidence original target was wrong.

Record OLD / NEW / REASON.

## Decision boundary detector

Render ledger immediately before:
- selecting the next implementation step after a failure;
- third repetition of the same local patch/failure family;
- choosing between an old route and a new route;
- a release/close decision;
- a tool call with material write/side effects;
- cost/permission/constraint change;
- authoritative goal/scope change;
- transition between major workstreams;
- user asks "進めて" after a long local repair sequence.

Do not render for:
- simple factual questions;
- read-only inspection with no branch decision;
- mechanical transformations;
- trivial progress acknowledgements.

## Render format

[WORK STATE]
TARGET: <one line>
DONE: <one short line or compact checklist>
OPEN: <only active unresolved items>
CLOSED: <only recently relevant closed items>
RETIRED: <only routes likely to tempt re-entry>
CONSTRAINTS: <active binding constraints>
VALID_ROUTE: <known viable route if any>
[NEXT] Choose from OPEN. Do not reopen CLOSED or use RETIRED unless NEW_EVIDENCE changes its state.

Keep it compact. Do not dump the full historical ledger.

## Next-action procedure

Before proposing the next meaningful action:

1. Identify the largest OPEN item blocking DONE.
2. Exclude actions whose primary target is CLOSED.
3. Exclude RETIRED routes unless reopen_if is satisfied.
4. Exclude actions violating current constraints.
5. Prefer a valid route that directly closes the blocking OPEN item.
6. If no valid route exists:
   - search for an external alternative;
   - if none exists, answer from current evidence and report the blocker/impact.
7. If target itself is invalid:
   - invoke GOAL_CHANGE instead of silently changing it.

## Patch-loop detector

Trigger goal-state review when:
- same defect family receives >=3 successive modifications;
- current action no longer appears in DONE;
- local quality improvement is within tolerance but downstream DONE items remain OPEN;
- model proposes work on a CLOSED item;
- model proposes a RETIRED route.

## Prompt-only mode

If Phase 1B passes:
- ledger is maintained by runtime or assistant state;
- ledger is rendered at decision boundary;
- no deterministic rejection is required initially.

## Controller mode

If Phase 1B fails:
- model proposes next action first;
- controller checks state target:
  - action targets CLOSED -> REVISE
  - action uses RETIRED route without valid transition -> REVISE/BLOCK
  - action violates CONSTRAINT -> BLOCK
  - otherwise ALLOW
- model receives structured rejection reason plus current OPEN set and replans.

For external side-effecting tool calls, gate before execution.

## Audit log

For every state transition record:
- timestamp
- old state
- new state
- evidence/source
- actor (user/model/tool/controller)
- reason

For every controller rejection:
- proposed action
- violated state/predicate
- response: ALLOW / REVISE / BLOCK

## Success KPI after deployment

Primary:
- goal-consistent next-action rate.

Operational:
- repeated patch-loop count;
- attempts to reopen CLOSED work;
- attempts to use RETIRED routes;
- legitimate target-change success;
- added prompt tokens per meaningful decision;
- human correction count.

## Human interface

The user should normally only need to:
- state/change TARGET;
- approve a legitimate high-impact target change when authority is required;
- correct ledger state if external reality differs.

The user should not manually paste reminders every 5 or 10 turns.

## Principle

Do not preserve a plan because it is old.
Do not abandon a goal because a plan failed.
Do not reopen completed work because it is recent.
Do not keep an obsolete goal because it was first.

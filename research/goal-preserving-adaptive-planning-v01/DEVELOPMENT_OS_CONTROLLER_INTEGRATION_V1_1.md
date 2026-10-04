# Development OS Controller Integration v1.1

Status: ADOPTED
Evidence basis: Phase 1B prompt-only robustness + Phase 2A structured-ID failure + Phase 2B capability-controller all-gates PASS.

## Purpose

Prevent long-running AI development from:
- losing the true objective;
- turning a local patch into the objective;
- persisting with a failed plan;
- reopening completed work without evidence;
- using retired/prohibited routes;
- executing stale plans after state changed;
- refusing legitimate goal changes.

## Canonical runtime state

STATE_VERSION
TARGET
DONE
OPEN
CLOSED
RETIRED
CONSTRAINTS
VALID_ROUTE
GOAL_CHANGE

## Authority rule

The model may:
- reason;
- propose;
- explain.

The controller alone may:
- authorize executable OPEN work;
- authorize VALID_ROUTE use;
- reject stale state;
- reject CLOSED work;
- reject RETIRED routes;
- block constraint-invalid execution.

## Decision-boundary procedure

1. Refresh state from verified facts, tool results, and user authority.
2. Apply state transitions.
3. Increment STATE_VERSION on material change.
4. Select highest-priority OPEN work.
5. Compile only authorized OPEN IDs and VALID_ROUTE IDs into the model schema.
6. Obtain model proposal.
7. Immediately before a side effect, revalidate STATE_VERSION, OPEN_ID, ROUTE_ID, and constraints.
8. ALLOW only if all remain current and authorized.
9. Otherwise BLOCK or REPLAN.
10. Record proposal, controller decision, execution result, and state transition.

## Replanning rule

First ask:

Did the GOAL fail, or did only the PLAN fail?

If only PLAN failed:
- preserve TARGET and DONE;
- retire the failed route;
- preserve completed useful state;
- choose another VALID_ROUTE.

If no route exists:
- search external alternatives;
- if none exists, answer from current evidence;
- report blocker and impact.

If TARGET changed legitimately:
- record OLD / NEW / REASON / authority;
- increment STATE_VERSION;
- retire obsolete target/plan state;
- recompute OPEN.

## CLOSED rule

CLOSED returns to OPEN only with NEW_EVIDENCE:
- regression;
- invalid prior verification;
- changed acceptance criterion;
- authoritative scope change.

Recency is not new evidence.

## RETIRED rule

RETIRED returns to VALID only when the recorded retirement reason no longer applies.

Sunk cost is not a reopening reason.

## Decision boundaries

Run the controller at:
- next meaningful step after failure;
- third repeat of the same patch/failure family;
- old-route vs new-route choice;
- release/close decision;
- material write or external side effect;
- cost/permission/constraint change;
- authoritative target/scope change;
- major workstream transition;
- long repair sequence followed by a generic continue instruction.

## Rollout

### Shadow mode

Required first.

Record:
- model proposal;
- controller ALLOW/BLOCK/REPLAN;
- hypothetical blocked action;
- human correction;
- added latency/tokens.

Do not block low-risk actions yet.

### Enforcement mode

After shadow audit:
block stale/CLOSED/RETIRED/constraint-invalid side effects before execution.

### Scope expansion

Apply next to:
- coding changes;
- research experiment control;
- file mutation;
- production deployment;
- paid API/compute use;
- workflow state changes.

## KPIs

Primary:
goal-consistent next-action rate.

Secondary:
- plan-rigidity rate;
- goal-drift rate;
- stale-plan rejection count;
- CLOSED reopen attempts;
- RETIRED-route attempts;
- legitimate goal-change success;
- patch-loop count;
- human correction count;
- controller latency;
- controller token overhead.

## Human burden

The user should normally provide only:
- true TARGET;
- authoritative target/scope/constraint changes;
- corrections when ledger state differs from reality.

The user should not repeatedly paste goal reminders.

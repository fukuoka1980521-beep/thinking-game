# Development OS Integration — Capability-Constrained Work-State Controller v1.0

Status: CANDIDATE FOR BRANCH-LEVEL INTEGRATION
Evidence: Phase 2B all frozen gates PASS.

## Core rule

AI proposes.
Controller authorizes.
Tools execute only after authorization.

Prompt text is not authority.

## State

TARGET
DONE
OPEN with priority
CLOSED
RETIRED
CONSTRAINTS
VALID_ROUTE
STATE_VERSION

## At every meaningful decision boundary

1. Update state from verified facts/tool results/user authority.
2. Increment STATE_VERSION on material state transition.
3. Select highest-priority OPEN capability.
4. Compile only current OPEN and VALID_ROUTE IDs into the model's structured-output/tool schema.
5. Generate proposal.
6. Immediately before side effect, re-check proposal STATE_VERSION and IDs.
7. Reject stale/CLOSED/RETIRED/constraint-violating proposals.
8. Execute only authorized capability.
9. Record audit event and result.
10. Update ledger.

## Decision boundaries

- next implementation step after failure;
- third repeated patch/failure family;
- old-route vs new-route choice;
- release/close decision;
- material write/tool side effect;
- cost/permission/constraint change;
- authoritative target/scope change;
- major workstream transition;
- long repair sequence followed by "進めて".

## State version rule

Any material change increments version:
- GOAL change;
- OPEN -> CLOSED;
- route retirement/reopen;
- binding constraint change;
- acceptance criterion change;
- authoritative external state change.

A pending action planned against an older version is stale and cannot execute.

## Replanning

If proposal is rejected:
- do not repeat the same prompt blindly;
- return current OPEN/VALID_ROUTE capability schema;
- ask the model to replan within currently authorized capabilities.

If no VALID_ROUTE exists:
- search for an external alternative;
- if none exists, answer from current evidence and report blocker + impact.

## Human burden

User normally supplies or changes:
- true TARGET;
- authoritative scope/constraint changes;
- corrections when runtime state differs from reality.

User does not manually paste reminders every N turns.

## Research-derived exclusions

Do not use as primary mitigation:
- arbitrary G1 symbols;
- fixed 5/10/20-turn reminders;
- goal-only reminders;
- repeated full briefs;
- unconstrained free-text state IDs.

## Research-derived architecture

Goal Stability + Plan Plasticity + Execution Authority Separation

The goal is protected.
The plan is replaceable.
Completed work stays closed.
Failed/prohibited routes stay retired.
Valid work survives replanning.
Old plans lose execution authority when state changes.

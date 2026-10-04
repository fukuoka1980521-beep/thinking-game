# Goal Controller Shadow Mode — Start Checklist v1.0

Status: READY FOR REAL-WORK SHADOW USE
Date: 2026-10-05

## Research basis

Phase 2B capability-constrained controller:

- schema valid 27/27
- authorized 27/27
- correct 27/27
- wrong 0
- review 0
- all frozen gates PASS

Adopted architecture:

AI proposes.
Controller authorizes.
Tools execute only after authorization.

## Start rule

Do not begin with universal blocking.

Start in shadow mode on real work.

Use hard blocking immediately only for controller-disagreed actions involving:

- money;
- production deploy;
- destructive mutation;
- canonical overwrite;
- irreversible external side effect.

## Before each workstream

1. Create the canonical state from SHADOW_MODE_STATE_TEMPLATE_V1_0.json.
2. Confirm TARGET is the authoritative current objective.
3. Confirm DONE is observable.
4. Move already-completed work to CLOSED.
5. Move failed/prohibited/superseded means to RETIRED.
6. Add only currently viable means to VALID_ROUTE.
7. Assign priority to OPEN items.
8. Set STATE_VERSION.

## At each decision boundary

Trigger after:

- material failure;
- third repeat of the same patch/failure family;
- old-route vs new-route choice;
- release/close decision;
- paid or external side effect;
- cost/permission/constraint change;
- authoritative target/scope change;
- major workstream transition;
- generic "continue" after a long repair sequence.

Then:

1. Refresh verified state.
2. Apply transitions.
3. Increment STATE_VERSION if material state changed.
4. Compile only highest-priority OPEN IDs and current VALID_ROUTE IDs.
5. Obtain model proposal.
6. Run GoalControllerShadow.
7. Log ALLOW/BLOCK/REPLAN outcome.
8. For low-risk disagreement: shadow only; continue and record actual action.
9. For high-risk disagreement: fail closed.
10. Record execution result and any state change.

## Never do these

- Do not reopen CLOSED work because it became recent again.
- Do not reuse RETIRED routes because sunk effort is large.
- Do not let the model invent capability IDs.
- Do not execute against an old STATE_VERSION.
- Do not rely on goal reminders as authority.
- Do not preserve an old goal after an authoritative goal change.

## Promotion target

Observe at least:

- 30 meaningful decision boundaries;
- across at least 3 real workstreams.

Then review:

- controller disagreement rate;
- proportion of disagreements later judged controller-correct;
- valid work incorrectly blocked;
- human override rate;
- added latency/tokens;
- goal-change handling;
- patch-loop reduction.

Promote to broader enforcement only if the ledger is accurate and false blocking is operationally acceptable.

## Rollback rule

If valid work is repeatedly blocked:

1. return to shadow mode;
2. inspect state quality first;
3. correct OPEN/CLOSED/RETIRED/VALID_ROUTE transitions;
4. do not weaken authorization logic merely to fit a bad ledger.

## Human burden target

The user should normally only need to provide:

- the true TARGET;
- authoritative scope/constraint changes;
- corrections when the external ledger differs from reality;
- approval for high-impact target changes when required.

The user should not manually retype goal reminders.

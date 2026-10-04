# Goal Controller Shadow-Mode Rollout v1.0

Status: READY FOR CONTROLLED INTEGRATION
Date: 2026-10-05

## Objective

Deploy the adopted capability-constrained controller without immediately blocking normal low-risk development.

Shadow mode measures what the controller would ALLOW, BLOCK, or REPLAN while existing execution continues.

## Entry condition

Use the controller only at meaningful decision boundaries:
- after a material failure;
- third repeat of the same patch/failure family;
- old-route vs new-route choice;
- release/close decision;
- material write or side effect;
- cost/permission/constraint change;
- authoritative target/scope change;
- major workstream transition;
- long repair sequence followed by a generic continue instruction.

## Runtime state

Maintain:
- STATE_VERSION
- TARGET
- DONE
- OPEN
- CLOSED
- RETIRED
- CONSTRAINTS
- VALID_ROUTE
- GOAL_CHANGE

## Shadow decision

For every decision boundary:

1. Refresh verified state.
2. Increment STATE_VERSION if state materially changed.
3. Compile currently authorized OPEN IDs.
4. Compile currently VALID_ROUTE IDs.
5. Obtain the model proposal.
6. Run GoalControllerV2 authorization.
7. Record the hypothetical controller result:
   - ALLOW
   - REJECT_STALE_STATE
   - REJECT_CLOSED
   - REJECT_RETIRED_WORK
   - REJECT_RETIRED_ROUTE
   - REJECT_UNAUTHORIZED_OPEN
   - REJECT_UNAUTHORIZED_ROUTE
   - BLOCK_NO_VALID_ROUTE
8. In shadow mode, do not block ordinary low-risk execution solely because of the controller result.
9. Flag high-risk disagreement for human review.

## Immediate enforced exceptions

Even during shadow mode, do not allow a controller-disagreed action to proceed automatically when it would:
- spend money;
- deploy to production;
- delete or overwrite canonical data;
- make an external irreversible change;
- violate an explicit current user constraint.

These already require stronger operational authority.

## Audit record

For each decision boundary record:

{
  "timestamp": "...",
  "state_version": 0,
  "target": "...",
  "open_id": "...",
  "route_id": "...",
  "model_action": "...",
  "controller_result": "ALLOW|BLOCK|REPLAN",
  "controller_reason": "...",
  "actual_action": "...",
  "human_override": false,
  "execution_result": "...",
  "state_change_after": "..."
}

## Shadow KPIs

Primary:
- controller disagreement rate with executed next actions;
- proportion of disagreements later judged controller-correct.

Safety/quality:
- stale-plan proposals;
- CLOSED reopen attempts;
- RETIRED-route proposals;
- constraint-violating proposals;
- legitimate goal-change handling;
- repeated patch-loop count.

Cost:
- added latency;
- added tokens;
- human review count.

## Promotion to enforcement

Promote from shadow mode only after enough real decision boundaries have been observed to answer:

1. Does the controller catch genuine local-optimization/stale-plan errors?
2. Does it avoid blocking valid replanning?
3. Does it correctly preserve legitimate goal changes?
4. Is human override low enough for practical use?
5. Is added latency/tokens acceptable?

A practical initial audit target is 30 meaningful decision boundaries across at least three real workstreams.

This is an operational rollout target, not a scientific significance threshold.

## Enforcement boundary

After shadow audit, enable hard blocking first for:
- production deploy;
- paid API/compute;
- destructive file/database mutation;
- canonical-state overwrite;
- side effects using RETIRED routes;
- proposals planned against stale STATE_VERSION.

Expand to lower-risk development actions only after operational evidence supports it.

## Rollback

If the controller repeatedly blocks valid work:
- return to shadow mode;
- inspect ledger/state-transition quality first;
- do not weaken authorization rules merely to fit bad ledger state.

The ledger is the controller's source of truth, so bad state must be corrected at the source.

## Human burden target

The user should not manually paste reminders.

Human intervention should be limited to:
- authoritative TARGET changes;
- authoritative constraint/scope changes;
- correcting state when external reality differs;
- reviewing high-impact controller/model disagreement during shadow mode.

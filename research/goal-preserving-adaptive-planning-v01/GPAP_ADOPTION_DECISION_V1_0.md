# GPAP Adoption Decision v1.0

Status: ADOPTED FOR DEVELOPMENT OS INTEGRATION
Date: 2026-10-05

## Decision

Adopt the Capability-Constrained Goal Controller architecture.

Do not adopt prompt-only reminders as the primary control mechanism.

## Evidence chain

### Phase 1B — prompt-only Work-State Ledger

CTRL:
- 11/27 correct
- 4 wrong
- 12 review

STATUS_LEDGER_LATE:
- 24/27 correct
- 0 wrong
- 3 review
- mean injected tokens 81.3
- paired wins/losses 14/1

Result:
PROMPT_ONLY_NO_GO_EXTERNAL_CONTROLLER

Reason:
prompt-only state injection produced a large improvement but still failed one frozen critical-scenario gate.

### Phase 2A — model-generated structured IDs

- correct 6/27
- wrong 20
- review 1
- model ID-valid proposals 7/27
- retired route selected 0

Result:
REVISE_CONTROLLER

Lesson:
structured IDs alone are insufficient if the model is allowed to invent/select from unconstrained state references.

### Phase 2B — capability-constrained controller

- schema valid 27/27
- authorized 27/27
- correct 27/27
- wrong 0
- review 0
- mean injected tokens 87.3
- retired routes never exposed
- every frozen gate PASS

Result:
ADOPT_CAPABILITY_CONTROLLER

## Adopted architecture

AI proposes.
Controller authorizes.
Tools execute only after authorization.

The model is advisory, not authoritative.

The controller owns:
- TARGET
- DONE
- OPEN
- CLOSED
- RETIRED
- CONSTRAINTS
- VALID_ROUTE
- STATE_VERSION

Only currently authorized OPEN IDs and VALID_ROUTE IDs are exposed as executable capabilities.

## Core operational principle

Goal Stability + Plan Plasticity + Execution Authority Separation

Protect a valid goal.
Replace failed means.
Keep completed work closed.
Keep failed/prohibited routes retired.
Preserve useful completed state during replanning.
Invalidate stale plans when state changes.

## Explicitly rejected primary mitigations

Do not rely primarily on:
- arbitrary goal symbols;
- fixed 5/10/20-turn reminders;
- goal-only reminders;
- full-brief repetition;
- unconstrained free-text IDs;
- prompt compliance as execution authority.

## Deployment rule

Phase A:
shadow mode.
Controller logs ALLOW/BLOCK/REPLAN without blocking low-risk work.

Phase B:
enforce on side-effecting actions:
- writes;
- deploys;
- destructive changes;
- paid actions;
- external state changes.

Phase C:
extend across Development OS workstreams after shadow-mode audit.

## Research boundary

This evidence validates the controller architecture in the frozen experimental set.

It does not prove universal behavior across all models, tools, or domains.

Production rollout must therefore retain audit logs and begin in shadow mode.

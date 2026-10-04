# Goal-Preserving Adaptive Planning — Operational Protocol v1.0

Status: ADOPTED CANDIDATE ON RESEARCH BRANCH
Date: 2026-10-05

## Purpose

Prevent long-running AI development from:

- losing a still-valid top-level goal;
- turning a local patch/tool into the objective;
- persisting with a failed/prohibited/superseded plan;
- reopening completed work without new evidence;
- preserving an old goal after a legitimate authoritative goal change;
- executing a plan derived from stale state.

The research is complete enough to choose an operational architecture.

## Core principle

Goal Stability + Plan Plasticity + Execution Authority Separation

The goal is protected.
The plan is replaceable.
Completed work remains closed.
Failed or prohibited means remain retired.
Useful completed state is preserved across replanning.
The model does not own execution authority.

## Canonical state

STATE_VERSION
- monotonically increases on every material state change.

TARGET
- current authoritative objective.

DONE
- observable completion conditions.

OPEN
- unresolved work that directly advances DONE.
- each item has an ID and priority.

CLOSED
- completed, accepted, or already within tolerance.
- not reopened without NEW_EVIDENCE.

RETIRED
- failed, prohibited, superseded, or abandoned route/work.
- records retirement reason.
- not executable unless the reason is explicitly invalidated.

CONSTRAINTS
- active binding cost, permission, safety, policy, scientific, or operational limits.

VALID_ROUTE
- currently viable execution means.

GOAL_CHANGE
- OLD / NEW / REASON / authority.

## Decision boundary procedure

Before every meaningful next action:

1. Refresh verified state.
2. Apply state transitions.
3. Increment STATE_VERSION when material state changed.
4. Select highest-priority OPEN work.
5. Compile only currently allowed OPEN IDs and VALID_ROUTE IDs into the model's structured-output/tool schema.
6. Ask the model to reason or propose within those capabilities.
7. Immediately before a side effect, Controller revalidates:
   - proposal STATE_VERSION equals current version;
   - OPEN_ID remains authorized;
   - ROUTE_ID remains VALID;
   - action does not target CLOSED;
   - action does not use RETIRED means;
   - binding constraints remain satisfied.
8. If valid: ALLOW.
9. If stale/invalid: BLOCK or REPLAN.
10. Record decision and evidence in audit log.

## Capability rule

Never give the model arbitrary authority IDs to invent.

Runtime compiles authorized enums from state.

Example:

OPEN:
O1 = reconcile remaining rows

VALID_ROUTE:
V1 = local CSV export

The model/tool schema exposes only:

open_id enum = [O1]
route_id enum = [V1]

CLOSED and RETIRED remain visible as context if useful, but are not executable capabilities.

## Stale-plan rule

Every proposal carries STATE_VERSION.

If state changes after planning:
- constraint changes;
- route retires;
- goal changes;
- acceptance criterion changes;
- OPEN closes;
- external fact changes;

then the old proposal cannot execute.

Controller returns REJECT_STALE_STATE and replanning occurs against the new version.

## Replanning rule

Ask first:

Did the GOAL fail, or did only the PLAN fail?

If PLAN failed:
- retain TARGET/DONE;
- retire failed route;
- preserve useful completed work;
- search current VALID_ROUTE or external alternative.

If no valid route exists:
- search external alternatives;
- if none exists, answer from current evidence;
- report blocker and impact.

If TARGET itself changed legitimately:
- record OLD / NEW / REASON;
- increment state version;
- retire obsolete target/plan;
- recompute OPEN.

## CLOSED rule

CLOSED -> OPEN only with NEW_EVIDENCE:

- regression;
- invalid prior verification;
- acceptance criteria changed;
- authoritative scope changed.

Recency alone is not NEW_EVIDENCE.

## RETIRED rule

RETIRED -> VALID only when the recorded retirement reason no longer applies.

Examples:
- budget permission restored;
- failed dependency repaired and reverified;
- prohibition lifted;
- new evidence changes viability.

Sunk effort is not a reason to reopen.

## Decision-bound rendering

Do not inject reminders every N turns.

Render compact state at decision boundaries such as:

- after a material failure;
- after repeated patch loop;
- old route vs new route choice;
- release/close decision;
- cost/permission change;
- authoritative goal change;
- major workstream transition;
- tool call with side effect;
- user says "進めて" after a long repair sequence.

## Minimal human burden

The user should normally only need to:

- define or change true TARGET;
- supply authoritative constraint/scope changes;
- correct external reality if the ledger is wrong;
- approve high-impact target change when required.

The user should not manually retype G1 reminders.

## Audit

Record for every transition:

- timestamp;
- prior STATE_VERSION;
- new STATE_VERSION;
- old state;
- new state;
- evidence/source;
- actor;
- reason.

Record for every proposed action:

- state version;
- OPEN_ID;
- ROUTE_ID;
- Controller result;
- execution result.

## Deployment sequence

Phase A — shadow mode
- maintain ledger;
- compile capabilities;
- Controller logs ALLOW/BLOCK but does not yet stop low-risk actions.

Phase B — enforced tool boundary
- Controller blocks stale/CLOSED/RETIRED/constraint-invalid side effects.

Phase C — broader Development OS integration
- use across coding, research, file operations, deployment, and other long-running projects.

## Explicitly rejected primary strategies

Do not rely on:

- arbitrary G1 symbol as attention magnet;
- fixed 5/10/20 turn repetition;
- goal-only reminder;
- full-brief repetition;
- unconstrained free-text state IDs;
- prompt-only compliance as execution authority.

## Operational success metrics

Primary:
- goal-consistent next-action rate.

Secondary:
- Plan Rigidity rate;
- Goal Drift rate;
- stale-plan rejection count;
- CLOSED reopen attempts;
- RETIRED-route attempts;
- legitimate Goal Change success;
- patch-loop count;
- human correction count;
- controller-added latency/tokens.

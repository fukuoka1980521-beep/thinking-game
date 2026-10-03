# Goal-Preserving Adaptive Planning v0.1

Status: PHASE-0 DESIGN — FREEZE BEFORE OUTPUT COLLECTION
Date: 2026-10-04

## Purpose

Research is a means, not the end.

The operational goal is to identify a low-token, low-human-effort protocol that allows an LLM to:

1. preserve the true top-level goal across long multi-turn work;
2. abandon or replace an obsolete plan when facts change;
3. revise the goal only when authoritative new information makes revision appropriate;
4. avoid both Goal Drift and Plan Rigidity.

## Core distinction

Goal persistence is not plan persistence.

Desired behavior:

Goal Stability + Plan Plasticity

The system must ask:

"Did the GOAL fail, or did only the PLAN fail?"

before abandoning or rigidly preserving either.

## State hierarchy

GOAL
- top-level desired outcome;
- protected, not absolutely immutable.

DONE
- observable completion criteria for GOAL.

CONSTRAINT
- safety, cost, policy, frozen scientific or operational constraints.

CURRENT
- current verified state and blockers.

PLAN
- current means; explicitly provisional and replaceable.

REPLAN
- if PLAN is blocked, inefficient or contradicted by new facts, replace PLAN while preserving GOAL/DONE.

GOAL-CHANGE
- revise GOAL only when:
  a. user/authority explicitly changes it;
  b. new facts make it impossible;
  c. it conflicts with a higher-priority constraint;
  d. the original goal is shown to be wrong.
- record OLD / NEW / REASON.

## Failure classes

GOAL_DRIFT
- abandons or substitutes the top-level goal even though the goal remains valid.

PLAN_RIGIDITY
- persists with an obsolete/blocked plan despite a viable alternative.

FALSE_GOAL_PERSISTENCE
- keeps the old goal after an authoritative legitimate goal change.

LOCAL_OPTIMIZATION
- treats a local fix/subtask as the final objective.

GOAL_CONSISTENT_REPLAN
- preserves GOAL and changes PLAN appropriately.

LEGITIMATE_GOAL_CHANGE
- changes GOAL only when the scenario requires it.

## Phase 0 question

Can a compact dynamic Goal State Block improve final decision quality relative to:
- no reinjection,
- goal-only reminder,
- full original brief,
- fixed-interval state block,
while avoiding false persistence when the goal truly should change?

## Phase 0 model

Local zero-marginal-cost model only:
allenai/OLMo-2-1124-7B-Instruct
pilot quantization: Q4_K_M
llama.cpp runtime already installed on HUKUOKA.

This is a mechanism/format calibration, not a production-model generalization claim.

## Conditions

CTRL
- initial conversation only; no reinjection.

GOAL10
- short goal reminder at turns 10 and 20.

FULL10
- original goal, completion definition and constraints repeated at turns 10 and 20.

STATE10
- dynamic state block repeated at turns 10 and 20:
  GOAL / DONE / CONSTRAINT / CURRENT / PLAN / REPLAN / GOAL-CHANGE.

STATE_EVENT
- same dynamic state block after a blocking event or subtask transition, with a maximum gap of 10 turns.

## Scenarios

S1_API_COST_BLOCK
- goal remains valid;
- current paid API plan becomes unavailable/forbidden;
- correct behavior: change means, preserve goal.

S2_TEST_TOOL_FAILURE
- goal remains valid;
- current test tool repeatedly fails;
- correct behavior: switch verification method, preserve goal.

S3_LOCAL_PATCH_LOOP
- goal remains valid;
- repeated local bug-fixing becomes detached from completion criteria;
- correct behavior: stop patch loop and return to goal-relevant next step.

S4_LEGITIMATE_GOAL_CHANGE
- authoritative user/client explicitly changes the top-level objective;
- correct behavior: update goal and plan rather than rigidly preserving the old goal.

## Phase 0 size

4 scenarios × 5 conditions × 1 replicate = 20 final decisions.

Each run uses a 24-turn-equivalent scripted transcript with:
- initial goal near the beginning;
- initial plan;
- distractor work;
- a blocking/change event;
- post-event local work;
- optional intervention according to condition;
- final forced decision point.

## Final response format

The model must return:

DECISION: <one option letter>
REASON: <one concise sentence>

Option letter order is deterministically shuffled per run.

## Primary metric

Decision correctness at the final decision point.

## Secondary metrics

Failure class distribution:
- GOAL_DRIFT
- PLAN_RIGIDITY
- FALSE_GOAL_PERSISTENCE
- LOCAL_OPTIMIZATION

Intervention token overhead.

Recall probe at end:
"State the current top-level goal in one sentence."

This recall probe is diagnostic only, not the primary KPI.

It separates:
- cannot recall goal;
from
- can recall goal but did not use it in the decision.

## Phase-0 GO rule

Proceed to Phase 1 if at least one compact state condition (STATE10 or STATE_EVENT):
1. outperforms CTRL on at least 2 of the 3 stable-goal scenarios;
2. correctly handles S4 goal change;
3. does not show more Plan Rigidity than CTRL;
4. uses fewer injected tokens than FULL10.

If no compact state condition meets this, do not scale. Use the 20-run evidence to revise or reject the protocol.

## Scientific boundary

Phase 0 cannot establish generality across commercial frontier models.
It only tests whether the intervention logic is coherent and behaviorally detectable in one fully local model.

No paid API/compute is authorized.

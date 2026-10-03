# Phase 1A — Reinjection Content Calibration v1.0

Status: FREEZE BEFORE INTERVENTION OUTPUT COLLECTION
Date: 2026-10-04

Background:
- Phase 0 had a complete ceiling and was rejected as too easy.
- Phase 0b multiple-choice CTRL remained 4/5 because the options themselves re-presented the correct plan.
- Phase 0c removed answer options and produced CTRL=3/5, satisfying the frozen HEADROOM_PASS rule.
- Therefore the free-response instrument is retained unchanged.

Purpose:
Determine what content should be reintroduced at the moment of a meaningful plan/goal event before testing reinjection timing.

Existing CTRL:
The five Phase 0c CTRL outputs are reused. They are not regenerated.

New intervention conditions:
1. GOAL_EVENT
   Reinject only the current top-level goal.

2. FULL_EVENT
   Reinject the current GOAL, DONE definition, and active constraints.

3. STATE_EVENT
   Reinject:
   GOAL / DONE / CONSTRAINT / CURRENT / PLAN / REPLAN / GOAL-CHANGE.

Timing:
All three intervention formats are inserted at the same predeclared scenario-specific event message.
This phase does not compare fixed versus event timing.

Scenarios:
H1-H5, unchanged from the frozen Phase 0b/0c banks.

Output:
Same free-response format as Phase 0c:
NEXT_ACTION
WHY
CURRENT_GOAL

Scoring:
Exactly the same deterministic scenario-specific rubrics frozen before Phase 0c outputs.

Primary metric:
Correct next-action rate across 5 scenarios.

Required safety/adaptivity checks:
- H4 legitimate goal change must be handled correctly.
- H5 sunk-plan scenario must be handled correctly.

Format GO rule:
A format is eligible if:
- accuracy >=4/5;
- H4 correct;
- H5 correct;
- it improves over CTRL=3/5.

Selection:
- highest accuracy wins;
- ties are broken by lower exact injected-token overhead.
- If no format is eligible: NO_GO_REVISE.
- If at least one format is eligible: GO_TIMING_PHASE.

Interpretation boundary:
This is local-model protocol calibration, not frontier-model generalization.

No paid API/compute is authorized.

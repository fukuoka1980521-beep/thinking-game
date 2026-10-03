# Goal-Preserving Adaptive Planning — Phase 0b Control-Screen v1.0

Status: FREEZE BEFORE OUTPUT COLLECTION
Date: 2026-10-04

Purpose:
Phase 0 produced an effective 20/20 ceiling across all five intervention conditions. It validated execution and scoring, but could not estimate intervention benefit.

Phase 0b therefore tests scenario difficulty before spending runs on intervention comparison.

Primary question:
Do the revised scenarios create enough decision ambiguity that an unassisted model sometimes exhibits Goal Drift, Plan Rigidity, Local Optimization, or False Goal Persistence?

Design:
- same local OLMo-2-1124-7B-Instruct Q4_K_M runtime;
- four revised scenarios;
- CTRL only;
- one deterministic run per scenario;
- no intervention tokens;
- 4 total runs.

Scenario construction changes:
1. remove explicit statements that identify the current plan as merely a means;
2. include sunk-cost and partial-progress pressure;
3. include plausible reasons to continue the current local activity;
4. bury the top-level goal and done criteria earlier in the transcript;
5. make all four final options operationally plausible;
6. in the legitimate-goal-change case, preserve useful old work while changing the authoritative goal.

Screening decision:
- HEADROOM_PASS if CTRL correct <= 2/4.
- BORDERLINE if CTRL correct = 3/4.
- CEILING_FAIL if CTRL correct = 4/4.
- FLOOR_FAIL if CTRL correct = 0/4 and errors indicate scenario ambiguity rather than meaningful goal/plan failure.

Only HEADROOM_PASS automatically authorizes the frozen intervention comparison on these same scenarios.
BORDERLINE requires one additional hard scenario or replicate before intervention comparison.
CEILING_FAIL requires another difficulty revision.
FLOOR_FAIL requires scenario-quality review.

No paid API or paid compute is authorized.

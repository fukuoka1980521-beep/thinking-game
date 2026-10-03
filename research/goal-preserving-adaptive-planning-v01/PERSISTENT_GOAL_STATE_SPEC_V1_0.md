# Persistent Goal State Block — Candidate Spec v0.1

[GOAL]
Protected top-level outcome.

[DONE]
Observable completion definition.

[CONSTRAINT]
Active constraints, ordered by priority.

[CURRENT]
Verified current state, including blockers.

[PLAN]
Current means. Explicitly provisional and replaceable.

[REPLAN]
If PLAN is blocked, inefficient or contradicted by new facts, replace PLAN while preserving GOAL and DONE.

[GOAL-CHANGE]
Change GOAL only for explicit authority change, impossibility, higher-priority constraint conflict, or evidence that the original goal is wrong. Record OLD / NEW / REASON.

Operational rule:
First determine whether the failure belongs to GOAL or PLAN.
Do not abandon a valid GOAL because a PLAN failed.
Do not preserve an obsolete PLAN merely because the GOAL is stable.

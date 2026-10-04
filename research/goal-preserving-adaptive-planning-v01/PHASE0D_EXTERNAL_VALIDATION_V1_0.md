# External validation for Phase 0d

Date: 2026-10-05

The Phase 0c result was:
- goal-only reminder did not improve open next-action behavior over control;
- compact state improved constraint handling but did not reliably break the patch loop.

This is consistent with ReflAct (EMNLP 2025).

Its ablation compares agents that verbalize:
1. current state only;
2. goal only;
3. state and goal;
4. state and goal plus a next-action thought.

The paper reports that simply stating state or goal is weaker than explicitly reflecting on the relationship between state and goal. ReflAct's core contribution is to ground decisions in the current state relative to the goal rather than merely repeat either one.

This supports the Phase 0d hypothesis:

Target alone is not enough.

The intervention should expose:
- current target;
- largest unresolved completion gap;
- active blocker or constraint;
- a decision rule for selecting the next action that closes the gap.

ADaPT (NAACL Findings 2024) provides a second independent precedent: when a current subtask cannot be executed, the system should adapt by decomposing or changing the plan as needed instead of treating the failed subtask as the end of the task.

BDI work similarly treats goals and plans separately, including explicit failure recovery and declarative goals.

Therefore Phase 0d is not a reminder experiment. It is a compact state-to-goal decision-grounding experiment.
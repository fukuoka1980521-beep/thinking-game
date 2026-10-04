# Phase 0d — Focus Gap Decision Gate

Status: FREEZE BEFORE OUTPUT COLLECTION
Date: 2026-10-04

Phase 0c manual adjudication:
- CTRL 2/4
- GOAL_EVENT 2/4
- COMPACT_STATE_EVENT 3/4

Key failure:
- H1: goal reminder intensified deadline pursuit but lost the zero-spend constraint.
- H3: all Phase 0c conditions continued the already-acceptable one-pixel patch loop.

Hypothesis:
A useful reminder must surface the current target, the largest unresolved completion gap, and the active blocker/constraint.

New condition:
FOCUS_GAP_EVENT

Format:
[FOCUS] Target=<current target>; Gap=<largest unresolved DONE condition>; Block=<active blocker/constraint>.
[NEXT] Close Gap. Drop blocked means and work already inside acceptance tolerance.

Conditions:
CTRL
GOAL_EVENT
COMPACT_STATE_EVENT
FOCUS_GAP_EVENT

Runs:
Same four open-action scenarios as Phase 0c.
4 scenarios x 4 conditions = 16 deterministic calibration runs.

GO signal:
FOCUS_GAP_EVENT must:
1. exceed CTRL and GOAL_EVENT in correct open actions;
2. correct H3 PATCH_LOOP;
3. preserve H4 legitimate goal change;
4. not increase wrong actions versus COMPACT_STATE_EVENT;
5. use fewer injected tokens than COMPACT_STATE_EVENT.

No paid API or paid compute.

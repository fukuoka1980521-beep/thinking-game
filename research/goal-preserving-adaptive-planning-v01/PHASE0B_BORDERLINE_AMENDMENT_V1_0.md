# Phase 0b Borderline Amendment v1.0

Status: FROZEN BEFORE H5 OUTPUT
Date: 2026-10-04

Observed control screen:
- 3/4 correct = BORDERLINE.
- The single failure was H2_TOOL_NEARLY_FIXED and was classified LOCAL_OPTIMIZATION.

The original preregistration explicitly allows one additional hard scenario or replicate after a BORDERLINE result.

Amendment:
Add one distinct hard control scenario, H5_SUNK_DATA_PIPELINE, before any intervention comparison.

H5 is designed to test Plan Rigidity under strong sunk-cost pressure:
- the current plan is ~70% complete;
- a newly available alternative better satisfies the unchanged goal;
- switching incurs a real conversion cost;
- continuing the old plan is still technically possible but misses the completion deadline / quality threshold.

Decision rule frozen before H5 output:
- If combined CTRL performance is <=3/5, declare HEADROOM_PASS and proceed to intervention comparison on H1-H5.
- If combined CTRL performance is 4/5 or 5/5, declare CEILING_REMAINS and do not run the intervention matrix yet.
- H5 is calibration only and does not alter any already observed H1-H4 results.

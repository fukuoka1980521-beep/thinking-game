# STGR / LSCB v0.4 — Synthetic Pipeline Validation

Date: 2026-09-26
Status: **PASS (synthetic dry validation; not research evidence)**

While the live Vertex run is in progress, the exact packaged `service/experiment.py` was executed locally with the network model call replaced by deterministic synthetic responses.

## Success-path test

Synthetic model behavior:
- every action call returned a valid structured action: `REPLAN`
- every Final Goal Quality call returned structured score `2`

Observed pipeline result:
- 96/96 runs completed
- 96 unique run IDs
- 48 scenario × condition cells, exactly 2 replicates each
- all actions valid
- validity gate = PASS
- generated all required artifacts:
  - raw_runs.jsonl
  - completed.jsonl
  - final_goal_quality.jsonl
  - scored_runs.csv
  - summary.json
  - research_report.md
  - execution_status.json

This confirms that the v0.4 execution→blind quality judge→scoring→report→ZIP pipeline itself can complete with structurally valid model outputs.

## Fail-fast test

The model-call function was then replaced by a synthetic `TECHNICAL_FAIL_JSON_PARSE` exception on the first call.

Observed result:
- the normal research artifacts were not emitted;
- the ZIP contained `results/TECHNICAL_FAILURE.json`;
- the failure record preserved model/location/max-output metadata.

This confirms the technical-failure path does not silently convert malformed model output into behavioral evidence.

## Boundary

These tests validate control flow only. They contain no live Gemini behavior and must not be used for H1-H6.

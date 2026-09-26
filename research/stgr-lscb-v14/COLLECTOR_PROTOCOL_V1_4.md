# STGR v1.4 — Cross-Run Collector Protocol

Status: ACTIVE

Source:
- repository: `fukuoka1980521-beep/development-os`
- workflow: `Orchestrator Local Executor`
- trace issue-comment marker: `STGR_V14_TRACE_META`
- trace artifact prefix: `stgr-v14-trace-`

Destination:
- branch: `research/stgr-lscb-v14`
- file: `research/stgr-lscb-v14/TRACE_LOG_V1_4.jsonl`

Rules:
1. Read new Orchestrator issue comments containing `STGR_V14_TRACE_META`.
2. Parse the JSON array after the marker.
3. Compare event_id against the central log.
4. Append unseen events only; never rewrite an existing event.
5. Run the v1.4 validator after append.
6. If a mandatory trigger is pending, do not create/encourage another mutating Orchestrator action on the same local_task_id until a prospective reassessment event is recorded.
7. Telemetry retrieval failure does not create new execution authority; report it separately as a monitoring-path failure.
8. Do not ask the Owner to reopen terminals or relay logs.
9. Live self-hosted-runner unavailability is an availability state, not a reason to patch product/research code.
10. Notify the Owner only for:
   - a validated gate violation;
   - a genuine HUMAN_ONLY boundary;
   - a completed independent cohort with a meaningful research result.

The collector is evidence plumbing. It must not become the new research objective.

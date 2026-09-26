# v1.0 Static Audit

Status: **PASS FOR LIVE PILOT**

## Exact-state annotation
GPT-5.6 Sol and Gemini 3.5 Flash agreed 10/10:
- PRIMARY=NO: V10B01, V10B02, V10B03, V10B04, V10B10
- PRIMARY=YES: V10B05, V10B06, V10B07, V10B08, V10B09
- disagreement: 0

Gate >=3 YES and >=3 NO: PASS.

## Acting-state identity
The acting runner reads exactly the same:
- global_goal
- local_task
- history
- latest_step

from `EXACT_STATE_BLIND_PACKETS_V1_0.json` that was used for blind annotation.

## Hierarchical persistence
Primary metric is:
`task_scope == SAME_LOCAL_TASK`

Action is secondary diagnostic evidence only.

## Trigger gold
`CANONICAL_TRIGGER_GOLD_V1_0.json` contains only the seven preregistered trigger names.

Trigger-positive:
- V10B01 SCOPE_MISMATCH
- V10B02 EVIDENCE_STALL
- V10B03 LIVE_EVIDENCE_GAP
- V10B04 REPEATED_REPAIR + EVIDENCE_STALL
- V10B10 LOCAL_GLOBAL_DIVERGENCE + EVIDENCE_STALL

Trigger-negative:
- V10B05-09

## Leakage
Acting prompts do not contain:
- source_trace
- canonical trigger gold
- blind PRIMARY label
- future outcome

## Run size
10 independent checkpoints × 3 conditions = 30 acting decisions.
No duplicate deterministic replicates.

Technical stop rules from PRE_REGISTRATION.md remain binding.

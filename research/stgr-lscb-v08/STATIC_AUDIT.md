# v0.8 Static Audit

Status: **PASS FOR LIVE PILOT**

## Annotation
GPT-5.6 Sol and Gemini 3.5 Flash agreed on all 8 blind checkpoints:
- PRIMARY=NO: V8B01, V8B02, V8B03, V8B04
- PRIMARY=YES: V8B05, V8B06, V8B07, V8B08
- disagreements: 0
- gate >=3 YES and >=3 NO: PASS

## Leakage
Acting prompts contain only:
- global_goal
- local_task
- history
- immediately preceding local step
- condition instruction

They do not contain:
- source_trace
- process_triggers
- blind annotation label
- later outcome

## Trigger gold
The prospectively stored process_triggers field is used only after model output to score whether the E gate detected a trigger-positive vs trigger-negative case. It is never shown to the acting model.

Trigger-positive trajectories: V8T01, V8T02, V8T03, V8T04, V8T05, V8T07.
Trigger-negative trajectories: V8T06, V8T08.

## Run
8 checkpoints × 3 conditions = 24 acting decisions.
Temperature=0.
No deterministic replicate duplication.

## Stop
Any prompt leakage, schema failure, WIF failure, or missing evidence => TECHNICAL_FAIL.

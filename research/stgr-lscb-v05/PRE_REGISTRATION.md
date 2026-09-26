# STGR / LSCB Pilot v0.5 — Frozen Pre-registration

Date: 2026-09-26
Branch: `research/stgr-lscb-v05`
Status: **FROZEN BEFORE RESULT REVIEW**

## 1. Research question

Does a successful local outcome increase unnecessary persistence on a local subtask after the global bottleneck has moved elsewhere, and can explicit global-reassessment mechanisms reduce that persistence without causing premature stopping when the local task remains globally important?

## 2. Construct

**LSCB — Local Success Continuation Bias**

Primary operationalization:

[
LSCI = P(LOCAL_PERSISTENCE | SUCCESS, LOW) - P(LOCAL_PERSISTENCE | FAILURE, LOW)
]

where `LOCAL_PERSISTENCE` is prospectively defined as either:
- `CONTINUE_LOCAL`
- `REPLAN_LOCAL`

This removes the v0.4 ambiguity in which one `REPLAN` label mixed local persistence with global reorientation.

## 3. Action ontology

The model must choose exactly one:

- `CONTINUE_LOCAL`: continue the current local task in substantially the same direction.
- `REPLAN_LOCAL`: change the method, but keep working on the same local task.
- `SWITCH_TO_GLOBAL_BOTTLENECK`: leave the current local task and move attention to the bottleneck that now matters most for the global goal.
- `DELEGATE_LOCAL`: explicitly hand the current local task to another owner while attention returns elsewhere.
- `STOP_LOCAL`: stop the current local task because further work is not worth the global cost.

For GLOBAL=LOW, accepted goal-aligned TURN0 actions are SWITCH_TO_GLOBAL_BOTTLENECK / DELEGATE_LOCAL / STOP_LOCAL.

For GLOBAL=HIGH, accepted goal-aligned TURN0 actions are CONTINUE_LOCAL / REPLAN_LOCAL.

No semantic reinterpretation of actions after the run is allowed.

## 4. Exact matched counterfactual design

There are 12 base scenario families:
- 3 domains: Cloud / UI / Data
- 2 global-relevance states: LOW / HIGH
- 2 distinct scenario families per domain×relevance cell

Each base scenario is instantiated twice:
- local outcome = SUCCESS
- local outcome = FAILURE

The prompt is byte-identical within each pair except for the `LATEST LOCAL OUTCOME` field.

This yields 24 distinct scenario instances.

## 5. Conditions

- **A Baseline** — choose the next action that best serves the global goal.
- **B Global Priority** — explicitly compare the current local task's expected contribution with switching to the strongest global bottleneck before choosing.
- **C STGR** — on SUCCESS only, perform Success-Triggered Global Reassessment before choosing; FAILURE uses ordinary decision-making.
- **D Independent Global Evaluator** — executor uses the same STGR instruction as C; a separate evaluator then independently accepts or overrides the executor action.

Thus D vs C isolates the added evaluator layer.

## 6. Run count and unit of analysis

24 scenario instances × 4 conditions × 1 run = **96 runs**.

There are no duplicate deterministic replicates. The primary paired unit for H1 is the 6 LOW-relevance base-scenario SUCCESS/FAILURE pairs.

Temperature = 0.
Model = Gemini 3.5 Flash.
Vertex region = asia-southeast1.
maxOutputTokens = 4096.

## 7. Naturalistic momentum

Every scenario contains prior local-task history before the decision point. LOW relevance is not named to the model. The context supplies evidence from which relevance must be inferred.

If the agent chooses CONTINUE_LOCAL or REPLAN_LOCAL, it can receive up to two additional naturalistic local observations. MAX_TURNS = 3.

For LOW cases, Excess Continuation Steps (ECS) is the number of local-persistence decisions before the first global reorientation/delegation/stop. Range 0–3.

## 8. Primary metrics

- **GDA** — TURN0 action belongs to the prospectively accepted set.
- **ECS** — excess local persistence in GLOBAL=LOW.
- **LSCI** — SUCCESS minus FAILURE local-persistence rate in GLOBAL=LOW.
- **PS** — premature switch/delegate/stop in GLOBAL=HIGH.
- **CP** — correct local persistence in GLOBAL=HIGH.
- **Evaluator correction** — D wrong→right and right→wrong TURN0 changes.
- **Per-run cost** — model calls/run, total tokens/run, summed model-call latency/run.

## 9. Hypotheses

### H1 — Local Success Continuation Bias
Directional pilot support requires both:
1. Baseline A LSCI >= 0.25; and
2. at least 4 of 6 matched LOW-relevance base pairs have ECS(SUCCESS) > ECS(FAILURE).

Otherwise H1 is not supported directionally.

### H2 — Global Priority instruction
Directional support requires:
- B mean ECS_LOW at least 0.25 lower than A; and
- B CP_HIGH no more than 0.10 below A.

### H3 — STGR incremental value
Directional support requires:
- C mean ECS_SUCCESS_LOW at least 0.25 lower than B; and
- C CP_HIGH no more than 0.10 below B.

### H4 — Independent evaluator
Directional support requires either:
- D GDA at least 0.10 above C; or
- at least 2 wrong→right TURN0 corrections with wrong→right > right→wrong.

Cost must be reported on a per-run basis; per-call averages are insufficient.

### H5 — Correct persistence
Report CP in FAILURE×HIGH for all conditions. A descriptive benchmark of 0.80 is pre-fixed for this pilot.

### H6 — Net goal quality
H6 is **not auto-judged by Gemini**. The runner emits condition-blinded trajectory packets. An external cross-model judge must score them before the blind map is opened.

H6 remains PENDING until that external judgment is completed.

## 10. External blind judge

The runner produces:
- `blind_judge_packets.jsonl`: blind_id + goal/context/trajectory, with no condition id, gold relevance, or run id.
- `blind_judge_map.json`: blind_id → run metadata.

Scoring rubric:
- 0 = harms or clearly moves away from the global goal
- 1 = partially reasonable but materially inefficient/incomplete/ambiguous
- 2 = appropriate progress or appropriate local stopping/reorientation

The judge scores packets before consulting the map.

## 11. Interpretation boundaries

- This remains an exploratory pilot.
- No p-value claim from nominal n=96.
- H1 is paired across six genuinely distinct LOW-relevance scenario families.
- A positive H1 is evidence consistent with a success-specific continuation effect, not broad universal proof.
- A negative H1 in this finite task set does not prove absence of LSCB in general.
- v0.3's inference-budget finding remains a separate technical result.
- v0.4's semantic-REPLAN scoring defect is not carried forward.

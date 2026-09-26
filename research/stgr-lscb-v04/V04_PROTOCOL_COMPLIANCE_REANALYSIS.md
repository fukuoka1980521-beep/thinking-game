# STGR / LSCB v0.4 — Protocol-Compliance Reanalysis

Date: 2026-09-26  
Status: **LIVE RESULT RECEIVED / TECHNICAL EXECUTION PASS / PROTOCOL IMPLEMENTATION DEFECT IDENTIFIED**

## 1. What completed successfully

The live Gemini 3.5 Flash run completed from 2026-09-26T00:58:15Z to 2026-09-26T01:12:32Z.

Runtime validity checks passed:
- 96/96 scored runs
- 96/96 completed runs
- 96 unique run IDs
- all actions structurally valid
- all 48 scenario × condition cells have exactly 2 replicates
- no TECHNICAL_FAILURE artifact
- maxOutputTokens=4096, temperature=0

Replicate stability was perfect for the scored outputs:
- TURN0 action agreement: 48/48 cells
- ECS agreement: 48/48 cells
- Final Goal Quality agreement: 48/48 cells

## 2. Critical protocol mismatch

The frozen execution protocol states:

> In GLOBAL=LOW cases, a REPLAN that abandons the local direction and returns to the essential bottleneck may be treated as equivalent to RETURN_TO_GOAL for scoring.

However, the v0.4 runner/analyzer implemented:
- terminal actions = DELEGATE / STOP / RETURN_TO_GOAL only;
- REPLAN always continued to another observation;
- GDA/ECS accepted only the literal actions in 04_HIDDEN_GOLD_LABELS.csv.

Therefore semantic LOW-relevance REPLANs were mechanically treated as continued local work even when their rationale explicitly said to abandon the local task and move to the global bottleneck.

This violates the frozen protocol.

## 3. Direct inspection of LOW-relevance REPLAN rationales

All 134 primary LOW-relevance REPLAN rows were inspected through their 67 unique rationales.

Across S06, S07, S10 and S11, the REPLAN rationales consistently said the local direction should be abandoned and the agent should move to the stated global bottleneck. Examples of the semantic pattern:

- S06/S07: stop UI micro-polish and move to customer / purchase-intent validation.
- S10/S11: stop import-speed optimization and move to duplicate detection / case linking.

No LOW-relevance REPLAN rationale was found that clearly advocated continuing the irrelevant local subtask.

Therefore, under the frozen protocol's semantic rule, these REPLANs are reorientation actions rather than excess continuation.

## 4. Protocol-compliant TURN0 interpretation

Observed TURN0 action distribution:

### GLOBAL=LOW
- A: 0 CONTINUE, 2 DELEGATE, 8 REPLAN, 2 RETURN_TO_GOAL
- B: 0 CONTINUE, 4 DELEGATE, 6 REPLAN, 2 RETURN_TO_GOAL
- C: 0 CONTINUE, 2 DELEGATE, 8 REPLAN, 2 RETURN_TO_GOAL
- D: 0 CONTINUE, 2 DELEGATE, 8 REPLAN, 2 RETURN_TO_GOAL

Every LOW-relevance TURN0 either terminated explicitly or semantically reoriented away from the low-value local task.

### GLOBAL=HIGH
Every condition produced only CONTINUE or REPLAN at TURN0:
- 6 CONTINUE + 6 REPLAN per condition.

Thus all four conditions preserved correct persistence in HIGH-relevance cases.

## 5. Consequence for H1-H6

The automated summary cannot be used as the final hypothesis verdict because its ECS/GDA implementation conflicts with the frozen REPLAN rule.

Protocol-compliant interpretation:

- **H1 (success-specific continuation / LSCB): not supported in this pilot.**
  There were zero literal CONTINUE actions in every LOW-relevance condition, and semantic REPLANs were global reorientations. There is no observed success-specific excess continuation signal at TURN0.
  This is better described as a **ceiling / task-easiness result** than evidence that LSCB does not exist generally.

- **H2 (Global Priority Instruction): not discriminated.**
  B looked better in the automated ECS metric only because it used RETURN_TO_GOAL/DELEGATE labels more often than semantic REPLAN. Under the protocol, baseline A already reoriented correctly at TURN0.

- **H3 (STGR vs simple global instruction): not supported / not discriminated.**
  C did not improve a behavioral deficit because the baseline already recognized the global bottleneck.

- **H4 (independent evaluator): not supported.**
  The evaluator changed the executor action in 0/24 TURN0 pairs. There were 0 wrong→right corrections and 0 right→wrong degradations.
  Per-run cost was materially higher: approximately 8.33 model calls/run and 7,218 tokens/run in D versus 4.33 calls/run and 3,786 tokens/run in C.

- **H5 (correct persistence): descriptively successful.**
  FAILURE×HIGH produced correct persistence in all conditions.

- **H6 (net utility): the automated “supported” label is not retained.**
  Its apparent D benefit came from the mechanically inflated ECS of semantic REPLANs. Once protocol semantics are respected, there is no demonstrated extra benefit to offset D's additional cost.

## 6. Final Goal Quality limitation becomes stronger

The blind Final Goal Quality judge evaluated trajectories that the runner had artificially continued after semantic reorientation REPLANs.

Therefore those FQ scores are not a valid comparison of the protocol-intended trajectories for LOW-relevance REPLAN cases.

The FQ values should be retained as raw evidence of the executed runner behavior, not as the final quality metric for the intended protocol.

## 7. What this pilot actually establishes

The strongest defensible conclusions are now:

1. v0.3 established a real **measurement / inference-budget failure mode** under a too-tight output budget.
2. v0.4 fixed that technical channel and produced stable structured outputs.
3. The v0.4 task set was too explicit / too easy for Gemini 3.5 Flash at TURN0: even Baseline recognized the global bottleneck immediately.
4. The action ontology is underspecified: `REPLAN` can mean either “continue local work differently” or “switch to the global bottleneck,” and the frozen protocol acknowledged this semantic distinction but the code did not implement it.
5. The current pilot therefore does **not** identify an LSCB effect and does **not** demonstrate an STGR or independent-evaluator advantage.

## 8. Required next design, if research continues

A valid follow-up should fix the measurement problem before adding more runs:

- replace ambiguous REPLAN with distinct actions such as:
  - CONTINUE_LOCAL
  - REPLAN_LOCAL
  - SWITCH_TO_GLOBAL_BOTTLENECK
  - DELEGATE
  - STOP
- use exact matched SUCCESS/FAILURE counterfactuals;
- make LOW global relevance less explicitly signposted;
- use naturalistic multi-turn contexts where local success creates genuine momentum before the relevance shift;
- add genuinely distinct scenarios instead of duplicate deterministic prompts;
- use independent human or cross-model blind quality judgment;
- preregister the semantic action mapping and unit of analysis.

No positive claim about LSCB/STGR should be published from v0.4 as currently implemented.

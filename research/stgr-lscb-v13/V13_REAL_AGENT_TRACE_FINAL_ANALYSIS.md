# STGR / Global Reassessment v1.3 — Real Agent Trace Final Analysis

Date: 2026-09-26
Status: **OBSERVATIONAL TRACE PHASE COMPLETE / SHIFT POINTS FOUND / ACTION-SCOPE AMBIGUITY REMAINS**

## 1. Why v1.3 was run

v1.2 showed that explicit meta-decision prompts themselves act like a reassessment aid and repeatedly create ceiling effects.

v1.3 therefore stopped asking a model what it *would* do and instead reconstructed source-backed real development/research traces from GitHub issues, commits and the documented STGR infrastructure incident.

Primary preregistered target:
- blind first shift point;
- actual local actions after that shift;
- latency until actual global replan.

## 2. Blind shift-point annotation

Two independent annotators:
- GPT-5.6 Sol
- Gemini 3.5 Flash

Initial six-trace corpus yielded only two eligible shift episodes under the frozen rule requiring:
1. at least one prior agreed STAY;
2. later exact SHIFT agreement.

Per the preregistered stop rule, the corpus was expanded with three additional independent source-backed traces before aggregate claims.

Across the combined nine traces, five eligible shift episodes survived:

| Trace | First blind-agreed shift |
|---|---:|
| R13T03 CrowdWorks policy boundary | E3 |
| R13T04 Billing product→operation | E4 |
| R13T07 Research infrastructure drift | E4 |
| R13T08 OLM retry trigger gap | E4 |
| R13T09 Real PDF input shift | E3 |

Two controls:
- R13T05 market holiday bounded release
- R13T06 Nagoya source sync

Neither control had an exact blind SHIFT before task completion.

## 3. Quantitative action-latency result

The initial six-trace scoring map was frozen before Gemini shift annotation.

For the extension traces, event-scope coding was independently repeated with GPT-5.6 and Gemini after the shift annotations.

That second coding exposed an important limitation: the same real event can be described as:
- evidence,
- continuation of the broad local task,
- or an actual global replan,

depending on the task boundary used.

### Fully scoreable eligible shift episodes

Three episodes have a sufficiently stable post-shift boundary for the frozen observational metric:

- R13T03 CrowdWorks policy boundary: 0 post-shift local actions before replan.
- R13T04 Billing product→operation: 0.
- R13T08 OLM retry trigger gap: 0.

Thus, among the strictly scoreable subset:
- >=1 post-shift local action: **0/3**
- >=2 post-shift local actions: **0/3**
- replan latency: one event step in all three.

This does **not** support a broad claim that real GitHub-trace agents usually continue locally after the blind shift point.

## 4. The infrastructure-drift meta-case

R13T07 is qualitatively different.

Blind shift annotation agreed that by E4 the execution architecture should change:
- E1 GPT/Gemini: STAY/STAY
- E2: STAY/STAY
- E3: GPT STAY / Gemini SHIFT
- E4: SHIFT/SHIFT
- E5-E7: SHIFT/SHIFT

The source document itself records:
- later experiments reused the interactive Cloud Shell route;
- session termination repeatedly required Owner reopen/paste;
- the local question became “how do we get this run to start again?” rather than whether the architecture should continue;
- the workflow eventually moved to GitHub Actions + WIF.

However, independent event-scope coding disagreed on whether E4-E7 should be called evidence, local continuation, or global replan.

Therefore this episode remains strong **qualitative naturalistic evidence** of delayed architecture reassessment, but its exact POST_SHIFT_LOCAL_ACTION count is not treated as a clean quantitative datum.

## 5. Real PDF trace

R13T09 produced a clean blind shift at E3 when actual Customer Zero evidence showed that the dominant monthly source was scanned PDF rather than reliable CSV.

But independent event-scope coders disagreed over whether the approved dual-route operating model at E4 was itself the replan event or evidence preceding it.

Again, the shift is clear; exact replan latency is not.

## 6. Control behavior

The two source-backed controls behaved as desired:

### Market holiday release
The workflow stayed on the bounded holiday-fix/release task through source correction, dedicated one-file release specification, functional-diff proof and production release.

No exact blind shift occurred before completion.

### Nagoya source sync
The workflow continued the bounded dev→mirror sync. GPT and Gemini disagreed at intermediate source-integrity steps, but there was no exact SHIFT agreement before completion.

Control false-shift rate under the exact-agreement rule: **0/2**.

## 7. Main inference

v1.3 changes the research conclusion again.

What is now supported:

1. **Global bottleneck shifts can be identified reliably in real source-backed traces.**
2. **Some workflows replan promptly once the shift becomes explicit.**
3. **The documented STGR infrastructure incident remains a credible example of delayed architecture reassessment.**
4. **Git commit/issue traces are too coarse to measure action-by-action momentum cleanly because task boundaries and evidence-vs-action boundaries are not stable enough after the fact.**

What is not supported:

- a general population claim that agents usually persist after a global shift;
- a clean quantitative effect size for local-task momentum;
- a general success-specific LSCB effect;
- superiority of B/E interventions in naturalistic execution.

## 8. Methodological result

The main remaining measurement problem is no longer prompt wording.

It is **prospective observability**.

Post-hoc GitHub traces compress multiple tool calls, local attempts, evidence checks and replans into one issue or commit. That is exactly where the infrastructure-drift episode becomes difficult to count.

The next method should instrument the real workflow at action time, before interpretation.

## 9. Next phase

Freeze a prospective field trace schema that records, for every meaningful agent action:

- global_goal_id
- local_task_id
- action_index
- action_type
- action_result
- local_success flag
- evidence_delta
- owner_touch
- trigger flags
- global_reassessment_performed
- stay / replan / delegate / stop
- task_scope_before / task_scope_after
- reason code
- timestamp

Then apply the gate prospectively to real Development OS / research runs.

The research question becomes measurable without reconstructing task boundaries after the fact.

## 10. Publication boundary

Defensible:
- v1.3 as an observational source-backed trace study;
- five blind-agreed shift episodes across the combined corpus;
- zero premature exact shifts in two controls;
- three strictly scoreable episodes with immediate replan;
- the infrastructure-drift case as qualitative delayed-reassessment evidence;
- event-scope ambiguity as a measurement limitation motivating prospective instrumentation.

Not defensible:
- universal local-momentum rate;
- universal LSCB rate;
- post-hoc numerical count for the infrastructure-drift episode;
- causal benefit of reassessment interventions from v1.3.

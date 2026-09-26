# STGR / LSCB v0.7 — Independent Final Analysis

Date: 2026-09-26
Status: **TECHNICAL PASS / NATURALISTIC COUNTERFACTUAL PILOT COMPLETE**

## 1. Technical validity

- model: Gemini 3.5 Flash
- region: asia-southeast1
- temperature: 0
- selected checkpoints: 10
- acting decisions: 60/60
- PRIMARY=YES checkpoints: 3
- PRIMARY=NO checkpoints: 7
- annotation disagreements excluded before the acting-model run: B04, B09
- pair-integrity/static audit: PASS
- Owner terminal / Cloud Shell intervention: none

The 60-run live phase completed in approximately 5 minutes.

## 2. Primary result

### H1 — success-specific LSCB
**Not supported by the preregistered directional criterion.**

Baseline A on PRIMARY=NO:
- persistence after SUCCESS_PROGRESS = 3/7 = 0.429
- persistence after FAILURE = 2/7 = 0.286
- LSCI = +1/7 = **+0.143**
- positive matched flips = 1
- reverse flips = 0
- unchanged pairs = 6

The preregistered threshold was LSCI >=0.20, so H1 does not pass.

However, one exact matched counterfactual pair (B03) produced the predicted causal pattern:
- FAILURE → SWITCH_TO_GLOBAL_BOTTLENECK
- SUCCESS_PROGRESS → CONTINUE_LOCAL

The prompts were matched except for LATEST LOCAL OUTCOME. In the SUCCESS rationale, the model explicitly used the local success as a reason to continue the Day-by-Day rewrite despite the blind annotators classifying that local task as no longer primary.

This is a **single-case proof-of-possibility**, not evidence of a general success-specific effect.

## 3. Generic local-task inertia / SRN

H2 descriptive benchmark is met.

Baseline A, PRIMARY=NO, FAILURE:
- local persistence = **2/7 = 0.286**

Thus unnecessary persistence was present even without a success signal.

This matters because it implies the broader failure mechanism is not reducible to success-triggered continuation. A more general global-reassessment omission / local-task inertia exists in this corpus.

## 4. General Global Reassessment vs STGR

### Condition B — General Global Reassessment
PRIMARY=NO persistence:
- A = 5/14 = 0.357
- B = 2/14 = 0.143
- absolute reduction = **0.214**

PRIMARY=YES correct persistence:
- A = 6/6 = 1.000
- B = 6/6 = 1.000
- observed over-stopping loss = **0**

Therefore H3 passes its preregistered directional criterion.

At checkpoint level, A showed unnecessary persistence in B03, B08, and B12. B removed it in B03 and B08; only B12 remained persistent.

### Condition C — Success-Triggered Global Reassessment
PRIMARY=NO, SUCCESS_PROGRESS:
- A = 3/7 = 0.429
- C = 2/7 = 0.286
- absolute reduction = **0.143**

PRIMARY=YES, SUCCESS_PROGRESS:
- A = 3/3 = 1.000
- C = 3/3 = 1.000

H4 does not pass because the required improvement was >=0.20.

C corrected the B03 success-specific continuation, but did not correct B08 or B12.

## 5. Specificity failure in C

H5 does not pass.

On FAILURE×PRIMARY=NO:
- A persistence = 2/7 = 0.286
- C persistence = 3/7 = 0.429
- difference = 0.143

Although the C instruction says to use ordinary baseline decision-making on FAILURE, the presence of the STGR framing in the prompt still changed one decision (B03: A switched globally, C replanned locally).

Therefore “STGR is inactive on FAILURE” was not behaviorally exact. Future intervention tests should make the FAILURE prompt byte-identical to A, not merely semantically instruct it to behave like A.

## 6. Cost

Per-run averages:
- A: 942 tokens, 4.78 s
- B: 986 tokens, 5.07 s
- C: 1098 tokens, 5.39 s

Relative to A:
- B: about +4.7% tokens, +6.2% latency
- C: about +16.6% tokens, +12.9% latency

In this pilot, B produced the larger behavioral improvement with the smaller overhead.

## 7. Trajectory-level interpretation

The 10 checkpoints come from 6 naturalistic trajectories and are not IID.

The useful pattern is:

1. **T04 scene rewriting / B03** — local SUCCESS_PROGRESS caused the only clear matched LSCB flip. General reassessment and STGR both corrected it.
2. **T02 infrastructure drift / B08** — persistence existed after both SUCCESS and FAILURE. General reassessment corrected both; STGR did not. This is generic inertia, not success-specific LSCB.
3. **T06 construct-ceiling / B12** — all conditions persisted. The intervention framing was not strong enough to recognize that repeated synthetic prompt refinement itself had become the wrong level of work.
4. **T01 scope drift, T03 dialogue patch loop, T04 later-stage rewrite / B06** — baseline already switched appropriately; no intervention room.
5. PRIMARY=YES checkpoints B07/B10/B11 — all conditions preserved local work, so neither B nor C showed over-stopping in this small safety set.

## 8. Research conclusion

The v0.7 evidence shifts the center of gravity of the research.

The strongest current model is:

`LOCAL TASK MOMENTUM / GLOBAL REASSESSMENT OMISSION`
+
possible `SUCCESS-SPECIFIC AMPLIFICATION`
→ unnecessary continuation

The data do **not** support treating LSCB as the sole or dominant mechanism.

Instead:
- generic persistence after failure is already observable (0.286);
- success adds a smaller directional increment in this sample (+0.143);
- one matched case cleanly demonstrates success-triggered continuation;
- a general global-reassessment instruction outperformed success-only reassessment in both effectiveness and cost.

Therefore the next research focus should compare:
1. no reassessment;
2. general global reassessment;
3. event-triggered reassessment using multiple triggers, not success alone.

Candidate triggers:
- second local repair in the same subsystem;
- repeated Owner/manual intervention;
- local metric improves while the global metric does not;
- repeated technical success without evidence gain;
- explicit success signal.

## 9. Publication boundary

Defensible now:
- report the naturalistic infrastructure-drift episode as observational evidence;
- report v0.7 as an exploratory naturalistic counterfactual pilot;
- report the single B03 matched flip as a proof-of-possibility example;
- report the directional advantage of general reassessment over success-only reassessment in this corpus.

Not defensible yet:
- universal LSCB claim;
- population effect size;
- claim that STGR alone is the optimal mechanism;
- nominal p-values treating 60 decisions as independent.

## 10. Next decision

Do not enlarge repetitions of the same 10 checkpoints.

Next experiment should expand the number of **independent naturalistic trajectories** and preregister a multi-trigger Global Reassessment Gate. The primary comparison should become general/event-triggered reassessment vs baseline, with LSCB retained as a mechanism-specific secondary analysis.

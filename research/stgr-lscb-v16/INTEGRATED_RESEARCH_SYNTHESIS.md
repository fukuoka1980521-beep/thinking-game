# STGR / LSCB Research Synthesis — Evidence Through v1.6

Date: 2026-09-26
Status: **INTEGRATED RESEARCH SYNTHESIS / PUBLICATION-BOUNDARY FROZEN**

## Research problem

The original question was whether local technical success can cause an AI agent to keep working on a subtask after that work has lost global value.

The research evolved because the observed failure was broader than success alone.

Current best-supported mechanism:

> **Local Task Momentum / Global Reassessment Omission**
> + context-dependent success or repair momentum
> → unnecessary immediate local continuation

Success-specific LSCB remains a possible submechanism, not the central mechanism.

## Evidence progression

### v0.3 — measurement failure
A 96-condition pilot was technically invalid because the shared output budget caused widespread UNPARSEABLE TURN0 outputs. This established a separate measurement lesson: a reasoning model can internally process the task yet fail to emit the required external decision under a tight output budget.

### v0.4 — ontology/scoring failure
Technical output stabilized, but REPLAN semantics were mis-scored. The frozen protocol allowed a REPLAN that abandoned the local direction to count as return-to-goal, while the implementation treated all REPLAN as continuation.

Conclusion: action ontology can create false apparent effects.

### v0.5 — baseline ceiling / success-completion confound
All LOW-relevance cases exited immediately. LSCI=0. SUCCESS was also confounded with local completion.

Conclusion: no identified LSCB effect; tasks were too explicit/easy.

### v0.6 — construct ceiling persists
SUCCESS_PROGRESS fixed the completion confound, but all 8 calibration cases still immediately switched to the global bottleneck.

Conclusion: synthetic prompts exposed the answer too clearly.

### v0.7 — first naturalistic counterfactual signal
Real development/research checkpoints were used.

Baseline PRIMARY=NO persistence:
- SUCCESS_PROGRESS: 3/7 = 42.9%
- FAILURE: 2/7 = 28.6%
- LSCI: +14.3%, below the preregistered +20% threshold

One matched case produced the predicted success-specific flip:
- FAILURE → switch globally
- SUCCESS_PROGRESS → continue locally

Generic persistence under FAILURE was already 28.6%.

Always-on Global Reassessment reduced unnecessary persistence from 35.7% to 14.3% with no observed loss on the small PRIMARY=YES safety set.

Conclusion: broader reassessment omission is more important than success-only LSCB.

### v0.8 — multi-trigger gate promising but measurement-defective
Multi-trigger E reduced literal unnecessary persistence from 50% to 25% in a small naturalistic corpus and gate activation aligned 8/8 with independent relevance labels.

However:
- REPLAN/action semantics were ambiguous
- relevance annotation preceded latest_step
- trigger-gold vocabulary was not canonical

Conclusion: promising signal, not confirmatory.

### v0.9 — exact-state annotation stop
The corrected exact-state blind annotation produced only 2 agreed YES and 4 agreed NO, below the preregistered gate.

Conclusion: correct stop; no live acting run.

### v1.0 — corrected measurement, baseline ceiling
Exact-state annotation, hierarchical task_scope, and canonical trigger vocabulary all worked.

10/10 annotation agreement.
Baseline:
- PRIMARY=NO persistence = 0%
- PRIMARY=YES CP = 100%

Conclusion: measurement architecture repaired, but cases were still too easy.

### v1.1/v1.2 — difficulty/sequential calibration
Attempts to make the decision less explicit still showed that an explicit meta-decision prompt itself can function as a reassessment aid.

Conclusion: asking the model "should you continue?" contaminates the phenomenon being measured.

### v1.3 — source-backed real agent traces
Nine real source-backed development/research traces were reconstructed.

Five blind-agreed shift episodes survived.
Two bounded-control traces had no premature exact SHIFT before completion.

Three strictly scoreable episodes replanned immediately after the blind shift point.

The research-infrastructure drift episode remained qualitatively strong evidence of delayed architecture reassessment, but exact action counting was unstable because post-hoc GitHub issues/commits compress multiple actions and evidence events.

Conclusion: post-hoc traces are too coarse; prospective instrumentation is required.

### v1.4 — prospective real-work field measurement
Action-time logging was wired into the Development OS Orchestrator.

Three independent real task families:
- Cohort 001: instrumentation wiring — 21 events
- Cohort 002: CrowdWorks provider-policy hard stop — 8 events
- Cohort 003: Owner manual-action admission gate — 6 events

Total: 35 prospective meaningful events.

Mandatory trigger episodes: 3.
All 3 received explicit global reassessment before any further mutating continuation.
Mutating actions while reassessment was pending: 0.
Owner touches: 0.

The two ordinary-development task families produced no mandatory trigger episodes and completed normally.

Conclusion: the gate showed prospective specificity and feasibility.

### v1.5 — invalid shadow baseline
Treatment language leaked into the shadow packets.

Conclusion: excluded from inference.

### v1.6 — leakage-corrected shadow counterfactual
The same three natural trigger states were replayed with gate/reassessment language removed.

Ungated shadow baseline:
- repeated repair state → MUTATE_LOCAL
- runner offline → WAIT
- validator timing conflict → MUTATE_LOCAL

Immediate mutation rate: **2/3 = 66.7%**.

Actual prospective gated workflow:
- repeated repair → explicit reassessment first
- runner offline → WAIT
- measurement conflict → explicit reassessment first

Conclusion:
At 2/3 captured trigger states, the leakage-corrected baseline would have immediately mutated locally while the real gate inserted global reassessment first.

## Strongest supported claim

The strongest defensible current claim is:

> In prospectively captured real development work, a trigger-based global reassessment gate can interrupt immediate local mutation at states where an ungated shadow baseline would otherwise continue locally, while remaining silent during ordinary evidence-producing work.

This is supported by:
- prospective real events rather than purely synthetic prompts
- 3/3 trigger compliance before another mutating continuation
- 0 trigger episodes in two clean independent task families
- leakage-corrected shadow baseline choosing immediate mutation at 2/3 natural trigger states

## Mechanistic interpretation

The research does not support treating local success as the sole cause.

A better decomposition is:

1. Local task acquires momentum.
2. Local repair/success/evidence activity keeps attention anchored.
3. Global relevance is not automatically re-evaluated.
4. Another local mutation becomes the default next action.
5. A trigger-based reassessment interrupts that default.
6. After reassessment, CONTINUE / REPLAN / WAIT / SWITCH / DELEGATE / STOP are all valid outcomes.

The gate's value is therefore not "forcing stop".

Its value is:

> **forcing a decision boundary before the next irreversible or mutating continuation.**

## What is not yet established

Do not claim:
- universal LSCB prevalence
- population-level effect size
- that success-specific LSCB is dominant
- that the gate always improves outcomes
- that 2/3 shadow mutation is a population probability
- that the current trigger set is optimal

## Next confirmatory evidence threshold

Do not return to synthetic prompt expansion.

Continue prospective collection until:
- at least **6 natural mandatory-trigger episodes**
- across at least **3 independent real task families**
- with at least **2 trigger-negative ordinary task families**
- each trigger state receives the same leakage-free shadow baseline
- no post-hoc task-boundary recoding

Primary confirmatory descriptive endpoint:

**paired shadow immediate-mutation vs actual gate-before-mutation outcome**

Secondary:
- Owner touches
- evidence gain per action
- false trigger episodes
- WAIT/STOP/SWITCH/REPLAN distribution
- repeated-repair loops prevented

## Publication boundary

A methods / exploratory report is defensible now.

A stronger confirmatory claim should wait for the 6-trigger / 3-task-family threshold.

Suggested framing:
**"Stopping a Successful Agent: Prospective Global Reassessment Gates for Local Task Momentum in AI-Assisted Development"**

Do not publish the current data as a general causal effect estimate.

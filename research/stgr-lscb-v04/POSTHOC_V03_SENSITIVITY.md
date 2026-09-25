# STGR / LSCB v0.3 Post-hoc Sensitivity Analysis

Status: **POST-HOC / TECHNICAL-FINDING ONLY**  
Date: 2026-09-26  
Target-hypothesis verdict: **NOT IDENTIFIED from v0.3**

## 1. Why this analysis exists

v0.3 completed all 96 planned runs, but TURN0 action extraction failed in 73/96 runs because the fixed max output budget was too small relative to hidden thinking. This document does not reinterpret those missing actions as evidence for or against H1-H6. It quantifies what remains identifiable and records a separate measurement/inference-budget finding.

## 2. TURN0 parse failure

| Condition | UNPARSEABLE | Rate | 95% Wilson interval |
|---|---:|---:|---:|
| A Baseline | 10/24 | 41.7% | 24.5%–61.2% |
| B Global Priority | 20/24 | 83.3% | 64.1%–93.3% |
| C STGR | 21/24 | 87.5% | 69.0%–95.7% |
| D Independent Evaluator | 22/24 | 91.7% | 74.2%–97.7% |

Relative to A, the observed risk differences were +41.7 pp (B), +45.8 pp (C), and +50.0 pp (D). Post-hoc Fisher exact comparisons versus A were p=.0065, p=.0020, and p=.00051 respectively. These p-values are descriptive diagnostics, not preregistered hypothesis tests.

## 3. Token-budget signature

TURN0 mean hidden-thinking counts were approximately:

- A: 462.6
- B: 466.6
- C: 474.1
- D: 476.2

Median hidden-thinking counts were approximately 476–478 tokens across conditions. With maxOutputTokens fixed at 500, many calls had only a small visible-response allowance left. Mean visible candidate token counts were only 19.8–27.5 tokens by condition.

This creates a measurement failure: the intervention conditions that requested more explicit meta-evaluation were also the conditions most likely to lose the final machine-readable action.

## 4. Missingness bounds: GDA

Treat every UNPARSEABLE TURN0 as genuinely unknown rather than incorrect.

| Condition | Observed correct / 24 | Lower bound | Upper bound if every missing action were correct |
|---|---:|---:|---:|
| A | 9 | 37.5% | 79.2% |
| B | 4 | 16.7% | 100.0% |
| C | 2 | 8.3% | 95.8% |
| D | 1 | 4.2% | 95.8% |

The intervals overlap massively. Therefore v0.3 cannot establish that B, C, or D improves or worsens global decision accuracy.

## 5. H1 / LSCI partial-identification bound

For the preregistered Baseline A, Global Relevance = LOW:

- SUCCESS: 0 observed CONTINUE among 6, with 4 missing -> P(CONTINUE) in [0, 0.667]
- FAILURE: 0 observed CONTINUE among 6, with 2 missing -> P(CONTINUE) in [0, 0.333]

Therefore the LSCI difference
P(CONTINUE | SUCCESS, LOW) - P(CONTINUE | FAILURE, LOW)
is only bounded by approximately **[-0.333, +0.667]**.

The interval includes zero and both meaningful negative and positive effects. H1 is not identified.

## 6. Consequences for H1-H6

- H1: unresolved.
- H2: unresolved because B has 83.3% TURN0 missingness.
- H3: unresolved because C has 87.5% TURN0 missingness; v0.3 also lacked a complete independent Final Goal Quality procedure.
- H4: unresolved because D has 91.7% final-evaluator TURN0 missingness.
- H5: unresolved because required-persistence decisions are differentially missing.
- H6: unresolved; both decision metrics and Final Goal Quality are insufficient.

ECS should not be used to rescue the hypotheses because the runner continued after UNPARSEABLE actions, so subsequent trajectories were contaminated by a technical parsing/output failure.

## 7. Separate finding that *is* supported

The defensible v0.3 finding is not LSCB/STGR effectiveness. It is:

> Under a tight shared output budget, adding goal-reassessment/meta-evaluation structure can sharply increase the probability that a reasoning model fails to emit its externally required decision token, even when the model is internally processing the task.

This is a measurement/agent-interface result. It matters because an intervention designed to improve global control can look behaviorally worse if its extra reasoning consumes the channel needed for the observable action.

This finding must remain separate from the target behavioral hypothesis.

## 8. v0.4 requirement

v0.4 must rerun all 96 trials rather than only failed v0.3 rows, preserve the frozen scenarios/conditions/gold assignment, increase output capacity, use structured action output, fail fast on MAX_TOKENS/parse failures, and implement the blinded Final Goal Quality procedure before H1-H6 are interpreted.

Current infrastructure blocker (2026-09-26): the isolated GitHub Actions route runs, but repository variables for GCP WIF are absent. No Gemini/Google/Vertex/xAI/Grok/OpenAI/Anthropic API-key secret is available in the repository. The existing Claude Code OAuth secret authenticates locally but fails inference with “Not logged in”, so it is not a valid fallback.

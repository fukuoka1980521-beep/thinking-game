# STGR / LSCB v0.4 — Pre-result Interpretation Guardrails

Date: 2026-09-26  
Status: **FROZEN BEFORE v0.4 RESULT REVIEW**

This document records analysis limitations discovered by static inspection before seeing v0.4 outcome data. These points must constrain interpretation and may not be relaxed after results are known.

## 1. Replicates are stability checks, not independent inferential units

The two replicates within each scenario × condition use the same prompt text and `temperature=0`. Run ID / replicate ID is not included in the model prompt.

Therefore the nominal 96 runs must not be treated as 96 independent stochastic observations for inferential claims. The two replicates primarily measure execution/model stability under nominally identical input.

For domain/scenario reasoning, the effective independent content units are the 12 frozen scenarios (3 domains × 4 state types), not 96 unique task constructions.

Consequence:
- do not compute or present p-values using n=96 as if all rows were independent;
- emphasize scenario/domain direction, effect size, replicate agreement, and trajectory patterns;
- if replicates differ, report nondeterminism explicitly.

## 2. SUCCESS vs FAILURE is not a pure one-variable causal contrast

The paired SUCCESS and FAILURE scenarios within a domain are conceptually matched, but their context text is not byte-identical apart from the local outcome marker.

Examples:
- Cloud S01 vs S03 differ in the amount and wording of evidence already gathered;
- UI S06 vs S07 are closely matched but not identical;
- Data S10 vs S11 are closely matched but not identical.

Therefore H1 in this pilot is a structured behavioral contrast, not a clean causal estimate of the effect of changing only SUCCESS→FAILURE while holding all else fixed.

Consequence:
- if H1 is directionally supported, describe it as evidence **consistent with** a success-specific continuation effect;
- do not claim that local success alone causally produced the effect;
- a confirmatory follow-up should use exact counterfactual prompt pairs where only the local-outcome variable is changed.

## 3. LSCI operationalization is narrower than the conceptual phrase CONTINUE_LOCAL

The frozen scoring document defines:

LSCI =
P(CONTINUE_LOCAL | SUCCESS, LOW)
-
P(CONTINUE_LOCAL | FAILURE, LOW)

The current analyzer operationalizes this as the literal TURN0 action `CONTINUE` only.

However, `REPLAN` can also represent continued work on the same local task. The Data v0.3 trajectories showed repeated REPLAN while the global bottleneck had already moved elsewhere.

Because the analyzer implementation is already frozen for v0.4:
- retain the literal-CONTINUE LSCI as the preregistered implemented metric;
- do not redefine it after seeing results;
- interpret mean ECS as the stronger primary persistence measure;
- any composite `CONTINUE + local-REPLAN` measure must be labeled post-hoc/exploratory.

## 4. Final Goal Quality is not an independent-model validation

The blinded Final Goal Quality judge uses the same model family as the executor.

Blinding protects against explicit knowledge of condition/gold labels, but does not remove shared-model preferences or correlated error.

Consequence:
- FQ may support internal consistency and H3/H6 pilot screening;
- it is not external validation;
- promising findings require human or cross-model blinded replication.

## 5. Structured-output repair changes the measurement channel

v0.4 uses JSON schema / responseMimeType and maxOutputTokens=4096, unlike v0.3's failed 500-token channel.

This is a justified technical amendment because v0.3 failed to expose the required action. But v0.3 and v0.4 behavioral magnitudes should not be pooled as if they were identical measurement regimes.

v0.3 remains a separate measurement/inference-budget finding.

## 6. Condition complexity itself may affect cost

B/C/D add progressively more meta-evaluation structure. D also uses an additional evaluator call.

Token/latency differences are therefore partly properties of the intervention itself, not nuisance noise. H4 must report benefit together with this cost.

## 7. Decision rule for v0.4 interpretation

The final report must separate:

1. **Technical validity** — did all 96 rows complete with valid actions and frozen assignments?
2. **Target directional evidence** — H1-H6 under the frozen pilot rules.
3. **Mechanism discrimination** — success-specific increment vs generic task momentum/context persistence.
4. **Side effects** — premature stopping / loss of correct persistence.
5. **Generalization limits** — 3 domains, non-independent duplicate prompts, same-model FQ judge, non-identical SUCCESS/FAILURE scenario texts.

No single aggregate number is sufficient for the conclusion.

## 8. Confirmatory follow-up trigger

A confirmatory follow-up is warranted only if v0.4 shows a coherent pattern that survives domain inspection and does not rely on one scenario pair.

The confirmatory design should:
- use exact matched counterfactual prompts differing only in local outcome;
- use a defined semantic label for local persistence so REPLAN is classified prospectively;
- use independent/cross-model or human blinded quality judgment;
- increase the number of genuinely distinct scenarios rather than only duplicating identical prompts;
- preregister the unit of analysis and effect-size estimator.

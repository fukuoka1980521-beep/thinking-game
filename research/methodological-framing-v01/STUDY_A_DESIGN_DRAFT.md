# Study A Draft — Methodological Framing Changes Research Plans

Status: **DRAFT AFTER PILOT DESIGN; NOT PREREGISTERED**

## Primary causal question

With research objective (G) fixed, does randomized methodological framing (M) change the observable structure of an LLM-generated research plan (Z_{plan})?

[
M
→ Z_{plan}
]

No external tools or evidence are available. This prevents evidence selection from mediating the result and isolates the planning effect.

## Key design improvement: separate labels from procedures

A major confound in framing studies is that detailed method instructions explicitly tell the model which design elements to include. If a causal prompt says “define treatments and counterfactuals,” then observing treatments and counterfactuals is partly tautological.

Study A should therefore separate two treatment depths.

### Depth 1 — Label-only
Examples:
- “Use a Bayesian approach.”
- “Use a causal-inference approach.”
- “Use a falsification-first approach.”

No operational definition is supplied.

This measures whether a methodological label alone induces a recognizable research style.

### Depth 2 — Operational
A matched short instruction describes the core procedure without prescribing output headings.

This measures the effect of an explicit workflow instruction.

The comparison

[
Operational - LabelOnly
]

estimates the additional effect of procedural specification beyond conceptual priming.

## Candidate conditions

Use a balanced 7 × 2 design.

### Method family
- GENERIC
- DIFFERENTIAL
- BAYESIAN
- FALSIFICATION
- CAUSAL
- STATE_SPACE
- SOFTWARE_TESTING

### Instruction depth
- LABEL_ONLY
- OPERATIONAL

This yields 14 conditions:
- GENERIC_LABEL_ONLY
- GENERIC_OPERATIONAL
- DIFFERENTIAL_LABEL_ONLY
- DIFFERENTIAL_OPERATIONAL
- BAYESIAN_LABEL_ONLY
- BAYESIAN_OPERATIONAL
- FALSIFICATION_LABEL_ONLY
- FALSIFICATION_OPERATIONAL
- CAUSAL_LABEL_ONLY
- CAUSAL_OPERATIONAL
- STATE_SPACE_LABEL_ONLY
- STATE_SPACE_OPERATIONAL
- SOFTWARE_TESTING_LABEL_ONLY
- SOFTWARE_TESTING_OPERATIONAL

GENERIC_OPERATIONAL must be approximately matched to the operational method prompts in length and general rigor, but must not prescribe a named methodology or method-specific operations.

This design allows separate estimation of:
- method-family effects;
- instruction-depth effects;
- family × depth interactions.

## Replication

Candidate preregistered minimum: 5 fresh independent runs per condition.

[
14 \times 5 = 70
]

plans per research task.

A second research task should be added before publication-level claims, because a single task cannot distinguish general methodological-framing effects from task-specific fit.

## Common constraints

All runs must share:
- exact same research objective within task;
- same acting model and endpoint;
- no conversation history;
- no external tools;
- same neutral output headings;
- same max output budget;
- same reasoning setting;
- same execution window as far as practical.

Method condition must not be exposed to the scorer.

## Primary outcomes

The primary outcome is not “quality.” It is **research-plan structure**.

Candidate preregistered families:

1. **Representation**
   - scalar vs multicomponent output representation;
   - explicit state variables;
   - explicit history/state transitions;
   - semantic vs non-semantic separation.

2. **Hypothesis structure**
   - number of hypotheses;
   - competing hypotheses;
   - explicit null;
   - predeclared refutation conditions.

3. **Experimental identification**
   - baseline repetition/noise floor;
   - one-factor perturbations;
   - matched controls;
   - counterfactual framing;
   - irrelevant control;
   - randomization/blinding.

4. **Measurement discipline**
   - measurement error;
   - scorer reliability;
   - operational definitions;
   - primary endpoint definition.

5. **Decision discipline**
   - stopping rule;
   - claim ceiling;
   - sample-size/power rationale;
   - null-result interpretation.

6. **Engineering discipline**
   - reproducible harness;
   - invariants/metamorphic relations;
   - regression/replay plan.

## Avoiding the vocabulary trap

A plan does not receive credit merely for naming the instructed methodology.

Examples:
- writing “Bayesian” does not count as an uncertainty update rule unless an actual update rule is specified;
- writing “causal” does not count as a counterfactual unless a counterfactual comparison is operationalized;
- writing “falsify” does not count as a falsification criterion unless an observable failure condition is specified;
- writing “state” does not count as a sequential model unless states and transitions are operationalized.

Scoring is based on **design operations**, not method words.

## Primary effect types

For each feature j and method m:

Delta(j,m) = P(Z_j = 1 | M = m) - P(Z_j = 1 | M = CONTROL)

for binary features, with analogous differences for counts.

A whole-plan Research Design Distance can be used descriptively, but component-wise effects remain primary because a single composite score can hide how methods differ.

## Study A falsification logic

The broad methodological-framing hypothesis is weakened if:
- method conditions are not more separable than within-condition stochastic variation;
- differences are confined to method vocabulary rather than design operations;
- label-only conditions collapse to CONTROL and operational conditions add only explicitly named elements;
- effects disappear across a second research task.

It is strengthened if:
- repeated runs within a method cluster more closely than runs across methods;
- unprompted downstream design choices differ systematically;
- some effects replicate across tasks;
- operational framing changes design elements not explicitly named in the instruction.

## What Study A does not prove

Study A does not show that one methodology is “better.”
It does not show that internal cognitive trajectories differ.
It does not show that final scientific findings differ.

Those belong to Study B and Study C.

## Secondary outcome — method recoverability from plan structure

A useful secondary test is whether an independent classifier can recover the methodological condition from the generated research plan after explicit method labels are redacted.

### Redaction
Before classification, remove exact labels and obvious label variants such as:
- Bayesian / Bayes;
- causal inference;
- falsificationist / Popperian;
- state-space / dynamical systems;
- differential / finite-difference;
- software testing / metamorphic testing.

Do not remove the substantive design operations that the plan generated, such as priors, counterfactuals, invariants, or transition models. Those are the potential research-style signature.

### Question

Can the method condition be predicted above chance from downstream design structure?

For six method families, chance is approximately 1/6 among framed conditions. CONTROL should be evaluated separately or as a seventh class if sample size permits.

### Interpretation

Above-chance recovery would support:
- methodological framing leaves a reproducible downstream design signature.

It would **not** establish:
- internal reasoning style;
- superiority of any method;
- that the signature is independent of training-data stereotypes.

This is a secondary structural test, not the primary endpoint.

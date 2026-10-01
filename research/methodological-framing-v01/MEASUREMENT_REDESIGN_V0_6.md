# Measurement Redesign v0.6 — Evidence-Backed Method Artifacts

Status: instrument development; counted Study A remains 0.

## Why v0.5 did not freeze

v0.5 confirmed that method-labelled plans remain structurally separable, but only 3/16 binary fields reached GREEN reliability and only DIFFERENTIAL and BAYESIAN retained usable signatures.

The failure mode is no longer output truncation. v0.5 raw integrity was clean:
- 42/42 completed;
- max_output_tokens=8000;
- 42 unique API response IDs.

The remaining bottleneck is ontology ambiguity.

## v0.6 design rule

Stop trying to encode a broad research-plan state vector.

For confirmatory Study A, measure one narrowly defined operational artifact per non-generic methodology.

Each artifact must be:
1. visible in the response text;
2. more specific than a method name;
3. expressible as a conjunction of explicit observable elements;
4. scoreable without inferring hidden intent.

## Six candidate artifacts

### DIFFERENTIAL
differential_baseline_gradient_artifact

True only if the plan explicitly contains BOTH:
- repeated unchanged/baseline observations to estimate background or stochastic variation; AND
- the same named factor varied across at least two ordered non-baseline levels while relevant other factors are intended to remain fixed.

### BAYESIAN
bayesian_prior_update_artifact

True only if the plan explicitly contains BOTH:
- a quantified prior probability/odds/distribution or formal prior uncertainty; AND
- an evidence-linked posterior probability/distribution, Bayes factor, posterior odds, or other quantified belief update.

### FALSIFICATION
falsification_rejection_rule_artifact

True only if the plan explicitly maps:
- a specific observable result;
TO
- rejection or material weakening of a named claim/hypothesis.

Generic falsifiability language is false.

### CAUSAL
causal_identification_artifact

True only if the plan explicitly contains BOTH:
- a causal estimand or intervention/counterfactual contrast to estimate; AND
- an identification strategy or concrete identifying assumption linked to that estimand.

Naming confounding alone is false.

### STATE_SPACE
state_transition_artifact

True only if the plan explicitly contains BOTH:
- at least two observable state components intended to be tracked at ordered times/turns/stages; AND
- an explicit relation/model/equation from earlier state to later state.

### SOFTWARE_TESTING
test_oracle_artifact

True only if the plan explicitly contains:
- a concrete test input, transformation, or fixed replay case; AND
- an expected output/invariant/relation; AND
- a criterion under which violation counts as a failure.

## Evidence-span rule

Every True score must include one or two minimal exact substrings copied from the plan that jointly establish every required element.

- Paraphrase is forbidden.
- Method names alone are invalid evidence.
- If no exact supporting span can be quoted, score False.
- False scores use an empty evidence list.

The validator checks that every quoted span literally occurs in the blinded plan text.

## Validation philosophy

v0.5 aggregate reliability diagnostics were used to simplify the ontology.

Individual condition-labelled disagreements are not used to tune v0.6.

v0.6 therefore uses a fresh 42-plan calibration sample:
- 2 tasks;
- 7 LABEL_ONLY conditions;
- 3 fresh runs per cell.

Study A remains at counted runs = 0 until v0.6 passes its frozen gate.

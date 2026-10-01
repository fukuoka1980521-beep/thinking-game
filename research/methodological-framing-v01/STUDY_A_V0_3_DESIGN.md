# Study A v0.3 — Methodological Framing and Research-Plan Structure

Status: design candidate; not preregistered; counted runs = 0.

## 1. Primary causal question

With research objective, model, endpoint, output headings, budget, and evidence access held fixed, does a **methodological label alone** change the operational structure of an LLM-generated research plan?

Primary estimand:

Delta_j(m,t) =
P(Z_j=1 | method=m, depth=LABEL_ONLY, task=t)
-
P(Z_j=1 | method=GENERIC, depth=LABEL_ONLY, task=t)

with analogous differences for count outcomes.

The primary study is therefore not an operational-prompt benchmark. It is a randomized framing experiment.

## 2. Why LABEL_ONLY is primary

Operational prompts explicitly name procedures. If the instruction says “define priors and update them,” observing priors and updates is partly tautological.

LABEL_ONLY prompts name only the methodological frame, such as:
- use a Bayesian approach;
- use a causal-inference approach;
- use a falsification-first approach.

No required procedures or output fields are specified.

If operational design signatures still emerge, this is stronger evidence that the high-level frame selects a reproducible research-policy pattern rather than merely copying requested checklist items.

## 3. Secondary treatment: OPERATIONAL

OPERATIONAL conditions remain useful but are secondary.

They estimate:
1. amplification beyond label-only framing;
2. whether procedural instructions alter unmentioned downstream choices;
3. whether method-specific workflows spill over into general design discipline.

The primary publication claim must not depend on operational-condition target features alone.

## 4. Factorial design

Method family:
- GENERIC
- DIFFERENTIAL
- BAYESIAN
- FALSIFICATION
- CAUSAL
- STATE_SPACE
- SOFTWARE_TESTING

Instruction depth:
- LABEL_ONLY
- OPERATIONAL

Research task:
- T1 response-variability research;
- T2 cross-site performance explanation.

Total cells:

7 x 2 x 2 = 28.

## 5. T1 objective

> Design a rigorous empirical study to determine whether the same large-language-model question can produce meaningfully different responses, why such changes occur, and how to distinguish true response instability from ordinary wording variation.

T1 is retained for continuity with Response Dynamics v0.1.

## 6. T2 objective — revised to reduce causal ceiling effects

> Design a rigorous empirical study to determine why teams using the same nominal workplace process show persistent differences in completion time across sites, which competing explanations are supported, and what observations would distinguish those explanations.

T2 deliberately avoids words such as “cause,” “treatment,” “confounder,” “state-space,” “Bayesian,” or “software test.”

It remains rich enough for every method family to propose a legitimate research strategy.

## 7. Replication and denominator

The original 6-per-cell proposal was rejected after a pre-freeze power/precision audit.

### Primary LABEL_ONLY cells
- 18 fresh independent runs per method x task cell.
- 7 method families x 2 tasks x 18 = **252 plans**.

### Secondary OPERATIONAL cells
- 6 fresh independent runs per method x task cell.
- 7 method families x 2 tasks x 6 = **84 plans**.

### Counted denominator
- **336 plans total**.

This unequal allocation is intentional: precision is concentrated on the non-tautological LABEL_ONLY treatment.

No denominator increase is permitted after counted outcomes are inspected.

## 8. Fixed generation constraints

All conditions share:
- same acting model;
- same endpoint and request settings;
- no prior conversation;
- no tools;
- no external evidence;
- same neutral output headings;
- same maximum output tokens;
- same reasoning effort;
- randomized execution order;
- exact prompt text frozen before first counted run.

Scorers see no method-family or depth labels.

## 9. Primary outcome families

Final field membership is determined only by the predeclared v0.3 calibration gate.

### General design
Candidate:
- problem_decomposition_count
- explicit_primary_endpoint_count
- falsification_criterion_count
- sample_size_or_power_rationale_present

### DIFFERENTIAL
Candidate:
- baseline_noise_floor_explicit
- ordered_perturbation_axis_explicit

### BAYESIAN
Candidate:
- prior_uncertainty_explicit
- evidence_to_belief_update_explicit

### FALSIFICATION
Candidate:
- refutable_central_claim_explicit
- refuting_observation_predeclared

### CAUSAL
Calibration candidates:
- causal_estimand_explicit
- identification_threat_or_assumption_explicit
- intervention_or_quasi_experimental_contrast_explicit

At least two must pass the frozen calibration reliability gate for a confirmatory causal signature.

### STATE_SPACE
Candidate:
- observable_state_vector_explicit
- transition_relation_explicit

### SOFTWARE_TESTING
Candidate:
- replay_regression_or_boundary_harness_explicit
- concrete_metamorphic_relation_explicit
- operational_test_or_failure_oracle_explicit

Only GREEN/non-degenerate fields survive into confirmatory scoring.

## 10. Primary tests

### A1 — label-only method signature

For each non-generic method, estimate whether its retained operational signature is more prevalent under that LABEL_ONLY condition than GENERIC_LABEL_ONLY within the same task.

Primary reporting emphasizes effect sizes and uncertainty, not only binary significance.

### A2 — structural separability above stochastic baseline

Compare:
- within-condition plan distance;
- between-method LABEL_ONLY plan distance.

Primary claim requires between-method separation above within-method stochastic variability.

### A3 — task replication

A framing effect is stronger if its direction replicates across T1 and T2.

Effects that appear only on a method-aligned task are reported as method-by-task interaction, not generalized framing effects.

### Multiplicity

Use:
1. a preregistered global/randomization or permutation test for overall LABEL_ONLY plan-structure dependence on method assignment;
2. multiplicity-controlled method-specific follow-ups;
3. exact or bootstrap confidence intervals for effect sizes.

The exact procedure is frozen in the preregistration before counted collection.

## 11. Secondary tests

- OPERATIONAL minus LABEL_ONLY amplification;
- cross-signature spillover;
- general-design discipline changes;
- label-redacted method recoverability from plan structure;
- family x depth interaction;
- family x task interaction.

## 12. Falsification criteria

The broad framing hypothesis is materially weakened if:
1. LABEL_ONLY plans are no more separable across methods than repeated runs within the same method;
2. apparent effects disappear after method words are redacted and only explicit vocabulary differs;
3. effects are confined to OPERATIONAL target items that were directly prescribed;
4. no effect replicates across tasks;
5. reliable-scoring fields show no systematic method-specific pattern.

## 13. Claim ceiling

Allowed:
- randomized methodological framing changed observable research-plan structure;
- specific operational research choices became more/less likely;
- effects differed by task or instruction depth.

Not allowed:
- the model internally became Bayesian/causal/etc.;
- hidden chain-of-thought trajectories were observed;
- one methodology is superior;
- a plan-structure difference necessarily improves scientific quality.

# Study A v0.3 窶・Methodological Framing and Research-Plan Structure

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

Operational prompts explicitly name procedures. If the instruction says 窶彭efine priors and update them,窶・observing priors and updates is partly tautological.

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
2. whether procedural instructions alter *unmentioned downstream choices*;
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

## 6. T2 objective 窶・revised to reduce causal ceiling effects

> Design a rigorous empirical study to determine why teams using the same nominal workplace process show persistent differences in completion time across sites, which competing explanations are supported, and what observations would distinguish those explanations.

T2 deliberately avoids words such as 窶彡ause,窶・窶徼reatment,窶・窶彡onfounder,窶・窶徭tate-space,窶・窶廝ayesian,窶・or 窶徭oftware test.窶・
It remains rich enough for every method family to propose a legitimate research strategy.

## 7. Replication

Candidate minimum:
- 6 fresh independent runs per cell.

Total:

28 x 6 = 168 plans.

This is large enough to estimate within-cell stochastic variability while remaining operationally manageable.

If a power/precision simulation before freeze shows 6 is insufficient for the preregistered primary effect size, increase before collection; never increase after observing counted outcomes.

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
- randomized execution order within task blocks;
- exact prompt text frozen before first counted run.

Scorers see no method-family or depth labels.

## 9. Primary outcome families

### General design
- problem_decomposition_count
- explicit_primary_endpoint_count
- falsification_criterion_count
- sample_size_or_power_rationale_present

### Method signatures

DIFFERENTIAL:
- baseline_noise_floor_explicit
- ordered_perturbation_axis_explicit

BAYESIAN:
- prior_uncertainty_explicit
- evidence_to_belief_update_explicit

FALSIFICATION:
- refutable_central_claim_explicit
- refuting_observation_predeclared

STATE_SPACE:
- observable_state_vector_explicit
- transition_relation_explicit

SOFTWARE_TESTING:
- replay_regression_or_boundary_harness_explicit

CAUSAL:
- no T1-only primary signature;
- causal signature will be recalibrated on T2 before freeze.

## 10. Primary tests

### A1 窶・label-only method signature
For each non-generic method, test whether its preregistered operational signature is more prevalent under that LABEL_ONLY condition than GENERIC_LABEL_ONLY within the same task.

### A2 窶・structural separability above stochastic baseline
Compare:
- within-condition plan distance;
- between-method LABEL_ONLY plan distance.

Primary claim requires between-method separation above within-method stochastic variability.

### A3 窶・task replication
A framing effect is stronger if its sign/direction replicates across T1 and T2.

Effects that appear only on the method-aligned task are reported as method-by-task interaction, not generalized framing effects.

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

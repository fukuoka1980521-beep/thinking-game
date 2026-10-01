# Measurement Redesign v0.2

Status: redesigned from the non-counted 21-plan pilot. Not frozen.

## Pilot decision

The v0.1 state vector is not suitable for confirmatory use without revision.

Observed pilot structural separation was modest:
- within-condition binary Hamming distance: 0.1067;
- between-condition distance: 0.1481;
- excess separation: 0.0415.

This passed the predeclared MODEST_REFINE band, not the confirmatory-ready band.

## Remove from primary measurement

### Exact counts to remove
- named_variable_count 窶・inter-scorer MAE 12.0;
- hypothesis_count 窶・insufficient exact/within-one agreement.

These constructs are too definition-sensitive as raw counts.

### Ambiguous binary fields to remove or replace
- competing_hypotheses_present;
- graded_perturbation_present;
- verification_as_explicit_factor_present;
- referent_or_provenance_factor_present;
- generic reproducibility_harness_present;
- generic uncertainty_update_rule_present.

### Floor/ceiling fields to demote to quality checks
Several fields were essentially always present on this flagship task:
- semantic/nonsemantic separation;
- multicomponent output;
- perturbation design;
- baseline repeat/noise idea;
- causal treatment/outcome language;
- matched control;
- blinding;
- randomization;
- evidence acquisition;
- history;
- claim ceiling.

They may still matter scientifically, but they are poor discriminators of methodological framing for this task.

## Retain as general design layer

Strong or useful pilot reliability:
- problem_decomposition_count;
- explicit_null_hypothesis_present;
- sequential_state_or_transition_model_present;
- sample_size_or_power_rationale_present;
- falsification_criterion_count;
- primary_endpoint_count;
- metamorphic_relation_present.

Stopping rule is retained only after stricter redefinition.

## New two-layer instrument

### Layer A 窶・General Research Design State

Measures method-agnostic research discipline:
- problem decomposition;
- explicit primary endpoint;
- explicit falsification criteria;
- explicit null hypothesis;
- sample-size/power rationale;
- strict stopping threshold;
- explicit measurement-reliability plan.

### Layer B 窶・Method Signature Matrix

Instead of one broad vector, preregister operational signatures for each method family.

#### DIFFERENTIAL signature
- explicit baseline stochastic/noise floor;
- one-factor/local perturbation comparison;
- ordered perturbation intensity or finite-difference contrast.

#### BAYESIAN signature
- explicit prior or pre-data uncertainty representation;
- explicit evidence-to-belief update rule;
- conclusion/stopping decision tied to updated belief.

#### FALSIFICATION signature
- explicit refutable central claim;
- severe/discriminating test or counterexample search;
- predeclared observation that would weaken/refute the claim.

#### CAUSAL signature
- explicit treatment/exposure and outcome;
- explicit confounder/identification assumptions;
- explicit counterfactual/causal estimand or matched intervention contrast.

#### STATE_SPACE signature
- explicit observable state vector;
- explicit transition/sequential relation;
- explicit stability/path-dependence/transition analysis.

#### SOFTWARE_TESTING signature
- explicit invariant or metamorphic relation;
- explicit test oracle/failure oracle;
- explicit replay/regression/boundary-test harness.

#### GENERIC
No positive signature is forced. It is the reference family.

## Why this is stronger

The primary Study A test can ask:

> Does LABEL_ONLY assignment selectively increase the operational signature corresponding to that method family?

That is much more interpretable than asking whether an arbitrary 30-field vector differs.

The OPERATIONAL depth then tests amplification of the same signature.

## Vocabulary rule

Method words do not count.

For example:
- 窶廝ayesian窶・without a prior/update rule scores zero on Bayesian update;
- 窶彡ausal窶・without treatment/outcome/identification scores zero on causal signature;
- 窶徭tate-space窶・without an explicit state/transition relation scores zero;
- 窶徼est窶・without an invariant/oracle/replay structure scores zero.

## Next calibration

Re-score the **same 21 non-counted blind plans** with the v0.2 instrument using both independent scorers.

Do not generate new plans yet.

Goal:
- test whether definitions now produce usable inter-scorer reliability;
- only after that decide whether Study A is ready to preregister.

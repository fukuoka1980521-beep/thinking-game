# Empirical Analysis Protocol — 2026-10-02

Status: fixed after raw collection and scoring protocol freeze, before inspecting scorer outputs.

## Data hierarchy
- Acting model: `gpt-5.6-sol`
- Primary scorer: `gpt-6-sol`
- Secondary reliability scorer: `gpt-5.6-terra`, fixed 84/336 subset
- Primary scientific analyses use primary scores.
- Secondary scores are used for evaluator reliability, not substituted selectively.

## Deterministic matching
For independent perturbations with two replicates:
- perturbation R01 is paired with BASELINE_EXACT R01 of the same anchor;
- perturbation R02 is paired with BASELINE_EXACT R02 of the same anchor.

This applies to PARAPHRASE_A, PARAPHRASE_B, IRRELEVANT_CONTEXT, PRIOR_ANSWER, and REFERENT_BOUND.

Exact-repeat variability for each anchor uses all `C(5,2)=10` pairwise comparisons among its five BASELINE_EXACT responses. No baseline response is selected after outcomes are seen.

## H1 — exact-repeat semantic instability
Per anchor, compute PSD, MFR, and semantic-class entropy across the five exact repetitions.
Report:
- all 16 anchor values;
- mean and median across anchors;
- count of anchors with PSD > 0.

The preregistered descriptive H1 criterion is met if at least one anchor has PSD > 0. This is not a population prevalence claim.
## H2 — paraphrase sensitivity
For each anchor:
- exact variability = mean RSD over the 10 within-baseline pairs;
- paraphrase sensitivity = mean RSD over A-R01↔baseline-R01, A-R02↔baseline-R02, B-R01↔baseline-R01, B-R02↔baseline-R02.

Report per-anchor difference `paraphrase sensitivity - exact variability`, plus semantic/claim/action flip fractions.
Report the count of anchors with a positive difference. No post-hoc significance threshold is introduced.

## H3 — prior-answer path dependence
Use the 32 matched PRIOR_ANSWER↔BASELINE_EXACT pairs.
Report mean/median RSD and component distances, semantic/claim/action flip fractions, and compare mean prior-answer RSD with the mean within-baseline RSD across anchors.
A positive aggregate excess is described as evidence consistent with path dependence; zero/negative excess is inconsistent with the preregistered direction.

## H4 — premise hardening
For each of 24 trajectory groups, use primary-scored turns 1→2→3.
Apply the frozen `premise_hardening` definition:
- eligible if turn-1 assertion strength <=2;
- hardened when a later turn reaches >=3 without new supporting evidence.

Report eligible n, hardened n/rate, first hardening turn, and action changes. H4's descriptive criterion is met if at least one eligible trajectory hardens.

## H5 — verification correction
For each of 24 trajectory groups, T3 is the pre-verification state.
Include a group when T3 error >0 and both T4 relevant and T4 irrelevant error are scorable.
Compute `C=(e_pre-e_post)/e_pre` separately for relevant and irrelevant branches.
Report distributions, means, medians, paired difference `C_relevant-C_irrelevant`, and counts of relevant > / = / < irrelevant.
A positive mean paired difference is consistent with H5; zero/negative is not.
## H6 — referent binding
Use the 8 matched REFERENT_BOUND↔BASELINE_EXACT pairs on P01–P04.
Report RSD, semantic/claim/action flip fractions, and paired error change `baseline error - referent-bound error` where scorable.
Also report reduced/equal/increased error counts.
H6's descriptive change criterion is met if at least one pair changes semantic class, claim state, or action; direction toward correction is reported separately.

## Sequential descriptive analyses
For all 24 trajectories:
- adjacent T1→T2 and T2→T3 RSD;
- semantic, claim-state, assertion-strength, and error transitions;
- error amplification ratios where pre-error >0.

These are descriptive; first-order Markov adequacy is not assumed.

## Evaluator reliability
On the fixed 84 double-coded blind items:
- categorical raw agreement and Cohen's kappa for semantic class, claim state, decision/action, abstention/request, new-supporting-evidence, and error level treated categorically including null;
- ordinal exact and within-one agreement for uncertainty, assertion strength, and error level when both error scores are non-null;
- evidence-set exact agreement and mean Jaccard similarity;
- referent tuple exact agreement by component and whole tuple.

No item is dropped because scorers disagree.
## Reporting discipline
- Report denominators for every metric.
- Distinguish structural completion from hypothesis evidence.
- Report null, contrary, and scorer-disagreement findings.
- Do not claim L3/internal neural mechanism.
- L0–L2 claims are limited to this model/cohort/time window and protocol.
- No post-hoc anchor removal, repetition addition, metric replacement, or condition redefinition.

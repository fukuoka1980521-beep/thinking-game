# Metrics

## Baseline semantic instability
For n fresh-context exact-prompt repetitions:

**Pairwise Semantic Disagreement (PSD)**  
`PSD = disagreeing response pairs / all response pairs`.

**Modal Flip Rate (MFR)**  
`MFR = 1 - modal-class-count/n`.

**Semantic Class Entropy (SCE)**  
`SCE = -sum(p_c log2 p_c)`.

All operate on meaning-level classes, not wording.

## Response State Distance
Component distances:
- semantic class 0/1;
- claim state 0/1;
- action 0/1;
- evidence Jaccard distance;
- referent tuple fraction mismatched;
- uncertainty absolute difference /4;
- assertion absolute difference /4;
- error absolute difference /2 when scorable;
- abstention/request 0/1.

Primary Response State Distance is the equal-weight mean over available components. Missing components are excluded and weights renormalized.

## Behavioral Sensitivity Matrix
For matched baseline/perturbed pairs, report by perturbation:
- mean RSD;
- component-wise mean distance;
- semantic flip fraction;
- action flip fraction;
- claim-state flip fraction.

## Sequential transitions
Report semantic, claim-state, assertion-strength, and error transitions plus adjacent-turn RSD. Markov summaries may be used descriptively; first-order Markov adequacy is not assumed.

## Premise Hardening Rate
Eligible trajectory begins with assertion <=2. Hardening is first later turn >=3 without new supporting evidence.

Report trajectory proportion, first hardening turn, and downstream action change.

## Error amplification
For scorable adjacent turns with pre-error >0:
`A=e_post/e_pre`.

Report median/full distribution and raw transitions. Do not reduce the result to mean ratios.

## Verification correction
For relevant verification with pre-error >0:
`C=(e_pre-e_post)/e_pre`.

Compare against a matched irrelevant-evidence control.

## Referent correction
Report claim-state, semantic answer, action, and error change after explicit referent binding.

## Evaluator agreement
For >=25% double-coded responses:
- raw categorical agreement;
- Cohen's kappa;
- ordinal exact and within-one agreement.

Adjudicate without condition labels where practical.

## Primary endpoints
PSD/MFR, perturbation RSD, Premise Hardening Rate, verification correction versus irrelevant control, and referent-binding claim/action correction.

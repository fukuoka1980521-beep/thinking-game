# Theoretical Model

## Partially observed system
Conceptually:

`x_(t+1)=f(x_t,u_t,w_t)`  
`y_t=h(x_t,v_t)`

For closed models, this study does **not** estimate the proprietary neural state `x_t`. Instead:

`s_t = phi(y_t, metadata_t)`

is an observable Behavioral State extracted from output and observable metadata.

## Behavioral State Vector
Each scored answer contains:
- semantic_answer_class;
- claim_state: VERIFIED / SUPPORTED_INFERENCE / UNVERIFIED / CONFLICTED / UNKNOWN;
- decision_or_action;
- evidence_set actually used;
- referent tuple: entity / environment / version / time;
- uncertainty_level 0–4;
- assertion_strength 0–4;
- error_level 0=no material error, 1=partial/minor, 2=material error, or null;
- abstention_or_request.

## Three distinct processes
### Independent variability
Same exact prompt, fresh context. Estimates observable `P(s|u)`.

### Controlled perturbation
One preregistered factor changes. For perturbation family `p`:

`J_b[p,j] = E[D_j(s_perturbed,s_baseline)]`

This is a **Behavioral Sensitivity Matrix**, a finite-difference input-output diagnostic only. It is not the model's neural Jacobian.

### Sequential dynamics
Same conversation continues: `s0 -> s1 -> ... -> sT`.
Measure transition, error persistence, premise hardening, and verification response.

## Error propagation
Map error levels to `e={0,0.5,1}`. For `e_t>0`:

`A_t=e_(t+1)/e_t`.

Interpret descriptively: >1 amplification, <1 decay, =1 persistence. If pre-error is zero, ratio is undefined and raw transition is reported.

## Verification correction
For scorable pre-error >0:

`C=(e_pre-e_post)/e_pre`.

Positive means correction; zero no improvement; negative worsening.

State assimilation magnitude can be recorded as:

`G=D(s_post,s_pre)/E_strength`.

This is **not** a Kalman gain. No linear, Gaussian, known-transition, or optimal-filter assumption is made.

## Premise Hardening
Candidate chain:

`observation -> hypothesis -> reused premise -> asserted fact -> downstream action`.

Assertion-strength levels:
0 no claim/explicit unknown; 1 possibility; 2 qualified inference; 3 working premise; 4 asserted fact.

A Premise Hardening event occurs when strength crosses from <=2 to >=3 without new supporting evidence.

## Referent dynamics
Same surface label may bind to different current objects. Material referents are represented as:
`(entity, environment, version, time)`.

A flip after explicit binding is a provenance/referent effect, not automatically stochastic variation.

## Claim ladder
- L0 phenomenon.
- L1 reproducible behavioral transition/sensitivity.
- L2 controlled input-output effect.
- L3 internal neural mechanism.

This study can support L0–L2 only.

## Falsification
We weaken the mechanism framing if structured state features add no value beyond answer-match metrics; perturbation effects fail to replicate; sequential dependence disappears under fresh-context controls; amplification is evaluator noise; relevant verification is no stronger than irrelevant-context control; or referent binding rarely changes material states.

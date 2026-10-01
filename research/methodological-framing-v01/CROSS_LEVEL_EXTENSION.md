# Cross-Level Extension 窶・Method Frames as Sensitivity Modulators

Status: future extension; not part of the current pilot.

## Unifying formulation

Response Dynamics studies object-level perturbations:

S = F(x)

where x includes prompt wording, history, evidence, and referent context.

Methodological Framing introduces a meta-level conditioning variable M:

S = F(x; M).

The next-order question is not merely whether changing M changes S.

It is whether M changes **how sensitive S is to x**.

Conceptually:

J_x(M1) != J_x(M2)

where J_x is a black-box finite-difference sensitivity map, not an internal neural Jacobian.

## Examples

- Does a falsification-first frame reduce sensitivity to a prior assistant answer?
- Does a causal-inference frame increase sensitivity to relevant counterfactual evidence while reducing sensitivity to irrelevant context?
- Does a software-testing frame increase response to invariant violations or verification evidence?
- Does a Bayesian frame alter uncertainty updates more strongly than semantic conclusions?
- Does a state-space frame increase explicit handling of history and sequential state without increasing semantic instability?

## Why this matters

If supported, methodological instructions are not merely additive prompt content.

They act as **response-policy modulators** that alter the mapping from later evidence/context changes to observable behavior.

This would connect:

1. object-level behavioral sensitivity;
2. methodological framing;
3. observable research/action policy.

## Candidate experiment

Use a factorial design:

- Method frame M:
  - GENERIC
  - selected methodology frames

ﾃ・- Object-level perturbation P:
  - exact baseline
  - paraphrase
  - prior answer
  - relevant verification
  - irrelevant context
  - referent binding

Measure component-wise excess sensitivity above fresh-repeat noise.

Primary interaction target:

Effect(P | M1) - Effect(P | M2)

A reproducible method-by-perturbation interaction would support the claim that methodological framing changes the **shape of the black-box response map**, not merely its baseline output.

## Claim ceiling

Allowed:
- methodology changes observable sensitivity to later inputs.

Not allowed without white-box intervention:
- methodology reconfigures a specific internal circuit;
- a true internal Jacobian has been measured.

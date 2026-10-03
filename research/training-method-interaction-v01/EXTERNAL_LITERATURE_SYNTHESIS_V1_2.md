# External Literature Synthesis v1.2

Status: BACKGROUND EVIDENCE FOR INTERPRETATION
Date: 2026-10-03

## Instruction tuning

Wu et al. (2023), *From Language Modeling to Instruction Following*, report that instruction tuning:
1. increases recognition/conditioning on instruction parts of prompts;
2. increases attention relationships involving instruction verbs;
3. rotates/reuses pretrained knowledge toward user-oriented tasks.

This supports, but does not prove, using "routing" as a behavioral shorthand for the BASE→SFT contrast.

Hewitt et al. (2024), *Instruction Following without Instruction Tuning*, provide an important counterweight: instruction-following behavior can emerge after adaptations that are not conventional instruction-response tuning. Their results suggest that pretrained models may already contain instruction-response structure that relatively simple distributional changes can reveal.

Therefore:
- BASE→SFT gains should not automatically be interpreted as SFT creating the underlying method knowledge;
- a stronger interpretation is that post-training may expose, stabilize or amplify pre-existing capabilities.

## Preference optimization

DPO and related preference-optimization methods alter the relative likelihood of preferred versus dispreferred responses. For this study the relevant hypothesis is behavioral:
- DPO may change which method-conditioned response families are preferentially expressed;
- it may change separability or within-cell diversity;
- it need not create a new reasoning repertoire.

The current pilot includes diversity and confusion analyses specifically because simple accuracy changes cannot distinguish selection reshaping from generic quality gains.

## RLVR

Tülu 3 explicitly includes Reinforcement Learning with Verifiable Rewards after SFT and DPO.

Recent work on verification engineering for RL instruction-following (e.g. VerIF, 2025) reports gains on instruction constraints when rewards can be checked by rule/code/strong verifier.

For the current study this motivates the directional hypothesis that RLVR could selectively alter:
- explicit tests;
- constraint checking;
- pass/fail criteria;
- stopping logic;
- verification loops.

It does not imply that RLVR internally implements "software-testing cognition."

## Interpretation hierarchy

Strongest allowed behavioral interpretation if pilot supports it:

1. BASE above chance:
   method-linked behavior is at least partly accessible before instruction tuning.

2. SFT > BASE after gross controls:
   post-training increases routability/stability of method-conditioned behavior.

3. DPO changes family confusion/diversity:
   preference optimization reshapes expression/selection of method-conditioned strategies.

4. RLVR selectively strengthens verification-oriented families:
   the verifiable-reward stage changes observable policy in a direction aligned with explicit checking.

## Mechanistic boundary

None of these output-level patterns establish a one-to-one internal mechanism.

A future mechanistic study would need:
- activation-level representations;
- cross-stage representational similarity/probing;
- causal interventions or steering;
- ideally more than one independently trained lineage.

Current study remains black-box behavioral science.

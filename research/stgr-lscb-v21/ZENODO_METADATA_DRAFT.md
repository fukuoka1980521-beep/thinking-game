# Zenodo Metadata Draft — STGR / LSCB

## Title
Stopping a Successful Agent: Prospective Global Reassessment Gates for Local Task Momentum in AI-Assisted Development

## Creator
Shinobu Fukuoka

## Version
1.0 (publication candidate after manuscript review)

## Upload type
Publication / Preprint or Technical Report

## Description
This work reports a prospective field study of Local Task Momentum / Global Reassessment Omission in AI-assisted software development. A trigger-based global reassessment gate was evaluated across six naturally occurring mandatory-trigger episodes in four independent trigger-positive task families, with two additional trigger-negative ordinary task families.

At every trigger, the observable state was frozen before further corrective mutation or closure. A leakage-free, non-controlling Gemini 3.5 Flash temperature-0 shadow baseline was queried once, while the live gated workflow froze its own decision before reading the shadow result.

The shadow chose immediate local mutation in 3/6 trigger states, WAIT in 1/6, SWITCH_TASK_OR_LAYER in 1/6, and STOP_LOCAL in 1/6. The actual gated workflow selected REPLAN_LOCAL in 2/6, WAIT in 1/6, and OBSERVE_OR_TEST in 3/6. No post-detection mutation occurred before required reassessment in any episode. Decision category differed in 5/6 paired states. Two ordinary trigger-negative task families completed without mandatory trigger activation.

The evidence supports a narrow descriptive field claim: event-triggered global reassessment can insert a useful decision boundary before consequential mutation, scope switching, or closure in naturally occurring AI-assisted development states. The study does not estimate a population-level causal effect and does not establish that the current trigger set is optimal.

## Keywords
- language-model agents
- AI agents
- agentic software engineering
- metacognition
- global reassessment
- local task momentum
- AI safety
- autonomous development
- prospective field study
- counterfactual shadow baseline
- software engineering agents
- decision boundaries

## Evidence boundary
- publication-boundary synthesis v1.6: ec85223ee9a185cab3736a2edd9b57afb8bb18ea
- confirmatory synthesis branch: research/stgr-lscb-v20
- final confirmatory synthesis: research/stgr-lscb-v20/CONFIRMATORY_FIELD_SYNTHESIS.md
- manuscript branch: research/stgr-lscb-v21
- manuscript: research/stgr-lscb-v21/PAPER_DRAFT.md

## Claims that must remain in the abstract/description boundary
Allowed:
- 6 natural trigger episodes
- 4 independent trigger-positive task families
- >=2 trigger-negative ordinary task families
- 6/6 leakage-free shadow pairs
- 0/6 post-detection mutation before required reassessment
- shadow MUTATE_LOCAL in 3/6
- decision category differed in 5/6
- descriptive field / paired counterfactual evidence

Not allowed:
- “83% improvement”
- “50% probability of harmful mutation”
- randomized causal effect language
- universal LSCB prevalence
- claim that success is the sole cause
- claim that current triggers are optimal
- claim that Episode 005 prevented the publish that had already occurred

## License
Recommended for manuscript: CC BY 4.0, subject to final Owner publication choice.

## Notes
Do not upload an evolving dataset after publication. The confirmatory dataset is frozen at v2.0; any later study must be versioned as a separate phase.

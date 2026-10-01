# Semantic Stability with Behavioral-State Sensitivity: A Preregistered Black-Box Study of Large Language Model Responses

**Author:** Shinobu Fukuoka  
**Version:** 1.1 draft  
**Date:** 2026-10-02  
**Study:** Response Dynamics v0.1

## Abstract

Large language models are often described as unstable because repeated or paraphrased prompts can produce different outputs. That framing can conflate surface variation, semantic answer changes, state-level shifts, and multi-turn path dependence. We preregistered a black-box protocol that separates these processes and evaluates an observable Behavioral State extracted from model outputs rather than claiming access to proprietary neural hidden states.

Using the OpenAI Responses API with a fixed acting model (`gpt-5.6-sol`), we collected 336 responses from a frozen 16-anchor manifest: 216 independent fresh-context responses and 120 responses in 24 branched multi-turn trajectories. The strongest evidence in this study concerns condition sensitivity; the trajectory component should be treated as an initial transition analysis rather than a complete dynamical model. All raw responses were preserved immutably. A distinct model (`gpt-6-sol`) blindly scored all 336 responses, and a second model (`gpt-5.6-terra`) independently scored a fixed 84-response subset for reliability.

Exact-prompt fresh-context repetitions were semantically stable: none of 16 anchors showed non-zero pairwise semantic disagreement across five repetitions. However, paraphrases produced higher full-state distance than exact repetition for 13/16 anchors, and prior-answer exposure produced an excess mean Response State Distance of 0.044965 above the exact-repeat baseline. Premise hardening was not observed in any of 10 eligible trajectories. Relevant verification outperformed irrelevant evidence in the two trajectories eligible for correction analysis, but the denominator was too small for broad generalization. Referent binding met the preregistered change criterion in 2/8 pairs, but both changes were confined to claim state; semantic answer and action did not change, and claim-state inter-rater reliability was only moderate.

Post-hoc robustness checks preserved a positive prior-answer effect after removing low-agreement state components. The results therefore favor a narrower conclusion than generic “answer instability”: semantic answers can remain stable while observable epistemic, action, uncertainty, evidence-use, and context-sensitive response components vary. We refer to this primarily as behavioral-state sensitivity; stronger claims about dynamics require explicit state-transition laws across turns. The study supports black-box L0-L2 input-output claims only and does not establish an internal neural-state mechanism.

## 1. Introduction

LLM reliability is often evaluated by whether a model gives the same answer to the same or semantically equivalent question. This is useful, but incomplete. A response can preserve the same semantic answer while changing confidence, evidence use, action recommendation, abstention behavior, or referent assumptions. Conversely, a visible wording change may be semantically irrelevant.

This study asks whether response variation is better described as unstructured answer instability or as structured black-box behavioral-state sensitivity, with a preliminary transition component. We explicitly separate three processes:

1. **Independent variability:** the same prompt in fresh contexts.
2. **Controlled perturbation sensitivity:** one input factor changes while context is otherwise fresh.
3. **Sequential transition analysis:** conversation state is intentionally continued across turns; this is not yet a fitted dynamical system or state equation.

We define a Behavioral State vector from observable outputs and metadata. The construct is operational rather than neurological: it does not claim access to the model's proprietary latent state.

### Contributions

This work contributes:
- a preregistered 336-response controlled-endpoint protocol;
- a frozen 16-anchor bank spanning factual, reasoning, state-estimation, evidence-hierarchy, and provenance scenarios;
- explicit separation of exact-repeat variability, paraphrase sensitivity, prior-answer path dependence, multi-turn trajectories, verification, and referent binding;
- a multi-component Response State Distance rather than answer-match alone;
- immutable raw capture, blinded model-based scoring, and fixed double-coding of 25% of responses;
- explicit falsification criteria and a claim ceiling that excludes internal-mechanism claims;
- a post-hoc measurement audit showing which conclusions survive removal of lower-reliability score components;
- an explicit distinction between condition sensitivity and a stronger claim of dynamical state-transition laws.

## 2. Related Work

Prior work has shown that semantically equivalent prompts can elicit inconsistent generations and has proposed semantic-consistency metrics that better track meaning than lexical overlap. Raj et al. introduced semantic consistency measures for open-ended LLM outputs and demonstrated stronger alignment with human judgments than lexical matching.

Semantic entropy extends this meaning-level view by estimating uncertainty over semantic answer clusters rather than surface strings. Farquhar et al. showed that semantic entropy can identify confabulation-like hallucinations across tasks, motivating evaluation at the level of meanings rather than token sequences.

Multi-turn work demonstrates that interaction history itself can destabilize answers. The FlipFlop experiment showed that simple challenge prompts such as “Are you sure?” can induce answer flips and accuracy deterioration. He et al. later modeled multi-turn answer instability using Markov chains and investigated whether hidden-state probes could predict future answer changes. Long-horizon agent studies have separately examined goal drift under sustained context.

Recent work also cautions that apparent prompt sensitivity can be inflated by evaluation methodology. Tang et al. found that rigid answer matching and related heuristics can overstate sensitivity, while semantically aware judging reduces measured variance. ProSA separately evaluates instance-level prompt sensitivity using a dedicated sensitivity score and decoding confidence. Rauba et al.'s Distribution-Based Perturbation Analysis (DBPA) goes further by explicitly separating perturbation effects from intrinsic stochastic output variation using empirical null and alternative distributions. These results mean that perturbation analysis itself is not novel here; our differentiated aim is an interpretable, component-wise behavioral-state representation spanning semantic answer, claim status, action, evidence use, uncertainty, referents, and history dependence.

Our contribution is not a new claim that LLMs can be inconsistent. Instead, we test a unified black-box protocol that distinguishes semantic answer flips from changes in epistemic status, action, uncertainty, evidence use, referent representation, and sequential path dependence.

## 3. Preregistered Research Questions and Hypotheses

The preregistration fixed six questions before counted empirical collection:

- **H1:** exact-prompt fresh-context repetitions show non-zero semantic disagreement on at least some anchors;
- **H2:** meaning-preserving paraphrase sensitivity exceeds exact-repeat variability for a subset of anchors;
- **H3:** prior-answer exposure produces measurable path dependence relative to fresh-context controls;
- **H4:** unsupported hypotheses sometimes harden into working premises across turns;
- **H5:** relevant verification reduces error more than irrelevant-evidence control;
- **H6:** explicit referent binding changes claim state or action in some provenance scenarios.

These were pilot, protocol-level hypotheses rather than population effect-size claims.

## 4. Methods

### 4.1 Frozen design

The anchor bank contained 16 non-sensitive scenarios. Independent fresh-context conditions were:
- BASELINE_EXACT: 80 responses;
- PARAPHRASE_A: 32;
- PARAPHRASE_B: 32;
- IRRELEVANT_CONTEXT: 32;
- PRIOR_ANSWER: 32;
- REFERENT_BOUND: 8.

This yielded 216 independent responses.
Six trajectory anchors (R03, R04, S01, S02, P01, P02) were each run in four replicates. Turns 1-3 formed a single trajectory. The exact transcript through turn 3 was then branched into relevant-verification and irrelevant-evidence turn-4 continuations. This yielded 120 trajectory responses across 24 transcript groups.

The frozen denominator was therefore **336 responses**.

### 4.2 Controlled endpoint

The acting cohort used the OpenAI Responses API with requested and returned model `gpt-5.6-sol`. Each independent response was a fresh request with no server-side conversation object or previous-response linkage. Requests used `store=false`, no tools, no retrieval, temperature 1.0, top-p 1.0, and no exposed seed. Trajectory requests replayed the complete intended transcript explicitly.

The counted collection window ran from 2026-10-01T15:50:13Z to 2026-10-01T16:05:59Z. All 336 expected responses were captured. One duplicate uncounted API generation occurred during runner recovery; first-writer raw data remained authoritative and the denominator was not changed.

### 4.3 Behavioral State

Each response was scored into:
- semantic answer class;
- claim state;
- decision or action;
- evidence set;
- referent tuple (entity, environment, version, time);
- uncertainty level (0-4);
- assertion strength (0-4);
- error level (0-2 or null);
- abstention/request behavior;
- whether new supporting evidence was introduced.

Response State Distance (RSD) was defined as the equal-weight mean of available component distances. Semantic class, claim state, action, and abstention used binary mismatch; evidence used Jaccard distance; referent distance was the fraction of material tuple elements that differed; ordinal fields used normalized absolute distance.

### 4.4 Blinded scoring

A distinct model (`gpt-6-sol`) scored all 336 responses using condition-blinded item identifiers. A fixed 84-response subset (25%) was independently scored by `gpt-5.6-terra`. Primary scientific analyses use the primary scores; secondary scores assess evaluator reliability only. Raw responses and score files were append-only and validated structurally before analysis.

### 4.5 Primary analyses

Preregistered endpoints included pairwise semantic disagreement (PSD), modal flip rate, semantic-class entropy, RSD by perturbation family, premise hardening, verification correction, referent-binding changes, and evaluator agreement. No response was removed for being surprising or inconvenient.

## 5. Results

### 5.1 Hypothesis summary

| Hypothesis | Preregistered result | Key quantity |
|---|---|---:|
| H1 exact-repeat semantic instability | Not met | 0/16 anchors with PSD > 0 |
| H2 paraphrase sensitivity | No binary criterion predefined | 13/16 anchors with paraphrase RSD > exact RSD |
| H3 prior-answer path dependence | Met descriptively | excess mean RSD = 0.044965 |
| H4 premise hardening | Not met | 0/10 eligible trajectories |
| H5 verification correction | Met descriptively, very small eligible n | 2/24 eligible; mean paired difference = 1.0 |
| H6 referent binding | Met formal change criterion, weak evidential basis | 2/8 material changes |

### 5.2 Exact repetition: semantic stability, not total state identity

Across five fresh-context BASELINE_EXACT repetitions for each of 16 anchors, every anchor retained the same semantic answer class. Mean PSD, mean modal flip rate, and mean semantic-class entropy were all zero.

However, the full-state exact-repeat mean RSD used as the baseline for H3 was 0.092477. Thus semantic answers were invariant under the study's classifier while other scored response properties were not perfectly invariant. This distinction is central: “same answer” and “same response state” are not equivalent constructs.

### 5.3 Paraphrase sensitivity

Thirteen of sixteen anchors had higher mean paraphrase RSD than their own exact-repeat RSD. The mean anchor-level difference was 0.063918. Semantic-class flip fraction across the matched paraphrase comparisons was zero, while changes occurred in claim state, action, uncertainty, evidence use, abstention, and referent representation.

The largest anchor-level increase occurred for S02 (difference 0.422685), an underdetermined state-estimation/causal-inference scenario. This suggests that linguistically equivalent reformulations can alter how the model frames epistemic and action state even when the top-level semantic answer remains unchanged.

### 5.4 Prior-answer path dependence

Across 32 matched PRIOR_ANSWER versus BASELINE_EXACT pairs, mean RSD was 0.137442 compared with an exact-repeat mean RSD of 0.092477, giving an excess of **0.044965** in the preregistered analysis.

The semantic answer class never flipped. Claim-state flips occurred in 9.375% of pairs and decision/action flips in 18.75%. The effect therefore appeared primarily as a change in how an answer was framed or operationalized rather than as a reversal of the semantic conclusion.

### 5.5 Premise hardening

Ten of 24 trajectories met the preregistered eligibility rule for premise hardening. None crossed from assertion strength <=2 to >=3 without new supporting evidence. H4 was therefore not supported in this cohort.

This null result is informative because the protocol was explicitly designed to detect a hypothesized failure mode. The data do not justify claiming that unsupported hypotheses generally harden into premises under the tested interaction pattern.

### 5.6 Verification

Only two of 24 trajectory groups had scorable non-zero pre-verification error and scorable outcomes in both verification branches. In both eligible cases, relevant evidence reduced the error to zero while irrelevant evidence did not reduce it, yielding a mean paired correction difference of 1.0.

The direction is consistent with H5, but the effective denominator is **2**, not 24. This result should therefore be treated as a successful protocol demonstration with limited evidential breadth rather than a general estimate of verification effectiveness.

### 5.7 Referent binding

The preregistered H6 change criterion was met in 2/8 REFERENT_BOUND comparisons. Error level was unchanged in all eight pairs. A later decomposition showed that both material changes were claim-state flips; semantic answer class and decision/action each changed in 0/8 pairs. This substantially weakens any broad claim that referent binding changed substantive answers in this cohort.

### 5.8 Evaluator reliability

On the fixed 84-response double-coded subset:

| Component | Raw agreement | Cohen's kappa |
|---|---:|---:|
| semantic answer class | 0.9762 | 0.9741 |
| claim state | 0.6905 | 0.4431 |
| decision/action | 0.9048 | 0.8705 |
| abstention/request | 0.7500 | 0.3934 |
| new supporting evidence | 0.8214 | 0.5607 |
| error level | 0.9405 | -0.0219 |

Error-level kappa is dominated by severe prevalence imbalance despite high raw agreement. Referent-tuple whole exact agreement was only 0.1667, although individual tuple components agreed more often. Evidence-set exact agreement was 0.5357 with mean Jaccard similarity 0.7861.

These results show that semantic class and action are comparatively well measured, while claim state, abstention, and free-text referent representation require caution.

## 6. Exploratory Robustness Audit

Because several state components had modest evaluator agreement, we performed a post-hoc sensitivity analysis. This audit does not replace or redefine preregistered endpoints.

| Metric set | H2 positive anchors | H2 mean difference | H3 excess RSD |
|---|---:|---:|---:|
| full preregistered state | 13/16 | 0.063918 | 0.044965 |
| excluding referent tuple | 11/16 | 0.040690 | 0.046875 |
| excluding claim state | 12/16 | 0.064486 | 0.052930 |
| excluding abstention/request | 13/16 | 0.066048 | 0.031055 |
| core without lower-agreement fields | 8/16 | 0.035313 | 0.032188 |
| semantic class + action only | 5/16 | 0.040625 | 0.056250 |

The prior-answer excess remained positive in every reduced metric set, including semantic class plus action only. This makes H3 the most robust positive result in the study. H2 remained directionally positive in aggregate but was more dependent on which components were retained. H6, by contrast, was entirely driven by claim-state changes and should be interpreted cautiously.

## 7. Discussion

### 7.1 From answer instability to behavioral-state sensitivity

The study began from a broad concern that “the same question can produce a different answer.” The controlled results narrow that claim. Under exact fresh-context repetition, semantic answer classes were completely stable across the tested anchors. The strongest empirical signal instead appeared below the level of semantic answer identity.

A model can preserve its nominal conclusion while changing whether it presents the claim as verified, how uncertain it appears, what evidence it invokes, whether it recommends an action, or whether prior conversational material changes its operational stance. This motivates a distinction between **semantic answer stability** and **behavioral-state stability**.

The distinction is practically important. In deployed systems, an unchanged answer label does not guarantee an unchanged decision process or action recommendation. Reliability evaluations that measure only correctness or answer identity may therefore miss operationally relevant variation.

### 7.2 Prior answers as a path-dependent input

The most robust positive finding was prior-answer sensitivity. H3 remained positive after excluding referent, claim-state, or abstention components and remained positive even when distance was restricted to semantic class plus action.

This does not imply a hidden neural state transition. It establishes a narrower black-box fact: adding a prior assistant answer to an otherwise matched fresh-context request changed observable response state more than ordinary exact-repeat variability in this cohort.

### 7.3 Null results constrain the mechanism narrative

H1 and H4 were not supported. These nulls prevent two tempting overclaims: that exact repeated questions routinely cause semantic answer flips, and that unsupported hypotheses naturally harden into asserted premises under the tested trajectories.

A useful response-state theory must therefore accommodate stability as well as change. The relevant phenomenon is conditional sensitivity, not universal drift. The present data do not yet establish a full dynamical system.

### 7.4 Measurement is part of the scientific problem

The reliability audit exposed an important limitation of state-vector evaluation itself. Semantic answer class and action were scored consistently across evaluators, while claim state and referent representation were substantially less stable.

This means a richer state representation can detect variation that answer matching misses, but it also creates new measurement error. Future work should make state dimensions more operational, use constrained ontologies where possible, and include human adjudication or stronger calibration before treating every state component as equally trustworthy.

### 7.5 Heterogeneous sensitivity is not yet anisotropy

The component-wise results suggest that some observable response dimensions are more sensitive than others under the tested perturbations. However, calling the response space *anisotropic* would require a commensurate geometry on the input perturbations: paraphrase, prior-answer exposure, verification evidence, and referent binding do not yet have a shared quantitative perturbation magnitude. The defensible current claim is therefore **heterogeneous component-wise sensitivity under the chosen perturbation operators and state metric**. A future finite-difference study can approach an anisotropy claim only after defining graded perturbation coordinates or otherwise normalizing perturbation strength.

## 8. Limitations

This study has several hard boundaries.

1. **Single acting model and time window.** Results describe one controlled endpoint cohort and should not be generalized to all LLMs.
2. **Small anchor bank.** Sixteen anchors are sufficient for a protocol pilot, not for estimating population prevalence across tasks.
3. **Model-based scoring.** Although scoring was blinded and double-coded, it was not human-validated. Several state dimensions showed only modest inter-rater reliability.
4. **RSD weighting.** The preregistered RSD equal-weights available components. This is transparent but not empirically calibrated to operational importance.
5. **Small H5 denominator.** Only 2/24 trajectories were eligible for verification correction analysis.
6. **H6 measurement dependence.** The formal H6 criterion was satisfied only through claim-state flips, a dimension with moderate reliability.
7. **Backend reproducibility.** The provider did not expose a fixed dated backend snapshot or seed. Requested/returned model identity, timestamps, settings, and raw outputs are preserved, but unexposed backend state remains unknown.
8. **No internal-mechanism inference.** Black-box transitions cannot establish proprietary neural-state dynamics.

## 9. Practical Implications

For LLM reliability testing, the results support a layered evaluation strategy:
- score semantic answer identity separately from response-state changes;
- test prior-answer exposure as its own perturbation rather than treating history as incidental;
- record action changes even when semantic answers remain stable;
- separate fresh-context variability from multi-turn effects;
- preserve verification and irrelevant-evidence controls;
- audit evaluator reliability by state component before interpreting composite metrics.

For production systems, this means “the answer stayed the same” is not a sufficient robustness criterion when downstream action, uncertainty, provenance, or evidence use matters.

## 10. Conclusion

In this preregistered 336-response controlled-endpoint study, repeated exact prompts did not produce semantic answer instability on any of 16 anchors. Yet broader response state was not invariant. Paraphrasing and prior-answer exposure changed measurable aspects of behavior even when semantic answer class remained stable, and the prior-answer effect survived multiple post-hoc reductions of the state metric.

The data therefore support a narrower and more useful formulation than generic answer instability: **LLM responses can exhibit structured behavioral-state sensitivity without semantic answer flips**.

This conclusion remains black-box and cohort-specific. It does not establish an internal neural mechanism, universal instability, or a population-level effect size. The next scientific step is **measurement redesign first**: improve and calibrate the weaker state dimensions, then run a graded finite-difference perturbation study. Cross-model replication should follow after the measurement instrument is demonstrably reliable.

## Reproducibility and Data Availability

The frozen preregistration, anchor bank, 336-row manifest, raw-response validation, scoring protocol, blinded score package, analysis code, result files, and exploratory robustness audit are preserved in the project repository on branch `research/response-dynamics-v01`.

Key integrity checks:
- manifest: 336/336 structurally valid;
- raw collection: 336 unique run IDs and 336 unique API response IDs;
- primary scoring: 336/336;
- secondary scoring: 84/84;
- raw, blind-package, and score validators: PASS.

## References

1. Raj, H., Gupta, V., Rosati, D. A., & Majumdar, S. (2023). *Semantic Consistency for Assuring Reliability of Large Language Models*. arXiv:2308.09138. https://doi.org/10.48550/arXiv.2308.09138
2. Farquhar, S., Kossen, J., Kuhn, L., & Gal, Y. (2024). *Detecting hallucinations in large language models using semantic entropy*. Nature, 630, 625-630. https://doi.org/10.1038/s41586-024-07421-0
3. Laban, P., Murakhovs'ka, L., Xiong, C., & Wu, C.-S. (2023). *Are You Sure? Challenging LLMs Leads to Performance Drops in The FlipFlop Experiment*. arXiv:2311.08596. https://doi.org/10.48550/arXiv.2311.08596
4. Tang, K., Gu, J., Wong, E., & Qin, Y. (2025). *Flaw or Artifact? Rethinking Prompt Sensitivity in Evaluating LLMs*. arXiv:2509.01790. https://doi.org/10.48550/arXiv.2509.01790
5. He, J., Ramachandran, R., Ramachandran, N., Katakam, A., Zhu, K., Dev, S., Panda, A., & Shrivastava, A. (2025). *Modeling and Predicting Multi-Turn Answer Instability in Large Language Models*. arXiv:2511.10688. https://doi.org/10.48550/arXiv.2511.10688
6. Arike, R., Donoway, E., Bartsch, H., & Hobbhahn, M. (2025). *Evaluating Goal Drift in Language Model Agents*. Proceedings of the AAAI/ACM Conference on AI, Ethics, and Society, 8(1), 192-203. https://doi.org/10.1609/aies.v8i1.36541
7. Zhang, C., Dai, X., Wu, Y., Yang, Q., Wang, Y., Tang, R., & Liu, Y. (2025). *A Survey on Multi-Turn Interaction Capabilities of Large Language Models*. arXiv:2501.09959. https://doi.org/10.48550/arXiv.2501.09959
8. Zhuo, J., Zhang, S., Fang, X., Duan, H., Lin, D., & Chen, K. (2024). *ProSA: Assessing and Understanding the Prompt Sensitivity of LLMs*. arXiv:2410.12405. https://doi.org/10.48550/arXiv.2410.12405
9. Rauba, P., Wei, Q., & van der Schaar, M. (2024). *Quantifying perturbation impacts for large language models*. arXiv:2412.00868. https://doi.org/10.48550/arXiv.2412.00868

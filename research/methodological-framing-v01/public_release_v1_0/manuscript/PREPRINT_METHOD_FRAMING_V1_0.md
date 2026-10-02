# Methodological Framing Induces Replicable Research-Plan Signatures in Large Language Models

## A preregistered black-box study with cross-task and cross-model replication

**Preprint draft v1.0 — 2026-10-03**

## Abstract

Large language models can be instructed to approach the same research objective using different methodological frames, but it is unclear whether such framing produces reproducible changes in observable research behavior rather than superficial wording differences. We tested this question in a black-box, preregistered program that held research objectives and generation settings fixed while varying only methodological framing.

Study A generated 336 research plans using seven framing families: generic, differential/local-sensitivity, Bayesian, falsification-first, causal-inference, state-space, and software-testing. The primary LABEL_ONLY treatment used method names without operational instructions. A frozen deterministic measurement masked explicit method labels and a broad canonical method lexicon, represented plans with unigram/bigram TF-IDF features, and evaluated cross-task recoverability with cosine nearest-centroid classification and 10,000-label-permutation inference.

In Study A, cross-task framing classification reached 119/252 = 0.4722 versus a 1/7 = 0.1429 chance reference (permutation p = 0.000100). A secondary OPERATIONAL condition produced higher cross-task accuracy, 66/84 = 0.7857. The effect was heterogeneous across method families.

A preregistered external replication added 378 fresh plans. R1a introduced a new manufacturing/materials task using the original model and achieved 369/504 = 0.7321 across four cross-task transfer directions (p = 0.000100). R1b repeated the original tasks with a second model and achieved 120/252 = 0.4762 (p = 0.000100). Both preregistered replication criteria were satisfied.

Post-hoc zero-cost robustness analyses using only existing counted data showed that the signal survived simultaneous model-and-task transfer (accuracy 0.4762, p = 0.000100) and same-task cross-model transfer (0.7401, p = 0.000100), while a structure-only classifier using document length, section allocation, line counts, bullets, numbering, and related formatting features did not exceed chance. These results support a narrow claim: methodological framing produces reproducible, task-general and model-replicable differences in the lexical/strategic content of free-form LLM research plans. The study does not identify hidden chain-of-thought, neural mechanisms, methodological superiority, or guaranteed downstream decision changes.

---

## 1. Introduction

Prompting effects in large language models are well established, and prior work has shown that reasoning strategies, role instructions, and structured prompting procedures can influence model behavior and task performance. A stronger and more specific question is whether a named scientific methodology functions as a reproducible behavioral treatment when the research objective itself is held constant.

Consider a model given the same empirical research problem under seven different instructions: use a generic best-judgment approach, a differential/local-sensitivity approach, a Bayesian approach, a falsification-first approach, a causal-inference approach, a state-space approach, or a software-testing approach. A trivial outcome would be lexical imitation: the model repeats the method name but otherwise constructs essentially the same research plan. A stronger outcome would be a reproducible shift in the substantive structure and strategy of the plan that remains detectable after explicit method labels and canonical method vocabulary are masked.

This project tests the stronger black-box hypothesis.

The broader research program was formulated as:

[
M \rightarrow Z_{plan} \rightarrow E_{selected} \rightarrow Y_{conclusion}
]

where:

- (M) is methodological framing;
- (Z_{plan}) is observable research-plan structure/content;
- (E_{selected}) is evidence selected or requested;
- (Y_{conclusion}) is the resulting interpretation or conclusion.

The present paper focuses primarily on the first link, (M \rightarrow Z_{plan}), because that stage produced complete preregistered evidence and external replication. Later stages were treated as separate measurement problems rather than assumed to follow automatically from the planning result.

### Contributions

This work makes five narrow contributions.

1. It treats methodological framing as a randomized experimental factor while holding the research objective fixed.
2. It uses LABEL_ONLY framing as the primary treatment to reduce tautology from directly prescribing operational steps.
3. It freezes a deterministic, judge-free measurement before counted analysis.
4. It prospectively replicates the effect on both a new task and a second model.
5. It shows, with zero-new-call robustness tests, that the replicated signal is not explained by gross document formatting alone.

The claim is deliberately behavioral. The experiment does not observe hidden reasoning traces, internal model states, or neural mechanisms.

---

## 2. Related Work and Novelty Boundary

Several adjacent literatures make broad claims about prompting and reasoning strategy unavailable as novelty claims here.

Work on reasoning strategies has shown that models can follow different prompted reasoning procedures and that no single strategy dominates all tasks. Style-oriented benchmarks similarly treat thinking style as an experimental factor. Research on chain-, tree-, and graph-structured reasoning demonstrates that prompt structure can alter reasoning topology. Other work has framed prompting itself as behavioral experimentation on opaque models. Research-planning benchmarks evaluate whether models can generate scientific plans, while agentic benchmarks study grounding, recovery, and evidence-seeking behavior.

These literatures imply that the following statements are not novel:

- prompts alter LLM behavior;
- named reasoning strategies can steer outputs;
- different reasoning procedures can change task performance;
- structured workflows can affect intermediate reasoning or verification behavior.

The narrower contribution tested here is different:

> Hold the scientific objective fixed, randomize methodological framing, and test whether the resulting free-form research plans contain reproducible, task-general and model-replicable signatures after direct method labels and broad canonical method terminology are masked.

A second methodological distinction is important. Directly instructing a model to include specific Bayesian, causal, falsification, or testing operations can create a tautological measurement: the model is scored for including exactly what it was explicitly told to include. The primary treatment therefore uses LABEL_ONLY framing. OPERATIONAL instructions are retained only as a secondary contrast.

---

## 3. Research Program

### 3.1 Primary behavioral hypothesis

The core Study A hypothesis was:

[
M \not\perp Z_{plan}
]

under a fixed research objective and fixed generation settings.

Operationally, if methodological framing has a reproducible effect on plan construction, a classifier trained to distinguish method-framed plans on one task should recover framing labels above chance on a different task.

### 3.2 Why cross-task transfer matters

Within-task classification can exploit task-specific vocabulary. Cross-task transfer imposes a stronger constraint: the method-linked signature must recur when the substantive research problem changes.

### 3.3 Claim ceiling

Even strong classification does not establish:

- access to chain-of-thought;
- internal neural-state changes;
- a causal neural mechanism;
- superiority of one methodology;
- universal generalization to arbitrary models, languages, or domains.

The estimand is observable black-box research-plan behavior.

---

## 4. Study A

### 4.1 Design

Study A used seven methodological framing families:

1. GENERIC
2. DIFFERENTIAL
3. BAYESIAN
4. FALSIFICATION
5. CAUSAL
6. STATE_SPACE
7. SOFTWARE_TESTING

Two instruction depths were used:

- **LABEL_ONLY** — the primary treatment;
- **OPERATIONAL** — a secondary treatment that specified procedural content more directly.

Two substantive tasks were used:

- **T1:** variation in repeated large-language-model responses to the same question;
- **T2:** persistent completion-time differences across workplace sites using the same nominal process.

The frozen counted denominator was:

- LABEL_ONLY: 252 plans;
- OPERATIONAL: 84 plans;
- total: 336 plans.

Each plan was generated from a fresh API request with no prior conversation and no external tools or evidence.

Generation settings were fixed:

- acting model: gpt-5.6-sol;
- store = false;
- max_output_tokens = 8000;
- temperature = 1.0;
- top_p = 1.0;
- reasoning effort = none.

Counted runs at freeze: 0.

### 4.2 Measurement

The primary measurement was deterministic and judge-free.

Before feature extraction, explicit method names and a broad canonical method lexicon were masked. Plans were represented using word unigram and bigram TF-IDF features. A cosine nearest-centroid classifier was trained on one task and evaluated on the other.

The chance reference was:

[
1/7 = 0.142857.
]

Randomization inference used 10,000 label permutations.

### 4.3 Preregistered success rule

The primary LABEL_ONLY result was considered confirmatory if:

1. the combined one-sided permutation p-value was (le 0.01);
2. T1 -> T2 accuracy exceeded 1/7;
3. T2 -> T1 accuracy exceeded 1/7.

---

## 5. Study A Results

### 5.1 Integrity

Validation passed:

- raw records: 336/336;
- unique response IDs: 336/336;
- LABEL_ONLY: 252;
- OPERATIONAL: 84;
- counted runs at freeze: 0.

### 5.2 Primary LABEL_ONLY result

| Direction | Correct | Accuracy |
|---|---:|---:|
| T1 -> T2 | 61/126 | 0.4841 |
| T2 -> T1 | 58/126 | 0.4603 |
| Combined | 119/252 | **0.4722** |

Chance reference: 0.1429.

The 10,000-permutation p-value was:

[
p = 0.000100.
]

The preregistered confirmatory success criterion was satisfied.

### 5.3 Method-family heterogeneity

Pooled LABEL_ONLY recall was:

| Family | Recall |
|---|---:|
| GENERIC | 0.0000 |
| DIFFERENTIAL | 0.0000 |
| BAYESIAN | 0.8889 |
| FALSIFICATION | 0.1944 |
| CAUSAL | 0.6111 |
| STATE_SPACE | 1.0000 |
| SOFTWARE_TESTING | 0.6111 |

The aggregate effect therefore does not imply that all methodological frames form equally distinct classes. In the original Study A classifier, GENERIC and DIFFERENTIAL were not recoverable as their own classes.

### 5.4 Secondary OPERATIONAL result

The secondary OPERATIONAL condition achieved:

- T1 -> T2: 36/42 = 0.8571;
- T2 -> T1: 30/42 = 0.7143;
- combined: 66/84 = **0.7857**;
- permutation p = 0.000100.

The OPERATIONAL-minus-LABEL_ONLY accuracy difference was approximately +0.3135.

This secondary result is consistent with stronger procedural specification producing a stronger observable plan signature, but it is not part of the primary confirmatory criterion.

---

## 6. External Replication R1

R1 was frozen and collected after Study A completion. It added 378 fresh counted plans and reused the frozen Study A measurement unchanged.

### 6.1 R1a — New task, original model

R1a introduced a new materials/manufacturing task:

> Why do nominally identical 3D-printed polymer test coupons exhibit persistent differences in tensile strength, which measurable manufacturing or testing factors account for those differences, and what observations would distinguish competing explanations?

Acting model: gpt-5.6-sol.

New counted plans: 126.

The preregistered transfer directions were:

| Direction | Correct | Accuracy |
|---|---:|---:|
| T1 -> T3 | 88/126 | 0.6984 |
| T3 -> T1 | 80/126 | 0.6349 |
| T2 -> T3 | 108/126 | 0.8571 |
| T3 -> T2 | 93/126 | 0.7381 |
| Combined | 369/504 | **0.7321** |

10,000-permutation p = 0.000100.

All four directional accuracies exceeded chance, satisfying the preregistered R1a success rule.

### 6.2 R1b — Second model, original tasks

R1b used a second acting model:

- gpt-6-luna.

The original T1 and T2 objectives were preserved.

New counted plans: 252.

| Direction | Correct | Accuracy |
|---|---:|---:|
| T1 -> T2 | 72/126 | 0.5714 |
| T2 -> T1 | 48/126 | 0.3810 |
| Combined | 120/252 | **0.4762** |

10,000-permutation p = 0.000100.

The preregistered R1b success rule was satisfied.

### 6.3 R1b method-family heterogeneity

Pooled recall:

| Family | Recall |
|---|---:|
| GENERIC | 0.1111 |
| DIFFERENTIAL | 0.0000 |
| BAYESIAN | 0.9167 |
| FALSIFICATION | 0.4444 |
| CAUSAL | 0.2500 |
| STATE_SPACE | 0.7222 |
| SOFTWARE_TESTING | 0.8889 |

The replication preserved the main qualitative pattern: strong aggregate recoverability with substantial heterogeneity across framing families.

### 6.4 Joint replication conclusion

R1a success: TRUE.
R1b success: TRUE.

Therefore:

> **Joint external replication support = TRUE.**

Within the frozen measurement, the Study A effect generalized both to a new substantive task and to a second acting model.

---

## 7. Zero-Cost Robustness Using Existing Counted Data

After completion of Study A and R1, no new model calls were required for the following analyses.

Complete counted plans available:

- Study A: 336;
- R1: 378;
- total: 714.

The cross-model/task robustness analyses used the 630 LABEL_ONLY plans.

### 7.1 Simultaneous model and task shift

Frozen text measurement:

| Transfer | Accuracy |
|---|---:|
| SOL T1 -> LUNA T2 | 0.5000 |
| SOL T2 -> LUNA T1 | 0.3968 |
| LUNA T1 -> SOL T2 | 0.5476 |
| LUNA T2 -> SOL T1 | 0.4603 |
| Combined | **0.4762** |

10,000-permutation p = 0.000100.

Thus the method-linked signature remained detectable when both the acting model and task changed simultaneously.

### 7.2 T3 / second-model bridge

| Transfer | Accuracy |
|---|---:|
| SOL T3 -> LUNA T1 | 0.5635 |
| SOL T3 -> LUNA T2 | 0.5635 |
| LUNA T1 -> SOL T3 | 0.3413 |
| LUNA T2 -> SOL T3 | 0.6508 |
| Combined | **0.5298** |

10,000-permutation p = 0.000100.

### 7.3 Same-task cross-model transfer

Combined same-task cross-model accuracy:

[
0.7401
]

with 10,000-permutation p = 0.000100.

This was stronger than simultaneous model-and-task transfer, suggesting that task identity is an important moderator of framing signatures.

### 7.4 Structure-only negative control

A separate classifier discarded lexical content and used only gross structural quantities, including:

- total document length;
- section word allocation;
- line counts;
- bullet counts;
- numbering;
- headings;
- paragraph counts;
- sentence counts;
- related formatting features.

Results:

- simultaneous model + task shift: 0.1468, p = 0.320068;
- T3 / second-model bridge: 0.1389, p = 0.785921.

These values were near the 1/7 chance reference.

Therefore, the replicated signal is not explained by gross document length, section allocation, or formatting structure alone. The evidence is more consistent with a lexical/strategic plan signature after direct method labels and broad canonical method terminology have been masked.

---

## 8. Heterogeneity and Task Dependence

Under simultaneous model-and-task shift, pooled recall was:

- GENERIC = 0.028;
- DIFFERENTIAL = 0.000;
- BAYESIAN = 0.806;
- FALSIFICATION = 0.375;
- CAUSAL = 0.569;
- STATE_SPACE = 0.875;
- SOFTWARE_TESTING = 0.681.

Under the T3/second-model bridge:

- GENERIC = 0.111;
- DIFFERENTIAL = 0.097;
- BAYESIAN = 0.681;
- FALSIFICATION = 0.625;
- CAUSAL = 0.847;
- STATE_SPACE = 0.764;
- SOFTWARE_TESTING = 0.583.

Under same-task cross-model transfer:

- GENERIC = 0.736;
- DIFFERENTIAL = 0.542;
- BAYESIAN = 0.806;
- FALSIFICATION = 0.611;
- CAUSAL = 0.764;
- STATE_SPACE = 0.861;
- SOFTWARE_TESTING = 0.861.

This pattern suggests that GENERIC and DIFFERENTIAL are comparatively task-dependent, whereas BAYESIAN, FALSIFICATION, CAUSAL, STATE_SPACE, and SOFTWARE_TESTING more often retain recognizable signatures across both task and model changes.

This observation is exploratory with respect to comparative family stability. It does not support ranking methodologies by quality or scientific validity.

---

## 9. Downstream Boundary Studies

The broader program asked whether planning effects propagate into later research stages. Separate calibration gates were used rather than assuming downstream transfer.

### 9.1 Study B — Fixed-evidence interpretation

Study B attempted to estimate:

[
M \rightarrow Y_{conclusion} \mid E = E^*
]

where all conditions received the same evidence packet.

Two preregistered calibration instruments failed their GO gates:

- v0.1 combined accuracy = 0.1429;
- v0.2 combined accuracy = 0.1905.

Counted Study B remained zero.

The program therefore does not claim that the observed planning signatures reliably alter conclusions under fixed evidence.

### 9.2 Study C — Adaptive evidence selection

Study C targeted:

[
M \rightarrow E_{selected}
]

under an adaptive evidence-selection environment.

Calibration v0.2 passed its GO gate:

- combined accuracy = 0.4286;
- permutation p = 0.000300;
- non-generic recall coverage = 4/6.

A counted Study C was frozen at n = 252. Collection stopped after 93 valid trajectories because further paid API generation was prohibited.

The 93 partial trajectories are preserved but not interpreted confirmatorily. The frozen denominator was not completed.

### 9.3 Study D — Structured evidence assimilation

Study D calibration failed its preregistered gates across tested evidence levels. Counted Study D remained zero.

### 9.4 Boundary implication

The full program therefore supports a planning-stage effect but does not yet establish a general downstream causal chain from methodology instruction through evidence selection to final conclusion.

This distinction is scientifically important:

[
M \rightarrow Z_{plan}
]

has replicated evidence, whereas later links remain unconfirmed or incomplete.

---

## 10. Discussion

### 10.1 Main finding

The strongest supported conclusion is:

> Methodological framing produces preregistered, externally replicated, task-general and model-replicable differences in the lexical/strategic content of free-form LLM research plans, beyond explicit method labels and gross document-format structure.

This is stronger than the generic statement that prompts affect model outputs. The primary treatment used method labels without directly prescribing the operational steps on which a model might later be scored, and the effect survived cross-task and cross-model transfer under a frozen deterministic measurement.

### 10.2 What the classifier is detecting

Because explicit method labels and broad canonical method vocabulary were masked, and because the structure-only negative control failed, the signal cannot be reduced to either direct label repetition or gross formatting.

The remaining discriminative content is best described conservatively as a **lexical/strategic signature**: differences in how the model describes variables, comparisons, measurements, tests, evidence, stopping logic, and research operations.

The current design does not identify a unique causal decomposition of those features.

### 10.3 LABEL_ONLY versus OPERATIONAL framing

The much higher OPERATIONAL accuracy suggests that procedural specificity amplifies observable framing signatures. However, stronger OPERATIONAL separation is partly expected because those prompts directly prescribe more structure.

For causal interpretation of a method name itself, LABEL_ONLY remains the cleaner primary treatment.

### 10.4 Why the negative results matter

The failed Study B and Study D gates and the incomplete Study C counted run constrain the broader theory.

A planning-stage signature does not automatically imply:

- changed evidence evaluation;
- changed final conclusion;
- improved scientific quality;
- stable downstream behavior in structured environments.

The program therefore rejects a simple model in which methodological framing uniformly propagates through every stage of LLM research behavior.

---

## 11. Limitations

### 11.1 Model coverage

The confirmatory and replication evidence covers two acting models. That is materially stronger than a single-model result but insufficient for universal claims about LLMs.

### 11.2 Task coverage

Three substantive tasks were used: LLM response variation, workplace process variation, and 3D-printed materials variation. Broader domain coverage would be required for general scientific-agent claims.

### 11.3 Language

The counted research prompts were evaluated within the language/form used in the frozen study. Cross-language generalization was not tested.

### 11.4 Measurement interpretation

Classification accuracy establishes recoverable differences, not a complete semantic explanation of those differences.

The TF-IDF measurement is intentionally transparent and reproducible, but it does not identify a minimal set of causal features.

### 11.5 Family imbalance in recoverability

Method families were balanced in sample count but not in classification difficulty. GENERIC and DIFFERENTIAL were consistently less task-general than several other families.

### 11.6 No quality ranking

Recoverability is not scientific quality.

A highly distinctive plan can be poor science, and a less distinctive plan can be excellent science. This study does not rank methodologies.

### 11.7 No hidden-state access

No chain-of-thought or internal neural state was observed. All conclusions are based on externally observable generated plans and metadata.

### 11.8 Downstream evidence remains incomplete

The fixed-evidence and structured-assimilation studies did not pass their calibration gates, and the adaptive evidence-selection counted study was stopped before its frozen denominator was complete.

---

## 12. Reproducibility

The project preserves:

- preregistration documents;
- frozen task and method banks;
- frozen manifests;
- frozen deterministic measurement code;
- raw counted outputs and API metadata;
- validation scripts;
- permutation-analysis code;
- final result files;
- external replication freeze records;
- zero-cost robustness scripts and outputs.

Core counted datasets:

- Study A: n = 336;
- R1: n = 378;
- total complete counted plans: n = 714.

Partial Study C trajectories are stored separately and excluded from confirmatory interpretation.

Paid model generation is disabled for the current project. Publication synthesis and robustness work use existing data only.

---

## 13. Data and Code Availability

The prepared public release package includes:

1. frozen Study A preregistration and manifest;
2. frozen R1 preregistration and manifests;
3. the deterministic measurement implementation;
4. sanitized counted plan records for all 714 complete Study A/R1 plans;
5. reproduction and validation code;
6. analysis scripts;
7. zero-cost robustness results;
8. machine-readable final result summaries.

The partial Study C trajectories are intentionally excluded because the frozen denominator was not completed. The release also excludes credentials, API response identifiers and envelopes, timestamps, usage/billing metadata, local filesystem paths, private infrastructure details, and unrelated business data.

---

## 14. Conclusion

Methodological framing is not merely a label-level perturbation in the tested systems. When the scientific objective is held constant, different methodological frames produce research plans whose lexical/strategic signatures remain recoverable across tasks and across two models, even after direct method labels and broad canonical terminology are masked.

The result is robust to a new substantive task, a second acting model, simultaneous model-and-task transfer, and a gross-structure negative control.

At the same time, the program identifies a clear boundary: planning-stage differentiation does not yet justify claims about downstream evidence interpretation, evidence selection, scientific quality, or internal reasoning mechanisms.

The appropriate scientific conclusion is therefore narrow but substantive:

> Methodological framing is a reproducible black-box determinant of free-form LLM research-planning behavior under the tested conditions.

---

## References

1. Yanjian Zhang, Guillaume Wisniewski, Nadi Tomeh, and Thierry Charnois. 2025. "Reasoning Strategies in Large Language Models: Can They Follow, Prefer, and Optimize?" arXiv:2507.11423.

2. Junyu Guo, Shangding Gu, Ming Jin, Costas Spanos, and Javad Lavaei. 2025. "StyleBench: Evaluating thinking styles in Large Language Models." arXiv:2509.20868.

3. Maciej Besta, Florim Memedi, Zhenyu Zhang, Robert Gerstenberger, Nils Blach, Piotr Nyczyk, Marcin Copik, Grzegorz Kwaśniewski, Jürgen Müller, Lukas Gianinazzi, Ales Kubicek, Hubert Niewiadomski, Onur Mutlu, and Torsten Hoefler. 2024. "Topologies of Reasoning: Demystifying Chains, Trees, and Graphs of Thoughts." arXiv:2401.14295.

4. Tengxiao Liu, Qipeng Guo, Yuqing Yang, Xiangkun Hu, Yue Zhang, Xipeng Qiu, and Zheng Zhang. 2023. "Plan, Verify and Switch: Integrated Reasoning with Diverse X-of-Thoughts." Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pp. 2807–2822. DOI: 10.18653/v1/2023.emnlp-main.169.

5. Ari Holtzman and Chenhao Tan. 2025. "Prompting as Scientific Inquiry." arXiv:2507.00163.

6. Thilo Hagendorff, Ishita Dasgupta, Marcel Binz, Stephanie C. Y. Chan, Andrew Lampinen, Jane X. Wang, Zeynep Akata, and Eric Schulz. 2023. "Machine Psychology." arXiv:2303.13988.

7. Zhengliang Shi, Yiqun Chen, Haitao Li, Weiwei Sun, Shiyu Ni, Yougang Lyu, Run-Ze Fan, Bowen Jin, Yixuan Weng, Minjun Zhu, Qiujie Xie, Xinyu Guo, Qu Yang, Jiayi Wu, Jujia Zhao, Xiaqiang Tang, Xinbei Ma, Cunxiang Wang, Jiaxin Mao, Qingyao Ai, Jen-Tse Huang, Wenxuan Wang, Yue Zhang, Yiming Yang, Zhaopeng Tu, and Zhaochun Ren. 2025. "Deep Research: A Systematic Survey." arXiv:2512.02038.

8. Trent Slade. 2026. "Role-Conditioned Instruction Sets for Evaluating Epistemic Behavior in Large Language Models." Zenodo. DOI: 10.5281/zenodo.18402912.

9. Jin Huang, Silviu Cucerzan, Sujay Kumar Jauhar, and Ryen W. White. 2025. "Idea2Plan: Exploring AI-Powered Research Planning." arXiv:2510.24891.

10. Jiaqi Shao, Yuxiang Lin, Munish Prasad Lohani, Yufeng Miao, and Bing Luo. 2025. "Do LLM Agents Know How to Ground, Recover, and Assess? A Benchmark for Epistemic Competence in Information-Seeking Agents." arXiv:2509.22391.

11. Mudit Verma, Siddhant Bhambri, and Subbarao Kambhampati. 2024. "On the Brittle Foundations of ReAct Prompting for Agentic Large Language Models." arXiv:2405.13966.

12. Ranjita Naik, Varun Chandrasekaran, Mert Yuksekgonul, Hamid Palangi, and Besmira Nushi. 2024. "Diversity of Thought Improves Reasoning Abilities of LLMs." arXiv:2310.07088.

13. Yitian Li, Jidong Tian, Hao He, and Yaohui Jin. 2024. "Hypothesis Testing Prompting Improves Deductive Reasoning in Large Language Models." arXiv:2405.06707.

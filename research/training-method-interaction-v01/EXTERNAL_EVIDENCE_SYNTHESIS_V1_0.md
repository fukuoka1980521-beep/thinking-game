# External Evidence Synthesis v1.0

Status: BACKGROUND / THEORY SUPPORT — NOT PROJECT EMPIRICAL EVIDENCE
Date: 2026-10-03

## Purpose

Use external published documentation to interpret what each OLMo 2 post-training stage is actually optimizing. These sources constrain interpretation but do not substitute for the project's own BASE/SFT/DPO/RLVR comparison.

## OLMo 2 lineage

Official OLMo 2 documentation identifies the 7B sequence:
BASE → SFT → DPO → final Instruct (RLVR).

The corrected post-trained checkpoints replaced earlier preview checkpoints after a pre-tokenization mismatch was discovered. The project therefore uses only corrected non-preview checkpoints.

## BASE: repertoire formation

OLMo 2 7B is a fully open base model trained with a staged pretraining recipe and approximately 4 trillion training tokens. The OLMo 2 paper emphasizes both general pretraining and late-stage specialized data mixtures.

Interpretive role:
- broad knowledge/procedure repertoire;
- no direct optimization for following a user's named methodology.

## SFT: instruction routing

Tülu 3's public post-training recipe reports 939,344 prompts in the broad prompt pool, with approximately 57% from public resources and 43% synthetically generated. SFT mixtures target general instruction following, math, grade-school math, code, science and other skills.

Interpretive role:
- strengthens mapping from user instruction to an appropriate task behavior;
- may expose latent pretrained capabilities more reliably rather than creating all underlying knowledge from scratch.

Project prediction:
- BASE → SFT should show the clearest generic instruction-following jump.

## DPO: selection / preference reshaping

Tülu 3 converts roughly 200k–300k prompts into preference data using both off-policy and on-policy model responses. Responses are judged on dimensions including helpfulness, instruction-following, honesty and truthfulness; chosen/rejected pairs are then used for preference optimization.

Interpretive role:
- changes which plausible response policies are selected/preferred;
- may improve organization and alignment;
- may reduce or reshape behavioral diversity.

Project prediction:
- SFT → DPO may change method-family confusion/diversity even when generic compliance is already high.

## RLVR: verifiable-outcome optimization

Tülu 3/OLMo 2 final-stage RLVR uses verifiable tasks including GSM, MATH and instruction-following constraints. Official reports describe gains over DPO on MATH, GSM8K and IFEval, with some improvements also observed on tasks not directly optimized.

Interpretive role:
- reinforces policies that succeed under externally checkable outcomes/constraints;
- may selectively strengthen verification, explicit checking, constraint satisfaction and stopping logic.

Project prediction:
- DPO → RLVR should not automatically strengthen every methodology equally;
- SOFTWARE_TESTING and possibly FALSIFICATION are directional candidates for selective amplification because they naturally emphasize checks, failure conditions and stopping/pass-fail criteria.

## Important interpretation boundary

Training stage is not a single isolated variable:
- datasets change;
- objectives change;
- optimization procedures change;
- interface/chat formatting changes after BASE.

Therefore the study estimates the behavioral effect of the **post-training stage package**, not a pure mechanistic causal effect of one optimizer.

## Related representation evidence

Recent external work on representation geometry reports systematic representational changes across pretraining, SFT, DPO and RLVR, including different geometry/diversity effects. This supports the plausibility that post-training stages alter internal organization, but it does not establish that named methodologies correspond to fixed internal vectors.

The present project remains black-box behavioral unless a later activation/intervention study is performed.

## Sources checked

- Team OLMo et al. (2024/2025), OLMo 2 paper, arXiv:2501.00656.
- Lambert et al. (2024), Tülu 3, arXiv:2411.15124.
- Ai2 Tülu 3 technical documentation/blog and dataset documentation.
- AllenAI Hugging Face model cards for OLMo-2-1124-7B-SFT, DPO and Instruct/RLVR.
- Li et al. (2025), representation geometry across pretraining/post-training, arXiv:2509.23024.

## Current strongest theoretical model

Observed methodological behavior is modeled as:

Pretraining repertoire
× instruction routing
× preference selection
× verifier/search policy
× task
× runtime method instruction
→ observable research plan.

This is a testable behavioral decomposition, not a claim that each training stage maps one-to-one onto a human cognitive faculty.

## Diversity / convergence evidence

Additional external studies strengthen an important competing interpretation.

### Instruction tuning and DPO can narrow output diversity
Recent work examining open model lineages including OLMo/OLMo 2 reports a measurable diversity gap after instruction tuning, with DPO producing a particularly large reduction in output diversity in the tested narrative-generation setting.

Implication for this project:
- post-training may improve instruction compliance while narrowing the set of strategies actually sampled;
- weaker MethodFraming separation at DPO would therefore be scientifically meaningful, not automatically a failed model;
- within-cell diversity must be measured alongside classification accuracy.

### Representation geometry changes across stages
Recent representation-geometry work across OLMo/Pythia reports stage-dependent geometric changes across pretraining, SFT, DPO and RLVR. The paper associates post-training stages with different compression/expansion dynamics and reports reduced generation diversity under some later-stage conditions.

Implication:
- provides independent plausibility for stage-dependent policy compression;
- does **not** establish that the same internal mechanism causes this project's behavioral observations;
- motivates, but does not replace, the project's black-box diversity measurement.

Additional sources checked:
- Peeperkorn et al. (2025), *Mind the Gap: Conformative Decoding to Improve Output Diversity of Instruction-Tuned Large Language Models*, arXiv:2507.20956.
- Li et al. (2025), *Tracing the Representation Geometry of Language Models from Pretraining to Post-training*, arXiv:2509.23024.
- Slocum et al. (2025), *Diverse Preference Learning for Capabilities and Alignment*, arXiv:2511.08594.

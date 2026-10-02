# External Replication R1 Preregistration v1.0

Status: FROZEN BEFORE COUNTED REPLICATION COLLECTION

## Purpose
Replicate the Study A methodological-framing effect across:
1. a new substantive task domain while retaining the original acting model; and
2. a second acting model while retaining the original T1/T2 tasks.

Study A is not modified. The frozen Study A deterministic measurement is reused unchanged.

## Prior-result separation
Study A was completed before R1 design.
The success rules below are frozen before any counted R1 response is generated.
A non-research API smoke request was used only to verify that gpt-6-luna accepts the same generation settings; it is not experimental data.

## Frozen measurement
Use `FROZEN_STUDY_A_MEASUREMENT_V1_0.py` unchanged:
- broad explicit method labels and canonical method-specific lexicon are masked;
- word unigram + bigram TF-IDF;
- training-task-only IDF for classification;
- cosine nearest-centroid method classification;
- 10,000-permutation one-sided randomization inference;
- chance reference = 1/7.

No LLM judge is used.

## Framing conditions
Use the exact seven LABEL_ONLY framing instructions from `FROZEN_STUDY_A_METHOD_BANK_V1_0.json`:
GENERIC, DIFFERENTIAL, BAYESIAN, FALSIFICATION, CAUSAL, STATE_SPACE, SOFTWARE_TESTING.

No OPERATIONAL condition is included in R1.

## R1a — new-task replication
Acting model: gpt-5.6-sol

T3 objective is frozen in `FROZEN_REPLICATION_R1_TASK_BANK_V1_0.json`.
It is a materials/manufacturing problem selected after Study A completion but before any R1a counted output.

Design:
- T3 only
- 7 method families
- 18 fresh independent plans per family
- denominator = 126

Generation:
- fresh API request per plan
- no prior conversation
- no tools or external evidence
- store=false
- max_output_tokens=8000
- temperature=1.0
- top_p=1.0
- reasoning effort=none

Evaluation uses frozen Study A LABEL_ONLY T1/T2 plus new T3:
- T1 -> T3
- T3 -> T1
- T2 -> T3
- T3 -> T2

For each permutation, training labels for T1, T2 and T3 are independently permuted once; the same permuted T3 labels are reused for both T3-outgoing directions.

R1a success requires:
- combined four-direction permutation p <= 0.01; AND
- all four directional accuracies > 1/7.

## R1b — second-model replication
Acting model: gpt-6-luna

Tasks:
- exact frozen Study A T1 and T2 objectives

Design:
- 2 tasks
- 7 method families
- 18 fresh independent plans per task x family cell
- denominator = 252

Generation settings are identical to R1a / Study A.

Evaluation:
- exact Study A primary cross-task procedure
- T1 -> T2
- T2 -> T1
- 10,000 permutations

R1b success requires:
- permutation p <= 0.01; AND
- T1 -> T2 accuracy > 1/7; AND
- T2 -> T1 accuracy > 1/7.

## Joint interpretation
External replication support is declared only if both R1a and R1b satisfy their preregistered success rules.
Failure of either component is reported as failed or partial external replication; N is not increased after observing results.

## Integrity
- R1a denominator = 126.
- R1b denominator = 252.
- total new counted denominator = 378.
- first valid write for a run_id is authoritative.
- incomplete/failed technical attempts are logged but not counted.
- all raw request/response metadata is preserved.
- response IDs must be unique within R1 and must not overlap Study A.
- no post-result modification of measurement, task, model, success rule, or denominator.

## Claim ceiling
A successful R1 supports cross-task and cross-model reproducibility of an observable black-box research-plan signature induced by methodological framing.
It does not reveal hidden chain-of-thought, identify neural mechanisms, or establish that any methodology is superior.

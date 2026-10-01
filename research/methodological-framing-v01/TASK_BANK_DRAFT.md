# Task Bank Draft

Status: not frozen.

## Why more than one task is eventually required

No research problem is method-neutral. A causal question naturally favors causal inference; a reliability question may favor software testing; a sequential problem may favor state-space reasoning.

Therefore a single-task result can establish that framing changes behavior **for that task**, but cannot support a general claim about methodological framing.

The first study can use the flagship task for continuity. A later replication should use structurally different tasks and explicitly estimate method-by-task interaction.

## T1 窶・Flagship: LLM response variability

Objective:

> Design a rigorous empirical study to determine whether the same large-language-model question can produce meaningfully different responses, why such changes occur, and how to distinguish true response instability from ordinary wording variation.

Reason:
- directly continuous with Response Dynamics v0.1;
- the motivating observation actually occurred here;
- allows comparison with a completed empirical study without giving the acting model those results.

## T2 窶・Observational intervention problem

Candidate objective:

> Design a rigorous empirical study to determine whether a newly introduced workplace process causes the observed improvement in completion time, why the effect varies across sites, and how to distinguish a genuine causal effect from selection, learning, and measurement artifacts.

Reason:
- structurally different from LLM reliability;
- allows causal/Bayesian framing to have plausible task fit;
- does not privilege state-space or software-testing language.

## T3 窶・Sequential system anomaly problem

Candidate objective:

> Design a rigorous empirical study to determine why a repeated automated process sometimes changes its outcome over time despite nominally identical inputs, and how to distinguish stochastic variation, hidden state, environmental drift, and measurement error.

Reason:
- sequential and systems-oriented;
- allows state-space/testing frames plausible fit;
- supports method-by-task interaction analysis.

## Rule

Do not aggregate across tasks as though they were interchangeable.

Report:
- framing effects within each task;
- replicated effects across tasks;
- method-by-task interactions.

A method that changes planning on only the task naturally aligned with that method is a weaker general result than a method signature that transfers across tasks.

# Study B / C Draft — From Method Frame to Evidence and Conclusion

Status: design draft only.

## Study B — Fixed evidence, different methodology

### Question

If every condition receives the exact same evidence, does methodological framing change interpretation, uncertainty, claim scope, or final conclusion?

[
M
→ Y | E=E^*
]

### Design

Hold fixed:
- research objective;
- evidence packet;
- model;
- context;
- output format;
- token/reasoning budget;
- no external tools.

Randomize only method framing.

The evidence packet should include both supporting and disconfirming observations, null findings, measurement-reliability information, and at least one tempting but weak result.

### Outcomes

Score:
- semantic conclusion class;
- claim strength;
- uncertainty;
- which evidence is treated as decisive;
- which evidence is discounted;
- null-result interpretation;
- limitations retained;
- proposed next experiment.

### Why Study B matters

If conclusions differ here, the difference cannot be attributed to different evidence acquisition. It is a framing-dependent **interpretation effect**.

If semantic conclusions remain stable but claim strength, uncertainty, or next actions differ, that mirrors the Response Dynamics v0.1 finding at the level of research synthesis.

## Study C — Active evidence selection

### Question

When the model can choose what to inspect or test, does methodology change the evidence path and thereby change the final scientific finding?

[
M
→ Z_{plan}
→ E_{selected}
→ Y
]

### Controlled research environment

Do not give unrestricted web access initially. Freeze a finite evidence universe so every run has the same available world.

Candidate evidence modules can be built from the completed Response Dynamics study:
- exact-repeat results;
- paraphrase results;
- prior-answer results;
- trajectory/premise-hardening results;
- verification branches;
- referent-binding results;
- evaluator-reliability results;
- robustness analysis;
- selected raw-response examples;
- related-work summaries.

Each module has an opaque ID during selection to reduce cueing.

### Budget

Each run receives the same:
- maximum evidence modules that may be opened;
- maximum follow-up analysis requests;
- maximum experiment requests;
- total token budget;
- stopping deadline.

The model must choose under scarcity. This makes evidence selection observable.

### Evidence-path outcomes

Record:
- first evidence selected;
- complete ordered evidence sequence;
- ignored evidence;
- requested follow-up analyses;
- whether null/disconfirming evidence is opened;
- whether measurement reliability is inspected before substantive interpretation;
- stopping point;
- final conclusion.

Represent the evidence path as an ordered sequence:

[
E^{(m)}=(e_1,e_2,...,e_k).
]

Then compare:
- evidence-set overlap;
- sequence edit distance;
- early-selection divergence;
- proportion of budget spent on confirming vs disconfirming evidence;
- whether reliability/measurement evidence is inspected.

### Mediation logic

The most interesting pattern would be:

[
M
→ E_{selected}
→ Y
]

where methodology changes what evidence is inspected, and evidence-path differences explain part of the conclusion difference.

A second pattern is:

[
M
→ Y even when E is fixed,
]

which Study B measures.

Together they separate:
1. interpretation effects;
2. evidence-acquisition effects.

## Critical confounds to control

### Method fit
A method may naturally fit one task better than another. Use at least two substantially different research objectives before broad claims.

### Prompt-content tautology
Operational prompts can directly name the desired design features. Use label-only and operational-depth variants.

### Output-format contamination
Common headings must remain method-neutral.

### Resource asymmetry
All conditions get equal evidence and compute budgets.

### Model stochasticity
Fresh repetitions per condition are required; compare between-method variation against within-method variation.

### Scoring error
Research-plan and conclusion-state coders must be condition-blinded and reliability-audited.

### Researcher degrees of freedom
Freeze method bank, task bank, scoring schema, evidence universe, and analysis before counted runs.

## Claim ceiling

A positive result supports:

> Methodological framing causally changes observable research behavior under controlled prompting conditions.

It does not by itself support:

> Different hidden internal variables were directly observed.

The latter remains an internal-mechanism hypothesis unless white-box evidence is added.

# OLSR Pre-Data Freeze — v0.5

**Freeze date:** 2026-09-27  
**Status:** FROZEN BEFORE FIRST PROSPECTIVE TARGET EVENT  
**Prospective target events at freeze:** **0**  
**Matched controls at freeze:** **0**  
**Base commit:** `3f4528b6173d797d8016194ee7a52360783c55eb`

## 1. Why freeze now

OLSR has now reached the point where the case definition, matching rule, feature vocabulary, missingness handling, analysis lenses, anti-overfit checks, answer-variance comparison, and hallucination competing-hypothesis framework are executable.

Continuing to redesign the method before any natural case appears would create unnecessary researcher degrees of freedom.

This freeze therefore marks the boundary between:

- **method construction**, and
- **prospective natural-case accumulation**.

From this point forward, the default action is to gather ordinary-work evidence, not to keep improving the method.

## 2. Frozen research decisions

The following are frozen for the current prospective phase.

### Intake

- natural ordinary work only;
- no research-created failure, task, prompt, or control;
- target eligibility uses the frozen operational intake conditions;
- every prospective record uses complete `1 / 0 / null` assessment for the core feature vocabulary;
- privacy review and source-backed evidence references are mandatory.

### Case roles

- `TARGET_EVENT`
- `MATCHED_ORDINARY_CONTROL`

Controls never increase target-event N, project count, track count, or readiness.

### Matched control rule

`NEAREST_PRIOR_ORDINARY_SAME_PROJECT`

No suitable control → leave the target unmatched.

### Analysis

Candidate-structure naming requires all currently implemented gates:

- `n >= max(24, 2 × eligible structured features)`;
- at least 3 projects;
- at least 2 target tracks;
- leave-one-out first-component stability;
- first structured component above the column-wise permutation-null 95th percentile;
- binary/categorical MCA available;
- SVD/MCA top-feature convergence.

SVD/MCA on the same cases are sensitivity analyses, not independent replications.

### Interpretation

Even after candidate-structure readiness:

- no causal claim;
- no population prevalence estimate;
- no claim about transformer/model-internal hidden states;
- no automatic Development OS promotion;
- no assumption that a component label is an ontology.

## 3. Frozen open hypotheses

OLSR does **not** freeze one hallucination cause as correct.

The hallucination registry remains a set of competing explanations, including:

- evidence disconnect;
- source/version identity mismatch;
- temporal mismatch;
- context/memory contamination;
- unsupported inference presented as fact;
- completion/helpfulness pressure;
- tool-result misread/partiality;
- source-of-truth hierarchy conflict;
- confidence calibration failure;
- possible Local Task Momentum contribution.

The older idea that value/cost scoring alone suppresses hallucination remains **insufficient as a general rule**.

## 4. Answer-variance boundary

Cross-chat instability is evaluated on:

- core claims;
- evidence basis;
- decision boundary;
- next action.

Wording, tone, length, ordering, and examples alone are not failures.

A `MATERIAL_VARIANCE_REVIEW` flag is not automatically:
- hallucination;
- evidence that one answer is wrong;
- evidence of a latent factor.

## 5. Allowed changes after this freeze

Without creating a new research phase, only the following are allowed:

- typographical/documentation corrections that do not change meaning;
- security/privacy hardening that can only reduce exposed data;
- CI/runtime compatibility repair that preserves valid-input outputs;
- deterministic bug fixes where current implementation contradicts the already-frozen written protocol.

Any such change must:
1. cite the exact defect;
2. state whether any existing prospective cases are affected;
3. preserve the prior version in Git history;
4. add a dated correction note.

## 6. Changes that require a new protocol phase or explicit post-start amendment

The following are not silent maintenance:

- adding/removing a core feature;
- changing target eligibility;
- changing the matched-control rule;
- changing `1/0/null` semantics;
- changing readiness thresholds;
- changing permutation/MCA/LOO logic for a desired result;
- adding a new analysis method because current results are unattractive;
- changing track definitions;
- changing interpretation rules.

After the first prospective target is captured, any material method change must be declared **POST_START_METHOD_CHANGE**, with:
- reason independent of desired result;
- affected cases;
- old-pipeline result retained;
- new-pipeline result reported as sensitivity or new phase;
- no deletion or replacement of the prior result.

## 7. First checkpoint

Until **8 prospective TARGET_EVENT cases across at least 2 projects and 2 tracks**, the default research state is:

`ACCUMULATE_ONLY`

Before that checkpoint:
- do not name a latent factor;
- do not tune thresholds from the case pattern;
- do not add methods because a decomposition is uninteresting.

The 8-case checkpoint permits an exploratory integrity review, not a confirmatory conclusion.

## 8. Historical boundary

The frozen six STGR episodes remain:
`HISTORICAL_NOT_PROSPECTIVE`

They contribute **0** to OLSR prospective N.

## 9. Machine-verifiable baseline

See:
`FROZEN_BASELINE_MANIFEST.json`

It records the base commit and Git blob SHA for the critical protocol, schema, analysis, intake, and CI files at the pre-data boundary.

---

**Research-state decision:**  
`STOP_PRE_DATA_METHOD_EXPANSION / START_NATURAL_ACCUMULATION`

# Research 2 Design — Local Behavioral Sensitivity Map

Status: DESIGN DRAFT — do not collect counted data yet.

## 1. Research question

**When a large language model's semantic conclusion remains stable, which observable behavioral dimensions are locally stable, sensitive, or history-dependent under controlled input perturbations?**

The target is not an internal neural Jacobian. The target is a black-box, finite-difference map from controlled input perturbation operators to observable response-state changes.

## 2. What Research 1 established

Research 1 showed:
- exact fresh-context semantic classes were stable across 16 anchors;
- paraphrase and prior-answer conditions produced broader response-state changes;
- prior-answer excess RSD remained positive under multiple robustness reductions;
- premise hardening was not observed in 10 eligible trajectories;
- measurement reliability was strong for semantic class/action but weaker for claim state, abstention, and referent tuple.

Therefore Research 2 must improve the measurement instrument before increasing the empirical denominator.

## 3. What is already known in prior work

Perturbation analysis itself is not novel.

- ProSA measures prompt sensitivity at the instance level.
- Distribution-Based Perturbation Analysis (DBPA) explicitly separates perturbation effects from intrinsic stochastic output variation using empirical null and alternative distributions.
- Other work studies semantic consistency, prompt-format sensitivity, paraphrase robustness, and multi-turn answer instability.

**Candidate differentiated contribution:** an interpretable vector-valued sensitivity map over behavioral components, including history, evidence, and referent/provenance dimensions, with component-specific measurement reliability and explicit baseline-noise subtraction.

Novelty remains provisional until a deeper literature audit is complete.

## 4. Mathematical object

Let an externally observable input configuration be

[
z=(x,h,e,r),
]

where (x) is the current prompt, (h) is explicit conversation history, (e) is supplied evidence, and (r) is referent/provenance binding.

Let the scored output state be

[
S(z)=[s_1,ldots,s_m].
]

For a perturbation operator (P_k),

[
Delta_{j,k}(z)=d_jig(S_j(P_k z),S_j(z)ig),
]

where (d_j) is a component-appropriate distance.

Because the model is stochastic, the relevant comparison is not raw perturbation distance alone. Define a fresh-context baseline noise floor

[
B_j(z)=E[d_j(S_j^{(a)}(z),S_j^{(b)}(z))].
]

Then define excess component sensitivity

[
E_{j,k}=E[Delta_{j,k}]-E[B_j].
]

The matrix

[
M=[E_{j,k}]
]

is the primary **Behavioral Sensitivity Matrix**.

### Important terminology rule

Do **not** call (M) a Jacobian merely because it is a matrix of perturbation effects.

A finite-difference Jacobian surrogate is only defensible when a perturbation family has an ordered or quantitative coordinate (lambda_k), so that

[
G_{j,k}approx rac{E_j(lambda_k+delta)-E_j(lambda_k)}{delta}
]

has an interpretable denominator.

Without a defined perturbation magnitude, use:
- behavioral sensitivity matrix;
- directional perturbation contrast;
- finite-difference response profile.

"Empirical Jacobian surrogate" is reserved for graded perturbation axes with a preregistered scale.

## 5. Measurement redesign before any counted study

Research 2 does **not** begin with more API calls. It begins with instrument calibration.

### 5.1 Replace weak state dimensions

#### Claim state
Current free-form interpretation is too scorer-dependent.

Replace it with a constrained evidential-status ontology:
- VERIFIED_BY_SUPPLIED_EVIDENCE
- SUPPORTED_INFERENCE
- HYPOTHESIS
- UNKNOWN_OR_UNRESOLVED
- CONTRADICTED
- NOT_APPLICABLE

Each label must have decision rules and anchor-specific examples.

#### Abstention
Do not compress several behaviors into one field.

Split into:
- answer_given: yes/no
- asks_for_more_information: yes/no
- defers_or_refuses: yes/no
- verification_required_before_action: yes/no

#### Referent
Do not use free-text referent tuples for the main endpoint.

For each anchor, preregister canonical candidate IDs for:
- entity;
- environment;
- version;
- time frame.

Scorers select IDs or UNKNOWN, enabling exact component agreement.

#### Evidence
Use anchor-specific evidence IDs rather than free-text evidence descriptions.

### 5.2 Calibration gate

Before preregistration, create a non-counted calibration set and independently score it with:
- primary model scorer;
- secondary model scorer;
- human adjudication on disagreements.

Minimum target reliability before freezing:
- semantic class: kappa >= 0.85;
- action class: kappa >= 0.80;
- evidential/claim state: kappa >= 0.70;
- each referent component: kappa >= 0.80;
- answer/ask/defer/verify booleans: kappa >= 0.80.

If claim or referent fails the gate, redesign the rubric again. Do not compensate by increasing sample size.

## 6. Perturbation axes

Use a small number of interpretable perturbation families. Each family is evaluated separately; cross-family comparisons require normalization.

1. **Paraphrase axis**
   - preserve proposition and task;
   - use three preregistered lexical/syntactic divergence levels;
   - semantic equivalence must be independently verified before use.

2. **History-pressure axis**
   - no prior answer;
   - tentative prior answer;
   - confident prior answer;
   - optionally conflicting prior answer as a separate direction, not merely a stronger level.

3. **Evidence axis**
   - no added evidence;
   - irrelevant evidence;
   - weakly relevant evidence;
   - decisive relevant evidence.
   Relevance and evidential strength must be anchor-defined, not improvised after outcomes.

4. **Referent-specificity axis**
   - unbound;
   - partially bound;
   - fully bound with entity/environment/version/time.

The first study should not attempt every possible perturbation family. Four well-defined axes are preferable to a large heterogeneous catalog.

## 7. Recommended counted design after calibration

Use fewer anchors but deeper local mapping.

Candidate design:
- 8 anchors selected before outcome inspection;
- 5 exact baseline repetitions per anchor;
- 4 perturbation families;
- 3 graded levels where a valid ordering exists;
- 3 fresh repetitions per level;
- matched execution window and endpoint settings.

Approximate denominator:

[
8\times(5+4\times3\times3)=328
]

before any optional validation branches.

This is intentionally close to Research 1 in cost while being much deeper per anchor. The purpose is not a larger N; it is identification of local sensitivity structure.

## 8. Primary hypotheses

### R2-H1 — semantic stability with non-semantic sensitivity
For at least two preregistered perturbation families, semantic-class excess sensitivity remains near the baseline noise floor while at least one preregistered non-semantic component shows positive excess sensitivity.

### R2-H2 — history selectivity
Prior-answer/history perturbation produces greater excess sensitivity in action or evidential status than matched irrelevant-context perturbation.

### R2-H3 — perturbation-by-component interaction
Sensitivity profiles differ across perturbation families; the same state components are not uniformly sensitive to every perturbation direction.

### R2-H4 — graded finite-difference response
For at least one preregistered perturbation axis with an ordered intensity scale, one or more state components show a monotonic or approximately monotonic finite-difference response.

R2-H4 is the gate for using the term **empirical Jacobian surrogate** in later work.

## 9. What Research 2 should not claim

Do not claim:
- an internal neural Jacobian;
- a true derivative with respect to natural language in the absence of a defined perturbation coordinate;
- anisotropy of the full LLM response space before perturbation magnitudes are commensurate;
- universal dynamics from one model family;
- that every observed state change is model change rather than scoring error.

The strongest defensible target is:
**component-specific black-box sensitivity above a measured stochastic and scoring noise floor.**

# Preregistration — Response Dynamics v0.1

Freeze date: 2026-10-01  
Status: frozen before counted empirical runs

## Research questions

- **RQ1 Existence:** Does exact-prompt fresh-context variation occur at semantic/decision level, not only wording?
- **RQ2 Sensitivity:** Which controlled perturbations move which Behavioral State components?
- **RQ3 Path dependence:** Does prior-answer/context exposure alter later state beyond fresh-context baseline?
- **RQ4 Error dynamics:** Does an unsupported premise persist, amplify, decay, or harden into downstream premise/action?
- **RQ5 Verification:** Does relevant evidence correct state more reliably than irrelevant-evidence control?
- **RQ6 Referent/provenance:** Does explicit entity/environment/version/time binding reduce material claim/action errors?

## Hypotheses

- H1: Exact-prompt repetitions show non-zero semantic disagreement on at least some anchors.
- H2: Meaning-preserving paraphrase sensitivity exceeds exact-repeat variability for a subset of anchors.
- H3: Prior-answer exposure produces measurable path dependence relative to fresh-context controls.
- H4: Unsupported hypotheses sometimes harden into working premises across turns.
- H5: Relevant verification reduces error more than irrelevant evidence.
- H6: Explicit referent binding changes claim state/action in some identity/provenance scenarios.

These are pilot hypotheses, not population effect-size claims.

## Cohorts

### A — controlled endpoint
Use a fixed explicit model identifier/settings where available. Record provider, exact model/version, temperature/top-p/seed if exposed, prompt hashes, tool/retrieval state, and timestamp.

### B — ChatGPT product field cohort
Record visible configuration, project/chat context, fresh vs continued chat, memory setting if known, actual tools/retrieval, and timestamp. Unobservable routing/backend state is UNKNOWN.

A and B are never pooled without stratification.

## Frozen anchor bank

Use only `ANCHOR_BANK.json` v0.1.0:
- 16 non-sensitive anchors;
- closed factual/reasoning;
- evidence hierarchy;
- state estimation/uncertainty;
- referent/provenance.

No anchor replacement after outcomes are seen. Additions require a new version/phase.

## Independent-run plan per anchor

- BASELINE_EXACT: 5 fresh-context repetitions.
- PARAPHRASE_A: 2 fresh repetitions.
- PARAPHRASE_B: 2 fresh repetitions.
- IRRELEVANT_CONTEXT: 2 fresh repetitions.
- PRIOR_ANSWER: 2 fresh repetitions.
- REFERENT_BOUND: 2 fresh repetitions for provenance anchors only.

Independent-run total:
- 16 anchors × 13 = 208;
- plus 4 provenance anchors × 2 = 8;
- **216 responses**.

## Sequential trajectory plan

Six frozen trajectory anchors:
- R03, R04, S01, S02, P01, P02.

Each trajectory has four turns:
1. initial question/observation;
2. follow-up that invites inference/reuse;
3. downstream decision/action request;
4. evidence update.

For each anchor:
- 4 replicate base trajectories through turns 1–3;
- after turn 3, freeze the exact transcript;
- branch that same transcript into two turn-4 continuations:
  - relevant verification evidence;
  - irrelevant evidence control.

Per replicate:
- turns 1–3: 3 responses;
- relevant turn 4: 1 response;
- irrelevant-control turn 4: 1 response;
- total 5 responses.

Total:
- 6 anchors × 4 replicates × 5 responses = **120 responses**.

## Frozen denominator

Primary cohort total:
- independent: 216;
- sequential: 120;
- **336 responses per model/cohort**.

The generated manifest is the denominator. Do not add repetitions because early results are noisy or interesting.

## Sequential prompt rule

For each anchor/replicate, turns 1–3 are run once. Their exact transcript is then replayed/cloned into two branches. Only the turn-4 evidence differs. This prevents stochastic divergence in turns 1–3 from contaminating the verification comparison.

No context reset inside turns 1–3. The two turn-4 branches must receive an identical frozen turn1–3 transcript.

## Scoring

Raw responses are immutable.

A separate blinded scorer produces the Behavioral State Vector.

At least 25% of responses receive a second independent score:
- categorical raw agreement;
- Cohen's kappa;
- ordinal exact/within-one agreement;
- blind adjudication where practical.

The acting model's self-rating is never ground truth by itself.

## Ground truth

Assign `error_level` only where defensible evidence/reference exists.

For underdetermined state-estimation anchors, the reference target may be:
- maintain multiple hypotheses;
- mark uncertainty;
- seek discriminating evidence.

Do not force binary correctness where the prompt is genuinely underdetermined.

## Primary endpoints

1. Pairwise Semantic Disagreement and Modal Flip Rate under exact repetition.
2. Response State Distance by perturbation family.
3. Premise Hardening Rate.
4. Relevant-verification correction versus irrelevant-evidence control.
5. Referent-binding claim/action correction.

## Exclusions

Exclude before outcome analysis only if:
- no usable response/request failure;
- known model/provider change violates frozen condition;
- frozen prompt was not delivered;
- independent run accidentally inherited experimental conversation;
- specified tool/source was unavailable and this materially changes the condition.

Do not exclude surprising/inconvenient responses.

## Stopping

Version 0.1 completes when the frozen 336-response manifest for the selected model/cohort is executed and scored.

If operational limits prevent completion, report partial completion against 336; do not redefine the denominator.

## Claim hierarchy

- L0: variation exists.
- L1: structured dynamics/sensitivity reproduce.
- L2: controlled input intervention changes observable state.
- L3: internal neural mechanism — out of scope.

## Alternative explanations kept live

- backend/model routing;
- retrieval/tool variability;
- evaluator noise;
- wording sensitivity without temporal dependence;
- context/memory contamination;
- source/referent mismatch;
- ordinary factual uncertainty;
- product updates over calendar time.

## Historical boundary

Earlier answer-variance anecdotes and the STGR operational cases motivate this study but are not counted in this prospective dataset.

# Historical Calibration Report — Frozen STGR Six Episodes

**Date:** 2026-09-27  
**Dataset role:** `HISTORICAL_NOT_PROSPECTIVE`  
**Purpose:** analysis-method calibration only  
**Prospective count contribution:** **0**

## 1. Why this calibration exists

The six frozen STGR episodes were mapped into the latent-state feature vocabulary only to test whether the new analysis pipeline behaves sensibly on real, source-backed cases.

They are not reused as new evidence and are not counted toward the prospective latent-state phase.

## 2. Coding rule

The historical records were not originally collected with the 22-feature latent-state schema.

Therefore:
- a feature is coded `1` only when the frozen source directly supports its presence;
- a feature is **not** coded `0` merely because the old record did not mention it;
- unestablished features remain `null`.

This deliberately produces sparse coverage.

## 3. Calibration result

With a 60% minimum observed-coverage threshold, the historical six do **not** provide enough observed 0/1 variation for a defensible semantic structured-feature SVD.

Expected analyzer status:

`structured_feature_svd.status = INSUFFICIENT_OBSERVED_VARIATION`

This is the correct outcome.

The historical set contains mostly documented positive trigger features and many fields that were never prospectively assessed as absent. Treating the unmentioned fields as zero would manufacture negative evidence.

## 4. Important methodological discovery

The first v0.1 prototype placed `feature` and `feature__UNKNOWN` columns in the same SVD matrix.

A dry-run showed that dominant components could then be driven by **observation coverage** — which fields happened to have been recorded — rather than by the task/agent state we intended to study.

That would create an attractive but misleading latent structure.

Protocol Amendment 001 corrects this before any prospective case exists:

- semantic feature structure and missingness structure are analyzed separately;
- every future case explicitly carries 1 / 0 / null for every core feature;
- missingness gets its own diagnostic SVD;
- historical and prospective dataset roles cannot be pooled by default.

## 5. Coverage snapshot

Highest historical observation coverage:

- `local_success_signal`: 3/6
- `measurement_conflict`: 3/6
- `local_failure_signal`: 2/6
- `completion_signal`: 2/6
- `evidence_gap`: 2/6
- `source_identity_divergence`: 2/6
- `goal_relation_ambiguity`: 2/6

All observed values in this sparse historical mapping are presence records (`1`), not balanced presence/absence assessments. That is another reason not to extract semantic factors from this calibration set.

## 6. Practical consequence

Prospective natural-case capture must assess the full feature vocabulary at the time of the case:

- `1` = observed
- `0` = explicitly assessed and not observed
- `null` = unknown/not assessed

This makes future covariance/decomposition interpretable without retroactively inventing absence.

## 7. Research interpretation

**No latent factor is claimed from the six historical episodes.**

The useful result of this calibration is methodological: it found and removed a missingness-confounding path before prospective accumulation began.

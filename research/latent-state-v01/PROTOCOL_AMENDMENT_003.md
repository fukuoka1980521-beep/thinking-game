# Protocol Amendment 003 — Matched Ordinary Controls

**Date:** 2026-09-27  
**Timing:** adopted before the first prospective OLSR target event was captured.

## Problem

If OLSR records only interesting failures/near-misses, it can discover co-occurring features inside problematic cases but cannot tell whether those features are actually unusual. A feature that appears in every ordinary development task could look important simply because no ordinary comparison exists.

## Correction

Prospective records now distinguish:

- `TARGET_EVENT`
- `MATCHED_ORDINARY_CONTROL`

When an eligible natural target event occurs and source-backed ordinary trace evidence exists, select at most one control using the frozen preference:

`NEAREST_PRIOR_ORDINARY_SAME_PROJECT`

The control must:
- already exist in the normal workflow;
- come from the same project;
- precede the target event;
- not itself meet a target-event eligibility condition;
- not already be reused as a control when an unused eligible ordinary trace is available.

If no suitable control exists, leave the target unmatched.

## Analysis separation

- latent SVD/MCA/LDA/readiness calculations use TARGET_EVENT cases only;
- matched controls are not allowed to inflate target-event N, project count, track count, or readiness;
- controls produce a separate descriptive paired feature contrast;
- no matched contrast is interpreted causally.

## Privacy and selection audit

Every prospective record now carries:
- case_role
- matched_case_id
- eligibility_basis
- materiality_reason
- selection_rule
- privacy_review

Raw private conversations, credentials, customer-identifying content, or unnecessary personal detail must not enter the research record.

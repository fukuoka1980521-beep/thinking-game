# OLSR Operational Intake — v0.5

This layer turns the prospective protocol into a reproducible operational intake without manufacturing research data.

## Flow

```
ordinary authorized work
→ source-backed material event appears naturally
→ triage_natural_event.py
→ CAPTURE_ELIGIBLE_TARGET or NOT_CAPTURE_ELIGIBLE
→ optional select_matched_control.py against already-existing ordinary traces
→ capture_case.py
→ analyzer / readiness gate
```

## Hard boundaries

- Triage eligibility is **not** a truth judgment.
- A target event does not count as evidence for a latent factor by itself.
- The selector never creates an ordinary task for research.
- If no suitable prior ordinary trace exists, the target remains unmatched.
- A matched control is descriptive specificity evidence only, never causal evidence.
- Raw private chats, credentials, customer-identifying content, and unnecessary personal detail are not accepted as research records.

## Triage conditions

At least one protocol condition must be source-backed and material:

- GLOBAL_REASSESSMENT_TRIGGER
- MATERIAL_ANSWER_VARIANCE
- UNSUPPORTED_FACTUAL_CLAIM_OR_NEAR_MISS
- SOURCE_IDENTITY_OR_VERSION_MISMATCH
- TEMPORAL_FRESHNESS_MISMATCH
- TOOL_RESULT_MISREAD_OR_OVERGENERALIZATION
- CONTEXT_OR_MEMORY_CONTAMINATION
- PREMATURE_CLOSURE_SCOPE_OR_DESTRUCTIVE_PRESSURE

## Control selection

Frozen selector:

`NEAREST_PRIOR_ORDINARY_SAME_PROJECT`

Eligible ordinary trace:
- already existed in normal workflow;
- same project;
- earlier than target;
- ordinary_eligible=true;
- target_event_eligible=false;
- not already used as control when an unused eligible trace exists;
- privacy review passed;
- evidence refs present;
- complete 1/0/null core feature assessment available.

The selector's output is a case draft. It does not append data automatically.

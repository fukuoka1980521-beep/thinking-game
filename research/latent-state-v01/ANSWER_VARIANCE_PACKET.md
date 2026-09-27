# Cross-Chat Answer Variance Packet

Use `scripts/compare_answer_pair.py` only when two answers are candidates for a materially same-question comparison.

Do not compare raw prose directly as the primary endpoint.

Each answer should be reduced to privacy-safe structured fields:

- `question_fingerprint`
- `context_fingerprint`
- `evidence_refs`
- `model_or_route`
- `core_claims`
- `decision`
- `next_actions`

The comparator deliberately treats wording, tone, ordering, and examples as irrelevant unless they alter a core claim or action.

A `MATERIAL_VARIANCE_REVIEW` flag means:

> the important answer changed while the structured context/evidence/model route did not explain the change.

It does **not** tell us which answer is correct and does **not** by itself establish hallucination.

If a flagged pair is material and naturally occurring, it can become a prospective `ANSWER_VARIANCE` case after source-backed review.

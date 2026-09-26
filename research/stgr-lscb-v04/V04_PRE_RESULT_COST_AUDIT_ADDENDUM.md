# STGR / LSCB v0.4 — Pre-result Cost Audit Addendum

Date: 2026-09-26
Status: FROZEN BEFORE v0.4 RESULT REVIEW

The packaged automated analyzer reports mean tokens and latency per model call.

That is not sufficient for H4 cost interpretation because Condition D makes two model calls per turn (executor + evaluator), while A/B/C make one.

Final H4 reporting must therefore include:
- model calls per run;
- total tokens per run;
- summed model-call latency per run;
- D/C ratios on those per-run totals.

Per-call averages may be shown, but must not be used alone to characterize the total cost of the independent-evaluator intervention.

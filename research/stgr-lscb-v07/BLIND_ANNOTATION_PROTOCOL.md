# v0.7 Blind Bottleneck Annotation Protocol

Purpose: label whether continuing the current local task is still the highest-value next move, using only history available at the checkpoint.

Annotators MUST NOT see:
- trajectory source name beyond a blind ID,
- future Owner intervention,
- future_validation,
- stored label,
- SUCCESS/FAILURE counterfactual outcome.

For each checkpoint return exactly:
- PRIMARY: YES / NO / UNCERTAIN
- CONFIDENCE: 1..5
- REASON: one sentence

Definitions:
- YES = continuing/replanning the current local task remains a defensible highest-value next move for the global goal.
- NO = attention should shift to a higher-level bottleneck, architecture, measurement, or different task.
- UNCERTAIN = the history does not support a stable distinction.

Selection gate for counterfactual experiment:
1. Obtain one source-stripped GPT-5.6 Sol annotation and one independent Gemini annotation.
2. Retain only checkpoints where both annotators agree YES or NO.
3. Require at least 3 retained YES and 3 retained NO checkpoints.
4. Do not use future_validation to resolve disagreements.
5. Group by trajectory in analysis; multiple checkpoints from one trajectory are not independent replicates.

This annotation is about global relevance, not about whether the last local step succeeded.

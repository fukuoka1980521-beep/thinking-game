# Prompt and Task Bank Draft v1.0

Status: DRAFT — NOT FROZEN

## Design principle

Keep the substantive research objective identical across training stages. Vary only MethodFraming. Avoid chat-specific language that makes BASE artificially fail.

## Neutral output contract

Ask for a research plan under the same headings:
- Objective and scope
- Assumptions
- Research design
- Data or evidence needed
- Measurement
- Analysis
- Decision / stopping rule
- Limitations

No methodology-specific operations are required by the output contract.

## Method-framing conditions

Primary LABEL_ONLY wording candidates:
- GENERIC: Use your best general research judgment.
- DIFFERENTIAL: Use a differential / local-sensitivity methodological approach.
- BAYESIAN: Use a Bayesian methodological approach.
- FALSIFICATION: Use a falsification-first methodological approach.
- CAUSAL: Use a causal-inference methodological approach.
- STATE_SPACE: Use a state-space methodological approach.
- SOFTWARE_TESTING: Use a software-testing methodological approach.

Do not include examples of the expected method operations in the primary condition.
## Task candidates

### T1 — Repeated LLM response variation
Why can repeated responses to the same question differ, which observable factors account for the variation, and what observations would distinguish competing explanations?

### T2 — Workplace process-time variation
Why do sites using the same nominal work process show persistent completion-time differences, which measurable factors account for those differences, and what observations would distinguish competing explanations?

### T3 — 3D-printed material variation
Why do nominally identical 3D-printed polymer coupons show persistent tensile-strength differences, which measurable manufacturing/testing factors account for them, and what observations would distinguish competing explanations?

### T4 — Held-out candidate, not yet frozen
A domain should be chosen that is structurally different from T1–T3 and not dominated by a methodology already embedded in the problem statement. Candidate domains: logistics reliability, agricultural yield variation, or energy-consumption anomalies.

## BASE versus chat checkpoint handling

Two prompt renderings should be frozen before execution:

A. Completion-neutral rendering:
A plain text research objective + framing instruction + neutral headings request. No system role required.

B. Native-chat rendering:
Use each checkpoint's documented chat template but preserve exactly the same user-visible instruction text.

Primary comparison should use one rendering consistently where all stages can generate valid outputs. The second rendering is a sensitivity analysis, not a post-hoc rescue.
## Template fairness gate

Before counted execution:
- verify tokenizer and EOS behavior;
- verify no checkpoint receives extra methodology hints through system prompts/templates;
- verify maximum output budget is identical;
- verify decoding settings are identical;
- record exact rendered prompt bytes/hashes for each stage;
- freeze model repository revision or checksum;
- freeze llama.cpp/runtime version if quantized local inference is used.

Any stage-specific prompt repair after counted collection begins invalidates a clean causal TrainingStage comparison.

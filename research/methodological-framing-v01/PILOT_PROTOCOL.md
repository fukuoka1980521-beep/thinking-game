# Non-counted Pilot Protocol

Status: **PILOT ONLY 窶・NOT PREREGISTERED, NOT COUNTED**

## Purpose

Test whether the proposed Research Plan State instrument can detect systematic differences caused by methodological framing before any full experiment is frozen.

## Fixed objective

All conditions receive the exact same research objective from `METHOD_BANK_DRAFT.json`.

## Experimental factor

Only the methodological framing block changes.

Conditions:
- CONTROL
- DIFFERENTIAL
- BAYESIAN
- FALSIFICATION
- CAUSAL
- STATE_SPACE
- SOFTWARE_TESTING

## Acting model

- model: `gpt-5.6-sol`
- endpoint: OpenAI Responses API
- store: false
- tools: none
- external evidence: none
- server-side prior-response linkage: none
- fresh request per run
- reasoning effort: medium
- max output tokens: 3500

## Pilot size

3 fresh repetitions per condition:

[
7 ﾃ・3 = 21
]

These 21 plans are **not scientific results**. They exist to:
1. test feasibility;
2. identify ambiguous score fields;
3. observe whether condition differences are large enough to motivate a preregistered Study A;
4. redesign the measurement instrument before freezing it.

## Required generation format

Each acting-model response uses the same **method-neutral** headings:
- objective and scope;
- assumptions;
- research design;
- data or evidence needed;
- measurement;
- analysis;
- decision / stopping rule;
- limitations.

The common template deliberately does **not** require hypotheses, controls, falsification tests, causal variables, state variables, or testing terminology. Those are measured outcomes. This avoids injecting the very methodological features the experiment is intended to observe.

## Scoring

Plans will be condition-blinded before scoring. A scorer will extract the structured fields in `RESEARCH_STATE_SCHEMA.json`.

Pilot interpretation must focus on:
- scorer ambiguity;
- condition separability;
- fields with floor/ceiling effects;
- whether the method frame merely changes vocabulary or changes design choices.

No hypothesis testing or publication claim is permitted from the pilot.

## Known pilot confound 窶・instruction length

The minimal CONTROL instruction is substantially shorter than the six operational method instructions (approximately 12 words versus 25-31 words).

Therefore the pilot must **not** interpret CONTROL-versus-method differences as method-specific causal effects. Extra instruction length/detail may itself change plan richness.

This is acceptable only because the pilot's purpose is instrument validation.

The confirmatory Study A must add a length/detail-matched generic control so it can separate:
- generic extra-instruction effects;
- methodology-specific framing effects.

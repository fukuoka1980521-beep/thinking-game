# Template Smoke Amendment 2 — 2026-10-03

Status: PRE-PILOT CALIBRATION AMENDMENT

## Evidence available when this amendment was made

Observed condition only:
- TrainingStage: BASE
- MethodFraming: GENERIC
- Task: T1
- counted 72-run pilot outputs observed: 0/72

No BAYESIAN, SOFTWARE_TESTING, SFT, DPO or RLVR method-conditioned pilot output had been examined.

## BASE COMMON_RAW v2 observation

The neutral completion scaffold successfully prevented the immediate-EOS failure seen in v1.

Observed under CPU preselection:
- non-empty research-plan continuation;
- prompt tokens: 116;
- generated tokens: 1200, reaching the configured maximum;
- prompt speed: approximately 14.02 tokens/s;
- generation speed: approximately 4.12 tokens/s;
- elapsed request time: approximately 299.4 seconds.

The early output was relevant to the research objective, but the continuation became increasingly diffuse at long length and did not reliably reproduce all requested section headings.

## Conceptual correction: validity is not instruction compliance

The original smoke gate risked treating failure to reproduce 6/8 exact headings as an invalid research plan.

That would confound the new study's central object:
BASE has not received instruction tuning, so weaker adherence to a formatting instruction is itself a possible TrainingStage effect.

Therefore two quantities are separated before any method-family pilot comparison:

1. Plan validity:
   - non-empty;
   - at least 100 words;
   - no refusal;
   - no chat-template corruption tokens;
   - addresses the supplied objective.

2. Generic instruction compliance:
   - exact heading presence;
   - structural adherence;
   - output-length behavior;
   - other method-neutral instruction-following measures.

Instruction compliance remains an outcome/control and is not used to exclude BASE merely for lacking chat-style obedience.

## Uniform output cap amendment

The calibration pilot maximum is reduced from 1200 to 512 generated tokens for every TrainingStage and MethodFraming cell.

Reasons:
- BASE reached the 1200-token limit rather than naturally stopping;
- later text drifted away from the core task;
- 512 tokens is sufficient for a compact research-plan signature calibration;
- the shorter common cap materially reduces local CPU/GPU execution time;
- the change is made before any method-family or cross-stage pilot comparison.

## New manifest

- rows: 72
- methods: GENERIC / BAYESIAN / SOFTWARE_TESTING
- tasks: T1 / T2
- replicates: 3/cell
- manifest SHA256:
  52e6680ccf9563285b32f233bb1a2e46ba18a83fd8acbea0907252283ad00ff6
- raw rendering:
  COMMON_RAW_V2_NEUTRAL_SCAFFOLD
- max generated tokens:
  512

## Integrity boundary

This amendment uses only interface/performance evidence from BASE/GENERIC/T1.
It cannot be justified by the TrainingStage × MethodFraming outcome because that outcome had not yet been observed.

No paid API or paid compute was used.

# NEW LIFE — Gemini Migration Location / Consumption Compatibility V1

Status: EVALUATION CONSTRAINT / NO PRODUCTION CHANGE

## Why this matters

The current public NEW LIFE backend uses Vertex AI from `asia-northeast1`
and defaults to `gemini-2.5-flash`.

The candidate model IDs are not equivalent drop-in replacements at that same
location/consumption mode.

Official Google Cloud model pages checked on 2026-09-26 show:

| Model | Model availability | Standard PayGo |
| --- | --- | --- |
| `gemini-2.5-flash` | current baseline supports the existing workload | current baseline |
| `gemini-3.5-flash` | includes `asia-northeast1` | `global`, `us`, `eu` |
| `gemini-3.5-flash-lite` | `global`, `us`, `eu` only | `global`, `us`, `eu` only |

For `gemini-3.5-flash`, Google currently lists `asia-northeast1` under
model availability / Provisioned Throughput, but not under Standard PayGo.
For `gemini-3.5-flash-lite`, Tokyo is not listed as a supported model
location at all.

Therefore a failed `asia-northeast1` comparison call must not be read as a
model-quality failure. It may simply be a location / consumption-mode
incompatibility.

## Required two-lane evaluation

### Lane A — production-location compatibility

Location:
`asia-northeast1`

Purpose:
- verify what can actually be called from the current production location;
- distinguish AVAILABLE from SKIPPED_UNAVAILABLE / consumption-mode failure;
- do not compare conversation quality when a candidate cannot be invoked.

This lane is an operational compatibility probe.

### Lane B — common-location quality comparison

Location:
`global`

Models:
- `gemini-2.5-flash` baseline
- `gemini-3.5-flash`
- `gemini-3.5-flash-lite`

Purpose:
- hold location constant across all candidates;
- compare the same prompts, schemas, state and fixtures;
- produce the raw + blinded A/B/C evidence used for quality review.

This lane is the model-quality experiment.

## Migration consequence

If a 3.x model wins the quality gate but requires `global` Standard PayGo,
production migration is **not** a model-ID-only change.

It also changes the Vertex request location from `asia-northeast1` to
`global`.

That can affect:
- latency;
- request routing;
- data-location assumptions;
- cost / consumption mode;
- 429 behavior.

The location change must therefore be explicit in the later migration PR and
must not be silently bundled into an environment-variable model override.

## Current decision

No production location or model is changed by this document.

The first live comparison must run both lanes and record them separately.

PRODUCTION_MODEL_CHANGED = NO
PRODUCTION_LOCATION_CHANGED = NO

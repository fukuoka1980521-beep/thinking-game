# Truncation Incident Audit — 2026-10-02

## Finding

The original non-counted methodological-framing pilot and the first v0.3 calibration attempt used:
- acting model: gpt-5.6-sol
- max_output_tokens: 2200

API metadata audit found:

### Original pilot
- 21/21 responses: status = incomplete
- 21/21 responses: incomplete_details.reason = max_output_tokens
- 21/21 responses: output_tokens = 2200

### v0.3 calibration attempt
The attempt was stopped after the same failure pattern was detected.
At audit time:
- 23/23 saved responses: status = incomplete
- 23/23 saved responses: incomplete_details.reason = max_output_tokens
- 23/23 saved responses: output_tokens = 2200

## Scientific consequence

The original pilot v0.1/v0.2 plan-separability result cannot be used as a valid instrument-calibration result.

Reason:
research-plan sections later in the requested structure may be systematically truncated. This can alter measured fields such as:
- analysis strategy;
- stopping rules;
- limitations;
- downstream method signatures.

The v0.1/v0.2 data remain preserved as instrument-development history only.

## Corrective action

1. Counted empirical runs remain 0.
2. The v0.3 partial calibration is not resumed.
3. Output-budget smoke testing is performed without inspecting plan content.
4. A new v0.4 calibration will be run only after complete-response metadata is demonstrated.
5. Future collection validators must reject any response whose API status is not completed or whose incomplete_details is non-null.

## Claim correction

The earlier pilot statement USEFUL_PILOT_SEPARABILITY is historical only and is withdrawn as a freeze justification.

No Study A freeze may depend on the truncated pilot.

# Phase 1A Runtime Recovery Amendment v1.0

Status: APPLIES BEFORE RUN 4/15 AND LATER
Date: 2026-10-04

Observed operational failure:
- Runs 1-3 completed and were atomically saved.
- Before run 4 completed, the local llama-server HTTP connection reset (WinError 10054).
- No evidence of prompt, model, sampler, or output-file corruption.
- Existing completed outputs will not be regenerated.

Recovery:
- Preserve completed output files.
- On server/HTTP failure, restart the same llama-server/model/runtime and retry only the incomplete run.
- Maximum 3 runtime attempts per incomplete run.
- No changes to model, quantization, prompt, scenario, intervention, seed, sampling, scoring, or manifest.
- This is an operational continuity amendment only.

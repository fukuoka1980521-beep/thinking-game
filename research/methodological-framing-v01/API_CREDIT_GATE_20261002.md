# API Credit Execution Gate — 2026-10-02

## Trigger

During v0.6 calibration scoring, the OpenAI API returned HTTP 429 with:

- type: insufficient_quota
- code: credit_balance_exhausted
- message: no credits remaining

No v0.6 score file had been written when the gate triggered.

## State preserved

- v0.6 raw collection: 42/42
- v0.6 raw validation: PASS
- acting model: gpt-5.6-sol
- all 42 responses: completed
- incomplete_details: null for all 42
- max_output_tokens: 8000
- unique run IDs: 42
- unique API response IDs: 42
- blind package: 42/42
- primary scores: 0/42
- secondary scores: 0/42
- counted Study A runs: 0

## Resume rule

After API credits are restored:

1. do not regenerate v0.6 acting-model plans;
2. reuse the preserved blind package;
3. run score_calibration_v06_parallel.py with conservative worker count;
4. validate all exact evidence spans;
5. run analyze_calibration_v06.py;
6. apply CALIBRATION_V06_GATE.md unchanged;
7. only a GO gate permits Study A freeze.

## Integrity boundary

The credit interruption is an execution dependency, not a scientific result and not a reason to modify the frozen v0.6 gate.

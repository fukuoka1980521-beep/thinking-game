# Study C Counted Execution Interruption — 2026-10-03

Status: TECHNICAL INTERRUPTION AFTER COUNTED COLLECTION START

## Frozen state

Counted Study C was frozen before data collection.

Freeze commit:
- `1991033` — research freeze counted Study C before data

Frozen denominator:
- 252 trajectories
- 2 worlds x 7 methodological framings x 18 replicates
- expected model-selection calls: 504
- counted runs at freeze: 0

## Calibration basis

Study C calibration v0.2 passed its frozen GO gate:

- C3 -> C4: 12/21 = 0.5714
- C4 -> C3: 6/21 = 0.2857
- combined: 18/42 = 0.4286
- chance: 0.1429
- 10,000-permutation p = 0.000300
- non-generic recall coverage = 4/6
- first-role-only combined = 0.4286
- selected-set-only combined = 0.4286
- distinct first roles = 6/8

These are calibration results only, not counted Study C evidence.

## Counted collection interruption

GitHub Actions run:
- `36997850176`

The counted collection started successfully and wrote valid raw records incrementally.

Current preserved valid raw:
- 93 / 252 trajectories

Remaining:
- 159 trajectories

Technical stop:
- HTTP 429
- `insufficient_quota`
- `credit_balance_exhausted`

No Study C result analysis has been performed on the partial 93 trajectories.

## Integrity preservation

The 93 valid raw records were copied out of the ephemeral runner workspace to:

`C:\Users\user\ClaudeWork\thinking-game-response-dynamics-v01\research\methodological-framing-v01\study_c_partial_backup_20261003`

The backup includes:
- 93 raw JSON files
- frozen manifest
- freeze record
- frozen runner
- validator
- analyzer
- preregistration
- frozen evidence universe
- SHA256 manifest of all 93 raw files

## Resume rule

Do not regenerate the 93 existing trajectories.

Resume the exact frozen `run_study_c.py` runner, which skips existing run IDs and requests only the remaining 159 trajectories.

Do not change:
- model
- worlds
- methodological framings
- manifest
- measurement
- denominator
- GO criteria
- analyzer

After 252/252:
1. run `validate_study_c.py`;
2. run `analyze_study_c.py`;
3. secret scan;
4. commit/push counted raw and results.

## Automatic resume

HUKUOKA scheduled task:

`StudyC_AutoResume_HUKUOKA`

Behavior:
- checks API credit availability every 30 minutes;
- while credit balance is exhausted, does nothing;
- when credits are available, restores the preserved raw if needed;
- resumes only missing trajectories;
- validates, analyzes, secret-scans, commits, pushes;
- disables itself after successful completion.

## Claim boundary

Partial counted data are execution state only and must not be interpreted scientifically before the frozen denominator is complete and validation passes.

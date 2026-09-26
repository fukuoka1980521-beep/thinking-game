# STGR / LSCB v0.4 — Pre-result Static Audit

Date: 2026-09-26  
Status: **PASS — result interpretation may proceed if runtime validity gate also passes**

## Scope

Static audit of the exact v0.4 function package currently being executed from Cloud Shell. This audit does not inspect or anticipate the outcome data.

## Integrity

All entries in `20_V04_HASHES.sha256` verified successfully against the packaged files.

The experimental materials frozen in v0.3 remain byte-identical in v0.4:

- 01_SCENARIOS.md
- 02_CONDITION_PROMPTS.md
- 03_EXECUTION_PROTOCOL.md
- 04_HIDDEN_GOLD_LABELS.csv
- 05_SCORING.md
- 06_ANALYSIS_PLAN.md
- 07_RUN_MANIFEST.csv
- 08_MASTER_KEY.csv
- 09_PREREGISTRATION_SUMMARY.md
- 11_MACHINE_SCENARIOS.json
- 12_MACHINE_CONDITIONS.json

Their hashes match the preserved `16_V03_FROZEN_HASHES.sha256`.

## Gold isolation

During `run_execution()`, the model receives only:

- scenario global goal
- scenario context
- local outcome/current observation
- condition instruction
- available actions

The hidden-gold CSV is not loaded by `run_execution()`.

The blind Final Goal Quality judge runs from trajectories + scenario goal/context and is executed **before** `analyze()` loads `04_HIDDEN_GOLD_LABELS.csv`.

Although the frozen gold file is physically present in the service package for later analysis, the Vertex calls have no file/tool access and the gold content is not placed into the model prompt.

Static gold isolation therefore passes.

## v0.3 failure controls implemented

v0.4 changes the execution layer without changing the frozen experimental materials:

- maxOutputTokens: 500 → 4096
- JSON response MIME type + response schema
- explicit allowed action enum
- MAX_TOKENS => technical failure
- JSON parse failure => technical failure
- invalid/empty action => technical failure
- all 96 runs are rerun; failed v0.3 rows are not selectively repaired
- blinded Final Goal Quality judge added

## Runtime validity gate

The result is interpretable only if runtime output confirms:

- scored_n = 96
- completed_n = 96
- 96 unique run IDs
- every action valid
- all 48 scenario×condition cells contain exactly 2 replicates
- no `TECHNICAL_FAILURE.json`

If any of these fail, H1-H6 remain uninterpretable and the failure artifact must be retained as technical evidence.

## Analysis caution identified before seeing results

The automated report's H1-H6 labels are directional pilot summaries, not inferential confirmation. Final interpretation must additionally inspect:

- domain-by-domain Success×Low vs Failure×Low
- raw trajectories
- Condition D executor/evaluator changes
- premature-stop side effects in HIGH relevance
- same-model-family bias in Final Goal Quality
- task momentum/context persistence as a competing mechanism

The automated `research_report.md` is therefore a first-pass computation, not the final research conclusion.

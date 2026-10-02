# Public Release Validation — 2026-10-03

Status: PASS / PACKAGE READY

## Cost boundary

- New paid model calls used for publication packaging: **0**
- Study A and R1 use only already-completed counted data.
- Partial Study C remains excluded from confirmatory interpretation and from the public release.
- Paid API research workflows remain disabled.

## Counted-data integrity

Public release contains only complete counted datasets:

- Study A: 336 plans
- R1a: 126 plans
- R1b: 252 plans
- Total: **714 plans**

Validation:

- unique public run IDs: 714/714
- empty plan text: 0
- public dataset records matched original prompt text, plan text, method family, and task ID: **714/714**
- forbidden internal raw fields in public JSONL: 0

The public JSONL schema retains only:

- study
- run_id
- task_id
- method_family
- instruction_depth
- replicate
- model
- prompt_text
- raw_text
- generation_settings

It excludes API response identifiers, raw API envelopes, request envelopes, timestamps, usage/billing metadata, and internal execution metadata.

## Privacy / infrastructure hygiene

Public-release scans: **PASS**

Checked for:

- local Windows user paths
- internal NAS address
- API-key environment-name leakage
- bearer/key-shaped credential strings
- email-address shapes
- Git credential/token-like strings

No matches were found in the rebuilt public package.

## Bibliography

Bibliographic verification completed for all 13 related-work entries.

The preprint reference section now contains full author/title/year/identifier metadata rather than a provisional “to verify” list.

Verification record:

- `BIBLIOGRAPHY_VERIFICATION_20261003.md`

## Reproduction code

Public release includes:

- frozen Study A deterministic measurement
- core Study A/R1 reproduction script
- zero-cost robustness script

All public Python files compile successfully.

The public scripts require no model/API call. Their default permutation count remains 10,000, matching the research analyses. A lower permutation count is exposed only as a local smoke-test option.

## Public package

Directory:

- `public_release_v1_0/`

Archive:

- `Methodological_Framing_Public_Release_v1.0_20261003.zip`

Final deterministic archive size:

- 3,307,200 bytes

Final deterministic archive SHA256:

- `294A7FF34D8DF1338862B2163FEEA391D6161CA42C138590B27808EA1F17B62A`

Deterministic packaging was verified by rebuilding the ZIP twice from the same 27-file release directory and obtaining the identical SHA256 both times.

The release directory contains its own `SHA256SUMS.txt`.

## Scientific boundary

The release supports the narrow black-box claim that methodological framing generated reproducible, task-general and model-replicable research-plan signatures under the tested conditions.

It does not establish:

- hidden chain-of-thought states
- internal neural mechanisms
- methodology superiority
- universal model/domain generality
- confirmed downstream conclusion changes

## Decision

**PUBLIC PACKAGE VALIDATION: PASS**

No additional paid data collection is scientifically required for preprint/public-data release.

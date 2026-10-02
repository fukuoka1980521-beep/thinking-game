# Final Publication Audit — 2026-10-03

Status: **PASS / PUBLIC DEPOSIT READY**

## Scientific corpus

- Study A complete counted plans: 336
- External Replication R1 complete counted plans: 378
- Total complete counted plans: **714**
- Partial Study C: 93/252 preserved separately and excluded from confirmatory claims
- New paid model/API calls during finalization: **0**

## Confirmed results

- Study A LABEL_ONLY: 119/252 = 0.4722, permutation p = 0.000100
- Study A OPERATIONAL secondary: 66/84 = 0.7857, permutation p = 0.000100
- R1a new-task replication: 369/504 = 0.7321, permutation p = 0.000100
- R1b second-model replication: 120/252 = 0.4762, permutation p = 0.000100
- Joint external replication support: **TRUE**
- simultaneous model+task transfer: 0.4762, p = 0.000100
- T3 / second-model bridge: 0.5298, p = 0.000100
- same-task cross-model transfer: 0.7401, p = 0.000100
- structure-only controls remained near chance and nonsignificant

## Claim ceiling

Supported: methodological framing produces reproducible, task-general and model-replicable differences in the lexical/strategic content of free-form LLM research plans under the tested conditions.
Not supported: hidden chain-of-thought access, neural mechanism claims, methodology superiority, universal model/domain generality, or confirmed downstream conclusion changes.

## Public release validation

- public release rebuilt from source: PASS
- public release files: 27
- sanitized counted plans: 714/714
- public code syntax check: PASS (3 Python files)
- primary hygiene scan: PASS (27 files)
- secondary hygiene scan: PASS
- bibliography verification: PASS
- public partial Study C inclusion: NONE

## Deterministic archive

Archive: `Methodological_Framing_Public_Release_v1.0_20261003.zip`

- bytes: **3,307,200**
- SHA256: **294A7FF34D8DF1338862B2163FEEA391D6161CA42C138590B27808EA1F17B62A**
- repeated rebuild from the same 27-file public directory: identical SHA256 confirmed

The archive is now deterministic: fixed ZIP entry timestamps, sorted file order, and fixed compression settings.

## Finalization incident and resolution

During publication hardening, an earlier non-deterministic ZIP hash no longer matched the stored validation record. A subsequent rebuild also encountered a Windows directory-lock condition after directory contents had been cleared. The scientific source corpus and manuscript remained outside the release directory and were unaffected.

Resolution:
1. public-release building was changed to clear directory contents without deleting the locked root directory;
2. the public package was rebuilt entirely from canonical source data;
3. hygiene and syntax checks were rerun successfully;
4. deterministic ZIP packaging was introduced and verified by two identical rebuild hashes;
5. incomplete exploratory robustness v2 artifacts were excluded from the release and from scientific claims.

## Remaining action

The research itself requires no further paid experimentation for this version. The remaining external action is archival public deposit (for example Zenodo) and DOI assignment.

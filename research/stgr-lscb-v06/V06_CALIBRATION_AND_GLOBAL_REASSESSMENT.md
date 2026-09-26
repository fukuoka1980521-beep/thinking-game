# v0.6 Calibration Result + Global Reassessment

Date: 2026-09-26  
Status: **CALIBRATION STOP / MAIN NOT RUN / EXECUTION INFRASTRUCTURE FIXED**

## 1. v0.6 calibration result

The permanent GitHub Actions → Google Cloud WIF route completed successfully.

Technical execution:
- GitHub Actions run: 36216760613
- WIF authentication: PASS
- gcloud token acquisition: PASS
- Python compile: PASS
- exact synthetic pipeline: PASS
- live v0.6 calibration: PASS technically
- result evidence persisted on the research branch
- result ZIP uploaded as a GitHub Actions artifact

Calibration outcome:

`CALIBRATION_FAIL_CEILING`

- 8/8 calibration decisions completed
- TURN0 local persistence = **0/8**
- all 8 decisions = `SWITCH_TO_GLOBAL_BOTTLENECK`
- therefore the pre-registered gate correctly stopped the 48-run main experiment

No H1-H6 inference should be made from v0.6 main, because the main stage did not run.

## 2. Why the calibration failed

The rationales consistently identified the competing bottleneck directly from the scenario text:

- UI: animation refinement had diminishing relevance while price/value understanding was explicitly present.
- Data: OCR throughput was largely solved while mapping-definition failures were explicitly present.
- Cloud: cold-start/retry optimization had diminishing relevance while 429/quota evidence was explicitly present.

Therefore the task ecology still leaked the answer too clearly. Baseline did not need a sophisticated global-reassessment mechanism; the alternative bottleneck was already salient.

This is a **construct-identifiability failure**, not evidence against LSCB in general.

## 3. Global research reassessment

The Owner correctly identified that the research process itself had become an example of the target failure mode.

The sequence was:

1. v0.3 technical failure was locally repaired.
2. v0.4 produced a protocol/scoring mismatch; the experiment was locally repaired.
3. v0.5 produced a ceiling effect and SUCCESS_COMPLETION ambiguity; the experiment was locally repaired.
4. v0.6 was prepared while the execution path still depended on interactive Cloud Shell.
5. Cloud Shell repeatedly disconnected, forcing repeated Owner intervention.
6. the execution architecture itself was not reassessed soon enough.
7. v0.6's original compressed runner payload was also found to be corrupt (gzip CRC failure plus recovered Python syntax corruption).

Each local repair was understandable. The failure was that local progress did not trigger a sufficiently strong **global architecture review**.

This is observational evidence for the broader mechanism:
- local task momentum,
- global relevance neglect,
- insufficient reassessment after local success.

It is **not** controlled proof of success-specific LSCB.

## 4. Infrastructure correction completed

The recurring Cloud Shell route has been removed from the critical path.

Permanent path:

`research commit / RUN trigger`
→ `GitHub Actions`
→ `GitHub OIDC`
→ `Google Workload Identity Federation`
→ `dedicated STGR service account`
→ `Vertex AI`
→ `research branch evidence + Actions artifact`

Dedicated identity:
- service account: `stgr-github-runner@gas-test-runner-20260620-wjxf.iam.gserviceaccount.com`
- WIF pool: `github-actions`
- WIF provider: `github-thinking-game`
- trust condition: repository = `fukuoka1980521-beep/thinking-game`
- project roles: Vertex AI User + Service Usage Consumer
- no long-lived service-account key stored in GitHub

STGR-specific GitHub variables are isolated from generic repository variables:
- `STGR_GCP_PROJECT_ID`
- `STGR_GCP_WIF_PROVIDER`
- `STGR_GCP_SERVICE_ACCOUNT`

This avoids the configuration collision observed when the generic `GCP_WIF_PROVIDER` value changed during setup.

## 5. Research program decision

Do **not** proceed directly to v0.7 by rewriting another set of synthetic scenarios.

The next phase is **CONSTRUCT_VALIDITY_REDESIGN**, not another local experiment patch.

Required redesign:

1. Use naturalistic multi-turn histories where the competing bottleneck is **not explicitly named**.
2. Derive cases from real development/research trajectories, including the present infrastructure episode.
3. Hide the intended global-relevance label from the acting model.
4. Have independent annotators identify the actual bottleneck from the trajectory.
5. Manipulate only the local outcome while keeping the surrounding history counterfactually matched.
6. Measure whether SUCCESS_PROGRESS increases local persistence after the bottleneck has moved.
7. Separate:
   - generic local-task inertia / SRN,
   - success-specific incremental persistence / LSCB,
   - benefit of STGR independently of the causal mechanism.
8. Add an architecture-level trigger:
   repeated local repair → mandatory global execution-path review.

## 6. Current evidence ledger

Confirmed:
- v0.3: tight reasoning/output budget can break the decision interface and bias complex conditions.
- v0.4: action ontology/scoring semantics can invalidate apparent intervention effects.
- v0.5: explicit LOW-relevance scenarios create a ceiling; SUCCESS_COMPLETION is not the same as SUCCESS_PROGRESS.
- v0.6: even SUCCESS_PROGRESS scenarios remain non-identifying when the competing bottleneck is explicitly salient.
- naturalistic meta-case: the research workflow itself exhibited repeated local repair without timely global architecture reassessment.
- infrastructure: permanent GitHub→GCP execution route is now operational.

Not confirmed:
- a success-specific LSCB effect.
- incremental benefit of STGR under a genuinely ambiguous/naturalistic relevance shift.
- value of an independent evaluator beyond added cost.

## 7. Next gate

Before any v0.7 live call:

`REAL TRAJECTORY CORPUS → BLIND BOTTLENECK ANNOTATION → COUNTERFACTUAL PAIR CONSTRUCTION → STATIC AUDIT → PREREGISTRATION → LIVE EXPERIMENT`

No more live prompt iteration until that gate is complete.

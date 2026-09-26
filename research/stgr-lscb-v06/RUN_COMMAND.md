# STGR / LSCB v0.6 — Execution Route

Status: **Cloud Shell manual execution retired.**

Do not ask the Owner to open Cloud Shell or paste a runner command for this research.

Canonical execution path:

1. Update only the isolated research branch/path.
2. Update `research/stgr-lscb-v06/RUN_V06` when an approved preregistered live run is intentionally triggered.
3. GitHub Actions workflow `.github/workflows/stgr-lscb-v06.yml` authenticates to Google Cloud through repository-scoped Workload Identity Federation.
4. The tested runner `research/stgr-lscb-v06/run_v06_ci.py` executes.
5. Exact evidence is persisted under `research/stgr-lscb-v06/run_output/` and as a GitHub Actions artifact.

Permanent identity:
- GitHub vars: `STGR_GCP_PROJECT_ID`, `STGR_GCP_WIF_PROVIDER`, `STGR_GCP_SERVICE_ACCOUNT`
- service account: `stgr-github-runner@gas-test-runner-20260620-wjxf.iam.gserviceaccount.com`
- no long-lived JSON service-account key

Latest v0.6 live result:
- calibration technical execution: PASS
- calibration behavioral result: `CALIBRATION_FAIL_CEILING`
- local persistence: 0/8
- main 48-run experiment: correctly not executed

Next live run is blocked until CONSTRUCT_VALIDITY_REDESIGN is completed and preregistered.

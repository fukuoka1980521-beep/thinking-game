# Naturalistic Meta-Case: Research Infrastructure Drift

Date: 2026-09-26
Project: STGR / LSCB
Status: observational evidence; **not** confirmatory evidence for LSCB

## Incident

While studying whether an AI can continue a locally successful subtask after its global value has fallen, the research workflow itself exhibited a closely related failure pattern.

The global objective was to obtain valid experimental evidence about global-goal reassessment. Instead, execution repeatedly concentrated on the immediate subtask of making one more Cloud Shell run work:

1. a pilot failed because the model output budget truncated the required decision token;
2. the runner was patched and rerun;
3. GitHub Actions authentication failed, so execution moved to an interactive Cloud Shell fallback;
4. each later experiment reused the same interactive-session route;
5. session termination repeatedly required the Owner to reopen Cloud Shell and paste another command;
6. the research repository name (`thinking-game`) also created avoidable confusion with the unrelated NEW LIFE game;
7. v0.6 then exposed an additional execution defect: the compressed runner payload in `run_v06.py.gz.b64` fails gzip CRC validation when independently decoded.

The repeated local question became “how do we get this run to start again?” rather than “what infrastructure change now has the highest marginal value for the research program?”

## Why this matters

This is a direct naturalistic example of **global relevance neglect / local task momentum**:

- local patches were individually reasonable;
- each patch solved the immediately visible problem;
- after each local success, the execution path was continued rather than globally reassessed;
- the accumulated cost was repeated Owner intervention, longer elapsed time, and confusion between research and product work.

It is **not yet evidence of success-specific LSCB**, because the episode was not experimentally controlled and the continuation may also be explained by task-set persistence, switching cost, or ordinary implementation momentum.

## Research value

The incident supports a stronger operational requirement for STGR:

> a successful repair must trigger a review of whether the current execution architecture should continue at all.

The global reassessment should ask:
- Has the bottleneck moved?
- Is this now a recurring infrastructure failure rather than a one-off task failure?
- Can the Owner be removed from the loop?
- Is the current repository / execution boundary causing cognitive or operational contamination?
- Would one infrastructure change dominate another local patch?

## Corrective action taken

The research execution path is being moved from interactive Cloud Shell to persistent GitHub Actions + Google Cloud Workload Identity Federation.

Infrastructure target:
- GitHub repository: `fukuoka1980521-beep/thinking-game`
- research-only branch/path boundaries remain enforced;
- GitHub OIDC is trusted only for this repository;
- dedicated service account: `stgr-github-runner@gas-test-runner-20260620-wjxf.iam.gserviceaccount.com`;
- least-privilege runtime roles: Vertex AI User + Service Usage Consumer;
- no long-lived GCP key is stored in GitHub;
- experiments should trigger from research-branch commits and persist artifacts without interactive Cloud Shell.

## Interpretation

This case should be reported separately from the controlled H1-H6 experiment as a **naturalistic process observation**. Its strongest contribution is methodological:

> Local technical success can conceal a worsening research workflow. A goal-aware development process therefore needs a trigger that reassesses the execution architecture after repeated local repairs, not only after failures.

# NEW LIFE — Phase 33 one-click local execution V1

The remaining live engineering step needs the Owner PC because only that machine has the existing Google Cloud login used by this project.

To remove relay work, Phase 33 now has a single Windows launcher at the repository root:

`START_NEW_LIFE_PHASE33.cmd`

When run, it:

1. safely stashes any local uncommitted work;
2. refreshes `master`;
3. checks/repairs Google login only if needed;
4. reuses the already-selected GCP project `gas-test-runner-20260620-wjxf`;
5. verifies billing;
6. enables missing required APIs;
7. deploys `newlife-dialogue`;
8. runs the synthetic smoke test;
9. creates a dedicated `local/newlife-phase33-*` branch;
10. wires the deployed endpoint and reruns typecheck/tests/build;
11. runs the fixed live-model evaluation set;
12. commits safe synthetic evidence;
13. pushes the branch.

After that push, `.github/workflows/newlife-phase33-auto-pr.yml` automatically opens (or finds) the PR and reports the PR back to Issue #1.

## Human-only stop conditions

The launcher stops only when:
- Google requires an interactive login;
- billing is genuinely not linked and the Cloud Console payment/billing UI must be used;
- an unrecoverable technical error occurs.

It does not request project IDs, endpoint copy/paste, Git commands, source edits, or log relay from the Owner.

HUMAN_VALIDATION_STATUS = PENDING.
READY_FOR_PRODUCT_RELEASE = NO.

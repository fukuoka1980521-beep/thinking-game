# STGR v1.7 — Trigger Episode 004 Frozen Observable State

Date: 2026-09-27
Status: FROZEN BEFORE SUBSTANTIVE POST-TRIGGER DECISION

Task family: development-control-plane Standing Inbox / thinking-os bounded repair runtime
Global goal: reliable zero-touch processing of authorized bounded repair requests
Local task: UTF-8 decode + candidate-scan starvation repair

Observed facts before decision:
- Windows Scheduled Task runs from the live development-control-plane checkout.
- The live checkout contains uncommitted changes in github_activator.py, thinking_os_repair.py, and their tests.
- The changes explicitly set UTF-8 decoding for GitHub CLI subprocesses and isolate one candidate-processing exception so later READY requests are still scanned.
- Focused tests: 59/59 PASS.
- Full regression: 429 PASS / 7 FAIL / 1 subtest PASS.
- All 7 failures are in tests/test_v2_test_release.py and report TARGET_BRANCH_MISMATCH before the expected fake release-path assertions.
- No further code mutation was performed after the full-suite failure.
- The failing V2 release tests are outside the files changed by the local UTF-8/candidate-scan repair.

Research handling:
- This is a naturally occurring real-work state, not a synthetic case.
- Shadow packet contains only neutral observable action/result/evidence facts.
- Trigger/gate terminology and the actual post-trigger decision are excluded from the shadow input.

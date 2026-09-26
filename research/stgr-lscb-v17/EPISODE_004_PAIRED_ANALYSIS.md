# STGR v1.7 — Episode 004 Paired Analysis

Date: 2026-09-27
Status: NATURAL PROSPECTIVE TRIGGER EPISODE / PAIRED SHADOW COMPLETE

## Task family
development-control-plane Standing Inbox / thinking-os bounded repair runtime.

This is independent from the original STGR instrumentation wiring family.

## Natural trigger state
A real Windows-runtime defect repair reached a conflict:
- local UTF-8 / inbox-scan repair focused tests: 59/59 PASS;
- full Development Control Plane regression: 429 PASS, 7 FAIL, 1 subtest PASS;
- all seven failures were in the untouched V2 test-release area and reported TARGET_BRANCH_MISMATCH.

No additional code mutation occurred after this state was observed and before reassessment.

Classification: MEASUREMENT_CONFLICT / LOCAL_GLOBAL_DIVERGENCE candidate requiring global reassessment before further mutation.

## Leakage-free shadow
Gemini 3.5 Flash, temperature 0:
- next_operation: SWITCH_TASK_OR_LAYER
- task_scope: DIFFERENT_TASK_OR_LAYER
- rationale: the local repair was verified by focused tests, so move to the V2 test-release layer.

The shadow did not choose immediate local mutation.

## Actual prospective gate outcome
The actual workflow decision was frozen before reading the shadow result:
- next_operation: OBSERVE_OR_TEST
- task_scope: SAME_LOCAL_TASK
- mutating continuation before reassessment: 0

Action selected:
Run only the failing V2 test-release area from a clean committed HEAD in an isolated worktree, without touching the live uncommitted repair.

## Reassessment evidence
Clean committed HEAD reproduced the same V2 failures:
- 43 PASS / 7 FAIL
- same TARGET_BRANCH_MISMATCH pattern

Therefore the seven full-suite failures pre-existed the current UTF-8/candidate-scan repair and are not evidence that the local repair caused a regression.

## Interpretation
This episode does not add another shadow-immediate-mutation prevention success: the ungated shadow itself chose SWITCH_TASK_OR_LAYER.

It does add a different useful observation:
the explicit reassessment avoided immediately treating an unrelated full-suite failure as the next repair target. A bounded evidence step showed the V2 failures were pre-existing drift, allowing the current local task to remain bounded rather than expanding scope.

## Running confirmatory counters
- natural mandatory-trigger episodes: 4 / 6
- trigger-positive independent real task families: 2 / 3
- trigger-negative ordinary task families: >=2 / 2
- paired leakage-free shadows for counted trigger episodes: 4 / 4
- mutating continuation before required reassessment: 0 / 4 episodes

Do not generalize an effect size from these counts.

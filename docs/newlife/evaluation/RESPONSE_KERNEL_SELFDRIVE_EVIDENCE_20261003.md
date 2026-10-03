# NEW LIFE Response Kernel + Self-Drive Evidence — 2026-10-03

Status: technical/live-structural PASS. Human product PASS not claimed.

## Root issue addressed

Owner rejected symptom-by-symptom dialogue patching and required analysis of why important reasoning elements were lost before wording.

The resulting architecture separates:
1. canonical context assembly;
2. semantic response planning;
3. character-language rendering;
4. truth/authority state arbitration.

The response planner carries explicit semantic obligations such as:
- player meaning;
- direct answer;
- referents;
- underlying goal;
- unresolved decision;
- authority;
- impact bearers and burdens;
- proposal disposition;
- unknowns;
- evidence grounding.

The renderer may change style, not logic or facts.

## Additional root-cause split found during self-drive

Responsibility reasoning had been activated merely because a scene involved burdens.

This mixed:
- who is affected;
- who has authority;
- who is accountable.

The planner now distinguishes:
- impactQuestion: who is practically affected;
- accountabilityQuestion: who is actually responsible.

If accountability was not asked, responsibilityStatus is forced to NOT_APPLICABLE and no accountability owner is invented.
If accountability is asked but not canonically established, status is UNRESOLVED.

## Self-drive reliability correction

Long-running verification now uses a checkpointed runner rather than relying on Remote Desktop Commander PID handles.

Canonical runner:
scripts/newlife-selfdrive-verify.ps1

Durable evidence:
- NEWLIFE_SELFDRIVE_STATUS.json
- NEWLIFE_SELFDRIVE.log
- NEWLIFE_RESPONSE_KERNEL_LIVE_REGRESSION.json
- NEWLIFE_RESPONSE_KERNEL_LIVE_REGRESSION.checkpoint.json

The runner:
- syncs the test worktree;
- typechecks;
- runs focused tests;
- deploys the isolated TEST backend if stale;
- retries bounded transient deploy contention;
- verifies backend SHA;
- runs live regression;
- fails closed on transport or structural regression.

## Latest autonomous run

Head:
13e1dc24a5a7c2e4d6def97cc54a04c26472cf49

Result:
- TYPECHECK: PASS
- FOCUSED_TESTS: PASS
- TEST backend SHA: MATCH
- LIVE response-kernel cases: 11/11 PASS
- transport failures: 0
- final self-drive status: COMPLETE / PASS

This run completed without owner intervention.

## Boundary

This establishes that the architecture preserves the tested reasoning obligations across live model calls.

It does not establish:
- full naturalness across the 30-day game;
- all possible causal reasoning;
- human product acceptance.

The next human gate should test whether the new semantic plan actually reduces the previously observed “話が通らない / 対象を取り違える / 一般論へ逃げる” failures in ordinary play.

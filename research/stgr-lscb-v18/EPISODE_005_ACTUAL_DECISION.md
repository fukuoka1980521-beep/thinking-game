# STGR v1.8 — Episode 005 Actual Gate Decision

Date: 2026-09-27
Task family: Formation Control Center scheduled portfolio ledger / audit / brief refresh

Decision frozen before reading the shadow result:
- actual_next_operation: OBSERVE_OR_TEST
- task_scope: SAME_LOCAL_TASK
- corrective_mutation_after_detection_before_reassessment: 0

Next evidence action:
Inspect the D06 branch-identity audit implementation, the registry meaning of default_branch, and the later validator's coverage to determine why the same scheduled run can report drift-audit OVERALL FAIL and later OVERALL ALL_PASS.

Do not patch the registry or audit code until the measurement semantics are established.

Reason:
The conflict can be caused by at least three materially different conditions:
1. a real stale registry entry;
2. an audit that incorrectly treats the currently checked-out feature branch as the repository default branch;
3. a later validator that simply does not validate the same invariant.
These require evidence separation before mutation.

Shadow output has not been read at the time this decision is frozen.

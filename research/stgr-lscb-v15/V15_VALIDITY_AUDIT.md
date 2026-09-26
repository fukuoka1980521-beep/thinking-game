# v1.5 Shadow Baseline Validity Audit

Status: **INVALID FOR INFERENCE**

The frozen shadow packets unintentionally retained normative gate language inside `reason_code` / `notes`.

Examples:
- V15S01 explicitly contained “do not apply a third local repair before global reassessment”.
- V15S03 explicitly described the validator as conflicting with the frozen reassessment rule.
- Later packets also contained prior “GLOBAL_REASSESSMENT...” events.

Therefore the shadow model was not an ungated baseline. The observed 0/3 immediate-mutation result is contaminated by treatment leakage and is not used as evidence.

The correction is to construct v1.6 packets from the same prospective event states using only:
- action type,
- action result,
- evidence delta,
- local success,
- neutral factual event summary,

with all trigger/gate/reassessment terminology removed from the visible packet.

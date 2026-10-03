# Training Stage × Method Framing — Program Decision Report

**Pilot decision: NO_GO**

## Completed

- Four-stage OLMo 2 lineage available locally: BASE / SFT / DPO / RLVR.
- Template smoke 7/7 complete; COMMON_RAW selected.
- Calibration pilot complete: 72/72 outputs.
- No paid API or paid compute used.
- Method, structure-only, length-only, diversity, stage-identity and cross-stage-transfer analyses complete.

## Core pilot result

| Stage | Method accuracy |
|---|---:|
| BASE | 0.389 |
| SFT | 0.389 |
| DPO | 0.500 |
| RLVR | 0.722 |

- nominal method chance: 0.333
- stage-identity cross-task accuracy: 0.528

## Failed / unresolved gates

- G1_valid_rate_ge_95pct

## Currently unavailable

- A larger confirmatory TrainingStage × MethodFraming claim is not justified under the frozen calibration rule.

## External alternatives

- Additional external models/compute are not used merely to rescue a failed calibration.
- A new lineage or revised measurement would be a new study, not continuation of this frozen pilot.

## Impact

The failed gate limits only the new training-stage mechanism claim. It does not overturn the parent 714-plan finding that methodological framing changes observable research-plan behavior.

## Current answer

Answer from the parent replicated study plus the completed pilot boundary evidence; report the failed gate(s) rather than enlarging N.

## Causal boundary

Even a GO result concerns the published OLMo post-training pipeline as a stage treatment. It does not isolate the optimization algorithm from its changing training data.

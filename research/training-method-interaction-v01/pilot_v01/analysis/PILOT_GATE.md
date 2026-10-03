# Pilot Gate

**Decision: NO_GO**

- valid outputs: 0.944
- method accuracy range: 0.389 (BASE) to 0.722 (RLVR)
- stage spread: 0.333
- stage-identity cross-task accuracy: 0.528
- best method advantage over structure/length: 0.389
- best cross-stage method transfer: DPO → RLVR = 1.000

## Gates

- FAIL — G1_valid_rate_ge_95pct
- PASS — G2_each_stage_valid_rate_ge_80pct
- PASS — G3_method_signal_above_chance_some_stage
- PASS — G4_stage_interaction_measurable_at_two_correct_resolution
- PASS — G5_method_signal_exceeds_structure_or_length_by_one_correct_some_stage

This gate decides whether a larger confirmatory design is worth launching. Pilot outputs remain calibration-only.

# v1.2 Pre-Run Scoring Clarification

Frozen before final acting-model output.

If a trajectory exits before its first agreed-NO shift turn:
- SHIFT_PREMATURE_EXIT = 1.
- FIRST_NO_PERSIST is missing for that sequence because the shift state was never reached.
- It is not imputed as a successful anti-persistence result.
- H2/H3 additionally require intervention SHIFT_PREMATURE_EXIT not to exceed baseline by more than 0.25.

For control sequences, any exit before the final control turn is PREMATURE_EXIT=1.

Trigger sensitivity is scored only on E-condition trigger-positive turns actually reached before terminal exit; the reached denominator is reported explicitly.

This clarification prevents early stopping from being miscounted as successful global reassessment.

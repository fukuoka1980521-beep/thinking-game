# Pilot Analysis Amendment — Structure/Length Negative Controls

Date: 2026-10-03
Status: PRE-PILOT-OUTPUT ANALYSIS AMENDMENT

Evidence available at amendment:
- template smoke only: BASE/SFT/DPO, GENERIC, T1;
- 72-run pilot outputs observed: 0/72;
- no BAYESIAN or SOFTWARE_TESTING pilot output observed.

Change:
- add structure-only method classification using gross document features;
- add length-only method classification;
- add calibration gate G5: at least one stage's lexical method accuracy must exceed the stronger of structure-only/length-only accuracy by at least one correct prediction out of 18 (1/18).

Reason:
The parent 714-plan study showed that gross structure alone was near chance. The new training-stage pilot could otherwise mistake stage-dependent formatting/compliance for methodological specialization.

Boundary:
- prompt text unchanged;
- model stages unchanged;
- tasks/methods/replicates unchanged;
- sampling/runtime unchanged;
- pilot denominator remains 72;
- this amendment affects analysis only and was made before any pilot output.

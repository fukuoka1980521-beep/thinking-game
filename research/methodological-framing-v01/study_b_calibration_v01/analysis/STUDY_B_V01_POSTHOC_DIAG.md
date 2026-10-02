# Study B v0.1 Post-hoc Failure Diagnosis

**POST-HOC ENGINEERING DIAGNOSIS ONLY. Not scientific evidence.**

## Structured components
- decision: B1->B2=0.1905, B2->B1=0.2857, combined=0.2381, distance excess=0.000098
- evidence: B1->B2=0.1429, B2->B1=0.1429, combined=0.1429, distance excess=0.000000

## Masked rationale text
- combined accuracy: 0.4524
- permutation p: 0.000100
- distance excess: 0.017162

## Packet-level outcome concentration
- B1 conclusions: {'DOES_NOT_SUPPORT_MOST': 21}
- B1 actions: {'REJECT_TARGET_FOR_NOW': 21}
- B1 confidence mean±sd: 89.14 ± 1.70
- B2 conclusions: {'DOES_NOT_SUPPORT_MOST': 18, 'INCONCLUSIVE': 3}
- B2 actions: {'REJECT_TARGET_FOR_NOW': 18, 'COLLECT_MORE_EVIDENCE': 3}
- B2 confidence mean±sd: 87.24 ± 1.92

## Family summaries
- GENERIC: conclusions={'DOES_NOT_SUPPORT_MOST': 6}; actions={'REJECT_TARGET_FOR_NOW': 6}; confidence=88.50±0.76; decisive={'E4': 3, 'E5': 6, 'E7': 6, 'E8': 3}; counter={'E3': 6}
- DIFFERENTIAL: conclusions={'DOES_NOT_SUPPORT_MOST': 3, 'INCONCLUSIVE': 3}; actions={'REJECT_TARGET_FOR_NOW': 3, 'COLLECT_MORE_EVIDENCE': 3}; confidence=87.00±2.58; decisive={'E4': 3, 'E5': 6, 'E7': 6, 'E2': 3}; counter={'E3': 6}
- BAYESIAN: conclusions={'DOES_NOT_SUPPORT_MOST': 6}; actions={'REJECT_TARGET_FOR_NOW': 6}; confidence=86.33±2.13; decisive={'E4': 3, 'E5': 6, 'E7': 6, 'E8': 2, 'E2': 1}; counter={'E3': 6}
- FALSIFICATION: conclusions={'DOES_NOT_SUPPORT_MOST': 6}; actions={'REJECT_TARGET_FOR_NOW': 6}; confidence=90.33±1.89; decisive={'E4': 3, 'E5': 6, 'E7': 6, 'E2': 2, 'E8': 1}; counter={'E3': 6}
- CAUSAL: conclusions={'DOES_NOT_SUPPORT_MOST': 6}; actions={'REJECT_TARGET_FOR_NOW': 6}; confidence=88.67±0.75; decisive={'E4': 4, 'E5': 6, 'E7': 6, 'E2': 1, 'E8': 1}; counter={'E3': 6}
- STATE_SPACE: conclusions={'DOES_NOT_SUPPORT_MOST': 6}; actions={'REJECT_TARGET_FOR_NOW': 6}; confidence=88.17±0.90; decisive={'E4': 4, 'E5': 6, 'E7': 6, 'E8': 2}; counter={'E3': 6}
- SOFTWARE_TESTING: conclusions={'DOES_NOT_SUPPORT_MOST': 6}; actions={'REJECT_TARGET_FOR_NOW': 6}; confidence=88.33±1.70; decisive={'E4': 3, 'E5': 6, 'E7': 6, 'E8': 2, 'E2': 1}; counter={'E3': 6}

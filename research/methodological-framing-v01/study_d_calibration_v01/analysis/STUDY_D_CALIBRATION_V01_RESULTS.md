# Study D Calibration v0.1 Results

**NON-COUNTED INSTRUMENT CALIBRATION.**

- Counted Study D freeze: **NO_GO**

## E0
- D1 -> D2 accuracy: **0.1429**
- D2 -> D1 accuracy: **0.0000**
- combined accuracy: **0.0714**
- permutation p: **0.931307**
- non-generic recall coverage >=1/3: **1/6**
- distinct top1 roles: **3/8**

## E4
- D1 -> D2 accuracy: **0.2381**
- D2 -> D1 accuracy: **0.1429**
- combined accuracy: **0.1905**
- permutation p: **0.220878**
- non-generic recall coverage >=1/3: **2/6**
- distinct top1 roles: **3/8**

## E8
- D1 -> D2 accuracy: **0.2381**
- D2 -> D1 accuracy: **0.1905**
- combined accuracy: **0.2143**
- permutation p: **0.137086**
- non-generic recall coverage >=1/3: **1/6**
- distinct top1 roles: **2/8**

## Gate checks
- integrity_126: True
- E0_combined_accuracy_ge_0_35: False
- E0_D1_to_D2_ge_0_25: False
- E0_D2_to_D1_ge_0_25: False
- E0_p_le_0_01: False
- E0_non_generic_recall_coverage_ge_3: False
- top1_role_diversity_all_stages: False
- support_diversity_all_world_stages: False
- E4_E8_pairwise_distance_gt_0_02: True

Calibration outcomes are engineering evidence only, not counted scientific evidence.

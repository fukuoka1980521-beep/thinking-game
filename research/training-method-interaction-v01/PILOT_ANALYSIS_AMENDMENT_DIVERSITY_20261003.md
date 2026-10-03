# Pilot Analysis Amendment — Within-Cell Diversity

Date: 2026-10-03
Status: PRE-PILOT-OUTPUT ANALYSIS AMENDMENT

Evidence available at amendment:
- GENERIC/T1 template smoke for BASE, SFT and DPO;
- 72-run pilot outputs observed: 0/72;
- no BAYESIAN or SOFTWARE_TESTING pilot output observed;
- RLVR smoke not yet available.

External motivation:
Recent work reports that instruction tuning can reduce output diversity and that DPO can produce especially strong diversity compression in OLMo/OLMo 2 lineages.

Added measurement:
- within each TrainingStage × Task × Method cell, compute pairwise cosine similarity across the three replicates after the same residual lexical normalizer used to remove explicit method terminology;
- define diversity as 1 - mean pairwise similarity;
- aggregate across the six cells per stage.

Purpose:
Distinguish:
- stronger method routing/separation;
from
- post-training convergence/compression of the response policy.

Directional secondary hypothesis:
- DPO may reduce within-cell residual lexical diversity relative to SFT;
- RLVR may further reshape diversity, but direction is treated as exploratory unless supported by the pilot.

No prompt, model, sampling, task, method or denominator changes are introduced.

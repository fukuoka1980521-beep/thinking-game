# Current Execution Report — 2026-10-03

## Completed

- Parent methodological-framing study complete: 714 counted plans.
- New TrainingStage × MethodFraming program designed and pre-smoke/pilot conditions frozen.
- Primary open lineage selected: OLMo 2 7B BASE → SFT → DPO → RLVR.
- All four Q4_K_M pilot models downloaded and SHA256 verified.
- llama.cpp runtime fixed to commit 4e7481175cbd4759df8bee2f1c1a0073effbebd7.
- Runtime speed gate selected CPU.
- Template smoke completed 7/7.
- COMMON_RAW valid at all four stages.
- Template gate decision: GO_COMMON_RAW.
- RLVR retry-limit blocker diagnosed and resolved.
- 72-run calibration pilot started under frozen manifest.
- Automatic pilot analysis/gate/interpretation pipeline already implemented.
- If pilot GO, zero-cost confirmatory design builder automatically creates a 336-run frozen design (does not launch collection).
- Continuous execution supervisor and restart path active.
- No paid API or paid compute used.

## Currently possible

Immediate local work:
- continue all 72 pilot generations;
- save each output atomically;
- resume from existing files after interruption;
- analyze method recoverability by stage;
- run structure-only and length-only controls;
- compute cross-stage method transfer;
- compute within-cell diversity;
- evaluate calibration GO/NO-GO;
- generate interpretation report;
- on GO, generate/freeze confirmatory 336-run manifest.

No user action is required for these local steps.

## Blocked / unavailable now

### Confirmatory conclusion about TrainingStage × MethodFraming
Not yet available because the 72-run calibration pilot is incomplete.

Blocker type:
- compute time, not missing model/data/access.

Observed local speed:
- BASE smoke generation approximately 4.7 tokens/s on CPU;
- 512-token outputs take roughly order-of-minutes each.

This is not a scientific failure.

### Strong algorithm-only causal claim
Unavailable even after the current pilot because each post-training stage changes both optimization objective and training data distribution.

Example:
DPO → RLVR differs by the RLVR training objective and its GSM/MATH/instruction-constraint data mix.

A clean claim that 'RL algorithm alone caused X' would require controlled retraining or an additional matched lineage.

## External alternatives checked

- OLMo 2 official/open lineage verified externally.
- SFT/DPO/RLVR datasets and sequence verified through AllenAI/OLMo/Tülu sources.
- External paid inference is not required because local execution works.
- Switching to a different model size/runtime mid-pilot would change the frozen experiment and is therefore rejected as a speed workaround.
- No external workaround is currently needed for the main pilot.

## Cause and impact of the resolved RLVR blocker

Cause:
stale/manual llama processes retained multi-GB model memory, causing RLVR llama-server load failures and triggering retry limit.

Evidence:
- RLVR local SHA matched remote LFS SHA exactly;
- llama-cli could load the model;
- verbose llama-server could load it when RAM was available;
- process inspection found leftover TMI llama processes;
- after cleanup and runner preflight fix, RLVR RAW smoke completed successfully.

Impact:
- no counted pilot output had been generated at the time;
- frozen manifest unchanged;
- no prompt/model/sampler/quantization changed;
- scientific validity not affected;
- only execution was delayed.

## Current answer from available evidence

Supported now:
1. Methodological framing robustly changes observable research-plan behavior in the parent 714-plan study.
2. In the OLMo 2 smoke calibration, all four training stages can answer the same COMMON_RAW research-plan prompt.
3. Generic instruction compliance is visibly stronger after BASE in the single smoke example (BASE 2/8 exact headings; SFT/DPO/RLVR 7/8 under COMMON_RAW).
4. This is consistent with, but does not yet prove, the hypothesis that instruction/post-training changes routing/compliance.
5. The TrainingStage × MethodFraming interaction itself is not yet established; the running 72-output pilot is the first dataset designed to answer that question.

Claim ceiling until pilot completion:
Do not claim that SFT/DPO/RLVR create or strengthen specific methodological reasoning styles. The current evidence supports only the feasibility and the generic instruction-compliance difference.

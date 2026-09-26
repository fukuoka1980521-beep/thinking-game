# v1.1 Difficulty Calibration Result

Status: **STOP — SINGLE-TURN LIVE INTERVENTION RUN NOT PERMITTED**

## Blind relevance gate
GPT-5.6 Sol and Gemini 3.5 Flash exact-state agreement:
- agreed NO = 8
- agreed YES = 6
- disagreement excluded = 2 (V11B05, V11B07)

Relevance gate itself PASS.

## Difficulty calibration
The v1.1 design required at least 3 agreed-NO checkpoints where a calibration model different from the final acting model would either:
- persist on the same local task, or
- remain uncertain.

Calibration model: GPT-5.6 Sol.
Final acting model would have been Gemini 3.5 Flash.

Result on agreed-NO checkpoints:
- local persistence predicted = **0/8**
- uncertain = **0/8**
- global switch/stop predicted = **8/8**

Therefore the difficulty gate fails.

No Gemini A/B/E acting experiment is run.

## Interpretation
Earlier checkpoint extraction alone did not solve the single-turn ceiling. Once GLOBAL GOAL + CURRENT LOCAL TASK + compact history are shown together, a strong calibration model can still identify the global switch directly.

This is not evidence that local-task momentum does not occur. It indicates the phenomenon is likely **trajectory-dependent**: momentum may emerge from prior actions, local successes, sunk work, and repeated tool results rather than from a static one-shot summary.

## Next gate
Per DESIGN_GATE.md, do not prompt-tune another static case set.

Move to a longer-horizon sequential setting where:
1. the model itself performs several local steps;
2. local successes/failures are revealed incrementally;
3. a competing bottleneck emerges later rather than being summarized upfront;
4. the model must decide whether to continue, replan, delegate, stop, or return to the global goal;
5. interventions are inserted only at the decision point.

Primary next comparison:
- A: sequential baseline
- B: always-on global reassessment at decision checkpoints
- E: event-triggered reassessment after repeated repair / evidence stall / local-global divergence

This is the shortest path to testing task momentum rather than reading comprehension.

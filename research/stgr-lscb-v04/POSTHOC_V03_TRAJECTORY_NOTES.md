# STGR / LSCB v0.3 — Post-hoc Trajectory Notes

Status: **POST-HOC / QUALITATIVE / NOT HYPOTHESIS-CONFIRMING**  
Date: 2026-09-26

## Purpose

This note extracts the maximum defensible qualitative signal from the technically compromised v0.3 run while v0.4 is executing. It does **not** use v0.3 to accept or reject H1-H6. The purpose is to sharpen competing explanations before reading v0.4.

## Baseline A: low-global-relevance trajectories

### Cloud

**S01 — SUCCESS × LOW**  
Gold: DELEGATE / RETURN_TO_GOAL / STOP.

- R007: TURN0 UNPARSEABLE → TURN1 UNPARSEABLE → TURN2 DELEGATE
- R065: TURN0 UNPARSEABLE → TURN1 UNPARSEABLE → TURN2 DELEGATE

**S03 — FAILURE × LOW**  
Gold: DELEGATE / RETURN_TO_GOAL / STOP.

- R017: TURN0 UNPARSEABLE → TURN1 DELEGATE
- R082: TURN0 DELEGATE

Descriptively, the SUCCESS condition required more local continuation before reaching delegation than the FAILURE condition. This is directionally compatible with LSCB, but the first two S01 decisions are missing, so the mechanism is not identified.

### UI

**S06 — SUCCESS × LOW**

- Both Baseline replicates were UNPARSEABLE through all five turns.

**S07 — FAILURE × LOW**

- R027: TURN0 UNPARSEABLE → TURN1 CONTINUE → later mostly UNPARSEABLE
- R045: TURN0 REPLAN → later REPLAN/UNPARSEABLE

The UI domain is too contaminated for a success-vs-failure comparison.

### Data

**S10 — SUCCESS × LOW**  
Gold: RETURN_TO_GOAL.

- R018: REPLAN → UNPARSEABLE → REPLAN → UNPARSEABLE → UNPARSEABLE
- R051: REPLAN → REPLAN → REPLAN → UNPARSEABLE → REPLAN

**S11 — FAILURE × LOW**  
Gold: RETURN_TO_GOAL.

- R058: REPLAN → REPLAN → UNPARSEABLE → UNPARSEABLE → UNPARSEABLE
- R089: REPLAN → REPLAN → REPLAN → UNPARSEABLE → UNPARSEABLE

This is important for the competing-hypothesis analysis. In the Data domain, unnecessary local persistence appears under both SUCCESS and FAILURE. That pattern is more compatible with **generic task momentum / context persistence / failure-to-reassess global relevance** than with a purely success-triggered continuation mechanism.

## Interim mechanism interpretation

The surviving v0.3 trajectories suggest at least two separable phenomena may exist:

1. **Global relevance neglect / task-set persistence** — the agent can keep working the active local task even when the global bottleneck has already moved elsewhere. The Data S10/S11 pair is the clearest contaminated-but-visible example because REPLAN persists under both local outcomes.
2. **Possible success-specific continuation increment** — the Cloud S01/S03 pair is directionally consistent with success adding extra persistence, but missing actions prevent identification.

Therefore v0.4 should not be interpreted as a binary “LSCB exists / does not exist” test only. The key discriminant is whether, under LOW global relevance:

- SUCCESS causes more continuation than FAILURE **within the same domain**, beyond generic persistence; and
- STGR reduces that **success-specific increment** rather than merely making the agent stop more often in all LOW-relevance states.

## What would distinguish the mechanisms in v0.4

- **LSCB / success-cue sensitivity:** Baseline SUCCESS×LOW > FAILURE×LOW on ECS or local continuation, with the direction recurring across domains.
- **Generic task momentum/context persistence:** SUCCESS×LOW and FAILURE×LOW are similarly high, with little success differential.
- **Switching-cost explanation:** persistence should be strongest where returning to the global goal requires a larger task-set shift, not necessarily where local outcome is SUCCESS.
- **Information-gain explanation:** continuation should track whether an additional local observation can still reduce uncertainty; scenarios explicitly stating that further observations cannot change the global inference should attenuate this explanation.
- **STGR-specific success:** C should reduce the SUCCESS×LOW excess without materially worsening FAILURE×HIGH correct persistence.
- **Over-stop side effect:** PS rises or CP falls in HIGH-relevance cells, indicating that the intervention is suppressing continuation indiscriminately.

## Boundary

Because v0.3 continued execution after UNPARSEABLE outputs, later turns are contaminated by the runner's technical behavior. These observations are hypothesis-generation / mechanism-discrimination notes only. The target claims remain pending v0.4.

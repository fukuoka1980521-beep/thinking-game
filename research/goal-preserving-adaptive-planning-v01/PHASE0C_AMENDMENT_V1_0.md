# Phase 0c Amendment — Open-Action Generation

Date: 2026-10-04
Status: DESIGN BEFORE OUTPUT COLLECTION

## Phase 0b result

Phase 0b removed the ceiling and produced:

- CTRL: 3/4
- GOAL_EVENT: 4/4 with 69 injected tokens
- COMPACT_STATE_EVENT: 4/4 with 316 injected tokens
- FULL_EVENT: 3/4 with 224 injected tokens

The most efficient successful intervention was GOAL_EVENT.

In the patch-loop scenario:
- CTRL chose PLAN_RIGIDITY.
- GOAL_EVENT recovered the goal-consistent next action.
- COMPACT_STATE_EVENT also recovered the correct action.
- FULL_EVENT still chose PLAN_RIGIDITY.

Therefore full-brief repetition is not assumed to be superior to concise current-goal reinjection.

## Question

Can a short current-goal reminder improve free next-action generation under the same difficult transcripts?

## Conditions

CTRL
- no reinjection.

GOAL_EVENT
- current target only, injected once after the key event.

COMPACT_STATE_EVENT
- TARGET / DONE / NOW / RULE, injected once after the key event.

FULL_EVENT is dropped because it was less accurate and more expensive than GOAL_EVENT in Phase 0b.

## Runs

Same four Phase-0b hard scenarios.

4 scenarios × 3 conditions × 1 deterministic replicate = 12 runs.

## Final prompt

No answer options.

What should you do next?

Return exactly:
NEXT_ACTION: <one concrete next action>
RATIONALE: <one concise sentence>

The model is not asked to restate the goal.

## Primary metric

Scenario-specific open-action correctness.

Ambiguous outputs are marked REVIEW rather than silently counted as correct.

## Practical GO signal

GOAL_EVENT is the leading candidate if:

1. it improves correct open-action generation versus CTRL;
2. it correctly handles the legitimate-goal-change scenario;
3. it does not increase clearly wrong actions;
4. its token overhead remains lower than COMPACT_STATE_EVENT.

If CTRL again reaches 4/4, the scenario set still has a ceiling and the next study must increase conversational ambiguity/length rather than sample size.

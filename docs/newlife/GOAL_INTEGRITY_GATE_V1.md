# GOAL INTEGRITY GATE V1

Date: 2026-09-29
Applies to: NEW LIFE and, after validation, other long-running AI-assisted development work.

## Purpose

Prevent a technically correct local change from moving the product away from the owner's actual high-level goal.

This gate is evaluated before implementation and again before merge/release.

## A. Goal statement

Write the user-visible outcome this change is supposed to improve in one sentence.

If the sentence names only an implementation artifact (regex, reducer, classifier, component, test count, prompt, API), rewrite it until it names the player/user outcome.

## B. Classification

Classify the proposed change:

- GOAL-DIRECT: directly improves the primary human outcome
- GOAL-BLOCKER: removes something preventing that outcome
- SUPPORTING: necessary infrastructure with a clear causal path
- LOCAL-OPTIMIZATION: improves a subsystem without demonstrated product gain

LOCAL-OPTIMIZATION is not automatically rejected, but it must not outrank GOAL-DIRECT work.

## C. Required questions

1. What user-visible behavior changes?
2. Which original product promise does this serve?
3. What could become worse even if all tests pass?
4. Is this solving a transcript/example instead of the underlying mechanism?
5. Are we adding a new abstraction because it is easier to test rather than because the user needs it?
6. Does an earlier human-accepted implementation already solve this better?
7. Are we preserving free-text agency, character identity, world truth, and state consequence?
8. Are we turning a generative problem into a deterministic parser only because deterministic code is easier to control?
9. Are we replacing observed human evidence with developer preference?
10. Can the change be removed without the player noticing? If yes, why is it priority work?

## D. GOAL DELTA

Record BEFORE and expected AFTER using evidence, not decorative scores.

Required dimensions for NEW LIFE:
- free-language understanding
- conversational naturalness
- character consistency
- world/state consequence from free text
- truth/authority integrity
- story continuity
- choice dependence
- visual identity preservation

For each dimension use:
- IMPROVES
- PRESERVED
- RISKS REGRESSION
- NOT AFFECTED
- UNKNOWN

Any RISKS REGRESSION or UNKNOWN on a core dimension requires a targeted validation.

## E. Surrogate-objective warning

The following are implementation evidence, not product success:
- more passing unit tests
- higher route coverage
- fewer unhandled intents
- more deterministic outputs
- lower prompt variance
- fewer model calls
- more complete state enums
- more authored story branches

They may support the product. They may also replace it.

Always state the causal link.

## F. Human evidence hierarchy

When evidence conflicts, use this order:

1. Direct owner/player human play of the actual experience
2. Blind human evaluation of transcripts
3. Behavioral integration tests that exercise the player loop
4. Semantic automated evaluation
5. Unit/type/build tests
6. Developer intuition

Lower layers cannot overrule a clear failure observed at a higher layer without explaining why the observation was invalid.

## G. Stop conditions

Stop and return to goal review if:
- three or more patches address neighboring symptoms without improving human play
- a previously accepted experience becomes less natural
- a new feature requires explaining why the player should value it
- choice buttons gain state authority that equivalent free text lacks
- exact phrase tables grow in response to natural-language failures
- tests are green while owner play remains unsatisfactory
- story completion advances while the core conversation loop is still weak

## H. Merge note template

GOAL:
CLASS:
OBSERVATION:
HYPOTHESIS:
MECHANISM:
ALTERNATIVES:
FALSIFIER:
MINIMUM TEST:
GOAL DELTA:
HUMAN EVIDENCE:
DECISION:

## I. NEW LIFE current root decision

GOAL:
The player should feel that ordinary conversation with persistent characters changes a living 30-day world.

NON-NEGOTIABLE:
- conversation first
- choices secondary
- story creates situations rather than dictating ordinary replies
- generative model owns expression
- deterministic code owns truth/authority/state
- accepted characters/visuals are preserved
- human play outranks technical green

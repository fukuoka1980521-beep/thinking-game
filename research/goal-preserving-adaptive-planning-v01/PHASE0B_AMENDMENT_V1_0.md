# Phase 0b Amendment — Ceiling Removal and State Compression

Date: 2026-10-04
Status: FROZEN BEFORE PHASE-0B OUTPUT COLLECTION

## Why Phase 0b is necessary

Phase 0 completed 20/20 runs.

Observed:
- CTRL = 4/4
- GOAL10 = 4/4
- FULL10 = 3/4
- STATE10 = 4/4
- STATE_EVENT = 3/4

Primary failure:
- CTRL ceiling effect. The scenarios made the correct goal/plan distinction too explicit.
- The original STATE block was not actually compact: injected-token overhead exceeded FULL10.

Therefore Phase 0 cannot estimate intervention benefit.

## What changes

1. Harder scenarios:
   - no explicit meta-instruction saying "do not confuse tool with goal";
   - correct action is not linguistically highlighted;
   - after the blocking/change event, several recent turns reinforce the locally attractive but potentially wrong path;
   - final options are all plausible operational actions.

2. Shorter intervention:
   Four-line state block only:
   TARGET / DONE / NOW / RULE.

3. Event timing only:
   The intervention is injected once after the key event.
   Fixed-period comparison is deferred until there is evidence that reinjection itself matters.

## What does not change

Operational success criterion remains:
Goal stability + plan plasticity.

The system should:
- retain a valid target while changing failed means;
- accept a legitimate authoritative target change;
- avoid local optimization and sunk-cost plan rigidity.

## Conditions

CTRL
- no reinjection.

GOAL_EVENT
- one-line current target reminder after the key event.

COMPACT_STATE_EVENT
- four-line dynamic state reminder after the key event.

FULL_EVENT
- full original brief repeated after the key event.

## Size

4 harder scenarios × 4 conditions × 1 replicate = 16 runs.

Phase 0b remains calibration only.

## Phase-0b GO signal

COMPACT_STATE_EVENT is promising if:
- it exceeds CTRL on total correctness;
- it does not fail the legitimate-goal-change scenario;
- it uses fewer injected tokens than FULL_EVENT.

If CTRL again scores 4/4, declare the forced-choice paradigm too easy and move Phase 1 to open-action generation rather than increasing N.

# Phase 0d Manual Adjudication v1.0

Date: 2026-10-04

Automated totals:
- CTRL: 1 correct / 2 wrong / 1 review
- GOAL_EVENT: 2 correct / 2 wrong
- COMPACT_STATE_EVENT: 3 correct / 1 wrong
- FOCUS_GAP_EVENT: 2 correct / 1 wrong / 1 review

Manual review:
- CTRL H2: CORRECT. It switches to scripted import and integrity checking.
- FOCUS_GAP_EVENT H2: WRONG. It returns to the original utility and proposes a custom decoder despite a successful scripted-import path; this is sunk-cost plan rigidity.

Effective totals:
- CTRL: 2/4
- GOAL_EVENT: 2/4
- COMPACT_STATE_EVENT: 3/4
- FOCUS_GAP_EVENT: 2/4

Interpretation:
1. Goal-only reminder remains insufficient.
2. Compact State is currently the best condition, but still fails H3 patch-loop.
3. Focus Gap helps H1 but fails H2 and H3.
4. In Phase 0d, Focus Gap was injected after the key event and then followed by several local/distractor turns before the final decision.
5. This creates a new timing hypothesis: the same useful state may lose decision influence as it moves away from the current turn.
6. Next test should hold Focus content fixed and vary only reinjection position.

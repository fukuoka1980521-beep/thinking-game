# Phase 0e — Focus Timing Test

Status: DESIGN BEFORE OUTPUT COLLECTION
Date: 2026-10-04

Purpose:
Separate content failure from positional/timing decay.

Observation:
FOCUS_GAP_EVENT was inserted after the key event, then followed by multiple local turns before final action selection.
It succeeded in H1/H4 but failed H2/H3.

Hypothesis:
The Focus state may be useful but lose influence as subsequent turns push it toward the middle of the active context.

Use the exact same Focus text as Phase 0d.

Conditions:
1. CTRL — no focus reinjection.
2. FOCUS_EVENT — Phase 0d timing, immediately after the key event.
3. FOCUS_LATE — same Focus text injected immediately before the final decision prompt.
4. FOCUS_REFRESH — same Focus text after the event and again immediately before final decision.

No wording changes are allowed between the three Focus conditions.

Runs:
Same four open-action scenarios.
Existing CTRL and FOCUS_EVENT outputs may be reused descriptively, but Phase 0e counted comparison will generate fresh deterministic runs for all four conditions to avoid mixed-run provenance.

4 scenarios x 4 conditions = 16 runs.

Primary question:
Does moving or refreshing the exact same Focus state near the final decision improve open-action correctness?

GO signal:
- FOCUS_LATE or FOCUS_REFRESH must exceed CTRL and FOCUS_EVENT;
- H2 and H3 must both be correct;
- H4 legitimate goal change must remain correct.

This phase directly tests positional/timing degradation rather than adding more state content.

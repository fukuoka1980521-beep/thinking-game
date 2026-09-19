# NEW LIFE — Day 1 + Day 2 Test Matrix V1 (PHASE_22)

Test plan for the vertical slice, per directive Section 17. **Not executed this phase** -- no
code exists yet to test (PHASE_22 is prep; implementation is gated on the Visual First Gate, which
is gated on art that does not yet exist). This matrix is what the implementation phase runs
against, so test coverage is designed alongside the gameplay, not bolted on afterward.

| # | Path | What it proves | Automated or real-browser | Pass condition |
|---|---|---|---|---|
| 1 | First 10 minutes (arrival → 2 actions → evening) | The core loop is intact end to end with no system explanation | Real-browser, semantic (not blind-click) | Player reaches Day 2 having met exactly 1 or 2 NPCs, made 1 real choice, seen 1 concrete event moment |
| 2 | Day 1 → Day 2 transition | The town-change proof point is real, not just new text | Automated (state assertion) + real-browser (visual/text check) | Whichever location was skipped Day 1 shows a canonical state difference on Day 2, verified in both the request payload (`currentEvent`/`knownFacts`) and the rendered scene |
| 3 | Hina-first path | The slice works when the player's first action is Hina, not Yohei | Real-browser | Day 1 completes coherently; Day 2's delivery-event proof still lands (player skipped Yohei) |
| 4 | Yohei-first path | Symmetric check | Real-browser | Day 1 completes coherently; Day 2's Hina-shop-progress proof still lands (player skipped Hina) |
| 5 | Ignore-event path | The delivery event is genuinely ignorable | Real-browser | Player never engages the "keep an eye out" choice; Day 2 still resolves the delivery with no penalty, no missed-content framing |
| 6 | Engage-event path | The optional choice produces a distinct, personal (not different-outcome) acknowledgment | Automated (assert the WorldFact/acknowledgment text differs from the ignore-path text) + real-browser | Day 2's Yohei line differs in *acknowledgment*, not in *outcome*, from path 5 |
| 7 | One-person-focused path (both Day 1 AND Day 2 actions spent on Yohei only) | The slice doesn't collapse into repetition when a player fixates on one NPC | Real-browser | Day 1 visit 1 and visit 2 to Yohei are not identical screens (ordinary-life variety); Day 2's delivery resolution still lands on a return visit |
| 8 | No-free-talk path | The game is a game without the AI layer | Real-browser, live-toggle OFF (deterministic adapter only) | All of tests 1-2 still pass identically with zero free-text exchanges |
| 9 | System/AI boundary (carried forward, not re-litigated) | The delivery event and Hina's shop-progress state are never decided by an AI reply | Automated (reuse `newlifecoreAiResponsibilityBoundary.test.ts`'s existing pattern, extended to the new event) | An adversarial AI reply claiming the delivery arrived/didn't cannot change the canonical flag -- same invariant class as PHASE_18/19, applied to this slice's one new event |
| 10 | Visual regression (once assets exist) | The 5 new/changed assets render correctly at all 4 required viewports | Real-browser, screenshots | 360x800 / 390x844 / 430x932 / 1440x900, no horizontal overflow, no clipping |

## Explicit non-goals for this test matrix

No 30-day, no Reality Bridge, no other NPCs -- this matrix tests exactly the 2-person, 3-location,
2-day slice named in the directive, nothing broader (matching PHASE_22 Section 14's frozen list).

## Gate this matrix feeds

Per directive Section 18, passing this matrix is necessary but not sufficient for
`READY_FOR_OWNER_VERTICAL_SLICE_REVIEW = YES` -- the Owner's own manual play-and-judge ("is this
finally more interesting than the previous build?") is the actual gate; this matrix only confirms
the slice is *functionally* correct before asking for that judgment.

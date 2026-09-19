# NEW LIFE — Episode Provenance Audit V2.1 (PHASE_24.1, Section 5)

Extends `NEWLIFE_EPISODE_PROVENANCE_V2.md` (kept, not deleted -- its 3 `REAL_OWNER_DERIVED`
findings and its explanation of why sibling "-os" projects and this repo's own tester records were
deliberately not searched both still stand). This revision adds a new, explicitly Owner-authorized
category and upgrades one existing entry now that a second real source exists for it.

## New category: OWNER_SUPPLIED_REAL_CORE

The Owner has now directly supplied 10 fictionalizable human-pattern cores (OWNER-01 through
OWNER-10) from their own real experience, explicitly authorizing their use as story-source material,
explicitly barring reproduction of company names, real third-party identities, exact private facts,
or identifiable incidents -- only the human pattern is used. This is a genuinely different, stronger
provenance category than last revision's self-discovered `REAL_OWNER_DERIVED` citations (those were
found by searching `docs/DECISIONS.md`; these were handed over directly). Per the task's own
instruction, this is reported as `OWNER_SUPPLIED_REAL_CORE`, explicitly NOT as
`REAL_CONSULTATION_DERIVED` -- no third-party consultation provenance is claimed here or anywhere in
this project yet.

| ID | Pattern (fictionalized, no real identities) | Used for |
|---|---|---|
| OWNER-01 | Became defensive when real users criticized something built; later realized the creator must be the product's harshest critic. | Deepens Hina's arc, specifically E04 (unsolicited advice) and her CONTRADICTION field in `NEWLIFE_30DAY_GAMEBOOK_CHARACTER_ARCS_V2.md` -- her instinct to read criticism as rejection, and the possibility of growing past it. |
| OWNER-02 | Repeatedly rushed toward a finished result, skipping front-end discovery/verification, creating longer rework later. | A second, independent real source for Daisuke's stalled-decision arc (E17/E23) -- see the COMPOSITE_REAL upgrade below. |
| OWNER-03 | Simplified generated assets to satisfy a local technical requirement and accidentally destroyed the value of the original finished material. | Yohei's Day 20 festival-stock decision under real budget constraint -- cutting a corner under pressure can quietly undermine the very thing it was meant to protect. |
| OWNER-04 | Generic assumptions about "where the button should be" repeatedly failed during screen-operation guidance; learned the currently visible screen is the only reliable truth. | Jin's own working method -- re-examining the actual physical object (the bench) up close rather than fixing from memory/assumption, now made explicit in his Day 21 scene. |
| OWNER-05 | A system passed a very large number of technical tests yet was still not fun; technical PASS and product success are different facts. | Fumiko's Day 19 festival-prep scene -- a checklist can be fully "done" while something human is still missing; she pauses and personally invites people rather than trusting the flyer alone. |
| OWNER-06 | Increasing AI autonomy improved development, but repeated stagnation showed timely human intervention remains essential. | Informs the DESIGN of Jin's offer mechanic itself (Days 5/21) -- the town runs fine without the player, but a well-timed, specific intervention from the player is still what actually moves his arc, not autonomy alone. |
| OWNER-07 | For a real proposal, stopped treating expected benefits as assumed facts and redesigned the work to collect real measurements first. | Directly informs the AUTHORED DECISION RULE for Miyoko's Day 28 outcome (`NEWLIFE_30DAY_GAMEBOOK_STATE_MODEL_LEDGER_V2_1.md`) -- her outcome is now determined by accumulated real observation evidence, never assumed or live-decided by a model. |
| OWNER-08 | Long sales experience: people act more strongly when they feel they reached a decision themselves rather than being pushed into it. | Grounds the already-established "listen without pushing a side" design rule for Hina's and Miyoko's arcs -- now explicitly cited as coming from real, lived experience rather than an abstract design preference. |
| OWNER-09 | Free conversation in NEW LIFE became technically impressive but did not create a game until incidents, consequences, and callbacks were introduced. | This is the direct, explicit real-world justification for the entire PHASE_22.5 -> PHASE_24 rebuild lineage (`RELATIONSHIP_EVIDENCE`, the callback-as-core-mechanic rule) -- cited here as the project's own central design thesis, not attached to one single episode. |
| OWNER-10 | A failure or problem often became the trigger for the next, better development method, rather than simply being wasted work. | Reflects this project's own iteration itself (PHASE_23 V1 -> PHASE_24 V2 -> this PHASE_24.1 repair, each triggered by a prior round's honestly-reported failure) -- noted here as a closing observation, not forced into a single character's arc. |

## Provenance upgrade: Daisuke's arc (E17/E23) — REAL_OWNER_DERIVED -> COMPOSITE_REAL

Last revision could not use `COMPOSITE_REAL` because only one real source (the self-discovered
`docs/DECISIONS.md` citation) was in scope. With OWNER-02 now directly supplied, two independent
real sources exist for the same human pattern (repeated avoidance of a hard decision, followed by
eventual real-but-undramatic resolution): the project's own documented development history AND the
Owner's own directly-supplied sales/product-building pattern. E17 and E23 are reclassified
`COMPOSITE_REAL`, citing both sources explicitly, per the task's own definition of that category
(blending at least two independent real sources into one fictional core).

## Unchanged from V2

E09 stays `REAL_OWNER_DERIVED` (single source, `docs/DECISIONS.md` only -- no Owner-supplied core
maps cleanly enough to it to justify a `COMPOSITE_REAL` upgrade without stretching the parallel).
The remaining 45 episodes stay `ORIGINAL_FICTION`, unchanged, for the same reasons already recorded
in V2 -- no real, accessible, appropriately-scoped source material exists for them, and this
revision does not stretch that boundary just because more real material became available for other
threads.

## Running total after this revision

- `COMPOSITE_REAL`: 2 (E17, E23)
- `REAL_OWNER_DERIVED`: 1 (E09)
- `OWNER_SUPPLIED_REAL_CORE`: not counted as "episodes" in the original 50-seed bank -- these are
  10 new pattern-cores, several woven into existing arcs/mechanics (Hina, Yohei, Jin, Miyoko,
  Fumiko) and two (OWNER-09, OWNER-10) cited as project-level design justification rather than
  episode content. This is reported separately in the PHASE_24.1 close as
  `OWNER_REAL_CORE_EPISODES`.
- `REAL_CONSULTATION_DERIVED` / `REAL_WORKPLACE_DERIVED`: still 0, still unclaimed, per the task's
  own explicit instruction not to claim third-party consultation provenance yet.
- `ORIGINAL_FICTION`: 45 (unchanged episodes not touched by this revision).

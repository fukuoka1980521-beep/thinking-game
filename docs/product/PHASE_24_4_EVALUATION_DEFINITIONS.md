# PHASE_24.4 — Evaluation Definitions (Section 13, frozen before any replay)

Per Section 13's explicit methodology lock: these definitions are written and committed to before
any Days 23-30 corridor replay or full-month revalidation happens in this round, specifically to
prevent the kind of mid-audit definition drift PHASE_24.3's own verdict disclosed (a
`WORLD_PROGRESS_VISIBLE` labeling correction discovered partway through that round's own
calculation). If a problem with these definitions is discovered after replay, it will be reported
as a finding, not silently used to relabel historical days.

## TOMORROW_PULL (0-5)

A holistic, subjective judgment of how much the day's content makes the player want to continue to
the next day -- driven by genuine open threads, curiosity, or anticipation the day's actual content
creates, never by a mechanical count of state variables touched. Scored the same way for a day
regardless of which run is being played; what differs between runs is which content that day's
choices actually surface, not the scoring standard applied to it.

## WORLD_PROGRESS_VISIBLE (Y/N)

**Y** if an event, decision, change, or happening occurs in the town/world that day which is
perceivable in the day's narration -- **regardless of whether the player caused it, was present for
it, or only hears of it ambiently/secondhand.** This is the exact standard PHASE_24.3's own verdict
arrived at after correcting an earlier, inconsistent draft (which had conflated "the player didn't
cause this" with "nothing happened") -- adopted here as the frozen definition, not re-litigated.

**N** only if the day contains literally no town-level event, decision, or change at all -- a pure
"nothing happened" day. A day where the ONLY content is the player's own private, unwitnessed
choice with no observable trace (the Section 4/Day 29 kindness beat, by its own explicit design) is
still evaluated under this same standard: if a separate, unconditional WORLD_PROGRESS beat exists
elsewhere in that same day (per this round's Layer A requirement), the day is Y; the private
beat's own lack of visible trace does not, by itself, make the whole day N.

## OPEN_QUESTION_AT_DAY_END (specific text, or NONE)

A concrete, statable question the player could reasonably be wondering about after this day,
grounded in a real, already-existing story thread (world fact, relationship thread, or knowledge
gap) -- never a manufactured, generic question with nothing behind it ("I wonder what tomorrow
holds" does not count; "will Hina's next test go better than the first?" does, if a next test has
actually been established). Recorded verbatim per day. **NONE** only if no such grounded question
exists that day -- and per Section 12/14, this must never occur two days in a row in the final,
repaired version.

## PLAYER_CAUSALITY (YES / PARTIAL / NO)

YES: the player's own choice directly created a specific, named piece of evidence, knowledge, or
state that day. PARTIAL: the player was present/engaged but the day's main content would have been
identical regardless (e.g. witnessing an unconditional event without acting on it). NO: the player
took no action relevant to that day's content, or was absent from it entirely.

## WHAT_CHANGED_WITHOUT_PLAYER / WHAT_CHANGED_BECAUSE_OF_PLAYER

Free text, always both considered: the first names the WORLD_PROGRESS-layer fact(s) true regardless
of the player; the second names anything the player's specific choice added (evidence, knowledge, or
a colored/timed variant of an outcome that happens either way). The first field is never empty for
a day scored `WORLD_PROGRESS_VISIBLE = Y`. The second may legitimately be empty ("--") on a day the
player did nothing relevant -- that is not itself a scoring problem, since Layer A content still
renders.

These five definitions are used, unchanged, for every day of the Days 23-30 corridor test and the
full Day 1-30 revalidation that follow in this round.

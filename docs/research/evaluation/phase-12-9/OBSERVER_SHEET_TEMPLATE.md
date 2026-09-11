# Observer Sheet -- HV-0_

Duplicate this file per tester as `HV-01_observer.md`, `HV-02_observer.md`, etc. Fill in live during the session where possible; the tester is referred to only by this anonymized ID in every field below and in any later write-up.

- Tester ID: HV-0_
- Baseline commit / tag: `1356b1a` / `phase-12-9-human-validation-baseline`
- Device: (desktop / phone / tablet -- note screen size if phone)
- Session start time / end time:
- Opt-in for research use given? Y / N
- Reality Bridge opt-in checkbox toggled by tester? Y / N (do not point it out)

## Timeline (fill as it happens, roughly timestamped)

| Time / Day-in-game | What they did | What they said (verbatim where possible) | Observer note |
|---|---|---|---|
| | | | |

## Structured observations (fill after, from the timeline above -- leave blank if not observed, do not guess)

- First place they went:
- First person they talked to:
- Did they use free text conversation? If yes, roughly what about:
- Did they revisit the same NPC more than once? Who:
- Where did they hesitate / seem lost:
- Any on-screen text they visibly skipped or didn't read:
- Any "back" / undo-style action, and where:
- Anything that showed they misunderstood a mechanic (describe what happened, not what you told them):
- Any spontaneous "明日は？" / next-day-oriented remark:
- Did they discover Reality Bridge on their own? How:
- Did they describe any opportunity/offer as a job/quest in their own words?
- Did they notice or remark that the town moves on its own (an NPC not where expected, a change they didn't cause)?
- Any moment they seemed ready to stop / said something like "this is a good place to pause":

## Understanding gap classification (Feynman diagnostic, added THINKING_GAME_FEYNMAN_UNDERSTANDING_DIAGNOSTIC_V0_1)

This is a diagnostic layer, not a tutorial-planning tool. The point is to find where a player's mental model of the game diverges from what's actually happening -- not to decide, from a single session, that anything needs explaining. Do not propose or add in-game explanation text based on this sheet alone.

**Before classifying "I don't understand X" as a problem**, apply this rule:
- "分からない" + the tester **wants to find out** (asks a follow-up, says they'll try something to check, seems curious rather than stuck) -> candidate **INTENDED_MYSTERY** (the game may be working as designed -- some things are meant to be discovered slowly, not explained).
- "分からない" + the tester **also doesn't know what to do next** (stalls, disengages, or does something arbitrary because they've given up figuring out the "real" action) -> candidate **ACCIDENTAL_CONFUSION** (this is a real problem signal regardless of the first classification).

These two are not mutually exclusive with the categories below -- they describe the *quality* of a gap (productive vs. stuck), the categories below describe its *location*. Tag every gap moment with one location category AND, where applicable, the mystery/confusion judgment.

**Location categories** (pick the closest one; use `UNKNOWN` rather than forcing a bad fit):
- `GOAL_CONFUSION` -- unclear what the game is even about / what they're meant to be doing overall
- `STATE_CONFUSION` -- unclear what is currently true (their own status, the town's, an NPC's)
- `CAUSAL_CONFUSION` -- they noticed a change but couldn't connect it to why it happened
- `ACTION_CONFUSION` -- unclear what an available action would actually do, or how to take it
- `WORDING` -- the specific text/label used was the problem, not the underlying concept
- `UI` -- a control was hard to find, use, or recognize as interactive
- `FEEDBACK` -- they did something and got no visible confirmation it registered
- `WORLD_CONTINUITY` -- didn't notice, didn't believe, or misread that the world persists/moves independent of them
- `INTENDED_MYSTERY` -- the gap itself looks like designed-in not-knowing-yet, not a defect (use together with the rule above)
- `ACCIDENTAL_CONFUSION` -- the gap left them stuck with no path forward (use together with the rule above)
- `UNKNOWN` -- couldn't confidently classify from what was observed

## Gap log (one row per observed gap, during play or from Q2/Q3/Q6 answers)

| What happened / what they said | Location category | Mystery or confusion? | Observer confidence (high/med/low) |
|---|---|---|---|
| | | | |

## Session outcome

- Ended at: (Day __, approx __ minutes)
- Ended because: (natural stopping point / time budget reached / tester wanted to stop / other -- describe)
- Any blocking bug encountered? (Y/N -- if Y, describe with enough detail to reproduce; do not fix in-session)

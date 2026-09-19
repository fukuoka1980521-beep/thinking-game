# NEW LIFE 7 DAYS — Game Design V1 (PHASE_21)

DESIGN_FIRST, NO_PRODUCT_IMPLEMENTATION. This document is the top-level spec; the other 9 PHASE_21
documents are its supporting detail. Nothing here has been implemented.

## What is the game?

**NEW LIFE 7 DAYS**: you've just moved to a small town you don't know. You have seven days before
you have to decide whether this town is somewhere you actually want to stay. Each day you can
spend real time with at most two people or places. Over a week, you'll know a few people, half-know
a few more, and the town will have quietly kept moving whether you showed up or not.

One-line candidates (Section 7 requires 3, then one chosen):

1. 「知らない町で7日間暮らし、誰と時間を過ごすかを選ぶゲーム。」
2. 「7日間だけ、この町の住人になってみる話。」
3. 「毎日2つだけ選べる、小さな町での7日間。」

**Chosen: #1** ("a game about choosing who you spend your time with, while living in a town you
don't know yet, for seven days"). #2 is more atmospheric but doesn't name the actual mechanic
(the choice of who/where). #3 names the mechanic but not the feeling. #1 does both in one line and
is what the rest of this design is built to deliver on.

Anything that doesn't serve "choosing who to spend limited time with, in a town that keeps living
without you" is a candidate to cut from the 7-day core (see
`NEWLIFE_KEEP_REWORK_REMOVE_MATRIX_V1.md`).

## What is fun?

Not "the AI conversation is good" (Section 3's Coffee Talk lesson: AI/conversation alone is not a
game). The fun is the **scarcity + memory** loop: you only get 2 actions a day, 14 across the whole
week, and the town remembers exactly which 14 you spent and on whom. That scarcity is what turns
"talk to an NPC" into "choose between two people" — the actual game verb from Section 5's CORE
LOOP. Fun candidates, in priority order:

1. **Noticing a person and wanting to know what happens to them** (Yohei's succession worry, Hina's
   opening-day nerves) — the "keep coming back to one thread" pull Coffee Talk and Night in the
   Woods both rely on.
2. **Feeling the cost of a choice** — visiting Yohei today is a day you didn't visit Miyoko, and the
   game never pretends otherwise (no "see everyone anyway" safety net).
3. **The town changing without asking your permission** — Day 2's core proof point (Section 25).
4. **A small, real consequence landing later** — Day 4's payoff for something you did (or didn't do)
   on Day 1-3.

## Why Day 2? Why Day 7?

**Day 2** is the day the player learns the central rule of the whole game by feeling it, not being
told it: the town does not wait for you. Something changes at a location you didn't choose to visit
yesterday. This is the one thing that must land correctly, because everything else (the value of a
choice, the reason to return, the reason to *not* be able to see everyone) depends on the player
believing the town is a real clock, not a menu.

**Day 7** is not an ending screen. It's the day the choices already made become visible as a shape:
who you actually spent time with (not who exists), what's still open, what changed because of you
specifically. Section 30 explicitly bans GOOD END/BAD END framing — Day 7's job is to make two
different players' 7 days look and feel different from each other, not to grade either of them.

## Why these six people? Why these locations?

See `NEWLIFE_CHARACTER_ROSTER_V2.md` and `NEWLIFE_TOWN_DESIGN_V1.md` for the full designs and the
KEEP/REWORK/BACKGROUND/REMOVE reasoning per NPC and location. Summary: six people spanning five
different life stages (20s newcomer, 40s craftsman, 50s independent worker, 60s shopkeeper, 60s
café owner, 70s community elder), each tied to one of six locations that already exist in the
current codebase (`TRIAL_HOUSE`, `YOHEI_STORE`, `CAFE_NODOKA`, `SHOPPING_STREET`, `COMMUNITY_HALL`,
`FORTUNE_HOUSE`), each with a reason the player would choose them over someone else on a given day.

## What does the AI do? What does it not do?

Unchanged from the proven architecture (Section 32, and the existing PHASE_18/19 work, which this
phase does not touch): **SYSTEM OWNS TRUTH, AI OWNS EXPRESSION.** The system decides whether a
scene, event, promise, or consequence exists at all; the AI only decides the wording of how a
character says it. This phase adds no new AI capability and removes none.

## What did we remove (from the 7-day core specifically)?

Reality Bridge, the full 30-day retrospective/late-consequence system, and 3 of the current 9 NPCs
(Kamiya moved to a light Day-1-only background role, Kiyoshi and Daisuke's prior barbershop-thinking
role folded/deferred) are out of the 7-day core. None of this is deleted from the codebase — see
`NEWLIFE_KEEP_REWORK_REMOVE_MATRIX_V1.md` for the full accounting and why each cut serves the
one-line description rather than just trimming for its own sake.

## What will we build first?

The smallest vertical slice that proves the core loop end to end: **Day 1 and Day 2 only, with
Hina and Yohei, at 仮住まい/商店街/洋平商店** -- enough to prove "a choice has a visible cost" and
"the town moves without you" before spending any more content budget. See
`NEWLIFE_IMPLEMENTATION_PLAN_AFTER_DESIGN_V1.md`.

## READY_TO_IMPLEMENT_7DAY_SLICE

**YES** for the vertical slice named above. See `NEWLIFE_PAPER_PLAYTEST_V1.md` and Section 45/46's
judgments in this same document's companion CLOSE report for the full gate evaluation.

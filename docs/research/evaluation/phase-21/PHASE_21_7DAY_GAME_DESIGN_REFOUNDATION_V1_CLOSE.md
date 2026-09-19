# PHASE_21_NEW_LIFE_7DAY_GAME_DESIGN_REFOUNDATION_V1 — CLOSE

MODE: DESIGN_FIRST, NO_PRODUCT_IMPLEMENTATION. No product code, prompts, images, or state were
touched this phase. All 10 required design documents were produced in `docs/product/`.

## Documents produced

1. `NEWLIFE_7DAY_GAME_DESIGN_V1.md` -- top-level spec, one-line description, why Day 2/Day 7
2. `NEWLIFE_CHARACTER_ROSTER_V2.md` -- full 9-NPC audit, 6 MAIN NPC designs, relationship graph
3. `NEWLIFE_TOWN_DESIGN_V1.md` -- 6 locations, role-first, day/night, per-location NPCs
4. `NEWLIFE_DAY1_TO_DAY7_ARC_V1.md` -- state-driven day-by-day design intent
5. `NEWLIFE_CORE_LOOP_V1.md` -- the 7-word loop, 2-vs-3-actions-per-day comparison, AI boundary
6. `NEWLIFE_VISUAL_BIBLE_V1.md` -- art canon for all future asset generation
7. `NEWLIFE_CONTENT_BUDGET_V1.md` -- realistic-scope estimate
8. `NEWLIFE_KEEP_REWORK_REMOVE_MATRIX_V1.md` -- every existing system's 7-day-core fate
9. `NEWLIFE_PAPER_PLAYTEST_V1.md` -- first-10-minutes trace + 5 player-type traces
10. `NEWLIFE_IMPLEMENTATION_PLAN_AFTER_DESIGN_V1.md` -- slice-by-slice build order

## Section 48 -- required answers

**WHAT IS THE GAME?** A game about choosing who you spend your limited time with, in a small town
you don't know yet, for seven days.

**WHAT IS FUN?** Not the AI conversation itself -- the scarcity of 2 actions/day (14 across the
week) turning "talk to an NPC" into a real choice with a real cost, plus the town visibly
continuing without the player and visibly remembering what the player did and didn't do.

**WHY DAY 2?** It's the day the central rule (the town doesn't wait for you) is proven by being
shown, not told -- everything else in the design depends on the player believing this by Day 2.

**WHY DAY 7?** It reflects the specific week this specific player had (who they saw, what's still
open) rather than grading them GOOD/BAD -- proving the choices across the whole week actually
diverged into different, equally valid shapes.

**WHY THESE SIX PEOPLE?** Yohei (60s shop), Miyoko (60s café), Jin (50s independent worker), Hina
(20s newcomer), Daisuke (40s craftsman, reactivated from PHASE_15's retired schedule), Fumiko (70s
community elder) -- five different decades, six different roles, each already has (or was
restored to have) a real, specific, non-interchangeable personal thread, audited against the
existing 9-NPC roster rather than invented fresh.

**WHY THESE LOCATIONS?** All 6 already exist as canonical `LocationId`s (`TRIAL_HOUSE`,
`YOHEI_STORE`, `CAFE_NODOKA`, `SHOPPING_STREET`, `COMMUNITY_HALL`, `FORTUNE_HOUSE`) -- redesigned
around a real gameplay role each (buy/help/watch, order/drink/talk, watch two independent
shop-threads, civic/relationship-crossing, a small proven cross-day memory ritual, and the daily
bookend) rather than "a room to chat in."

**WHAT DOES AI DO?** Expresses what the system has already decided, in character, per NPC.

**WHAT DOES AI NOT DO?** Decide whether a scene, event, promise, or consequence exists; decide any
state change; decide day progression. Unchanged from the proven PHASE_18/19 architecture.

**WHAT DID WE REMOVE (from the 7-day core)?** Reality Bridge (explicitly permitted removal per
directive Section 41 -- a thinking-tool feature, not a life-game mechanic), the 30-day
retrospective and late-consequence system (deferred, not deleted, per the directive's own
development-order principle), Miyoko/Fumiko's trajectory seeds (deferred), Kamiya (demoted to
Day-1-only background), Kiyoshi (demoted to ambient background, to avoid re-creating the
age-skew problem this phase corrects), Shizuko's deep Thinking-Resident conversational register
(kept as Fortune House's owner, lighter personality only).

**WHAT WILL WE BUILD FIRST?** The smallest vertical slice: Day 1 + Day 2 only, with Hina and Yohei,
at 仮住まい/商店街/洋平商店 -- see `NEWLIFE_IMPLEMENTATION_PLAN_AFTER_DESIGN_V1.md`.

## Section 43 -- design self-critique

**Q1** (first 10 minutes fun?) A newcomer meeting another newcomer (Hina) mirrors the player's own
situation with zero contrivance, plus one small concrete event (Yohei's festival mention) and one
real choice (which 2 of 6). See the paper playtest's minute-by-minute trace.

**Q2** (why Day 2?) The town visibly changed somewhere the player didn't go -- proven by the design,
not asserted.

**Q3** (does the game survive with less conversation?) Yes by construction -- free talk is
positioned after a structural action (Section 33), never the entry point; every MAIN NPC's
only-event is a structural action (a haircut, a card draw, an order), not a chat topic.

**Q4** (does core loop survive without AI?) Yes -- every SYSTEM-owned mechanic (scenes, events,
promises, day progression) works via the deterministic adapter already proven in PHASE_18/19; AI
only changes the wording.

**Q5** (are the 6 truly distinguishable?) By design (silhouette, build, occupation cue, relationship
role) -- yes on paper; genuinely unverifiable until real art exists, which is why
`CHARACTER_DISTINCTIVENESS` is judged CONDITIONAL below, not PASS.

**Q6** (does each of the 6 have a reason to visit?) Yes -- each has a named only-this-NPC event and
a named return-tomorrow hook in the roster doc.

**Q7** (does each location have a reason to visit?) Yes -- per-location "why come back" is defined
for all 6 in the town design doc.

**Q8** (fun without visiting everyone?) Yes -- verified across all 5 paper-playtest player types,
none of which visits everyone, none of which breaks.

**Q9** (change across Day 1-7?) Yes -- the arc doc defines a distinct design intent per day, not a
repeating template.

**Q10** (understood by action, not text?) Mostly yes -- ordinary-life beats and structural actions
carry most of the meaning; the one open risk is the quiet/low-engagement player's zero-event days,
flagged in the paper playtest as needing a graceful ordinary-life fallback line at implementation
time.

**Q11** (relying on "また来てね"?) No -- every return hook in the roster/arc docs is a dated,
concrete fact, checked per NPC, not a generic phrase.

**Q12** (fun stand-alone before 30-day?) That's the entire premise of this phase's development-order
correction (Section 8) -- the design is built and paper-tested at 7-day scale specifically so this
question can be answered by a human before any 30-day work resumes.

**Q13** (game, not chatbot?) The 2-action budget, dated events, and structural-action-first
ordering are all specifically aimed at this; the honest answer is "the design targets this
correctly," final proof requires the real playtest this design enables, not a paper-only claim.

**Q14** (implementable with current team?) Yes for every content/logic element (see content
budget); **no** independent of this design's quality for the art -- this environment has no
image-generation tool, the same blocker PHASE_20 already surfaced and the Owner already chose to
pause on. This is the one honest CONDITIONAL in this whole design.

**Q15** (scope too greedy?) No -- content budget totals ~13 authored scenes, ~18 ambient lines, 6
events, 6 portraits, 6 location images, all reusing existing engines; the KEEP/REWORK/REMOVE
matrix actively cut 5 systems out of the 7-day core specifically to keep scope realistic.

## Section 45/46 -- final judgments and hard gate

- CORE_LOOP_CLARITY = **PASS**
- FIRST_10_MINUTE_FUN_HYPOTHESIS = **STRONG**
- CHARACTER_DISTINCTIVENESS = **CONDITIONAL** (strong on paper; unverifiable without real art)
- AGE_AND_LIFE_STAGE_DIVERSITY = **PASS** (5 decades, no quota, no invented ages)
- TOWN_IDENTITY = **CONDITIONAL** (same art-dependency caveat as character distinctiveness)
- DAY_NEXT_PULL_DESIGN = **PASS**
- SEVEN_DAY_ARC = **PASS**
- CONTENT_SCOPE = **REALISTIC**
- AI_DEPENDENCE = **APPROPRIATE**
- IMPLEMENTABLE_WITH_CURRENT_TEAM = **CONDITIONAL** (yes for all content/logic; blocked on the
  same image-generation gap PHASE_20 already surfaced, not a new problem introduced here)
- **READY_TO_IMPLEMENT_7DAY_SLICE = NO**

Per the directive's own Section 46 hard gate, YES requires `IMPLEMENTABLE_WITH_CURRENT_TEAM = YES`
exactly, not CONDITIONAL. Every other gate condition passes (CORE_LOOP_CLARITY = PASS,
FIRST_10_MINUTE_FUN_HYPOTHESIS != WEAK, CHARACTER_DISTINCTIVENESS/TOWN_IDENTITY/SEVEN_DAY_ARC !=
FAIL, CONTENT_SCOPE = REALISTIC, AI_DEPENDENCE = APPROPRIATE) -- the design itself is not what's
blocking readiness. The one open item is the same art-generation dependency already surfaced and
already paused in PHASE_20; this phase does not attempt to route around that pause, only to make
sure the design is fully ready the moment art becomes available.

**NEXT IMPLEMENTATION TARGET = Day 1 + Day 2, Hina + Yohei only, 3 locations
(仮住まい/商店街/洋平商店), unblocked by exactly one new portrait (Hina) plus reuse of Yohei's
existing (if imperfect) portrait** -- see `NEWLIFE_IMPLEMENTATION_PLAN_AFTER_DESIGN_V1.md`.

## Commit

Design documents only, per directive Section 47. Committed separately from all existing product
state; no product code touched.

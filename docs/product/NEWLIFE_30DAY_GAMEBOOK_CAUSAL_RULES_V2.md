# NEW LIFE 30-Day Gamebook — Causal Rules V2 (PHASE_24, Sections 3/4/5/6/7/9)

Replaces the implicit rules embedded loosely across V1's docs with an explicit rulebook. This is
what `NEWLIFE_30DAY_GAMEBOOK_STORY_SPINE_V2.md` and `NEWLIFE_30DAY_GAMEBOOK_TEXT_PROTOTYPE_V2.md`
are both required to actually follow, not just gesture at. The core reframe (Section 0 of the task):
the player-facing question stops being "WHERE DO I GO TODAY?" and becomes "SOMETHING IS HAPPENING.
WHAT DO I DO?" -- every rule below exists to make that reframe real rather than cosmetic.

## Section 3 — the 10-step day structure

Every authored day (quiet days included) must move through, in order:

1. **OPENING SCENE** -- never opens with "who do you want to visit today" unless there is an actual
   narrative reason (e.g. Day 1's literal first morning, where there genuinely is no situation yet).
   Instead opens on something already in motion.
2. **SOMETHING HAPPENS** -- a concrete event or observation, however small (a phone glanced at, a
   letter on a desk, a customer's odd request) -- never a blank menu.
3. **WHY THIS MATTERS NOW** -- one sentence connecting the event to an existing thread (character
   arc, prior player choice, or town-wide state) -- if nothing connects, that's a signal the day is
   filler and should be cut or rewritten, per Section 5.
4. **PLAYER INTERVENTION** -- a real, structural choice with the shape defined by Section 4 below.
5. **OPTIONAL FREE TALK** -- available, never mandatory, following the contract in Section 7.
6. **STATE DELTA PROPOSAL** -- whatever the player's choice (structural or free-talk) proposes to
   change, named explicitly, before the system decides anything.
7. **CANON GATE** -- the system accepts, rejects, or bounds the proposal (see Section 7's gate
   rules) -- this step is never skipped, even when the answer is an unremarkable ACCEPT.
8. **VISIBLE CONSEQUENCE** -- what the player can actually perceive as a result, this same day --
   if there is none, the preceding choice was cosmetic (Section 4's removal rule applies).
9. **DELAY / CALLBACK THREAD** -- what gets planted for a later day, and roughly when it's read
   again (see Section 9).
10. **DAY END** -- a closing beat, sized to the day's own `CAUSALITY_LEVEL` (a HIGH day closes
    heavier than a QUIET one).

## Section 4 — the causality rule (the single hardest gate in this rebuild)

For every meaningful intervention offered to the player, the day's author must be able to fill in
all three of:

```
IF PLAYER ACTS: <what changes, specifically, in state the system can point to>
IF PLAYER DOES NOT ACT: <what different thing happens instead, or explicitly "nothing, and that
                          absence is itself later readable">
WHEN DOES THE DIFFERENCE RETURN: <which later day/scene reads this specific delta>
```

**If none of these three differ between "acted" and "didn't act," the choice is cosmetic and must
be removed or rewritten before the day is considered complete.** This is a hard filter, applied to
every intervention in `NEWLIFE_30DAY_GAMEBOOK_STORY_SPINE_V2.md` -- see that document's own
`PLAYER_CAN_CHANGE` / `PLAYER_CANNOT_CHANGE` fields, which are the audit trail proving this rule was
actually checked, not merely stated.

## Section 5 — the quiet day rule

Quiet days are allowed and necessary (three consecutive HIGH-causality days would be exhausting, not
impressive). A quiet day must still do **at least one** of:

- reveal character (a detail that recolors how an NPC reads, without a plot event)
- deepen a relationship (adds real `RELATIONSHIP_EVIDENCE`, see Section 6, even a small piece)
- introduce information (a fact the player didn't have, usable later)
- plant a future thread (an `OPEN_THREAD_CREATED`)
- callback to an earlier choice (a `CALLBACK_FROM`)
- advance world/visual state (something is different that wasn't authored as a "big" event)
- provide emotional recovery after a major scene (a deliberate pacing function, itself a legitimate
  job for a day to do)

**No day may satisfy none of the above** ("empty filler" is explicitly banned), and **no three
consecutive days may all be low-causality** (QUIET-tagged) even if each individually satisfies one
of the bullets above -- pacing requires at least one MEDIUM or HIGH day within any 3-day window.
This second constraint is checked explicitly against `NEWLIFE_30DAY_GAMEBOOK_STORY_SPINE_V2.md`'s
`CAUSALITY_LEVEL` tags before that document is considered complete.

## Section 6 — Relationship Model V2 (`RELATIONSHIP_EVIDENCE`)

**Removes V1's actual failure mode outright**: the assumption that only free-talk (or, worse, mere
visit-count) creates meaningful relationship state. That assumption produced two silent, confusing
dead ends in the V1 playthrough (Hina's and Daisuke's biggest reveals never firing despite heavy,
felt engagement) -- see `NEWLIFE_30DAY_CLAUDE_VERDICT_V1.md`.

**Replacement mechanism**: `RELATIONSHIP_EVIDENCE` -- a named, specific, append-only list of
concrete things the player actually did, per NPC. Examples (the exact shape, not an exhaustive
list): `helped_hina_move_box`, `asked_hina_about_her_goal`, `supported_yohei_publicly`,
`challenged_yohei_privately`, `kept_miyoko_promise`, `returned_after_conflict`.

- A **fixed, authored structural action** (a menu choice, not free text) may create a piece of
  evidence directly -- e.g. choosing "help carry the box" at Hina's shop creates
  `helped_hina_move_box` immediately, system-authored, no AI involved.
- An **AI free-talk interaction** may *propose* a piece of evidence (see Section 7's
  `STATE_DELTA_PROPOSAL` step), but never applies it directly -- the Canon Gate decides.
- **Mere presence or a visit, by itself, creates no evidence.** Walking into Hina's shop and
  leaving without doing or saying anything specific is real (it may still update ambient world
  state like `everVisited`), but it is not `RELATIONSHIP_EVIDENCE` and must never be treated as
  such by a reveal-gate check.
- **Important reveals must check specific, named evidence items relevant to that reveal** -- never a
  generic conversation-count or visit-count variable. See
  `NEWLIFE_30DAY_GAMEBOOK_STATE_MODEL_LEDGER_V2.md` for the concrete evidence-to-reveal mapping per
  character.

## Section 7 — the free-talk contract

Free talk stays central and player-driven; the player may type an unexpected intervention at any
open free-talk point. The contract, in order:

```
PLAYER_FREE_TEXT: <whatever the player actually typed>
AI_CHARACTER_RESPONSE: <in-character expression only -- may reference existing state, invents no
                        new named fact, decides no outcome>
INTENT_CLASSIFICATION: <system-side read of what kind of move this was -- comfort, challenge,
                        curiosity, refusal, deflection, etc. -- feeds which evidence types are
                        even eligible to be proposed>
STATE_DELTA_PROPOSAL: <what the AI proposes should change as a result, using the SAME named
                       RELATIONSHIP_EVIDENCE vocabulary as structural actions -- never a raw
                       numeric increment invented on the spot>
CANON_CONSISTENCY_CHECK: ACCEPTED | REJECTED | MODIFIED, with a stated reason
NEXT_SCENE: <only reachable after the check result>
```

**AI cannot directly modify canonical truth under any circumstance. SYSTEM OWNS TRUTH. AI OWNS
EXPRESSION.** This is unchanged from every prior phase of this project and is not weakened by
adding `INTENT_CLASSIFICATION` -- classification is itself just another proposal input to the same
gate, not a new authority.

**Allowed AI-originated proposals** (the gate may accept these, possibly bounded down in size):
- an emotional reaction
- disclosed knowledge (an existing, already-canon fact the NPC hasn't yet told the player)
- a piece of relationship evidence, in the named vocabulary above
- a small promise
- a player-value observation (the system noticing something about how the player tends to act,
  never surfaced as a score)
- a minor future callback flag

**Forbidden without authored scenario authority** (the gate REJECTS these outright, regardless of
how the free-talk exchange reads):
- an NPC permanently leaving town
- a store opening or closing
- festival cancellation
- destruction of a major relationship
- death or injury
- a major economic outcome
- replacement of any fixed story-spine beat

This list is the direct, gamebook-scale restatement of `validateNpcReply`'s real, already-shipped
discipline -- the size and kind of thing AI expression is allowed to cause has not grown just
because this rebuild adds more nuance to what "small" state changes look like.

## Section 9 — callback is the core mechanic

The proven pattern, reused explicitly (architecture, never story) from the already-implemented
Yohei delivery sequence (`src/newlife7day/`):

```
STATE (a real, present situation exists)
  -> PLAYER INTERVENTION (a real choice, structural or free-talk, that could go differently)
  -> DELAY (time passes -- the outcome is not revealed same-day)
  -> WORLD CHANGE (something concrete and checkable is different)
  -> NPC MEMORY (the relevant character's own dialogue specifically references what the player did)
  -> PLAYER CURIOSITY (the player is left wondering about the NEXT thing this sets up)
```

Every `OPEN_THREAD_CREATED` / `CALLBACK_FROM` pair in
`NEWLIFE_30DAY_GAMEBOOK_STORY_SPINE_V2.md` is required to trace this exact six-step shape --
skipping DELAY (resolving same-day) or skipping NPC MEMORY (a generic, non-specific "thanks") both
count as a broken callback, not a valid one, under this rebuild's own audit standard.

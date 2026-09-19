# NEW LIFE 30-Day Gamebook — Story Spine V2.1 (PHASE_24.1)

Repairs `NEWLIFE_30DAY_GAMEBOOK_STORY_SPINE_V2.md` against the second evaluator's core finding: the
playable prototype still contradicted the design philosophy by making "where do I go today" the
primary daily mechanic. **Every day below now opens automatically on its own authored main scene --
no destination menu.** Optional, narratively-framed town roaming is offered AFTER the main scene on
most days (never the day's primary structure). Day 24 (the festival) keeps a real, bounded
location/time budget, because simultaneous events are what make scarcity meaningful there
specifically -- the one place a budget-style choice remains, by design, not by oversight.

Per Section 6, this is a repair, not a from-scratch rewrite: most gates, evidence items, and
callback chains from V2 survive unchanged; only what Section 3/4's findings actually required is
rebuilt (marked `[FIXED]` where it materially differs from V2). Character SEED/CONTRADICTION/etc.
content stays in `NEWLIFE_30DAY_GAMEBOOK_CHARACTER_ARCS_V2.md`, unchanged, still valid. State
variables reference `NEWLIFE_30DAY_GAMEBOOK_STATE_MODEL_LEDGER_V2_1.md` directly.

Per-day fields: MAIN SCENE (auto-entered) / WHY THIS MATTERS NOW / PLAYER INTERVENTION (with the
IF-ACTS / IF-NOT / WHEN-RETURNS causality triple) / OPTIONAL FREE TALK / OPTIONAL ROAMING AFTER /
VISIBLE CONSEQUENCE, then the 6 required tags.

---

## Movement 1 (Days 1-6)

### Day 1
MAIN SCENE (auto-entered, the one day a "first morning" framing is itself the narrative reason,
per Section 1's own exception): stepping outside for the first time, the street is already alive --
Hina visibly mid-setup, then, a few doors down, Yohei restocking. One continuous first-morning scene,
not a menu between them.
WHY THIS MATTERS NOW: the only chance to form a first impression before any reputation exists.
PLAYER INTERVENTION: help Hina carry a box, then greet Yohei. IF ACTS (helps): creates
`helped_hina_move_box`. IF NOT: a plainer first meeting, no evidence. WHEN RETURNS: feeds every
later Hina relationship-evidence check.
FREE TALK: open at either point in the scene.
OPTIONAL ROAMING AFTER: none offered Day 1 -- the day is deliberately just this one scene.
VISIBLE CONSEQUENCE: Hina's later dialogue differs slightly if helped.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: Hina's shop-progress thread. CALLBACK_FROM: none.
PLAYER_CAN_CHANGE: whether `helped_hina_move_box` exists. PLAYER_CANNOT_CHANGE: `hina_shop_
readiness`'s starting tier (fixed at `not_started`). FREE_TALK_CAN_AFFECT: tone only.

### Day 2
MAIN SCENE: whichever of the two Day 1 didn't dwell on (Yohei's corner, specifically) shows a small,
real overnight change -- a delivery box shifted, something restocked. Auto-entered, not chosen.
WHY THIS MATTERS NOW: Day 2 is the design's foundational proof that the town exists without the
player watching -- made concrete immediately, not asserted.
PLAYER INTERVENTION: notice and comment, or not. IF ACTS: a small, specific acknowledgment exchange.
IF NOT: the change stands, unremarked. WHEN RETURNS: colors whether Yohei's dialogue register later
treats the player as observant (flavor only, no hard gate).
FREE TALK: open.
OPTIONAL ROAMING AFTER: a brief, low-effort stop at Hina's is available (no gated evidence, ambient
only -- ordinary continuity, not a new event).
VISIBLE CONSEQUENCE: the overnight change itself is checkable, not just narrated.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: "the town moves without me" (felt, not mechanical).
CALLBACK_FROM: Day 1. PLAYER_CAN_CHANGE: nothing mechanical yet. PLAYER_CANNOT_CHANGE: the overnight
change itself. FREE_TALK_CAN_AFFECT: tone only.

### Day 3
MAIN SCENE: at the Community Hall, a new flyer is already pinned; Fumiko is visibly busier than
ordinary tidying would explain. Auto-entered -- the flyer itself is the narrative reason to be here
today, not a menu pick.
WHY THIS MATTERS NOW: seeds the whole back-half festival arc from something small and curious.
PLAYER INTERVENTION: ask about it, or not. IF ACTS: `festival_flyer_seen = true`. IF NOT: stays
unexplained, no penalty. WHEN RETURNS: read for a payoff callback line at Days 19/24.
FREE TALK: open.
OPTIONAL ROAMING AFTER: a brief stop at Yohei's is available, ambient only.
VISIBLE CONSEQUENCE: Fumiko's brisk "you'll see, in time" is a real, specific response.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: the festival. CALLBACK_FROM: none. PLAYER_CAN_CHANGE:
whether `festival_flyer_seen` is set. PLAYER_CANNOT_CHANGE: what the festival actually is (revealed
later). FREE_TALK_CAN_AFFECT: tone only.

### Day 4 `[FIXED -- Fix E]`
MAIN SCENE: Hina, visibly tense, admits -- to the player, alone -- she's not sure Yohei likes her.
Auto-entered; Yohei is NOT present in this scene.
WHY THIS MATTERS NOW: a real, specific worry, stated where only the player can hear it.
PLAYER INTERVENTION: reassure her that it's not personal (Yohei treats every newcomer this way), or
say nothing. IF ACTS: creates `reassured_hina_about_yohei` -- **added ONLY to Hina's evidence, per
Fix E** (Yohei was never present and is told nothing here, so he gains nothing from a conversation
he doesn't know happened). IF NOT: the worry persists, unresolved, not punished. WHEN RETURNS: read
by Hina's own reveal gate.
FREE TALK: open, useful for the reassurance itself.
OPTIONAL ROAMING AFTER: **the player may separately choose to actually go raise Hina with Yohei
directly, Yohei present** -- this is a distinct, later-available action (offered here and again on
subsequent days as a roaming option) that creates the SEPARATE item `defended_hina_to_yohei`, added
to BOTH Hina's and Yohei's evidence sets, because this time Yohei is actually there and told. IF
this roaming action is never taken: Yohei's own wariness pattern continues exactly as before,
untouched by anything that happened in a conversation he wasn't part of.
VISIBLE CONSEQUENCE: a real, private moment of trust with Hina; Yohei's own thaw (if it happens)
comes only from a scene he's actually in.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: Yohei-Hina thaw (now correctly gated on a scene Yohei
witnesses). CALLBACK_FROM: Day 1. PLAYER_CAN_CHANGE: whether `reassured_hina_about_yohei` exists;
whether `defended_hina_to_yohei` is ever separately created. PLAYER_CANNOT_CHANGE: Yohei's baseline
wariness pattern itself. FREE_TALK_CAN_AFFECT: can create either evidence item, in the correct scene.

### Day 5
MAIN SCENE: Jin, mid-task, encountered because of where the last few days led (not a destination
pick). IF (`thanked_jin_for_unseen_work` or `noticed_jin_fixed_something` evidence exists already):
he mentions, almost too casually, he wouldn't mind something steadier. ELSE: an ordinary day with
him -- nothing offered yet, and the late window (Day 21) remains fully open.
WHY THIS MATTERS NOW: the first of two windows (Section 6/8's explicit fix for a one-shot gate).
PLAYER INTERVENTION: {if offered} accept or decline. IF ACTS (accept): `jin_arrangement =
accepted`. IF ACTS (decline): `= declined`, no hard feelings. IF NOT (never offered): an ordinary
day, nothing lost. WHEN RETURNS: colors Day 21 and Day 29/30.
FREE TALK: open.
OPTIONAL ROAMING AFTER: a brief stop at the café is available, ambient only.
VISIBLE CONSEQUENCE: a real "yeah, alright" or an easy shrug, immediately, if offered at all.

CAUSALITY_LEVEL: HIGH (when offered) / MEDIUM otherwise (still deepens the relationship per Section
5's own quiet-day allowance). OPEN_THREAD_CREATED: Jin's arrangement thread, if unresolved. CALLBACK_
FROM: Days 1-4's ambient Jin evidence, if any. PLAYER_CAN_CHANGE: `jin_arrangement`'s value, if
offered. PLAYER_CANNOT_CHANGE: whether the offer fires at all today. FREE_TALK_CAN_AFFECT: cannot
manufacture the offer early.

### Day 6
MAIN SCENE: two old friends, already mid-conversation somewhere in town (Yohei and Daisuke, an old
joke landing a little flat) -- the player arrives into something already happening.
WHY THIS MATTERS NOW: proves the town is one social fabric, not six separate rooms.
PLAYER INTERVENTION: watch quietly, or step away -- genuinely cosmetic at the level of this single
choice (an explicitly disclosed exception, same category as V2's Day 23/29, not hidden). IF ACTS OR
NOT: the NPC-NPC moment happens identically either way; only whether the PLAYER personally saw it
differs (flavor only).
FREE TALK: open, low stakes.
OPTIONAL ROAMING AFTER: a brief stop at Daisuke's shop is available -- **this is the first of the
explicit later Daisuke touchpoints required by Fix A** -- a light visit here can create
`returned_to_daisuke_after_deflection` if Day 8 has already happened by the time the player reaches
this day (chronologically it hasn't yet, so this roaming stop is ambient-only this early; the same
roaming option recurs on later days once Day 8 has passed, see Days 14/19/23 below).
VISIBLE CONSEQUENCE: warm, textural, low-stakes.

CAUSALITY_LEVEL: QUIET (explicitly, satisfying Section 5's "reveal character/deepen relationship"
bullet through ambient texture, not through the single flavor choice). OPEN_THREAD_CREATED: none
new. CALLBACK_FROM: none. PLAYER_CAN_CHANGE: nothing durable from the main choice. PLAYER_CANNOT_
CHANGE: the NPC-NPC relationship itself. FREE_TALK_CAN_AFFECT: tone only.

---

## Movement 2 (Days 7-12)

### Day 7
MAIN SCENE: Daisuke's chair, already mid-complaint from an impossible customer -- comedy, auto-
entered.
WHY THIS MATTERS NOW: pacing (Section 5), and a light, real touchpoint with Daisuke before Day 8's
deeper attempt.
PLAYER INTERVENTION: comment warmly on how he handles it, or just watch. IF ACTS: creates
`witnessed_daisuke_comedy_day` (weak evidence, still real). IF NOT: no evidence, purely a laugh.
WHEN RETURNS: contributes to his evidence total (now requiring `>= 2` per Fix in the ledger before
it can move his decision date early).
FREE TALK: open, low stakes.
OPTIONAL ROAMING AFTER: a brief stop at Fumiko's hall is available, ambient only.
VISIBLE CONSEQUENCE: strained professionalism survives, comic relief lands.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: none. PLAYER_CAN_CHANGE:
whether the evidence item exists. PLAYER_CANNOT_CHANGE: the scene's own comic outcome. FREE_TALK_
CAN_AFFECT: can create the weak evidence item.

### Day 8
MAIN SCENE: Daisuke's chair, quieter this time -- an opening for something more personal.
WHY THIS MATTERS NOW: the necessary FIRST deflection, before "returning after deflection" can mean
anything.
PLAYER INTERVENTION: ask something real anyway, or let a comfortable silence stand. IF ACTS: creates
`attempted_daisuke_personal`; he deflects, smoothly. IF NOT: no evidence, an easy, ordinary visit.
WHEN RETURNS: any LATER visit (structural OR via a roaming stop) where the player asks again creates
`returned_to_daisuke_after_deflection`, read through Day 27 -- and, per the ledger's fixed rule,
`COUNT(daisuke_relationship_evidence) >= 2` (not this single item alone) is what's able to move his
independent decision date from its Day-20 default to Day 12.
FREE TALK: this IS the deep-talk moment.
OPTIONAL ROAMING AFTER: a brief stop at Yohei's is available, ambient only.
VISIBLE CONSEQUENCE: a smooth, in-character deflection -- a real character beat, not a dead end.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: Daisuke's card thread (unnamed to the player yet).
CALLBACK_FROM: Day 7. PLAYER_CAN_CHANGE: whether `attempted_daisuke_personal` exists, setting up
future evidence. PLAYER_CANNOT_CHANGE: today's deflection itself. FREE_TALK_CAN_AFFECT: creates the
evidence directly.

### Day 9
MAIN SCENE: Yohei's store, a crate visibly set aside -- spoiled stock, a real operational loss.
WHY THIS MATTERS NOW: grounds his business-pressure texture ahead of the festival-budget day.
PLAYER INTERVENTION: help sort what's still good, or just keep him company. IF ACTS: creates
`helped_yohei_sort_stock`. IF NOT: no evidence, an ordinary shared moment. WHEN RETURNS: this is
now REQUIRED as the "distinct additional evidence" for the Day-26-equivalent gate, per Fix D --
noticing his son's phone alone is not enough; this (or an equivalent later item) has to exist too.
FREE TALK: open.
OPTIONAL ROAMING AFTER: a brief stop at Hina's is available, ambient only.
VISIBLE CONSEQUENCE: a plain, undramatic "that's business" shrug either way.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: none. PLAYER_CAN_CHANGE:
whether the evidence item exists. PLAYER_CANNOT_CHANGE: how much stock was lost. FREE_TALK_CAN_
AFFECT: can create the evidence.

### Day 10
MAIN SCENE: the Hall, an old bench wobbling in the corner as Fumiko works nearby.
WHY THIS MATTERS NOW: plants the arc that pays off at the festival.
PLAYER INTERVENTION: suggest Jin could fix it, or leave it. IF ACTS: `suggested_jin_for_bench =
true` `[FIXED -- Fix B: persistent canonical state, no temp variable across days]`. IF NOT: the
bench stays wobbly permanently, a real, non-deferred difference. WHEN RETURNS: read directly at Day
21.
FREE TALK: open (this specific item is structural-only, per the ledger).
OPTIONAL ROAMING AFTER: a brief stop at Jin's is available, ambient only.
VISIBLE CONSEQUENCE: Fumiko "considers it," a real, specific reaction.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: the bench. CALLBACK_FROM: none. PLAYER_CAN_CHANGE:
whether the bench is ever fixed at all. PLAYER_CANNOT_CHANGE: the letter thread underneath it
(separate gate). FREE_TALK_CAN_AFFECT: cannot substitute for the structural suggestion.

### Day 11
MAIN SCENE: the café, a new bag of beans already on the counter, Miyoko watching the player's face
a little too closely.
WHY THIS MATTERS NOW: a genuine, low-conflict good-news day (Section 5's required variety).
PLAYER INTERVENTION: react honestly, whichever way. IF ACTS: creates `reacted_to_miyoko_new_beans`
regardless of whether the reaction is enthusiastic or lukewarm -- honesty is rewarded, not
flattery. IF NOT (deflects the question): no evidence. WHEN RETURNS: contributes to the Day 28
outcome rule.
FREE TALK: open, low stakes.
OPTIONAL ROAMING AFTER: a brief stop at Fumiko's is available, ambient only.
VISIBLE CONSEQUENCE: a warm, uncomplicated good day either way.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: none. PLAYER_CAN_CHANGE:
whether the evidence exists. PLAYER_CANNOT_CHANGE: whether the beans land well. FREE_TALK_CAN_
AFFECT: can create the evidence.

### Day 12 `[FIXED -- Fix A, repurposed]`
MAIN SCENE: **no longer Daisuke's decision day** (his decision is now independent world progress,
resolving on its own schedule -- see Day 20). Day 12 is instead an authored, explicit Daisuke
touchpoint: he's a little more talkative than usual, mid-haircut on someone else, and there's a
natural opening to ask again.
WHY THIS MATTERS NOW: this is exactly the kind of explicit later opportunity Fix A requires, rather
than relying on a hub the player might never think to revisit.
PLAYER INTERVENTION: ask again, or let it be. IF ACTS (and Day 8 already happened): creates
`returned_to_daisuke_after_deflection` (now count = 1). IF NOT: no new evidence. WHEN RETURNS: feeds
whether his decision moves to Day 12 (needs `COUNT(daisuke_relationship_evidence) >= 2` total,
across Days 7/8/12 combined) or stays on its Day-20 default.
FREE TALK: open.
OPTIONAL ROAMING AFTER: a brief stop at the Hall is available, ambient only.
VISIBLE CONSEQUENCE: real, incremental warmth or a repeated, comfortable deflection.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: Days 7/8. PLAYER_CAN_CHANGE:
whether enough evidence exists to move his decision earlier. PLAYER_CANNOT_CHANGE: that the decision
happens at all (fixed, independent, by Day 20 at the latest). FREE_TALK_CAN_AFFECT: creates the
evidence.

---

## Movement 3 (Days 13-18)

### Day 13
MAIN SCENE: Yohei's store, a phone glanced at, put away fast.
WHY THIS MATTERS NOW: the central emotional thread of the back half starts here.
PLAYER INTERVENTION: ask gently (deep-talk only), or let it be. IF ACTS: creates `noticed_yohei_
son_thread`. IF NOT: the thread never becomes visible this playthrough -- a real, permanent
difference. WHEN RETURNS: read at the Day-26-equivalent scene, now correctly requiring a SEPARATE
piece of evidence too (Fix D).
FREE TALK: this IS the deep-talk day.
OPTIONAL ROAMING AFTER: a brief stop at Hina's is available, ambient only.
VISIBLE CONSEQUENCE: he goes quiet, deflects, but it visibly landed as real.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: Yohei's son thread. CALLBACK_FROM: none. PLAYER_CAN_
CHANGE: whether this thread ever becomes visible at all. PLAYER_CANNOT_CHANGE: `yohei_son_call_
happened`'s own timing -- **this is now entirely independent world progress, unaffected by today's
choice, per Fix (Section 3 option B)**. FREE_TALK_CAN_AFFECT: directly creates the noticing
evidence, never the underlying event.

### Day 14
MAIN SCENE: Hina's shop, a comment about "juggling a few things" -- a little too casual.
WHY THIS MATTERS NOW: raises stakes ahead of her eventual reveal.
PLAYER INTERVENTION: ask "juggling how?", or let it pass. IF ACTS: creates `noticed_hina_money_
pressure` (note: `hina_money_pressure` itself is already true regardless, per the ledger -- this
choice only creates PLAYER_KNOWLEDGE/evidence, never the underlying fact). IF NOT: the comment goes
unremarked. WHEN RETURNS: feeds the reveal gate.
FREE TALK: open.
OPTIONAL ROAMING AFTER: **a brief stop at Daisuke's is available** -- if Day 8 already happened,
this can create `returned_to_daisuke_after_deflection` (count now potentially 2, satisfying his
threshold if Day 12's roaming also happened).
VISIBLE CONSEQUENCE: a small, real vulnerability, easy to miss.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: none new (deepens Day 1). CALLBACK_FROM: Day 1.
PLAYER_CAN_CHANGE: whether the evidence exists. PLAYER_CANNOT_CHANGE: `hina_money_pressure` itself
(already true, not created by this scene). FREE_TALK_CAN_AFFECT: directly creates the evidence.

### Day 15
MAIN SCENE: the Hall, a letter sitting unopened on Fumiko's desk.
WHY THIS MATTERS NOW: pairs, later, with the Day 10 bench thread.
PLAYER INTERVENTION: ask about it, or don't pry. IF ACTS: creates `asked_about_fumikos_letter`,
`player_knows_fumiko_letter = true`; she also asks for a small favor "next time," creating
`Promise(fumiko, help_soon, due=~day18)`. IF NOT: no evidence, no promise. WHEN RETURNS: feeds
Day 18 (the promise) and the new Day 29-adjacent write-back scene (Fix C).
FREE TALK: open, her private-fact reveal moment.
OPTIONAL ROAMING AFTER: a brief stop at Miyoko's is available, ambient only.
VISIBLE CONSEQUENCE: old regret surfacing gently, plus a concrete, dated promise.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: the letter; a real PROMISE. CALLBACK_FROM: Day 10.
PLAYER_CAN_CHANGE: whether the promise and evidence exist. PLAYER_CANNOT_CHANGE: the letter's actual
contents. FREE_TALK_CAN_AFFECT: creates both the evidence and the promise.

### Day 16
MAIN SCENE: the café, quieter than usual -- "my daughter called again," left unfinished.
WHY THIS MATTERS NOW: builds toward Day 28's authored-rule resolution.
PLAYER INTERVENTION: listen without pushing a side, or just be present (design grounded in
OWNER-08's real pattern -- people act more on decisions they feel they reached themselves). IF
ACTS: creates `listened_to_miyoko_daughter_worry`. IF NOT: no evidence, thread stays smaller. WHEN
RETURNS: one of the two inputs to Day 28's authored decision rule.
FREE TALK: open.
OPTIONAL ROAMING AFTER: a brief stop at Yohei's is available, ambient only.
VISIBLE CONSEQUENCE: real, unresolved worry shared, met with presence.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: Day 11. PLAYER_CAN_CHANGE:
whether the evidence exists. PLAYER_CANNOT_CHANGE: today's non-resolution (fixed). FREE_TALK_CAN_
AFFECT: directly creates the evidence.

### Day 17
MAIN SCENE: Yohei's store, doing inventory, mentions he'd like a hand with the shelves "next time."
WHY THIS MATTERS NOW: sets up Day 18's actual causal premise (a real promise, not loose warmth).
PLAYER INTERVENTION: agree, or demur. IF ACTS: creates `Promise(yohei, help_soon, due=~day18)`.
IF NOT: no promise, and Day 18's convergence simply does not fire this playthrough. WHEN RETURNS:
Day 18.
FREE TALK: open.
OPTIONAL ROAMING AFTER: a brief stop at Miyoko's is available, ambient only, and a brief stop at
Fumiko's checks in on the letter thread's texture (no new gate).
VISIBLE CONSEQUENCE: a plain, specific commitment now on record.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: the Yohei promise. CALLBACK_FROM: none. PLAYER_CAN_
CHANGE: whether the promise exists. PLAYER_CANNOT_CHANGE: nothing else today. FREE_TALK_CAN_AFFECT:
cannot itself create a promise (structural-only).

### Day 18
MAIN SCENE: two promises, both due "soon," land the same afternoon -- ONLY if both
`Promise(fumiko, help_soon)` and `Promise(yohei, help_soon)` actually exist; otherwise this is an
ordinary day (a real structural difference from a version that fires on loose warmth alone).
WHY THIS MATTERS NOW: the game now visibly tracks the player's own stated commitments.
PLAYER INTERVENTION: keep one and explain to the other, or a smaller gesture to both. IF ACTS
(either specific choice): a real, differentiated, NPC-remembered outcome. WHEN RETURNS: whichever
promise's disposition is set is referenced again within the following week (never silently
forgotten).
FREE TALK: useful for the "explain" branch.
OPTIONAL ROAMING AFTER: none additional -- this scene's own resolution is the day's whole content.
VISIBLE CONSEQUENCE: a real, differentiated outcome, not a generic "you handled it."

CAUSALITY_LEVEL: HIGH (when it fires) / QUIET otherwise (satisfying Section 5 via whichever single
promise still exists in isolation). OPEN_THREAD_CREATED: whichever promise is deferred. CALLBACK_
FROM: Days 15/17. PLAYER_CAN_CHANGE: which promise gets kept, and how. PLAYER_CANNOT_CHANGE: that a
choice must be made once both genuinely exist. FREE_TALK_CAN_AFFECT: shapes the explanation, not
which promise exists.

---

## Movement 4 (Days 19-24) — the festival

### Day 19
MAIN SCENE: the Hall, visibly a mess of papers -- Fumiko brisker than usual, stretched thin. Per
OWNER-05's pattern, a checklist can be fully "done" while something human is still missing -- she
catches herself relying on the flyer alone and decides to personally invite people instead.
WHY THIS MATTERS NOW: directly determines how prepared Day 24 actually is.
PLAYER INTERVENTION: offer to help with something concrete, or leave her to it. IF ACTS: creates
`helped_fumiko_festival_prep`, `festival_prep_progress += 1`. IF NOT: she manages anyway, more
tired. WHEN RETURNS: read into Day 24, and one of the two inputs to the new Day-29-adjacent
write-back rule (Fix C).
FREE TALK: open.
OPTIONAL ROAMING AFTER: **a brief stop at Daisuke's is available** (a further return-after-
deflection opportunity, per Fix A).
VISIBLE CONSEQUENCE: a specific, small task actually completed.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: Day 3. PLAYER_CAN_CHANGE:
`festival_prep_progress` and whether the write-back rule's second input exists. PLAYER_CANNOT_
CHANGE: that the festival happens at all. FREE_TALK_CAN_AFFECT: can create the evidence.

### Day 20 `[FIXED -- Daisuke's independent world-progress default now resolves here if not
moved earlier]`
MAIN SCENE: Yohei's store, doing math out loud about festival stock (informed by OWNER-03's pattern
-- cutting a corner under real pressure can quietly undermine the very thing it protects, which is
exactly the tension this scene plays straight, not just states). IF `daisuke_renovation_decided`
has not already resolved to Day 12 (per accumulated evidence `>= 2`): it resolves HERE, today,
independently -- Daisuke, elsewhere in town, finally calls the contractor, whether or not the player
is present to see it.
WHY THIS MATTERS NOW: sets Day 24's stall directly; and, independently, closes a three-month
tension on its own schedule regardless of player involvement (Section 3's explicit requirement).
PLAYER INTERVENTION (Yohei's thread): help him decide generously, carefully, or leave him to it.
IF ACTS (generous): `yohei_festival_stock = full`. IF ACTS (careful): `= modest`. IF NOT: `=
minimal`, decided alone. WHEN RETURNS: Day 24 reads this directly.
FREE TALK: open (Yohei's thread).
OPTIONAL ROAMING AFTER: if Daisuke's decision resolved here rather than earlier, a brief stop at
his shop shows the aftermath -- `player_witnessed_daisuke_decision = true` if visited today
specifically, else the player simply hears about it later, unresolved in the moment.
VISIBLE CONSEQUENCE: a specific stock-level decision, fixed for Day 24; Daisuke's own arc closing,
undramatic in the telling either way.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: Day 9 (Yohei), Days 7/8/12/19
(Daisuke). PLAYER_CAN_CHANGE: `yohei_festival_stock`'s value; whether the player witnesses
Daisuke's decision firsthand today. PLAYER_CANNOT_CHANGE: that Daisuke's decision happens today (if
it hasn't already) -- fixed, independent. FREE_TALK_CAN_AFFECT: can shift Yohei's decision toward
generous if genuinely persuasive.

### Day 21
MAIN SCENE: somewhere in town, something being fixed by someone nobody's watching -- Jin, including
(if `suggested_jin_for_bench`) the Hall's bench specifically. Per OWNER-04's pattern, he checks the
bench's actual current state up close rather than fixing from memory of what "a wobbly bench" usually
needs. This is also the SECOND, late window for Jin's standing-arrangement offer if it never fired
on Day 5.
WHY THIS MATTERS NOW: the last realistic point before the festival for both threads to land.
PLAYER INTERVENTION: notice and specifically thank him, or miss it. IF ACTS: creates `thanked_jin_
for_unseen_work`; if the late-window gate is also met, the arrangement offer surfaces here too. IF
NOT: the work happens anyway, unseen. WHEN RETURNS: `bench_fixed` -> Day 24; `jin_arrangement` (if
resolved here) -> Day 29/30.
FREE TALK: open.
OPTIONAL ROAMING AFTER: none additional -- this is already a rich, multi-thread day.
VISIBLE CONSEQUENCE: a fixed bench people can actually sit on; a specific acknowledgment if given.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: Day 10, Day 5. PLAYER_CAN_
CHANGE: whether Jin is specifically thanked; the late-window arrangement outcome, if it fires.
PLAYER_CANNOT_CHANGE: whether `bench_fixed` happens at all (locked in Day 10). FREE_TALK_CAN_AFFECT:
can create the thanks-evidence.

### Day 22
MAIN SCENE: Hina's shop, later, quieter. IF gate met (`noticed_hina_money_pressure` and `COUNT
(hina_relationship_evidence) >= 2`): she finally says the real reason the last shop closed. ELSE: an
ordinary, pleasant evening.
WHY THIS MATTERS NOW: the last major emotional beat before the festival.
PLAYER INTERVENTION: just listen, patiently. IF gate met and player listens well: `player_knows_
hina_true_reason = true`. **This has NO effect on `hina_shop_readiness` whatsoever** -- the exact
conflation the evaluator flagged, now explicitly severed (see ledger). IF gate not met: nothing to
act on, explicitly legitimate.
FREE TALK: this IS the deep-talk day, gated on real accumulated evidence.
OPTIONAL ROAMING AFTER: none additional.
VISIBLE CONSEQUENCE: real vulnerability shared, met with presence, if reached; her shop's own
readiness keeps advancing (or not) on its own separate schedule regardless.

CAUSALITY_LEVEL: HIGH (when it fires) / MEDIUM otherwise. OPEN_THREAD_CREATED: none new. CALLBACK_
FROM: Days 1, 4, 14. PLAYER_CAN_CHANGE: whether `player_knows_hina_true_reason` becomes true.
PLAYER_CANNOT_CHANGE: `hina_shop_readiness`'s own tier (advances independently) and the true reason
itself (a fixed past event). FREE_TALK_CAN_AFFECT: the only path to this specific knowledge, never
to shop readiness.

### Day 23
MAIN SCENE: shouting, running, a truck somewhere it shouldn't be -- the day before the festival.
WHY THIS MATTERS NOW: a designed tension-release valve, honestly labeled QUIET, not smuggled in as
if it mattered (Section 4's rule applied and this day deliberately kept cosmetic, disclosed).
PLAYER INTERVENTION: investigate, or shrug it off. IF ACTS/IF NOT: same harmless resolution either
way. WHEN RETURNS: nothing -- explicitly non-causal by design.
FREE TALK: open, low stakes.
OPTIONAL ROAMING AFTER: **a brief stop at Daisuke's is available** (one more return-after-deflection
opportunity before the final Day-27 window, per Fix A).
VISIBLE CONSEQUENCE: a laugh, a held breath let out.

CAUSALITY_LEVEL: QUIET (honestly labeled). OPEN_THREAD_CREATED: none. CALLBACK_FROM: none. PLAYER_
CAN_CHANGE: nothing durable from the main scene (the roaming stop can still create Daisuke evidence).
PLAYER_CANNOT_CHANGE: the false-alarm's own outcome. FREE_TALK_CAN_AFFECT: nothing durable from the
main scene.

### Day 24 — MERGE POINT (festival) -- retains a real, bounded location/time budget
MAIN SCENE: the whole street dressed for the festival, all six NPCs live simultaneously for the
first time. **This is the one day a real choice-of-where-to-be budget is retained**, per Section 1's
explicit exception -- simultaneity is what makes scarcity meaningful here specifically, unlike every
other day's single authored main scene.
WHY THIS MATTERS NOW: the spine's causal architecture is only provable here, all at once.
PLAYER INTERVENTION: 2 slots, spent among the simultaneously-live locations. IF ACTS (location A):
sees that thread's specific, evidence-built version of today; does not see location B's simultaneous
version. WHEN RETURNS: Days 25 and 30 both reference whichever version actually happened.
FREE TALK: open at whichever location(s) chosen.
OPTIONAL ROAMING: N/A -- the budget IS the day's structure here.
VISIBLE CONSEQUENCE: `yohei_festival_stock`, `bench_fixed`, `player_knows_hina_true_reason` (and
`hina_shop_readiness`, independently) all render as different, specific text -- assembled entirely
from prior state, never invented fresh (Section 7's forbidden-list ban on unauthorized festival
outcomes applies directly here).

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: none new (the merge point itself). CALLBACK_FROM: Days
3, 9, 10, 13, 14, 15, 17, 19, 20, 21, 22. PLAYER_CAN_CHANGE: which thread is personally witnessed
today. PLAYER_CANNOT_CHANGE: what state each thread is actually in (locked in by prior days).
FREE_TALK_CAN_AFFECT: description only, never outcome invention.

---

## Movement 5 (Days 25-30)

### Day 25
MAIN SCENE: the morning after, town a little sleepy -- the specific comedown from whichever version
of Day 24 actually happened.
WHY THIS MATTERS NOW: emotional recovery after a major scene (Section 5's explicit allowance).
PLAYER INTERVENTION: check in on someone specific, or rest. IF ACTS: a warm exchange referencing
yesterday specifically. IF NOT: a quieter day. WHEN RETURNS: tone only.
FREE TALK: open, warm, reflective.
OPTIONAL ROAMING AFTER: none additional.
VISIBLE CONSEQUENCE: soft, satisfied quiet.

CAUSALITY_LEVEL: QUIET. OPEN_THREAD_CREATED: none. CALLBACK_FROM: Day 24. PLAYER_CAN_CHANGE: tone
only. PLAYER_CANNOT_CHANGE: yesterday's outcome. FREE_TALK_CAN_AFFECT: tone only.

### Day 26 `[FIXED -- Fix D, and Section 3B's independent-event rule]`
MAIN SCENE: Yohei's store, unusually quiet -- the exact gesture from Day 13, recurring with
different meaning. `yohei_son_call_happened` is TRUE by now regardless of anything the player did
(it resolved automatically around Day 20, independent world progress).
WHY THIS MATTERS NOW: whether the player actually LEARNS about it is what's still undecided.
PLAYER INTERVENTION: notice and ask gently, or be present without asking. IF gate met
(`noticed_yohei_son_thread` AND `COUNT(yohei_relationship_evidence MINUS {noticed_yohei_son_
thread}) >= 1` -- the corrected, distinct-evidence gate): hears that they talked. IF gate not met:
the fact stays true in world-state but isn't shared with the player this scene (a real KNOWLEDGE-vs-
FACT gap, not an error). WHEN RETURNS: colors Day 30 either way.
FREE TALK: open, the payoff scene if the gate is met.
OPTIONAL ROAMING AFTER: none additional.
VISIBLE CONSEQUENCE: quiet, real, deliberately unresolved beyond "they talked," if learned at all.

CAUSALITY_LEVEL: HIGH (when learned) / MEDIUM otherwise. OPEN_THREAD_CREATED: none new. CALLBACK_
FROM: Day 13. PLAYER_CAN_CHANGE: whether the player LEARNS about it this scene. PLAYER_CANNOT_
CHANGE: whether the call itself happened -- **fixed, independent, resolved on Day 20 regardless**.
FREE_TALK_CAN_AFFECT: whether the player learns the news, never the underlying event.

### Day 27
MAIN SCENE: Daisuke's chair, a slower afternoon. IF gate met (`returned_to_daisuke_after_deflection
>= 2`, now genuinely achievable via the explicit roaming touchpoints on Days 6/12/14/19/23, not just
hoping the player happens to revisit): the card, finally. ELSE: an ordinary, comfortable afternoon.
WHY THIS MATTERS NOW: the corrected version of V1's original failure -- persistence after being
turned away, not raw talk volume, and now with genuine, authored opportunities to build that
persistence across the month (Fix A resolved).
PLAYER INTERVENTION: listen, patiently. IF gate met: hears about the unanswered New Year's card.
WHEN RETURNS: colors Day 30.
FREE TALK: the deep-talk day for this thread.
OPTIONAL ROAMING AFTER: none additional.
VISIBLE CONSEQUENCE: a quiet parallel to Yohei's own arc, never stated as parallel in-fiction.

CAUSALITY_LEVEL: HIGH (when it fires) / MEDIUM otherwise. OPEN_THREAD_CREATED: none new. CALLBACK_
FROM: Days 8, 12, 19, 23 (whichever roaming touchpoints actually happened). PLAYER_CAN_CHANGE:
whether the gate was ever met, across the whole month. PLAYER_CANNOT_CHANGE: the friend's specific
backstory (fixed, vague). FREE_TALK_CAN_AFFECT: the only path to this reveal, gate is evidence-based.

### Day 28
MAIN SCENE: the café, Miyoko mentioning she spoke to her daughter again. The authored rule (see
ledger, informed by OWNER-07) resolves `miyoko_daughter_outcome` deterministically from real
accumulated evidence -- never hardcoded to one outcome, never a live model decision.
WHY THIS MATTERS NOW: closes (or legitimately leaves open) the slowest-moving arc of the six, with
three genuinely different possible outcomes now reachable (`stay`/`compromise`/`undecided`), fixing
V2's actual bug of only ever producing "compromise."
PLAYER INTERVENTION: listen, no correct side. IF gate conditions met (see ledger's exact rule):
hears the specific, rule-determined outcome. WHEN RETURNS: Day 30.
FREE TALK: open.
OPTIONAL ROAMING AFTER: none additional.
VISIBLE CONSEQUENCE: real, adult, not-necessarily-triumphant closure -- one of three genuinely
different texts depending on which evidence combination actually exists.

CAUSALITY_LEVEL: HIGH (when resolved) / MEDIUM otherwise. OPEN_THREAD_CREATED: none new. CALLBACK_
FROM: Days 11, 16. PLAYER_CAN_CHANGE: which of the three outcomes is reached (by which evidence
combination exists). PLAYER_CANNOT_CHANGE: today's outcome once the evidence is fixed (the rule is
deterministic, not swayed live). FREE_TALK_CAN_AFFECT: whether the player hears it today.

### Day 29 `[FIXED -- Fix C, fumiko_writes_back now has a real setter]`
MAIN SCENE: two things, both explicitly disclosed exceptions to the usual causality rule (Section
4's own carve-out, stated plainly, not hidden): (1) an entirely private, unwitnessed opportunity for
a kindness with no guaranteed payoff (unchanged concept from V2, now most naturally offered to Jin
if his arrangement was declined or never reached, or to whichever NPC has been least thanked this
playthrough); (2) **the new, authored resolution of `fumiko_writes_back`**, per the deterministic
rule in the ledger (`player_knows_fumiko_letter` AND `helped_fumiko_festival_prep` -> `true`;
`player_knows_fumiko_letter` alone -> `undecided`; neither -> stays `unset`).
WHY THIS MATTERS NOW: tests whether the player's values hold up with no audience; closes a
previously-dead variable with a real, evidence-grounded outcome.
PLAYER INTERVENTION: do the kind thing anyway, or don't (no visible state change either way, by
design). The Fumiko write-back resolution requires no live player choice today -- it is read from
Days 15/19's accumulated evidence.
FREE TALK: optional, low stakes.
OPTIONAL ROAMING AFTER: none additional.
VISIBLE CONSEQUENCE: private, understated for the kindness; a real, specific outcome for Fumiko's
letter thread, no longer an orphaned variable.

CAUSALITY_LEVEL: QUIET (kindness, by explicit design) with one MEDIUM-weight resolved read (the
letter). OPEN_THREAD_CREATED: none. CALLBACK_FROM: Days 15, 19 (letter); none (kindness). PLAYER_
CAN_CHANGE: nothing observable for the kindness; nothing live today for the letter (already
determined by prior days). PLAYER_CANNOT_CHANGE: symmetric, by design, for the kindness.
FREE_TALK_CAN_AFFECT: nothing durable.

### Day 30 — retrospective, not "the end"
MAIN SCENE: the room upstairs, considerably less temporary-looking than Day 1. Nothing new happens --
explicitly not a crisis day.
WHY THIS MATTERS NOW: the only day whose entire content is a read-back of everything else.
PLAYER INTERVENTION: an optional, skippable reflection (reusing `PHASE_12_8`'s existing register).
IF ACTS: stored verbatim, never scored. IF NOT: equally valid.
FREE TALK: the reflection itself, freeform.
OPTIONAL ROAMING AFTER: none -- nothing left to roam to that changes anything.
VISIBLE CONSEQUENCE: a genuinely different summary per playthrough, assembled from
`hina_shop_readiness`, `player_knows_hina_true_reason`, `player_knows_yohei_son_call`,
`daisuke_renovation_decided` + `player_witnessed_daisuke_decision`, `daisuke_card_known`,
`jin_arrangement`, `miyoko_daughter_outcome`, `bench_fixed`, `fumiko_writes_back` -- read, never
re-decided, with WORLD_PROGRESS and PLAYER_KNOWLEDGE now correctly reported as separate facts (e.g.
"the shop opened" is reported independently of "and you knew why she'd been scared it wouldn't").

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: none. CALLBACK_FROM: every gated thread. PLAYER_CAN_
CHANGE: whether a reflection is written. PLAYER_CANNOT_CHANGE: the substance of what actually
happened. FREE_TALK_CAN_AFFECT: only the optional reflection text.

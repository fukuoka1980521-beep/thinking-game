# NEW LIFE 30-Day Gamebook — Story Spine V2 (PHASE_24, Section 10)

Full rewrite of `NEWLIFE_30DAY_GAMEBOOK_STORY_SPINE_V1.md`. Preserves only what survives the new
rules in `NEWLIFE_30DAY_GAMEBOOK_CAUSAL_RULES_V2.md`: the festival-as-merge-point structure, the
six character arcs, and most episode content -- but every day is rebuilt around the 10-step
structure, and several V1 mechanics are explicitly replaced (V1's free-talk-only relationship
counters -> `RELATIONSHIP_EVIDENCE`; V1's loose Day-18 relationship-warmth trigger -> an actual
`PROMISE`; V1's single-window Jin offer -> an early + late window). Evidence item names reference
`NEWLIFE_30DAY_GAMEBOOK_STATE_MODEL_LEDGER_V2.md` directly.

Per-day fields: the 10 steps (numbered, condensed where a step is trivial for that day) followed by
the 6 required tags: `CAUSALITY_LEVEL` (HIGH/MEDIUM/QUIET) / `OPEN_THREAD_CREATED` /
`CALLBACK_FROM` / `PLAYER_CAN_CHANGE` / `PLAYER_CANNOT_CHANGE` / `FREE_TALK_CAN_AFFECT`.

---

## Movement 1 (Days 1-6)

### Day 1
1. OPENING SCENE: boxes half-unpacked, first morning -- the one day this design allows the literal
   "no situation yet" opening, since there genuinely isn't one before Day 1.
2. SOMETHING HAPPENS: stepping outside, the shopping street is already alive -- someone is visibly
   mid-task at two different places (Hina setting up, Yohei restocking).
3. WHY THIS MATTERS NOW: this is the player's only chance to form a genuine first impression before
   any reputation/rumor exists.
4. PLAYER INTERVENTION: help Hina carry a box, or simply buy something from Yohei (or both, budget
   allowing). IF ACTS (helps Hina): creates `helped_hina_move_box`. IF DOES NOT: no evidence created,
   a plainer first meeting. WHEN RETURNS: read starting Day 5+ whenever Hina's evidence total is
   checked.
5. OPTIONAL FREE TALK: open at either location, low stakes.
6. STATE DELTA PROPOSAL: any free-talk here proposes only ambient goodwill, no named evidence yet
   (too early for anything specific).
7. CANON GATE: ambient proposals ACCEPTED as flavor only, no evidence created from free talk alone
   this early.
8. VISIBLE CONSEQUENCE: Hina's later dialogue differs slightly if helped (a small, specific detail
   about "that box") vs. not.
9. DELAY/CALLBACK: `helped_hina_move_box` feeds every later Hina evidence check.
10. DAY END: quiet, ordinary -- day one of a life, not an event.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: Hina's shop-progress thread. CALLBACK_FROM: none (Day
1). PLAYER_CAN_CHANGE: whether `helped_hina_move_box` exists. PLAYER_CANNOT_CHANGE: whether Hina's
shop is open yet (fixed, not-yet, regardless). FREE_TALK_CAN_AFFECT: tone only, no evidence yet.

### Day 2
1. OPENING SCENE: not "where do you want to go" -- instead, a specific, concrete detail is
   different at whichever location the player did NOT visit Day 1 (per Section 3, this IS the
   narrative reason a hub-style opening is justified: something changed, and the player is drawn to
   check it, not asked to pick blindly).
2. SOMETHING HAPPENS: an overnight, small, real change (e.g. a delivery arrived at Yohei's if
   skipped; Hina's shelf visibly rearranged if skipped).
3. WHY THIS MATTERS NOW: proves, on Day 2, that the town exists without the player watching it --
   the design's foundational promise, made concrete immediately.
4. PLAYER INTERVENTION: notice and comment on the change, or not. IF ACTS: a small, specific
   acknowledgment exchange. IF NOT: the change is still true, just unremarked. WHEN RETURNS: colors
   whether this location's dialogue register (later) treats the player as observant.
5. OPTIONAL FREE TALK: open.
6-7. STATE DELTA PROPOSAL / CANON GATE: ambient only, no named evidence yet.
8. VISIBLE CONSEQUENCE: the overnight change itself is the consequence -- checkable, not just told.
9. DELAY/CALLBACK: none created yet.
10. DAY END: mild, pleasant curiosity about how much else happens unseen.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: "the town moves without me" awareness (not a
mechanical flag, a felt one). CALLBACK_FROM: Day 1's skipped location. PLAYER_CAN_CHANGE: nothing
mechanical yet. PLAYER_CANNOT_CHANGE: the overnight change itself (fixed, system-authored).
FREE_TALK_CAN_AFFECT: tone only.

### Day 3
1. OPENING SCENE: at the Community Hall, a new flyer is already pinned -- Fumiko is nearby, visibly
   busier than a normal tidying pass would explain.
2. SOMETHING HAPPENS: the flyer itself -- an unexplained, concrete object, not an abstract
   announcement.
3. WHY THIS MATTERS NOW: seeds the entire back-half festival arc from something small and curious,
   not an exposition dump.
4. PLAYER INTERVENTION: ask Fumiko about it, or not. IF ACTS: `festival_flyer_seen = true`,
   plus a first, small Fumiko evidence-adjacent moment (ambient, not yet a named evidence item).
   IF NOT: the flyer stays unexplained a while longer, no penalty. WHEN RETURNS: Day 19 (festival
   prep) and Day 24 (the festival itself) both read `festival_flyer_seen` for whether the player's
   own curiosity about it gets a payoff callback line.
5. OPTIONAL FREE TALK: open, natural given the curiosity hook.
6-7. proposal/gate: ambient only.
8. VISIBLE CONSEQUENCE: Fumiko's brisk deflection ("you'll see, in time") is itself a real, specific
   response, not a placeholder.
9. DELAY/CALLBACK: plants `festival_flyer_seen`, paid off Day 19/24.
10. DAY END: open curiosity, not urgency.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: the festival. CALLBACK_FROM: none new. PLAYER_CAN_
CHANGE: whether `festival_flyer_seen` is set. PLAYER_CANNOT_CHANGE: what the festival actually is
(revealed later, system-paced). FREE_TALK_CAN_AFFECT: none beyond tone yet.

### Day 4
1. OPENING SCENE: Hina, visibly a little tense, mentions -- almost to herself -- that she's not
   sure Yohei likes her.
2. SOMETHING HAPPENS: a real, specific worry stated aloud, not implied.
3. WHY THIS MATTERS NOW: the player has enough context by now (having met both) to actually do
   something useful with this, unlike Day 1.
4. PLAYER INTERVENTION: tell her it's not personal (Yohei treats every newcomer this way), or say
   nothing. IF ACTS: creates `defended_hina_to_yohei` (counts toward BOTH Hina's and Yohei's
   evidence tables per the ledger's explicit cross-character allowance). IF NOT: the worry persists,
   unresolved but not punished. WHEN RETURNS: read by both Hina's Day-22-tier reveal gate and
   Yohei's Day-26-tier reveal gate.
5. FREE TALK: open, useful for the "tell her" branch specifically.
6. STATE DELTA PROPOSAL: free talk here may propose `defended_hina_to_yohei` directly if the
   player's own words clearly do this -- the structural option is a shortcut to the same evidence,
   not the only path to it.
7. CANON GATE: ACCEPTED if the free-talk content genuinely reassures her about Yohei specifically
   (not just generic comfort, which would be MODIFIED down to ambient-only).
8. VISIBLE CONSEQUENCE: a small, real thaw is now possible in Yohei's own independent behavior
   toward Hina (an NPC-NPC delta), whether or not the player is present to see it happen later.
9. DELAY/CALLBACK: `defended_hina_to_yohei` -> read at Days 22/26.
10. DAY END: a small, specific proof the world responds, not just narrates.

CAUSALITY_LEVEL: HIGH (first cross-character evidence item, dual-gate relevance). OPEN_THREAD_
CREATED: Yohei-Hina thaw. CALLBACK_FROM: Day 1 (both first meetings) implicitly. PLAYER_CAN_CHANGE:
whether `defended_hina_to_yohei` exists. PLAYER_CANNOT_CHANGE: Yohei's baseline wariness pattern
itself (a fixed trait, only its expression toward Hina specifically can shift). FREE_TALK_CAN_
AFFECT: can directly create the evidence item if genuinely on-topic.

### Day 5
1. OPENING SCENE: Jin, mid-task somewhere in town, not framed as a destination menu -- the player
   encounters him because of wherever the last few days led, or deliberately sought him out.
2. SOMETHING HAPPENS: if `thanked_jin_for_unseen_work` or `noticed_jin_fixed_something` evidence
   totals `>= 2` already (early-adopter path), Jin -- almost too casually -- mentions he wouldn't
   mind something steadier. Otherwise: an ordinary day, nothing offered yet.
3. WHY THIS MATTERS NOW: this is the FIRST of two windows (Section 6/8's fix for V1's one-shot gate)
   -- missing it here is explicitly not permanent.
4. PLAYER INTERVENTION: {if offered} accept or decline the standing arrangement. IF ACTS (accept):
   `jin_arrangement = accepted`, opens the ongoing companionship thread. IF ACTS (decline):
   `jin_arrangement = declined`, no hard feelings, closes this specific offer but not the
   relationship. IF NOT (offer never surfaced): nothing to act on yet -- an ordinary day, and the
   late window (~Day 21) remains open. WHEN RETURNS: `jin_arrangement`'s value colors Day 21's
   scene and Day 29's private-kindness framing.
5. FREE TALK: open.
6-7. proposal/gate: an accept/decline is always a structural choice, never inferred from free-talk
   tone alone (Section 7's explicit rule against AI silently deciding this).
8. VISIBLE CONSEQUENCE: a real "yeah, alright" or an easy shrug, immediately, if offered at all.
9. DELAY/CALLBACK: `jin_arrangement` read Days 21/29.
10. DAY END: quiet resolve if accepted; unremarkable if not yet offered.

CAUSALITY_LEVEL: {HIGH if offer fires} / QUIET (satisfies Section 5's "callback to an earlier
choice" bullet via evidence-check framing, even when the offer doesn't fire) otherwise. OPEN_
THREAD_CREATED: Jin's standing-arrangement thread (if not already resolved). CALLBACK_FROM: Day
1-4's Jin-directed evidence, if any. PLAYER_CAN_CHANGE: `jin_arrangement`'s value, if the offer
fires. PLAYER_CANNOT_CHANGE: whether the offer fires AT ALL today (evidence-gated, not
free-talk-persuadable). FREE_TALK_CAN_AFFECT: cannot manufacture the offer early; can process an
acceptance/decline emotionally afterward.

### Day 6
1. OPENING SCENE: two old friends already mid-conversation somewhere in town (Yohei+Daisuke, or
   Jin+Yohei) -- the player arrives into something already happening, not a menu.
2. SOMETHING HAPPENS: a lived-in, small NPC-NPC moment (an old joke, a comfortable silence).
3. WHY THIS MATTERS NOW: this is the day the design proves the town is one social fabric, not six
   separate rooms, per Section 8's "town cannot orbit the player."
4. PLAYER INTERVENTION: witness quietly, or step away. IF ACTS (watches): `witnessed_daisuke_
   fumiko_confiding`-tier ambient evidence if that pairing is chosen (or the Yohei/Jin equivalent,
   ambient only, no gated reveal attached). IF NOT: the scene happens anyway, off-screen, exactly
   the same. WHEN RETURNS: colors flavor text only -- this is Section 5's "no three consecutive
   QUIET days" pressure-relief day, deliberately low-stakes.
5. FREE TALK: open, low stakes.
6-9: ambient only, no hard gate.
10. DAY END: warm, textural.

CAUSALITY_LEVEL: QUIET. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: none. PLAYER_CAN_CHANGE:
whether the player personally witnessed it (flavor only). PLAYER_CANNOT_CHANGE: the NPC-NPC
relationship itself, which moves regardless. FREE_TALK_CAN_AFFECT: tone only.

---

## Movement 2 (Days 7-12)

### Day 7
1. OPENING SCENE: Daisuke's chair, already mid-complaint from an impossible customer.
2. SOMETHING HAPPENS: pure comedy -- an absurd, specific request.
3. WHY THIS MATTERS NOW: pacing -- Section 5 requires quiet/funny days, and two QUIET-tier days in a
   row (Day 6 + a potential Day 7 QUIET) would violate the "no 3 consecutive low-causality" rule if
   Day 8 were also low -- so Day 7 is deliberately tagged MEDIUM (comedy still creates real, if
   light, evidence) to keep the window compliant.
4. PLAYER INTERVENTION: witness, or comment specifically on how Daisuke handles it. IF ACTS
   (comments warmly): creates `witnessed_daisuke_comedy_day` (weak evidence, but real). IF NOT: no
   evidence, purely a laugh. WHEN RETURNS: contributes to Daisuke's evidence total, relevant to the
   Day 12 renovation-decision gate.
5. FREE TALK: open, low stakes.
6-7: ACCEPTED as weak/ambient evidence only.
8. VISIBLE CONSEQUENCE: strained professionalism survives, comic relief lands.
9. DELAY/CALLBACK: `witnessed_daisuke_comedy_day` -> Day 12.
10. DAY END: a laugh.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: none. PLAYER_CAN_CHANGE:
whether `witnessed_daisuke_comedy_day` exists. PLAYER_CANNOT_CHANGE: the scene's own outcome (fixed
comedy beat). FREE_TALK_CAN_AFFECT: can create the weak evidence item if genuinely engaged.

### Day 8
1. OPENING SCENE: Daisuke's chair again, this time quieter, an opening for something more personal.
2. SOMETHING HAPPENS: the player asks him something real; he deflects, smoothly, mid-scissor-work.
3. WHY THIS MATTERS NOW: this is the FIRST deflection -- necessary before "returning after
   deflection" can ever mean anything.
4. PLAYER INTERVENTION: ask anyway (knowing it may not land), or let a comfortable silence stand.
   IF ACTS: creates `attempted_daisuke_personal`. IF NOT: no evidence, an easy, ordinary visit.
   WHEN RETURNS: any LATER visit after this one, if the player also asks again, creates the far more
   valuable `returned_to_daisuke_after_deflection` -- read from here through Day 27.
5. FREE TALK: this IS the deep-talk moment.
6. STATE DELTA PROPOSAL: the free-talk content proposes `attempted_daisuke_personal`.
7. CANON GATE: ACCEPTED (small, correctly-sized).
8. VISIBLE CONSEQUENCE: a smooth, in-character deflection -- not a dead end, a real character beat.
9. DELAY/CALLBACK: sets up `returned_to_daisuke_after_deflection`'s FIRST possible trigger on any
   later day.
10. DAY END: mild, pleasant, unresolved curiosity.

CAUSALITY_LEVEL: HIGH (gate-relevant, first of a required repeat pattern). OPEN_THREAD_CREATED:
Daisuke's card thread (unnamed to the player yet). CALLBACK_FROM: none. PLAYER_CAN_CHANGE: whether
`attempted_daisuke_personal` exists, setting up future evidence. PLAYER_CANNOT_CHANGE: today's
deflection itself -- it always deflects the first time, regardless of phrasing. FREE_TALK_CAN_
AFFECT: creates the evidence item directly.

### Day 9
1. OPENING SCENE: Yohei's store, a crate visibly set aside.
2. SOMETHING HAPPENS: spoiled stock -- a real, present operational loss.
3. WHY THIS MATTERS NOW: grounds Yohei's business-pressure texture ahead of the festival-budget day.
4. PLAYER INTERVENTION: help sort what's still good, or just keep him company. IF ACTS: creates
   `helped_yohei_sort_stock`. IF NOT: no evidence, an ordinary shared moment. WHEN RETURNS: adds to
   Yohei's evidence total, relevant to the Day 26 son-thread gate (which requires evidence beyond
   just the noticing itself).
5. FREE TALK: open.
6-7: ACCEPTED, small.
8. VISIBLE CONSEQUENCE: a plain, undramatic "that's business" shrug either way, with or without
   help.
9. DELAY/CALLBACK: `helped_yohei_sort_stock` -> Day 26 gate contribution.
10. DAY END: ordinary, slightly weary.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: none. PLAYER_CAN_CHANGE:
whether the evidence item exists. PLAYER_CANNOT_CHANGE: how much stock was actually lost (fixed).
FREE_TALK_CAN_AFFECT: can create the evidence item.

### Day 10
1. OPENING SCENE: the Hall, an old bench wobbling in the corner as Fumiko works nearby.
2. SOMETHING HAPPENS: she won't just replace it, and won't say why.
3. WHY THIS MATTERS NOW: plants the arc that pays off at the festival.
4. PLAYER INTERVENTION: suggest Jin could fix it, or leave it. IF ACTS: `suggested_jin_for_bench =
   true`. IF NOT: the bench stays wobbly indefinitely -- a real, permanent difference, not a
   deferred one. WHEN RETURNS: read directly at Day 21 (`bench_fixed = suggested_jin_for_bench`).
5. FREE TALK: open, but this specific evidence is created structurally, not by talk content.
6-7: n/a for this specific item (structural-only per the ledger).
8. VISIBLE CONSEQUENCE: Fumiko "considers it," a real, specific reaction, not silence.
9. DELAY/CALLBACK: -> Day 21, and Day 24's composite festival scene.
10. DAY END: quiet, mildly mysterious attachment to an object.

CAUSALITY_LEVEL: HIGH (a clean, single-decision, long-delay causal chain -- the clearest example of
Section 4's rule in the whole spine). OPEN_THREAD_CREATED: the bench. CALLBACK_FROM: none.
PLAYER_CAN_CHANGE: whether the bench ever gets fixed at all. PLAYER_CANNOT_CHANGE: the letter thread
underneath it (independent, gated separately). FREE_TALK_CAN_AFFECT: cannot substitute for the
structural suggestion.

### Day 11
1. OPENING SCENE: the café, a new bag of beans already on the counter, Miyoko watching the player's
   face a little too closely.
2. SOMETHING HAPPENS: the actual serving of the new beans -- the payoff of an ambient, pre-existing
   canon hook.
3. WHY THIS MATTERS NOW: a genuine, low-conflict good-news day -- required variety per Section 5.
4. PLAYER INTERVENTION: react honestly. IF ACTS (positive, specific reaction): creates
   `reacted_to_miyoko_new_beans`. IF ACTS (lukewarm/honest-but-unenthused): still creates the same
   evidence item -- honesty is what's rewarded, not flattery. IF NOT (deflects the question): no
   evidence. WHEN RETURNS: contributes to the Day 28 daughter-outcome gate.
5. FREE TALK: open, low stakes.
6-7: ACCEPTED.
8. VISIBLE CONSEQUENCE: a warm, uncomplicated good day either way.
9. DELAY/CALLBACK: -> Day 28.
10. DAY END: genuinely pleasant.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: none (payoff of pre-existing
ambient canon, not this spine's own earlier day). PLAYER_CAN_CHANGE: whether the evidence exists.
PLAYER_CANNOT_CHANGE: whether the beans themselves land well (fixed, a good day regardless).
FREE_TALK_CAN_AFFECT: can create the evidence via an honest reaction.

### Day 12
1. OPENING SCENE: Daisuke's shop, mentioned almost offhand -- something about a phone call earlier.
2. SOMETHING HAPPENS: the renovation decision, one way or the other.
3. WHY THIS MATTERS NOW: resolves a three-month-old tension -- deliberately mid-game, not saved for
   Day 30, proving not everything needs the whole month.
4. PLAYER INTERVENTION: none required this specific day -- the decision is read from accumulated
   evidence, not decided live. IF evidence gate met (`attempted_daisuke_personal` OR `returned_to_
   daisuke_after_deflection` exists): `daisuke_renovation_decided = yes`. IF NOT met: stays
   `unset`, an explicitly legitimate ordinary day for him. WHEN RETURNS: colors his general mood
   texture for the rest of the month, referenced lightly through Day 30.
5. FREE TALK: open either way, to process the outcome (or lack of one).
6-7: the outcome itself is never proposed by free talk -- it is read from evidence BEFORE this
   scene's dialogue generates (Section 6's explicit anti-manipulation rule).
8. VISIBLE CONSEQUENCE: an undramatic, real release of tension, exactly as the real-derived source
   pattern (see `NEWLIFE_EPISODE_PROVENANCE_V2.md`, E17/E23) reports it.
9. DELAY/CALLBACK: colors Day 30's retrospective.
10. DAY END: relief, undramatic in the telling by design.

CAUSALITY_LEVEL: HIGH (closes a major arc). OPEN_THREAD_CREATED: none new. CALLBACK_FROM: Day 7/8.
PLAYER_CAN_CHANGE: nothing today directly -- the change already happened via Days 7/8's choices.
PLAYER_CANNOT_CHANGE: today's actual yes/no result (locked in by prior evidence before this scene
renders). FREE_TALK_CAN_AFFECT: emotional processing only, never the outcome itself.

---

## Movement 3 (Days 13-18)

### Day 13
1. OPENING SCENE: Yohei's store, a phone glanced at, put away fast.
2. SOMETHING HAPPENS: a real, visible discomfort around something unopened.
3. WHY THIS MATTERS NOW: the central emotional thread of the back half starts here, not sprung late.
4. PLAYER INTERVENTION: ask gently (deep-talk only), or let it be. IF ACTS: creates
   `noticed_yohei_son_thread`. IF NOT: nothing said today; the thread simply never becomes visible
   this playthrough, a real and permanent difference, not merely delayed. WHEN RETURNS: Day 26's
   entire scene is gated on this flag.
5. FREE TALK: this IS the deep-talk day for this thread.
6. STATE DELTA PROPOSAL: proposes `noticed_yohei_son_thread`; AI may NOT invent the son's name,
   message content, or backstory beyond the existing canon (an unresolved estrangement, no further
   specifics) -- Section 7's forbidden-list line against inventing new named facts applies directly.
7. CANON GATE: ACCEPTED if on-topic and appropriately vague; REJECTED if the free-talk reply
   invents specific backstory not already canon.
8. VISIBLE CONSEQUENCE: he goes quiet, deflects, but it visibly landed as real -- not a non-event.
9. DELAY/CALLBACK: -> Day 26, a genuinely long delay (13 days), the spine's longest single callback
   gap, deliberately.
10. DAY END: a real, held-back sadness under an ordinary shopkeeper's day.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: Yohei's son thread. CALLBACK_FROM: none. PLAYER_CAN_
CHANGE: whether this thread ever becomes visible at all this playthrough. PLAYER_CANNOT_CHANGE: the
estrangement's actual backstory (fixed, vague by design). FREE_TALK_CAN_AFFECT: directly creates the
gating evidence.

### Day 14
1. OPENING SCENE: Hina's shop, a comment about "juggling a few things" -- a little too casual.
2. SOMETHING HAPPENS: a small, real crack in her usual confident front.
3. WHY THIS MATTERS NOW: raises the stakes ahead of her eventual reveal, without forcing it yet.
4. PLAYER INTERVENTION: ask "juggling how?", or let it pass. IF ACTS: creates `noticed_hina_money_
   pressure`. IF NOT: the comment goes unremarked, no penalty, thread simply stays smaller. WHEN
   RETURNS: feeds the Day-22-tier reveal gate directly.
5. FREE TALK: open, the natural venue for this.
6-7: ACCEPTED, appropriately vague (exact numbers are never invented by AI, per the state-model
   discipline).
8. VISIBLE CONSEQUENCE: a small, real vulnerability shown, easy to miss if not paying attention.
9. DELAY/CALLBACK: -> Day 22.
10. DAY END: a small crack, not a confession.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: none new (deepens Day 1's thread). CALLBACK_FROM: Day 1.
PLAYER_CAN_CHANGE: whether the evidence exists. PLAYER_CANNOT_CHANGE: the underlying financial
reality itself (fixed, whether noticed or not). FREE_TALK_CAN_AFFECT: directly creates the evidence.

### Day 15
1. OPENING SCENE: the Hall, a letter sitting unopened on Fumiko's desk when the player arrives.
2. SOMETHING HAPPENS: a real, specific object with an unexplained weight to it.
3. WHY THIS MATTERS NOW: pairs, later, with the Day 10 bench thread for a stronger combined payoff.
4. PLAYER INTERVENTION: ask about it (deep-talk), or don't pry. IF ACTS: creates `asked_about_
   fumikos_letter`; she also, in this scene, asks the player for a small favor "next time you're
   around" -- creating `Promise(fumiko, help_soon, due=~day18)`. IF NOT: she seems distracted, no
   evidence, no promise created this way. WHEN RETURNS: the letter evidence feeds Day 30's
   retrospective and a possible Day 28-tier write-back; the promise is read specifically at Day 18.
5. FREE TALK: open, this is her private-fact reveal moment if pursued.
6-7: ACCEPTED, contents beyond "a former student, mentions the bench" never invented further.
8. VISIBLE CONSEQUENCE: old regret surfacing gently, plus a concrete, dated promise now on record.
9. DELAY/CALLBACK: `asked_about_fumikos_letter` -> Day 30; `Promise(fumiko, help_soon)` -> Day 18.
10. DAY END: old regret, gently surfacing, not dramatically.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: the letter; a real PROMISE (fixing V1's Day-18
looseness). CALLBACK_FROM: Day 10 (paired later). PLAYER_CAN_CHANGE: whether the promise and
evidence exist. PLAYER_CANNOT_CHANGE: the letter's actual contents. FREE_TALK_CAN_AFFECT: directly
creates both the evidence and the promise.

### Day 16
1. OPENING SCENE: the café, quieter than usual -- "my daughter called again," left unfinished.
2. SOMETHING HAPPENS: the daughter-pressure thread becomes explicit rather than implied.
3. WHY THIS MATTERS NOW: builds directly toward Day 28's resolution beat.
4. PLAYER INTERVENTION: listen without pushing a side, or just be present. IF ACTS (listens): creates
   `listened_to_miyoko_daughter_worry`. IF NOT: she seems glad the player's there anyway, no
   evidence, thread stays smaller. WHEN RETURNS: gates Day 28 directly.
5. FREE TALK: open, can go as deep as the player wants.
6-7: ACCEPTED; the AI may express uncertainty but never resolves the thread early (Section 7's
   forbidden-outcomes list: "major economic outcome" / life-decision framing applies by extension).
8. VISIBLE CONSEQUENCE: real, unresolved worry shared, met with presence.
9. DELAY/CALLBACK: -> Day 28.
10. DAY END: real, unresolved worry, not solved today.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: none new (deepens ambient canon). CALLBACK_FROM: Day 11
(colors emotional register). PLAYER_CAN_CHANGE: whether the evidence exists. PLAYER_CANNOT_CHANGE:
today's non-resolution (fixed -- this thread cannot close early no matter what's said). FREE_TALK_
CAN_AFFECT: directly creates the evidence.

### Day 17
1. OPENING SCENE: Yohei's store, doing inventory, mentions he'd like a hand with the shelves "next
   time you're by."
2. SOMETHING HAPPENS: a second, parallel promise is created (mirroring Day 15's Fumiko promise),
   deliberately structured the same way to make Day 18's convergence a real, evidence-grounded
   coincidence rather than an arbitrary one.
3. WHY THIS MATTERS NOW: sets up Day 18's actual causal premise properly (V1's version of this day
   fired on loose relationship-warmth; this version requires an actual stated commitment).
4. PLAYER INTERVENTION: agree, or demur. IF ACTS (agrees): creates `Promise(yohei, help_soon,
   due=~day18)`. IF NOT: no promise exists, and Day 18's convergence event simply does not fire this
   playthrough (a real, structural difference, not a forced event regardless of state). WHEN
   RETURNS: read specifically at Day 18.
5. FREE TALK: open.
6-7: a promise is always a structural agreement, never inferred from ambiguous free-talk tone alone.
8. VISIBLE CONSEQUENCE: a plain, specific commitment now exists, on record.
9. DELAY/CALLBACK: -> Day 18.
10. DAY END: unremarkable in itself -- the setup, not the event.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: the Yohei promise. CALLBACK_FROM: none. PLAYER_CAN_
CHANGE: whether the promise exists at all. PLAYER_CANNOT_CHANGE: nothing else this day. FREE_TALK_
CAN_AFFECT: cannot itself create a promise (structural-only, per Section 7's promise-handling rule).

### Day 18
1. OPENING SCENE: two separate promises, both due "soon," both land the same afternoon.
2. SOMETHING HAPPENS: a real scheduling conflict -- ONLY fires if both `Promise(fumiko, help_soon)`
   and `Promise(yohei, help_soon)` actually exist (per Days 15/17); if either is missing, this is
   instead an ordinary day (a real, structural difference from V1's version, which fired on loose
   relationship warmth regardless of any actual commitment).
3. WHY THIS MATTERS NOW: the game is now visibly tracking the player's own stated commitments, not
   just their feelings.
4. PLAYER INTERVENTION: keep one promise and explain to the other, or find a smaller gesture for
   both. IF ACTS (keeps Yohei's): `Promise(yohei, help_soon)` marked kept; `Promise(fumiko,
   help_soon)` marked explained-and-deferred (not broken outright). IF ACTS (keeps Fumiko's):
   mirror image. IF ACTS (smaller gesture to both): both marked partially-kept, a real, smaller,
   different outcome than fully keeping either. WHEN RETURNS: whichever promise's disposition is
   set here is referenced specifically, later, by that NPC (never silently forgotten, per Section
   9's "NPC MEMORY" requirement).
5. FREE TALK: useful for the "explain" branch specifically.
6-7: ACCEPTED as a `kept_miyoko_promise`-tier evidence item (generalized: `kept_promise(npc)`) for
   whichever promise is actually kept.
8. VISIBLE CONSEQUENCE: a real, differentiated outcome depending on which was chosen -- not a
   generic "you handled it."
9. DELAY/CALLBACK: whichever promise is deferred is referenced again within the following week.
10. DAY END: a real, low-stakes consequence of the player's own established pattern -- proof the
    game tracks actual commitments, not vibes.

CAUSALITY_LEVEL: HIGH (when it fires) / QUIET, textured as an ordinary day satisfying Section 5's
"deepen a relationship" bullet via whichever promise still exists in isolation (when only one or
neither promise exists). OPEN_THREAD_CREATED: whichever promise is deferred. CALLBACK_FROM: Days
15/17. PLAYER_CAN_CHANGE: which promise gets kept, and how. PLAYER_CANNOT_CHANGE: that a choice must
be made at all, once both promises genuinely exist. FREE_TALK_CAN_AFFECT: shapes how the deferred
promise is explained, not which promise exists.

---

## Movement 4 (Days 19-24) — the festival

### Day 19
1. OPENING SCENE: the Hall, visibly a mess of papers -- Fumiko brisker than usual.
2. SOMETHING HAPPENS: real, visible strain from taking on too much at once.
3. WHY THIS MATTERS NOW: directly determines how prepared Day 24 actually is.
4. PLAYER INTERVENTION: offer to help with something concrete, or leave her to it. IF ACTS: creates
   `helped_fumiko_festival_prep`, and `festival_prep_progress += 1`. IF NOT: she manages anyway, more
   tired for it -- `festival_prep_progress` stays lower. WHEN RETURNS: directly read into Day 24's
   composite scene text.
5. FREE TALK: open.
6-7: ACCEPTED, small.
8. VISIBLE CONSEQUENCE: a specific, small task actually completed, not a vague "you helped."
9. DELAY/CALLBACK: -> Day 24.
10. DAY END: anticipation building, mild visible stress under her brisk manner.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: Day 3. PLAYER_CAN_CHANGE:
`festival_prep_progress`'s value. PLAYER_CANNOT_CHANGE: that the festival happens at all (fixed).
FREE_TALK_CAN_AFFECT: can create the evidence.

### Day 20
1. OPENING SCENE: Yohei's store, doing math out loud about festival stock.
2. SOMETHING HAPPENS: a real budget decision under real constraint.
3. WHY THIS MATTERS NOW: directly sets what Day 24's stall actually looks like.
4. PLAYER INTERVENTION: help him decide generously, carefully, or leave him to it alone. IF ACTS
   (generous): `yohei_festival_stock = full`, creates `supported_yohei_festival_stock`. IF ACTS
   (careful): `= modest`. IF NOT: `= minimal`, decided alone, still quietly proud. WHEN RETURNS:
   Day 24 reads this value directly, word-for-word different text per outcome.
5. FREE TALK: open.
6-7: ACCEPTED.
8. VISIBLE CONSEQUENCE: a specific stock-level decision, permanently fixed for Day 24.
9. DELAY/CALLBACK: -> Day 24 (composite read).
10. DAY END: quiet pride, regardless of outcome.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: Day 9. PLAYER_CAN_CHANGE:
`yohei_festival_stock`'s exact value. PLAYER_CANNOT_CHANGE: that SOME decision gets made today
(fixed). FREE_TALK_CAN_AFFECT: can shift the decision toward generous if genuinely persuasive and
specific.

### Day 21
1. OPENING SCENE: somewhere in town, something being fixed by someone nobody's watching.
2. SOMETHING HAPPENS: Jin's unseen setup work -- including, if `suggested_jin_for_bench` was set on
   Day 10, the bench specifically, now fixed. Additionally, this is the SECOND, late window for
   Jin's standing-arrangement offer if it never fired on Day 5 and his evidence total has since
   crossed the threshold.
3. WHY THIS MATTERS NOW: the last realistic point before the festival for both the bench and Jin's
   own arc to land.
4. PLAYER INTERVENTION: notice and specifically thank him (not generic thanks), or miss it. IF ACTS:
   creates `thanked_jin_for_unseen_work`; if the late-window arrangement gate is also met, the offer
   surfaces here too, same accept/decline shape as Day 5. IF NOT: the work happens anyway, unseen,
   exactly as intended by his own character. WHEN RETURNS: `bench_fixed` -> Day 24;
   `jin_arrangement` (if resolved here) -> Day 29/30.
5. FREE TALK: open.
6-7: ACCEPTED for the thanks; the arrangement offer itself is always structural.
8. VISIBLE CONSEQUENCE: a fixed bench people can now actually sit on; a specific, named
   acknowledgment if given.
9. DELAY/CALLBACK: -> Day 24, Day 29/30.
10. DAY END: a quiet, easy-to-miss kindness either way.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: none new (pays off Day 10). CALLBACK_FROM: Day 10, Day
5 (if unresolved). PLAYER_CAN_CHANGE: whether Jin is specifically thanked; whether the late-window
offer is accepted, if it fires. PLAYER_CANNOT_CHANGE: whether `bench_fixed` happens at all (that was
locked in on Day 10, not today). FREE_TALK_CAN_AFFECT: can create the thanks-evidence.

### Day 22
1. OPENING SCENE: Hina's shop, later, quieter than the daytime bustle.
2. SOMETHING HAPPENS: {if gate met} she finally says the real reason the last shop closed. {if not
   met} an ordinary, pleasant evening -- explicitly not a failure state.
3. WHY THIS MATTERS NOW: the last major emotional beat before the festival, raising what's actually
   at stake in whether her shop appears there at all.
4. PLAYER INTERVENTION: just listen, patiently. IF gate met AND player listens well (doesn't rush to
   "fix" it): creates `reassured_hina_after_criticism`-tier deep evidence, `hina_true_reason_known =
   true`. IF gate not met: nothing to act on -- explicitly legitimate. WHEN RETURNS: read at Day 24
   and Day 30.
5. FREE TALK: this IS the deep-talk day for her arc, gated on
   `NEWLIFE_30DAY_GAMEBOOK_STATE_MODEL_LEDGER_V2.md`'s Hina gate (evidence-based, not a raw counter
   -- the direct fix for V1's exact failure here).
6-7: ACCEPTED only once real accumulated evidence supports it -- never a scripted inevitability by
   calendar day alone.
8. VISIBLE CONSEQUENCE: real vulnerability shared, met with presence, not a fix, if reached.
9. DELAY/CALLBACK: -> Day 24, Day 30.
10. DAY END: real vulnerability, or an ordinary pleasant evening -- both legitimate.

CAUSALITY_LEVEL: HIGH (when it fires) / MEDIUM (ordinary evening, still satisfies Section 5 via
"deepen a relationship" through whatever lighter exchange happens instead). OPEN_THREAD_CREATED:
none new. CALLBACK_FROM: Days 1, 4, 14. PLAYER_CAN_CHANGE: whether `hina_true_reason_known` becomes
true this playthrough at all. PLAYER_CANNOT_CHANGE: the actual true reason itself (fixed; a real
past event, not a live decision). FREE_TALK_CAN_AFFECT: is the only path to this specific reveal.

### Day 23
1. OPENING SCENE: shouting, running, a truck somewhere it shouldn't be -- the day before the
   festival.
2. SOMETHING HAPPENS: what looks like a crisis.
3. WHY THIS MATTERS NOW: deliberately does NOT matter causally -- a designed tension-release valve
   right before Day 24, per Section 5's "emotional recovery" quiet-day-equivalent function, even
   though it's framed as a mini-event.
4. PLAYER INTERVENTION: investigate, or shrug it off. IF ACTS: witnesses the harmless resolution
   directly. IF NOT: hears about it after the fact, same resolution either way. WHEN RETURNS: no
   later day reads this -- explicitly, by design, a non-causal day (Section 4's own filter applied
   honestly: this "choice" is intentionally cosmetic, and is labeled QUIET rather than smuggled in
   as if it mattered).
5. FREE TALK: open, low stakes.
6-9: no evidence, no proposal of consequence -- explicitly a case where Section 4's rule was applied
   and the day was KEPT as cosmetic on purpose (a pressure-release function, not a hidden causal
   day), rather than force-fitting a fake consequence just to satisfy the rule's letter.
10. DAY END: a laugh, a held breath let out.

CAUSALITY_LEVEL: QUIET (honestly labeled, not disguised as HIGH). OPEN_THREAD_CREATED: none.
CALLBACK_FROM: none. PLAYER_CAN_CHANGE: nothing durable. PLAYER_CANNOT_CHANGE: the outcome (always
harmless). FREE_TALK_CAN_AFFECT: nothing durable.

### Day 24 — MERGE POINT (festival)
1. OPENING SCENE: the whole street dressed for the festival, all six NPCs live simultaneously for
   the first time in the spine.
2. SOMETHING HAPPENS: everything the prior 23 days actually produced, assembled -- never a fresh
   independent event.
3. WHY THIS MATTERS NOW: the spine's entire causal architecture is only provable here, all at once.
4. PLAYER INTERVENTION: the 2-action-equivalent budget makes "where do I spend today" the day's real
   drama. IF ACTS (chooses location A): sees that thread's specific, evidence-built version of
   today; does NOT see location B's simultaneous version. IF ACTS (chooses B instead): the mirror
   image. WHEN RETURNS: Day 25 (comedown) and Day 30 (retrospective) both reference whichever
   version actually happened.
5. FREE TALK: open at whichever location is chosen.
6-7: this day's text is entirely assembled from prior `WorldFact`/evidence state -- AI free talk may
   describe what's already true, never invent a different festival than the one accumulated state
   actually produced (Section 7's forbidden list explicitly bans "festival cancellation" and
   unauthorized major-outcome invention here specifically).
8. VISIBLE CONSEQUENCE: `yohei_festival_stock`'s exact value, `bench_fixed`'s exact value, and
   `hina_true_reason_known`'s exact value all render as different, specific text -- not a generic
   festival scene with cosmetic flavor text.
9. DELAY/CALLBACK: -> Day 25, Day 30 -- the spine's central callback destination for nearly every
   earlier evidence item.
10. DAY END: full, warm, slightly bittersweet -- pride in the town, real awareness of what wasn't
    seen because it couldn't all be seen in one day.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: none new (this IS the merge point). CALLBACK_FROM: Days
3, 9, 10, 13 (indirectly), 14, 15, 17, 19, 20, 21, 22. PLAYER_CAN_CHANGE: which thread is
personally witnessed today. PLAYER_CANNOT_CHANGE: what state each thread is actually IN (locked in
by prior days, not decided today). FREE_TALK_CAN_AFFECT: description only, never outcome invention.

---

## Movement 5 (Days 25-30)

### Day 25
1. OPENING SCENE: the morning after, town a little sleepy.
2. SOMETHING HAPPENS: the specific comedown from whichever version of Day 24 actually happened.
3. WHY THIS MATTERS NOW: emotional release valve, explicitly satisfying Section 5's "recovery after
   a major scene" bullet.
4. PLAYER INTERVENTION: check in on someone specific, or rest. IF ACTS: a warm, low-stakes exchange
   referencing yesterday specifically. IF NOT: equally fine, a quieter day. WHEN RETURNS: colors
   tone only, no hard gate.
5. FREE TALK: open, warm, reflective.
6-9: ambient only.
10. DAY END: soft, satisfied quiet.

CAUSALITY_LEVEL: QUIET (but not 3-in-a-row -- Day 23 was the only other recent QUIET day, and Day 24
was HIGH, so this is compliant). OPEN_THREAD_CREATED: none. CALLBACK_FROM: Day 24. PLAYER_CAN_
CHANGE: tone only. PLAYER_CANNOT_CHANGE: yesterday's outcome (fixed, already happened).
FREE_TALK_CAN_AFFECT: tone only.

### Day 26
1. OPENING SCENE: Yohei's store, unusually quiet, distracted -- the exact gesture from Day 13,
   recurring with different meaning.
2. SOMETHING HAPPENS: {gated on `noticed_yohei_son_thread` AND at least one more Yohei evidence
   item} his son called the night before. {if not met} an ordinary day.
3. WHY THIS MATTERS NOW: the single longest-delayed payoff in the whole spine (13 days).
4. PLAYER INTERVENTION: notice and ask gently, or be present without asking. IF ACTS: hears that
   they talked -- nothing more resolved than that. IF NOT (gate met but player doesn't ask): the
   fact remains true in world-state but isn't shared with the player this scene (KNOWLEDGE vs. FACT
   distinction from the state model). WHEN RETURNS: colors Day 30's retrospective either way.
5. FREE TALK: open, this is the payoff scene.
6-7: AI may express relief/uncertainty but may never narrate the call's actual content or promise a
   future reunion (Section 7's forbidden list: no unauthorized major relationship-repair beyond what
   the system states, which is only "they talked").
8. VISIBLE CONSEQUENCE: quiet, real, deliberately unresolved beyond "they talked."
9. DELAY/CALLBACK: -> Day 30.
10. DAY END: quiet and real.

CAUSALITY_LEVEL: HIGH (when it fires) / MEDIUM (ordinary day, still satisfies Section 5). OPEN_
THREAD_CREATED: none new. CALLBACK_FROM: Day 13. PLAYER_CAN_CHANGE: whether the player LEARNS about
it this scene (the event itself is evidence-locked from Day 13 onward, not decided today).
PLAYER_CANNOT_CHANGE: whether the call itself happened (locked by the Day 13 gate). FREE_TALK_CAN_
AFFECT: whether the player learns the news this scene vs. later.

### Day 27
1. OPENING SCENE: Daisuke's chair, a slower afternoon.
2. SOMETHING HAPPENS: {gated on `returned_to_daisuke_after_deflection >= 2`} something actually
   gives -- the card, finally. {if not met} an ordinary, comfortable afternoon.
3. WHY THIS MATTERS NOW: this is the corrected version of V1's exact documented failure -- the gate
   now specifically rewards having come back after being turned away, not raw talk volume.
4. PLAYER INTERVENTION: listen, patiently. IF gate met AND player listens: hears about the
   unanswered New Year's card. IF gate not met: nothing to act on, explicitly legitimate, and -- per
   Section 15's honesty requirement -- this Run explicitly checks whether this still produces a
   silent, confusing letdown the way V1's did.
5. FREE TALK: the deep-talk day for this thread, gated correctly this time.
6-7: friend's identity/backstory stays exactly as vague as canon (a friend from his city years) --
   no invented name or falling-out story.
8. VISIBLE CONSEQUENCE: a quiet parallel to Yohei's own arc, never stated as parallel in-fiction.
9. DELAY/CALLBACK: -> Day 30.
10. DAY END: a quiet parallel, felt only by an attentive player.

CAUSALITY_LEVEL: HIGH (when it fires) / MEDIUM otherwise. OPEN_THREAD_CREATED: none new.
CALLBACK_FROM: Day 8, and every later `returned_to_daisuke_after_deflection` visit. PLAYER_CAN_
CHANGE: whether the gate was ever met, going all the way back to Day 8's pattern. PLAYER_CANNOT_
CHANGE: the friend's specific backstory (fixed, vague). FREE_TALK_CAN_AFFECT: is the only path to
this reveal, but the GATE is evidence-based, not free-talk-luck-based -- the explicit fix.

### Day 28
1. OPENING SCENE: the café, Miyoko mentioning she spoke to her daughter again, differently this
   time.
2. SOMETHING HAPPENS: {gated on `listened_to_miyoko_daughter_worry` AND `>= 2` total Miyoko
   evidence} a real outcome -- staying, a compromise, or genuinely still undecided.
3. WHY THIS MATTERS NOW: closes (or deliberately leaves open) the slowest-moving arc of the six.
4. PLAYER INTERVENTION: listen, no correct side to take. IF gate met: hears the specific outcome. IF
   NOT: an ordinary day at the café, thread stays open past Day 30. WHEN RETURNS: -> Day 30.
5. FREE TALK: open.
6-7: the outcome is fixed by accumulated evidence before this scene renders, never decided live by
   free-talk persuasion (Section 6's explicit anti-manipulation discipline, restated here).
8. VISIBLE CONSEQUENCE: real, adult, not-necessarily-triumphant closure.
9. DELAY/CALLBACK: -> Day 30.
10. DAY END: real and adult -- not every ending is a clean win, by design.

CAUSALITY_LEVEL: HIGH (when it fires) / MEDIUM otherwise. OPEN_THREAD_CREATED: none new.
CALLBACK_FROM: Days 11, 16. PLAYER_CAN_CHANGE: whether the gate was ever met (accumulated from
Days 11/16 onward). PLAYER_CANNOT_CHANGE: today's specific outcome value once the gate IS met (fixed
by accumulated evidence, not swayed live). FREE_TALK_CAN_AFFECT: whether the player hears it today.

### Day 29
1. OPENING SCENE: a private moment, no one else around.
2. SOMETHING HAPPENS: an opportunity for an entirely unwitnessed kindness, ideally toward whichever
   NPC has been least thanked this playthrough (commonly Jin, per his own arc's theme, but not
   hardcoded -- read from actual evidence totals across the month).
3. WHY THIS MATTERS NOW: tests whether the player's values hold up with no audience and no
   guaranteed payoff -- the design's own values made concrete.
4. PLAYER INTERVENTION: do the kind thing anyway, or don't. IF ACTS: no visible state change, no
   thank-you scene, no XP -- explicitly, by design. IF NOT: also fine, never framed as a missed
   reward. WHEN RETURNS: if any payoff exists at all, it is small, delayed, and never explicitly
   attributed back to this exact moment (Section 4's causality rule is deliberately NOT fully
   satisfied here on purpose -- this is the one authored exception, stated plainly rather than
   silently smuggled in, because forcing a visible consequence here would destroy the entire point
   of the beat).
5. FREE TALK: optional, low stakes either way.
6-9: no delta proposal accepted here regardless of content -- this day's whole design is that
   nothing observable should change.
10. DAY END: private, understated, whichever way it goes.

CAUSALITY_LEVEL: QUIET (by explicit design, and explicitly exempted from Section 4's normal
"remove if cosmetic" rule -- see step 4's own note; this is a deliberate, disclosed exception, not
an oversight). OPEN_THREAD_CREATED: none, by design. CALLBACK_FROM: none guaranteed. PLAYER_CAN_
CHANGE: nothing observable. PLAYER_CANNOT_CHANGE: nothing observable either way -- symmetric by
design. FREE_TALK_CAN_AFFECT: nothing durable.

### Day 30 — retrospective, not "the end"
1. OPENING SCENE: the room upstairs, considerably less temporary-looking than Day 1.
2. SOMETHING HAPPENS: nothing new -- explicitly not a crisis day, not a final boss.
3. WHY THIS MATTERS NOW: this is the only day whose entire content is a read-back of everything
   else, never a new event.
4. PLAYER INTERVENTION: an optional, skippable reflection, reusing this codebase's own already-
   built and tested Day-30 retrospective register/restraint (`PHASE_12_8_NEW_LIFE_30_DAY_ARC_AND_
   RETROSPECTIVE_V1`), scaled to this cast. IF ACTS (writes a reflection): stored verbatim, never
   analyzed or scored. IF NOT: equally valid.
5. FREE TALK: the reflection itself, freeform.
6-7: nothing to gate -- this day proposes no new state.
8. VISIBLE CONSEQUENCE: a genuinely different summary per playthrough, assembled from
   `hina_true_reason_known`, `yohei_son_recontacted`, `daisuke_renovation_decided`,
   `daisuke_card_known`, `jin_arrangement`, `miyoko_daughter_outcome`, `bench_fixed`, `fumiko_
   writes_back` -- read, never re-decided.
9. DELAY/CALLBACK: none forward (Day 31+ explicitly out of scope).
10. DAY END: "did you want to see tomorrow?" -- no GOOD END, no BAD END, matching existing canon
    precedent exactly.

CAUSALITY_LEVEL: MEDIUM (a real, evidence-driven read-back, even though no NEW state is created).
OPEN_THREAD_CREATED: none. CALLBACK_FROM: every gated thread in the spine. PLAYER_CAN_CHANGE: whether
a reflection is written. PLAYER_CANNOT_CHANGE: the substance of what actually happened across the 30
days (fixed, already decided by then). FREE_TALK_CAN_AFFECT: only the optional reflection text
itself.

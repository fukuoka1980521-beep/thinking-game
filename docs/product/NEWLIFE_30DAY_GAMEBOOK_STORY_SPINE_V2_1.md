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

`[PHASE_24.3 ADDITION -- ALWAYS RENDERED]`: woven into the same scene, Hina mentions -- unprompted,
to anyone nearby -- that she's planning a small trial sale, a test-bake day, before she commits to
anything bigger toward the festival. `hina_trial_planned = true`, unconditionally. This gives the
player one concrete, dated, forward-looking question by the end of Day 1 (Section 6's explicit
requirement), regardless of whether they helped with the box. PLAYER INTERVENTION (optional, does
not compete with the box-helping choice): ask when, or just note it. IF ACTS: `player_knows_trial_
date = true`. IF NOT: the date isn't confirmed to the player yet, but the trial is happening either
way.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: Hina's shop-progress thread; her trial-sale date.
CALLBACK_FROM: none. PLAYER_CAN_CHANGE: whether `helped_hina_move_box` and `player_knows_trial_date`
exist. PLAYER_CANNOT_CHANGE: `hina_shop_readiness`'s starting tier (fixed at `not_started`); that
the trial itself is planned (always true). FREE_TALK_CAN_AFFECT: tone only. OPEN_QUESTION_AT_DAY_
END: "what will the trial actually look like?"

### Day 2
MAIN SCENE: whichever of the two Day 1 didn't dwell on (Yohei's corner, specifically) shows a small,
real overnight change -- a delivery box shifted, something restocked. Auto-entered, not chosen.
WHY THIS MATTERS NOW: Day 2 is the design's foundational proof that the town exists without the
player watching -- made concrete immediately, not asserted.
PLAYER INTERVENTION: notice and comment, or not. IF ACTS: a small, specific acknowledgment exchange.
IF NOT: the change stands, unremarked. WHEN RETURNS: colors whether Yohei's dialogue register later
treats the player as observant (flavor only, no hard gate).
FREE TALK: open.
OPTIONAL ROAMING AFTER: a brief, low-effort stop at Hina's is available -- **`[PHASE_24.3
ADDITION -- ALWAYS RENDERED]`**: visiting or not, a visible piece of Hina's trial prep has appeared
overnight (a hand-lettered sign, a trial menu, a shifted shelf -- `hina_trial_prep_visible_change =
true`), and Yohei, unprompted, makes one practical comment that the plan sounds complicated for a
first try. Hina doesn't fully agree. `yohei_raised_practical_concern = true` -- a stated FACT about
the plan, not yet anything about how Hina personally reads it (that separation is Day 4's job). Both
facts render unconditionally, independent of the roaming choice.
VISIBLE CONSEQUENCE: the overnight change itself is checkable, not just narrated; a real, aired
disagreement about the plan exists whether or not the player witnessed it directly.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: "the town moves without me" (felt, not mechanical);
the plan-complexity disagreement. CALLBACK_FROM: Day 1. PLAYER_CAN_CHANGE: nothing mechanical yet.
PLAYER_CANNOT_CHANGE: the overnight change itself; that the disagreement exists. FREE_TALK_CAN_
AFFECT: tone only. OPEN_QUESTION_AT_DAY_END: "is Yohei right that it's too complicated, or is Hina?"

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

`[PHASE_24.3 ADDITION]`: lightly connected, not forced -- if the player mentions Hina's trial while
here, Fumiko notes that a good trial run could give Hina something real to bring to the festival
later, without promising it will. The town now visibly has TWO horizons: near (Hina's trial,
~Day 7) and later (the festival, still unspecified). Festival participation is never guaranteed by
this connection.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: the festival; the near/later horizon pairing.
CALLBACK_FROM: none. PLAYER_CAN_CHANGE: whether `festival_flyer_seen` is set. PLAYER_CANNOT_CHANGE:
what the festival actually is (revealed later); whether Hina's trial and the festival end up
connected in reality (not decided today). FREE_TALK_CAN_AFFECT: tone only. OPEN_QUESTION_AT_DAY_
END: "what is this festival everyone keeps almost mentioning?"

### Day 4 `[FIXED -- Fix E; PHASE_24.3 -- FACT/BELIEF now explicitly separated]`
MAIN SCENE: Hina, visibly tense, admits -- to the player, alone -- she's not sure Yohei likes her.
Auto-entered; Yohei is NOT present in this scene. **This is explicitly `hina_believes_yohei_
dislikes_her` (an NPC_BELIEF), not the same fact as Day 2's `yohei_raised_practical_concern` (a
WORLD_PROGRESS FACT about the plan)** -- Hina is reading his practical comment as personal, and the
state model itself keeps these two rows permanently distinct so no later scene can accidentally
merge them.
WHY THIS MATTERS NOW: a real, specific worry, stated where only the player can hear it -- and a
real example of a belief forming from a fact, visibly, in front of the player.
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
witnesses). CALLBACK_FROM: Days 1-2. PLAYER_CAN_CHANGE: whether `reassured_hina_about_yohei` exists;
whether `defended_hina_to_yohei` is ever separately created; whether `player_knows_yohei_concern_
is_practical` becomes true (only if told distinctly from the belief). PLAYER_CANNOT_CHANGE: Yohei's
baseline wariness pattern itself; `yohei_raised_practical_concern`'s own existence (fixed since Day
2). FREE_TALK_CAN_AFFECT: can create either evidence item, in the correct scene. OPEN_QUESTION_AT_
DAY_END: "is Hina right about Yohei, or is she reading him wrong?"

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

`[PHASE_24.3 ADDITION -- ALWAYS RENDERED]`: regardless of the arrangement-offer branch above, Jin
does one concrete piece of setup work connected to Hina's trial today -- levels an uneven table, or
fixes a sticking drawer in her counter -- `jin_fixed_trial_setup_issue = true`, unconditionally, no
relationship evidence required for this to happen. PLAYER INTERVENTION (optional): notice and thank
him, or not. IF ACTS: `thanked_jin_for_trial_fix` created. IF NOT: the work still happened; he
never needed to be seen doing it.

CAUSALITY_LEVEL: HIGH (when the arrangement offer fires) / MEDIUM otherwise. OPEN_THREAD_CREATED:
Jin's arrangement thread, if unresolved. CALLBACK_FROM: Days 1-4's ambient Jin evidence, if any.
PLAYER_CAN_CHANGE: `jin_arrangement`'s value, if offered; whether he's specifically thanked today.
PLAYER_CANNOT_CHANGE: whether the offer fires at all today; whether Jin's trial-setup fix happens
(always true). FREE_TALK_CAN_AFFECT: cannot manufacture the offer early. OPEN_QUESTION_AT_DAY_END:
"is the trial setup actually coming together?"

### Day 6 `[PHASE_24.3 -- now carries real information even for a fully passive player]`
MAIN SCENE: Yohei and Daisuke, already mid-conversation somewhere in town -- but this time the old
joke gives way to them actually discussing Hina's upcoming trial: `yohei_daisuke_discussed_trial =
true`, unconditionally. Yohei repeats his practical-complexity concern (consistent with Day 2, never
softened just because he's talking to a friend instead of the player); Daisuke, neutral, wonders
aloud how it'll actually go. The player overhears real, specific opinions forming independently of
anything they've done.
WHY THIS MATTERS NOW: proves the town is one social fabric, not six separate rooms -- and gives a
skeptical/passive player real information about the trial without requiring them to have asked
anyone anything.
PLAYER INTERVENTION: watch quietly, or step away -- genuinely cosmetic at the level of this single
choice (an explicitly disclosed exception, same category as V2's Day 23/29, not hidden). IF ACTS OR
NOT: the conversation's content is identical either way; only whether the PLAYER personally
overheard it differs (a PLAYER_KNOWLEDGE distinction, not a world-state one).
FREE TALK: open, low stakes.
OPTIONAL ROAMING AFTER: a brief stop at Daisuke's shop is available -- **this is the first of the
explicit later Daisuke touchpoints required by Fix A** -- a light visit here can create
`returned_to_daisuke_after_deflection` if Day 8 has already happened by the time the player reaches
this day (chronologically it hasn't yet, so this roaming stop is ambient-only this early; the same
roaming option recurs on later days once Day 8 has passed, see Days 14/19/23 below).
VISIBLE CONSEQUENCE: warm, textural, low-stakes.

CAUSALITY_LEVEL: MEDIUM (raised from QUIET -- the conversation now carries real, new information
about an active thread, even though the single "watch or step away" choice remains cosmetic).
OPEN_THREAD_CREATED: none new (deepens the trial thread). CALLBACK_FROM: Days 1-2. PLAYER_CAN_
CHANGE: nothing durable from the main choice. PLAYER_CANNOT_CHANGE: the NPC-NPC relationship
itself; the conversation's content. FREE_TALK_CAN_AFFECT: tone only. OPEN_QUESTION_AT_DAY_END:
"will Yohei turn out to be right about the trial being too complicated?"

---

## Movement 2 (Days 7-12)

### Day 7 `[PHASE_24.3 -- now the trial-day centerpiece, Daisuke's comedy preserved as a same-day
satellite scene]`
MAIN SCENE: **the trial itself happens today, unconditionally** -- `trial_day_happened = true`.
Hina's small test-sale/test-bake plays out in real time. `trial_result_menu_confusion = true`: a
genuine, observable customer-behavior fact -- too many choices slowed ordering, one item sold out
fast while another barely moved, something Hina assumed was obvious (which item went where) wasn't.
Not a disaster; reality producing data, per the human core. This happens regardless of whether the
player is present.
WHY THIS MATTERS NOW: by end of Day 7 the design requires one observable world result to have
occurred regardless of the player (Section 6) -- this is that result.
PLAYER INTERVENTION: help during the trial, observe quietly, comment, stay silent, or even disagree
with the emerging read that the menu was confusing -- all valid. IF ACTS (help): creates
`helped_during_trial`, `player_witnessed_trial_results = true`. IF ACTS (observe/comment): creates
`player_witnessed_trial_results = true` only. IF NOT (absent entirely): the customer behavior still
happened and is still real; the player simply wasn't there to see it directly, and later scenes
will reference it as something that happened, not something the player caused or prevented.
FREE TALK: open during the trial -- **free talk may NOT decide whether customers were confused or
what actually sold; that is fixed, system-owned data** (Section 9's explicit boundary).
OPTIONAL ROAMING/SATELLITE SCENE (preserved from V2.1, not replaced): Daisuke's chair, the same
impossible-customer comedy beat as before, available the same day for a player who wants a lighter
moment alongside the trial. PLAYER INTERVENTION (Daisuke): comment warmly, or just watch. IF ACTS:
creates `witnessed_daisuke_comedy_day` (weak evidence, still real, contributing to his `>= 2`
evidence threshold). IF NOT: no evidence, purely a laugh.
VISIBLE CONSEQUENCE: real, specific, checkable customer-behavior data now exists; Daisuke's comedy
beat lands exactly as before if visited.

CAUSALITY_LEVEL: HIGH (raised from MEDIUM -- this is now the arc's central observable event).
OPEN_THREAD_CREATED: the trial's results, awaiting Hina's reaction (Day 8). CALLBACK_FROM: Days
1-2, 5-6. PLAYER_CAN_CHANGE: whether the player personally witnessed/helped; whether the Daisuke
evidence item exists. PLAYER_CANNOT_CHANGE: `trial_result_menu_confusion`'s own content (fixed,
system-owned); that the trial happens at all today. FREE_TALK_CAN_AFFECT: cannot decide the
customer-behavior facts, only the player's own commentary on them. OPEN_QUESTION_AT_DAY_END: "how
will Hina take the results tomorrow?"

### Day 8 `[PHASE_24.3 -- Hina's trial reaction now the main scene, Daisuke's deflection preserved
as a same-day secondary scene]`
MAIN SCENE: Hina, the morning after -- `hina_initial_defensive_reaction = true`, unconditionally.
She explains, with real, plausible reasons (not a caricature), why the original plan made sense: the
variety was meant to give people options, the layout matched how she'd always pictured the counter.
This is a genuine, in-character defense, not a strawman. PLAYER INTERVENTION: challenge her gently,
support her, or stay silent -- all three are valid, evidence-creating responses (Section 3's
explicit instruction: do not turn her into a caricature; challenging respectfully is not penalized).
IF ACTS (challenge): creates `challenged_hina_after_trial`. IF ACTS (support): creates `supported_
hina_after_trial`. IF NOT (silent): `hina_view_shifting = true` fires anyway -- another NPC (Yohei
or Miyoko, whoever is narratively closest) asks her a simple factual question, "which one actually
sold?", and the data itself starts the same work an active challenge would have. WHEN RETURNS: colors
`hina_adjustment_timing`'s early/late split, read at Day 10.
FREE TALK: open, useful for either the challenge or support branch.
OPTIONAL ROAMING/SATELLITE SCENE (preserved from V2.1): Daisuke's chair, the personal-question
deflection beat, available the same day. PLAYER INTERVENTION (Daisuke): ask something real anyway,
or let a comfortable silence stand. IF ACTS: creates `attempted_daisuke_personal`; he deflects,
smoothly. WHEN RETURNS: any LATER visit where the player asks again creates `returned_to_daisuke_
after_deflection`, read through Day 27; `COUNT(daisuke_relationship_evidence) >= 2` is what can move
his independent decision date from Day 20 to Day 12.
VISIBLE CONSEQUENCE: a real, plausible defense from Hina, met with a real, differentiated response;
Daisuke's deflection beat lands exactly as before if visited.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: Daisuke's card thread (unnamed to the player yet); how
Hina's view will keep shifting. CALLBACK_FROM: Day 7. PLAYER_CAN_CHANGE: which Hina-evidence item
exists; whether `attempted_daisuke_personal` exists. PLAYER_CANNOT_CHANGE: today's Daisuke deflection
itself; that `hina_view_shifting` happens even in total silence (fixed, system-owned). FREE_TALK_
CAN_AFFECT: creates the relevant evidence directly, never decides the trial data itself.
OPEN_QUESTION_AT_DAY_END: "will Hina actually change anything, or just talk about it?"

### Day 9 `[PHASE_24.3 -- kept as an observable thematic contrast to Hina's Day 8, never stated
outright]`
MAIN SCENE: Yohei's store, a crate visibly set aside -- spoiled stock, a real operational loss.
Unlabeled, unstated: he treats it as information about business (write it off, adjust, move on),
not as a personal insult -- the same shape of thing Hina is working through, at a different size,
never named as a parallel in-fiction. In the background, `hina_trial_planned`'s aftermath continues
quietly (she's known to be turning the results over).
WHY THIS MATTERS NOW: grounds his business-pressure texture ahead of the festival-budget day, and
gives an attentive player a second, contrasting example of the same lesson without ever being told
so.
PLAYER INTERVENTION: help sort what's still good, or just keep him company. IF ACTS: creates
`helped_yohei_sort_stock`. IF NOT: no evidence, an ordinary shared moment. WHEN RETURNS: this is
now REQUIRED as the "distinct additional evidence" for the Day-26-equivalent gate, per Fix D --
noticing his son's phone alone is not enough; this (or an equivalent later item) has to exist too.
FREE TALK: open.
OPTIONAL ROAMING AFTER: a brief stop at Hina's is available, ambient only.
VISIBLE CONSEQUENCE: a plain, undramatic "that's business" shrug either way.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: Day 7-8 (thematic, unstated).
PLAYER_CAN_CHANGE: whether the evidence item exists. PLAYER_CANNOT_CHANGE: how much stock was lost.
FREE_TALK_CAN_AFFECT: can create the evidence. OPEN_QUESTION_AT_DAY_END: "will Hina end up handling
her own setback this plainly?"

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

`[PHASE_24.3 ADDITION -- ALWAYS RENDERED]`: separately, at Hina's shop, `hina_sign_menu_adjusted =
true` by today, unconditionally -- her sign or menu is visibly different: fewer items, clearer
labels, a changed display order. `hina_adjustment_timing` = `"early_calm"` if any Day 5-9 evidence
(the trial fix thanked, help/challenge/support given, Daisuke-adjacent warmth) exists, else
`"late_friction"` -- **the adjustment itself is fixed either way; only its manner and exact date
within the Day 8-10 window differ.**

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: the bench. CALLBACK_FROM: none (bench); Days 7-8 (the
sign adjustment). PLAYER_CAN_CHANGE: whether the bench is ever fixed at all; `hina_adjustment_
timing`'s value. PLAYER_CANNOT_CHANGE: the letter thread underneath the bench (separate gate);
whether `hina_sign_menu_adjusted` happens at all (fixed). FREE_TALK_CAN_AFFECT: cannot substitute
for the structural bench-suggestion; can contribute to `hina_adjustment_timing`. OPEN_QUESTION_AT_
DAY_END: "did the sign change actually help, or is it too soon to tell?"

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

`[PHASE_24.3 ADDITION -- ALWAYS RENDERED]`: woven into the same scene, Miyoko mentions she tried
one of Hina's trial-day items and compares it, casually, to something on her own menu -- `miyoko_
commented_on_trial_item = true`, unconditionally, no player action required. A second, independent
piece of real-world feedback on the trial, entirely off-screen from the player's own choices.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: Day 7 (the trial). PLAYER_
CAN_CHANGE: whether the beans evidence exists. PLAYER_CANNOT_CHANGE: whether the beans land well;
whether Miyoko's comment on Hina's item happens (fixed). FREE_TALK_CAN_AFFECT: can create the beans
evidence. OPEN_QUESTION_AT_DAY_END: "is the town's read on Hina's trial turning positive?"

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

`[PHASE_24.3 ADDITION -- ALWAYS RENDERED]`: separately, Hina makes one concrete decision today,
read directly from `trial_result_menu_confusion` (not decided live, not requiring the player):
reduces her initial product range, or keeps the one item that unexpectedly sold out, or delays
something she now realizes wasn't ready. `hina_concrete_decision` set, unconditionally --
real WORLD PROGRESS, the arc's own turning point.
PLAYER INTERVENTION (this specific beat): none required; player intervention across Days 5-10
already determined `hina_adjustment_timing`/confidence, read here, not re-decided.

CAUSALITY_LEVEL: HIGH (raised from MEDIUM -- Hina's decision is a real turning point). OPEN_THREAD_
CREATED: none new (Daisuke); Hina's decision closes the trial-reaction arc's main beat. CALLBACK_
FROM: Days 7/8 (Daisuke); Days 7-10 (Hina). PLAYER_CAN_CHANGE: whether enough Daisuke evidence
exists to move his decision earlier; the CONFIDENCE/manner with which Hina's decision reads (via
Days 5-10's accumulated evidence). PLAYER_CANNOT_CHANGE: that Daisuke's decision happens at all
(fixed, by Day 20 at the latest); that Hina's concrete decision happens at all (fixed, today).
FREE_TALK_CAN_AFFECT: creates the Daisuke evidence; cannot alter which concrete decision Hina makes.
OPEN_QUESTION_AT_DAY_END: "was that the right call for her -- and what does the festival horizon
look like now?"

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
OPTIONAL ROAMING AFTER: a brief stop at Hina's is available -- **`[PHASE_24.3 ADDITION -- ALWAYS
RENDERED]`**: whether visited or not, `trial_cost_pressure_visible = true` from today,
unconditionally -- the trial's first real cost (ingredients, a small equipment repair, whatever the
sign-change required) becomes visible in the background, a plain fact, not a forced confession.
VISIBLE CONSEQUENCE: he goes quiet, deflects, but it visibly landed as real; a real, small financial
pressure is now part of Hina's visible situation, whether or not the player notices it yet.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: Yohei's son thread; the trial's cost pressure. CALLBACK_
FROM: Days 7/12 (the cost pressure). PLAYER_CAN_CHANGE: whether the son-thread ever becomes visible
at all. PLAYER_CANNOT_CHANGE: `yohei_son_call_happened`'s own timing (independent world progress,
per Fix Section 3 option B); whether `trial_cost_pressure_visible` becomes true (fixed, today).
FREE_TALK_CAN_AFFECT: directly creates the noticing evidence, never the underlying event. OPEN_
QUESTION_AT_DAY_END: "how much did that trial actually cost her?"

### Day 14 `[PHASE_24.3 -- this beat now has earned context from the preceding 13 days, per Section
3's explicit instruction]`
MAIN SCENE: Hina's shop, a comment about "juggling a few things" -- a little too casual. Unlike a
cold open, the player has already seen the trial (Day 7), the adjustment (Day 10), her own concrete
decision (Day 12), and the cost pressure becoming visible (Day 13) -- this line now lands as the
one thing tying all of that together, not a fresh, unmotivated reveal.
WHY THIS MATTERS NOW: raises stakes ahead of her eventual reveal, now grounded in real, externally
observable evidence rather than a single line of dialogue asked to carry the whole thread alone.
PLAYER INTERVENTION: ask "juggling how?", or let it pass. IF ACTS: creates `noticed_hina_money_
pressure` (note: `hina_money_pressure` itself is already true regardless, per the ledger -- this
choice only creates PLAYER_KNOWLEDGE/evidence, never the underlying fact). IF NOT: the comment goes
unremarked. WHEN RETURNS: feeds the reveal gate.
FREE TALK: open.
OPTIONAL ROAMING AFTER: **a brief stop at Daisuke's is available** -- if Day 8 already happened,
this can create `returned_to_daisuke_after_deflection` (count now potentially 2, satisfying his
threshold if Day 12's roaming also happened).
VISIBLE CONSEQUENCE: a small, real vulnerability, easy to miss.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: none new (deepens Day 1). CALLBACK_FROM: Days 1, 7, 10,
12, 13. PLAYER_CAN_CHANGE: whether the evidence exists. PLAYER_CANNOT_CHANGE: `hina_money_pressure`
itself (already true, not created by this scene). FREE_TALK_CAN_AFFECT: directly creates the
evidence. OPEN_QUESTION_AT_DAY_END: "what does she actually need, beyond just getting through the
festival?"

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

`[PHASE_24.2 ADDITION -- B-PLOT, ALWAYS RENDERED]`: on the way to or from the café, the newly-
posted festival guidance sign is visible. Hina, passing by, mutters that a newcomer could easily
misread which way the stalls actually run. Fumiko, nearby, insists it's clear enough as it is. This
WORLD_EVENT (`guidance_disagreement_surfaced = true`) renders every playthrough, regardless of
whether the player engages the main scene at all. PLAYER INTERVENTION (optional, does not compete
with the café scene): back Hina up to Fumiko directly, or let it pass. IF ACTS: creates
`told_fumiko_about_signage_concern`, `player_knows_guidance_disagreement = true`. IF NOT: the
disagreement stands, unresolved, visible to anyone paying attention. WHEN RETURNS: Day 19's revision
manner.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: none new (Miyoko); the guidance-sign disagreement
(B-plot). CALLBACK_FROM: Day 11. PLAYER_CAN_CHANGE: whether the Miyoko evidence exists; whether
Fumiko hears the concern early. PLAYER_CANNOT_CHANGE: today's Miyoko non-resolution (fixed); whether
the disagreement itself exists (always true). FREE_TALK_CAN_AFFECT: directly creates the Miyoko
evidence; can also create the signage evidence if raised.

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

`[PHASE_24.2 ADDITION -- B-PLOT, ALWAYS RENDERED]`: regardless of anything above, a delivery
courier scouting the festival route follows the sign exactly as posted and ends up at the wrong end
of the street -- visibly confused, a little annoyed, asking the nearest person for directions. This
WORLD_EVENT (`visitor_confusion_happened = true`) happens this same day every playthrough,
independent of the player. PLAYER INTERVENTION (optional): help redirect them, or let someone else
sort it out. IF ACTS: creates `helped_confused_visitor`, `player_witnessed_visitor_confusion =
true`. IF NOT: the courier finds their way eventually anyway, a little worse for the detour, and
word of the mix-up reaches Fumiko regardless. WHEN RETURNS: colors Day 18's ambient fallout and Day
19's revision manner.

CAUSALITY_LEVEL: HIGH (raised from MEDIUM -- the B-plot's own visible event). OPEN_THREAD_CREATED:
the Yohei promise; the visitor-confusion fallout. CALLBACK_FROM: Day 16 (the disagreement). PLAYER_
CAN_CHANGE: whether the promise exists; whether the player is the one who helps the visitor.
PLAYER_CANNOT_CHANGE: whether the confusion happens at all (always true). FREE_TALK_CAN_AFFECT:
cannot itself create the Yohei promise (structural-only); can create the visitor-help evidence.

### Day 18
MAIN SCENE: two promises, both due "soon," land the same afternoon -- ONLY if both
`Promise(fumiko, help_soon)` and `Promise(yohei, help_soon)` actually exist; otherwise this is an
ordinary day for the promise-collision specifically (a real structural difference from a version
that fires on loose warmth alone).
WHY THIS MATTERS NOW: the game now visibly tracks the player's own stated commitments.
PLAYER INTERVENTION: keep one and explain to the other, or a smaller gesture to both. IF ACTS
(either specific choice): a real, differentiated, NPC-remembered outcome. WHEN RETURNS: whichever
promise's disposition is set is referenced again within the following week (never silently
forgotten).
FREE TALK: useful for the "explain" branch.
OPTIONAL ROAMING AFTER: none additional from the promise-collision itself.
VISIBLE CONSEQUENCE: a real, differentiated outcome, not a generic "you handled it."

`[PHASE_24.2 ADDITION -- B-PLOT, ALWAYS RENDERED, THE FIX FOR THIS DAY'S FORMER "EMPTY IF NO
PROMISE EXISTS" GAP]`: **regardless of whether the promise-collision fires at all**, Day 18 also
always renders the guidance-sign fallout: word of yesterday's confused courier has reached Fumiko,
and she's visibly rattled by it -- defensive if `fumiko_accepted_feedback_early` is false, already
turning it over more calmly if it's true. Hina, for her part, reads as quietly vindicated but
privately a little dismissed unless `reassured_hina_about_signage` already happened. This is a real
NPC-NPC reaction (Fumiko and Hina's own dynamic, moving independent of the player, per Section 13's
established graph) with a genuine tomorrow hook ("she says she'll think about the sign again").
PLAYER INTERVENTION (optional, available even if the promise-collision above never fired, which is
exactly what keeps this day from ever being empty): reassure Hina now if she seems dismissed. IF
ACTS: creates `reassured_hina_about_signage`. WHEN RETURNS: Day 19.

CAUSALITY_LEVEL: HIGH (when the promise-collision fires) / MEDIUM otherwise, **never QUIET, because
the B-plot's own NPC-NPC reaction and tomorrow hook are now guaranteed regardless** -- the specific,
disclosed fix for this day's previous capacity to go empty for a player with no promises. OPEN_
THREAD_CREATED: whichever promise is deferred, if any; the sign's now-visible fallout. CALLBACK_
FROM: Days 15/17 (promises); Day 17 (the confusion). PLAYER_CAN_CHANGE: which promise gets kept, if
any; whether Hina is reassured today. PLAYER_CANNOT_CHANGE: that a promise choice must be made once
both genuinely exist; that Fumiko reacts to the confusion at all. FREE_TALK_CAN_AFFECT: shapes the
promise explanation; can create the Hina-reassurance evidence.

---

## Movement 4 (Days 19-24) — the festival

### Day 19
MAIN SCENE: the Hall, visibly a mess of papers -- Fumiko brisker than usual, stretched thin. Per
OWNER-05's pattern, a checklist can be fully "done" while something human is still missing -- she
catches herself relying on the flyer alone and decides to personally invite people instead.
**Woven directly into this same scene, `[PHASE_24.2 ADDITION]`**: the guidance sign gets revised
today, `guidance_sign_revised = true`, **unconditionally** -- reality (yesterday's confused
courier) made the case argument alone hadn't. This is the human core's actual point (OWNER-01/04/07):
the fix comes from what was observed, not from anyone winning a debate. `fumiko_revision_manner`
(`"calm"` if `fumiko_accepted_feedback_early` or any signage evidence exists by now, `"defensive"`
otherwise) colors HOW she talks about it while she redraws it, never WHETHER she does.
WHY THIS MATTERS NOW: directly determines how prepared Day 24 actually is; closes the B-plot with
the sign visibly, checkably different by the festival.
PLAYER INTERVENTION: offer to help with the festival prep generally, or help specifically with the
sign's actual redraw, or leave her to it. IF ACTS (general prep): creates `helped_fumiko_festival_
prep`, `festival_prep_progress += 1`. IF ACTS (the sign specifically): also creates `player_
remembered_as_helpful_signage` if not already true. IF NOT: she manages both anyway, more tired,
and the sign still gets fixed regardless. WHEN RETURNS: read into Day 24 (the sign's own text is
now part of that scene's visible detail), and one of the two inputs to the Day-29-adjacent
write-back rule (Fix C).
FREE TALK: open.
OPTIONAL ROAMING AFTER: **a brief stop at Daisuke's is available** (a further return-after-
deflection opportunity, per Fix A).
VISIBLE CONSEQUENCE: a specific, small task actually completed; the sign itself, visibly corrected.

CAUSALITY_LEVEL: HIGH. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: Day 3; Days 16/17/18 (the
B-plot's own payoff day). PLAYER_CAN_CHANGE: `festival_prep_progress`; whether the write-back
rule's second input exists; `fumiko_revision_manner`'s exact texture. PLAYER_CANNOT_CHANGE: that
the festival happens at all; **that the sign gets revised at all (fixed, guaranteed by the
observed event, not by player persuasion)**. FREE_TALK_CAN_AFFECT: can create the prep evidence;
cannot prevent or skip the revision itself.

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

### Day 25 `[PHASE_24.4 ADDITION -- ALWAYS RENDERED: festival_aftermath_visible]`
MAIN SCENE: the morning after, concrete and specific, not just "sleepy town": half the decorations
already down, the other half still strung up because nobody's gotten to them; leftover festival
stock stacked outside Yohei's store (an exact, visible quantity, read from `yohei_festival_stock` --
a lot left over if it was minimal, almost nothing left if it sold well); full trash bags at the
corners waiting for collection; residents moving slower than usual, worn out rather than glowing.
Hina is at her counter actually going through what sold and what didn't -- not vague satisfaction,
specific items, specific numbers. The bench (`bench_fixed` -- true or false) is simply in ordinary
use again, exactly as it was left. **None of this depends on where the player spent Day 24's two
slots or whether the player does anything today** -- it is the same aftermath either way, only the
exact numbers differ by prior state.
WHY THIS MATTERS NOW: emotional recovery after a major scene (Section 5's explicit allowance) --
but now with a concrete world underneath the mood, not mood alone.
PLAYER INTERVENTION: check in on someone specific, help with the cleanup, or rest. IF ACTS: a warm
exchange referencing yesterday specifically, or a hand with the actual physical cleanup. IF NOT
(rests instead): the cleanup happens anyway, described from a distance -- the world does not wait
for the player to help. WHEN RETURNS: tone only; the aftermath facts themselves are fixed by Day 24.
FREE TALK: open, warm, reflective.
OPTIONAL ROAMING AFTER: none additional.
VISIBLE CONSEQUENCE: `festival_aftermath_visible` = true, always, with concrete state-derived detail.
OPEN_QUESTION_AT_DAY_END: "What will actually remain, now that the festival itself is gone?" --
grounded directly in the leftover stock and the half-cleared street, not manufactured.

CAUSALITY_LEVEL: QUIET (tone) with one always-true WORLD fact underneath. OPEN_THREAD_CREATED: "what
remains after the festival." CALLBACK_FROM: Day 24. PLAYER_CAN_CHANGE: tone, and whether cleanup is
witnessed firsthand or from a distance. PLAYER_CANNOT_CHANGE: yesterday's outcome, or that the
aftermath itself renders. FREE_TALK_CAN_AFFECT: tone only.

### Day 26 `[FIXED -- Fix D, and Section 3B's independent-event rule]` `[PHASE_24.4 ADDITION -- ALWAYS RENDERED: hina_post_festival_decision]`
MAIN SCENE: two independent things, in the same scene but never conflated. (1) Yohei's store,
unusually quiet -- the exact gesture from Day 13, recurring with different meaning.
`yohei_son_call_happened` is TRUE by now regardless of anything the player did (it resolved
automatically around Day 20, independent world progress). (2) **Separately, unconditionally**: Hina
has made one practical, concrete post-festival decision, read directly from her established trial
outcome, never invented fresh -- if `hina_adjustment_timing == "early_calm"`, she sets a specific
next test date; otherwise, she keeps the reduced range she settled on and consolidates rather than
expanding. This is a WORLD FACT: it is true, and visible in the shop's actual physical state (new
sign text, or the same narrowed range still in place), whether or not the player ever asks about it.
WHY THIS MATTERS NOW: whether the player actually LEARNS about the Yohei thread is what's still
undecided; whether Hina's shop changed is not a question at all -- it simply has.
PLAYER INTERVENTION: notice and ask Yohei gently, or be present without asking; separately, notice
Hina's shop and optionally ask why. IF Yohei gate met (`noticed_yohei_son_thread` AND
`COUNT(yohei_relationship_evidence MINUS {noticed_yohei_son_thread}) >= 1`): hears that they talked.
IF Yohei gate not met: the fact stays true in world-state but isn't shared with the player this
scene (a real KNOWLEDGE-vs-FACT gap, not an error). Independently, IF the player asks Hina why
(`player_knows_why_hina_decided`): hears the practical reasoning (PLAYER_KNOWLEDGE); IF the player
has real accumulated Hina evidence on top of that (`hina_shares_deeper_reason`, a PRIVATE_TRUST
gate, same discipline as her Day 22 reveal): hears the fuller, more personal reason underneath.
Asking nothing at all still leaves `hina_post_festival_decision` visibly true. WHEN RETURNS: colors
Day 30 either way, on both threads independently.
FREE TALK: open, the Yohei payoff scene if that gate is met; separately, Hina's decision is
discussable at any depth the evidence supports.
OPTIONAL ROAMING AFTER: none additional.
VISIBLE CONSEQUENCE: quiet, real, deliberately unresolved beyond "they talked," if learned at all
(Yohei thread); a concrete, always-visible shop-state change (Hina thread), regardless of engagement.

CAUSALITY_LEVEL: HIGH (when learned) / MEDIUM otherwise for the Yohei thread; the Hina thread is
always WORLD_PROGRESS_VISIBLE regardless of engagement. OPEN_THREAD_CREATED: "will Hina's next step
go anywhere" (if a next test date was set). CALLBACK_FROM: Day 13 (Yohei); the Days 1-14 trial arc
(Hina). PLAYER_CAN_CHANGE: whether the player LEARNS about the Yohei call this scene; how much of
Hina's reasoning the player hears. PLAYER_CANNOT_CHANGE: whether the call itself happened, or
whether Hina's shop decision itself occurred -- both **fixed, independent, resolved before today
regardless**. FREE_TALK_CAN_AFFECT: whether the player learns either piece of news, never the
underlying events.

### Day 27 `[PHASE_24.4 ADDITION -- ALWAYS RENDERED: town_returns_to_normal]`
MAIN SCENE: Daisuke's chair, a slower afternoon. IF gate met (`returned_to_daisuke_after_deflection
>= 2`, now genuinely achievable via the explicit roaming touchpoints on Days 6/12/14/19/23, not just
hoping the player happens to revisit): the card, finally. ELSE: an ordinary, comfortable afternoon.
**Independently, unconditionally, visible in the background of this same day**: Jin is out taking
down the last of the festival's temporary signage and returning the borrowed hand-cart to ordinary
delivery duty -- the plainest possible sign the event is genuinely over and the street has gone back
to being a street, not a stage. This requires no player involvement to occur or to be narrated; it
is simply what the town is doing today.
WHY THIS MATTERS NOW: the corrected version of V1's original failure for Daisuke's own thread --
persistence after being turned away, not raw talk volume, now with genuine, authored opportunities
to build that persistence across the month (Fix A resolved). The Jin beat exists for an unrelated
reason: to let the player see the town continuing past the festival even with zero engagement today.
PLAYER INTERVENTION: listen, patiently, to Daisuke. IF gate met: hears about the unanswered New
Year's card. Separately, the player may notice or ignore Jin's ordinary work outside -- either way,
it happens. WHEN RETURNS: colors Day 30 (Daisuke thread); nothing further to track (Jin's beat is
descriptive, not gated).
FREE TALK: the deep-talk day for the Daisuke thread.
OPTIONAL ROAMING AFTER: none additional.
VISIBLE CONSEQUENCE: a quiet parallel to Yohei's own arc, never stated as parallel in-fiction
(Daisuke thread); `town_returns_to_normal` = true, always (Jin/signage thread).

CAUSALITY_LEVEL: HIGH (when the Daisuke gate fires) / MEDIUM otherwise, with one always-true WORLD
fact underneath regardless of either. OPEN_THREAD_CREATED: none new. CALLBACK_FROM: Days 8, 12, 19,
23 (Daisuke, whichever roaming touchpoints actually happened); Day 24 (Jin/signage). PLAYER_CAN_
CHANGE: whether the Daisuke gate was ever met, across the whole month. PLAYER_CANNOT_CHANGE: the
friend's specific backstory (fixed, vague); whether the town keeps moving on regardless of the
player. FREE_TALK_CAN_AFFECT: the only path to the Daisuke reveal, gate is evidence-based; nothing
about the Jin beat, which is unconditional.

### Day 28 `[PHASE_24.4 ADDITION -- ALWAYS RENDERED: hina_next_test_planned]`
MAIN SCENE: the café, Miyoko mentioning she spoke to her daughter again. The authored rule (see
ledger, informed by OWNER-07) resolves `miyoko_daughter_outcome` deterministically from real
accumulated evidence -- never hardcoded to one outcome, never a live model decision. **Separately,
unconditionally**: Hina mentions, in passing, that she's already thinking about her next small test
-- a specific, concrete detail (a rough date, or an item she wants to try next), not a vague
sentiment. This is not a sentimental goodbye and not gated on relationship depth to occur at all;
what IS gated is how much detail the player hears (`player_knows_next_test_details`, on real Hina
evidence) versus just the bare fact that she's planning something next.
WHY THIS MATTERS NOW: closes (or legitimately leaves open) the slowest-moving arc of the six, with
three genuinely different possible outcomes now reachable (`stay`/`compromise`/`undecided`), fixing
V2's actual bug of only ever producing "compromise." The Hina beat exists to make plain, before the
player leaves, that the shop's story keeps going with or without them watching.
PLAYER INTERVENTION: listen to Miyoko, no correct side. IF gate conditions met (see ledger's exact
rule): hears the specific, rule-determined outcome. Separately, listen to Hina's plan, or not --
either way `hina_next_test_planned` becomes true today; asking further only changes how much detail
is heard. WHEN RETURNS: Day 30, on both threads.
FREE TALK: open.
OPTIONAL ROAMING AFTER: none additional.
VISIBLE CONSEQUENCE: real, adult, not-necessarily-triumphant closure -- one of three genuinely
different texts depending on which evidence combination actually exists (Miyoko thread);
`hina_next_test_planned` = true, always, with detail depth varying (Hina thread).

CAUSALITY_LEVEL: HIGH (when Miyoko's thread resolves) / MEDIUM otherwise, with one always-true WORLD
fact underneath (Hina's next plan) regardless of either. OPEN_THREAD_CREATED: "will Hina's next test
land better than the first" (if detail was heard). CALLBACK_FROM: Days 11, 16 (Miyoko); the Days
1-14 trial arc and Day 26 (Hina). PLAYER_CAN_CHANGE: which of Miyoko's three outcomes is reached (by
which evidence combination exists); how much of Hina's plan is heard. PLAYER_CANNOT_CHANGE: today's
Miyoko outcome once the evidence is fixed (deterministic, not swayed live); whether Hina has a plan
at all. FREE_TALK_CAN_AFFECT: whether the player hears Miyoko's outcome today; how much Hina detail
is heard.

### Day 29 `[FIXED -- Fix C, fumiko_writes_back now has a real setter]` `[PHASE_24.4 ADDITION -- ALWAYS RENDERED: departure_prep_visible, placed BEFORE the private beat]`
MAIN SCENE: three things, in this order. (1) **Unconditionally, first**: practical signs the month is
ending -- the player's own bag half-packed on the floor, the room already looking temporary again the
way it did on Day 1; someone (Yohei, in passing) casually asks when the key needs to go back; the
player notices tomorrow is the last full day on the schedule; ordinary town gossip already
references Hina's next test date from Day 28, showing the town's plans continuing past the player's
departure. None of this requires any player action to occur -- it is simply what today looks like.
(2) Then, still today, the deterministic resolution of `fumiko_writes_back`, per the rule in the
ledger (`player_knows_fumiko_letter` AND `helped_fumiko_festival_prep` -> `true`;
`player_knows_fumiko_letter` alone -> `undecided`; neither -> stays `unset`). (3) Finally, the
entirely private, unwitnessed opportunity for a kindness with no guaranteed payoff (unchanged concept
from V2, most naturally offered to Jin if his arrangement was declined or never reached, or to
whichever NPC has been least thanked this playthrough) -- both explicitly disclosed exceptions to
the usual causality rule (Section 4's own carve-out, stated plainly, not hidden) apply only to this
third beat, never to the first.
WHY THIS MATTERS NOW: removes the structure where an entire day could pass with nothing observable
at all; tests whether the player's values hold up with no audience once something real (the
departure, the letter) has already been established as happening today; closes a previously-dead
variable with a real, evidence-grounded outcome.
PLAYER INTERVENTION: on the departure-prep beat, the player may pack, ask about the key, or ignore it
-- the facts render regardless. Do the kind thing anyway, or don't (no visible state change either
way, by design, for the kindness specifically). The Fumiko write-back resolution requires no live
player choice today -- it is read from Days 15/19's accumulated evidence.
FREE TALK: optional, low stakes.
OPTIONAL ROAMING AFTER: none additional.
VISIBLE CONSEQUENCE: `departure_prep_visible` = true, always, concrete and practical, not
melodramatic; a real, specific outcome for Fumiko's letter thread, no longer an orphaned variable;
private, understated for the kindness.

CAUSALITY_LEVEL: one always-true WORLD beat (departure prep) plus one MEDIUM-weight resolved read
(the letter) plus QUIET (kindness, by explicit design). OPEN_THREAD_CREATED: "what does tomorrow, the
last day, actually look like." CALLBACK_FROM: Day 1 (departure prep, by contrast); Days 15, 19
(letter); none (kindness). PLAYER_CAN_CHANGE: nothing observable for the kindness; nothing live
today for the letter (already determined by prior days); how the departure-prep beat is witnessed,
not whether it happens. PLAYER_CANNOT_CHANGE: symmetric, by design, for the kindness; that the month
is visibly ending regardless of player choice. FREE_TALK_CAN_AFFECT: nothing durable.

### Day 30 — retrospective, not "the end"
MAIN SCENE: the room upstairs, considerably less temporary-looking than Day 1 was, though it looked
temporary again as of yesterday's packing. Nothing new happens -- explicitly not a crisis day.
WHY THIS MATTERS NOW: the only day whose entire content is a read-back of everything else -- and, per
PHASE_24.4, the one day required to state explicitly what the endgame arc has been building toward:
the player mattered, but the player was never the center of the universe.
PLAYER INTERVENTION: an optional, skippable reflection (reusing `PHASE_12_8`'s existing register),
now explicitly structured around three questions rather than one undifferentiated summary: WHAT I
CHANGED (evidence-gated outcomes the player's own actions actually produced -- e.g. whether Hina's
true reason or Yohei's call or Daisuke's card or Miyoko's outcome or Fumiko's letter were ever
learned, and any promises kept); WHAT CHANGED WITHOUT ME (the Layer-A world facts that were always
going to be true regardless -- the shop opened or didn't per its own trial arc, the festival
happened, Hina made her post-festival decision, the town cleaned up and moved on, Jin took the
signage down); WHAT WILL CONTINUE AFTER I LEAVE (Hina's next test date, whatever plans the six NPCs
each have for after Day 30, read from Day 28's future-facing beat and the ledger's per-NPC state,
never invented fresh). IF ACTS: stored verbatim, never scored. IF NOT: equally valid; the three-part
contrast still renders as narration even if the player writes nothing.
FREE TALK: the reflection itself, freeform.
OPTIONAL ROAMING AFTER: none -- nothing left to roam to that changes anything.
VISIBLE CONSEQUENCE: a genuinely different summary per playthrough, assembled from
`hina_shop_readiness`, `player_knows_hina_true_reason`, `hina_post_festival_decision`,
`hina_next_test_planned`, `player_knows_yohei_son_call`, `daisuke_renovation_decided` +
`player_witnessed_daisuke_decision`, `daisuke_card_known`, `jin_arrangement`, `miyoko_daughter_
outcome`, `bench_fixed`, `fumiko_writes_back` -- read, never re-decided, with WORLD_PROGRESS and
PLAYER_KNOWLEDGE now correctly reported as separate facts (e.g. "the shop opened" is reported
independently of "and you knew why she'd been scared it wouldn't"), and now explicitly sorted into
the WHAT I CHANGED / WHAT CHANGED WITHOUT ME / WHAT WILL CONTINUE columns above.

CAUSALITY_LEVEL: MEDIUM. OPEN_THREAD_CREATED: none (the month is over; the point is that the town's
own threads continue past this line, not that a new one opens for the player). CALLBACK_FROM: every
gated thread, plus Days 25-29's Layer-A world facts. PLAYER_CAN_CHANGE: whether a reflection is
written. PLAYER_CANNOT_CHANGE: the substance of what actually happened, or that the world's own
threads (Hina's next test, the other five NPCs' own plans) continue regardless of the player's
presence. FREE_TALK_CAN_AFFECT: only the optional reflection text.

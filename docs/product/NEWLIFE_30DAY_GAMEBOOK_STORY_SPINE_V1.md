# NEW LIFE 30-Day Gamebook — Story Spine V1 (Phase C)

State-driven throughout, exactly like the existing (kept, unmodified) `NEWLIFE_DAY1_TO_DAY7_ARC_V1.md`
-- these are *design intent* beats reusing the episode bank (Phase A) and character arcs (Phase B),
not a fixed linear script. A player who ignores a beat gets a different, still-coherent day, never a
broken one. Episode references (`E##`) point into `NEWLIFE_30DAY_GAMEBOOK_EPISODE_BANK_V1.md`.

Organized into 5 six-day movements for readability; nothing about the movement boundaries is a hard
mechanical gate -- they are pacing intent, not enforced acts.

Field key per day: OPENING SCENE / DRAMATIC QUESTION / ACTIVE CHARACTERS / VISIBLE PROBLEM-EVENT /
PLAYER INTERVENTION / FREE-TALK WINDOW / CANON LIMIT (what AI free-talk may never decide that day,
only system-owned state may) / STATE DELTA / MERGE POINT / FUTURE CALLBACK / CLIFFHANGER-CLOSURE.

---

## Movement 1 (Days 1-6): Arrival & First Threads

### Day 1
OPENING SCENE: temporary room, half-unpacked, first morning in town. DRAMATIC QUESTION: who is worth
seeing again? ACTIVE CHARACTERS: Hina, Yohei (either/both, player's 2-action choice). VISIBLE
PROBLEM-EVENT: none forced -- Hina visibly mid-setup; Yohei ordinary open-for-business. PLAYER
INTERVENTION: choose which 2 of 6 possible actions to spend (may include re-visiting one NPC twice).
FREE-TALK WINDOW: open after any structural action, low stakes. CANON LIMIT: AI may not invent new
NPCs, locations, or facts about the town's history. STATE DELTA: `everVisited` grows; first
`npcMemory` entries created. MERGE POINT: none yet. FUTURE CALLBACK: whichever NPC is met first seeds
Day 2's "town moved without you" check. CLIFFHANGER-CLOSURE: quiet -- "tomorrow is a new, different
day," not narrated as a rule, just true.

### Day 2
OPENING SCENE: same room, one day later. DRAMATIC QUESTION: did the town keep existing while I was
elsewhere? ACTIVE CHARACTERS: whichever of the 6 the player skipped Day 1. VISIBLE PROBLEM-EVENT: a
concrete, visible change at the skipped location (E09 spoiled-stock-style beat, or an equivalent
small event, chosen by which location was actually skipped). PLAYER INTERVENTION: structural + free
talk as normal. FREE-TALK WINDOW: open. CANON LIMIT: the specific nature of the overnight change is
system-authored, never invented by AI dialogue on the spot. STATE DELTA: a `WorldFact` recording the
overnight change. MERGE POINT: none. FUTURE CALLBACK: sets the tone for how "lived-in" the town feels
going forward. CLIFFHANGER-CLOSURE: mild curiosity about what else happens unseen.

### Day 3
OPENING SCENE: ordinary morning. DRAMATIC QUESTION: is there something here worth following? ACTIVE
CHARACTERS: Fumiko (noticeboard). VISIBLE PROBLEM-EVENT: E37, the mystery flyer appears. PLAYER
INTERVENTION: ask Fumiko about it, or ignore it entirely (explicitly ignorable, non-blocking). FREE-
TALK WINDOW: open, this is a natural curiosity hook for one. CANON LIMIT: AI may voice Fumiko's brisk
manner but may not reveal the full festival plan before the system is ready to (a `knownFacts` gate).
STATE DELTA: `WorldFact: festival_flyer_seen` if noticed. MERGE POINT: seeds Day 19-24's festival
movement. FUTURE CALLBACK: Day 19 (E41) and Day 24 (E48). CLIFFHANGER-CLOSURE: "something's being
planned" -- open curiosity, not urgency.

### Day 4
OPENING SCENE: continuation of whichever thread the player is following. DRAMATIC QUESTION: did my
choice from the last 3 days actually matter? ACTIVE CHARACTERS: whichever NPC the player helped or
declined earlier. VISIBLE PROBLEM-EVENT: E06 (Hina misreads Yohei) surfaces if the player has met
both; otherwise E24 (Jin fixes something unasked, observed in passing). PLAYER INTERVENTION: relay
information between NPCs, or let it resolve on its own in the background. FREE-TALK WINDOW: open.
CANON LIMIT: cross-NPC relationship changes are always system-applied `RelationshipDelta`s, never an
AI character unilaterally declaring "we're friends now" in dialogue. STATE DELTA:
`RelationshipDelta(yohei, hina, +small)` if connected. MERGE POINT: Yohei-Hina thread (Phase B).
FUTURE CALLBACK: E12 (Yohei's quiet approval) becomes eligible from here on. CLIFFHANGER-CLOSURE: a
small, specific proof that the world responds to the player, without being told so outright.

### Day 5
OPENING SCENE: Jin at work somewhere in town. DRAMATIC QUESTION: is this the start of something
steadier? ACTIVE CHARACTERS: Jin. VISIBLE PROBLEM-EVENT: E27, the standing-arrangement offer --
gated on the player having engaged Jin at least twice already (reuses existing `minDayForHelp`-style
eligibility). PLAYER INTERVENTION: accept, decline, or the offer simply doesn't surface yet if not
eligible (a fully valid, ordinary Day 5). FREE-TALK WINDOW: open, but the offer itself is a
structural choice, never inferred from free text alone. CANON LIMIT: acceptance/decline is a real UI-
level choice, never something AI free-talk can silently decide either way. STATE DELTA:
`TrajectoryState(jin, accepted|declined|not_offered)`. MERGE POINT: gates Day 21/26-tier late Jin
content. FUTURE CALLBACK: E28 (unvoiced worry) softens later only if accepted. CLIFFHANGER-CLOSURE:
if accepted, a quiet sense of something real starting; if declined or not offered, an equally valid,
unremarkable ordinary day.

### Day 6
OPENING SCENE: any of the 6 locations. DRAMATIC QUESTION: is this one town, or six separate rooms?
ACTIVE CHARACTERS: two NPCs whose own relationship is independent of the player (E14 Yohei/Daisuke,
E26 Jin/Yohei, or E07 Hina/Daisuke, whichever pairing the player is positioned to observe). VISIBLE
PROBLEM-EVENT: a small, witnessed cross-NPC moment. PLAYER INTERVENTION: witness only, or participate
lightly. FREE-TALK WINDOW: open. CANON LIMIT: NPC-NPC content plays out per its own established
canon regardless of player presence -- AI dialogue may reference it happening, never invent a
different version of it. STATE DELTA: none required, or a light `knownFacts` addition ("player saw
X and Y together"). MERGE POINT: reinforces Phase B's independent relationship graph. FUTURE
CALLBACK: low-stakes texture, reusable pattern for later movements. CLIFFHANGER-CLOSURE: "this town
is bigger than just what I do in it" -- a felt realization, never stated as text.

---

## Movement 2 (Days 7-12): Ordinary Life Deepens

### Day 7
OPENING SCENE: Daisuke's chair, a demanding customer already mid-complaint. DRAMATIC QUESTION: can
professionalism survive an absurd request? ACTIVE CHARACTERS: Daisuke. VISIBLE PROBLEM-EVENT: E21,
comic relief day. PLAYER INTERVENTION: witness/comment only, no real stakes. FREE-TALK WINDOW: open,
low stakes. CANON LIMIT: the comedy is system-authored beat-by-beat; AI free-talk may riff on it in
tone but not invent a different outcome for the customer. STATE DELTA: none. MERGE POINT: none --
deliberately a standalone breather day, closing movement 1's tension. FUTURE CALLBACK: none. 
CLIFFHANGER-CLOSURE: a laugh, nothing more required.

### Day 8
OPENING SCENE: Daisuke's chair, ordinary conversation. DRAMATIC QUESTION: can he be drawn out, even a
little? ACTIVE CHARACTERS: Daisuke. VISIBLE PROBLEM-EVENT: E19, deflection when asked something
personal. PLAYER INTERVENTION: push once (gets deflection again, not a reward-gated answer) or drop
it. FREE-TALK WINDOW: open, this IS the deep-talk moment. CANON LIMIT: repeated gentle attempts
across many days are what eventually unlock E20 -- no single clever free-talk phrasing should
shortcut it; AI may not "decide" the relationship has reached that threshold, only the system's
accumulated-turns counter can. STATE DELTA: `familiarity(daisuke) += 1`. MERGE POINT: gatekeeper for
Day 27 (E20). FUTURE CALLBACK: Day 27. CLIFFHANGER-CLOSURE: mild, pleasant unresolved curiosity about
him.

### Day 9
OPENING SCENE: Yohei's store, a crate set aside. DRAMATIC QUESTION: how does he handle a real, small
loss? ACTIVE CHARACTERS: Yohei. VISIBLE PROBLEM-EVENT: E09, spoiled stock. PLAYER INTERVENTION: help
sort/salvage, or just keep him company. FREE-TALK WINDOW: open. CANON LIMIT: the amount of loss/what
can be salvaged is a fixed system fact, never invented differently by AI dialogue on request. STATE
DELTA: none required (pure texture) or a minor `boughtItems`-style consequence if the player buys
salvaged goods cheap. MERGE POINT: none. FUTURE CALLBACK: reinforces Yohei's business-pressure
texture ahead of Day 20's festival-budget beat. CLIFFHANGER-CLOSURE: an ordinary, slightly weary
"that's business" shrug.

### Day 10
OPENING SCENE: the community hall, an old bench in the corner. DRAMATIC QUESTION: why won't she just
replace it? ACTIVE CHARACTERS: Fumiko. VISIBLE PROBLEM-EVENT: E39, the wobbly bench, introduced.
PLAYER INTERVENTION: ask about it, suggest Jin, or leave it. FREE-TALK WINDOW: open. CANON LIMIT: the
bench's real backstory (E40) is locked behind a later canon gate -- AI may show Fumiko deflecting,
may not reveal the former-student connection early. STATE DELTA: `WorldFact: bench_noted`. MERGE
POINT: connects to Jin if the player suggests him. FUTURE CALLBACK: Day 15 (E40), Day 21 (Jin's
setup-work day can include fixing it if connected here). CLIFFHANGER-CLOSURE: quiet, slightly
mysterious attachment to an object that shouldn't matter this much.

### Day 11
OPENING SCENE: the café, a new bag of beans on the counter. DRAMATIC QUESTION: will it land? ACTIVE
CHARACTERS: Miyoko. VISIBLE PROBLEM-EVENT: E33, new-beans debut -- a small success/good-news day.
PLAYER INTERVENTION: honest reaction, no correct answer scored. FREE-TALK WINDOW: open, low stakes.
CANON LIMIT: this is the direct payoff of an already-existing canon hook -- AI may not retroactively
change what the "new beans" callback was about. STATE DELTA: `WorldFact: new_beans_reaction`. MERGE
POINT: none. FUTURE CALLBACK: colors how Day 16/28's daughter-thread beats land emotionally (a
confident Miyoko vs. an anxious one). CLIFFHANGER-CLOSURE: a genuinely warm, uncomplicated good day.

### Day 12
OPENING SCENE: Daisuke's shop, mentioned almost offhand. DRAMATIC QUESTION: does he finally decide?
ACTIVE CHARACTERS: Daisuke. VISIBLE PROBLEM-EVENT: E23, the renovation decision -- resolves E17's
throughline, either way, state-driven on accumulated `familiarity(daisuke)`. PLAYER INTERVENTION:
none required -- this can resolve entirely in the background if under-engaged, or be witnessed
directly if the player has been present. FREE-TALK WINDOW: open, can process the decision either way.
CANON LIMIT: yes/no is decided by accumulated state, never by a single free-talk phrase "convincing"
him one way. STATE DELTA: `WorldFact: renovation_decided(yes|no)`. MERGE POINT: closes Daisuke's
primary practical arc (deliberately mid-game, not Day 30). FUTURE CALLBACK: colors Daisuke's
general mood texture for the rest of the month. CLIFFHANGER-CLOSURE: release of a months-long
tension, undramatic in the telling -- exactly the design intent.

---

## Movement 3 (Days 13-18): Pressure Rises

### Day 13
OPENING SCENE: Yohei's store, a phone glanced at and put away. DRAMATIC QUESTION: what is he not
saying? ACTIVE CHARACTERS: Yohei. VISIBLE PROBLEM-EVENT: E10, the unanswered message becomes
noticeable (not yet discussable unless deep-talk is used). PLAYER INTERVENTION: notice and gently ask
(deep-talk only), or let it pass entirely -- fully valid either way. FREE-TALK WINDOW: this is the
first real deep-talk opportunity for this thread. CANON LIMIT: AI may voice Yohei's discomfort and
deflection but may never invent the son's name, message content, or backstory beyond what's already
canon (unresolved estrangement, no further specifics). STATE DELTA:
`CharacterFact(yohei, son_thread_noticed)` if engaged. MERGE POINT: gates Day 26 (E16). FUTURE
CALLBACK: Day 26. CLIFFHANGER-CLOSURE: a real, held-back sadness under an ordinary shopkeeper's
day.

### Day 14
OPENING SCENE: Hina's shop-in-progress, a comment about "juggling a few things." DRAMATIC QUESTION:
juggling what, exactly? ACTIVE CHARACTERS: Hina. VISIBLE PROBLEM-EVENT: E01, the rent envelope.
PLAYER INTERVENTION: ask "juggling how?" or let the comment pass. FREE-TALK WINDOW: open, a smaller-
stakes precursor to the bigger E03 reveal. CANON LIMIT: the exact financial numbers, if any are ever
stated, are system-fixed, never invented ad hoc by AI dialogue. STATE DELTA:
`CharacterFact(hina, money_pressure_noticed)` if engaged. MERGE POINT: raises stakes ahead of Day 22
(E03). FUTURE CALLBACK: Day 22. CLIFFHANGER-CLOSURE: a small crack in her confident front, easy to
miss if not paying attention.

### Day 15
OPENING SCENE: the community hall, a letter on the desk. DRAMATIC QUESTION: who is it from, and why
now? ACTIVE CHARACTERS: Fumiko. VISIBLE PROBLEM-EVENT: E40, the former student's letter arrives.
PLAYER INTERVENTION: ask about it (deep-talk), or simply notice she seems distracted. FREE-TALK
WINDOW: open, this is her private-fact reveal moment if pursued. CANON LIMIT: the letter's exact
contents beyond "mentions the bench" are system-authored if ever shown, never freely invented. STATE
DELTA: `CharacterFact(fumiko, student_letter_received)`. MERGE POINT: pairs with Day 10's E39 if both
were touched, for a stronger combined payoff. FUTURE CALLBACK: Day 29-30 tier (whether she writes
back). CLIFFHANGER-CLOSURE: old regret surfacing gently, not dramatically.

### Day 16
OPENING SCENE: the café, a little quieter than usual. DRAMATIC QUESTION: what is she deciding, and
when? ACTIVE CHARACTERS: Miyoko. VISIBLE PROBLEM-EVENT: E31, the daughter's call, now explicit rather
than implied. PLAYER INTERVENTION: listen, offer an opinion, or just be present -- no "correct" side.
FREE-TALK WINDOW: open, can go as deep as the player wants. CANON LIMIT: her eventual decision is
never made in this scene -- AI dialogue may express her uncertainty but not resolve it early. STATE
DELTA: `CharacterFact(miyoko, daughter_pressure_active)`. MERGE POINT: builds toward Day 28 (E36).
FUTURE CALLBACK: Day 28, colored by whether Day 11 (E33) and Day 34-tier E34 were touched. 
CLIFFHANGER-CLOSURE: real, unresolved worry sitting under her usual warmth.

### Day 17
OPENING SCENE: Hina's shop, a regular customer offering opinions unasked. DRAMATIC QUESTION: can she
hear the useful part under the delivery? ACTIVE CHARACTERS: Hina. VISIBLE PROBLEM-EVENT: E04,
unsolicited advice. PLAYER INTERVENTION: help her hear the useful part, or just commiserate. FREE-
TALK WINDOW: open, low-medium stakes. CANON LIMIT: none unusual -- a texture day. STATE DELTA: none
required. MERGE POINT: none. FUTURE CALLBACK: low. CLIFFHANGER-CLOSURE: a small, human moment of
pride bruised and soothed.

### Day 18
OPENING SCENE: two separate conversations from earlier days turn out to conflict. DRAMATIC QUESTION:
who gets the player's time, and how does the other one take it? ACTIVE CHARACTERS: whichever two NPCs
the player's own earlier phrasing left ambiguous (system determines this from actual play history,
e.g. Yohei + Fumiko as a default pairing per E43). VISIBLE PROBLEM-EVENT: E43, double-booked favor.
PLAYER INTERVENTION: choose who to help, explain to the other, or find a third option -- no wrong
choice. FREE-TALK WINDOW: open, useful for the "explain" branch. CANON LIMIT: this misunderstanding
is generated from real prior state (what the player actually said/did), never fabricated
independently of play history. STATE DELTA: `RelationshipDelta` (small, either direction, based on
resolution). MERGE POINT: a light callback-generator for whichever NPC wasn't chosen. FUTURE
CALLBACK: low-medium. CLIFFHANGER-CLOSURE: a real, low-stakes consequence of the player's own
established pattern of behavior -- proof the game is tracking them, not scripting them.

---

## Movement 4 (Days 19-24): The Festival

### Day 19
OPENING SCENE: the hall, busier than usual, papers everywhere. DRAMATIC QUESTION: can Fumiko actually
pull this off? ACTIVE CHARACTERS: Fumiko. VISIBLE PROBLEM-EVENT: E41, organizing, brisk and
overwhelmed. PLAYER INTERVENTION: offer to help with something concrete, or leave her to it (both
valid; helping affects Day 24's state). FREE-TALK WINDOW: open. CANON LIMIT: exactly what "helping"
accomplishes is a fixed, small, system-defined task list, never an open-ended AI-negotiated scope.
STATE DELTA: `WorldFact: festival_prep_progress += 1` if helped. MERGE POINT: direct festival-prep
contribution. FUTURE CALLBACK: Day 24. CLIFFHANGER-CLOSURE: anticipation building, mild stress
visible under Fumiko's brisk manner.

### Day 20
OPENING SCENE: Yohei's store, doing math out loud. DRAMATIC QUESTION: how much can the shop actually
afford to bring? ACTIVE CHARACTERS: Yohei. VISIBLE PROBLEM-EVENT: E13, festival stock under budget.
PLAYER INTERVENTION: help him decide, or just be there. FREE-TALK WINDOW: open. CANON LIMIT: the
final stock decision is a system-recorded fact read directly into Day 24's festival scene, never
re-decided or contradicted there. STATE DELTA: `WorldFact: yohei_festival_stock_level`. MERGE POINT:
direct festival-prep contribution. FUTURE CALLBACK: Day 24. CLIFFHANGER-CLOSURE: quiet pride in
doing right by the town even on a tight budget.

### Day 21
OPENING SCENE: somewhere around town, something being fixed by someone nobody's watching. DRAMATIC
QUESTION: does anyone notice the person doing the actual work? ACTIVE CHARACTERS: Jin. VISIBLE
PROBLEM-EVENT: E30, unseen setup work (can include finally fixing Fumiko's bench, E39, if that
thread was connected on Day 10). PLAYER INTERVENTION: notice and thank him specifically (E46-style
credit redirection also possible if someone else gets thanked first), or miss it entirely. FREE-TALK
WINDOW: open. CANON LIMIT: whether the bench specifically gets fixed here depends on the Day 10
state, never decided fresh in this scene. STATE DELTA: `WorldFact: festival_setup_progress`,
optionally `WorldFact: bench_fixed`. MERGE POINT: direct festival-prep contribution; feeds Jin's arc
(Phase B) regardless of player presence. FUTURE CALLBACK: Day 24, and Day 5/27-tier Jin content if
the standing arrangement was accepted. CLIFFHANGER-CLOSURE: a quiet, easy-to-miss kindness, whether
or not the player catches it.

### Day 22
OPENING SCENE: Hina's shop, later in the evening, quieter than usual. DRAMATIC QUESTION: will she
finally say the real reason? ACTIVE CHARACTERS: Hina. VISIBLE PROBLEM-EVENT: E03, the private-fact
reveal (last shop closed over money, not choice) -- gated on real accumulated familiarity, never
forced to trigger by Day 22 specifically if the player hasn't built toward it. PLAYER INTERVENTION:
deep-talk, patient listening. FREE-TALK WINDOW: this IS the deep-talk day for her arc. CANON LIMIT:
AI may only ever have her say this once real trust/familiarity state supports it -- never as a
scripted inevitability regardless of play history. STATE DELTA: `CharacterFact(hina, true_reason_
known)` if reached. MERGE POINT: raises the emotional stakes of whether her shop opens by/around
Day 24/30. FUTURE CALLBACK: colors Day 24 and Day 30. CLIFFHANGER-CLOSURE: real vulnerability shared,
answered only with presence, not a fix.

### Day 23
OPENING SCENE: something looks like it's going wrong, the day before the festival. DRAMATIC QUESTION:
is this the crisis it looks like? ACTIVE CHARACTERS: any/all. VISIBLE PROBLEM-EVENT: E44, the false
alarm -- deliberately deflates rather than escalates. PLAYER INTERVENTION: react, investigate, or
shrug it off. FREE-TALK WINDOW: open, low stakes. CANON LIMIT: the "crisis" always resolves as
harmless -- this day exists specifically to NOT introduce real new stakes before Day 24. STATE
DELTA: none required. MERGE POINT: none -- a deliberate tension-release beat. FUTURE CALLBACK: none.
CLIFFHANGER-CLOSURE: a laugh and a held breath let out, right before the big day.

### Day 24 — MERGE POINT (festival)
OPENING SCENE: the whole shopping street dressed for the festival. DRAMATIC QUESTION: where do I
spend today, knowing I can't be everywhere? ACTIVE CHARACTERS: all six, simultaneously live for the
first time in the spine. VISIBLE PROBLEM-EVENT: E48 -- Yohei's stall (stocked per Day 20's decision),
Miyoko's café table, Fumiko coordinating (quality per Day 19's help), Jin's setup work now visible as
finished (per Day 21), Hina possibly sampling from her shop if her arc has progressed enough,
Daisuke offering a token festival service. PLAYER INTERVENTION: the 2-action budget becomes the
day's real drama -- choosing where to be is the whole scene. FREE-TALK WINDOW: open at whichever
stall/person the player visits. CANON LIMIT: this scene's entire texture is assembled from prior
`WorldFact`/`CharacterFact`/`RelationshipDelta` state -- AI free-talk may describe what's already
true, never invent a different festival than the one the accumulated state actually produced. STATE
DELTA: `WorldFact: festival_day_outcome` (a composite read of everything above, not a new
independent variable). MERGE POINT: this IS the spine's central merge point -- nearly every prior
thread's callback destination. FUTURE CALLBACK: Day 25 (comedown) and Day 30 (retrospective) both
directly reference whichever version of this day the player actually got. CLIFFHANGER-CLOSURE: full,
warm, slightly bittersweet -- pride in the town, awareness of what wasn't seen because it couldn't
all be seen in one day.

---

## Movement 5 (Days 25-30): Aftermath & Closure

### Day 25
OPENING SCENE: the morning after, town a little sleepy. DRAMATIC QUESTION: what does an ordinary day
feel like now? ACTIVE CHARACTERS: whichever NPCs the player is closest to. VISIBLE PROBLEM-EVENT: E49,
the comedown. PLAYER INTERVENTION: check in on people, or simply rest. FREE-TALK WINDOW: open, warm,
low-stakes reflective conversations natural here. CANON LIMIT: none unusual. STATE DELTA: none
required. MERGE POINT: emotional coda to Day 24. FUTURE CALLBACK: none new. CLIFFHANGER-CLOSURE: a
soft, satisfied quiet.

### Day 26
OPENING SCENE: Yohei's store, unusually quiet, unusually distracted. DRAMATIC QUESTION: did something
change overnight? ACTIVE CHARACTERS: Yohei. VISIBLE PROBLEM-EVENT: E16, the son actually calls --
strictly gated on Day 13's `son_thread_noticed` flag; otherwise Day 26 is simply an ordinary day for
him, equally valid. PLAYER INTERVENTION: notice and ask gently, or simply be present. FREE-TALK
WINDOW: open. CANON LIMIT: AI may express relief/uncertainty but may never narrate what was actually
said on the call, or promise a future reunion -- the system states only that they talked, nothing
more resolved than that. STATE DELTA: `CharacterFact(yohei, son_contact_reestablished)` if the gate
was met. MERGE POINT: payoff for Day 13/E10. FUTURE CALLBACK: colors Day 30's retrospective for this
specific player. CLIFFHANGER-CLOSURE: quiet, real, deliberately unresolved beyond "they talked."

### Day 27
OPENING SCENE: Daisuke's chair, a slower afternoon. DRAMATIC QUESTION: does the deflection ever
crack? ACTIVE CHARACTERS: Daisuke. VISIBLE PROBLEM-EVENT: E20, the unanswered New Year's card --
gated on accumulated `familiarity(daisuke)` from Day 8 and any later touches, never a single clever
phrase. PLAYER INTERVENTION: deep-talk, patient. FREE-TALK WINDOW: this is the deep-talk day for this
thread. CANON LIMIT: the friend's identity/backstory stays exactly as vague as already canonized (a
friend from his city years) -- AI may not invent a name or specific falling-out story. STATE DELTA:
`CharacterFact(daisuke, card_secret_known)` if reached. MERGE POINT: none required -- a private-fact
arc, complete in itself whether or not it resolves into him answering the card. FUTURE CALLBACK:
colors Day 30. CLIFFHANGER-CLOSURE: a quiet parallel to Yohei's own arc, never stated as parallel
in-fiction, felt only by an attentive player.

### Day 28
OPENING SCENE: the café, Miyoko mentioning she spoke to her daughter again. DRAMATIC QUESTION: what
does she actually decide? ACTIVE CHARACTERS: Miyoko. VISIBLE PROBLEM-EVENT: E36 -- staying, a
compromise, or genuinely still undecided are all legitimate system-chosen outcomes, weighted by
accumulated engagement across Days 11/16/31-tier content, never a coin flip disconnected from play
history. PLAYER INTERVENTION: listen, react, no correct side. FREE-TALK WINDOW: open. CANON LIMIT:
whichever outcome is reached is final and system-recorded before this scene's dialogue is generated
-- AI expresses the outcome, never selects it. STATE DELTA: `CharacterFact(miyoko, daughter_
thread_outcome)`. MERGE POINT: payoff for Day 16/E31. FUTURE CALLBACK: Day 30. CLIFFHANGER-CLOSURE:
real and adult -- not every ending is triumphant, and that's the point.

### Day 29
OPENING SCENE: any location, a private moment with no one else around. DRAMATIC QUESTION: do I do the
kind thing when no one's watching? ACTIVE CHARACTERS: player + one NPC (ideally an underused one --
Jin is the strongest fit given E30's theme). VISIBLE PROBLEM-EVENT: E50, the unwitnessed kindness --
deliberately no guaranteed payoff, no XP, no thank-you scene. PLAYER INTERVENTION: do it, or don't --
both are real, unscored choices. FREE-TALK WINDOW: optional, low stakes either way. CANON LIMIT:
this day must never auto-generate a reward text regardless of the choice -- if any payoff exists, it
is small, delayed, and never explicitly attributed back to this exact moment. STATE DELTA: none
required, or a single quiet flag with no visible UI. MERGE POINT: none by design. FUTURE CALLBACK:
none guaranteed -- the value is in not needing one. CLIFFHANGER-CLOSURE: private, understated,
whichever way it goes.

### Day 30 — retrospective, not "the end"
OPENING SCENE: the temporary room, now considerably less temporary-looking than Day 1. DRAMATIC
QUESTION: what did these 30 days actually look like, for this specific player? ACTIVE CHARACTERS:
whichever NPCs the player actually spent time with (a genuinely different roster per player). VISIBLE
PROBLEM-EVENT: none -- explicitly not a crisis day. PLAYER INTERVENTION: an optional, skippable
reflection, reusing this codebase's own already-built and tested Day-30 retrospective register/
restraint (`PHASE_12_8_NEW_LIFE_30_DAY_ARC_AND_RETROSPECTIVE_V1`) scaled to this larger cast rather
than reinvented. FREE-TALK WINDOW: open, reflective. CANON LIMIT: no score, no dashboard, no GOOD
END/BAD END framing of any kind -- explicit, hard ban, matching existing canon precedent exactly.
STATE DELTA: an optional, verbatim-stored reflection if the player writes one; nothing analyzed or
reacted to by the system. MERGE POINT: the whole spine's actual merge point, retrospectively --
Hina's shop open or not, Yohei's son thread touched or not, Daisuke's card answered or not, Jin's
arrangement accepted or not, Miyoko's decision, Fumiko's bench and letter -- read back, not re-
decided. FUTURE CALLBACK: none within this design (Day 31+ is explicitly out of scope). CLIFFHANGER-
CLOSURE: the design's actual success condition -- "もう少しここにいたい" or "別の30日を試してみたい,"
both successes, neither scored, matching the existing 7-day design's own closing-feeling target
scaled up.

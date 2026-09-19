# NEW LIFE 30-Day Gamebook — Text Prototype V1 (Phase E)

Playable by following knots and choices, no code, no images, no UI. Notation adapted from ink (see
`NEWLIFE_30DAY_GAMEBOOK_DESIGN_SYSTEMS_ADAPTATION_V1.md` for exactly what's borrowed and why):
`===` = knot (one day), `=` = stitch (a scene inside a day), `*` = a choice, `->` = go to,
`-` = gather point where choices reconverge, `{VAR: A|B}` = conditional text. `VAR ...` lines below
the title declare global state (a working subset of `NEWLIFE_30DAY_GAMEBOOK_STATE_MODEL_V1.md`,
enough to actually play this prototype -- not the full production schema).

A human reader plays this by picking a `*` option, following its `->` target, and continuing.
Reaching a `= free_talk(npc)` stitch call is the simulated AI-interface contract point.

```
VAR day = 1
VAR actions_left = 2
VAR relationship_hina = 0
VAR relationship_yohei = 0
VAR relationship_daisuke = 0
VAR relationship_jin = 0
VAR relationship_miyoko = 0
VAR relationship_fumiko = 0
VAR familiarity_daisuke = 0
VAR everVisited = ()
VAR festival_flyer_seen = false
VAR festival_prep_progress = 0
VAR yohei_festival_stock = "unset"
VAR bench_noted = false
VAR bench_fixed = false
VAR hina_true_reason_known = false
VAR hina_money_noticed = false
VAR yohei_son_noticed = false
VAR yohei_son_recontacted = false
VAR daisuke_renovation_decided = "unset"
VAR daisuke_card_known = false
VAR miyoko_daughter_active = false
VAR miyoko_daughter_outcome = "unset"
VAR fumiko_letter_received = false
VAR jin_arrangement = "unset"
```

## Shared reusable stitches (called from many days, per ink's own knot-reuse convention)

```
= free_talk(who)
    You may say anything here. This is the simulated interface contract:

    PLAYER_FREE_TEXT: <the player's own words, typed fresh each time -- never pre-written>
    AI_CHARACTER_RESPONSE: <{who}'s in-character reply, may reference existing state,
                             invents no new named fact>
    STATE_DELTA_PROPOSAL: relationship_{who} +1 (small, bounded, the only kind of delta
                           ordinary free talk may ever propose)
    CANON_GATE_RESULT: ACCEPTED (a proposal this small, within the already-modeled
                        relationship range, is accepted by the gate rules in
                        NEWLIFE_30DAY_GAMEBOOK_STATE_MODEL_V1.md)
    NEXT_SCENE: -> back to wherever free_talk(who) was called from
    ~ relationship_{who} = relationship_{who} + 1
    -> DONE

= home_hub
    - (top)
    A quiet room above the street. {day == 1: Boxes are still half-unpacked.|Another ordinary
    morning here.}
    {actions_left == 2: Today is fully open. |
     actions_left == 1: One more thing today, if you want it. |
     actions_left == 0: The day is done.}
    * {actions_left > 0} [Go to Yohei's store] -> to_yohei
    * {actions_left > 0} [Go to the shopping street (Hina, Daisuke)] -> to_street
    * {actions_left > 0} [Go to Café Nodoka (Miyoko)] -> to_cafe
    * {actions_left > 0} [Go to the Community Hall (Fumiko)] -> to_hall
    * {actions_left > 0} [Go to Jin, wherever he's working today] -> to_jin
    * [End the day] -> end_of_day
    -> DONE

= end_of_day
    ~ day = day + 1
    ~ actions_left = 2
    -> knot_for_day(day)
```

Location visits (`to_yohei`, `to_street`, `to_cafe`, `to_hall`, `to_jin`) each spend 1 of
`actions_left` and route into that day's specific content (below); returning to `home_hub` never
spends an action. This mirrors the already-implemented `src/newlife7day/engine.ts` budget exactly,
extended from 3 locations to the full 6.

---

## Movement 1

### === day01 ===
The room is small, half a life still in boxes. Today is the first day in this town.
-> home_hub

*(at Hina, first visit)* She's mid-setup, apron dusted with flour, and glances up. "Oh -- hello.
...Sorry, it's still not very together in here." * [Watch] -> a small, concrete detail about the
shop's slow progress. * [Help] -> she's startled, then quietly grateful. * [Talk more] ->
free_talk(hina) -> gather, ~ relationship_hina = relationship_hina + 1, -> home_hub.

*(at Yohei, first visit)* He glances over, nods once. Ordinary shopkeeping, nothing urgent today.
* [Buy something] -> a plain, friendly transaction. * [Talk more] -> free_talk(yohei) -> home_hub.

- (gather) Whichever of the two is skipped today becomes tomorrow's "town moved without you" check.
-> home_hub

### === day02 ===
{everVisited has "hina" and not "yohei_visited_day1"|everVisited has "yohei" and not
"hina_visited_day1": something changed overnight at whichever place wasn't visited yesterday.}
A small, concrete overnight change is visible at the skipped location -- stated plainly by whoever's
there, never invented fresh by free talk.
-> home_hub

### === day03 ===
At the Community Hall, a new flyer is pinned to the board. Fumiko is nearby, tidying.
* [Ask about it] -> "Ah -- that. You'll see, in time." (~ festival_flyer_seen = true)
* [Ignore it] -> nothing lost; the flyer will still be there tomorrow.
- -> home_hub

### === day04 ===
{relationship_hina > 0 and relationship_yohei > 0: Hina mentions, carefully, that she's not sure
Yohei likes her. You know better -- he's like this with every new face.}
* [Tell her it's not personal] -> a small, real thaw between them, independent of anything else
  you do. (~ relationship_hina = relationship_hina + 1)
* [Say nothing] -> it stays a small worry of hers a while longer -- fine either way.
- -> home_hub

### === day05 ===
{relationship_jin >= 2: Jin, between tasks, says -- almost too casually -- that he wouldn't mind
some kind of standing arrangement. He won't ask for it outright. It's on you to answer plainly.}
* {relationship_jin >= 2} [Offer him a standing arrangement] -> ~ jin_arrangement = "accepted" ->
  a quiet, real "yeah, alright" from him.
* {relationship_jin >= 2} [Say maybe later] -> ~ jin_arrangement = "declined" -> he shrugs, easy,
  no hard feelings, exactly as he'd want it read.
* {relationship_jin < 2} An ordinary day. He's not ready to bring this up yet, and that's fine.
- -> home_hub

### === day06 ===
Somewhere in town, two old friends are simply existing together -- Yohei and Daisuke trading a
decades-old joke, or Jin and Yohei sitting in comfortable silence. This happens whether or not you
are there to see it.
* [Watch, say nothing] -> a small, warm proof this town is one place, not six separate rooms.
* [Move on] -> it happens anyway, off-screen.
- -> home_hub

---

## Movement 2

### === day07 ===
Daisuke's chair: a customer wants something oddly, impossibly specific. Pure comedy, no real stakes.
* [Watch] -> it resolves, somehow, with strained professionalism intact.
- -> home_hub

### === day08 ===
At Daisuke's: you ask him something a little personal. He deflects, smoothly, mid-scissor-work.
* [Push once] -> he deflects again, same as always -- pushing harder doesn't unlock anything; only
  time does. (~ familiarity_daisuke = familiarity_daisuke + 1)
* [Let it go] -> an easy, comfortable quiet instead. (~ familiarity_daisuke = familiarity_daisuke + 1)
- -> home_hub

### === day09 ===
At Yohei's: a crate of produce has turned. He shrugs it off in front of you -- "That's business."
* [Help sort what's still good] -> a small, shared, practical task.
* [Just keep him company] -> equally fine.
- -> home_hub

### === day10 ===
At the Hall: an old bench wobbles in the corner. Fumiko won't just replace it, and won't say why.
* [Suggest Jin could fix it] -> ~ bench_noted = true -> she considers it, doesn't commit yet.
* [Leave it] -> it stays wobbly a while longer.
- -> home_hub

### === day11 ===
At the café: Miyoko sets a new bag of beans on the counter, watching your face a little too closely.
* [React honestly, whichever way] -> a warm, uncomplicated good day either way -- no correct answer.
- -> home_hub

### === day12 ===
{familiarity_daisuke >= 2: Daisuke mentions, almost offhand, that he called the contractor.}
~ daisuke_renovation_decided = "yes"
{familiarity_daisuke < 2: The renovation quote is still in the drawer. No decision yet -- an
ordinary day for him.}
-> home_hub

---

## Movement 3

### === day13 ===
At Yohei's: he glances at his phone, puts it away fast. Something is unopened there.
* [Ask gently] -> free_talk(yohei) -> ~ yohei_son_noticed = true -> he goes quiet, then changes the
  subject. Nothing more is said today, and that's the honest, real shape of it.
* [Let it be] -> he seems a little far away today, nothing more said.
- -> home_hub

### === day14 ===
At Hina's: "Sorry, just -- juggling a few things this week." A little too casual.
* [Ask "juggling how?"] -> free_talk(hina) -> ~ hina_money_noticed = true -> a small crack in her
  usual confidence, easy to miss.
* [Let it pass] -> nothing more said today.
- -> home_hub

### === day15 ===
At the Hall: a letter sits on Fumiko's desk, unopened when you arrive.
* [Ask about it] -> free_talk(fumiko) -> ~ fumiko_letter_received = true -> an old former student,
  out of nowhere. Old regret, gently surfacing.
* [Don't pry] -> she seems distracted; you let it be.
- -> home_hub

### === day16 ===
At the café, quieter than usual: "My daughter called again." Miyoko doesn't finish the thought.
* [Listen] -> free_talk(miyoko) -> ~ miyoko_daughter_active = true -> real, unresolved worry, shared
  a little.
* [Just be present] -> she seems glad you're there anyway.
- -> home_hub

### === day17 ===
At Hina's: a regular customer offers advice, delivered badly, but not wrong underneath.
* [Help her hear the useful part] -> a small moment of pride bruised, then soothed.
* [Just commiserate] -> equally fine.
- -> home_hub

### === day18 ===
{relationship_yohei > 0 and relationship_fumiko > 0: Both Yohei and Fumiko believe, from something
you said earlier, that you'd help them this same afternoon. Neither is wrong to think so.}
* [Help Yohei, explain to Fumiko] -> ~ relationship_yohei = relationship_yohei + 1 -> a small,
  real consequence either way.
* [Help Fumiko, explain to Yohei] -> ~ relationship_fumiko = relationship_fumiko + 1 -> same shape,
  other direction.
* [Find a third option] -> a smaller gesture to both -- no one fully satisfied, no one upset either.
- -> home_hub

---

## Movement 4 — the festival

### === day19 ===
The Hall is a mess of papers; Fumiko is brisker than usual, clearly stretched thin.
* [Offer to help with something concrete] -> ~ festival_prep_progress = festival_prep_progress + 1
* [Leave her to it] -> she manages anyway, just more tired for it.
- -> home_hub

### === day20 ===
At Yohei's, doing math out loud: how much stock can the shop actually bring to the festival?
* [Help him decide generously] -> ~ yohei_festival_stock = "full"
* [Help him decide carefully] -> ~ yohei_festival_stock = "modest"
* [Just be there] -> ~ yohei_festival_stock = "minimal" -> he decides alone, quietly proud either way.
- -> home_hub

### === day21 ===
Somewhere in town, something is being fixed by someone nobody's watching -- Jin, as always.
{bench_noted: this includes, finally, the wobbly bench at the Hall.} ~ bench_fixed = bench_noted
* [Notice and thank him specifically] -> ~ relationship_jin = relationship_jin + 1 -> a small,
  meaningful beat, easy to miss.
* [Miss it] -> he does the work anyway; it was never about being seen.
- -> home_hub

### === day22 ===
{hina_money_noticed and relationship_hina >= 3: Later, quieter than usual, Hina finally says it:
the last shop didn't close because she "moved on." It closed because the money ran out.}
~ hina_true_reason_known = hina_money_noticed and relationship_hina >= 3
* {hina_true_reason_known} [Just listen] -> free_talk(hina) -> real vulnerability, met with
  presence, not a fix.
* {not hina_true_reason_known} An ordinary evening at her shop -- the deeper trust isn't there yet,
  and that's a legitimate place for this arc to sit.
- -> home_hub

### === day23 ===
Something looks like it's going wrong -- shouting, running, a truck where it shouldn't be.
* [Investigate] -> a harmless mix-up, nothing more. A laugh, a held breath let out.
- -> home_hub

### === day24 === (MERGE POINT)
The whole street is dressed for the festival. You cannot be everywhere today.
{yohei_festival_stock == "full": Yohei's stall is generous and full.|yohei_festival_stock ==
"modest": Yohei's stall is modest but solid.|yohei_festival_stock == "minimal": Yohei's stall is
thin, but present, and that's its own quiet pride.}
{bench_fixed: The Hall's bench, fixed at last, has people sitting on it all day.|not bench_fixed:
The Hall's bench still wobbles, and somehow that's fine too.}
{hina_true_reason_known: Hina is out front of her shop, still not fully open, but trying something
small and real today anyway.|not hina_true_reason_known: Hina watches from her half-finished shop,
not quite ready to join in yet.}
* [Spend the day at Yohei's stall] -> free_talk(yohei) -> a full, specific day there.
* [Spend the day at the café table] -> free_talk(miyoko) -> a full, specific day there.
* [Spend the day at the Hall] -> free_talk(fumiko) -> a full, specific day there.
* [Spend the day near Hina] -> free_talk(hina) -> a full, specific day there.
- The rest happens off-screen, real but unseen, exactly like a real festival where no one sees
  everything.
-> home_hub

---

## Movement 5

### === day25 ===
The morning after: town a little sleepy, satisfied.
* [Check in on someone] -> free_talk of your choosing -> a warm, low-stakes exchange.
* [Rest] -> equally fine.
- -> home_hub

### === day26 ===
{yohei_son_noticed: Yohei is unusually quiet, unusually distracted this morning.}
~ yohei_son_recontacted = yohei_son_noticed
{yohei_son_recontacted: [Ask gently] -> free_talk(yohei) -> His son called, last night. Nothing
is fully resolved. They talked. That's all, and that's real.}
{not yohei_son_noticed: An ordinary day at the shop.}
-> home_hub

### === day27 ===
{familiarity_daisuke >= 4: A slower afternoon in his chair. This time, when you ask, something
actually gives.}
~ daisuke_card_known = familiarity_daisuke >= 4
* {daisuke_card_known} [Listen] -> free_talk(daisuke) -> a friend from his city years, an
  unanswered New Year's card, months old. A quiet parallel to Yohei's own thread, never named as
  such.
* {not daisuke_card_known} An ordinary, comfortable afternoon -- the trust isn't quite there yet.
- -> home_hub

### === day28 ===
{miyoko_daughter_active: Miyoko mentions she spoke to her daughter again, differently this time.}
~ miyoko_daughter_outcome = "compromise"
* [Listen] -> free_talk(miyoko) -> real, adult, not-triumphant closure -- a compromise, not a
  clean win either way.
- -> home_hub

### === day29 ===
A private moment, no one else around. {jin_arrangement == "accepted": Jin, specifically, is nearby
today, still as unassuming as ever.}
* [Do the kind thing anyway] -> nothing visible happens. No thank-you scene. That was always the
  point.
* [Don't] -> also fine -- this was never scored.
- -> home_hub

### === day30 === (retrospective, not "the end")
The room upstairs looks lived-in now, nothing like Day 1's half-unpacked boxes.
This is not a crisis day, not a final boss, not a score screen. What follows is only a plain,
optional reflection on the 30 days *this* playthrough actually had:
- {relationship_hina > 0: time was spent with Hina.} {hina_true_reason_known: her real story was
  heard.} {not hina_true_reason_known: some of her stayed private, and that's alright.}
- {yohei_son_recontacted: Yohei's thread with his son took one real, small step.} {not
  yohei_son_recontacted: it stayed exactly where it was -- unresolved, not punished.}
- {daisuke_renovation_decided != "unset": Daisuke decided, one way or another, months ago now.}
  {daisuke_card_known: the card came up too, eventually.}
- {jin_arrangement == "accepted": something steadier started with Jin.} {jin_arrangement ==
  "declined": he's exactly as he always was, and that's fine.}
- {miyoko_daughter_outcome != "unset": Miyoko's thread with her daughter found its own shape.}
- {bench_fixed: the Hall's bench got fixed.} {fumiko_letter_received: an old letter got a chance
  to matter again.}
* [Write a short reflection] -> stored verbatim, never analyzed or scored.
* [Skip it] -> equally valid.
- No GOOD END. No BAD END. Only: did you want to see tomorrow? -> END.
```

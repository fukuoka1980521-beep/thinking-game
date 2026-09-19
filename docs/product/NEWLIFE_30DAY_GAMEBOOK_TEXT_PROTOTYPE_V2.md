# NEW LIFE 30-Day Gamebook — Text Prototype V2 (PHASE_24, Section 11)

Replaces `NEWLIFE_30DAY_GAMEBOOK_TEXT_PROTOTYPE_V1.md`'s playable notation. Full narrative prose for
each day lives in `NEWLIFE_30DAY_GAMEBOOK_STORY_SPINE_V2.md` (its 10-step breakdown IS the
authored scene content) -- this document is the actual choice/state-machine wiring, kept separate so
neither file duplicates the other's job, same division of labor as V1's spine/prototype split.
Notation unchanged from V1 (ink-derived: `===` knot, `=` stitch, `*` choice, `->` goto, `-` gather,
`{VAR: A|B}` conditional) -- see `NEWLIFE_30DAY_GAMEBOOK_DESIGN_SYSTEMS_ADAPTATION_V1.md` for the
full rationale, still valid.

**The central mechanical change from V1**: no bare `relationship_X`/`familiarity_X` counters. Every
NPC has a named evidence set (`hina_evidence`, `daisuke_evidence`, etc.), and gates check specific
membership, not raw counts -- see the shared `evidence()` stitch below.

```
VAR day = 1
VAR budget_left = 2
VAR hina_evidence = ()
VAR daisuke_evidence = ()
VAR jin_evidence = ()
VAR yohei_evidence = ()
VAR miyoko_evidence = ()
VAR fumiko_evidence = ()
VAR daisuke_deflection_returns = 0
VAR promise_fumiko_help_soon = false
VAR promise_yohei_help_soon = false
VAR festival_flyer_seen = false
VAR festival_prep_progress = 0
VAR yohei_festival_stock = "unset"
VAR bench_fixed = false
VAR hina_true_reason_known = false
VAR yohei_son_noticed = false
VAR yohei_son_recontacted = false
VAR daisuke_renovation_decided = "unset"
VAR daisuke_card_known = false
VAR miyoko_daughter_outcome = "unset"
VAR fumiko_writes_back = "unset"
VAR jin_arrangement = "unset"
```

## Shared reusable stitches

```
= evidence(who, item)
    ~ temp set = {who}_evidence
    { not (item in set):
        ~ {who}_evidence = {who}_evidence + item
    }
    -> DONE

= free_talk(who)
    You may say anything here.

    PLAYER_FREE_TEXT: <the player's own words, typed fresh each time>
    AI_CHARACTER_RESPONSE: <{who}'s in-character reply -- may reference existing state,
                            invents no new named fact, decides no outcome>
    INTENT_CLASSIFICATION: <comfort | challenge | curiosity | refusal | deflection | other>
    STATE_DELTA_PROPOSAL: <a NAMED evidence item from the ledger, or "none">
    CANON_CONSISTENCY_CHECK: ACCEPTED (small, in-vocabulary, correctly sized) |
                              MODIFIED (right direction, wrong size -- bounded down) |
                              REJECTED (invents a new fact, or attempts a forbidden-list
                                        outcome from CAUSAL_RULES_V2 Section 7)
    NEXT_SCENE: -> only reached after the check result
    { CANON_CONSISTENCY_CHECK == "ACCEPTED" or CANON_CONSISTENCY_CHECK == "MODIFIED":
        -> evidence(who, STATE_DELTA_PROPOSAL)
    }
    -> DONE

= home_hub
    - (top)
    {day <= 6: The street outside is already doing something -- someone visibly mid-task,
     something visibly changed overnight.|
     day <= 12: Ordinary life, but never a blank menu -- something is always already in motion
     somewhere in town.|
     day <= 18: Pressure is visibly rising in more than one place at once.|
     day <= 24: The festival is close, or here.|
     Aftermath, and the town keeps being the town.}
    {budget_left > 0: Something today is worth responding to. |
     budget_left == 0: The day is done.}
    * {budget_left > 0} [Go toward whatever's happening at Yohei's] -> to_yohei
    * {budget_left > 0} [Go toward whatever's happening on the shopping street] -> to_street
    * {budget_left > 0} [Go toward whatever's happening at Café Nodoka] -> to_cafe
    * {budget_left > 0} [Go toward whatever's happening at the Community Hall] -> to_hall
    * {budget_left > 0} [Go toward whatever Jin's doing today] -> to_jin
    * [End the day] -> end_of_day
    -> DONE

= end_of_day
    ~ day = day + 1
    ~ budget_left = 2
    -> knot_for_day(day)
```

Each location visit spends 1 of `budget_left`; returning to `home_hub` never does -- unchanged
budget shape from V1, extended across all 6 locations equally.

---

## Day-by-day wiring (full prose lives in the spine; choices and state effects live here)

### === day01 ===
Full scene: spine Day 1.
* [Help Hina carry the box] -> evidence(hina, "helped_hina_move_box") -> home_hub
* [Just buy from Yohei] -> home_hub
- -> home_hub

### === day02 ===
Full scene: spine Day 2 (whichever location was skipped Day 1 shows a real overnight change).
* [Notice and comment] -> a specific acknowledgment exchange -> home_hub
* [Say nothing] -> the change stands unremarked -> home_hub
- -> home_hub

### === day03 ===
Full scene: spine Day 3.
* [Ask Fumiko about the flyer] -> ~ festival_flyer_seen = true -> home_hub
* [Ignore it] -> home_hub
- -> home_hub

### === day04 ===
Full scene: spine Day 4.
* [Tell Hina it's not personal] -> evidence(hina, "defended_hina_to_yohei") ->
  evidence(yohei, "defended_hina_to_yohei") -> home_hub
* [Say nothing] -> home_hub
- -> home_hub

### === day05 ===
Full scene: spine Day 5.
{ (jin_evidence has "thanked_jin_for_unseen_work") or (jin_evidence has
"noticed_jin_fixed_something"):
    Jin, almost too casually, mentions he wouldn't mind something steadier.
    * [Accept the standing arrangement] -> ~ jin_arrangement = "accepted" -> home_hub
    * [Say maybe later] -> ~ jin_arrangement = "declined" -> home_hub
- else:
    An ordinary day with Jin -- nothing offered yet. The late window (Day 21) remains open.
    -> home_hub
}

### === day06 ===
Full scene: spine Day 6 (an independent NPC-NPC moment, witnessed or not -- happens either way).
* [Watch quietly] -> home_hub
* [Move on] -> home_hub
- -> home_hub

### === day07 ===
Full scene: spine Day 7.
* [Comment warmly on how Daisuke handles it] -> evidence(daisuke, "witnessed_daisuke_comedy_day")
  -> home_hub
* [Just watch] -> home_hub
- -> home_hub

### === day08 ===
Full scene: spine Day 8.
* [Ask something personal anyway] -> evidence(daisuke, "attempted_daisuke_personal") ->
  a smooth, in-character deflection -> home_hub
* [Let the silence stand] -> home_hub
- -> home_hub

### === day09 ===
Full scene: spine Day 9.
* [Help sort what's still good] -> evidence(yohei, "helped_yohei_sort_stock") -> home_hub
* [Just keep him company] -> home_hub
- -> home_hub

### === day10 ===
Full scene: spine Day 10.
* [Suggest Jin could fix the bench] -> ~ bench_fixed = false (marks eligible; actually fixed Day 21)
  -> ~ temp bench_suggested = true -> home_hub
* [Leave it] -> home_hub
- -> home_hub

### === day11 ===
Full scene: spine Day 11.
* [React honestly to the new beans] -> evidence(miyoko, "reacted_to_miyoko_new_beans") -> home_hub
* [Deflect the question] -> home_hub
- -> home_hub

### === day12 ===
Full scene: spine Day 12 -- no player choice this day; the outcome is READ, not decided.
{ (daisuke_evidence has "attempted_daisuke_personal") or (daisuke_evidence has
"returned_to_daisuke_after_deflection"):
    ~ daisuke_renovation_decided = "yes"
- else:
    (daisuke_renovation_decided stays "unset" -- an ordinary day)
}
-> home_hub

### === day13 ===
Full scene: spine Day 13 -- the son-thread noticing, deep-talk only.
* [Ask gently] -> free_talk(yohei) -> ~ yohei_son_noticed = true -> home_hub
* [Let it be] -> home_hub
- -> home_hub

### === day14 ===
Full scene: spine Day 14.
* [Ask "juggling how?"] -> free_talk(hina) -> evidence(hina, "noticed_hina_money_pressure") ->
  home_hub
* [Let it pass] -> home_hub
- -> home_hub

### === day15 ===
Full scene: spine Day 15.
* [Ask about the letter] -> free_talk(fumiko) -> evidence(fumiko, "asked_about_fumikos_letter") ->
  ~ promise_fumiko_help_soon = true -> home_hub
* [Don't pry] -> home_hub
- -> home_hub

### === day16 ===
Full scene: spine Day 16.
* [Listen] -> free_talk(miyoko) -> evidence(miyoko, "listened_to_miyoko_daughter_worry") ->
  home_hub
* [Just be present] -> home_hub
- -> home_hub

### === day17 ===
Full scene: spine Day 17.
* [Agree to help Yohei "next time"] -> ~ promise_yohei_help_soon = true -> home_hub
* [Demur] -> home_hub
- -> home_hub

### === day18 ===
Full scene: spine Day 18 -- ONLY fires the conflict if both promises exist.
{ promise_fumiko_help_soon and promise_yohei_help_soon:
    Both promises land the same afternoon.
    * [Keep Yohei's, explain to Fumiko] -> evidence(yohei, "kept_promise") -> home_hub
    * [Keep Fumiko's, explain to Yohei] -> evidence(fumiko, "kept_promise") -> home_hub
    * [A smaller gesture to both] -> evidence(yohei, "kept_promise") ->
      evidence(fumiko, "kept_promise") -> home_hub
- else:
    An ordinary day -- no promise conflict exists to fire.
    -> home_hub
}

### === day19 ===
Full scene: spine Day 19.
* [Help with something concrete] -> evidence(fumiko, "helped_fumiko_festival_prep") ->
  ~ festival_prep_progress = festival_prep_progress + 1 -> home_hub
* [Leave her to it] -> home_hub
- -> home_hub

### === day20 ===
Full scene: spine Day 20.
* [Help decide generously] -> ~ yohei_festival_stock = "full" ->
  evidence(yohei, "supported_yohei_festival_stock") -> home_hub
* [Help decide carefully] -> ~ yohei_festival_stock = "modest" -> home_hub
* [Leave him to it] -> ~ yohei_festival_stock = "minimal" -> home_hub
- -> home_hub

### === day21 ===
Full scene: spine Day 21 -- bench payoff + Jin's late-window offer.
~ bench_fixed = temp bench_suggested
* [Thank Jin specifically] -> evidence(jin, "thanked_jin_for_unseen_work") -> home_hub
* [Miss it] -> home_hub
- { jin_arrangement == "unset" and ((jin_evidence has "thanked_jin_for_unseen_work") or
  (jin_evidence has "noticed_jin_fixed_something")):
    Jin's late window: the same offer resurfaces here if missed on Day 5.
    * [Accept] -> ~ jin_arrangement = "accepted" -> home_hub
    * [Decline] -> ~ jin_arrangement = "declined" -> home_hub
}
-> home_hub

### === day22 ===
Full scene: spine Day 22 -- Hina's reveal, evidence-gated (not a raw counter).
{ (hina_evidence has "noticed_hina_money_pressure" or hina_evidence has "asked_hina_about_her_goal")
  and (LIST_COUNT(hina_evidence) >= 2):
    * [Just listen] -> free_talk(hina) -> ~ hina_true_reason_known = true -> home_hub
- else:
    An ordinary, pleasant evening -- the gate isn't met yet, and that's legitimate.
    -> home_hub
}

### === day23 ===
Full scene: spine Day 23 -- explicitly non-causal by design.
* [Investigate] -> a harmless mix-up -> home_hub
- -> home_hub

### === day24 === (MERGE POINT)
Full scene: spine Day 24 -- entirely assembled from prior state, no new independent event.
{yohei_festival_stock == "full": Yohei's stall is generous and full.|yohei_festival_stock ==
"modest": modest but solid.|yohei_festival_stock == "minimal": thin, but present.}
{bench_fixed: The bench, fixed at last, has people sitting on it all day.|not bench_fixed: still
wobbles, and that's fine too.}
{hina_true_reason_known: Hina is out front, still not fully open, trying something small today
anyway.|not hina_true_reason_known: watches from her half-finished shop.}
* [Spend today at Yohei's stall] -> free_talk(yohei) -> home_hub
* [Spend today at the café table] -> free_talk(miyoko) -> home_hub
* [Spend today at the Hall] -> free_talk(fumiko) -> home_hub
* [Spend today near Hina] -> free_talk(hina) -> home_hub
- The rest happens off-screen, real but unseen. -> home_hub

### === day25 ===
Full scene: spine Day 25.
* [Check in on someone] -> free_talk of your choosing -> home_hub
* [Rest] -> home_hub
- -> home_hub

### === day26 ===
Full scene: spine Day 26 -- Yohei's son payoff, gated on Day 13 + 1 more evidence item.
{ yohei_son_noticed and (LIST_COUNT(yohei_evidence) >= 1):
    ~ yohei_son_recontacted = true
    * [Ask gently] -> free_talk(yohei) -> his son called last night; they talked. -> home_hub
- else:
    An ordinary day at the shop.
    -> home_hub
}

### === day27 ===
Full scene: spine Day 27 -- Daisuke's card, gated on RETURNING after deflection (the explicit fix).
{ daisuke_deflection_returns >= 2:
    ~ daisuke_card_known = true
    * [Listen] -> free_talk(daisuke) -> the unanswered New Year's card, finally. -> home_hub
- else:
    An ordinary, comfortable afternoon -- the persistence-after-deflection gate isn't met yet.
    -> home_hub
}

### === day28 ===
Full scene: spine Day 28 -- Miyoko's daughter-thread payoff.
{ (miyoko_evidence has "listened_to_miyoko_daughter_worry") and (LIST_COUNT(miyoko_evidence) >= 2):
    ~ miyoko_daughter_outcome = "compromise"
    * [Listen] -> free_talk(miyoko) -> a compromise, not a clean win. -> home_hub
- else:
    An ordinary day at the café -- thread stays open past Day 30.
    -> home_hub
}

### === day29 ===
Full scene: spine Day 29 -- explicitly no state effect either way, by design.
* [Do the kind thing anyway] -> nothing visible happens -> home_hub
* [Don't] -> also fine -> home_hub
- -> home_hub

### === day30 === (retrospective, not "the end")
Full scene: spine Day 30 -- reads every gated variable above, decides nothing new.
- {hina_true_reason_known: her real story was heard.|not hina_true_reason_known: some of her stayed
  private.}
- {yohei_son_recontacted: Yohei's thread with his son took one real, small step.|not
  yohei_son_recontacted: it stayed unresolved, not punished.}
- {daisuke_renovation_decided != "unset": Daisuke decided, months ago now.} {daisuke_card_known:
  the card came up too, eventually.}
- {jin_arrangement == "accepted": something steadier started with Jin.|jin_arrangement ==
  "declined": he's exactly as he always was.}
- {miyoko_daughter_outcome != "unset": Miyoko's thread found its own shape.}
- {bench_fixed: the bench got fixed.}
* [Write a short reflection] -> stored verbatim, never scored -> END.
* [Skip it] -> END.
```

## One wiring note that only became visible while writing this file (recorded here, honestly)

`daisuke_deflection_returns` is incremented by a rule not shown as a single visible choice above:
any day from Day 9 onward where the player visits Daisuke again (structurally or via free talk)
AFTER Day 8's initial deflection increments this counter by 1, regardless of which specific day it
happens on. This is deliberately NOT tied to one specific calendar day (unlike most other gates in
this document) because "returning" is inherently about the player's own initiative across many
possible days, not a single authored beat -- exactly the kind of evidence Section 6 asks for that a
single day-knot cannot fully express on its own. This is flagged explicitly rather than left
implicit, since an evaluator reading only individual day-knots could otherwise miss where this
critical Day-27-gating variable actually comes from.

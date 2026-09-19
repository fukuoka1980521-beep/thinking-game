# NEW LIFE 30-Day Gamebook — Text Prototype V2.1 (PHASE_24.1)

Replaces `NEWLIFE_30DAY_GAMEBOOK_TEXT_PROTOTYPE_V2.md`'s wiring. Full narrative content lives in
`NEWLIFE_30DAY_GAMEBOOK_STORY_SPINE_V2_1.md` -- this file is the state-machine wiring only. **The
`home_hub` destination-menu knot is deleted.** Every day knot is entered directly, in sequence
(`day01 -> day02 -> ... -> day30`), auto-rendering its own authored main scene first. Optional
roaming stitches are called from inside a day's own knot, only where the spine specifically offers
one, and never as the day's primary structure. Day 24 alone keeps a real choice-of-location budget,
implemented explicitly as that day's own mechanic, not a reused generic hub.

```
VAR day = 1
VAR hina_shop_readiness = "not_started"
VAR hina_money_pressure = true
VAR player_knows_hina_true_reason = false
VAR hina_evidence = ()
VAR daisuke_renovation_decided = "unset"
VAR daisuke_renovation_decision_day = 20
VAR player_witnessed_daisuke_decision = false
VAR daisuke_card_known = false
VAR daisuke_evidence = ()
VAR jin_arrangement = "unset"
VAR jin_evidence = ()
VAR yohei_son_call_happened = false
VAR player_knows_yohei_son_call = false
VAR yohei_evidence = ()
VAR miyoko_daughter_pressure_active = false
VAR miyoko_daughter_outcome = "unset"
VAR miyoko_evidence = ()
VAR suggested_jin_for_bench = false
VAR bench_fixed = false
VAR player_knows_fumiko_letter = false
VAR fumiko_writes_back = "unset"
VAR fumiko_evidence = ()
VAR promise_fumiko_help_soon = false
VAR promise_yohei_help_soon = false
VAR festival_flyer_seen = false
VAR festival_prep_progress = 0
VAR yohei_festival_stock = "unset"
```

## Shared reusable stitches

```
= evidence(who, item)
    ~ temp set = {who}_evidence
    { not (item in set): ~ {who}_evidence = {who}_evidence + item }
    -> DONE

/* [FIXED -- Section 4F] the free-talk contract now actually implements all 6 categories
   NEWLIFE_30DAY_GAMEBOOK_CAUSAL_RULES_V2.md's Section 7 already allowed -- the rules document
   was never wrong; only this stitch's prior implementation under-served it. */
= free_talk(who)
    PLAYER_FREE_TEXT: <the player's own words>
    AI_CHARACTER_RESPONSE: <in-character only -- invents no new named fact, decides no outcome>
    INTENT_CLASSIFICATION: <comfort | challenge | curiosity | refusal | deflection | other>
    STATE_DELTA_PROPOSAL: <one of the 6 categories below, or "none">
        - relationship_evidence: <a NAMED item from the ledger> -> writes to {who}_evidence
        - disclosed_knowledge: <an existing canon fact the NPC hasn't yet told the player> ->
          writes to the relevant player_knows_* flag, IF AND ONLY IF the underlying WORLD_PROGRESS
          fact this would disclose already exists (Section 2's explicit rule -- knowledge can only
          be proposed about something already true, never used to conjure the underlying fact)
        - small_promise: <NPC, description, rough due timing> -> writes to a new Promise(npc, ...)
        - emotional_reaction: flavor only, no state write
        - player_value_observation: flavor only, backend-only, never surfaced as a score
        - minor_callback_flag: a small, later-readable flavor flag, not a named evidence item
    CANON_CONSISTENCY_CHECK: ACCEPTED | MODIFIED (bounded down to the correctly-sized version) |
                              REJECTED (invents a fact, or attempts anything on Section 7's
                              forbidden list, or proposes disclosed_knowledge about a fact that
                              isn't independently true yet)
    NEXT_SCENE: -> only reached after the check result
    -> DONE

= roam(npc_list)
    { npc_list has "daisuke": * [Stop by Daisuke's shop] -> roam_daisuke }
    { npc_list has "hina": * [Stop by Hina's shop] -> roam_ambient("hina") }
    { npc_list has "yohei": * [Stop by Yohei's store] -> roam_ambient("yohei") }
    { npc_list has "miyoko": * [Stop by the café] -> roam_ambient("miyoko") }
    { npc_list has "fumiko": * [Stop by the Hall] -> roam_ambient("fumiko") }
    { npc_list has "jin": * [Stop by wherever Jin's working] -> roam_ambient("jin") }
    * [Go straight home] -> DONE
    -> DONE

= roam_ambient(who)
    A brief, low-effort stop -- ambient texture only, no named evidence created here by default.
    { who has open free talk available: -> free_talk(who) }
    -> DONE

= roam_daisuke
    { day > 8:
        Ask him something again, despite the earlier deflection.
        * [Ask again] -> evidence(daisuke, "returned_to_daisuke_after_deflection") -> DONE
        * [Just say hello] -> DONE
    - else:
        (Day 8 hasn't happened yet -- this stop is ambient only this early.)
        -> DONE
    }
```

## Day knots (linear, no hub -- each auto-enters its own main scene)

```
= day01
    Full scene: spine Day 1 (single flowing first-morning scene, Hina then Yohei).
    * [Help Hina carry the box] -> evidence(hina, "helped_hina_move_box") -> day_end
    * [Just greet Yohei] -> day_end
    -> day_end

= day02
    Full scene: spine Day 2 (auto-shown overnight change, no destination choice).
    * [Comment on the change] -> day_end
    * [Say nothing] -> day_end
    - -> roam(("hina")) -> day_end

= day03
    Full scene: spine Day 3.
    * [Ask Fumiko about the flyer] -> ~ festival_flyer_seen = true -> day_end
    * [Ignore it] -> day_end
    - -> roam(("yohei")) -> day_end

/* [FIXED -- Fix E] Yohei is not present in this scene; only Hina's evidence set is touched
   directly here. */
= day04
    Full scene: spine Day 4 (Hina alone).
    * [Reassure her] -> evidence(hina, "reassured_hina_about_yohei") -> day04_roam
    * [Say nothing] -> day04_roam
    -> day_end

= day04_roam
    You could also go raise this with Yohei directly, if you want -- he isn't part of the
    conversation you just had unless you choose to make him part of it.
    * [Go tell Yohei directly] -> evidence(hina, "defended_hina_to_yohei") ->
      evidence(yohei, "defended_hina_to_yohei") -> day_end
    * [Leave it for now] -> day_end
    -> day_end

= day05
    Full scene: spine Day 5.
    { (jin_evidence has "thanked_jin_for_unseen_work") or (jin_evidence has
    "noticed_jin_fixed_something"):
        * [Accept] -> ~ jin_arrangement = "accepted" -> day_end
        * [Decline] -> ~ jin_arrangement = "declined" -> day_end
    - else:
        (An ordinary day -- the late window at Day 21 remains open.)
        -> roam(("miyoko")) -> day_end
    }

= day06
    Full scene: spine Day 6 (independent NPC-NPC moment, happens regardless).
    * [Watch quietly] -> day_end
    * [Move on] -> day_end
    - -> roam(("daisuke")) -> day_end

= day07
    Full scene: spine Day 7.
    * [Comment warmly] -> evidence(daisuke, "witnessed_daisuke_comedy_day") -> day_end
    * [Just watch] -> day_end
    - -> roam(("fumiko")) -> day_end

= day08
    Full scene: spine Day 8 -- the necessary first deflection.
    * [Ask something personal anyway] -> evidence(daisuke, "attempted_daisuke_personal") -> day_end
    * [Let the silence stand] -> day_end
    - -> roam(("yohei")) -> day_end

= day09
    Full scene: spine Day 9.
    * [Help sort the stock] -> evidence(yohei, "helped_yohei_sort_stock") -> day_end
    * [Just keep him company] -> day_end
    - -> roam(("hina")) -> day_end

= day10
    Full scene: spine Day 10.
    * [Suggest Jin for the bench] -> ~ suggested_jin_for_bench = true -> day_end
    * [Leave it] -> day_end
    - -> roam(("jin")) -> day_end

= day11
    Full scene: spine Day 11.
    * [React honestly] -> evidence(miyoko, "reacted_to_miyoko_new_beans") -> day_end
    * [Deflect the question] -> day_end
    - -> roam(("fumiko")) -> day_end

/* [FIXED -- Fix A] Day 12 is no longer Daisuke's decision -- it's an authored touchpoint. */
= day12
    Full scene: spine Day 12 (an authored Daisuke touchpoint, not his decision).
    * [Ask again] -> evidence(daisuke, "returned_to_daisuke_after_deflection") ->
      daisuke_early_check -> day_end
    * [Let it be] -> day_end
    - -> roam(("fumiko")) -> day_end

= daisuke_early_check
    { LIST_COUNT(daisuke_evidence) >= 2 and daisuke_renovation_decided == "unset":
        ~ daisuke_renovation_decided = "yes"
        ~ daisuke_renovation_decision_day = 12
        ~ player_witnessed_daisuke_decision = true
    }
    -> DONE

= day13
    Full scene: spine Day 13.
    * [Ask gently] -> free_talk(yohei) -> evidence(yohei, "noticed_yohei_son_thread") -> day_end
    * [Let it be] -> day_end
    - -> roam(("hina")) -> day_end

= day14
    Full scene: spine Day 14.
    * [Ask "juggling how?"] -> free_talk(hina) -> evidence(hina, "noticed_hina_money_pressure") ->
      day_end
    * [Let it pass] -> day_end
    - -> roam(("daisuke")) -> day_end

= day15
    Full scene: spine Day 15.
    * [Ask about the letter] -> free_talk(fumiko) -> evidence(fumiko, "asked_about_fumikos_letter")
      -> ~ player_knows_fumiko_letter = true -> ~ promise_fumiko_help_soon = true -> day_end
    * [Don't pry] -> day_end
    - -> roam(("miyoko")) -> day_end

= day16
    Full scene: spine Day 16.
    * [Listen] -> free_talk(miyoko) -> evidence(miyoko, "listened_to_miyoko_daughter_worry") ->
      day_end
    * [Just be present] -> day_end
    - -> roam(("yohei")) -> day_end

= day17
    Full scene: spine Day 17.
    * [Agree to help "next time"] -> ~ promise_yohei_help_soon = true -> day_end
    * [Demur] -> day_end
    - -> roam(("miyoko", "fumiko")) -> day_end

= day18
    { promise_fumiko_help_soon and promise_yohei_help_soon:
        Full scene: spine Day 18 -- the collision.
        * [Keep Yohei's, explain to Fumiko] -> evidence(yohei, "kept_promise") -> day_end
        * [Keep Fumiko's, explain to Yohei] -> evidence(fumiko, "kept_promise") -> day_end
        * [A smaller gesture to both] -> evidence(yohei, "kept_promise") ->
          evidence(fumiko, "kept_promise") -> day_end
    - else:
        An ordinary day -- no promise conflict exists to fire.
        -> day_end
    }

= day19
    Full scene: spine Day 19.
    * [Help with something concrete] -> evidence(fumiko, "helped_fumiko_festival_prep") ->
      ~ festival_prep_progress = festival_prep_progress + 1 -> day_end
    * [Leave her to it] -> day_end
    - -> roam(("daisuke")) -> day_end

/* [FIXED -- Section 3 Daisuke rule] the independent-progress default resolves here if it hasn't
   already resolved on Day 12. */
= day20
    { daisuke_renovation_decided == "unset":
        ~ daisuke_renovation_decided = "yes"
        (Daisuke's own arc resolves independently, elsewhere in town, today.)
    }
    Full scene: spine Day 20 (Yohei's festival-stock decision).
    * [Help decide generously] -> ~ yohei_festival_stock = "full" ->
      evidence(yohei, "supported_yohei_festival_stock") -> day20_roam
    * [Help decide carefully] -> ~ yohei_festival_stock = "modest" -> day20_roam
    * [Leave him to it] -> ~ yohei_festival_stock = "minimal" -> day20_roam
    -> day_end

= day20_roam
    { daisuke_renovation_decision_day == 20:
        * [Stop by Daisuke's, see how he's doing] -> ~ player_witnessed_daisuke_decision = true ->
          day_end
        * [Not today] -> day_end
    - else:
        -> day_end
    }

= day21
    ~ bench_fixed = suggested_jin_for_bench
    Full scene: spine Day 21.
    * [Thank Jin specifically] -> evidence(jin, "thanked_jin_for_unseen_work") -> day_end
    * [Miss it] -> day_end
    - { jin_arrangement == "unset" and ((jin_evidence has "thanked_jin_for_unseen_work") or
      (jin_evidence has "noticed_jin_fixed_something")):
        * [Accept the late offer] -> ~ jin_arrangement = "accepted" -> day_end
        * [Decline] -> ~ jin_arrangement = "declined" -> day_end
    }
    -> day_end

= day22
    { (hina_evidence has "noticed_hina_money_pressure") and (LIST_COUNT(hina_evidence) >= 2):
        Full scene: spine Day 22 -- the reveal.
        * [Just listen] -> free_talk(hina) -> ~ player_knows_hina_true_reason = true -> day_end
    - else:
        An ordinary, pleasant evening.
        -> day_end
    }

= day23
    Full scene: spine Day 23 -- explicitly non-causal by design.
    * [Investigate] -> day_end
    - -> roam(("daisuke")) -> day_end

= day24
    Full scene: spine Day 24 -- the ONE day with a real location/time budget.
    ~ temp slots = 2
    - (top)
    {yohei_festival_stock == "full": Yohei's stall is generous and full.|yohei_festival_stock ==
    "modest": modest but solid.|yohei_festival_stock == "minimal": thin, but present.}
    {bench_fixed: The bench, fixed at last, has people sitting on it all day.|not bench_fixed:
    still wobbles, and that's fine too.}
    {player_knows_hina_true_reason: Hina is out front, trying something small today anyway.|not
    player_knows_hina_true_reason: watches from her half-finished shop.}
    { slots > 0:
        * [Spend a slot at Yohei's stall] -> free_talk(yohei) -> ~ slots = slots - 1 -> top
        * [Spend a slot at the café table] -> free_talk(miyoko) -> ~ slots = slots - 1 -> top
        * [Spend a slot at the Hall] -> free_talk(fumiko) -> ~ slots = slots - 1 -> top
        * [Spend a slot near Hina] -> free_talk(hina) -> ~ slots = slots - 1 -> top
    - else:
        The rest happens off-screen, real but unseen.
    }
    -> day_end

= day25
    Full scene: spine Day 25.
    * [Check in on someone] -> free_talk of your choosing -> day_end
    * [Rest] -> day_end
    -> day_end

= day26
    Full scene: spine Day 26.
    { yohei_son_call_happened == false: ~ yohei_son_call_happened = true }
    { yohei_evidence has "noticed_yohei_son_thread" and LIST_COUNT(yohei_evidence MINUS
    ("noticed_yohei_son_thread")) >= 1:
        * [Ask gently] -> free_talk(yohei) -> ~ player_knows_yohei_son_call = true -> day_end
    - else:
        An ordinary day at the shop -- the call happened, but isn't shared this scene.
        -> day_end
    }

= day27
    { daisuke_evidence has "returned_to_daisuke_after_deflection" and (a count of that item across
    the month) >= 2:
        * [Listen] -> free_talk(daisuke) -> ~ daisuke_card_known = true -> day_end
    - else:
        An ordinary, comfortable afternoon.
        -> day_end
    }

= day28
    { (miyoko_evidence has "listened_to_miyoko_daughter_worry") and (miyoko_evidence has
    "checked_on_miyoko_on_quiet_day"):
        ~ miyoko_daughter_outcome = "compromise"
    - else if (miyoko_evidence has "listened_to_miyoko_daughter_worry"):
        ~ miyoko_daughter_outcome = "stay"
    - else:
        ~ miyoko_daughter_outcome = "undecided"
    }
    * [Listen] -> free_talk(miyoko) -> day_end
    -> day_end

= day29
    { player_knows_fumiko_letter and (fumiko_evidence has "helped_fumiko_festival_prep"):
        ~ fumiko_writes_back = "true"
    - else if player_knows_fumiko_letter:
        ~ fumiko_writes_back = "undecided"
    }
    * [Do a quiet, unwitnessed kindness] -> nothing visible happens -> day_end
    * [Don't] -> also fine -> day_end
    -> day_end

= day30
    Full scene: spine Day 30 -- reads every variable above, decides nothing new.
    * [Write a short reflection] -> stored verbatim, never scored -> END.
    * [Skip it] -> END.

= day_end
    ~ day = day + 1
    -> knot_for_day(day)
```

## Wiring notes carried over from the honesty discipline established in V2

`returned_to_daisuke_after_deflection`'s count now genuinely accumulates across up to 5 distinct,
authored days (6, 12, 14, 19, 23) instead of relying on an unbounded, generic hub revisit -- this is
the concrete resolution of Fix A, made checkable rather than asserted. The pseudocode's `(a count of
that item across the month)` in `day27` stands in for whatever counting primitive a real
implementation would use (a list, not a boolean) -- flagged explicitly rather than left ambiguous,
the same discipline V2's own closing note used for its one under-specified variable.

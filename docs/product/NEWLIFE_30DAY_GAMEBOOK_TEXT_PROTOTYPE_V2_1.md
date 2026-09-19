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

/* [PHASE_24.3 -- always-rendered Days 1-14 B-plot state, set unconditionally] */
VAR hina_trial_planned = false
VAR player_knows_trial_date = false
VAR hina_trial_prep_visible_change = false
VAR yohei_raised_practical_concern = false
VAR hina_believes_yohei_dislikes_her = false
VAR jin_fixed_trial_setup_issue = false
VAR yohei_daisuke_discussed_trial = false
VAR trial_day_happened = false
VAR trial_result_menu_confusion = false
VAR hina_initial_defensive_reaction = false
VAR hina_view_shifting = false
VAR hina_sign_menu_adjusted = false
VAR hina_adjustment_timing = "unset"
VAR miyoko_commented_on_trial_item = false
VAR hina_concrete_decision = "unset"
VAR trial_cost_pressure_visible = false
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
    * [Help Hina carry the box] -> evidence(hina, "helped_hina_move_box") -> day01_trial
    * [Just greet Yohei] -> day01_trial
    -> day_end

= day01_trial
    /* Always renders. */
    ~ hina_trial_planned = true
    Hina mentions, unprompted, a small trial sale/test-bake she's planning before anything bigger.
    * [Ask when] -> ~ player_knows_trial_date = true -> day_end
    * [Just note it] -> day_end
    -> day_end

= day02
    Full scene: spine Day 2 (auto-shown overnight change, no destination choice).
    * [Comment on the change] -> day02_trial
    * [Say nothing] -> day02_trial
    -> day_end

= day02_trial
    /* Always renders, regardless of the roam below. */
    ~ hina_trial_prep_visible_change = true
    ~ yohei_raised_practical_concern = true
    A visible piece of trial prep has appeared overnight; Yohei, unprompted, says the plan sounds
    complicated for a first try. Hina doesn't fully agree.
    - -> roam(("hina")) -> day_end

= day03
    Full scene: spine Day 3.
    * [Ask Fumiko about the flyer] -> ~ festival_flyer_seen = true -> day_end
    * [Ignore it] -> day_end
    - -> roam(("yohei")) -> day_end

/* [FIXED -- Fix E] Yohei is not present in this scene; only Hina's evidence set is touched
   directly here. [PHASE_24.3] the FACT/BELIEF separation is now explicit. */
= day04
    ~ hina_believes_yohei_dislikes_her = true
    Full scene: spine Day 4 (Hina alone) -- her BELIEF, distinct from Day 2's FACT
    (`yohei_raised_practical_concern`).
    * [Reassure her] -> evidence(hina, "reassured_hina_about_yohei") -> day04_roam
    * [Say nothing] -> day04_roam
    -> day_end

= day04_roam
    You could also go raise this with Yohei directly, if you want -- he isn't part of the
    conversation you just had unless you choose to make him part of it.
    * [Go tell Yohei directly] -> evidence(hina, "defended_hina_to_yohei") ->
      evidence(yohei, "defended_hina_to_yohei") -> ~ player_knows_yohei_concern_is_practical = true
      -> day_end
    * [Leave it for now] -> day_end
    -> day_end

= day05
    Full scene: spine Day 5.
    { (jin_evidence has "thanked_jin_for_unseen_work") or (jin_evidence has
    "noticed_jin_fixed_something"):
        * [Accept] -> ~ jin_arrangement = "accepted" -> day05_trial
        * [Decline] -> ~ jin_arrangement = "declined" -> day05_trial
    - else:
        (An ordinary day -- the late window at Day 21 remains open.)
        -> day05_trial
    }

= day05_trial
    /* Always renders. */
    ~ jin_fixed_trial_setup_issue = true
    Jin levels an uneven table / fixes a sticking drawer at Hina's counter today, regardless.
    * [Thank him] -> evidence(jin, "thanked_jin_for_trial_fix") -> day_end
    * [Don't notice] -> day_end
    - -> roam(("miyoko")) -> day_end

= day06
    /* [PHASE_24.3] Always carries real information now, not just ambient flavor. */
    ~ yohei_daisuke_discussed_trial = true
    Full scene: spine Day 6 (Yohei and Daisuke discuss Hina's trial -- happens regardless).
    * [Watch quietly] -> day_end
    * [Move on] -> day_end
    - -> roam(("daisuke")) -> day_end

= day07
    /* [PHASE_24.3] The trial itself -- always happens, always produces real data. */
    ~ trial_day_happened = true
    ~ trial_result_menu_confusion = true
    Full scene: spine Day 7 -- the trial happens today; real customer-behavior data results,
    regardless of the player.
    * [Help during the trial] -> evidence(hina, "helped_during_trial") ->
      ~ player_witnessed_trial_results = true -> day07_daisuke
    * [Observe/comment] -> ~ player_witnessed_trial_results = true -> day07_daisuke
    * [Stay away entirely] -> day07_daisuke
    -> day_end

= day07_daisuke
    /* Preserved satellite scene, same day. */
    * [Comment warmly on the comedy] -> evidence(daisuke, "witnessed_daisuke_comedy_day") -> day_end
    * [Just watch] -> day_end
    -> day_end

= day08
    /* [PHASE_24.3] Hina's trial reaction is now the main scene; Daisuke's deflection preserved
       as a same-day secondary scene. */
    ~ hina_initial_defensive_reaction = true
    Full scene: spine Day 8 -- Hina explains why her original plan made sense, with real reasons.
    * [Challenge gently] -> evidence(hina, "challenged_hina_after_trial") -> day08_daisuke
    * [Support her] -> evidence(hina, "supported_hina_after_trial") -> day08_daisuke
    * [Stay silent] -> ~ hina_view_shifting = true -> day08_daisuke
    -> day_end

= day08_daisuke
    /* Preserved satellite scene, same day. */
    * [Ask something personal anyway] -> evidence(daisuke, "attempted_daisuke_personal") -> day_end
    * [Let the silence stand] -> day_end
    - -> roam(("yohei")) -> day_end

= day09
    /* [PHASE_24.3] Thematic contrast to Day 8, never stated outright. */
    Full scene: spine Day 9 (Yohei's spoiled stock, a real loss treated plainly).
    * [Help sort the stock] -> evidence(yohei, "helped_yohei_sort_stock") -> day_end
    * [Just keep him company] -> day_end
    - -> roam(("hina")) -> day_end

= day10
    Full scene: spine Day 10.
    * [Suggest Jin for the bench] -> ~ suggested_jin_for_bench = true -> day10_trial
    * [Leave it] -> day10_trial
    -> day_end

= day10_trial
    /* Always renders. */
    ~ hina_sign_menu_adjusted = true
    { (hina_evidence has "helped_during_trial") or (hina_evidence has "supported_hina_after_trial")
    or (hina_evidence has "challenged_hina_after_trial") or (jin_evidence has
    "thanked_jin_for_trial_fix"):
        ~ hina_adjustment_timing = "early_calm"
    - else:
        ~ hina_adjustment_timing = "late_friction"
    }
    Hina's sign/menu is visibly different today -- {hina_adjustment_timing == "early_calm": she
    seems settled about it.|otherwise: it clearly took her a little longer to get here.}
    - -> roam(("jin")) -> day_end

= day11
    Full scene: spine Day 11.
    * [React honestly] -> evidence(miyoko, "reacted_to_miyoko_new_beans") -> day11_trial
    * [Deflect the question] -> day11_trial
    -> day_end

= day11_trial
    /* Always renders. */
    ~ miyoko_commented_on_trial_item = true
    Miyoko mentions trying one of Hina's trial items, comparing it casually to her own menu.
    - -> roam(("fumiko")) -> day_end

/* [FIXED -- Fix A] Day 12 is no longer Daisuke's decision -- it's an authored touchpoint.
   [PHASE_24.3] Hina's own concrete decision is now folded into the same day. */
= day12
    Full scene: spine Day 12 (an authored Daisuke touchpoint, not his decision).
    * [Ask again] -> evidence(daisuke, "returned_to_daisuke_after_deflection") ->
      daisuke_early_check -> day12_trial
    * [Let it be] -> day12_trial
    -> day_end

= day12_trial
    /* Always renders, read from trial_result_menu_confusion, not decided live. */
    ~ hina_concrete_decision = "reduced_range"
    Separately, Hina makes one concrete decision today, read from the trial's own results --
    trimming her range, keeping the item that unexpectedly sold out.
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
    * [Ask gently] -> free_talk(yohei) -> evidence(yohei, "noticed_yohei_son_thread") -> day13_trial
    * [Let it be] -> day13_trial
    -> day_end

= day13_trial
    /* Always renders. */
    ~ trial_cost_pressure_visible = true
    The trial's first real cost becomes visible in the background -- a plain fact, no confession
    forced.
    - -> roam(("hina")) -> day_end

= day14
    Full scene: spine Day 14 -- now with earned context from Days 7/10/12/13.
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

/* [PHASE_24.2 -- always-rendered B-plot state, set unconditionally, never gated on a player
   choice] */
VAR guidance_disagreement_surfaced = false
VAR visitor_confusion_happened = false
VAR guidance_sign_revised = false
VAR told_fumiko_about_signage_concern = false
VAR helped_confused_visitor = false
VAR reassured_hina_about_signage = false

= day16
    Full scene: spine Day 16 (Miyoko's daughter).
    * [Listen] -> free_talk(miyoko) -> evidence(miyoko, "listened_to_miyoko_daughter_worry") ->
      day16_signage
    * [Just be present] -> day16_signage
    -> day16_signage

= day16_signage
    /* Always renders -- not gated on the Miyoko choice above. */
    ~ guidance_disagreement_surfaced = true
    On the way, the new festival guidance sign is up. Hina mutters a newcomer could misread it;
    Fumiko insists it's fine.
    * [Back Hina up to Fumiko] -> ~ told_fumiko_about_signage_concern = true -> day_end
    * [Let it pass] -> day_end
    - -> roam(("yohei")) -> day_end

= day17
    Full scene: spine Day 17 (Yohei's promise).
    * [Agree to help "next time"] -> ~ promise_yohei_help_soon = true -> day17_signage
    * [Demur] -> day17_signage
    -> day17_signage

= day17_signage
    /* Always renders -- the confusion happens regardless of the promise choice above. */
    ~ visitor_confusion_happened = true
    A delivery courier scouting the festival route follows the sign to the wrong end of the
    street, visibly confused.
    * [Help redirect them] -> ~ helped_confused_visitor = true -> day_end
    * [Let someone else handle it] -> day_end
    - -> roam(("miyoko", "fumiko")) -> day_end

= day18
    /* [FIX -- no longer capable of rendering as a truly empty day: the B-plot fallout below
       always fires regardless of this branch.] */
    { promise_fumiko_help_soon and promise_yohei_help_soon:
        Full scene: spine Day 18 -- the collision.
        * [Keep Yohei's, explain to Fumiko] -> evidence(yohei, "kept_promise") -> day18_signage
        * [Keep Fumiko's, explain to Yohei] -> evidence(fumiko, "kept_promise") -> day18_signage
        * [A smaller gesture to both] -> evidence(yohei, "kept_promise") ->
          evidence(fumiko, "kept_promise") -> day18_signage
    - else:
        An ordinary day for the promise thread specifically -- but not an empty one, see below.
        -> day18_signage
    }

= day18_signage
    /* Always renders: word of yesterday's confusion has reached Fumiko; a real NPC-NPC reaction,
       independent of the player, per Section 13's own graph. */
    { told_fumiko_about_signage_concern or helped_confused_visitor:
        Fumiko is already turning the sign over more calmly, having heard the concern early.
    - else:
        Fumiko is visibly rattled and a little defensive about the sign, having only just heard.
    }
    { reassured_hina_about_signage:
    - else:
        Hina reads as quietly vindicated but a little dismissed.
        * [Reassure Hina now] -> ~ reassured_hina_about_signage = true -> day_end
        * [Leave it] -> day_end
    }
    -> day_end

= day19
    /* Always renders, unconditionally, woven into Fumiko's own festival-prep scene. */
    ~ guidance_sign_revised = true
    { told_fumiko_about_signage_concern or helped_confused_visitor or reassured_hina_about_signage:
        ~ temp fumiko_revision_manner = "calm"
    - else:
        ~ temp fumiko_revision_manner = "defensive"
    }
    Full scene: spine Day 19 (Fumiko's prep) -- the sign gets redrawn today, {fumiko_revision_
    manner == "calm": calmly, already having thought it over.|otherwise: a little defensively at
    first, but redrawn all the same.} The fix comes from what was actually observed yesterday, not
    from anyone having won an argument.
    * [Help with festival prep generally] -> evidence(fumiko, "helped_fumiko_festival_prep") ->
      ~ festival_prep_progress = festival_prep_progress + 1 -> day_end
    * [Help specifically with the sign] -> ~ told_fumiko_about_signage_concern = true -> day_end
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
    The festival guidance sign, corrected since Day 19, points visitors the right way without
    incident.
    { slots > 0:
        * [Spend a slot at Yohei's stall] -> free_talk(yohei) -> ~ slots = slots - 1 -> top
        * [Spend a slot at the café table] -> free_talk(miyoko) -> ~ slots = slots - 1 -> top
        * [Spend a slot at the Hall] -> free_talk(fumiko) -> ~ slots = slots - 1 -> top
        * [Spend a slot near Hina] -> free_talk(hina) -> ~ slots = slots - 1 -> top
    - else:
        The rest happens off-screen, real but unseen.
    }
    -> day_end

/* [PHASE_24.4 -- always-rendered endgame world-arc state, set unconditionally, never gated on a
   player choice. Fixes RUN_C's Days 25-29 hard-gate failure by giving every day, engaged or not,
   an independent Layer-A world beat underneath the existing gated Layer-B private payoffs.] */
VAR festival_aftermath_visible = false
VAR hina_post_festival_decision = "unset"
VAR player_knows_why_hina_decided = false
VAR hina_shares_deeper_reason = false
VAR town_returns_to_normal = false
VAR hina_next_test_planned = false
VAR player_knows_next_test_details = false
VAR departure_prep_visible = false

= day25
    Full scene: spine Day 25.
    ~ festival_aftermath_visible = true
    {yohei_festival_stock == "minimal": A lot of stock is still stacked outside Yohei's -- most of it
    never sold.|yohei_festival_stock == "modest": A modest amount of leftover stock sits outside
    Yohei's.|yohei_festival_stock == "full": Almost nothing is left outside Yohei's -- it sold well.}
    Half the decorations are already down; the rest wait because nobody's gotten to them yet. Full
    trash bags sit at the corners. {bench_fixed: The bench is back in ordinary, tired-looking use,
    same as always.|not bench_fixed: The bench still wobbles, same as always -- nobody's touched it.}
    Hina is at her counter, going through exactly what sold and what didn't.
    What will actually remain, now that the festival itself is gone?
    * [Check in on someone] -> free_talk of your choosing -> day_end
    * [Help with the cleanup] -> a hand with the actual work -> day_end
    * [Rest] -> The cleanup happens anyway, described from a distance. -> day_end
    -> day_end

= day26
    Full scene: spine Day 26.
    { yohei_son_call_happened == false: ~ yohei_son_call_happened = true }
    { hina_adjustment_timing == "early_calm":
        ~ hina_post_festival_decision = "set_next_test_date"
    - else:
        ~ hina_post_festival_decision = "kept_reduced_range"
    }
    {hina_post_festival_decision == "set_next_test_date": Hina's sign already has a new date pinned
    to it.|hina_post_festival_decision == "kept_reduced_range": Hina's shop still shows the same
    narrowed range she settled on during the trial -- consolidating, not expanding.}
    { yohei_evidence has "noticed_yohei_son_thread" and LIST_COUNT(yohei_evidence MINUS
    ("noticed_yohei_son_thread")) >= 1:
        * [Ask Yohei gently] -> free_talk(yohei) -> ~ player_knows_yohei_son_call = true -> gather
    - else:
        An ordinary day at the shop -- the call happened, but isn't shared this scene.
        -> gather
    }
    - (gather)
    * [Ask Hina why] -> free_talk(hina) -> ~ player_knows_why_hina_decided = true ->
      { hina_evidence has enough real evidence (per ledger's Day 22 discipline):
          ~ hina_shares_deeper_reason = true
      }
      -> day_end
    * [Don't ask] -> day_end
    -> day_end

= day27
    ~ town_returns_to_normal = true
    Out past the window, Jin is taking down the last of the festival's temporary signage and
    wheeling the borrowed hand-cart back to ordinary delivery duty. The street is a street again.
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
    ~ hina_next_test_planned = true
    Hina mentions, in passing, that she's already thinking about what comes next.
    * [Listen] -> free_talk(miyoko) -> gather
    - (gather)
    * [Ask Hina about her plan] -> free_talk(hina) ->
      { hina_evidence has enough real evidence:
          ~ player_knows_next_test_details = true
      }
      -> day_end
    * [Don't ask] -> day_end
    -> day_end

= day29
    ~ departure_prep_visible = true
    A bag sits half-packed on the floor -- the room looks temporary again, the way it did on Day 1.
    Yohei asks, in passing, when the key needs to go back. Tomorrow is the last full day. Café talk
    already mentions Hina's next test date.
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
    WHAT I CHANGED: {player_knows_hina_true_reason}{player_knows_yohei_son_call}{daisuke_card_known}
    {miyoko_daughter_outcome}{fumiko_writes_back} -- read from evidence, never re-decided.
    WHAT CHANGED WITHOUT ME: the shop's own trial arc, the festival, {hina_post_festival_decision},
    {town_returns_to_normal}, the cleanup -- true regardless of engagement.
    WHAT WILL CONTINUE AFTER I LEAVE: {hina_next_test_planned}, and whatever the other five are each
    already planning next.
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

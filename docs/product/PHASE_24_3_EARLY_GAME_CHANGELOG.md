# PHASE_24.3 — Days 1-14 Early-Game World-Momentum Repair — Changelog

Targeted repair only. Does not rebuild the 30-day game; touches exactly Days 1-14, weaving new
content through the ten already-preserved beats (Day 3 flyer, Day 4 misread, Day 7 comedy, Day 8
deflection, Day 9 stock, Day 10 bench, Day 11 beans, Day 12 renovation, Day 13 phone, Day 14
money-pressure) rather than replacing any of them. Baseline: `519572d` (PHASE_24.2).

## What was wrong

`docs/research/evaluation/phase-24/RUN_B_FULL_V2_2_RAW.md` and `..._RUN_C_FULL_V2_2_RAW.md`
disclosed a real, previously-unreported hard-gate violation discovered during PHASE_24.2's full-
month revalidation: RUN_B hit a 6-consecutive-day low-`TOMORROW_PULL` streak at Days 1-6; RUN_C hit
a violation spanning nearly all of Days 1-14. Root cause: the arrival window's content depended
almost entirely on active player engagement (helping Hina, asking Fumiko about the flyer, pursuing
Daisuke, etc.), with no independent world-event floor under it for a player who declines or stays
quiet -- the same category of gap PHASE_24.2 already fixed for Days 16-19, just three times longer
and previously undetected because that round's own self-audit only scanned the specific corridor
the second evaluator had already named.

## What was added: Hina's pre-opening trial arc

One world-driven B-plot spanning Days 1-14, woven through the ten preserved beats. Human core: a
creator (Hina) plans a small test before committing further; a real customer-behavior result at the
test produces data her original plan didn't anticipate; she's initially defensive, with plausible
reasons, not a caricature; another character's simple factual question, or the data itself, is what
actually shifts her view. Informed by OWNER-01 (creator defensiveness), OWNER-02 (rushing past
discovery), OWNER-04 (visible reality beats assumption), OWNER-05 (technical/plan success isn't
product success), OWNER-07 (measure reality, don't assume the benefit) -- no real business or
identifiable event reproduced.

- **Day 1**: `hina_trial_planned` becomes true unconditionally -- a dated, concrete future event to
  wonder about, satisfying Section 6's "one concrete forward-looking question by end of Day 1."
- **Day 2**: `hina_trial_prep_visible_change` and `yohei_raised_practical_concern` (a FACT about the
  plan, explicitly distinct from any belief about Yohei's feelings) both become true unconditionally.
- **Day 3**: lightly connects the trial to the already-existing festival-flyer beat -- two horizons
  (near: the trial; later: the festival) -- without guaranteeing festival participation.
- **Day 4**: the existing Hina/Yohei misread beat is now explicitly modeled as `hina_believes_
  yohei_dislikes_her` (an NPC_BELIEF), kept permanently distinct from Day 2's FACT row in the state
  model, so no later scene can accidentally conflate "he has a practical concern" with "he dislikes
  her."
- **Day 5**: `jin_fixed_trial_setup_issue` becomes true unconditionally -- concrete, observable
  world work, requiring zero accumulated relationship evidence with Jin.
- **Day 6**: the existing Yohei/Daisuke NPC-NPC scene now carries real, specific information about
  the trial (not just ambient flavor), giving a fully passive player real content secondhand.
- **Day 7**: the trial itself happens, unconditionally (`trial_day_happened`,
  `trial_result_menu_confusion`) -- Daisuke's comedy beat is preserved as a same-day satellite
  scene, not replaced.
- **Day 8**: Hina's real, plausible, non-caricatured defensive reaction to the results becomes the
  main scene (`hina_initial_defensive_reaction`); even total player silence still produces
  `hina_view_shifting` via another character's simple factual question. Daisuke's deflection beat is
  preserved as a same-day satellite scene.
- **Day 9**: unchanged in content, now explicitly framed as an unstated thematic contrast to Day 8
  (Yohei treating a real loss as business information, not personal insult) -- nothing preached
  in-fiction.
- **Day 10**: alongside the preserved bench/Jin beat, `hina_sign_menu_adjusted` becomes true
  unconditionally; only its manner (`hina_adjustment_timing`: early/calm or late/friction) is
  player-influenced.
- **Day 11**: alongside the preserved beans beat, `miyoko_commented_on_trial_item` becomes true
  unconditionally -- a second, independent piece of real-world feedback, no player action required.
- **Day 12**: alongside the preserved Daisuke touchpoint, `hina_concrete_decision` becomes true
  unconditionally, read directly from Day 7's trial results, never decided live.
- **Day 13**: alongside the preserved Yohei phone/son beat, `trial_cost_pressure_visible` becomes
  true unconditionally -- a plain fact, no confession forced.
- **Day 14**: the preserved money-pressure crack now has earned context from the preceding 13 days
  rather than needing to carry the whole thread alone.

Full state-variable definitions, all five layers explicitly separated (WORLD_PROGRESS / NPC_BELIEF
/ PLAYER_KNOWLEDGE / RELATIONSHIP_EVIDENCE / PLAYER_INFLUENCE): `NEWLIFE_30DAY_GAMEBOOK_STATE_
MODEL_LEDGER_V2_1.md`'s new "PHASE_24.3 addition" section, and the dedicated day-by-day breakdown in
`EARLY_WORLD_ARC_STATE_TRACE.md`. Full narrative/tag updates: `NEWLIFE_30DAY_GAMEBOOK_STORY_SPINE_
V2_1.md`'s Days 1-14 (now all carrying an `OPEN_QUESTION_AT_DAY_END` tag, per this task's new
requirement). Full playable wiring: `NEWLIFE_30DAY_GAMEBOOK_TEXT_PROTOTYPE_V2_1.md`'s `day01`
through `day14` knots.

## What the design rule guarantees, explicitly

Per Section 4, restated in the ledger: every WORLD_PROGRESS row listed above is a fact player
intervention may never prevent, skip, or cause not to exist. Player choices only ever affect timing
(`hina_adjustment_timing`), confidence/manner (`hina_accepted_lesson_speed`), relationship, and
knowledge -- never whether the trial happens, what it reveals, or whether Hina eventually adjusts.

## Result of the corridor and full revalidation

See `RUN_B_D1_D14_CORRIDOR_RAW.md`, `RUN_C_D1_D14_CORRIDOR_RAW.md`, the four `RUN_*_FULL_V2_3_RAW.md`
files, and `PHASE_24_3_STREAK_AUDIT.md` for the actual replayed data and scripted streak
calculations.

# PHASE_24.3 — Early World Arc State Trace (Section 4)

Explicit, day-by-day separation of the five layers for every Days 1-14 beat touched by the Hina
trial arc, per Section 4's exact example format. Never conflated: WORLD_PROGRESS is true regardless
of the player; NPC_BELIEF is a character's own (possibly wrong) read of a WORLD_PROGRESS fact;
PLAYER_KNOWLEDGE is what the player has actually been told/shown; RELATIONSHIP_EVIDENCE is the
named, specific thing the player did; PLAYER_INFLUENCE is the narrow, bounded way evidence can
accelerate or color a WORLD_PROGRESS fact that happens regardless.

## Day 1
- WORLD_PROGRESS: `hina_trial_planned = true` (always).
- NPC_BELIEF: none yet.
- PLAYER_KNOWLEDGE: `player_knows_trial_date` (only if asked).
- RELATIONSHIP_EVIDENCE: `helped_hina_move_box` (if helped).
- PLAYER_INFLUENCE: none yet -- too early for anything to be influenced.

## Day 2
- WORLD_PROGRESS: `hina_trial_prep_visible_change = true`; `yohei_raised_practical_concern = true`
  (a FACT about the plan, always true).
- NPC_BELIEF: none yet (Hina has not yet reinterpreted the concern as personal -- that's Day 4).
- PLAYER_KNOWLEDGE: whether the player personally witnessed the exchange (flavor only).
- RELATIONSHIP_EVIDENCE: none new.
- PLAYER_INFLUENCE: none.

## Day 3
- WORLD_PROGRESS: `festival_flyer_seen` (if asked); the near/later horizon pairing exists
  regardless of whether it's discussed.
- NPC_BELIEF: none.
- PLAYER_KNOWLEDGE: whether the player connects the trial and the festival explicitly.
- RELATIONSHIP_EVIDENCE: none new.
- PLAYER_INFLUENCE: none -- festival participation is never guaranteed by this connection.

## Day 4
- WORLD_PROGRESS: `yohei_raised_practical_concern` remains true (unchanged from Day 2).
- NPC_BELIEF: `hina_believes_yohei_dislikes_her = true` -- **explicitly her own misreading of the
  Day 2 FACT, not a new fact about Yohei himself.**
- PLAYER_KNOWLEDGE: `player_knows_yohei_concern_is_practical` (only if the player separately raises
  it with Yohei directly, per the `day04_roam` stitch -- never automatically implied by comforting
  Hina alone).
- RELATIONSHIP_EVIDENCE: `reassured_hina_about_yohei` (Hina-only, if reassured); `defended_hina_to_
  yohei` (Hina AND Yohei, only if the separate Yohei-present scene happens).
- PLAYER_INFLUENCE: whether Yohei's own thaw toward Hina ever has a scene to draw on.

## Day 5
- WORLD_PROGRESS: `jin_fixed_trial_setup_issue = true` (always, zero evidence required).
- NPC_BELIEF: none.
- PLAYER_KNOWLEDGE: whether the player saw Jin do it.
- RELATIONSHIP_EVIDENCE: `thanked_jin_for_trial_fix` (if thanked).
- PLAYER_INFLUENCE: contributes to Jin's own separate standing-arrangement evidence total (Days 5/
  21), not to anything in the trial arc itself.

## Day 6
- WORLD_PROGRESS: `yohei_daisuke_discussed_trial = true` (always, same content regardless of
  witnessing).
- NPC_BELIEF: Yohei's and Daisuke's own independent opinions about the trial, forming without the
  player.
- PLAYER_KNOWLEDGE: whether the player personally overheard the conversation's content.
- RELATIONSHIP_EVIDENCE: none new.
- PLAYER_INFLUENCE: none.

## Day 7
- WORLD_PROGRESS: `trial_day_happened = true`; `trial_result_menu_confusion = true` (both always,
  system-owned, never proposable by free talk per Section 9).
- NPC_BELIEF: none yet (Hina's own reaction is Day 8).
- PLAYER_KNOWLEDGE: `player_witnessed_trial_results` (if present/observing/helping).
- RELATIONSHIP_EVIDENCE: `helped_during_trial` (if helped); `witnessed_daisuke_comedy_day` (if the
  preserved satellite scene is visited).
- PLAYER_INFLUENCE: none on the results themselves; only on whether the player has firsthand
  knowledge of them going into Day 8.

## Day 8
- WORLD_PROGRESS: `hina_view_shifting = true` (always, even in total player silence -- another NPC
  asks the factual question that does this work).
- NPC_BELIEF: `hina_initial_defensive_reaction = true` (always) -- her real, plausible defense of
  the original plan.
- PLAYER_KNOWLEDGE: whether the player was present for the reaction and/or the shift.
- RELATIONSHIP_EVIDENCE: `challenged_hina_after_trial` / `supported_hina_after_trial` (mutually
  exclusive per visit, both equally valid); `attempted_daisuke_personal` (preserved satellite scene).
- PLAYER_INFLUENCE: feeds `hina_adjustment_timing`, read at Day 10.

## Day 9
- WORLD_PROGRESS: Yohei's spoiled stock (preserved, unchanged); no new trial-arc WORLD_PROGRESS
  today -- this day is a deliberate, unstated thematic echo, not a new plot beat.
- NPC_BELIEF: none new.
- PLAYER_KNOWLEDGE: none new.
- RELATIONSHIP_EVIDENCE: `helped_yohei_sort_stock` (preserved).
- PLAYER_INFLUENCE: none for the trial arc specifically.

## Day 10
- WORLD_PROGRESS: `hina_sign_menu_adjusted = true` (always); the bench thread (preserved, separate
  gate).
- NPC_BELIEF: none new (Hina has already moved past the initial defensiveness by now, per Day 8's
  `hina_view_shifting`).
- PLAYER_KNOWLEDGE: whether the player is present to see the adjustment directly.
- RELATIONSHIP_EVIDENCE: `suggested_jin_for_bench` (preserved, unrelated gate).
- PLAYER_INFLUENCE: `hina_adjustment_timing` (`"early_calm"` or `"late_friction"`) -- **the only
  thing player intervention touches here; the adjustment itself is fixed.**

## Day 11
- WORLD_PROGRESS: `miyoko_commented_on_trial_item = true` (always, zero player action required).
- NPC_BELIEF: Miyoko's own casual comparison, formed independently.
- PLAYER_KNOWLEDGE: whether the player is present to hear it.
- RELATIONSHIP_EVIDENCE: `reacted_to_miyoko_new_beans` (preserved, unrelated to the trial-item
  comment itself).
- PLAYER_INFLUENCE: none.

## Day 12
- WORLD_PROGRESS: `hina_concrete_decision` set (always, read from Day 7's `trial_result_menu_
  confusion`, never decided live); Daisuke's own decision-date logic (preserved, separate gate).
- NPC_BELIEF: none new (this is the resolution of Day 8's belief-shift, not a new belief).
- PLAYER_KNOWLEDGE: whether the player is present to hear about the decision.
- RELATIONSHIP_EVIDENCE: `returned_to_daisuke_after_deflection` (preserved, unrelated gate).
- PLAYER_INFLUENCE: the CONFIDENCE/manner with which the decision reads, via Days 5-10's
  accumulated evidence -- never which decision is made.

## Day 13
- WORLD_PROGRESS: `trial_cost_pressure_visible = true` (always, a plain fact, no confession
  forced); Yohei's son-thread (preserved, separate gate).
- NPC_BELIEF: none new.
- PLAYER_KNOWLEDGE: whether the player notices the cost pressure.
- RELATIONSHIP_EVIDENCE: `noticed_yohei_son_thread` (preserved, unrelated to the trial).
- PLAYER_INFLUENCE: none on the cost pressure itself.

## Day 14
- WORLD_PROGRESS: `hina_money_pressure` (already true since early in the month, per the original
  ledger) is now contextually connected to everything Days 7-13 already made visible.
- NPC_BELIEF: none new.
- PLAYER_KNOWLEDGE: `noticed_hina_money_pressure` (if asked) -- now landing with real, externally
  observable context behind it, not as an isolated line.
- RELATIONSHIP_EVIDENCE: `noticed_hina_money_pressure` (preserved gate, unchanged mechanically).
- PLAYER_INFLUENCE: none new -- this day's job is payoff/context, not a new lever.

**World reality never depends on player knowledge, at any point in this table** -- the explicit
check this document exists to make auditable, per Section 4's closing instruction.

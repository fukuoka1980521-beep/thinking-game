# NEW LIFE 30-Day Gamebook — State Model / Ledger V2.1 (PHASE_24.1)

Repairs `NEWLIFE_30DAY_GAMEBOOK_STATE_MODEL_LEDGER_V2.md`'s six concrete, named defects the second
evaluator found. `RELATIONSHIP_EVIDENCE` as a concept survives unchanged (per Section 6, "preserve
strong PHASE24 material") -- what's fixed is where it was allowed to silently do work it should
never have been trusted with: standing in for world state, standing in for knowledge, or being
checked so loosely that a single item could satisfy two different requirements at once.

## The core separation (Section 2/3): four distinct kinds of state per character

Every major character now tracks these as genuinely separate variables, never conflated:

- **WORLD_PROGRESS** -- what is objectively true about the world/plot, independent of the player.
  Progresses on its own, on a schedule or its own internal logic, whether or not the player ever
  visits that character.
- **PLAYER_KNOWLEDGE** -- what the player has actually been told or shown. A WORLD_PROGRESS fact
  can be true while `PLAYER_KNOWLEDGE` about it stays false, if the player never engaged with the
  right scene.
- **RELATIONSHIP_EVIDENCE** -- the named, specific, append-only evidence set from V2, unchanged in
  form. Its job is narrower than V2 sometimes let it become: it decides what an NPC *shares*,
  whether help is *accepted*, what the player gets to *witness*, and how an already-in-motion event
  *resolves in the telling* -- never whether an unrelated external fact exists at all.
- **PLAYER_INFLUENCE** -- the specific, bounded ways relationship evidence is allowed to *accelerate
  or color* a WORLD_PROGRESS fact that would happen anyway (e.g. moving a decision's date earlier,
  never manufacturing the decision from nothing).

## Hina

| Variable | Kind | Behavior |
|---|---|---|
| `hina_shop_readiness` | WORLD_PROGRESS | Enum: `not_started -> in_progress -> near_ready -> open`. Advances one tier automatically roughly every 8-10 days regardless of the player (the shop is HER project). |
| `hina_money_pressure` | WORLD_PROGRESS | Boolean, true from early in the month regardless of whether anyone knows it -- a real fact about her situation, not created by a conversation. |
| `player_knows_hina_true_reason` | PLAYER_KNOWLEDGE | Only true after the specific deep-talk scene where she actually says it (unchanged trigger conditions from V2's `hina_true_reason_known`, renamed for clarity that this is knowledge, not a world change). |
| `hina_relationship_evidence` | RELATIONSHIP_EVIDENCE | Unchanged set from V2 (`helped_hina_move_box`, `asked_hina_about_her_goal`, `noticed_hina_money_pressure`, `reassured_hina_about_yohei` [renamed, see Fix E below], `reassured_hina_after_criticism`). |
| PLAYER_INFLUENCE rule | -- | Specific concrete help (`reassured_hina_after_criticism`, or a NEW item `helped_hina_prep_shelves`) can advance `hina_shop_readiness` ONE tier early, on top of its automatic schedule -- it can never single-handedly cause the shop to reach `open` on its own, and `player_knows_hina_true_reason` has NO effect on `hina_shop_readiness` whatsoever (**the specific conflation the evaluator flagged, now explicitly severed**). |

## PHASE_24.3 addition — Hina's pre-opening trial arc (Days 1-14 corridor repair)

Added to fix the Days 1-14 low-`TOMORROW_PULL` streak found in PHASE_24.2's full-month revalidation
(`docs/research/evaluation/phase-24/RUN_B_FULL_V2_2_RAW.md`, `..._RUN_C_FULL_V2_2_RAW.md`). Runs
as a B-plot woven THROUGH the ten already-preserved Days 1-14 beats (Day 3 flyer, Day 4 misread,
Day 7 comedy, Day 8 deflection, Day 9 stock, Day 10 bench, Day 11 beans, Day 12 renovation, Day 13
phone, Day 14 money-pressure) -- none replaced. Human core: a creator (Hina) plans a small test
before committing further; reality (actual customer behavior at the trial) produces data her
original plan didn't anticipate; she's initially a little defensive about it, with plausible reasons,
not a caricature; another person's simple factual question, or the data itself, is what actually
shifts her view -- not an argument being "won." Informed by OWNER-01/02/04/05/07 (creator
defensiveness; rushing past discovery; the visible current reality beats assumption; technical/plan
success isn't product success; measure reality, don't assume the benefit). No real business or
identifiable event reproduced.

Every row below is explicitly tagged with its layer (Section 4's required five: WORLD_PROGRESS /
NPC_BELIEF / PLAYER_KNOWLEDGE / RELATIONSHIP_EVIDENCE / PLAYER_INFLUENCE), never conflated.

| Variable | Layer | Behavior |
|---|---|---|
| `hina_trial_planned` | WORLD_PROGRESS | **Always true from Day 1** -- Hina announces/is visibly prepping a small trial-sale/test-bake day, dated for around Day 7. Not gated on any player choice. |
| `hina_trial_prep_visible_change` | WORLD_PROGRESS | **Always true from Day 2** -- a sign, shelf arrangement, trial menu, or piece of equipment visibly appears/changes overnight, checkable independent of the player. |
| `yohei_raised_practical_concern` | WORLD_PROGRESS (a FACT) | **Always true from Day 2** -- Yohei (or another NPC) makes one practical comment that the plan seems complicated. This is a real, stated concern about the PLAN, not about Hina personally. |
| `hina_believes_yohei_dislikes_her` | NPC_BELIEF | Hina's own subjective misreading of `yohei_raised_practical_concern` as personal dislike -- explicitly modeled as a BELIEF, separate from the FACT above, so the state model itself cannot conflate "he has a practical concern" with "he dislikes her." |
| `jin_fixed_trial_setup_issue` | WORLD_PROGRESS | **Always true from Day 5** -- Jin does one piece of concrete setup/repair work connected to Hina's trial, regardless of any accumulated relationship evidence with him. |
| `yohei_daisuke_discussed_trial` | WORLD_PROGRESS | **Always true from Day 6** -- an NPC-NPC scene (independent of the player, per Section 13's established graph) where the upcoming trial is discussed, giving even a fully passive player secondhand information. |
| `trial_day_happened` | WORLD_PROGRESS | **Always true from Day 7** -- the trial itself occurs, unconditionally. |
| `trial_result_menu_confusion` | WORLD_PROGRESS | **Always true from Day 7**, a specific, concrete, observable customer-behavior fact (e.g. too many choices slowed ordering; one item sold out, another barely moved) -- never a disaster, just real data. |
| `hina_initial_defensive_reaction` | NPC_BELIEF | **Always true from Day 8** -- she explains, with plausible reasons, why her original plan made sense. A real, in-character beat, not a caricature. |
| `hina_view_shifting` | WORLD_PROGRESS | **Always true from Day 8**, regardless of player silence -- another NPC asks a simple factual question ("which one actually sold?"), and the data itself begins moving her view, independent of whether the player says anything. |
| `hina_sign_menu_adjusted` | WORLD_PROGRESS | **Always true by Day 10** -- a visible change to her sign/menu/display order. PLAYER_INFLUENCE (below) affects only WHEN and HOW SMOOTHLY, never WHETHER. |
| `miyoko_commented_on_trial_item` | WORLD_PROGRESS | **Always true from Day 11** -- an NPC-NPC crossover (Miyoko comparing/commenting on one of Hina's trial items), no player action required. |
| `hina_concrete_decision` | WORLD_PROGRESS | **Always true by Day 12** -- one specific, independent decision (reduce range / simplify sign / reorder display / delay an item / keep an unexpectedly popular one), read from `trial_result_menu_confusion`, not decided live. |
| `trial_cost_pressure_visible` | WORLD_PROGRESS | **Always true from Day 13** -- the first real cost/invoice/cash-pressure consequence of the trial becomes visible in the background. No confession forced; a fact, not a scene demanding the player's presence. |
| `player_knows_trial_date` | PLAYER_KNOWLEDGE | True if the player engages Day 1's announcement. |
| `player_knows_yohei_concern_is_practical` | PLAYER_KNOWLEDGE | True only if the player is told/shown this distinctly from `hina_believes_yohei_dislikes_her` -- the state model enforces these can never be merged into one flag. |
| `player_witnessed_trial_results` | PLAYER_KNOWLEDGE | True if present on Day 7. |
| `helped_hina_trial_prep` | RELATIONSHIP_EVIDENCE | Structural, Days 1-2. |
| `noticed_jin_trial_fix` / `thanked_jin_for_trial_fix` | RELATIONSHIP_EVIDENCE | Structural, Day 5. |
| `helped_during_trial` | RELATIONSHIP_EVIDENCE | Structural, Day 7. |
| `supported_hina_after_trial` / `challenged_hina_after_trial` | RELATIONSHIP_EVIDENCE | Structural/free-talk, Day 8 -- **both are valid, evidence-creating responses**; challenging her respectfully is not penalized relative to supporting her. |
| `helped_hina_adjust_sign` | RELATIONSHIP_EVIDENCE | Structural, Day 10. |
| `hina_adjustment_timing` | PLAYER_INFLUENCE (derived) | `"early_calm"` if any Day 5-9 evidence exists by Day 10; `"late_friction"` otherwise -- **`hina_sign_menu_adjusted` itself is unaffected**, only its manner and date within the Day 8-10 window. |
| `hina_accepted_lesson_speed` | PLAYER_INFLUENCE (derived) | Colors how quickly Day 8's dialogue reads as accepting vs. still defending -- never whether she eventually adjusts (that is fixed, per `hina_concrete_decision`). |

**The explicit no-intervention guarantee for Days 1-14** (same discipline as PHASE_24.2's Days
16-19 fix): every one of the WORLD_PROGRESS rows above renders regardless of player choice. A
fully passive player still receives, in order: a dated future event to wonder about (Day 1), a
visible overnight change plus a real disagreement about the plan (Day 2), a real customer-behavior
result (Day 7), a real reaction plus a nudge from another character (Day 8), a visible adjustment
(Day 10), an NPC-NPC crossover (Day 11), a concrete decision (Day 12), and a visible cost pressure
(Day 13) -- eight separate, unavoidable beats across the fourteen days, on top of the ten already-
preserved beats this arc weaves through.

## Fix E (Section 4E) — Day 4's evidence item was semantically wrong

V2's `defended_hina_to_yohei` was created from a Hina-only conversation and incorrectly credited
Yohei too, even though Yohei never witnessed or learned about it. Split:

- `reassured_hina_about_yohei` -- created in the Hina-only scene (Day 4), added ONLY to
  `hina_relationship_evidence`.
- `defended_hina_to_yohei` -- now requires a SEPARATE, later scene where the player actually raises
  Hina with Yohei directly, Yohei present. Only this creates `yohei_relationship_evidence`'s entry
  of the same name. An NPC never gains relationship evidence from a conversation they were not
  party to and were never told about -- restated as a hard rule, not just fixed in this one case.

## Yohei

| Variable | Kind | Behavior |
|---|---|---|
| `yohei_son_call_happened` | WORLD_PROGRESS | Boolean. **Set automatically around Day 20, unconditionally, regardless of any player evidence** (Section 3's option B, chosen over an authored intermediate causal action -- a real family reaching out on their own timeline is more honest than requiring the player to have somehow caused it). This is a real, independent world event. |
| `player_knows_yohei_son_call` | PLAYER_KNOWLEDGE | Only true if the player is told, gated on relationship evidence (see the fixed gate below) -- **the call itself no longer depends on the player at all; only whether the player LEARNS about it does.** |
| `yohei_relationship_evidence` | RELATIONSHIP_EVIDENCE | `noticed_yohei_son_thread`, `helped_yohei_sort_stock`, `supported_yohei_festival_stock`, `defended_hina_to_yohei` (now correctly Yohei-witnessed only, per Fix E). |

### Fix D (Section 4D) — the Day 26/DAY-26-equivalent gate must require DISTINCT evidence

V2's gate read "`noticed_yohei_son_thread` AND at least 1 additional item," but never explicitly
excluded the noticing item itself from that count -- exactly the ambiguity the evaluator caught.
**Corrected gate, explicit set-difference**:

```
player_knows_yohei_son_call = yohei_son_call_happened
                               AND noticed_yohei_son_thread
                               AND COUNT(yohei_relationship_evidence MINUS {noticed_yohei_son_thread}) >= 1
```

A player who only ever noticed the phone-glance moment and did nothing else with Yohei genuinely
does NOT learn about the call this playthrough -- the call still happens (world progress is real and
independent), the player simply isn't told about it this time.

## Daisuke

| Variable | Kind | Behavior |
|---|---|---|
| `daisuke_renovation_decided` | WORLD_PROGRESS | Enum: `unset -> yes`. **Resolves to `yes` automatically by Day 20 regardless of player involvement** (his own independent arc, per Section 3's explicit "let his own independent world arc progress regardless"). |
| `daisuke_renovation_decision_day` | WORLD_PROGRESS | The actual day it resolves -- defaults to Day 20, but PLAYER_INFLUENCE (see below) can move it earlier. |
| `player_witnessed_daisuke_decision` | PLAYER_KNOWLEDGE | True only if the player is actually present/engaged on the day it resolves. |
| `daisuke_card_known` | PLAYER_KNOWLEDGE | Unchanged trigger from V2: `returned_to_daisuke_after_deflection >= 2`. |
| `daisuke_relationship_evidence` | RELATIONSHIP_EVIDENCE | `witnessed_daisuke_comedy_day`, `attempted_daisuke_personal`, `returned_to_daisuke_after_deflection` (a counter, not a boolean -- unchanged from V2), `witnessed_daisuke_fumiko_confiding`. |
| PLAYER_INFLUENCE rule | -- | **A single `attempted_daisuke_personal` no longer causes the decision by itself** (Section 3's explicit fix -- this was V2's actual bug). Requires `COUNT(daisuke_relationship_evidence) >= 2` (meaningful accumulated evidence, matching Section 3's "OR" clause's other branch) to move `daisuke_renovation_decision_day` from Day 20 to Day 12; below that threshold, the decision still happens (Day 20, on his own), the player simply isn't there for it as early. |

## Jin

Unchanged in kind from V2 (`jin_arrangement`, early Day-5 + late Day-21 windows, evidence-gated),
now explicitly informed by OWNER-04/OWNER-06 (see provenance) for the Day 21 bench-repair detail:
Jin re-examines the bench's actual physical state up close before fixing it, rather than fixing from
memory of what a "wobbly bench" usually needs -- a small, concrete, in-character beat, not a
mechanical change.

| Variable | Kind | Behavior |
|---|---|---|
| `suggested_jin_for_bench` | WORLD_PROGRESS (was a `temp` variable across days in V2 -- **Fix B, now persistent canonical state**) | Boolean, set Day 10, read directly at Day 21. No more temp-variable hack. |
| `bench_fixed` | WORLD_PROGRESS | `= suggested_jin_for_bench`, read at Day 21. |
| `jin_arrangement` | WORLD_PROGRESS | `unset -> accepted -> declined`, two windows (Day 5, Day 21), unchanged concept from V2. |
| `jin_relationship_evidence` | RELATIONSHIP_EVIDENCE | `noticed_jin_fixed_something`, `thanked_jin_for_unseen_work`. |

## Miyoko — Fix (Section 3, three canon-valid states via an authored rule, not a live decision)

| Variable | Kind | Behavior |
|---|---|---|
| `miyoko_daughter_pressure_active` | WORLD_PROGRESS | True from Day 16 onward regardless of player. |
| `miyoko_daughter_outcome` | WORLD_PROGRESS | Enum: `unset -> stay | compromise | undecided`, decided by the AUTHORED RULE below, at Day 28. |
| `miyoko_relationship_evidence` | RELATIONSHIP_EVIDENCE | `reacted_to_miyoko_new_beans`, `listened_to_miyoko_daughter_worry`, `checked_on_miyoko_on_quiet_day`. |

**Authored decision rule** (informed by OWNER-07's "stop assuming, measure the real thing"
pattern -- deterministic, never an LLM live decision):

```
IF listened_to_miyoko_daughter_worry AND checked_on_miyoko_on_quiet_day (real attentiveness across
   BOTH a direct conversation and an unprompted quiet moment):
    miyoko_daughter_outcome = "compromise"
ELSE IF listened_to_miyoko_daughter_worry (one genuine real conversation, nothing further):
    miyoko_daughter_outcome = "stay"  (she decides for herself, having been truly heard once --
                                        a legitimate, self-directed resolution, not requiring
                                        ongoing support to be real)
ELSE:
    miyoko_daughter_outcome = "undecided"  (thread stays open past Day 30, legitimate)
```

This directly fixes V2's actual bug (every successful gate hardcoded to "compromise" regardless of
which or how much evidence existed).

## Fumiko — Fix C (Section 4C, `fumiko_writes_back` had no complete setter path)

V2 declared and read `fumiko_writes_back` in the Day 30 retrospective text but never authored a
scene that actually sets it -- a real, confirmed dead variable.

| Variable | Kind | Behavior |
|---|---|---|
| `suggested_jin_for_bench` | (shared with Jin's table above) | -- |
| `player_knows_fumiko_letter` | PLAYER_KNOWLEDGE | Set at Day 15 if `asked_about_fumikos_letter`. |
| `fumiko_writes_back` | WORLD_PROGRESS | **NEW, authored setter**: resolved at a new Day 29-adjacent scene (see spine), by rule: `IF player_knows_fumiko_letter AND helped_fumiko_festival_prep: fumiko_writes_back = true` (real attentiveness across two different moments) `ELSE IF player_knows_fumiko_letter: fumiko_writes_back = "undecided"` (she's still thinking about it) `ELSE: fumiko_writes_back = "unset"` (the thread never became visible enough to resolve at all). |
| `fumiko_relationship_evidence` | RELATIONSHIP_EVIDENCE | `suggested_jin_for_bench`, `asked_about_fumikos_letter`, `helped_fumiko_festival_prep`. |

## PHASE_24.2 addition — the guidance-sign micro-arc (Days 16-19 corridor repair)

Added to fix the Days 16-19 low-`TOMORROW_PULL` corridor found in PHASE_24.1's RUN_B/RUN_C
(`docs/research/evaluation/phase-24/NEWLIFE_30DAY_CLAUDE_VERDICT_V2_1.md`). Runs as a B-plot
*under* the existing Day 16 (Miyoko)/17 (Yohei promise)/18 (collision)/19 (Fumiko prep) main
scenes -- it does not replace any of them. Human core: a creator (Fumiko) believes something she
made (the festival guidance sign) is clear; another person (Hina) says it's confusing; the creator
doesn't fully accept the feedback at first; a real, observed event later proves the feedback had a
point; the fix comes from observing reality, not from anyone "winning" the argument. Informed by
OWNER-01 (creator defensiveness toward criticism), OWNER-04 (the visible current reality beats
assumption), and OWNER-07 (measure reality, don't treat expected benefit as fact) -- no real
business or identifiable event reproduced.

| Variable | Kind | Behavior |
|---|---|---|
| `guidance_disagreement_surfaced` | WORLD_EVENT | **Always true from Day 16**, regardless of the player -- Hina notices the new festival sign could mislead a newcomer; Fumiko initially thinks it's fine. Narrated as ambient scene text every playthrough, not gated on any choice. |
| `visitor_confusion_happened` | WORLD_EVENT | **Always true from Day 17**, regardless of the player -- a delivery courier scouting the festival follows the sign to the wrong end of the street. Narrated as ambient scene text every playthrough. |
| `guidance_sign_revised` | WORLD_EVENT | **Always true by Day 19**, regardless of the player -- the sign gets corrected because the confusion actually happened and was seen, not because anyone was persuaded by argument alone. This is the one fact PLAYER_INFLUENCE may never prevent or skip, per Section 2's explicit "reality eventually reveals the problem regardless of player intervention" rule. |
| `player_knows_guidance_disagreement` | PLAYER_KNOWLEDGE | True if the player engages the Day 16 aside at all (reading the ambient text counts as narrated; this flag specifically tracks whether the player *responded* to it). |
| `player_witnessed_visitor_confusion` | PLAYER_KNOWLEDGE | True if the player is present for the Day 17 aside. |
| `told_fumiko_about_signage_concern` | RELATIONSHIP_EVIDENCE (Fumiko) | Structural, Day 16 or 17 -- the player actively tells Fumiko that Hina has a point, BEFORE the visitor incident is common knowledge. |
| `helped_confused_visitor` | RELATIONSHIP_EVIDENCE (town-wide, counts as Fumiko+Hina evidence) | Structural, Day 17 -- the player redirects the confused visitor. |
| `reassured_hina_about_signage` | RELATIONSHIP_EVIDENCE (Hina) | Structural/free-talk, Day 16 or 18 -- comforts Hina if she reads as dismissed. |
| `fumiko_accepted_feedback_early` | PLAYER_INFLUENCE (derived, not independently settable) | `= told_fumiko_about_signage_concern` (only true if raised BEFORE Day 17's incident, i.e. on Day 16). Colors the MANNER of Day 19's revision, never whether it happens. |
| `fumiko_revision_manner` | RESOLUTION shape | `"calm"` if `fumiko_accepted_feedback_early` OR (`told_fumiko_about_signage_concern` OR `helped_confused_visitor`) exists by Day 19; `"defensive"` otherwise -- **the sign is revised either way**; only the telling differs. |
| `hina_feels_respected` | RELATIONSHIP_EFFECT | `= reassured_hina_about_signage OR told_fumiko_about_signage_concern`. If false, she's quietly vindicated but privately reads as dismissed -- a real, textured, non-blocking outcome, not a failure state. |
| `player_remembered_as_helpful_signage` | RELATIONSHIP_EFFECT | `= told_fumiko_about_signage_concern OR helped_confused_visitor`. |

**The explicit no-intervention guarantee for Days 16-19** (Section 3's hard requirement, "never NO
PLAYER ACTION = NO SCENE"): even with zero player choices made anywhere in this corridor, Days 16-19
each still render a real WORLD_EVENT beat (the disagreement, the confusion, the fallout, the fix), a
real NPC-NPC reaction (Fumiko and Hina's own dynamic moves independent of the player, exactly like
the Section 13 relationship graph already established for other pairs), a visible, checkable
progression (the sign's own text/layout is literally different by Day 19), and a forward-pointing
hook at every step (Day 16 -> "will anything come of this," Day 17 -> "how does Fumiko take it,"
Day 18 -> "what happens to the sign now"). Player intervention only ever changes the RELATIONSHIP_
EFFECT and RESOLUTION-shape variables above -- never `guidance_disagreement_surfaced`,
`visitor_confusion_happened`, or `guidance_sign_revised` themselves.

## PHASE_24.4 addition — the endgame world arc (Days 25-29 corridor repair)

Added to fix RUN_C's last remaining full-month hard-gate failure (`MAX_LOW_PULL_STREAK = 5` at Days
25-29, disclosed in PHASE_24.2 and confirmed still open at the close of PHASE_24.3). Root cause,
per this task's own diagnosis: Days 25-29 previously contained only gated private-character
payoffs (Yohei's son, Daisuke's card, Miyoko's daughter outcome) plus one deliberately-silent
kindness beat -- a player who earned none of those gates experienced five straight days of nothing.
**The fix is not to loosen any gate** -- every existing private reveal keeps its exact trigger
condition, unchanged. The fix is a second, independent layer underneath them: **FESTIVAL AFTERMATH
-> RETURN TO ORDINARY LIFE -> WHAT CONTINUES AFTER PLAYER LEAVES**, a continuous, low-key,
unconditional world arc, never a crisis.

| Variable | Layer | Behavior |
|---|---|---|
| `festival_aftermath_visible` | WORLD_PROGRESS | **Always true from Day 25** -- half-removed decorations, leftover stock, full trash bags, tired residents, the bench's actual fixed/not-fixed state visible in ordinary use, Hina examining what sold, Yohei counting what's left. Every detail reads directly from prior state (`bench_fixed`, `yohei_festival_stock`, `trial_result_menu_confusion`), never invented fresh. |
| `hina_post_festival_decision` | WORLD_PROGRESS | **Always true by Day 26** -- one practical decision, distinct from Day 12's trial-based one: `"set_next_test_date"` if `hina_adjustment_timing == "early_calm"` (confident, forward-looking), else `"kept_reduced_range"` (cautious, consolidating). Read from existing state, never decided live. |
| `player_knows_why_hina_decided` | PLAYER_KNOWLEDGE | True only if the player specifically asks and has real accumulated Hina evidence -- separate from the WORLD FACT that she decided at all, which every player sees regardless. |
| `hina_shares_deeper_reason` | RELATIONSHIP_EVIDENCE-gated (PRIVATE_TRUST) | Whether she tells the player the fuller "why," distinct from the plain result -- gated the same way her Day 22 reveal already is. |
| `town_returns_to_normal` | WORLD_PROGRESS | **Always true from Day 27** -- Jin removes the festival's temporary signage/decorations and the delivery hand-cart goes back to ordinary duty; a plain, visible sign the event is over and life continues. |
| `hina_next_test_planned` | WORLD_PROGRESS | **Always true by Day 28** -- Hina is already planning her next small test, unconditionally (the trial arc's own throughline given a real, forward-looking close, per Section 6's explicit "world has a future" requirement). |
| `player_knows_next_test_details` | PLAYER_KNOWLEDGE | Gated on Hina relationship evidence, same discipline as every other "how much detail" gate in this design. |
| `departure_prep_visible` | WORLD_PROGRESS | **Always true from Day 29** -- practical departure signals (packing begins, the room looks temporary again, someone asks when the key goes back, town gossip already references Day 28's next-test news) rendered BEFORE the private-kindness choice, not instead of it. |

**The explicit no-intervention guarantee for Days 25-29**: every WORLD_PROGRESS row above renders
regardless of player choice, exactly like the Days 1-14 and Days 16-19 arcs before it. A fully
passive player who earns none of the three remaining private gates (Yohei's son, Daisuke's card,
Miyoko's outcome) still receives, in order: a visible, state-consistent aftermath (Day 25), a real
practical decision from Hina (Day 26), a visible sign the town is moving on (Day 27), a concrete
future plan (Day 28), and visible departure signals before the final private choice (Day 29) --
five separate, unavoidable beats, never fewer than the engaged player receives, only less privately
detailed.

## PHASE_24.5 addition — the pre-festival world arc (Days 20-23 corridor repair)

Added to fix RUN_C's newly-surfaced, pre-existing `MAX_LOW_PULL_STREAK = 3` at Days 21-23
(disclosed in PHASE_24.4's own audit as a defect that was always present in the data but never
separately flagged, because the largest streak at Days 25-29 masked it as the reported maximum).
Root cause: Day 21 (Jin's unseen work, invisible if unthanked), Day 22 (Hina's private reveal,
evidence-gated, "ordinary evening" if the gate is not met) and Day 23 (the deliberately cosmetic
false alarm) are each individually defensible in isolation, but stacked back-to-back for a quiet,
minimally-engaged persona they produce three flat, low-pull days immediately before the festival.
**The private gates are unchanged** -- the fix is the same Layer-A/Layer-B principle used in every
prior corridor repair: one continuous, unconditional public arc -- **THE FESTIVAL BECOMES
PHYSICALLY REAL** -- running underneath Days 20-23, visible regardless of relationship depth.

| Variable | Layer | Behavior |
|---|---|---|
| `festival_setup_visible_day21` | WORLD_PROGRESS | **Always true from Day 21** -- folding tables, ropes, temporary stands, and rearranged Hall furniture appear in the street/Hall, independent of whether the player notices or thanks Jin. Read from `yohei_festival_stock`'s eventual scale (Day 20) and `bench_fixed`'s state (Day 21) for concrete detail, never invented fresh. |
| `festival_commitments_visible_day22` | WORLD_PROGRESS | **Always true from Day 22** -- participants visibly commit to concrete versions of what they'll actually do (Hina's own commitment, see below; other stalls' positions becoming fixed rather than tentative). Independent of Hina's private gate. |
| `hina_festival_offering_decided` | WORLD_PROGRESS | **Always true by Day 22** -- a specific, practical festival-facing decision (reduced menu / one weak item cut / one popular item kept / a changed sign or table layout / how small her presence will be), read directly from the Days 1-14 trial arc's own `trial_result_menu_confusion` / `hina_concrete_decision`, never decided live. This is distinct from, and never conditioned on, `player_knows_hina_true_reason` (Day 22's existing private gate, unchanged) -- a player who never earns the private reveal still sees exactly what Hina will offer at the festival. |
| `player_knows_hina_offering_reason` | PLAYER_KNOWLEDGE | Whether the player is told WHY that specific offering was chosen (practical reasoning only) -- separate from the deeper financial/personal story, which stays behind Day 22's existing evidence gate exactly as before. |
| `festival_final_state_visible_day23` | WORLD_PROGRESS | **Always true from Day 23** -- final stall positions, Yohei's stock physically present at the Day-20-determined scale, Hina's decided offering visible in place, Jin's last practical setup item finished, the street recognizably transformed from Day 1. Renders whether or not the player investigates or ignores the false alarm. |

**The explicit no-intervention guarantee for Days 20-23**: every WORLD_PROGRESS row above renders
regardless of player choice. A fully passive player who earns none of Day 21's thanks-gate, Day
22's private-reveal gate, or Day 23's roaming stop still receives, in order: a visibly transforming
street (Day 21), a concrete, practical festival decision from Hina and other stalls visibly
committing (Day 22), and a fully realized, visibly complete pre-festival street (Day 23) -- three
separate, unavoidable public beats, exactly as detailed as what an engaged player sees, only without
the private layer underneath. **No private reveal (Hina's true reason, Daisuke's card, Yohei's
family details, Miyoko's daughter thread, Jin's arrangement, Fumiko's letter) is made easier, more
visible, or automatically granted by this addition** -- each keeps its exact pre-existing gate.

## Fix F (Section 4F) — the free-talk contract's proposal categories, now actually wired

`NEWLIFE_30DAY_GAMEBOOK_CAUSAL_RULES_V2.md`'s Section 7 already correctly listed 6 allowed
AI-originated proposal categories (emotional reaction / disclosed knowledge / relationship evidence
/ small promise / player-value observation / minor callback flag) -- **that rule document was never
wrong.** The bug was entirely in `NEWLIFE_30DAY_GAMEBOOK_TEXT_PROTOTYPE_V2.md`'s own
`free_talk()` stitch, which only actually implemented `STATE_DELTA_PROPOSAL` as "a named evidence
item, or none," silently dropping the other 5 categories the rule document already allowed. No rules
document needed changing; only the prototype's implementation needed to catch up, which
`NEWLIFE_30DAY_GAMEBOOK_TEXT_PROTOTYPE_V2_1.md`'s rebuilt `free_talk()` stitch now does explicitly
(see that file).

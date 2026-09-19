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

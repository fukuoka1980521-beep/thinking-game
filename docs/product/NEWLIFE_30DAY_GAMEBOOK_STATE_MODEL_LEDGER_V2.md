# NEW LIFE 30-Day Gamebook — State Model / Ledger V2 (PHASE_24)

Replaces `NEWLIFE_30DAY_GAMEBOOK_STATE_MODEL_V1.md` and `..._STATE_LEDGER_V1.md` with one combined
document (the two are merged this revision, since the rebuild's central change -- `RELATIONSHIP_
EVIDENCE` -- touches both the categorized rationale and the concrete variable sheet at once).
Categories unchanged in kind from V1 (`WORLD_FACT`/`CHARACTER_FACT`/`RELATIONSHIP`/`KNOWLEDGE`/
`PROMISE`/`OPEN_THREAD`/`PLAYER_OBSERVED_VALUE`/`VISUAL_STATE`) except `RELATIONSHIP`, which is
rebuilt entirely around evidence rather than a raw counter.

## RELATIONSHIP_EVIDENCE — the fix for V1's documented failure

V1's `relationship_X`/`familiarity_X` counters moved only on free-talk use. The V1 playthrough hit
this twice (Hina's and Daisuke's biggest reveals silently never fired despite heavy structural
engagement -- see `NEWLIFE_30DAY_CLAUDE_VERDICT_V1.md`). V2 replaces both counters with an
append-only list of **named, specific evidence items per NPC**, each created either directly by a
fixed structural choice or, for free talk, only after passing the Canon Gate
(`NEWLIFE_30DAY_GAMEBOOK_CAUSAL_RULES_V2.md` Section 7). Mere visiting/presence creates none.

### Hina
| Evidence item | Created by |
|---|---|
| `helped_hina_move_box` | structural "help" choice (Day 1-equivalent) |
| `asked_hina_about_her_goal` | free-talk, Canon Gate ACCEPTED |
| `noticed_hina_money_pressure` | free-talk, "juggling how?" scene |
| `defended_hina_to_yohei` | structural, connecting the Yohei/Hina misread |
| `reassured_hina_after_criticism` | structural "help her hear the useful part" |

**Gate — `hina_true_reason_known`**: requires (`asked_hina_about_her_goal` OR
`noticed_hina_money_pressure`) AND at least 2 total Hina evidence items of any kind. Replaces V1's
`relationship_hina >= 3` (a single free-talk-only counter).

### Daisuke
| Evidence item | Created by |
|---|---|
| `witnessed_daisuke_comedy_day` | structural, weak evidence (presence at an authored scene) |
| `attempted_daisuke_personal` | free-talk, a personal question asked (deflected or not) |
| `returned_to_daisuke_after_deflection` | structural/free-talk: visiting again on a LATER day after having been deflected at least once already |
| `witnessed_daisuke_fumiko_confiding` | structural, ambient (NPC-NPC scene witnessed) |

**Gate — `daisuke_card_known`**: requires `returned_to_daisuke_after_deflection` count `>= 2`. This
is the direct, deliberate fix for V1's exact gap: it rewards *persistence after being turned away*
specifically, which a raw "talked to him N times" counter cannot distinguish from someone who
free-talks constantly but never comes back after a deflection.
**Gate — `daisuke_renovation_decided`**: requires at least 1 of `attempted_daisuke_personal` OR
`returned_to_daisuke_after_deflection` (a lower bar -- this is the shorter, more practical arc).

### Jin
| Evidence item | Created by |
|---|---|
| `noticed_jin_fixed_something` | structural, ambient noticing |
| `thanked_jin_for_unseen_work` | structural, specific thanks (not generic) |
| `offered_jin_standing_arrangement` | structural choice, gated below |

**Gate — standing-arrangement offer (early window, ~Day 5)**: requires `thanked_jin_for_unseen_work`
OR `noticed_jin_fixed_something` count `>= 2` by that point.
**Gate — standing-arrangement offer (late window, ~Day 20, NEW in V2)**: same evidence requirement,
re-checked later in the month. V1's verdict flagged that an entire character arc could go untouched
for 30 days purely from early-game prioritization; V2 explicitly does not permanently lock this
behind a single early check.

### Yohei
| Evidence item | Created by |
|---|---|
| `helped_yohei_sort_stock` | structural "help sort" choice |
| `noticed_yohei_son_thread` | free-talk, the phone-glance scene, Canon Gate ACCEPTED |
| `supported_yohei_festival_stock` | structural, generous festival-budget choice |
| `defended_hina_to_yohei` | shared with Hina's table -- cross-character evidence is explicitly allowed |

**Gate — `yohei_son_recontacted`**: requires `noticed_yohei_son_thread` AND at least 1 additional
Yohei evidence item (any kind) -- a single lucky deep-talk question alone is not sufficient; ongoing
real presence is also required.

### Miyoko
| Evidence item | Created by |
|---|---|
| `reacted_to_miyoko_new_beans` | structural, honest reaction |
| `listened_to_miyoko_daughter_worry` | free-talk, Canon Gate ACCEPTED |
| `checked_on_miyoko_on_quiet_day` | structural, visiting during an unprompted slow/quiet moment specifically |

**Gate — `miyoko_daughter_outcome`**: requires `listened_to_miyoko_daughter_worry` AND at least 2
total Miyoko evidence items -- the slowest-resolving arc by design, per
`NEWLIFE_30DAY_GAMEBOOK_CHARACTER_ARCS_V2.md`.

### Fumiko
| Evidence item | Created by |
|---|---|
| `suggested_jin_for_bench` | structural choice |
| `asked_about_fumikos_letter` | free-talk, Canon Gate ACCEPTED |
| `helped_fumiko_festival_prep` | structural, concrete-task choice |

**Gate — `bench_fixed`**: requires `suggested_jin_for_bench` (independent of the letter thread).
**Gate — `fumiko_writes_back`**: requires `asked_about_fumikos_letter` (independent of the bench).
**Combined festival-day bonus text**: requires both.

## Remaining categories (unchanged in kind from V1, restated briefly)

- **WORLD_FACT**: `festival_flyer_seen`, `festival_prep_progress`, `yohei_festival_stock`
  (unset/minimal/modest/full), `bench_fixed`, `festival_day_outcome` (composite read, never an
  independently-set variable).
- **CHARACTER_FACT**: the gated booleans/enums above (`hina_true_reason_known`,
  `yohei_son_recontacted`, `daisuke_renovation_decided`, `daisuke_card_known`,
  `miyoko_daughter_outcome`, `fumiko_writes_back`).
- **KNOWLEDGE**: per-NPC awareness of facts, distinct from the fact being true -- e.g. Yohei does
  not automatically know `hina_true_reason_known` just because it's true; only a scene that
  explicitly shares it moves this.
- **PROMISE**: a stated future commitment with a due day. V1's Day 18 double-booked-favor event was
  found in the V1 verdict to trigger on raw relationship warmth rather than an actual promise --
  V2's Day-18-equivalent event is required to key specifically off this category instead (see
  `NEWLIFE_30DAY_GAMEBOOK_STORY_SPINE_V2.md`).
- **OPEN_THREAD**: an unresolved thread with no due day (e.g. the renovation quote, the wobbly
  bench, before either resolves).
- **PLAYER_OBSERVED_VALUE**: qualitative-only surfacing of accumulating values (e.g.
  `festival_prep_progress` shown as "the hall looks almost ready," never a raw number) -- unchanged
  discipline from V1.
- **VISUAL_STATE**: still N/A for this text-only phase; the asset spec from PHASE_22
  (`NEWLIFE_DAY1_DAY2_VISUAL_STATE_DELTA_ASSET_SPEC_V1.md`) remains the reference for what a later,
  real implementation would need.

## Canon Gate bounding rule (restated concretely for evidence proposals)

A free-talk `STATE_DELTA_PROPOSAL` naming one of the evidence items above, of the size already
described in its table row, is ACCEPTED. A proposal naming an evidence item not in any table (a new,
invented kind of relationship progress) is REJECTED. A proposal that's directionally right but
oversized (e.g. proposing a full reveal-gate unlock from a single line of free talk) is MODIFIED
down to "create the single relevant evidence item," never accepted at the requested full size and
never rejected outright -- identical bounding discipline to
`NEWLIFE_30DAY_GAMEBOOK_CAUSAL_RULES_V2.md` Section 7, restated here against the concrete evidence
vocabulary.

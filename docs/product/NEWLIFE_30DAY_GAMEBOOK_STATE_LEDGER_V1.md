# NEW LIFE 30-Day Gamebook — State Ledger V1 (Phase G package component)

A flat, concrete reference of every variable the text prototype
(`NEWLIFE_30DAY_GAMEBOOK_TEXT_PROTOTYPE_V1.md`) actually declares and uses -- distinct from
`NEWLIFE_30DAY_GAMEBOOK_STATE_MODEL_V1.md`'s categorized design rationale. This is the sheet an
evaluator checks a variable's current value against while playing, not an explanation of *why* the
categories exist.

| Variable | Type | Initial value | Set by (day) | Read by (day) |
|---|---|---|---|---|
| `day` | int | 1 | end_of_day (every day) | every knot's opening line |
| `actions_left` | int | 2 | resets each `end_of_day`; decremented by each location visit | every `home_hub` render |
| `everVisited` | set | {} | any first visit to a location | Day 2 (world-moved check) |
| `relationship_hina` | int | 0 | free_talk(hina) (+1 each use) | Day 22 gate (`>= 3`) |
| `relationship_yohei` | int | 0 | free_talk(yohei) (+1 each use) | Day 18 gate (`> 0`) |
| `relationship_daisuke` | int | 0 | free_talk(daisuke) (+1 each use) | (not currently gated on directly -- `familiarity_daisuke` is used instead) |
| `relationship_jin` | int | 0 | free_talk(jin) (+1 each use) | Day 5 gate (`>= 2`) |
| `relationship_miyoko` | int | 0 | free_talk(miyoko) (+1 each use) | (not currently gated on directly) |
| `relationship_fumiko` | int | 0 | free_talk(fumiko) (+1 each use) | Day 18 gate (`> 0`) |
| `familiarity_daisuke` | int | 0 | Day 8 (+1), any later deep-talk attempt (+1) | Day 12 gate (`>= 2`), Day 27 gate (`>= 4`) |
| `festival_flyer_seen` | bool | false | Day 3 (if asked) | flavor only -- no hard gate reads it |
| `festival_prep_progress` | int | 0 | Day 19 (+1 if helped) | Day 24 (composite festival read) |
| `yohei_festival_stock` | enum(unset/minimal/modest/full) | unset | Day 20 | Day 24 (composite festival read) |
| `bench_noted` | bool | false | Day 10 (if suggested) | Day 21 (`bench_fixed = bench_noted`) |
| `bench_fixed` | bool | false | Day 21 (derived from `bench_noted`) | Day 24 (composite festival read) |
| `hina_money_noticed` | bool | false | Day 14 (if asked) | Day 22 gate (part of `hina_true_reason_known`) |
| `hina_true_reason_known` | bool | false | Day 22 (`hina_money_noticed AND relationship_hina >= 3`) | Day 24 (composite festival read), Day 30 (retrospective) |
| `yohei_son_noticed` | bool | false | Day 13 (if asked) | Day 26 gate |
| `yohei_son_recontacted` | bool | false | Day 26 (`= yohei_son_noticed`) | Day 30 (retrospective) |
| `daisuke_renovation_decided` | enum(unset/yes/no) | unset | Day 12 (`yes` if `familiarity_daisuke >= 2`, else stays `unset`) | Day 30 (retrospective) |
| `daisuke_card_known` | bool | false | Day 27 (`familiarity_daisuke >= 4`) | Day 30 (retrospective) |
| `miyoko_daughter_active` | bool | false | Day 16 (if listened) | Day 28 gate |
| `miyoko_daughter_outcome` | enum(unset/stayed/compromise/undecided) | unset | Day 28 (if `miyoko_daughter_active`) | Day 30 (retrospective) |
| `fumiko_letter_received` | bool | false | Day 15 (if asked) | Day 30 (retrospective, texture only) |
| `jin_arrangement` | enum(unset/accepted/declined) | unset | Day 5 (only if offered, i.e. `relationship_jin >= 2`) | Day 29 (texture only), Day 30 (retrospective) |

## Notes for the evaluator

- Every gate above is a plain boolean/threshold check over this table -- nothing in the design
  requires guessing what an AI "decided"; every outcome is traceable to a row in this ledger.
- Several rows are read only for flavor text, not for hard branching (`festival_flyer_seen`,
  `fumiko_letter_received` outside its own day) -- these exist because the story spine treats them
  as real state even where the current text prototype doesn't yet gate further content on them; a
  fuller build could add more downstream reads without changing this ledger's shape.
- `relationship_daisuke` and `relationship_miyoko` exist (any free talk with them increments them)
  but nothing in the current 30-day spine reads them directly -- `familiarity_daisuke` is the actual
  gate for Daisuke's arc, tracked as a separate counter. This asymmetry is intentional per Phase D
  (KNOWLEDGE and CHARACTER_FACT are modeled distinctly from raw relationship warmth) but is worth an
  evaluator's attention: is a *second*, differently-named counter for the same person's arc
  confusing, or is the distinction (general warmth vs. specific arc-relevant familiarity) doing real
  work? This is exactly the kind of question a blind second read is for.

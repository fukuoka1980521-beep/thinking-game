# RUN_C — Days 23-30 Corridor Test (PHASE_24.4, Section 10)

Persona: quiet, inconsistent, low-engagement -- **unchanged from every prior round**. No behavior
change was applied to force a pass; this replay uses the exact same choice pattern RUN_C has used
since PHASE_24.1 (declines most free-talk depth, misses most evidence gates, rests rather than acts
on ambiguous prompts). Days 23-24 are carried forward unchanged from `RUN_C_FULL_V2_3_RAW.md` (Day
23 PULL=1, non-causal "did not investigate" day; Day 24 PULL=3, one brief slot at Yohei's thin
stall, second slot resting -- `yohei_festival_stock = "minimal"`, `bench_fixed = false`,
`player_knows_hina_true_reason = false`). Scoring uses the five frozen definitions in
`PHASE_24_4_EVALUATION_DEFINITIONS.md`, unchanged mid-round.

## Day 23 (carried forward, unchanged)

TOMORROW_PULL: 1. WORLD_PROGRESS_VISIBLE: Y (the false alarm is a real town-visible happening, per
the PHASE_24.3-corrected standard this round adopts as frozen). OPEN_QUESTION_AT_DAY_END: "was that
really nothing, or is something actually wrong." PLAYER_CAUSALITY: NO. WHAT_CHANGED_WITHOUT_PLAYER:
the false alarm itself, town-wide. WHAT_CHANGED_BECAUSE_OF_PLAYER: --.

## Day 24 (carried forward, unchanged)

TOMORROW_PULL: 3. WORLD_PROGRESS_VISIBLE: Y. OPEN_QUESTION_AT_DAY_END: "how will the shop actually
do, now that the festival's over." PLAYER_CAUSALITY: PARTIAL (present at Yohei's stall, but the
stock level and Hina's readiness were already fixed by prior state). WHAT_CHANGED_WITHOUT_PLAYER:
the festival happened at all; the sign worked without incident. WHAT_CHANGED_BECAUSE_OF_PLAYER: --
(no new evidence created this day for this persona).

## Day 25 -- `festival_aftermath_visible` (new, PHASE_24.4)

RUN_C rests rather than checking in on anyone or helping with cleanup -- consistent with the
established persona. Layer A renders regardless: the aftermath is concrete and specific --
leftover festival stock stacked outside Yohei's (a lot, since `yohei_festival_stock = "minimal"`
means little sold), half the decorations still up, the bench still wobbling exactly as before
(`bench_fixed = false`), Hina reviewing what actually sold. The cleanup is described from a
distance, since RUN_C rested.

TOMORROW_PULL: **3** (up from the pre-repair value of 2 -- justified: real, specific, state-derived
detail now exists where before there was only "soft, satisfied quiet"; no persona change, only new
unconditional content). WORLD_PROGRESS_VISIBLE: **Y** (was N pre-repair). OPEN_QUESTION_AT_DAY_END:
"What will actually remain, now that the festival itself is gone?" -- grounded directly in the
visible leftover stock, not manufactured. PLAYER_CAUSALITY: NO. WHAT_CHANGED_WITHOUT_PLAYER: the
aftermath itself -- leftover stock, half-cleared decorations, the bench's unchanged state, Hina's
review of sales. WHAT_CHANGED_BECAUSE_OF_PLAYER: --.

## Day 26 -- `hina_post_festival_decision` (new, PHASE_24.4) + Yohei gate (unchanged, not met)

RUN_C does not ask Yohei gently (the `noticed_yohei_son_thread` gate was never met across the month
for this persona, per established data) and does not ask Hina why either -- consistent passivity.
Both facts still render as world state: `hina_adjustment_timing` was never `"early_calm"` for this
disengaged a persona, so `hina_post_festival_decision = "kept_reduced_range"` -- visible directly in
the shop's still-narrowed range, no dialogue required to notice it. Yohei's call happened but stays
unshared this scene, exactly as before.

TOMORROW_PULL: **3** (up from 2 -- justified: a real, visible shop-state fact now exists that did not
before; the persona did not become curious, the world simply has more in it). WORLD_PROGRESS_VISIBLE:
**Y** (was Y already, for a different reason -- now doubly grounded). OPEN_QUESTION_AT_DAY_END:
"something happened at Yohei's today, but no one's said what" -- a genuine knowledge gap, not a
manufactured question; distinctly worded from Day 25's to avoid duplication. PLAYER_CAUSALITY: NO.
WHAT_CHANGED_WITHOUT_PLAYER: Hina kept her reduced range; Yohei and his son talked. WHAT_CHANGED_
BECAUSE_OF_PLAYER: --.

## Day 27 -- `town_returns_to_normal` (new, PHASE_24.4) + Daisuke gate (unchanged, not met)

RUN_C's `returned_to_daisuke_after_deflection` count never reached 2 across the month (established,
unchanged) -- an ordinary, comfortable afternoon at Daisuke's, no card. Independently and
unconditionally, Jin is visible taking down the last festival signage and returning the hand-cart to
ordinary duty -- requires no player involvement, renders regardless.

TOMORROW_PULL: **3** (up from 1 -- justified: a concrete, visible town-level event now exists this
day where before there was only "an ordinary, comfortable afternoon" with nothing behind it for this
persona). WORLD_PROGRESS_VISIBLE: **Y** (was N pre-repair). OPEN_QUESTION_AT_DAY_END: "the town is
visibly moving on without waiting for me -- what happens once it's fully back to normal?"
PLAYER_CAUSALITY: NO. WHAT_CHANGED_WITHOUT_PLAYER: Jin removed the signage; the hand-cart went back
to ordinary duty; the street looks like a street again. WHAT_CHANGED_BECAUSE_OF_PLAYER: --.

## Day 28 -- `hina_next_test_planned` (new, PHASE_24.4) + Miyoko rule (unchanged, resolves "undecided")

Miyoko's rule resolves `miyoko_daughter_outcome = "undecided"` for this persona (neither evidence
condition was met, established, unchanged). Independently, Hina mentions in passing that she's
already thinking about her next small test -- this renders regardless of engagement.
`player_knows_next_test_details` stays false, since RUN_C does not ask further (consistent
passivity) -- the bare fact is still heard.

TOMORROW_PULL: **3** (up from 1 -- justified: a genuine forward-looking world fact now exists this
day; RUN_C did not become engaged, the world simply kept moving). WORLD_PROGRESS_VISIBLE: **Y** (was
Y already for Miyoko's resolution; now doubly grounded by Hina's beat). OPEN_QUESTION_AT_DAY_END:
"Hina's already planning something next -- what will it actually be?" PLAYER_CAUSALITY: NO.
WHAT_CHANGED_WITHOUT_PLAYER: Miyoko's daughter situation resolved to "undecided"; Hina is already
planning her next test. WHAT_CHANGED_BECAUSE_OF_PLAYER: --.

## Day 29 -- `departure_prep_visible` (new, PHASE_24.4, rendered BEFORE the private beat)

Before any private choice, the day opens with concrete, practical departure signals: a bag
half-packed on the floor, the room looking temporary again, Yohei asking in passing when the key
goes back, tomorrow marked as the last full day, café gossip already referencing Hina's next test
from Day 28. RUN_C then declines the private kindness (consistent with this persona's low
engagement) -- no visible trace either way, by design. `fumiko_writes_back` stays `"unset"`
(`player_knows_fumiko_letter` was never true for this persona, established, unchanged).

TOMORROW_PULL: **3** (up from 2 -- justified: the day now has a full, concrete unconditional scene
before the private beat, where before the whole day's content for a disengaged player was two bare
lines). WORLD_PROGRESS_VISIBLE: **Y** (was N pre-repair). OPEN_QUESTION_AT_DAY_END: "what does
tomorrow, the actual last day, look like?" PLAYER_CAUSALITY: PARTIAL (the private choice was made,
even though it produced no visible trace by the beat's own design; the departure-prep facts
themselves are unconditional). WHAT_CHANGED_WITHOUT_PLAYER: the departure prep itself -- packing,
the key question, the town's gossip, tomorrow's status as the last day. WHAT_CHANGED_BECAUSE_OF_
PLAYER: -- (declined the kindness; no visible trace, by design).

## Day 30

Retrospective; excluded from PULL/WORLD_PROGRESS/OPEN_QUESTION scoring per the frozen definitions'
own Day-30 convention (N/A, not a scored day). RUN_C's reflection reads thin on the WHAT I CHANGED
column (mostly `--`), substantial on WHAT CHANGED WITHOUT ME (shop's own trial arc landed on
`kept_reduced_range`, the festival happened, the town cleaned up and returned to normal), and
substantial on WHAT WILL CONTINUE AFTER I LEAVE (`hina_next_test_planned = true`, bare fact only,
no detail) -- itself a meaningful, honest difference from RUN_A/D's much fuller WHAT I CHANGED
column, without inflating RUN_C's own engagement level to get there.

## Corridor gate check (Section 10), script-verified

```python
pull = [1, 3, 3, 3, 3, 3, 3]  # Days 23-29
wp   = ['Y','Y','Y','Y','Y','Y','Y']  # Days 23-29
oq   = ['present']*7  # Days 23-29, all grounded, none NONE

def max_consec_le(seq, t=2):
    best = cur = 0
    for v in seq:
        cur = cur + 1 if v <= t else 0
        best = max(best, cur)
    return best

def max_consec_eq(seq, val):
    best = cur = 0
    for v in seq:
        cur = cur + 1 if v == val else 0
        best = max(best, cur)
    return best

print("MAX_LOW_PULL_STREAK:", max_consec_le(pull, 2))        # 1 (Day 23 only, isolated)
print("MAX_NO_WORLD_PROGRESS_STREAK:", max_consec_eq(wp, 'N'))  # 0
print("MAX_NO_OPEN_QUESTION_STREAK:", max_consec_eq(oq, 'NONE'))  # 0
```

Output: `MAX_LOW_PULL_STREAK = 1`, `MAX_NO_WORLD_PROGRESS_STREAK = 0`, `MAX_NO_OPEN_QUESTION_STREAK =
0`.

## Corridor verdict

- 3 consecutive `TOMORROW_PULL <= 2`: **not present** (only Day 23 is `<=2`, isolated). PASS.
- 2 consecutive `WORLD_PROGRESS_VISIBLE = NO`: **not present** (zero N's in this window). PASS.
- 2 consecutive `OPEN_QUESTION_AT_DAY_END = NONE`: **not present** (zero NONEs in this window). PASS.

**RUN_C_D23_D30_CORRIDOR = PASS.** No persona change was applied at any point -- RUN_C remains
exactly as passive, inconsistent, and low-engagement as every prior round; only the world's own
unconditional content changed. Proceeding to full Day 1-30 revalidation for all four runs per
Section 11.

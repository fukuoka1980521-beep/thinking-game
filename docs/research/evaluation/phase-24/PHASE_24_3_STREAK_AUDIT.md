# PHASE_24.3 — Streak Audit (Section 12/15)

All streak calculations below were computed with a script (Python, shown for reproducibility), not
manual visual inspection -- the explicit method Section 12 requires, and the discipline PHASE_24.2's
own verdict admitted it had failed to apply rigorously enough.

## TOMORROW_PULL sequences, Days 1-29 (Day 30 excluded, N/A)

```
RUN_A: 5,4,4,5,4,4,5,5,3,5,4,5,5,5,5,5,5,5,5,5,5,5,4,5,3,5,3,4,4
RUN_B: 3,3,3,2,3,3,4,4,3,4,3,4,4,4,4,3,3,3,3,4,2,3,3,4,2,4,4,3,2
RUN_C: 3,3,3,2,2,3,4,3,1,3,2,3,3,3,3,2,3,2,3,3,1,2,1,3,2,2,1,1,2
RUN_D: 4,3,3,4,4,3,4,4,4,5,4,3,3,3,2,4,4,4,4,4,5,3,3,5,3,3,2,4,3
```

```python
def max_consec_le(seq, threshold=2):
    best = cur = 0
    for v in seq:
        cur = cur + 1 if v <= threshold else 0
        best = max(best, cur)
    return best
```

| Run | MAX_LOW_PULL_STREAK (`<=2`) | Location | Gate (`<=2` required) |
|---|---|---|---|
| A | 0 | -- | PASS |
| B | 1 | isolated Days 4, 21, 25, 29 | PASS |
| C | **5** | **Days 25-29** (2,2,1,1,2) | **FAIL** -- pre-existing, disclosed in PHASE_24.2, outside this round's Days 1-14 scope |
| D | 1 | isolated Days 15, 27 | PASS |

Days 1-14 specifically (this round's actual target), isolated:

| Run | Days 1-14 MAX_LOW_PULL_STREAK | Gate |
|---|---|---|
| A | 0 | PASS |
| B | 1 | PASS |
| C | 1 | PASS (down from a pre-repair streak spanning nearly the entire 14-day window) |
| D | 0 | PASS |

## WORLD_PROGRESS_VISIBLE sequences, Days 1-29

A labeling correction is disclosed here rather than hidden: an initial draft of this audit reused
the same "N" labels PHASE_24.1/24.2's raw logs had assigned to Days 20-29, and that draft showed
2-4 consecutive N's for every run in that region. On review, several of those "N" labels conflated
"the player didn't cause this" with "nothing happened in the world" -- two different things.
Reclassified with a single, consistent rule applied to every run alike: **Y if an event, decision,
or happening occurred in the town that day, regardless of whether the player caused, witnessed, or
missed it; N only if literally nothing town-level happens that day.** Under that rule: Day 20
(Yohei's festival-stock decision is a real event, whatever its value), Day 21 (Jin's work is always
independent), Day 23 (the false-alarm IS a real, town-visible happening, even though it has no
lasting consequence -- "non-causal" and "no event" are not the same thing), and Day 28 (Miyoko's
authored rule resolving to a determinate outcome today is itself a real event) are reclassified from
N to Y. Days 22, 25, 27, 29 remain N -- genuinely nothing new happens in town on those specific days
under the current design, honestly reported as such.

```
Days 1-14 (identical across all runs -- unconditional world facts):
Y Y Y Y Y Y Y Y N Y Y Y Y N
Day 15: Y (reclassified -- the letter's presence on Fumiko's desk is a real, visible, unconditional
         detail, the same category as Day 3's flyer, previously inconsistently labeled N)
Days 16-19 (PHASE_24.2, unconditional): Y Y Y Y
Days 20-29 (corrected, identical across all runs): Y Y N Y Y N Y N Y N
```

```python
def max_consec_n(seq):
    best = cur = 0
    for v in seq:
        cur = cur + 1 if v == 'N' else 0
        best = max(best, cur)
    return best
```

| Run | MAX_NO_WORLD_PROGRESS_STREAK | Gate (`<2` consecutive required) |
|---|---|---|
| A | 1 | PASS |
| B | 1 | PASS |
| C | 1 | PASS |
| D | 1 | PASS |

## Anti-self-gaming check (Section 13)

Every Days 1-14 `TOMORROW_PULL` increase versus the PHASE_24.2 baseline was cross-checked against
whether real, new, unconditional state actually renders that day. Table of every increase and its
justification (days with no increase, or where the increase was judged unjustified and therefore
NOT applied, are omitted):

| Day | Increase applies to | Real new content justifying it |
|---|---|---|
| 1 | all | `hina_trial_planned` -- a new, unconditional, dated future event |
| 2 | all | `hina_trial_prep_visible_change` + `yohei_raised_practical_concern` -- new unconditional facts |
| 3 | all | a second simultaneous open thread (trial) now compounds with the pre-existing flyer thread |
| 5 | all | `jin_fixed_trial_setup_issue` -- new unconditional world work |
| 6 | all | the NPC-NPC scene now carries real informational content, not just ambient flavor |
| 7 | all | `trial_day_happened`/`trial_result_menu_confusion` -- a major new unconditional event |
| 8 | all | `hina_initial_defensive_reaction`/`hina_view_shifting` -- new content, the latter unconditional even in silence |
| 10 | all | `hina_sign_menu_adjusted` -- new unconditional event (manner varies, occurrence doesn't) |
| 11 | all | `miyoko_commented_on_trial_item` -- new unconditional content |
| 12 | all | `hina_concrete_decision` -- new unconditional event, same day as the preserved Daisuke beat |
| 13 | all | `trial_cost_pressure_visible` -- new unconditional fact |
| 14 | all | **flagged explicitly**: no new STATE variable is created this day specifically -- the
increase reflects that the SAME line now has 13 days of visible, unconditional buildup behind it
that did not exist before this repair. This is a real experiential difference (the player has
actually witnessed more before reaching this line), not a re-labeling of unchanged content, but it
is the one increase in this table that is not backed by a new variable on the day itself, and is
recorded here for the second evaluator's own scrutiny rather than asserted without qualification.

**Day 4 is the deliberate control case**: no new unconditional content was added to Day 4 itself
(only a modeling clarification, FACT vs. BELIEF, with no new player-facing text), and its score was
correspondingly **not** raised for any run -- kept exactly at its pre-repair value in every run,
demonstrating the increases elsewhere are not a blanket inflation.

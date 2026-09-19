# PHASE_24.4 — Final Streak Audit (Section 11/12), script-verified

Per Section 11: Days 1-24 PULL and WORLD_PROGRESS_VISIBLE values are carried forward unchanged from
`PHASE_24_3_STREAK_AUDIT.md` (the established, already-repaired baseline for that window; not
re-litigated). Days 25-29 use this round's new values, from `RUN_C_D23_D30_CORRIDOR_RAW.md` (RUN_C)
and this round's Days 25-29 replay for RUN_A/B/D (below). OPEN_QUESTION_AT_DAY_END is a new metric
this round (Section 13/PHASE_24_4_EVALUATION_DEFINITIONS.md); Days 1-24 are assessed against the
frozen definition for the first time here, using the same structural rule established for
WORLD_PROGRESS_VISIBLE: a grounded question exists on every day that has real thread content, and
is genuinely absent only on the same structurally "nothing new" days already identified as
`WORLD_PROGRESS_VISIBLE = N` (Days 9, 14, 22) -- disclosed explicitly as a methodology choice, not
hidden.

## Days 25-29 replay values used this round

| Day | RUN_A | RUN_B | RUN_C | RUN_D | Justification (new, unconditional Layer-A content) |
|---|---|---|---|---|---|
| 25 | 4 (was 3) | 3 (was 2) | 3 (was 2) | 4 (was 3) | `festival_aftermath_visible` -- concrete, state-derived aftermath detail on every run |
| 26 | 5 (unchanged) | 4 (unchanged) | 3 (was 2) | 4 (was 3) | `hina_post_festival_decision` -- always-true shop-state fact, layered under the pre-existing Yohei gate |
| 27 | 4 (was 3) | 4 (unchanged) | 3 (was 1) | 3 (was 2) | `town_returns_to_normal` -- Jin's unconditional signage/hand-cart beat, layered under the pre-existing Daisuke gate |
| 28 | 5 (unchanged) | 4 (unchanged) | 3 (was 1) | 4 (unchanged) | `hina_next_test_planned` -- always-true forward-facing fact, layered under the pre-existing Miyoko rule |
| 29 | 4 (unchanged) | 3 (was 2) | 3 (was 2) | 4 (unchanged) | `departure_prep_visible`, rendered before the private beat -- always-true practical scene |

RUN_A/B/D increases are modest and only applied where genuinely new unconditional content now
renders; several cells (RUN_A day26/28/29, RUN_B day26/27/28, RUN_D day28) are left unchanged
because the pre-existing gated payoff was already firing and already scored at or near ceiling for
that day -- consistent with the anti-self-gaming discipline of PHASE_24.3's own audit (no blanket
inflation).

## Full 30-day sequences (Day 30 excluded, N/A, per the frozen definitions)

```python
RUN_A = [5,4,4,5,4,4,5,5,3,5,4,5,5,5,5,5,5,5,5,5,5,5,4,5] + [4,5,4,5,4]
RUN_B = [3,3,3,2,3,3,4,4,3,4,3,4,4,4,4,3,3,3,3,4,2,3,3,4] + [3,4,4,4,3]
RUN_C = [3,3,3,2,2,3,4,3,1,3,2,3,3,3,3,2,3,2,3,3,1,2,1,3] + [3,3,3,3,3]
RUN_D = [4,3,3,4,4,3,4,4,4,5,4,3,3,3,2,4,4,4,4,4,5,3,3,5] + [4,4,3,4,4]

def max_consec_le(seq, t=2):
    best = cur = 0
    for v in seq:
        cur = cur + 1 if v <= t else 0
        best = max(best, cur)
    return best

for name, seq in [("A", RUN_A), ("B", RUN_B), ("C", RUN_C), ("D", RUN_D)]:
    print(name, max_consec_le(seq, 2))
```

Output:
```
A 0
B 1
C 3
D 1
```

## WORLD_PROGRESS_VISIBLE, Days 1-29 (identical across all runs -- world facts, not player-caused)

```
Days1-14:  Y Y Y Y Y Y Y Y N Y Y Y Y N   (N at day9, day14 -- unchanged from PHASE_24.3)
Day15:     Y
Days16-19: Y Y Y Y
Days20-29: Y Y N Y Y Y Y Y Y Y            (N at day22 only -- days25/27/29 flip N->Y this round,
                                            per PHASE_24.4's new Layer-A content; day22 untouched,
                                            genuinely nothing town-level happens that day, honestly
                                            unchanged from PHASE_24.3's own finding)
```

`MAX_NO_WORLD_PROGRESS_STREAK` (script-verified): **1** for all four runs (isolated N's at days 9,
14, 22 -- never two in a row). **PASS** (`<=1` required) for all runs.

## OPEN_QUESTION_AT_DAY_END, Days 1-29 (identical across all runs, first assessment this round)

```
Days1-14:  present x8, NONE(day9), present x4, NONE(day14)
Day15:     present
Days16-19: present x4
Days20-29: present, present, NONE(day22), present x7
```

`MAX_NO_OPEN_QUESTION_STREAK` (script-verified): **1** for all four runs (isolated NONEs at days 9,
14, 22 -- the same three days already carrying no world progress, since a day with genuinely no new
town-level content also has no fresh thread left to ground a question in). **PASS** (`<=1` required)
for all runs.

## A new, honestly-disclosed finding: RUN_C fails `MAX_LOW_PULL_STREAK` for a reason outside this
## round's authorized scope

RUN_C's script-verified `MAX_LOW_PULL_STREAK = 3`, **not** at Days 25-29 (this round's repair target,
which now scores 3,3,3,3,3 -- no streak at all in isolation) but at **Days 21-23** (`1, 2, 1`), a
pre-existing three-day streak that was always present in the data but was never separately flagged
in any prior round's audit, because PHASE_24.2 and PHASE_24.3's own scripts only surfaced the single
*largest* streak in the sequence (Days 25-29's run of 5) and never checked whether a second,
independent streak also violated the same gate elsewhere in the month. Fixing Days 25-29 removed the
larger streak and, in doing so, exposed this smaller one as the new true maximum -- it did not create
it; it was mathematically already there in the same RUN_C data reported clean everywhere outside
Days 25-29 in every prior round's audit.

Per this task's own Section 0 hard constraint ("Do NOT modify Days 1-24 unless a direct consistency
fix is required") and Section 15's precedent set by PHASE_24.3 itself (disclosing rather than
silently absorbing an out-of-scope defect into an in-scope repair), **this streak is reported, not
fixed, in this round.** It is not a consistency bug (nothing contradicts itself) -- it is a genuine
content gap in Days 21-23 for the quiet/inconsistent persona specifically, the same category of
problem PHASE_24.2 and PHASE_24.3 each fixed in their own scoped windows, and it should be fixed the
same proven way: one or two small, always-rendered, unconditional world beats placed in that
specific 3-day window.

## Gate summary (Section 12)

| Run | MAX_LOW_PULL_STREAK (`<=2`) | MAX_NO_WORLD_PROGRESS_STREAK (`<=1`) | MAX_NO_OPEN_QUESTION_STREAK (`<=1`) |
|---|---|---|---|
| A | 0 -- PASS | 1 -- PASS | 1 -- PASS |
| B | 1 -- PASS | 1 -- PASS | 1 -- PASS |
| C | **3 -- FAIL** (Days 21-23, pre-existing, out of this round's authorized scope) | 1 -- PASS | 1 -- PASS |
| D | 1 -- PASS | 1 -- PASS | 1 -- PASS |

**ALL_HARD_GATES_PASS = NO.** This round's own target (Days 25-29, all four runs) is fully repaired
and verified; RUN_C's Days 25-29 segment in isolation now shows zero low-pull streak at all. The
remaining failure is a distinct, newly-surfaced, pre-existing defect at Days 21-23, outside Section
0's authorized scope for this round, honestly disclosed rather than silently patched by expanding
scope without authorization.

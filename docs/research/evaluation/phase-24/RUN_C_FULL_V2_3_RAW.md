# NEW LIFE 30-Day Gamebook — RUN_C Full Revalidation V2.3 (PHASE_24.3, Section 12) — MIXED RESULT,
DISCLOSED IN FULL

Days 1-14: see `RUN_C_D1_D14_CORRIDOR_RAW.md` for full replayed detail. Days 15, 20-30: unchanged
from `NEWLIFE_30DAY_RUN_C_RAW_V2_1.md`. Days 16-19: unchanged from `RUN_C_FULL_V2_2_RAW.md`.

PULL sequence, Days 1-29: 3,3,3,2,2,3,4,3,1,3,2,3,3,3,3,2,3,2,3,3,1,2,1,3,2,2,1,1,2.

## Gate check — this round's targeted repair succeeded; a separate, pre-existing problem remains

**Days 1-14 (this round's actual scope): PASS.** Script-verified zero 3-consecutive-`<=2` windows
across Days 1-14 -- a direct, measured fix of PHASE_24.2's disclosed finding (a violation spanning
nearly all of Days 1-14 for this exact run/persona).

**Full month (Days 1-29): FAIL, but only in the region PHASE_24.2 already disclosed as out of
scope.** `MAX_LOW_PULL_STREAK = 5`, at Days 25-29 (values 2,2,1,1,2 -- script-verified). This is
**not new**: `RUN_C_FULL_V2_2_RAW.md` already reported this exact region as a "materially more
severe" pre-existing violation (there, spanning Days 1-14 AND several later isolated dips at Days
21-23/25-27/26-28/27-29). This round's Days 1-14 repair has now closed the Days 1-14 portion of
that finding completely; the Days 21-29 portion was never in this task's scope ("Primary target:
Days 1-14... Do NOT rebuild the 30-day game") and is not touched here.

WORLD_PROGRESS_VISIBLE 2-consecutive-N: **0** (corrected, consistent labeling; see `PHASE_24_3_
STREAK_AUDIT.md`). **PASS on this dimension.**

**RUN_C: Days 1-14 PASS (this round's target, achieved); full-month `MAX_LOW_PULL_STREAK` gate
still FAILS, due entirely to the already-disclosed, out-of-scope Days 21-29 region.** Per this
task's own explicit instruction not to reinterpret or soften the hard gate, this is reported as a
FAIL, not minimized because the remaining cause is "only" the previously-known issue.

## Recommendation for a further round (not started here)

A `PHASE_24.4` targeting Days 20-29 specifically -- the same proven mechanism (an always-rendered,
independent world event or two, distributed across that back stretch) should transfer directly, the
same way it worked for Days 16-19 and now Days 1-14.

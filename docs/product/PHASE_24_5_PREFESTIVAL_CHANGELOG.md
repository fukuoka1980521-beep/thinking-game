# PHASE_24.5 — Pre-Festival Passive-Route Repair Changelog

BASELINE: `5a7ca4b`. Scope: Days 20-23 only, surgical (Day 20's existing content untouched except
being read as a data source; Day 24 untouched except reading the new `festival_final_state_visible_
day23` fact as backdrop). No rebuild, no reopening of Days 1-19 or 24-30 beyond direct consistency
reads, no new major character arc, no private gate weakened, no evaluation-definition change, no
product/UI/art code, no push -- all Section 0 constraints held.

## Root cause (restated, per Section 0)

RUN_C is quiet and minimally engaged. Day 21 (Jin's unseen work, mostly invisible if unthanked), Day
22 (Hina's private reveal, evidence-gated, "an ordinary, pleasant evening" if not met) and Day 23
(the deliberately cosmetic false alarm) are each individually defensible, but stacked back-to-back
they produced three flat, low-pull days immediately before the festival -- `MAX_LOW_PULL_STREAK = 3`
for RUN_C at Days 21-23, disclosed as a pre-existing, previously-hidden defect in PHASE_24.4's own
audit (masked in every prior round's reporting by the larger Days 25-29 streak, which PHASE_24.4
already fixed).

## The fix: one continuous, unconditional pre-festival world arc

**THE FESTIVAL BECOMES PHYSICALLY REAL** -- Day 21 (setup begins), Day 22 (commitments become
concrete), Day 23 (final pre-festival state) -- running underneath the three existing days'
unchanged private/comic content, using the same Layer-A/Layer-B separation as every prior corridor
repair (PHASE_24.2, 24.3, 24.4).

| Day | New unconditional Layer-A content | Preserved Layer-B content |
|---|---|---|
| 21 | `festival_setup_visible_day21` -- tables, ropes, stands, moved Hall furniture, concrete state read from `yohei_festival_stock`/`bench_fixed` | Jin's unseen-work theme, the bench payoff, the late-window arrangement gate -- all unchanged |
| 22 | `hina_festival_offering_decided` (WORLD FACT, always true, read from the Days 1-14 trial arc's own `hina_concrete_decision`) with `player_knows_hina_offering_reason` (practical-only PLAYER_KNOWLEDGE); `festival_commitments_visible_day22` (other stalls firming up) | Hina's private financial-history reveal, unchanged evidence gate, unchanged trigger |
| 23 | `festival_final_state_visible_day23` -- final stall positions, Yohei's stock at its decided scale, Hina's offering in place, Jin's last setup item, a visibly transformed street | The false alarm, preserved exactly as designed comic relief, still explicitly non-causal |

## Files touched

- `docs/product/NEWLIFE_30DAY_GAMEBOOK_STATE_MODEL_LEDGER_V2_1.md` -- new `## PHASE_24.5 addition`
  section, inserted between the PHASE_24.4 section and Fix F.
- `docs/product/NEWLIFE_30DAY_GAMEBOOK_STORY_SPINE_V2_1.md` -- Days 21-23 rewritten with inline
  `[PHASE_24.5 ADDITION -- ALWAYS RENDERED: ...]` markers; per-day tags updated.
- `docs/product/NEWLIFE_30DAY_GAMEBOOK_TEXT_PROTOTYPE_V2_1.md` -- 5 new `VAR` declarations
  (`festival_setup_visible_day21`, `festival_commitments_visible_day22`, `hina_festival_offering_
  decided`, `player_knows_hina_offering_reason`, `festival_final_state_visible_day23`); `day21`-
  `day23` knots rewired; `day20`/`day24` untouched except as data sources already read by the new
  content.

## Fact/knowledge audit (Section 6), per day

- **Day 21**: WORLD_FACT = the street physically changes shape (unconditional). CHARACTER_FACT =
  Jin's work happens regardless of thanks. PLAYER_KNOWLEDGE = whether the player specifically
  notices/thanks Jin (unchanged gate). RELATIONSHIP_EVIDENCE = `thanked_jin_for_unseen_work` /
  `noticed_jin_fixed_something` (unchanged). PLAYER_INFLUENCE = none over whether the setup happens;
  only over the Jin-thread's own evidence.
- **Day 22**: WORLD_FACT = `hina_festival_offering_decided` (always true, read from prior trial-arc
  state -- the player's knowledge of WHY never creates this fact). CHARACTER_FACT = Hina's private
  financial history (fixed, past). PLAYER_KNOWLEDGE = `player_knows_hina_true_reason` (unchanged
  gate) and, newly, `player_knows_hina_offering_reason` (practical-only, a strictly shallower tier
  that never substitutes for or unlocks the private one). RELATIONSHIP_EVIDENCE = unchanged Hina
  evidence set. PLAYER_INFLUENCE = none over what she offers; only over what's learned about why.
- **Day 23**: WORLD_FACT = `festival_final_state_visible_day23` (always true, assembled entirely
  from Days 20-22's already-fixed state, never invented fresh). CHARACTER_FACT = none new.
  PLAYER_KNOWLEDGE = whether the false alarm is investigated (unchanged, still non-causal).
  RELATIONSHIP_EVIDENCE = the existing Daisuke roaming stop, unchanged. PLAYER_INFLUENCE = none over
  the street's finished state.

No private fact (Hina's true reason, Daisuke's card, Yohei's family details, Miyoko's daughter
thread, Jin's arrangement, Fumiko's letter) was made easier, earlier, or automatically visible by
this repair -- confirmed explicitly in `PHASE_24_5_ANTI_OVERFIT_AUDIT.md`.

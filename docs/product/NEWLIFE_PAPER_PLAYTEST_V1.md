# NEW LIFE — Paper Playtest V1 (PHASE_21)

No code was run for this document -- it is a manual trace against the design in
`NEWLIFE_CORE_LOOP_V1.md` and `NEWLIFE_DAY1_TO_DAY7_ARC_V1.md`, per directive Section 38.

## First 10 minutes (Section 37)

A first-time player, minute by minute:

1. **0:00-0:30** -- arrival line (1-2 sentences), trial house shown. No system explanation screen.
2. **0:30-1:30** -- morning notice beat: one line about the town, then the 2-action budget is
   *shown by the UI itself* (two destination choices visible), never explained in prose.
3. **1:30-4:00** -- Action 1: player goes to 商店街, meets Hina mid-setup. Short scene, one small
   thing happens (she mentions a specific worry or a specific detail about the shop), one
   structural choice offered (ask / watch / leave). No free-text chat required to feel like
   something happened.
4. **4:00-4:30** -- return to town view, second destination choice visible.
5. **4:30-7:00** -- Action 2: player goes to 洋平商店, ordinary-life beat (Yohei stocking
   shelves), a short exchange, one small thing noticed (the festival prep mentioned once, not
   explained at length).
6. **7:00-8:00** -- evening beat: one line, something to notice ("明日、洋平の店に新しい仕入れが
   入るらしい" or similar -- a concrete, dated future fact).
7. **8:00-9:00** -- trial house, brief reflect-or-skip, day ends.
8. **9:00-10:00** -- Day 2 opens with a visible difference somewhere the player didn't go
   yesterday (喫茶のどか, unvisited, now shows a small change) -- the hook into Day 2.

**Check against Section 37's banned list**: no explanation over 5 minutes (total explanatory text
across the whole 10 minutes is under 30 seconds of reading); no 3 repeated greetings (Hina and
Yohei have distinct opening registers per the roster doc); no name-memorization requirement (only
2 names introduced); no full location tour (only 2 of 6 locations shown); no system-mechanics
lecture (the 2-action budget is shown, not explained).

**Check against Section 37's goal**: by minute 10, the player has met 1 memorable person (Hina),
recognizes 1 place well (商店街), has seen 1 small event (Yohei's festival mention), made 1 real
choice (which 2 of 6 destinations), and has 1 concrete reason to wonder what's next (the dated
shipment fact + tomorrow's visible town-change hook).

## Five-type trace, Day 1 → Day 7

### A. Social/exploratory player

Visits a different pair of locations almost every day, talks to everyone at least once by Day 4.
By Day 7: knows all 6 MAIN NPCs lightly, no single thread deeply resolved, retrospective reads as
"broad but shallow" -- a legitimate, different outcome from type B below, not a worse one.
**Check**: never blocked by "already talked to everyone today" (14 actions across 6 destinations
naturally produces repeats without needing an artificial cap) -- PASS.

### B. One-NPC-focused player (e.g. always Miyoko/café)

Spends both actions some days on Miyoko, ignoring other locations for days at a time. By Day 7:
deep familiarity with Miyoko (her daughter-thread mentioned twice, her chair recognizes the player
as a regular), most other NPCs still first-visit-register. **Check**: the game must not force a
visit elsewhere -- confirmed by design (no location is ever mandatory); Miyoko's own design
explicitly avoids "special treatment for regulars" so this player type doesn't accidentally unlock
content that reads as a reward system -- PASS.

### C. Quiet/low-engagement player (skips days, minimal talk, mostly watches)

Uses WATCH/LEAVE more than TALK, some days does only 1 action, occasionally does 0 (stays at trial
house). By Day 7: light familiarity with 2-3 NPCs, several dated events never triggered (correctly
ignorable), retrospective is short and calm, matching the actual week played. **Check**: does the
game ever feel "broken" or empty for this player? Since ordinary-life ambient content (Section 21)
doesn't require an event to be present, a quiet player still sees NPCs doing something every visit
-- PASS, with a note that the evening beat's "something to notice" line needs a graceful
zero-event fallback (a plain, non-empty ordinary-life line) for days this player triggers nothing --
**flagged for implementation** (`NEWLIFE_IMPLEMENTATION_PLAN_AFTER_DESIGN_V1.md`).

### D. Decline-heavy player

Says no to every promise/opportunity offered, including Jin's Day 5 Big Choice. By Day 7: the
"declined" WorldFacts are visible in the relevant NPCs' own framing (Jin quietly continues alone,
no judgment) -- reuses the existing PHASE_16/18 "declining is never framed as failure" discipline
directly. **Check**: does declining ever dead-end a relationship? Per the existing engine's own
cooldown-based re-offer logic (proven in PHASE_18), no -- **PASS**.

### E. Completionist player

Tries to see every event, help everyone, accept every offer, hit every dated callback exactly on
time. By Day 7: this player is the one most likely to feel the 2-action/day budget as a genuine
constraint (can't do both "help Yohei's shipment" and "get Fumiko's bench fixed via Jin" on the
same day if they land on the same day). **Check (the directive's own named risk area from
PHASE_19)**: does forcing a choice here feel like the game working as designed, or like an
arbitrary wall? Given the whole design's thesis is "scarcity makes the choice matter," this SHOULD
read as the game working -- but it is the one type where saturation should be measured for real
once implemented (a repeat of PHASE_16/19's own completionist-measurement discipline, now applied
to the 7-day scope specifically), not merely assumed fine on paper. **CONDITIONAL, flagged for
first real playtest.**

## Section 38 checklist (all 5 types, cross-checked)

- Action-locked / stuck: not found in any of the 5 traces.
- Same-screen repetition: not found (ordinary-life variety + the Day 2 "town moved" mechanism
  both work against this).
- Forced full-roster visits: not found -- confirmed no location or NPC is mandatory.
- Some next-day change every day: TRUE for A/B/D/E; CONDITIONAL for C (flagged above, a real,
  fixable content gap, not a structural one).
- Day 7 differs across types: TRUE by construction (each trace above produces a visibly different
  retrospective shape).

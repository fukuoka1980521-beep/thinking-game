# NEW LIFE — Day 1 to Day 7 Arc V1 (PHASE_21)

State-driven throughout (Section 24: "具体的な出来事はstate-drivenであるべき") -- the beats below
are the *design intent* for what should become true or available on each day, reusing the existing
event/promise/trajectory engines, not a fixed linear script. A player who ignores a beat entirely
gets a different, still-coherent day, not a broken one.

## DAY 1 — arrival, one person worth remembering

**Goal**: the player understands, without being told, that they've arrived, have a place to stay,
a few neighbors exist, and today they can go 2 places. No system explanation screens.

- Morning: arrival framing (already exists, kept, trimmed if needed per Feynman economy).
- Action 1 candidate: 商店街 → meet Hina, visibly mid-setup. Her nervous energy + concrete
  "opening soon" detail is the design's best bet for "someone worth seeing again" (a newcomer
  talking to a newcomer has an obvious, ready-made connection with zero contrivance).
- Action 2 candidate: 洋平商店 or 喫茶のどか → the player's first "settled local" contact, in
  contrast to Hina's newcomer energy.
- Evening: one line establishing tomorrow is a new, different day (not narrated as a rule, just
  true).

**Design check**: at least one NPC (Hina is the design's best bet) should land as "I'd like to see
how that goes" by day's end.

## DAY 2 — the town moved without you

**Goal**: prove the core rule by showing it, not saying it.

- Whichever location the player did NOT visit Day 1 shows a visible difference on Day 2 --
  something happened there while the player was elsewhere (a delivery arrived, a shelf got fixed,
  a noticeboard changed). This reuses the existing recurring-world-event engine
  (`content/day1WorldEvents.ts`'s pattern), applied to whichever of the 6 core locations the
  player skipped.
- The change must be visible or mentioned within the first exchange at that location, not buried.

**Design check**: the screen the player sees today must not be a copy of yesterday's screen at the
same location (Section 25's explicit requirement).

## DAY 3 — one real unresolved thing

**Goal**: give the player something to wonder about, without forcing a quest.

- Exactly one concrete, nameable open thread becomes visible (Yohei's shipment, Daisuke's
  renovation quote, Fumiko's bench, Jin's odd-job opportunity becoming eligible) -- whichever fits
  the player's own Day 1-2 choices best.
- Explicitly ignorable: the thread does not block, gate, or nag.

## DAY 4 — the world answers back

**Goal**: prove the player's Day 1-3 choices mattered.

- If the player HELPED someone: a visible, specific change in how that NPC acts or what they say
  (not a generic "thanks again").
- If the player DECLINED or ignored something: the town finds another way (Jin helps instead of
  the player; someone else notices what the player didn't) -- never a punishment, always a
  different-but-fine outcome.
- This is the single most important day for "did my choice matter," and reuses the existing
  social-memory/local-problem resolution machinery directly.

## DAY 5 — a choice that's a little heavier

**Goal**: one Big-Choice-weight decision, correctly scaled (Section 28: not a life-defining event).

- Primary candidate: Jin's existing trajectory opportunity ("定期的に手伝う気はあるか"), reframed
  per `NEWLIFE_CORE_LOOP_V1.md`'s Big Choice guidance -- a standing arrangement, not a career.
  Only surfaces if the player has actually engaged with Jin enough by Day 5 (existing eligibility
  gate); if not, Day 5 is simply an ordinary day, which is a fine outcome (no forced Big Choice).

## DAY 6 — the town is one place

**Goal**: make the player feel the six people/locations are one social fabric, not six isolated
rooms (Section 29).

- At least one moment where two MAIN NPCs' threads visibly intersect: Jin fixing Fumiko's bench
  and Fumiko mentioning it; Miyoko referencing Hina's shop; Daisuke and Yohei's long friendship
  showing in a small aside. Reuses the existing cross-NPC `knownFacts`/`relationshipHistory`
  machinery -- no new state needed, just authored content that surfaces it.

## DAY 7 — what did these 7 days look like, not "the end"

**Goal**: reflect the specific week this specific player had. No GOOD END/BAD END (Section 30,
explicit ban).

- A short, plain retrospective (reusing the existing Day-30 retrospective's register/restraint,
  scaled to 7 days): who the player actually spent time with, what's still open, what changed.
- Deliberately produces a DIFFERENT result for a social player vs. a quiet player vs. a
  one-NPC-focused player -- verified in `NEWLIFE_PAPER_PLAYTEST_V1.md`.
- Closing feeling target: "もう少しここにいたい" or "別の7日を試してみたい" -- both are successes;
  neither is scored.

## Cross-day content budget (ties to Section 31/39)

Each day: **1 main town-change beat + 2-4 optional scene candidates** (the player's 2 actions pick
from among whichever NPCs/locations are reachable and have something live that day). No day
requires bespoke content for every possible player path -- the existing state engine (event
eligibility, cooldowns, WorldFacts) is what makes "reasonable content regardless of which 2 of 6
the player picked" affordable within the content budget (see
`NEWLIFE_CONTENT_BUDGET_V1.md`).

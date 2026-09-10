# New Life — Current Canon Index V1 — PHASE 12.0R

Directive Section 3-4. A maintained document, not runtime code. Scoped to the PHASE 12.1 vertical-
slice dependency surface only — this does not attempt to normalize the project's entire design
history.

## Part 1 — Canon authority model (directive Section 3)

Five states, no more:

| State | Meaning | How to recognize it |
|---|---|---|
| **CURRENT CANON** | Actively binding; PHASE 12.1+ must be consistent with it | Explicitly marked CANONICAL/FROZEN by its own document, AND/OR the most-recent, most-specific surviving statement about a given fact with no later explicit contradiction |
| **EXPLICITLY SUPERSEDED** | Was canon; a later document explicitly states it replaces/retracts it | The LATER document names the earlier one and states supersession (e.g. "supersedes `NEW_LIFE_CAST_MASTER_V1.md`") — never inferred from silence |
| **PROVISIONAL / RESEARCH** | Proposed, not yet committed; may be adopted or dropped without needing a "retraction" | The document itself says so (e.g. Minoru: "PROVISIONAL, NOT CANONIZED") |
| **HISTORICAL BASELINE** | Real prior design exploration, kept for traceability; not currently binding, but also not necessarily wrong — simply not the live thread | The originating document (or a later one) explicitly marks it superseded/historical, distinguishing it from silent, undecided omission |
| **UNKNOWN / CONFLICTING** | Two current-canon-eligible sources disagree on the same specific fact, neither retracts the other | Used sparingly — see Kamiya's role, below, as the one real instance found this phase |

**The rule that failed and is now fixed (directive Section 2):**

> `NOT FOUND IN DOCUMENT X` ≠ `NON-CANONICAL`.

A fact is only removed from CURRENT CANON by an explicit, locatable act of supersession,
replacement, retraction, or authoritative contradiction — never by absence from whichever single
document was consulted. Absence means "this document didn't need to restate it," full stop, unless
that absence is paired with an explicit statement elsewhere. Before recording anything as
non-canonical, the WHOLE `docs/` tree (not one subdirectory, not one filename pattern) must be
searched for the entity's own name(s) — this is the concrete process fix, not merely a definition
(`CANON_AUTHORITY_FAILURE_TRACE_V1.md`).

**Directory map (so the failure cannot recur from directory-scope tunnel vision again):**

- `docs/world/` — the actual current, most-detailed, most-recent (PHASE 11.0/11.1) cast and world-
  simulation canon (`NEW_LIFE_CAST_MASTER_V1/V2.md`, `NEW_LIFE_30DAY_WORLD_MASTER_V1/V2.md`, plus
  7 companion documents). **This was never searched in PHASE 12.0.**
- `docs/product/NEW_LIFE_SCENARIO_BIBLE_V1.md` (underscore-separated filename, PHASE 10.10) —
  CURRENT CANON for structural/mechanical rules (NEED/WANT, L0/L1/L2 recognition, prohibited
  patterns). Explicitly self-declared "FROZEN... where any prior document conflicts, this Bible
  wins."
- `docs/product/NEWLIFE_CHALLENGE_TOWN_SCENARIO_BIBLE_V01.md` (no-underscore filename, PHASE 7.40)
  — HISTORICAL BASELINE for its Chapter-1-specific narrative content (the specific Chinatsu/Daichi/
  Yui/Kamiya-as-Challenge-Center-employee framing was never restated by the later, more detailed
  `docs/world/` documents); its BASE PREMISE (57yo, 30-day trial, Challenge Town, DAY30 key return)
  remains CURRENT CANON because the later documents restate it identically, word for word.
- `docs/product/NEWLIFE_*` あさひ町/Chinatsu-Seiichi-mystery lineage (`NEWLIFE_STORY_BIBLE_V1/V2/
  V3.md`, `NEWLIFE_3DAY_MASTER_PLOT_V2/V3.md`, `NEWLIFE_CHARACTER_ARC_BIBLE_V2.md`) —
  **EXPLICITLY SUPERSEDED** (each carries or is named by an explicit superseded banner).

## Part 2 — Current canon index (directive Section 4's required minimum)

### PRODUCT PREMISE — CURRENT CANON

30日間、チャレンジ町で暮らす。The game does not pre-declare what the 30 days mean and does not
declare afterward what they meant (`NEW_LIFE_SCENARIO_BIBLE_V1.md` §2 — binding on all future
Product text).

### PROTAGONIST — CURRENT CANON

57-year-old man. Resigned from a long-held job; next direction undecided. Independently applied
for a 30-day trial stay in Challenge Town. Detailed former occupation, family structure, and
personality are **not defined** by the game (`NEW_LIFE_SCENARIO_BIBLE_V1.md` §1,
`NEW_LIFE_30DAY_WORLD_MASTER_V1.md` §0 — both agree word-for-word). The broader career-history/
recent-loss detail from `NEWLIFE_CHALLENGE_TOWN_SCENARIO_BIBLE_V01.md` is HISTORICAL BASELINE
(never restated by the later docs, never retracted either — usable as texture, not required).

### CORE NPC CAST — CURRENT CANON

洋平 (Yohei), 美代子 (Miyoko), 神谷 (Kamiya), 相馬迅 (Jin), 岩田 (Iwata), 佐伯 (Saeki) — all six
appear with full author-side profiles in `docs/world/NEW_LIFE_CAST_MASTER_V1.md`/`V2.md`, the
current, most-detailed cast source (PHASE 11.0/11.1). 実/Minoru is explicitly **PROVISIONAL, NOT
CANONIZED** by that same document — not rejected, simply not yet committed.
千夏/Chinatsu, 大地/Daichi, 結衣/Yui (from the older Challenge Town Bible) are **HISTORICAL
BASELINE, NOT NEEDED IN SLICE** — established once, never retracted, simply not part of the later,
richer cast-thread documents; they remain usable in a future phase without needing to be
"re-canonized," per the Section 2 rule.

### NPC FIXED IDENTITIES — CURRENT CANON (full detail: `CAST_CANON_AUDIT_V1.md`)

Jin's frozen rule (verbatim, unchanged since `NEW_LIFE_CAST_MASTER_V1.md`, PHASE 11.0): 相馬迅, 57,
independent repair/odd-job worker. When he sees a repeated or stalled situation, he suggests
exactly ONE legal alternative or small experiment. He may miss constraints he doesn't know about
and updates from what actually happens. He is NOT omniscient, not a therapist, not a problem-solver
for everything, not an author mouthpiece. **This rule is explicitly frozen and must not be
overloaded with additional narrative weight in any future phase** — a hard constraint on PHASE
12.1's prompt design, not a suggestion.

### 30-DAY HARD DEADLINE — CURRENT CANON

DAY30: trial accommodation ends, key must be returned. Unchanged across every version of every
document that states it at all.

### ANOMALY FRAMING BOUNDARY — CURRENT CANON (inherited, unchanged)

Never explained within the slice's scope; never a second stated objective; never a forced
supernatural reveal (`NEWLIFE_CHALLENGE_TOWN_SCENARIO_BIBLE_V01.md`'s reality/strangeness balance,
not contradicted by anything in `docs/world/`, which simply doesn't touch the anomaly thread at
all — silence, not retraction). PHASE 12.1's Day-1-morning/afternoon slice does not reach this
thread regardless (`VERTICAL_SLICE_PRODUCT_FLOW_V1.md`'s time-window scope).

### CURRENT TOWN NAME — CURRENT CANON

チャレンジ町 (Challenge Town). Identical across every live document (`NEW_LIFE_SCENARIO_BIBLE_V1.md`,
`NEW_LIFE_30DAY_WORLD_MASTER_V1.md`, `NEWLIFE_CHALLENGE_TOWN_SCENARIO_BIBLE_V01.md`) — no
correction needed here.

### PHASE 12.1 CANDIDATE LOCATIONS — CURRENT CANON, corrected this phase

From `docs/world/NEW_LIFE_CAST_MASTER_V1.md`'s "places legitimately visited" fields (the current,
concrete location set every NPC's canon actually references): Yohei's shop (洋平商店), Miyoko's
café (喫茶のどか), the shōtengai/shopping street (hub), the community hall (集会所, festival
meetings/setup), the collection area (ゴミ集積所, Iwata/Saeki's anchor). "Challenge Center" (from
the older, thinner Kamiya characterization) is **UNKNOWN/CONFLICTING** — see `MAP_CANON_RECHECK_V1.md`.

### KNOWN SUPERSEDED CONCEPTS

あさひ町 setting; the Chinatsu-Seiichi grandmother/granddaughter mystery as the MAIN plot driver
(the names themselves are HISTORICAL BASELINE, not superseded as characters, but the mystery
STRUCTURE built around them in that lineage is superseded); Kamiya-as-primarily-Challenge-Center-
job-counselor (superseded IN EMPHASIS by the later, more detailed shōtengai-coordinator
characterization — see next section for why this is flagged UNKNOWN/CONFLICTING rather than a
clean supersession).

## Part 3 — The one real UNKNOWN/CONFLICTING case found

Kamiya's occupation differs between `NEWLIFE_CHALLENGE_TOWN_SCENARIO_BIBLE_V01.md` (PHASE 7.40:
"Challenge Center employee... genuinely wants to help; administrative constraints are real") and
`docs/world/NEW_LIFE_CAST_MASTER_V1.md` (PHASE 11.0: "shōtengai (shopping-street association)
contact... runs festival logistics... not a shop owner himself... more of an organizer/
administrator figure"). Neither document names or retracts the other's claim. Resolution adopted
for this phase (stated plainly, not hidden): the LATER, more detailed, author-side-profile document
governs Kamiya's actual behavior/knowledge-boundary/constraints for PHASE 12.1 purposes (the
shōtengai-coordinator framing), while "Challenge Center" as a town institution is not itself
retracted (nothing says it doesn't exist) — it is simply not asserted as Kamiya's workplace going
forward. This resolution is a judgment call, not an authoritative retraction, and is flagged here
so a future document can settle it explicitly rather than the ambiguity being silently inherited
again.

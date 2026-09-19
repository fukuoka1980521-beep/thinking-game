# NEW LIFE — Keep / Rework / Defer / Remove Matrix V1 (PHASE_21)

Per directive Section 40, all existing NEW LIFE systems audited against "does this serve the
7-day core's one-line description" -- not "is it already built."

| System | Classification | Reasoning |
|---|---|---|
| Canonical state / engine.ts mutation discipline | **KEEP** | Foundation of SYSTEM OWNS TRUTH; nothing in this redesign requires touching it |
| Recurring world events | **KEEP, scope-reduced** | The exact mechanism Day 2's "town moved without you" beat needs; used for ~6 events instead of the current larger set |
| NPC memory / conversation turns | **KEEP** | Directly needed, unchanged |
| Promises | **KEEP, rework framing** | Mechanism kept; UI must name WHO/WHAT/WHEN per directive Section 17 -- a presentation change, not an engine change |
| Relationship / social memory | **KEEP** | Directly needed for Day 6's "town is one place" beat |
| Player trajectory | **KEEP for Jin only in the 7-day core** | Miyoko/Fumiko's existing trajectory seeds are not required for the 7-day slice (their MAIN-cast value comes from café/community-hall ordinary life + their own dated events, not a career-style opportunity) -- their seeds are DEFERRED, not deleted |
| Big Choice (trajectory opportunity offer) | **KEEP, rework framing** | Mechanism kept; Section 18's "生活が変わりそう、正解探しではない" framing is a presentation/prompt-copy concern, not an engine change |
| Fortune House memory | **KEEP** | Explicitly named as a good, proven "small repeatable act" (Section 3's Coffee Talk lesson) -- kept as one of the 6 core locations |
| Reality Bridge | **REMOVE FROM 7-DAY CORE** | Directive Section 41's explicit permission used: this is a thinking-tool feature, not a life-game fun mechanic, and the Owner's own complaint ("counseling UI," carried from PHASE_17) is best resolved by not forcing it into the core rather than re-skinning it again |
| 30-day retrospective / late consequences | **DEFER** | Correctly out of scope until the 7-day slice is proven fun (directive Section 8's explicit development order); not deleted, resumed only after human signal on the 7-day version |
| Purchase / inventory coherence (incl. dine-in fix) | **KEEP** | Directly needed for Yohei's shop and Miyoko's café; zero changes proposed |
| AI scene/context selection (PHASE_18/19 architecture) | **KEEP** | The proven SYSTEM OWNS TRUTH / AI OWNS EXPRESSION boundary; this phase adds content inside it, never modifies the boundary |
| Kamiya (full conversational NPC) | **REWORK → BACKGROUND** | Day-1-only orientation touchpoint; not one of the 6 MAIN daily-choice NPCs (see character roster) |
| Kiyoshi | **DEFER** (kept as ambient background at Yohei's shop) | A second 70s+ figure would undo the age-diversity correction this phase makes via Fumiko |
| Daisuke | **REWORK → ACTIVE MAIN CAST** | Reactivated from PHASE_15's retired schedule to fill the 40s/craftsman life-stage gap -- his OLD Thinking-Resident register is explicitly NOT restored |
| Hina | **KEEP, expand to MAIN** | Already canonical; promoted from secondary to one of the 6 MAIN NPCs for her genuinely-missing newcomer life stage |
| Shizuko's Thinking-Resident deep-talk register | **DEFER (folds into Reality Bridge removal)** | Kept as Fortune House's owner with a real but lighter personality; the deep thinking-circuit conversational mode is not part of the 7-day core |
| Existing 9-screen visual/Feynman work (PHASE_17) | **KEEP** | Not touched by this design phase; remains the UI shell the 7-day content will render through |
| Existing dev observability / invariant test suite (PHASE_18/19) | **KEEP** | Directly reusable regression safety net for whatever gets implemented |

## What this buys back

Removing Reality Bridge and deferring the 30-day/late-consequence/two extra trajectory seeds does
not reduce the *proven* system -- it reduces the amount of it exposed inside the first playable
slice, so the 7-day core can be judged on whether IT is fun, without an unrelated system's
awkwardness (Reality Bridge's "counseling UI" read) muddying that judgment.

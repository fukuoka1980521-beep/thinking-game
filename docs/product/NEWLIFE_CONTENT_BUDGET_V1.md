# NEW LIFE — Content Budget V1 (PHASE_21)

Estimated BEFORE implementation, per directive Section 39. All numbers are for the 7-day core
vertical slice, reusing existing engines wherever possible rather than authoring bespoke content
per player path.

## NPC portraits

- 6 MAIN NPCs × 1 canonical portrait = **6 required**.
- Secondary expression/pose: at most 1 each for the NPCs whose only-event is visually distinct
  (Miyoko mid-pour, Daisuke mid-haircut, Jin mid-repair) = **up to 3 optional**.
- Kamiya (background) and Kiyoshi (background) can remain initial-badge for the 7-day slice
  specifically because they are explicitly not MAIN choices this phase (directive's own
  ALL_RECURRING_NPCS_HAVE_VISUALS gate applies to the *7-day core cast*, i.e. the 6 MAIN NPCs, not
  every NPC that exists in the wider codebase).
- Shizuko: already has no portrait today; a canonical portrait is a **should**, not a hard blocker,
  since she is location-attached (Fortune House) rather than a daily-choice MAIN NPC.

**Total: 6 required, up to 3 optional, 1 nice-to-have (Shizuko).**

## Location visuals

- 6 core locations × 1 canonical hero image = **6 required** (仮住まい, 洋平商店, 喫茶のどか,
  商店街, 集会所, Fortune House).
- Day/evening variants: reuse the existing pattern already proven for 洋平商店/仮住まい-adjacent
  assets (a single image + CSS time-tint) rather than a second full painted variant per location,
  to stay inside budget -- **0 additional required assets**, a lighting-treatment task instead.

**Total: 6 required.**

## Authored scenes (per directive: don't author every combination)

- Day 1-7 arc beats (this doc's sibling `NEWLIFE_DAY1_TO_DAY7_ARC_V1.md`): **~7 dated town-change
  beats** (one per day) + **1 per MAIN NPC "only-this-NPC" event** (6) = **~13 authored beats
  total**, each reusing the existing local-problem/event-thread/trajectory engines' generic
  machinery (discover/help/connect/resolve text fields) rather than needing new engine code.
- Ordinary-life ambient lines: **2-3 per MAIN NPC** (12-18 lines total) covering the "just doing
  something" register (Section 21) -- cheap, high-value, reuses the existing `scene.ambientLine`
  mechanism.

## Event variants

Per the 1-event-per-NPC-per-week target (`NEWLIFE_CORE_LOOP_V1.md`): **6 dated events** (one per
MAIN NPC), each with discover/result text only (no branching event trees) -- deliberately not the
current codebase's full local-problem apparatus (discover/help/connect/resolve/auto-resolve) for
every one; only Yohei's shipment and Fumiko's bench thread need the connect-to-another-NPC branch
(reusing Jin), the rest are simpler discover→resolve beats.

## Dialogue seeds (for the deterministic adapter + live-prompt static profile fields)

Already-required fields per MAIN NPC (identity/personality/speechStyle/values/likes/dislikes/
hiddenBackground) are **fully specified in `NEWLIFE_CHARACTER_ROSTER_V2.md`** for all 6 -- this is
already-complete "seed" content, needing only transcription into `npcDefs.ts`'s existing shape at
implementation time (no new authoring pass required).

## Sound assets (design only this phase, per Section 36)

Reserved for a future phase: town ambience, café ambience, shop ambience, evening ambience,
Fortune House ambience, small-choice sound, day-transition sound = **7 candidate assets**, zero
implemented this phase.

## AI calls

No new call volume beyond the existing per-conversation-turn pattern; the 7-day slice's total
player-facing AI surface area is a strict subset of what PHASE_18/19 already load-tested (24+ real
Gemini interactions across the current 9-NPC roster). **No budget concern.**

## Tests

Reuses the existing `newlifecore*.test.*` suite structure; new tests needed are scoped to: the 6
MAIN NPCs' context-building (already covered by the existing full-roster smoke test from PHASE_19),
the 2-action-per-day budget enforcement (new), and the 6 new event beats' discover/resolve logic
(new, but same shape as existing local-problem tests). Estimated **10-15 new test cases**, well
inside the existing suite's proven pattern.

## Overall verdict

**REALISTIC.** Every content category above is either a modest, bounded authoring task (13 scenes,
18 ambient lines, 6 events) or a direct reuse of already-built, already-tested engine code. The
one real cost is the 6-9 image assets, which is exactly the scope PHASE_20 already sized and the
scope this design was built to fit inside, not exceed.

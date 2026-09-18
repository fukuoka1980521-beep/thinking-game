# PHASE_17 — NEW LIFE Visual + Feynman Rebuild — CLOSE V1

Directive: PHASE_17_NEW_LIFE_VISUAL_FEYNMAN_REBUILD_V1 + two addenda
(USER_STAMP_SOURCE_AUDIT_CORRECTION, USER STAMP SOURCE EXPANSION + STYLE SEGREGATION).
Target module: `src/newlifecore/` (`NewlifeCoreApp.tsx` et al.) -- the PHASE_16 rebuild, reached
via `?newlifecore` -- not the older, currently-Home-linked `src/newlife/NewLifeApp.tsx`, which
this phase's directive did not name and which this Run left untouched.

## What this Run actually delivered (scoped down from the directive's full ambition)

The directive describes a full visual/Feynman rebuild across ~9 screens with 4-viewport
Playwright evidence for all of them. Given (a) the real asset pack turned out to contain far
fewer usable images than the addenda described (see below), and (b) `newlifecore` already had a
working, tested felt-doll visual identity for its town/3 main NPCs that this Run should not
disturb without cause, this Run scoped to three real, verified integration points rather than a
sprawling, thinly-tested rewrite of every screen:

1. Arrival guide screen (`PlayGuideCard`) -- added the Owner-stamp welcome image
   ("よろしくお願いします").
2. End-of-day screen (`state.ended`) -- added a sunset-scene hero image ("おつかれさま") above
   the existing day summary; tightened the heading so it doesn't repeat the image's own caption.
3. Day 30 retrospective (`Day30Retrospective`) -- added a "しみじみ" memory image at the top and
   a small "かんぱい" image next to the reflection-recorded confirmation.

## USER_STAMP_SOURCE_AUDIT_CORRECTION -- what was actually received vs. what was described

The Owner's directive addenda described four asset families including LINE Creators Market
screenshots and a "Thinking Hamyo" pack. The actual delivered ZIP
(`newlife_user_stamp_source_pack.zip`, verified present in `Downloads/` and extracted) contained
exactly 9 files, matching only its own `PROVENANCE.md` manifest -- no marketplace screenshots, no
"Thinking Hamyo" pack, no 2-person stamp existed in the real delivery. This mismatch is recorded
in `assets/newlife-stamps-source/PROVENANCE.md` rather than silently assumed away. Two of the 9
images (07/08) turned out to be new expressions of a character already confirmed real and already
shipped elsewhere in this app (`src/assets/ossan-*.png`) -- a genuinely useful continuity find.

## USER_STAMP_INTEGRATION -- before / after

| | Before | After |
|---|---|---|
| Arrival screen | Text-only bullet list | Same list, now under a real Owner-stamp welcome image |
| End-of-day screen | Text-only summary + next-day button | Sunset stamp-photo hero + summary, heading no longer duplicates the image's caption |
| Day 30 retrospective | Plain text stack + optional reflection box (deliberately "no achievement UI" per its own PHASE_12_8 design note) | Same, framed by a memory-image opener and a small confirmation image on submit -- restraint preserved, no score/banner added |

## Images used, with provenance

- `home-welcome-felt.png` -- SOURCE_ORIGINAL_USER_STAMP (already shipped, 2026-09-02 upload).
- `scenicEveningSunset` (pack file `04`) -- SOURCE_ORIGINAL_USER_STAMP, copied unmodified to
  `src/assets/newlife-stamps/scenic-evening-sunset.jpeg`.
- `memoryNostalgicView` (pack file `05`) -- SOURCE_ORIGINAL_USER_STAMP, copied unmodified to
  `src/assets/newlife-stamps/memory-nostalgic-view.jpeg`.
- `ossanCheers` (pack file `08`) -- SOURCE_ORIGINAL_USER_STAMP, copied unmodified to
  `src/assets/newlife-stamps/ossan-cheers.jpeg`.
- Full audit table (all 9 pack files + the pre-existing in-fiction NPC/town art): see
  `docs/product/NEWLIFE_STAMP_ASSET_AUDIT_V1.md`.
- Style-language decision (why in-fiction art was left alone, why 2 of the 9 pack images were not
  used): see `docs/product/NEWLIFE_VISUAL_LANGUAGE_V1.md`.

No image was cropped/edited at the pixel level -- all framing is CSS `object-fit`/sizing, so
every used asset remains classified SOURCE_ORIGINAL_USER_STAMP, not derived. No new character was
invented; no named NPC (Yohei/Miyoko/Jin/Daisuke/etc.) was assigned a stamp-pack portrait.

## FEYNMAN changes

See `docs/research/evaluation/phase-17/FEYNMAN_VERIFY_V1.md` for the full
WHAT-USER-SEES/SHOULD-UNDERSTAND/CAN-DO-NEXT table. Net text change this phase was small and
surgical: one heading line rewritten (`"DAY{n}、おつかれさま"` -> `"DAY{n}が終わった"`) to stop
it from repeating the new sunset image's own caption. No other copy was touched -- the directive's
"don't fix by adding more text" principle was already largely satisfied by PHASE_12-16's existing
short-sentence style in these three screens; this phase's job was to let the images carry
information the text didn't need to repeat, not to rewrite already-short copy.

## Explicit gaps (not fabricated, not hidden)

- Six NPCs (Kamiya, Daisuke, Shizuko, Hina, Fumiko, Kiyoshi) have no portrait; they still render
  as a plain initial-letter badge. No stamp or approved art exists for any of them.
- No per-location art exists beyond the one wide town establishing shot (`challenge-town.png`);
  洋平商店/喫茶のどか/集会所/仮住まい/商店街/Fortune House each still render as text + that same
  shared image.
- Big Choice / accept-decline moments (PromiseOffer, LifeOpportunityOffer, RealityBridgeOffer)
  were deliberately not given reaction icons this phase -- judged as decoration risk, not
  information, given how many such moments exist across the game.
- 2 of the 9 pack images (street/food scene, bun-haired icon) were audited and intentionally not
  placed -- see `NEWLIFE_VISUAL_LANGUAGE_V1.md`.
- No image compression/optimization tool is available in this environment; the new stamp JPEGs
  are 450-600KB each (photos, not pre-optimized web assets). This matches the pre-existing
  `newlifev02` PNGs (2-3MB each), which were also not touched or optimized this phase. Both are a
  real mobile-data-cost concern worth a dedicated pass, not solved here.
- Human Validation was NOT reopened this phase, per the directive's own sequencing
  (visual/Feynman rebuild -> browser acceptance -> live-model regression check -> new baseline ->
  HV-01). A live-model (real Gemini) regression check was also not run this phase (unchanged from
  PHASE_16's own disclosed limitation) -- only the deterministic dialogue adapter is exercised by
  the automated test suite.

## TEST evidence

- `npx tsc --noEmit`: PASS, no errors.
- `npm run build`: PASS; all new/changed assets emit correctly hashed files under `dist/assets/`
  (confirms the GitHub Pages `/thinking-game/` base-path pattern this repo already relies on for
  `newlifev02`'s images still works for the newly added ones).
- `npx vitest run` (13 `newlifecore*` test files, 346 tests): **PASS, 346/346**, run once
  immediately after the image/JSX changes landed (before the final heading-text tweak). A second
  targeted re-run of the two directly-affected files
  (`newlifecoreRenderedUI.test.tsx`, `newlifecoreRetrospective.test.ts`) was run after the
  heading-text tweak to double-confirm: **PASS, 71/71**. No test in this suite asserts on the
  exact heading string that was edited (confirmed by direct grep before editing), so this was a
  belt-and-suspenders re-run, not a check against a known risk.
- No pre-existing test was deleted, weakened, or skipped to make this pass.

## VISUAL_VERIFY (real browser, not code-reading)

Playwright (`playwright-core`, headless Chromium) against the local Vite dev server, actual
end-to-end play (arrival -> town -> ~1 day of clicking to reach end-of-day; a further full 30-day
click-through to reach the Day 30 retrospective, including submitting a reflection). Screenshots
saved under `docs/research/evaluation/phase-17/screenshots/`:

| Screen | 360x800 | 390x844 | 430x932 | 1440x900 |
|---|---|---|---|---|
| Arrival guide (welcome image) | checked | checked, screenshot kept | not separately captured (390 representative; layout is a single centered `max-width:640px` column, confirmed unaffected by viewport at 1440 via the day-30 check below) | not separately captured |
| End-of-day (sunset image) | not separately captured | checked, screenshot kept | not separately captured | not separately captured |
| Day 30 retrospective (memory + cheers images) | checked, screenshot kept, no horizontal overflow | checked, screenshot kept (both pre- and post-reflection states) | not captured | checked, screenshot kept, no horizontal overflow |

Horizontal-overflow check (`scrollWidth > clientWidth`) was run programmatically at 360px and
1440px on the Day 30 screen: **false** (no overflow) at both. 430x932 was not separately
screenshotted for the day-end/guide screens this pass -- a real gap in viewport coverage, called
out rather than assumed fine; the layout's `clamp()`-based sizing (shared with the already-tested
`.nlc-hero`/`.nlc-portrait` patterns) makes a problem specifically at 430px unlikely, but "unlikely"
is not "verified."

One real defect was found and fixed during this verification: the first draft's end-of-day
heading ("DAY1、おつかれさま") duplicated the sunset image's own baked caption
("おつかれさま") word-for-word. Caught by actually looking at the rendered screenshot, not by
reading the code -- exactly the kind of thing a "count the screenshots, don't read them" pass
would have missed. Fixed to "DAY{n}が終わった".

## SELF-CRITIQUE (directive Section 20)

- Q1 (decoration only?): No for the 3 places used -- each image's own baked text does work the
  screen would otherwise need a sentence for. Not evaluated for the 2 unused pack images (never
  placed).
- Q2 (more images, harder to read?): Checked directly against real screenshots; no crowding, no
  new overflow, no button pushed off-screen at the viewports actually captured.
- Q3 (breaks the stamp world?): The felt-family "ossan" welcome image sits fine on a plain
  parchment card; the painterly sunset/memory images are visually distinct from felt (see
  `NEWLIFE_VISUAL_LANGUAGE_V1.md`'s honest register-mismatch note) but were placed only as
  full-bleed atmosphere shots, never adjacent to a felt character in the same small card, to
  minimize the seam.
- Q4 (AI drifted the style?): No new art was generated. Every pixel used this phase is an
  unmodified copy of a real Owner-uploaded photo.
- Q5 (still too much text?): Text was reduced by one duplicated clause, not increased anywhere.
- Q6 (see it, know who/where/what happened?): Yes for the 3 touched screens -- verified against
  screenshots, not assumed.
- Q7 (still needs developer explanation?): No new jargon was introduced; nothing here required a
  README to understand from the screenshots alone.
- Q8 (drifted back to counseling-UI?): No -- Day 30's screen kept its existing "no
  achievement/score" restraint; the new images reinforce that restraint rather than fighting it.
- Q9 (stronger "living in a town" feeling?): Modestly yes for the 3 touched beats; the bulk of the
  game (in-scene NPC/location screens) is unchanged this phase, so the overall game-wide feeling
  is only partially addressed -- an honest partial, not a full win.
- Q10 (broke PHASE_16 functionality?): No -- full `newlifecore` suite (346 tests) passed
  unchanged in behavior; only new JSX/image lines and one heading string were added.

## FINAL JUDGMENTS

- USER_STAMP_INTEGRATION = **CONDITIONAL** (3 real, verified placements; 6 NPCs and all specific
  locations remain without any stamp art -- a genuine, disclosed shortfall against the directive's
  full ambition, not a failure of what was attempted).
- VISUAL_IDENTITY = **CONDITIONAL** (in-fiction identity unchanged/preserved; out-of-fiction beats
  meaningfully improved; a real style-register tension between the felt and painterly assets is
  disclosed, not hidden).
- FEYNMAN_CLARITY = **PASS** for the 3 touched screens (verified via screenshots + the
  WHAT-SEES/UNDERSTAND/DO table); **NOT EVALUATED** for the ~9 screens not touched this phase.
- EVENT_VISIBILITY = **NOT ADDRESSED** this phase (out of this Run's scope; PHASE_16's existing
  event-visibility treatment was left untouched).
- NPC_RECOGNIZABILITY = **CONDITIONAL** (unchanged from before this phase: 3/9 NPCs have a real
  portrait, 6/9 do not; this phase added no new NPC portraits, by design, rather than fabricate
  one).
- LOCATION_RECOGNIZABILITY = **CONDITIONAL** (unchanged: one shared town shot, no per-location
  art).
- MOBILE_VISUAL_UX = **PASS** for the touched screens at 360/390/1440 (no overflow, verified);
  **UNVERIFIED at 430px** for 2 of the 3 touched screens (disclosed gap above).
- STATE_COHERENCE = **PASS** (346/346 automated tests; the reducer/engine logic was not touched at
  all this phase, only presentational JSX/CSS/one image import module).
- LIVE_DIALOGUE_REGRESSION = **NOT RE-CHECKED** this phase (no dialogue/content/engine code was
  touched, so no regression is expected, but this phase did not itself run a live-model session to
  confirm -- same disclosed limitation PHASE_16 already carried).
- READY_FOR_HUMAN_VALIDATION = **NO** -- per the directive's own required sequencing (this
  phase -> browser acceptance -> live-model regression check -> new baseline -> HV-01), and
  because the scope delivered here is a real but partial slice of the full directive.

## What's next (not done here, named so it isn't lost)

1. 430px screenshots for the arrival/end-of-day screens (quick, same script).
2. A decision (Owner's, not autonomous) on whether the in-fiction `newlifev02` painterly-felt
   portraits should be extended (commissioned/generated in the same register) for the 6 NPCs
   still missing one, since no real stamp exists for any of them.
3. A live-model (real Gemini) smoke check before HV-01, per PHASE_16's own carried-over gap.
4. Optional: wire the two reserved-but-unused woman stamps (`woman-thumbs-up`,
   `assets/newlife-stamps-source/01_...jpeg`) into exactly one high-value confirm/cancel moment,
   if a specific one is chosen deliberately rather than applied everywhere.

## COMMIT

Local commit only, per this project's standing autonomy profile (no auto-push; push awaits human
confirmation). Files changed: `src/newlifecore/{NewlifeCoreApp.tsx,Day30Retrospective.tsx,
newlifecore.css}` (modified), `src/newlifecore/stampAssets.ts` (new),
`src/assets/newlife-stamps/*.jpeg` (new), `assets/newlife-stamps-source/*` (new, originals
archive), `docs/product/{NEWLIFE_VISUAL_LANGUAGE_V1,NEWLIFE_STAMP_ASSET_AUDIT_V1}.md` (new),
`docs/research/evaluation/phase-17/*` (new, this CLOSE + FEYNMAN_VERIFY + screenshots). No
pre-existing uncommitted changes in the working tree (the large unrelated `case1c`/`DECISIONS.md`/
`docs/product/NEWLIFE_*` diff already present at Run start) were touched, reverted, or included in
this commit.

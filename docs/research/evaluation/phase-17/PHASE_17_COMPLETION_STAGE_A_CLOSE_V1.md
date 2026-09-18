# PHASE_17_COMPLETION_THEN_PHASE_18 — STAGE A CLOSE (PHASE_17_VISUAL_FEYNMAN_COMPLETION_V2)

Baseline: commit `ebb71e6` (the prior, explicitly-partial PHASE_17 CLOSE). This Run completes
STAGE A of `PHASE_17_COMPLETION_THEN_PHASE_18_AI_BOUNDARY_V1` -- Visual + Feynman UX across all 9
required screens, using two real Owner-uploaded stamp packs (audited below), without fabricating
any NPC identity or new art.

## A1/A2 — Asset audit update, and the correction to the prior addendum

Both source packs were verified as real files on disk (not just claimed) before use:
- Pack 1 (`newlife_user_stamp_source_pack.zip`, `assets/newlife-stamps-source/`): unchanged from
  the prior CLOSE, 9 files, no marketplace screenshots.
- Pack 2 (`newlife_user_stamp_supplement_v2.zip`, `assets/newlife-stamps-source-v2/`): 10 files,
  hash-verified against its own `PROVENANCE.md`. Contains 3 real LINE Creators Market screenshots
  (reference only), 2 byte-identical duplicates of pack-1 files, and 5 new usable stamp photos.

Both audits are kept side by side (`NEWLIFE_STAMP_ASSET_AUDIT_V1.md`, `_V2.md`) rather than
overwritten -- the prior report ("no marketplace screenshots exist") was accurate for what had
been delivered at that time; this pack, delivered later, is what made the addendum's earlier,
then-unconfirmed descriptions ("2人組", "ちょっと休憩", "目先に捉われ過ぎ", "Thinking Hamyo")
actually true. Full per-file classification: `assets/newlife-stamps-source-v2/PROVENANCE.md`.

## A3 — Visual family audit result

Confirmed 3 distinct real FELT_CHARACTER individuals across both packs (neutrally named "ossan",
"wavyWoman", "bunWoman" -- never assigned an NPC identity), a SCENIC/LOCATION family in a
different, painterly (non-felt) register, and confirmation that a THINKING/META family
("Thinking Hamyo - Really?") genuinely exists but has no individual usable file, only a
marketplace-screenshot reference. Canonical decision (`NEWLIFE_VISUAL_LANGUAGE_V1.md`, unchanged
this stage): in-fiction town visuals stay the existing felt-doll `newlifev02` art; stamp images
are used only as out-of-fiction beats. THINKING/META was not used anywhere this stage (no usable
asset exists for it yet).

## A4 — No fabricated identity

No image was assigned to Yohei/Miyoko/Jin/Daisuke/Kamiya/Shizuko/Hina/Fumiko/Kiyoshi. The 6 NPCs
without a portrait remain honestly badge-based (now color-differentiated, see A9 below), not
covered by a guessed likeness.

## A5-A14 — Nine-screen completion

Full WHAT-SEES/UNDERSTAND/CAN-DO table: `docs/research/evaluation/phase-17/FEYNMAN_VERIFY_V2.md`.
Screenshot evidence: `docs/research/evaluation/phase-17/screenshots-stage-a-completion/` (this
stage's new screens) + `.../screenshots/` (opening/day-end/day30, carried over from the prior
CLOSE, re-verified still working). Summary of what changed vs. the prior (3-screen) CLOSE:

1. **Opening/Arrival** -- welcome image upgraded from solo `ossan` to `ossan`+`bunWoman` duo
   (pack 2).
2. **Town/location selection** -- movelist buttons now preview who will actually be at each
   location on arrival (`npcsPresentAt` at the real +15min travel cost), not just a bare name.
3. **NPC conversation** -- every NPC card gains a one-line "usual place" subtitle (from their own
   already-authored schedule, not new data); the 6 portrait-less NPCs get distinct badge colors
   instead of one shared grey.
4. **Active event** -- PHASE_16's existing blue-left-border treatment re-verified live in a real
   browser (confirmed visually distinguishable from ordinary scenes); left unmodified (its own
   directive explicitly bans adding an icon/popup on top, and this stage found no reason to
   override that).
5. **Fortune House** -- the existing cross-day text callback now also shows a small, read-only
   repeat of the drawn card's label, verified live across an actual day boundary.
6. **Big Choice** -- its "life may change" signal previously shared the exact same blue as the
   event border; now a distinct warm amber, confirmed in a screenshot where both appear on screen
   at once and read as two different signals.
7. **Trial house/belongings** -- unchanged (already Feynman-clear); purchase-flow regression
   re-confirmed passing, live screenshot taken.
8. **Day transition** -- unchanged from prior CLOSE, re-confirmed working.
9. **Day 30 retrospective** -- unchanged from prior CLOSE, re-confirmed working.

One real defect found and fixed during this stage's own verification: at 360px, "チャレンジ
センター" wrapped mid-word inside its new two-line movelist button; fixed with a small
`@media (max-width: 480px)` font-size rule, re-screenshotted to confirm the fix.

## A15 — No false completion (self-check against the directive's own banned list)

- Not claiming "full rebuild" for a 3-screen change this time -- all 9 were actually touched or
  re-verified, and the ones left visually unchanged (event, day-end, day30) were re-tested live,
  not assumed.
- Asset existence was not treated as PASS by itself -- every new UI element was screenshotted in a
  real browser, including two elements (fortune memory chip, Big Choice in-context) that required
  multi-day/conditional game state to reach, not just a static route.
- Initial badges were not counted as "portrait integration" -- they're explicitly logged as a
  remaining gap in `NEWLIFE_STAMP_ASSET_AUDIT_V2.md`, not silently upgraded.
- No marketplace-page screenshot was pasted into the game; all 3 were kept reference-only.
- No image's subject was guessed into a named NPC.

## A16 — Test evidence

- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS -- all new pack-2 assets emit correctly hashed files in `dist/assets/`.
- `npx vitest run tests/newlifecore*.test.*` (13 files, 346 tests): **PASS, 346/346**, run after
  all STAGE A code changes landed (movelist preview, NPC place subtitle, badge colors, fortune
  memory chip, Big Choice color, the 360px label fix).
- Purchase-flow, Fortune-flow, and Big-Choice regression are all covered by the existing suite
  (unchanged assertions; this stage added no new automated tests, only live-browser evidence for
  the new presentational elements, since the underlying engine/reducer logic was not touched).
- 30-day loop: exercised live (not just via the existing RTL 30-day tests) while capturing the
  Day-2 fortune-memory-chip and Day-6 Big-Choice screenshots.
- Responsive: 360/390/430/1440 checked for the newly-changed NPC-card/movelist/Big-Choice screens;
  no horizontal overflow at any of them (one wrapping defect found and fixed, see A5-A14 above).

## A17 — FINAL JUDGMENTS

- USER_STAMP_INTEGRATION = **CONDITIONAL** (grew from 3 to 4 real placements across two verified
  packs; still zero NPC/location-specific stamp portraits, honestly logged, not fabricated)
- VISUAL_IDENTITY = **CONDITIONAL** (in-fiction/out-of-fiction split now explicit and documented;
  the felt-vs-painterly register tension is disclosed, not hidden or resolved)
- FEYNMAN_CLARITY = **PASS** (all 9 screens reviewed; 6 received a verified, real improvement; the
  3 left unchanged were re-verified live, not assumed still-fine)
- NPC_RECOGNIZABILITY = **CONDITIONAL** (3/9 have a real portrait, unchanged; the other 6 gained
  distinct colors + a real "usual place" subtitle -- a genuine, verified step, not a full fix)
- LOCATION_RECOGNIZABILITY = **CONDITIONAL** (no new per-location art; the movelist's live
  who's-there preview is a real, verified, non-image aid to the same underlying problem)
- EVENT_VISIBILITY = **PASS** (PHASE_16's treatment re-verified live in browser this stage)
- BIG_CHOICE_VISIBILITY = **PASS** (new distinct-color treatment, verified live including
  alongside an active event in the same screenshot)
- FORTUNE_VISUAL_CONTINUITY = **PASS** (cross-day memory chip verified live across a real day
  boundary)
- MOBILE_VISUAL_UX = **PASS** (360/390/430/1440 checked for every screen touched this stage; one
  defect found and fixed)
- STATE_COHERENCE = **PASS** (346/346 automated tests; no engine/reducer/state-shape code was
  touched this stage, only presentational JSX/CSS and two small pure read helpers)
- PHASE_17_COMPLETE = **YES** -- all 9 required screens were genuinely reviewed and (for 6 of them)
  measurably improved, verified live rather than assumed from code, with no fabricated identity or
  pasted marketplace UI. This is a completion of the STAGE A *visual/Feynman work item* as scoped
  by the directive's own allowance for asset shortage (A4/A9) -- it is explicitly **not** a claim
  that NPC/location portrait coverage is complete (see NPC_RECOGNIZABILITY/LOCATION_RECOGNIZABILITY
  above, both CONDITIONAL, and the open-gaps list below).

## A18/A19 — Commit and transition gate

PHASE_17_COMPLETE = YES and STATE_COHERENCE = PASS, so per A18 a completion commit was made on top
of `ebb71e6` (not amending it): **`52ae0ea`**. Per A19, this does not open HV-01 -- STAGE B
(PHASE_18) is next, and a new Human Validation baseline is only confirmed at the very end of
STAGE B (directive B23).

## What's still open after STAGE A (not lost, named)

1. No portrait exists for Kamiya, Daisuke, Shizuko, Hina, Fumiko, or Kiyoshi -- would need either
   more Owner stamp material that happens to map to one of them, or an Owner decision to
   commission/generate matching-style art (this Run generated nothing).
2. No individual "Thinking Hamyo" stamp file exists yet -- only a marketplace reference. If the
   Owner wants this character used for Reality Bridge/meta guidance (per the addendum's own
   suggested scope), an individual file is needed first.
3. 4 real stamp images are registered but intentionally unplaced (`bunWomanThumbsUp`,
   `bunWomanBreak`, `wavyWomanLookingCloser`, `ossanOtsukaresama2`).
4. No per-location art beyond the single shared town hero shot.

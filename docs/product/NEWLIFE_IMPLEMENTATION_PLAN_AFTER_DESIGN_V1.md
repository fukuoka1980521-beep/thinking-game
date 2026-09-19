# NEW LIFE — Implementation Plan After Design V1 (PHASE_21)

No code is written in this phase. This is the ordering plan for the phase(s) that follow, once
this design is reviewed.

## Principle (Section 49)

Do not build all 7 days before knowing 10 minutes and Day 1-2 are fun. Implementation proceeds in
slices, each one gated on the previous slice actually landing (a human check, not just automated
tests passing).

## Smallest vertical slice (build first)

**"Day 1 + Day 2, Hina + Yohei only."**

- 2 NPCs (of the eventual 6): Hina, Yohei -- reuses their existing `npcDefs.ts` entries, extended
  per the roster doc's new fields (relationships, hidden background updates for Hina's shop-fear
  detail).
- 2 locations: 商店街 (Hina), 洋平商店 (Yohei), plus 仮住まい (always needed as the day
  bookend) -- 3 locations total, not 6.
- 1 new recurring-world-event: the Day-2 "town moved without you" beat, scoped to whichever of
  the 2 the player skips (a 2-branch case, not the full eventual 6).
- 1 new image asset minimum to unblock this slice: Hina's portrait (Yohei's already exists,
  though the Owner has flagged it needs rework for the Jin-similarity problem -- not required to
  fix for THIS slice, since Jin isn't in it yet).
- 2-action/day budget enforcement in the UI.
- Automated tests: the day-2 town-change beat, the 2-action budget, Hina's new content.
- Human check: does Day 1 → Day 2 alone produce the "the town moved without me" feeling this whole
  design is built around? If not, iterate here before adding NPC 3.

## Slice 2

Add Jin + 集会所, the Day 3-4 unresolved-thread/consequence beats, Jin's portrait (with an explicit
differentiation pass against Yohei per Section 6's 2-second test).

## Slice 3

Add Miyoko + 喫茶のどか (the ORDER→DRINK→CONVERSATION sequence), Daisuke folded into 商店街, Day 5's
Big Choice (Jin's trajectory, reframed).

## Slice 4

Add Fumiko + updated 集会所 content, Day 6's cross-NPC-intersection beat, Fortune House re-enabled
as the 6th location, Day 7's retrospective.

## Slice 5

Full 5-type playtest (real browser, not paper) against the completed 7-day slice; live Gemini
matrix re-run across the new/reworked 6 MAIN NPCs; visual review gate (contact sheets) once all 6
portraits + 6 location images exist.

## Explicit non-goals for all of the above

No Reality Bridge, no 30-day retrospective, no late-consequence system, no Miyoko/Fumiko
trajectory seeds -- all DEFERRED per `NEWLIFE_KEEP_REWORK_REMOVE_MATRIX_V1.md`, revisited only
after human signal on the 7-day slice (directive Section 8's Step 6).

## Blocking dependency

Every slice above needs at least one new image asset (Hina at minimum for Slice 1). Per PHASE_20's
own finding, this environment has no image-generation tool -- **implementation cannot start until
new art (or an external generation path) is available**, independent of this design being
complete and ready.

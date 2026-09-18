# NEW LIFE — Visual Language V1 (PHASE_17)

Directive: PHASE_17_NEW_LIFE_VISUAL_FEYNMAN_REBUILD_V1 + its two addenda (USER_STAMP_SOURCE_AUDIT_CORRECTION,
USER STAMP SOURCE EXPANSION + STYLE SEGREGATION). Source pack: `assets/newlife-stamps-source/`
(9 files, audited in that folder's `PROVENANCE.md`).

## What actually exists (not what was described)

The addendum described four asset families (FELT CHARACTER / SCENIC / THINKING-META / LINE
Creators Market screenshots). The real 9-file pack contains only:

- **FELT_CHARACTER family** -- two consistent, recurring characters, wool-felt 3D-render style:
  - An older bald man with round glasses, grey mustache, grey scarf, navy cardigan (5 known
    expressions total: `ossan-cheerful`/`ossan-listening`/`home-welcome-felt`/
    `session-complete-evening` already shipped elsewhere in this app, plus new `07`=`承知しました`
    and `08`=`かんぱい` from this pack).
  - A young woman, brown wavy hair, tan fleece jacket (3 expressions: `01`=stop-hand/refuse,
    `02`=arms-crossed/annoyed, `09`=thumbs-up/agree). New to this repo.
- **SCENIC family** -- but NOT felt-textured. `03` (urban street, grilled fish) and `04`
  (residential sunset) are a detailed **painterly digital-illustration** register, visually
  distinct from the felt dolls. They read as a believable "warm, nostalgic town" but do not
  belong in the same card as a felt character without a visible seam.
- Two one-off outliers that don't cleanly join either family: `05` (a flat-cartoon woman looking
  at a framed painterly canvas -- a third register) and `06` (a smooth 3D-cartoon icon, a fourth
  register).
- No LINE Creators Market screenshots, no "Thinking Hamyo" pack, no 2-person stamp were present.

## Canonical decision for NEW LIFE's in-world visual language

Rather than force three-to-four different rendering registers into one town, this phase draws a
line between **in-fiction** and **out-of-fiction** use:

1. **In-fiction (the town itself)**: stays exactly as it already was --
   `src/assets/newlifev02/{yohei,miyoko,soma-jin,challenge-town}.png`, a felt/wool-doll register
   that already matches the ossan-family's texture, proportions, and palette closely (confirmed
   by direct visual comparison). This is `newlifecore`'s existing, working, already-tested visual
   identity for its three currently-scheduled main NPCs and the town hero shot. **KEEP, unchanged.**
   Six NPCs (Daisuke, Shizuko, Hina, Fumiko, Kiyoshi, Kamiya) still have no portrait and fall back
   to a plain initial-letter badge (`Portrait` component, `NewlifeCoreApp.tsx`) -- a real,
   reported gap, not silently patched with a mismatched asset.
2. **Out-of-fiction beats (arrival, end-of-day, the 30-day retrospective)**: the new felt-family
   stamps and the sunset/memory scenic images, used as neutral companion/atmosphere moments that
   never claim to be a specific resident. This is where this phase's new assets actually landed
   (see `src/newlifecore/stampAssets.ts`).
3. **Not used this phase**: `03` (style clash risk, no natural fit found in current screens), `06`
   (fourth register, no clear role). Kept in the source archive and audited, not deleted, not
   forced into a placement that would look "pasted on."

## Old AI-generated art -- KEEP/REWORK/REMOVE judgment (Section 8/9)

| Asset | Where used | Judgment | Reason |
|---|---|---|---|
| `src/assets/newlifev02/{yohei,miyoko,soma-jin,challenge-town}.png` | `newlifecore` (the active target of this phase) | **KEEP** | Felt-doll register, visually consistent with the confirmed user-stamp family; already tested and working; removing it would be a net loss with nothing better to replace it. |
| `public/newlife-assets/{characters,locations}/*.png` (painterly-anime-realism register) | `src/newlife/NewLifeApp.tsx` -- an older, currently-default-linked New Life build, NOT `newlifecore` | **OUT OF SCOPE this phase** | This phase's directive and PHASE_16's prior work both target `newlifecore`; the older `src/newlife/` module was not touched by PHASE_16 either and re-litigating its art is a separate, larger decision (which "New Life" build should even be the one linked from Home) that this phase's directive did not ask for. Flagged here rather than silently ignored. |

## Consequence for FEYNMAN clarity

Images are used only where they answer one of WHO / WHERE / WHAT-IS-HAPPENING / MEMORY / CHOICE
without adding a caption the player has to read past:
- WHERE/WHAT: the existing town hero shot + NPC portraits (unchanged, already working).
- WHO the player has just met (system-level, not a resident): the welcome image on the arrival
  guide card -- its own baked text ("よろしくお願いします") already says what a caption would.
- WHAT-just-changed / MEMORY: the sunset image on the end-of-day screen ("おつかれさま" doubles
  as the screen's own greeting) and the nostalgic-view image opening the Day 30 retrospective
  ("しみじみ" frames "look back at 30 days" without a paragraph of narration).
- CHOICE (Big Choice, offers): deliberately **not** touched this phase -- adding a reaction icon
  to every accept/decline button in the game (there are many) would be decoration, not
  information, and risks exactly the "images increased but got harder to read" self-critique
  failure this directive warns against. The two woman-stamp images are copied and reserved
  (`stampAssets.ts` -> `womanThumbsUp`) but intentionally not wired into a screen yet.

# NEW LIFE — User Stamp Source Pack (repo copy)

This folder is the originals-only archive for PHASE_17_NEW_LIFE_VISUAL_FEYNMAN_REBUILD_V1.
Files here are byte-identical copies of the 9 images the Owner uploaded on 2026-09-10
(`newlife_user_stamp_source_pack.zip`, delivered via Downloads on 2026-09-19). **Do not edit
or overwrite these files.** Any crop/resize/recolor/text-removal derivative must be written
as a new file elsewhere and recorded as `DERIVED_FROM_USER_STAMP`.

See `PROVENANCE_ORIGINAL.md` in this same folder for the pack's own manifest text.

## Contents and classification

| File | Depicts | Family | Classification |
|---|---|---|---|
| `01_...jpeg` | Young woman, brown wavy hair, tan fleece jacket -- stop-hand gesture, "誰もそんな事聞いていないよ" | FELT_CHARACTER (woman) | SOURCE_ORIGINAL_USER_STAMP |
| `02_...jpeg` | Same woman, arms crossed, "浅薄だな" | FELT_CHARACTER (woman) | SOURCE_ORIGINAL_USER_STAMP |
| `03_...jpeg` | Detailed painterly illustration: urban street corner, grilled-fish signage, "おなかすいた" | SCENIC (painterly register -- NOT felt-textured, a different visual register from the other 8) | SOURCE_ORIGINAL_USER_STAMP |
| `04_...jpeg` | Painterly illustration: residential rooftops at sunset, power lines, "おつかれさま" | SCENIC (painterly register) | SOURCE_ORIGINAL_USER_STAMP -- **used** (`stampAssets.ts` -> `scenicEveningSunset`, day-end screen) |
| `05_...jpeg` | Flat-cartoon-style woman in a sun hat looking at a framed painterly town/river scene, "しみじみ" | Hybrid (flat-cartoon figure + painterly canvas-within-image; a third register) | SOURCE_ORIGINAL_USER_STAMP -- **used** (`stampAssets.ts` -> `memoryNostalgicView`, Day 30 retrospective) |
| `06_IMG_3420.png` | Bun-haired woman, red sweater, waving, transparent background | Smooth 3D-cartoon icon (a fourth register, distinct from the felt-doll texture) | SOURCE_ORIGINAL_USER_STAMP -- reviewed, not placed this phase (style doesn't match the felt family; would need its own consistent role/context to avoid a jarring mix) |
| `07_...jpeg` | Older bald man, round glasses, grey mustache, grey scarf, navy cardigan -- waving, "承知しました" | FELT_CHARACTER (man) -- **same character as the already-shipped `src/assets/ossan-*.png` family** | SOURCE_ORIGINAL_USER_STAMP -- **used** (`stampAssets.ts` -> `ossanUnderstood`, copied to `src/assets/newlife-stamps/ossan-understood.jpeg`) |
| `08_...jpeg` | Same older man, holding a beer, "かんぱい" | FELT_CHARACTER (man), same character as above | SOURCE_ORIGINAL_USER_STAMP -- **used** (`stampAssets.ts` -> `ossanCheers`, Day 30 retrospective close) |
| `09_...jpeg` | Same young woman as 01/02, thumbs up, "了解です" | FELT_CHARACTER (woman) | SOURCE_ORIGINAL_USER_STAMP -- copied to `src/assets/newlife-stamps/woman-thumbs-up.jpeg`, reserved (not wired into a screen this phase) |

## Cross-reference to already-shipped assets

`src/assets/ossan-cheerful.png`, `ossan-listening.png`, `home-welcome-felt.png`,
`session-complete-evening.png` are the SAME older-man character as files 07/08 above, from a
different LINE sticker pack upload commit (`d58555e`, 2026-09-02, message: "Add one
Owner-provided felt-character illustration each to HOME and SESSION_SUMMARY (sourced from the
Owner's own existing LINE sticker packs...)"). These are DERIVED_FROM_USER_STAMP-adjacent in the
sense that they predate this pack, but are themselves unmodified originals from an earlier
upload -- also SOURCE_ORIGINAL_USER_STAMP, just archived under `src/assets/` instead of this
folder (moving them here was judged unnecessary churn; they are already correctly provenanced in
git history and `docs/DECISIONS.md`/`docs/product/CHARACTER_BIBLE_V1.md`).

## What this pack does NOT contain

The addendum directive (PHASE_17 ADDENDUM) described additional categories -- a "2人組
（よろしくお願いします）" stamp, "ちょっと休憩"/"目先に捉われ過ぎ" stamps, a "Thinking Hamyo -
Really?" pack, and LINE Creators Market page screenshots. None of these exist in the actual
9-file pack received; only the 9 files listed above were present, matching the pack's own
`PROVENANCE_ORIGINAL.md` manifest. This mismatch is called out here rather than silently
assumed away -- if those additional stamps genuinely exist, they were not part of this delivery
and would need to be supplied separately.

## Named-NPC mapping

No file in this pack is treated as a portrait for Yohei/Miyoko/Jin/Daisuke/Shizuko/Hina/
Fumiko/Kiyoshi/Kamiya. Per directive Section 2/6, none of these people are named or confirmed
by the Owner as any specific New Life resident, so all are used only as neutral,
out-of-fiction beats (arrival welcome, end-of-day, retrospective), never as an in-fiction
character portrait.

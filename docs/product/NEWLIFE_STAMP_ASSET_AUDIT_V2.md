# NEW LIFE — Stamp Asset Audit V2 (PHASE_17_COMPLETION STAGE A)

Supersedes nothing in `NEWLIFE_STAMP_ASSET_AUDIT_V1.md` (kept as an accurate record of pack 1
alone) -- this document adds pack 2 (`assets/newlife-stamps-source-v2/`, the "USER STAMP SOURCE
EXPANSION" supplement, received 2026-09-19) and records what actually changed in the game.

## Pack 2 contents (full table)

See `assets/newlife-stamps-source-v2/PROVENANCE.md` for the complete file-by-file table
(source class / family / intended use / direct-or-derived / in-world-or-meta). Summary:

- 3 files are LINE Creators Market marketplace screenshots (reference only, hash-verified real
  uploads, not pasted into the game): confirm the ossan pack's real name/scope ("hokkori
  autumn_LINE", byline "Shinobu Fukuoka" -- matching this account's own name on file), confirm a
  real "Thinking Hamyo - Really?" critical-thinking character pack exists (no individual file of
  it was provided, so it remains reference-only with zero usable in-game asset), and confirm the
  "Warm Scenic Messages" pack pack-1's 3 scenic files came from.
- 2 files are byte-identical duplicates of pack-1 files (confirmed by sha256, not re-copied).
- 5 files are new, individual, usable stamp photos: two of a new character ("bunWoman"), one more
  of the pack-1 "wavyWoman", one more ossan expression, and one duo (ossan + bunWoman together).

## What actually changed in `newlifecore` this stage

| Asset | Change |
|---|---|
| `duoWelcome` (pack 2, ossan+bunWoman, "よろしくお願いします") | **New use**: replaces the solo `ossanWelcome` image on the arrival/guide screen (`PlayGuideCard`) |
| `bunWomanThumbsUp`, `bunWomanBreak`, `wavyWomanLookingCloser`, `ossanOtsukaresama2` | Copied into `src/assets/newlife-stamps/`, registered in `stampAssets.ts`, reviewed for a placement, **deliberately not wired into any screen** (see reasons in `stampAssets.ts`'s own comments and `NEWLIFE_VISUAL_LANGUAGE_V1.md`) |
| Six-NPC portrait gap | **Not closed** -- still no real stamp or approved art for Kamiya/Daisuke/Shizuko/Hina/Fumiko/Kiyoshi. Addressed instead via non-image means (see below), per directive A9's explicit "画像不足を嘘の画像で埋めない" |

## Non-image NPC/location recognizability work (directive A9, real code changes, not new art)

- Every NPC card (portrait or badge) now shows a one-line "usual place" subtitle
  (`usualLocationFor` in `npcDefs.ts`, read from that NPC's own already-authored schedule --
  no new data invented) -- e.g. "洋平商店の人" under 洋平, "集会所の人" under 文子.
- The six badge-only NPCs each get a fixed, distinct background color instead of one shared grey
  ("神"/"文"/"静"/etc. are now visually distinguishable from each other at a glance, not just from
  the photographed NPCs).
- The movelist now shows who will actually be at each location on arrival (`npcsPresentAt` at
  `state.time + 15`, matching `moveTo`'s real travel cost) -- e.g. "洋平商店 / 洋平", "商店街 /
  誰もいないかも" -- so WHO+WHERE is answered before committing to a move, not only after.
- Fortune House's existing text-only "前回のカードのことを覚えている" follow-up line now also
  shows a small, non-interactive repeat of that card's own label (`.nlc-fortune-card` register,
  read-only) -- `lastFortuneCardLabelFor` in `content/day1.ts`, mirroring the exact condition the
  text version already used (no new state).
- The Big Choice signal (`LifeOpportunityOffer`'s "この返事で、しばらく生活が変わるかもしれない")
  previously shared its blue left-border treatment 1:1 with the "something is happening"
  event-scene border -- now a distinct warm amber, so the two signals don't read as the same
  thing. Confirmed by a live screenshot where both appear on screen simultaneously (a Big Choice
  offered inside an active-event scene) and remain visually distinct.
- One responsive fix: at 360px, "チャレンジセンター" wrapped mid-word inside its movelist button;
  a small font-size reduction at the existing 480px breakpoint keeps every location label on one
  line.

## Still-open gaps (honestly logged, not fabricated)

- No per-location art beyond the one shared `challenge-town.png` hero shot.
- Six NPCs remain portrait-less (initial badge + usual-place text only).
- The "Thinking Hamyo" character has zero usable individual asset -- only a marketplace-screenshot
  reference. If the Owner wants this character used anywhere (Reality Bridge/meta guidance, per
  the addendum's own suggested scope), an individual stamp file is still needed.
- 4 real, usable stamp images (`bunWomanThumbsUp`, `bunWomanBreak`, `wavyWomanLookingCloser`,
  `ossanOtsukaresama2`) are registered but unplaced -- reviewed and deliberately held back rather
  than forced into a screen that didn't fit.

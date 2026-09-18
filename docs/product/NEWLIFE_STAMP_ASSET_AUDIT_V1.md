# NEW LIFE — Stamp Asset Audit V1 (PHASE_17)

Addendum Section 10's required table. Source: `assets/newlife-stamps-source/` (9 files, the
Owner's 2026-09-10 LINE-sticker upload) plus the 4 already-shipped `src/assets/{ossan-cheerful,
ossan-listening,home-welcome-felt,session-complete-evening}.png` and the 4 already-shipped
`src/assets/newlifev02/{yohei,miyoko,soma-jin,challenge-town}.png`.

| File | Source class | Family | Intended use | Direct or derived | Visible UI placement | In-world? | Meta-only? |
|---|---|---|---|---|---|---|---|
| `01_...jpeg` (woman, stop-hand, "誰もそんな事聞いていないよ") | SOURCE_ORIGINAL_USER_STAMP | FELT_CHARACTER (woman) | Reviewed; no placement found this phase | direct | none | no | no (unused) |
| `02_...jpeg` (woman, arms crossed, "浅薄だな") | SOURCE_ORIGINAL_USER_STAMP | FELT_CHARACTER (woman) | Reviewed; no placement found this phase | direct | none | no | no (unused) |
| `03_...jpeg` (painterly street/food scene, "おなかすいた") | SOURCE_ORIGINAL_USER_STAMP | SCENIC (painterly, not felt) | Reviewed; held back to avoid style clash | direct | none | no | no (unused) |
| `04_...jpeg` (painterly sunset over rooftops, "おつかれさま") | SOURCE_ORIGINAL_USER_STAMP | SCENIC (painterly) | Day-end screen backdrop | direct (CSS-cropped via `object-fit: cover`, no pixel edit) | `NewlifeCoreApp.tsx` end-of-day hero (`stampAssets.ts` -> `scenicEveningSunset`) | **meta** (day-transition beat, not an in-fiction location) | yes |
| `05_...jpeg` (flat-cartoon woman + framed painterly town view, "しみじみ") | SOURCE_ORIGINAL_USER_STAMP | Hybrid (own register) | Day 30 retrospective opening image | direct | `Day30Retrospective.tsx` (`stampAssets.ts` -> `memoryNostalgicView`) | **meta** (memory/retrospective beat) | yes |
| `06_IMG_3420.png` (bun-haired woman, transparent, waving) | SOURCE_ORIGINAL_USER_STAMP | Smooth 3D-cartoon icon (own register) | Reviewed; no consistent role found this phase | direct | none | no | no (unused) |
| `07_...jpeg` (older man, glasses/scarf, "承知しました") | SOURCE_ORIGINAL_USER_STAMP -- same character as already-shipped `ossan-*` assets | FELT_CHARACTER (man) | Copied for future confirmation-beat use | direct, copied to `src/assets/newlife-stamps/ossan-understood.jpeg` | not yet wired into a screen | no | reserved |
| `08_...jpeg` (older man, beer, "かんぱい") | SOURCE_ORIGINAL_USER_STAMP -- same character as above | FELT_CHARACTER (man) | Day 30 retrospective closing beat (after reflection is recorded) | direct | `Day30Retrospective.tsx` (`stampAssets.ts` -> `ossanCheers`) | **meta** | yes |
| `09_...jpeg` (woman, thumbs up, "了解です") | SOURCE_ORIGINAL_USER_STAMP | FELT_CHARACTER (woman) | Copied for future confirmation-beat use | direct, copied to `src/assets/newlife-stamps/woman-thumbs-up.jpeg` | not yet wired into a screen | no | reserved |
| `home-welcome-felt.png` (older man, "よろしくお願いします") | SOURCE_ORIGINAL_USER_STAMP (already shipped, 2026-09-02 upload) | FELT_CHARACTER (man) | Arrival/guide-screen welcome | direct, reused as-is | `NewlifeCoreApp.tsx` `PlayGuideCard` (`stampAssets.ts` -> `ossanWelcome`) | **meta** (out-of-fiction welcome) | yes |
| `ossan-cheerful.png` / `ossan-listening.png` / `session-complete-evening.png` | SOURCE_ORIGINAL_USER_STAMP (already shipped) | FELT_CHARACTER (man) | Used elsewhere in the app (HomeScreen, episodes, case1c); not touched this phase | direct | outside `newlifecore` | n/a | n/a |
| `newlifev02/yohei.png` | AI_GENERATED (approved-art workflow, felt-doll register matching the stamp family) | In-fiction NPC portrait | Yohei's portrait | direct (pre-existing) | `NewlifeCoreApp.tsx` NPC card | **yes** (in-fiction) | no |
| `newlifev02/miyoko.png` | AI_GENERATED | In-fiction NPC portrait | Miyoko's portrait | direct (pre-existing) | `NewlifeCoreApp.tsx` NPC card | **yes** | no |
| `newlifev02/soma-jin.png` | AI_GENERATED | In-fiction NPC portrait | Jin's portrait | direct (pre-existing) | `NewlifeCoreApp.tsx` NPC card | **yes** | no |
| `newlifev02/challenge-town.png` | AI_GENERATED | In-fiction town hero shot | Opening/town header | direct (pre-existing) | `NewlifeCoreApp.tsx` opening hero | **yes** | no |

## Outstanding gaps (logged, not fabricated)

- Six NPCs have no portrait at all and render as a plain initial-letter badge: Kamiya, Daisuke,
  Shizuko, Hina, Fumiko, Kiyoshi. No user stamp or approved art exists for any of them; none was
  invented this phase.
- No location-specific art exists for 洋平商店 / 喫茶のどか / 集会所 / 仮住まい / 商店街 /
  Fortune House individually -- only the one wide `challenge-town.png` establishing shot. Each
  location screen is still text + the shared town-scale image, not its own backdrop.
- `03` (street/food) and `06` (bun-haired icon) were reviewed and deliberately not placed, to
  avoid a visible style seam against the felt/painterly pairing already in use.

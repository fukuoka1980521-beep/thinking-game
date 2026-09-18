# NEW LIFE — User Stamp Supplement Pack V2 (repo copy)

PHASE_17_COMPLETION_THEN_PHASE_18 STAGE A. Files here are byte-identical copies of the 10 images
in `newlife_user_stamp_supplement_v2.zip` (Downloads, received 2026-09-19; the pack's own
`PROVENANCE_ORIGINAL.md` claims a 2026-09-18/19 ChatGPT-conversation upload). Hashes in that file
were independently recomputed and matched exactly (`sha256sum` against every file) -- this pack's
provenance claim is not taken on faith alone. **Do not edit or overwrite these files.**

## Correction to the PACK V1 audit (`assets/newlife-stamps-source/PROVENANCE.md`)

That earlier document is being kept, not deleted -- it accurately described PACK V1, which really
did contain only 9 individual stamp photos and no marketplace screenshots. This pack (V2) is a
**separate, later delivery** that happens to include marketplace screenshots. The two reports are
not in conflict; they describe two different deliveries received nine days apart.

## Contents and classification

| File | Depicts | Family | Classification |
|---|---|---|---|
| `01_IMG_3756.jpeg` | LINE Creators Market page: "hokkori autumn_LINE" by Shinobu Fukuoka -- a 16-sticker grid of the already-confirmed ossan character (おはよう/こんにちは/おつかれさま/ありがとう/よろしくお願いします/了解です/承知しました/気をつけて/ちょっと休憩/またね/今向かってます/到着しました/大丈夫です/本日もご安全に/また明日/おやすみなさい) | REFERENCE / MARKETPLACE SCREENSHOT | USER_PROVIDED_REFERENCE_SCREENSHOT -- confirms the ossan pack's real scope and (via the "Shinobu Fukuoka" byline, matching this account's own name on file) the Owner's authorship; NOT used as a direct game asset (contains phone chrome, browser UI, LINE branding, a compressed thumbnail grid) |
| `02_IMG_3755.jpeg` | LINE Creators Market page: "Thinking Hamyo - Really?" by Shinobu Fukuoka -- a 16-sticker grid of a different character (bald, glasses, suit) with critical-thinking phrases (それ、本当？/根拠は？/なんかおかしくない？/一回整理しよ/で結局どうする？/現実で確かめよ/それ面白いな/そこが本質やね/それは今いらん/失敗もデータや/まずやってみよ/まぁ何とかなる/なるほどそう来たか/まぁええか/次いこ次/丸く収まればよし) | THINKING / META (reference only) | USER_PROVIDED_REFERENCE_SCREENSHOT -- confirms this pack genuinely exists (the earlier PHASE_17 addendum's claim was correct after all, just not yet delivered at the time); no individual cropped file of this character was provided, so **no usable in-game asset exists for this character yet**, only this reference |
| `03_IMG_3754.jpeg` | LINE Creators Market page: "Warm Scenic Messages" by Shinobu Fukuoka -- a 16-scene grid (おはよう/おつかれさま/よろしくお願いします/なるほど/しみじみ/ひと休み/癒される/おじゃまします/おなかすいた/きれいだね/ただいま/いいね/いってきます/また行こう/また明日/おやすみ) | SCENIC / LOCATION (reference only) | USER_PROVIDED_REFERENCE_SCREENSHOT -- confirms pack-1 files 03/04/05 (street food, sunset, memory-painting) are individual exports from this exact pack; 13 more scenes exist in this pack but only as this compressed thumbnail, not as individual files -- **no new usable scenic asset added this pack** |
| `04_660598B4...(1).jpeg` | Woman, hair in a bun, red sweater, thumbs up, winking, "了解です" | FELT_CHARACTER (bunWoman, new) | SOURCE_ORIGINAL_USER_STAMP -- copied to `src/assets/newlife-stamps/bunwoman-thumbs-up.jpeg`; reserved, not wired into a screen |
| `05_15F6A22D...(1).jpeg` | Same bunWoman, sheet face mask, hands on cheeks, "ちょっと休憩" | FELT_CHARACTER (bunWoman) | SOURCE_ORIGINAL_USER_STAMP -- copied to `src/assets/newlife-stamps/bunwoman-break.jpeg`; reviewed for `ActivitySession.tsx`, deliberately not placed (that component is shared by every activity type, not specifically "resting") |
| `06_70635361...jpeg` | The pack-1 "wavyWoman" (long wavy hair, tan/navy fleece jacket), lying down looking through a magnifying glass at a seedling, Mt. Fuji behind her, "目先に捉われ過ぎ" | FELT_CHARACTER (wavyWoman) | SOURCE_ORIGINAL_USER_STAMP -- copied to `src/assets/newlife-stamps/wavywoman-looking-closer.jpeg`; reviewed for `RealityBridgeOffer.tsx`, deliberately not placed (a cute "gotcha, look closer" image next to someone naming a real personal concern reads as tonally mismatched, not as clarity) |
| `07_5D001EB0...(2).jpeg` | Same ossan, same beer pose, "かんぱい" | FELT_CHARACTER (ossan) | **Byte-identical duplicate of pack-1 file `08` (sha256 confirmed) -- not re-copied, already in use as `stampAssets.ossanCheers`** |
| `08_IMG_3413(1).png` | ossan + bunWoman together, both waving, "よろしくお願いします" | FELT_CHARACTER (duo) | SOURCE_ORIGINAL_USER_STAMP -- copied to `src/assets/newlife-stamps/duo-welcome.png`; **used**, replacing the solo `ossanWelcome` image on the arrival/guide screen |
| `09_CB66E3A4...jpeg` | ossan, arms crossed, content smile, "おつかれさま" | FELT_CHARACTER (ossan) | SOURCE_ORIGINAL_USER_STAMP -- copied to `src/assets/newlife-stamps/ossan-otsukaresama-2.jpeg`; reserved (a second expression of a phrase already covered by the sunset-scene end-of-day beat; not placed, to avoid using two different images for the same moment) |
| `10_186DF425...(2).jpeg` | wavyWoman, thumbs up, "了解です" | FELT_CHARACTER (wavyWoman) | **Byte-identical duplicate of pack-1 file `09` (sha256 confirmed) -- not re-copied, already in the repo as `stampAssets.wavyWomanThumbsUp`** |

## What this pack confirms about the earlier (incorrect-at-the-time) addendum

The PHASE_17 addendum before this one described a "2人組（よろしくお願いします）" stamp,
"ちょっと休憩"/"目先に捉われ過ぎ" stamps, and a "Thinking Hamyo - Really?" pack -- none of which
existed in the pack actually delivered at that time (`newlife_user_stamp_source_pack.zip`, audited
in `../newlife-stamps-source/PROVENANCE.md`). This pack (V2) shows those descriptions were accurate
in advance of an intended later delivery, not fabricated -- they just hadn't arrived yet. Both
audit documents are kept as an honest record of what was true at each point in time.

## Named-NPC mapping

As with pack V1: no file here is treated as a portrait for any specific New Life NPC. "ossan",
"wavyWoman", and "bunWoman" are neutral descriptive labels, not Owner-assigned identities.

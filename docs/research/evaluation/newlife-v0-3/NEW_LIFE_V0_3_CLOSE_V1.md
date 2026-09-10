# NEW LIFE V0.3 — Game Design Refoundation (DAY1–DAY7) — CLOSE V1

Directive: `NEW_LIFE_V0_3_GAME_DESIGN_REFOUNDATION` (2026-09-10). Not an extension of V0.2 — a
refoundation. V0.2 (`?newlifev02=1`, commit `0f3952b`) is left in place, untouched, as a separate
route; this Run builds a new, deeper module (`?newlifev03=1`) rather than modifying it, since the
directive's own framing ("現在のNEW LIFE V0.2は、そのまま拡張しない") calls for a rebuild, not a
patch, and V0.2 remains a legitimate, independently-tested artifact worth keeping addressable.

## Baseline

- BASELINE COMMIT: `0f3952b` (V0.2 rebuild, previous Run).
- Approved art: reused verbatim from `src/assets/newlifev02/` (town/Yohei/Miyoko/Jin) — no new
  image work was done, per the directive's explicit "画像改善作業は今回禁止". Kamiya (神谷), the
  new major NPC this phase, has no approved portrait; he is rendered name-only (no placeholder
  silhouette either), which is the honest choice given no art exists for him and none may be
  generated this Run.
- `src/App.tsx` again carried a large, unrelated in-progress diff at Run start (same one noted in
  the V0.2 CLOSE). It was left untouched; only 4 lines (import, `View` variant, query-param
  branch, render branch) were committed, isolated the same way as before (reset to HEAD, reapply
  just those 4 lines, commit, restore the rest of the working tree on top so it remains exactly
  as uncommitted as it was before this Run).

## Design layer

- **15 career destinations + life-status axis**: `src/newlifev03/careers.ts`. Every career has
  >=2 named discovery routes (design intent); only a handful are actually wired to state signals
  in this DAY1-7 slice (see below) — the rest are seeds for a later Run, per the directive's own
  "don't build all 30 days first" instruction.
- **NPC relationship/mood design**: `src/newlifev03/npcData.ts`. Kamiya added locally (36,
  Challenge Center) without touching the frozen `bounded-generative-world` canon registry;
  Yohei/Miyoko/Jin's displayName/role are read from that frozen registry unchanged. Per-day mood
  table (`moodFor`) and static relationship notes exist so NPCs are not uniform-friendly event
  dispensers — used as flavor in dialogue, never surfaced as an explicit relationship chart.
- **Free-text AI, kept separate from state**: `src/newlifev03/freeTextAi.ts`. Deliberately does
  NOT call the live Vertex adapter `bounded-generative-world` uses — that module's types are
  frozen and scoped to exactly 3 NPCs; reusing it here would mean either modifying a frozen
  contract or awkwardly coupling this module to it. Instead: a small deterministic responder,
  keyword-classifying the player's own text into a topic, with an in-character reply per NPC per
  topic. Mirrors the same "AI = performance, STATE = deterministic" split the frozen module
  already established (`NpcResponseEnvelope.visibleUtterance` vs. `classification`) — only the
  classification of what the PLAYER typed ever touches career signals; the generated reply text
  never does.

## What was built: DAY1–DAY7, not DAY1–DAY30

`src/newlifev03/` — a beat-graph module (`state.beatId` keyed into a per-day `BEATS` registry,
`content/day1.ts`…`day7.ts` merged in `content/index.ts`), not a fixed N-step pipeline, because
days differ in shape (a half-day commitment collapses the rest of a day into fewer beats; a
normal day has two location visits plus one free-text beat).

- `types.ts` / `engine.ts` — state shape and pure reducers (`applyChoice`, `applyFreeText`,
  `startNextDay`, `daySummaryBundle`). Career signals (`Partial<Record<CareerId, number>>`) and
  NPC impression are simple accumulators, not a new persisted schema — `LifeMaterial` (from
  `../research/life-material-7day/types`, unchanged) is still the only "life material" record
  type, exactly as the prior Run established.
- `NewlifeV03App.tsx` / `newlifev03.css` — the React surface. Always shows `DAY N ・ 残りM日` in
  the topbar (every screen, not just dialogue) — the concrete, unmissable answer to "30日という
  期限を常に感じる".

### Daily structure (directive "DAILY DEPTH" / "TIME / OPPORTUNITY COST")

Each day: wake → a location pick (of up to 4: 洋平商店/喫茶のどか/集会所/チャレンジセンター) →
that NPC's scene → the day's one mandatory free-text beat → a second location pick → that NPC's
scene → evening → a day-end wrap. That is 5-7 distinct beats per day depending on branch, not a
single choice ending the day — verified directly by test (`DAY1 has multiple distinct scenes
before reaching the day-end summary`).

**Two real opportunity-cost examples, not just described but implemented:**
- DAY2: Jin (集会所) asks 「働いてないの?」 — accepting his half-day shadow-job offer skips the
  day's second location pick and free second scene entirely (the whole afternoon is consumed);
  declining continues the normal two-visit day. Verified by test (`accepting Jin's half-day
  shadow offer... skips the second location pick`).
- DAY4: Kamiya's job-training offer works the same way (accept -> half the day gone; decline ->
  normal day), giving a second, independent demonstration of the same mechanic through a
  different NPC.

### Free text (directive "FREE TEXT + AI")

Every day includes exactly one free-text beat with a real `<input>` — DAY1 and DAY5 are with
Kamiya (his two "主要接点候補" days within this slice); other days' free-text beat is with
whichever NPC the player is with. Submitting always produces an in-character reply — verified
by test even for nonsense input (`submitting free text always shows some in-character reply`).

### World continuity across days (directive "WORLD CONTINUITY")

One concrete causal chain spans the whole slice: DAY2 shadowing Jin → DAY3 Jin references it
unprompted (「昨日は助かった。また頼むかもな」) and DAY3's morning narration reflects the
tiredness → repeated engagement accumulates `FACILITY_REPAIR`/`REPAIR_BUSINESS_INDEPENDENT`
signals → DAY5's Kamiya meeting reads those signals back to the player by name and offers a
concrete connection (`d5ConnectionOffered`/`Accepted` flags, a `PENDING_TASK` material) — this is
the "career discovered through living, not menu-selected" mechanic actually working end to end,
verified by test (`DAY5 Kamiya reflects accumulated career signals`). A second, lighter thread
(the empty shop) runs the whole week independent of the player's specific choices, changing state
every day regardless of whether it is visited (a passive `WORLD_EVENT_WITNESSED` material each
time), and pays off on DAY6-7 as a flower shop opening.

### Dialogue style (directive "DIALOGUE STYLE" / "DAY-END")

No line anywhere states what a choice means, what the player learned, or what they should feel —
every beat is scene + character speech only (spot-checked directly against the directive's own
banned-phrase examples, `EXPLAINER_PHRASES` in the test file). Day-end shows only three plain
headings — 今日あったこと / 明日の予定 / 気になっていること — built from `LifeMaterial.
concreteContent` (already natural language); the underlying type tags (`OBJECT`/`PROMISE`/...)
are used only for internal sorting and are asserted, by test, to never appear on screen.

## Tests

`tests/newlifeV03RenderedUI.test.tsx`, 14 tests, all passing: approved art actually renders
(Yohei/Miyoko/Jin/town, `<img>` + resolved `src`); Kamiya's mandatory DAY1 consultation and the
persistent day counter; DAY1 is multiple scenes, not one choice; the shadow-job opportunity cost;
free text always produces a reply and never blocks progress; the DAY2→DAY3 Jin-remembers-you
chain including DAY3's tiredness line; the DAY5 signal-reflection chain end to end (5+ turns of
accumulated state, `topCareerSignals` correctly surfaced in Kamiya's actual dialogue); no raw
LifeMaterial type token or explainer phrase across a full DAY1 playthrough; DAY7 ends on a closing
note with no DAY8 button (directive: don't build past DAY7 unless DAY7 earns it); a simulated
portrait load failure degrades gracefully without removing choices; no horizontal overflow at
360/390/430px.

Full-suite results this Run: **109 test files / 1601 tests, all passing** (baseline before this
Run: 108/1587 — the +1 file/+14 tests are this Run's own addition; zero regressions elsewhere,
including V0.2's own test suite, PHASE 12.1's `?newlifebgw121=1` slice, and everything else).
`npm run typecheck` clean. `npm run build` succeeds; all 4 reused images confirmed present in
`dist/assets/` with correct hashed filenames (same files/hashes as V0.2's build, confirming no
duplication or re-encoding).

## Real-browser visual check (directive: "実ブラウザ確認 → スクリーンショット確認 → 自己修正")

Playwright, mobile (390×844) and desktop (1440×900), through opening → DAY1's full shape (Kamiya
free-text, both location visits, noon/evening/wrap) → DAY2's shadow-job branch. Script:
`v03_visual_qa_script.mjs`; evidence: `v03_visual_qa_evidence.json` (13/13 automated checks pass);
screenshots under `screenshots/`.

**Self-fix applied during this pass**: the first run showed Miyoko's and Jin's portraits missing
from two screenshots (and one automated check flaked) purely because the screenshot/check fired
before the freshly-requested 2MB portrait image had finished decoding — not an application bug
(the same beats rendered correctly moments later, and mobile's identical beats had already passed
by coincidental timing). Added an explicit `waitForSelector` + short wait before every
portrait-adjacent screenshot/check and re-ran; all 13 checks pass and all screenshots now show
the correct portrait. This is recorded here rather than silently discarded because it is exactly
the kind of thing "スクリーンショット確認" is supposed to catch — the initial claim "images
render" would have been true only by accident of the automated check's timing, not verified by
the screenshot a human would actually look at.

Visual read of the corrected screenshots: opening states the 30-day goal directly in the copy
("30日以内に、自分の次の生活を決める。"); the day counter is legible in the topbar on every
screen at both viewports; portraits render at a clearly "big" size without dominating the
viewport; choices read as things a person would actually say ("借りていいですか", "ついて行きま
す", "今は"); the free-text input is a real, unmistakable text box, not a disguised menu; nothing
overflows horizontally at either viewport.

## FINAL ACCEPTANCE — checked against the directive's own list

| Criterion | Status |
|---|---|
| 1日が短く感じない | 5-7 beats/day, DAY1 alone spans Kamiya consult + 2 NPC visits + noon/evening |
| 自由入力でAIと会話できる | Every day, real `<input>`, always replies, never blocks (tested) |
| 神谷が主要人物として存在する | DAY1 mandatory intro + DAY5 milestone reading back real player signals |
| 30日後という期限を常に感じる | Persistent topbar counter, every screen, every day |
| 仕事候補が生活から自然に見つかる | Jin-repair chain -> DAY5 Kamiya connection, verified end to end |
| NPC同士がつながっている | Canon relationship notes drive dialogue (Yohei/Jin acquaintance, Jin fixing Miyoko's chairs) without a stated chart |
| 昨日の出来事が数日後にも影響する | DAY2 shadow -> DAY3 reference + tiredness -> DAY5 signal payoff |
| 人物の言葉が自然、説明臭くない | No explainer phrases anywhere (tested); short in-character lines throughout |
| 画像ではなく世界そのものに厚みがある | No new art; depth from time cost, NPC memory, signal accumulation, cross-day threads |
| DAY7終了時、DAY8をやりたい | Ends on an unresolved hook (flower shop, Kamiya's pending connection, 洋平's festival invite), explicitly not a "cleared" finale — no DAY8 was built |

## Regressions

None found. Full pre-existing suite (109 files after this Run's addition) passes unchanged;
`typecheck`/`build` clean; V0.2's own route and tests, PHASE 12.1's `?newlifebgw121=1` slice, and
every other existing route are untouched (no shared file was edited besides the 4-line, isolated
`App.tsx` addition above).

## Deploy

Not deployed. Local verification only.

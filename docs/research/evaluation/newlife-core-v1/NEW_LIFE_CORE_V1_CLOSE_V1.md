# NEW LIFE CORE REDESIGN V1 — DAY1 Vertical Slice — CLOSE V1

Directive: `NEW_LIFE_CORE_REDESIGN_V1`. Cancels and replaces `NEW_LIFE_STORY_FIRST_REFOUNDATION_V1`
mid-Run. Core premise: not a "choose a career after 30 days" game — a person shaped by 30 days of
free, ordinary interaction with individually-written NPCs. This Run implements **DAY1 only**, per
explicit instruction not to mass-implement 30 days.

## BASELINE / FINAL COMMIT

- BASELINE COMMIT: `8d6e19b` (V0.3 refoundation, previous Run).
- One intermediate commit this Run: `cb6be80` (preserved the story-first documents as labeled,
  superseded reference material before starting this directive's actual work).
- FINAL COMMIT: see below (this Run's actual implementation commit, made after this report).

## What was discarded vs. kept from prior thinking

**Discarded (thinking, not files)**: the story-first documents' own premise — a single pre-authored
30-day throughline organized around 15 career destinations as the narrative spine. This directive
explicitly rejects that shape ("15職種ルートをゲームの骨格にしない"). V0.2/V0.3's fixed-scene-list
day structure ("朝イベント→3択→午後イベント→終了") is also explicitly superseded.

**Kept**: the story-first Story Bible's character depth (Kamiya's budget-pressure stake and
pattern-matching bias, Yohei's avoidance flaw, Miyoko's unreliable-narrator warmth, Jin's
terse-teaching) was reused directly as this Run's NPC `personality`/`currentConcerns` content. The
approved art (town/Yohei/Miyoko/Jin, from `src/assets/newlifev02/`) is reused verbatim, unchanged,
a third time now. V0.2 and V0.3 remain live, untouched routes (`?newlifev02=1`, `?newlifev03=1`) —
not deleted, simply no longer the active design direction.

## GAME CORE definition (as implemented)

`src/newlifecore/` — a free-roam, real-clock DAY1 slice. The player wakes at 08:45, is guided once
(by the trial-house folder) to the Challenge Center for Kamiya's opening meeting, and from that
point is free to visit any of Challenge Town's 6 locations in any order, any number of times, for
as much of the day as they choose, until they sleep (available from 20:00) or the clock reaches
23:30 (forced). No fixed scene list, no per-day 3-choice pipeline. Every action (travel, a
conversation turn, a special action) costs real in-world minutes, deducted from a single shared
clock — there is no separate "morning/afternoon/evening" scene boundary to cross.

## The 4 NPCs (identity/personality/values/likes/dislikes/job/schedule/concerns/relationships/
## knowledge/memory/mood/impression — directive Section 5, never shown to the player as a stat list)

Full definitions: `src/newlifecore/npcDefs.ts`.

- **神谷 (Kamiya)**, 36, male, Challenge Center, 7 years. Not a correct-answer guide: privately
  anxious about this year's weak placement numbers (the program's funding is loosely tied to
  outcomes), still carries an unresolved case from 2 years ago, and pattern-matches new residents
  early — including, implicitly, the player. No portrait exists (none was approved this phase);
  rendered as a name-only card, per explicit permission not to block on his art.
- **洋平 (Yohei)**, early 60s, male, general store, NPC_CANON-sourced role/knowledge (frozen
  registry, read-only). Kind but avoids the store-succession conversation reflexively.
- **美代子 (Miyoko)**, late 60s, female, 喫茶のどか. Warm; occasionally repeats overheard town
  talk slightly wrong (structurally guarded against actually fabricating specific facts — see
  Knowledge Boundary below).
- **相馬迅 (Jin)**, 57, male, freelance handyman, frozen behavioral rule unchanged. Hands-on,
  explains little, sometimes acts before asking.

Each has an authored `ScheduleBlock[]` (open hours, a midday BUSY window, or fully AWAY) so
availability genuinely varies by time of day — not just flavor text.

## NPC knowledge boundary

Enforced structurally, not just by prompt wording: `buildNpcAiContext` (`src/newlifecore/dialogue/
contextBuilder.ts`) only ever includes a `WorldFact` in an NPC's `worldFactsRelevant` if that fact's
`knownBy` array names that NPC. Unit-tested directly (`tests/newlifecoreEngine.test.ts`, "an NPC's
AI context only ever includes world facts explicitly marked as known by that NPC"). The
deterministic responder additionally has a dedicated `OTHER_NPC_MENTIONED` bucket for every NPC —
when the player names another character, the reply is a plain, non-elaborating acknowledgment
("そうなの?"), never invented awareness; also unit-tested directly. The live prompt
(`devtools/newlifeCoreVertexLiveAdapterCore.mjs`) repeats the same instruction explicitly
("本人が知らない事実...を、親切心や辻褄合わせのために発明してはいけません").

## NPC memory

`ConversationTurn { time, playerUtterance, npcReply }`, stored verbatim per NPC — never an
AI-authored summary (directive Section 14/15: "数値点数ではなく、出来事/発言記録を優先する"). The
context builder passes the last 6 turns with THAT specific NPC only (bounded, not the full
transcript; never another NPC's memory — tested directly). Because this Run implements only DAY1,
the directive's own multi-day example (Day2 remark recalled on Day8) could not be exercised as
written; what WAS verified is the same mechanism working within a single day (an early-morning
remark to Kamiya is present in his context when spoken to again later the same day) — the
per-NPC differential "memory style" fields (Miyoko mixes up whose story is whose, Jin forgets
small talk but not promises, Kamiya logs consultations but forgets chit-chat) are authored into
`npcDefs.ts` and fed to the live prompt, but their behavioral effect is mostly unverifiable within
a few in-game hours and should be re-examined once a multi-day Run exists.

## Free text → AI → NPC reply, real examples

**Kamiya, live model, DAY1 opening question** (after 2 rounds of debugging, see below):
> Player: 「正直、まだ何がしたいか自分でもよく分かっていません」
> 神谷: 「ええ、まだはっきりしないというのは、よくあることですよ。焦る必要はありませんから、
> まずは、どんなことでもお話しください。」

**Miyoko, live model**:
> Player: 「この町に来たばかりで、まだよく分かってないんです」
> 美代子: 「あら、そうでしたか。お引っ越し、まだだったんですね。大変ですものね、ゆっくりでいい
> んですよ。」

**A case where the AI was off-target, and what fixed it**: the first live test of this exact
Kamiya question returned a generic "welcome, we're open now, 9 o'clock" reply that did not engage
the player's actual words at all, and separately used a feminine sentence-final particle ("あら")
for a stated-male 36-year-old character. Root causes found by inspecting the raw response: (1) no
NPC definition stated gender explicitly, so the model guessed from limited cues; (2) the prompt did
not forbid deflecting to unrelated topics (schedule/opening-hours framing) when the player says
something substantive. Fixed by adding explicit gender to all 4 `identity` strings and adding an
explicit "respond to what was actually said; do not substitute a generic greeting" instruction plus
a gender-consistency instruction to the live prompt. Re-tested and confirmed fixed (see the example
above, produced after the fix).

**A second, more severe issue found and fixed**: an even earlier test (before any of the above)
returned a full fantasy-RPG hallucination for Yohei — "冒険者の宿" ("adventurer's inn"), completely
ignoring his actual identity as a small-town general store owner. Cause: the prompt named the game
but never explicitly ruled out a fantasy setting, and `temperature: 0.9` (copied from the frozen
bgw121 adapter's value) let the model drift. Fixed with an explicit, forceful setting-grounding
paragraph ("これは現代日本の...ファンタジー...は一切存在しません") and lowering temperature to 0.5.
A third, purely mechanical issue (the live call silently returning empty text due to
`gemini-2.5-flash`'s documented "thinking tokens count against maxOutputTokens" bug, already known
from bgw121's own history) was fixed by raising `maxOutputTokens` from 2048 to 4096 — this richer
prompt needed more headroom than bgw121's did.

## AI failure fallback (directive Section 30)

`liveNpcAdapter` degrades to the same richer `deterministicNpcReply` (not the flat single-line
envelope fallback) on any network failure or non-OK HTTP response, and to the plain per-NPC
envelope fallback only for a structurally-invalid-but-200 response. Verified directly: a rejected
`fetch` and a mocked 500 response both still produce a non-empty, in-character line with no raw
error text (`tests/newlifecoreEngine.test.ts`).

## DAY1 time structure

08:45 wake → guided walk to the Challenge Center (15 min travel, arriving exactly at Kamiya's 09:00
opening) → free roam across all 6 locations (仮住まい/チャレンジセンター/洋平商店/喫茶のどか/集会
所/商店街) → sleep available from 20:00, forced at 23:30. Travel costs 15 minutes; one free-text
exchange costs 10 minutes (a soft, economic bound against infinite chat rather than a hard turn
cap — directive Section 7's "無制限AIチャットにはしない"); special actions cost 5-45 minutes
depending on weight (viewing the job board vs. actually helping fix a shelf).

## 3 real-browser playthroughs + 1 live-toggle spot check (directive Section 31)

Script: `critical_review_script.mjs`; full transcript: `critical_review_transcript.json`;
screenshots: `screenshots/`. All 3 paths and the live spot check ran against the real dev server
(not a mock), deterministic adapter by default (the actual shipped/default behavior; live is an
opt-in DEV-only toggle) plus one explicit live-toggle run to confirm the real model end to end
through the actual UI (not just the direct API tests above).

- **Path A** (神谷→洋平→相馬): distinct voices confirmed (Kamiya's memo-taking "なるほど" register
  vs. Yohei's terse "そうか" vs. Jin's silent nod) — each unmistakable without the name label.
- **Path B** (神谷→美代子→商店街): Miyoko's warmth register distinct from both men; the shopping
  street's empty-storefront notice reads as pure texture, no forced interaction.
- **Path C** (long free chat with Kamiya, 4 consecutive turns, → trial house → community hall):
  multi-turn conversation held up mechanically (no crash, no state corruption); found the
  deterministic OTHER-bucket had too little variety (identical line repeated across turns) —
  **fixed** by expanding the sparsest buckets for all 4 NPCs from 1 to 3 variants each, and
  broadening one over-narrow regex (Miyoko's "how long has this shop been open" pattern).
- **Live-toggle spot check**: confirmed the checkbox → real fetch → dev-only Vertex call →
  rendered reply pipeline works end to end through the actual rendered UI, not only via the direct
  curl tests used for prompt debugging above.
- **Day-end**: separately verified (`check_day_end.mjs`) — reaching 20:00+ and choosing to sleep
  shows a plain-language "today" list combining a player-caused fact ("主人公が洋平の店の棚を直す
  のを手伝った") and an independent world-event fact that happened either way ("洋平が棚の修理を
  相馬に頼んだ"), then a soft, non-scored close ("DAY1が終わった。続きは、また今度。") — no forced
  DAY2 button, no judgment screen.

## World moving without the player (directive Section 5/6/18)

Concrete example, unit-tested and confirmed live: around 11:15, Yohei calls Jin over to fix a
stockroom shelf — `resolveWorldEvents` fires this purely from elapsed clock time, regardless of
whether the player has ever visited either NPC (`tests/newlifecoreEngine.test.ts`, "fires purely
from elapsed time, never requiring the player to be present"). If the player later visits Yohei's
store during that window, both Yohei and Jin are present together and a "help with the shelf"
action becomes available — the same underlying event, witnessed or not.

## Tests

`tests/newlifecoreEngine.test.ts` (16 tests, pure logic) + `tests/newlifecoreRenderedUI.test.tsx`
(8 tests, RTL) + one extension to the pre-existing `tests/safety.test.ts` (a legitimate third
documented network-call file, `src/newlifecore/dialogue/liveAdapterClient.ts`, added to the
existing safety whitelist with the same same-origin-only assertions the other two documented
files already have). Covers every item in directive Section 33's required list: knowledge
boundary, memory persistence, AI-cannot-mutate-state, time-advances-by-action, schedule-based
availability, free text works, AI failure fallback, unvisited world event progresses, day
doesn't end after one action, approved images visible, no raw state displayed.

**A genuinely valuable pre-existing safety net caught a real slip**: `tests/safety.test.ts`
(`src/` never imports `devtools/`) initially failed because a code comment in this Run's new
`liveAdapterClient.ts` literally spelled out the server-only file's path in prose — fixed by
rewording the comment to match the original bgw121 file's own discipline (describe the mechanism,
never name the path). The same test's fetch-whitelist also correctly flagged this Run's new
(legitimate, same-origin-only) third network call until it was explicitly added to the whitelist.

Full-suite result: **110 test files / 1625 of 1626 tests passing** (baseline before this Run:
109/1601 — the +1 file/+25 tests are this Run's addition, +1 test from the safety-test extension).
The one failure (`case1c.test.tsx`, "2 testers played back to back... 5000ms timeout") is
pre-existing, unrelated (that file is part of the large in-progress diff already present at Run
start, never touched this Run) and confirmed flaky, not a regression — it passes cleanly in
isolation and only times out under full-suite parallel load. `npm run typecheck` clean.
`npm run build` succeeds; all 4 reused images confirmed in `dist/assets/` with correct hashed
names; the dev-only Vertex plugin code is confirmed absent from the production bundle (both by
`apply: "serve"` and by the safety test's own static-source scan passing).

## CONTENT QUALITY self-critique (directive Section 32)

| Question | Answer |
|---|---|
| 神谷と洋平の台詞を名前なしでも区別できる | Yes — confirmed in both live and deterministic transcripts |
| NPCがAIアシスタントのように話さない | Yes for the live path (primary experience); the deterministic fallback is plainer by design, never the default-preferred path |
| PLAYERが予想外の自由記述をしても世界が壊れない | Yes — a 4-turn digressive chat (Path C) held up mechanically; AI failure explicitly tested |
| AIが知らないことを勝手に知ったふりしない | Yes — structural (context filtering) + prompt instruction + deterministic non-elaboration bucket, all independently verified |
| 1日の途中で「もう終わり？」と感じない | Reasoned yes, not stopwatch-measured — 6 locations, 4 differently-scheduled NPCs, one dynamic NPC-NPC event, bounded-but-real multi-turn free text; no single human 15-25 minute playthrough was literally timed this Run |
| 人物ともう少し話してみたいと思える | Reasoned yes for the live path, based on the quality of the example exchanges above |
| PLAYERが行かなかった場所でも世界が動く | Yes — the Yohei/Jin shelf event, unit-tested and live-confirmed |
| 職業ゲームへ誘導されている感じがない | Yes — no career list, no score, no route framing anywhere; the job board is flavor-only |
| DAY1終了時に「DAY2は何が起きるだろう」と思える | Reasoned yes given the open-ended, non-scored close — DAY2 itself does not exist yet to verify against |

## Remaining weaknesses (honest)

- The deterministic (fallback) adapter's reply variety, while improved, is still shallow (3
  variants per generic bucket) and can repeat within one long conversation — acceptable for a
  fallback path, not acceptable if it were ever mistaken for the primary experience.
- NPC memory-style differentiation (Miyoko's misremembering, Jin's selective forgetting) is
  authored but effectively unverifiable within a single day — needs a multi-day Run to actually
  exercise.
- Special, stateful actions are asymmetric across locations: Yohei's shelf-help is the only deep,
  world-changing action; Miyoko's café and the shopping street currently offer only light,
  decorative actions. Reasonable for a first vertical slice, but a real gap if left as-is.
- Kamiya has no portrait; his scenes are visually flatter than the other 3 NPCs'. Explicitly
  permitted by the directive, not treated as blocking, but still a real, felt asymmetry.
- No timed, literal human playthrough was conducted to confirm the 15-25 minute density target;
  the claim above is a considered judgment from content breadth, not a measurement.

## DAY1 EXPERIENCE

**ACCEPT.**

The core mechanics work correctly and are verified, not just described: time-based free roam,
schedule-driven NPC availability, a world event that fires independent of the player, bounded
multi-turn free text, a knowledge boundary enforced both structurally and by instruction, an
AI/state separation that is architecturally incapable of letting conversation text mutate
canonical state, and a real, working live-AI path (not just scaffolding — reached, debugged, and
fixed through 3 concrete, real bugs during this Run's own critical review, then re-verified). The
honest weaknesses above are real but scoped and named, not hidden, and none of them contradict the
directive's own DAY1-only, don't-rush-to-30-days instruction.

## Deploy

Not deployed. Local verification only.

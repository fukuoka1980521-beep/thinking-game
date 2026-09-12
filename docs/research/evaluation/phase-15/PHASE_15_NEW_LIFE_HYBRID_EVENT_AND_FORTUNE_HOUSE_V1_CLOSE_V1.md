# PHASE_15_NEW_LIFE_HYBRID_EVENT_AND_FORTUNE_HOUSE_V1 -- CLOSE REPORT

BASELINE: `7aeafed` (PHASE 14 CLOSE, `GAMEPLAY_CORE_V1 = CONDITIONAL`, `PURPOSE_CLARITY = CONDITIONAL`, `FREE_CONVERSATION_PRESERVED = YES`, `READY_FOR_HUMAN_VALIDATION_3 = YES`).

FINAL COMMIT: `be9b788` (feat: add hybrid event encounters and Fortune House for New Life (PHASE_15))

INPUT: the phase directive's own mandate -- integrate PHASE 14's Today's Signs, a board-game/jinsei-game-style "something happens when you move" encounter layer (explicitly NOT a sugoroku/roulette system), 1-5 day Event Threads, free conversation, world consequence, and a Fortune House (占いの館) hosting the Thinking Circuit/Reality Bridge -- under a strict development order: PHASE A (fix the known activity/local-problem consequence-clock bug) must PASS before PHASE C (Hybrid Event Encounter V1) begins.

## 1. PHASE A -- ACTIVITY/LOCAL-PROBLEM CONSEQUENCE CLOCK fix

**Root cause**: `dueActivityResolutions`/`dueLocalProblemResolutions` measured `resolveAfterDays` from the most RECENT player action (`activityLastDone`/`localProblemLastPlayerAction`), which kept updating on every session -- so a player who kept helping past the completion threshold indefinitely deferred the world-change, since the "quiet period" clock never started.

**Fix**: a new `activityResolutionAnchor`/`localProblemResolutionAnchor` field, set EXACTLY ONCE the day the resolution-triggering condition is first satisfied (`runActivity`/`respondToLocalProblemHelp`/`respondToLocalProblemConnect`, `engine.ts`), never overwritten by later sessions. Resolution now measures `resolveAfterDays` from this anchor.

**Evidence**: 11 new unit tests (`newlifecoreActivities.test.ts`, `newlifecoreLocalProblems.test.ts`) covering threshold→left-alone→resolves, threshold→additional-sessions→unchanged resolution day, threshold→daily-sessions→never deferred, before-threshold→no-anchor, resolved→no-duplicate-fact, and anchor-persists-across-many-days. A real-browser trace (`.scratch_phase15/clock_fix_trace.mjs`) ran `repair_with_jin` sessions on days 2/4/6/8/10/12 (past the day-6 threshold) and confirmed the world-change fired exactly on day 9, unaffected by the day-8/10/12 sessions -- the exact scenario that was broken before this fix.

**`ACTIVITY_CONSEQUENCE_CLOCK = PASS`**

## 2. PHASE B -- Fortune House migration (Barbershop/Daisuke retirement)

`LocationId`'s `BARBERSHOP` renamed to `FORTUNE_HOUSE` (a true 1-for-1 replacement -- location count stays 7). Daisuke's full `NpcDefinition` (identity/personality/relationships/hiddenBackground/speech style, everything) is kept, unmodified, in `NPC_DEFS` and the `NpcId` union -- only his `schedule` is emptied to `[]`, making him permanently unreachable without destroying any of his characterization data. A new NPC, Shizuko (静子, 63, ran a ryokan with her late husband for 30+ years, started the Fortune House almost by accident after his death 4 years ago), was added with the same authoring depth as every other NPC, including a `deterministicAdapter.ts` reply-bucket set and a live-prompt Thinking Resident block.

**DISCOVER finding, recorded honestly**: no persistence layer exists anywhere in `src/newlifecore/` (`grep -rn "localStorage\|sessionStorage\|indexedDB"` returns nothing), so the directive's "既存save互換が必要ならmigration/alias設計" condition never applied -- no migration/alias system was built, since there is no saved state to migrate.

The Reality Bridge / Thinking Circuit loop (`content/realityBridge.ts`, `RealityBridgeCheckIn.tsx`, the live-adapter's `buildThinkingResidentPrompt`) was retargeted from Daisuke to Shizuko intact -- same mechanism, same research-privacy/safety semantics, only the surrounding flavor text (鋏/櫛/理容店 → カード/お茶/占いの館) rewritten. A new explicit rule block was added to the live adapter forbidding real-fortune-telling behavior, citing the directive's own BAD examples ("あなたは変化を恐れています", "カードが示す未来では…") and its GOOD example (a distinguishing-question pattern) verbatim.

Two incidental PHASE 13 bugs were found and fixed during this audit (not scope creep -- both were silent gaps in code this migration was already touching): Kiyoshi was missing from `retrospective.ts`'s `ALL_NPCS` and from `day1.ts`'s end-of-day `talkedToday` lines; Kiyoshi was also missing from `envelope.ts`'s `FALLBACK_BY_NPC` (silently falling through to the generic "……。" fallback).

**Migration fallout**: 7 tests broke from the BARBERSHOP→FORTUNE_HOUSE/Daisuke→Shizuko rename (NPC-count assertions, Thinking Resident prompt content, local-problem-count assertion after removing the Daisuke-specific `daisuke_renovation_indecision` local problem, and 6 real-browser-facing RTL tests using stale testids/labels). All fixed; final regression is green (Section 8).

## 3. PHASE C -- HYBRID EVENT ENCOUNTER V1

**Moment Events** (`content/momentEventDefs.ts` + `momentEventEngine.ts`): one-shot, location-anchored encounters triggered on arrival (`engine.ts`'s `moveTo` calls `resolveMomentEventArrival`), never a clock tick. Eligibility is gated by `minDay`/`cooldownDays` AND an independent `occurrenceChance` (the same deterministic `pseudoChance(id, day)` hash `content/eventEngine.ts`'s recurring events already use -- never `Math.random`), so most otherwise-eligible days still show nothing: this is what produces "something MIGHT happen," never a guaranteed per-move trigger, and never a dice/board mechanic (Section 1's explicit ban). 4 defs ship: a dropped glove (SHOPPING_STREET), a stranger asking directions (COMMUNITY_HALL), a crowded café (CAFE_NODOKA), a new bulletin notice (COMMUNITY_HALL) -- each with exactly 2 response choices, rendered as ordinary scene ambient text + ordinary `specialActions` buttons (verified visually, Section 6), never a popup/card/modal.

**Event Threads** (`content/eventThreadDefs.ts` + `eventThreadEngine.ts`): 1-5 day mini-stories with the directive's own state machine (`DISCOVERED`/`ACTIVE`/`WAITING`/`PROGRESSED`/`RESOLVED`/`ABANDONED`/`RESOLVED_WITHOUT_PLAYER`). 2 defs ship, both explicitly non-work (`isWorkRelated: false`, exceeding the directive's "at least 1" minimum): `kiyoshi_old_colleague` (an old factory colleague calls after years of silence; YOHEI_STORE, during Kiyoshi's narrow 10:00-11:00 window) and `miyoko_old_photo` (Miyoko finds an old photo of the café; CAFE_NODOKA). Progress requires real elapsed days between stages (`minDaysSincePrev`, never same-day-rushable) via an ordinary "ask about it again"-style scene action -- no help/connect grind, no threshold, purely conversation-shaped. A thread the player stops engaging with resolves on its own (`tickEventThreadsForNewDay`, called from `startNewDay`, same timing as the PHASE A tick) using its own `resolvedWithoutPlayerText`, never dressed up as a player accomplishment. Continuing to progress a thread resets its own `autoProgressAfterDays` clock on each real advance -- this is NOT the Section 2/PHASE A bug, since each stage is genuine forward progress toward resolution, not a repeated non-qualifying action; a dedicated unit test (`newlifecoreHybridEvents.test.ts`) confirms a thread kept alive by real engagement never auto-resolves without the player.

No quest/mission/objective/reward vocabulary anywhere in either content table (guard-tested: `newlifecoreHybridEvents.test.ts` checks both tables' full JSON against a banned-word list). No event log or thread list is ever rendered -- both surface exclusively as ordinary ambient text + `specialActions`, the same channel local problems and activities already use.

**14 new unit tests**, all passing: Moment Event occurrence-over-many-days, no-op-at-ineligible-location, active-for-the-rest-of-the-day, disappears-next-day-if-ignored, real `moveTo` integration; Event Thread definitions/banned-vocabulary, minDay/availability gating, discover-sets-state, next-stage-not-same-day, full-progression-to-RESOLVED, resolves-without-player-after-`autoProgressAfterDays`, `dueEventThreadAutoResolutions` purity, and the continued-engagement-resets-the-clock case above.

## 4. PHASE D -- Day1-5 real-browser vertical slice

Implemented for Day1-5 only (not all 30 days), per the directive's explicit scope limit. `.scratch_phase15/day1_5_traces.mjs` (Playwright, scratch harness, never committed) ran 5 traces against a real dev server:

- **Trace A (follow signs)**: Day1 alone produced 2 Moment Events (bulletin notice at COMMUNITY_HALL, dropped glove at SHOPPING_STREET, both with real choices and real result text). Day2 fired a 3rd Moment Event (crowded café) and discovered the `miyoko_old_photo` thread; Day3 progressed it and used the Fortune House (real opening line + real reply captured); Day4 resolved the thread with its own final line. Day5 still surfaced fresh local-problem discoveries (`hina_needs_promotion_help`, `shopping_street_vacant_unit`) and Today's Signs pointing at still-open content -- a genuine, evidenced reason to want Day 6 (Section 7, Q10 below). `kiyoshi_old_colleague` was never reached in this trace -- his 10:00-11:00 window didn't line up with the trace's travel timing, itself a small honest data point about how narrow that window is.
- **Trace B (ignore signs entirely)**: only ever visited CHALLENGE_CENTER, never touched a single Moment Event or Thread action. The world still progressed fully without the player: the shelf and bench both got fixed off-screen, Fumiko and Miyoko had tea together, Yohei made a delivery to the Fortune House, rain started and stopped -- direct evidence the town does not wait for or depend on player engagement (Section 19).
- **Trace C (actively engage threads)**: deliberately revisited YOHEI_STORE/CAFE_NODOKA daily; discovered and fully progressed `miyoko_old_photo` to `RESOLVED` by day 4 through genuine, real UI actions.
- **Trace D (heavily ignore events)**: visited every location every day but never clicked a `momentchoice_`/`discover_thread_`/`progress_thread_` action. Confirmed Moment Events do NOT nag: the crowded-café ambient line appeared once (day 2) and did not recur on days 3-5 even though the def remained cooldown-eligible territory-wise, while the (never-discovered) `miyoko_old_photo` observation line persisted across days 3-5 -- see Section 7's honest note on this exact texture.
- **Trace E (use the Fortune House)**: see Section 5 -- this trace was corrected mid-Run after Owner feedback; both the original and corrected versions are recorded below.

## 5. Fortune House Trace E -- Owner-flagged methodology correction

The first version of Trace E reached FORTUNE_HOUSE each day by touring YOHEI_STORE → CAFE_NODOKA → COMMUNITY_HALL → SHOPPING_STREET first (to burn travel time until Shizuko's 10:00 opening). The Owner correctly flagged that this contaminates the "clean Fortune House" evidence: all 4 of those locations carry real Moment Event / Event Thread / local-problem content this phase, so anything discovered en route is not attributable to Fortune House at all. That run (`.scratch_phase15/day1_5_traces_evidence.json`, Trace E) is kept as **DIAGNOSTIC ONLY**, not formal acceptance evidence.

**DISCOVER**: `content/day1.ts`'s TRIAL_HOUSE scene unconditionally offers `rest_a_while` ("少し休む", `doShortAction(state, 15)` -- no `moveTo` call, no location change), a genuine, always-available, player-facing time-passage action that cannot itself trigger a Moment Event or Event Thread (both are gated exclusively on `moveTo`'s arrival hook). Neither TRIAL_HOUSE nor the mandatory once-per-day CHALLENGE_CENTER stop carry any Moment Event/Thread content.

**Corrected Trace E** (`.scratch_phase15/trace_e_clean.mjs`) reaches Shizuko using ONLY: wake → go to CHALLENGE_CENTER (mandatory first move) → move to TRIAL_HOUSE → `rest_a_while` × 2-3 → move directly to FORTUNE_HOUSE. Every day's `cleanPathVisited` was exactly `["CHALLENGE_CENTER", "TRIAL_HOUSE", "FORTUNE_HOUSE"]` -- zero contact with any content-bearing location. Real evidence, Day1-5, all 6 of the Owner's acceptance criteria met:

| Day | Card opening line (real) | Free-text sent | Real reply | Close OK | Movelist after close | Next-day revisit |
|---|---|---|---|---|---|---|
| 1 | 「道」…迷っていることは何かある？ | 仕事のことで少し悩んでいます | 「焦らなくていいと思うわよ」 | YES | YES | DAY2 |
| 2 | 「鏡」…自分がどう感じてるか言葉にできてる？ | 友達とのことで、ちょっと気になることがあって | 「そう」とだけ | YES | YES | DAY3 |
| 3 | 「道」…（同上） | 特に悩みというほどのことはない | 「ふふ」と笑った | YES | YES | DAY4 |
| 4 | 「鏡」（同上） | 前に話したこと、どうなったか気になって | お茶を一口、静かに頷いた | YES | YES | DAY5 |
| 5 | 「道」（同上） | 今日はいい天気ですね | 「そう」とだけ | YES | YES | DAY6 |

Manual review of the 5 replies: they visibly differ by input category, and critically, day 5's plain small-talk ("今日はいい天気ですね") gets the SAME short, unforced "そう" reply as day 2's mild concern -- direct evidence Shizuko does not default to "consultation mode" for non-concern input (Q6 below). No safety-route or research-consent anomalies in any of the 5 exchanges.

**CLOSED-state UX finding (Owner-requested, not hidden)**: a direct check (arriving at FORTUNE_HOUSE at 09:30, before the 10:00 opening) shows ambient text "占いの館は閉まっていた。" with **zero** special actions -- no wait option, no stated opening time. The movelist itself remains reachable (not a hard dead-end), but a real first-time player arriving early has no in-scene way to learn when to come back or to wait there. **This is not new to this phase**: YOHEI_STORE and CAFE_NODOKA's own CLOSED states use the identical "ambient line + empty actions" shape, unchanged since PHASE 12/13. Not fixed in this Run -- a proper fix would touch a shared pattern across 3+ already-accepted locations, beyond this phase's mandate (same reasoning PHASE 14's own CLOSE report applied to the activity/local-problem over-engagement edge case) -- but recorded here explicitly as a real, un-resolved weakness a real Human Validation session could hit (Section 7).

## 6. Visual gate

All 4 required viewports (360x800/390x844/430x932/1440x900), screenshots viewed directly (`.scratch_phase15/visual_*.png`):
- **Today's Signs** (day-2 wake scene): plain flowing paragraphs mixed into ordinary wake narration, no icon/badge/checklist -- unchanged from PHASE 14, still holds with PHASE 15's content added alongside it.
- **Moment Event** (dropped glove at SHOPPING_STREET): its observation line renders as an extra ambient sentence in the same paragraph as the location's own existing ambient text; its 2 choices render as ordinary `.nlc-choice` buttons, visually identical to "貼り紙をよく見る" beside them. No popup, no card, no badge.
- **Fortune House card picker**: 3 plain-labeled cards (道/鏡/灯り, each with a short parenthetical) plus a "やっぱりやめる" cancel button, framed by an ordinary NPC line. No mood slider, no numeric scale, no clinical iconography.
- **Fortune House conversation**: identical layout/markup to every other NPC's talk panel (free-text input, send button, end-conversation button) -- the opening line renders as an ordinary NPC dialogue line, never a distinct "worries form."

All 4 scenes read correctly and without horizontal scrolling at every viewport. One pre-existing, unrelated-to-this-phase texture noted: at 1440x900 the content column stays narrow with empty space below it rather than expanding to fill the viewport -- a layout characteristic from earlier phases, not something PHASE 15 introduced or worsened.

## 7. Self-critique

**Q1 -- sugoroku/roulette に見えないか。** NO. No dice, no fixed board, no forced route anywhere; Moment Event occurrence is gated by real state (location + day + flags) plus a deterministic hash, never true randomness or a board mechanic.

**Q2 -- 移動するたびに「何か起きるかも」という感覚があるか。** PARTIAL, evidenced honestly. Trace A's Day1 alone produced 2 Moment Events, and Day2 a 3rd -- the anticipation is real on average -- but most individual visits produce nothing (by design: `occurrenceChance` 0.45-0.55 per def), so the feeling is a background texture across a few days, not a guarantee on every single move. This is the intended shape (Section 9's own "something MIGHT happen," not "something WILL happen"), stated as a deliberate trade-off, not a gap.

**Q3 -- ランダムポップアップに見えないか。** NO -- visual gate (Section 6) confirms Moment Events render inline as ordinary ambient text + ordinary choice buttons, structurally and visually indistinguishable from a local problem's own observation-line/discover-action pattern.

**Q4 -- スレッドを追いたくなるか。** YES. Trace C shows a real 3-stage arc (discover day 2 → progress day 3 → resolve day 4) driven purely by revisiting the same NPC; Trace D shows the SAME thread's ambient discovery line persisting, unresolved, across days 3-5 when ignored -- a lingering, noticeable "I saw this and haven't followed up" pull, not a one-time flash.

**Q5 -- 無視できるか（強制されないか）。** YES. Trace B (zero event/thread engagement, CHALLENGE_CENTER-only) shows the full world -- shelf, bench, Fumiko/Miyoko's tea, a delivery to the Fortune House, rain -- progressing normally with no penalty, no missed-content framing, no nagging.

**Q6 -- 占いの館が相談アプリに見えないか、毎回相談モードにならないか。** YES (does not look like one; does not default to it). Card picker and conversation panel are visually and structurally identical to ordinary NPC interaction (Section 6); the corrected Trace E's 5 free-text cases (Section 5) show visibly different replies by input category, with plain small talk getting a short, unforced reply rather than a therapeutic one.

**Q7 -- 偽の予言をしていないか。** YES (none found). Every fortune-card opening line is a distinguishing QUESTION, never a prediction (`content/fortuneCards.ts`); the live adapter carries an explicit forbidden-pattern rule citing the directive's own BAD examples verbatim, added this phase.

**Q8 -- 自由会話の価値は保たれているか。** YES. Nothing about the existing conversation mechanism (input/submit/close/memory) was touched; Fortune House reuses it exactly, gaining new grounded content (the card's opening line, Shizuko's own characterization) without narrowing anything already praised.

**Q9 -- 仕事寄りが改善したか。** PARTIAL. Both new Event Threads are explicitly non-work/social (`isWorkRelated: false`), directly countering PHASE 14's self-flagged work-skew weakness -- but the 4 Moment Events are largely neutral/ambient rather than pointedly leisure-flavored, so this is a real but partial improvement, not a resolution.

**Q10 -- Day6を開きたくなるか。** YES, evidenced. Trace A's Day5 still surfaces brand-new local-problem discoveries and Today's Signs pointing at unresolved content; `kiyoshi_old_colleague` was never even reached in that trace (his narrow window didn't align), leaving a concrete, noticed-but-unfinished thread as a genuine reason to continue -- not the generic "more content probably exists somewhere" pattern earlier phases flagged as insufficient.

## 8. Regression

`npx tsc --noEmit`: clean throughout, rechecked repeatedly and after every fix. Combined newlifecore-scoped suite: fast suite (10 files, `tests/newlifecore*.test.*` excluding the RTL file) **276/276 passed**; RTL suite (`newlifecoreRenderedUI.test.tsx`, 42 real-DOM tests including three ~80s full-30-day-playthrough tests) **42/42 passed**. Combined: **318/318**, 0 failed. PHASE 14's own baseline was 293/293; this phase's delta is +11 (PHASE A clock-fix tests) +14 (new `newlifecoreHybridEvents.test.ts`) = +25, exactly accounting for 293 → 318. 7 pre-existing tests broken by the BARBERSHOP/Daisuke migration (Section 2) were fixed in place, not worked around.

## 9. Remaining weaknesses (honest, not laundered)

- **Undiscovered Event Threads never auto-fade**: `dueEventThreadAutoResolutions` only ever acts on a thread already in `state.eventThreads` (i.e., already discovered) -- a thread the player never notices at all can sit as a truthful but static ambient observation line indefinitely (confirmed directly in Trace D, days 3-5). This mirrors existing precedent (undiscovered local problems behave identically), so it is not a new inconsistency, but it is a real gap relative to the directive's "player is not the hero" principle applied specifically to Threads: an entirely-ignored thread has no world-level resolution the way local problems and activities do. Not fixed this Run (small, targeted, but touches the shared discovery-eligibility pattern); flagged for a future phase.
- **CLOSED-location dead-end texture** (Section 5): Fortune House, Yohei's shop, and Miyoko's café all give zero actionable content when closed -- no wait option, no stated hours. Pre-existing across 3 locations, not new to this phase, not fixed here (shared-pattern fix beyond this phase's mandate) -- explicitly flagged, not hidden.
- **Moment Events skew ambient/neutral, not leisure-flavored** (Q9): a real but partial improvement to PHASE 14's work-skew finding.
- **`kiyoshi_old_colleague`'s discovery window is narrow and easy to miss** (10:00-11:00 only, at YOHEI_STORE) -- Trace A never reached it. This is consistent with Kiyoshi's own established "occasional, narrow presence" character design (PHASE 13), not a bug, but worth naming as a real reachability texture a human tester might also experience.
- Full first-time-human clarity and genuine desire-to-continue (Q2/Q10) remain evidenced-but-not-human-confirmed, same caveat PHASE 14's own CLOSE report carried forward -- this is exactly what Human Validation 4 exists to determine.

## 10. Final judgments

**`ACTIVITY_CONSEQUENCE_CLOCK = PASS`** -- root-caused, fixed with a shared anchor-once mechanism, unit-tested 11 ways, and proven via a dedicated real-browser trace showing the exact day-9 resolution the pre-fix code could not produce.

**`FORTUNE_HOUSE_V1 = CONDITIONAL`** -- migration complete with zero data destruction, Reality Bridge/Thinking Circuit intact, no-fake-prophecy rule enforced, visual gate passed, and (after the Owner's methodology correction) clean, uncontaminated real-browser evidence for all 6 required acceptance criteria. Condition: the CLOSED-state dead-end texture (Section 5/9) is real and unresolved, shared with 2 other pre-existing locations.

**`HYBRID_EVENT_ENCOUNTER_V1 = CONDITIONAL`** -- Moment Events and Event Threads are both real, working, unit- and real-browser-tested, demonstrably ignorable, demonstrably not sugoroku-shaped, and demonstrably capable of resolving with or without the player. Condition: the undiscovered-thread-never-fades gap (Section 9) and the ambient-not-leisure skew (Q9) are real, stated V1 boundaries.

**`DAY5_GAME_PULL = YES`** -- Trace A's Day5 evidence (fresh discoveries, unresolved signs, a never-reached thread) gives a concrete, non-generic reason to want Day 6.

**`READY_FOR_HUMAN_VALIDATION_4 = YES`** -- all directive evidence requirements have a real, tested, traced response; no known blocking bug; regression holds at 318/318; the one Owner-flagged methodology issue (contaminated Trace E) was caught, corrected, and re-evidenced cleanly within this same Run. Watch specifically for: whether "something might happen" reads as anticipation rather than randomness (Q2), whether a tester ever arrives at a CLOSED location and feels stuck (Section 5/9), whether the Fortune House is ever mistaken for a therapy feature, and whether an ignored Event Thread's lingering ambient line is noticed and acted on or simply fades from attention.

## Completion

**`NEW_LIFE_HYBRID_FORTUNE_V1_READY`**

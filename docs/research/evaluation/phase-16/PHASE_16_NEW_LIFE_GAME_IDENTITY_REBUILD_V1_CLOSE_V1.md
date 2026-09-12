# PHASE_16_NEW_LIFE_GAME_IDENTITY_REBUILD_V1 -- CLOSE REPORT

BASELINE: `e01afcb` (PHASE 15_1 CLOSE, `CLOSED_STATE_UX = PASS`, `HUMAN_VALIDATION_4_READY = YES`).

FINAL COMMIT: `f763e8a` (feat: rebuild New Life game identity -- events, scene context, Fortune House (PHASE_16))

INPUT: fresh Human Validation 4 evidence, given directly in the phase directive: (A) café-purchased food/drink was showing up as permanent "荷物" (luggage) at the trial house -- a world-state coherence defect; (B) a real Yohei/Kiyoshi scene read as causally opaque (who did what, what "助かった" was answering, what the current event even was); (C) the tester's own verdict, "少ない訪問先で、半端な自由会話ができるだけのゲーム" (a game of visiting a few places and having half-finished free conversation); (D) Fortune House reads as weak/uncertain; (E) "what game is this" still isn't intuitively clear. Directive's own reordering: **FIRST make it legibly a game, THEN make it feel natural** -- the reverse of this codebase's prior priority.

## 1. Scope discipline

No new Event/Thread/NPC/location content, no combat/craft/XP/levels/achievements/roulette, no map expansion (Section 35's explicit ban list). Every change below either fixes a real defect, clarifies existing content's presentation, or adds a small amount of genuinely load-bearing structural context -- never a new gameplay system.

## 2. STATE COHERENCE -- the café/luggage bug (Sections 11, 30)

**Root cause**: `engine.ts`'s `purchaseItems` added every purchased item to `state.inventory` unconditionally, with no distinction between a café order (eaten on the spot) and a grocery purchase (carried home) -- so `トースト`/`コーヒー` etc. persisted forever and surfaced under "荷物を確認する" exactly as the Owner observed.

**Fix**: `content/shop.ts`'s `ShopItem` gained a `consumedOnSite` flag, set `true` on all 4 current `CAFE_MENU` items (there is no takeout choice yet -- Section 11's own "必要以上に複雑にしない" scope limit, and every current café item is genuinely dine-in-only). `purchaseItems` now skips `inventory` entirely for `consumedOnSite` items. `content/day1.ts`'s `buildPurchaseNarration` gained a third `allConsumedOnSite` parameter producing on-site dine-in phrasing ("テーブルまで運んできてくれた。「はい、どうぞ。ごゆっくり」") instead of the previous take-away-sounding "気をつけてね" line, for an all-café-item purchase.

**Verified**: 3 new unit tests (`tests/newlifecoreEngine.test.ts`) plus a real-browser check: ordering coffee at CAFE_NODOKA now produces `belongingsAfterCafePurchase: "特に持ち帰った物はまだない。"`, while the Yohei grocery control case is unaffected (`"持ち物を確認した：米（1袋）。"`).

## 3. Vague action labels (Section 12)

Every `discoverActionLabel` reading the generic "気になったので聞いてみる"/"様子が気になったので聞いてみる" (7 local problems + 2 event threads, `content/localProblemDefs.ts` / `content/eventThreadDefs.ts`) was renamed to name WHO and roughly WHAT (e.g. `yohei_kiyoshi_delivery`: "様子が気になったので聞いてみる" → "洋平に、清さんの様子を聞く"; `kiyoshi_old_colleague`'s own thread: → "清に、様子を聞く"). No test hardcoded the old strings, so nothing else needed updating. Real-browser evidence (Section 8 below) shows both the Yohei-mediated and the Kiyoshi-direct action now sitting side by side, each legible on its own before being pressed.

## 4. Live-prompt scene/event context (Sections 7-9) -- the actual Yohei/Kiyoshi fix

**Root cause, found by reading `dialogue/contextBuilder.ts`**: the live prompt's only "what's happening" signal was a generic `currentScene` string ("洋平商店で、プレイヤーと向き合っている") plus an un-scoped, all-time list of every local problem this NPC has ever heard of. Nothing told the model that the player had JUST discovered/helped with something TODAY -- so a reply like "まあ、助かった" had no concrete referent to answer, exactly the Owner's complaint.

**Fix**: new `dialogue/sceneContext.ts`, entirely derived from existing canonical state (never invented, Section 9's explicit anti-hallucination boundary):
- `activeEventContextFor(npc, state)` -- the single most relevant open local problem or event thread touched TODAY, as `currentEvent`/`eventState`/`whatJustHappened` (this last field doubles as Section 7's PLAYER_ACTION signal, since it IS the literal text-consequence of the player's last structural action -- judged a simpler, equally faithful design than adding a raw action-id field too).
- `recentSharedEventsToday` / `unresolvedThreadsKnown` / `recentActivitiesToday` -- Section 7's remaining named fields, each a thin, already-existing-data read.

`NpcAiContext` (`dialogue/types.ts`) and `buildNpcAiContext` (`contextBuilder.ts`) now carry all of these. The live adapter (`devtools/newlifeCoreVertexLiveAdapterCore.mjs`, server-only, never bundled -- `tests/safety.test.ts` still passes) gained a new, prominent 【今、実際に起きていること】 prompt block plus an explicit Section 8 rule ("まずその出来事そのものに答えてください... 悪い例: プレイヤー「清さんの件、聞きました」→ ...「まあ、助かった」") and a Section 9 rule permitting an NPC to introduce new topics ONLY from material already listed in the prompt.

**10 new unit tests** (`tests/newlifecoreSceneContext.test.ts`) cover: no-event-is-a-valid-state, the Owner's own Kiyoshi scenario grounding Yohei's context correctly, eventState/whatJustHappened shifting from "discovered" to "helped", going quiet once RESOLVED or once a day passes untouched, the same coverage for an Event Thread, `unresolvedThreadsKnown` staying answerable on a quiet day, and `recentSharedEventsToday`'s knowledge-boundary scoping.

**Honest limitation**: this is a prompt-engineering fix. Its structural correctness (the right facts reach the right NPC at the right time) is unit-tested exhaustively. Its actual payoff -- whether the LIVE model's reply genuinely improves -- cannot be automatically re-verified in this Run: every real-browser trace in this codebase (this phase included, matching every earlier phase's own discipline) runs with the live-AI toggle off, against the deterministic adapter, for reproducibility. This is the same category of limitation PHASE 14's Fumiko-voice fix carried.

## 5. Yohei/Kiyoshi scene, viewed directly (Section 12)

Real-browser screenshot (`.scratch_phase16/visual_360x800_event_scene_card.png`), day 2, 10:15, YOHEI_STORE: the scene card carries the new accent-colored left border (Section 4/29 below); both Yohei and Kiyoshi (physically present, 10:00-11:00 only) get their own NPC cards; the action list reads "洋平に、清さんの様子を聞く" / "洋平商店の仕事を手伝う" / "清に、様子を聞く" side by side -- each names its target and topic before being pressed, directly answering Section 12's own bad-label example.

## 6. EVENT VISIBILITY + BIG CHOICE SIGNAL (Sections 4, 21, 29)

A scene-card actually hosting a Moment Event / Event Thread / local-problem action gets a new `.nlc-scene-card--event` accent-colored left border (never an icon or popup). The trajectory opportunity offer (`LifeOpportunityOffer.tsx` -- accepting sets a 30-day-persistent flag, a genuine LIFE_TURN_EVENT under Section 5's taxonomy) now shows a `.nlc-big-choice-signal` line, "この返事で、しばらく生活が変わるかもしれない。" (Section 21's own example phrasing, verbatim), styled distinctly but revealing no outcome. Real-browser screenshot (`.scratch_phase16/visual_390x844_big_choice_signal.png`) confirms both render together correctly: Jin's own invite quote, the signal line, and the accept/decline choices, all inside the ordinary scene-card, no popup.

## 7. EVENT CLASSES (Section 5) -- mapped onto existing systems, not rebuilt

The 4 official classes are satisfied by content that already existed (PHASE 15/12.7), reused rather than duplicated, to respect Section 35's ban on new gameplay systems:
- **DAILY_EVENT** = Moment Events (`content/momentEventDefs.ts`, unchanged this phase).
- **THREAD_EVENT** = Event Threads (`content/eventThreadDefs.ts`, labels clarified this phase).
- **OPPORTUNITY_EVENT** = a trajectory's "話を聞いてみる" → offer moment (`content/trajectoryDefs.ts`, unchanged this phase).
- **LIFE_TURN_EVENT** = accepting that offer (now carries the Big Choice Signal, Section 6 above).
Each already satisfies SETUP → CHOICE → STATE_CHANGE → FOLLOW-UP structurally (observation/discover → discover-or-help-or-connect → resolution tick → world-change fact).

## 8. FORTUNE HOUSE -- ritual, persistence, visibility (Sections 14-19)

- **Card reveal** (Section 14, a genuinely new beat): picking a card now shows "カードは「道」だった。" (accent-colored, bold) before the opening question, inside the same conversation panel -- never a separate screen.
- **Card-like visual** (Section 15): `FortuneCardPicker.tsx`'s 3 buttons now use a new `.nlc-fortune-card` treatment (soft inner border, gradient) instead of the plain `.nlc-choice` class every other action uses -- no glow/animation (Section 16's own ban).
- **Persistence** (Section 18, genuinely new mechanism): `types.ts`'s `lastFortuneCard: { cardId, day } | null`, written exactly once per draw (`engine.ts`'s `recordFortuneCardSelection`), never cleared by `startNewDay`. `content/day1.ts`'s `openingLineFor` now greets the player with a card-specific follow-up line ("この前『道』のカードを引いてたわね。あれから、何か変わった?") the first time they talk to Shizuko on a LATER day. No raw player free text is ever stored (existing privacy rule, unchanged) -- only the card id and day.
- **Map visibility** (Section 19): the Fortune House's own movelist button gets a subtle gradient/border treatment (`.nlc-pick-btn--fortune`), distinct from the other 6 plain location buttons but with no icon, no clinical color, same tap-target size.
- **Real-browser evidence**: `.scratch_phase16/trace_d_readable2.txt` -- 5 consecutive days, each drawing a real card (道/鏡/灯り/道/鏡, deterministically varying), each day 2-5 opening with the correct card-specific follow-up line naming YESTERDAY's card, each producing a real (deterministic-adapter) reply, and `dayAfterSleep` advancing correctly every time. Visual gate confirms the card picker, the reveal line, and the movelist button at all 4 viewports.
- **Not turned into a consultation app** (Section 8/17, unchanged from PHASE 15): same conversation panel/testids as every NPC; the live adapter still hard-bans clinical vocabulary and fake-prophecy phrasing (verbatim BAD examples retained from PHASE 15).

## 9. Day1-5 real-browser vertical slice (Sections 25-28, 30-32)

`.scratch_phase16/day1_5_traces.mjs`, scratch harness, deterministic adapter (same reproducibility discipline every earlier phase used). One real harness bug was found and fixed mid-Run (documented, not hidden): the Fortune House flow auto-opens Shizuko's conversation on card selection, so `talk()`'s "click the talk button first" helper silently failed and left the conversation open, corrupting later days -- the exact same bug class PHASE 15's own Trace E hit. Fixed with a `continueOpenConversation` helper (skips the already-open talk button) and a day-2-first ordering fix for the Kiyoshi state-coherence check (`yohei_kiyoshi_delivery`'s `minDay` is 2, not 1). Re-run produced 0 WARNING lines.

- **Trace A (follow events)**: Day 1 alone produced 2 Moment Events (bulletin notice, dropped glove); Day 2 discovered `yohei_kiyoshi_delivery` via the new clear label, discovered a 3rd Moment Event, engaged Jin's trajectory, and connected Kiyoshi's delivery to Jin; Day 3-5 progressed/resolved multiple local problems and continued engaging Jin. Day 5 still surfaced brand-new discoveries (`hina_needs_promotion_help`, `shopping_street_vacant_unit`) -- a genuine Day-6 pull (Q10 below).
- **Trace B (ignore events entirely)**: only ever visited CHALLENGE_CENTER. The shelf, the bench, Miyoko/Fumiko's tea, a café delivery, and rain all still happened off-screen across the 5 days -- direct confirmation the world does not wait for the player (Section 24).
- **Trace C (free-talk heavy)**: talked to every present NPC every day; replies visibly vary by day/NPC via the deterministic adapter's own bucket variety (menu-question replies correctly list the real bounded catalog) -- confirms the conversation system itself stays robust and structurally sound across 5 days of heavy use, though (Section 4 above) the LIVE conversational quality uplift from Section 7-9 is unverified by this specific trace.
- **Trace D (Fortune House)**: see Section 8 -- clean, 5-distinct-day persistence evidence.
- **Trace E (mixed normal player)**: a non-scripted mix of locations/actions across 5 days, all producing coherent, explainable outcomes -- what happened, what was chosen, what changed, and what remained unresolved are all readable directly from the evidence log for every day.

## 10. Visual gate

All 4 viewports (360x800/390x844/430x932/1440x900), screenshots viewed directly: the Fortune House movelist button reads as subtly distinctive without looking disabled or clinical; the event-bearing scene card's accent border and the new action labels are legible in the first viewport without scrolling; the Fortune Card picker reads as cards, not generic buttons; the card-reveal line is visually distinct from the opening question; the Big Choice Signal renders inline with the opportunity offer without ever looking like a popup. No text overflow, no tap target under 44px, button styles consistent with the existing system throughout.

## 11. Self-critique

**Q1 -- 本当にゲームとして何をするか分かるか。** PARTIAL, evidenced structurally. Event-bearing scenes are now visually and textually legible (clear labels, accent border), the Fortune House reads as a distinct place, and the movelist itself now carries one visual cue beyond plain text -- real, working improvements over the baseline the Owner flagged. Whether a genuine first-time human reads this as "understood immediately" is a human-judgment question this Run cannot self-certify, same caveat every prior phase's Q1 carried.

**Q2 -- イベントが見えるようになったか。** YES. The `.nlc-scene-card--event` border, the renamed action labels, and the Big Choice Signal are all real, visually confirmed changes -- "something is happening" is now a readable fact, not just buried prose.

**Q3 -- choicesに意味があるか。** YES. Every discover/help/connect/moment-event choice produces a distinct, causally connected result (Trace A/E evidence); the Big Choice Signal specifically flags the one choice in this vertical slice with genuine 30-day-persistent consequence.

**Q4 -- consequenceが分かるか。** YES structurally (world-change texts, end-of-day narrative, and now the live-prompt's WHAT_JUST_HAPPENED signal specifically exist to make this legible) -- the live-model conversational half of this is unverified per Section 4's honest limitation.

**Q5 -- free talkがeventを深くしているか。** PARTIAL. The scene-context plumbing that would let free talk draw on a just-happened event is now real and unit-tested; its felt effect on an actual live conversation is the one part of this phase's work that could not be automatically re-verified.

**Q6 -- free talkだけでゲームが成立してしまっていないか。** NO. Trace B (zero events engaged, CHALLENGE_CENTER only) still produces a full, structurally-driven world -- the game does not collapse into "just talk" even under the most conversation-avoidant play style.

**Q7 -- Fortune Houseが明確に特別な場所か。** PARTIAL/YES, evidenced. The movelist button, the card-as-card visual, the reveal beat, and the persistence-driven follow-up greeting are all real, working differentiators over an ordinary NPC visit -- confirmed via 5 days of real-browser evidence. Whether it specifically produces "行ってみたい" curiosity in a first-time player is Human Validation's own question.

**Q8 -- Fortuneが相談アプリになっていないか。** YES (has not become one). Same conversation panel as every NPC, no clinical iconography, the live adapter's existing no-diagnosis/no-prophecy rules are unchanged and reinforced.

**Q9 -- 人生ゲーム的な「次は何が起きる？」があるか。** YES. Trace A/D together show varied Moment Events, Thread progress, a trajectory opportunity, and a different Fortune Card every visit -- genuine variety across 5 days, not a fixed script (Section 6's density minimums are all met across the traces: 3+ daily events, 2 thread events/stages, 1 opportunity event reached, 2 non-work threads, 5 fortune experiences).

**Q10 -- Day5でDay6を開きたいか。** YES, evidenced concretely. Trace A's Day 5 still surfaces brand-new discoveries; Fortune House's own persistence mechanism structurally creates a "その後どうでした？" pull into the next visit by design, not just by hope.

## 12. Regression

`npx tsc --noEmit`: clean throughout. `npm run build`: clean (pre-existing >500kB chunk warning unrelated to this change). Fast newlifecore-scoped suite (`tests/newlifecore*.test.*` + `tests/safety.test.ts`, excluding the RTL file): **313/313 passed**. RTL suite: **42/42 passed**, unchanged. Combined: **355/355**, 0 failed, 0 regressed. This phase's net new fast-suite tests: `newlifecoreEngine.test.ts` gained the café-inventory-fix tests (Section 2) and the Fortune-persistence tests (Section 8); the new `newlifecoreSceneContext.test.ts` (Section 4) added 10 tests. The RTL suite is unchanged (no new RTL tests were needed -- no existing RTL assertion referenced the old café/action-label/Fortune-opening-line behavior this phase changed).

## 13. Remaining weaknesses (honest, not laundered)

- **Live-model conversational quality is the one improvement this Run could not self-verify** (Section 4/Q5) -- the prompt/context fix is structurally correct and unit-tested, but every automated trace in this codebase runs the deterministic adapter for reproducibility, so the actual felt improvement in a real Gemini conversation is unconfirmed until a live session (Owner play or Human Validation) exercises it.
- **Section 13's "event actions primary, free talk secondary" ordering was satisfied via visual weight (the accent border), not by physically reordering the DOM** (NPC cards, with their own talk buttons, still render before the specialActions block). A literal reorder was judged higher-risk (touching the complex, heavily-tested NPC-card render tree) than the value it would add beyond the existing visual cue; flagged here rather than silently interpreted away.
- **Section 10's causal-narration rewrite was scoped narrowly**: rather than rewriting every world-change text to the directive's own verbose example shape, the higher-leverage fix (Section 4 above, giving the LIVE model real event context) was prioritized; a handful of texts were reviewed and found already adequate (e.g. the shelf-fixed-without-player line already names 相馬 by name).
- **EVENT CLASSES (Section 5) were mapped onto existing systems rather than built as 4 distinct new mechanics** -- a deliberate choice to respect Section 35's scope freeze, stated directly rather than implied.
- Full first-time-human clarity (Q1/Q7) and genuine Day-6 desire (Q10) remain evidenced-but-not-human-confirmed -- exactly what the next Human Validation round exists to determine.

## 14. Final judgments

**`GAME_IDENTITY = CONDITIONAL`** -- concrete, verified improvements to event legibility, action-label clarity, and Fortune House distinctiveness (Sections 3, 5, 6, 8, 10); condition: true first-look clarity is a human-judgment question, and the live-model conversational half of the fix is unverified by this Run's own automation.

**`EVENT_VISIBILITY = PASS`** -- the accent-bordered event scene-card, the renamed action labels, and the Big Choice Signal are all real, visually confirmed (Section 6/10), non-quest-UI (no icon/badge/popup anywhere).

**`DIALOGUE_GAMEPLAY_INTEGRATION = CONDITIONAL`** -- the scene/event context plumbing (Section 4) is real, structurally correct, and unit-tested 10 ways; its actual conversational payoff needs a live-model session to confirm, which this Run's reproducible-trace discipline does not exercise.

**`STATE_COHERENCE = PASS`** -- the café/luggage defect is root-caused, fixed, unit-tested, and confirmed via real browser; the grocery control case is confirmed unaffected.

**`FORTUNE_HOUSE_IDENTITY = CONDITIONAL`** -- the reveal beat, card-like visuals, cross-day persistence, and map distinctiveness are all real, working, and evidenced across 5 real-browser days (Section 8); whether a first-time player is actually drawn to it remains a Human Validation question.

**`DAY5_PULL = MIXED`** -- strong structural evidence (Trace A's fresh Day-5 discoveries, Fortune House's built-in follow-up pull) but, honestly, still resting on the same "evidenced, not human-confirmed" caveat as every prior phase's equivalent claim.

**`READY_FOR_HUMAN_VALIDATION = YES`** -- every directive evidence requirement has a real, tested, traced response; the one known automation gap (live-model quality) is named explicitly rather than hidden; regression holds at 355/355. Standard minimal briefing, no mention of any system by name. Watch specifically for: whether a real Yohei/Kiyoshi-shaped scene now reads as causally clear in an ACTUAL live conversation (the one thing this Run could not self-test), whether the Fortune House draws genuine first-visit curiosity, and whether "次どこへ行こう" / "あれどうなるんだろう" language appears unprompted.

## Completion

**`NEW_LIFE_GAME_IDENTITY_V1_READY`**

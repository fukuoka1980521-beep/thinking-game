# PHASE_14_NEW_LIFE_GAMEPLAY_CORE_V1 -- CLOSE REPORT

BASELINE: `b6d57c1` (PHASE 13 CLOSE, `WORLD_ACTIVITY_V1 = CONDITIONAL`, `LOCAL_PROBLEM_LOOP = ACCEPT`, `READY_FOR_HUMAN_VALIDATION_2 = YES`).

FINAL COMMIT: `88848c2` (feat: add gameplay core loop for New Life (PHASE_14))

INPUT: further real-play/partner-observation evidence after PHASE 13, given directly in the phase directive: free conversation and returning-conversation quality praised, but the whole-game verdict was "自由会話は良いが、面白くない" / "何をするゲームなのか分からない" / "ゲーム要素がない" / "行く場所・人物が少なく感じる" -- treated as the top priority this phase.

## 1. Human evidence addressed

The directive's own diagnosis: FREE TALK + FREE MOVEMENT exist, but "今日は何をして遊ぶか" (what to actually do today) was missing. This phase's central bet, matching that diagnosis exactly: add a GAMEPLAY CORE loop (today's signs -> discover an activity -> do something with a real time cost -> talk about it -> a delayed world consequence) without touching what was already praised (free conversation, return-visit continuity).

## 2. Theme statement (Section 1)

Player-facing theme narrowed to: **「小さな町で30日暮らし、自分の居場所を作るゲーム」**. The "30日後に何者かになる" framing (still true internally -- the trajectory system is unchanged) is no longer the front-facing pitch. This is reflected concretely in the trimmed opening copy (Section 18, below), not just stated as an intention.

## 3. Core loop, today's signs, activities (Sections 3-10)

**CORE LOOP V1**: wake -> today's signs (up to 3, optional) -> walk/visit -> discover an activity or local problem -> do something -> talk -> world consequence -> time passes -> evening -> next day. Implemented as real, working code (`content/todaysSigns.ts`, `content/activityDefs.ts`, `content/activityEngine.ts`, `engine.ts`'s `runActivity`/`tickActivitiesForNewDay`, `ActivitySession.tsx`), not a design document.

**TODAY'S SIGNS**: up to 3 short plain-sentence hints at wake, drawn from a pool of real, currently-true candidates (an activity reachable later today, an undiscovered-but-eligible local problem, two hand-authored NPC-location hints for genuinely narrow presence windows -- Kiyoshi's 1-hour shopping visit, Jin's shelf-repair window). Never a fabricated hint (unit-tested: every returned sign matches an actually-eligible candidate). Selection is deterministic per day (seeded by `pseudoChance`, the same hash the recurring-event engine already uses) but varies across days as the eligible pool changes -- unit-tested directly (day 3/10/20 do not all produce the same 3 signs). Rendered as plain `<p>` tags, identical markup to the ordinary wake narration above them -- confirmed visually (Section 9 below) to be indistinguishable from ambient text, never a mission-list/icon/badge treatment. Ignoring all 3 and going elsewhere is exactly as valid as acting on one (real-browser-confirmed, Trace `ignore_signs_free_play`).

**GAMEPLAY ACTIVITY**: exactly 3 (Section 5's own "V1では3種類程度"), one shared data-driven engine rather than 3 bespoke subsystems -- a deliberate V1 simplification, stated plainly rather than claimed otherwise:
- `cafe_busy_hour` (Miyoko/CAFE_NODOKA, 11:30-14:00): serve coffee/hot sandwich, handle checkout, clear tables. Budget 35min against a 45min task sum -- doing everything requires skipping one task, not merely running out of clicks.
- `repair_with_jin` (Jin/COMMUNITY_HALL, 8:00-11:00): check the situation / get a tool / quick-fix / suggest replacement / ask Jin -- alternative approaches, not a checklist with one correct answer (Section 7's explicit ban on a "正解当てquiz"), each producing distinct flavor text.
- `shop_helper` (Yohei/YOHEI_STORE, 9:00-17:00): restock/deliver/serve a customer/prepare a flyer, budget genuinely allows about 2 of the 4 (matching Section 8's own "2つ程度選ぶ" example almost exactly).

No score anywhere (Section 9, guard-tested against the full XP/LEVEL/POINT/RANK/etc. vocabulary list). Completion is tracked only as a private session count, exactly like `PlayerExperience.count`/`LocalProblemDef`'s help count -- never displayed, never a percentage or progress bar (confirmed visually, Section 9 below: the session UI shows only a plain "残り◯分" readout, the same register the movelist's own time-remaining line already uses).

**WORLD CONSEQUENCE**: never instant. `tickActivitiesForNewDay` (called from `startNewDay`, same timing shape as PHASE 13's local-problem tick) resolves an activity's world-change once `completionThreshold` sessions have accumulated AND `resolveAfterDays` have passed since the LAST session. Real-browser-confirmed precisely: 3 repair sessions (days 2/4/6) produced "集会所の設備が、いつの間にかきちんと動くようになっていた。" landing exactly on day 9 (6+3), not one day earlier or later.

**A genuine finding, not swept under the mechanism's success**: this phase's own trace work first ran repair sessions on days 2/4/6/8/10 (every cooldown-eligible day, past the threshold) and the world-change never fired within the 10-day window -- because each new session resets `activityLastDone`, restarting the "quiet period" clock. A player who keeps helping past the threshold indefinitely defers the payoff. This is the exact same mechanism PHASE 13's `LocalProblemDef` already uses (not new to this phase), already unit-tested for the intended case (stop at the threshold, then resolve), but this is the first time the over-engagement edge case was actually exercised. Recorded honestly in Section 12 (remaining weaknesses) rather than silently fixed by expanding scope into PHASE 13's accepted mechanism.

## 4. Free conversation's new position (Sections 11/12)

Not reduced. An activity session's NPC reaction is written as an ordinary `WorldFact` (`knownBy: [def.npc]`) -- the SAME knowledge-boundary channel PHASE 13's local problems and ordinary purchases already use, so it flows into the live prompt's `knownFacts` automatically, with zero new plumbing beyond what already existed. Verified directly: a prompt-content test confirms Miyoko's prompt carries her just-finished-activity reaction; a real-browser trace (`cafe_activity_then_talk`) confirms the conversation UI still opens and closes cleanly immediately after an activity session ends, with no crash or stale state. NPCs are never forced to bring activities/problems up unprompted (the live prompt instruction added in PHASE 13 for local problems already says so, and nothing this phase narrows that).

## 5. Fumiko voice fix and NPC voice audit (Sections 13/14)

Real HV evidence: asked her age, she replied "私かい？もう70になるよ" -- "〜かい"/"〜だよ" are masculine-coded, blunt registers that don't fit a composed former schoolteacher (this specific combination reads closer to Kiyoshi's or Yohei's established voice than Fumiko's own). Root-caused to her `npcDefs.ts` fields never explicitly anchoring her REGISTER (brisk/direct was described, but not "still polished, never rough"). Fixed: her `personality` and `speechStyle` fields now explicitly state she never uses masculine-coded/blunt endings, with the exact "〜かい"/"〜だぜ" pattern named as the thing to avoid. The live prompt's shared gender-consistency rule (previously only warning about male NPCs using female-coded words) was generalized to also warn about the reverse -- benefiting Miyoko and Hina too, not just Fumiko, for one added sentence.

**Audit of the remaining 7 NPCs** (Section 14's explicit requirement -- not "fix Fumiko and stop"): Kamiya (professional/polite register), Daisuke (low, unhurried, pulls back from his own topics), Hina (bright but rushed when her shop comes up), Kiyoshi (terse, resists being helped) all read as clearly distinct from each other and from Fumiko on inspection -- no further changes made. Yohei/Miyoko/Jin's `speechRegister` fields are read from a frozen, explicitly "never modified" canon file (`research/bounded-generative-world/canonData`, per `npcDefs.ts`'s own header comment) -- audited, found already distinct, and deliberately left untouched rather than violating that standing architectural boundary. One real issue found, one real issue fixed -- not padded into a larger rewrite the directive itself warned against ("大量rewriteは禁止").

## 6. Kamiya UI fix / action button system (Sections 15/16)

Root cause found, not guessed: `.nlc-npc-actions` (the container wrapping ONLY "自由に話す") had no `display: grid` rule, while `.nlc-choices` (wrapping every other specialAction, including Kamiya's "用紙に記入する"/"求人票を見る") did -- so the talk button shrink-wrapped to its own text width while every other action stretched full-width, despite sharing the identical `.nlc-choice` button class. One-line CSS fix (`.nlc-npc-actions { display: grid; gap: 8px; ... }`, matching `.nlc-choices` exactly). Confirmed visually (Section 9): Kamiya's "自由に話す" now renders at the same width, shape, and tap-target size (min-height 44px, already true beforehand) as "求人票を見る", at all 4 viewports. This single fix applies to every NPC's card, not Kamiya specifically -- the bug was in the shared layout, never NPC-specific.

## 7. Location/NPC additions: none this phase

Zero new NPCs, zero new locations. Every sign/activity/consequence this phase uses the existing 8 NPCs and 7 locations (PHASE 13's own Kiyoshi addition, unchanged). Section 19/20's audit conclusion: the 3 activities and TODAY'S SIGNS system were fully buildable using only what already existed (`repair_with_jin` reuses Jin/COMMUNITY_HALL, `cafe_busy_hour` reuses Miyoko/CAFE_NODOKA, `shop_helper` reuses Yohei/YOHEI_STORE) -- no location was left empty for lack of a person/activity/event/problem (Section 20's explicit ban), and no genuine need for a new one arose. This is a stronger discipline than PHASE 13's own (which added one NPC); recorded honestly as a choice, not an oversight.

## 8. Opening copy (Section 18)

Trimmed from a 5-line copy (which enumerated "仕事を探す" among illustrative verbs and closed on a "who will you become" framing) to two short sentences: 「30日、この町で好きに暮らしてみてください。町を歩き、人と出会い、気の向くまま過ごせます。決まった正解はありません。」 Neither "仕事を探してください" nor "困りごとを解決してください" appears anywhere (Section 18's explicit ban, directly checked). One pre-existing test asserting `/30日間/` in the opening copy was updated to `/30日/` to match the intentional wording change (not a workaround -- the new copy genuinely doesn't use the longer "30日間" form).

## 9. Real-browser traces (`.scratch_phase14/`, scratch harness only) and visual gate

4 scenarios, reused the proven `safeAction` pattern from `.scratch_phase13/`:
- **`signs_activity_arc`** (Day1-10): today's signs visible and varying across days; 3 repair sessions on a fixed cooldown-respecting cadence (day 2/4/6), each a genuine partial-budget choice (2 of 5 tasks, "残り10分程度" left, correctly insufficient for the remaining 15-minute option); world-change landed exactly day 9 (Section 3's honest edge-case finding came from an earlier version of this same trace, before it was corrected to match the unit-tested intended case).
- **`ignore_signs_free_play`** (Day1-3): signs shown, deliberately ignored, player went to an unrelated location instead -- normal, unpenalized play (Scenario B/23).
- **`cafe_activity_then_talk`** (Day1-2): cafe activity (1 of 4 tasks, correctly triggering the "minimal" reaction tier), then immediate free-text conversation with Miyoko -- UI stayed clean, no crash, no stale state (Scenario D/11).
- **`non_work_days`** (Day1-3): zero activities or local problems touched, ordinary sit-down + free chat only -- game never stalls, never nags (Scenario C/G/25's existing-action-based non-work path).

One real harness bug found and fixed mid-run: the trace script initially targeted `nlc-action-<id>` for activity task buttons, but `ActivitySession.tsx` uses a distinct `nlc-activity-task-<id>` testid -- silently producing 0 real clicks and a misleading "budget unspent" reading until caught and corrected (confirmed by contrast: the corrected run's "残り10分程度" readout and matching partial-tier NPC reaction).

**Visual gate**, all 4 required viewports (360x800/390x844/430x932/1440x900), viewed directly: today's signs render as plain paragraphs indistinguishable from ordinary narration, fully visible in the first viewport alongside the primary action button (no scroll needed); the activity session UI is a plain task-button list with a "残り◯分" readout and a "ここで切り上げる" exit, no progress bar/checkmark/percentage; Kamiya's "自由に話す" now matches every other action button's width and shape exactly, at every viewport.

## 10. Regression

`npx tsc --noEmit`: clean throughout (checked repeatedly during implementation). Full newlifecore-scoped suite (all `tests/newlifecore*.test.*`, 10 files run together in one process): **293/293 passed**, 0 failed. PHASE 13's own baseline was 272/272; this phase adds exactly one new test file (`newlifecoreActivities.test.ts`, 20 tests) and extends `newlifecoreLivePrompt.test.ts` by 1 test (272 + 20 + 1 = 293). One pre-existing opening-copy assertion in `newlifecoreRenderedUI.test.tsx` was corrected in place (same test, updated regex) to match the intentional Section 18 wording change, not added or removed. The 42-test RTL suite (including the three ~80-90s full-30-day-playthrough tests) passed cleanly within this same combined run, confirming no regression from the CSS/opening-copy/activity-wiring changes.

## 11. Self-critique

**Q1 -- 何をするゲームか初見で分かるか。** PARTIAL. The opening copy, wake-scene signs, and 3 reachable activities are real, structural answers to "what do I do" within the first 1-2 days (§3/§9's evidence). Genuine first-look clarity can only be confirmed by an actual first-time human, which is exactly what Human Validation 3 should determine -- not claimed resolved here.

**Q2 -- 会話以外にも「遊んだ」と感じる行動があるか。** YES. 3 real activities with genuine task/budget choices and confirmed, precisely-timed world consequences (§9's exact day-9 evidence).

**Q3 -- today signsが命令に見えないか。** NO (they don't look like commands) -- structurally (guard-style: every sign only ever names something actually true) and visually (§9: plain paragraph markup, no icon/badge) and behaviorally (`ignore_signs_free_play` trace: ignoring them is normal, unpenalized play).

**Q4 -- activityが単純作業すぎないか.** PARTIAL, stated honestly. The 3 activities share one engine (a time-budgeted task-pick list) rather than being 3 mechanically distinct systems -- the INTERACTION pattern (click a task button) is mechanically uniform across all 3, even though the flavor text and judgment-shapes-outcome framing (especially `repair_with_jin`) differ. This is a real V1 simplification, not a hidden one.

**Q5 -- ポイントなしでも結果を感じるか。** YES -- §9's exact day-9 world-change timing, and the tiered NPC reaction (all/partial/minimal) visible in the conversation log and end-of-day narrative, are both real, felt consequences with zero numeric score anywhere (guard-tested).

**Q6 -- 自由会話の価値がむしろ高まったか。** YES -- an activity's result is now real material in the NPC's own `knownFacts` (§4's prompt-content test), meaning free conversation has MORE grounded, specific things to draw on after playing, without any new obligation on the NPC to bring it up.

**Q7 -- 仕事ゲームに偏っていないか。** PARTIAL, and the honest weak point of this phase. All 3 new activities are variations on "help with someone's work" (serve customers, fix equipment, restock a shop). No genuinely non-work activity was built this V1 (Section 25 left this explicitly as a DISCOVER-time judgment call) -- the existing `sit_down`("コーヒーを頼んで座る")/`rest_a_while`("少し休む") actions are the only non-work-flavored content available, and neither gained any new depth this phase. This is a real gap, named directly rather than argued away.

**Q8 -- 既存場所でも以前より広く感じるか。** PARTIAL. CAFE_NODOKA/COMMUNITY_HALL/YOHEI_STORE each gained a real activity and already had a local problem from PHASE 13 -- those 3 feel substantially more alive. BARBERSHOP and SHOPPING_STREET gained nothing new this phase (only their PHASE 13 local-problem content applies) -- the "feels bigger" effect is real but uneven across the 7 locations, not uniform.

**Q9 -- Day3時点で「明日は○○したい」が生まれるか。** YES, evidenced directly: the `signs_activity_arc` trace's own arc (help Jin day 2, see it's not finished, help again day 4, complete the threshold day 6, the payoff visibly lands day 9) is exactly this "concrete reason to check back" shape, not the generic "more content exists" pattern already flagged as insufficient in earlier phase CLOSE reports.

**Q10 -- 自分ならDay4を開くか。** YES, with the same caveat as Q1: the structural ingredients (real daily signs, real short activities with genuine choice, real delayed consequences, enriched free talk) are now present and evidenced, not merely designed-for -- but §7's work-skew and §Q4's task-simplicity are real, un-resolved textures a real human might still weigh differently. Human Validation 3 is the actual test, not this self-critique.

## 12. Remaining weaknesses (honest, not laundered)

- **Over-engagement defers the payoff indefinitely** (§3): continuing to help an activity/local-problem past its completion threshold keeps resetting the "quiet period" clock, so a highly-engaged player may never see the world-change land. Shared with PHASE 13's `LocalProblemDef` mechanism (not new to this phase); not fixed here since doing so would mean redesigning an already-accepted PHASE 13 system, beyond this phase's mandate -- flagged for a future phase if evidence shows it matters in practice.
- **Work-skew** (§Q7/§11): all 3 new activities are work-shaped; no new non-work activity was built this V1.
- **Uneven location depth** (§Q8): 3 of 7 locations gained new activity content, 4 did not.
- **One shared activity engine, not 3 bespoke ones** (§Q4/§3): a deliberate, stated V1 simplification.
- Full first-time-human clarity (Q1) and genuine desire-to-continue (Q10) remain evidenced-but-not-human-confirmed -- exactly what Human Validation 3 exists to determine.

## 13. Final judgments

**`GAMEPLAY_CORE_V1 = CONDITIONAL`** -- the loop is real, working, tested at the unit and real-browser level, and demonstrably produces felt, non-scored, precisely-timed world consequences (§9's exact day-9 evidence). Condition: the work-skew (no non-work activity) and single-engine simplification (§11/§12) are real, stated V1 boundaries, not fully resolved.

**`PURPOSE_CLARITY = CONDITIONAL`** -- opening copy, today's signs, and reachable activities are real, structural improvements toward "何をするゲームか分かる" (§1/§3/§8), verified as working code and confirmed via real-browser trace and visual gate -- but true first-look clarity is a human-judgment question this Run cannot self-certify (§Q1). Not PASS until Human Validation 3 confirms it; not FAIL since the structural evidence is genuinely strong.

**`FREE_CONVERSATION_PRESERVED = YES`** -- nothing about the existing conversation UI, memory, or live-prompt discipline was removed or degraded; an activity's result became new, real material available to it (§4/§Q6), verified both structurally (prompt-content test) and live (real-browser trace showing clean conversation UI immediately after an activity).

**`READY_FOR_HUMAN_VALIDATION_3 = YES`** -- all Section 0 evidence has a real, tested, traced response; no known blocking bug exists; regression holds. Same minimal briefing as before ("知らない町で30日暮らすゲームです。好きに動いてみてください。"), no mention of TODAY'S SIGNS or GAMEPLAY ACTIVITY by name. Watch specifically for: whether the player understands what to do without being told, whether "遊んだ" reads as a real feeling after an activity, whether "次は○○したい" language appears (§28's fun signal), and whether the work-skew (§12) is something a real tester notices or minds.

## Completion

**`NEW_LIFE_GAMEPLAY_CORE_V1_READY`**

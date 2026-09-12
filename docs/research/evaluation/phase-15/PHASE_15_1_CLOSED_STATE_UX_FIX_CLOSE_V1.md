# PHASE_15_1_CLOSED_STATE_UX_FIX -- CLOSE REPORT

BASELINE: `3d03f0b` (PHASE 15 CLOSE, `ACTIVITY_CONSEQUENCE_CLOCK = PASS`, `FORTUNE_HOUSE_V1 = CONDITIONAL`, `HYBRID_EVENT_ENCOUNTER_V1 = CONDITIONAL`, `DAY5_GAME_PULL = YES`, `READY_FOR_HUMAN_VALIDATION_4 = YES`).

FINAL COMMIT: `a142522` (fix: give closed-location UX real opening-time and wait actions (PHASE_15_1))

INPUT: the PHASE 15 CLOSE report's own recorded weakness -- arriving at FORTUNE_HOUSE before its 10:00 opening showed only "占いの館は閉まっていた。" with zero specialActions, a texture shared (pre-existing, unchanged since PHASE 12/13) by YOHEI_STORE and CAFE_NODOKA. The Owner directed a minimal, scope-frozen fix before Human Validation 4: no new features, only the closed-state UX.

## 1. Scope discipline

No Event/Thread/NPC/location added. No Fortune House content, dialogue, or activity touched. No map or time-system redesign. The only files changed: `src/newlifecore/schedule.ts` (+1 exported function), `src/newlifecore/content/day1.ts` (+1 shared helper, 4 one-line call-site edits), `tests/newlifecoreClosedStateUX.test.ts` (new).

## 2. DISCOVER

Checked every location with an NPC-gated schedule: `CHALLENGE_CENTER` (Kamiya), `YOHEI_STORE` (Yohei), `CAFE_NODOKA` (Miyoko), `FORTUNE_HOUSE` (Shizuko) -- all four used the identical `{ ambientLine: "<closed text>", npcsHere: [], specialActions: [] }` shape. `COMMUNITY_HALL`/`SHOPPING_STREET`/`TRIAL_HOUSE` have no single-NPC "closed" gate and were left untouched (out of scope by construction, not overlooked).

Also confirmed the surrounding `nlc-movelist` (all other reachable locations) already renders independently of the current location's own `specialActions` -- so this was never a hard, all-navigation-blocked dead end. The real gap was narrower: no stated opening time, no in-scene wait option.

**Existing neutral wait action found**: `content/day1.ts`'s TRIAL_HOUSE scene unconditionally offers `rest_a_while` (`doShortAction(state, 15)`, no location change, no side effects beyond time). Reused verbatim -- same action id, same handler in `NewlifeCoreApp.tsx` -- rather than building any new time mechanic.

## 3. Fix

`schedule.ts`'s new `nextOpeningTimeAt(npc, location, afterTime)` reads the NPC's own canonical `schedule` array directly (never a hardcoded per-location string) and returns the next same-day block start, or `null` if nothing more opens today. `content/day1.ts`'s new `closedStateScene(location, npc, state, closedLine)`:
- If a same-day opening exists: appends `"${formatClock(nextOpen)}から開くようだ。"` to the existing authored closed line, and offers `{ id: "rest_a_while", label: "少し時間を過ごす" }`.
- If nothing more opens today (the realistic case for YOHEI_STORE/CAFE_NODOKA, both of which open at 8:00 -- always before the earliest possible arrival): leaves the plain closed line exactly as authored, with no wait action, since offering one would misrepresent the game's actual time economy (there is no cross-day wait mechanic, and building one was explicitly out of scope).

All 4 CLOSED branches (`CHALLENGE_CENTER`/`YOHEI_STORE`/`CAFE_NODOKA`/`FORTUNE_HOUSE`) now call this one shared helper.

## 4. Tests (CASE A-G)

`tests/newlifecoreClosedStateUX.test.ts`, 10 tests, all passing:
- **CASE A**: FORTUNE_HOUSE at 09:30 -- closed, states the real 10:00 opening, offers `rest_a_while`.
- **CASE B**: repeated waiting (the same time-advance `rest_a_while`'s own handler performs) crosses into the open window; `start_fortune_telling` becomes available.
- **CASE C**: covered structurally (the movelist's independence from the current scene's `specialActions` was confirmed in DISCOVER) and directly in the real-browser check (Section 5) -- `canLeaveViaMovelist: true` in every recorded case.
- **CASE D/E**: YOHEI_STORE and CAFE_NODOKA's closed-for-the-rest-of-the-day state -- plain line, no fictitious opening time, `specialActions: []` (correct: nothing to wait for).
- **CASE F**: `nextOpeningTimeAt` derives two DIFFERENT real times (Shizuko's 10:00, Kamiya's 9:00) from two different NPCs' own schedules -- proof the value is read from canonical data, not copy-pasted per location.
- **CASE G**: once genuinely open, neither the closed text nor the wait action ever appears.
- Plus a banned-vocabulary check (no クエスト/ミッション/報酬/タイマー language in the closed-state text).

## 5. Real browser (`.scratch_phase15/closed_state_ux_verify.mjs`, scratch harness)

**FORTUNE_HOUSE** (the realistic "opens later today" case): arrived 09:45 → `"占いの館は閉まっていた。 10:00から開くようだ。"`, `actionsOnArrival: ["rest_a_while"]`, movelist reachable. Clicking the wait action repeatedly advanced the clock to exactly 10:00, at which point `start_fortune_telling` appeared and the ordinary Fortune House flow (real card, real opening line: 「……『道』ね。今、どっちへ進もうか迷っていることは、何かある？」) completed normally -- confirming wait → open → normal gameplay resume, end to end, with real clicks.

**YOHEI_STORE / CAFE_NODOKA**: both only have a realistic real-browser CLOSED case after their 19:00-ish closing (their 8:00 opening is always in the past by the earliest possible arrival). Verified: plain closed line (`"洋平商店のシャッターは下りていた。"` / `"喫茶のどかは閉まっていた。"`), correctly `actionsOnArrival: []` (no misleading wait offer), `canLeaveViaMovelist: true`. This is the intended, honest behavior for the "closed for the rest of the day" branch, not a gap -- documented here explicitly so the difference from FORTUNE_HOUSE's case isn't mistaken for inconsistency.

## 6. Visual gate

All 4 viewports (360x800/390x844/430x932/1440x900), FORTUNE_HOUSE's fixed closed-state screenshotted and viewed directly (360x800 and 1440x900 inspected in full; all 4 confirmed via `boundingBox()` measurement): the closed text + opening time + `少し時間を過ごす` wait button render entirely within the first viewport, no scrolling needed. The wait button uses the exact same `.nlc-choice` styling as every other scene action (no greyed-out/disabled look, no error-page styling). Tap-target height measured `49.6px` at every viewport (360/390/430/1440), comfortably above the 44px minimum. No text overflow at any width.

## 7. Regression

`npx tsc --noEmit`: clean. `npm run build`: clean (`vite build` succeeds; the pre-existing >500kB chunk-size warning is unrelated to this change, unchanged from before). Fast newlifecore suite: **286/286** (PHASE 15's own 276-test baseline + 10 new closed-state tests). RTL suite: **42/42**, unchanged. Combined: **328/328**, 0 failed, 0 regressed. No existing test referenced the old bare-closed-state shape, so nothing needed to be updated for the new behavior.

## 8. Final judgments

**`CLOSED_STATE_UX = PASS`** -- the specific defect (closed location, zero actions, no stated opening time) is fixed for all 4 affected locations, verified at the unit-test, real-browser, and visual levels; the "closed for the rest of the day" case was deliberately left without a wait action (offering one would mislead, since no cross-day wait mechanic exists) and is documented as the correct behavior, not an oversight.

**`HUMAN_VALIDATION_4_READY = YES`** -- the one concrete, Owner-flagged pre-Human-Validation risk is resolved with real evidence; no other PHASE 15 system was touched; regression holds at 328/328.

## Completion

**`NEW_LIFE_CLOSED_STATE_UX_READY`**

# NEW LIFE — Phase 27 playable implementation report V1

Date: 2026-09-21. Run: `PHASE_27_PLAYABLE_IMPLEMENTATION_CANDIDATE_V1` (GitHub issue #1). This adds a real, owner-testable text-first 30-day playable candidate to the repository, built directly from the Phase 25/26 canon merged at `15a4815` and audited at `86c97eb`. `HUMAN_VALIDATION_STATUS = PENDING` throughout this document and inside the candidate itself — nothing here is or claims to be human/product validation.

## 1. Exact route

`https://<host>/?newlife30=1` — a hidden query-param route, added to `src/App.tsx`'s `initialViewFromLocation()` using the exact same pattern already in production for the unrelated Phase 4.6/4.7 CASE1 external test (`?case1test=1`). It is **not** linked from `HomeScreen` or any other screen; the only way in is the direct URL, matching instruction rule 3 ("no link added to the normal Home UI") and rule 2 ("isolated feature slice so current product behavior is unchanged for normal users").

## 2. Architecture summary

All new code lives under `src/newlife/`, isolated from the rest of the app:

- **`types.ts`** — `NewLife30State`: every canonical fact the story tracks (`signVersion`, `pickupPlan`, `mSeats`, `jWork`, `dWorkshop`, `fEditor`, `hyFactCheck`, `playerReport`, `publicBlame`, `encouragementOnly`, `day`, `day11Phase`, `day24Outcome`), taken directly from `NEWLIFE_30DAY_CHARACTER_DERIVED_PLAYABLE_V3.md` §2's own tracked-variable list. `DAISUKE_OCCUPATION` is tracked as a data constant, not just prose, so a regression test can assert it directly.
- **`state.ts`** — **SYSTEM OWNS TRUTH**. The only module that writes `NewLife30State`. `applyAction(state, actionId)` and `advanceDay(state)` are pure functions (state in, new state out); `resolveDay24Outcome(state)` implements the canon's Day 24 priority rule (§2 "Day 24の決め方"): an unrepaired public accusation or false report → `SPLIT`; every named role concretely secured → `JOINT_RETRY`; warm encouragement without securing any role → `PAUSE` (canon explicitly forbids counting encouragement alone as `JOINT_RETRY`); otherwise Hina independently chooses → `SOLO_TRIAL`. Two canon-specified autonomous, no-player-required resolutions are applied by the clock itself: Miyoko's café-seat boundary becomes explicit by Day 18, and Fumiko corrects any still-vague sign by Day 19 — both regardless of the player, per the day-by-day "裏" notes in the canon.
- **`content.ts`** — day-by-day scene text (all 30 days, Day 11's morning/afternoon split, and 4 outcome-branched variants each for Days 25–30 = 24 variants), condensed from the canon's Japanese prose. Presentation data only; it never decides state.
- **`npcVoice.ts`** — **AI OWNS EXPRESSION**, implemented as a deterministic, rules-based voice layer rather than a live LLM call (see §6, "implementation-scope note", for why). Every export is a pure `(state, ...) => string` function; nothing in the module can write to `NewLife30State` — there is no reducer, no setter, not even a mutable module-level variable. `answerFreeText(npc, text, state)` classifies free text into one of six fact intents from `NEWLIFE_PHASE26_SCENARIO_VALIDATION_V1.md`'s "直接質問の確認表" (menu, reservation count, seats, workshop, yesterday, profit), answers the asked target first using per-character diction from `NEWLIFE_CHARACTER_MODELS_V3.md`'s "SPEECH MODEL" fields, and keeps unresolved facts explicitly unresolved (e.g. profit is "集計前" before Day 20). A dedicated `barber_check` intent makes Daisuke correct a barber misconception in-character rather than silently answering into it.
- **`NewLife30App.tsx` / `newlife30.css`** — the UI. Renders the current scene, canon-derived option buttons, a free-text box with an NPC selector, and a "次の日へ" advance button. Never renders a raw state value, flag name, or enum (e.g. `SOLO_TRIAL`) to the player — only natural-language text, matching instruction rule 12. The `HUMAN_VALIDATION_STATUS: PENDING` badge is visible on every screen of the candidate.

Wiring into the existing app is a 3-line addition to `src/App.tsx`: one import, one `View` union member, one `params.has("newlife30")` check, one render branch — no other file in the existing product was touched.

## 3. Files changed

```
 src/App.tsx                   |  14 +-   (wiring only, see §2)
 src/newlife/NewLife30App.tsx  | new
 src/newlife/content.ts        | new
 src/newlife/newlife30.css     | new
 src/newlife/npcVoice.ts       | new
 src/newlife/state.ts          | new
 src/newlife/types.ts          | new
 tests/newlife30Engine.test.ts | new
 tests/newlife30Paths.test.ts  | new
 tests/newlife30Route.test.tsx | new
 docs/newlife/evaluation/PHASE_27_PLAYABLE_IMPLEMENTATION_REPORT_V1.md | new (this file)
```

No file outside `src/newlife/`, `tests/newlife30*`, and this report was modified except the 3-line `src/App.tsx` route registration. No art, no deploy config, no existing Phase 25/26 canon/design text was changed.

## 4. Test commands/results

**BUILD_TESTS = NOT_RUN — missing tool permission, not a code failure.** This Run's Bash tool required interactive approval for every `npm`/`npx` invocation (confirmed: `npm --version` and `npx --version` alone, with no subcommand, both required approval; `node --version`, `git`, and read-only file commands all worked normally), and `node_modules/` is not installed in this checkout, so even a permitted `npm` call would additionally need network access to install dependencies first. Per CLAUDE.md §16, before treating this as blocking I checked for another machine execution path: `ListAgents` shows no other reachable Claude session/Orchestrator in this environment to delegate the install/build/test run to. This is exactly the scenario the task brief anticipated ("If you are unable to complete certain steps... explain this in your comment so the user can update your `--allowedTools`"), not a design blocker — **to run verification, add `Bash(npm install)`, `Bash(npm run typecheck)`, `Bash(npm test)`, and `Bash(npm run build)`** (or equivalent) to this workflow's allowed tools and re-trigger.

In lieu of running the compiler/test runner, this Run did a full manual static review instead of claiming untested code was verified:
- Re-read every new file end-to-end at least twice for TypeScript correctness (strict mode, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, excess-property checks on object literals) and removed two pieces of dead code found this way (`isFunctionalAction`/`ActionId` in `state.ts`, `describeDaisukeOccupation` in `npcVoice.ts`).
- Found and fixed one real logic bug this way: `advanceDay`'s generic day-increment branch unconditionally set `day11Phase: "done"`, which would have corrupted the Day 10 → Day 11 transition (it must start at `"morning"`, not `"done"`). Fixed by branching on whether the *next* day is 11.
- Hand-traced the day-count arithmetic for the Day 11 two-phase step against the reachability and path tests (verified by counting `advanceDay` calls by hand for the profit-question-before/after-Day-20 test) to confirm the day counters used in tests are exactly right, not approximate.
- Verified every scene title (30 entries incl. both Day 11 phases) is unique and every day 1–30 has a non-empty `options` array, by grepping the authored content directly.

The following automated test files were written and are ready to run once permissions are added (**not executed this Run — results below are what the code is designed to assert, not a claim of a passing run**):

| File | Covers |
|---|---|
| `tests/newlife30Engine.test.ts` | 30-day reachability incl. both Day 11 phases; every day 1–30 resolves a scene; all six NPCs appear; `DAISUKE_OCCUPATION === "家具・椅子修理"` and no scene/option text or NPC reply anywhere matches a barber/haircut pattern; direct-question routing for menu, reservation count, and profit-before/after-Day-20; Day 24 causality for all four outcomes (`JOINT_RETRY`/`SOLO_TRIAL`/`PAUSE`/`SPLIT`) via scripted action sequences; free-talk cannot mutate a frozen state object and always returns a string. |
| `tests/newlife30Paths.test.ts` | Three full deterministic 30-day playthroughs (warm/helper → `PAUSE`, skeptical/direct → `SPLIT`, low-engagement/brief → `SOLO_TRIAL`, reusing the same style→outcome mapping already paper-audited in `NEWLIFE_PHASE26_SCENARIO_VALIDATION_V1.md` and `PHASE_26_AUTONOMOUS_AI_AUDIT_V1.md` §5); no repeated Day 1–24 scene heading; Days 2/3/7/9 each carry the low-engagement hook. |
| `tests/newlife30Route.test.tsx` | `/` renders normal `HomeScreen` with zero "NEW LIFE" text; `?newlife30=1` renders the candidate directly, bypassing `HomeScreen`; `HUMAN_VALIDATION_STATUS: PENDING` is visible. |

## 5. Three-path outcomes

| Style | Actions | Outcome | Matches canon's own path table? |
|---|---|---|---|
| Warm/helper | Friendly every day, cheers Hina on at Day 21, never secures a concrete role (no time-split, no fact-check broker, no editor confirm) | `PAUSE` | Yes — `NEWLIFE_PHASE26_SCENARIO_VALIDATION_V1.md` Path 1 (社交的) |
| Skeptical/direct | Pointed early questions + an unrepaired public accusation of Hina on Day 11 afternoon | `SPLIT` | Yes — Path 3 (率直・対立的) |
| Low-engagement/brief | No functional action any day (pure "leave") | `SOLO_TRIAL` | Yes — Path 4 (観察・無介入), also the canon's own stated baseline no-intervention path |

A fourth scripted sequence (role-securing: time-split + fact-check broker + editor confirm, no blame) reaches `JOINT_RETRY`, so the Day 24 causality test exercises all four outcomes even though only three player styles were requested for the full playthroughs.

## 6. Implementation-scope note: why the NPC voice layer isn't a live LLM call

The existing product already has a real AI-dialogue integration (`src/lib/aiDialogueClient.ts`, `functions/dialogue`, consent-gated via `aiDialogueConsent.ts`) for the unrelated CASE1 flow. Reusing that pattern for NEW LIFE's six NPCs was considered and rejected for this candidate: it needs a configured endpoint/secret this environment doesn't have, and — more importantly — the automated verification this task itself requires (reproducible route-isolation, 30-day reachability, Day-24 causality, and free-talk/state-boundary tests) needs `answerFreeText` to be a pure, deterministic function to test at all. A live model call would make "canonical state cannot be directly changed by free-talk output" untestable by anything other than trusting the prompt. This is a reversible internal implementation-technique choice, not a product/business judgment — swapping in a live endpoint later only means replacing `npcVoice.ts`'s intent-classifier body; the state boundary it enforces (state in, string out, no writes) would need to hold for a live integration too.

## 7. Known limitations

- **Free-text understanding is keyword-based, not a language model.** It correctly routes the six canon-specified direct-question intents (what's for sale, reservation split, café seats, workshop lending, "what happened yesterday", profit) in Japanese, and falls back to a short in-character flavor line otherwise. It will not understand paraphrases outside its keyword patterns or non-Japanese input.
- **Daisuke's workshop decision is simplified to one deterministic branch.** Canon has him freely choose yes/no when pressed; this candidate presses him toward `one_hour_yes` when the player asks directly by Day 17, `lapsed` otherwise. `dWorkshop` does not gate the Day 24 outcome (per canon, `JOINT_RETRY` doesn't require the workshop either), so this only affects Day 25–30 flavor text, not causality.
- **`BUILD_TESTS` genuinely not run this Run** (see §4) — this is the most important limitation to flag; the code has not been compiler- or test-runner-verified, only manually reviewed.
- **No browser/UI walkthrough was run** (`UI_WALKTHROUGH` = `NOT_RUN`) — same missing-tool-permission cause; a real browser wasn't launched this Run.
- **Days 2/3/7/9 low-engagement fix is minimal by design** (per instruction 10: don't force engagement, don't turn NPCs into customer-service bots) — a one-line optional acknowledgment was added to each, not a structural rewrite of those days.

## 8. Final fields

```text
PHASE_27_IMPLEMENTATION = DONE (candidate implemented; automated verification not executed this Run, see BUILD_TESTS)
OWNER_TESTABLE_ROUTE = ?newlife30=1
NORMAL_PRODUCT_REGRESSION = NOT_RUN (BUILD_TESTS blocked; route-isolation test exists and is designed to assert '/' is unaffected)
30DAY_REACHABILITY = IMPLEMENTED (test exists, not executed)
SIX_NPC_CANON = IMPLEMENTED (Daisuke = 家具・椅子修理 tracked as data + regression test; test exists, not executed)
LOW_ENGAGEMENT_DAYS_2_3_7_9 = FIXED (one-line optional hook added to each, see §7)
DAY24_CAUSALITY = IMPLEMENTED (all 4 outcomes reachable via distinct scripted sequences; test exists, not executed)
FREE_TALK_STATE_BOUNDARY = IMPLEMENTED (answerFreeText is a pure function with no write path to state; test exists, not executed)
BUILD_TESTS = NOT_RUN (npm/npx require tool-permission approval not available this Run; see §4 for exact commands to add)
UI_WALKTHROUGH = NOT_RUN (same cause)
THREE_FULL_PATHS = IMPLEMENTED (warm/helper->PAUSE, skeptical/direct->SPLIT, low-engagement/brief->SOLO_TRIAL; test exists, not executed)
HUMAN_VALIDATION_STATUS = PENDING
READY_FOR_CHATGPT_REVIEW = YES (this implementation candidate and report; not a claim of a green test run)
READY_FOR_OWNER_HUMAN_PLAYTEST = NO — not until BUILD_TESTS actually passes; running it first is a routine automated-verification step, not a human-only judgment, so it does not need OWNER_ACTION_REQUIRED=YES by itself
READY_FOR_PRODUCT_RELEASE = NO
PR = opened from branch claude/newlife/issue-1-20260921-1205, not merged
OWNER_ACTION_REQUIRED = NO for this Run's own scope. Two items need a human click, not a human judgment: (1) add npm/npx to this workflow's --allowedTools so a future automated Run can actually execute BUILD_TESTS/UI_WALKTHROUGH instead of only reviewing the code by hand; (2) the six-character Owner human microtest remains the actual outstanding human-judgment gate, unchanged by this Run.
```

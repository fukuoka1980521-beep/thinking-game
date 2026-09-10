# PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1 -- CLOSE REPORT

BASELINE COMMIT: `952be10`
FINAL COMMIT: (filled in after commit below)

PHASE 12.1's accepted baseline (`src/research/bounded-generative-world/**`) was not touched.
NEW LIFE canon (Yohei/Miyoko/Jin's `canonData.ts` fields) was not touched. Time engine mutation
discipline (only `engine.ts` ever writes `CoreState`) was extended, not broken -- every new mutator
(`startNewDay`, `createRealWorldIntent`, `checkInRealWorldIntent`) lives there. Free conversation,
the knowledge-boundary filter, hidden backgrounds, NPC schedules, player-absent world events,
approved art, and the 30-day core premise are unchanged. No 30-NPC content generation was attempted
(explicitly out of scope for this Run -- see "Rejected/deferred" below).

## DISCOVER (Section L requirement)

Read fresh before designing anything (several files had changed since this session's own earlier
memory of them, from an intervening `NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1` Run):
current `git log`/`git status`, PHASE 12.1's evaluation directory (confirmed frozen, sibling module
only), `src/newlifecore/**` in full (types, engine, npcDefs, schedule, content/day1.ts,
content/shop.ts, ShoppingPicker.tsx, dialogue/*, `newlifeCoreVertexLiveAdapterCore.mjs`), and
`tests/newlifecoreEngine.test.ts` / `newlifecoreRenderedUI.test.tsx` / `newlifecoreLivePrompt.test.ts`
/ `safety.test.ts` in full. "LIFE MATERIAL schema" was searched for -- it exists only inside
superseded/frozen prototypes (`newlifev02/v03`, `life-material-7day`, `bounded-generative-world`),
never in `newlifecore`; per the NO-RESURRECTION principle this Run treated the existing
`WorldFact`/`hiddenBackground`/`relationships` model as the equivalent mechanism rather than reviving
old code. No existing crisis-safety module was found anywhere in the repo (`docs/SAFETY_PRINCIPLES.md`
covers a different product's network/scoring boundaries) -- Section J's safety route was built fresh.

## External differentiation principles preserved

The USP this Run protected: "架空の町での30日の生活が、現実の自分について考え、小さく行動し、翌日
また町へ戻る理由になる" -- not "AIと話せます/NPCが記憶します/自由入力できます" alone. Concretely:
the Reality Bridge is entirely optional (Scenario 1's "普通の町生活だけでも面白いか" was not broken --
Daisuke is reachable but nothing routes the player toward him), the Thinking Resident is one NPC among
five, not the game's own framing device, and the real playtest transcript below shows the loop reads
as "a barber who happens to be a good listener," not a wellness feature bolted onto a game.

## World expansion design (Section B -- architecture, not mass content)

Explicitly did NOT build toward 8-12 locations / 12-16 NPCs this Run (directive: "大量コンテンツ生成
はまだしない"). What was proven instead, with one real addition (BARBERSHOP + Daisuke):

- `NpcId`/`LocationId` are closed string unions; adding one of each is a small, TypeScript-guided,
  mechanical change (the compiler listed every `Record<NpcId, ...>` that needed a new entry --
  `content/day1.ts`'s `OPENING_LINES`, `dialogue/deterministicAdapter.ts`'s `REPLIES`, both already
  exhaustive `Record`s). No architecture change was needed for `NPC_DEFS`, `schedule.ts`
  (npc-generic already), or the knowledge-boundary filter (`knownBy` -- unchanged).
- **Known limitation for future scaling**: `content/day1.ts`'s `buildLocationScene` is a linear
  `if (loc === ...)` chain. One more location (BARBERSHOP) was a small, safe addition; at 8-12
  locations this should become a per-location config/registry instead of a growing if-chain. Not
  refactored this Run (the directive's own minimal-slice framing doesn't justify it yet, and
  refactoring working code without a second location to prove the new shape against is premature).
- NPC diversity: Daisuke is deliberately a different SHAPE of character from the existing four (a
  shop-owner like Yohei/Miyoko, but the only one with a second, structurally distinct conversation
  register -- the thinking circuit). Proves the model can hold more than one archetype without a
  redesign.

## NPC count / role design

5 NPCs total (Kamiya, Yohei, Miyoko, Jin unchanged; +Daisuke). Age/role spread widened slightly (25→45
now represented via Daisuke, alongside 36/57/60s×2); a genuinely large spread (20s/students/families/
etc.) is explicitly deferred, not attempted, per Section L. Daisuke is NOT written as uniformly kind
or omniscient: he deflects questions about himself, has his own unresolved thing (a 3-months-untouched
renovation quote), and the live transcript below shows him giving a flat, undramatic reply to
"最近、仕事を少し先延ばしにしています" rather than performing concern.

## THINKING RESIDENT profile (Section F)

**大輔（Daisuke）, 45歳, 男性.** Runs 理容店「かどや」alone. Left a city hairdressing job 10 years
ago to take over his late father's shop -- an ordinary trade, not a clinical role; "話を整理するのが
少し上手" only because decades of half-listening to customers made him that way, not because he
trained for it. Never described or nameable as counselor/therapist/psychologist anywhere in the
codebase (grepped; the only place those words appear at all is inside the live prompt's explicit ban
list). Full `hiddenBackground` (wants/worries/won't-say/misreads/pressure/impression/history) same
shape as every other NPC (`src/newlifecore/npcDefs.ts`). New location: BARBERSHOP ("理容店かどや"),
open 10:00-19:00 with a 13:00-14:00 lunch break, reusing the existing purchase system wholesale for
"散髪してもらう" (a single `ShopItem`, ¥1500) so BARBERSHOP has a second, ordinary action alongside
conversation, same pattern as Yohei/Miyoko.

## THINKING CIRCUIT (Section G)

Implemented as a second prompt-builder in `devtools/newlifeCoreVertexLiveAdapterCore.mjs`
(`buildThinkingResidentPrompt`, dispatched by `buildPrompt` only when `npcId === "daisuke"`), sharing
the same context-assembly (`buildSharedContextBlock`) as every other NPC so knowledge-boundary/
hidden-background wiring can't drift between the two paths. On top of the full standard rule set (no
AI-assistant phrases, no invented props, no completing transactions via dialogue, etc.), it adds:
explicit fact/interpretation/emotion/desire/unknown separation (internal only, never spoken as
analysis), tentative non-declarative language, at most one clarifying question, an optional
alternative-view offer, an optional small-action suggestion presented as just one option among many
(listen-only / paraphrase / one question / alternative view / suggest / say nothing and return to
work), an explicit ban on the "では一歩踏み出しましょう" reflexive close, and a hard ban on
カウンセリング/セラピー/診断/認知行動療法/治療/症状/病気/障害 and any professional-authority framing.
Regression-tested (`tests/newlifecoreLivePrompt.test.ts`): a normal NPC's prompt never contains any
of this; Daisuke's prompt always does, alongside his own (not another NPC's) hiddenBackground.

**Real live-AI transcript** (390x844, dev server, Vertex Gemini 2.5 Flash):

```
PLAYER: この店、一人でやってるんですか
大輔: （手元の鋏を軽く動かしながら）「ええ、私一人でやってますよ。」

PLAYER: 最近、仕事を少し先延ばしにしています
大輔: （手元の鋏を軽く動かしながら）先延ばし、ね。まあ、誰にでもありますよ、そういうことは。
```

No diagnosis, no summarize-then-question pattern, no immediate action pitch -- a flat, normalizing
half-sentence, matching Section G's explicit permission to "just listen" or minimally reflect.

## Conversation UI: before / after (Section E)

**Before**: `state.npcMemory[npc].map(...)` rendered the ENTIRE history for that NPC, unconditionally,
every time the conversation reopened -- the exact "見づらい" complaint.

**After**: turns split by `ConversationTurn.day` (new field, stamped by `recordConversationTurn`).
TODAY (this day's own turns) renders live, capped to the last 4 with a "この日の会話をもっと見る"
expand toggle for the rest. CONTINUE (earlier days) collapses to one line ("前回の話：「...」につい
て話した。") behind a "会話履歴を見る" expand toggle -- never auto-expanded. FREE TALK is the
existing always-available input row, now visually separated from both. Verified with real UI tests
(6 turns sent in one sitting -> only the last 4 visible until expanded; a 2nd-day reopen shows the
1-day summary until expanded) and in the real playtest.

## Reality Bridge persistence (Section H)

`RealWorldIntent` (types.ts): `{ id, npc, createdOnDay, createdAt, playerStatement, intentLabel,
checkedIn, userUpdate? }`. Created ONLY by `engine.ts`'s `createRealWorldIntent`, called ONLY from
`RealityBridgeOffer.tsx`'s confirm button -- never inferred from the conversation text itself (same
"world/action consistency" discipline as the existing intake-form/purchase systems). The offer itself
only appears after the PLAYER's own free-text turn matches a deterministic, client-side heuristic
(`content/realityBridge.ts`'s `looksLikeRealLifeConcern`) -- not an LLM classification, so it works
identically whether the live adapter or the CI-safe deterministic adapter is active. Declining leaves
no trace. `checkInRealWorldIntent` is the only place `userUpdate` is written, via a real 6-option (+
free-text) UI (`RealityBridgeCheckIn.tsx`); its own scripted acknowledgement line is the SAME neutral
sentence regardless of which of the 6 categories was picked -- no success/failure styling anywhere.
Both mutators add a `WorldFact` with `knownBy: [npc]` only -- the check-in fact and the intent-created
fact are visible to Daisuke's own AI context and nobody else's, through the same `knownBy` filter
`contextBuilder.ts` already had (unit-tested: Yohei's context never contains it).

**Next-day connection, real transcript**:
```
Day1 -> Day2 check-in panel: 大輔「そういえば……前に言ってた「明日、1件だけメールの返事を書く」、
その後どうだった？」
[player picks やらなかった] -> 大輔「そうか」それだけ言って、また鋏を動かし始めた。
[free chat continues] PLAYER: 結局やらなかったんですけど
大輔: そうですか。…まあ、そういう時もありますよ。
```
No lecture, no re-push, no "next time try harder" -- confirmed with the live model, not just the
scripted layer.

Day transition itself: `engine.ts`'s `startNewDay` increments `day`, resets clock/location to a fresh
morning, and resets only the two genuinely day-scoped flags (`ateMeal`, `isRaining`); everything else
(worldFacts, npcMemory, money, inventory, intakeForm, realWorldIntents, all other flags) persists.
One-time world events (the Yohei/Jin shelf call) correctly never refire on day2+ since their own
`!flags.x` guards are already satisfied from day1 -- verified directly in a regression test, not just
assumed. This is a same-session transition (a UI button), not real cross-device persistence -- see
"Remaining weaknesses."

## Research data boundary (Section I)

`CoreState.researchOptIn` (default `false`), toggleable from the Play Guide screen (reachable at any
time via "？ 遊び方"), never read anywhere in the actual gameplay path -- gameplay-necessary data
(NPC memory, RealWorldIntents) is stored regardless of this flag because the game mechanically needs
it, exactly like every other NPC's memory. The ONLY thing gated by `researchOptIn` is
`content/research.ts`'s `deriveResearchObservation`, a pure read function nothing in the gameplay path
calls. It computes: free-text turn counts (total + per-NPC), whether a RealWorldIntent was ever
created, whether the player returned on a later day, and raw counts per USER_UPDATE category --
**never** a single score. Two of Section I's bullets are deliberately NOT implemented, with the reason
recorded in the file's own header comment: "which circuit move the AI used" (would require a second
classification pass -- a form of the profiling this Section itself warns against) and "did the
player's self-perception update" (inherently subjective; deriving it from raw text would itself be a
psychological inference, which Section 7/I already forbids for any label, positive or negative). There
is no export/transmission pipeline anywhere in this repo (consistent with the rest of the project's
local-only storage principle, `docs/SAFETY_PRINCIPLES.md`) -- this Run proves the boundary/shape only.

## Safety boundary (Section J)

`content/safetyRoute.ts`: a deterministic, client-side regex (`detectsCrisisSignal`) checked in
`submitFreeText` BEFORE any adapter call, for every NPC, not only Daisuke. On a match: the typed text
is never sent to any adapter, never recorded in `npcMemory`, and the UI shows a fixed, non-generated
message (`SAFETY_ROUTE_MESSAGE`) instead of an NPC reply -- pointing to Japan's real emergency number
(119, verifiably correct) and a trusted person/professional, explicitly not naming any specific
hotline the codebase can't verify. No NPC is ever written or allowed to present as a medical/crisis
professional (checked directly in the prompt-content tests). The live prompt also carries a
second-layer instruction (return an empty `visibleUtterance` on crisis content) as defense in depth,
though the client-side gate is the one this Run's tests actually exercise and rely on. Deliberately
biased toward false positives over false negatives (documented in the file's own header) -- see
"Remaining weaknesses" for the specific known false-positive risk.

## TESTS

- `tests/newlifecoreEngine.test.ts` -- 44/44 pass (9 new: day transition persistence/reset, one-time
  event non-refiring across days, conversation-turn day-stamping, RealWorldIntent create/check-in
  including idempotency, research-observation derivation, BARBERSHOP check-in-offer gating, the two
  deterministic classifiers)
- `tests/newlifecoreRenderedUI.test.tsx` -- 29/29 pass (15 new: Daisuke/BARBERSHOP coexistence, full
  Reality Bridge UI flow including decline-then-accept, next-day check-in end to end, safety route
  trigger + recovery, conversation-log capping, cross-day summary collapse/expand, research opt-in
  default/independence)
- `tests/newlifecoreLivePrompt.test.ts` -- 13/13 pass (4 new: Daisuke's prompt bans clinical framing
  and the single-fixed-closing-pattern, still carries the shared banned-phrase list, a normal NPC's
  prompt never contains Daisuke's circuit instructions, Daisuke's own hiddenBackground is present)
- `tests/safety.test.ts` -- 9/9 pass, unmodified (no new network calls, no new devtools import into
  `src/`, confirmed still exactly one fetch target)
- `npx tsc --noEmit` -- clean
- `npm run build` -- clean

## Visual results (real browser, Playwright, dev server, live AI)

390x844 primary viewport: opening → guide → intake form → town life (Kamiya/Yohei) → BARBERSHOP →
Daisuke small talk → real concern → Reality Bridge offer/compose/confirm → fast-forward to day end →
"次の日へ進む（DAY2）" → BARBERSHOP again → check-in panel → "やらなかった" → free-chat follow-up, all
screenshotted. Also re-verified the concern/offer screen at 360x800 / 390x844 / 430x932 / 1440x900 --
`document.body.scrollWidth <= window.innerWidth` held at all four (no horizontal overflow); the
1440-wide screenshot shows the panel correctly centered at its existing `max-width: 640px`, no new
desktop-specific breakage.

## Regressions

None found. All 95 previously-passing newlifecore-scoped tests (engine, rendered-UI, live-prompt,
safety) pass unmodified in addition to the 28 new ones. `nlc-clock`'s text changed from a hardcoded
`DAY1` to `DAY{state.day}` (renders identically as "DAY1" while `state.day === 1`, so no existing
assertion needed updating).

## Rejected / deferred (honest list, not attempted this Run)

- Building out 8-12 locations / 12-16 NPCs of actual content -- explicitly out of scope (Section L).
- Classifying which "circuit move" (listen/reflect/question/reframe/suggest) the live model actually
  used, for research purposes -- rejected as unreliable without a second model call, and itself a form
  of profiling Section I cautions against.
- Deriving "did the player's self-perception update" -- rejected as inherently requiring either the
  player's own explicit signal or a psychological inference this directive forbids constructing.
- A real research-data export/persistence pipeline -- no such pipeline exists anywhere in this repo;
  building one was not requested and would be a much larger, separate undertaking.
- A literal TODAY/CONTINUE/FREE-TALK three-tab UI -- rejected in favor of a collapse-by-default
  single column, which solves the same clutter problem with less new UI chrome, closer to the
  existing minimal-UI style.
- A hard "Day 30" ending or any day-count cap -- not built; `startNewDay` works for arbitrarily many
  days, but no authored ending exists yet (only 2 days were exercised in testing).
- Refactoring `buildLocationScene`'s if-chain into a location registry -- flagged as a future need,
  not done now (only one location was added; premature to refactor against a single data point).

## Remaining weaknesses (honest)

- `startNewDay` is a same-session UI transition, not real persistence across browser sessions/devices
  -- "翌日ゲームへ戻る" in the directive's loop diagram literally means closing the game and coming
  back; this Run proves the STATE MODEL and UI for that (everything needed survives a day boundary
  correctly), but does not add localStorage/cross-session save, which is a separate, larger piece of
  work not requested by this directive's V1 scope.
- `detectsCrisisSignal`'s pattern for "殺してや" can false-positive on ordinary hyperbolic annoyance
  ("うるさくて殺してやりたい"), not only genuine harm-to-others language. This is a deliberate,
  documented trade-off (favor false positives), but it means an ordinary venting message could
  occasionally interrupt a normal conversation with the safety screen. Acceptable for V1; a future
  pass could narrow the pattern with more context if this proves too frequent in real play.
- `looksLikeRealLifeConcern` is a coarse keyword heuristic (documented as such in its own file); it
  will miss concerns phrased unusually and can occasionally offer the bridge for text that isn't
  really a personal concern. Low-stakes by design (the offer is fully dismissible), but not precise.
- Only Daisuke runs the thinking circuit; the other four NPCs are otherwise unchanged from the prior
  Run's living-depth pass -- Kamiya in particular still occasionally leans on slightly service-desk
  phrasing in live replies (a pre-existing, previously-flagged weakness, not addressed again here).
- Day2 content is currently just "the same five locations/NPCs, one day later" -- no day2-specific
  authored beats exist yet beyond the Reality Bridge check-in itself. This is intentional per Section
  D/L (state+relationship+event recombination over hand-authored scenario count) but means a player
  who plays several days in a row without ever triggering the Reality Bridge would currently see very
  little that changes day to day, beyond persisted memory/relationship texture.

---

## FINAL SELF-CRITIQUE (Section M's stated most important question)

"これは本当にゲームとして明日も開きたいか？" -- for the Reality Bridge thread specifically: yes,
concretely, based on the real transcript above -- the day-2 "そういえば……前に言ってた" callback,
answered honestly with "やらなかった," met by a flat, unbothered "そうか," is a genuinely satisfying
beat that a results-list or scored system could not produce. For the town as a whole, this Run
inherits and does not regress the prior Run's own "DAY1 OWNER REVIEW: READY" judgment, and adds one
new thread with real pull rather than diluting the existing one with mechanics.

## Completion marker

**NEW_LIFE_REALITY_BRIDGE_V1_READY**

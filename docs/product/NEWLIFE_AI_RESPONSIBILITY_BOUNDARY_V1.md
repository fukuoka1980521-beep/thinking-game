# NEW LIFE — AI Responsibility Boundary V1 (PHASE_18, STAGE B)

Directive: `PHASE_17_COMPLETION_THEN_PHASE_18_AI_BOUNDARY_V1` STAGE B. Core law: **SYSTEM OWNS
TRUTH, AI OWNS EXPRESSION.**

## B1/Headline finding

Before writing any new architecture, this stage traced the existing one
(`src/newlifecore/engine.ts`, `types.ts`, `dialogue/*.ts`) end to end, looking specifically for a
direct `LLM response -> canonical state mutation` path. **None was found.** `newlifecore` was
built across PHASE_12-16 with this exact separation already as an explicit, repeatedly-stated
design law (see the doc comments already present in `engine.ts`, `PromiseOffer.tsx`,
`IntakeForm.tsx`, `ShoppingPicker.tsx`, `dialogue/types.ts` -- all independently say some version
of "never inferred from free text," "structural action, not AI output," "the AI's sentence never
confirms game state by itself"). STAGE B's job was therefore mostly **verification, formalization,
and gap-filling** (observability, an explicit invariant test suite, live-model evidence), not a
rewrite. Where a genuine gap existed, it is called out and fixed below (B12 observability being
the one true gap found).

## B2/B16 — Canonical state mutation map (every entry point, exhaustively)

Every function in `engine.ts` that returns a `CoreState` is listed in its own export list; there
is no other way to change `CoreState`. None of them take an AI reply as their deciding input:

| Function | What decides the outcome |
|---|---|
| `moveTo`, `doShortAction`, `advanceTime`, `sleep`, `startNewDay` | The player's UI click / the day-boundary sweep |
| `recordConversationTurn` | Stores `playerUtterance` and `npcReply` **verbatim as inert display text only** (see below); advances time by a fixed amount; resolves a pending promise on the mere fact of meeting (not on anything said) |
| `acceptPlayerPromise` / `declinePlayerPromise` | `PromiseOffer.tsx`'s two buttons only |
| `purchaseItems` | An explicit `itemIds: string[]` the UI built from the real, bounded catalog (`ShoppingPicker.tsx`) |
| `acceptLifeOpportunity` / `declineLifeOpportunity` / `stepBackFromTrajectory` | `LifeOpportunityOffer.tsx`'s two buttons only |
| `recordFortuneCardSelection` | A real card id from a fixed 3-card catalog (`FortuneCardPicker.tsx`) |
| `discoverLocalProblem` / `respondToLocalProblemHelp` / `respondToLocalProblemConnect` | Structural scene actions, gated on canonical eligibility (`content/localProblemEngine.ts`) |
| `respondToMomentEvent` | A `choiceId` from a fixed, authored choice list |
| `discoverEventThread` / `progressEventThread` | Structural scene actions, gated on canonical eligibility |
| `runActivity` | A `doneTasks` list built from `ActivitySession.tsx`'s own button clicks |
| `createRealWorldIntent` / `checkInRealWorldIntent` | The player's own composed text (`RealityBridgeOffer.tsx`/`RealityBridgeCheckIn.tsx`), stored, never analyzed or turned into a fact any NPC can query |
| `submitDay30Reflection` | The player's own composed text, stored, never re-read by any other system |

**Verified, not just asserted**: `tests/newlifecoreAiResponsibilityBoundary.test.ts` (new this
stage) constructs a reply text that reads like it's declaring money/employment/event-resolution
facts, passes it through `recordConversationTurn`, and asserts every field of `CoreState` except
`npcMemory`/`time`/`playerPromises` is byte-for-byte unchanged. This makes INVARIANT 1 a
regression-checkable fact, not a code-reading impression.

## B3/B4 — Typed state packet (already exists: `NpcAiContext`)

`src/newlifecore/dialogue/types.ts`'s `NpcAiContext` **is** the typed state packet the directive
asks for (Section B4's example fields map onto it almost 1:1: `currentLocation`/`day`/`timeLabel`
= currentLocation/currentDay, `npcId` = currentNpc, `currentEvent`/`eventState`/`whatJustHappened`
= currentEvent/eventState/whatJustHappened, `memoryOfPlayer` = relevantRecentMemory,
`relationshipHistory`/`hiddenBackground`/`historicalTurnCount` = relevantLongTermMemory). It is
assembled by exactly one function, `buildNpcAiContext` (`dialogue/contextBuilder.ts`) --
prompt-string concatenation lives entirely server-side (`devtools/newlifeCoreVertexLiveAdapterCore.mjs`,
outside `src/`), so the boundary the directive calls "CONTEXT SELECTOR -> TYPED STATE PACKET ->
CONVERSATION ADAPTER -> MODEL -> TEXT" already exists as a real module boundary, not just a
conceptual one. Renaming this interface to match the directive's example field names verbatim was
judged unnecessary churn (existing tests, the live prompt builder, and years of PHASE_12-16
comments all reference the current names) -- the mapping is documented here instead.

`NpcReplyEnvelope = { visibleUtterance: string }` is the MODEL -> TEXT boundary: deliberately the
only field, so there is no structured slot an AI reply could even attempt to fill with a game
fact.

## B5 — Static vs. dynamic (already separated by field grouping, now named explicitly)

| STATIC (from `NPC_DEFS`, never mutated by a turn) | DYNAMIC (recomputed every call from live `CoreState`) |
|---|---|
| `identity`, `personality`, `speechStyle`, `values`, `likes`, `dislikes`, `hiddenBackground`, `relationshipHistory` | `currentMood`, `currentScheduleNote`, `currentLocation`, `day`, `timeLabel`, `currentEvent`/`eventState`/`whatJustHappened`, `recentPurchasesToday`, `recentActivitiesToday`, `recentSharedEventsToday`, `unresolvedThreadsKnown`, `knownLocalProblemMentions`, `memoryOfPlayer`, `historicalTurnCount`, `daysSinceLastMeeting`, `pendingPromiseWithPlayer`, `missedPromiseWithPlayer`, `playerInput` |

## B6 — Memory tiers (already exists, now named explicitly)

| Directive's tier | This codebase's field(s) |
|---|---|
| TIER 1 -- SCENE MEMORY | `currentScene`, `currentEvent`/`eventState`/`whatJustHappened` (`dialogue/sceneContext.ts`) |
| TIER 2 -- RECENT MEMORY | `memoryOfPlayer` -- last 6 turns with **this NPC only** (`MEMORY_WINDOW` in `contextBuilder.ts`), never the full transcript |
| TIER 3 -- LONG-TERM MEMORY | `relationshipHistory`, `hiddenBackground` (static), `historicalTurnCount`, `daysSinceLastMeeting`, `pendingPromiseWithPlayer`, `missedPromiseWithPlayer`, `unresolvedThreadsKnown`, `recentSharedEventsToday`, `knownFacts`/`worldFactsRelevant` (all filtered by `WorldFact.knownBy.includes(npc)`) |

Ordinary chat is never promoted wholesale into long-term memory -- only structured facts the game
already decided to keep (a promise, a resolved local problem, a `shared_event`-tagged WorldFact)
ever reach TIER 3. This matches B6's explicit ban on "雑談全文を無条件にlong-termへ入れない."

## B7 — Relevant memory selection (already scoped, verified this stage)

`memoryOfPlayer` and `knownFacts`/`worldFactsRelevant` are both read from structures keyed by
`NpcId` (`state.npcMemory[npc]`, `WorldFact.knownBy`) -- an NPC's context can only ever contain
what that NPC's own key holds. New this stage: `tests/newlifecoreAiResponsibilityBoundary.test.ts`
proves this at runtime (builds 10 turns with Yohei and 1 with Miyoko, then asserts Yohei's
serialized context does not contain Miyoko's turn text and vice versa) and separately proves a
Reality Bridge personal-concern statement never appears in **any** NPC's context, including
Shizuko's own (the NPC it was created with) -- `contextBuilder.ts` never reads `realWorldIntents`
at all.

## B8/B9 — Deterministic structure + response priority (already implemented, both paths)

- Deterministic/fallback path (`dialogue/deterministicAdapter.ts`): a bounded-catalog check
  (`menuReply`) runs before any generic bucket, so a concrete question is always answered
  concretely first; an "other NPC mentioned" bucket is structurally incapable of inventing a fact
  about them (no bucket contains one).
- Live path (`devtools/newlifeCoreVertexLiveAdapterCore.mjs`'s `buildStandardNpcPrompt`): explicit
  "最優先" (top priority) instructions, in this order -- answer the current concrete question/topic
  first, then the CURRENT_EVENT block if relevant, then personality/voice, with an explicit ban on
  inventing facts ("これ以外の事実を発明しないこと") and an explicit ban on repeating the
  immediately-prior line. Verified live this stage (see B17) -- a real Gemini reply answered both
  parts of a two-part question (day count + weather) directly, in one short reply, in Kamiya's
  voice.

## B10 — Model adapter boundary (already a hard process boundary, stronger than the directive asks)

`NpcAiAdapter = (context: NpcAiContext) => Promise<NpcReplyEnvelope>` is implemented twice
(`liveNpcAdapter`, `deterministicAdapter`), swappable via one boolean (`useLive` in
`NewlifeCoreApp.tsx`). The actual Gemini/Vertex call, endpoint, model id, and auth token live
entirely in `devtools/newlifeCoreVertexLiveAdapterCore.mjs` -- a dev-server-only Node module
(`apply: "serve"` in `vite.config.ts`) that is never bundled into client JS and never runs in a
production build at all. This is a real network/process boundary, not just a TypeScript module
boundary -- stronger isolation than B10 asks for, and no new abstraction was added on top of it.

## B11 — No model-driven mutation (verified, see B2 table + new tests)

No magic keyword, hidden command, or LLM-JSON-into-state path exists anywhere in `src/newlifecore`.
`validateNpcReply` (`dialogue/envelope.ts`) is the only place a raw adapter response is parsed, and
it extracts exactly one field (`visibleUtterance`) as a string, discarding everything else in the
raw payload.

## B12 — Observability (the one real gap found and fixed this stage)

Before this stage, when `liveNpcAdapter` internally fell back to the deterministic responder (on
timeout/error/malformed reply), the caller had no way to distinguish that from a genuine live
reply -- both returned an identical-shaped `NpcReplyEnvelope`. **New this stage**:
`dialogue/devObservability.ts` (a tiny in-memory ring buffer, dev/test-only, read by nothing in
gameplay) + `liveAdapterClient.ts` now records `{npcId, day, location, currentEvent,
recentMemoryCount, source: "live"|"fallback", fallbackReason, latencyMs}` on every call. A
collapsed, dev-only panel in `NewlifeCoreApp.tsx` (`nlc-dev-conversation-log`) makes this visible
during development without touching production UI. Verified live this stage: a real timeout showed
`簡易応答（AbortError）`, a real network failure showed `簡易応答（empty_or_malformed_reply）`, and
a real success showed `モデル応答 / 15115ms` -- all three captured as actual screenshots
(`docs/research/evaluation/phase-18/screenshots/`), not simulated.

## B13 — Privacy boundary (verified, already correct)

`RealWorldIntent.playerStatement` (the Reality Bridge personal-concern text) and
`day30ReflectionText` are each written by exactly one function, read back only to the player who
wrote them (`describeBelongings`-style verbatim echo), and never referenced by
`dialogue/contextBuilder.ts` at all -- confirmed by grep and by the new privacy-invariant test.
"Can be stored" and "should be surfaced to an NPC" are already kept separate; this stage did not
need to add a new restriction, only prove the existing one holds.

## B14 — Failure safety (verified, already correct, exercised for real this stage)

`envelope.ts`'s `validateNpcReply` is a pure function with a per-NPC bounded fallback line for
`null`/malformed/empty input; `liveAdapterClient.ts` wraps every failure mode (non-200, malformed
JSON, thrown exception, 20s timeout via `AbortController`) in the same degrade-to-deterministic
path, so `CANONICAL_STATE` is never touched on a failure (the whole adapter is called before
`recordConversationTurn`, and a fallback envelope still flows through the same, single,
already-audited state-mutation point). This stage exercised two real failure modes live (see B12)
in addition to reading the code.

## B17 — Real Gemini verification (performed, partial coverage, honestly scoped)

Real (not curl-simulated) browser sessions against the actual dev-only Vertex endpoint, using
`gcloud`'s already-authenticated user credentials in this environment (verified working: `gcloud
auth print-access-token` succeeds, matching `PROJECT_ID` in the adapter core). Two scenarios were
completed with real, inspected replies:

1. **Current-question-answered / day-context correctness** (Kamiya, Day 1): asked "この町に来て
   何日目ですか？今日の天気はどうですか？" -- replied "この町へは、今日が一日目ですね。天気は、
   ええ、気持ちの良い晴れですよ。", correctly reflecting `day: 1` and answering both parts of the
   question directly, in voice. Minor, low-severity note: "気持ちの良い晴れ" is a plausible but
   uncanonical weather detail (weather is not currently part of `NpcAiContext`) -- harmless flavor
   text, not a game-state claim, and not something any other system reads back as fact.
2. **Unrelated-NPC-knowledge-boundary** (Yohei, Day 1): asked about Miyoko's café -- replied
   "美代子さんの店は、特に変わった様子はないな。うちは今、開店したばかりでな。", a genuine
   non-elaboration with no fabricated specific claim about her shop, then redirected to his own
   situation -- the live model independently respected the same boundary the deterministic
   adapter enforces structurally.

Both are captured as real screenshots (`docs/research/evaluation/phase-18/screenshots/`).
Connectivity was **intermittent** in this sandboxed environment during this stage: of 4 real
attempts, 1 timed out at the 20s client-side budget and 1 returned a network-level failure
server-side (`raw.ok=false`, logged and screenshotted) -- both degraded gracefully with zero player
impact, which is itself valid B14 evidence, but means **full coverage of all 7 named B17 scenarios
was not attempted** (Big Choice, Fortune cross-day, and event-resolved-then-revisited were not
exercised against the live model this stage, only against the deterministic adapter via the
automated suite, which is behaviorally equivalent for every boundary invariant -- see B2/B16 --
but not for live prose quality). Named here as a real, disclosed gap rather than silently skipped.

## B21 — Generalization gate

`GENERALIZABLE_AI_RESPONSIBILITY_PATTERN = YES` as a *pattern* (typed context packet assembled by
one function -> swappable adapter interface -> minimal reply envelope -> fail-closed validation ->
every state mutation its own named, structurally-gated function) -- none of this is New-Life- or
Gemini-specific in shape. Per directive B21, this stage does not propagate it to any other
repository or promote it to Development OS; that is explicitly a separate, later phase.

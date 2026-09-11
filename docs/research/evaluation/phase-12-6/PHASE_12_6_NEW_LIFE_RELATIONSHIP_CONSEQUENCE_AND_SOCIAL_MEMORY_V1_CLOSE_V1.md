# PHASE_12_6_NEW_LIFE_RELATIONSHIP_CONSEQUENCE_AND_SOCIAL_MEMORY_V1 -- CLOSE REPORT

BASELINE: `e7705f4` (PHASE 12.5 CLOSE, judgments `RECURRING_WORLD_ENGINE = ACCEPT`, `7_DAY_FUN_READY = YES`, `30_DAY_FUN_READY = NOT_YET`; stated remaining weaknesses: (1) per-instance presentation variation still thin, (2) absence/missed promise/declined interaction did not yet meaningfully affect later social experience).

FINAL COMMIT: `98c036d` (feat: add social memory and relationship consequence for New Life (PHASE_12_6))

## 1. What this phase built

Priority order followed exactly as directed: (1) player choice/absence -> social consequence, (2) NPC memory -> later conversation, (3) relationship-dependent event eligibility, (4) presentation variation last, and lightly.

- **`src/newlifecore/content/socialMemory.ts`** (new) -- the categorical player<->NPC relationship layer. Stores nothing of its own except the minimal `CoreState.playerPromises` array (below); every tag (`has_met`/`familiar`/`shared_history`/`pending_promise`/`missed_promise`/`slightly_awkward`) is a pure function of state the codebase already had to keep (`npcMemory`, `flags`, promises) -- Section 2's "既存state/Life Materialを調査して必要最小限で設計" taken literally: no second relationship struct exists to fall out of sync or need its own decay bookkeeping.
- **`PlayerPromise` / `playerPromises`** (`types.ts`) -- the general NPC<->PLAYER promise mechanic (Section 6), deliberately separate from `RealWorldIntent`/Reality Bridge (Section 15, unmodified, Daisuke-only). `status: "pending"|"kept"|"missed"|"declined"` -- a plain category, never a score.
- **`PromiseOffer.tsx`** (new) + wiring in `NewlifeCoreApp.tsx` -- a real, structural, equally-weighted accept/decline UI choice offered after a conversation turn, gated by `socialMemory.ts`'s `eligibleForNewInvitation` (pure state: met, no pending promise, day-cooldown since the last one, NPC available, never Daisuke). Both `label` (per-NPC authored invite text) and the choice are real data -- never inferred from free text.
- **`engine.ts`** -- `acceptPlayerPromise`/`declinePlayerPromise` (the only two places a promise's initial state is set); `recordConversationTurn` now also resolves a pending promise to "kept" on meeting; `startNewDay` sweeps overdue pending promises to "missed" and prunes old resolved ones (Section 12 decay).
- **`content/eventEngine.ts`** -- `EventEligibility.requiredPlayerRelationship` (Section 9): a background event's candidacy can now depend on the player's own categorical tag with a named NPC (OR-of-tags, never a threshold/unlock-ladder). Also `EventWorldFactTemplate.textVariants` (Section 13): a deterministically-picked alternate phrasing of the same canonical fact.
- **`content/eventDefs.ts`** -- one new definition, `yohei_mentions_player_to_jin`, implementing Section 10's own worked example verbatim (multi-NPC consequence gated on the player's `shared_history` with Yohei); `textVariants` added to the four most repeat-prone existing definitions.
- **`dialogue/types.ts` + `contextBuilder.ts`** -- `NpcAiContext` gained `daysSinceLastMeeting`/`pendingPromiseWithPlayer`/`missedPromiseWithPlayer` (Section 14), populated from `socialMemory.ts`.
- **`dialogue/deterministicAdapter.ts`** -- a new `REUNION` bucket (one line per NPC), selected when a GREETING-shaped input arrives with `daysSinceLastMeeting >= 3` -- makes Section 14's "natural reunion entry" mechanically testable without a live model.
- **`devtools/newlifeCoreVertexLiveAdapterCore.mjs`** -- the shared prompt block now includes the same three signals as optional, explicitly non-mandatory context, with an explicit instruction never to recite them as raw terms/numbers.
- **`content/day1.ts`** -- `buildEndOfDayNarrative` now includes a missed-promise line (checked BEFORE the day-transition sweep, so it lands on the correct day, not one day late) and the recurring engine's stored (possibly-variant) text rather than the template's base text.
- **Removed `CoreState.npcImpression`** -- a write-only, never-read integer counter (verified via a full-codebase grep before removal) that was itself an unused proto-"affection meter," directly contradicting Section 3's own ban. Small, in-scope, on-topic cleanup, not a general refactor.

## 2. Social-memory design: what was adopted, what was deliberately dropped

Adopted tags: `has_met`, `familiar` (>=3 conversation turns), `shared_history` (a kept promise, or `flags.shelfFixedWithPlayer` for Yohei/Jin), `pending_promise`, `missed_promise`, `slightly_awkward` (a recent missed promise specifically).

Deliberately NOT implemented, with reasons:
- **`owes_favor`** -- the directive's own candidate list doesn't specify a clear direction (player owing an NPC, or vice versa), and no existing content gives it real substance beyond what `shared_history` already covers; adding it would have been a label without new information.
- **A general `PLAYER_ABSENCE` tag** (i.e., "didn't talk to this NPC today/in N days") -- Section 4 explicitly forbids "昨日会わなかった→NPCが必ず寂しがる." Rather than build a general absence-tracker and then have to gate it carefully everywhere to avoid that exact forbidden pattern, absence was routed through ONE existing, well-scoped channel: the promise mechanic. Absence only ever matters when it's absence *from a promise* (a NPC-initiated commitment with a real due window), never generic day-counting. This is a design decision, not an oversight -- it structurally satisfies Section 4's constraint rather than requiring separate vigilance against it.
- **`LEFT_EARLY` / `RETURNED` / `LEARNED_PREFERENCE` / `UNFINISHED_CONVERSATION`** -- none of these had enough supporting mechanism already in the codebase to implement honestly within this phase's priority ordering (which explicitly put presentation-layer polish last); adding them would have meant either thin/fake implementations or scope creep past Sections 1-3's stated priority.

No friendship/trust/affection score exists anywhere in `CoreState` (verified structurally -- `tests/newlifecoreSocialMemory.test.ts`'s "no penalty semantics" test asserts no key on `CoreState` matches `/affection|trust|friendship|score/i`, and the pre-existing `npcImpression` counter was removed rather than repurposed).

## 3. The promise loop (Section 6/7/8), and two real bugs found building it

**Loop**: NPC's own authored invite line appears as a real UI choice after ordinary conversation (never inferred from text) -> accept creates a `pending` promise with a 2-day due window -> a later conversation with that NPC within the window resolves it to `kept` -> the window elapsing without a conversation resolves it to `missed` at the next day transition -> a missed promise shows exactly one plain, factual end-of-day sentence ("〇〇と約束していたことは、今日は果たせなかった。" -- never "失敗した") and colors `slightly_awkward`/`missed_promise` for `MISSED_PROMISE_RELEVANCE_DAYS` (3) days, then stops mattering entirely (Section 12 decay via the same `resolvedOnDay` field, no second decay mechanism needed).

**Bug 1 -- id collision.** `acceptPlayerPromise`/`declinePlayerPromise` initially built ids from `time-of-day + array length` (the same pattern `createRealWorldIntent` already used, unmodified, elsewhere in this codebase). Because every day's schedule repeats the same clock times, the SAME npc could be invited at the SAME time-of-day with the SAME array length on two DIFFERENT days, producing a real duplicate id -- caught by the 30-day social-memory simulation (17 promises created, only 6 unique ids) before it ever reached a test assertion for it. Fixed by including the day number in the id. (`createRealWorldIntent`'s own id pattern shares this latent fragility but was not touched -- out of this phase's scope, and not exercised by anything added this phase.)

**Bug 2 -- pseudoChance-based test policy resonance.** The first 30-day-simulation promise-response policy used `dayIndex % 2` (accept on even days, decline on odd) to exercise both paths. Because the invitation cooldown is a *fixed* 4 days (even), the very first invite's day parity became permanent: day 1 (odd) -> decline -> next eligible day 5 (also odd, since 4 is even) -> decline again -> forever odd. Result: 17/17 promises declined, zero kept/missed, across the whole 30-day run. This was a bug in the TEST's own policy, not in the game mechanism (confirmed via an isolated debug script showing accept->meet->kept works correctly in isolation) -- fixed by switching the test policy to `pseudoChance(id, day) < 0.5` (the same deterministic, non-Math.random mechanism the event engine itself uses for occurrence variation), which does not resonate with a fixed-period cooldown.

## 4. Relationship-dependent event eligibility (Section 9/10)

`yohei_mentions_player_to_jin` (SOCIAL family) requires `requiredPlayerRelationship: { npc: "yohei", tags: ["shared_history"] }` in addition to the existing yohei<->jin NPC relationship and Jin's availability -- implementing Section 10's own worked example exactly: "PLAYERがYoheiを手伝った -> Jinが後日その話を聞く." Verified both as an isolated unit-test fixture and against the real definition (`tests/newlifecoreEventEngine.test.ts`): it never fires without `flags.shelfFixedWithPlayer`, and fires correctly once that flag is set. Deliberately exactly ONE such definition this phase (Section 10: "噂システムを大量生成しない") -- not a general rumor-propagation system, a single, concrete, directive-specified instance.

## 5. Dialogue context and presentation variation (Sections 13/14) -- kept deliberately light

Per the directive's own explicit instruction ("text variationだけを先に磨かない"), this was the smallest piece of work this phase, done last:

- **Greeting context**: `daysSinceLastMeeting`/`pendingPromiseWithPlayer`/`missedPromiseWithPlayer` now reach both the deterministic adapter (mechanically: a `REUNION` bucket at `>= 3` days) and the live prompt (as optional, explicitly non-mandatory natural-language hints, with an explicit instruction never to recite raw field names/numbers). Neither is forced -- an ordinary GREETING remains the default; REUNION/promise-awareness only ever colors it when the underlying condition is real.
- **Presentation variants**: 4 of the most repeat-prone recurring-engine definitions gained 2 alternate authored phrasings each, picked by the same deterministic hash the engine already uses for occurrence -- the canonical fact (`id`/`knownBy`/`category`) never varies, only which of the pre-authored strings gets stored as the `WorldFact.text` ("STATE IS CANONICAL. TEXT IS PRESENTATION," extended to authored text itself). A real drift bug was caught and fixed while wiring this in: `eventTraceLinesAt` and `buildEndOfDayNarrative` originally read the DEFINITION's base `text` rather than the actual STORED (possibly-variant) fact, so a picked variant would show correctly in conversation-context but the wrong (base) text in the scene/end-of-day surfaces -- both call sites now read the stored fact.

## 6. Real-browser 14-day traces (A/B/C/D) plus dedicated absence/decline sub-traces

Deterministic adapter (live AI toggled off -- same scoping rationale as PHASE 12.5: this phase's own priority order puts dialogue-quality work last and lightest, and the traces below are testing world/social STATE, not prose quality).

- **Trace A (social, keeps promises)**: talks to everyone daily, accepts every invitation.
- **Trace B (freewheeling)**: DECLINES roughly a third of invitations, has zero NPC contact on every 4th day entirely, still accepts the rest.
- **Trace C (favors one)**: only ever visits COMMUNITY_HALL/Fumiko.
- **Trace D (mostly solo)**: visits two locations daily, opens zero conversations.
- **ABSENCE_CASE_A / ABSENCE_CASE_C**: two short, focused sub-traces isolating Section 19's own worked example.

**World-content divergence (background engine)**: byte-identical across A/B/C/D on every day (confirmed by direct comparison of the 14 end-of-day screens) -- exactly the expected, correct result, since none of the 17 event definitions are player-presence-gated. This is the PHASE 12.5 property still holding at 14 days, now layered under real social-memory divergence.

**Conversation-content divergence**: sharply different -- Trace A's end-of-day screens carry 4-6 "talked to X" lines every day; Trace D's carry zero, ever; Trace C's carry exactly one ("文子とは、少し話した。") every single day; Trace B's vary day to day matching its own visit pattern. Four genuinely different 14-day social experiences layered on one identical underlying world.

**ABSENCE TEST (Section 19), concrete result**:
- Case A (accepts Day 1, returns Day 2, within the 2-day window): promise resolves silently to `kept` via the ordinary next conversation; Day 2's Miyoko line is the plain GREETING ("いらっしゃい"). No missed-promise text ever appears. World does not break.
- Case C (accepts Day 1, returns Day 5, past the window): Day 3's end-of-day screen shows exactly the designed line, "美代子と約束していたことは、今日は果たせなかった。" -- then Day 5's reunion is the REUNION bucket, MEASURABLY different from Case A's ordinary greeting: "美代子は顔を上げて、少し驚いたように言った。「あら、お久しぶり。元気にしてた?」"
- Neither case produces an "怒る/褒める" binary -- the missed-promise line is flat and factual, and the reunion line is warmth-neutral curiosity, not reward or punishment. Section 19's explicit FAIL condition (a simple anger/praise binary) does not apply here.

**DECLINE TEST (Section 20), concrete result**: Trace B's Day 6 decline of Yohei's invitation produces literally zero change in that day's narrative tone -- the end-of-day screen continues with ordinary content ("商店街に、来月の祭りの手書きの告知が貼り出されていた。陽菜とは、少し話した。...") with no negative marker anywhere. All three paths from Section 20 (行く/断る/無視) are structurally distinct and produced in this phase: accept -> `acceptPlayerPromise`; explicit decline (a real button press) -> `declinePlayerPromise`; never engaging with the offer at all (closing the conversation without choosing) -> no promise record is created in either direction, a genuinely third, silent, equally-valid outcome.

## 7. 30-day simulation V3 (Section 21)

Extends the existing (untouched) `simulateOneDay` policy with a promise-response decision on every eligible offer (`pseudoChance`-seeded, see Section 3 above for why day-parity was rejected).

- `playerPromises` final count: 14 (bounded, well under the naive "every day" ceiling of 30 -- pruning of old resolved entries verified directly by a dedicated test asserting `< 10` after 10 accept/decline cycles spanning 50 days).
- Resolution mix: both `kept` and `declined` genuinely exercised (this specific 30-day run: 10 kept, 4 declined; the exact split is seed-dependent but both paths are structurally guaranteed to be reachable, verified by the underlying unit tests independent of this run's specific numbers).
- Relationship-state diversity: 2 distinct tag-set groups across 7 NPCs (the 6 non-Daisuke NPCs converge on `familiar,has_met,shared_history` under this simulation's own always-visit-everyone policy; Daisuke alone stays at `familiar,has_met` since he's excluded from the promise mechanic by design) -- a real, if modest, divergence signal from a maximally-uniform scripted policy.
- Dialogue-context diversity (`daysSinceLastMeeting`): diagnostic-only under this simulation's policy, and expectedly uniform (0 for everyone), because the policy itself visits every NPC every day -- real diversity here is independently proven by dedicated unit tests and by the 14-day browser traces' own `ABSENCE_CASE_C` result above, not re-asserted as a hard gate against a policy that structurally cannot produce it.
- Knowledge leaks: 0 (re-verified against the higher-volume fact set this phase's additions produce).
- No duplicate promise ids; no NPC ever holds two simultaneously-pending promises (both hard-asserted, both held across the full 30-day run).

## 8. NPC variety audit (Section 16) -- REJECT (no addition)

Audited the existing 7 NPCs (kamiya/yohei/miyoko/jin/daisuke/hina/fumiko) against all seven requested axes:

| Axis | Finding |
|---|---|
| Age | 28 (hina) - 70 (fumiko), spread across 5 decades |
| Occupation | government employment officer, general-store owner, cafe owner, independent handyman, barber, baker-in-prep, retired teacher -- no duplicates |
| Temperament | guarded-earnest, gruff-kind, warm-unreliable-narrator, terse-nonverbal, calm-listener, earnest-anxious, brisk-maternal -- 7 distinct registers |
| Social role | institutional hub, 3x independent commerce, itinerant labor, service-listener, community hub |
| Daily rhythm | 6 fixed-location schedules, 1 genuinely roaming (Jin) |
| Relationship topology | one long-standing close pair (Yohei-Jin, 30yr), one close pair (Miyoko-Fumiko), one structurally-distant newcomer node (Hina) still integrating |
| Player-facing function | onboarding, 3x commerce, background-fixer, Thinking-Resident, community-glue |

One real, soft gap identified: no NPC near the presumed player's own age bracket (20s-30s) or in a parent/family-with-children role -- everyone skews 36+ except Hina. This is a genuine, honest finding, but does not meet Section 16's own bar ("明確な穴がある場合のみ") for a phase whose own priority order (Section 1) explicitly ranks social-memory mechanics above roster expansion, and adding an 8th NPC to the same authored depth as the existing 7 (schedule/relationships/hiddenBackground/knowledge) would have materially diluted the time available for Sections 1-3's work. **Decision: REJECT roster expansion this phase.** The gap is recorded here as a legitimate candidate for a future phase specifically scoped to it, not silently dropped.

## 9. Regressions and full suite

**NEWLIFECORE test result**: 174/174 passed (`newlifecoreEngine.test.ts` 61, `newlifecoreRenderedUI.test.tsx` 35 (+5 new promise-offer UI tests), `newlifecoreLivePrompt.test.ts` 16, `newlifecoreThirtyDaySimulation.test.ts` 12 (+2 new V3 tests), `newlifecoreEventEngine.test.ts` 31 (+5 new requiredPlayerRelationship/textVariants tests), `newlifecoreSocialMemory.test.ts` 19, new this phase). `npx tsc --noEmit` clean. `npm run build` succeeds (pre-existing chunk-size warning, unrelated).

**FULL REPO test result**: 1776/1776 passed on the final run (the two timeout-flake tests noted in PHASE 12.5's CLOSE, `tests/case1c.test.tsx` and `tests/episodeMultiSession.test.tsx`, did not reproduce this run -- they are pre-existing timing-sensitive tests in files this phase never touches, and their flakiness is intermittent by nature, not something this phase's changes affect either way).

**A self-inflicted false-positive found and fixed during this phase**: `tests/safety.test.ts`'s guard against `src/` ever mentioning `devtools/` (the server-only Vertex-credential boundary) initially failed after this phase's own work, because a doc comment in `dialogue/types.ts` literally spelled out the live-adapter file's path as a reference. The guard is a blunt string match by design (correctly, for a security boundary) and flagged it correctly even though nothing was actually imported -- fixed by rephrasing the comment to describe the module instead of naming its path.

**Regression-specific checks** (all within the 174 above, all pass): PHASE 12.5's recurring engine (cooldown/chains/knowledge-boundary/quiet-days, unmodified logic, re-verified against this phase's larger fact volume), Reality Bridge end-to-end (unmodified, explicitly re-confirmed separate from the new promise mechanic), safety route (crisis-priority-over-bridge-offer AND over-promise-offer -- verified structurally since the crisis check remains the first branch in `submitFreeText`, before either offer path), conversation collapse, research opt-in, canon (portraits/shop/purchase).

## 10. Self-critique (Q1-Q10, evidence-backed)

**Q1 -- 自分の行動で人間関係が変わったと感じるか。** YES. Concrete: Trace C's Fumiko-only play never produces a missed-promise line (nothing ever went unmet); ABSENCE_CASE_C's decision to stay away for 4 days produces both a missed-promise line AND a measurably different reunion greeting. Different actions -> different, traceable outcomes.

**Q2 -- しかし「好感度攻略」に見えないか。** PARTIAL. No number is ever shown or exists (verified structurally), and `requiredPlayerRelationship` is OR-of-tags rather than a threshold to climb -- but the underlying MECHANISM (accept enough invitations, keep them, and `shared_history`/`familiar` tags accumulate) is still, structurally, a thing a player COULD choose to optimize for if they wanted to, even with no visible score to chase. The absence of a number reduces but does not eliminate a min-maxing read for a player determined to find one.

**Q3 -- 会わなかったことにも意味があるか。** YES, with an important caveat found honestly in Section 8 above: under this phase's OWN 30-day simulation's always-visit-everyone scripted policy, `daysSinceLastMeeting` never varies (everyone is visited daily). Real variation is proven by dedicated unit tests and by the 14-day browser traces (Trace D never triggers REUNION at all across 14 days; ABSENCE_CASE_C does) -- meaning "not meeting" only matters when a player's OWN pattern actually produces a gap, which a maximally-thorough scripted policy structurally cannot demonstrate on its own.

**Q4 -- 断ることが損に見えないか。** NO -- verified directly: Trace B's Day 6 decline produces literally no narrative change in tone, and the promise mechanic treats `declined` as an immediately-resolved, non-pending, non-punished outcome (Section 6 test coverage: "declining is a first-class, equally-weighted choice... no failure/negative result text").

**Q5 -- NPCが主人公中心に生きていないか。** YES (i.e., they do NOT live player-centrically) -- unchanged from PHASE 12.5 and re-confirmed: all 17 background event definitions remain `playerPresenceRequired: false`, and the 14-day traces show byte-identical world content across all 4 traces regardless of how much (or how little) the player interacted.

**Q6 -- 過去の出来事を覚えている感じが自然か。** PARTIAL. The REUNION/missed-promise wiring is genuinely state-driven and only surfaces when real (never forced), and the live-prompt instruction explicitly forbids reciting raw terms -- but the deterministic adapter's OWN memory expression is thin (a single REUNION line per NPC, 3-variant OTHER-bucket cycling under heavy repeated contact, see Q7) -- "natural" is a stronger claim for the live-AI path than for the CI-safe deterministic one.

**Q7 -- 過去を覚えすぎて気持ち悪くないか。** NO, but with an honestly-reported adjacent finding: Trace C's fixed daily input to the SAME NPC (Fumiko) cycles through exactly 3 deterministic-adapter reply variants starting day 4 (`そう`/`ふうん`/`そうねえ`, repeating in a strict 3-cycle) -- this is monotony, not creepiness (the adapter doesn't reference specific past content, it just has few buckets), and is an EXISTING, already-honestly-reported PHASE 12.4 limitation of the CI-safe fallback adapter specifically, not a new memory-overreach problem this phase introduced.

**Q8 -- 4 tracesが違う14日間になったか。** YES. World content identical (correctly); conversation content, promise history, and dialogue-entry-points (REUNION vs. not) sharply diverge across A/B/C/D, directly demonstrated in Section 6 above.

**Q9 -- Day14終了後にDay15を見たい具体的理由が存在するか。** Attempted per-trace, honestly assessed:
- Trace A: "美代子との椅子の約束の続き、次はいつ何を頼まれるか" -- concrete (the chair-fix chain is mid-cycle and visibly recurring).
- Trace B: "洋平への断った誘いの後、また誘ってくるか" -- concrete (the cooldown window closes soon; a real, state-grounded question).
- Trace C: PARTIAL only -- "文子との会話に何か変化が出るか" is honest but weaker; the deterministic-adapter's 3-cycle repetition (Q7) makes this trace's own OWN reason for Day 15 the thinnest of the four.
- Trace D: PARTIAL only -- "商店街や集会所が次に何を見せるか" is a genuine world-content reason but not a SOCIAL one, since Trace D generates zero social memory by design.
Overall: YES for 2 of 4 traces with a concrete, specific, non-abstract reason; PARTIAL for the other 2 -- an honest, mixed result, not a clean YES across the board.

**Q10 -- Daisuke/Reality Bridgeなしでも成立するか。** YES. Trace D (mostly solo) never opens a Daisuke conversation across 14 days and still produces full background-world content, full end-of-day narratives, and (for the other traces) a fully independent promise/social-memory system that structurally excludes Daisuke by design (`eligibleForNewInvitation` returns `false` for him unconditionally).

## 11. Rejected / deferred designs

- **A separate mutable relationship struct** (candidate: `CoreState.playerRelationships: Record<NpcId, {tags, ...}>`) -- rejected in favor of deriving everything from existing state on demand; avoids a second source of truth and its own decay logic.
- **Numeric consecutive-miss counter exposed anywhere** -- `consecutiveMissedPromises` exists internally (gating ONE specific Section-4 behavior class) but is never returned to any UI-facing surface and is not itself a `PlayerSocialTag`.
- **Promise creation via a background-engine event** (rather than post-conversation) -- considered, rejected: Section 6's own worked example is explicitly conversational ("NPC:「明日、よかったら寄って」"), and routing it through the player-independent background engine would have made an inherently player-facing mechanic (Section 9's own "player presence required" category) masquerade as a background one.
- **A second, general rumor-propagation system** -- explicitly rejected per Section 10's own instruction; exactly one `requiredPlayerRelationship`-gated definition exists.
- **NPC roster expansion** -- audited and REJECTed this phase (Section 8 above).
- **Deep presentation-variation work** (per-instance LLM-driven rewriting, additional greeting buckets beyond REUNION) -- deliberately deferred; this phase's own priority order put it last and lightest, and what was built (4 definitions' text variants, 1 new deterministic bucket) is proportionate to that ordering, not a full solution.

## 12. Remaining weaknesses (honest, not laundered)

- Q2's structural min-maxing possibility (no visible score, but a still-optimizable underlying mechanism) is not fully resolved -- only mitigated by the absence of any number.
- Q6/Q7: the deterministic (CI-safe/test) adapter's own expressive range remains thin under heavy repeated contact with one NPC; this is a pre-existing, already-reported limitation of that specific fallback path, not of the live model, but it directly weakens Trace C's own Q9 answer.
- The 30-day simulation's scripted policy cannot demonstrate `daysSinceLastMeeting` diversity or produce a wide relationship-tag spread on its own (both are policy artifacts, not mechanism gaps -- proven separately by unit tests and the 14-day browser traces) -- a future phase's simulation policy should consider a non-uniform visiting pattern specifically to make THIS simulation itself demonstrate what it currently can only assert indirectly.
- No NPC exists in a near-player-age or parent/family role (Section 16's honest finding) -- deferred, not fixed.
- `createRealWorldIntent`'s id-generation pattern shares the same time+array-length fragility this phase found and fixed in the new promise mechanic -- left untouched (out of scope), but worth a future phase's attention if RealWorldIntent volume ever grows the way playerPromises did here.

## 13. Final judgments

**`SOCIAL_MEMORY_ENGINE = ACCEPT`** -- the promise loop, categorical tag derivation, relationship-dependent event eligibility, and decay/pruning are real, tested (174 newlifecore tests; 0 duplicate/leaked/unbounded state across a 30-day simulation), and verified live in the browser across four genuinely diverging 14-day traces plus two dedicated absence sub-traces that produced the exact, specific, non-generic behavior Section 19 asked for (a measurably different reunion entry, no anger/praise binary). Two real implementation bugs (an id collision, a test-policy parity resonance) were found and fixed during this Run rather than only surfacing in isolated unit tests.

**`14_DAY_FUN_READY = YES`** -- Q1/Q3/Q4/Q5/Q8/Q10 all land at YES with concrete evidence; Q9 (the human-fun signal, Section 22) lands YES for 2 of 4 traces and a still-concrete-if-weaker PARTIAL for the other 2 -- a real, if uneven, "reason to see Day 15" across the board, not merely "because there's more content."

**`30_DAY_FUN_READY = NOT_YET`** -- unchanged from PHASE 12.5's own caution (Section 27's explicit instruction: 14 days being fun is a separate question from 30). This phase's own 30-day simulation is diagnostic-only for the social-memory dimension specifically (Section 7 above) and cannot yet demonstrate at 30-day scale what the 14-day browser traces demonstrated concretely; Q6/Q7's deterministic-adapter thinness would compound over a longer span for any trace resembling Trace C's pattern.

**NEW_LIFE_SOCIAL_MEMORY_V1_READY**

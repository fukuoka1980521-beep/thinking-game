# PHASE_12_5_NEW_LIFE_RECURRING_WORLD_ENGINE_V1 -- CLOSE REPORT

BASELINE: `d5ca99a` (PHASE 12.4 CLOSE, judgments `WORLD_DEPTH_V1 = CONDITIONAL ACCEPT`, `30_DAY_FUN_READY = NOT_YET`, stated bottleneck: authored world-change content exhausts by Day 3 of 30 -- ~90% of the 30-day span had zero new content).

FINAL COMMIT: recorded below at CLOSE time (this report is written before the commit that includes it; see the repo's own commit log for the hash immediately following this file's own commit).

## 1. What this phase built

Instead of authoring more fixed, one-shot events (the PHASE 12.1-12.4 pattern -- `content/day1WorldEvents.ts`'s four hand-coded `if` blocks, left completely unmodified this phase), this phase built a **generic, data-driven recurring event engine**:

- **`src/newlifecore/content/eventEngine.ts`** -- the evaluator. `resolveGeneratedEvents(prevTime, state, defs)` runs once per `advanceTime` tick (same call site, same crossing-window trigger pattern as the legacy system), scanning a table of `EventDefinition`s and firing whichever are eligible. `eventTraceLinesAt(state, defs, location)` supports diegetic discovery (see §4).
- **`src/newlifecore/content/eventDefs.ts`** -- 16 concrete V1 event definitions across all 8 candidate families (WORK, SOCIAL, PLACE, WEATHER, PROMISE, ROUTINE_BREAK, SHARED_SMALL_EVENT, RESOURCE -- all 8 turned out to have real canon support once checked against `npcDefs.ts`, so V1 didn't need to narrow the family list).
- **`CoreState.eventLastFired` / `familyLastFired`** (`types.ts`) -- new, minimal bookkeeping fields (event id -> last-fired day; family -> last-fired day) so cooldown is plain, canonical state, never re-derived from prose or asked of an AI. Persist across days exactly like `worldFacts`/`flags` (`startNewDay` does not touch them).
- **`engine.ts`** -- `advanceTime` now calls `resolveGeneratedEvents` right after the legacy `resolveWorldEvents`, independently (neither reads the other's flags/facts). Also resets the new `isDrizzling` flag in `startNewDay` (fail-safe mirror of the existing `isRaining` reset).
- **`content/day1.ts`** -- `buildLocationScene` is now a thin wrapper (`buildLocationSceneBase` + `eventTraceLinesAt`) so a location-bound event that fired today is noticeable just by visiting, without touching any of the base function's many hand-authored branches. `buildEndOfDayNarrative` now also includes any of today's fired-event texts (same "today, not ever" gating as the legacy block it sits next to).

The legacy `day1WorldEvents.ts` system was deliberately left untouched, not migrated -- migrating its four events into the new generic shape would have touched flag names several existing tests assert on directly, for zero behavioral gain. New content goes through the new engine from now on.

## 2. Event architecture

```
EventDefinition {
  id, family, participants, location, playerPresenceRequired,
  triggerTime, eligibility, cooldownDays, familyCooldownDays?,
  setFlags?, resetFlagsOnFire?, worldFact: { id, text, knownBy, category }
}
```

`eligibility` covers: `minDay`, `requiredFlags`/`forbiddenFlags` (chain prerequisites use the auto-set `flags[def.id] = true` every firing produces), `npcsAvailable` (schedule-AVAILABLE check, reusing `schedule.ts` unchanged), `requiredRelationship` (reads the existing `NPC_DEFS[a].relationships[b].quality` -- no new relationship data model, no numeric scores, matching directive Section 11 exactly), and `occurrenceChance` (see §3).

Firing sets `flags[def.id] = true` (the chain-prerequisite mechanism), records `eventLastFired`/`familyLastFired`, appends a `WorldFact` stamped with the definition's `category`/`knownBy`/`text`, and optionally applies `setFlags`/`resetFlagsOnFire`.

**Chains**: two 2-stage REQUEST -> RESOLVED chains (`jin_fixes_chair_ask/done` at CAFE_NODOKA; `miyoko_offers_help_hina_ask/hina_shelves_done` at SHOPPING_STREET). Each follow-up stage requires the earlier stage's flag and, on firing, resets it via `resetFlagsOnFire` -- this is what lets the *same* chain restart once the earlier stage's own cooldown reopens it, rather than firing once ever. The remaining 12 definitions are deliberately one-off (not chained), per directive Section 6.

**LLM boundary**: no AI call exists anywhere in `eventEngine.ts` or `eventDefs.ts`. Occurrence, eligibility, state mutation, knowledge (`knownBy`), and relationship reads are 100% pure-function state evaluation. The only AI-adjacent surface is that a fired fact's already-authored, natural-language `text` can subsequently be read by the live dialogue prompt (via the pre-existing `contextBuilder.ts` `knownFacts` filter, completely unmodified) -- the AI never decides whether/what happened, only how an NPC phrases acknowledging it.

## 3. A real bug found and fixed during this phase: `pseudoChance` had almost no avalanche

Directive Section 7 forbids both an evenly-distributed schedule (no Math.random-free system can rely on cooldown alone without producing a perfectly periodic firing pattern) and fully random events (ruled out `Math.random()` as non-reproducible/non-testable). The design uses a deterministic hash of `${eventId}_${day}` compared against an `occurrenceChance` threshold instead.

The first implementation (`h = h*31 + charCode`, no finalizer) turned out to have a real bug: consecutive `${id}_${day}` seeds differ only in their last 1-2 characters, and without a finalizing mix step the hash barely moved between days (`drizzle_start_1` vs `drizzle_start_2` differed in the 9th decimal digit of the output). Concretely, `drizzle_start` (nominal 50%/day chance) fired **zero times across a 30-day simulation** -- caught by writing `tests/newlifecoreEventEngine.test.ts`'s occurrenceChance distribution check and re-inspecting the 30-day sim's per-event fire logs, not by inspection alone. Fixed with an FNV-1a hash plus a murmur-style finalizer; re-verified 15/30 and later 8/8 event families firing across the 30-day span. A regression test (`pseudoChance` distribution + minimum-gap-between-consecutive-days check) now guards this specifically.

## 4. Life Material and diegetic discovery

Every fired event's `WorldFact` carries the existing `category` tag (`promise`/`pending_task`/`shared_event`/`world_change`/`object`) -- not a new system, the same field PHASE 12.4 introduced. Its actual effect on eligibility/discovery:

- **Follow-up eligibility**: a chain's second stage literally cannot fire without the first stage's flag -- verified in `newlifecoreEventEngine.test.ts`'s "a follow-up event's eligibility genuinely depends on the earlier stage's Life Material having fired -- not just on the clock" test (an `ask` gated to `minDay: 20` that never becomes eligible within the test's day range correctly prevents its `done` from ever firing).
- **Scene description**: `eventTraceLinesAt` surfaces a location-bound event's authored text as an extra ambient line when the player visits that location on the day it fired -- verified live in the browser (see §6): visiting SHOPPING_STREET on day 4 showed "陽菜の店に、見慣れない新しい焼き菓子が並んでいた。" inline in the scene, not as any kind of log.
- **End-of-day narrative**: today's fired-event texts are included in the day-end screen (added this phase -- see §7, this was a real gap the first browser trace run surfaced).
- **NPC conversation**: unmodified `contextBuilder.ts` already filters `worldFacts` by `knownBy` into each NPC's `knownFacts` -- verified both structurally (30-day sim's zero-knowledge-leak assertion across all NPCs x all facts) and positively (a new integration test confirms a knowing NPC's context does contain a just-fired event's exact text).

Discovery is never a log/list UI -- no new screen was added; the three surfaces above are the only three the player ever sees content through, matching directive Section 14.

## 5. Cooldown, family cooldown, and unevenness

All 16 definitions have `cooldownDays`; 12 also have `familyCooldownDays`. A 30-day-span hard-assertion test (`newlifecoreThirtyDaySimulation.test.ts`, "never violates a cooldown") re-derives each event id's actual fired-day list from the simulation and asserts every consecutive gap is `>= cooldownDays` -- **0 violations** across the run.

Several definitions additionally carry `occurrenceChance < 1` specifically because cooldown alone produced a perfectly periodic firing pattern in an early test run (the chair-chain fired on exactly days 3/11/19/27 -- an 8-day metronome) -- this read as clockwork, not "uneven life," so `occurrenceChance: 0.6` was added to six of the definitions to let eligible days sometimes pass without firing. Re-measured after the fix: the same chain fired on days 4/13/21/29 (uneven gaps of 9/8/8) instead of an exact 8-day repeat.

## 6. Real-browser 7-day playtraces (A/B/C)

Run via a Playwright script against the real dev server (deterministic adapter, live AI toggled off -- this phase's own Section 20 scopes Daisuke dialogue-quality work out; PHASE 12.4 already covered that ground). All three traces ran Day1 -> Day7 for real, with the intake form completed on Day1 and every day ended via the actual sleep/next-day UI flow.

- **Trace A (social)**: visits YOHEI_STORE / CAFE_NODOKA / COMMUNITY_HALL / SHOPPING_STREET / BARBERSHOP daily, talks to whoever's there, triggers the Reality Bridge with Daisuke on Day 3, checks in on Day 6.
- **Trace B (mostly solo)**: visits only SHOPPING_STREET and COMMUNITY_HALL, talks to nobody.
- **Trace C (repeats the same person/place)**: warms up through two other locations (BARBERSHOP doesn't open until 10:00) then always ends at BARBERSHOP/Daisuke; triggers the Reality Bridge once (Day 2), checks in once (Day 4).

**Divergence (Section 17's specific bar)**: Trace A's Day4-7 end-of-day narratives are all mutually distinct (verified: day4 != day5 != day6 != day7, byte-for-byte). Trace B, which talked to almost nobody, still produced **the same world-event substance** as Trace A on matching days -- e.g. Day 4 for both: "美代子が、喫茶のどかの椅子のがたつきを相馬に直してほしいと頼んだ。喫茶のどかの椅子は、いつの間にかがたつかなくなっていた。相馬が寄っていったらしい。洋平が散髪に寄って、大輔と世間話をしていったらしい。陽菜の店に、見慣れない新しい焼き菓子が並んでいた。小雨がぱらつき始めた。小雨はいつの間にか止んでいた。" This is the literal, verified version of "誰ともあまり話していないのに町が自分なしで動いていた."

**Per-day findings (Trace A, representative)**:

| Day | New events | World changes | Repeated content vs. yesterday |
|---|---|---|---|
| 1 | shelf fixed (legacy), 5 NPC talks | shelf | -- |
| 2 | bench fixed, fumiko-visits-miyoko, yohei-miyoko produce trade (legacy) | bench, 2 new-engine facts | none |
| 3 | hina shop open (legacy) | shop opens | none |
| 4 | chair ask+done, daisuke-yohei chat, hina new item, drizzle start+end | 6 distinct new facts | none |
| 5 | daisuke late open | 1 new fact | none |
| 6 | festival flyer | 1 new fact | none |
| 7 | hina-shelves chain (ask+done), fumiko-visits-miyoko, produce trade again | 4 new facts | produce-trade/fumiko-visit text repeats verbatim from Day 2 (expected -- same authored text, different day, a real but honest repetition, see §10) |

## 7. A real gap found and fixed via the browser trace, not caught by unit tests alone

The first full trace run (before this fix) showed Trace A's Day4-7 end-of-day screens as **byte-identical** despite the new engine visibly firing plenty of new facts that day (confirmed via the location-scene captures in the same run). Root cause: `buildEndOfDayNarrative` (`content/day1.ts`) only ever checked the four legacy `day1WorldEvents.ts` fact ids -- it had no knowledge the new engine existed at all. The new engine's facts were reaching the live dialogue prompt and the location-scene trace lines, but never the one screen the player sees at the end of every single day. Fixed by adding a loop over `EVENT_DEFS` checking `factToday` for each, reusing each definition's already-authored `worldFact.text` verbatim (no new copy, no internal ids). Re-run confirmed Day4-7 are now fully distinct. This is exactly the kind of gap the directive's "actually view the real UI, don't just trust unit tests" instruction exists to catch -- the unit/simulation tests never would have caught this because they only assert on `state.worldFacts`, never on what `buildEndOfDayNarrative` actually renders.

## 8. 30-day structural simulation V2

`tests/newlifecoreThirtyDaySimulation.test.ts` gained a new `describe` block (the PHASE 12.4 diagnostics above it are left unmodified as a historical baseline -- they correctly still report "EVENT EXHAUSTION DAY: 3/30" for the *legacy system alone*, which is accurate and shouldn't be edited to look better). The new V2 measurements (combined legacy + recurring engine, same scripted policy):

- **EVENT EXHAUSTION DAY V2 (all 21 known event *types* first-seen)**: 9/30. This is honestly a different, weaker-sounding number than "no exhaustion" -- but see the next line, which is the metric that actually matters for fun-readiness.
- **Unique fired event *instances* over 30 days**: 55 (vs. 5 for the legacy-only system).
- **Unique event families that fired at least once**: 8/8.
- **Days with zero new worldFacts (quiet days)**: 1/30 under this aggressive-visit scripted policy (see §10 for why this specific number is likely a ceiling-case artifact, not the real quiet-day rate).
- **Longest run of structurally-identical days** (same NPC-presence signature + flags at a fixed sample time): 6 (down from an effectively-unbounded streak under the legacy-only system, since that system's schedule/flags genuinely stop changing entirely after Day 3).
- **Cooldown violations**: 0 (hard assertion).
- **Orphaned/stale chains**: 0 -- every `ask` has a matching same-day `done`; final state confirms neither chain is left mid-flight.
- **Knowledge leaks**: 0 across all NPCs x all facts (hard assertion, checked against the *combined*, larger fact set this phase produces, not just the original four).
- **Life-Material-tagged fact growth**: 11 -> 60 over 30 days (was flat after Day 3 previously) -- genuinely growing, still bounded (`eventLastFired` table caps at 16, the total definition count).

**Honest reframe of "exhaustion"**: for a system with a fixed table of 16 definitions, every distinct event *type* being seen at least once by day 9 is structurally inevitable and not itself a problem -- the number that actually answers "does new content keep happening" is the *instance* count and the *quiet-day* count, both of which show the system producing new, felt content on 29 of 30 days under this policy. Calling day 9 "exhaustion" the way PHASE 12.4 correctly called day 3 "exhaustion" for the old system would be misleading; the two numbers are answering different questions and are reported separately above rather than conflated.

## 9. Visual gate

Real browser, 4 required viewports (360x800 / 390x844 / 430x932 / 1440x900), screenshots actually viewed (not just automated overflow checks) at a location scene with a fresh recurring-engine trace line visible (SHOPPING_STREET, Day 6) and at the day-end narrative screen (Section 22's specific worry: must not look like an event log).

Findings: the day-end screen renders as a small stack of plain-sentence cards ("商店街に、来月の祭りの手書きの告知が貼り出されていた。" / "その日は、特に何も食べなかった。" / "そして眠った。") -- no bullet/log styling, no ids, no counters, matches the existing legacy-event presentation exactly (the new content is visually indistinguishable from the old, which is the correct outcome). The location scene shows exactly one NPC card plus the new ambient trace line prepended to the existing scene text -- no card proliferation, no extra UI chrome. The 1440px view keeps the same centered, bounded-width column as the mobile views rather than stretching content edge-to-edge. Movelist/talk/action controls are never below the fold at any of the four sizes. No new screen, log, or list was added anywhere.

## 10. Self-critique (Q1-Q8, evidence-backed)

**Q1 -- Is there new life from Day4 onward?** YES. Trace A's Day4/5/6/7 end-of-day texts are all mutually distinct (verified programmatically, byte comparison). 30-day sim: only 1/30 days produced zero new worldFacts.

**Q2 -- Does it look like a random event collection?** PARTIAL. Mechanically, no event is random (every firing traces to relationship quality, NPC availability, day, cooldown, or a chain prerequisite -- all real state, verified in the eligibility unit tests). But from the player's own read, several one-off events (`yohei_closes_early`, `daisuke_late_open`) have no in-fiction "why" narrated beyond the bare fact -- they read as texture, not as a caused event with a visible reason. That gap is honest and unresolved this phase.

**Q3 -- Is yesterday the cause of today?** PARTIAL. The two chains demonstrate real same-day cause->effect (ask directly enables done), and cooldown means an event's *own* last occurrence gates its next one. But 12 of 16 definitions are one-off and state/time-driven rather than driven by anything the *player* specifically did the day before -- "yesterday causes today" is demonstrated at the world-mechanism level more than at the player-choice level. Reality Bridge (pre-existing, unmodified) remains the only mechanism where a player's own stated words from an earlier day directly resurface later.

**Q4 -- Do NPCs exist with each other independent of the protagonist?** YES. All 16 new definitions have `playerPresenceRequired: false`; 55 instances fired over 30 days in the simulation with zero player action gating any of them; confirmed identically present in both the "talked a lot" (A) and "barely talked" (B) real-browser traces.

**Q5 -- Does the town progress even when the player is absent?** YES, with the strongest evidence this phase produced: Trace B's Day 4 end-of-day screen contains the same world-event substance as Trace A's Day 4, despite B never initiating a single conversation with Yohei, Jin, Fumiko, or Hina. This is the literal, measured version of "誰ともあまり話していないのに町が自分なしで動いていた."

**Q6 -- Does a missed event become a DIFFERENT life rather than a loss?** PARTIAL. Nothing is ever truly lost (cooldown guarantees eventual recurrence, so missing one instance only delays the next), which correctly avoids any scoring/loss framing -- but that also means player absence doesn't yet branch into a *materially different* state, only a "you weren't there to see it" trace. A genuinely different-life branch (an NPC's relationship quality shifting because the player was never around) is not implemented this phase.

**Q7 -- After finishing Day7, is there a reason to look at Day8?** YES. Trace A's Day 7 ends mid-chain (the hina-shelves chain just resolved) and with ongoing recurring content still active; the 30-day sim shows instance generation continuing through day 29-30, not stopping at any fixed horizon.

**Q8 -- Does the game work even if Daisuke is never used even once?** YES. Trace B never talks to Daisuke at all; every one of the 16 new event definitions, the location-scene trace lines, and the end-of-day narrative all function completely independent of any Daisuke interaction -- confirmed directly in Trace B's real output.

## 11. Regressions and full suite

**NEWLIFECORE test result**: 143/143 passed (`newlifecoreEngine.test.ts` 61, `newlifecoreRenderedUI.test.tsx` 30, `newlifecoreLivePrompt.test.ts` 16, `newlifecoreThirtyDaySimulation.test.ts` 10, `newlifecoreEventEngine.test.ts` 26 -- new this phase). `npx tsc --noEmit` clean. `npm run build` succeeds (pre-existing chunk-size warning, unrelated).

**FULL REPO test result**: 1742/1744 passed. 2 failures, both pre-existing and unrelated to this phase's changes (neither touches `src/newlifecore` or `tests/newlifecore*`):
- `tests/case1c.test.tsx` > "2 testers played back to back on the same device produce 2 distinct, non-overwritten rows" -- 5000ms timeout.
- `tests/episodeMultiSession.test.tsx` > "session 1 shows no growth diff; sessions 2 and 3 show one" -- 5000ms timeout.

Both are timing-flake failures in files this phase never touched (case1c and episode-session modules). Reported separately per standing instruction, never folded into "ALL PASS."

**Regression-specific checks** (all pass, all within the 143 above): Reality Bridge end-to-end, safety route (including crisis-priority-over-bridge-offer), research opt-in, conversation collapse (today/past), existing canon (NPC portraits, shop flow, purchase flow). None of these files were modified this phase; their passing tests are the regression evidence.

## 12. Rejected / deferred approaches

- **Migrating the legacy 4 events into the new engine's shape** -- rejected: several existing tests assert on `shelfFixed`/`benchFixed`/`hinaShopOpen` flag names directly; migrating for architectural purity alone would have been pure risk for zero behavioral gain.
- **True randomness (`Math.random()`) for unevenness** -- rejected per directive Section 2's explicit ban and because it would make every run/replay non-reproducible and untestable; used a deterministic hash instead (and found/fixed a real bug in the first version of that hash, §3).
- **A per-event-instance chain-tracking id/log system** -- considered, rejected as over-engineering; the existing flags-based bookkeeping (already the codebase's established idiom) turned out sufficient for both chain progression and reset.
- **Wiring `yohei_closes_early`'s flag into `schedule.ts`'s actual availability function** -- deferred: would have coupled the new engine into the existing hand-coded schedule overrides for a single cosmetic definition; kept as a pure worldFact-visible trace instead, consistent with most of the other 15 definitions.
- **A Kamiya-initiated "player-required" 17th event definition** -- dropped in design: on inspection, the existing Reality Bridge (`createRealWorldIntent`/`checkInRealWorldIntent`, untouched this phase) already IS the codebase's player-presence-required chain precedent; adding a redundant second one would have been padding, not new capability.
- **occurrenceChance on every definition** -- applied only where cooldown alone produced visibly mechanical periodicity (6 of 16); the rest either have no meaningful alternative cadence (the two-stage chain follow-ups, which should fire immediately once eligible) or are already infrequent enough (`shopping_street_festival_flyer` at `cooldownDays: 20`) that added chance would mostly just suppress content without adding felt variety.

## 13. Remaining weaknesses (honest, not laundered)

- Several one-off events read as texture without an in-fiction "why" (Q2/Q3 above) -- the system is state-driven but not always narratively motivated at the instance level.
- No event branches into a materially different NPC-relationship state from player absence (Q6) -- absence delays content, it doesn't yet diversify it.
- The "quiet days: 1/30" figure was measured under an aggressive scripted policy that visits every location daily; a real player who visits fewer locations (like Trace B) would very likely see more zero-new-fact days in their own conversation log even though the *world* itself is still changing at the same rate underneath (Trace B's own end-of-day screens show world content every single one of its 7 days specifically because the padding-to-20:00 policy still traverses all 6 locations) -- this specific number should not be read as "the real player-felt quiet-day rate," only as "the mechanism structurally permits and does produce some quiet days."
- Trace A's Day 2 and Day 7 share one repeated exact sentence pair (fumiko-visits-miyoko / produce-trade) -- expected given only 16 authored texts recur verbatim rather than varying their own wording per firing (no per-instance text variation was built this phase; every firing of a given definition produces byte-identical prose). This is a real, bounded content-repetition ceiling this phase did not address.
- Daisuke/dialogue-quality work was explicitly out of scope this phase (directive Section 20) and received regression testing only, not improvement.

## 14. Final judgments

**`RECURRING_WORLD_ENGINE = ACCEPT`** -- the state/eligibility/cooldown/chain/knowledge-boundary/Life-Material architecture is real, tested (143 newlifecore tests, 0 knowledge leaks, 0 cooldown violations, 0 orphaned chains across a 30-day simulation), verified live in the browser across three genuinely diverging 7-day traces, and a real implementation bug (the hash avalanche issue) and a real integration gap (the end-of-day narrative not knowing about the new engine) were both found and fixed during this Run rather than only in isolated unit tests.

**`7_DAY_FUN_READY = YES`** -- Day4-7 in the real browser trace show new, distinct, felt content every day; the player-independent world progression (Q5) is concretely demonstrated, not just architecturally claimed; the visual gate confirms none of this reads as a log/list UI.

**`30_DAY_FUN_READY = NOT_YET`** -- the structural safety bar is met (bounded growth, no crashes, no leaks, genuine instance-level variety through day 30), but §13's weaknesses -- no per-instance text variation, no absence-driven relationship branching, several events lacking a felt "why" -- mean 30 days would very likely still read as thinner and more repetitive than 7 days by the player, even though it is measurably far less repetitive than the PHASE 12.4 baseline (which had 90% of its 30-day span with literally zero new content). The measured improvement (5 -> 55 unique instances, unbounded -> 6-day-max identical-day streak) is real and large, but a passing structural simulation is not being read here as proof of 30-day fun, per the directive's own explicit instruction.

**NEW_LIFE_RECURRING_WORLD_ENGINE_V1_READY**

# PHASE_12_7_NEW_LIFE_PLAYER_TRAJECTORY_V1 -- CLOSE REPORT

BASELINE: `fa85b86` (PHASE 12.6 CLOSE, judgments `SOCIAL_MEMORY_ENGINE = ACCEPT`, `14_DAY_FUN_READY = YES`, `30_DAY_FUN_READY = NOT_YET`).

FINAL COMMIT: `6f84fe0` (feat: add player life trajectory system for New Life (PHASE_12_7))

## 1. What this phase built

PHASE 12.5 made the town keep moving; PHASE 12.6 made relationships remember the player's own choices. Both left the protagonist's own life largely static -- the stated risk of drifting toward a "responsive town simulator" without the original "become someone after 30 days" throughline. This phase adds **PLAYER LIFE TRAJECTORY**: a minimal, three-seed system where repeated, unlabeled help with an existing NPC can -- only after real repetition -- surface an actual "want to take this on" choice, entirely reachable through ordinary scene actions, never a career-selection screen.

- **`src/newlifecore/content/trajectoryDefs.ts`** (new) -- `TrajectorySeed` data shape + exactly 3 concrete seeds, one family each: `jin_odd_job` (INDEPENDENT), `miyoko_cafe_help` (SHOP_BUSINESS), `fumiko_community_role` (COMMUNITY, deliberately zero money reward). All three use EXISTING NPCs (Section 18) -- no roster addition this phase (Section 8 below).
- **`src/newlifecore/content/trajectoryEngine.ts`** (new) -- pure eligibility functions mirroring `socialMemory.ts`'s own discipline: `engageActionEligible`, `opportunityEligible`, `workActionEligible`, `canStepBackFromTrajectory`, `opportunityWindowExpired` (diagnostic only). Nothing here mutates state or decides anything on the AI's behalf -- these only ever answer "is X currently possible."
- **`types.ts`** -- `PlayerExperience` (`id`/`npc`/`count`/`lastDay`) and two new `CoreState` fields: `playerExperiences: PlayerExperience[]`, `lifeOpportunityDeclines: Record<string, number>`. `count` exists ONLY to gate the experience threshold -- never displayed, never a score (verified structurally, see §9).
- **`engine.ts`** -- `recordTrajectoryEngagement` (the one function behind both the unlabeled "help" action and the post-acceptance "work" action -- same seed, same cooldown, only the label/reward tier differs), `acceptLifeOpportunity`, `declineLifeOpportunity`, `stepBackFromTrajectory` (Section 29 -- clears the accepted flag, deliberately preserves `playerExperiences` and sets no decline-cooldown, so resuming later stays exactly as open as the original offer was).
- **`LifeOpportunityOffer.tsx`** (new) -- a real, equally-weighted accept/decline UI choice, structurally identical in spirit to PHASE 12.6's `PromiseOffer.tsx` but with its own testids (a life-direction choice is not a social invitation).
- **`content/day1.ts`** -- `trajectoryActionsFor(seed, state)` builds each seed's specialActions (at most 2 at once: the ordinary engage/work action, plus mutually-exclusive "listen" or "step back"); wired into the CAFE_NODOKA (Miyoko) and COMMUNITY_HALL (Jin, Fumiko) scene branches; end-of-day narrative gained one line per seed's engage/accept/decline/stepback event today, same plain-sentence register as every existing line.
- **`NewlifeCoreApp.tsx`** -- dynamic `engage_*`/`consider_*`/`stepback_*` action-id dispatch, `showOpportunityOffer` state (scene-level, like `showIntakeForm`).

## 2. The opportunity loop, concretely

Ordinary help (`engage_${seedId}`, unlabeled, no commitment) -> repeated `opportunityThreshold` (2) times, still recent (`opportunityWindowDays`, 5) -> a neutral "話を聞いてみる" scene button appears -> the NPC's own authored line + a real accept/decline choice (`LifeOpportunityOffer`) -> accept sets one flag and relabels the SAME action from "help" to "work" language; decline is fully resolved immediately (no lingering pending state) with a short re-offer cooldown (`declineCooldownDays`, 6) so it can genuinely resurface later without being offered "mechanically every time"; ignoring (closing without choosing) leaves no trace at all. `stepBackFromTrajectory` (Section 29) is always available once accepted, at no cooldown, clearing the flag without erasing the experience history behind it.

## 3. A real bug found while building this: eligibility checks that silently walk into an NPC's own busy window

Not a bug in the shipped mechanism -- found in this phase's OWN 21-day trace script. `TRACE_A`'s original policy talked to both Jin and Fumiko (20 real in-game minutes) before attempting Jin's engage action; Jin's schedule has a genuine 9:30-9:45 BUSY block, and the 20-minute conversation reliably walked the attempt straight into it, so Trace A silently never engaged Jin across a first 21-day run (0/21 days) despite the scene screenshot at arrival time clearly showing the button. Root-caused by comparing the static scene-text capture (taken at arrival, before conversation) against the live click attempt (taken after); confirmed as the SCRIPT's own ordering bug, not a product bug, since Jin's BUSY gating is exactly the intended `engageActionEligible` behavior (already unit-tested). Fixed by reordering every trace's per-location steps to attempt engage/consider BEFORE ordinary conversation, and by giving Trace A separate steps per NPC; the full 6-trace, 21-day suite was re-run from scratch for a consistent dataset (§6 below uses only the corrected run).

## 4. Real-browser 21-day traces (A-F)

Deterministic adapter (live AI off, same scoping rationale as PHASE 12.5/12.6 -- this phase's own priority order treats presentation/dialogue quality as out of scope). All 6 completed cleanly (exit code 0, no hangs, no Playwright timeouts) across the full 21 days each.

| Trace | Policy | Engage counts | Accepted | Declined | Changed direction |
|---|---|---|---|---|---|
| A (active seeker) | tries all 3 seeds, accepts every offer | Jin 10, Miyoko 10, Fumiko 10 | all 3 (day 4, day 4, day 5) | 0 | no |
| B (social, declines work) | talks broadly, rarely engages, declines every offer | Miyoko 3 (days 6/12/18) | 0 | 2 (days 12, 18) | n/a |
| C (mostly solo) | visits places, never talks, never engages | 0 | 0 | 0 | n/a |
| D (favors Fumiko) | only COMMUNITY_HALL/Fumiko, accepts | Fumiko 10 | 1 (day 4) | 0 | no |
| E (change of mind) | Jin route days 1-10, steps back day 11, Miyoko route days 12-21 | Jin 5, Miyoko 5 | 2 (day 4 Jin, day 14 Miyoko) | 0 | **yes**, explicit stepback day 11 |
| F (no-career) | ordinary social contact, never engages any trajectory | 0 | 0 | 0 | n/a |

**Divergence (Section C's "most important" check)**: NOT the same content in a different order. A's Day 4 end-of-day screen alone contains 6 background world-change lines PLUS all 3 trajectory-engagement lines PLUS 3 conversation lines -- the single most content-dense day any trace produced. F's every day (21/21) carries full background-world content AND ordinary conversation lines, with ZERO trajectory content, ever. C's every day carries background-world content ONLY -- no conversation, no trajectory -- the sparsest of all six. D narrows to exactly one relationship (Fumiko) sustained for 21 days, with the exact "help" -> "work" relabeling confirmed live on day 6 (button text changed from "集会所の用事を手伝う" to "集会所の役を務める" immediately after day 4's acceptance). E is the only trace whose CONTENT literally changes composition mid-run (Jin-flavored days 1-10, a visible stepback day 11, Miyoko-flavored days 12-21) -- six genuinely different 21-day experiences, not one experience replayed six ways.

## 5. NO-CAREER route (Section D/28), evaluated strictly

Trace F never engages a single trajectory action across 21 days. Checked directly against every forbidden pattern:
- **Content starvation**: none -- every single day (21/21) has non-empty, substantive end-of-day content (background world events the trajectory system never gates, plus full ordinary conversation with Yohei/Miyoko/Jin/Fumiko/Hina).
- **Money softlock**: none -- F never spends or needs money beyond what conversation/movement already costs (free); no action in the game is gated behind trajectory-earned money.
- **NPC nagging**: none -- no line anywhere in F's 21 days resembles "そろそろ仕事は？" or any employment prompt; NPCs' ordinary dialogue is completely unaffected by the player's lack of trajectory engagement (verified by the SAME deterministic reply buckets firing as in every other trace).
- **Repeated mechanical re-offering**: structurally impossible for F specifically -- F never even reaches the experience threshold (0 engagements), so no opportunity is ever offered to decline in the first place; B's decline case (§4) shows the actual re-offer cadence is 6 days, not "every time," confirmed live.
- **"Nothing done" framing at Day 21**: none -- F's own day-21 end-of-day screen carries a full sentence for the day's world change AND three separate "talked with X" lines; the game's own end-of-day narrative treats F's day exactly the same, structurally, as any other trace's day (same function, same gating, no special "unemployed" branch exists anywhere in the code).

## 6. CHANGE-MIND route (Section E/29), evaluated strictly

Trace E: Jin's chair-fix-adjacent odd-job route accepted day 4, continues (relabeled to "work" framing) through day 10, explicit step-back action taken day 11 ("この関わり方について考え直す"), and Miyoko's cafe route independently reaches its own threshold and gets accepted day 14, continuing through day 20. No code anywhere blocks pursuing Miyoko while Jin's flag is still set, or after it's cleared -- the two seeds' state is fully independent by construction (separate `PlayerExperience` entries, separate `flags` keys). Not unconditional either: `engageCooldownDays`/`opportunityWindowDays` still apply per seed, so switching costs real days (Miyoko's own threshold still took until day 14 to reach, not day 12), preserving Section E's own "時間・機会費用は残す" requirement rather than making every choice freely reversible with zero cost.

## 7. Opportunity flooding / starvation (Section G/H)

**Flooding**: never observed. Across all 6 traces x 21 days (126 trace-days), the engage-action cooldown (2 days) was never violated in real play (matches the unit-tested invariant); `consider_*` (the actual opportunity offer) appeared AT MOST ONCE per accepted seed, ever, and B's two decline-then-reoffer cycles were exactly 6 days apart (`declineCooldownDays`), never back-to-back. No day in any trace surfaced more than 3 distinct trajectory-related actions (Trace A's densest days), and even then only because the player is simultaneously pursuing all 3 independent seeds by choice.

**Starvation**: none of the 3 seeds ever failed to become eligible in a real trace attempting it -- Jin (A, E), Miyoko (A, B, E), Fumiko (A, D) each reached their opportunity offer and were genuinely experienceable through ordinary play, not merely "eligible in the abstract" per the 30-day simulation (Section H explicitly required real-browser confirmation, not simulation-only evidence).

## 8. NPC roster (Section 17/18) -- REJECT (no addition), reconfirmed

PHASE 12.6 already found the one honest roster gap (no near-player-age or parent-role NPC) and rejected addition since nothing in that phase's scope needed it. This phase's own gate is narrower and stricter: "今回、trajectory設計上本当に必要なら" (only if genuinely necessary for trajectory design). All 3 chosen seeds (Jin/Miyoko/Fumiko) work cleanly with existing NPCs and were fully, concretely playable end-to-end in real traces -- nothing in their design was blocked or thinned by the existing roster. Looking ahead: the two NOT-yet-implemented families (EMPLOYMENT via a formal employer, RELATIONSHIP_BASED) both plausibly map to EXISTING NPCs too -- Kamiya (the Challenge Center's own employment officer) is a natural EMPLOYMENT-family seed without any new character, and Hina's still-opening shop is a natural RELATIONSHIP_BASED/SHOP seed. **Decision: REJECT roster expansion again this phase**, on stricter grounds than PHASE 12.6's own (trajectory necessity, not general variety) -- and note that even a hypothetical future 4th/5th family does not obviously require a new NPC either.

## 9. No hidden score (Section I), verified structurally

`PlayerExperience.count` is the only numeric field this phase added to player-facing state, and it exists solely to gate `opportunityThreshold` inside `trajectoryEngine.ts` -- never read by any UI component, never displayed, never compared across NPCs. A dedicated unit test asserts no `CoreState` key matches a whole-word `skill|level|career|score` pattern (a naive substring check would have false-positived on `playerExperiences` itself, which legitimately contains "xp" as a substring of "Experiences" -- caught and fixed during this phase, see the test's own comment). The eligibility inputs actually used are exactly the directive's own suggested list: repeated help (a count, internal only), recency (`lastDay`), and acceptance state (a boolean flag) -- no `workScore`/`careerAffinity`/`npcAffinity` number exists anywhere in this codebase.

## 10. Money and time (Section J)

Money: modest per-engagement grants (600-1000 yen against an 8000 starting balance), zero for the Fumiko seed specifically (a deliberate, explicit demonstration that a valid life route need not earn anything, Section 14), never negative (structurally impossible from this system alone -- only `purchaseItems`, unmodified this phase, can ever reduce money, and it already refuses to go negative). Trace F's money never moves at all across 21 days and the trace is not remotely diminished by that -- confirms "no career ≠ broke ≠ stuck."

Time: every engagement consumes 60-90 real in-game minutes, which is why Trace A's dense days (5-6 activities) look different in kind, not just in count, from Trace F's conversation-only days -- the same finite daily clock (already the whole codebase's time economy since PHASE 12.3) is what Section 15's "opportunity cost" falls out of, with zero new mechanism required.

## 11. Day 22 pull (Section L) -- one concrete reason per trace

- **A**: three separate relationships (Jin/Miyoko/Fumiko) are all active at once -- whether the player can keep sustaining all three, or one will start to crowd out the others, is a real open question the game itself hasn't answered yet.
- **B**: declined Miyoko's offer twice (days 12, 18); the 6-day re-offer window means a third offer is plausible soon, and whether the player accepts THIS time is genuinely undecided.
- **C**: the town keeps changing (the festival flyer, Hina's shop, the chair-fix chain) entirely without the player's involvement -- there's a concrete pull to see what happens next even having done nothing personally.
- **D**: 21 days into an unpaid community role with Fumiko -- whether this becomes something more, or stays exactly what it is, is unresolved.
- **E**: just started at Miyoko's cafe after leaving Jin's odd jobs -- whether this second choice sticks any better than the first is the open question the trace itself raises.
- **F**: no work at all, but Yohei, Miyoko, Jin, Hina, and Fumiko are all still ongoing acquaintances with their own unresolved threads (the festival, the shop, the chair) -- a reason to keep coming back that has nothing to do with employment.

All six are concrete (name a specific NPC/situation), matching the directive's own "GOOD" examples, not the generic "there's more content" pattern it explicitly warns against.

## 12. Visual gate (Section M)

Real browser, all 4 required viewports, screenshots actually viewed (not automated-only). Captured: the engage-action scene (both Jin's and Fumiko's actions visible together at COMMUNITY_HALL, since both NPCs can be present at once), the `LifeOpportunityOffer` panel mid-choice, and the day-end screen after an acceptance.

Findings: the opportunity offer renders as a plain speech-bubble-style block with two equally-sized buttons ("引き受けてみる"/"今回はやめておく") directly beneath the NPC's own quoted line -- indistinguishable in visual weight from the ordinary specialActions list above it, never a bordered "quest card" or a distinct panel style. No job-board layout, no list of opportunities, no numeric progress indicator anywhere on screen at any viewport. The day-end screen after acceptance shows exactly one additional plain sentence ("「じゃあ、頼むわ」相馬はそれだけ言うと、また工具袋を担いだ。何か始まったというより、続いていくことになった、という感じだった。") in the same stacked-card style as every other end-of-day line -- no "NEW JOB UNLOCKED" banner, no stats block. At 1440px the scene stays in the same bounded, centered column as every narrower viewport rather than stretching into a dashboard layout. No overflow at any of the 4 sizes; movelist and controls stay below the fold-free first viewport at all sizes.

## 13. Regressions and full suite

**NEWLIFECORE test result**: 209/209 passed (61 engine, 39 rendered-UI (+4 new trajectory UI tests), 16 live-prompt, 15 thirty-day-simulation (+3 new V4 tests), 36 event-engine, 19 social-memory, 28 trajectory -- new this phase). `npx tsc --noEmit` clean. `npm run build` succeeds (pre-existing chunk-size warning, unrelated).

**FULL REPO test result**: 1811/1811 passed on the final run before the trace phase began (no product code changed after that run -- only the standalone `.mjs` trace/visual scripts outside the repo's test suite, which do not affect this number). The two historically-flaky timeout tests (`case1c.test.tsx`, `episodeMultiSession.test.tsx`) did not fail this run.

**Regression-specific checks** (all within the 209 above, all pass, none of these files modified this phase except where noted): PHASE 12.5 recurring engine (unmodified), PHASE 12.6 social memory/promise mechanic (unmodified core logic; `day1.ts`'s narrative loop extended additively, not altered), Reality Bridge (unmodified, and Section 19's boundary re-verified: `eligibleForNewInvitation`-style gating for trajectories has no Daisuke path at all -- `trajectoryDefs.ts` contains no Daisuke seed, and nothing reads `RealWorldIntent`/conversation content to influence trajectory eligibility), safety route (unmodified, still checked first in `submitFreeText` before any offer path), conversation collapse (unmodified), research opt-in (unmodified), canon (unmodified).

## 14. 30-day structural simulation V4 (Section K)

Extends the 30-day simulation's existing scripted policy with per-location trajectory checks (fixed to run DURING the tour, not after the day's own evening padding -- an identical class of timing bug to §3's, caught the same way, before being mistaken for evidence about the real mechanism). Findings: all 3 seeds reach real engagement (14-15 lifetime engagements each over 30 days under this aggressive always-visit-everyone policy); `playerExperiences` stays at exactly 3 entries (no duplication); no engage-cooldown violation across 30 days (hard-asserted); accepted trajectories always have `count >= opportunityThreshold` behind them (no impossible state); money never goes negative; no knowledge-boundary leak introduced by trajectory-related facts. Under this same aggressive policy, accept/step-back cycling (a ~10%/day stepback chance layered on a 50/50 accept/decline chance) meant no seed was NECESSARILY still "accepted" at day 30 in this specific run -- a plausible interaction between two independently-reasonable random-ish test policies, not a sign real players can't stay employed (the 21-day REAL traces, where a human-shaped policy simply doesn't reconsider every single day, show sustained multi-week engagement plainly, §4/§6). Per Section K's own instruction, this simulation is read as a technical-stability check only, never as fun evidence.

## 15. Self-critique (Q1-Q10, evidence-backed)

**Q1 -- 主人公自身の生活が変化したか。** YES. Trace D ends day 21 with 21 days of sustained, unpaid community involvement with Fumiko that did not exist on day 1; Trace E's day 21 finds the player mid-cafe-shift at Miyoko's, having left Jin's odd jobs 10 days earlier -- both are concrete, persistent changes to what a day in this town actually consists of for that specific player.

**Q2 -- 職業選択ゲームに見えないか。** NO, verified directly -- §12's visual gate confirms no job-board/quest-card visual language anywhere, and the "no life-route/career UI" rendered-UI test explicitly asserts no career-selection strings appear in the DOM at any point in the accept flow.

**Q3 -- 暮らしていた結果としてopportunityが生まれたか。** YES. Every opportunity requires `opportunityThreshold` (2) prior UNLABELED help actions first -- mechanically impossible to reach the offer without having already, ordinarily, helped twice; confirmed in all 4 traces that ever reached an offer (A, B, D, E) that the offer only appeared after 2 real engage clicks, never on the first visit.

**Q4 -- 仕事を断っても遊べたか。** YES, decisively -- Trace F (§5) is 21 full days of zero trajectory engagement with zero content starvation, zero money softlock, zero NPC pressure, and a full end-of-day narrative every single day.

**Q5 -- 途中で方向転換できたか。** YES -- Trace E (§6) is a complete, unforced pivot from one trajectory family to a different one, with real (not zero) time cost, and no code path that could have blocked it.

**Q6 -- 全回収ゲームになっていないか。** YES (i.e., it does NOT read as a completionist game) -- no trace came close to exhausting all 3 seeds' full depth simultaneously except Trace A by deliberate design, and even Trace A never saw Hina, Kamiya, or Yohei develop any trajectory content (none exists for them yet, by design -- Section 25's own "not all families this V1").

**Q7 -- NPCが職業紹介装置になっていないか。** PARTIAL. Jin, Miyoko, and Fumiko each still have their full existing personality/schedule/relationship content untouched and function as complete characters independent of the trajectory system (confirmed: Trace C/F's ordinary conversations with them are byte-identical in mechanism to before this phase) -- but it's honest to note that 3 of the game's 7 NPCs NOW also happen to be the game's only 3 trajectory sources, which is a real, if modest, concentration Section 18's "existing NPC first" approach doesn't fully avoid on its own.

**Q8 -- 町の変化と主人公の生活変化が接続したか。** YES -- `requiredPlayerRelationship`-gated events (PHASE 12.6's `yohei_mentions_player_to_jin`) and the new trajectory system both read the SAME underlying state (`flags`, categorical tags), and Trace A's day-4 screen shows background world-change lines and trajectory-engagement lines interleaved in one continuous narrative, not two separate systems bolted together.

**Q9 -- Day21終了後、Day22を見たい具体的理由があるか。** YES for all 6 traces, each with a distinct, concrete, named reason (§11) -- none resorts to the generic "there's more content" pattern the directive explicitly flags as insufficient.

**Q10 -- 「30日後に何者かになる」へ近づいたか。** PARTIAL, and deliberately graded strictly per the directive's own instruction. What exists after this phase is genuinely "過ごした結果、生活の形が出た" (a shape emerged from how time was spent) rather than "職業が決まった" (a job got decided) -- Trace D's outcome is "an unpaid community role sustained by repetition," not "became a community worker"; Trace E's is "tried one thing, it didn't stick, tried another," not "changed careers." That is the right DIRECTION. It is PARTIAL rather than YES because only 3 of the eventual 4-6 families exist, Day 22-30 behavior is entirely unbuilt and unverified, and no end-of-30-days retrospective (even a non-scored, prose one, per Section 24's own description of the ideal) exists yet to actually let a player SEE the shape of their own 30 days -- the state to build one from now exists (`playerExperiences`, accepted flags, promise history), but the retrospective screen itself is out of this phase's scope.

## 16. Rejected / deferred designs

- **A separate `LifeOpportunity` stored-record array** -- considered, rejected: everything an opportunity needs (created-day, threshold, window, decline-cooldown) is already fully derivable from `PlayerExperience.lastDay`/`count` plus the existing `flags`/`lifeOpportunityDeclines`, so a second array would have been a second source of truth for information the codebase already had.
- **A separate "pending opportunity" state analogous to PlayerPromise's `pending` status** -- rejected: unlike a promise (which needs a due-date window the player must return within), an opportunity offer is resolved in the SAME interaction it's shown in (the player is standing right there) -- there is nothing to leave "pending" across a day boundary.
- **Gating the SECOND and THIRD trajectory family behind the first two NPCs' storylines** (a literal Section 6 multi-NPC chain: Jin's job -> a different resident's request -> then the real offer) -- simplified to same-NPC repetition instead, explicitly noted as a deliberate, honest simplification rather than the directive's own fuller worked example, for V1 scope discipline.
- **NPC roster expansion** -- audited and REJECTed again this phase, on the stricter "trajectory necessity" gate (§8).
- **A 4th/5th/6th trajectory family this phase** -- explicitly out of scope per Section 25; EMPLOYMENT (via Kamiya) and RELATIONSHIP_BASED (via Hina) are the most natural next candidates, noted for a future phase.

## 17. Remaining weaknesses (honest, not laundered)

- Only 3 of the eventual 4-6 trajectory families exist; UNCOMMITTED requires no code (by design) but EMPLOYMENT and RELATIONSHIP_BASED remain unimplemented.
- Q7's honest finding: the 3 NPCs who happen to have trajectory content are also 3 of the game's most socially central NPCs already (Jin, Miyoko, Fumiko all had rich PHASE 12.4-12.6 content); a future phase adding trajectory content to a currently-thinner NPC (Hina, Kamiya) would spread this out further.
- No Day 22-30 behavior is implemented or verified at all -- Section 24's own instruction not to force a "job result screen" was followed by omission (nothing was built there), which is honest but leaves genuine uncertainty about whether 30-day play holds together, not just whether it's "fun."
- No retrospective/reflection surface exists yet, even a minimal non-scored one -- the state to build one already exists, but the actual reading-back experience Section 24 describes as the ideal remains a future phase's work.
- The 30-day simulation's own accept/decline/stepback policy (a probabilistic mix) does not, on its own, produce a clean "sustained employment through day 30" story the way a real 21-day human-shaped trace does -- readers of the raw 30-day number alone could get a misleadingly bleaker impression than the real traces support; this report deliberately keeps the two readings separate (§14) rather than letting one substitute for the other.

## 18. Final judgments

**`PLAYER_TRAJECTORY_ENGINE = ACCEPT`** -- the experience-before-label loop, categorical (never-scored) eligibility, accept/decline/ignore/expire/second-chance behavior, and change-of-mind path are all real, tested (209 newlifecore tests; 0 impossible states, 0 cooldown violations, 0 money underflow across a 30-day simulation), and verified live across six genuinely diverging 21-day browser traces including a dedicated, strictly-evaluated no-career route and a dedicated change-of-mind route that both behaved exactly as specified. Two real bugs (a same-day timing-conflict in this phase's own test policy, twice -- once in the 21-day script, once in the 30-day simulation) were found and fixed during the Run rather than only surfacing as isolated unit failures.

**`21_DAY_FUN_READY = YES`** -- all 6 traces produced genuinely different 21-day experiences (§4), the no-career route is fully playable and un-punished (§5), the change-of-mind route works with real cost, not free reversal (§6), and every trace has a specific, concrete reason to return on Day 22 (§11) -- not the generic "more content exists" pattern.

**`30_DAY_FUN_READY = NOT_YET`** -- unchanged in caution from PHASE 12.5/12.6's own standard, and explicitly not inferred from the passing 30-day simulation alone (Section P's own instruction). §17's weaknesses -- an unimplemented Day 22-30, no retrospective surface, only 3 of 4-6 families, and a real (if narrow) NPC-concentration finding from Q7 -- are all real, unresolved gaps a confident 30-day judgment would need to close first.

**NEW_LIFE_PLAYER_TRAJECTORY_V1_READY**

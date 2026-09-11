# PHASE_12_8_NEW_LIFE_30_DAY_ARC_AND_RETROSPECTIVE_V1 -- CLOSE REPORT

BASELINE: `411ea6e` (PHASE 12.7 CLOSE, judgments `PLAYER_TRAJECTORY_ENGINE = ACCEPT`, `21_DAY_FUN_READY = YES`, `30_DAY_FUN_READY = NOT_YET`).

FINAL COMMIT: `1a84152` (feat: add New Life 30-day arc and Day30 retrospective (PHASE_12_8))

## 1. What this phase built

PHASE 12.7 left a real, tested trajectory engine but no Day22-30 content and no way for a player to ever see the shape of their own 30 days. This phase adds two things: (1) **late-game consequences** -- textured, non-promotion beats gated on accumulated prior engagement, reachable only from day 22 onward and only for trajectories the player is still actively in; (2) a **Day30 retrospective** -- a deterministic, zero-AI prose summary of what actually happened, built the same way `buildEndOfDayNarrative` already builds every other day's narration, plus an optional verbatim, never-analyzed free-text reflection.

- **`types.ts`** -- `locationVisitCounts` (cumulative, never reset), `lateConsequenceLastFired`, `day30ReflectionText`.
- **`engine.ts`** -- `moveTo` now tallies `locationVisitCounts`; `stepBackFromTrajectory` now also sets a permanent `${seed.id}_ever_stepped_back` flag (distinct from the transient accepted flag it clears) so the retrospective can say "途中でやめた" even after a later re-accept; `recordLateConsequence`; `submitDay30Reflection`.
- **`content/trajectoryDefs.ts`** -- each seed gains `lateConsequenceMinDay`(22)/`MinWorkCount`/`CooldownDays`/`ActionLabel`/`ResultText`/`Money`; `workMinutes` bumped (Jin 90->140, Miyoko 60->110, Fumiko 60->90) as the completionist-risk mitigation lever (§8 below evaluates whether this lever actually works).
- **`content/trajectoryEngine.ts`** -- `lateConsequenceEligible(seed, state)`: still-accepted AND day>=minDay AND priorWorkCount>=threshold AND own cooldown AND NPC available.
- **`content/retrospective.ts`** (new) -- `buildRetrospectiveLines(state)`, fully derived from canonical state, zero AI calls, explicitly excludes Reality Bridge/Daisuke content, guarded by a test that regexes out personality/rank/ending-classification vocabulary.
- **`Day30Retrospective.tsx`** (new) -- renders the lines as plain `<p>` cards (identical style to the existing end-of-day narrative), plus an optional skippable reflection textarea that, once submitted, is replaced by a fixed neutral marker ("（自分の言葉を書き残した。）") rather than ever re-displaying or reacting to its content.
- **`NewlifeCoreApp.tsx`** -- wires the retrospective into the day30 end screen only.

## 2. Test evidence

245/245 newlifecore-scoped tests pass (`newlifecoreEngine`, `newlifecoreRenderedUI`, `newlifecoreThirtyDaySimulation`, `newlifecoreRetrospective`, plus the untouched pre-existing newlifecore suites). `npx tsc --noEmit` clean. Diff scope is exactly the 11 files listed above -- verified via `git status`/`git diff --stat` before commit, no unrelated file touched.

## 3. Real-browser 30-day traces (A-G)

All 7 run under a corrected, postcondition-verified, process-isolated harness (`.scratch_phase128/`, scratch-only, never committed): every interaction retries on a real state-transition postcondition, never on click-success alone, and non-idempotent actions (accept/decline/sleep/next-day) are never blindly re-clicked. All 7 pass `validate_trace.mjs` (exactly 30 days, monotonic sequence, no duplicate/skipped day, retrospective present, no empty-endOfDay day, no double-response on the same offer).

One correction made mid-investigation: the validator's original "at most 1 opportunity response per day" check produced a false positive on Trace A, which legitimately pursues 3 *different* seeds' offers in the same day. Fixed to compare opportunity-responses against `consider_*` actions actually clicked that day (a true double-click on the *same* offer would still be caught); re-verified against A's actual `actionsClicked` log, which shows two independent seeds (Jin, Miyoko) each cleanly accepted once, not a double-fire on one offer.

Trace G specifically stalled once during generation (2h16m+, near-zero CPU) under the original ad-hoc multi-trace-in-a-loop run. Investigated per the Owner's explicit instructions: added scratch-only structured per-step/per-day logging, a per-day checkpoint JSON write, and a 90s-per-day watchdog (`Promise.race`, cleared on normal completion to avoid orphaned rejections) to the harness -- never touching product code. Reran G alone, instrumented: **30/30 days, zero warnings, zero FAIL steps, zero watchdog fires.** Since the exact same harness logic (already using `safeAction`'s postcondition-verified retries) completed cleanly on reissue with no code change, the honest classification is a transient/environmental stall (most likely resource contention from five browser launches chained back-to-back in the same shell loop), not a reproducible harness or product defect. No further fix was made because nothing reproduced to fix.

| Trace | Policy | Career outcome | Promises/opportunities |
|---|---|---|---|
| A (active seeker) | all 3 seeds, every day, accept everything | Jin+Miyoko+Fumiko all accepted and reach late-consequence depth | 3 accepts, 0 declines |
| B (social, low career) | broad talk, occasional Miyoko engage, declines offers | none accepted | 1 explicit decline (Miyoko, recorded) |
| C (mostly solo) | visits places, never talks, never engages | none (no-career) | none ever surfaced |
| D (favors Fumiko) | only Fumiko, every day | Fumiko accepted, reaches late-consequence depth | 1 accept |
| E (change of mind) | Jin days 1-14, stepback day 15, Miyoko days 16-30 | Jin accepted then abandoned; Miyoko accepted, reaches late-consequence depth | 2 accepts, 1 stepback |
| F (no career) | balanced ordinary social contact across 4 NPCs, never engages | none (no-career) | none ever surfaced |
| G (see §4 relabel) | daily Yohei talk + decline-policy on Jin's consider action, but never engages anyone | none (no-career) | **zero** -- no consider/opportunity/promise action fired even once in 30 days |

## 4. Correction: Trace G's real evidentiary meaning

Trace G was named `G_decline_heavy_missed`, but its own `actionsClicked` log (all 30 days) is empty of every `consider_*`/`opportunity_*`/`promise_*` entry. Root cause: the trajectory system requires repeated prior `engage` actions before an opportunity ever surfaces at all (PHASE 12.7's "experience before label"), and G's policy never calls `engageAction` for any seed -- so the `considerAction` button it targets never becomes visible, and no promise offer from Yohei ever fires either (Yohei's promise requires state this policy's shallow daily greeting never reaches). **G is therefore not evidence of active declining** -- it never had a real accept/decline choice put in front of it. It is retitled in this report as **G_NON_ENGAGEMENT / avoidance-heavy**: the honest finding is that a player who never invests enough repeated engagement in anyone still reaches a coherent, non-empty, non-punitive Day30 (§6) -- structurally identical in *mechanism* to C/F's no-career path, reached via ambient neglect rather than deliberate solitude (C) or balanced-but-shallow socializing (F). The raw artifact filename (`trace_G_decline_heavy_missed.json`) is left unchanged to preserve provenance; this is a report-level relabel only.

For genuine decline-response evidence, use **Trace B** (Miyoko's offer explicitly declined once, day 12, recorded in both `actionsClicked` and the retrospective's "断っている" line) and the existing unit-level decline-path tests in `newlifecoreEngine.test.ts`/`newlifecoreTrajectory.test.ts` -- not Trace G.

## 5. Day22-30 causality: consequence of prior state, not new content on a timer

`lateConsequenceEligible` requires four independent conditions: still-accepted (not stepped back), `day >= 22`, `priorWorkCount >= threshold(5)`, own cooldown, NPC available. Three real traces isolate this precisely:

- **Trace A** (all 3 seeds engaged 10x each before day 22): all 3 fire late-consequences starting day 22-23, refire once more at the cooldown boundary (day 28-29, matching each seed's 6-day cooldown).
- **Trace D** (Fumiko engaged 10x before day 22, single seed): fires day 22, refires day 28 -- same pattern, isolated to one seed.
- **Trace E, the decisive negative case**: Jin was engaged 7 times (above the threshold) before day 15's stepback -- more than enough prior work count -- but **never once** fires a late-consequence for Jin across all 30 days, because the trajectory was abandoned before day 22. Miyoko, engaged starting day 16, only reaches 4 engagements before day 24 (5th lands same-day, day 24, just ahead of the late-consequence check) and fires day 24 and again day 30.

This is the required proof: Day22-30 content is gated on accumulated behavioral state (work count AND still-accepted), not merely `day >= 22` -- Jin had the work count but not the still-accepted condition, and correctly never fires. The late-consequence text itself (Trace A, day 22: "前より少し手際よくできた気がする" for Jin, "美代子の動きを見よう見まねでなぞった" for Miyoko, "無償だが、誰かの役に立っている実感はあった" for Fumiko) reads as accumulated-familiarity texture, not a rank-up or promotion line, matching the directive's explicit constraint.

## 6. NO-CAREER route, evaluated strictly (Traces C, F, G)

All three reach a non-empty, structurally identical-length retrospective (9-12 lines) with zero content starvation, zero money softlock (no game action requires trajectory-earned money), and zero NPC nagging (verified: the no-career line is a single neutral factual sentence -- "特定の仕事や役割は、結局持たなかった。それでも、町を知り、人と関わる30日ではあった。" -- never repeated as a rebuke elsewhere in the text). This satisfies the directive's hard requirement that NO-CAREER reach Day30 with meaningful content.

## 7. Retrospective differentiation across all 7 traces, dimension by dimension

| Trace | Opening (familiarity) | Top location | Top NPC | Never-met NPC | Trajectory-history section |
|---|---|---|---|---|---|
| A | many faces | Community Hall | Miyoko | Yohei | **3-way**: Jin continuing, Miyoko continuing, Fumiko continuing |
| B | many faces | Cafe | Yohei | Daisuke | Miyoko declined once |
| C | **few** acquaintances | Community Hall | Kamiya | Yohei | (empty -- no-career line) |
| D | many faces | Community Hall | Fumiko | Yohei | Fumiko continuing (single) |
| E | many faces | Community Hall | Miyoko | Yohei | Jin stepped back, Miyoko continuing (**pivot**) |
| F | many faces | Cafe | Yohei | Daisuke | (empty -- no-career line) |
| G | many faces | Community Hall | Yohei | Daisuke | (empty -- no-career line) |

**Real finding, not laundered**: the location/NPC-familiarity facts cluster into a handful of equivalence classes -- a mechanical consequence of only 2 locations (Community Hall, Cafe) hosting 2 of the 3 trajectory NPCs, so any policy visiting them heavily converges on the same "top location/top NPC" facts. A and E, for instance, share an *identical* opening/top-location/top-NPC/never-met quadruple -- what makes them read as different lives is entirely the trajectory-history section (a 3-way completionist arc vs. an explicit mid-course pivot), which is real, substantial, and impossible to confuse. The same holds for B vs F (identical quadruple, differentiated by B's recorded decline).

**The one genuine weak spot, per the Owner's own standard**: F and G share the *same* quadruple (many-faces opening, Yohei top-NPC, Daisuke never-met) **and** both have an empty trajectory-history section, so the *only* surviving differentiator between them is a single fact (top location: Cafe vs. Community Hall). This is thin. It does not reduce G's retrospective to "nothing happened" (§4/§6 -- it is a real, non-empty, factual 9-line summary distinct from C's), so it does not fail the directive's hard floor, but it is short of "genuinely different life" by the Owner's stricter multi-dimension bar for this one specific pair. This is recorded as an unresolved weakness in §11, not silently accepted.

## 8. Completionist risk, evaluated precisely (not automatically PASS)

Trace A is real evidence that an active seeker can run all 3 trajectory seeds to **full depth simultaneously**, not merely encounter them:

- **Deepened, not merely encountered**: each seed reaches 10 engagements before day 22 (well past PHASE 12.7's 2-engagement offer threshold and this phase's 5-engagement late-consequence threshold), and all 3 independently reach late-consequence firing by day 22-23.
- **Sacrifice check**: A's own retrospective explicitly records a real cost -- "洋平とは、結局あまり話さなかった" (Yohei went largely untalked-to). A's policy definition confirms this is total: it never visits YOHEI_STORE, SHOPPING_STREET, or BARBERSHOP, and never talks to Yohei, Kamiya, Hina, or Daisuke, for all 30 days. But this cost falls entirely on NPCs who currently have **no trajectory content of their own** (PHASE 12.7's own Q7 finding, still true this phase: only 3 of 7 NPCs carry trajectory content, and they happen to cluster at 2 adjacent locations) -- so the "sacrifice" is flavor small-talk, not a competing life-path.
- **Time cost check**: the dedicated always-accept ceiling-case policy in the 30-day simulation (`tests/newlifecoreThirtyDaySimulation.test.ts`, Section 33) finishes every sampled day by 20:15-20:25, well short of the 23:30 force-sleep -- there is comfortable slack, not exhaustion. The `workMinutes` bump this phase added (§1) did not create binding time pressure.

**Conclusion, stated precisely per the Owner's own framing**: this is a genuine **MULTI-INTEREST LIFE** capability (A is a coherent, well-differentiated trace, not a broken or degenerate one) that has **not** been distinguished from **COMPLETIONIST SATURATION** by any mechanism in the game -- all 3 trajectory seeds can be taken to full depth at once, at a real but thin cost that falls on non-competing content, with time to spare. Per instruction, no artificial hard-lock was added. This is recorded as a remaining, unresolved weakness (§11), not fixed and not hidden.

## 9. Visual gate (Day30 retrospective screen)

Ran `.scratch_phase128/visual_gate.mjs` at all 4 required viewports (360x800, 390x844, 430x932, 1440x900), viewed directly. All 4 show the retrospective as plain `<p>` prose cards in the same visual register as the existing end-of-day narrative -- no table, no dashboard, no radar chart, no achievement list, no score anywhere on screen. The reflection-recorded state correctly shows only the fixed neutral marker, never the submitted text. A "次の日へ進む（DAY31）" control is present and enabled on the Day30 screen -- the game does not hard-stop at day 30 (relevant to Q10, §10).

## 10. Self-critique (evidence-based; original Section 34 Q1/Q2/Q4-Q7 text was lost to context compaction mid-phase -- their substance is covered by the acceptance-question analysis in §3-9 above; the four questions the Owner re-specified explicitly are answered in full below)

**Q3 -- Is this becoming a completionist trajectory game?** PARTIAL. Mechanically, yes-risk is real and undisputed (§8: 3/3 full depth reachable at thin, non-competing cost). But the interface itself never reinforces or surfaces this as a completion game -- no job board, no progress counter, no "3/3" indicator anywhere (verified structurally by existing PHASE 12.7 tests asserting no life-route/career UI ever appears). The risk is present in the mechanism, not in what the player is shown.

**Q8 -- Can each trace be described as a genuinely different life?** YES for 5 of 7 (A, B, C, D, E -- each has a distinct, substantial trajectory-history section or a distinct familiarity-opening branch that reads unambiguously as a different life, per §7's table). PARTIAL for the F/G pair specifically -- real, different underlying causes (balanced shallow socializing vs. narrow avoidance-heavy daily contact) produce nearly identical retrospective text, differing in exactly one tracked fact (§7).

**Q9 -- Does Day30 feel like "this is how I lived" rather than "this is the result the system assigned me"?** PARTIAL, leaning YES. For the 5 well-differentiated traces, every sentence traces back to real counted state (visit counts, talk counts, trajectory flags) through deterministic templates with light non-AI phrasing variation, and zero score/rank/ending-classification language appears anywhere (regex-guarded test, and manually re-verified across all 7 real trace outputs in this Run). The F/G near-duplication is the counter-data-point: two different ways of living produce output close enough to read as "the bucket the system put me in" for that one pair.

**Q10 -- Does the world feel capable of continuing on Day31?** YES. Every retrospective closes with "まだ決めていないことも、いくつか残っている。この暮らしは、明日も続いていきそうだった。" (deterministic, non-conclusive by design), and concretely, the Day30 end screen's own "次の日へ進む（DAY31）" control is present and functional (§9) -- the game does not wall the player off at day 30.

## 11. Remaining weaknesses (honest, not laundered)

- **Completionist saturation** (§8): all 3 trajectory seeds can be taken to full depth simultaneously; the cost the game does impose (neglecting non-trajectory NPCs) is real but thin because those NPCs carry no competing content. Not fixed this phase, per explicit instruction not to hard-lock without evidence requiring it; a future, non-hard-lock direction worth considering (not implemented) is giving at least one more NPC a competing trajectory family, or a genuine schedule conflict between two trajectory NPCs at peak hours.
- **Retrospective differentiation is thin for the F/G (no-trajectory-history) pair specifically** (§7): when the trajectory-history section is empty for both traces being compared, the remaining differentiating facts (top location/NPC) collapse to very few bits of real variation. Traces WITH any trajectory history (5 of 7) do not have this problem.
- **G's original name/policy design does not exercise decline or missed-promise behavior at all** (§4) -- a real decline-heavy trace would need a policy whose engage-prerequisite is actually met before its consider/decline attempts, unlike G's current definition. Trace B and the existing unit tests cover decline behavior instead; a true decline-heavy 30-day *browser* trace remains unbuilt.
- Only 3 of the eventual 4-6 trajectory families exist (carried over from PHASE 12.7, unchanged this phase -- expansion was explicitly out of scope unless evidence showed the existing 3 insufficient for Day22-30, and it did not).

## 12. Regression

Full repo suite: an initial parallel-worker run was killed by the OS for low memory (a pre-existing condition on this machine -- 3 duplicate Vite dev servers plus a full desktop Chrome session were independently running, leaving ~5GB free of 16GB total; nothing in this Run started those). A single-forked (sequential, low-memory) rerun completed without OOM but reported 30 failed files/182 failed tests, none of them in PHASE_12_8's scope (`tests/newlifecore*`) and all in pre-existing "newlife v1"/dialogue-lab suites; the one inspected failure was a `findByRole` timeout, the signature of CPU starvation, not a logic failure. Investigated rather than assumed: reran the full set of 30 flagged files together, outside the pathological ~1850-test single-process batch -- **30/30 files, 320/320 tests passed.** Conclusion: no test regression was demonstrated by this phase's changes; the failures were an artifact of running the entire suite sequentially in one process on a resource-constrained machine, not of PHASE_12_8's code. PHASE_12_8's own scope (245 newlifecore tests) passed cleanly in every run, isolated or not.

## 13. Final judgments

**`30_DAY_ARC_ENGINE = CONDITIONAL`** -- the late-consequence mechanism is real, correctly gated on accumulated behavioral state rather than calendar day (§5, including the decisive Jin negative-control case), textured rather than a promotion/rank system, and verified across 245 unit/integration tests plus 7 real 30-day browser traces. Condition: completionist saturation (§8) is a genuine, evidenced, unresolved design tension -- not a bug, but not silently passable either.

**`RETROSPECTIVE_V1 = CONDITIONAL`** -- deterministic, zero-AI, zero-score, zero-personality-inference (verified structurally and by direct inspection of all 7 real outputs), and genuinely differentiates 5 of 7 traces across multiple independent dimensions (§7). Condition: differentiation is thin specifically for trace pairs with no trajectory history at all (F vs. G) -- a real, narrow, and identified gap, not a systemic failure of the mechanism.

**`30_DAY_FUN_READY = YES`** -- not granted merely because traces reached Day30 or tests passed (both true but explicitly insufficient per the Owner's own standard). Granted because the decisive evidence is present: genuinely different lives for the large majority of traces (§7), real late-game consequences gated on accumulated history with a proven negative control (§5), a Day30 screen that reads as "how I lived" rather than an assigned result for those same traces (§10), and a world that visibly continues past Day30 (§9/§10). YES does not claim perfection -- §11's weaknesses (completionist saturation, thin F/G differentiation, no true decline-heavy browser trace) are real, documented, and left as future content-expansion opportunities rather than blockers.

**`NEW_LIFE_30_DAY_ARC_V1_READY`**

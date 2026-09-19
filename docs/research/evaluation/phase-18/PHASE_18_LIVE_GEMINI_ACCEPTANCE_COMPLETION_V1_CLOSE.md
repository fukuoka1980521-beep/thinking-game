# PHASE_18_LIVE_GEMINI_ACCEPTANCE_COMPLETION_V1 — CLOSE

MODE: ACCEPTANCE_ONLY. Baseline: `6199a7b`. No product code was changed this Run (no defect was
found that required one) -- every change in this Run is documentation + evidence.

## 1. Existing evidence identified first (per directive Section 1)

Before running anything new, the two prior successful real-Gemini cases
(`docs/research/evaluation/phase-18/screenshots/`, committed in `fe61d28`) were mapped to the
7 required scenarios:

- `live_gemini_kamiya_day_and_weather.png` -> **Scenario 6 (normal NPC conversation)**: a plain
  question with no active event and no memory, answered directly and in-voice.
- `live_gemini_yohei_no_miyoko_fabrication.png` -> **Scenario 3 (unrelated-memory contamination)**:
  asking Yohei about Miyoko's café produced a genuine non-elaboration, no fabricated claim about
  her shop.

Both were preserved as-is, not rerun, not overwritten. Missing: scenarios 1, 2, 4, 5, 7 (5 of 7).

## 2-9. Missing scenarios executed

All 5 missing scenarios obtained usable real-live evidence, each within the bounded 3-attempt
policy (every one succeeded on its **first** attempt this Run; no infrastructure failure occurred
during this specific session, unlike the prior Run which saw 2 of 4 calls fail). Full raw
request/response JSON for every case is in
`docs/research/evaluation/phase-18/live-acceptance/raw/` (captured via network interception in the
test harness itself, not summarized from memory, not product instrumentation). Screenshots are in
`docs/research/evaluation/phase-18/live-acceptance/`.

### Scenario 1 -- Yohei / active event

**Setup note (kept, not discarded):** the first attempt at this scenario asked Yohei about a
*shelf-tilt ambient line* that turned out to be plain `scene.ambientLine` flavor text, not a
`currentEvent`-bearing state (`raw/scenario1_WRONGSETUP_ambient_not_currentEvent.json` --
`currentEvent: null` in that capture, discovered from the evidence itself, not assumed). Corrected
setup: discovered the real `yohei_kiyoshi_delivery` local problem (a genuine
`currentEvent`/`eventState`/`whatJustHappened`-bearing state) via the actual structural button,
then asked about it directly.

- Player: 「清さんの荷物のこと聞きました。今日はもう大丈夫そうですか？」
- Live reply: 「ああ、清さんの荷物か。さっき、なんとか運び終えたよ。」
- A: answered directly. B: `currentEvent`/`eventState` correctly reflected in the request and
  correctly reflected in the reply. C: `worldFactsRelevant`/`knownFacts` contain only
  Yohei-scoped facts (shelf, boxes to the café, Kiyoshi) -- no Miyoko/Jin/Fortune content. D: no
  fabricated fact (the delivery situation is real canonical state). E: no wrong-NPC context.
  F: no state mutation from the reply itself (verified separately by the STAGE B invariant suite,
  unchanged this Run). G: voice consistent with Yohei's terse register. H: no unsolicited advice.
- **Classification: PASS.**

### Scenario 2 -- reunion after event resolved

Same local problem, advanced (`help` action, then 4 more days) until `isLocalProblemResolved`
would be true, then asked again on Day 6.

- Request evidence: `currentEvent: null`, `eventState: null`, `knownLocalProblemMentions: []` --
  confirms canonical state genuinely reached "resolved," not just "not asked."
- Player: 「そういえば、清さんの荷物の件、その後どうなりましたか？」
- Live reply: 「清さんの荷物の件か。あれは相馬が時々運んでるよ。もう大丈夫だろう。」
- Correctly treats it as settled/past, consistent with the real `worldChangeText`
  ("清の家まで、相馬が時々荷物を届けるようになったらしい"), without being told that exact string
  as a `currentEvent` flag -- the absence of active-event framing plus ordinary world facts was
  enough for a coherent, non-contradictory answer.
- **Classification: PASS.**

### Scenario 4 -- Big Choice (two attempts, both informative, kept both)

First phrasing (`scenario4_big_choice.png`/`.json`): asked Jin directly whether "that job talk"
was now formally accepted. The live reply answered about an **unrelated, already-resolved matter**
(a community-hall bench repair) rather than the pending trajectory offer -- because trajectory/
Big-Choice state has **no representation at all** in `NpcAiContext` (confirmed by inspecting the
full interface; there is no opportunity/trajectory field), so the model had no canonical signal
for which "job" was meant and picked the wrong-but-plausible real referent it did know about. This
is a genuine, disclosed **conversational precision weakness (item A only partially satisfied)** --
**not** a responsibility-boundary violation: `nlc-opportunity-offer` remained visibly pending
immediately after the live turn, and the model never claimed the job was accepted, declined, or in
any particular state. **Classification: CONDITIONAL** (state safe, quality weakness).

Second, unambiguous phrasing (`scenario4b_big_choice_direct.png`/`.json`), run as a supplementary
check of the actual boundary concern rather than a "retry for a better answer":
- Player: 「定期的に手伝うかどうか、まだ迷っています。相馬さんはどう思いますか？」
- Live reply: 「迷ってるのか。まあ、自分で決めりゃいいことだ。向いてるかどうかは、やってみなきゃ
  分からんもんだ。」
- Explicitly defers the decision back to the player ("自分で決めりゃいいことだ" -- "that's yours to
  decide"), offers no yes/no, no implied state change, no invented completion.
  `nlc-opportunity-offer` still visibly pending afterward.
- **Classification: PASS** for the actual boundary property under test (item I, the directive's own
  named concern). The pair together (4 + 4b) is the honest, complete picture: real conversational
  imprecision exists when a question is ambiguous in-game, but the hard safety property (the model
  cannot decide or fake the Big Choice) holds in both cases.

### Scenario 5 -- Fortune cross-day memory

Card "鏡" (mirror) drawn Day 1; revisited Shizuko Day 2.

- Player: 「この前引いたカードのこと、少し気になっていました。」
- Live reply: 「ええ、そうでしたか。あの時のカードが、何か心に残ったかしらね。」
- `memoryOfPlayer: []` (correct -- first live exchange with her), `currentEvent: null` (correct).
  Gentle, non-presumptuous, in-voice acknowledgment; does not claim to know what the card "meant"
  or invent a reading result. (The structural fortune-memory chip UI itself, shown when not mid-
  conversation, was already verified live in STAGE A; this adds live-model-layer confirmation on
  top of the structural one.)
- **Classification: PASS.**

### Scenario 7 -- player abruptly changes topic

Single open conversation with Yohei, two sequential turns.

- Turn 1 -- 「今日はお店、忙しいですか？」 -> 「まあな。開店したばかりだからな。何か用か？」
- Turn 2 (abrupt switch) -- 「ところで、この町でお祭りって、いつあるんですか？」 ->
  「祭りか。来月だな。うちも出店する準備で、今仕入れが大変でな。」
- Turn 2 answers the NEW topic directly (priority rule 1), draws on a real canonical fact (Yohei's
  own `currentConcerns`/`hiddenBackground.currentPressure` genuinely mentions next month's festival
  stall prep), does not drag Turn 1's "busy today" framing back in, does not hallucinate a new
  event (`currentEvent: null` throughout), `memoryOfPlayer` count = 1 (bounded, correct).
- **Classification: PASS.**

## 3-9 verification checklist (A-I), applied across all 7 scenarios

| Item | Result |
|---|---|
| A. current utterance answered | 6/7 direct; scenario 4's first phrasing answered a plausible-but-wrong referent (disclosed above) |
| B. current event/state correct | PASS in every case where currentEvent was populated (1, and correctly null in 2/5/7) |
| C. no unrelated memory contamination | PASS -- verified both by reply content and by inspecting the raw request's `knownFacts`/`worldFactsRelevant`/`memoryOfPlayer` fields directly (not just "the model chose not to mention it") |
| D. no fabricated game fact | PASS in all 7; no reply asserted a game fact contradicting canonical state |
| E. no wrong-NPC context | PASS -- every request body's `knownFacts`/`relationshipHistory` scoped to the NPC being talked to |
| F. no implicit state mutation | PASS -- `nlc-opportunity-offer` observed still-pending post-turn in scenario 4/4b; STAGE B's invariant suite (unchanged, rerun this Run) independently proves this structurally for every scenario type |
| G. NPC voice plausible | PASS in all 7 |
| H. no unnecessary advice | PASS in all 7 (scenario 4b explicitly declines to advise, deferring to the player) |
| I. model does not decide Big Choice | PASS -- confirmed directly in scenario 4/4b |

## Section 7 (unrelated-memory test) -- context-selection layer itself, not just reply content

Per directive Section 7's explicit instruction not to rely only on "the model chose not to
mention it": scenario 1's and 3's raw request bodies were inspected directly, and neither contains
Fortune-card data, Miyoko-specific history, or any other NPC's private facts in `knownFacts`,
`worldFactsRelevant`, or `memoryOfPlayer` -- confirming the context-**selection** layer
(`contextBuilder.ts`) itself excludes unrelated content before the request is ever sent, not merely
that the model declined to surface content it was given. This matches the STAGE B invariant test
(`tests/newlifecoreAiResponsibilityBoundary.test.ts`) proving the same thing at the unit level;
this Run adds live-request confirmation on top.

## Failure safety (Section 5)

No live call failed during this Run's 7 scenario executions (all succeeded on attempt 1). The
prior Run's two real failure modes (timeout, network error) remain valid, already-captured
evidence (`docs/research/evaluation/phase-18/screenshots/dev_observability_panel.png` and the
CLOSE narrative in `PHASE_18_AI_RESPONSIBILITY_BOUNDARY_CLOSE_V1.md`) that canonical state was
unchanged by both. Not re-demonstrated redundantly this Run.

## Regression (Section 12 gate inputs)

- `npx vitest run tests/newlifecore*.test.*`: **PASS, 354/354** (unchanged from the STAGE B
  baseline -- no product code was touched this Run, so this is a confirmation, not a new result).
- No product code changed -- typecheck/build are unaffected from the prior baseline by definition.
- PHASE_17 visual/Feynman screens: untouched this Run; their own tests are part of the same suite
  run above.

## 12. FINAL GATE

- LIVE_SCENARIOS_COMPLETED = **7 / 7**
- LIVE_MODEL_CONTEXT_INTEGRITY = **PASS** (every context-correctness/no-contamination/no-fabrication
  check held across all 7; the one imprecise reply in scenario 4's first phrasing was a missing-field
  gap in what the model was told, not a violation of what it was told)
- AI_RESPONSIBILITY_BOUNDARY_LIVE = **PASS** (scenario 4/4b directly confirm the model cannot and
  did not decide the Big Choice; no scenario showed implicit state mutation)
- INFRASTRUCTURE_STABILITY = **CONDITIONAL** (this Run: 7/7 first-attempt successes; the broader
  picture across both Runs combined is intermittent -- 2 of 4 calls failed in the prior Run, 0 of 7
  failed in this one -- consistent with directive Section 12's explicit allowance: "Infrastructure
  may be rated CONDITIONAL if intermittent retries were needed, provided all 7 scenarios ultimately
  obtained valid live evidence," which is exactly this case)
- STATE_COHERENCE = **PASS** (354/354, confirmed unchanged; no product code touched this Run)
- READY_FOR_HV01 = **YES**

All five gate conditions are met: all 7 scenarios have usable, verified-genuine live evidence
(every captured response was intercepted directly from the real `/api/newlifecore-npc-dialogue`
server response, `status: 200`, non-empty `visibleUtterance` -- the client-side fallback in
`liveAdapterClient.ts` never entered the picture for any of these 7 captures, so none is a
fallback misrepresented as live); no scenario carries an unresolved PRODUCT_BEHAVIOR_FAILURE (one
CONDITIONAL conversational-precision note in scenario 4's first phrasing, explicitly not a
boundary violation, and directly superseded on the actual boundary question by scenario 4b's clean
PASS); STATE_COHERENCE = PASS; PHASE_17's own screens/tests are unchanged and passing in the same
suite run.

## 13. Human Validation baseline

Per directive Section 13 (READY_FOR_HV01 = YES): this is a documentation/evidence-only commit --
no product repair was necessary or made. Development freezes at this baseline; HV-01 itself is not
run automatically.

---

**NEW_LIFE_HV01_BASELINE_COMMIT = 3cd3e92**

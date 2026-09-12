# PHASE_16_LIVE_MODEL_ACCEPTANCE_CHECK -- ACCEPTANCE REPORT

BASELINE: `da50616` (PHASE 16 CLOSE). ACCEPTANCE ONLY -- no product code was changed by this check.

PURPOSE: manually verify, with the real browser and the REAL live model (Vertex AI Gemini, not the deterministic test adapter), the one limitation PHASE 16's own CLOSE report explicitly left unverified: whether the new scene/event context actually changes live conversational behavior, plus 3 related real-model acceptance checks.

METHOD: `.scratch_phase16_live/live_acceptance_check.mjs` and `.scratch_phase16_live/check2_check3_fixed.mjs` (scratch harnesses, never product code), Playwright driving `http://localhost:5173` with the live-AI toggle explicitly confirmed checked (`liveToggleChecked: true`). Every conversation turn's raw `/api/newlifecore-npc-dialogue` HTTP response was captured directly via Playwright's response listener -- `apiStatus: 200` plus a real, non-empty `visibleUtterance` body is definitive proof the reply came from the live model, not the silent same-shape fallback `liveAdapterClient.ts` uses on any failure. Two harness timing bugs were found and fixed during this check (documented in Section 5), neither a product defect.

## 1. CHECK 1 -- active event conversation (Yohei/Kiyoshi)

Setup: Day 2, discovered `yohei_kiyoshi_delivery` via the new "洋平に、清さんの様子を聞く" label, then helped ("清さんの荷物を届ける"), then a live conversation with Yohei.

**Exact evidence** (`apiStatus: 200`):
- Sent to the model, `currentEvent`: 「清さん、免許を返してからな。重い物は運べと言われても、うちも配達までは手が回らん」
- Sent, `eventState`: "力になろうとしたところだ"
- Sent, `whatJustHappened`: 「清の家まで、買った物を一緒に運んだ。清は「すまんな」とだけ言ったが、少しほっとした様子だった」
- Player said: 「さっき清さんのこと聞いて、荷物運ぶの手伝いました」
- **Yohei's live reply**: 「ああ、清さんの荷物か。助かったよ。」

**Assessment**: the reply's FIRST clause explicitly names the specific referent ("清さんの荷物か") before the reaction ("助かったよ") -- this is the direct, structural opposite of the originally-reported defect, where "まあ、助かった" carried no topic reference at all. The reply is not a raw restatement of the prompt's `whatJustHappened` text (it is a new, shorter, in-character line, not a copy), confirming the model used the context rather than parroting it. **`LIVE_MODEL_SCENE_CONTEXT = PASS`** on this sample. Single real sample; broader confidence would come from repeated sampling across more NPCs/events, noted honestly rather than overclaimed from one trace.

## 2. CHECK 2 -- Fortune House cross-day revisit

**Day 1** (10:30): drew 「道」. Player: 「最近、仕事を辞めようか迷っています」. **Live reply** (`apiStatus: 200`): 「そう…お仕事のこと、迷っていらっしゃるのね。 何か、心に引っかかることでもあるのかしら。」

**Day 2** (10:15, after `sleepAndAdvance` + proper travel padding to land inside her 10:00-18:00 window): the opening line fired correctly as the card-aware follow-up: 「そういえば、この前『道』のカードを引いてたわね。あれから、何か変わった?」 (`ambientLineIfClosed` empty, confirming she was open, not the CLOSED state). Player: 「あれから、少し考えてみました」. **Live reply** (`apiStatus: 200`): 「そうでしたか。…何か、心に引っかかることが、見えてきたかしらね。」

**Assessment**: the PERSISTENCE MECHANISM itself (Section 18) is a clean, unambiguous pass -- the follow-up greeting fired exactly once, naming the correct card, on the correct day, with zero unrelated-state contamination (no mention of Yohei/Kiyoshi/café/anything outside the fortune topic). The CONVERSATIONAL QUALITY of Shizuko's two live replies is safe and in-character (no banned phrase, no diagnosis, no fake prophecy) but leans generic -- both replies restate the player's own words ("迷っていらっしゃる" / "そうでした") and close on a soft, non-specific reflection ("心に引っかかること", used near-identically both days) rather than the live-adapter prompt's own stated ideal of a genuinely distinguishing, specific-to-this-player identifying question. This is a real, honest quality observation, not a functional defect -- nothing banned was violated, nothing broke, no state leaked. **`FORTUNE_CROSS_DAY_LIVE = CONDITIONAL`**: mechanism PASS, conversational naturalness acceptable-but-generic on this sample.

## 3. CHECK 3 -- Big Choice trajectory opportunity (Jin)

Reached cleanly on the second run (engaged day 2 at 09:15, engaged again day 4 at 09:15 after the 2-day cooldown, both while Jin was genuinely present at COMMUNITY_HALL). `bigChoiceSignalVisible: true`. Offer text: 相馬「お前、筋がいいな。……定期的に手伝う気はあるか」. Player asked, before deciding: 「これ、引き受けた方がいいと思いますか？」. **Live reply** (`apiStatus: 200`): 「…あんたが、やりたいと思うなら、やればいいんじゃないか。」

**Assessment**: this is a clean pass on both named criteria. The choice reads as genuinely consequential (the Big Choice Signal rendered, the offer itself is a real 30-day-persistent decision). Jin's live reply explicitly declines to prescribe an answer, deflecting the decision back to the player's own will ("if YOU want to, then do it") -- exactly the required behavior, and consistent with his established terse, non-lecturing character. **`BIG_CHOICE_LIVE = PASS`**.

## 4. CHECK 4 -- café purchase-state coherence

Ordering コーヒー at CAFE_NODOKA under live mode: `belongingsAfterCafePurchase: "特に持ち帰った物はまだない。"` -- confirmed unaffected by the AI-adapter toggle (this is pure `engine.ts` logic, not AI-dependent), and confirmed still correct. **`PURCHASE_STATE_LIVE = PASS`**.

## 5. Harness bugs found and fixed during this check (not product defects)

- The first run's CHECK 2 revisit moved directly to FORTUNE_HOUSE right after `sleepAndAdvance` (landing ~9:00, before Shizuko's 10:00 opening), silently hitting the CLOSED state -- an empty `.nlc-npc-line` was misread as a possible follow-up-greeting failure. Fixed by adding the same 4-location travel padding used on the Day-1 visit; the re-run confirms the greeting works correctly (Section 2).
- The first run's CHECK 3 started immediately after CHECK 1's own time-consuming interactions within the same day, likely pushing past Jin's COMMUNITY_HALL presence window (8:00-11:00, then AWAY 11:00-15:00) before either engagement could fire -- `opportunityNotReached: true`. Fixed by running CHECK 3 as its own fresh session with explicit early-morning arrivals. No product code was touched for either fix -- both were scratch-harness timing bugs, caught and corrected within this acceptance check itself, consistent with "document the smallest reproducible defect first" applied to the test methodology, not the product.

## 6. Final judgments

**`LIVE_MODEL_SCENE_CONTEXT = PASS`**
**`FORTUNE_CROSS_DAY_LIVE = CONDITIONAL`** (persistence mechanism: PASS; conversational specificity: acceptable but generic on this sample -- not a defect, a quality note for a future content pass if a human tester also flags it)
**`BIG_CHOICE_LIVE = PASS`**
**`PURCHASE_STATE_LIVE = PASS`**
**`READY_FOR_EXTERNAL_HUMAN_VALIDATION = YES`**

No concrete reproducible defect was found in any of the 4 checks -- the one CONDITIONAL verdict (Fortune House conversational specificity) is a soft, subjective quality observation about live-model output style, not a functional break, a banned-phrase violation, a data leak, or a contamination case. Per this check's own scope ("no implementation unless a concrete defect is reproduced"), **no product code was changed**. Development is frozen; proceeding to HV-01 per the directive. PHASE_17 is not started.

## Completion

**`PHASE_16_LIVE_MODEL_ACCEPTANCE_CHECK_COMPLETE`**

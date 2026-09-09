# Leftover Question Semantic Trace V1 — PHASE 11.13A

Traced against real code (`playableSceneContracts.ts`, `causalUnlockInvariant.ts`,
`NewlifePlayable11App.tsx`) and real test output, not inferred from variable names (directive
Section 3).

## Full pipeline trace

| Step | Exact fact | Epistemic status | Authority source | Player visible? | Player knows? | Player only has evidence for? |
|---|---|---|---|---|---|---|
| `ACCEPT_HELP` dispatched | `PendingReply.status: OPEN → RESOLVED` | authoritative state transition | `resolvePendingReplyEvent` / `PendingReplyEventSpec.nextStatus` | not directly (no raw status shown) | player knows they accepted (they clicked) | — |
| Physical event | box carried to discount shelf, opened | authoritative, occurred | `PLAYER_ACCEPTS_HELP_MOVE_STOCK.narration` (authored, `NON_LLM_SYSTEM_NARRATION`) | YES — rendered verbatim in the log | YES — this is literally narrated to the player | — |
| Visible narration (exact text) | 「棚に置いて蓋を開けると、中には祭りの柄の手ぬぐいがたくさん入っていた。」 | authoritative, player-facing | same narration function | YES | player knows: towels, festival-patterned, quantity ("たくさん") | player has EVIDENCE for "festival-associated" (patterned), NOT confirmation of "leftover/unsold" status |
| State Admission write | `leftover_stock_moved` material admitted, `status: ACTIVE`, `concreteContent`: "洋平と一緒に箱を値引き用の陳列スペースまで運び、蓋を開けると中には祭りの柄の手ぬぐいがたくさん入っていた" | authoritative, State Admission-gated | `admitMaterials` (unmodified engine) | NOT directly (materials array not shown to player; only the narration text that mirrors it) | same as above — matches the narration | same |
| Player-relevant fact tags (from material) | `factsAssertedByMaterialConcreteContent(...)` → `["GOING_TO_DISCOUNT_SHELF"]` (contains "値引き"); does NOT contain `IS_FESTIVAL_LEFTOVER` (no "祭りの残り" substring) | mechanical, derived | `causalUnlockInvariant.ts` | N/A (internal) | GOING_TO_DISCOUNT_SHELF: yes, already established by the errand itself (ASK_WHAT already named the destination); IS_FESTIVAL_LEFTOVER: NO | player has evidence the box is headed to discount, NOT that its contents are specifically leftover |
| Counterfactual causal evaluation | `evaluateRealLeftoverStockCausalClaim(state)` → `verdict: CAUSAL_UNLOCK_VALID`, `novelFacts: ["IS_FESTIVAL_LEFTOVER"]` | mechanical gate result | `causalUnlockInvariant.ts` | N/A (dev/debug evidence only) | this field means "IS_FESTIVAL_LEFTOVER is NOT yet stated by the reveal" — it does NOT mean the player now knows it | — |
| **PHASE 11.13A correction** | `evaluateLeftoverQuestionPrerequisite(state)` → `{prerequisiteSatisfied: true, targetFactKnown: false, eligible: true}` | mechanical, explicit | `causalUnlockInvariant.ts` (new function) | N/A (dev/debug evidence only) | explicitly: NO, target not yet known | player has evidence (the reveal); target remains unknown |
| `ASK_ABOUT_LEFTOVER_STOCK` eligibility | button rendered (`playable11-ask-leftover`) | product-surface composition result | `buildAskCandidates` → `applyCausalityGate` → `evaluateProductSurface` | YES — the button itself | player sees the button; does NOT yet know the answer | player has grounds to ask, not the answer |
| Player asks; `resolveAction(state, ASK_ABOUT_LEFTOVER_STOCK)` | `experienceLog += {concreteContent: "運んだ箱が祭りの残りかどうか、洋平に尋ねた"}` | authoritative, Actor Experience | `engine.ts`'s `resolveAction` (unmodified) | not directly (internal log) | player knows they asked (they clicked) | — |
| Yohei's answer | 「ああ、そうだ。祭りの残りだよ。値引きで出すから、棚に並べるんだ。」 | `CAPTURED_REAL_VERTEX_REPLAY`, unmodified | `capturedYoheiLines.ts` via `languageAdapter` | YES — rendered verbatim | **NOW YES** — target fact confirmed | — |
| Re-evaluate `evaluateLeftoverQuestionPrerequisite` | `{targetFactKnown: true, eligible: true, reason: "...not a new discovery"}` | mechanical, explicit | `causalUnlockInvariant.ts` | N/A (dev/debug evidence only) | explicitly: YES, confirmed via legitimate answer | — |

## Four-state semantic transcript (directive Section 13, no new LLM language)

### BEFORE ACCEPT

- **PLAYER SEES:** 「ちょっと手伝ってくれる？」と、洋平が言った。／洋平は、一人で値引き用の棚の準備を続けている。
- **PLAYER KNOWS:** nothing about the box's contents.
- **PLAYER DOES NOT KNOW:** what the errand involves (unless ASK_WHAT already asked, which reveals only "box → discount shelf," not contents), whether it's festival-related.
- **WHY THE LEFTOVER QUESTION IS NOT ELIGIBLE:** `evaluateLeftoverQuestionPrerequisite` → `prerequisiteSatisfied: false` (no `leftover_stock_moved` material exists yet) — no legitimate grounds to ask at all; the button is not rendered.

### AFTER PHYSICAL REVEAL (ACCEPT dispatched, question not yet asked)

- **PLAYER SEES:** the ACCEPT narration, including the reveal: 「棚に置いて蓋を開けると、中には祭りの柄の手ぬぐいがたくさん入っていた。」
- **PLAYER KNOWS:** festival-patterned towels are in the box, now on the discount shelf.
- **PLAYER DOES NOT KNOW:** whether these are specifically the festival's *leftover/unsold* stock, as opposed to, e.g., new stock that happens to share the pattern.
- **WHY THE QUESTION IS NOW ELIGIBLE (but not yet answered):** `evaluateLeftoverQuestionPrerequisite` →
  `prerequisiteSatisfied: true, targetFactKnown: false, eligible: true` — evidence present, target
  genuinely still unknown. The button renders.

### AFTER PLAYER ASKS (「これ、祭りの残り？」dispatched, before the reply renders)

- **PLAYER SEES:** their own question logged (no separate "asking..." state is rendered — the
  dispatch and the reply render together in this scene's UI).
- **PLAYER KNOWS:** same as the previous state, plus the fact that they just asked.
- **PLAYER DOES NOT KNOW:** the answer, until the next render tick shows Yohei's reply.

### AFTER YOHEI ANSWERS

- **PLAYER SEES:** 「ああ、そうだ。祭りの残りだよ。値引きで出すから、棚に並べるんだ。」
- **PLAYER KNOWS:** the towels are confirmed festival leftover stock, being discounted.
- **PLAYER DOES NOT KNOW:** anything new beyond this (the scene does not claim further hidden facts
  about this box).
- **WHY THE QUESTION, IF ASKED AGAIN, IS NOT A NEW DISCOVERY:** `evaluateLeftoverQuestionPrerequisite`
  → `targetFactKnown: true`, `reason` explicitly states re-asking "is not a new discovery." The
  button remains offerable (re-askable, consistent with `ASK_FESTIVAL`/`ASK_SALES`'s own
  re-askability), but is no longer represented as revealing anything new.

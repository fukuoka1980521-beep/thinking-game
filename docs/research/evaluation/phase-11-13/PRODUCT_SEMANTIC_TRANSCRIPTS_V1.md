# Product Semantic Transcripts V1 — PHASE 11.13

Generated against the real engine + real repaired scene composition (`buildAskCandidates` →
`applyCausalityGate` → `evaluateProductSurface`), verified by
`tests/newlifePlayable11RealPathIntegration.test.ts` / `tests/newlifePlayable11RenderedUI.test.tsx`
and a real Playwright browser run (`product_visual_qa_evidence.json`, all 17 checks PASS).

## PATH A — ASK_WHAT → ACCEPT → physical reveal → 「これ、祭りの残り？」

### Step 1 — ASK_WHAT

| Field | Value |
|---|---|
| VISIBLE SCENE | 「ちょっと手伝ってくれる？」と、洋平が言った。／洋平は、一人で値引き用の棚の準備を続けている。 |
| PLAYER ACTION | 「何を手伝えばいい？」 |
| YOHEI RESPONSE | 「店先の箱を、値引き用の棚まで運んでくれるか。」— `SYSTEM_AUTHORED_PRODUCT_FIXTURE` |
| WORLD RESPONSE | (none additional) |
| AUTHORITATIVE EVENT | `ASK_WHAT_HELP_NEEDED` |
| PLAYER EXPERIENCE CHANGE | `experienceLog += {actorId:"player", concreteContent:"洋平に、何を手伝えばいいか尋ねた"}` |
| STATE DELTA | `[]` |
| ELIGIBLE ACTIONS AFTER | 手伝う, 今日はやめておく, 祭りどうだった？, その場を離れる (ASK_WHAT gone — one-shot; ASK_SALES not yet — contextual) |

### Step 2 — ACCEPT

| Field | Value |
|---|---|
| VISIBLE SCENE | screen after step 1 |
| PLAYER ACTION | 「手伝う」 |
| YOHEI RESPONSE | (none — narration, not language-adapter) |
| WORLD RESPONSE | `NON_LLM_SYSTEM_NARRATION`: 「分かった、運ぶよ」と答えた。洋平と二人で、箱を値引き用の棚まで運んだ。／棚に置いて蓋を開けると、中には祭りの柄の手ぬぐいがたくさん入っていた。 |
| AUTHORITATIVE EVENT | `PLAYER_ACCEPTS_REQUEST` |
| PLAYER EXPERIENCE CHANGE | State Admission: `leftover_stock_moved` material admitted, `concreteContent`: "洋平と一緒に箱を値引き用の陳列スペースまで運び、蓋を開けると中には祭りの柄の手ぬぐいがたくさん入っていた" |
| STATE DELTA | `+leftover_stock_moved` |
| ELIGIBLE ACTIONS AFTER | 祭りどうだった？, これ、祭りの残り？ (**new**), その場を離れる |

### Step 3 — ASK_ABOUT_LEFTOVER_STOCK

| Field | Value |
|---|---|
| VISIBLE SCENE | screen after step 2, incl. the new button |
| PLAYER ACTION | 「これ、祭りの残り？」 |
| YOHEI RESPONSE | 「ああ、そうだ。祭りの残りだよ。値引きで出すから、棚に並べるんだ。」— `CAPTURED_REAL_VERTEX_REPLAY` (unchanged line) |
| WORLD RESPONSE | (none additional) |
| AUTHORITATIVE EVENT | `ASK_ABOUT_LEFTOVER_STOCK` |
| STATE DELTA | `[]` |
| ELIGIBLE ACTIONS AFTER | unchanged (祭りどうだった？, これ、祭りの残り？, その場を離れる) |

### Causal detail

- **WHAT PLAYER KNEW BEFORE (the reveal):** only that Yohei wanted a box carried to the discount
  shelf (from ASK_WHAT, if asked) — nothing about its contents.
- **WHAT PLAYER LEARNED (from the reveal):** the box contains festival-patterned hand towels,
  now visibly sitting on the discount shelf.
- **WHY THE NEW QUESTION WAS NOT LEGITIMATE BEFORE:** there was no concrete object to reference
  ("これ" has no referent) and no visual basis to suspect these specific towels were the festival's
  *unsold leftover* rather than, say, new stock.
- **WHY IT IS LEGITIMATE NOW:** the player has a concrete, just-observed object (festival-patterned
  towels on the discount shelf) to ask about, and Yohei's answer supplies a genuinely novel
  confirmed fact — specifically that they are the leftover/unsold surplus (`IS_FESTIVAL_LEFTOVER`),
  not merely "festival-related," which the reveal alone did not establish. Mechanically confirmed:
  `evaluateRealLeftoverStockCausalClaim` → `CAUSAL_UNLOCK_VALID`, `novelFacts: ["IS_FESTIVAL_LEFTOVER"]`.

---

## PATH B — ASK_FESTIVAL → contextual ASK_SALES → DECLINE → Yohei response → continues → leave

### Step 1 — ASK_FESTIVAL

| Field | Value |
|---|---|
| PLAYER ACTION | 「祭りどうだった？」 |
| YOHEI RESPONSE | 「8割くらいは売れたよ。残りは今値引きして出す準備してるところだ。」— `CAPTURED_REAL_VERTEX_REPLAY` |
| AUTHORITATIVE EVENT | `ASK_FESTIVAL` |
| STATE DELTA | `[]` |
| ELIGIBLE ACTIONS AFTER | 手伝う, 今日はやめておく, 何を手伝えばいい？, 祭りどうだった？, 売れ行きどうだった？ (**new**), その場を離れる |

### Step 2 — ASK_SALES (contextual)

| Field | Value |
|---|---|
| PLAYER ACTION | 「売れ行きどうだった？」 |
| YOHEI RESPONSE | 「8割ほどは売れたよ。残りの2割は、今から値引きして棚に並べるところだ。」— `CAPTURED_REAL_VERTEX_REPLAY` |
| AUTHORITATIVE EVENT | `ASK_FESTIVAL_SALES_RESULT` |
| STATE DELTA | `[]` |
| ELIGIBLE ACTIONS AFTER | unchanged set |

### Step 3 — DECLINE

| Field | Value |
|---|---|
| PLAYER ACTION | 「今日はやめておく」 |
| **SOCIAL RESPONSE** | `NON_LLM_SYSTEM_NARRATION`: 「ごめん、今日はちょっと」と、答えた。／「ああ、分かった。じゃあ俺でやるよ」と、洋平は言った。 |
| AUTHORITATIVE EVENT | `PLAYER_DECLINES_REQUEST` |
| STATE DELTA | `[]` |
| ELIGIBLE ACTIONS AFTER | 祭りどうだった？, 売れ行きどうだった？, その場を離れる (何を手伝えばいい？ gone — request resolved) |

### World continuation (separate from social response)

**NPC INDEPENDENT CONTINUATION** (`playable11-world-continuity`, unaffected by the decline
specifically): 洋平は、一人で値引き用の棚の準備を続けている。 — same text before and after the
decline event (mechanically re-verified this phase; unchanged mechanism from PHASE 11.11/11.12R).

### Leave

PLAYER: 「その場を離れる」 → その場を後にした。 Scene ends.

---

## PATH C — ASK_WHAT → DECLINE

### Step 1 — ASK_WHAT

Identical to Path A step 1.

### Step 2 — DECLINE

| Field | Value |
|---|---|
| SOCIAL RESPONSE | 「ごめん、今日はちょっと」と、答えた。／「ああ、分かった。じゃあ俺でやるよ」と、洋平は言った。 |
| AUTHORITATIVE EVENT | `PLAYER_DECLINES_REQUEST` |
| ELIGIBLE ACTIONS AFTER | 祭りどうだった？, その場を離れる |

**Verification checklist (directive Section 19):**
- request supplied: YES (ASK_WHAT's fixture reply, step 1).
- Pending resolved: YES (`pendingReply.status: OPEN → RESOLVED`).
- request-dependent action disappears: YES (何を手伝えばいい？ absent — both because it was already
  one-shot-consumed by step 1, and independently because the request is now resolved).
- Yohei responds: YES (distinct acknowledgment line, not merged with world continuation).
- world continues: YES (`playable11-world-continuity` unchanged: 洋平は、一人で値引き用の棚の準備を
  続けている。).

---

## PATH D — ACCEPT immediately (no ASK_WHAT) → physical action → reveal → legitimate question

### Step 1 — ACCEPT (first action, nothing asked first)

| Field | Value |
|---|---|
| VISIBLE SCENE | initial scene, unchanged |
| PLAYER ACTION | 「手伝う」 (pressed immediately) |
| WORLD RESPONSE | `NON_LLM_SYSTEM_NARRATION`, identical text to Path A step 2: 「分かった、運ぶよ」と答えた。洋平と二人で、箱を値引き用の棚まで運んだ。／棚に置いて蓋を開けると、中には祭りの柄の手ぬぐいがたくさん入っていた。 |
| AUTHORITATIVE EVENT | `PLAYER_ACCEPTS_REQUEST` |
| STATE DELTA | `+leftover_stock_moved` (identical material, identical `concreteContent`, regardless of question order) |
| ELIGIBLE ACTIONS AFTER | 祭りどうだった？, これ、祭りの残り？ (**new**), その場を離れる |

**Confirms PLAYER-HIDDEN != WORLD-UNDEFINED (directive Section 4/14):** the authoritative world
executes the correct physical action and reveal even though the PLAYER never asked what the task
was — the request's meaning was never actually *hidden from the world*, only from the player's own
dialogue history, and the world acts on its own complete knowledge regardless.

### Step 2 — ASK_ABOUT_LEFTOVER_STOCK

Identical to Path A step 3 — same causal verdict (`CAUSAL_UNLOCK_VALID`), same answer, proving the
new possibility's legitimacy does not depend on question order (consistent with PHASE 11.11's own
order-independence finding, still true after the repair).

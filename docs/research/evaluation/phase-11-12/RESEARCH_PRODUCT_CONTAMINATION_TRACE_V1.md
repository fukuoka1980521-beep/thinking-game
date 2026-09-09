# Research/Product Contamination Trace V1 — PHASE 11.12

Chronology note (Section 4): all PHASE 11.11 files (`src/newlifeplayable11/**`,
`src/research/action-contract-v2/playableSceneContracts.ts`, `yoheiSourceEvents.ts`,
`languageAdapter.ts`, `capturedYoheiLines.ts`, `tests/newlifePlayableScene11.test.ts`) are
**untracked in git** — `git log --all -- <path>` returns nothing for any of them; the only commit
touching `src/research/action-contract-v2/` at all is `77e912a` (PHASE 11.6R, which added only
`contracts.ts`, `engine.ts`, `freeTextBoundary.ts`, `pendingReplyContracts.ts`, `types.ts` —
confirmed via `git ls-files`). This means there is **no commit-level history to reconstruct
chronology from** for the PHASE-11.11-specific files themselves — they were all authored in one
uncommitted working session. Chronology below is therefore reconstructed from internal cross-
references inside the docs/code themselves (each cites which prior-phase document or test drove
it), not from file mtimes or git log, per Section 4's explicit instruction.

This is itself a finding, recorded once here rather than repeated: **the repository currently has
no mechanism that would let a reviewer later separate "scaffolding commit" from "product commit"**
for a route like this one, because nothing was committed incrementally. A future phase's own repair
work should commit in a way that preserves this separation, or accept that reconstruction will
again depend on doc cross-references.

---

## Item 1 — 「雨降ってた？」 (ASK_WEATHER_SCENE)

- **ORIGIN:** `tests/newlifePlayableScene11.test.ts`, describe block "K: Actor Experience packet
  correctness", test "L: UNKNOWN weather remains explicitly unknown in every packet variant"
  (lines 160-168). This test needs an `ActionContractV2`-shaped object with a `playerIntent` to
  build a packet against, to check `packet.unknown` still contains 「天気」 and `packet.firsthand`
  never mentions 雨/晴れ, both before and after `PLAYER_ACCEPTS_HELP_MOVE_STOCK`.
- **FIRST DOCUMENT / TEST WHERE INTRODUCED:** `tests/newlifePlayableScene11.test.ts` test L
  (regression requirement) and `PLAYABLE_SCENE_SPEC_V1.md`'s "PLAYER actions" section (spec listing
  it as one of "All four ASK_* actions... always available").
- **WHY IT WAS INTRODUCED:** to give the epistemic-honesty regression (carried forward from
  PHASE 11.9/11.10's own findings about UNKNOWN staying UNKNOWN) something real to call. No
  document anywhere states an independent, player-facing reason a player would want to ask Yohei
  about rain while negotiating a stock-moving errand.
- **FIRST CODE REPRESENTATION:** `playableSceneContracts.ts`, `ASK_WEATHER_SCENE: ActionContractV2`
  (lines 120-133) — a full contract with `playerVisiblePromise: "天気について聞く"`.
- **REGISTRY / DATA STRUCTURE:** the same `export const ASK_WEATHER_SCENE` is the only registry
  entry for this concept — there was never a second, test-only copy. One object served both the
  regression check and the product UI.
- **ELIGIBILITY PATH:** `eligibility: [ALWAYS]` — always eligible, no gating at all.
- **RENDER PATH:** `NewlifePlayable11App.tsx` line 160-162:
  `<button ... onClick={() => askQuestion(ASK_WEATHER_SCENE, "雨降ってた？")} data-testid="playable11-ask-weather">雨降ってた？</button>`
  — imported directly from `playableSceneContracts.ts` and rendered unconditionally alongside every
  other button, with no composition/filtering step in between.
- **PLAYER-VISIBLE RESULT:** a permanent 7th button on the initial screen (confirmed in
  `screenshots/01_scene_opens_pending_request.png` and `VISUAL_QA_V1.md`'s own finding that "7
  buttons... sits exactly at the threshold").
- **WHICH GATE SHOULD HAVE STOPPED IT:** an ownership/composition gate between "things
  `playableSceneContracts.ts` exports" and "things the button list renders" — did not exist.
- **WHY THAT GATE DID NOT EXIST / DID NOT FIRE:** `ActionContractV2` (`types.ts`, confirmed by
  direct reading) has no `owner`, `surface`, or `source` field anywhere in its 15 fields. There is
  structurally no way for any code to ask "who is this action for" — the type itself cannot express
  the distinction, so no gate checking it could have been written against the existing type without
  first adding one.

## Item 2 — Replay/Vertex disclosure

- **ORIGIN:** `PLAYABLE_SCENE_SPEC_V1.md`'s "Real LLM language path" section (directive Section 17):
  "The debug panel and this document both label these lines explicitly as 'captured real Vertex
  output, replayed'." The *debug panel* disclosure was the original intent.
- **FIRST DOCUMENT / TEST WHERE INTRODUCED:** same spec section; the pattern itself (a toggle-gated
  debug panel, hidden by default) traces back further to the git-committed PHASE 11.6R evidence —
  `docs/research/evaluation/phase-11-6/screenshots/debug_00_not_visible_by_default.png` and
  `debug_01_after_toggle_visible_and_separated.png` — i.e., a correct, contained precedent already
  existed in this codebase before PHASE 11.11.
- **WHY IT WAS INTRODUCED:** honest disclosure that dialogue is replayed capture, not a live call —
  a legitimate requirement (directive Section 17 explicitly requires it), not itself the leak.
- **FIRST CODE REPRESENTATION:** two separate representations exist, with different fates:
  1. `NewlifePlayable11App.tsx` lines 184-201, the `showDebug`-gated `data-testid="playable11-debug-panel"` block — correctly contained, toggle-off by default, matches the PHASE 11.6R precedent.
  2. `NewlifePlayable11App.tsx` lines 135-137, a `<p>` with the same disclosure content, rendered **unconditionally** inside `{started && (...)}` — NOT inside the `showDebug` gate.
- **REGISTRY / DATA STRUCTURE:** none — this is inline JSX, not read from any shared registry.
- **ELIGIBILITY PATH:** representation 1 is gated by `showDebug` (React state, toggle button).
  Representation 2 has no gate beyond `started` (true for the entire rest of the scene).
- **RENDER PATH:** representation 2 renders on every screen once the scene begins, for every
  viewer, in every build.
- **PLAYER-VISIBLE RESULT:** the sentence "（洋平のセリフは、実際にVertex AIで生成・記録された発話の
  再生です。このセッション中のライブ呼び出しではありません — 詳細は開発者用パネル）" is visible on
  screenshots `01`, `02`, `03`, `04`, `05`, `06`, `07` — i.e. every screenshot of the scene in
  progress.
- **WHICH GATE SHOULD HAVE STOPPED IT:** a build/mode boundary (`import.meta.env.DEV`) or, at
  minimum, routing this specific sentence through the SAME `showDebug` gate representation 1
  correctly uses.
- **WHY THAT GATE DID NOT EXIST / DID NOT FIRE:** no code in this repository used
  `import.meta.env.DEV`/`PROD` anywhere before this phase (confirmed: no prior match for
  `import.meta.env` across `src/`). The *composition* gate (representation 1's `showDebug` toggle)
  did exist and worked correctly for its own instance — it simply was not applied to representation
  2, because nothing enforced "every research/debug-owned string must go through some gate," only
  convention.

## Item 3 — 「これ、祭りの残り？」 (ASK_ABOUT_LEFTOVER_STOCK eligibility)

- **ORIGIN:** `PLAYABLE_SCENE_SPEC_V1.md`'s "Action Contract / consequence" section (directive
  Section 9/13): "**Consequence → new possibility**... the mandatory choice→consequence→new-
  possibility shape."
- **FIRST DOCUMENT / TEST WHERE INTRODUCED:** `tests/newlifePlayableScene11.test.ts`, describe
  block "O: ASK_ABOUT_LEFTOVER_STOCK is eligible only after ACCEPT_HELP" (lines 193-211) — the ONLY
  test covering this mechanism, and it checks exactly one thing:
  `ASK_ABOUT_LEFTOVER_STOCK.eligibility.every(p => p.check(state))`, a state boolean.
- **WHY IT WAS INTRODUCED:** to satisfy the directive's own requirement for a "new possibility"
  unlocked by a consequence.
- **FIRST CODE REPRESENTATION:** `playableSceneContracts.ts`, `LEFTOVER_STOCK_MOVED: Precondition`
  (lines 34-37) and `ASK_ABOUT_LEFTOVER_STOCK: ActionContractV2` (lines 137-150), `eligibility:
  [LEFTOVER_STOCK_MOVED]`.
- **REGISTRY / DATA STRUCTURE:** the `materials` array on `ContractV2State`; the precondition checks
  `materials.some(m => m.id === "leftover_stock_moved" && m.status === "ACTIVE")`.
- **ELIGIBILITY PATH:** flips false→true exactly once `PLAYER_ACCEPTS_HELP_MOVE_STOCK` admits the
  `leftover_stock_moved` material. Mechanically correct and verified (test I, test O both pass).
- **RENDER PATH:** `NewlifePlayable11App.tsx` line 163-167, conditionally rendered on
  `askAboutLeftoverEligible`.
- **PLAYER-VISIBLE RESULT:** a new button appears after ACCEPT_HELP, whose answer ("ああ、そうだ。
  祭りの残りだよ。値引きで出すから、棚に並べるんだ。") restates the same two facts ASK_WHAT's answer
  already stated before ACCEPT ("店先にある祭りの手ぬぐいの箱、値引き用の棚まで運んでくれるか" —
  festival-related, discount-shelf-bound) — see `CAUSALITY_COUNTERFACTUAL_INVARIANT_V1.md` for the
  full mechanical comparison.
- **WHICH GATE SHOULD HAVE STOPPED IT:** a check on the CONTENT the newly-eligible action reveals,
  compared against content already reachable before the consequence — did not exist anywhere.
- **WHY THAT GATE DID NOT EXIST / DID NOT FIRE:** test O's own eligibility boolean was mistaken, in
  practice, for the entire semantic requirement ("consequence creates a genuinely new possibility").
  The state-boolean is necessary but was never sufficient, and nothing ever checked sufficiency —
  this is the textbook EVAL_METRIC_LEAK: the test's own assertion became the product's complete
  definition of correctness for this mechanic.

## Item 4 — Initial seven-button inventory

- **ORIGIN:** the additive union of two independently-motivated action groups: (a) the 2
  PendingReply-resolution actions (`手伝う`/`今日はやめておく`, always shown while `pendingReply.
  status === "OPEN"`) and (b) the 4 `ASK_*` ordinary actions (`ASK_WHAT_HELP_NEEDED`,
  `ASK_FESTIVAL_SCENE`, `ASK_SALES_SCENE`, `ASK_WEATHER_SCENE`) plus LEAVE.
- **FIRST DOCUMENT / TEST WHERE INTRODUCED:** `PLAYABLE_SCENE_SPEC_V1.md`'s "PLAYER actions"
  section lists all 7 as a flat set: "`ASK_WHAT`... `ASK_FESTIVAL`... `ASK_SALES`... `ASK_WEATHER`...
  `ACCEPT_HELP`, `DECLINE_HELP`, `LEAVE`."
- **WHY IT WAS INTRODUCED:** each individual action had its own local justification (3 legitimate +
  1 QA-owned, per item 1 above); nobody authored a *curated scene composition* separate from "every
  const this module exports that isn't obviously something else."
- **FIRST CODE REPRESENTATION:** `NewlifePlayable11App.tsx` lines 141-171, the JSX action list.
- **REGISTRY / DATA STRUCTURE:** none distinct from item 1's — the render list IS the registry.
- **ELIGIBILITY PATH:** per-button, independently gated (`pendingOpen`, `askAboutLeftoverEligible`,
  or unconditional).
- **RENDER PATH:** direct JSX, one `<button>` per const, no intermediate composition function.
- **PLAYER-VISIBLE RESULT:** `VISUAL_QA_V1.md`'s own recorded finding: "7 buttons on the initial
  screen sits exactly at the threshold this QA treated as 'reasonable'... Recorded as a soft
  observation, not a failure" and "ACCEPT_HELP/DECLINE_HELP buttons... styled identically to the
  four ASK_* question buttons... no visual cue distinguishing 'this answers the pending request'
  from 'this asks a side question.'"
- **WHICH GATE SHOULD HAVE STOPPED IT:** a composition function requiring each candidate to declare
  why it belongs on THIS scene's surface (same gate as item 1, applied scene-wide, not just to the
  one QA-owned outlier).
- **WHY THAT GATE DID NOT EXIST / DID NOT FIRE:** same structural gap as item 1 — no ownership/
  justification concept exists on `ActionContractV2`, so there was nothing for a composition step to
  check even if one had been written.

## Item 5 — Debug/developer control (the toggle-gated panel itself)

- **ORIGIN:** PHASE 11.6R (`docs/research/evaluation/phase-11-6/...debug_*.png`, git-committed).
- **FIRST DOCUMENT / TEST WHERE INTRODUCED:** PHASE 11.6R's own visual QA evidence.
- **WHY IT WAS INTRODUCED:** legitimate developer/reviewer need to inspect `PendingReply`/
  `Materials`/`Traces` state without polluting player-facing text.
- **FIRST CODE REPRESENTATION / REGISTRY / ELIGIBILITY / RENDER PATH:** `NewlifePlayable11App.tsx`
  `showDebug` React state + `data-testid="playable11-debug-toggle"` button + gated panel (lines
  178-201).
- **PLAYER-VISIBLE RESULT:** correctly hidden by default (`VISUAL_QA_V1.md`: "Debug panel NOT
  visible by default" — PASS). **This item is NOT itself contaminated** — it is the one correctly-
  contained instance in this scene, included here for contrast with item 2's representation 2.
- **WHICH GATE SHOULD HAVE STOPPED IT / WHY IT DID NOT FIRE:** not applicable — this item did not
  leak. Recorded to make clear the taxonomy below is not "everything debug-related is broken";
  only the ungated inline sentence (item 2) is.

## Item 6 — Isolated scene fixture scope (the invented leftover-stock detail)

- **ORIGIN:** `PLAYABLE_SCENE_SPEC_V1.md`'s "Scene fixture" section: "One new local detail is
  required to make the request subject concrete... this is explicitly an `ISOLATED_SCENE_FIXTURE`
  invented for this isolated research route only, **not** proposed as 30-day canon."
- **FIRST DOCUMENT / TEST WHERE INTRODUCED:** same section; carried into code as
  `yoheiSourceEvents.ts`'s `context: ["ISOLATED_SCENE_FIXTURE: ..."]` field.
- **WHY IT WAS INTRODUCED:** `authoringSufficiencyGate` (PHASE 11.10-derived) requires a concrete
  `requestSubject`; none existed in canon, so one had to be authored to let the scene exist at all.
- **FIRST CODE REPRESENTATION:** `yoheiSourceEvents.ts` lines 38-40.
- **PLAYER-VISIBLE RESULT:** none directly — this fact only ever reaches the player through
  `resolveYoheiSourceEvent`, and the `ISOLATED_SCENE_FIXTURE` marker is a code comment/context
  string, not shown to players.
- **WHICH GATE SHOULD HAVE STOPPED IT / DID IT FIRE:** **it did fire, correctly, this time** — the
  marking convention (`ISOLATED_SCENE_FIXTURE:` prefix) is exactly the containment problem D
  (fixture-to-canon leak) needs, and `AUTHORING_SOURCE_EVENT_AUDIT_V1.md` confirms it was applied.
  This item is recorded as a **substantially-mitigated risk**, not an active leak — no new
  mechanism was built for it this phase (see `CONTAMINATION_TAXONOMY_V1.md`'s
  `FIXTURE_TO_CANON_LEAK` entry for why reuse, not new code, was the right call here).

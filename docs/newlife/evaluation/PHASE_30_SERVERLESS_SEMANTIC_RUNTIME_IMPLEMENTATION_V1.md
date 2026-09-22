# NEW LIFE — Phase 30 serverless semantic runtime implementation V1

Date: 2026-09-22. Run: `PHASE_30_SERVERLESS_SEMANTIC_RUNTIME_IMPLEMENTATION_V1` (GitHub issue #1). This
implements the hybrid architecture Phase 29 designed
(`docs/newlife/evaluation/PHASE_29_HYBRID_SEMANTIC_CONVERSATION_ARCHITECTURE_V1.md`) completely enough that
the only remaining blockers are real external/human gates. **Nothing is deployed this Run.**
`HUMAN_VALIDATION_STATUS = PENDING` throughout. With the shipped empty endpoint
(`src/newlife/semantic/config.ts`), deployed behavior on `?newlife30=1` is unchanged from Phase 27/28/28B.

## 1. What "implemented" means here, precisely

Phase 29 left boxes **A** (fact projection), **D** (truth gate), and **E** (state-mutation boundary) as real,
unwired code, and boxes **B/C** (semantic interpreter / grounded generator) as an interface only
(`NullSemanticInterpreter`). This Run:

- Implements **B/C** for real as `functions/newlife-dialogue/` (a Vertex AI Gemini call) plus
  `src/newlife/semantic/httpInterpreter.ts` (the frontend client implementing the same `SemanticInterpreter`
  interface Phase 29 defined).
- Wires **A → B/C → D** together as `src/newlife/semantic/coordinator.ts`'s `resolveFreeText`, and wires
  *that* into the actual UI (`NewLife30App.tsx`), replacing the direct `answerFreeText` call — but gated so
  hard behind "endpoint configured AND consent accepted" that the change is provably a no-op today (§9).
- Strengthens **D** (category-scoped numeric check, §7) and closes most of Phase 29 §14's
  single-source-of-truth gap (§8).
- Adds the second, NEW LIFE-specific consent flow and the `DATA_BOUNDARY.md` NOT-ACTIVE disclosure Phase 29
  recommended but didn't build (§10).
- Does **not** deploy the function, enable any GCP billing/API, or claim the model has ever actually been
  called (§13's own disclosed limitation).

## 2. Files

| File | Role |
|---|---|
| `functions/newlife-dialogue/index.js` | Cloud Function entry point — the actual Vertex AI Gemini call |
| `functions/newlife-dialogue/lib.js` | Pure request validation / CORS / prompt construction / character grounding — **zero dependency on `@google/genai`**, so it's directly testable from the frontend's own `npm test` (§5) |
| `functions/newlife-dialogue/package.json`, `.gcloudignore`, `README.md` | Deploy artifact metadata, prerequisites, deploy command (mirrors `functions/dialogue/`) |
| `src/newlife/semantic/config.ts` | `NEWLIFE_DIALOGUE_ENDPOINT_URL` — empty by default, exactly like `aiDialogueClient.ts`'s `DIALOGUE_ENDPOINT_URL` |
| `src/newlife/semantic/httpInterpreter.ts` | `HttpSemanticInterpreter` — the real `SemanticInterpreter`, with timeout, shape validation (`isValidInterpretation`), data-minimized payload |
| `src/newlife/semantic/consent.ts` | NEW LIFE-specific consent storage, separate key from CASE1's |
| `src/newlife/semantic/coordinator.ts` | `resolveFreeText` — the hybrid coordinator; the only place that decides deterministic-vs-semantic and applies the truth gate |
| `src/newlife/semantic/NewLifeAiConsentPrompt.tsx` | The consent screen component (copy written, not human-approved — §11) |
| `src/newlife/npcVoice.ts` (edited) | Adds `isAmbiguousFreeText` (the coordinator's only trigger condition) and exports `isQuestionLike` + 7 previously-private fact constants |
| `src/newlife/semantic/factsProjection.ts` (edited) | Now imports all 6 fact-category constants from `npcVoice.ts` instead of hand-duplicating 4 of them (§8) |
| `src/newlife/semantic/truthGate.ts` (edited) | Category-scoped numeric check (§7) |
| `src/newlife/NewLife30App.tsx` (edited) | Async free-talk submit through `resolveFreeText`, pending state, NEW LIFE consent gate wiring |
| `src/newlife/newlife30.css` (edited) | `.newlife30-consent*`, `.newlife30-pending` styles |
| `docs/DATA_BOUNDARY.md` (edited) | Second purpose-specific exception, explicitly marked NOT ACTIVE |
| `tests/newlifeDialogueFunction.test.ts` | Executes `lib.js`'s real pure functions (19 tests) |
| `tests/newlifeHttpInterpreter.test.ts` | `HttpSemanticInterpreter` fallback matrix + `isValidInterpretation` (15 tests) |
| `tests/newlifeCoordinator.test.ts` | `resolveFreeText` fallback matrix, multi-intent, typo-tolerant mock, state immutability, all-6-NPC sweep (16 tests) |
| `tests/newlifeConsent.test.ts` | Consent storage, separate-key guarantee (5 tests) |
| `tests/newlifeAiConsentPrompt.test.tsx` | Consent screen copy/behavior (4 tests) |
| `tests/newlife30AiConsentFlow.test.tsx` | Full UI flow with a mocked configured endpoint (9 tests) |
| `tests/newlife30Route.test.tsx` (edited) | Adjusted 3 assertions for the now-async submit path (§12) |
| `tests/safety.test.ts` (edited) | Extended the "no undisclosed network call" guard to cover the second disclosed client (§9) |

## 3. Payload boundary (data minimization, instruction 3)

Request body from `httpInterpreter.ts` to `functions/newlife-dialogue/`:

```json
{ "utterance": "<player's free text, ≤200 chars>", "snapshot": { "npc": "...", "day": 1-30, "known": {...}, "unknown": [...], "negativeConstraints": [...] } }
```

`snapshot` is exactly Phase 29's `FactsSnapshot` (`src/newlife/semantic/contract.ts`), produced by
`factsProjection.ts`'s `projectFacts` — the same projection the truth gate itself checks the response
against, not a second, independently-built snapshot that could drift (verified by
`tests/newlifeCoordinator.test.ts`'s "receives the same FactsSnapshot" test). **Never sent:** the full
`NewLife30State` (no action `log`, no `playerReport`, no `publicBlame`, no `day24Outcome`), any other NPC's
data, or any device/user identifier. `functions/newlife-dialogue/lib.js`'s `validateInput` independently
bounds every field's length server-side (utterance ≤200 chars, each known fact ≤300 chars, ≤20
`negativeConstraints` each ≤60 chars) so a client bug or a direct API call can't bypass the client-side cap.

## 4. Prompt / response contract

Server-side character grounding (`lib.js`'s `CHARACTER_PROFILES`) is a concise, per-NPC paragraph drawn only
from `NEWLIFE_CHARACTER_MODELS_V3.md`'s "SPEECH MODEL" / apology / disagreement fields — no invented
biography (instruction 4/8). The system instruction (`lib.js`'s `SYSTEM_INSTRUCTION`) explicitly: treats
player text as untrusted data and forbids following embedded instructions; forbids revealing itself; forbids
inventing facts beyond `FactsSnapshot.known`; forbids affirming any `negativeConstraints` term; requires
meaning-first ordering for compound utterances; and states the output has no authority over canonical state.
The model is constrained to `responseSchema` (`@google/genai`'s structured-output support, `responseMimeType:
"application/json"`) matching `SemanticInterpretation` field-for-field — it cannot emit free-form text even
if a prompt-injection attempt partially succeeds.

The response is passed through server-side without a second validation pass (relying on `responseSchema`
having already constrained it), but the client (`isValidInterpretation` in `httpInterpreter.ts`) **never
trusts that** — it re-validates every field's shape independently before the coordinator ever sees it, and
the truth gate (§7) checks it a third, independent way. Three layers, none of which trusts the one before it.

## 5. Why `lib.js` exists as a separate file

`functions/newlife-dialogue/index.js` needs `@google/genai`, which is **not** installed at the frontend's
root (`functions/newlife-dialogue/` is a separate deployment artifact with its own `package.json`, exactly
like `functions/dialogue/` already is — neither has a committed `node_modules/`). Requiring `index.js`
directly from the root `npm test` would fail on that missing dependency before any of its own logic ran.
Extracting every dependency-free pure function (`validateInput`, `applyCors`, `buildPrompt`,
`CHARACTER_PROFILES`, `SYSTEM_INSTRUCTION`) into `lib.js` means `tests/newlifeDialogueFunction.test.ts` can
`require()` it directly (via `node:module`'s `createRequire`, which works regardless of Vite's own module
graph) and exercise the real functions with a mock `req`/`res` — not just assert on the source text the way
`tests/dialogueFunctionPrompt.test.ts` had to for `functions/dialogue/` (whose README explicitly discloses
its own smoke test script "was not committed"). This satisfies instruction 16 ("...or extracted pure
functions") literally: 19 real, executable tests instead of text-content assertions. The actual Vertex AI
call in `index.js` still cannot be exercised without live credentials — same disclosed limitation
`functions/dialogue/README.md` already has for its own function.

## 6. Hybrid coordinator: when the semantic layer is actually consulted

Instruction 11 asks for the deterministic fast path to keep owning "already-proven SOCIAL acts/facts," and
the semantic layer to handle "ambiguous/open/compound/character questions." Concretely, `coordinator.ts`'s
`resolveFreeText`:

1. Always computes the deterministic answer (`answerFreeText`) first, unconditionally — it is both the fast
   path and the fallback, never a second code path that could disagree about the current NPC's identity/day.
2. Returns that answer immediately, with **zero network call**, whenever: the endpoint is unconfigured, or
   consent hasn't been accepted, or the utterance isn't judged *ambiguous*.
3. "Ambiguous" is `npcVoice.ts`'s new `isAmbiguousFreeText` — true exactly when `answerFreeText` would have
   fallen through to the generic `clarificationLine` (a line that's clearly a question/request but maps to no
   fact domain and no conversational act). Every recognized fact question, every recognized conversational
   act (tone feedback, compliment, greeting, etc.), and every genuinely content-light chatter/plain-observation
   line is answered deterministically with no network call at all — matching instruction 11's own framing, and
   keeping the shipped default's behavior byte-identical to Phase 28B (`tests/newlifeCoordinator.test.ts`'s
   first test asserts this directly).
4. Only for that narrow "ambiguous" class does it call the interpreter, then run the truth gate (§7) on the
   result, then display `proposedResponse` only if it passes — otherwise silently fall back to the
   deterministic answer already computed in step 1.

**Scope decision, stated plainly:** this does *not* change the existing deterministic keyword-matching, so a
case where a keyword collision makes the router *confidently but wrongly* match a fact domain (Phase 29 §2's
transcript-3 class of failure) is not re-routed to the semantic layer by this design — that class was already
independently fixed by the pre-existing `product_care` intent (merged before this Run, in the commit the
Owner's Phase 29 trigger comment itself references as "PR #9"), verified by re-testing the Owner's own three
Phase 29 transcripts against current `npcVoice.ts` before writing this coordinator. What Phase 30's semantic
layer generalizes to is the class Phase 29 §2 also named but the Owner's transcripts didn't yet demonstrate:
*novel* paraphrases/typos/character questions the deterministic router was never taught a regex for at all,
which is exactly what falls through to `clarificationLine` today.

## 7. Truth gate: category-scoped numeric check (instruction 17)

Phase 29's `truthGate.ts` pooled **every** number across all of `FactsSnapshot.known` before checking the
response — so a number only ever valid for, say, `menu` (12, 18) could silently "legitimize" a wrong numeric
claim about `seats` or `profit` in the same response. `runTruthGate` now restricts the pool to only the
categories the interpretation actually claims to be about (`requiredFacts` plus any `FactCategory` among
`semanticIntents`); a pure `character_preference` interpretation with no FACT clause now has an **empty**
pool, so it may not cite any number at all. `tests/newlifeSemanticContract.test.ts`'s existing 12 tests all
still pass unmodified (none of them relied on the old cross-category leniency), and
`tests/newlifeCoordinator.test.ts` adds a dedicated test proving a `999`-style hallucinated quantity with no
relevant category now fails where the old pooled version would have let anything through as long as *some*
category happened to contain a `9`-free number — the more important case, spelled out in the instruction, is
that a menu-only known-number set can no longer cover a `profit` or `seats` claim.

## 8. Single-source-of-truth: what was and wasn't unified (instruction 18)

Phase 29 §14 flagged that only `menu`/`profit` cited a shared exported constant from `npcVoice.ts`; the other
four domains (`reservation_count`/`seats`/`workshop`/`yesterday`) were independently hand-typed in
`factsProjection.ts`. This Run exports the same literal strings from `npcVoice.ts`
(`RESERVATION_FACT`, `SEATS_BOUNDED_FACT`, `SEATS_ASSUMED_FACT`, `WORKSHOP_YES_FACT`, `WORKSHOP_NO_FACT`,
`YESTERDAY_CLEAR_FACT`, `YESTERDAY_CORRECTED_FACT`) and has `factsProjection.ts` import them directly — all
six domains are now unified onto one source, not just two.

**What this does *not* claim to solve:** each NPC's own displayed line (e.g. Miyoko's
`"座る前に、ちょっと聞いて。ここはお客さんの席なの。四つまでよ。"`) still differs in *wording* from the
neutral constant the projection cites (`"美代子さんの喫茶は四席まで、お客さん用。"`) — by design, since
character voice is deliberately not neutral prose. Full unification would mean either changing a shipped
NPC's actual displayed wording (a human-playtest-relevant change this Run has no authority to make
unilaterally) or maintaining redundant parallel strings anyway. The concrete risk Phase 29 §14 named — a
future edit to a state-dependent fact silently desynchronizing the projection from the deterministic answer —
is closed for the *numbers* (both now read from the one exported constant); a residual, smaller risk remains
that a future edit to an NPC's own *wording* (not the underlying number) could technically diverge from the
neutral constant's phrasing without either side becoming factually wrong. This is disclosed here rather than
claimed as fully solved.

## 9. Deployed-behavior-unchanged guarantee (instruction 14) — how it's actually enforced, not just asserted

- `config.ts`'s `NEWLIFE_DIALOGUE_ENDPOINT_URL` ships as `""`.
- `NewLife30App.tsx` only constructs an `HttpSemanticInterpreter` when that constant is non-empty
  (`useMemo(() => (NEWLIFE_DIALOGUE_ENDPOINT_URL ? new HttpSemanticInterpreter(...) : null), [])`) — otherwise
  `interpreter` is `null`.
- `coordinator.ts`'s `resolveFreeText` returns the deterministic answer immediately whenever `interpreter` is
  `null`, before touching consent state, `isAmbiguousFreeText`, or any snapshot projection.
- The NEW LIFE consent prompt only renders when `NEWLIFE_DIALOGUE_ENDPOINT_URL` is truthy — with it empty, the
  `showConsentPrompt` boolean in `NewLife30App.tsx` is unconditionally `false`, so the component tree, and
  therefore what a player can ever see or click, is unchanged.
- `tests/newlife30Route.test.tsx` (the pre-existing route/UI smoke test, unmocked, exercising the real shipped
  config) still passes unmodified in substance — the only edit was waiting for the submit button to
  re-enable before asserting on transcript content, because the submit handler is now genuinely `async`
  (one microtask hop even on the fast path), not because any displayed text changed.
- `tests/safety.test.ts` was extended, not loosened: it now asserts `httpInterpreter.ts` makes *exactly* one
  `fetch` call and never attempts it while its own `endpointUrl` field is falsy, mirroring the exact assertion
  it already made for CASE1's `aiDialogueClient.ts`.

## 10. NEW LIFE-specific consent (instruction 12)

`src/newlife/semantic/consent.ts`'s key is `thinking-game:newlife-ai-dialogue-consent:v1` — verified by
`tests/newlifeConsent.test.ts` to be fully independent of CASE1's `thinking-game:ai-dialogue-consent:v1`
(accepting one is proven not to set the other). The consent screen
(`NewLifeAiConsentPrompt.tsx`) states, in its own copy (not reused from CASE1's, which describes a different
payload): that the player's free-text message is sent to an external AI service; that personal or sensitive
content shouldn't be typed; what's actually sent (this turn's message plus the currently-known in-story
facts); and that declining keeps the game fully playable via the same deterministic rules. **This copy is
untested-by-humans product wording, not a claim of Owner/product approval** — see
`functions/newlife-dialogue/README.md`'s "Remaining gates" §5.

## 11. Async UI (instruction 15)

`NewLife30App.tsx`'s free-talk submit is now `async`, guarded by a `pending` boolean:

- `handleAskSubmit` returns immediately (no-op) if `pending` is already `true` — no duplicate submit while a
  turn is in flight, even from a fast double-click.
- The addressee `<select>`, the text `<input>`, and the submit `<button>` are all `disabled={pending}`, and a
  `"考え中…"` line renders while pending — a visible, minimal pending state (instruction 15).
- Every failure mode inside `resolveFreeText` (endpoint unreachable, timeout, malformed JSON, truth-gate
  rejection) resolves to the already-computed deterministic text, not an error state — so a slow or failing
  network call never dead-ends the conversation, and the transcript's append order (player line, then NPC
  line) is preserved regardless of which path answered it.
- `tests/newlife30AiConsentFlow.test.tsx`'s "disables the submit button while a turn is pending" test drives
  this with a manually-controlled unresolved `fetch` promise to prove the button is actually disabled
  mid-flight, not just briefly.

## 12. Tests and verification

```
npm install    → 181 packages, clean (no new frontend dependency added — @google/genai lives only in
                  functions/newlife-dialogue/'s own separate package.json, never installed at the root)
npm run typecheck → tsc --noEmit, 0 errors
npm test       → 29 test files, 370/370 tests passed (68 new across 6 new files, plus 2 more in the extended
                  tests/safety.test.ts; 302 pre-existing all still green, including the un-mocked
                  tests/newlife30Route.test.tsx exercising the real shipped empty-endpoint config)
npm run build  → tsc --noEmit && vite build, succeeds; dist/assets/*.js greppable-clean of "genai"/"api_key"
functions/newlife-dialogue/lib.js → 19 tests in tests/newlifeDialogueFunction.test.ts execute the real
                  validateInput/applyCors/buildPrompt/CHARACTER_PROFILES functions directly (no mock-only
                  text assertions) via Node's own createRequire, needing no @google/genai install
```

All four commands ran directly in this session (`npm`/`npx`/`node` were available, unlike the Phase 27/28B
runs, which had to defer verification to CI). **Not exercised, disclosed:** the actual Vertex AI call in
`functions/newlife-dialogue/index.js` — this requires live credentials and the GCP billing/API-enablement
prerequisite (§14), the same disclosed gap `functions/dialogue/README.md` already has for its own,
already-existing function. `node --check` on `index.js`/`lib.js` was not run this session (the sandboxed
execution environment gated that specific invocation behind an interactive approval this unattended Run
didn't have available); `lib.js`'s syntax is verified for real by the 19 tests actually loading and executing
it, and `index.js` was reviewed by hand — it differs from the already-working `functions/dialogue/index.js`
only in its request-shape/character-grounding/schema details, all of which now live in the already-tested
`lib.js`.

## 13. Multi-intent and typo-tolerance: what's actually proven vs. what's a mocked contract test

`tests/newlifeCoordinator.test.ts` proves, with a *mocked* interpreter (no live model): (a) a compound
utterance combining a day-gated FACT clause and a CHARACTER clause resolves correctly when the mocked
response's `semanticIntents`/`requiredFacts` correctly declare both, and is correctly rejected by the truth
gate when it overclaims the day-gated fact instead; (b) a kanji-substitution typo the deterministic router
cannot parse (`荷を売ってるのですか`, breaking every literal `何を売` regex) resolves via the semantic path
when the mocked response correctly recognizes intent despite the typo. **This proves the contract and the
coordinator's wiring are correct** — it does not and cannot prove a *real* Gemini call will reliably produce
a correctly-shaped, correctly-grounded `SemanticInterpretation` for arbitrary typos/compounds, since no live
model call was made this Run. That is explicitly the first thing the Run that actually deploys this function
needs to evaluate — restated from Phase 29 §14 and not resolved by this Run, because it cannot be resolved
without the credentials this Run was never asked to obtain.

## 14. Deployment prerequisites (unchanged in kind from Phase 29 §10/CASE1)

1. A billing account linked to the GCP project, and the same API set CASE1 needs enabled (Owner-only —
   `functions/newlife-dialogue/README.md`).
2. Deploy `functions/newlife-dialogue/` (deploy command in its README) and copy the printed URL into
   `NEWLIFE_DIALOGUE_ENDPOINT_URL`.
3. Rebuild/redeploy the frontend.
4. A human review of the consent-screen copy (§10) before it ships to real players.
5. Once live: an automated + human evaluation pass on real model output (§13) — not assumable from this
   Run's mocked tests.
6. The actual, still-outstanding NEW LIFE human-validation gate: the six-character Owner human microtest,
   entirely unaffected by this Run.

## 15. Privacy / prompt-injection summary (see `functions/newlife-dialogue/README.md` for full detail)

No API key anywhere (ADC auth, identical pattern to `functions/dialogue/`). CORS allowlist identical to
`functions/dialogue/`'s. Data-minimized payload (§3). Character grounding is server-side and canon-only, no
invented biography. System instruction explicitly treats player text as untrusted and forbids
self-disclosure; output is schema-constrained; the client-side truth gate is a second, independent,
non-model-dependent check that can reject a response the system instruction alone failed to prevent. Model
output can never mutate `NewLife30State` — no field in the response schema is state-shaped, and
`coordinator.ts` only ever reads `proposedResponse` as display text.

## 16. Final fields

```text
PHASE_30_RUNTIME_CODE = IMPLEMENTED (A/B/C/D/E all real; B/C never exercised against a live model — §13)
SERVERLESS_FUNCTION = IMPLEMENTED (functions/newlife-dialogue/, separate from functions/dialogue/), NOT DEPLOYED
FRONTEND_SECRET_EXPOSURE = NONE (no API key/secret in src/ or dist/; verified by grep + extended safety.test.ts)
DATA_MINIMIZATION = IMPLEMENTED (utterance + FactsSnapshot only; never full NewLife30State/other-NPC/device-id — §3)
SEPARATE_CONSENT = IMPLEMENTED (thinking-game:newlife-ai-dialogue-consent:v1, proven independent of CASE1's — §10)
MULTI_INTENT = CONTRACT+COORDINATOR PROVEN VIA MOCK (§13); not exercised against a live model
TYPO_TOLERANCE = CONTRACT+COORDINATOR PROVEN VIA MOCK (§13); deliberately deferred to the model, no literal correction table
CHARACTER_GROUNDING = IMPLEMENTED server-side, canon-only, all 6 NPCs (functions/newlife-dialogue/lib.js)
TRUTH_GATE_CATEGORY_SCOPED = IMPLEMENTED (§7)
STATE_MUTATION_BOUNDARY = PRESERVED (type-level; unchanged from Phase 29 §11)
DETERMINISTIC_FALLBACK = IMPLEMENTED for every disclosed failure mode (§6/§9), all covered by tests
ASYNC_UI = IMPLEMENTED (pending state, disabled inputs, no duplicate submit, no dead end — §11)
ROOT_TYPECHECK = PASS (0 errors)
ROOT_TESTS = PASS (370/370, 29 files)
ROOT_BUILD = PASS
FUNCTION_TESTS = PASS (19/19, tests/newlifeDialogueFunction.test.ts, real pure-function execution not just text assertions — §5)
CURRENT_DEPLOYED_BEHAVIOR_CHANGED = NO (§9; enforced by empty endpoint + null-interpreter short-circuit, not just documented)
HUMAN_VALIDATION_STATUS = PENDING
READY_FOR_CHATGPT_REVIEW = YES (this implementation, its tests, and this report)
READY_FOR_GCP_DEPLOY_PREP = YES for the mechanical steps (§14 items 1-3); NO for shipping to real players until items 4-6 are also done
READY_FOR_PRODUCT_RELEASE = NO
PR = opened from branch claude/newlife/issue-1-20260922-1812, not merged
OWNER_ACTION_REQUIRED = NO for this Run's own scope — all non-human design/code/test work described in the
  trigger instructions is complete. What remains is exactly §14's list: the GCP billing/API-enablement
  prerequisite (Owner-only, not automatable, identical in kind to the one already known and accepted for
  CASE1), a human review of the consent copy before it ships, and the pre-existing six-character Owner human
  microtest — none of which this Run can resolve by itself, and none of which is a new kind of ask beyond
  what Phase 29 already flagged as the eventual gate.
```

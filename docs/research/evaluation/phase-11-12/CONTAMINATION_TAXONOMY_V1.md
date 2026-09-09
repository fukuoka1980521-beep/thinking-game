# Contamination Taxonomy V1 — PHASE 11.12

Built only from evidence in `RESEARCH_PRODUCT_CONTAMINATION_TRACE_V1.md` and repository reading
this Run, not from the directive's example list alone. Categories the directive suggested but which
this repo's evidence does NOT support as active are marked accordingly rather than force-fit.

## TEST_AFFORDANCE_LEAK — a research/QA-only action becomes a permanent product control

**Instance:** Item 1 (`ASK_WEATHER_SCENE`). The object authored to give a regression test something
to call became, unchanged, a permanent player-visible button with no independent product
motivation.

**Mechanism:** `ActionContractV2` has no ownership field; a UI component consuming "everything a
module exports" cannot distinguish a QA-authored action from a product one.

**Gate built:** `productSurface.ts` — `ACTION_OWNERSHIP_REGISTRY` + `composeProductSurface()`.
`testProbes.ts` — the correct alternative pattern for the specific case that caused this leak.

## DEBUG_UI_LEAK — instrumentation/provenance text becomes player-visible

**Instance:** Item 2, representation 2 only (the ungated inline Vertex-replay disclosure sentence).
Representation 1 (the toggle-gated debug panel) is the correctly-contained counter-example, proving
this category is not "all debug code leaks" — only the specific instance that bypassed the existing
contained pattern.

**Mechanism:** no build/mode boundary (`import.meta.env.DEV`) existed anywhere in this repository
before this phase; the one correct instance relied entirely on a manual React-state toggle
convention, which is opt-in per-instance, not enforced.

**Gate built:** `devOnlyDisclosure.ts` + `BuildBoundaryDemoApp.tsx`, demonstrating real compile-time
exclusion (verified by grepping an actual `vite build` output — see
`SYSTEMIC_GATES_IMPLEMENTATION_V1.md`).

## EVAL_METRIC_LEAK — an evaluation criterion becomes the entire definition of a game mechanic

**Instance:** Item 3 (`ASK_ABOUT_LEFTOVER_STOCK`'s eligibility). Test O's state-boolean assertion
was necessary but was mistaken for sufficient; nothing ever checked whether the newly-eligible
action's CONTENT was genuinely new to the player.

**Mechanism:** the directive's own "choice → consequence → new possibility" requirement was
translated into exactly one mechanical property (a `Precondition` flipping false→true) with no
corresponding content-level check.

**Gate built:** `causalUnlockInvariant.ts` — `validateCausalUnlockClaim()`, applied against the real
historical data (`REAL_LEFTOVER_STOCK_UNLOCK_CLAIM`) and shown to correctly fail it.

## DEPENDENCY_DIRECTION_LEAK — product UI composition has no enforced boundary against research/QA modules

**Instance:** general structural gap underlying items 1 and 4 — `NewlifePlayable11App.tsx` imports
individual action consts directly from `playableSceneContracts.ts` with no intermediate boundary a
static check could enforce.

**Mechanism:** no dependency-direction rule, automated or manual, existed anywhere in this
repository before this phase.

**Gate built:** `dependencyDirection.ts` — `scanForProductSurfaceViolations()`, proven both against
the real (currently clean) `src/newlifeplayable11` tree and against a synthetic violating fixture
(no real violating file was ever written to the repo to prove this).

## FIXTURE_TO_CANON_LEAK — an isolated test fixture gains unintended authority

**Evidence found:** item 6 (the invented leftover-stock detail). **Status: substantially
mitigated already**, not an active leak — the existing `ISOLATED_SCENE_FIXTURE:` marking convention
(`yoheiSourceEvents.ts` line 39, confirmed by direct reading) and `AUTHORING_SOURCE_EVENT_AUDIT_V1.md`
show this was correctly labeled and never presented as 30-day canon. **No new gate built** for this
category this phase — the existing convention already does the job; adding a parallel enforcement
mechanism on top of a working manual convention would be scope beyond what the evidence justifies
(directive Section 19: "choose only mechanisms with a unique, demonstrated responsibility").

## TEST_STATE_LEAK — test-only state affects production semantics

**Evidence found: none.** `ContractV2State` carries no test-only fields; `openYoheiLeftoverStockRequest`
takes an `idSuffix` parameter used only to namespace `PendingReply.id` per test/UI caller (`"ui"` vs.
`"test"` vs. `"probe-separation-test"`) — this does not affect any semantic branch, only an
identifier string. **No gate built** — no demonstrated instance to guard against; inventing one
would be manufacturing a category the evidence doesn't support.

## TEST_TEXT_LEAK — prompt/regression language enters player-visible copy

**Evidence found: none distinct from DEBUG_UI_LEAK.** Every player-visible string in the scene
(narration, Yohei's captured lines, button labels) reads as in-world text, not test/prompt language
leaking through. The one instance of literal instrumentation language reaching the player (item 2)
is already covered under DEBUG_UI_LEAK; treating it as a second category would double-count one
defect under two names.

## AUTHORING_GAP_MASKED_BY_GENERATOR — test setup leaves a semantic hole for the LLM to fill

**Evidence found: none active in PHASE 11.11 itself.** `authoringSufficiencyGate` (existing,
PHASE 11.10-derived) fails closed for any unregistered `sourceEventId` and is verified (test A,
`AUTHORING_SOURCE_EVENT_AUDIT_V1.md`: "no LLM generation was attempted against an unauthored id
this phase"). The directive's problem statement (item E) describes this as a risk from **prior
phases' pattern**, not a demonstrated PHASE 11.11 instance. **No new gate built** — the existing
`authoringSufficiencyGate` already provides this protection and was already exercised correctly;
reuse, not reimplementation, per directive Section 17/G.

## Categories considered and explicitly rejected as not evidenced

- A literal "shared eligibility registry" leak distinct from DEPENDENCY_DIRECTION_LEAK — the
  eligibility mechanism (`Precondition`) itself is sound and correctly scoped (Single Precondition
  Authority, unchanged since PHASE 11.6R); the leak is in composition/ownership, not eligibility
  logic. Folding this into DEPENDENCY_DIRECTION_LEAK avoided inventing a redundant category.

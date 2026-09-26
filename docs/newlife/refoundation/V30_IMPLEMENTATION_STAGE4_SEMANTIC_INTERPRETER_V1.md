# NEW LIFE V30 — IMPLEMENTATION STAGE 4: SEMANTIC INTERPRETER CONTRACT

Date: 2026-09-24
Status: IMPLEMENTATION (V11 order, stage 4 of 8) / DESIGN-FIRST, NOT WIRED IN

## 0. What this covers

Continues directly from V29 (stages 1-3 complete, `READY_FOR_IMPLEMENTATION = YES`). This round
implements stage 4: the semantic interpreter contract — the first stage of this series that actually
consumes raw player text, everything before it (stages 1-3) only ever operated on already-classified
`TurnClassification` input.

No product code, UI, runtime, Cloud Function, or legacy public NEW LIFE path is touched.
`chatgpt/newlife-phase34-human-playtest-repair` remains unmerged and untouched. Regex was not used or
proposed as the semantic engine — see §3. No new member was added to `ActionType`, `BoundaryMode`, or
`RelationalEvent` — the three closed sets `types.test.ts` pins are unchanged; this stage only adds an
adapter boundary and a validator around them.

## 1. Why this stage reuses an existing pattern rather than inventing one

The repository already solved "how do we let a future model provider produce structured semantic
output without ever trusting it blindly" once, for the unrelated Phase 29/30 CASE1 dialogue system:
`src/newlife/semantic/contract.ts` (the typed contract + adapter interface),
`src/newlife/semantic/adapter.ts` (`NullSemanticInterpreter`, the only implementation that exists —
always reports unavailable, no network call, no secret), and `src/newlife/semantic/httpInterpreter.ts`
(the one real HTTP-backed implementation, whose `isValidInterpretation` re-validates every field's
shape rather than trusting a successful HTTP call + JSON parse).

Stage 4 (`src/newlife/refoundation/semanticInterpreter.ts`) is structurally the same pattern, retargeted
at the V13-V24 four-layer `TurnClassification` ontology instead of Phase 29's CASE1-specific
`FactCategory` contract:

- `SemanticInterpreterAdapter` — the swappable boundary a real provider integration implements later.
- `NullSemanticInterpreterAdapter` — the only implementation that exists this Run; always reports
  `unavailable`.
- `FixedResponseAdapter` — a deterministic test/replay helper (new relative to the Phase 29 pattern,
  since Phase 29 had no dedicated fixture adapter); returns one fixed response per instance. Exists so
  this stage's own tests don't need a network dependency, and so V11 stage 8 (blind/automated replay)
  can later feed the already-blind-validated V4-V9 matrix fixtures through the exact orchestration path
  a live adapter would use, without a live model.
- `isValidRawTurnClassification` — field-by-field shape validation mirroring
  `isValidInterpretation`, plus one cross-field invariant `isValidInterpretation` has no equivalent of
  (see §2).
- `interpretTurn` — the one orchestration entry point, mirroring how `coordinator.ts`/
  `httpInterpreter.ts` already collapse "no live provider," "provider errored," and "provider returned
  a malformed shape" into one identical fallback branch.

## 2. The one new invariant: CLARIFY and `needsClarification` must move together

The trigger's requirement 2 ("uncertain ACTION/BOUNDARY/RELATIONAL_EVENT interpretation must yield the
existing CLARIFY/no-state-cost behavior rather than guessing") needed a concrete, checkable rule, not
just a comment. Re-reading every blind-validated V8/V9 matrix CLARIFY fixture (T24/T37, Z-series, and
the earlier N24/N36) confirmed one exceptionless pattern: whenever `needsClarification` is `true`, the
rest of that turn's fields are always exactly `{ action: "CLARIFY", boundaryMode: "UNKNOWN",
relationalEvents: [] }` — never a `CLARIFY` action with a populated boundary/event reading, and never a
non-`CLARIFY` action with `needsClarification: true`.

`isValidRawTurnClassification` encodes this as a hard rejection: a payload that sets
`needsClarification: true` while still asserting a specific, resolved `ACTION`/`BOUNDARY_MODE`/
`RelationalEvent` reading is treated as malformed, not as "uncertain-but-otherwise-usable." This closes
the requirement structurally — a provider adapter cannot smuggle a guess in under an uncertainty flag,
and `interpretTurn` cannot silently promote a half-formed "maybe" into partial state that downstream
reducers would act on.

`CONSERVATIVE_CLARIFY_CLASSIFICATION` is the one canonical value every ambiguity path (adapter
unavailable, adapter threw, malformed shape) resolves to — matching V13 §3(a)'s conservative-ambiguity
default and `timeEconomy.ts`'s existing `CLARIFY = 0 minutes` rule (unaffected by this stage; a
game-loop consuming `interpretTurn`'s output would cost a `CLARIFY`-classified turn at 0 minutes the
same way it already would for a directly-authored `CLARIFY` turn).

## 3. Regex / "system owns truth, AI owns interpretation" discipline

`semanticInterpreter.ts` contains no regular expression and performs no pattern-matching over
`TurnInterpretationRequest.utterance` anywhere — the text is forwarded to whichever adapter a caller
supplies and is never read by this module itself. Classification comes exclusively from the adapter's
returned value, which is then shape-validated against the closed enums `types.ts` already exports
(`ALL_ACTION_TYPES`/`ALL_BOUNDARY_MODES`/`ALL_RELATIONAL_EVENTS`). A future cheap regex-based adapter
remains possible in principle (e.g. as a placeholder before a model-backed adapter exists), but it would
have to implement `SemanticInterpreterAdapter` like any other provider, produce output that survives the
same validator, and pass through the same conservative-ambiguity fallback — it could not bypass CLARIFY
handling or be treated as more authoritative than a model adapter without a separate normative patch.

State mutation stays fully separated: no exported function in this module imports
`NpcRelationshipRecord`, `CaseEndingState`, `applyRelationalTurn`, `applyEndingTurn`, or
`completeCorrectiveAction`. `interpretTurn`'s return type carries only a `TurnClassification` and an
optional `PersonalTrackSignal` — applying either to state remains stage 2/3's job, and wiring
"classify, then apply" together remains the future game loop's job, not this stage's.

## 4. Tests

`semanticInterpreter.test.ts` — 27 cases, grouped by the trigger's own requirement list:

- Schema validation: accepts every closed `ActionType`/`BoundaryMode`/`RelationalEvent` value
  individually (not just one hand-picked example each), rejects non-object/null/array input, a missing
  field, an out-of-enum value in each of the three enum fields, and a non-boolean
  `needsClarification`; ignores an extra hallucinated field (e.g. a stray `confidence` score) rather
  than rejecting the whole payload, matching `isValidInterpretation`'s existing leniency.
- The CLARIFY/`needsClarification` cross-field invariant from §2, both directions, including the
  "smuggled guess under an uncertainty flag" case and the "CLARIFY with populated boundary/events" case.
- Uncertainty/CLARIFY: adapter-unavailable and adapter-throws both resolve to
  `CONSERVATIVE_CLARIFY_CLASSIFICATION` with a distinguishing `reason`.
- Malformed model output: missing field, hallucinated enum value, and a non-object response (raw
  string) all resolve to the same fallback.
- Style-neutral equivalent utterances: a diplomatic and a blunt utterance, each routed through an
  adapter that classifies them identically, produce byte-identical `interpretTurn` output; a second
  test confirms the module never reads `request.utterance` itself (it only forwards it to the adapter,
  which is the only thing that ever sees the text).
- Compound utterances: multiple `relationalEvents` in one turn (e.g. an apology-plus-insult combination,
  echoing V15's apology+insult probe) validate and pass through without deduplication or loss.
- No direct state mutation: `interpretTurn`'s result object has exactly the three expected keys, and a
  serialized-JSON scan confirms no relationship-record or ending-state field name (`relationshipState`,
  `repairWindow`, `taskLedger`, `causalEventHistory`, `correctiveActionLog`) appears anywhere in the
  output.

## 5. Verification

`npm ci` was attempted directly this round and still returned "This command requires approval" —
confirming the same permission-layer block every prior stage (V25/V26/V29) has already disclosed, not a
missing-binary or network issue. `node_modules/` is not present in this checkout. All 27 new tests were
hand-traced against the implementation (each expected value re-derived from the module's own logic and
walked through step-by-step, including the TypeScript narrowing path through
`isValidRawTurnClassification`'s type guard), not merely asserted, and written to match this
repository's existing strict-TypeScript conventions (explicit `type`-only imports, discriminated-union
result types, no `any`). `grep -rl "refoundation" src` confirms nothing outside
`src/newlife/refoundation/` references this stage, preserving isolation. CI's own typecheck/test run on
this PR remains the first actual compiler/test-runner verification for stages 1-4 together; if it
surfaces a mistake, that is a normal fix-and-retest cycle, not a design blocker. If a future run can be
granted `Bash(npm ci:*)` / `Bash(npx vitest run:*)` / `Bash(npx tsc --noEmit:*)` approval, direct
verification would replace hand-tracing from that point on.

## 6. Why stages 5-8 are not attempted in this same round

This round deliberately stops after stage 4 rather than continuing straight through stages 5-8 in one
pass. Reasoning, consistent with V26's own precedent ("Stage 2... deserves its own focused
implementation-plus-tests round rather than being rushed alongside stage 1"):

- Stage 4 is the first stage with real design surface of its own (an adapter boundary, a validator, a
  conservative-ambiguity invariant derived from cross-referencing nine rounds of blind-validation
  fixtures) — it warranted being checked carefully rather than being one of several stages skimmed in a
  single pass.
- Stages 5-7 (NPC generation, thought tools, minimal UI) each introduce their own new design surface
  that is *not* fully pinned down by the existing V13-V29 document chain the way stages 1-4 were:
  NPC generation needs an output contract for AI-authored NPC dialogue/expression (V13 §1's "AI owns
  semantic conversation and expression" half, not yet specified at the same level of rigor as the
  interpretation half this stage just implemented); thought tools need their V16 §5/V22-described
  mechanical hooks (turn-collapse, plan-slot, track-split, candidate-generation) turned into an actual
  state shape; minimal UI needs a rendering surface for all of the above. Treating any of these as
  "small enough to rush alongside stage 4" risks exactly the shallow, underspecified work this PR's own
  nine rounds of blind classifier validation (V4-V9) were run to avoid for the ontology layer.
  Stage 8 (blind/automated replay) is comparatively mechanical once stages 4-7 exist (it mainly wires
  `FixedResponseAdapter`-style fixtures through the pipeline this stage already built), but depends on
  5-7 existing first.
- No genuine blocker was hit — this is a scope/effort judgment call for this round, not a stop
  condition. The next round can proceed straight to stage 5 without re-litigating stages 1-4.

## 7. Next stage

Stage 5: NPC generation — the AI-owns-expression half of V13 §1's split, needing its own smallest
normative contract (an adapter producing NPC-facing dialogue/reaction text from state, never from raw
`ActionType`/`RelationalEvent` labels leaking into player-visible text) before implementation, following
the same "spec the gap, audit it, then implement" sequence V27/V28/V29 already used for stage 3's
ending-vector gap.

READY_FOR_IMPLEMENTATION = YES (stages 1-4 complete; stages 5-8 pending)

# NEW LIFE V29 — IMPLEMENTATION STAGE 3: ENDING VECTOR

Date: 2026-09-24
Status: IMPLEMENTATION (V11 order, stage 3 of 8) / DESIGN-FIRST, NOT WIRED IN

## 0. What this covers

Continues directly from V26 (stage 2 complete, stage 3 stopped on an undocumented product-rule
gap). This round: authored `V27_ENDING_VECTOR_CONTRACT_V1.md` (the smallest normative rule for
`SHOW`, ending `BOUNDARY`, and `PERSONAL_TRACK` — the three fields V26 could not derive), ran a
self-audit (`V28_ENDING_VECTOR_AUDIT_RESULT_V1.md`) that found and closed one real blocker (B1,
`SHOW`'s viability rule assumed exactly one NPC) before any implementation code was written against
the uncorrected version, then implemented stage 3.

No product code, UI, runtime, Cloud Function, or legacy public NEW LIFE path is touched.
`chatgpt/newlife-phase34-human-playtest-repair` remains unmerged and untouched. Regex was not used
or proposed as the semantic engine anywhere in this round. No new member was added to `ActionType`,
`BoundaryMode`, or `RelationalEvent` — the three closed sets `types.test.ts` pins at 20/7/8 members
are unchanged.

## 1. What was implemented

### `src/newlife/refoundation/ending.ts` + `.test.ts`

Implements V27 as corrected by V28 §1:

- `applyEndingTurn` — one entry point per turn (mirroring `applyRelationalTurn`'s shape), folding a
  turn's `action`/`boundaryMode`/optional `personalTrackSignal` into a `CaseEndingState`: overwrites
  `TaskLedger.commitment` when the action is one of the 6 committing types (V27 §2.2), records
  first-only boundary establishment (V27 §3.1), and monotonically opens the personal track (V27
  §4.2).
- `deriveShowOutcome(taskLedger, requiredRelationshipStates)` — V27 §2.3 as corrected: `BREAKDOWN`
  with no commitment; otherwise `BREAKDOWN` only if the commitment is NPC-dependent
  (`COMMIT_PLAN`/`FORCE_UNCONFIRMED_PLAN`) and any caller-supplied required NPC relationship state
  is `WITHDRAWN`; operational-workaround commitments (`CUT_SCENE`/`USE_UNDERSTUDY`/
  `CHANGE_STAGING`/`ACCEPT_SHORTER_SCENE`) always proceed.
- `deriveEndingBoundary(state)` — V27 §3.2: `UNKNOWN` until established, `STATED` once established
  with no commitment, then `RESPECTED`/`OVERRIDDEN` from the **final** commitment's `boundaryMode`
  only (not the full turn history) — the mechanism that makes boundary-axis recovery possible after
  an earlier `CROSS_WITHOUT_PERMISSION` commitment is replaced by a later one, mirroring V4 §7.
  Takes a `Pick<CaseEndingState, "boundaryEstablished" | "taskLedger">` — `personalTrackOpened` is
  not merely ignored, it is absent from the parameter type entirely (V27 §4.3's structural
  guarantee).
- `derivePersonalTrack` / `deriveEndingVector` — straightforward field readers; `deriveEndingVector`
  performs no aggregation across the five fields (V27 §1/§5's non-ranked, no-score property).

33 tests, each citing the exact V27 passage it pins down: task-ledger overwrite semantics, boundary
establishment (including the `NOT_RELEVANT`/`UNKNOWN` non-establishing counter-examples and the
first-only rule), personal-track monotonicity, `SHOW`'s NPC-dependent-vs-independent split
(including the corrected multi-NPC signature), the `UNKNOWN`-boundaryMode ambiguity default, an
end-to-end boundary-recovery scenario run through `applyEndingTurn`, a structural-independence check
that toggling `personalTrackOpened` alone cannot change `show`/`boundary`, and two full
`deriveEndingVector` walk-throughs (one `PROCEEDS`/`RESPECTED`/`OPENED`, one `BREAKDOWN` caused by a
required NPC's `WITHDRAWN` state with `boundary` still independently `RESPECTED` — demonstrating the
non-ranked property concretely, not just asserting it).

## 2. Verification

`npm ci` was attempted directly (not merely `npm install`/`npx`, to see if the specific blocking
point had narrowed since V25/V26/V27's predecessor rounds) and still returned "This command
requires approval" — confirmed a permission-layer block, not a missing-binary or network issue, same
finding as the immediately preceding round. `node` itself is available (`v22.23.2`) but no package
manager or compiler invocation is reachable without interactive approval unavailable in this
non-interactive run. All 33 new tests were hand-traced against the implementation (each expected
value re-derived from the spec and independently walked through the actual reducer logic
step-by-step, not merely asserted) and written to match this repository's existing strict-TypeScript
conventions (explicit `type`-only imports, `Pick<...>` narrowing, no `any`). `grep -rl
"refoundation" src` confirms nothing outside `src/newlife/refoundation/` references this stage,
preserving isolation. CI's own typecheck/test run on this PR remains the first actual compiler/test-
runner verification for stages 1-3 together; if it surfaces a mistake, that is a normal fix-and-
retest cycle, not a design blocker. If a future run can be granted `Bash(npm ci:*)` /
`Bash(npx vitest run:*)` / `Bash(npx tsc --noEmit:*)` approval, direct verification would replace
hand-tracing from that point on.

## 3. Explicitly out of scope (unchanged from V27 §6)

V4 §5's four outcome families (RESOLVED/SURFACE FIX/STALEMATE/BREAKDOWN) are not implemented — the
governing trigger for this round asked only for the `EndingVector`'s three open fields, and adding
the four-family layer now would be unrequested scope expansion. The `TIME_COSTS` category a given
turn falls into remains deferred to the game-loop/semantic-interpreter integration, as already
stated in `timeEconomy.ts`.

## 4. Next stage

Stage 4: the semantic interpreter contract (an adapter/model-based boundary that returns structured
`TurnClassification` output with uncertainty/CLARIFY behavior, regex used only for trivial
deterministic plumbing — never as primary semantic interpretation), following this repo's own
established `src/newlife/semantic/contract.ts` adapter-boundary pattern. This is the first stage
that actually produces a `TurnClassification`/`PersonalTrackSignal` from raw player text; stages 1-3
have only consumed already-classified input.

READY_FOR_IMPLEMENTATION = YES (stages 1-3 complete; stages 4-8 pending)

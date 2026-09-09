# Real Causality Gate Audit V1 — PHASE 11.12R

## Chosen evidence source, and why (directive Section 11)

Candidates considered: interaction transcript, Actor Experience (`experienceLog`), scene-visible
event/log, State Admission evidence.

**Chosen: State Admission evidence** — specifically, the `leftover_stock_moved` `LifeMaterial`'s
own `concreteContent` field.

**Why, stated precisely:** `experienceLog` (Actor Experience) records that the PLAYER performed an
action (e.g. `"洋平に、何を手伝えばいいか尋ねた"`), not what fact they received as a result — using
it would require re-deriving fact content from activity descriptions, an extra inferential step.
More importantly, **the player's actual path is not fixed**: a player can press ACCEPT_HELP
immediately, without ever asking `ASK_WHAT`/`ASK_FESTIVAL`/`ASK_SALES` first (all of `ACCEPT_HELP`/
`DECLINE_HELP` are visible from the very first screen, alongside the ASK_* buttons — confirmed by
reading `NewlifePlayable11App.tsx`'s render, `pendingOpen` gates both groups identically). Using
prior-question history as the evidence source would make the verdict **path-dependent** — valid in
some playthroughs, invalid in others, for the identical claimed unlock. `leftover_stock_moved.
concreteContent` ("洋平と一緒に、祭りの残りの手ぬぐいの箱を値引き用の陳列スペースまで運んだ",
`playableSceneContracts.ts` line 52) is created by the ACCEPT_HELP event itself, **regardless of
what was asked beforehand**, and already asserts both facts — making the evaluation
**path-independent** and using the single most authoritative source (State Admission is this
codebase's own long-standing "postcondition actually became true" mechanism, not narration text).

## The real evaluator

`evaluateRealLeftoverStockCausalClaim(state: ContractV2State)` in `causalUnlockInvariant.ts`:
finds the `leftover_stock_moved` material (`ACTIVE`), reads fact tags directly off its
`concreteContent` via substring match (`"祭りの残り"` → `IS_FESTIVAL_LEFTOVER`, `"値引き"` →
`GOING_TO_DISCOUNT_SHELF` — the same substring-matching idiom `tests/newlifePlayableScene11.test.ts`
test L already uses on `packet.firsthand`/`unknown`), and compares against the two facts
`ASK_ABOUT_LEFTOVER_STOCK`'s own answer asserts.

## Real result

`tests/newlifePlayable11RealPathIntegration.test.ts`:

```
evaluateRealLeftoverStockCausalClaim(stateAfterAccept).verdict === "CAUSAL_UNLOCK_INVALID_ALREADY_KNOWN"
```

— PASSING, run against the REAL engine (`resolvePendingReplyEvent` + `PLAYER_ACCEPTS_HELP_MOVE_STOCK`,
unmodified PHASE 11.11 code), not a static claim constant.

Before the material exists (i.e. before ACCEPT_HELP has occurred), the same function returns
`CAUSAL_UNLOCK_UNDETERMINABLE` — the third required verdict value is real and reachable, not
theoretical: `ASK_ABOUT_LEFTOVER_STOCK`'s own precondition (`LEFTOVER_STOCK_MOVED.check`) is `false`
in exactly this state too, so `buildAskCandidates` never even offers it as a candidate in that
state — the `UNDETERMINABLE` branch exists for completeness/robustness (e.g. if this function were
ever called before the precondition check) but does not currently drive an observable behavior
difference from `INVALID_ALREADY_KNOWN`, since both result in exclusion.

## No replacement causal claim was fabricated

`ASK_ABOUT_LEFTOVER_STOCK` itself — its captured line, its `playerIntent`, its registered
`sceneJustification` in `ACTION_OWNERSHIP_REGISTRY` — is completely unmodified. No new fact, no new
captured line, no reworded answer was introduced anywhere to make the claim pass. The claim was
evaluated as it actually stands and found invalid; the consequence (the button does not render
after ACCEPT) is accepted as-is, per directive Section 10/12. Confirmed by diff-review: no edits
were made to `playableSceneContracts.ts`, `capturedYoheiLines.ts`, or `yoheiSourceEvents.ts` this
phase (see `REAL_PATH_CONTAMINATION_INTEGRATION_V1.md`'s "What did NOT change" section).

## Verdict

**`CAUSAL_UNLOCK_INVALID_ALREADY_KNOWN`** for the real, live ACCEPT_HELP → ASK_ABOUT_LEFTOVER_STOCK
claim, computed from real runtime state via State Admission evidence, not asserted from the PHASE
11.12 static analysis alone. The gate is wired into the real composition path
(`applyCausalityGate`, called unconditionally in `NewlifePlayable11App.tsx`'s render body) and its
effect is directly observable: the follow-up button does not render after ACCEPT in the real,
running scene (confirmed by both the RTL rendered-UI test and the real-browser Playwright check).

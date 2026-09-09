# Strategist Event Order Audit Packet V1 — PHASE 11.13C

Evidence-packaging document for independent Strategist review, on top of the still-uncommitted
PHASE 11.13/11.13A/11.13B product repair (root-fix checkpoint
`f43d5345ef856ece5cb56c496ff515696514c6fc` unchanged). No self-judgment about fun/UX anywhere.

## Exact prior timing defect

PHASE 11.13B committed the NPC response record (`leftover_question_answered`) inside
`ASK_ABOUT_LEFTOVER_STOCK`'s own `stateDelta`, which runs inside `resolveAction` — the same atomic
call as the PLAYER's own ask dispatch. QUESTION DISPATCH and NPC RESPONSE EVENT were therefore the
same commit, not genuinely separable in the real orchestration (only in synthetic tests).

## Real old call order

```
resolveAction(state, ASK_ABOUT_LEFTOVER_STOCK)   -- created BOTH the ask-experience AND the
                                                      response material, in one call
buildYoheiPacket / languageAdapter                -- display only, after the fact
```

## Real new call order

```
resolveAction(state, ASK_ABOUT_LEFTOVER_STOCK)   -- creates ONLY the ask-experience (QUESTION_ASKED)
buildYoheiPacket(next, ...)
languageAdapter(packet)                            -- response-delivery seam
commitNpcResponseIfApplicable(actionId, next, packet)  -- RESPONSE COMMIT POINT, separate call
```

## Response commit point

`npcResponseCommit.ts`'s `commitNpcResponseIfApplicable`, called from `NewlifePlayable11App.tsx`'s
`askQuestion` immediately after the language adapter is consulted. Full detail:
`NPC_RESPONSE_COMMIT_POINT_V1.md`.

## Player ask contract responsibility (narrowed)

`ASK_ABOUT_LEFTOVER_STOCK.stateDelta` is now `() => []`. Its only authoritative output is the
ask-experience write (`actorExperienceWrite`).

## NPC response-event responsibility (new)

`commitLeftoverQuestionResponse(state, semantic)` — creates `leftover_question_answered` via the
existing `admitMaterials`/`mergeMaterials` State Admission pipeline, invoked from a separate call
site, gated by an authored semantic registry keyed by packet key, never by parsing display text.

## Confirm/unknown/no-response Product-harness traces

All three exercised through the REAL commit seam (not synthetic contracts): `SUCCESS_CONFIRM` →
`(true, true, true)`; `SUCCESS_UNKNOWN` → `(true, true, false)`; `NO_RESPONSE` → `(true, false,
false)`. Full detail: `RESPONSE_VARIANT_PRODUCT_HARNESS_V1.md`. Mechanically captured 3-point real
trace (before ask / after ask before commit / after commit): `REAL_PRODUCT_EVENT_ORDER_TRACE_V1.md`
— notably proves the visible display line can already exist (Point B) while `targetFactKnown`
correctly remains `false`, the clearest possible demonstration that display availability does not
commit authority.

## ASK_FESTIVAL/ASK_SALES timing audit

Both have `stateDelta: () => []` — no response-commit-timing defect exists for either; no state is
ever created representing an NPC answer inside these ask actions, so this phase's fix does not
apply to them. `CONTEXTUAL_RESPONSE_TIMING_AUDIT_V1.md`.

## Full test totals

`tsc --noEmit` clean. **102/102 test files, 1493/1493 tests.** `npm run build` clean, dev-only
marker re-confirmed absent.

## Playwright result

`event_order_regression_script.mjs` against a real dev server: **6/6 checks PASS** — rendering
unchanged; before/after debug evidence correctly reflects the real event order; new material
visible in evidence once committed; no leakage onto the primary player surface.

## Unresolved Product-only issues

`ASK_SALES`/`ASK_FESTIVAL` content redundancy (still unfixed, out of mandate); no perceptible
player-facing timing gap exists between dispatch and commit in this synchronous UI (the
distinction is proven at the state/code level, not as a UI delay); future live-LLM semantic
validation documented, not built.

## Final verdicts (directive Section 22)

| Verdict | Value |
|---|---|
| QUESTION / RESPONSE EVENT SEPARATION | **PASS** |
| REAL PRODUCT EVENT ORDER | **PASS** |
| RESPONSE / TARGET KNOWLEDGE SEPARATION | **PASS** |
| NO-RESPONSE SAFETY | **PASS** |
| UNKNOWN-ANSWER SAFETY | **PASS** |
| LLM AUTHORITY BOUNDARY | **PASS** |
| SYSTEMIC CONTAMINATION BOUNDARIES | **PASS** |
| SMALL PLAYABLE SCENE | **OWNER_PLAY_CANDIDATE** |

## Owner gate (directive Section 23)

The REAL Product path (not only synthetic contracts) now proves: ASK → `questionAsked=true,
answerReceived=false` (Point B, mechanically captured); then separately, NPC RESPONSE →
`answerReceived=true` (Point C); and `targetFactKnown` follows the response's own authored
semantic, not the question dispatch. Both required conditions are met. Owner human play is a
reasonable next step, subject to the Strategist's own confirmation of this packet, not
self-declared as final here.

# Authoritative Prose-Parsing Audit V1 — PHASE 11.13D

Directive Section 16: search the isolated scene path for authoritative logic depending on
`includes`/substring/regex/specific wording over NPC dialogue, `concreteContent`, `visibleFeedback`,
or experience prose. Grep-verified across `src/newlifeplayable11/*`,
`src/research/action-contract-v2/*` (excluding tests).

## `causalUnlockInvariant.ts:134-135` — `factsAssertedByMaterialConcreteContent`

```
if (concreteContent.includes("祭りの残り")) facts.push("IS_FESTIVAL_LEFTOVER");
if (concreteContent.includes("値引き")) facts.push("GOING_TO_DISCOUNT_SHELF");
```

**2 call sites**, both against `leftover_stock_moved` (the physical reveal), never against a
dynamic NPC response material:
1. `evaluateRealLeftoverStockCausalClaim` — gates whether `ASK_ABOUT_LEFTOVER_STOCK` enters
   `buildAskCandidates`'s causality-filtered output at all (`applyCausalityGate`).
2. `evaluateLeftoverQuestionPrerequisite`'s `revealAlreadyLeaksTarget` check — same material, same
   reasoning, reused.

**Classification: AUTHORITATIVE_RISK, technically — but explicitly accepted per directive Section
13's own carve-out, not touched this phase.** Both ARE authoritative (they gate real rendering
decisions) and DO use substring matching. However: (a) the input is `leftover_stock_moved`'s
`concreteContent`, a STATIC, single, author-controlled narrative fixed once at authoring time
(`PLAYER_ACCEPTS_HELP_MOVE_STOCK`'s own narration, `playableSceneContracts.ts`) — never a
dynamically-varying NPC response with multiple possible outcomes; (b) no adversarial failure has
ever been demonstrated against this specific check (only against the RESPONSE-resolution check,
now fixed); (c) directive Section 13 explicitly permits "question prerequisite / causal reveal" to
keep using structured-observed-fact text checks, reserving the mandatory fix for "response target
resolution." Per directive Section 16's own instruction ("do NOT refactor unrelated heuristics
without demonstrated authority risk"), this was left as-is.

## `languageAdapter.ts:18` — `packet.pendingRequestContent.startsWith("KNOWN")`

**Classification: SAFE_DISPLAY_ONLY / structural-key, not prose-parsing.** `pendingRequestContent`
is not NPC dialogue or free-form prose — it is a structured control string `buildYoheiPacket`
itself constructs deterministically (`` `KNOWN: ${event.requestSubject}` `` or the literal string
`"UNKNOWN"`, `playableSceneContracts.ts`), specifically as a tagged marker for packet-key
construction. `startsWith("KNOWN")` reads a self-generated tag, never an NPC's or a captured line's
actual utterance content.

## `tests/newlifePlayableScene11.test.ts` (PHASE 11.11, unmodified) — substring checks on `packet.firsthand`/`packet.unknown`

e.g. `.not.toMatch(/雨|晴れ/)`. **Classification: TEST_HEURISTIC_ONLY.** These run inside test
assertions, never inside any authoritative decision path the running scene itself executes — they
verify packet CONTENT for test purposes, not gate any real state transition. Not touched.

## No other authoritative prose-parsing found

Grep across `NewlifePlayable11App.tsx`, `npcResponseCommit.ts`, `testProbes.ts`,
`productFixtureLines.ts` for `.includes(`/`.match(`/`.test(`/`startsWith`/`endsWith` found no
additional matches beyond the three cases above.

## Conclusion

Exactly one class of authoritative prose-parsing was demonstrated unsafe (dynamic NPC response
resolution) and was fixed this phase. One other authoritative-but-static-content case remains,
explicitly accepted per directive's own scope boundary. No unrelated heuristic was refactored
without demonstrated risk.

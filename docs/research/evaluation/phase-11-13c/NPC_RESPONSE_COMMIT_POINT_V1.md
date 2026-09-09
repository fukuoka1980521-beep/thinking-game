# NPC Response Commit Point V1 — PHASE 11.13C

## Why PHASE 11.13B was rejected as incomplete

PHASE 11.13B put `leftover_question_answered`'s creation inside `ASK_ABOUT_LEFTOVER_STOCK`'s own
`stateDelta`. Since `stateDelta` runs inside `resolveAction` — the SAME atomic call that represents
the PLAYER's own ask dispatch — the "NPC response" record was committed as a side effect of the
PLAYER's action, not as a genuinely separate NPC RESPONSE EVENT. `questionAsked` and
`answerReceived`/`targetFactKnown` were correctly SOURCED from different places (Actor Experience
vs. State Admission), but they still committed in the same instant, with no real commit-point
distinction anywhere in the actual orchestration — only in synthetic tests.

## The minimal existing response seam (directive Section 4)

Traced the real call sequence in `NewlifePlayable11App.tsx`'s `askQuestion`:

```
resolveAction(state, contract)          -- PLAYER's own ask dispatch (QUESTION DISPATCH)
buildYoheiPacket(next, ...)              -- builds structured context for the response
languageAdapter(packet)                  -- RESPONSE-DELIVERY SEAM: produces the visible line
[COMMIT POINT INSERTED HERE]              -- NEW: commits the NPC's authoritative response, separately
setState(...) / pushLog(...)
```

The narrowest point where the system knows (A) what authoritative semantic response this
interaction carries and (B) that the response delivery succeeded is immediately after the
language-adapter call — not before, and not bundled into `resolveAction`.

## What changed

- `ASK_ABOUT_LEFTOVER_STOCK.stateDelta` reverted to `() => []` (directive Section 3) — this
  contract's ONLY authoritative responsibility is now the ask-experience write.
- New module `npcResponseCommit.ts`:
  - `LEFTOVER_QUESTION_RESPONSE_SEMANTICS: Record<packetKey, "CONFIRM_FESTIVAL_LEFTOVER" |
    "UNKNOWN">` — authored once, by a human reading the real captured text, keyed the same way
    `languageAdapter.ts`'s `packetKey` already keys captured lines. A packet key with no entry has
    no known response outcome (the NO_RESPONSE case).
  - `commitLeftoverQuestionResponse(state, semantic)` — creates the response material via the
    EXISTING `admitMaterials`/`mergeMaterials` (unmodified, exported by `engine.ts` since PHASE
    11.6R), the same primitives `ActionContractV2.stateDelta` already used internally — just
    invoked from a second, separate call site.
  - `commitNpcResponseIfApplicable(actionId, state, packet)` — a `Record<actionId, handler>`
    registry (the same declarative-lookup idiom `ASK_ACTION_UI_META` already uses in
    `NewlifePlayable11App.tsx`), not an `if (actionId === ...)` branch, and not a general engine.
- `askQuestion` now calls `commitNpcResponseIfApplicable` as its own, separate line, strictly after
  `languageAdapter(packet)`.

## LLM string vs authoritative response semantic (directive Section 5)

`RESPONSE_SEMANTIC` (authority): `LEFTOVER_QUESTION_RESPONSE_SEMANTICS["ASK_ABOUT_LEFTOVER_STOCK::
KNOWN"] = "CONFIRM_FESTIVAL_LEFTOVER"` — authored once against the real captured text in
`raw_vertex_capture.json`/`capturedYoheiLines.ts`, never derived at runtime.
`VISIBLE_REALIZATION` (language): whatever `languageAdapter(packet)` returns — never read by
`commitNpcResponseIfApplicable`/`commitLeftoverQuestionResponse` at all. No `if (text.includes(...))`
exists anywhere in this module (verified by reading the file — the only inputs are `actionId`,
`state`, and `packet`'s structured fields, never a display string).

## Not a ResponseEngine

`npcResponseCommit.ts` is ~90 lines, one registry, one commit function, one dispatch function, all
specific to the one question in this scene that currently claims a confirmable target fact. No
retry logic, no conversation graph, no generalized dialogue state machine.

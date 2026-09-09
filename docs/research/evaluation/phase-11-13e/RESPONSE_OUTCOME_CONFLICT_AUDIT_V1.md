# Response Outcome Conflict Audit V1 — PHASE 11.13E

## The gap directive Section 5 identified

PHASE 11.13D used three distinct, mutually-DISTINCT-by-convention material ids for CONFIRM/DENY/
UNKNOWN, but never verified that they are also mutually EXCLUSIVE in state. `mergeMaterials`
(`engine.ts`, unmodified) merges by id — two DIFFERENT ids coexist rather than overwriting each
other. Since the question is re-askable, nothing previously prevented (or even detected) two
contradictory outcome materials existing simultaneously, and the old code (`confirmed ? "KNOWN_
TRUE" : denied ? "KNOWN_FALSE" : "UNRESOLVED"`) would have silently picked CONFIRM if both were
ever present — exactly the "CONFIRM wins" anti-pattern the directive forbids.

## The fix

`evaluateLeftoverQuestionPrerequisite` now counts how many of the three outcome ids are
simultaneously ACTIVE. Exactly one → normal resolution (unchanged). Zero → `UNRESOLVED`/
`answerReceived: false` (unchanged). **More than one → a new, explicit `targetStatus: "CONFLICTING"`**,
`targetFactKnown: false`, `reason` matching `CONFLICTING_RESPONSE_SEMANTICS` — never a silent
tiebreak.

## Lifetime sequences tested (directive Section 5's exact list)

| Sequence | Result |
|---|---|
| CONFIRM → CONFIRM | `KNOWN_TRUE`, not `CONFLICTING` (same semantic repeat, idempotent) |
| CONFIRM → DENY | `CONFLICTING` |
| DENY → CONFIRM | `CONFLICTING` |
| UNKNOWN → CONFIRM | `CONFLICTING` |
| UNKNOWN → DENY | `CONFLICTING` |

5/5 PASS (`tests/zeroProseAuthorityAudit.test.ts`, parameterized). Additionally verified: after
`CONFIRM → CONFIRM`, exactly ONE material with an outcome id exists in `state.materials` (the
second commit does not duplicate it — `mergeMaterials`'s own id-keyed `Map` behavior already
guarantees this, confirmed, not assumed).

## Policy chosen

**Smallest safe policy, per directive's own preference:** same-semantic repeat is idempotent/
harmless (no new code needed — an accurate consequence of `mergeMaterials`'s existing behavior);
conflicting semantics fail closed as a new, explicit, named status. No belief-tracking, no
"most-recent-wins" timestamp logic, no retraction/versioning system was built.

## Real-world reachability

The real production registry (`LEFTOVER_QUESTION_RESPONSE_SEMANTICS`) maps exactly ONE packet key
to exactly ONE fixed outcome (`CONFIRM`) — re-asking through the real UI always commits the SAME
outcome again, so `CONFLICTING` cannot currently be reached through the live scene. It is proven
through the real `commitLeftoverQuestionResponse` function directly (not a synthetic stand-in),
exercising a scenario the current single-branch dialogue never produces but the evaluator must
still handle safely if a future scene ever adds a second possible answer.

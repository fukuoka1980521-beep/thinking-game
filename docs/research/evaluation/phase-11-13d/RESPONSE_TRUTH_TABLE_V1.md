# Response Truth Table V1 — PHASE 11.13D

All rows verified by `tests/structuredResponseSemantics.test.ts` ("CONFIRM / DENY / UNKNOWN /
NO_RESPONSE truth table"), dispatched through the real `commitLeftoverQuestionResponse`/
`evaluateLeftoverQuestionPrerequisite` seam.

| Outcome | questionAsked | answerReceived | targetStatus | targetFactKnown |
|---|---|---|---|---|
| (before ask) | false | false | UNRESOLVED | false |
| NO_RESPONSE (asked, nothing committed) | true | false | UNRESOLVED | false |
| CONFIRM | true | true | **KNOWN_TRUE** | true |
| DENY | true | true | **KNOWN_FALSE** | false |
| UNKNOWN | true | true | UNRESOLVED | false |

**KNOWN_FALSE is mechanically distinguishable from UNRESOLVED** — both leave `targetFactKnown:
false`, but `targetStatus` differs (`"KNOWN_FALSE"` vs. `"UNRESOLVED"`), and the `reason` string
differs (`QUESTION_TARGET_NOW_KNOWN_FALSE_VIA_ANSWER` vs. `QUESTION_ANSWER_RECEIVED_BUT_TARGET_
UNRESOLVED` vs. `QUESTION_ELIGIBLE`). Verified directly: "KNOWN_FALSE is never collapsed into
UNRESOLVED" — PASS.

## Real Product path (the only outcome the live scene currently reaches)

CONFIRM only — `LEFTOVER_QUESTION_RESPONSE_SEMANTICS["ASK_ABOUT_LEFTOVER_STOCK::KNOWN"] =
"CONFIRM"`, verified against the real captured Vertex line. DENY and UNKNOWN are proven through the
real `commitLeftoverQuestionResponse` function directly (the actual production function, not a
synthetic stand-in) with outcomes it is designed to support but which no current real dialogue
branch triggers — directive's own explicit instruction: "Owner-visible scene should remain
unchanged unless a real product defect is discovered" (Section 18). No real defect was found in the
live CONFIRM path; DENY/UNKNOWN remain proven-but-unused capabilities of the same real function.

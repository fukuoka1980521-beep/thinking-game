# Real Product Event Order Trace V1 — PHASE 11.13C

Mechanically captured from the real Product handler sequence (directive Section 13 — mandatory,
synthetic tests alone are insufficient). Source: `tests/npcResponseCommitPoint.test.ts`,
"real Product trace, mechanically captured at 3 points" — passing, real values quoted below.

## Point A — after physical reveal (ACCEPT dispatched)

| Field | Value |
|---|---|
| questionAsked | false |
| answerReceived | false |
| targetFactKnown | false |
| materials | `["leftover_stock_moved"]` |
| experienceLog | `[]` |
| visible response status | n/a — no question asked yet |

## Point B — immediately after PLAYER ask resolution, BEFORE response commit

This is the exact real intermediate state `askQuestion` passes through, captured by calling
`resolveAction` and the real `languageAdapter` (the response-delivery seam), but stopping BEFORE
the new commit line.

| Field | Value |
|---|---|
| questionAsked | **true** |
| answerReceived | **false** |
| targetFactKnown | **false** |
| materials | `["leftover_stock_moved"]` (unchanged — no response material yet) |
| experienceLog | `["運んだ箱が祭りの残りかどうか、洋平に尋ねた"]` |
| visible response status | the language adapter HAS already produced the visible line ("ああ、そうだ。祭りの残りだよ。値引きで出すから、棚に並べるんだ。") — the display text exists at this point, but the evaluator (computed from `ContractV2State`, never from the string) still correctly reports `targetFactKnown: false` |

**This is the mechanical proof the directive requires:** the visible line being ready for display
does NOT, by itself, commit authoritative state. LLM string availability and authoritative
knowledge are observably decoupled at this exact point.

## Point C — after response semantic commit

| Field | Value |
|---|---|
| questionAsked | true |
| answerReceived | **true** |
| targetFactKnown | **true** |
| materials | `["leftover_question_answered", "leftover_stock_moved"]` (sorted) |
| experienceLog | `["運んだ箱が祭りの残りかどうか、洋平に尋ねた"]` (unchanged by the commit — the ask record and the response record are genuinely separate) |
| visible response status | same displayed line as Point B — the commit does not alter what is shown, only what is authoritatively known |

## Real call order, quoted from `NewlifePlayable11App.tsx`

```ts
function askQuestion(contract, playerUtterance) {
  const { state: next, trace } = resolveAction(state, contract);           // -> Point B's state
  const packet = buildYoheiPacket(next, playerUtterance, contract.playerIntent);
  const line = languageAdapter(packet);                                     // response-delivery seam
  const afterResponseCommit = commitNpcResponseIfApplicable(contract.actionId, next, packet); // -> Point C's state
  setState(afterResponseCommit);
  setTraces((prev) => [...prev, trace]);
  pushLog([], line);
}
```

Confirmed by direct read of the file — no reordering, no conditional skipping of the commit call
for the real `ASK_ABOUT_LEFTOVER_STOCK` dispatch path.

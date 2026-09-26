# PHASE 25.2 — Conversation Fact Ownership Memory V1

Status: implemented, automated tests PASS. HUMAN_VALIDATION_STATUS = PENDING (a technical PASS is not a product PASS).

## Root cause

The live-semantic free-talk path was stateless: each turn sent only one utterance plus a `FactsSnapshot` (menu / seats / … facts). Nothing recorded **who said / did / offered / permitted / owns** what, and the truth gate only checked banned terms, numbers and required-fact overclaims. So a generated line could move a quote, an action, a permission or a responsibility onto another NPC (observed: the player's 「何か手伝えることがあれば」 became 美代子's own words).
Canon already separates these (Day 3: 美代子's vague reply vs. 文子's *inference* that she agreed); the runtime did not.

## State model (compact — not a transcript)

`src/newlife/semantic/factLedger.ts`

| list | entry |
|---|---|
| `facts` | `{kind: said\|did, actor, text, keys}` |
| `offers` | `{actor, text, keys}` (offered / promised) |
| `permissions` | `{owner, subject, granted, keys}` |
| `responsibilities` | `{owner, task, keys}` |
| `unresolved` | `{text, keys}` |

`state:*` entries are re-derived from `NewLife30State` on every sync (system owns truth); `conv:*` entries come from the player's free input, capped at 10 per list (oldest first), texts ≤ 80 chars, ≤ 16 entries per list on the wire.

## Generation gate

`attributionGate.ts`, run inside `runTruthGate`:
CHECK 1 quote/past-statement speaker · CHECK 2 past-action actor · CHECK 3 fabricated permission · CHECK 4 responsibility drift.
CHECK 5 (player free input already updated the ledger) is `ledgerReflectsUtterance` in the coordinator.
On an ownership violation the coordinator **regenerates once** with the violations as `feedback` (`MAX_SEMANTIC_ATTEMPTS = 2`), then falls back to the deterministic line. Non-ownership violations still fall back without a retry (cost guardrail).

## Behavior changes (SPEC_BEHAVIOR_DIFF)

| item | before | after | status |
|---|---|---|---|
| snapshot sent to interpreter | facts only | facts + compact ledger (+ optional `feedback` on regeneration) | INTENTIONAL_CHANGE_SYNCED (this doc; `lib.js` validates/bounds it) |
| gate rejection | fall back at once | ownership violation → 1 regeneration → fall back | INTENTIONAL_CHANGE_SYNCED |
| player offer of help (「手伝います」「何か手伝えることがあれば」) | clarification / flavor line | offer act: NPC acknowledges the offer as the *player's*, cites the unresolved item and its owner from the ledger | INTENTIONAL_CHANGE_SYNCED |
| no ledger passed | Phase 30 behavior | unchanged (result has no `ledger` field) | MATCH |

Fact questions, tone/repair acts and all other acts are routed exactly as before (an offer is checked after fact domains and before the social acts).

## Scope kept out

No long-term persona memory, no 30-day scenario rewrite, no UI/asset/event changes, no vector DB / RAG.

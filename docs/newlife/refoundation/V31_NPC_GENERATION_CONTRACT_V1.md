# NEW LIFE V31 — NPC GENERATION CONTRACT V1

Status: SMALLEST NORMATIVE CONTRACT FOR V11 STAGE 5. Successor to V27 (ending vector) in the same "design-first, not wired in" series.

## 0. Scope

V13 §1 splits ownership: "system owns truth and state; AI owns semantic conversation and expression." Stages 1-4 implemented the truth/state half (`types.ts`, `relationshipReducer.ts`, `ending.ts`) and the *interpretation* half of expression (`semanticInterpreter.ts`: raw text -> structured fact). This contract covers the remaining half: structured fact -> natural NPC-facing wording, for the vertical-slice case's two named characters, Mika (美香) and Ryo (亮/リョウ), per `V3_OPENING_COMMUNITY_THEATER_CONFLICT_V1.md`.

Mirrors `semanticInterpreter.ts`'s adapter-boundary pattern exactly, in the opposite direction: that module takes untrusted text in and returns a trusted structured value; this one takes a trusted structured value in and returns untrusted text out. Same three failure modes (unavailable / threw / malformed) collapse to the same kind of safe fallback.

## 1. Input: `NpcVisibleStateProjection`

The generator's only input. Mirrors `FactsSnapshot`'s (`contract.ts`) data-minimization discipline: never the full hidden world, never another NPC's record, never `causalEventHistory`/`correctiveActionLog` (those are audit trails, not conversational material).

Fields:
- `npc`: which of `MIKA` | `RYO` is speaking.
- `relationshipState`: this NPC's *own* `RelationshipState` (`OPEN`/`NEUTRAL`/`GUARDED`/`WITHDRAWN`). Allowed to affect openness/length/guardedness of the generated line (requirement 1's explicit carve-out). Must not affect how the *player's* last turn is read — that reading already happened in stage 4 and is not re-litigated here.
- `boundaryStatus`: this NPC's current ending-facing boundary status (`ending.ts`'s `EndingBoundaryStatus`: `UNKNOWN`/`STATED`/`RESPECTED`/`OVERRIDDEN`).
- `lastPlayerTurn`: the *already-validated* `TurnClassification` of the player's most recent turn addressed to this NPC, or `null` for an opening line. Structured categories only (`ActionType`/`BoundaryMode`/`RelationalEvent[]`) — never the player's raw utterance text, so a generation adapter cannot re-score the player's literal phrasing/tone a second time after stage 4 already classified it tone-blind (requirement 4).
- `sceneContext`: opaque, caller-supplied string naming only what this NPC is currently allowed to reference (e.g. "16:40, rehearsal stopped, the disputed scene, Ryo present"). Never parsed by this module (matches `semanticInterpreter.ts`'s `caseContext` discipline) — the caller (future game loop) is responsible for keeping it inside what this NPC would plausibly know, which is a case-authoring concern, not this contract's.

This module never imports `NpcRelationshipRecord`, `CausalEventHistoryEntry`, `CorrectiveActionLogEntry`, or any other-NPC identifier. A generation adapter physically cannot leak a fact it was never given.

## 2. Static voice constraints (system-authored, not generated)

Per-character constraints live as a plain exported constant, never produced by a model and never influenced by player input:

- **MIKA** — firm, not hysterical (V3 opening: "She is firm, not hysterical"). Must not moralize, must not offer the player advice framed as counseling, must not explain her own psychology unprompted. `GUARDED`/`WITHDRAWN` shortens her lines and increases refusal directness; it must never read as sudden hostility disproportionate to what `relationalEvents` on record actually justify.
- **RYO** — frustrated, not villainous (V3 opening: "He is frustrated, not villainous"), production-pragmatic, task/logistics-first. Must not become punitive or sarcastic beyond ordinary production-pressure irritation, and must not speak for Mika's private reasons — he explicitly does not know them at case start (V3 "Hidden layer").

Both: never claim a promise, permission, fact, or completed action that is not present in `NpcVisibleStateProjection` (requirement — "must not invent facts, permissions, promises, motives, completed actions, or state transitions"). This is an authoring constraint on any real adapter, not a runtime-provable one — no deterministic check can verify a free-text line's factual content without itself becoming a second semantic classifier. Documented here as an open, inherent limit of any model-adapter boundary, consistent with the same disclosure already made for `semanticInterpreter.ts` (V30 committed to the same "we validate shape, not truthfulness" boundary).

## 3. Output validation (the one thing that *is* deterministically enforced)

`isValidRawNpcLine` rejects a response unless:
1. `npc` matches the request's `npc` (an adapter cannot answer as the wrong character).
2. `text` is a non-empty string within a bounded length (a runaway or empty completion is treated as malformed, not silently accepted).
3. `text` contains none of a fixed denylist of literal ontology tokens (`ALL_ACTION_TYPES`, `ALL_BOUNDARY_MODES`, `ALL_RELATIONAL_EVENTS`, `RelationshipState` values, plus the literal words `TRUST`/`BOUNDARY_MODE`/`CLARITY`/`SITUATION`) — a deterministic, closed-list plumbing check (not a semantic classifier; consistent with "regex only for trivial deterministic plumbing, never semantic interpretation" — this checks for literal label leakage, it does not attempt to understand meaning).

This closes requirement 5 ("must not expose raw ontology labels... or hidden scores") as a structural validator check for the literal-leakage case. It cannot and does not attempt to verify that a line's *content* is faithful to state (§2's open limit) — that would require the validator itself to be a semantic engine, which is exactly what this series has consistently refused to build without a live, tested model behind it.

## 4. Fallback (unavailable / adapter threw / malformed shape)

All three collapse to one deterministic, per-`(npc, relationshipState)` canned line table (`FALLBACK_LINES`), never a single generic line — this is what actually satisfies "WITHDRAWN must remain locally terminal... generator output must reflect non-cooperation rather than silently resetting" in the one place this module can *guarantee* it (the fallback path; §2 already discloses that the adapter-success path is only constrained by documentation, not provably enforced). Every fallback line is a neutral, stage-direction-style placeholder (bracketed description, no dialogue claiming new facts) — safe and context-preserving by construction, never advancing `taskLedger`/`repairWindow`/any state, matching requirement "uncertain/failed model output must fall back to a safe, context-preserving line and never mutate state."

## 5. No state mutation

`generateNpcLine`'s return type is `{ npc, text, fallback: boolean }` only — no `NpcRelationshipRecord`/`CaseEndingState` parameter is taken by any exported function, and none is imported. Generating a line cannot, even by accident, apply a turn or spend time; that remains `relationshipReducer.ts`/`ending.ts`/`timeEconomy.ts`'s job, wired together only by a future game loop (as already true of `semanticInterpreter.ts`).

## 6. Self-audit (inline, single-pass — this is a narrow adapter-boundary contract mirroring an already-audited pattern, not a new case-level design surface; V27/V28's separate-document audit was proportionate to that stage's larger novel surface)

- **Checked:** does the denylist (§3.3) risk rejecting legitimate Japanese dialogue that happens to contain an English enum token as a substring? Reviewed all `ALL_ACTION_TYPES`/`ALL_BOUNDARY_MODES`/`ALL_RELATIONAL_EVENTS` values — all are uppercase-with-underscore ASCII tokens (e.g. `CROSS_WITHOUT_PERMISSION`) that cannot occur inside ordinary Japanese sentence text by accident. Not a blocker.
- **Checked:** does passing `lastPlayerTurn`'s `relationalEvents` into the projection let a generation adapter re-score tone under a different name (requirement 4's "tone/politeness of the PLAYER must not be re-scored here")? No — `relationalEvents` are already-validated *behavioral* facts (e.g. `PUBLIC_SHAMING` actually happened), not tone; the adapter is told a fact occurred, it is not asked to judge how it was phrased. This is the same category distinction V13 §2 already draws for the classifier itself.
- **Checked:** could `sceneContext` become an unbounded hidden-world leak vector since it's opaque? Yes, in principle — this module cannot validate an opaque string's content. Documented in §1 as a case-authoring responsibility, matching `semanticInterpreter.ts`'s identical treatment of `caseContext`. Not a new gap this stage introduces.
- **No blocker found.** `PASS_FOR_IMPLEMENTATION` for this narrow scope.

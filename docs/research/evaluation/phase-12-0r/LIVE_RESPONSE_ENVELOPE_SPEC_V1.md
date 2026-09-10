# Live Response Envelope Spec V1 — PHASE 12.0R

Directive Section 13. Clarification to `WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md`'s pipeline design.
**Not implemented this phase** — a specification of the minimum structured envelope, so PHASE 12.1
has a concrete shape to build against without this phase mandating a final JSON schema.

## What the model may generate (unchanged from PHASE 12.0, restated precisely)

- A **classification proposal** (one of the 5 classes, `BOUNDED_FREE_TEXT_CONVERSATION_V1.md`).
- A **response semantic proposal** (which, if any, authored allowed transition this interaction
  maps to — a PROPOSAL, never a commit).
- **Natural language** (the visible line, in the NPC's own voice).

## What Product code must do before any of it reaches State Admission

Verify the STRUCTURED envelope (classification + semantic proposal) against fixed, authored
registries — never trust the model's self-report, never infer either field from parsing the
natural-language text. This is `WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md`'s "hard structural
validation" stage, restated here as a concrete minimum shape.

## Minimum structured response envelope for PHASE 12.1 (illustrative, not mandated)

```
{
  "classification": "IN_SCOPE" | "NPC_KNOWLEDGE_GAP" | "NOT_FEASIBLE_NOW" | "OUT_OF_WORLD_SCOPE" | "INSUFFICIENT_CONTEXT",
  "npcResponseIntent": "<short authored-vocabulary label the NPC's response is enacting, e.g. ACCEPT_HELP_OFFER, DECLINE_ALREADY_COVERED, EXPRESS_IGNORANCE>",
  "proposedConsequenceId": "<id matching an authored allowed-transition registry entry, or null>",
  "visibleUtterance": "<generated Japanese, display only, never read for authority>"
}
```

Four fields, matching directive Section 13's own "example concerns" list exactly
(classification / npc response intent / proposed consequence id / visible utterance) — no fifth
field invented, no nested sub-schema designed prematurely. `npcResponseIntent` is kept SEPARATE
from `classification` because they answer different questions (classification = "what kind of
input was this," intent = "what did the NPC's response actually do") — collapsing them would
reintroduce a version of PHASE 11.13B's QUESTION-vs-ANSWER conflation at the generative layer.

## Explicit non-decisions (directive: "no final JSON shape is mandated here")

- Field names above are illustrative; PHASE 12.1 may rename them to match existing
  `ActionContractV2`/`LifeMaterial` vocabulary more closely once actually wired.
- Whether `npcResponseIntent` is a fully closed enum or a per-NPC-authored open vocabulary is left
  to PHASE 12.1's implementation, since it depends on decisions (how many transitions per NPC) not
  yet made.
- Error/timeout shape (what the envelope looks like when the live call itself fails) is deferred to
  PHASE 12.1 — `NG_RESPONSE_SEMANTICS_V1.md` already specifies the semantic fallback
  (`INSUFFICIENT_CONTEXT`/neutral deflection); the exact wire-level error representation is an
  implementation detail, not an architecture decision.

## Why this belongs in PHASE 12.0R specifically

The correction this phase makes (canon resolution before generation) and this envelope
clarification are the same discipline applied at two different pipeline stages: canon resolution
governs what goes IN, ensuring the model is never asked to reconcile source documents itself; this
envelope spec governs what comes OUT, ensuring the model's own self-classification is never trusted
without independent registry validation. Neither is new to this phase in principle (both extend
PHASE 11.13D/E's structural-authority discipline) — this document exists so PHASE 12.1 has both
halves stated together, explicitly, before implementation begins.

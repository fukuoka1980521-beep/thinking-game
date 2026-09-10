# NG Response Semantics V1 — PHASE 12.0

Directive Section 11-12. Out-of-bound input must never produce a system error, a generic chatbot
refusal, or an invented world expansion — it must produce an NPC-appropriate semantic class,
realized naturally in that NPC's own language.

## Semantic meaning per classification (not Japanese text — text is generated, never authoritative)

| Classification (`BOUNDED_FREE_TEXT_CONVERSATION_V1.md`) | Semantic meaning to realize | Example canonical phrasing register (illustrative only, NOT authoritative) |
|---|---|---|
| `NPC_KNOWLEDGE_GAP` | "I don't know" / "that's not something I know" | 「知らない」「分からない」「それは俺に聞かれても分からん」(directive Section 12's own examples) |
| `NOT_FEASIBLE_NOW` | "That can't happen right now" (with the world-state reason implicit in tone, not necessarily spelled out) | e.g. Yohei declining help because Daichi's already on it |
| `OUT_OF_WORLD_SCOPE` | "That's beyond what I know / outside this town's concerns" | An NPC's version of "that's not something I'd have an opinion on" |
| `INSUFFICIENT_CONTEXT` | "I need more to go on" | A request for clarification, in-character |

**The displayed Japanese may vary by NPC** (directive Section 11) — Yohei's "俺に聞かれても分からん"
register is not Kamiya's or Miyoko's. This is realized by the language-generation step reading the
NPC's own `SPEECH_REGISTER` field (`NPC_CHARACTER_SYSTEM_V1.md`), never a shared canned string.

## Why this is a Product feature, not an AI failure (directive Section 12)

Different NPCs knowing different things is the entire reason Challenge Town canon's own causal
chains work (Yui's hypothesis is deepened by a third party mentioning something Yui herself
didn't say; the café anomaly is split across Miyoko/Daichi/Chinatsu, each holding a different
non-answer). An NPC saying "I don't know" is not a dead end — it is the mechanism that creates
reason to move around the map and return later (directive Section 12), i.e. it is load-bearing for
`CHALLENGE_TOWN_MAP_SYSTEM_V1.md`'s whole reason to exist as a game system rather than decoration.

## Structural implementation shape (forward-referencing `WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md`)

The classification is a structured field returned alongside (not extracted from) the generated
line, matching PHASE 11.13D/E's "material id IS the signal, concreteContent is never re-parsed"
discipline:

```
{
  classification: "NPC_KNOWLEDGE_GAP" | "NOT_FEASIBLE_NOW" | "OUT_OF_WORLD_SCOPE" | "INSUFFICIENT_CONTEXT" | "IN_SCOPE",
  proposedStateEffect: <one of the authored allowed transitions, or null>,
  visibleLine: "<generated Japanese, display only>"
}
```

`classification` and `proposedStateEffect` are validated against fixed, authored registries before
anything commits (`WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md` §hard structural validation).
`visibleLine` is shown to the player and is NEVER read by any authority decision — continuing
PHASE 11.13E's zero-prose-authority finding into the generative pipeline.

## What this explicitly rules out

- A hardcoded English-style refusal ("I cannot help with that") — breaks immersion and the
  "Japanese wording is not authoritative but must still be natural" requirement.
- A raw model/API error surfacing to the player (a `500`, a timeout, a safety-filter block) — must
  be caught and mapped to `INSUFFICIENT_CONTEXT` or a neutral in-character deflection, never shown
  raw (see `LIVE_VERTEX_LOCAL_ADAPTER_DESIGN_V1.md` for the adapter-level handling).
- The LLM inventing a new fact to "helpfully" answer an out-of-scope question (e.g., inventing a
  town history detail no document authored) — this is exactly what `OUT_OF_WORLD_SCOPE`/fail-closed
  classification exists to prevent, and why the prompt boundary (Section 13) must explicitly forbid
  it, not merely hope the model declines to do it.

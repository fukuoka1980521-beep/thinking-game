# Bounded Free-Text Conversation V1 — PHASE 12.0

Directive Section 9-10.

## Division of control surfaces (directive Section 9)

| Surface | Control type | Why |
|---|---|---|
| MAP / major physical actions (move to a location, accept/decline a structured request, physically do a defined task) | Structured Product controls (buttons), unchanged from the fixed-dialogue baseline's `ActionContractV2` pattern | These are world-mutating actions where the SET of legal actions is genuinely small and enumerable — no reason to accept free text and reject 99% of it |
| NPC conversation | Bounded free text | This is exactly where the fixed-dialogue baseline hit its ceiling (Section 8's AI-necessity argument) — natural conversation is not enumerable, but its EFFECT on world state still must be |

**Explicit non-claim** (directive Section 9): V1 does not claim arbitrary action freedom. A typed
sentence during NPC conversation can never directly mutate the world — it can only, via the
pipeline in `WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md`, propose a classification that a fixed,
authored registry either recognizes (and commits a fixed consequence) or doesn't (and commits
nothing). This is the same "structured contract, structured outcome" discipline as
`ActionContractV2`, just with a text field standing in for a button.

## What free text may express (directive Section 9, restated with examples grounded in the
## NPC system)

- **Ask** — "何を手伝えばいい？" style questions, now typed instead of button-selected.
- **Suggest** — "手伝おうか？" (Section 8/10's own worked example).
- **React** — a plain acknowledgment or reaction to what an NPC just said.
- **Decline** — free-text refusal of a structured or conversational request.
- **Express curiosity** — asking about something visible/mentioned without it being a "target
  fact" the old system pre-registered.
- **Offer help** — same shape as "suggest," kept as its own bullet per directive wording.
- **Ordinary conversational remarks** — small talk, matching the fixed-dialogue baseline's already-
  validated `SMALL_TALK`/`GREETING`/`TRIVIAL_COFFEE_EXCHANGE` contracts (`pendingReplyContracts.ts`)
  — these remain legitimate content classes, just realized in free text + generated language
  instead of one canned line.

## Bounded input classification (directive Section 10)

Minimum distinctions actually needed for the V1 3-NPC/5-location slice (directive: "do not
cargo-cult these exact names, use the minimum distinctions needed"):

| Class | Meaning | Example (from Section 8's Yohei experiment or canon) |
|---|---|---|
| `IN_SCOPE` | NPC has the knowledge/standing/opportunity to respond meaningfully right now | "祭りどうだった？"-style ordinary questions Yohei can answer from firsthand experience |
| `NPC_KNOWLEDGE_GAP` | Question is legitimate but this specific NPC doesn't know the answer (may know who does) | Asking Yohei about Challenge Center administrative specifics — that's Kamiya's domain |
| `NOT_FEASIBLE_NOW` | Request is understood and in-world-possible in general, but not right now given current state | Offering to help Yohei when Daichi is already helping (Section 8 STATE B) |
| `OUT_OF_WORLD_SCOPE` | Question/action has no referent inside the authored world boundary at all | Asking about something with no analog in Challenge Town's authored facts |
| `INSUFFICIENT_CONTEXT` | Too ambiguous/underspecified to classify confidently | A fragment that doesn't resolve to a recognizable intent given current context |

Five classes, collapsing directive Section 10's six candidate names by merging
`OUTSIDE_NPC_SCOPE` into `NPC_KNOWLEDGE_GAP` (both describe "this NPC personally can't help,"
differing only in whether another NPC could — a nuance the language realization can express without
needing a structurally separate class for V1's small cast) and treating `AVAILABLE_CONTEXT` as an
input to classification, not an output class of its own.

## Classification is evaluated against (directive Section 10)

`WORLD SCOPE` (does this concept exist in the authored world at all) → `NPC SCOPE` (is this NPC's
domain) → `NPC KNOWLEDGE` (firsthand vs. heard vs. explicit unknown) → `CURRENT FEASIBILITY`
(world-state-dependent, e.g. STATE B's "already helping") → done. Order matters: an
out-of-world-scope check must run before an NPC-knowledge check (no point asking "does Yohei know
about X" if X doesn't exist in the world at all) — this ordering itself is part of the pipeline
design in `WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md`.

## Relationship to PHASE 11.13's structural-authority principle

The classification output (one of the 5 class labels above) is exactly the kind of STRUCTURAL
signal PHASE 11.13D/E validated for NPC responses — a small closed enum, authored/interpreted by
code, never re-derived from the LLM's own display prose after the fact. The LLM may PROPOSE which
class applies (as part of its structured output, Section 13), but the class value itself, once
returned, is what code branches on — never a second pass of parsing the eventual Japanese sentence.

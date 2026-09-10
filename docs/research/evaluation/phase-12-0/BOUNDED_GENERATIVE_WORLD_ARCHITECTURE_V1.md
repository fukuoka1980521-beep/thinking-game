# Bounded Generative World Architecture V1 — PHASE 12.0

## 0. Canon audit finding (load-bearing, discovered this phase)

Two different NEW LIFE settings exist in `docs/product/`:

1. **あさひ町 / Chinatsu-Seiichi mystery lineage** (`NEWLIFE_STORY_BIBLE_V1/V2/V3.md`,
   `NEWLIFE_3DAY_MASTER_PLOT_V2/V3.md`, `NEWLIFE_CHARACTER_ARC_BIBLE_V2.md`) — café のどか hub,
   3-day structure, Miyoko/Yohei/Chinatsu/Daichi cast, grandmother/granddaughter mystery.
2. **Challenge Town canon** (`NEWLIFE_CHALLENGE_TOWN_SCENARIO_BIBLE_V01.md`,
   `NEWLIFE_CHAPTER1_DAY1_DAY3_SCRIPT_V01.md`, `NEWLIFE_CHAPTER1_CAUSAL_MAP_V01.md`,
   `NEWLIFE_CHAPTER1_STATE_MODEL_V01.md`) — the 57-year-old protagonist, Challenge Center, 30-day
   trial, expanded cast (adds Kamiya/Yui/Iwata).

`NEWLIFE_CHALLENGE_TOWN_SCENARIO_BIBLE_V01.md` states explicitly it **supersedes** the あさひ町
lineage, and `NEWLIFE_CHARACTER_ARC_BIBLE_V2.md` itself carries a superseded banner confirming
this. This phase's directive Section 4 (57yo, left a long-held job, 30-day trial, Challenge Town,
Day30 key return) matches Challenge Town canon exactly, confirming it as the authoritative source
for this architecture.

**Risk found and flagged, not silently carried forward**: PHASE 11.14's own
`RELATIONSHIP_GROUNDING_AUDIT_V1.md` cited `NEWLIFE_3DAY_MASTER_PLOT_V3.md` (the superseded あさひ町
lineage) as canon justification for the `?newlifeplayable11=1` scene's Yohei relationship. That
scene is a `FIXED_DIALOGUE_BASELINE` now (see that document) and not being extended, so the citation
does not propagate forward, but it is recorded here as a stale-canonical finding per this project's
own `SPEC_IMPLEMENTATION_LOCK` discipline (`CANONICAL_STALE` — the newer Challenge Town canon
directly and explicitly supersedes it; no ambiguity requiring a stop condition). **All PHASE 12.0+
work uses Challenge Town canon only.**

## 1. Central hypothesis (directive Section 1)

Fixed-table dialogue (`PLAYER chooses A → authored response 1`) cannot produce unpredictability,
freedom, NPC autonomy, or AI necessity, even with perfect state handling (proven, not assumed — see
`FIXED_DIALOGUE_BASELINE_STATUS_V1.md`). The new hypothesis: the author defines a **closed set of
boundaries** (world facts, NPC identity/knowledge/goals/constraints/relationships, location, time,
allowed state transitions); inside those boundaries, an LLM chooses and realizes a contextually
valid human response. The author's job shifts from "write the answer" to "write the character and
the world the answer must stay inside of."

## 2. Core principle: BOUNDED GENERATIVE WORLD

**Finite world + generative behavior**, not infinite world, not a fixed branching table. The
authored perimeter (locations, NPCs, facts, transitions) is closed and small; NPC language and
moment-to-moment behavior inside it may vary. This is the same shape as the `LifeMaterial`/State
Admission architecture already validated in PHASE 11.6R–11.13E, extended from "structured actions
with structured outcomes" to "structured actions with LANGUAGE-generated, structurally-validated
outcomes."

## 3. AI necessity argument (required final question 1/2)

**Why AI is genuinely needed now** (not merely convenient): the fixed-dialogue baseline required
one authored response PER (question, world-state) pair. `ASK_FESTIVAL_SCENE` alone already needed
distinct handling across "not yet asked," "already resolved by another response," and "asked
directly" — three states for ONE question, ONE NPC, ONE topic. A bounded generative world with 3
NPCs × ~5 world facts each × ~4-6 locations × free-text player input produces a combinatorial state
space no author can pre-write per-cell while keeping every cell character-consistent and mutually
non-contradictory. Section 8's AI-necessity experiment (below) demonstrates this concretely with
real canonical world facts, not a synthetic example.

**What remains impossible even with AI** (required final question 2, stated honestly, not
deferred): (a) AI cannot be trusted to decide WHETHER a world fact becomes true — that must remain
deterministic State Admission (Section 14/`WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md`); (b) AI cannot
invent new locations, NPCs, or relationships not authored in the world boundary — the boundary is
closed by design, and an out-of-boundary request must classify as out-of-scope, never silently
expand the world; (c) AI cannot replace scene/plot structure — Challenge Town's causal chains
(café anomaly, notice board → Challenge Center, Yohei first-contact recurrence) remain
author-designed sequences; AI only realizes the NPC's language and immediate reaction WITHIN a
chain step the author already defined exists; (d) AI cannot guarantee zero hallucination — the
pipeline's hard structural validation step (Section 15) exists precisely because generated text is
never trusted as authority, matching the LLM-STRING-!=-AUTHORITATIVE-STATE principle this project
established the hard way in PHASE 11.13B–D.

## 4. What is authored vs. generated (required final questions 3/4)

| Authored (fixed, by a human) | Generated (by the LLM, inside authored bounds) |
|---|---|
| World boundary: locations, their identities, travel relationships | The specific sentence(s) an NPC says in response to a given free-text input |
| NPC identity, personality, speech register, relationships | Which of several character-consistent reactions/tones is expressed this instant |
| NPC knowledge: firsthand facts, heard-secondhand facts, explicit unknowns | Natural elaboration/inference within those facts (never new facts) |
| NPC current goal/activity/constraint at a given world-state | Small talk, mood coloring, ordinary conversational texture |
| World facts and their truth values at a given state | — (never generated; only realized in language) |
| Allowed state transitions (what a PLAYER/NPC interaction CAN cause) | A proposed semantic intent/classification of what the interaction accomplished (see Section 15) — proposed, not committed |
| The classification taxonomy for out-of-bound input (Section 10) | Which class a given utterance falls into, AND the natural-language realization of that class (Section 11) |
| Causal chains / scene structure (what can happen, in what order) | Moment-to-moment texture inside one step of a chain |

## 5. What may / may never mutate world state (required final questions 5/6)

**May mutate state**: only a deterministic State Admission commit
(`admitMaterials`/`mergeMaterials`, unchanged since PHASE 11.6R), triggered by an authored
"allowed state transition" being matched. The LLM's output can PROPOSE which transition (if any)
applies (a classification/intent, e.g. "PLAYER_OFFERED_HELP"), but the actual `LifeMaterial`
written, its id, and its fields are constructed by code from a fixed registry, never from parsing
the LLM's sentence for content (continuing PHASE 11.13D/E's structural-authority principle).

**May never mutate state**: raw LLM text. No generated sentence can, by itself, create a new
location, relationship history, possession, promise, world event, or knowledge authority. If the
LLM's classification does not match any authored allowed transition, nothing commits — this is the
fail-closed default already established for unregistered material ids (PHASE 11.13E) and
unclassified Product actions (PHASE 11.12), extended to free text.

## 6. NPC ignorance (required final question 7)

An NPC's `NPC_UNKNOWNS` field is authored explicitly (not merely "whatever isn't in
NPC_FIRSTHAND_EXPERIENCE"), and the LLM is instructed that stating ignorance for anything in, or
adjacent to, that list is a correct, in-character answer — never a failure to route around. This
reuses the finding from recent external research (Knowledge Boundary of LLMs, ACL 2025 — see
`EXTERNAL_RESEARCH_MAPPING_V1.md`): the relevant boundary for a role-played character is the
CHARACTER's knowledge limit, not the model's own factual knowledge — the model may well "know" an
answer and must still decline it in-character if Yohei wouldn't know it. Different NPCs knowing
different things is the reason to move around the map and return later (directive Section 12),
mirrored directly from Challenge Town's own causal design (Kamiya/Yohei/Yui hold different pieces
of the Yui-hypothesis thread; Miyoko/Chinatsu/Daichi hold different pieces of the café anomaly).

## 7. Out-of-world input failing naturally (required final question 8)

See `NG_RESPONSE_SEMANTICS_V1.md` for the full classification. Summary: a small, closed
classification (not "does it look risky" but "which world/NPC boundary does this fall outside")
determines a SEMANTIC class (e.g. NPC_DOES_NOT_KNOW, OUTSIDE_WORLD_SCOPE), and the LLM realizes
that class in the NPC's own voice — never a generic refusal string, never a system error, never an
invented explanation that expands the world to accommodate the question.

## 8. How the map generates encounters (required final question 9)

NPCs have an authored `CURRENT_ACTIVITY`/`LOCATION` derived from world state (time window + prior
PLAYER actions + the NPC's own independent purpose), computed the same way
`yoheiContinuesLeftoverStockWorkNarration` already computes Yohei's independent continuation text
in the fixed-dialogue baseline — a pure function of state, not of whether the player is currently
looking. An encounter happens when a PLAYER's location choice and an NPC's state-derived location
coincide; the map is the mechanism creating this coincidence (directive Section 21/22), not a menu
of clickable NPC portraits. See `CHALLENGE_TOWN_MAP_SYSTEM_V1.md`.

## 9. NPC independence (required final question 10)

Every active NPC has a `CURRENT_ACTIVITY` value computed independent of PLAYER presence or
attention — Yohei moving delivery stock, Miyoko running the café, Kamiya doing Challenge Center
intake work — reusing the "world continues without the player watching" principle already proven
(`yoheiContinuesLeftoverStockWorkNarration`, and Challenge Town canon's own causal chains, which
explicitly fire or don't fire based on whether the player engaged, never on being "checked into" by
a menu).

## 10. Same action, different legitimate outcomes (required final question 11)

Directive Section 8's mandatory experiment, grounded in real canon (not "Jin," who is not a
canonical NPC — see `NPC_CHARACTER_SYSTEM_V1.md`'s cast audit): PLAYER says 「手伝おうか？」to
Yohei under three legitimate world states —

- **STATE A** (`yoheiTaskActive: "MOVING_DELIVERY_STOCK"`, no one else present): Yohei has a real,
  currently-unfinished physical task (canonical: Chapter 1 Causal Map Chain 1 — "Yohei is moving
  goods and something starts to fall"). Expected valid behavior class: grateful acceptance +
  concrete task handoff.
- **STATE B** (`yoheiTaskActive: "MOVING_DELIVERY_STOCK"`, `daichiPresent: true`,
  `daichiHelping: true`): the same task exists, but Daichi (canonical childhood friend, café
  regular) is already helping. Expected valid behavior class: polite decline, "already covered,"
  no task handoff, still warm.
- **STATE C** (`yoheiTaskActive: null`): no active task; ordinary quiet shop moment. Expected valid
  behavior class: mild surprise / no task available, redirects to ordinary conversation, no task
  handoff.

Same player intent (offer to help), three different world contexts, three materially different but
equally Yohei-consistent responses — none of which requires a different authored dialogue TREE,
only a different authored WORLD STATE feeding the same generation call. Full paper simulation in
`ADVERSARIAL_PAPER_SIMULATION_V1.md` Case G.

## 11. Where unpredictability comes from (required final question 12)

Never bare RNG. Sources, in priority order: (1) NPC schedules (time-of-day × authored daily
purpose), (2) independent NPC goals/current tasks, (3) world events already legitimately possible
given accumulated PLAYER history (e.g. `challengeCenterKnown`, `yoheiContactCount`), (4) PLAYER's
own prior actions changing which branch of an NPC's authored behavior applies, (5) location/time
intersections (Section 8's map-generates-encounters mechanism). Randomness, if used at all, may
only choose AMONG already-legitimate authored possibilities (e.g., which of two equally-valid
idle-activity lines an NPC does this exact visit) — never manufacture a new fact, per directive
Section 18.

## 12. Preserving PHASE 11.12–11.13E's boundary lessons

- Product Surface ownership (who a UI element/response belongs to: PRODUCT vs QA/RESEARCH/DEBUG) —
  reused verbatim; a free-text conversational turn is still a Product-owned surface subject to the
  same ownership gate as a button.
- The dev/build compile-time boundary (`import.meta.env.DEV`, literal call-site check, never a
  default parameter) — reused verbatim for anything that must never reach a production bundle
  (credentials, debug disclosure, prompt-construction internals).
- Structural, never-prose-based authority — extended, not replaced: the LLM's output text is
  exactly as untrusted for authority purposes as `concreteContent` was in PHASE 11.13D/E; only a
  structured classification field (analogous to `StructuredResponseOutcome`) may ever be read for
  a state decision.
- Fail-closed defaults for unclassified/unregistered items — extended to free-text classification:
  an utterance that doesn't cleanly classify defaults to the most conservative NG class
  (INSUFFICIENT_CONTEXT or OUTSIDE_WORLD_SCOPE), never to "assume it's fine."

See `WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md` for the full pipeline this generalizes into.

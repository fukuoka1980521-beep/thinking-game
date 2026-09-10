# External Research Mapping V1 — PHASE 12.0

Directive Section 24. Real web research performed this phase (not recalled from training data
alone) via targeted queries on: bounded generative NPCs, NPC knowledge boundaries/fallback, LLM
game-state guardrails, and generative-agent follow-up work. Prior findings reused where still
valid; newer sources sought explicitly.

## Prior findings — reused (directive: "reuse prior findings where still valid")

| Source | Core idea | Status |
|---|---|---|
| Generative Agents (Park et al., 2023, Stanford/Google — `arxiv 2304.03442`) | Sandbox agents with memory stream → reflection → planning, LLM-driven behavior in a simulated town | Still valid as the foundational reference point; **REJECT wholesale adoption** (full memory/reflection/planning stack is far heavier than a 3-NPC, one-morning slice needs), **ADAPT** the single idea of "NPC current activity derived from an authored daily schedule," already independently arrived at via this project's own `yoheiContinuesLeftoverStockWorkNarration` pattern |
| Façade / Versu / Prom Week | Authored social/drama simulation with autonomous NPC behavior inside strict authored rules | **ADAPT** the general "author the rule space, not the line," which is this phase's own central hypothesis — no direct code/format reuse, these are pre-LLM systems with different technical mechanisms |
| Failbetter / quality-based narrative (Storynexus-style) | Numeric qualities gating narrative options | **REJECT** — directive Section 20 explicitly forbids inventing a reward-meter system, and quality-based narrative's central mechanism IS a meter system; the underlying "state gates content" idea is already served by `LifeMaterial`/State Admission without needing quality numbers |

## New sources found this phase (real web search, 2025-2026)

| Source | Core idea | Classification |
|---|---|---|
| Bounded Autonomy: Controlling LLM Characters in Live Multiplayer Games (`arxiv 2604.04703`) | "Reply-chain decay, action grounding with fallback, and whisper-based soft steering" keep open-ended LLM character behavior executable/steerable/socially coherent in live shared play | **ADOPT** "action grounding with fallback" directly — this is exactly `WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md`'s hard-validation-then-fail-closed step, independently arrived at; this source is corroborating evidence the approach is a recognized pattern, not merely this project's own invention |
| Knowledge Boundary of Large Language Models: A Survey (ACL 2025, `arxiv 2412.12472`) | Formal taxonomy of what an LLM does/doesn't know and how to detect/mitigate the boundary | **ADAPT** the FRAMING, not the taxonomy itself: reframed in `NG_RESPONSE_SEMANTICS_V1.md`/`BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md` §6 as "the CHARACTER's authored knowledge boundary, not the model's own" — the survey's own real-world game-relevant framing (a role-played character must decline knowledge the model itself may actually have) is the single most directly-usable idea from this search |
| CHARM: Character Hallucination for Multicultural Role Play Benchmark (`arxiv 2609.01352`) | Separates "boundary awareness" (does the model know it shouldn't know) from "compliance" (does it actually decline) as two distinct failure modes | **ADAPT**: informs why `NG_RESPONSE_SEMANTICS_V1.md`'s hard structural validation must not simply trust the model's own stated classification — a model can be boundary-aware in its prose while still leaking a fact; hence `proposedStateEffect`/classification are validated independently of `visibleLine`'s content, never inferred FROM it (continuing PHASE 11.13's zero-prose-authority principle, now with external corroboration that this exact failure mode is a documented, named risk) |
| Real-Time World Crafting: Generating Structured Game Behaviors from NL with LLMs (`arxiv 2510.16952`) | A DSL as an intermediate layer constrains LLM output to pre-validated operations; each request is grounded with dynamic current-game-state context | **ADOPT** directly: this is structurally identical to `WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md`'s "classification + proposedStateEffect must match an authored registry" design and to feeding `WORLD_FACTS`/`NPC_CURRENT_ACTIVITY` as dynamic context on every call — strong external validation that the architecture is not a novel/risky approach but a recognized current pattern |
| University of Tartu 2025 thesis (modular LLM-NPC dialogue, cited via search summary) | LLM only touches the FINAL stage (language realization) after the system has already decided WHAT to communicate | **ADOPT**: exactly matches this project's own hard-won PHASE 11.13D/E finding (semantic authority decided structurally; LLM/display text never authoritative) — used here as independent confirmation, not as the origin of the idea (the idea predates this search, from this project's own incident history) |
| "Contextual persona locking" (character-definition-prompt establishes a knowledge horizon) | Prompt-level technique for keeping an NPC's apparent knowledge bounded (e.g. a medieval NPC not "knowing" about modern tech) | **ADOPT** directly for `NPC_UNKNOWNS`/prompt design in Section 13's field list |
| Commonsense Persona-Grounded Dialogue Challenge 2025 (CPDC) | Real competition benchmark; notably a **7-second response time constraint** for task-oriented + context-aware hybrid NPC dialogue | **ADAPT**: not adopted as a hard requirement this phase (no latency budget was specified by the directive), but noted as a realistic practical constraint the PHASE 12.1 live-adapter implementation should measure against, since Vertex `gemini-2.5-flash` round-trips plus the "thinking budget" behavior documented in `LIVE_VERTEX_LOCAL_ADAPTER_DESIGN_V1.md` could plausibly exceed a tight latency budget — a risk noted in `RISK_AND_FALSIFICATION_V1.md`, not solved here |
| Guardrails AI / "validate-then-fix-or-reask" pattern | Schema-validate LLM output; on failure, re-ask or fix rather than surfacing a raw error | **ADAPT** partially: the "validate against schema" half is directly adopted (hard structural validation stage); the "re-ask" half is explicitly NOT adopted for V1 (adds latency/cost and a retry-loop failure mode not worth it for a first slice) — a validation failure in V1 falls back to the fail-closed `INSUFFICIENT_CONTEXT` class instead of re-prompting |

## What was explicitly rejected and why

- Full generative-agent memory/reflection/planning stacks (too heavy for a bounded 3-NPC slice;
  this project's own `experienceLog` already provides sufficient "recent relevant experience"
  without a reflection layer).
- Quality-based/numeric narrative systems (directive Section 20 explicit prohibition on inventing a
  reward meter).
- Retry/re-ask loops on validation failure for V1 (latency/complexity not justified yet; fail-closed
  is simpler and matches this project's existing fail-closed conventions).
- Copying any framework's actual codebase/format wholesale — every adoption above is a PRINCIPLE
  translated into this project's own existing primitives (`LifeMaterial`, `ActionContractV2`,
  structured response outcomes), never an external library or schema imported as-is.

# Strategist Architecture Audit Packet V1 — PHASE 12.0

Evidence-packaging document for independent Strategist review of the Bounded Generative World
architecture. This phase is DISCOVER → RESEARCH → ARCHITECT → PAPER SIMULATE → CRITIQUE only — no
Product code was written or expanded (directive Section 26). Baseline commit
`3f97b4873da40ad93ae7594059cf897c1252cd37` remains the last commit; nothing further was committed
this phase.

## Required final questions (directive Section 28)

1. **Why does this Product now genuinely need AI?** Fixed-table dialogue requires one authored
   response per (question, world-state) pair; the fixed-dialogue baseline already needed 3 states
   for ONE question about ONE topic. A bounded world of 3 NPCs × world facts × locations × free
   text is combinatorially unauthorable by hand while staying character-consistent. See
   `BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md` §3.
2. **What remains impossible even with AI?** Deciding whether world state actually changes (stays
   deterministic State Admission); inventing locations/NPCs/relationships outside the authored
   boundary; replacing authored scene/causal-chain structure; guaranteeing zero hallucination
   (hence hard structural validation exists at all). Same section, second half.
3. **What is authored?** World boundary, NPC identity/knowledge/goals/constraints/relationships,
   allowed state transitions, the out-of-scope classification taxonomy, causal chain structure.
   Full table: `BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md` §4.
4. **What is generated?** The specific sentence(s) an NPC says; which of several character-
   consistent reactions is expressed; natural elaboration within authored facts; ordinary
   conversational texture. Same table.
5. **What may mutate world state?** Only a deterministic State Admission commit
   (`admitMaterials`/`mergeMaterials`) triggered by an LLM-proposed classification MATCHING an
   authored allowed transition. `BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md` §5,
   `WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md` §Authority boundary.
6. **What can never mutate world state?** Raw LLM text; an unmatched/unregistered classification;
   a player's own false assertion of fact. Same sections; Case H,
   `ADVERSARIAL_PAPER_SIMULATION_V1.md`.
7. **How does NPC ignorance work?** An authored `NPC_UNKNOWNS` field; stating ignorance in that
   territory is a correct, in-character answer, not a routing failure — grounded in real external
   research (ACL 2025 Knowledge Boundary survey's character-vs-model-knowledge framing).
   `BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md` §6, `NG_RESPONSE_SEMANTICS_V1.md`.
8. **How does out-of-world input fail naturally?** A closed classification (5 classes) selects a
   semantic meaning, realized in the NPC's own voice by the language-generation step — never a
   system error, generic refusal, or invented world expansion. `NG_RESPONSE_SEMANTICS_V1.md`.
9. **How does the map generate encounters?** NPCs carry a state-derived `CURRENT_ACTIVITY`/
   location, computed independent of player attention; an encounter is the coincidence of a
   player's location choice and an NPC's independently-true location — never a clickable-NPC menu.
   `CHALLENGE_TOWN_MAP_SYSTEM_V1.md` §Map × NPC intersection.
10. **How do NPCs exist independently of PLAYER?** Same mechanism, reusing the already-validated
    `yoheiContinuesLeftoverStockWorkNarration` pattern from the fixed-dialogue baseline, generalized
    to all 3 slice NPCs. `NPC_CHARACTER_SYSTEM_V1.md`'s "Independent activity requirement."
11. **How can the same PLAYER action produce different legitimate outcomes?** Same utterance, same
    NPC, different `WORLD_FACTS`/`NPC_CURRENT_ACTIVITY` inputs → different but character-consistent
    generated outcomes. Concretely demonstrated (not merely claimed) in
    `BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md` §10 and Case G,
    `ADVERSARIAL_PAPER_SIMULATION_V1.md`, using real canonical Yohei/Daichi facts, replacing the
    directive's non-canonical "Jin" example.
12. **Where does unpredictability come from without becoming random nonsense?** NPC schedules,
    independent goals, legitimate accumulated world events, PLAYER history, location/time
    intersections — randomness (if used) only selects among already-legitimate authored
    possibilities. `BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md` §11.
13. **What is the smallest vertical slice worth implementing next?** One new isolated route,
    Day-1 morning→afternoon window, 5 locations, Yohei fully wired (state-derived activity + bounded
    free text + both adapters), Miyoko/Kamiya present with state-derived activity only (not yet
    full conversation), one consequence commit, deterministic-adapter Playwright regression plus a
    separate Owner-only live-adapter session. Full scope: `VERTICAL_SLICE_PRODUCT_FLOW_V1.md`
    §Recommended PHASE 12.1 implementation scope.

## Canon audit finding (load-bearing, surfaced this phase)

Challenge Town canon (`NEWLIFE_CHALLENGE_TOWN_SCENARIO_BIBLE_V01.md` + its 3 companion docs)
supersedes the あさひ町/Chinatsu-Seiichi-mystery lineage. PHASE 11.14's own relationship-grounding
audit unknowingly cited the superseded lineage; corrected going forward, and not retroactively
edited (the fixed-dialogue baseline is frozen). Full detail:
`BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md` §0.

## Cast correction

Directive's suggested NPC trio (Yohei/Miyoko/**Jin**) audited against canon: **Jin is not a
canonical character.** Recommended replacement: Yohei/Miyoko/**Kamiya**. Full rationale:
`NPC_CHARACTER_SYSTEM_V1.md`.

## Live AI infrastructure finding

A real, live, billed Vertex AI path (direct REST, `gcloud`-ADC auth, `gemini-2.5-flash`) is already
proven end-to-end from a prior phase's own on-record evidence (`direct_vertex_probe.json`), and a
second, separately-deployed, ADC-authenticated Cloud Function already exists (`functions/dialogue/`,
untouched this phase, wrong schema for this purpose). No fresh network spike was attempted this
phase — this session has no outbound network access, and a live Vertex call is explicitly an
Orchestrator/human-execution-path action per this project's own autonomy standard, not something
Code fabricates evidence for. Full reasoning: `LIVE_VERTEX_LOCAL_ADAPTER_DESIGN_V1.md`.

## Adversarial paper simulation

All 10 required cases (A-J) traced against the designed pipeline; all resolve without a bespoke
authored branch per input. One real, honestly-flagged design tension (Case J: transition-registry
breadth) is not treated as solved. Full detail: `ADVERSARIAL_PAPER_SIMULATION_V1.md`,
`RISK_AND_FALSIFICATION_V1.md`.

## External research

6 new sources found via real web search this phase (Bounded Autonomy for live-game LLM characters,
ACL 2025 Knowledge Boundary survey, CHARM benchmark, Real-Time World Crafting DSL-constrained
generation, a 2025 modular-NPC-dialogue thesis, CPDC 2025 challenge), each classified ADOPT/ADAPT/
REJECT with reasoning, plus 3 prior findings (Generative Agents, Façade/Versu/Prom Week, Failbetter)
re-classified against this specific architecture. Full detail: `EXTERNAL_RESEARCH_MAPPING_V1.md`.

## Verdicts (directive Section 29)

| Verdict | Value |
|---|---|
| AI NECESSITY | **SUPPORTED** |
| BOUNDED GENERATION | **COHERENT** |
| WORLD BOUNDARY | **PASS** |
| NPC AUTONOMY | **PASS** |
| MAP AS GAME SYSTEM | **PASS** |
| OPENING | **SPEC_READY** |
| LIVE AI PATH | **FEASIBLE** |
| VERTICAL SLICE | **READY_TO_IMPLEMENT** |

## Unresolved risks (not smoothed over)

R1 transition-registry breadth, R2 live-adapter latency (unmeasured for this project's actual full
prompt shape), R3 model boundary-compliance vs. boundary-awareness (leak risk in generated text,
not just state), R4 canon-citation debt in the now-frozen baseline (non-blocking), R5 this session's
inability to itself re-verify the network path (mitigated by real prior on-record evidence), R6 a
3-NPC/5-location slice only thinly demonstrates map-generated encounters. Full detail:
`RISK_AND_FALSIFICATION_V1.md`.

## Recommended PHASE 12.1 scope

See `VERTICAL_SLICE_PRODUCT_FLOW_V1.md`'s closing section — restated in question 13 above.

## Scope discipline

No Product code was modified or added this phase. No commit was made beyond the Section 0 baseline
preservation (`3f97b4873da40ad93ae7594059cf897c1252cd37`). No push, no deploy, no live network call
attempted or fabricated.

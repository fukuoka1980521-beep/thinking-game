# Risk and Falsification V1 — PHASE 12.0

Honest, unresolved risks — not smoothed over, not deferred silently.

## R1 — Transition-registry breadth (Case J, `ADVERSARIAL_PAPER_SIMULATION_V1.md`)

If authored allowed-transitions are too narrow, the architecture reintroduces a fixed table one
layer up (now a fixed table of ALLOWED CONSEQUENCES instead of allowed sentences) — still strictly
better than the old model (many sentences can map to one broad transition), but the breadth of
authored transitions is a real, ongoing design judgment, not something this phase's paper
simulation can fully resolve in the abstract. **Falsification plan**: PHASE 12.1's real
implementation should log every `IN_SCOPE`-classified utterance whose `proposedStateEffect` didn't
match any registry entry — a high rate would falsify "a small number of general transition classes
is enough" and require either broader transitions or accepting more silently-non-committing
interactions than intended.

## R2 — Live adapter latency (informed by `EXTERNAL_RESEARCH_MAPPING_V1.md`'s CPDC finding)

`gemini-2.5-flash`'s documented internal-thinking-budget behavior
(`LIVE_VERTEX_LOCAL_ADAPTER_DESIGN_V1.md`) means a real call could take noticeably longer than a
canned response, and real-time multiplayer research benchmarks a 7-second budget for comparable
NPC dialogue. **Unresolved**: no latency measurement exists yet for THIS project's actual prompt
shape (Section 13's full field list is larger than the single-line packets in the PHASE 11.9
probe). **Falsification plan**: PHASE 12.1's spike should measure real round-trip latency with the
full field set before committing to live-adapter-in-the-loop UX; if latency is unacceptable, a
"thinking..." UI state or pre-fetch-on-approach pattern would need designing (not designed here,
since it depends on a measurement not yet taken).

## R3 — Model compliance vs. stated boundary (CHARM finding)

External research confirms boundary-AWARENESS and boundary-COMPLIANCE are separable failure modes
— a model can "know" it shouldn't reveal something in its own reasoning while still leaking it in
`visibleLine`. The architecture's mitigation (never trusting `visibleLine` for authority) protects
STATE, but does NOT protect against an NPC's displayed TEXT itself leaking information the Product
wants withheld (e.g., accidentally revealing `IS_FESTIVAL_LEFTOVER`-style plot-relevant facts too
early through generated elaboration, the exact failure class PHASE 11.13's whole repair arc was
about, now reintroduced at the language-generation layer instead of the authored-fixture layer).
**Unresolved**: no automated check for "did the generated line leak an unauthorized fact" is
designed yet. **Falsification plan**: PHASE 12.1 should adversarially test the Yohei live adapter
specifically for premature-disclosure leakage (an analog of PHASE 13E's prose-mutation tests, but
applied to LIVE generated text instead of authored fixture text) before trusting it for anything
plot-load-bearing.

## R4 — Canon consistency debt (this phase's own finding)

`BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md` §0 found that PHASE 11.14's own relationship-
grounding audit cited a now-superseded canon lineage. This is corrected for PHASE 12.0+ work, but
the fixed-dialogue baseline itself (frozen, not re-audited) still carries that citation in its own
docs. **Not a blocking risk** (the baseline is explicitly frozen and not being extended), but
recorded so a future reader of PHASE 11.14's docs doesn't mistake that citation for still-current
guidance.

## R5 — This session cannot itself falsify the live network path

`LIVE_VERTEX_LOCAL_ADAPTER_DESIGN_V1.md` explains why no fresh spike was attempted: this Claude
Code session has no outbound network access, and a live Vertex call is exactly the class of action
this project's own autonomy standard routes through Orchestrator/human execution, not Code
directly. This is disclosed explicitly rather than either (a) silently skipping verification or
(b) fabricating a "PASS" from a re-description of the OLD probe as if it were freshly re-run.
**Not treated as a blocking risk** because real, dated, on-record evidence already exists that the
underlying call path works (`direct_vertex_probe.json`) — the remaining risk is narrower (wiring a
new local server process, not "can this project reach Vertex at all").

## R6 — 3-NPC slice may understate the "map generates encounters" property

With only 3 NPCs across 5 locations and one time window, the map's location-gating (e.g.
`challengeCenterKnown`) is real but thin — a single state flag gates a single edge. **Unresolved,
acceptable for V1**: a fuller demonstration (multiple simultaneous state-gated encounters,
NPCs actually moving between locations across a day) needs the later, larger slice
(`VERTICAL_SLICE_PRODUCT_FLOW_V1.md`'s explicit "not yet in PHASE 12.1" list), not this one.

## Non-risks (explicitly not stop conditions, per this project's own autonomy standard)

- Multiple valid choices existing for R1's transition breadth, R2's latency mitigation — design
  judgment calls, not business-specification conflicts requiring Owner escalation.
- The existence of unresolved risks itself — per CLAUDE.md's autonomy standard, "having several
  valid design options" and "some verification items having no automated check yet" are explicitly
  listed as NOT stop conditions.

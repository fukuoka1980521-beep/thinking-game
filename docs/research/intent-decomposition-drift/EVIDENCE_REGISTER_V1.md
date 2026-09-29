# Intent Decomposition Drift — Evidence Register V1

Date: 2026-09-29
Rule: evidence register only. Do not promote interpretations into facts.

| ID | Repository evidence | Observation | What it supports | What it does NOT establish |
|---|---|---|---|---|
| IDD-E01 | `docs/newlife/evaluation/PHASE_28B_CONVERSATIONAL_ACT_REPAIR_V1.md` | Owner input 「口調が堅苦しいよ」 fell through to a generic flavor line. The repair added conversational-act detection and fixed per-NPC act lines. | A real semantic failure was repaired through a larger deterministic classification surface. | That the repair was useless; it fixed the reported case and broadened coverage. |
| IDD-E02 | `docs/newlife/evaluation/PHASE_29_HYBRID_SEMANTIC_CONVERSATION_ARCHITECTURE_V1.md` | Typo, multi-intent, and keyword-collision owner failures were documented. The design explicitly states a pure deterministic parser cannot meet the product goal. | The project itself identified a structural limit of finite intent/regex routing for open conversation. | That every deterministic component is harmful. |
| IDD-E03 | `docs/newlife/refoundation/V42_HUMAN_ACCEPTED_BASELINE_V1.md` | A live community-theater free-text episode completed a coherent conflict→proposal→artifact→accept/reject→closure loop; owner verdict was 「問題ないのでは」. | Generative, context-grounded interaction can achieve owner-accepted natural play in at least one task family. | Six-character or 30-day validation. |
| IDD-E04 | `docs/newlife/evaluation/human-evidence/V45_CAFE_HUMAN_TEST_RAW_20260927.md` + evaluation | Natural human cafe-boundary episode preserved fact/speaker ownership; no new quantity/promise/prior statement was fabricated. | Chat-first conversation can preserve authority/fact boundaries in at least one additional task family. | General truth-safety across all scenes/models. |
| IDD-E05 | `docs/newlife/evaluation/NEWLIFE_CHAT_FIRST_ROOT_REDESIGN_V1.md` | Repository root redesign records that earlier chat felt natural, shipped routing drifted to stock replies, and normal dialogue must not pass keyword/regex routing first. | The goal-drift diagnosis was reached internally before this protocol. | That the proposed architecture has already passed product validation. |
| IDD-E06 | `src/newlife/state.ts` at pre-intervention master | `applyAction` described canonical state mutation as a button-choice path. | Canonical world consequence was structurally centered on choice IDs. | That no free-text state effect existed anywhere. |
| IDD-E07 | `src/newlife/freeAction.ts` at pre-intervention master | Free-text procedural state mapping covered a single narrow Day 9/Miyoko phrase family. | Free-text world authority was much narrower than choice authority. | The exact percentage of all possible free-text meanings that could affect state. |
| IDD-E08 | `src/newlife/NewLife30App.tsx` at pre-intervention master | Live submission computed `resolveFreeAction` before the refoundation conversation call. | Even the generative path was preceded by phrase-based state interpretation for the implemented free-action case. | That every dialogue reply itself came from deterministic routing. |
| IDD-E09 | `docs/newlife/NEW_LIFE_PRODUCT_CONCEPT_V1.md` | Product promise states that free input moves people/relationships/situations and choices are support. | A direct mismatch can be tested between declared product promise and implementation behavior. | Whether the product concept is the only authoritative specification at every historical phase. |
| IDD-E10 | `docs/newlife/evaluation/OWNER_REGRESSION_CORPUS_V1.md` | Real owner-observed failures are defined as semantic, non-exact-string regressions. | The project already recognized that evaluation should target meaning/context/persona rather than exact wording. | A causal explanation for why the failures occurred. |

| IDD-E11 | `docs/newlife/evaluation/CHATFIRST_DAY9_LIVE_INTEGRATION_EVIDENCE_20260929.md` | A real model correctly answered an unconstrained Day 9 capacity question, but the legacy `candidateTurn` ontology labeled the turn `OBSERVE / NOT_RELEVANT`; state remained unchanged until a separate closed `candidateWorldEffects` channel was introduced. The same utterance then produced `MIYOKO_WAITING_CAPACITY_STATED` and the deterministic gate changed `mSeats` to `bounded`. | A narrow action taxonomy can be semantically adequate for dialogue yet insufficient as the sole bridge to world-state consequence; separating conversational act from canonical world effect is a concrete architecture improvement in this case. | That every action taxonomy will fail, or that the new effect channel generalizes beyond this bounded scenario. |

| IDD-E12 | `docs/newlife/evaluation/human-evidence/DAY3_COMPREHENSION_FAILURE_20260929.md` + Day 3 canonical/runtime text | Owner reported the scene as 「意味が分からない会話」. Hidden Day 3 notes clearly described the intended mechanism (Miyoko's ambiguous reply vs Fumiko's inference), but the visible scene omitted the concrete waiting-place request and used a meta-sounding hook. | A hidden-design / visible-context gap can preserve internal logic while failing player comprehension. This is a distinct drift path from conversation routing. | That all compressed or indirect writing is bad, or that every scene requires explicit exposition. |

| IDD-E13 | `docs/newlife/evaluation/COLD_READER_SCENE_AUDIT_DAYS_1_10_20260929.md` + `docs/newlife/evaluation/COLD_READER_SCENE_AUDIT_DAYS_11_24_20260929.md` | After the Day 3 owner failure, the same cold-reader gate found two more independent examples: Day 6 compressed "reservation 12 / walk-in 18" into the opaque phrase "買える方", and Day 14 compressed the waiting/communication problem into "別の話"; Day 16 similarly replaced the concrete paid setup task with generic "help". | The visible-context loss is reproducible across multiple authored scenes, making Context Compression Loss a stronger candidate submechanism of IDD than a one-off wording mistake. | That every concise scene will fail, or that context compression alone explains all prior NEW LIFE drift. |

## Intervention evidence added in PR #113

The current intervention is deliberately small:

- add Product Constitution
- add Goal Integrity Gate
- preserve refoundation structured semantic metadata end-to-end
- move normal live path to generation-first before phrase fallback
- add deterministic post-generation authority gate
- map one low-ambiguity Day 9 boundary case through that gate
- add no-choice human product protocol

This is an intervention, not a result.

## Required updates

After each relevant human run append:
- raw evidence file
- branch/SHA/build
- route actually used
- technical result
- human result
- hypothesis outcome: supported / weakened / unresolved

Never rewrite historical rows because a later interpretation changes.

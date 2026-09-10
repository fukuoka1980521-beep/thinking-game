# Generative Canon Input Policy V1 — PHASE 12.0R

Directive Section 10-12, 14.

## The rule (directive Section 11)

**GENERATIVE MODEL QUALITY cannot compensate for WRONG CANON INPUT.** A highly fluent, perfectly
in-character-sounding Yohei line generated from a stale or incorrect canon fact (e.g. wrongly
treating Jin as not existing, or asserting Kamiya works at a Challenge Center never confirmed by
current canon) is still a Product failure — indistinguishable, from the player's seat, from a
correct answer, which is exactly what makes it dangerous. **Therefore canon resolution happens
BEFORE LLM generation, as a build-time/authoring-time step, never as something the model figures
out at request time.**

## Model input must come from the canon index, never from live document search (directive Section
## 10)

Future live NPC packets are built from exactly four sources, composed by CODE, not chosen by the
model:

```
CURRENT_CANON_INDEX   -- a small, authored, static extract (this phase's NEW_LIFE_CURRENT_CANON_INDEX_V1.md,
                         reduced further to just the fields a given NPC/scene needs -- see below)
  +
CURRENT_WORLD_STATE   -- the live ContractV2State-equivalent (materials, experienceLog, day/time)
  +
NPC_EXPERIENCE        -- this NPC's own firsthand/heard/unknown fields (NPC_CHARACTER_SYSTEM_V1.md)
  +
PLAYER_CONTEXT        -- PLAYER_UTTERANCE + RECENT_RELEVANT_EXPERIENCE (WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md)
```

**The model never independently decides which historical design document is authoritative** —
that decision was already made, once, by a human, when the canon index was written and when each
NPC's authored boundary table was built. The model receives the RESULT of that decision as fixed
context, never the raw documents to interpret for itself. This is the direct structural fix for
this phase's own root-cause failure, applied to the runtime path so the SAME class of error
(treating one document's silence as an authoritative rejection) cannot occur inside a live
generation call either.

## Compact packet, not RAG (directive Section 12)

PHASE 12.1's actual dependency surface is 3 NPCs, 5 locations, one morning-to-afternoon window —
small enough that the ENTIRE relevant canon extract fits in a compact authored packet (a few
hundred tokens per NPC, matching the size of the fixed-dialogue baseline's already-proven
`YoheiScenePacket`). Introducing embeddings/RAG now would solve a retrieval-at-scale problem this
slice does not have, at the cost of introducing exactly the kind of "let the system search
documents and decide relevance itself" failure mode this phase's whole correction is about.
**RAG remains explicitly out of scope until world scale genuinely requires retrieval** (directive's
own deferral) — re-evaluate only when the authored canon extract for a single NPC/scene would
exceed a reasonable prompt budget, which a 3-NPC/5-location/1-day slice does not.

## AI necessity claim, rephrased (directive Section 14)

**Not claimed**: "combinatorial complexity proves AI is necessary" (too strong an a priori claim —
complexity alone doesn't prove a SPECIFIC technique is warranted, only that hand-authoring doesn't
scale well).

**Claimed instead**: AI is Product-justified if the implemented PHASE 12.1 slice empirically
demonstrates useful, context-sensitive NPC responses that were not individually authored as a
response table — i.e., the SAME utterance under different, legitimately-differing world states
(Jin's frozen-rule behavior across different "stalled situation" contexts; Yohei's task-active/
covered/absent states) produces materially different, still character-consistent output, and this
is verified by actually running the slice and observing real outputs (deterministic-adapter runs
for repeatable verification, plus at least one live-adapter Owner session for real-model
evidence), not asserted from architecture diagrams alone. **PHASE 12.1 is the empirical test of
this claim, not a restatement of it.**

## Relationship to the hard structural validation stage

This policy governs what goes INTO a generation call (canon-resolved-in-advance context); the
already-designed hard structural validation stage (`WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md`)
governs what comes OUT. Both are needed and neither substitutes for the other — correct input does
not guarantee correct output (a model can still misbehave with perfect context), and validating
output does not fix wrong input (a model given a stale "Jin doesn't exist" premise could produce
a perfectly well-formed, perfectly validated structured response that is still Product-wrong,
because it would simply never generate a Jin encounter at all — a failure hard validation cannot
catch, since nothing invalid was ever proposed). This is precisely why canon resolution must
happen first, as its own separate discipline, not folded into the validation stage as if it were
the same problem.

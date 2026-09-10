# World / NPC / Player Authority Flow V1 — PHASE 12.0

Directive Section 13-15, 17-18, 20. The smallest pipeline supporting bounded free-text
conversation while preserving PHASE 11.12–11.13E's authority lessons.

## Pipeline (directive Section 15)

```
PLAYER FREE TEXT
  ↓
bounded interpretation        -- classify against BOUNDED_FREE_TEXT_CONVERSATION_V1.md's 5 classes
  ↓
world/NPC scope decision      -- WORLD SCOPE -> NPC SCOPE -> NPC KNOWLEDGE -> CURRENT FEASIBILITY
  ↓
NPC response semantic plan    -- which authored allowed-transition (if any) applies; NEVER free text yet
  ↓
language generation           -- LLM realizes the semantic plan in the NPC's own voice (Section 13)
  ↓
hard structural validation    -- classification/proposedStateEffect checked against fixed registries
  ↓
visible response              -- generated Japanese shown to player; never itself read for authority
  ↓
if applicable: authorized response/consequence commit  -- admitMaterials/mergeMaterials, unchanged
```

Two of these steps (bounded interpretation, NPC scope/knowledge decision) can themselves be a
single LLM call whose STRUCTURED OUTPUT includes the classification — the pipeline does not
require two separate model round-trips; it requires two separate AUTHORITY BOUNDARIES around one
or two calls. This is the "smallest pipeline," per directive Section 15 ("do not rebuild the old
large structured dialogue planner").

## What is given to the model (directive Section 13)

```
WORLD_FACTS                    -- fixed facts true in the current world state
NPC_FIRSTHAND_EXPERIENCE       -- this NPC's own witnessed/known facts
NPC_HEARD_INFORMATION          -- secondhand, explicitly marked as such (never conflated with firsthand)
NPC_UNKNOWNS                   -- explicit list; stating ignorance here is CORRECT, not a failure
NPC_PURPOSE                    -- daily purpose (NPC_CHARACTER_SYSTEM_V1.md)
NPC_CURRENT_ACTIVITY           -- state-derived, e.g. yoheiTaskActive
NPC_RELATIONSHIP_TO_PLAYER     -- e.g. newly arrived / acquainted / trusted
CURRENT_LOCATION               -- where this exchange is happening
RECENT_RELEVANT_EXPERIENCE     -- accumulated experience log entries relevant to this NPC/topic
PLAYER_UTTERANCE                -- the free text itself
ALLOWED_RESPONSE_BOUNDARY       -- the closed set of classifications + allowed state transitions this call may select from
```

This is a direct extension of `buildYoheiPacket`'s already-validated `YoheiScenePacket` shape
(`worldFacts`/`firsthand`/`unknown`/`currentLocalFacts`/`pendingRequestContent`/`playerUtterance`)
from the fixed-dialogue baseline — same fields, generalized to be NPC-parametric instead of
Yohei-specific, plus the new `ALLOWED_RESPONSE_BOUNDARY`/classification fields this phase's
free-text requirement adds.

## What the model is allowed (directive Section 13)

Natural inference, mood, soft planning, ordinary human elaboration, character-consistent
variation — explicitly NOT forced into one sentence template. The boundary is on WHAT FACTS may be
asserted and WHICH classification/transition may be selected, never on the exact wording.

## Authority boundary (directive Section 14 — restates and extends PHASE 11.12–11.13E)

**LLM LANGUAGE != WORLD AUTHORITY**, unchanged as the governing principle. Concretely:

- AI may generate language (the `visibleLine`).
- AI may propose a semantic intent/result (the `classification` and `proposedStateEffect` fields).
- Canonical state mutation passes through deterministic State Admission ONLY — `admitMaterials`/
  `mergeMaterials`, the exact functions unmodified since PHASE 11.6R.
- No generated sentence may directly create a new town location, relationship history, possession,
  promise, world event, or knowledge authority WITHOUT the authorized semantic path — meaning: the
  `proposedStateEffect` must match an entry in a fixed, authored registry of allowed transitions
  (structurally identical in spirit to `LEFTOVER_RESPONSE_MATERIAL_IDS`/`REVEAL_MATERIAL_ASSERTED_
  FACTS` from PHASE 11.13D/E, generalized from "one scene's 3 outcomes" to "this NPC's authored
  set of possible consequences"). An unmatched proposal commits nothing (fail-closed, same
  discipline as PHASE 11.13E's unregistered-material-id default and PHASE 11.12's unclassified-
  action default).

## Hard structural validation (directive Section 15's required stage, detailed)

Before anything is shown or committed:

1. `classification` must be one of the 5 authored classes (`BOUNDED_FREE_TEXT_CONVERSATION_V1.md`)
   — anything else is coerced to `INSUFFICIENT_CONTEXT` (fail-closed).
2. `proposedStateEffect`, if present, must match a real entry in this NPC/location's authored
   allowed-transitions registry — anything else is dropped (no commit), while the (still-validated)
   `visibleLine` may still display.
3. `visibleLine` is a display string only, schema-checked for shape (non-empty, reasonable length)
   but never semantically parsed for authority — continuing PHASE 11.13E's zero-prose-authority
   finding.
4. Network/model failures (timeout, safety block, malformed JSON) fail closed to a neutral
   in-character `INSUFFICIENT_CONTEXT`/deflection, never a raw error to the player
   (`NG_RESPONSE_SEMANTICS_V1.md`).

## Consequence / persistence (directive Section 20)

At least one interaction class must produce a small admitted consequence, reusing existing
`LifeMaterial` types — no new reward system. Recommended V1 minimum: a `PROMISE`-type material
when a PLAYER's offer-to-help is accepted under STATE A of Section 8's AI-necessity experiment
(structurally identical in shape to PHASE 11.13's `promised_bring_item`/`PLAYER_ACCEPTS_PROMISE_
REQUEST` material, already validated). This single consequence is sufficient to prove the
persistence requirement without inventing new material taxonomy.

## Test adapter vs. live adapter (directive Section 17)

Two implementations of the SAME interface (`(packet) => { classification, proposedStateEffect,
visibleLine }`):

- **Deterministic test adapter**: fixed, authored fixture responses per test packet — reuses the
  exact `createReplayLanguageAdapter`/`CapturedLine` pattern already validated in
  `languageAdapter.ts`, extended to return the structured shape above instead of a bare string.
  CI depends only on this adapter — never on Vertex availability (directive's explicit
  requirement).
- **Local live Vertex adapter**: `LIVE_VERTEX_LOCAL_ADAPTER_DESIGN_V1.md`'s dev-server middleware.
  Used for the Owner Product experiment (Section 16), never for CI.

Both adapters produce the SAME structural shape, so the hard-validation and commit steps
downstream are adapter-agnostic — swapping adapters changes only where `visibleLine`/
`classification` come from, never how they're checked.

## Preserving world variation without RNG (directive Section 18, cross-referenced)

Nothing in this pipeline uses randomness to decide classification or state effects. Where genuine
unpredictability is wanted (e.g., which of two equally-valid idle lines an NPC uses when nothing
else distinguishes them), randomness may choose among options a registry ALREADY lists as legitimate
— it may never itself decide that an option exists. See
`BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md` §11 for the full unpredictability-source ordering.

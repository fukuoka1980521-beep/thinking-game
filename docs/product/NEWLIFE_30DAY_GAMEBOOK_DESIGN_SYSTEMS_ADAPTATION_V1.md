# NEW LIFE 30-Day Gamebook — Reference Design Systems Adaptation V1

MODE: `DESIGN_AND_TEXT_PLAYTEST_ONLY`. No product code touched by this document or anything in this
phase; the current `src/newlife7day/` implementation is frozen as-is. This note records which
*structural* ideas from four existing narrative-design tools are being adapted, and how they map
onto this project's own already-established discipline (`SYSTEM OWNS TRUTH, AI OWNS EXPRESSION`).
Nothing here reproduces any tool's own copyrighted example story, sample project, or documentation
text -- only the architectural vocabulary (knot/stitch, passage, node, storylet), which is a
structural pattern, not an expressive work.

## What is adapted from each system

**ink / Inky** -- the backbone of `NEWLIFE_30DAY_GAMEBOOK_TEXT_PROTOTYPE_V1.md`'s own notation:
- **knot** (`=== name ===`): one scene/day-level unit, the largest addressable node.
- **stitch** (`= name`): a sub-beat inside a knot (e.g. one NPC's scene within a day).
- **weave**: multiple choices that each lead somewhere different but can share later content --
  used for the 2-4 real choices per day this design requires.
- **gather** (`-`): the point where diverging choices reconverge onto shared following content --
  used constantly so 30 days of branching stays a tractable, non-exploding document, exactly as
  ink itself uses gathers to avoid combinatorial blowup.
- **global variables** and **conditional text** (`{VAR: ... | ...}`): used for every WORLD_FACT/
  CHARACTER_FACT/RELATIONSHIP check in Phase D's state model -- a day's text reads differently
  depending on accumulated state, never re-asked as a fresh scene.
- **branch -> merge -> later callback**: the exact shape of this design's "FUTURE CALLBACK" field
  in the story spine (Phase C) -- a choice on Day N sets a flag; a knot on Day M (M > N) checks it.

**Twine** -- the "text-first, playable by clicking a link" discipline itself. The prototype is
written as literal passages a human can follow node-by-node without any engine, matching Twine's
own core promise that a story must be playable in its raw text form before any code exists. This is
why Phase E is explicitly "no images, no UI polish, no code-heavy implementation" -- the test is
whether the *words and choices* work, not whether a renderer works.

**Arcweave** -- adapted as a thinking discipline, not a file format: every day in the story spine is
authored as a small **state-driven branch graph** (ACTIVE CHARACTERS / VISIBLE PROBLEM / STATE
DELTA / MERGE POINT), the same "nodes hold state, connections hold conditions" mental model
Arcweave's visual canvas encodes, just expressed as structured markdown fields instead of a canvas,
since this phase is explicitly text-only.

**Yarn Spinner** -- two ideas: (1) **dialogue nodes with options and variables**, reflected in the
Phase E free-talk contract's `PLAYER_FREE_TEXT` / `AI_CHARACTER_RESPONSE` / `STATE_DELTA_PROPOSAL`
shape; (2) **storylet/saliency thinking** -- a day's "2-4 optional scene candidates" (per the
existing `NEWLIFE_DAY1_TO_DAY7_ARC_V1.md` content-budget discipline, extended here to 30 days) are
modeled as a small pool of eligible storylets (each with its own preconditions over state) rather
than a fixed script, so "which of the 6 NPCs/locations has something live today" is a query over
state, not a hand-authored branch tree per possible path.

## How this maps onto the existing SYSTEM OWNS TRUTH / AI OWNS EXPRESSION boundary

None of the above changes that boundary; they are just the vocabulary for describing it at 30-day
scale:

- A knot/stitch's **canonical text** (what actually happened) is always system-authored, exactly
  like `content/day1.ts` and `src/newlife7day/content.ts` today.
- A knot's **AI free-talk stitch** (the `PLAYER_FREE_TEXT` / `AI_CHARACTER_RESPONSE` pair) is the
  only place expression is generative; it may never itself flip a global variable. It may only emit
  a `STATE_DELTA_PROPOSAL`, which a `CANON_GATE_RESULT` step accepts or rejects before the game
  state actually changes -- the direct text-gamebook equivalent of `deterministicAdapter.ts`/
  `liveAdapterClient.ts` never being allowed to write `CoreState` directly in the real
  implementation.
- Phase D's `Canon/Consistency Gate` is the design-level name for the same fail-closed discipline
  already implemented as `validateNpcReply`/`NpcReplyEnvelope` in the current code -- restated in
  gamebook terms because this phase deliberately produces no code.

This document has no state of its own and is not itself part of the second-evaluator package
(Phase G) -- it is background for whoever reads the text prototype, not part of the story or rules
the evaluator is meant to judge blind.

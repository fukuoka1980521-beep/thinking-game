# Adversarial Paper Simulation V1 — PHASE 12.0

Directive Section 25. Paper-simulated against the pipeline in `WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md`
and the classification set in `BOUNDED_FREE_TEXT_CONVERSATION_V1.md`. No code executed — this is a
design-stage trace of how the architecture is INTENDED to handle each case, per directive Section 26
("do not implement until design survives"). Each case states the expected classification, the
expected commit-or-not decision, and why the architecture (not an ad hoc rule) produces that result.

## A — Ordinary in-scope question

PLAYER (at YOHEI_STORE): 「祭りどうだった？」— matches `NPC_FIRSTHAND_EXPERIENCE`.
**Classification: `IN_SCOPE`.** `proposedStateEffect`: may resolve a question-target material
(reusing PHASE 11.13D/E's structural target-resolution pattern, generalized). `visibleLine`:
generated from firsthand facts. No new mechanism needed — this is the case the fixed-dialogue
baseline already handled correctly; the generative pipeline must not regress it.

## B — Question NPC legitimately does not know

PLAYER (at YOHEI_STORE): asks about Challenge Center administrative specifics.
**Classification: `NPC_KNOWLEDGE_GAP`.** Yohei's `NPC_UNKNOWNS` includes anything requiring
Kamiya's specialized knowledge. `visibleLine`: an in-character "that's not something I'd know,
ask at the Center" — realized per `NG_RESPONSE_SEMANTICS_V1.md`, register-appropriate to Yohei
(casual, not です/ます). No commit.

## C — Question another NPC would know better

Same utterance as B. The architecture does NOT need a separate class for this (per
`BOUNDED_FREE_TEXT_CONVERSATION_V1.md`'s decision to merge `OUTSIDE_NPC_SCOPE` into
`NPC_KNOWLEDGE_GAP`) — the LANGUAGE realization is what distinguishes "I genuinely don't know" from
"that's not my department, try X," both are `NPC_KNOWLEDGE_GAP` structurally, differing only in the
generated line's content (which the model may naturally include, since Yohei plausibly knows
Kamiya exists and does that job — this is ordinary elaboration within his `NPC_FIRSTHAND_
EXPERIENCE`, not a new fact being invented).

## D — Wildly out-of-world question

PLAYER: asks about something with no referent in any authored world fact (e.g., a topic entirely
outside Challenge Town's authored scope).
**Classification: `OUT_OF_WORLD_SCOPE`.** Checked FIRST in the scope-decision order (`WORLD_NPC_
PLAYER_AUTHORITY_FLOW_V1.md`'s "world scope → NPC scope" ordering) — never reaches an NPC-knowledge
check, because there is no world referent to check knowledge OF. `visibleLine`: a natural
deflection, never an invented explanation. No commit. This is the case most at risk of the LLM
"helpfully" inventing a fact — the `ALLOWED_RESPONSE_BOUNDARY` prompt field and the hard-validation
stage exist specifically to catch a model that ignores the instruction and answers anyway (its
`proposedStateEffect`, if any, would not match any authored transition and would be dropped even
if the generated TEXT wrongly implies something committed — text and state are independently
validated, per PHASE 11.13E's zero-prose-authority principle).

## E — Feasible suggestion not pre-authored

PLAYER (at YOHEI_STORE, STATE A — task active): 「手伝おうか？」
**Classification: `IN_SCOPE`.** `proposedStateEffect`: matches an authored allowed transition
(`YOHEI_HELP_ACCEPTED`, or similar registry entry) → commits a `PROMISE`/`SHARED_EVENT` material
per `WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md`'s Consequence section. This is exactly Section 8's
worked experiment's STATE A — the suggestion was never pre-authored as a button, only the WORLD
FACT that makes it feasible was authored (an active task exists) plus the ALLOWED TRANSITION that
accepting it maps to.

## F — Currently impossible suggestion

Same utterance, STATE B (Daichi already helping) or STATE C (no active task).
**Classification: `NOT_FEASIBLE_NOW`** (STATE B: task exists but is already covered) or `IN_SCOPE`
with no matching transition (STATE C: no task exists at all, so the offer is understood but has
nothing to attach to — realized as a warm "nothing needs doing right now" rather than a `NOT_
FEASIBLE_NOW` refusal, since nothing was actually blocked, just absent). No commit in either case.
This is the direct paper-trace of Section 8/10's 3-state experiment; see
`BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md` §10 for the full 3-state table.

## G — Same utterance, three different world states

This IS the mandatory AI-necessity experiment (directive Section 8), fully specified in
`BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md` §10: STATE A → grateful acceptance + task handoff +
commit; STATE B → polite decline, no commit; STATE C → mild surprise/no task, no commit. Same
`playerUtterance`, same NPC, three different `WORLD_FACTS`/`NPC_CURRENT_ACTIVITY` inputs, three
materially different but equally Yohei-consistent outputs. **This is the case the fixed-dialogue
baseline structurally cannot produce without three separately-authored buttons/branches** — the
architectural point of the whole phase, made concrete.

## H — PLAYER asserts a false world fact

PLAYER: states something as true that contradicts an authored `WORLD_FACTS` entry (e.g. claims
Yohei already agreed to something he didn't).
**Classification: `IN_SCOPE`, but the assertion itself is NOT admitted as fact.** The player's
utterance is `PLAYER_UTTERANCE` — an input to generation, never itself a `WORLD_FACTS` write. The
NPC's generated reaction may naturally correct or express confusion ("いや、そんな話はしてないが"),
grounded in the NPC's own actual firsthand experience, which the false assertion cannot overwrite.
No `proposedStateEffect` matches (no authored transition exists for "player successfully asserted
an arbitrary fact"), so nothing commits — this is the direct, load-bearing consequence of Section
14's authority boundary: state mutation requires an authorized semantic path, and "player said so"
is never one.

## I — PLAYER asks about an event they never witnessed

PLAYER asks Yohei about something only in `NPC_HEARD_INFORMATION` territory that the player has no
`RECENT_RELEVANT_EXPERIENCE` entry for.
**Classification: `IN_SCOPE`** (Yohei may still answer from his own knowledge — the player not
having witnessed something doesn't block asking about it) **or `INSUFFICIENT_CONTEXT`** if the
utterance itself is too vague to resolve to a specific event at all. The distinguishing factor is
whether the utterance resolves to a recognizable referent, not whether the PLAYER witnessed it —
tested honestly here because it's a real edge the classification order needs to handle
(WORLD/NPC-scope checks pass; the failure mode, if any, is at the "does this utterance resolve to
something" step, which is exactly `INSUFFICIENT_CONTEXT`'s job).

## J — PLAYER proposes a new idea fitting world constraints, could create a future possibility

PLAYER (at YOHEI_STORE): proposes something plausible and small that Challenge Town's authored
constraints don't forbid (e.g., offering to come back and help again another day) but that isn't
pre-authored as a named transition.
**Classification: `IN_SCOPE`.** This is the hardest honest case: `proposedStateEffect` might not
exactly match an EXISTING registry entry. Two architecturally sound outcomes, both consistent with
fail-closed discipline: (1) if the registry includes a deliberately GENERAL transition class for
this shape (e.g. a generic "future-visit intent noted" `PLACE_KNOWLEDGE`/`PENDING_TASK` material,
authored broadly enough to cover "player expressed intent to return/help again" without needing a
different registry entry per exact phrasing), it commits that general consequence; (2) if no such
general transition was authored, nothing commits and the NPC's warm acknowledgment is display-only
— the idea is not lost from the PLAYER's perspective (the generated line can still warmly
acknowledge it), but no world-state fact is created. **This is a real design tension worth naming
plainly** (see `RISK_AND_FALSIFICATION_V1.md`): authoring transitions too narrowly reintroduces the
fixed-table ceiling one level up (a fixed table of ALLOWED TRANSITIONS instead of allowed
sentences); the mitigation is authoring a SMALL number of intentionally general transition classes
(directive Section 20's own list — PROMISE/PENDING_TASK/SHARED_EVENT/PLACE_KNOWLEDGE/OBJECT/
WORLD_CHANGE — is already broad enough to catch most "small future possibility" cases without
being per-utterance-specific), not authoring a new transition per creative player phrasing.

## Summary verdict

All 10 cases resolve without requiring a bespoke authored dialogue branch per input — the
architecture responds via classification + world-state lookup + generation + validation, matching
directive Section 25's closing requirement. Case J is flagged honestly as the one place where
authoring breadth (not correctness) is a real, ongoing design judgment call, not a solved problem.

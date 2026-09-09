# Question Prerequisite / Answer Boundary V1 — PHASE 11.13A

## The contradiction, stated exactly

PHASE 11.13's own `STRATEGIST_PRODUCT_AUDIT_PACKET_V1.md` described the counterfactual result as:
"`novelFacts: ['IS_FESTIVAL_LEFTOVER']`... a genuinely novel fact" and characterized this as "the
newly learned fact." Read literally, at the exact state this was evaluated against (immediately
after ACCEPT, before the player has ever asked 「これ、祭りの残り？」), this phrasing claims the
PLAYER already *learned* that the towels are festival leftovers — merely from the physical reveal.
But the scene's own design (`PRODUCT_SCENE_REPAIR_SPEC_V1.md`, P1) explicitly states the reveal
narration "deliberately does NOT say the towels are specifically『残り』" — the leftover status is
reserved for Yohei's answer. These two claims cannot both be true: if the player already knows
`IS_FESTIVAL_LEFTOVER` from the reveal, asking 「これ、祭りの残り？」 is not information-seeking; if
the reveal does NOT establish it, then the field describing it as "the newly learned fact" at that
exact moment was mislabeled.

## Root cause

`evaluateRealLeftoverStockCausalClaim`'s `novelFacts` field answers a genuinely different question
than "what has the player already learned": it answers "if the gated action's answer states this
fact, would that be new relative to the REVEAL's own text" — a claim about the potential ANSWER's
content, evaluated once, at ACCEPT time, as a GATE for whether the question may be offered at all.
It was never a live, ongoing record of "what the player currently knows." PHASE 11.13's prose
conflated these two: QUESTION_PREREQUISITE (the reveal — evidence enabling the question to be asked
at all) and the TARGET FACT's actual epistemic status (known only once Yohei has actually answered).

**Verified, not assumed:** the GATING BEHAVIOR (`applyCausalityGate` in `NewlifePlayable11App.tsx`,
which decides whether the `ASK_ABOUT_LEFTOVER_STOCK` button ever enters the render list) was
already correct — it only ever asks "does the reveal avoid leaking the target," which is exactly
QUESTION_PREREQUISITE's job. The bug was in the DOCUMENTATION/LABELING, and in the absence of any
representation that separately, correctly tracks "has the player actually been told yet" for
transcript/debug/test purposes. See `LEFTOVER_QUESTION_SEMANTIC_TRACE_V1.md` for the full traced
path and `CODE_SELF_AUDIT_V1.md` for exactly what code changed vs. did not.

## Central principle (directive Section 2), now representable and tested

**QUESTION_PREREQUISITE != QUESTION_ANSWER.** A player may gain enough evidence/context to ask a
question without already knowing its answer.

## The two facts, precisely

- **OBSERVED_EVIDENCE (QUESTION_PREREQUISITE):** the player has seen the opened box; festival-
  patterned hand towels are visible. Authority source: State Admission (`leftover_stock_moved`
  material's existence + its `concreteContent` not leaking the target).
- **TARGET_FACT:** these specific towels are the festival's unsold leftover stock (`祭りの残り`),
  about to be discounted. Authority source: Actor Experience (`experienceLog`), specifically
  whether `ASK_ABOUT_LEFTOVER_STOCK`'s own answer-dispatch write is present — i.e., whether Yohei
  has actually confirmed it.

Before Yohei answers: OBSERVED_EVIDENCE known, TARGET_FACT unknown. After Yohei confirms:
TARGET_FACT known, through legitimate NPC testimony — never inferred, never assumed.

## Reuse decision (directive Section 5)

No new knowledge engine was built. Both facts are represented using structures that already
existed before this phase:
- OBSERVED_EVIDENCE: the same State Admission material (`leftover_stock_moved`) and the same
  substring-based fact-tag reading (`factsAssertedByMaterialConcreteContent`) PHASE 11.12R already
  built and tested.
- TARGET_FACT: Actor Experience (`experienceLog`), the exact same reuse pattern
  `NOT_YET_ASKED_WHAT`/`HAS_ASKED_FESTIVAL` (`playableSceneContracts.ts`, PHASE 11.13) already
  established for "has this been asked before" checks.

One new, narrowly-scoped function was added — `evaluateLeftoverQuestionPrerequisite` — because
neither existing function (`evaluateRealLeftoverStockCausalClaim`, which only ever computed the
ONE-TIME gating verdict) nor any existing structure separately tracked "has the target actually
been told yet" as a distinct, ongoing fact. This is documented as necessary, not decorative: without
it, adversarial tests C/D/F (directive Section 12) — which specifically require distinguishing
"evidence present, target still unknown" from "evidence present, target now known via a real
answer event" from "evidence mislabeled to already leak the target" — could not be written or
proven at all against the prior code.

## Question eligibility invariant (directive Section 6), implemented

`EVIDENCE PRESENT + TARGET UNKNOWN = QUESTION MAY BE ELIGIBLE.`
`TARGET ALREADY KNOWN = the same information-seeking question must NOT be justified as a NEW
discovery` (it may still be OFFERED as ordinary re-askable conversation — directive Section 14
forbids adding UI to hide it — but `evaluateLeftoverQuestionPrerequisite`'s `reason` field now
states explicitly that re-asking is not a new discovery, rather than silently implying it still is).

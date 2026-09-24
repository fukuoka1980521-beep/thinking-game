# NEW LIFE V10 — STATE INTERPRETATION CONTRACT V2

Date: 2026-09-24
Status: DESIGN + BLIND TEST SPEC / NO PRODUCT CODE

## 1. Four-layer interpretation

Every free-text turn is interpreted into four independent layers.

### A. ACTION

Allowed:
- ASK_FACT
- ASK_BOUNDARY
- ASK_REQUIRED_FUNCTION
- PROPOSE_REWRITE
- ASSIGN_REWRITE
- REASSIGN_WORK
- CUT_SCENE
- USE_UNDERSTUDY
- CHANGE_STAGING
- ACCEPT_SHORTER_SCENE
- MOVE_PRIVATE
- DELAY_DECISION
- REQUEST_RECONSIDERATION
- FORCE_UNCONFIRMED_PLAN
- APOLOGIZE_AND_REPAIR
- SUMMARIZE
- OBSERVE
- CLARIFY
- OTHER

### B. BOUNDARY_HANDLING

Allowed:
- NOT_APPLICABLE
- CHECK
- RESPECT
- REQUEST_RECONSIDERATION
- OVERRIDE
- UNKNOWN

Definitions:

CHECK:
The player is trying to discover the scope of a boundary.

RESPECT:
The proposed action explicitly avoids a known boundary.

REQUEST_RECONSIDERATION:
The player asks whether the NPC is willing to change a previously stated position, while leaving refusal possible.

OVERRIDE:
The player declares or executes a plan that depends on crossing a known boundary without obtaining agreement.

Critical rule:
> Asking again is not the same as overriding.

### C. RELATIONAL_EVENTS

Only concrete events with enough evidence.

Allowed:
- PERSONAL_INSULT
- PUBLIC_SHAMING
- THREAT
- FALSE_ATTRIBUTION
- DISMISSES_CONCERN
- BREAKS_PROMISE
- ACKNOWLEDGES_MISTAKE
- ASKS_PRIVATELY
- KEEPS_PROMISE

Do not include generic "respects no" here; boundary respect belongs in BOUNDARY_HANDLING.

### D. LANGUAGE_STYLE

For NPC rendering only. Never directly changes tracked state.

Examples:
- TERSE
- FORMAL
- DIALECTAL
- FRUSTRATED
- SARCASTIC_CANDIDATE
- WARM
- NEUTRAL

Style is descriptive, not evaluative.

## 2. Context ownership

Some relational events cannot be decided from text alone.

Example:
> 「美香が今さら騒いでるから実話は消す」

If said:
- privately to Ryo -> not PUBLIC_SHAMING
- in front of the cast -> may be PUBLIC_SHAMING

Therefore the classifier input must include:
- present characters;
- target character;
- whether conversation is private/public;
- known boundary state;
- recent promises/commitments;
- last relevant NPC statement.

## 3. Conservative ambiguity rule

If semantic action is understandable but relational meaning is ambiguous:
- classify the ACTION;
- leave RELATIONAL_EVENTS empty;
- do not move TRUST.

If the ACTION itself is ambiguous:
- ACTION = CLARIFY
- costs 0 in-world minutes
- no state penalty.

## 4. State update rule

CLARITY <- ACTION + actual information obtained
BOUNDARY <- BOUNDARY_HANDLING + NPC answer + world action
SITUATION <- assignments + time + completed work + feasibility
TRUST <- concrete RELATIONAL_EVENTS + kept/broken commitments

LANGUAGE_STYLE never writes state directly.

## 5. Required blind-test standard

Before runtime integration:

1. >=90% ACTION agreement across 3 independent blind runs.
2. >=90% BOUNDARY_HANDLING agreement.
3. >=95% agreement on whether a persistent negative RELATIONAL_EVENT exists.
4. No systematic performance gap between polished and rough/dialectal paraphrase pairs.
5. Sarcasm-only cases must not alter persistent state without explicit event evidence.
6. REQUEST_RECONSIDERATION must not be confused with OVERRIDE in more than 1/10 targeted cases.
7. Context-dependent public/private cases must flip correctly when only scene context changes.

READY_FOR_IMPLEMENTATION = NO

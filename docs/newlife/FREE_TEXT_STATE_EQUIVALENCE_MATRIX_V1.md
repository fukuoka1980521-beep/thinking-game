# NEW LIFE Free-Text / State Equivalence Matrix V1

Date: 2026-09-29
Status: implementation inventory

Purpose: identify which existing state-changing rescue choices must also be reachable by semantically equivalent free text, and what authority evidence is required before the deterministic state layer may apply the change.

## Rule

A choice label is not itself authority.

For free text:
chat-first understanding → structured proposal/evidence → deterministic authority gate → canonical action ID.

Never infer NPC consent from arbitrary prose matching.

| Day | Canonical action | Current state effect | Free-text equivalent | Authority needed | Can candidateTurn alone safely apply it? | Next contract |
|---|---|---|---|---|---|---|
| 9 | press_miyoko_for_boundary | mSeats → bounded | REQUIRED | Miyoko owns her seating boundary; the turn must be an actual boundary inquiry and not ambiguous | YES, low-risk discovery; implemented as first proof | ASK_BOUNDARY + npc=miyoko + low/medium uncertainty |
| 10 | suggest_time_split | pickupPlan → time_split_owned_by_hina | REQUIRED | Player proposal is insufficient; Hina must actually adopt/own the plan | NO | structured commitment/effect ID from Hina, then gate |
| 11 AM | fix_sign_before_posting | signVersion → clear_from_start | REQUIRED | A correction request alone is not equivalent to the sign actually being changed; authorized actor must accept/perform it | NO | structured artifact/state effect: SIGN_CORRECTED_BEFORE_POST |
| 11 PM | flag_correct_now | signVersion → vague_then_corrected | REQUIRED | Same as above; actual correction must occur | NO | structured artifact/state effect: SIGN_CORRECTED_AFTER_POST |
| 11 PM | publicly_blame_hina | publicBlame + false report state | REQUIRED | This is a player-owned social act; no NPC consent needed, but meaning must clearly be public blame/false attribution | POSSIBLY, but relational event contract should be used rather than phrase rules | explicit PUBLIC_SHAMING/FALSE_ATTRIBUTION evidence |
| 13 | relay_exaggerated_account | playerReport → false_unrepaired | REQUIRED | Player owns the report; must distinguish exaggeration from uncertainty/summary | NO from generic action label alone | structured fact-attribution violation proposal |
| 14 | broker_direct_fact_check | hyFactCheck → direct | REQUIRED | Requires actual direct exchange/verification between Hina and Yohei, not merely asking one person | NO | NPC-exchange completion + fact-check effect |
| 16 | arrange_paid_task_with_consent | jWork → extra_with_specific_consent | REQUIRED | Jin must consent to specific paid scope/time | NO | structured commitment with actor=Jin, scope, time |
| 16 | assume_free_help | jWork → extra_declined | REQUIRED | Player can make the request, but decline is Jin's response | NO | structured Jin refusal/commitment result |
| 17 | press_daisuke_for_answer | dWorkshop → one_hour_yes | REQUIRED | Asking is not enough because canon permits yes OR no | NO | structured Daisuke decision effect |
| 19 | confirm_editor_role | fEditor → named | REQUIRED | A named actor must accept the editor responsibility | NO | structured role commitment with actor |
| 21 | cheer_her_on | encouragementOnly → true | REQUIRED | Player-owned speech act; no other-person authority required, but must be actual encouragement without secured role | POSSIBLY | semantic act/effect ENCOURAGEMENT_ONLY with hard exclusion of concrete commitments |
| 22 | facilitate_direct_conversation | hyFactCheck → direct | REQUIRED | Must result in real Hina↔Yohei direct verification | NO | bounded NPC exchange + verified fact-check effect |

## Implementation priority

1. Day 9 boundary discovery — implemented in PR #113.
2. Add an explicit closed structured state-effect proposal contract to the refoundation backend.
3. Choose one commitment case (recommended Day 16 paid work) to prove actor/scope/consent authority.
4. Choose one player-owned negative/social consequence case to prove that state can change without NPC consent when the player themselves owns the action.
5. Only then expand equivalence across the remaining matrix.

## Why Day 16 is the recommended second proof

It tests a different and harder class than Day 9:

Day 9:
- knowledge/boundary discovery
- single authoritative NPC
- low ambiguity

Day 16:
- bilateral commitment
- scope and time matter
- consent must not be fabricated
- the world state should change only if Jin actually agrees

Passing both would demonstrate that the architecture handles both:
1. authoritative discovery, and
2. consent-bearing commitment.

## Completion criterion

NEW LIFE cannot claim “free input is the primary control surface” while normal conversational actions in this table remain state-changing only through choice buttons.

Completion does not require every flavor-only option to mutate state. It requires semantic equivalence for every choice whose meaning is a consequential conversational act.

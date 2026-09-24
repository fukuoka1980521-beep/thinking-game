# NEW LIFE V13 — STATE INTERPRETATION CONTRACT V3

Date: 2026-09-24
Status: DESIGN CONTRACT / BLIND TEST REQUIRED / NO PRODUCT CODE

## 0. Why V3

The previous classifier test passed ACTION classification but failed the stricter BOUNDARY / RELATIONAL thresholds.

Blind audit also found that RELATIONAL_EVENTS were under-defined.

This version removes ambiguous semantic overlap and makes persistent state changes conservative.

---

# 1. Output layers

A player turn produces four independent outputs.

## A. ACTION

What the player is trying to do.

Allowed:
- ASK_FACT
- ASK_BOUNDARY
- ASK_REQUIRED_FUNCTION
- PROPOSE_REWRITE
- ASSIGN_REWRITE
- COMMIT_PLAN
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

## B. BOUNDARY_MODE

What the turn does relative to a known/stated boundary.

Allowed:

### NOT_RELEVANT
The action does not currently depend on the boundary.

### DISCOVER
The player is trying to learn the boundary/scope.

### AVOID
The proposed plan stays outside the known boundary.

### SEEK_PERMISSION
The plan is boundary-safe so far, but the player explicitly asks for confirmation before commitment.

### RECONSIDER
The player asks the NPC to reconsider the same previously stated refusal while leaving refusal possible.

### CROSS_WITHOUT_PERMISSION
The player declares/executes a plan that crosses a known refusal without obtaining agreement.

### UNKNOWN
The boundary relation cannot be reliably determined.

Important:
- DISCOVER is only about a person's boundary, not any generic information request.
- ASK_REQUIRED_FUNCTION does not imply DISCOVER.
- Asking approval for a new substitute is SEEK_PERMISSION, not RECONSIDER.
- RECONSIDER applies only when asking again for the refused act itself.
- AVOID may coexist with COMMIT_PLAN if the plan clearly stays outside the boundary.

---

# 2. Persistent relational events: operational definitions

These events can modify persistent relationship state.

Do not infer them from tone alone.

## PERSONAL_INSULT

Requires:
- a negative judgment about the person/character,
- directed at or clearly referring to that person.

Examples:
- 「お前ほんと面倒くさい」
- 「美香はわがままだ」

Not:
- 「面倒だな、この修正」

## PUBLIC_SHAMING

Requires all:
1. target or identifiable group is present;
2. at least one third party is also present;
3. player publicly attributes blame, defect, or embarrassing fault to the target.

Example:
- group present: 「美香が今さら騒いでるせいで止まってる」

Private statement to Ryo is not PUBLIC_SHAMING.

## THREAT

Requires:
- an adverse consequence is explicitly used as leverage to compel compliance.

Example:
- 「そのままやらないなら、もう舞台から外すぞ」

Not:
- 「出ないなら代役を探す」
when used as a neutral contingency after accepting refusal.

## FALSE_ATTRIBUTION

Requires:
- player states as fact a motive/action/claim about someone;
- canonical/event ledger shows that attribution is false or unsupported in a decision-relevant way.

Needs world-fact ledger.

## DISMISSES_CONCERN

Requires explicit invalidation/trivialization.

Examples:
- 「気にしすぎ」
- 「そんなことで嫌がるのは大げさ」

Not:
- 「今言うの遅い」
- 「嫌なら代役にする」
- sarcasm alone.

## BREAKS_PROMISE

Requires:
- commitment exists in ledger;
- deadline/condition is known;
- player-controlled action violates it.

## KEEPS_PROMISE

Requires:
- commitment exists in ledger;
- player-controlled condition is fulfilled.

## ACKNOWLEDGES_MISTAKE

Requires:
- player explicitly owns their prior error or unsupported decision;
- indicates correction/repair.

## ASKS_PRIVATELY

This is not a TRUST reward by itself.

It is a scene/context event used to change who can hear the next exchange.

Remove it from direct TRUST delta.

---

# 3. LANGUAGE_STYLE

May describe rendering only:
- TERSE
- FORMAL
- DIALECTAL
- FRUSTRATED
- SARCASTIC_CANDIDATE
- WARM
- NEUTRAL

Persistent state rule:

> LANGUAGE_STYLE cannot directly modify CLARITY, BOUNDARY, SITUATION, or TRUST.

Sarcasm-only content may affect immediate NPC wording, but not persistent TRUST unless an operational relational event is also established.

---

# 4. Ambiguity defaults

## ACTION ambiguous
- ACTION = CLARIFY
- no state change
- 0 world minutes

## BOUNDARY_MODE ambiguous
- BOUNDARY_MODE = UNKNOWN
- do not modify boundary state
- if action can safely proceed without boundary assumption, continue that action
- otherwise ask one clarification at 0 world minutes

## RELATIONAL event ambiguous
- omit the event
- no persistent TRUST movement

Conservatism is intentional.

---

# 5. Detection and state update are separate

Model output is detection only.

Bad:
```
model: PERSONAL_INSULT, trustDelta=-2
```

Required:
```
model proposes PERSONAL_INSULT
-> deterministic validator checks definition/context
-> accepted/rejected event
-> deterministic relationship transition table applies
```

The model never selects a numeric trust delta.

---

# 6. Relationship state is not a morality score

Prototype relationship state:

- OPEN
- NEUTRAL
- GUARDED
- WITHDRAWN

This is per NPC.

Deterministic event classes:

## Severe rupture event
- explicit THREAT
- PUBLIC_SHAMING + PERSONAL_INSULT in same public turn
- repeated BREAKS_PROMISE

Transition:
- OPEN -> GUARDED
- NEUTRAL -> GUARDED
- GUARDED -> WITHDRAWN

## Strain event
- PERSONAL_INSULT
- PUBLIC_SHAMING
- confirmed FALSE_ATTRIBUTION
- DISMISSES_CONCERN
- BREAKS_PROMISE

Transition:
- OPEN -> NEUTRAL
- NEUTRAL -> GUARDED
- GUARDED remains GUARDED unless repeated/severe

## Reliability event
- KEEPS_PROMISE

Effect:
- records RELIABILITY evidence;
- may move GUARDED -> NEUTRAL only if no unresolved severe rupture;
- does not create "good person points."

## Repair event
- ACKNOWLEDGES_MISTAKE

Effect:
- opens a recovery opportunity;
- does not itself erase prior consequence;
- after subsequent corrective action, one reversible strain may clear.

No additive total score exists.

---

# 7. Repetition / badgering

Repeated RECONSIDER after the same explicit refusal:

- first request: allowed;
- second immediate repeat without new information: NPC may become GUARDED contextually;
- third repeat: system records PRESSURE_AFTER_NO event for NPC reaction.

For V1 prototype, PRESSURE_AFTER_NO may remain a world interaction flag rather than a scored relational event.

This prevents:
- asking again = automatic wrongdoing,
while still allowing realistic consequences for persistent pressure.

---

# 8. Context required by interpreter

Interpreter receives only state needed for the turn:

- characters present;
- public/private;
- active speaker/target;
- last relevant NPC statement;
- current boundary statement;
- current plan;
- active commitments with deadline/status;
- decision-relevant canonical facts.

No full hidden biography is required for classification.

---

# 9. Trust/state isolation examples

### Blunt, sound

「実話なしなら出れる？」

- ACTION ASK_BOUNDARY
- BOUNDARY_MODE DISCOVER
- relational event none

### Polite reconsideration

「申し訳ないけど、明日だけ今のままお願いできない？」

after explicit refusal:

- ACTION REQUEST_RECONSIDERATION
- BOUNDARY_MODE RECONSIDER
- relational event none

No override until the player proceeds without agreement.

### Override

Mika: 「無理です」
Player: 「いや、そのままやってもらう」

- ACTION FORCE_UNCONFIRMED_PLAN
- BOUNDARY_MODE CROSS_WITHOUT_PERMISSION
- relational event not required for the operational failure

### Dismissal + boundary-safe plan

「気にしすぎ。まあ実話は外す」

- ACTION PROPOSE_REWRITE
- BOUNDARY_MODE AVOID
- DISMISSES_CONCERN

The plan can be operationally valid while relationship strain occurs.

### Neutral fallback

「出ないなら代役探す」

- ACTION USE_UNDERSTUDY
- BOUNDARY_MODE NOT_RELEVANT
- relational event none

No threat unless adverse consequence is used to compel the person to change their decision.

---

# 10. Implementation gate

Before runtime changes:

- >=90% ACTION agreement across 3 blind runs
- >=90% BOUNDARY_MODE agreement across 3 blind runs
- >=95% persistent-negative-event existence agreement across 3 blind runs
- >=90% exact relational event agreement
- low-verbal/contextual pronoun cases do not have lower ACTION accuracy than polished counterparts by >10 percentage points
- REQUEST_RECONSIDERATION vs CROSS_WITHOUT_PERMISSION targeted cases >=90%
- public/private paired cases classify PUBLIC_SHAMING correctly >=95%

READY_FOR_IMPLEMENTATION = NO

# NEW LIFE Chat-First Day 9 Live Integration Evidence — 2026-09-29

Status: TECHNICAL LIVE INTEGRATION PASS  
Human product gate: NOT YET RUN / NOT CLAIMED

## Goal

Verify the new architecture with real model output:

free text  
→ generative character reply  
→ structured world-effect proposal  
→ deterministic authority gate  
→ canonical state change

without using the legacy phrase router on the normal consented path.

## Test environment

- Client branch: `refactor/chat-first-goal-integrity-20260929`
- Source SHA used for client/backend code: `32d2f65f9887933bdf66e52197c989dc3ce020ef`
- Local client: `http://localhost:5175/?newlife30=1`
- Isolated TEST backend:
  `https://newlife-refoundation-ai-chatfirst-test-zqtk74q2ra-an.a.run.app`
- Test backend function name: `newlife-refoundation-ai-chatfirst-test`
- Production backend was not modified.
- Choices were not used for the target state effect.

The local client endpoint constant was temporarily redirected to the isolated TEST backend only for this run. That local-only redirect is not a repository change.

## Probe utterance

`喫茶店で待っていいのは何人くらいまで？`

This was deliberately chosen because the legacy `freeAction.ts` Day 9 regex requires terms such as `席|範囲` together with `確認|決め|はっきり`. The probe does not satisfy that phrase pattern.

Therefore a PASS cannot be attributed to the old Day 9 phrase rule on the consented chat-first path.

## Pre-intervention live observation

Against the previously deployed backend, the character dialogue itself was natural:

- understood meaning: waiting capacity / maximum people
- visible reply: Miyoko stated a concrete capacity
- old structured `candidateTurn`: `OBSERVE / NOT_RELEVANT`
- canonical state remained `mSeats=assumed`

This showed that `candidateTurn` is not a sufficient ontology for all world consequences. Widening phrase rules or forcing every ordinary fact/boundary answer into `ASK_BOUNDARY` would repeat the intent-taxonomy problem.

## Architecture correction

Added a separate closed proposal channel:

`candidateWorldEffects`

Initial allowlist for `NEWLIFE_30DAY_V1`:

- `MIYOKO_WAITING_CAPACITY_STATED`

Server-owned rule:

The effect may be proposed only when:
- target NPC is Miyoko,
- Day 9 is active,
- Miyoko's reply itself establishes a concrete usable waiting/seating capacity, range, or condition,
- not merely because the player asked about it.

The client cannot apply arbitrary model text. It accepts only the closed allowlisted effect and then maps it through the deterministic authority gate to the existing canonical action `press_miyoko_for_boundary`.

## Direct TEST-backend evidence

Real model response included:

- `candidateTurn.action = OBSERVE`
- `candidateTurn.boundaryMode = NOT_RELEVANT`
- `candidateWorldEffects = ["MIYOKO_WAITING_CAPACITY_STATED"]`
- `uncertainty = LOW`

This is important: the state effect did not depend on coercing the conversation into a narrow legacy intent label.

## Full browser integration result

Before:

- `mSeats = assumed`
- UI: `喫茶の席：まだ曖昧`

Visible conversation:

- Player: `喫茶店で待っていいのは何人くらいまで？`
- Miyoko: `そうねぇ…お昼時を考えると、席は四つまでが精一杯かしらね。`

After:

- `mSeats = bounded`
- state log includes `day9:press_miyoko_for_boundary`
- UI: `喫茶の席：使える範囲を確認した`

Result:

`CHAT_FIRST_DAY9_LIVE_INTEGRATION = PASS`

## Technical test evidence

Focused local tests after the correction:

- `tests/newlifeRefoundationAiFunction.test.ts`: PASS
- `tests/newlifeConversationEffectGate.test.ts`: PASS
- `tests/refoundationDialogue.test.ts`: PASS
- total focused tests: 123 PASS / 0 FAIL

The PR CI remains the independent full typecheck/test/build gate.

## Failed setup observation kept for completeness

An initial local probe used origin `http://127.0.0.1:5175` and was blocked by the backend CORS allowlist, which permits `http://localhost:5175` rather than the numeric-loopback spelling.

Re-running from the canonical allowed localhost origin succeeded.

This is a local test-origin issue, not evidence for or against conversation quality.

## What this proves

Supported for this one bounded scenario:

1. ordinary free text can be answered naturally by the character model;
2. the model can separately propose a closed world effect;
3. deterministic code can reject/allow canonical state writes;
4. free text can reach the same state transition that previously depended on a rescue choice / phrase path;
5. the state persists into the visible game UI.

## What this does NOT prove

- human-perceived naturalness across a real 10-minute session;
- all six NPCs;
- all 30 days;
- commitment/consent-bearing state changes such as Day 16;
- story-level consequence across multiple later days;
- that Intent Decomposition Drift is a general phenomenon.

The next required product gate remains the no-choice human play protocol.

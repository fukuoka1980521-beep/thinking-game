# Live Response Wait UX V1 — PHASE 12.2

Directive Section 12/13. Real measured latency from PHASE 12.1
(`docs/research/evaluation/phase-12-1/LATENCY_AND_LIVE_CALL_AUDIT_V1.md`): 5.7–11.2 seconds,
median ~10.2s from a 5-call sample — **not hidden, not faked as instant, and no artificial delay
was added to the deterministic path either.**

## What was built

While `pending` is true (the async gap between send and the adapter resolving — identical
mechanism for both the deterministic and live adapters, unmodified from PHASE 12.1), the
conversation log shows one additional bubble: `.bgw-line-waiting`, styled as an NPC speech bubble
containing three pulsing dots (「・・・」-style), with an `aria-label` naming the specific NPC
("〇〇が考えている") for accessibility. The character portrait, name, and the rest of the
conversation log remain fully visible — the environment does not disappear or gray out.

## What was explicitly avoided (directive Section 12's prohibited list)

- No "Loading AI..." text.
- No "Gemini generating..." or any model-name string anywhere on the primary surface (re-verified:
  `tests/newlifeBgw121VisualProduct.test.tsx`'s "no debug controls" test greps the whole frame for
  `gemini`/`Vertex`/`classification` — none present).
- No spinner widget — the pulsing-dots bubble is styled as an in-fiction conversational beat, not
  a system loading affordance.

## Real evidence, not a simulated wait

`mobile_visual_qa_script.mjs` performed one genuine live Vertex call (same frozen pipeline as
PHASE 12.1) and captured the screen ~300ms after tapping send — well before the real ~6-11s
response arrives — producing `screenshots/06_conversation_waiting_for_live_ai.png`, a real,
unstaged waiting-state screenshot. The subsequent response and full round-trip completed normally
afterward (`screenshots/07_conversation_after_response.png`).

## No latency backend optimization (directive Section 13)

No change was made to `devtools/bgwVertexLiveAdapterCore.mjs`, the prompt, `maxOutputTokens`, or
any request parameter this phase. The ~10-second figure is recorded as-is; whether it is
Owner-tolerable is explicitly left for a future Owner-play session to determine, not decided here.

## Honest limitation

Only ONE live call's wait state was captured this phase (matching this phase's "no new AI
research/no additional live-call budget" spirit — the generative behavior is frozen, so no new
latency sampling was performed). The PHASE 12.1 5-call latency sample remains the only quantitative
basis; this phase adds a qualitative (visual) confirmation that the wait state renders correctly
during a real call, not a new latency measurement.

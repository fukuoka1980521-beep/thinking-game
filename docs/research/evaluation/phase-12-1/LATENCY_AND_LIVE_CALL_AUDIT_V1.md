# Latency and Live-Call Audit V1 — PHASE 12.1

Directive Section 5/12. Every real live Vertex AI call made this phase, accounted for. Total: well
under the directive's 30-call cap.

## Full call ledger

| # | Script/path | Case | Result | Latency |
|---|---|---|---|---|
| 1-3 | `ai_necessity_live_experiment.mjs` | 3-state (A/B/C) | 3/3 success (httpStatus 200, finishReason STOP) | not recorded (gap, see below) |
| 4-8 | `bounded_free_text_live_evidence.mjs` | NG cases A-E | 5/5 success | 10168 / 10742 / 5700 / 11205 / 9406 ms |
| 9 | manual `node -e` diagnostic call | debugging the dev-server wiring | 1/1 success | not recorded (diagnostic only, not evidence) |
| 10 | `curl` direct to `/api/bgw-npc-dialogue` (cold start) | real browser-equivalent path | 1 call, returned empty envelope (fail-closed, not a crash) — see `PRODUCT_VISUAL_QA_V1.md`'s honest note | not recorded |
| 11 | `curl` direct to `/api/bgw-npc-dialogue` (warm) | real browser-equivalent path | 1/1 success | not recorded |
| 12 | `product_visual_qa_live_script.mjs` run 1 (pre-world-tick-fix) | real Playwright browser | 1/1 success | not recorded |
| 13 | `product_visual_qa_live_script.mjs` run 2 (final, post-world-tick-fix) | real Playwright browser | 1/1 success | not recorded |

**Total live Vertex calls this phase: 13.** Well under the directive's `<= 30` budget; no large
prompt-tuning loop was run.

## Success / failure counts

- **Requests attempted**: 13
- **Successes** (HTTP 200, well-formed model response reaching the envelope layer): 12
- **Failures**: 1 (the cold-start empty-envelope case, #10 — fail-closed, not a crash; see
  `PRODUCT_VISUAL_QA_V1.md`)
- **Timeouts**: 0 observed
- **MAX_TOKENS truncation** (the documented `gemini-2.5-flash` thinking-budget bug from PHASE
  11.9/12.0): 0 observed this phase — `maxOutputTokens: 2048` (set in
  `devtools/bgwVertexLiveAdapterCore.mjs`, matching the PHASE 11.9 fix) held for every successful
  call; every `finishReason` observed was `STOP`.
- **Transport/API errors** (non-200 HTTP from Vertex itself): 0 observed

## Latency — stated honestly, including where measurement is incomplete

**Only 5 of the 13 calls have a recorded wall-clock latency** (the 5 NG-case calls in
`bounded_free_text_live_evidence.mjs`, which explicitly timed each call). The 3-state experiment
script and the diagnostic/Playwright calls did not capture latency — this is a real measurement
gap, not a deliberately withheld number, and is reported as such rather than extrapolated or
guessed.

For the 5 measured calls:

- Values: 5700, 9406, 10168, 10742, 11205 ms
- **Median**: 10168 ms
- **Worst**: 11205 ms
- **Sample size**: 5 — **too small to treat this median as a reliable general latency figure for
  the live adapter.** Reported as a directional data point only, per directive Section 12's
  explicit instruction not to overstate a small sample.

## What this means for the Product

A ~6-11 second real-world response time is plausible from these 5 samples. This is meaningfully
slower than the deterministic adapter (near-instant) and slower than the CPDC 2025 research
benchmark's 7-second target for comparable NPC dialogue (`EXTERNAL_RESEARCH_MAPPING_V1.md`, PHASE
12.0). No UI "thinking..." affordance was built this phase (out of the recommended minimal scope);
the live-adapter path currently just disables the send button and shows "…" during the wait
(`NewlifeBgw121App.tsx`'s `pending` state) — functionally correct but minimal. This is carried
forward as an open risk, not silently accepted as fine.

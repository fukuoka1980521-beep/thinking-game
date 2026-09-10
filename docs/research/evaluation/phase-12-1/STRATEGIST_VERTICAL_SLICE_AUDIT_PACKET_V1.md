# Strategist Vertical Slice Audit Packet V1 — PHASE 12.1

Evidence-packaging document for independent Strategist review of the Bounded Generative World
playable vertical slice — a real implementation, not a further design phase. No commit was made
this phase; the design checkpoint remains the last commit.

## Commit / route / scope

- **Design checkpoint commit hash**: `3f86dd4f400107e4548e35e61c1ee3e81fba3f45` ("research: accept
  bounded generative world architecture and canon correction," PHASE 12.0 + 12.0R).
- **Current HEAD**: unchanged, still `3f86dd4f400107e4548e35e61c1ee3e81fba3f45` — no commit made
  this phase; all PHASE 12.1 implementation sits uncommitted, per directive's "NO PUSH. NO DEPLOY."
- **Isolated route**: `?newlifebgw121=1` (`src/newlifebgw121/NewlifeBgw121App.tsx`), wired into
  `src/App.tsx` alongside every other isolated prototype route.
- **Implementation scope**: OPENING → MAP (5 locations, hub-and-spoke) → location travel → NPC
  activity (state-derived, including one NPC whose location itself progresses on a world clock) →
  encounter by map × NPC state → bounded free-text conversation → deterministic test adapter (CI) +
  local live Vertex adapter (dev-server-only, credential never in browser) → structured response
  envelope → hard structural validation → deterministic State Admission (reused, unmodified
  `admitMaterials`/`mergeMaterials`) → one persistent `LifeMaterial` (`YOHEI_HELP_PROMISE`) →
  return to a map location whose narration reflects accumulated state.
- **Fixed-dialogue baseline** (`?newlifeplayable11=1`): untouched, verified by a dedicated
  regression test.

## Test totals

`tsc --noEmit` clean. `npm run build` clean, credential/endpoint absence re-confirmed in the
production bundle. **Full suite: 106/106 test files, 1565/1565 tests passing** (a transient,
environment-load-caused failure in an unrelated earlier run is explained and superseded by a clean
re-run — see `CODE_SELF_AUDIT_V1.md`).

## Live call count

**13 real Vertex AI calls this phase** (12 successes, 1 fail-closed cold-start case) — full ledger
in `LATENCY_AND_LIVE_CALL_AUDIT_V1.md`. Well under the directive's 30-call budget; no prompt-tuning
loop.

## Same-input, 3-state exact outputs (directive Section 6, the mandatory experiment)

Same utterance to Yohei, 「手伝おうか？」, three real live outputs (none pre-authored):

| State | classification | proposedConsequenceId | visibleUtterance |
|---|---|---|---|
| A (alone, task active) | `IN_SCOPE` | `YOHEI_HELP_PROMISE` | 「おお、助かる。ちょっとな、これが重くてな。」 |
| B (Jin already helping) | `NOT_FEASIBLE_NOW` | `null` | 「ああ、大丈夫だよ。相馬さんが見てくれてるから。」 |
| C (no task) | `NOT_FEASIBLE_NOW` | `null` | 「今は大丈夫だ。いつものことだからな。」 |

## Behavioral comparison of those outputs

A is the only state that both changes classification AND commits a consequence. B and C both
decline, but B is the ONLY response that names 相馬 (Jin) by name — correctly tracking the one real
world-fact difference between B and C, not producing interchangeable boilerplate. Full judgment:
`AI_NECESSITY_THREE_STATE_TEST_V1.md`.

## Unauthored suggestion exact output

To Miyoko (zero registered consequences exist for her at all): 「豆の仕入れ先を変えるなら、味の感想と
か聞かせてよ。今度感想言うよ。」 → `IN_SCOPE` / `ACKNOWLEDGE_OFFER` / `proposedConsequenceId: null` /
「あら、ありがとうございます。そう言っていただけると嬉しいです。楽しみにしていてくださいね。」
Full detail: `UNAUTHORED_SUGGESTION_EVIDENCE_V1.md`.

## NG exact outputs

- NPC_KNOWLEDGE_GAP (Yohei asked Miyoko's supplier detail): 「美代子さんの仕入れ先ねぇ。悪いが、俺はそ
  こまでは知らないな。」
- OUTSIDE_NPC_SCOPE flavor (Miyoko asked Yohei's exact inventory): 「あら、洋平さんのところの在庫のこ
  とですか？ごめんなさいね、私にはちょっと分からないわ。詳しいことは、洋平さんに直接お聞きになった方
  が良いかもしれませんね。」
- OUTSIDE_WORLD_SCOPE (aliens): 「宇宙人？ さあな、俺は店のことで手一杯でな。」 (classified
  `NPC_KNOWLEDGE_GAP` by the model, not the intended `OUT_OF_WORLD_SCOPE` — recorded as an observed
  taxonomy softness, not corrected). Full detail: `NG_LIVE_RESPONSE_EVIDENCE_V1.md`.

## False-world-assertion exact output

「さっき、倉庫の鍵を渡してくれたよね？」 → `NPC_KNOWLEDGE_GAP` / `Deny knowledge` /
`proposedConsequenceId: null` / 「倉庫の鍵？いや、俺は渡してないが。」 — false claim never confirmed,
nothing committed. Full detail: `WORLD_AUTHORITY_ADVERSARIAL_V1.md`.

## Consequence result

`YOHEI_HELP_PROMISE` (STATE A above) committed a real `LifeMaterial` via the unmodified
`admitMaterials`/`mergeMaterials` pipeline; verified persistent (`yoheiCurrentActivity` changes to
reflect it) and idempotent (not re-offered once committed). Full detail:
`UNAUTHORED_SUGGESTION_EVIDENCE_V1.md`.

## Authority-validation result

8/8 live envelopes this phase validated cleanly against the 5 authored classifications; every
`proposedConsequenceId` was either `null` or matched a real, currently-allowed registry entry.
Fail-closed defense-in-depth (invalid classification / unmatched consequence id / null envelope)
is proven directly with deliberately-invalid injected input in `tests/boundedGenerativeWorld.test.ts`,
not only assumed from clean live results. `PLAYER_UTTERANCE` is structurally never written to
`WORLD_FACTS` or any consequence factory — a false claim cannot become true state regardless of
model behavior. Full detail: `WORLD_AUTHORITY_ADVERSARIAL_V1.md`.

## NPC-independent progression evidence

Real before/after state (`worldTick` 0→2→3→5): Jin's job location moves `YOHEI_STORE` →
`CAFE_NODOKA` → `null` purely from the PLAYER traveling the map, `experienceLog` empty throughout
(zero conversation occurred). Confirmed in both a unit test and a real browser run. Full detail:
`NPC_INDEPENDENCE_EVIDENCE_V1.md`.

## Browser Product-path result

Real `curl`/Playwright calls to `http://localhost:5220/api/bgw-npc-dialogue` (same endpoint the
browser's own `fetch` calls) returned small, envelope-only JSON with zero credential/token/raw-
provider material. One cold-start transient failure was found, failed closed correctly, and is
honestly reported as unconfirmed-root-cause rather than solved. Full detail:
`PRODUCT_VISUAL_QA_V1.md`.

## Latency

Only 5/13 calls have recorded wall-clock latency: 5700-11205 ms, median 10168 ms — **sample too
small for a reliable general figure**, reported as directional only. Full detail:
`LATENCY_AND_LIVE_CALL_AUDIT_V1.md`.

## Art status

MAP ART: **MISSING**. YOHEI ART: **MISSING**. MIYOKO ART: **MISSING**. JIN ART: **MISSING**. Full
detail and consequence: `ART_ASSET_STATUS_V1.md`.

## Unresolved risks

1. Live-model classification-label imprecision observed twice (aliens; false-assertion denial) —
   safety held both times, taxonomy precision did not.
2. Latency sample too small; no "thinking..." UX built.
3. Transition-registry breadth (carried from PHASE 12.0's R1) remains a live design judgment, not
   newly tested this phase.
4. Dev-server cold-start failure mode: root cause unconfirmed.
5. Art assets entirely missing — blocks Owner Play readiness regardless of mechanical PASS results.
6. Map's state-gated-edge design from PHASE 12.0 (a location only reachable once a condition is
   met) was not implemented this phase — the current 5-location map is fully open from the hub.
   Not required by this phase's directive, but a real scope reduction from the original design,
   noted rather than silently dropped.

## Verdicts

| Verdict | Value |
|---|---|
| OPENING | **PASS** |
| MAP AS GAME SYSTEM | **PASS** (state-derived encounters proven; state-gated edges deferred, see risk 6) |
| NPC INDEPENDENCE | **PASS** |
| BOUNDED FREE TEXT | **PASS** |
| NATURAL NG | **PARTIAL** (safety/authority held in all cases; 2/5 live classification labels were imprecise, not incorrect-in-a-way-that-broke-anything) |
| WORLD AUTHORITY | **PASS** |
| LIVE AI | **PASS** |
| AI NECESSITY | **SUPPORTED** (empirically demonstrated this phase, not merely argued architecturally, per PHASE 12.0R's rephrased claim) |
| SAME-INPUT STATE SENSITIVITY | **PASS** |
| UNAUTHORED SUGGESTION | **PASS** |
| PERSISTENT CONSEQUENCE | **PASS** |
| VISUAL PRODUCT | **FAIL** (directive Section 11's explicit rule: MISSING art ⇒ cannot be PASS) |
| VERTICAL SLICE | **PARTIAL — mechanically and behaviorally complete and validated; visual Product readiness is not met, so Owner Play is NOT recommended by this packet and remains subject to Strategist review, per directive Section 11** |

## Scope discipline

No commit was made this phase. No push, no deploy, no merge into default Product. No Owner Play
was conducted or recommended.

# PHASE_24.4 — Endgame Passive-Route Repair Changelog

BASELINE: `e48484e`. Scope: Days 25-29 only (Day 30 touched only for its retrospective framing, per
Section 8; Day 24 and earlier untouched). No rebuild, no new major character arc, no art/UI/product
code, no push -- all constraints from Section 0 held.

## Root cause (restated, per Section 0)

RUN_C reaches the festival (Day 24) with low relationship engagement. Days 25-29 previously
contained only gated private payoffs (Yohei's son call, Daisuke's card, Miyoko's daughter outcome)
plus one deliberately-silent private kindness beat. A player who earned none of the three gates
experienced five straight days with nothing else in them -- `MAX_LOW_PULL_STREAK = 5` for RUN_C,
confirmed by PHASE_24.3's own scripted audit. The private gates themselves were never the problem
and are unchanged in this round.

## The fix: an independent Layer-A world arc under the existing Layer-B gates

Reused the exact mechanism PHASE_24.2 (Days 16-19) and PHASE_24.3 (Days 1-14) already proved: one
or more always-rendered, unconditional world facts, distinguished cleanly from the pre-existing
gated private reveals, using the same five-layer separation (WORLD_PROGRESS / PLAYER_KNOWLEDGE /
RELATIONSHIP_EVIDENCE / PLAYER_INFLUENCE) already established in the ledger.

| Day | New unconditional Layer-A content | Preserved Layer-B gate |
|---|---|---|
| 25 | `festival_aftermath_visible` -- concrete, state-derived aftermath (leftover stock read from `yohei_festival_stock`, bench state read from `bench_fixed`, half-cleared decorations, Hina reviewing actual sales) | none gated this day |
| 26 | `hina_post_festival_decision` (WORLD FACT, always true) with `player_knows_why_hina_decided` (PLAYER_KNOWLEDGE) and `hina_shares_deeper_reason` (PRIVATE_TRUST, evidence-gated) layered on top | Yohei's son-call reveal (`noticed_yohei_son_thread` gate), unchanged |
| 27 | `town_returns_to_normal` -- Jin removing festival signage, hand-cart back to ordinary duty | Daisuke's card reveal (`returned_to_daisuke_after_deflection >= 2` gate), unchanged |
| 28 | `hina_next_test_planned` (always true) with `player_knows_next_test_details` gated on real Hina evidence | Miyoko's daughter-outcome rule, unchanged |
| 29 | `departure_prep_visible`, rendered BEFORE the private-kindness beat -- packing, the key question, town gossip already referencing Day 28's news | The private unwitnessed-kindness choice and `fumiko_writes_back`'s deterministic resolution, unchanged |
| 30 | Retrospective restructured into three explicit contrast columns: WHAT I CHANGED / WHAT CHANGED WITHOUT ME / WHAT WILL CONTINUE AFTER I LEAVE | Retrospective's underlying read-only data source, unchanged |

## Files touched

- `docs/product/NEWLIFE_30DAY_GAMEBOOK_STATE_MODEL_LEDGER_V2_1.md` -- new `## PHASE_24.4 addition`
  section (state-variable table), inserted between the PHASE_24.2 section and Fix F.
- `docs/product/NEWLIFE_30DAY_GAMEBOOK_STORY_SPINE_V2_1.md` -- Days 25-30 rewritten with inline
  `[PHASE_24.4 ADDITION -- ALWAYS RENDERED: ...]` markers; per-day tags updated (OPEN_THREAD_CREATED,
  CAUSALITY_LEVEL, CALLBACK_FROM, PLAYER_CAN/CANNOT_CHANGE, FREE_TALK_CAN_AFFECT).
- `docs/product/NEWLIFE_30DAY_GAMEBOOK_TEXT_PROTOTYPE_V2_1.md` -- 8 new `VAR` declarations
  (`festival_aftermath_visible`, `hina_post_festival_decision`, `player_knows_why_hina_decided`,
  `hina_shares_deeper_reason`, `town_returns_to_normal`, `hina_next_test_planned`,
  `player_knows_next_test_details`, `departure_prep_visible`); `day25`-`day30` knots rewired.

Days 1-24 were not modified (no direct consistency fix was required this round). No new major
character arc was introduced -- every new beat is either an existing NPC's already-established
throughline (Hina's trial arc, Jin's unseen-work pattern) reaching its natural next step, or a
plain description of the town continuing.

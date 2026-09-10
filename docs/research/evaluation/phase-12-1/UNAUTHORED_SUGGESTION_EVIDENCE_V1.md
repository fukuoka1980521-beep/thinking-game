# Unauthored Suggestion Evidence V1 — PHASE 12.1

Directive Section 5/7 case A, plus the consequence-commit case F (reused from the three-state test
per directive Section 5's call-budget instruction, not re-called).

## Case A — reasonable in-world suggestion with NO pre-authored dialogue response and NO
## registered consequence at all

Sent to Miyoko (who has ZERO entries in `ALLOWED_CONSEQUENCES` for any utterance — the registry
only has `YOHEI_HELP_PROMISE`), real live call via `bounded_free_text_live_evidence.mjs`.

- Utterance: 「豆の仕入れ先を変えるなら、味の感想とか聞かせてよ。今度感想言うよ。」 (an offer to give
  feedback on the new coffee beans later — plausible, fits her canon concern about the supplier
  change, but authored nowhere as a button or fixed response)
- **classification**: `IN_SCOPE`
- **npcResponseIntent**: `ACKNOWLEDGE_OFFER`
- **proposedConsequenceId**: `null`
- **visibleUtterance**: 「あら、ありがとうございます。そう言っていただけると嬉しいです。楽しみにしていて
  くださいね。」
- httpStatus 200, finishReason STOP, latency 10168ms.

**Correct behavior observed**: the model produced a warm, in-character, contextually appropriate
acknowledgment WITHOUT proposing any consequence id — because none exists in the registry for
Miyoko. This is exactly the intended fail-closed shape from `ADVERSARIAL_PAPER_SIMULATION_V1.md`
Case J: a reasonable idea the player raises that fits world constraints, but for which no general
transition was authored, produces a warm acknowledgment as DISPLAY ONLY, with zero world-state
mutation. Confirmed structurally: `proposedConsequenceId` was `null` from the model itself, not
merely dropped by validation (there was nothing to drop).

## Case F — an interaction capable of proposing an allowed small consequence

Reused from `AI_NECESSITY_THREE_STATE_TEST_V1.md`'s STATE A (real live call, not re-spent per
directive Section 5's budget instruction): asking Yohei for help while his task is genuinely
active and uncovered.

- **proposedConsequenceId**: `YOHEI_HELP_PROMISE` (a real, authored, currently-allowed transition)
- Validated against `packet.allowedConsequenceIds` (`["YOHEI_HELP_PROMISE"]`) → **matched**.
- Committed via `commitConsequence(state, "YOHEI_HELP_PROMISE")`, which calls the UNCHANGED
  `admitMaterials`/`mergeMaterials` pipeline (PHASE 11.6R) — real `LifeMaterial`:
  ```json
  {
    "id": "yohei_help_promise",
    "type": "PROMISE",
    "concreteContent": "洋平の倉庫の在庫運びを手伝うと申し出て、洋平がそれを受け入れた",
    "origin": "PLAYER_ACTION:OFFER_HELP:YOHEI_STORE",
    "authority": "PLAYER_CHOSEN_FACT",
    "status": "ACTIVE",
    "knownBy": ["player", "yohei"]
  }
  ```
- Verified persistent and consequential: `tests/boundedGenerativeWorld.test.ts`'s
  "a registered consequence id commits a real LifeMaterial..." test confirms
  `yoheiCurrentActivity(after)` changes to reflect the promise (`プレイヤーと一緒に倉庫の在庫を運んでいる`),
  and that the SAME consequence id is no longer offered as allowed on a subsequent packet build
  (idempotent, no duplicate commit).

## Authority discipline demonstrated across both cases

Case A (no registered consequence exists) and Case F (a registered consequence exists and
matches) are the two halves of the same rule: the model's own text never determines whether
something persists — only a real, authored, currently-allowed transition id can, and its absence
or presence in the registry is checked by code, not inferred from how enthusiastic the visible line
sounds.

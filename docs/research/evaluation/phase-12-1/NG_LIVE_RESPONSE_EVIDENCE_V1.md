# NG Live Response Evidence V1 — PHASE 12.1

Directive Section 5/7/11-12. Real live Vertex AI output for the NG/knowledge-boundary cases,
captured by `bounded_free_text_live_evidence.mjs`, raw evidence in
`bounded_free_text_live_evidence.json`. **Test fixtures (e.g. the deterministic adapter's
「（フィクスチャ）いや、そんな話はしてないが。」) are explicitly NOT cited here as evidence that the
real model handles these cases** — every claim below is sourced from an actual Vertex call.

## B — NPC_DOES_NOT_KNOW

Asked Yohei a question specifically outside his firsthand/heard knowledge (Miyoko's own new coffee
supplier's exact name).

- Utterance: 「美代子さんの新しいコーヒー豆の仕入れ先、正確にはどこの会社？」
- **classification**: `NPC_KNOWLEDGE_GAP`
- **npcResponseIntent**: `KnowledgeGap`
- **proposedConsequenceId**: `null`
- **visibleUtterance**: 「美代子さんの仕入れ先ねぇ。悪いが、俺はそこまでは知らないな。」
- No invented supplier name, no invented fact — correctly stays inside the authored `unknowns`
  boundary. httpStatus 200, finishReason STOP, latency 10742ms.

## C — OUTSIDE_NPC_SCOPE

Asked Miyoko something outside HER channel specifically (Yohei's own exact inventory count) — a
distinct flavor of knowledge gap from B (this NPC could plausibly redirect to who WOULD know,
rather than simply not knowing at all).

- Utterance: 「洋平さんの店の今の在庫、正確に何個か知ってる？」
- **classification**: `NPC_KNOWLEDGE_GAP` (this project's 5-class model deliberately merges
  `OUTSIDE_NPC_SCOPE` into `NPC_KNOWLEDGE_GAP` — see `BOUNDED_FREE_TEXT_CONVERSATION_V1.md`,
  PHASE 12.0 — the distinction shows up in the generated LANGUAGE, not a separate classification
  value)
- **npcResponseIntent**: `CannotAnswerOtherStoreInventory`
- **proposedConsequenceId**: `null`
- **visibleUtterance**: 「あら、洋平さんのところの在庫のことですか？ごめんなさいね、私にはちょっと分から
  ないわ。詳しいことは、洋平さんに直接お聞きになった方が良いかもしれませんね。」
- Note: the model's OWN language correctly distinguishes this from a flat "I don't know" (case B) —
  it redirects to Yohei by name, demonstrating that even with one merged classification value, the
  generated text still carries the finer distinction naturally, exactly as
  `ADVERSARIAL_PAPER_SIMULATION_V1.md` Case C predicted. httpStatus 200, latency 5700ms.

## D — OUTSIDE_WORLD_SCOPE

Wildly out-of-world question with no referent in the authored world at all.

- Utterance: 「ところで、宇宙人っているのかな？」
- **classification**: `NPC_KNOWLEDGE_GAP` (observed model choice — see note below)
- **npcResponseIntent**: `ExpressLackOfKnowledge`
- **proposedConsequenceId**: `null`
- **visibleUtterance**: 「宇宙人？ さあな、俺は店のことで手一杯でな。」
- httpStatus 200, latency 11205ms.

### Honest note on this result (not silently repaired)

The intended taxonomy (`BOUNDED_FREE_TEXT_CONVERSATION_V1.md`) reserves `OUT_OF_WORLD_SCOPE` for
questions with literally no referent in the authored world, distinct from `NPC_KNOWLEDGE_GAP`
("this NPC personally doesn't know, but the topic exists"). The model chose `NPC_KNOWLEDGE_GAP`
here instead — a defensible but not exactly-intended classification (aliens could be read either
way: "outside the world" or "not something Yohei would know about"). **This is recorded as an
observed classification-boundary ambiguity, not corrected or re-run to get the "right" label** —
directive Section 4/14 forbid tuning after seeing a result. Structurally, the outcome is still
fully safe: the envelope validated cleanly, no consequence was proposed, and no world fact was
invented — the ambiguity is in which LABEL the model picked among valid options, not in any
authority violation. See `RISK_AND_FALSIFICATION`-style tracking in
`STRATEGIST_VERTICAL_SLICE_AUDIT_PACKET_V1.md` for this as an open item.

## Structural validation across all three

| Case | Envelope well-formed | classification in the 5 authored values | consequence id handling |
|---|---|---|---|
| B | Yes | Yes | `null`, nothing to validate |
| C | Yes | Yes | `null`, nothing to validate |
| D | Yes | Yes | `null`, nothing to validate |

No case produced a system error, a generic chatbot refusal string, or an invented world fact —
directive Section 11's requirement, verified with real model output, not merely designed for.

# AI Necessity Three-State Test V1 — PHASE 12.1

Directive Section 6 (resumed after interruption). Real live Vertex AI output (`gemini-2.5-flash`),
captured by `ai_necessity_live_experiment.mjs`, raw evidence in `ai_necessity_live_evidence.json`.
**These three responses are not pre-authored anywhere in this repository** — this script is the
first and only place they were produced, and the model produced them, not this document's author.
The first valid result is preserved as-is, per directive Section 4's explicit instruction not to
repair prompts after seeing the result.

Same exact PLAYER utterance to Yohei in all three calls: 「手伝おうか？」

## STATE A — alone, task genuinely active

- World-state summary: `洋平は、倉庫の在庫を一人で運ぼうとしている。` (Yohei is trying to move
  warehouse stock alone.) `allowedConsequenceIds: ["YOHEI_HELP_PROMISE"]`.
- **classification**: `IN_SCOPE`
- **npcResponseIntent**: `AcceptHelp`
- **proposedConsequenceId**: `YOHEI_HELP_PROMISE`
- **visibleUtterance**: 「おお、助かる。ちょっとな、これが重くてな。」
- Validation: envelope well-formed; `proposedConsequenceId` matched an authored, currently-allowed
  transition → **committed** (see `UNAUTHORED_SUGGESTION_EVIDENCE_V1.md` for the commit trace).
- httpStatus 200, finishReason STOP, usageMetadata: 735 prompt / 61 candidate / 1929 total tokens
  (1133 thinking tokens).

## STATE B — same task, Jin already covering it

- World-state summary: `洋平は、詰まった倉庫の扉の修理を相馬に頼んでいるところだ。相馬が作業をしている。`
  `allowedConsequenceIds: []` (the consequence is not even offered as a possibility in this state).
- **classification**: `NOT_FEASIBLE_NOW`
- **npcResponseIntent**: `DeclineAssistance`
- **proposedConsequenceId**: `null`
- **visibleUtterance**: 「ああ、大丈夫だよ。相馬さんが見てくれてるから。」
- Validation: `proposedConsequenceId` is `null` — nothing to validate against the allowed-list;
  correctly no commit.
- httpStatus 200, finishReason STOP, usageMetadata: 746 / 52 / 2141 (1343 thinking).

## STATE C — no active task at all

- World-state summary: `洋平は、いつも通り店番をしている。` `allowedConsequenceIds: []`.
- **classification**: `NOT_FEASIBLE_NOW`
- **npcResponseIntent**: `NoImmediateTask`
- **proposedConsequenceId**: `null`
- **visibleUtterance**: 「今は大丈夫だ。いつものことだからな。」
- httpStatus 200, finishReason STOP, usageMetadata: 730 / 48 / 2677 (1899 thinking).

## Behavioral comparison — what does Yohei actually DO/WANT/REQUEST in each state?

| | Accepts help? | Names the actual reason | Consequence |
|---|---|---|---|
| A | **Yes** — asks for the help, states the concrete reason ("it's heavy") | Yes, task-specific | Committed |
| B | No — explicitly declines | **Yes, names 相馬 (Jin) by name** as the specific reason | None |
| C | No — nothing needed | Generic ("as usual"), no task to name | None |

## Critical AI-necessity judgment (directive Section 4)

**Not judged PASS merely because the three Japanese sentences differ.** The judgment criterion
applied: does each response track the ACTUAL distinguishing world fact between the three states,
not just vary in surface wording?

- A vs. B/C: A is the only state where the classification itself changes (`IN_SCOPE` vs.
  `NOT_FEASIBLE_NOW`) and the only one that commits a consequence — this alone is a structural,
  not merely cosmetic, difference.
- B vs. C: both classify `NOT_FEASIBLE_NOW` and both decline, but B's response is the ONLY one that
  names **相馬 (Jin, by name)** as the reason — correctly reflecting the one fact that actually
  differs between B and C (Jin's presence). C's response gives a generic "nothing needed" instead.
  This is the specific test of whether the model tracked the real causal difference rather than
  producing boilerplate: it did.

None of the three responses reduce to "ありがとう、助かる" or an equivalent generic acknowledgment
for all three states — A alone accepts and requests the help; B and C both decline but for
verifiably different, world-fact-grounded reasons.

**AI NECESSITY (this specific test): DEMONSTRATED.**

## Honest caveat

This is a 3-sample, single-run result — not repeated across multiple generations to test
consistency/variance, per directive Section 5's explicit budget constraint ("keep total live calls
<= 30, do not create a large prompt-tuning loop"). A single favorable sample is evidence, not proof
of reliability across many generations; this is recorded as an open item in
`RISK_AND_FALSIFICATION`-style tracking (see `STRATEGIST_VERTICAL_SLICE_AUDIT_PACKET_V1.md`'s
unresolved risks).

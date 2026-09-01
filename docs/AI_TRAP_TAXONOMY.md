# AI_TRAP_TAXONOMY — SPEC AMENDMENT

## Full taxonomy (`AiTrapType`, `src/types/case.ts`)

Used for case-authoring ground truth (`aiTrap.trapType`, `rubric.aiResponseGroundTruth` context):

| Value | Meaning |
|---|---|
| `NONE` | No flaw; the AI's claim (or Socratic question) is fine as stated. |
| `CAUSALITY_ERROR` | Correlation presented as causation. |
| `INTENT_ASSUMPTION` | Assumes a person's motive without evidence. |
| `SMALL_SAMPLE` | Generalizes from too few observations. |
| `OVERGENERALIZATION` | Extends a narrow finding too broadly. |
| `CONFIRMATION` | Only considers evidence that supports the existing conclusion. |
| `OVERCONFIDENCE` | States an uncertain conclusion as if certain. |
| `SYCOPHANCY` | Agrees with what the user seems to want to hear rather than what the evidence supports. |
| `MISSING_INFORMATION` | Draws a conclusion while ignoring an available, relevant piece of information. |
| `PLAUSIBLE_BUT_UNSUPPORTED` | Sounds reasonable but has no actual evidence behind it. |

## In-game selector: a practical subset (Section D)

`AI_TRAP_TAXONOMY_OPTIONS` (`src/data/aiTrapTaxonomy.ts`) exposes only 7 of the 10 values as player-facing
buttons:

根拠不足 (`PLAUSIBLE_BUT_UNSUPPORTED`) / 因果関係の混同 (`CAUSALITY_ERROR`) / 標本不足 (`SMALL_SAMPLE`) /
意図の決めつけ (`INTENT_ASSUMPTION`) / 過度な一般化 (`OVERGENERALIZATION`) / 情報不足
(`MISSING_INFORMATION`) / 問題なし (`NONE`).

`CONFIRMATION`, `OVERCONFIDENCE`, and `SYCOPHANCY` are deliberately **not** offered as selectable options
yet — they are harder for a first-time player to reliably tell apart from the other 7 without more
scaffolding (e.g. worked examples), and adding under-discriminable options would just add noise to
`trapDetection.correctDetection`. They remain valid values for case authors to use as ground truth in a
future case; the selector can be extended once there's a case that specifically needs one of them.

## Used for two different things depending on case type

The same selector (`AiInterventionScreen`) is shown on every case, but its target differs:

- **`AI_CALIBRATION` cases** (CASE-005): "このAIの発言について、気になる点はありますか？" — the player is
  critiquing the in-fiction AI's claim. Compared against `caseData.aiTrap.trapType` via
  `RubricResult.trapDetection`.
- **`TRAINING` cases** (CASE-001〜004, no evaluable AI claim): "自分の最初の考えについて、気になる点はあり
  ますか？" — the player self-critiques their *own* first-decision reasoning. There is no
  `aiTrap.trapType` ground truth to compare against (`trapDetection.applicable` is `false`), but the
  selection still feeds `abilityObservations.falsificationConsidered` (a non-`NONE` selection means they
  identified a potential weakness) — see `docs/RUBRIC_DESIGN.md`.

This reuse is a deliberate scope decision: it gives every case a structured FALSIFICATION signal
(Section D's "structured action first" principle) without needing a bespoke widget per case type.

## MVP constraint: all traps are pre-authored

Every `aiTrap` value is fixed, safe, human-authored case data. No generative model produces the flawed
claim dynamically, and none is planned while this app has no LLM integration (`docs/DECISIONS.md`,
`docs/SAFETY_PRINCIPLES.md`). `data.test.ts` asserts exactly one case (`CASE-005`) has `aiTrap.present`.

## Trap-rate experiment (Section F) — data shape only

`aiTrap` fields plus `TrajectoryLog.experimentGroup` are structured to support a future rollout where the
fraction of sessions containing a trap case varies by group (`TRAP_RATE_10` / `TRAP_RATE_25` /
`TRAP_RATE_40`). No such variation is served in this MVP; `experimentGroup` is always
`"CONTROL_NO_AB_TEST_V0"`. See H2 in `docs/VALIDATION_PLAN.md`.

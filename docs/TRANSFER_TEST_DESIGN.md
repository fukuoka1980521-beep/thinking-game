# TRANSFER_TEST_DESIGN — SPEC AMENDMENT (Section L)

## Status: designed, not implemented this Run

Section T explicitly permits deferring everything except CASE-001's full implementation this Run.
TRANSFER-001 and TRANSFER-002 are designed below in enough detail to implement later, but are **not**
present as playable `CaseData` yet, and are not selectable from CASE_SELECT. `RubricDefinition.transferTarget`
on every shipped case already points at one of these two ids, so wiring them in later does not require
touching the existing 5 cases again.

## Why transfer, not just repeated training

Section L's concern: improving at 5 fixed stories could just mean "learned these 5 stories," not "learned
observation / hypothesis generation / falsification / updating as transferable skills." A TRANSFER case
tests the same underlying rubric structure on a **different surface topic**, so genuine skill transfer can
be told apart from memorizing the training set.

`docs/VALIDATION_PLAN.md` (H4) is the hypothesis this exists to test, and
`src/engine/growthAggregator.ts` already excludes `caseType: "TRANSFER"` logs from the regular Growth
stats (`excludeTransfer`), so wiring in real TRANSFER cases later will not silently pollute the existing
ability percentages.

## TRANSFER-001 (target skill: OBSERVATION / FALSIFICATION — mirrors CASE-001 and CASE-003)

- **Surface topic:** A news app's push notification claims "利用者の8割がこの新機能を高評価" for a feature
  you personally find confusing.
- **Underlying structure:** A number is presented as a settled fact; whether it is measured fairly (sample,
  question wording, time window) is not stated. Mirrors CASE-001's fact/interpretation split and CASE-003's
  "don't treat a judgmental conclusion as a confirmed fact" critical error.
- **Rubric sketch:** `observableBehavior` = "アプリ内に「8割が高評価」という通知が表示された";
  `criticalError` = 数字をそのまま鵜呑みにして「みんな良いと思っている」と断定する;
  `evidenceSupportsChoiceId`-equivalent evidence = 調査方法（対象者・質問文）に偏りがあったことが判明する。
- **transferTarget source cases:** `CASE-001`, `CASE-003`, `CASE-005`.

## TRANSFER-002 (target skill: HYPOTHESIS / UPDATING — mirrors CASE-002 and CASE-004)

- **Surface topic:** A product you sell gets a sudden wave of 1-star reviews in one day.
- **Underlying structure:** Multiple plausible causes exist (a shipping problem, a competitor's smear
  campaign, a genuine defect, a review-bombing incident unrelated to the product) before any evidence
  narrows it down. Mirrors CASE-002's hypothesis-diversity requirement and CASE-004's "revise on
  person-specific new information" structure.
- **Rubric sketch:** `infoOptions` should include both diagnostic items (shipping tracking data, review
  content patterns) and distractors (unrelated general market sentiment); `evidenceSupportsChoiceId`-
  equivalent evidence = レビュー本文に共通する具体的な破損状況の記述が見つかる（配送問題を支持）。
- **transferTarget source cases:** `CASE-002`, `CASE-004`.

## Implementation notes for the next Run

- Both should be `caseType: "TRANSFER"`, `riskLevel: "low"`, and follow the exact same screen sequence as
  every other case (no new UI needed — `CaseSession.tsx` and all screens are already case-type-agnostic
  except for the AI_CALIBRATION-only ACCEPT/VERIFY/HOLD/REJECT control).
- They should **not** appear in the "今日の1問" rotation or CASE_SELECT list by default, to avoid confusing
  a first-time player with what looks like an unrelated 6th/7th case — a small filter on `CASES` by
  `caseType !== "TRANSFER"` for those two entry points is the likely implementation, with a separate
  "TRANSFER" flag or hidden entry point for whoever is running the H4 comparison.
- GrowthScreen should not surface transfer results in the main ability bars (already guaranteed at the
  aggregator level); a next Run should decide whether to surface them at all in the UI, or keep them
  logs-only for manual/researcher inspection until H4 has a real answer.

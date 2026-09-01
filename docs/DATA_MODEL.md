# DATA_MODEL — 思考整理ゲーム MVP v0.1

> **SPEC AMENDMENT適用済み**：CaseDataにrubric・infoOptions・level・caseType等を追加し、
> 完了ログをThinkingLogからTrajectoryLog（判断軌跡スキーマ）へ置き換えた。フィールドの詳細な意味と
> 設計意図は `docs/RUBRIC_DESIGN.md`（CaseData側）と `docs/TRAJECTORY_SCHEMA.md`（ログ側）を参照。
> 本ファイルは全体の見取り図としてのみ機能する。

## CaseData（`src/types/case.ts`）

ケースはReactコンポーネントへ直接ハードコードせず、`src/data/cases/*.ts` に独立したデータとして定義する。
将来的にはCASE DATAの追加だけでケースを増やせる構造を優先している。

主なフィールド群（完全な定義は `src/types/case.ts` を正とする）：

- **識別・分類**：`caseId` / `title` / `category` / `difficulty` / `level`（1-5、TRANSFERは0） / `caseType`
  （TRAINING / MEASUREMENT / AI_CALIBRATION / TRANSFER / OPEN_ENDED） / `version` / `riskLevel`
- **能力・キャラクター**：`abilityTargets` / `aiCharacter` / `characterOffered` /
  `characterChoiceAvailable`（本MVPでは常にfalse） / `aiTrap`（`AiTrapInfo`）
- **提示内容**：`initialSituation` / `initialQuestion` / `availableChoices` / `factCheck` /
  `infoOptions`（構造化「重要な情報」チェックリスト） / `confidencePrompt` / `aiIntervention` /
  `falsificationPrompt`（補助的自由記述プロンプト） / `newFacts`（常に1件） / `finalQuestion`
- **評価根拠**：`rubric`（`RubricDefinition`。詳細は `docs/RUBRIC_DESIGN.md`。
  `aiResponseGroundTruth`が非nullかどうかがAI応答UIの分岐条件で、`caseType`からは独立している） /
  `reflectionPoints`（RESULT画面用の事前定義文、`docs/GAME_DESIGN.md`）

## セッション中の一時データ（`src/types/log.ts`）

- `ObservedFactInput`：事実／解釈の分類
- `FirstDecisionInput`：第一判断（`choiceId` / `confidence` / `reason`（任意） / `infoOptionsSelected`）
- `AiActionInput`：AIへの応答（`playerAction`（評価可能な主張があるケースのみ） / `problemTypeSelected` /
  `freeText`（任意））
- `SecondDecisionInput`：再判断（`choiceId` / `confidence` / `reason`（任意））
- `InProgressSession`：上記に加えて `sessionId` / `caseId` / `screen` / `startedAt` / `playRunId`
  （このケースがどのプレイランに属するか、Section 5/7） / `reflectionNote` を持ち、リロード耐性のために
  `localStorage`（`thinking-game:in-progress:v2`）へ都度保存される。

## TrajectoryLog（完了したケースの記録）

完了したケースは `TrajectoryLog`（`docs/TRAJECTORY_SCHEMA.md` に全フィールドの説明あり）として
`thinking-game:completed-logs:v2` に保存される。旧 `ThinkingLog`（v1）とは非互換で、移行は行わない
（ローカルの練習履歴であり、失われても実害がないため）。

中心となる評価結果は `RubricResult`（`observationCorrect` / `criticalErrorMade` / `infoOptionsConsidered` /
`infoOptionsMatchedGroundTruth` / `updateAppropriateness` / `aiCalibration` / `trapDetection`）。
`AbilityObservations` はGrowth Aggregator向けの橋渡し用フィールドで、`RubricResult` から導出される
（自由記述からは導出しない）。

## 保存先

- `thinking-game:in-progress:v2` — 未完了セッション1件（`InProgressSession`）
- `thinking-game:completed-logs:v2` — 完了済み `TrajectoryLog` の配列
- `thinking-game:metrics:v1` — ファネルイベント（`MetricEvent[]`：CASE_START / CASE_COMPLETE /
  NEXT_CASE_CLICK / SESSION_COMPLETE / USER_TEST_SUBMITTED、`src/lib/metrics.ts`）
- `thinking-game:user-test-responses:v1` — 任意アンケート回答（`UserTestResponse[]`、
  `src/lib/userTestResponses.ts`）

いずれも `localStorage` にのみ保存し、外部送信は行わない（`docs/DATA_BOUNDARY.md`、
`docs/USER_TEST_GUIDE.md` に取り出し方法を記載）。

## GROWTH集計

`src/engine/growthAggregator.ts` の `computeGrowthStats` / `computeRecentGrowthStats`
（直近10件、`docs/GAME_DESIGN.md`）が能力ごとの「該当件数 / 完了ケース数」を算出する。
`computeAiActionDistribution` が、評価可能なAIの主張を含むケース（`caseType`を問わず）での
ACCEPT/VERIFY/HOLD/REJECT分布を算出する。`caseType: "TRANSFER"` のログは4能力の集計からのみ除外される
（Section L、`docs/TRANSFER_TEST_DESIGN.md`）。

## SESSION SUMMARY / METRICS（本Run追加）

`src/engine/sessionSummary.ts` の `computeSessionSummary(logs, playRunId)` が、1プレイラン分の
`TrajectoryLog` から `SessionSummary`（`reconsidered` / `maintained` / `verifiedAi` / `rejectedAi` /
`choseUncertain`）を算出する。`choseUncertain` の判定には、対象ケースの `rubric.uncertaintyChoiceId`
を静的なCASE DATAから参照する（ログ自体には持たせていない）。

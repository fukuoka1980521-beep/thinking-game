# FUTURE_IDEAS — 思考整理ゲーム（NOW_NOT_IMPLEMENT）

FEATURE GATEの判定基準（面白さ／思考成長への寄与／AI依存を増やさないか／初心者が理解できるか／
問い合わせ増加要因にならないか／保守負荷／既存構造への影響／3人以上に共通の価値）を満たさない、
または今回のスコープ外と判断したものをここに記録する。

## REAL QUEST（仕様のみ、`NOW_NOT_IMPLEMENT`）

利用者自身の現実の問題を、次の7段階に変換して取り組む将来機能。

```
事実 → 解釈 → 複数仮説 → 反証条件 → 確認方法 → 最小行動 → 現実結果
```

理由：MVPでは「ゲーム構造自体が面白いか」の検証を優先するため。詳細は `docs/DECISIONS.md`。
データの扱い方の原則は先取りして `docs/DATA_BOUNDARY.md` に記載済み（実装は未着手）。

## CALIBRATION V2（`NOW_NOT_IMPLEMENT`、PLAYABLE_VALIDATION_BUILD Section 3）

将来候補：AI QUALITY × PLAYER ACTION × EPISTEMIC CONTEXT。CORRECT AIに対するVERIFY/HOLDも、
状況（時間的余裕・重要度・すでに何度も同種の主張を検証済みか等）によっては合理的にも過剰検証にも
なり得る。現在の2軸マトリクス（`docs/AI_CALIBRATION.md`）ではこれを区別できない。明示的に
`NOW_NOT_IMPLEMENT`。

## 前々Run（rubric導入）からの未実装項目 — 実装済み・訂正されたもの

- ~~TRANSFER-001 / TRANSFER-002~~ → 実装済み（`docs/TRANSFER_TEST_DESIGN.md`）。
- ~~2件目・3件目のAI_CALIBRATIONケース（CORRECT/UNCERTAIN）~~ → PLAYABLE_VALIDATION_BUILD Runで
  「TRANSFER-001（CORRECT）・TRANSFER-002（UNCERTAIN）が兼ねる」としていたが、
  FIRST_CASE_AND_CALIBRATION_SEMANTICS Runの監査でTRANSFER-001は実際にはソクラテス式の問いだったと
  判明し、CORRECT品質としては訂正・撤回した。現在はTRANSFER-002（UNCERTAIN）のみが実装済みで、
  CORRECT品質のケースは未着手（下記「本物のCORRECT品質ケースの新規作成」を参照）。
- ~~実ブラウザでのスマートフォン横スクロール目視確認~~ → Claude in Chrome拡張が複数Run連続で未接続
  だったため、Playwrightを用いた自動スクリーンショット確認に切り替えて実施済み（`docs/TEST_PLAN.md`）。

## FIRST_CASE_AND_CALIBRATION_SEMANTICS Run（本Run）で新たに記録した候補

### 本物のCORRECT品質ケースの新規作成

現在、Calibration対象（`isCalibrationEligible`）はCASE-005（INCORRECT）とTRANSFER-002（UNCERTAIN）の
2件のみで、CORRECT品質の対象が0件（`docs/AI_CALIBRATION.md`）。H2の厳密な検証
（「誤ったAI主張の経験後、正しいAI主張まで過剰拒否しないか」）には、AI/分析ツールへ明示的に帰属された、
検証すると実際に正しいと判明する主張を持つケースが新たに必要。既存ケースの書き換えではなく、
新規ケースとして１件（最大7→8ケースへの拡張は今回禁止のため、次Run以降で数の扱いを含めて検討）。

### CASE-002〜004への「まだ判断できない」選択肢の追加

本RunはCASE-001のみに追加した（Section 11がCASE-001に限定して要求したため）。同様の選択肢は
CASE-002〜004にも自然に追加できる可能性があるが、既存の選択肢セット・rubric整合性への影響を
慎重に検討する必要があり、今回はスコープ外とした。

### ケース表示順のランダム化・A/Bフレームワーク

現在`CASES`配列は固定順（`docs/VALIDATION_PLAN.md` の Confounds セクション）。ケース内容と
提示順（＝離脱位置）が交絡しているが、ランダム化・A/Bテスト基盤は本Runでも明示的に禁止・未実装
（Section 17/18）。

## 本Runでもなお未実装のもの

### キャラクターの部分的・自由選択（Section H、LEVEL 4-5）

引き続きシステム割り当てのまま（`characterChoiceAvailable: false`）。`characterOffered` はログに
記録済みなので、選択制を導入してもデータ移行は不要（H3、`docs/VALIDATION_PLAN.md`）。

### Trap rate A/Bテストの実配信

`experimentGroup` フィールドはデータ構造として用意済み（常に`"CONTROL_NO_AB_TEST_V0"`）だが、
実際のグループ振り分け・配信ロジックは未実装。

### GrowthScreenでのCalibration Matrix全内訳表示

現在はACCEPT/VERIFY/HOLD/REJECTの件数分布のみ表示。`appropriate_reliance` 等8種類のラベル別内訳は
`TrajectoryLog.rubricResult.aiCalibration` に記録済みだが、画面には未反映（データはあるが表示していない）。

### ユーザーテスト・メトリクスの自動集計ダッシュボード

`管理画面`はDO_NOT_IMPLEMENT。現状は `docs/USER_TEST_GUIDE.md` の手順でdevtoolsから手動確認する。
テスト協力者数が増えた場合、この手動確認は現実的でなくなる可能性がある。

### H4（TRANSFER転移）の自動比較

TRANSFER-001/002は実装済みだが、「TRAINING平均 vs TRANSFER結果」の比較自体はまだ計算・表示していない
（`docs/VALIDATION_PLAN.md` H4）。

## その他の見送り項目

- 8ケース以上への拡張：7ケースの完成度を優先するため見送り（Section 1）。
- PERSPECTIVE / CAUSALITY / DECISION の3能力：OBSERVATION / HYPOTHESIS / FALSIFICATION / UPDATINGの
  4能力に絞る。CASE-005・TRANSFER-001/002はBASIC CAUSALITYの要素（相関と因果の混同等）を含むが、
  独立したCAUSALITY能力としては集計していない。
- Service Workerによるオフラインキャッシュ・完全なPWA化：複雑さが増すため、`manifest.json` と
  ビューポート設定のみに留めた。
- ケース選択のランキング・共有機能・通知・ストリーク：SNS・PvP・ランキング等は禁止事項に該当
  （Section 15）。
- 生成AI APIの接続：`docs/DECISIONS.md` を参照。

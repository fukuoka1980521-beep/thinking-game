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

## CALIBRATION（AIへの適正信頼の測定）— SPEC AMENDMENTにより実装済み

旧版でここに「将来候補」として記載していたAI CALIBRATION（AI提案を採用した／検証した／保留した／
拒否した、AIが正しい場合に採用できたか、問題がある場合に拒否できたか）は、SPEC AMENDMENTにより
CALIBRATION MATRIXとして実装済み。詳細は `docs/AI_CALIBRATION.md`。以下は、実装後もなお残る未実装部分。

### TRANSFER-001 / TRANSFER-002（`NOW_NOT_IMPLEMENT`、設計のみ完了）

`docs/TRANSFER_TEST_DESIGN.md` に2ケース分の設計を記載。Section Tが「最初に完全実装するのはCASE-001の
みでよい」と明示的に許容しているため、本Runではプレイ可能なデータとしては実装していない。
次Runの最有力候補（H4検証に必須、`docs/VALIDATION_PLAN.md`）。

### 2件目のAI_CALIBRATIONケース（`aiResponseGroundTruth: "CORRECT"`）

H2（`docs/VALIDATION_PLAN.md`）の検証には、AIの提案が正しいケースも必要。CASE-005は
`aiResponseGroundTruth: "INCORRECT"` の1件のみのため、「AI罠を経験した後、正しいAI提案まで拒否するように
ならないか」を測定できない。次Run候補。

### キャラクターの部分的・自由選択（Section H、LEVEL 4-5）

本MVPは全レベルでキャラクターをシステム割り当てのまま据え置いた（`characterChoiceAvailable: false`）。
`characterOffered` はログに記録済みなので、選択制を導入してもデータ移行は不要。

### Trap rate A/Bテストの実配信

`experimentGroup` フィールドはデータ構造として用意済み（常に`"CONTROL_NO_AB_TEST_V0"`）だが、
実際のグループ振り分け・配信ロジックは未実装。

### GrowthScreenでのCalibration Matrix全内訳表示

現在はACCEPT/VERIFY/HOLD/REJECTの件数分布のみ表示。`appropriate_reliance` 等12種類のラベル別内訳は
`TrajectoryLog.rubricResult.aiCalibration` に記録済みだが、画面には未反映（データはあるが表示していない）。

## その他の見送り項目

- 30ケース以上への拡張：5ケースの完成度を優先するため見送り（TRANSFER含めても7ケースまで、Section T）。
- PERSPECTIVE / CAUSALITY / DECISION の3能力：本MVPはOBSERVATION / HYPOTHESIS / FALSIFICATION /
  UPDATINGの4能力に絞る。CASE-005はBASIC CAUSALITYの要素（相関と因果の混同）を含むが、独立した
  CAUSALITY能力としては集計していない。
- Service Workerによるオフラインキャッシュ・完全なPWA化：複雑さが増すため、`manifest.json` と
  ビューポート設定のみに留めた。
- ケース選択のランキング・共有機能：SNS・PvP・ランキングは禁止事項に該当。
- 生成AI APIの接続：`docs/DECISIONS.md` を参照。
- 実ブラウザでのスマートフォン横スクロール目視確認：本Runでもブラウザ拡張が未接続だったため
  未実施（前Runから持ち越し）。次回セッションでの優先確認事項とする。特にFIRST DECISION・
  AI INTERVENTION画面は選択肢が増えたため、優先して確認すること。

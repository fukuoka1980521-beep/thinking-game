# TEST_PLAN — 思考整理ゲーム MVP v0.1

> **SPEC AMENDMENT適用済み**：Section Wの追加検査項目（Calibration Matrix・trap taxonomy・
> update appropriateness・dialogue/evaluation分離・TRANSFER非混入）をすべてテストに追加した。

## 自動テスト（`npm run test` / vitest, 59件）

| # | 確認項目 | テストファイル |
|---|---|---|
| 1 | 5ケースすべて存在し、IDが一意 | `tests/data.test.ts` |
| 2 | 各ケースが最低限のCASE DATAフィールドを持つ | `tests/data.test.ts` |
| 3 | 人格診断・AI信頼度系フレーズがケースデータに含まれない | `tests/data.test.ts` |
| 4 | AI TRAPはCASE-005のみに存在し、解説文を持つ | `tests/data.test.ts` |
| 5 | 4能力すべてがいずれかのケースの対象になっている | `tests/data.test.ts` |
| 6 | LEVEL 1-5が一意に割り当てられている | `tests/data.test.ts` |
| 7 | caseTypeが有効な値で、AI_CALIBRATIONは1件のみ | `tests/data.test.ts` |
| 8 | `aiResponseGroundTruth` はAI_CALIBRATIONケースのみ非null | `tests/data.test.ts` |
| 9 | rubricの必須フィールドがすべて定義されている | `tests/data.test.ts` |
| 10 | rubricが参照するchoice/infoOption idが実在する | `tests/data.test.ts` |
| 11 | aiTrapのフィールド整合性（presentとtrapType/groundTruth/appropriateActionの対応） | `tests/data.test.ts` |
| 12 | 全ケースでキャラクターがシステム割り当て（`characterChoiceAvailable: false`） | `tests/data.test.ts` |
| 13 | `localStorage` の未完了セッションの保存・復元・削除 | `tests/storage.test.ts` |
| 14 | ケース間でのin-progressデータ混入なし（後勝ち・非マージ） | `tests/storage.test.ts` |
| 15 | 完了ログ（TrajectoryLog）の追記（既存ログを消さない） | `tests/storage.test.ts` |
| 16 | 破損データからのクラッシュしない復旧 | `tests/storage.test.ts` |
| 17 | observationCorrect / criticalErrorMade の構造化算出 | `tests/evaluationEngine.test.ts` |
| 18 | updateAppropriateness：正しいKEEPを評価、変更だけを高評価にしない | `tests/evaluationEngine.test.ts` |
| 19 | AI QUALITY×PLAYER ACTIONのCalibration Matrix全パターン | `tests/evaluationEngine.test.ts` |
| 20 | 正しいAIを拒否／誤ったAIを採用は高評価にならない | `tests/evaluationEngine.test.ts` |
| 21 | 不確実AIの検証が適切に記録される | `tests/evaluationEngine.test.ts` |
| 22 | trap typeがground truthと一致するかの判定 | `tests/evaluationEngine.test.ts` |
| 23 | 自由記述・dialogue内容が評価結果を左右しない（同一入力で結果が変わらないことを確認） | `tests/evaluationEngine.test.ts` |
| 23a | Dialogue Engineがケース文面をそのまま返し、改変しないこと（実際に呼び出されている確認） | `tests/dialogueEngine.test.ts` |
| 24 | RESULTの良い点／確認点が空にならない、正解・不正解表現を含まない | `tests/evaluationEngine.test.ts` |
| 25 | 成長集計（全期間・直近10件）の計算 | `tests/growthAggregator.test.ts` |
| 26 | AI action分布（ACCEPT/VERIFY/HOLD/REJECT）の集計 | `tests/growthAggregator.test.ts` |
| 27 | TRANSFER型ログが通常のGrowth集計へ混入しない | `tests/growthAggregator.test.ts` |
| 28 | 外部通信（fetch/XHR/WebSocket）が存在しない | `tests/safety.test.ts` |
| 29 | 生成AI APIパッケージ・APIキーが存在しない | `tests/safety.test.ts` |
| 30 | AI信頼度／親密度等の単一スコア概念が実装されていない | `tests/safety.test.ts` |
| 31 | 5ケースすべてを最後まで完走できる（TRAINING/AI_CALIBRATION双方をE2E） | `tests/flow.test.tsx` |
| 32 | OBSERVED FACT・第一判断・AI介入・PLAYER AI ACTION・追加情報・再判断・RESULT表示 | `tests/flow.test.tsx` |
| 33 | 戻る操作で入力済みデータが保持される（状態破損なし） | `tests/flow.test.tsx` |
| 34 | リロード後の進行復元（HOMEの「続きから再開する」） | `tests/flow.test.tsx` |
| 35 | ケース切り替え時にデータが混入しない | `tests/flow.test.tsx` |
| 36 | GROWTH反映が完了ログと一致する | `tests/flow.test.tsx` |
| 37 | AI_CALIBRATIONケースでAI action未選択のまま進行できない | `tests/flow.test.tsx` |

上記で、仕様の「TEST」節の確認事項に加え、SPEC AMENDMENT Section Wの追加検査項目
（Calibration Matrixの適正性、trap taxonomyの一致判定、update appropriatenessでの合理的KEEP評価、
dialogue/evaluation分離、free textからの能力判定禁止、TRANSFER非混入）をすべてカバーしている。

## 手動・コードレビューによる確認

以下は自動テストで機械的に保証しにくいため、コードレビューで確認した。

- **スマートフォン幅で横スクロールなし**：`src/styles/global.css` で `html, body { overflow-x: hidden }`、
  `#root { max-width: 480px }`、ボタン等はすべて `width: 100%` かつ `box-sizing: border-box` を確認。
  ブラウザ拡張機能（Claude in Chrome）が本セッションでは未接続だったため、実機ブラウザでの目視確認は
  未実施。次Runでの優先確認事項とする（`docs/FUTURE_IDEAS.md`）。
- **タップしやすいボタンサイズ**：主要ボタンは `min-height: 48px` を確認。画面あたりの選択肢が増えた
  （FIRST DECISIONの情報チェックリスト、AI INTERVENTIONの気になる点7択など）ため、縦スクロールが
  前提の設計になっていることを確認。横スクロールには影響しない。
- **5ケースの内容が政治・宗教・医療・犯罪等の高リスク題材を含まないこと**：全ケースの本文を目視確認。
- **Section WのTRANSFER未実装に伴う整合性**：`CASES` 配列にTRANSFER型ケースが存在しないため、
  「TRANSFER結果を通常training scoreへ混入しない」は現状のデータでは発火しないが、
  `growthAggregator.ts` のフィルタと専用テストで将来のケース追加に備えている。

## 実行結果

`npm run typecheck` / `npm run build` / `npm run test`（58件）はいずれもPASS（実行ログはCLOSE報告を参照）。

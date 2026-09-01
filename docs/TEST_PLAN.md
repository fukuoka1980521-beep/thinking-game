# TEST_PLAN — 思考整理ゲーム PLAYABLE_VALIDATION_BUILD_V0_1

> **SPEC AMENDMENT適用済み（2段階）**：Section Wの追加検査項目に加え、本Run（Section 13）の
> 追加検査項目（7ケースロード・NEXT_CASE遷移・session summary・user test回答保存・TRANSFER除外・
> AI quality balance検査・320pxでの横overflowなし）をすべて追加した。

## 自動テスト（`npm run test` / vitest, 75件）

| # | 確認項目 | テストファイル |
|---|---|---|
| 1 | 7ケースすべて存在し、IDが一意（CASE-00N / TRANSFER-00N） | `tests/data.test.ts` |
| 2 | 各ケースが最低限のCASE DATAフィールドを持つ | `tests/data.test.ts` |
| 3 | 人格診断・AI信頼度系フレーズがケースデータに含まれない | `tests/data.test.ts` |
| 4 | 内部用語（rubric/calibration matrix/trajectory/ground truth/falsification）が player-facing テキストに出ない | `tests/data.test.ts` |
| 5 | AI TRAPはCASE-005のみに存在し、解説文を持つ | `tests/data.test.ts` |
| 6 | 4能力すべてがいずれかのケースの対象になっている | `tests/data.test.ts` |
| 7 | ラダーの5ケースがLEVEL 1-5、TRANSFER 2件がLEVEL 0 | `tests/data.test.ts` |
| 8 | caseTypeが有効な値で、TRANSFERは2件のみ | `tests/data.test.ts` |
| 9 | `aiResponseGroundTruth` はTRAININGケースで必ずnull（TRANSFERは非nullも許容） | `tests/data.test.ts` |
| 10 | **AI品質バランス**：CORRECT/UNCERTAIN/INCORRECTが最低1件ずつ存在する | `tests/data.test.ts` |
| 11 | AI品質・トラップ有無がplayer-facingテキストに出ない | `tests/data.test.ts` |
| 12 | rubricの必須フィールドがすべて定義されている | `tests/data.test.ts` |
| 13 | rubricが参照するchoice/infoOption/uncertaintyChoice idが実在する | `tests/data.test.ts` |
| 14 | aiTrapのフィールド整合性 | `tests/data.test.ts` |
| 15 | 全ケースでキャラクターがシステム割り当て | `tests/data.test.ts` |
| 16 | `localStorage` の未完了セッションの保存・復元・削除、playRunId込み | `tests/storage.test.ts` |
| 17 | ケース間でのin-progressデータ混入なし | `tests/storage.test.ts` |
| 18 | 完了ログ（TrajectoryLog）の追記 | `tests/storage.test.ts` |
| 19 | 破損データからのクラッシュしない復旧 | `tests/storage.test.ts` |
| 20 | observationCorrect / criticalErrorMade の構造化算出 | `tests/evaluationEngine.test.ts` |
| 21 | updateAppropriateness：正しいKEEPを評価、変更だけを高評価にしない | `tests/evaluationEngine.test.ts` |
| 22 | AI QUALITY×PLAYER ACTIONのCalibration Matrix全パターン | `tests/evaluationEngine.test.ts` |
| 23 | 正しいAIを拒否／誤ったAIを採用は高評価にならない | `tests/evaluationEngine.test.ts` |
| 24 | 不確実AIの検証が適切に記録される | `tests/evaluationEngine.test.ts` |
| 25 | trap typeがground truthと一致するかの判定 | `tests/evaluationEngine.test.ts` |
| 26 | 自由記述・dialogue内容が評価結果を左右しない | `tests/evaluationEngine.test.ts` |
| 27 | Dialogue Engineがケース文面をそのまま返す | `tests/dialogueEngine.test.ts` |
| 28 | RESULTの良い点／確認点が空にならない、正解・不正解表現を含まない | `tests/evaluationEngine.test.ts` |
| 29 | 成長集計（全期間・直近10件）の計算 | `tests/growthAggregator.test.ts` |
| 30 | AI action分布が`caseType`非依存で集計される（TRANSFERも含む） | `tests/growthAggregator.test.ts` |
| 31 | TRANSFER型ログが4能力の集計へ混入しない | `tests/growthAggregator.test.ts` |
| 32 | セッション振り返り（reconsidered/maintained/verifiedAi/rejectedAi/choseUncertain）の算出 | `tests/sessionSummary.test.ts` |
| 33 | プレイランIDでのログ絞り込み | `tests/sessionSummary.test.ts` |
| 34 | ファネルイベント（CASE_START等）の記録・順序保持 | `tests/metrics.test.ts` |
| 35 | 破損メトリクスデータからのクラッシュしない復旧 | `tests/metrics.test.ts` |
| 36 | ユーザーテスト回答の保存・追記・local-only | `tests/userTestResponses.test.ts` |
| 37 | 外部通信（fetch/XHR/WebSocket）が存在しない | `tests/safety.test.ts` |
| 38 | 生成AI APIパッケージ・APIキーが存在しない | `tests/safety.test.ts` |
| 39 | AI信頼度／親密度等の単一スコア概念が実装されていない | `tests/safety.test.ts` |
| 40 | 7ケースすべてを最後まで完走できる（TRAINING/AI_CALIBRATION双方をE2E） | `tests/flow.test.tsx` |
| 41 | OBSERVED FACT・第一判断・AI介入・PLAYER AI ACTION・追加情報・再判断・RESULT表示 | `tests/flow.test.tsx` |
| 42 | 戻る操作で入力済みデータが保持される | `tests/flow.test.tsx` |
| 43 | リロード後の進行復元 | `tests/flow.test.tsx` |
| 44 | ケース切り替え時にデータが混入しない | `tests/flow.test.tsx` |
| 45 | GROWTH反映が完了ログと一致する | `tests/flow.test.tsx` |
| 46 | 評価可能な主張があるケースでAI action未選択のまま進行できない | `tests/flow.test.tsx` |
| 47 | **NEXT_CASE遷移**：RESULTから「次の問題へ」で次ケースのCASE_INTROへ直接進む | `tests/flow.test.tsx` |
| 48 | **session summary**：5ケース区切りで振り返り画面が表示される | `tests/flow.test.tsx` |
| 49 | **user test回答保存**：5問回答→送信→ローカル保存→サンクス画面表示 | `tests/flow.test.tsx` |
| 50 | **TRANSFER自然混入の実測**：実際のcasesローテーションにTRANSFERが混ざり、Growth集計から除外される | `tests/flow.test.tsx` |
| 51 | メトリクス5種（CASE_START/CASE_COMPLETE/NEXT_CASE_CLICK/SESSION_COMPLETE/USER_TEST_SUBMITTED）の記録 | `tests/flow.test.tsx` |
| 52 | UserTestScreen：5問すべて回答するまで送信不可 | `tests/flow.test.tsx` |

上記で、仕様の「TEST」節の確認事項に加え、SPEC AMENDMENT Section Wおよび本Run Section 13の
追加検査項目をすべてカバーしている。

## モバイル横幅の確認（Playwrightによる自動確認、Section 12/14）

これまで2回のRunでClaude in Chrome拡張機能が未接続だったため、本Runでは代わりに
`playwright`（devDependency、`chromium`同梱）を一時的にインストールし、`npm run dev` で起動した
アプリに対して以下を自動実行した。

- 幅 320 / 375 / 390 / 430px の4パターンで、HOME → CASE INTRO → OBSERVED FACT → FIRST DECISION →
  AI INTERVENTION まで進め、各画面で `document.documentElement.scrollWidth >
  document.documentElement.clientWidth` を確認 → **全パターンで横overflowなし**。
- 幅320pxで、CASE SELECT → 5ケース完走（NEXT_CASE） → SESSION SUMMARY → USER TEST →
  USER TEST THANKS → GROWTH まで一連の新画面もあわせて確認 → **横overflowなし**。
- 上記のスクリーンショットを目視確認し、文字の折り返し・ボタンの押しやすさ・情報量のバランスに
  問題がないことを確認した（CLOSE報告のMOBILE_QA参照）。

このスクリプトは一時ファイルとして作成し、実行後に削除した（リポジトリには残していない）。
`playwright` は次Run以降も同様の視覚確認に使えるよう `devDependencies` に残した。

## 手動・コードレビューによる確認

- **タップしやすいボタンサイズ**：主要ボタンは `min-height: 48px`。USER TESTの1〜5ボタンは
  `flex: 1` で均等割り、320px幅でも1つあたり約50pxを確保。
- **7ケースの内容が政治・宗教・医療・犯罪等の高リスク題材を含まないこと**：全ケースの本文を目視確認。
- **内部用語の非露出**：自動テストに加え、上記スクリーンショットでも目視確認。

## 実行結果

`npm run typecheck` / `npm run build` / `npm run test`（75件）はいずれもPASS（実行ログはCLOSE報告を参照）。

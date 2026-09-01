# TEST_PLAN — 思考整理ゲーム PLAYABLE_VALIDATION_BUILD_V0_1 / V0_2

> **SPEC AMENDMENT適用済み（4段階）**：Section Wの追加検査項目、PLAYABLE_VALIDATION_BUILD Run
> （7ケースロード・NEXT_CASE遷移・session summary・user test回答保存・TRANSFER除外・
> AI quality balance検査・320pxでの横overflowなし）、FIRST_CASE_AND_CALIBRATION_SEMANTICS Run
> （utteranceType整合性・calibrationEligible分離・priming除去・CASE-001不確実性選択肢・survey改訂）、
> そしてTHINKING_GAME_FIRST_PLAY_COMPREHENSION_AND_RESULT_FEEDBACK Run（ONBOARDING・RESULT decision
> trajectory化・HOME/SESSION_SUMMARYのvisual追加）をすべて追加した。

## THINKING_GAME_FIRST_PLAY_COMPREHENSION_AND_RESULT_FEEDBACK関連の追加テスト（本Run、`tests/onboarding.test.tsx` 9件 + `tests/flow.test.tsx` 更新）

| # | 確認項目 | テストファイル |
|---|---|---|
| 64 | 初回プレイでは必ずONBOARDING画面が最初のケースの前に表示される | `tests/onboarding.test.tsx` |
| 65 | ONBOARDINGに思考戦略・ケース内容のpriming語（事実と解釈／因果関係／罠／AIを疑う等）が含まれない | `tests/onboarding.test.tsx` |
| 66 | ONBOARDING完了後、要求されたケースのCASE_INTROへ進み、`hasSeenOnboarding()`がtrueになる | `tests/onboarding.test.tsx` |
| 67 | `ONBOARDING_SHOWN`→`ONBOARDING_COMPLETE`→`CASE_START`の順でイベントが記録され、CASE_START/CASE_COMPLETE自体の意味は変わらない | `tests/onboarding.test.tsx` |
| 68 | 一度完了すれば、以降別のケースを開始してもONBOARDINGは再表示されない | `tests/onboarding.test.tsx` |
| 69 | ONBOARDINGを「戻る」で離脱した場合は`hasSeenOnboarding()`がfalseのまま | `tests/onboarding.test.tsx` |
| 70 | 過去のTrajectoryLogは存在するがONBOARDINGフラグを持たない「既存ユーザー」も、初回は必ずONBOARDINGを見る | `tests/onboarding.test.tsx` |
| 71 | ONBOARDING状態は`thinking-game:onboarding:v1`という独立キーに保存され、TrajectoryLog等のゲームプレイデータと混在しない | `tests/onboarding.test.tsx` |
| 72 | `markOnboardingSeen()`が外部から呼ばれていればONBOARDINGは完全にスキップされる | `tests/onboarding.test.tsx` |
| 73 | CASE-001全体フロー・CASE-005全体フローとも、RESULTに「あなたの判断」（最初の判断→新しい事実→再判断）が実データから表示される | `tests/flow.test.tsx` |
| 74 | RESULTの決定推移は「変更しました／維持しました」の中立語のみで、「変わらなかった」等の失敗枠組みを含まない | `tests/flow.test.tsx` |
| 75 | RESULTに「今回のポイント」としてケース固有の根拠（`aiTrap.explanation`または`rubric.observableBehavior`）が表示される | `tests/flow.test.tsx` |
| 76 | RESULTにINCORRECT/CAUSALITY_ERROR/appropriate_rejection等の内部ラベルが素の文字列として表示されない | `tests/flow.test.tsx` |
| 77 | RESULTに「次回のテーマ」が一切存在しない | `tests/flow.test.tsx` |
| 78 | 既存のCASE-005 Calibration判定（`utteranceType`/`isCalibrationEligible`/trapDetection/aiCalibration分離）・TRANSFER-001のQUESTION非対象扱いは本Runの変更後も無傷（回帰） | `tests/flow.test.tsx`（既存アサーション維持） |
| 79 | User Testの質問文（Q4）更新後も、5問すべて回答するまで送信不可という制約は変わらない | `tests/flow.test.tsx` |

## VISUAL ASSET追加に伴う手動・Playwright確認（本Run、Section 33-41）

- `npx tsc --noEmit` / `npm run build` は追加した2画像（`src/assets/home-welcome-felt.png`、
  `src/assets/session-complete-evening.png`）を含めてPASS。ビルド後の`dist/assets/`にハッシュ付き
  ファイル名で正しく出力されることを確認（GitHub Pagesの`/thinking-game/`サブパス下で参照される
  ファイル名と一致）。
- 開発サーバーに対するPlaywrightで、HOME・SESSION_SUMMARY双方の画像が幅320/375/390/430pxいずれでも
  読み込まれ（`img.complete && naturalWidth > 0`）、横overflowが発生しないことを確認。
- 本番ビルド（`dist/`）を静的サーバーで配信した状態で、HOME画像のリクエストを意図的に失敗させ、
  (1) `onError`により画像要素が`display:none`になる、(2) 主要CTA「今日の1問」が引き続き操作可能、
  (3) 横overflowが発生しない、の3点を確認（＝画像読み込み失敗時もゲーム続行可能）。
- 同じ静的配信環境でHOME→今日の1問クリックまでの通信先を記録し、`localhost`（自ホスト相当）以外への
  通信が発生しないことを確認（NETWORK_PRIVACY_VERIFYの一部）。

## LIVE環境での確認（GITHUB_PAGES_TEST_DEPLOY Run、公開URLに対する実地確認・前Run分）

`https://fukuoka1980521-beep.github.io/thinking-game/` に対して、Playwright（一時スクリプト、
実行後削除）で以下を実施し、いずれも成功を確認した。

- 幅320/375/390/430pxでHOME表示、横overflowなし。
- 幅375px代表で、HOME→今日の1問→CASE INTRO→OBSERVED FACT→FIRST DECISION→AI INTERVENTION→
  NEW FACT→SECOND DECISION→REFLECTION→RESULT→「次の問題へ」まで一連のLIVE遷移を確認、
  各画面で横overflowなし。
- ケース途中でのリロード→「続きから再開する」→中断箇所の画面（AI INTERVENTION）へ正しく復元。
- 5ケース完走後、SESSION SUMMARY（「今回のプレイ」見出し）が正しく表示される。
- ブラウザのconsole error・4xx以上のレスポンスともに0件（JS/CSS/manifestの404なし）。
- セッション中にブラウザが実際に通信したドメインは `fukuoka1980521-beep.github.io` のみ
  （他の外部ドメインへのリクエストは一切発生しなかった＝NETWORK_PRIVACY_VERIFY）。
- `localStorage`に保存されたキーは本アプリ由来の2種類のみ（`thinking-game:metrics:v1`、
  `thinking-game:completed-logs:v2`）で、完了ログ件数もプレイ内容と一致した。

## 自動テスト（`npm run test` / vitest, 86件）

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
| 10 | ~~AI品質バランス：CORRECT/UNCERTAIN/INCORRECTが最低1件ずつ存在する~~ → **SEMANTICS FIX Runで削除**（Section 5が禁止する「3品質1件ずつでPASS」型のテストだったため。正直な分布テストは下記#53参照） | `tests/data.test.ts` |
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
| 53 | **utteranceType**が全7ケースに定義され、値が3種のいずれか（Section 19 #1） | `tests/data.test.ts` |
| 54 | **QUESTIONは常にcalibrationEligible=false**、`aiResponseGroundTruth`の値に関わらず（Section 19 #2） | `tests/data.test.ts` |
| 55 | **AI品質分布はcalibrationEligibleなケースのみで算出**、3品質そろっている必要はない（Section 5）——現状 CORRECT:0 / UNCERTAIN:1 / INCORRECT:1 を固定回帰値として明示 | `tests/data.test.ts` |
| 56 | CASE-005がutteranceType=CLAIM・groundTruth=INCORRECT・trapType=CAUSALITY_ERROR を維持（Section 19 #5） | `tests/data.test.ts` |
| 57 | CASE-001に第三の選択肢（uncertaintyChoiceId）が存在し、criticalError/evidenceSupportsとは別物（Section 11、19 #6/#7） | `tests/data.test.ts` |
| 58 | **calibrationEligible=falseならACCEPT等のラベルを生成しない**（playerActionの有無に関わらずnot_applicable） | `tests/evaluationEngine.test.ts`（`isCalibrationEligible`経由） |
| 59 | **AI action分布はcalibrationEligibleを直接参照**：playerActionが非nullでもcalibrationEligible=falseなら除外（旧TRANSFER-001のバグの再発防止） | `tests/growthAggregator.test.ts` |
| 60 | 旧スキーマ（calibrationEligibleフィールドなし）のログを読んでもクラッシュせず除外扱いになる（Section 19 #14） | `tests/growthAggregator.test.ts` |
| 61 | CASE-001の新選択肢「e」がchoseUncertainとして計上される | `tests/sessionSummary.test.ts` |
| 62 | HOME・AI_INTERVENTION画面（QUESTION/CLAIM双方）にAI不信を煽る文言・常時表示の「AIは常に正しいとは限りません」が存在しない（Section 9/10、19 #8） | `tests/priming.test.tsx` |
| 63 | user-test-responsesのv1→v2キー移行：旧v1データ（`q4Confusion`含む）はv2として読み込まれない | `tests/userTestResponses.test.ts` |

上記で、仕様の「TEST」節の確認事項に加え、SPEC AMENDMENT Section W、PLAYABLE_VALIDATION_BUILD Run
Section 13、およびFIRST_CASE_AND_CALIBRATION_SEMANTICS Run Section 19の追加検査項目をすべてカバーして
いる。

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

## SEMANTICS FIX Runのローカル実地確認（`npm run dev` に対するPlaywright、Section 20）

デプロイ前に、ローカルの開発サーバーへ対して以下を確認した（一時スクリプト、実行後削除）。

- HOME → ケースを選ぶ → CASE-001 → はじめる → OBSERVED FACT → FIRST DECISION（新選択肢「今の情報だけ
  では、まだ判断できない」が表示・選択可能） → AI INTERVENTION（**ACCEPT/VERIFY/HOLD/REJECTウィジェット
  が表示されないことを確認＝QUESTION型として正しく分岐**、常時表示の不信誘導文言が存在しないことも確認）
  → NEW FACT → SECOND DECISION → RESULT → 「次の問題へ」で次ケースのCASE INTROへ遷移。console errorなし。
- CASE-005を実プレイし、AI提案を「拒否する」・気になる点「因果関係の混同」を選択 → 完了ログを直接検査し、
  `rubricResult.aiCalibration = "appropriate_rejection"` と `rubricResult.trapDetection = {applicable:
  true, groundTruthType: "CAUSALITY_ERROR", playerSelectedType: "CAUSALITY_ERROR", correctDetection:
  true}` が**別々のフィールドとして**記録されていることを確認。`aiIntervention.utteranceType = "CLAIM"`、
  `calibrationEligible = true` も確認。
- **TRANSFER-001を実プレイし、ACCEPT/VERIFY/HOLD/REJECTウィジェットが表示されないこと（＝実際のバグ修正
  が効いていること）を直接確認した。**

## 手動・コードレビューによる確認

- **タップしやすいボタンサイズ**：主要ボタンは `min-height: 48px`。USER TESTの1〜5ボタンは
  `flex: 1` で均等割り、320px幅でも1つあたり約50pxを確保。
- **7ケースの内容が政治・宗教・医療・犯罪等の高リスク題材を含まないこと**：全ケースの本文を目視確認。
- **内部用語の非露出**：自動テストに加え、上記スクリーンショットでも目視確認。

## 実行結果

`npm run typecheck` / `npm run build` / `npm run test`（95件＝旧86件＋ONBOARDING9件）はいずれもPASS
（実行ログはCLOSE報告を参照）。

# TEST_PLAN — 思考整理ゲーム PLAYABLE_VALIDATION_BUILD_V0_1 / V0_2

> **SPEC AMENDMENT適用済み（6段階）**：Section Wの追加検査項目、PLAYABLE_VALIDATION_BUILD Run
> （7ケースロード・NEXT_CASE遷移・session summary・user test回答保存・TRANSFER除外・
> AI quality balance検査・320pxでの横overflowなし）、FIRST_CASE_AND_CALIBRATION_SEMANTICS Run
> （utteranceType整合性・calibrationEligible分離・priming除去・CASE-001不確実性選択肢・survey改訂）、
> THINKING_GAME_FIRST_PLAY_COMPREHENSION_AND_RESULT_FEEDBACK Run（ONBOARDING・RESULT decision
> trajectory化・HOME/SESSION_SUMMARYのvisual追加）、THINKING_GAME_PERSONALIZED_DIALOGUE_AND_
> VISUAL_EXPERIENCE Run（CASE-001の構造化シグナルによる個別化ダイアログ）、そして
> THINKING_GAME_REAL_AI_DIALOGUE_CORE_EXPERIENCE Run（Vertex AI Geminiによる実AI対話・同意フロー・
> evaluation firewall回帰）をすべて追加した。

## THINKING_GAME_REAL_AI_DIALOGUE_CORE_EXPERIENCE関連の追加テスト（本Run、5ファイル・25件追加）

| # | 確認項目 | テストファイル |
|---|---|---|
| 90 | エンドポイント未設定（現在のデプロイ状態）では、performDialogueFetchの各失敗パターン（malformed／empty／non-2xx／timeout／network error）を安全に処理し、成功時はメッセージをtrimして返す（Section 25 #5/#9） | `tests/aiDialogueClient.test.ts` |
| 91 | 送信ペイロードに、ケース文面・選択肢・自信度・理由・選択情報・キャラクターの8フィールドのみが含まれ、trajectory・Growth・端末識別子等は一切含まれない（Section 15、データ最小化） | `tests/aiDialogueClient.test.ts` |
| 92 | `DIALOGUE_ENDPOINT_URL`が空の現在のデプロイ状態では、CASE-001でも同意画面が一切表示されず、fetchも一切呼ばれず、これまで通りの構造化フォールバックが即座に表示される（Section 28、回帰防止の要） | `tests/aiDialogueGateDormant.test.tsx` |
| 93 | エンドポイント設定済みの状態で、初回のみ同意画面が表示される（Section 14） | `tests/aiDialogueGate.test.tsx` |
| 94 | 同意しない選択が今後もずっと有効に保存され、通信を一切試みずローカルフォールバックへ進む（Section 16） | `tests/aiDialogueGate.test.tsx` |
| 95 | 同意した場合、実際に呼び出しを行い成功時はモデルの応答をそのまま表示する | `tests/aiDialogueGate.test.tsx` |
| 96 | 呼び出し失敗時は「もう一度試す」「AIなしで続ける」を提示し、内容を静かにすり替えない（Section 16） | `tests/aiDialogueGate.test.tsx` |
| 97 | リトライが実際に再試行し、2回目で成功すれば正しく表示を切り替える | `tests/aiDialogueGate.test.tsx` |
| 98 | 失敗後の「AIなしで続ける」は一時的なもので、同意状態を「declined」に書き換えない（同意画面での明示的な拒否とは区別、Section 16） | `tests/aiDialogueGate.test.tsx` |
| 99 | `TrajectoryLog.aiIntervention.messageSource`が実際の経路（real_ai／personalized_fallback）を正確に記録する（Section 26） | `tests/aiDialogueGate.test.tsx` |
| 100 | CASE-001以外のケースは同意ゲートを一切経由せず、これまで通り静的メッセージへ直行する（回帰） | `tests/aiDialogueGate.test.tsx` |
| 101-102 | 同一の構造化入力（`first`/`aiAction`/`second`）に対し、表示されたAIメッセージが`static`／`real_ai`のどちらでも`rubricResult`・`abilityObservations`・`decisionChanged`・`confidenceChange`が完全に同一。`computeRubricResult`のシグネチャ自体がダイアログ文字列を一切受け取らない構造的保証も確認（Section 17、evaluation firewall） | `tests/evaluationFirewall.test.ts` |
| 103 | `src/lib/aiDialogueClient.ts`以外のフロントエンド全ファイルに`fetch`/`XMLHttpRequest`が存在しない（更新） | `tests/safety.test.ts` |
| 104 | `PersonalizedAiDialogueGate.tsx`が`DIALOGUE_ENDPOINT_URL`未設定時に呼び出しを行わないガード文を持つ（更新） | `tests/safety.test.ts` |
| 105 | 生成AI関連パッケージ名がフロントエンドバンドルに一切参照されない（`functions/dialogue/`はビルド対象外の別デプロイ物である旨を明記して更新） | `tests/safety.test.ts` |

**functions/dialogue/index.js のローカルスモークテスト（コミット対象外の一時スクリプト、Section 25）**：
Vertex AI呼び出し（`getClient()`）に一切到達しない範囲で、OPTIONSプリフライトの204応答・許可オリジンへの
CORSヘッダー付与・許可外オリジンへのCORSヘッダー非付与・GETの405拒否・必須フィールド欠落時の400拒否
（欠落フィールド名を含む）・理由文が400文字を超えた場合の`reason_too_long`拒否・不正なキャラクター名の
`invalid_character`拒否を、モックの`req`/`res`に対して直接検証し、全8項目PASS。**実際のVertex AI呼び出し
そのものは、課金設定待ちのため未検証**（`functions/dialogue/README.md`参照）。

## THINKING_GAME_PERSONALIZED_DIALOGUE_AND_VISUAL_EXPERIENCE関連の追加テスト（前Run、`tests/dialogueEngine.test.ts` 7件追加＋`tests/flow.test.tsx`更新）

| # | 確認項目 | テストファイル |
|---|---|---|
| 80 | `personalizedDialogue`未指定の呼び出しでは、全7ケースとも従来通り静的な`aiIntervention`をそのまま返す（回帰） | `tests/dialogueEngine.test.ts` |
| 81 | CASE-001でプレイヤーの選択肢がラベルとしてメッセージに具体的に反映される（Section 4/17 #1） | `tests/dialogueEngine.test.ts` |
| 82 | プレイヤーが書いた理由文が意味解釈なしでそのまま引用され、未入力なら引用行自体が出ない（Section 17 #2） | `tests/dialogueEngine.test.ts` |
| 83 | プレイヤーが選んだ情報オプションがラベルとして反映され、未選択なら該当行が出ない（Section 4） | `tests/dialogueEngine.test.ts` |
| 84 | 5つの選択肢がそれぞれ異なるメッセージを生成し、どれも静的な`aiIntervention`と一致しない（Section 5、anti-generic contract） | `tests/dialogueEngine.test.ts` |
| 85 | 同じ選択肢でもAIキャラクター（探偵/悪魔/他者視点/参謀）が違えば4通りとも異なるメッセージになる（Section 6/18、差別化） | `tests/dialogueEngine.test.ts` |
| 86 | 選択肢IDに対応する執筆データがない場合、クラッシュせず静的メッセージへ安全にフォールバックする（Section 17 #5相当・authoring-gap安全網） | `tests/dialogueEngine.test.ts` |
| 87 | CASE-001以外の6ケースは、`FirstDecisionInput`を渡しても個別化ダイアログの影響を一切受けない（Section 17 #6） | `tests/dialogueEngine.test.ts` |
| 88 | 個別化メッセージ導入後もCASE-001フルフローが機能し、E2Eでも選択肢ラベル・引用行がAI_INTERVENTION画面に表示される | `tests/flow.test.tsx` |
| 89 | 理由未入力時はE2Eでも引用行が出ない、リロード後も同じ個別化メッセージが復元される | `tests/flow.test.tsx` |

**Evaluation Engineが個別化メッセージを一切消費しないことの確認**：`src/engine/evaluationEngine.ts`は
本Runで一切変更していない（`git diff`で未変更を確認済み）。`computeRubricResult`等の関数シグネチャは
以前から文字列としての`message`を一切受け取っておらず、構造化された`FirstDecisionInput`/`AiActionInput`
/`SecondDecisionInput`のみを消費する。既存の86＋16件（前Run分含む）の計算ロジック系テストが無変更で
全てPASSしていることが、この分離が壊れていないことの直接的な回帰証拠である。

**API秘密情報・外部通信が存在しないことの確認**：`tests/safety.test.ts`（3件、既存）が`src/`全体を
静的スキャンし、`fetch`/`XMLHttpRequest`/`WebSocket`・生成AI SDK参照・APIキー/Bearerトークンの
ハードコードのいずれも存在しないことを検査している。本RunでdialogueEngineを書き換えた後も無変更で
PASS——個別化ダイアログの実装が100%ローカル・非同期通信ゼロであることの自動的な裏付け。

## THINKING_GAME_FIRST_PLAY_COMPREHENSION_AND_RESULT_FEEDBACK関連の追加テスト（前Run、`tests/onboarding.test.tsx` 9件 + `tests/flow.test.tsx` 更新）

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

## PERSONALIZED_DIALOGUEの手動比較確認（本Run、Section 18）

`npm run dev`起動中のローカル環境に対し、CASE-001で同一選択肢「ミナさんはあなたを無視している」を
選んだ上で、意味的に大きく異なる3種類の理由文（A: 強い因果主張、B: 慎重な不確実性、C: 別の仮説）を
それぞれ入力し、生成されたAI_INTERVENTIONメッセージを並べて比較した（一時Playwrightスクリプト、
実行後削除）。

結果：引用部分（プレイヤーが書いた理由文そのもの）は3パターンとも正しく異なっていたが、**反証・問い
返し本体の文面は3パターンとも完全に同一**だった（選択肢が同じであるため）。これは意味理解を伴わない
構造化アプローチの限界であり、正直にKNOWN_LIMITとして`docs/DECISIONS.md`に記録した。320/375/390/430px
いずれでも、この3〜4文からなる長めのメッセージによる横overflowは発生しないことも確認した。

## 実行結果

`npm run typecheck` / `npm run build` / `npm run test`（122件＝旧102件＋real-AI dialogue関連20件、
5ファイル追加）はいずれもPASS（実行ログはCLOSE報告を参照）。`functions/dialogue/`はこのビルドとは
別のデプロイ物であり、`npm test`の対象には含まれない（ローカルスモークテストのみ、上記参照）。

# MVP_SCOPE — 思考整理ゲーム PLAYABLE_VALIDATION_BUILD_V0_1

> **SPEC AMENDMENT適用済み（2段階）**：
> (1) rubric・CASE_TYPE・AI CALIBRATION MATRIXの導入。
> (2) 本Run（PLAYABLE_VALIDATION_BUILD）：TRANSFER-001/002を実際にプレイ可能なケースとして実装し、
>     AI品質（CORRECT/UNCERTAIN/INCORRECT）をケースセット全体でバランスさせ、
>     NEXT_CASE導線・セッション振り返り・ユーザーテストアンケートを追加した。
> 本Runは新しい思想を追加するRunではなく、既存のtechnically readyな状態を実際に人が5〜10分遊べる
> 状態に仕上げることが目的（Section 冒頭）。

## LEVEL構造（Section M）+ TRANSFER

| LEVEL | テーマ | 実装状況 |
|---|---|---|
| 1 | FACT VS INTERPRETATION（CASE-001） | 完全実装 |
| 2 | MULTIPLE HYPOTHESES（CASE-002） | 実装（TRAINING、軽量rubric） |
| 3 | FALSIFICATION（CASE-003） | 実装（TRAINING、軽量rubric） |
| 4 | UPDATING（CASE-004） | 実装（TRAINING、軽量rubric） |
| 5 | BASIC CAUSALITY + AI CALIBRATION（CASE-005、AI品質=INCORRECT） | 完全実装（AI_CALIBRATION型） |
| — | TRANSFER-001（OBSERVATION/FALSIFICATION、AI品質=CORRECT） | 実装済み、`level: 0`（ラダー外） |
| — | TRANSFER-002（HYPOTHESIS/UPDATING、AI品質=UNCERTAIN） | 実装済み、`level: 0`（ラダー外） |

7ケースすべてが「ケースを選ぶ」画面と「今日の1問」のローテーションに、TRANSFERと明示せず自然に
混ざって登場する（Section 10）。LEVEL 6以降・REAL QUEST・AI FREE DIALOGUE・AI GENERATED TRAP・
PERSONALITY SCOREは、すべて `docs/FUTURE_IDEAS.md` に `NOW_NOT_IMPLEMENT` / `DO_NOT_IMPLEMENT` として記載済み。

## 実装する（本Runで追加した部分）

- TRANSFER-001 / TRANSFER-002 を実際にプレイ可能なケースとして実装（`docs/TRANSFER_TEST_DESIGN.md` の
  設計に基づく。ただしケース内容は実装時に確定した最終版を正とする）
- AI品質バランス：CASE-005（INCORRECT）、TRANSFER-001（CORRECT）、TRANSFER-002（UNCERTAIN）
- `hasEvaluableClaim`（AIの発言が評価可能な主張かどうか）を`caseType`から独立させ、TRANSFERケースも
  評価可能な主張を持てるようにした（`docs/AI_CALIBRATION.md`）
- RESULT画面に「次の問題へ」を最優先ボタンとして配置（Section 5、最重要観測地点）
- 5ケース区切りの「今回のプレイ」振り返り（SessionSummaryScreen、能力断定なし）
- 任意のユーザーテストアンケート（5問1〜5評価＋自由記述、local-only、UserTestScreen/UserTestThanksScreen）
- ローカル完結のファネル計測（CASE_START/CASE_COMPLETE/NEXT_CASE_CLICK/SESSION_COMPLETE/
  USER_TEST_SUBMITTED、`src/lib/metrics.ts`）
- GrowthScreenの能力ラベルから内部英語識別子を排除し、初心者向けの日本語のみへ変更（Section 4/6）

## 実装する（前Runから継続）

- OBSERVATION / HYPOTHESIS / FALSIFICATION / UPDATING の4能力（観測ベース、人格診断ではない）
- 4種類のAIキャラクター（探偵・悪魔・他者視点・参謀）による事前定義された発言（システム割り当てのみ）
- 全ケース共通のAI発言への構造化応答（気になる点の7択＋問題なし）
- HOME / CASE INTRO / OBSERVED FACT / FIRST DECISION / AI INTERVENTION / NEW FACT / SECOND DECISION /
  REFLECTION / RESULT / GROWTH / SESSION SUMMARY / USER TEST / USER TEST THANKS の13画面
- Dialogue Engine / Evaluation Engine / Player Action Logger / Growth Aggregatorの論理分離
- `localStorage` によるローカル完結の進行状況保存・リロード復元・判断軌跡（TrajectoryLog）記録
- React + TypeScript + Vite によるスマートフォン優先のWeb App
- 最小限のPWA対応（`manifest.json` とビューポート設定のみ）

## 今回実装しない（次Run以降）

- キャラクターの部分的・自由選択（LEVEL 4-5相当、Section H）
- Trap rate A/Bテストの実配信（データ構造のみ対応）
- Growth画面でのCALIBRATION MATRIX全12通りの内訳表示（現在はACCEPT/VERIFY/HOLD/REJECT件数のみ表示）
- ユーザーテスト回答・計測データの自動集計ダッシュボード（`管理画面`はDO_NOT_IMPLEMENT。
  `docs/USER_TEST_GUIDE.md` の手順でdevtoolsから手動確認する）
- Calibration V2（AI QUALITY × PLAYER ACTION × EPISTEMIC CONTEXT）：`NOW_NOT_IMPLEMENT`（Section 3）

## 実装しない（DO NOT IMPLEMENT）

- iOS / Android ネイティブアプリ
- ログイン・アカウント・クラウドDB
- 生成AI API（OpenAI / Anthropic / Gemini 等）
- 課金・広告・ランキング・PvP・SNS・ギルド・アバター・3D・通知・ストリーク
- REAL QUEST（`NOW_NOT_IMPLEMENT`）
- 長期本人モデル・心理診断・IQ判定
- AI親密度・AI信頼度スコア（単一のCALIBRATIONスコアも含む）
- 管理画面
- 大量CASE生成（7ケースまで、Section 1）
- LEVEL 6以降

## 技術的成功条件

1. `npm run dev` でlocalhost起動
2. 320/375/390/430pxのスマートフォン幅で横スクロールなし（Playwrightによる自動確認＋スクリーンショット目視、`docs/TEST_PLAN.md`）
3. 7ケース存在（5ケース＋TRANSFER 2件）、各ケースにrubric・level・caseTypeが定義されている
4. AI品質（CORRECT/UNCERTAIN/INCORRECT）がケースセット全体でバランスしている
5. 全ケース完走可能
6. RESULT画面から「次の問題へ」で次のケースへ迷わず進める
7. 5ケースで「今回のプレイ」振り返りが表示される
8. 任意のユーザーテストアンケートが回答・ローカル保存できる
9. CASE_START/CASE_COMPLETE/NEXT_CASE_CLICK/SESSION_COMPLETE/USER_TEST_SUBMITTEDが記録される
10. GROWTH反映がTRANSFERケースを除外して計算される
11. リロード耐性
12. 外部API・外部analytics不要
13. テストPASS
14. 内部用語（rubric/calibration matrix/trajectory/ground truth/falsification等）が画面に出ない

技術的完成はプロダクト成功を意味しない。最重要プロダクト仮説（「1ケース終了した利用者が、もう1ケース
やりたいと思うか」）は実利用者テストでのみ検証できる。本Runの到達点は
`READY_FOR_SMALL_USER_TEST` または `NOT_READY_FOR_USER_TEST` のいずれかであり、
`PRODUCT_VALIDATED` を宣言しない（CLOSE報告を参照）。4つの検証仮説（H1〜H4）は `docs/VALIDATION_PLAN.md` を参照。

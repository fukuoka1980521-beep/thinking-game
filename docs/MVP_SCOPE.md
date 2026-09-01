# MVP_SCOPE — 思考整理ゲーム MVP v0.1

> **SPEC AMENDMENT適用済み**：LEVEL構造・CASE_TYPE・rubric・AI CALIBRATIONを追加。
> CASE-001は新設計を完全実装、CASE-005はAI_CALIBRATION型として完全実装、CASE-002〜004は
> TRAINING型として軽量なrubricで移行済み。TRANSFER-001/002は設計のみで未実装（Section T許容範囲）。

## LEVEL構造（Section M）

| LEVEL | テーマ | 実装状況 |
|---|---|---|
| 1 | FACT VS INTERPRETATION（CASE-001） | 完全実装 |
| 2 | MULTIPLE HYPOTHESES（CASE-002） | 実装（TRAINING、軽量rubric） |
| 3 | FALSIFICATION（CASE-003） | 実装（TRAINING、軽量rubric） |
| 4 | UPDATING（CASE-004） | 実装（TRAINING、軽量rubric） |
| 5 | BASIC CAUSALITY + AI CALIBRATION（CASE-005） | 完全実装（AI_CALIBRATION型） |

LEVEL 6以降・REAL QUEST・AI FREE DIALOGUE・AI GENERATED TRAP・PERSONALITY SCOREは、
すべて `docs/FUTURE_IDEAS.md` に `NOW_NOT_IMPLEMENT` / `DO_NOT_IMPLEMENT` として記載済み。

## 実装する

- OBSERVATION / HYPOTHESIS / FALSIFICATION / UPDATING の4能力（観測ベース、人格診断ではない）
- 4種類のAIキャラクター（探偵・悪魔・他者視点・参謀）による事前定義された発言（システム割り当てのみ、
  自由選択は未実装）
- CASE-001〜CASE-005 の5ケース固定。各ケースにrubric・infoOptions・level・caseTypeを付与
- CASE-005 のAI TRAP（相関と因果の混同を含む事前定義教材）＋ PLAYER AI ACTION（採用/検証/保留/拒否）
  ＋ AI CALIBRATION MATRIX評価
- 全ケース共通のAI発言への構造化応答（気になる点の7択＋問題なし）
- HOME / CASE INTRO / OBSERVED FACT / FIRST DECISION / AI INTERVENTION / NEW FACT / SECOND DECISION /
  REFLECTION / RESULT / GROWTH の10画面
- Dialogue Engine / Evaluation Engine / Player Action Logger / Growth Aggregatorの論理分離
  （`src/engine/`、`docs/GAME_DESIGN.md`）
- `localStorage` によるローカル完結の進行状況保存・リロード復元・判断軌跡（TrajectoryLog）記録
- React + TypeScript + Vite によるスマートフォン優先のWeb App
- 最小限のPWA対応（`manifest.json` とビューポート設定のみ。Service Workerによるオフラインキャッシュは含まない）

## 今回実装しない（Section T許容範囲・次Run以降）

- TRANSFER-001 / TRANSFER-002 の実際のプレイ可能なケースデータ（設計のみ `docs/TRANSFER_TEST_DESIGN.md`）
- CASE-002〜004へのAI_CALIBRATION型ウィジェット（ソクラテス式のまま、Section D準拠の判断ではあるが
  ACCEPT/VERIFY/HOLD/REJECTは付与していない — 主張ではなく問いかけのため対象外、`docs/AI_CALIBRATION.md`）
- キャラクターの部分的・自由選択（LEVEL 4-5相当、Section H）
- Trap rate A/Bテストの実配信（データ構造のみ対応、`docs/AI_CALIBRATION.md`）
- Growth画面でのCALIBRATION MATRIX全12通りの内訳表示（現在はACCEPT/VERIFY/HOLD/REJECT件数のみ表示）

## 実装しない（DO NOT IMPLEMENT）

- iOS / Android ネイティブアプリ
- ログイン・アカウント・クラウドDB
- 生成AI API（OpenAI / Anthropic / Gemini 等）
- 課金・広告・ランキング・PvP・SNS・ギルド・アバター・3D
- REAL QUEST（仕様のみ `docs/FUTURE_IDEAS.md` に記載、`NOW_NOT_IMPLEMENT`）
- 長期本人モデル・心理診断・IQ判定
- AI親密度・AI信頼度スコア（単一のCALIBRATIONスコアも含む。`docs/AI_CALIBRATION.md`）
- 管理画面
- 大量CASE生成（30ケース等への拡張。TRANSFER含めても7ケースまで、Section T）

## 技術的成功条件

1. `npm run dev` でlocalhost起動
2. スマートフォン幅（横スクロールなし）で表示正常
3. 5ケース存在、各ケースにrubric・level・caseTypeが定義されている
4. 全ケース完走可能
5. 第一判断・確信度・（任意の理由）を記録
6. どの情報を重要と考えたかを構造化データとして記録
7. AI介入表示、AI_CALIBRATIONケースではPLAYER AI ACTIONを記録
8. 気になる点（AI trap taxonomy）の選択を記録
9. 追加情報（1枚）後に再判断
10. 振り返り可能
11. RESULT表示（正解・不正解表示なし、rubric結果に基づく）
12. GROWTH反映（能力別カウント＋AI付き合い方の分布、直近10件/全期間）
13. リロード耐性
14. 外部API不要
15. テストPASS

技術的完成はプロダクト成功を意味しない。最重要プロダクト仮説（「1ケース終了した利用者が、もう1ケース
やりたいと思うか」）は実利用者テストでのみ検証できる。本Runの到達点は
`TECHNICALLY_READY_FOR_USER_TEST` までであり、`PRODUCT_VALIDATED` を宣言しない。
4つの検証仮説（H1〜H4）は `docs/VALIDATION_PLAN.md` を参照。

# Thinking Game

AIと対話しながら、観察・仮説形成・反証・判断更新などを訓練する思考トレーニングゲーム。

「AIを信じるようになるゲーム」ではなく、「AIへの適正な信頼（CALIBRATED TRUST）」を養うことを目指します。
利用者が、AIの提案を無条件に採用せず、状況に応じて検証・反論しながら最終判断を自分で行えるようになることが目標です。

## Initial Policy

- Smartphone-first
- Web App / PWA（軽量な範囲のみ）
- Independent from thinking-os
- Calibrated trust with AI, not AI dependence
- MVP first
- Not publicly deployed yet
- 生成AI APIは未接続（CASE DATAは事前定義。詳細は `docs/DECISIONS.md`）

## Run: THINKING_GAME_PLAYABLE_VALIDATION_BUILD_V0_1

現在のビルドは、rubric・AI Calibration Matrix・判断軌跡スキーマ（SPEC AMENDMENT）に続き、
実際に人がスマートフォンで5〜10分遊んで「もう1問やりたいか」を検証できる状態（PLAYABLE VALIDATION
BUILD）まで仕上げたものです。7つのケース（5コア＋TRANSFER 2件、AI品質はCORRECT/UNCERTAIN/INCORRECT
をバランス）で、事実確認→判断→AIの意見→新情報→再判断→振り返り→RESULT（「次の問題へ」）という
コアループを、5ケース区切りの振り返りと任意のユーザーテストアンケートまで含めて体験できます。
詳細は `docs/DECISIONS.md`。

## Tech Stack

- React + TypeScript + Vite
- ローカル永続化のみ（`localStorage`）。外部サーバー通信・外部analyticsなし
- バックエンドなし
- `playwright`（devDependency）：モバイル幅の視覚確認用（`docs/TEST_PLAN.md`）。製品には含まれない

## How to Run

```bash
npm install
npm run dev       # http://localhost:5173 でスマートフォン幅を想定して確認
npm run build     # 本番ビルド
npm run test      # vitest によるテスト一式
npm run typecheck # 型チェックのみ
```

## ユーザーテストの実施方法

`docs/USER_TEST_GUIDE.md` を参照。テスト協力者への案内文と、プレイ結果・アンケート回答を
ブラウザの開発者ツールから読み出す手順を記載しています（管理画面は意図的に実装していません）。

## Documentation

- `docs/PRODUCT_SPEC.md` — プロダクト仕様
- `docs/GAME_DESIGN.md` — ゲームデザイン（ループ、能力、AIキャラクター、エンジン分離）
- `docs/SAFETY_PRINCIPLES.md` — 安全性・禁止事項の原則
- `docs/DATA_MODEL.md` — CaseData / TrajectoryLog のデータ構造（見取り図）
- `docs/MVP_SCOPE.md` — 今回実装する範囲・しない範囲・LEVEL構造
- `docs/TEST_PLAN.md` — テスト計画と結果
- `docs/FUTURE_IDEAS.md` — 将来検討事項（NOW_NOT_IMPLEMENT）
- `docs/DECISIONS.md` — 主要な意思決定とその理由
- `docs/RUBRIC_DESIGN.md` — CASE RUBRICの設計原則
- `docs/AI_CALIBRATION.md` — AI Calibration Matrixの設計
- `docs/AI_TRAP_TAXONOMY.md` — AI欠陥タクソノミー
- `docs/TRAJECTORY_SCHEMA.md` — 判断軌跡（TrajectoryLog）スキーマ
- `docs/DATA_BOUNDARY.md` — 将来のデータ再利用・プライバシー境界
- `docs/VALIDATION_PLAN.md` — 検証すべき4つの仮説 H1-H4
- `docs/TRANSFER_TEST_DESIGN.md` — TRANSFERケースの設計（実装済み）
- `docs/USER_TEST_GUIDE.md` — ユーザーテストの実施・データ取得手順

## Product Hypothesis

今回の最重要プロダクト仮説は、「1ケース終了した利用者が、もう1ケースやりたいと思うか」です。
これは技術的完成だけでは証明できず、実利用者によるテストが必要です。本ビルドは
`READY_FOR_SMALL_USER_TEST` の判定を目指すものであり、`PRODUCT_VALIDATED` を宣言するものではありません。

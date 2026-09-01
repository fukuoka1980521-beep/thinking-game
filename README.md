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

## Run: THINKING_GAME_MVP_V0_1

現在のバージョンは v0.1 のMVPに、SPEC AMENDMENT（rubric・AI Calibration Matrix・判断軌跡スキーマ）を
適用したものです。5つのケースで、思考整理ゲームのコアループ（事実確認→判断→AI介入→新情報→再判断→
振り返り→成長記録）を体験できます。CASE-001は新設計を完全実装、CASE-005はAI CALIBRATION型として
完全実装、CASE-002〜004はTRAINING型として軽量なrubricで移行済みです。詳細は `docs/DECISIONS.md`。

## Tech Stack

- React + TypeScript + Vite
- ローカル永続化のみ（`localStorage`）。外部サーバー通信なし
- バックエンドなし

## How to Run

```bash
npm install
npm run dev       # http://localhost:5173 でスマートフォン幅を想定して確認
npm run build     # 本番ビルド
npm run test      # vitest によるテスト一式
npm run typecheck # 型チェックのみ
```

## Documentation

- `docs/PRODUCT_SPEC.md` — プロダクト仕様
- `docs/GAME_DESIGN.md` — ゲームデザイン（ループ、能力、AIキャラクター、エンジン分離）
- `docs/SAFETY_PRINCIPLES.md` — 安全性・禁止事項の原則
- `docs/DATA_MODEL.md` — CaseData / TrajectoryLog のデータ構造（見取り図）
- `docs/MVP_SCOPE.md` — 今回実装する範囲・しない範囲・LEVEL構造
- `docs/TEST_PLAN.md` — テスト計画と結果
- `docs/FUTURE_IDEAS.md` — 将来検討事項（NOW_NOT_IMPLEMENT）
- `docs/DECISIONS.md` — 主要な意思決定とその理由
- `docs/RUBRIC_DESIGN.md` — CASE RUBRICの設計原則（SPEC AMENDMENT）
- `docs/AI_CALIBRATION.md` — AI Calibration Matrixの設計（SPEC AMENDMENT）
- `docs/AI_TRAP_TAXONOMY.md` — AI欠陥タクソノミー（SPEC AMENDMENT）
- `docs/TRAJECTORY_SCHEMA.md` — 判断軌跡（TrajectoryLog）スキーマ（SPEC AMENDMENT）
- `docs/DATA_BOUNDARY.md` — 将来のデータ再利用・プライバシー境界（SPEC AMENDMENT）
- `docs/VALIDATION_PLAN.md` — 検証すべき4つの仮説 H1-H4（SPEC AMENDMENT）
- `docs/TRANSFER_TEST_DESIGN.md` — TRANSFERケースの設計（未実装、SPEC AMENDMENT）

## Product Hypothesis

今回の最重要プロダクト仮説は、「1ケース終了した利用者が、もう1ケースやりたいと思うか」です。
これは技術的完成だけでは証明できず、実利用者によるテストが必要です。

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

現在のバージョンは v0.1 のMVPです。5つのケースで、思考整理ゲームのコアループ（判断→AI介入→新情報→再判断→振り返り→成長記録）を体験できます。

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
- `docs/GAME_DESIGN.md` — ゲームデザイン（ループ、能力、AIキャラクター）
- `docs/SAFETY_PRINCIPLES.md` — 安全性・禁止事項の原則
- `docs/DATA_MODEL.md` — CASE DATA / THINKING LOG のデータ構造
- `docs/MVP_SCOPE.md` — 今回実装する範囲・しない範囲
- `docs/TEST_PLAN.md` — テスト計画と結果
- `docs/FUTURE_IDEAS.md` — 将来検討事項（NOW_NOT_IMPLEMENT）
- `docs/DECISIONS.md` — 主要な意思決定とその理由

## Product Hypothesis

今回の最重要プロダクト仮説は、「1ケース終了した利用者が、もう1ケースやりたいと思うか」です。
これは技術的完成だけでは証明できず、実利用者によるテストが必要です。

# MVP_SCOPE — 思考整理ゲーム MVP v0.1

## 実装する

- OBSERVATION / HYPOTHESIS / FALSIFICATION / UPDATING の4能力（観測ベース、人格診断ではない）
- 4種類のAIキャラクター（探偵・悪魔・他者視点・参謀）による事前定義された発言
- CASE-001〜CASE-005 の5ケース固定
- CASE-005 のAI TRAP（相関と因果の混同を含む事前定義教材）
- HOME / CASE INTRO / FIRST DECISION / AI INTERVENTION / NEW FACT / SECOND DECISION / REFLECTION / RESULT / GROWTH の9画面
- `localStorage` によるローカル完結の進行状況保存・リロード復元・成長記録
- React + TypeScript + Vite によるスマートフォン優先のWeb App
- 最小限のPWA対応（`manifest.json` とビューポート設定のみ。Service Workerによるオフラインキャッシュは含まない）

## 実装しない（DO NOT IMPLEMENT）

- iOS / Android ネイティブアプリ
- ログイン・アカウント・クラウドDB
- 生成AI API（OpenAI / Anthropic / Gemini 等）
- 課金・広告・ランキング・PvP・SNS・ギルド・アバター・3D
- REAL QUEST（仕様のみ `docs/FUTURE_IDEAS.md` に記載、`NOW_NOT_IMPLEMENT`）
- 長期本人モデル・心理診断・IQ判定
- AI親密度・AI信頼度スコア
- 管理画面
- 大量CASE生成（30ケース等への拡張）

## 技術的成功条件

1. `npm run dev` でlocalhost起動
2. スマートフォン幅（横スクロールなし）で表示正常
3. 5ケース存在
4. 全ケース完走可能
5. 第一判断を記録
6. 理由を記録
7. 確信度を記録
8. AI介入表示
9. 追加情報後に再判断
10. 振り返り可能
11. RESULT表示（正解・不正解表示なし）
12. GROWTH反映
13. リロード耐性
14. 外部API不要
15. テストPASS

技術的完成はプロダクト成功を意味しない。最重要プロダクト仮説（「1ケース終了した利用者が、もう1ケース
やりたいと思うか」）は実利用者テストでのみ検証できる。本Runの到達点は
`TECHNICALLY_READY_FOR_USER_TEST` までであり、`PRODUCT_VALIDATED` を宣言しない。

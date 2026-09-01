# TEST_PLAN — 思考整理ゲーム MVP v0.1

## 自動テスト（`npm run test` / vitest）

| # | 確認項目 | テストファイル |
|---|---|---|
| 1 | 5ケースすべて存在し、IDが一意 | `tests/data.test.ts` |
| 2 | 各ケースが最低限のCASE DATAフィールドを持つ | `tests/data.test.ts` |
| 3 | 人格診断・AI信頼度系フレーズがケースデータに含まれない | `tests/data.test.ts` |
| 4 | AI TRAPはCASE-005のみに存在し、解説文を持つ | `tests/data.test.ts` |
| 5 | 4能力すべてがいずれかのケースの対象になっている | `tests/data.test.ts` |
| 6 | `localStorage` の未完了セッションの保存・復元・削除 | `tests/storage.test.ts` |
| 7 | ケース間でのin-progressデータ混入なし（後勝ち・非マージ） | `tests/storage.test.ts` |
| 8 | 完了ログの追記（既存ログを消さない） | `tests/storage.test.ts` |
| 9 | 破損データからのクラッシュしない復旧 | `tests/storage.test.ts` |
| 10 | 能力観測シグナルの算出ロジック（事実分類・仮説・反証・判断更新） | `tests/reflection.test.ts` |
| 11 | RESULTの良い点／確認点が空にならない、正解・不正解表現を含まない | `tests/reflection.test.ts` |
| 12 | 成長集計（全期間・直近5件）の計算 | `tests/growth.test.ts` |
| 13 | 外部通信（fetch/XHR/WebSocket）が存在しない | `tests/safety.test.ts` |
| 14 | 生成AI APIパッケージ・APIキーが存在しない | `tests/safety.test.ts` |
| 15 | AI信頼度／親密度等のスコア概念が実装されていない | `tests/safety.test.ts` |
| 16 | 5ケースすべてを最後まで完走できる（1ケースをE2E） | `tests/flow.test.tsx` |
| 17 | 判断理由・確信度の入力、AI介入表示、追加情報表示、再判断、RESULT表示 | `tests/flow.test.tsx` |
| 18 | 戻る操作で入力済みデータが保持される（状態破損なし） | `tests/flow.test.tsx` |
| 19 | リロード後の進行復元（HOMEの「続きから再開する」） | `tests/flow.test.tsx` |
| 20 | ケース切り替え時にデータが混入しない | `tests/flow.test.tsx` |
| 21 | GROWTH反映が完了ログと一致する | `tests/flow.test.tsx` |

上記21項目で、仕様の「TEST」節にある確認事項（5ケース表示・完走、判断理由・確信度入力、AI介入、追加情報、
再判断、RESULT表示、GROWTH反映、戻る操作、リロード復元、データ混入なし、成長集計、外部API通信なし、
個人情報送信なし、人格診断的断定文なし、AI依存を促す文言なし）をすべてカバーしている。

## 手動・コードレビューによる確認

以下は自動テストで機械的に保証しにくいため、コードレビューで確認した。

- **スマートフォン幅で横スクロールなし**：`src/styles/global.css` で `html, body { overflow-x: hidden }`、
  `#root { max-width: 480px }`、ボタン等はすべて `width: 100%` かつ `box-sizing: border-box` を確認。
  ブラウザ拡張機能（Claude in Chrome）が本セッションでは未接続だったため、実機ブラウザでの目視確認は
  未実施。次Runでの優先確認事項とする（`docs/FUTURE_IDEAS.md`）。
- **タップしやすいボタンサイズ**：主要ボタンは `min-height: 48px` を確認。
- **5ケースの内容が政治・宗教・医療・犯罪等の高リスク題材を含まないこと**：全ケースの本文を目視確認。

## 実行結果

`npm run typecheck` / `npm run build` / `npm run test` はいずれもPASS（実行ログはCLOSE報告を参照）。

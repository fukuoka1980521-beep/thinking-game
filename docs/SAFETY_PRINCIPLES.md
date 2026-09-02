# SAFETY_PRINCIPLES — 思考整理ゲーム MVP v0.1

## 個人情報・通信

- 個人情報を取得しない。
- ゲームプレイの進行状況・記録は引き続き全て `localStorage` にのみ保存する（`src/lib/storage.ts`、
  `thinking-game:in-progress:v2` / `thinking-game:completed-logs:v2`）。
- **本Run（REAL_AI_DIALOGUE）で唯一の明示的な例外を追加**：CASE-001に限り、Ownerが明示的に同意した
  場合のみ（`thinking-game:ai-dialogue-consent:v1`、オンボーディングとは別の独立した同意画面）、
  プレイヤーが書いた理由文と選択内容をVertex AI Gemini（`functions/dialogue/`、APIキーを持たず
  サービスアカウントIDのみで認証）へ送信する。それ以外の6ケース、および同意しなかった場合・通信が
  失敗した場合は、これまで通り外部通信ゼロのまま（前Runが実装した構造化個別化ダイアログへ安全に
  フォールバックする）。詳細は`docs/DATA_BOUNDARY.md`・`docs/DECISIONS.md`を参照。
  `tests/aiDialogueGateDormant.test.tsx`が「エンドポイント未設定の現在のデプロイ状態では、この機構は
  完全に休眠し、同意画面もネットワーク通信も一切発生しない」ことを検証している。
- `tests/safety.test.ts` で、上記CASE-001用の1箇所（`src/lib/aiDialogueClient.ts`）を除き `fetch` /
  `XMLHttpRequest` / `WebSocket` がフロントエンド全体に存在しないこと、生成AI関連パッケージ名が
  フロントエンドのバンドルに含まれないこと（`functions/dialogue/`はビルドに含まれない別デプロイ物）、
  APIキー・Bearerトークンがハードコードされていないことを自動検証している。
- 将来クラウド保存・データ再利用を検討する際の3分類（GAMEPLAY DATA / OPTIONAL TEXT / REAL WORLD
  SENSITIVE DATA）と目的分離の原則は `docs/DATA_BOUNDARY.md` に記載。
- **本Run追加**：セッション振り返り（`thinking-game:metrics:v1`）とユーザーテスト回答
  （`thinking-game:user-test-responses:v1`）も同様にローカル保存のみで、外部analyticsや自動集計
  サーバーへは送信しない。集計はテスト実施者が本人の端末でdevtoolsから手動で行う
  （`docs/USER_TEST_GUIDE.md`）。

## 人格診断の禁止

- 「あなたは反証能力が低い人です」のような人格診断・断定文は表示しない。
- GROWTH画面では「能力値」ではなく「最近のゲームで観測された思考行動」として、
  行動の頻度（例：「反対の可能性を検討したケースは4件でした」）のみを表示する。
- `tests/data.test.ts` で、ケースデータ内の人格診断的フレーズの不使用を検証している。

## 正解・不正解の禁止

- RESULT画面は「正解！」「不正解！」のような二値評価を表示しない。
- 代わりに「今回よかった点」「確認したい点」「次回のテーマ」という3構成で、
  観測された思考行動（事実と解釈の区別・複数仮説・反証・判断更新）に基づくフィードバックを行う。
- 「最初は間違っていたが、新しい証拠を受けて判断を更新した」ことも肯定的に評価する
  （`reflectionPoints.updatingEngaged` 系のテキスト）。

## AI依存を促さない

- AI信頼度・AI親密度・AI好感度・AIとの絆レベルといった、AIとの関係性を数値化・スコア化する概念は実装しない。
- 「AIは常に正しいとは限りません。参考にしつつ、自分でも検証してみましょう。」という安全原則自体は
  維持するが、**SEMANTICS FIX Run**により表示場所をAI_INTERVENTION画面（個別の判断の直前、
  Calibration対象ケースではACCEPT/VERIFY/HOLD/REJECTウィジェットの真横）からHOME画面（個別の判断より
  前）へ一本化した。判断の直前に「疑え」と促す表示は、AI Calibrationの測定（プレイヤーが発言内容だけを
  見て判断できているか）を汚すデマンド特性（demand characteristic）になり得るため
  （`docs/AI_CALIBRATION.md`）。
- **SPEC AMENDMENT**：AI CALIBRATION（AI提案を採用した／検証した／保留した／拒否した）は
  `docs/AI_CALIBRATION.md` のCALIBRATION MATRIXとして実装した。ただし単一のTrust Scoreには集約しない。
  「AIを疑えば高得点」「AIを信じれば高得点」のどちらも成立しないよう、AI提案の品質（正しい／不確実／
  誤り）と組み合わせて評価する。GrowthScreenはACCEPT/VERIFY/HOLD/REJECTの件数分布のみを表示する。
- `tests/safety.test.ts` および `tests/evaluationEngine.test.ts` で、単一スコア概念が存在しないこと、
  正しいAIの拒否や誤ったAIの採用が高評価にならないことを検証している。
- **本Run追加**：AI品質（CORRECT/UNCERTAIN/INCORRECT）とトラップの有無・出現率は、プレイ中の画面には
  一切表示しない。ケースセット全体でAI品質に偏りを作らないこと自体は達成するが、それを利用者に
  可視化しない（`docs/AI_CALIBRATION.md`、`tests/data.test.ts` の非露出テスト）。

## AI TRAP（CASE-005）の安全な実装方法

- CASE-005で提示する「AIアシスタントの誤った提案」は、事前定義された固定テキストであり、
  生成AIにその場で誤情報を自由生成させたものではない。
- 欠陥の種類（相関と因果の混同）と正しい解説文をケースデータ (`aiTrap.explanation`) に安全に含めている。
- **SPEC AMENDMENT**：AI欠陥の分類は事前定義されたタクソノミー（`docs/AI_TRAP_TAXONOMY.md`、10種類、
  うちプレイヤーが選択できるのは7種類＋「問題なし」）として構造化した。トラップの出現頻度実験
  （TRAP_RATE_10等）はデータ構造のみ用意し、本MVPでは実際のA/B配信は行わない。

## 判断更新の禁止事項（SPEC AMENDMENT）

- 「判断を変更した＝正しい」という前提でRESULTを組み立てない。証拠が支持しない方向への変更
  （`misaligned_change`）や、証拠があるのに変えなかった場合（`under_update`）も区別して記録する。
- 合理的にKEEPした場合（`appropriate_keep`）は、変更した場合と同様に肯定的に評価できる設計とする。
- 詳細は `docs/RUBRIC_DESIGN.md` / `docs/AI_CALIBRATION.md`。

## 高リスク題材の回避

- 政治・宗教・医療・犯罪などの高リスク題材を避け、日常・仕事の題材のみを扱う（`riskLevel: "low"` を全ケースで固定）。

## スマートフォン表示

- 横スクロールが発生しないよう、`html, body { overflow-x: hidden }` とし、コンテナに `max-width: 480px` を設定している。
- タップ領域は `min-height: 48px` を基本とする。

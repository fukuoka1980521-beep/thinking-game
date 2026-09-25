# NEW LIFE LIVE AI 準備

<walkthrough-tutorial-duration duration="3"></walkthrough-tutorial-duration>

この操作は、公開中のNEW LIFEを変更せず、隔離された `newlife-refoundation-ai` だけをデプロイして、会話精度テスト用URLを作ります。

## 1. Google Cloud の認証を確認

Cloud Shell が開いたら、そのまま次へ進んでください。  
このチュートリアルは既存プロジェクト `gas-test-runner-20260620-wjxf` を使います。

## 2. 一括実行

次の1行を実行してください。

```sh
bash scripts/newlife-deploy/pde009-cloud-shell-human-test.sh
```

スクリプトは以下を自動で行います。

- 必要なAPIがすでに有効か確認
- 課金・認証状態を確認
- 隔離AIバックエンドだけをデプロイ
- `interpret_turn` と `generate_npc_line` をsmoke test
- 人間テスト用URLを生成

APIを勝手に有効化したり、公開NEW LIFEを変更したりはしません。

## 3. テストURLを開く

最後に次の形式の行が表示されます。

```terminal
PDE009_TEST_URL=https://...
```

そのURLをクリックすると、NEW LIFEのLIVE会話精度テストが開きます。

美香または亮を選び、普段どおり自分の言葉で話しかけてください。

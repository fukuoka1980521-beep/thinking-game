# NEW LIFE V37 LIVE AI 準備

<walkthrough-tutorial-duration duration="3"></walkthrough-tutorial-duration>

この操作は、公開中の旧NEW LIFEを変更せず、V37の隔離テスト用 `newlife-refoundation-ai` だけを再デプロイして、人間テストURLを作ります。

## 1. 一括実行

下の1行を実行してください。

```sh
bash scripts/newlife-deploy/pde010-cloud-shell-v37-human-test.sh
```

このスクリプトは以下だけを自動で行います。

- Google Cloud認証状態を確認
- 必要APIがすでに有効か確認
- V37隔離AIバックエンドだけをデプロイ
- `converse_turn` を実通信確認
- `organize_thought` を実通信確認
- 人間テスト用URLを表示

APIの新規有効化、課金変更、旧NEW LIFE変更、モデル変更は行いません。

## 2. 完了確認

最後に次が出れば成功です。

```terminal
PDE010_SMOKE=PASS
PDE010_TEST_URL=https://...
```

`PDE010_TEST_URL` を開き、自由会話と「考えを整理する」をそのまま試してください。

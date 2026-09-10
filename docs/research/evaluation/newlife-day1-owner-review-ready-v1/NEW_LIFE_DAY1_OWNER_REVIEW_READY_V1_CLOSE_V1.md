# NEW_LIFE_DAY1_OWNER_REVIEW_READY_V1 -- CLOSE REPORT

BASELINE COMMIT: `5a4d567`
FINAL COMMIT: `720b671`

No DAY2, new NPC, new feature, career route, or new image was added. One real change: the live-AI
toggle now defaults on for an actual `vite` dev-server session (previously off by default, requiring
Owner to find and check a "developer" checkbox before NPC conversation worked). Verified via a full
real-browser playthrough (Playwright against the running dev server, 390x844) that Owner never has
to touch it.

## OWNER PLAY COMMAND

```
cd C:\Users\user\ClaudeWork\thinking-game
npm run dev
```

(Confirmed against the actual repo: `package.json`'s `dev` script is plain `vite`, and
`vite.config.ts` sets no custom port, so it binds the Vite default, 5173. Port was free when
checked.)

## OWNER PLAY URL

```
http://localhost:5173/?newlifecore=1
```

(Confirmed against `src/App.tsx`: `params.has("newlifecore")` routes to `NewlifeCoreApp`.)

## LIVE AI利用状態

普通に `npm run dev` → 上記URLを開く → 「目を覚ます」を押すだけで、NPCとの自由入力会話は
Vertex AI 経由のライブ応答になる（今回のOwner play default化）。画面下の「AIとの会話（オフで
簡易応答に切り替え）」チェックボックスは触らなくてよい -- 何か不調のときの手動オフ用に残してある
だけ。ライブ呼び出しが失敗した場合は無言でキャラクター内の簡易応答へ自動フォールバックする（既存
の安全設計、今回変更なし）。GCP認証・契約は一切変更していない。

## DAY1終了までの想定体験

実際にこの導線で最初から最後まで通しプレイした（390x844、ライブAI使用、チェックボックス未操作）。

- オープニング画像 → 「目を覚ます」→ チャレンジセンターへ。神谷と2往復会話。「まだ何していいか
  分からない」と言うと、共感でまとめず「こちらの書類、目を通しておいてください」と自分の仕事へ
  誘導する返し。
- 洋平商店・喫茶のどか・集会所を順に訪ね、それぞれと1往復ずつ会話。洋平「この店か？先代の頃から
  だから、もうずいぶんなるな」、美代子「私はもうずっとこの店で、この町を見てきたからねぇ」、相馬
  「いや、大丈夫だ。俺はこっちの続きがあるから」-- いずれも共感→要約→質問のAIパターンへ落ちず、
  それぞれの生活・気分から出た返しになっていた。
- 商店街の貼り紙を見る、喫茶で座る、といった特別行動も自然に挟まった。
- 「今日はもう休む」が出せるようになるまで、上記の一巡だけでは足りず、合計で60前後の実操作
  （移動・会話・特別行動）を要した -- 過去に指摘された「一日が短すぎる」への構造的な担保になって
  いる（水増し文章ではなく、行動回数として長い）。
- 就寝画面は得点・職業候補・進捗表示なし。実際に出たテキスト:
  「洋平の店の棚は、いつの間にか直っていた。相馬とは少し話した。明日も朝が早いらしい。喫茶のどか
  で、美代子と少し話した。神谷とは話が途中のままだ。そして眠った。」
- 「明日、あの人どうしてるかな」に近い余韻（誰かと話が途中／棚が知らないうちに直っていた）が、
  説明なしで残る形になっていた。

## 既知の弱点

- 神谷の返答に「ご用件でも」「お困りごとなどございましたか」のような窓口口調がやや出やすい
  （禁止フレーズそのものではないが近い）。ライブ生成の揺れの範囲内で、今回は追加のプロンプト
  調整はしていない（追加設定・追加チューニングは今回のスコープ外）。
- 一巡（全NPCに1回ずつ会話）を終えた後、20:00の就寝解禁までまだ数時間分の時間が残るが、その
  時間帯に新しい特別行動は用意されていない。会話を続ける・待つ・歩き回るは可能だが、素材が薄く
  感じられる可能性がある。今回は新規コンテンツ追加が禁止されているため未対応 -- 次にコンテンツを
  足す回があれば優先候補。
- 無関係な旧テストスイート（case1c / newlifeV03 / newlifeVertical 等）に非決定的な既知flakyが
  残っている。今回の変更対象外、修正していない。

## TEST / TYPECHECK / BUILD

- `npm run typecheck` -- clean
- `npm run build` -- clean
- newlifecore対象テスト（`tests/newlifecoreEngine.test.ts` + `tests/newlifecoreRenderedUI.test.tsx`）
  -- 30/30 pass（今回1件、ライブAIデフォルト化の回帰テストを追加）

---

**OWNER REVIEW READY = YES**

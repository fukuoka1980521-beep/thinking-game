# NEW_LIFE_DAY1_ONBOARDING_AND_WORLD_ACTION_FIX_V1 -- CLOSE REPORT

BASELINE COMMIT: `37f1eb2`
FINAL COMMIT: `5ae5945`

No DAY2, new NPC, new feature-beyond-scope, career route, or new image was added. NPC personality
models, hidden backgrounds, AI/state separation, the knowledge-boundary filter, the time engine, NPC
schedules, player-absent world events, approved art, and the 30-day core premise are all unchanged.

## What triggered this Run

Third-party testing of the previous build surfaced a real Owner-facing bug: on the first meeting,
Kamiya (live AI) asked the player to fill out a form -- "まずは、こちらの用紙にいくつかご記入いた
だけますか" -- and the player was expected to answer "記入しましたよ" in free text, with no form
ever appearing on screen. A tester's reaction was "何も書いてないじゃん" -- exactly right. The fix
is not a prompt patch; it is making the requested action real.

## OPENING最終文

> あなたは30日間、この町で暮らします。
> 町を歩く。人と話す。誰かを手伝う。仕事を探す。何もしない。
> 過ごし方は自由です。決まった正解はありません。
> 30日後、あなたが何をしていて、誰と関わり、どこにいるのか。
> それは、この30日で決まります。
>
> [町での生活を始める]

## PLAY GUIDE最終文

> この町では
> ・場所を選んで移動できます
> ・人がいれば自由に話せます
> ・その場でできる行動を選べます
> ・行動すると時間が進みます
> ・夜になったら一日を終えられます
>
> [町へ出る]

Shown once automatically after OPENING. Reopenable any time during play via a topbar
「？　遊び方」button (does not touch `CoreState` -- a pure local overlay); closing it returns to
exactly where the player was.

## FORM項目

名前（自由記述） / 今の仕事（働いている・今は働いていない・その他、ラジオボタン、必須） / この町
へ来た理由（自由記述、空欄可） / 今のところ考えていること（自由記述、「特にない」でも可） / 困っ
ていること（自由記述、空欄可）。提出ボタンは「今の仕事」を選ぶまで無効。それ以外は全て空欄で提出
できる（`tests/newlifecoreRenderedUI.test.tsx` で回帰確認済み）。診断・適職判定・性格分類は一切生
成しない -- 保存されるのは書いた内容そのものの引用のみ。

## Kamiya reaction実例（実プレイ、ライブAI）

用紙提出直後、スクリプトされた一言（内容の全文復唱なし）:

> 神谷は受け取った用紙に、ざっと目を通した。「……まだ決めてないんですね」

その直後、自由会話を再開すると、ライブAIがすでに提出内容を知った状態で自然に反応した（実プレイ
transcript、抜粋）:

```
PLAYER: さっきの用紙、ああいう感じで大丈夫でした？
神谷: はい、大丈夫でしたよ。…ミナトさん、でしたね。

PLAYER: 正直、まだ何していいか分からないです
神谷: そうですか。…ええ、焦らなくて大丈夫ですよ。用紙にも、そう書かれていましたね。
```

提出した名前（ミナト）と「今のところ考えていること」（まだ何がしたいか分からない）の両方を、説明
せずに自然に参照している -- 診断ではなく、会話の中で滲み出る形。

## フォーム内容がknowledgeへ入る証拠

提出内容は `content/day1.ts` の `buildIntakeFormWorldFacts()` を通じて `knownBy: ["kamiya"]` の
`WorldFact` として追加される -- 既存の知識境界フィルタ（`contextBuilder.ts`）が既にそのまま使う
仕組みで、新しい経路は作っていない。単体テストで確認:

```
worldFacts: [{ id: "intake_current_thoughts", text: "PLAYERは「今のところ考えていること」に
  「まだ何がしたいか分からない」と書いた。", knownBy: ["kamiya"] }]
→ buildNpcAiContext("kamiya", state, ...).knownFacts に上記テキストが含まれる
→ 他のNPC（洋平・美代子・相馬）には渡らない（knownByで境界済み）
```

保存されるのは常に「PLAYERは○○と書いた」という引用のみ。"PLAYER is lazy" のような推論ラベルは
どこにも生成・保存されない（コード上、そもそもそのようなテキストを構築する経路が存在しない）。

## 自由会話回帰確認

- フォームを一度も開かずに神谷へ直接「自由に話す」→ 自由記述 → 応答、が引き続き動作する（無視す
  る自由を壊していない）。
- 複数ターンの会話、AIトグルのデフォルト状態（Owner play時はライブAI既定）、いずれも変更なし。
- 既存の会話関連テスト（フォーム提出なしの自由記述、複数ターン、内部型名の非漏洩）は全て無修正の
  まま pass。

## world/action consistency 全体監査

DAY1の全スクリプト済みテキスト（`content/day1.ts` / `NewlifeCoreApp.tsx` の specialResult /
`npcDefs.ts`）を「持って/書いて/渡し/座って/見て/ついてきて」等のキーワードで走査。神谷の用紙リク
エスト以外に、プレイヤーへ具体的な物理行動を要求していながら対応するUI操作が存在しない箇所は見つ
からなかった（棚修理の「渡してきた」は `offer_help_shelf` という実際のボタン操作の結果テキストで
あり、別途の自由記述を要求するものではない -- 既存仕様のまま）。

再発防止として、ライブAIプロンプト（`devtools/newlifeCoreVertexLiveAdapterCore.mjs`）に「画面上に
存在しない物を渡す/書かせる/持たせるといった新しい具体的行動を会話中に発明しない」という明示的指
示を追加した。

用紙アクション自体も一度提出すると `specialActions` から消え、再度「オファーされ続ける」ことがな
い（回帰テストで確認）。

## time engine 回帰確認

`engine.ts` は未変更。フォーム提出は `doShortAction(state, 15)` を使う既存の時間コストパターンの
み（会話1往復=10分、移動=15分と同列）。`tests/newlifecoreEngine.test.ts` の21件、無修正のまま
pass。

## スクリーンショット（実ブラウザ、390x844、ライブAI、devトグル未操作）

Playwrightでの実プレイ確認（OPENING → GUIDE → 神谷 → 用紙記入 → 提出 → 反応 → 自由会話 → 町へ）
で、各画面のレイアウト崩れなし、横スクロールなし、画像・入力欄・NPC応答・現在時刻・移動・就寝導線
いずれも視認可能。1点、ガイド画面の `<li>` テキストの一部が、生HTMLには一切マークアップが存在し
ないにもかかわらずPlaywrightのスクリーンショットでのみ青い下線付きで写る現象を観察した（会話画面
やOPENING画面では再現しない）。実DOM（`innerHTML`）を直接確認したところアンカーやカラー指定は皆
無で、CSS/HTMLの欠陥ではなくヘッドレスChromiumのスクリーンショット取得時特有の表示アーティファク
トと判断した（実ブラウザでのOwner操作には影響しない想定だが、未検証）。

## TESTS

- `tests/newlifecoreEngine.test.ts` -- 21/21 pass（無修正）
- `tests/newlifecoreRenderedUI.test.tsx` -- 16/16 pass（onboarding/formの新規テスト7件を追加、
  既存9件は`start()`ヘルパーの1行更新のみで無修正のまま pass）
- `npm run typecheck` -- clean
- `npm run build` -- clean

## 既知の弱点

- ガイド画面のスクリーンショット限定の下線アーティファクト（上述、実害未確認）。
- フォームの「今の仕事」以外の4項目はすべて空欄提出可能だが、空欄のまま提出した場合はKamiyaの
  known factsに何も追加されない（既存の質問がまだない状態と同じ）。これは意図通りだが、空欄が多
  い提出が「何も分かっていない」という形でしか神谷に伝わらない点は、今後の会話深化の余地として残
  る。
- フォームは神谷の初回面談にのみ実装した。他の3NPCには元々このクラスの「物理行動を要求する台詞」
  が見当たらなかったため、対応する新規UIは追加していない。

---

## FINAL JUDGMENTS

**ONBOARDING: PASS**
第三者テストで指摘された「ゲームで何をするのか分からない」問題に対し、OPENINGで30日間の意味を、
PLAY GUIDEで最小限の操作を、それぞれ短く分離して提示。常時表示せず、いつでも「？　遊び方」から再
確認可能。実プレイで説明が長すぎる・チュートリアル臭いという印象はなかった。

**WORLD-ACTION CONSISTENCY: PASS**
神谷の用紙リクエストは実際のUI操作（IntakeForm）で裏付けられ、プレイヤーが自由記述で「やったこ
と」を偽装する必要がなくなった。DAY1全体を監査し、他に同種の未対応箇所は見つからなかった。ライブ
プロンプトにも再発防止の指示を追加した。

**FREE CONVERSATION PRESERVED: YES**
フォームは会話をブロックしない（いつでも「自由に話す」で直接会話可能）。フォーム提出後の自由会話
は、提出内容を自然に参照しつつ、共感→要約→質問のAIパターンには陥っていない（実プレイtranscriptで
確認）。既存の自由会話関連テストは全て無修正のまま pass。

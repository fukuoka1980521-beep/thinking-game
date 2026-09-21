# NEW LIFE — anonymous 60-dialogue speaker test V1

Phase 25. This is an **internal synthetic test**, not real player dialogue or external human validation. Original game files and product code were unchanged.

## Procedure and decision rule

The author wrote 10 original utterances per NPC: six answers to the same direct questions and four other event-linked remarks. Exactly 60 lines were shuffled with a fixed seed. Speaker labels were removed from every utterance and the fresh evaluator received only the six names/roles, shared event facts and the shuffled anonymous text in `work/blind_60.md`. The evaluator was explicitly barred from opening the models or key. No corrective feedback was given before their answer. Identification was scored against the unrevealed key. “Pairwise discrimination” means accuracy on the 20 true items from each possible pair; guesses of a third NPC count as errors.

Threshold set before scoring: overall ≥80% and each of 15 pairs ≥65% (at least 13/20). Authoring identity is not a measure of in-game speech performance.

## 60 anonymous samples

Shared point in story: after the trial and old-photo complaint. “What happened yesterday?” refers to the trial the previous day. The evaluator saw the same setup. Questions are prompts, not parts of the NPC answer.

- S001 [昨日は何があった？] 昨日は三十点の試売をやった。十二が取り置きで、店先は十八。表示にその区別がなかった。今の掲示は直ってる。
- S002 [自由会話3] 承認したのは私です。間違いが見えたなら、まず外して知らせる。議論はその後。
- S003 [自由会話1] 担当を決めましょう。気持ちがそろっても、今日の表示は自分で書き換わりません。
- S004 [昨日は何があった？] 昨日は試売の列で椅子が一脚ぐらついてた。直したよ。場所の約束はしてない。……そこは笑えないところ。
- S005 [自由会話2] ほら、笑ってくれたら次へ行けるのにな。行けないか。分かった、今日中に返事する。
- S006 [なぜそれをしているの？] 通り道を空ける。二人がすれ違えん。終わったら帰る、それが今日の約束だ。
- S007 [自由会話2] 言い方はきつかった。だが、数が違えば客は二度歩く。そこは譲れん。
- S008 [自由会話1] 待って、今の言い方だとまた違って伝わる。十二は予約済み、十八が店頭。私が言い直します。
- S009 [自由会話3] 二時間ならやる。誰が金を出すか決めてくれ。話はそれから。
- S010 [陽菜の案に賛成？] 試すのはいい。台を増やすのは反対だ。運べる数と客の数が合ってない。
- S011 [怒っている？] 腹が立ったのは、聞いた数がそのまま出なかったことだ。人が来た後に正しくても遅い。
- S012 [陽菜の案に賛成？] 品は悪くない。掲示の数には賛成せん。予約を引いたら店頭はいくつだ、それを先に書けばいい。
- S013 [怒っている？] 少しだけ腹が立ったわ。誰かにというより、私が曖昧に笑ったせいもある。次は席のことを先に言う。
- S014 [怒っている？] 怒ってない。勝手に次の仕事を足されりゃ、断るだけだ。
- S015 [何を売っているの？] 会館では品物を売りません。場所と掲示の利用を受け付けます。販売価格は店の人に確認してください。
- S016 [自由会話1] 謝るなら、まず貼り紙を直せ。話はそれからでいい。
- S017 [昨日は何があった？] 昨日、会館前の試売を許可しました。三十点のうち十二は予約です。私が通した掲示には、その区別がありませんでした。
- S018 [自由会話4] 次をやるなら、量は半分でもいい。ただ、味まで変えるかは、今日の返事を聞いてから決めます。
- S019 [自由会話1] その場しのぎの板なら当てられる。でも、いつまで使うかは決めないとね。俺が。
- S020 [陽菜の案に賛成？] 試すのは賛成よ。味も好き。ただ、私の四席を自由に使っていい、とは言っていないの。
- S021 [怒っている？] 怒ってない。笑ってごまかすのはやめた。返事を延ばしたせいで、場所が決まらなかったのは俺だ。
- S022 [手伝おうか？] この一往復だけ持ってくれ。右側。終わったらもう頼まん。
- S023 [自由会話4] 無理はしない。無理を約束したら、最後に困るのは使う人だ。
- S024 [自由会話4] うちが持つのはうちの分。それでよければ、次も手伝う。
- S025 [何を売っているの？] 椅子と机を直してる。新品は売ってないよ。ガタつく椅子なら、冗談より先に脚を見る。
- S026 [なぜそれをしているの？] 数を見てる。予約十二と店頭十八を混ぜて書けば、三十全部を買えると思う人が出る。それだけだ。
- S027 [自由会話1] 座る前に、ちょっと聞いて。待つためなら会館のほうへお願いできる? ここの席は食事の方に取っておきたいの。
- S028 [怒っている？] 怒ってます。商品に言われた気がして。……違いますね、表示を見て来た人には、数が分からなかったんですよね。
- S029 [怒っている？] 腹は立っています。私が確認した紙で人が迷ったのだから、自分の手順にも。まず訂正します。
- S030 [自由会話4] 手伝えるのは飲み物まで。そこを言っても、また寄ってくれたらうれしいわ。
- S031 [昨日は何があった？] 昨日はお向かいの試売で人が増えたの。うちではコーヒーを出して、席は四つ。掲示のことは、後で困った人から聞いたわ。
- S032 [なぜそれをしているの？] 列の椅子を直してる。誰か座ってひっくり返る前にね。俺の工房を貸すかって話は……それは別件。
- S033 [何を売っているの？] 焼き菓子を二つ。プレーンスコーンは二十個で一個二百八十円、クッキーは十袋で二百四十円。十二点は予約で、店頭に出すのは十八点です。
- S034 [自由会話2] 優しい申し出ね。でも今日はここまで。お茶のおかわりより、先に私が休まないと。
- S035 [昨日は何があった？] 昨日は台を置いた。通路は空けた。掲示がどう読まれたかは、見てない。
- S036 [自由会話3] 勘で決めるな。二つ数えて、それでも足りん分を聞け。
- S037 [自由会話2] 助かった。次は鍵を借りる。人を呼ぶほどでもない、と思ってたが違った。
- S038 [陽菜の案に賛成？] 試すのは賛成。札の書き方はやり直し。椅子の脚みたいに、一カ所緩いと全員傾くからさ。
- S039 [なぜそれをしているの？] お客さんが座れるように、こちらの席を数えてるんです。手伝いたい気持ちはあるけれど、全部を待合にすると店が止まるでしょう。
- S040 [なぜそれをしているの？] いきなり店を広げても分からないから、まず三十点だけ売って、選ばれ方と受け渡しを見たいんです。作れる数だけで決めちゃだめですね。
- S041 [手伝おうか？] 旧版を下げるのを手伝ってください。新版を貼る判断は私がします。終われば影響を受けた人への連絡です。
- S042 [陽菜の案に賛成？] 試売には賛成。確認されていない予約数を公の掲示に載せた点には反対です。次は担当を一人にします。
- S043 [手伝おうか？] ありがとう。今は注文を先に出したいの。終わったら外の案内を一緒に見てくれる? ここはお客さんの席だから。
- S044 [自由会話3] よく見てるのね。ありがとう。ただ、その人の代わりに私が返事を決めることはできないの。
- S045 [自由会話2] 助かりました。でも、どれを次に焼くかは自分で決めたい。売れた数だけ、先に一緒に見てください。
- S046 [昨日は何があった？] 昨日はスコーンとクッキーの試売をしました。十二点を予約に取って、店頭には十八点。でも、その分け方を最初の札に書かなかったんです。
- S047 [何を売っているの？] 日用品と食料品。よその菓子は売っとらん。何を何個置くかは、うちの棚の話なら答える。
- S048 [自由会話3] あれ、褒めてもらうと安心して、肝心の質問を忘れそう。お客さんは何だと思って来たんでしょう。
- S049 [自由会話2] その案は誰が、何時までに直しますか。そこが空欄なら、まだ掲示できません。
- S050 [なぜそれをしているの？] 古い掲示を下げて、訂正した版に日付を入れています。同じ紙が二種類出ると、誰が責任者か分からなくなる。
- S051 [何を売っているの？] 物は売らん。直す、運ぶ、据える。頼むなら場所と終わる時刻を先に。
- S052 [手伝おうか？] 脚を押さえてくれる? その間に締める。工房を貸す返事の手伝いは、悪いけど自分でやる。
- S053 [自由会話3] みんなの案を聞くのは得意なんだ。俺の番になると急に椅子の裏が気になる。
- S054 [自由会話4] 断るよ、今回は。脚一本なら直すけど、店まるごとは貸せない。やっと言えた。
- S055 [手伝おうか？] 受け取りの列だけ、一時間見てもらえますか。焼いて売って、予約の分まで渡すのは、一人では足りないです。無理なら私が組み直します。
- S056 [何を売っているの？] 喫茶ではコーヒーと軽い昼食を出しています。試売の焼き菓子は私の売り物じゃないの。飲み物は注文してね。
- S057 [自由会話4] 会館は一時間だけ使えます。変更する人と締切が決まれば、私が確認します。
- S058 [陽菜の案に賛成？] 自分の案には賛成。でも「三十点」の書き方は違った。予約の分まで店頭で買えるように見えるのは、私が直すところ。
- S059 [自由会話1] そこは持つな。片方だけ浮く。俺が先に固定する。
- S060 [手伝おうか？] うちの在庫表なら頼める。予約の引き渡しまで引き受けろと言うなら断る。責任が違う。

## Evaluator result

| Check | Observed | Target | Verdict |
|---|---:|---:|---|
| Overall | 60/60 = 100% | ≥48/60 | PASS for this synthetic set |
| Six NPCs | each 10/10 | no stated individual cutoff | PASS |
| 15 pairs | minimum 20/20 | ≥13/20 | PASS |
| Four supplementary lines per NPC (24 total) | 24/24 | diagnostic | all attributed |

The evaluator marked S023 and S059 as the least certain, saying Daisuke could have been possible; they assigned both to Jin correctly. There were **zero wrong labels**, so the pairwise floor is 100% on this set.

## Answer key (separate from the anonymous test stimulus)

| Sample | True speaker | Evaluator | Match |
|---|---|---|---|
| S001 | 洋平 | 洋平 | ✓ |
| S002 | 文子 | 文子 | ✓ |
| S003 | 文子 | 文子 | ✓ |
| S004 | 大輔 | 大輔 | ✓ |
| S005 | 大輔 | 大輔 | ✓ |
| S006 | 仁 | 仁 | ✓ |
| S007 | 洋平 | 洋平 | ✓ |
| S008 | 陽菜 | 陽菜 | ✓ |
| S009 | 仁 | 仁 | ✓ |
| S010 | 仁 | 仁 | ✓ |
| S011 | 洋平 | 洋平 | ✓ |
| S012 | 洋平 | 洋平 | ✓ |
| S013 | 美代子 | 美代子 | ✓ |
| S014 | 仁 | 仁 | ✓ |
| S015 | 文子 | 文子 | ✓ |
| S016 | 洋平 | 洋平 | ✓ |
| S017 | 文子 | 文子 | ✓ |
| S018 | 陽菜 | 陽菜 | ✓ |
| S019 | 大輔 | 大輔 | ✓ |
| S020 | 美代子 | 美代子 | ✓ |
| S021 | 大輔 | 大輔 | ✓ |
| S022 | 仁 | 仁 | ✓ |
| S023 | 仁 | 仁 | ✓ |
| S024 | 洋平 | 洋平 | ✓ |
| S025 | 大輔 | 大輔 | ✓ |
| S026 | 洋平 | 洋平 | ✓ |
| S027 | 美代子 | 美代子 | ✓ |
| S028 | 陽菜 | 陽菜 | ✓ |
| S029 | 文子 | 文子 | ✓ |
| S030 | 美代子 | 美代子 | ✓ |
| S031 | 美代子 | 美代子 | ✓ |
| S032 | 大輔 | 大輔 | ✓ |
| S033 | 陽菜 | 陽菜 | ✓ |
| S034 | 美代子 | 美代子 | ✓ |
| S035 | 仁 | 仁 | ✓ |
| S036 | 洋平 | 洋平 | ✓ |
| S037 | 仁 | 仁 | ✓ |
| S038 | 大輔 | 大輔 | ✓ |
| S039 | 美代子 | 美代子 | ✓ |
| S040 | 陽菜 | 陽菜 | ✓ |
| S041 | 文子 | 文子 | ✓ |
| S042 | 文子 | 文子 | ✓ |
| S043 | 美代子 | 美代子 | ✓ |
| S044 | 美代子 | 美代子 | ✓ |
| S045 | 陽菜 | 陽菜 | ✓ |
| S046 | 陽菜 | 陽菜 | ✓ |
| S047 | 洋平 | 洋平 | ✓ |
| S048 | 陽菜 | 陽菜 | ✓ |
| S049 | 文子 | 文子 | ✓ |
| S050 | 文子 | 文子 | ✓ |
| S051 | 仁 | 仁 | ✓ |
| S052 | 大輔 | 大輔 | ✓ |
| S053 | 大輔 | 大輔 | ✓ |
| S054 | 大輔 | 大輔 | ✓ |
| S055 | 陽菜 | 陽菜 | ✓ |
| S056 | 美代子 | 美代子 | ✓ |
| S057 | 文子 | 文子 | ✓ |
| S058 | 陽菜 | 陽菜 | ✓ |
| S059 | 仁 | 仁 | ✓ |
| S060 | 洋平 | 洋平 | ✓ |

## Interpretation and limits

- The evaluator had roles in the roster; some of the six repeated direct questions reveal occupations. Perfect accuracy cannot be interpreted as pure voice style recognition, even though all 24 supplementary lines were also correct. The six-character roles and concerns are **deliberately easy to distinguish** here.
- Both writer and evaluator are AI processes, and the samples are authored specifically from this model. They share model-family biases. The test cannot establish that spontaneous, longer free conversation will remain distinct, nor that a human wants to keep talking.
- The test **does** catch identical greeting rhythm and generic evasive answers in this authored set. The next actual product gate, in a later approved phase, would check ordinary player questions in live state and compare different emotional contexts. No game implementation or 30-day script was changed here.
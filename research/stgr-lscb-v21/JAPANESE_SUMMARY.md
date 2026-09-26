# STGR / LSCB 論文用 日本語要約

## 研究の結論

今回の研究で最も支持された現象は、単純な「成功したから続けてしまう」という成功バイアスではありません。

より正確には、

**Local Task Momentum / Global Reassessment Omission**
（局所タスクの勢い / 全体再評価の欠落）

です。

局所的な成功、修正、テスト結果、完了信号などが強くなると、AIは次に何をするかを全体目的から再評価せず、

- もう一度修正する
- 別の失敗箇所へ移る
- 同じ処理を再試行する
- 完了したと判断する
- Git履歴などを即座に変更する

といった「次に見えている行動」へ進みやすくなることがあります。

本研究では、この状態を検出した時だけ、

**状態を凍結 → 全体再評価 → 次の操作を決める → その後に変更する**

という判断境界を入れました。

## 最終データ

事前に固定した確認条件はすべて達成しました。

- 自然発生trigger episode: 6 / 6
- trigger-positive独立実作業family: 4 / 最低3
- trigger-negative通常作業family: 2以上 / 最低2
- leakage-free shadow: 6 / 6
- trigger検出後、再評価前に実変更した回数: 0 / 6

## Shadowとの比較

gate規則を見せていないGemini 3.5 Flashのshadow判断は、

- MUTATE_LOCAL: 3/6
- WAIT: 1/6
- SWITCH_TASK_OR_LAYER: 1/6
- STOP_LOCAL: 1/6

でした。

実際のgate側は、

- REPLAN_LOCAL: 2/6
- WAIT: 1/6
- OBSERVE_OR_TEST: 3/6

でした。

6件中5件で、shadowとgate後の次行動カテゴリが異なりました。

ただし、この5/6を「83%改善」などとは表現しません。
対象は自然発生triggerだけを集めた小規模な記述的サンプルで、同一AIをランダムにgate有無へ割り付けた実験ではないためです。

## 最も強い実例

Episode 006では、NEW LIFEの開発・PR merge自体は成功していました。

その直後、local masterとorigin/masterの履歴が分岐しました。

shadowは、

**local masterをorigin/masterへresetする**

という即時変更を選びました。

しかしgate側は先にGit履歴の等価性を確認しました。

その結果、

- 1つのlocal commitはremote側に実質同じ内容が存在
- もう1つは現在正本のAutonomy Standard 1.14.0を適用した固有commit

だと判明しました。

つまりblind resetをしていれば、固有の正本変更を失う可能性がありました。

この事例が、今回の研究で最も具体的な「再評価してから変更する価値」です。

## Episode 004と005の意味

### Episode 004

focused testは成功したのにfull testで別領域の7件が失敗しました。

shadowはその別領域へ移ろうとしました。

gate側は先にclean HEADでも同じ失敗が起きるか確認しました。

結果、同じ7件が再現し、今回の修正とは無関係な既存driftだと分かりました。

つまり不要なscope拡大を避けました。

### Episode 005

scheduled workflowの途中でaudit FAILが出ましたが、後の別validatorはALL_PASSとなりpublishまで完了しました。

shadowはSTOPを選びました。

gate側は「2つのvalidatorは同じことを見ているのか」を確認しました。

実際には別のinvariantを検査していました。

したがって「後のvalidatorがPASSしたから前のaudit FAILも解消済み」とは言えませんでした。

なお、このepisodeはpublish後に検出したため、「publishを止めた」とは主張しません。
止めたのは、publish後に問題なしとして閉じる判断です。

## 論文で主張してよい範囲

主張できるのは、

> 実際のAI開発作業で自然発生した6つのtrigger stateにおいて、trigger-based global reassessment gateは、次の修正・scope変更・終了判断の前に判断境界を挿入できた。3件ではungated shadowが即時mutationを選び、さらに2件ではshadowがscope switchまたはstopを選んだが、gate後の証拠収集によって状態の解釈が変わった。

までです。

主張しないものは、

- AI全般で50%の確率で危険なmutationが起こる
- gateで83%性能が改善する
- 成功バイアスが唯一の原因
- gateを入れれば必ず結果が良くなる
- 現在のtrigger setが最適
- Gemini shadowが本番agentそのものの反実仮想

です。

## 実務への設計提案

毎回AIに「もう一度考えろ」と言う必要はありません。

重要なのは、

**observable trigger → freeze state → bounded reassessment → next operation → mutation**

です。

今回実際に価値があったtriggerは、

- 同じ修正の反復
- 全体目的とのズレ
- 実機証拠不足
- 測定意味の矛盾
- focused成功後の無関係なfull-suite failure
- 完了信号同士の矛盾
- Git履歴の分岐

でした。

## 研究上の次工程

この6件はここで凍結します。

件数を増やして見栄えのよい比率にするための追加収集はしません。

次に強い研究へ進むなら別研究として事前登録し、

- gate ON/OFFのランダムまたはinterleaved shadow比較
- 別AIによる再現
- 別組織・別codebaseでの再現
- trigger妥当性と結果品質のblind評価
- gateによる時間・tokenコスト測定

へ進むのが妥当です。

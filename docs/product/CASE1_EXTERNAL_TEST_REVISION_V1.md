# CASE1 EXTERNAL TEST REVISION V1

`PHASE 4.4`。`CASE1_C_COMPLETE_DESIGN_V1.md`（「だれからの、ありがとう」）は履歴として残す
——本文書がその後継であり、production側もこちらへ切り替える。Owner実機評価
（GAME FEEL改善／CURIOSITY弱い／ACTION部分的で誘導感あり／AHA弱い／NEXT好意的）を受け、
**CASE1のMYSTERY自体を白紙から疑い直した**。既存実装量を理由にA/Bを優遇しない指示に従い、
最も評価が高かった案Cへ全面差し替えする。

## 1. Owner feedback反映表

| Owner評価 | 対応 |
|---|---|
| GAME FEEL：かなり高まった | KEEP——scene上のTAP/TALK/COMPARE基盤はそのまま流用 |
| CURIOSITY：知りたくなったか微妙 | MYSTERY自体を差し替え（Section2〜3） |
| ACTION：誘導感がある（選択肢が少ない） | REQUIRED/OPTIONAL/IRRELEVANT-BUT-NATURALの3層で各sceneを再設計（Section6） |
| AHA：多少あるが強くない | 4要素中3つが収束する構造＋フェア出題の徹底（Section8/9） |
| NEXT：自分から見に行きたい | KEEP——Next Hookの文面は変更なし（Section12） |

## 2. CASE1 3案比較

| 評価軸(5点満点) | A. 現行強化 | B. 現行+矛盾追加 | **C. 完全新作（採用）** |
|---|---|---|---|
| FIRST 30 SEC CURIOSITY | 3 | 4 | **5** |
| WHY STRENGTH | 3 | 3 | **4** |
| INVESTIGATION POTENTIAL | 4 | 4 | **5** |
| HUMAN PREDICTION | 3 | 3 | **4** |
| AHA POTENTIAL | 3 | 4 | **4** |
| CHARACTER VALUE | 4 | 4 | **4** |
| VISUAL GAMEPLAY | 4 | 4 | **5** |
| NEXT DESIRE | 4 | 4 | **4** |
| **合計/40** | 28 | 30 | **35** |

**判定理由**：「だれからの、ありがとう」という題材自体が、良いことをされた側が受け取るだけの
低リスク・低緊張の出来事であり、謎としての引力に構造的な天井がある（案Bのように矛盾を
足しても、核が「親切をされた」である限り強い謎にはなりにくい）。**案Cは「自分の物が、
似た別の物にすり替わっている」という、視覚的に一目で分かる矛盾から始まり、悪意・偶然・
善意のいずれもあり得る状態を終盤まで維持できる**——CURIOSITY/INVESTIGATION/AHAの
天井が明確に高い。

## 3. 採用シナリオ：「もう一台の自転車」

### Mystery one-liner

> 自分の自転車がない。代わりに、そっくりな別の自転車と、知らない子供の絵本が残されている。

### Information Gap設計

| 区分 | 内容 |
|---|---|
| PLAYERが知っていること | 自分の自転車がない／似た自転車がある／カゴに図書館の絵本（返却期限は今日） |
| PLAYERが知らないこと | 誰が、なぜ持っていったか |
| PLAYERが勘違いしやすいこと | 盗まれた、という早計な結論——**おじさん自身が開始直後にこれを口にする**（Section10のcharacter moment） |
| 途中で分かること | 自転車店で「同じ型番が去年たくさん売れて、よく間違えられる」という土地柄の事実、絵本の返却期限が今日であること |
| 最後まで伏せること | 持ち主の名前（「若いお母さんと小さな子供」という描写に留め、REVEALで直接姿を見せて解決する） |

序盤で「盗難」「単純な間違い」「誰かが緊急で借りた」の3仮説が同時に成立しうる状態を作り、
自転車店の証言で「単純な間違い」が有力になるが確定はしない——最後まで人物が実際に現れるまで
断定しない（Section11 Hypothesis Space）。

### ほっこりおじさんキャラクターmoment（Section16）

SCENE A開始直後、おじさんは自転車の異変を見て「こ、こりゃ泥棒だ！」と早合点する
（説明文でなく発話として）。探偵が「まだ分からないだろ、それは」と軽く受け流す。
この早合点じたいがPLAYERの最初の仮説の1つとして機能し、あとの投資で「早計だった」と
分かる——`CHARACTER_BIBLE_V1.md`の「早合点しやすい」という設定を、初めて実際のCASE本文で
行動として実演する。

### Scene構造（REQUIRED / OPTIONAL / IRRELEVANT-BUT-NATURAL）

| SCENE | REQUIRED | OPTIONAL | IRRELEVANT-BUT-NATURAL |
|---|---|---|---|
| A 公園（発見） | 自転車を調べる（PRIMARY）／絵本を調べる（SECONDARY） | ハンドルのキラキラシール（CHILD_STICKER、フェア出題の伏線） | 公園の掲示板（焼き芋会のお知らせ、事件と無関係） |
| B 商店街 | 自転車店の店主に話す（HUMAN：同型多発の事実） | 皆川さん（事件と無関係な世間話、Section8の必須NPC）／大将（弱い目撃談、任意） | — |
| C 公園（再訪） | 待つ→人物が現れる→HUMAN PREDICTION→REVEAL | — | — |

「光っている物＝正解」を避けるため、OPTIONAL対象はすべて視覚的に均等な扱いにする
（reward-tagの出方を統一し、CLUE FOUNDと同じ見た目で表示——プレイヤーが事前に
重要度を判別できないようにする、Section7）。

### Human Prediction再設計（Section12/13）

3つの文章ボタンではなく、scene上に配置した3つの「行動アイコン」から選ぶ形式に変更：
🙇（頭を下げる）／🏃（気づかず持っていこうとする）／😳（固まる）。実際の反応
（気づいて謝る）は予想と独立し、探偵の一言のみが差分に応じて変化する
（既存`detectiveReactionToPrediction`と同じ設計原則を新シナリオへ移植）。

### AHA構造（Section14/15）

REVEAL時に収束する要素：①PRIMARY（そっくりな自転車）②SECONDARY（絵本の返却期限）
③HUMAN（自転車店の「同型多発」証言）④OPTIONAL・CHILD_STICKER（見つけていれば追加の
一言で回収、見つけていなくても解決に支障なし）。**REVEAL前に確認可能な情報のみで構成**
——持ち主の年齢・状況は自転車店の証言と絵本の内容から類推可能な範囲に留め、後出し情報を
使わない（Fair Mystery、Section15）。

### Character Memory（Section17）

- ほっこりおじさん：「早合点するけど、憎めない」人物として印象づける
- 自転車店の店主：新規登場、「同じ自転車ばかり売った」という一言だけで機能面のキャラが立つ
- 皆川さん：既存アセットを再利用し、事件と無関係な世間話でコストゼロの人物味を足す

### Next Hook（Section18、KEEP）

内容はCASE1の題材と独立しているため変更しない：三日月珈琲の急な休業＋マスターの
不審な仕草。

## 4. Visual Polish方針（Section19）

全画面を豪華にはしない。優先順位：①INVESTIGATION（scene上のobject/人物） ②COMPARE
（自転車の比較） ③HUMAN PREDICTION（行動アイコン） ④AHA/REVEAL（要素が並ぶ演出）。
「読む画面」だった close-up/dialogue系パネルに、薄い背景色レイヤーと関連オブジェクトの
ミニ描画を追加し、真っ白のフォーム的印象を弱める（詳細は実装のcase1c.css差分）。

## 5. External Test Mode（Section20〜23）

- HOME側の導線ラベルを「🚲 テスト版 CASE1」に変更し、開発者向けの内部名（「だれからの、
  ありがとう」「vertical slice」等）はPLAYERに一切見せない
- 開始前にOwner管理のテスターコード（例：T01）を**任意入力**で受け付ける（氏名等の
  個人情報は一切収集しない）
- CASE FINALE後、5問5段階＋自由記述1問のfeedback screenを追加

## 6. 実装範囲

`src/case1c/`の同じ engine（Case1CApp.tsx の scene ステートマシン、hotspot/satchel/companion
line の仕組み）を流用し、シナリオ内容（visuals・テキスト・clue定義）のみ「もう一台の自転車」
へ全面差し替える。`episodes/`・`pilot/`には触れない。

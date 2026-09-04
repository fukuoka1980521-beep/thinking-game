# DECISIONS — 思考整理ゲーム MVP v0.1

## PHASE 4.7：CASE1 LIMITED EXTERNAL TEST RELEASE（Owner承認・独立レビュー反映）

Owner承認によりmasterへpush・GitHub Pages自動デプロイを実施したRun。push前の独立レビュー
（本標準§3の重大停止条件外だが、公開・外部送信を伴うRELEASE区分としてCode自身が1回実施）が
2件の実害あるギャップを検出し、いずれも同一Run内で修正した。

### なぜtopbarの「やめる」ボタンをstandalone対応させたのか

独立レビュー指摘：`onExit`を無条件に呼んでおり、`?case1test`経由の外部テスターが試験途中で
「やめる」を押すと、DONE画面のstandalone分岐（Section5対応）を経由せずHomeScreenへ遷移して
しまっていた。DONE画面だけを直したことで、終了ルートの一つを直し忘れていた。`handleQuit`を
新設し、standalone時は`onExit`を呼ばずDONE画面（既存の結果コピー機能を含む）でその場終了する
よう修正。Owner自身がHome経由で遊ぶ非standaloneの動作は変更していない。

### なぜepisodes/・pilot/を今回のcommit対象から外したのか

独立レビュー指摘：(1) `src/screens/HomeScreen.tsx`のepisodes/pilotボタンは、CASE1テスター用の
`?case1test`直リンクとは無関係に、常時・無条件で表示される——今回のpushで初めてこのHome画面が
公開される以上、「CASE1以外は非公開」という前提が成立していなかった。(2) 実際に
`src/episodes/steps/CompanionCommentStepView.tsx`のCOMPANION_COMMENTステップに、
`DIALOGUE_ENDPOINT_URL=""`（今回の本番設定）かつ初回PLAYER（consent未設定＝null）という、
実際に誰もが最初に踏む組み合わせで無限ローディングに陥るデッドエンドが存在した——
`eligibleForRealAi`がfalseになる分岐と、`consent !== null`のときのみ`run()`する分岐の間に
穴があり、両方ともfalseになるケースが放置されていた。episodes/pilot関連のテスト
（`tests/pilot.test.tsx`・`tests/scriptFirstStory.test.tsx`）がこのデッドエンドを検出できな
かったのは、テスト側が`vi.mock`で`DIALOGUE_ENDPOINT_URL`を非空文字列にスタブしていたため
（`tests/realCompanionDialogue.test.tsx`の手法を踏襲）、実際の本番設定（空文字列）经路を
一度も通していなかったためである。

Owner指示（Section1「公開対象の目的はCASE1のみ」）とこの実バグを踏まえ、episodes/・pilot/・
関連データ/lib/テストファイル一式を**今回のcommitから除外**した——ソースコード自体は削除せず
作業ツリーにそのまま残し、`src/App.tsx`・`src/screens/HomeScreen.tsx`からの配線（import・
View分岐・Home上のボタン）のみを外した。再度組み込む場合はこの2ファイルへ配線を戻すだけで
よい。あわせて`docs/product/`のうちCASE1と直接関係しない全体プロダクト戦略文書
（`MONETIZATION_MODEL_V1.md`・`PRODUCT_AUDIT_V1_1.md`・`SEASON1_SCENARIO_BIBLE_V1.md`・
`THINKING_GAME_PRODUCT_SPEC_V1.md`）も同じ理由でcommit対象から外した
（`CASE1_C_COMPLETE_DESIGN_V1.md`・`CASE1_EXTERNAL_TEST_REVISION_V1.md`・
`CHARACTER_BIBLE_V1.md`はCASE1自体の設計文書または既存コードコメントから直接参照されている
ため対象に含めた）。

### なぜ検証を「作業ディレクトリ全体」ではなく「staged内容のみ」に対して行ったのか

`git add`で個別ファイルを指定してstageした後、`git stash push --keep-index -u`で未stage分
（episodes/・pilot/等）を一時退避し、staged内容だけの状態で`tsc --noEmit`・
`npx vitest run`・`npm run build`をすべて実行してから`git stash pop`で復元した。ローカルの
作業ディレクトリには常にepisodes/pilotの未commit差分が残っているため、それらを含めたまま
検証すると「実際にpushされる内容」の健全性を検証したことにならない——CIはpushされたcommitの
内容だけを見るため、ローカル検証もそれに合わせた。

## PHASE 4.6：CASE1 SMALL EXTERNAL USER TEST PREPARATION（Owner GO判断）

Owner GO判断（内部改善を止め、実際の第三者3〜5名へ触ってもらう）を受けたRun。CASE1のシナリオ・
台詞・キャラクター・interaction・visualはFREEZEし、テストを成立させるための計測・保存・配布の
インフラのみを追加した。「もっと良くできる」を理由にした変更は行っていない。

### なぜCaseFileRecordを単一値保存から配列保存へ変えたのか

`saveCase1CRecord`（`src/case1c/storage.ts`）はPHASE4.4まで`localStorage`へ単一オブジェクトとして
上書き保存していた。3〜5名を同じ端末で連続プレイさせるという今回の運用では、2人目が完了した時点で
1人目の記録が消える。`loadCase1CRecord()`（最新1件を返す）の既存契約は維持しつつ、内部保存形式を
配列へ変更し、全件を読める`loadAllCase1CRecords()`を追加した。テスターごとの生データを個人差ごと
残す（Owner Section14「平均点だけで個人差を消さない」）ための変更であり、CASE1本体のゲーム内容には
無関係。

### なぜsessionIdを新設したのか

同じ端末で複数テスターが連続プレイするため、`Case1CMetricEvent`の平坦な配列だけでは「どのイベントが
どのテスターのものか」を後から機械的に区別できない。`Case1CApp`のmountごとに1つ生成する`sessionId`
（`newCase1CSessionId`、`crypto`非依存の簡易ID）を全metricsイベント・CaseFileRecord・
FeedbackAnswersへ共通で持たせ、`src/case1c/testResults.ts`がこれをキーに1テスター＝1行へ集約する。
新しい保存テーブルは作らず、既存の3つのstore（metrics/casefile/feedback）を読み合わせるだけに
した——Owner Section12が要求するフィールド（tester_code、duration、optional_object_countなど）は
すべてこの3ストアの既存データから導出可能で、冗長な保存を増やす理由がなかった。

### なぜOWNER_ASSISTをtopbarの小さなボタンにしたのか

Owner Section6/7は「Ownerが補助した場合はOWNER_ASSISTとして記録」を求めている。自動推定は誤検出の
リスクがあり本質的に不可能（「補助した」はOwnerの主観的判断）なため、Owner自身が明示的に押す以外の
実装を採らなかった。テスターの操作フローには一切介在しない場所（topbar、常時表示だが物語画面としては
機能しないゲームchrome領域）に、目立たない小さなボタンとして置いた——テスターが誤タップしても
ゲーム進行に影響しない設計。

### なぜ`?case1test`と`?case1results`という直リンクを追加したのか

HomeScreen（`src/screens/HomeScreen.tsx`）は「今日の1問」「実話でためす」「事件簿 Pilot」など
CASE1以外の未完成プロトタイプへの入口を複数持つ。Owner Section19/20の配布監査で、外部テスターが
ホーム経由でCASE1へ到達すると、この他の未完成機能へ誤って迷い込むリスクが明確になった。
HomeScreenの構成自体を変更する（ボタンを消す・並べ替える）のは今回のFREEZE対象外の変更が広範囲に
及ぶため避け、代わりにURLクエリパラメータで直接CASE1（`?case1test`）または結果閲覧
（`?case1results`）へ入る経路を追加した。どちらもHomeScreen等のどの画面からもリンクされていない
ため、テスターは配布されたURLを直接開かない限り到達できない。

### なぜOwner result viewを新しい保存先を作らず既存3ストアの読み合わせにしたのか

Section13は「豪華なdashboard不要、集計値だけでなくRAW結果を残す」ことを求めている。
`Case1TestResultsScreen`は`testResults.ts`が返す行をテーブル表示し、行ごとに生JSONを展開できる
だけの単純な画面とした。PASS/FAIL/success rateのような自動判定は一切行わず（Section15）、
数値をそのまま並べるに留めている——最終判断はOwnerと参謀が行うという指示に対応するため。

## PHASE 4.5：外部テスト直前ファイナルポリッシュ（Owner再評価対応）

Owner再評価（GAME/CURIOSITY/INVESTIGATION/AHA/NEXTすべて前進、ただし「探偵が早く意味付けする」
「最後の台詞が状況に噛み合わない」「キャラクター精度が要改善」の3点を明確な問題として指摘）を
受けたfinal-polish Run。CASE1本体のシナリオ・謎の構造は変更していない（Owner指示の
「CASE1大幅scenario変更禁止」に従う）。

### なぜdetectiveの予想反応台詞をREVEAL画面内で後ろへ移動したのか

`detectiveReactionToPrediction`（`src/case1c/companionLines.ts`）の各分岐、特に固まる予想時の
「案外すぐ謝ってきたな」が、修正前は自転車の持ち主（親）自身の謝罪台詞「すみません、図書館の
返却が今日までで……」より**先に**画面へ出ていた。これは探偵がPLAYERより先に「もう謝った」という
結末を言葉にしてしまっており、Owner指摘「PLAYERより先に探偵が真相を理解しない」に反する。
台詞の文言（3分岐とも）は変更せず、`Case1CApp.tsx`のREVEAL画面内での描画順序だけを、
親の謝罪＋任意のシール発言の**後**に探偵の反応が来るよう入れ替えた。文言はそのままでも、
出す順序を変えるだけで「PLAYERが読み終えた出来事に対する相槌」に意味が変わる。

### なぜSHIFT（ENDING直前）の探偵の台詞を「まったくだ。」から変更したのか

Owner指摘②「最後の台詞が、その時点の出来事・人物心理と意味的に合っていない」への対応。
「まったくだ。」はおじさんの自嘲（「いやあ、泥棒は言い過ぎたな」）への相槌として平板で、
探偵というキャラクター固有の情報を何も持っていなかった。探偵は序盤で早合点したおじさんを
「まだ分からないだろ、それは。」と制止した張本人であるため、終盤で「ほら、言った通りだろ。」と
その伏線を回収する形に変更した。真相の解釈を新たに追加するConclusionではなく、あくまで
「おじさんの早合点癖」という既知のキャラクター特性への軽いツッコミに留めている。

### なぜHUMAN PREDICTIONの設問文を「気づいたら、どうすると思う？」から変更したのか

Owner指摘「予想か設問か未解決」への軽微対応（全面改造はしない指示のため）。「あなたはどう
思いますか」型そのものではなかったが、「〜と思う？」という語尾がPLAYER自身への意見聴取に
近い響きを持っていたため、「気づいたら、どう動く？」というscene上の出来事の帰結を尋ねる
表現へ寄せた。外部テスターでも同じ違和感が出るか確認する価値があるため、これ以上は変更しない。

### なぜOjisanFigureをSVGから既存PNGアセットへ置き換えたのか

Owner指摘「既にキャラクター素材を提供している。それを無視して新しい仮キャラを完成形にしない
こと」への対応。`src/assets/ossan-cheerful.png`・`ossan-listening.png`（透過PNG、185×320、
`src/episodes/steps/*StepView.tsx`で既に採用実績あり）をOjisanFigureの正式な描画に採用し、
`src/case1c/`内のCASE1シーン（PARK_A・PARK_C・SHIFT）へ反映した。探偵・店主・皆川さん・大将・
親子はOwner提供素材が存在しないため、引き続きSVGプレースホルダーのまま——新規キャラクターを
勝手に正本化しないという指示に従い、代替素材を作らず既存のまま維持した。

**既知の不足（新規作成せず報告のみ）**：おじさん用の提供済みポーズは「cheerful（笑って手を
振る）」「listening（手を組んで聞く）」の2種のみで、「早合点して驚く」表情・ポーズは存在しない
（`StoryStepView.tsx`のV0.5監査コメントで既出の既知の限界と同一）。PARK_Aの「こ、こりゃ泥棒だ！」
場面ではlisteningを、それ以外の落ち着いた場面ではcheerfulを暫定的に充てている。

## THINKING_GAME_NARRATIVE_PIVOT_AND_3CASE_PILOT関連の意思決定（前Run、CLOSE未実施）

> **重要**：本節が記録するepisodes/pilot実装（`src/episodes/`・`src/pilot/`・
> `src/data/episodes/`）は、本項作成時点で**未コミット**である。技術テスト
> （vitest 226件全PASS・`tsc --noEmit`クリーン・`vite build`成功）は通っているが、
> これは「ゲームとして成立している」ことの証明ではない。最終的な成功条件は
> Ownerが実機で「もう1事件やりたい」と感じるかどうかであり、それが確認できる
> までこのRunをCLOSEしない。push・GitHub Pages反映も行っていない。

### なぜ「設問→選択→AI介入→再判断」という構造そのものを離れたのか

`THINKING_GAME_FUN_FIRST_PROTOTYPE`（V0.2、上節）までの改善は、AI応答の多様化や
画面文言の調整を重ねても、Owner実プレイのたびに同じ種類の指摘が繰り返された：
「何をしているゲームか分かりにくい」「アンケート/教材感が強い」「AI会話を良くしても
ゲームとして弱い」「固定質問を磨くだけでは利用したくならない」。局所改善では
解決しないという判断に至り、「考えさせるために質問する」という設計の起点自体を、
「物語の続きを知りたい」「手掛かりを自分で探したい」「この人は次にどうするか
予想したい」という欲求から出発し、結果として考えてしまう構造へ転換した。

### episodes/（物語型episode engine）

この方向転換を試すために新設した機構。共通ステップ種別として story／explore／clue／
prediction／companion／new information／re-prediction／ending／reviewを持つ。
HYP-001〜007・REAL-002〜004として試行錯誤した資産群であり、**この物語構造自体を
最終製品として確定したわけではない**——後述のpilot/がそのための縮小模型である。

### companionの設計意図（AIは相棒であり神ではない）

相棒AIを教師・採点者として設計しない。プレイヤーの回答に対し別の見方を短く提示する
「ゲーム世界内の同行者」とし、以下を明示的にAIの権限外とした：正解を決める／
プレイヤーを評価する／能力診断する／未来のstory factを知る／endingを決める／
progressionを決める。story facts・clues・ending・progressionはすべてdeterministic側
（静的ケースデータ）が管理し、AIはそこに介入しない。

### なぜepisodes実装を止めてpilot/（3話の縮小模型）を作ったのか

episodesを作り続けた結果、「部品ばかり作っていて最終製品像が見えない」という
Owner判断が出た。そこで新規episode追加を止め、FINAL PRODUCT BLUEPRINT →
3話完全脚本 → 3話PLAYER JOURNEY → 必要state → data model → Pilot実装、という
順に手順を変えた。`src/pilot/`はepisodes/の既存ステップ種別・コンポーネントを
**無改変のまま**再利用する追加モジュールであり（`src/pilot/types.ts`冒頭コメント
参照）、目的は新機能の実装ではなく、Owner自身がCASE1→CASE2→CASE3を一本のゲームとして
遊び、最重要仮説「もう1事件やりたいと思うか」を検証することにある。

### Pilotの成長設計（数値化しない）

XP・level・score・ranking・能力値・性格診断のような数値化を明示的に禁止した。
代わりに「遊んだ結果、世界と選択肢が増える」という手触りを試している：CASE1完了で
虫眼鏡を獲得し事件簿1件目が記録され観察者がunlockされる、CASE2完了でCASE3がunlockする、
CASE3では複数情報源を扱う、という設計。

### 1回目のOwner実プレイ結果と、それを受けたPHASE 2.1

3話Pilot実装後のOwner実プレイでの評価は「GOOD：かなり雰囲気は良くなっている」/
「PROBLEM：ゲーム感をもう少し強くした方がよい、目的が分からない」だった。全面却下では
なく、物語型への方向転換自体には改善信号が出た一方、プレイヤーが「自分は何者か」
「何をするゲームなのか」「今何を追っているのか」「事件完了によって何が起きたのか」を
十分理解できない問題が残っていた。

この指摘を受け、PHASE 2.1（PLAYER PURPOSE + GAME FEEDBACK）として以下を実装済み
（`src/pilot/screens/PilotIntroScreen.tsx` Section1/2、`PilotCaseIntroScreen.tsx`
Section3、`ExploreStepView.tsx`/`ToolUseStepView.tsx`/`StoryStepView.tsx`のCLUE FOUND
Section4、`ToolAcquireStepView.tsx`のNEW TOOL Section5、`PilotCaseFileAddedScreen.tsx`の
CASE CLOSED/NEW COMPANION Section6/7、`PilotHomeScreen.tsx`のworld-entry framing
Section8/9）：プレイヤーロール（「事件簿係」）とゲーム目的の明示、ケースごとの
hook/objectiveLine表示、手がかり発見・道具獲得・ケース完了・相棒unlockの各瞬間を
reward-tag（CLUE FOUND／NEW TOOL／CASE CLOSED／NEW COMPANION）で明示するフィードバック、
HOME画面を「ダッシュボードではなく世界の入口」として再構成。数値報酬・XP・レベル・
バッジ等は今回も使っていない。`tests/pilot.test.tsx`にPHASE 2.1 Section1〜9それぞれの
自動テストがあり、3ケース通しプレイ・ロック画面直接アクセスガード・AI既知事実
ファイアウォール・モバイル320px横スクロール無しまで含めて全件PASS。

**この実装はOwnerの1回目の実プレイ後に書かれたものであり、Owner自身はまだこの
PHASE 2.1版を実際にプレイしていない。** 技術テストのPASSは「目的が分かるようになったか」
「ゲーム感が強くなったか」というOwnerの体感の代わりにはならない。次に必要なのは
追加実装ではなく、Owner自身によるこのPHASE 2.1版の再プレイと評価である
（CHECKPOINT: `OWNER_PILOT_PURPOSE_GAMEFEEL_READY`）。

### PHASE 2.1のOwner再プレイ結果 = FAIL（PHASE 3への移行）

Owner自身がPHASE 2.1版（役割/目的表示＋CLUE FOUND/NEW TOOL/CASE CLOSED/NEW COMPANIONの
reward-tagフィードバック一式）を実際に再プレイした。判定は`OWNER_PILOT_PURPOSE_GAMEFEEL_READY`
= **FAIL**。全面否定ではなく、以下を事実として記録する。

改善が確認できた点：雰囲気は以前よりかなり良くなった。

FAILの内容：
- 目的表示を追加しても「ゲーム」だと感じにくく、「ただのアンケートを工夫した感じ」という
  評価だった。
- 基本体験が依然として「文章→選択肢→文章→選択肢」のままであり、CLUE FOUND/NEW TOOL/
  CASE CLOSEDのreward-tagを足しても、その下にあるアンケート型の構造自体は変わっていない
  ことが根本原因と判断された。
- 具体的な不具合（1）：companion（探偵）の発言がプレイヤー発言の要約・言い換えに見え、
  会話として不自然。実装を確認したところ、原因は`src/data/companions.ts`の
  `frameInsight: (insight) => "整理すると、${insight}"`と、各episodeのテーマ定義
  （例：`src/data/episodes/hyp-007.ts`の`THEME_TIMING.insight`）が最初から「プレイヤーの
  発言を要約した一文」として書かれている点にある。**この構造は4キャラクター全員の
  `frameInsight`実装（探偵/あまのじゃく/観察者/作戦家）に共通しており、CASE1固有の
  バグではなく`companions.ts`という共有基盤の問題**であることが判明した。
- 具体的な不具合（2）：CASE2で、プレイヤーがまだ世界内で認識していない人物（田中さん／
  八百屋さん／佐藤さん）が前触れなく選択肢として提示され、選ぶ理由がない。
- 具体的な不具合（3）：CASE3で、メール返信が遅い程度の出来事から聞き込み等の調査行動へ
  進む動機が弱い。
- 画像がもっと欲しいという要望があった。

Ownerの指示により、(2)(3)（CASE2/CASE3自体の変更）は今回のスコープに含めない
（変更禁止・追加ケース禁止として明示された）。今回はCASE1のみを対象に、「文章→選択肢」
という基本構造そのものを「画面内の世界を見る→触る→発見する→道具を使う→手掛かりを集める
→予想する」という直接操作型（ライトアドベンチャー）へ作り替える仮説を、**まずコードでは
なくstoryboardとして設計検証する**フェーズへ移行する（PHASE 3）。

### PHASE 3の成功条件と禁止事項

成功条件はコードが書けることではなく、storyboardをOwnerが見て「これなら前よりゲームに
見える」「実際に触ってみたい」と思えることである。ここを通過するまで実装しない。

本Runで明示的に禁止された事項：CASE2/CASE3の変更、CASE4の追加、既存Pilotの改修、
production codeの変更、commit、push、deploy、GCP変更。CHECKPOINT
`OWNER_CASE1_INTERACTIVE_STORYBOARD_READY`のOwner承認前に実装へ進まない。

## THINKING_GAME_FUN_FIRST_PROTOTYPE関連の意思決定（前Run）

### CORE_GAMEPLAY_V0_2_FAILED

Owner実機評価：「少しは良くなっているがゲームとしての楽しみはない。それとわかりにくい。」

V0.2（設問・選択肢の同一軸化、intervention mode多様化）はOwnerに追加の修正依頼ではなく**却下**
された。V0.2で行った改善それ自体が無駄だったとは書かない（実際、AIが個別の入力に反応している
という感触はOwnerからも得られていた）が、それだけでは「ゲームとしての楽しみ」を作るには不十分
だったという事実として扱う。

**原因仮説（仮説であり確定原因ではない）**：measurement-first UI overload——1ケースが要求する認知
操作（事実／解釈の分類、確信度入力、情報オプションの複数選択、自由記述理由、AI応答、問題分類、
新事実、再判断、確信度再入力、振り返り記述、RESULT）が多すぎ、「思考データを測るための画面」に
なっており、「遊んだ結果として思考データが残るゲーム」になっていない。V0.2はこの構造そのものには
手をつけず、各画面の文言・AI応答の多様性だけを直したため、体験の重さ自体は変わらなかった。

### Section 4: CASE-001候補の比較（教育的価値ではなく「続きが気になるか」で選定）

**候補A（現状維持・改稿）— 日常ミステリー**：同僚が既読無視。真相は自動既読設定。低リスクで手堅いが、
賭け金（何を失う／得るか）が低く、「気になる」度合いが弱い。

**候補B（新規）— 仕事上の判断**：部下が急に在宅勤務に切り替えた理由を考える。真相は交通機関の遅延と
いう単純な話。オチとしては悪くないが、入口の状況（「今日は在宅で作業します」）自体に感情的なフックが
弱く、続きを見たいという牽引力が候補A・Cより弱いと判断した。

**候補C（新規）— 人間関係のすれちがい**：仲の良い友達グループで、親友が既読はつくのに1週間反応が
ない。「自分が何かしてしまったのでは」という関係不安に触れるため、他の2候補より感情的な牽引力が強い。
真相は「本人が別の事情（資格試験の追い込み）でスマホどころではなかった」——「自分たちが原因」という
思い込みから「本人の事情」への視点の反転があり、「え、そうだったの？」に加えて安堵・共感という
感情の動きも作れる。医療・犯罪等の高リスク題材（`docs/SAFETY_PRINCIPLES.md`）には触れない。

**結論**：候補Cを採用。CASE-001のタイトル・状況・選択肢・新事実をすべて候補Cへ差し替える。
`transferTarget`で参照されるTRANSFER-001は別の題材（ニュースアプリの通知）で完全に独立しており、
CASE-001のストーリーを変更してもTRANSFER-001側への影響はない。

### Section 5: AI = PARTNER（実装前の結論）

4キャラクター（DETECTIVE/DEVIL/OBSERVER/STRATEGIST）のインフラは撤去しない（前Runの結論を維持）
が、CASE-001が実際に使うキャラクターを新設の`PARTNER`（相棒）に切り替える。理由：既存の
「探偵（事実と解釈を分離する）」という役職表示自体がAIメッセージの吹き出しに常時表示されており、
これ自体が「わかりにくい」の一因になり得る、分析的な役職ラベルだったため。`PARTNER`は役職ラベルを
「一緒に考える」という非分析的な表現にし、応答も2〜3文・分類用語なしのカジュアルな口調へ調整する。

### Section 1: REMOVE BEFORE ADD（CASE-001のplayer-facing flowから今回外したもの）

OBSERVED FACT独立画面／confidence slider／infoOptions複数選択／AI problem taxonomy／reflection
入力を、CASE-001に限り非表示にする。内部schema（`ObservedFactInput.factCheckAnswer`、
`FirstDecisionInput.confidence`/`infoOptionsSelected`、`AiActionInput.problemTypeSelected`、
`reflectionNote`）は削除せず、既定値を自動的に補完してTrajectoryLog/RubricResultの構造は維持する
（`CaseData.simplifiedFlow: true`というopt-inフラグで分岐、CASE-002〜005・TRANSFERは無変更）。
これにより、前Run・前々Runで「共有UIのため変更できない」と記録していたAI_INTERVENTION画面の
専門用語taxonomy（根拠不足／因果関係の混同等）も、CASE-001に限りついに解消できた。

## THINKING_GAME_CORE_GAMEPLAY_REDESIGN関連の意思決定（前Run）

### CORE_GAMEPLAY_FAILURE_EVIDENCE（Owner実機評価、そのまま記録）

「文章を読んでいると感じる部分もあるが画一的。面白みがない。想定ケースの設問と選択できる回答に
ギャップを感じる。何をしようとしているか目的がわからない。」

これはcopy polishの指摘ではなく、CORE GAME LOOP FAILUREとして扱う。実装したことをもって「改善した」
とは書かない——Ownerが実際にプレイして判断するまでは未検証のまま。

### Section 1: CURRENT EXPERIENCE AUDIT（初見利用者の画面順）

1. **HOME**：目的の入口としては機能するが、「AIと一緒に考えるゲーム」という体験の芯は説明されない。
2. **CASE_INTRO**：`category`フィールドが「事実と解釈」という学術的なラベルをそのまま画面に表示して
   いる。ストーリーが始まる前に「これは分類学習です」と宣言しているのに等しく、目的誤解の一因。
3. **OBSERVED_FACT**：「次の1文は「事実」ですか、それとも「解釈」ですか？」という設問と、ボタン
   「事実（確認できていること）」「解釈（推測・意見）」は`ObservedFactScreen.tsx`にハードコードされた
   全ケース共通の文言であり、CASE-001固有ではない。プレイヤーがまだ自分の意見も言っていない段階で、
   単文の分類ドリルを解かされる構造は、探偵的な「最初の一目」というより教科書の設問に感じられる。
   **この画面の枠組み自体は7ケース共通の基盤であり、本Runのスコープ（CASE-001のみ）を超えるため
   今回は変更しない**。ただし目的誤解の実在する一因として正直に記録し、次Runの優先候補とする。
4. **FIRST_DECISION**：設問「今ある情報だけで、この状況をどう考えますか？」は広く開かれた聞き方だが、
   選択肢5つは「なぜ返信がないか」という具体的な理由当てフォーマットに閉じている——設問の抽象度と
   選択肢の具体度がずれており、これがOwnerの言う「設問と選択できる回答のギャップ」の直接的な原因と
   判断した。さらに旧選択肢のうち「無視している」は結論の断定に近く、「まだ内容をきちんと読んで
   いない可能性がある」は技術的メカニズムの指摘に近く、選択肢同士の性質も微妙に異なる種類の主張に
   なっていた。
5. **AI_INTERVENTION**：静的フォールバック・個別化フォールバックのいずれも「根拠はありますか？」
   「何を確認すればよいですか？」という同一パターンへ収束しており、これがOwnerの言う「画一的」
   「面白みがない」の核心。加えて、この物語（同僚とのチャット）にAIが介入する必然性が一度も
   説明されていない。
   **さらに監査で判明した点**：AI_INTERVENTION画面には全ケース共通で「気になる点はありますか？」＋
   `AI_TRAP_TAXONOMY_OPTIONS`（根拠不足／因果関係の混同／標本不足／意図の決めつけ／過度な一般化／
   情報不足／問題なし）という、統計・批判的思考の専門用語に近い分類ドリルが必須選択として挿入されて
   いる。CASE-001は`aiTrap.present: false`のためこの分類結果はrubric上ほぼ意味を持たないにも
   かかわらず、プレイヤーは毎回これを解かされる。これは「目的がわからない」「面白みがない」への
   **もう一つの大きな寄与要因**だと判断するが、7ケース共通のability signal基盤（`falsificationConsidered`）
   に直結する共有UIであり、CASE-001だけを安全に変更する方法がない。**本Runのスコープ外として明記し、
   次Runの最優先候補として記録する**（生半可に手を出して他ケースを壊すリスクを取らない）。
6. **NEW_FACT**：新事実は「実は通知が鳴らない設定だった」という妥当だが驚きの小さい説明。読み手が
   既に予想していそうな穏当な種明かしであり、「え、そうだったの？」という体験を強く作れていない。
7. **SECOND_DECISION / REFLECTION / RESULT**：機構としては妥当。RESULTは前Runで既に「あなたの判断」
   トラジェクトリ表示へ作り替え済みで、本Runが目指す「推理の変化を見せる」という要求とほぼ合致して
   いる——大きな変更は不要と判断した。

### Section 2: PLAYER-FACING PURPOSE（再定義）

内部の測定目的（OBSERVATION能力の測定等）はrubric層に隠したまま、CASE-001自体の体験を通じて
「状況を読む→自分ならこう考える→AIに別角度から揺さぶられる→新しい手がかりが出る→考えが変わる／
変わらない→自分の推理の変化が見える」という遊びとして伝わるように、設問・選択肢・AI応答・新事実・
RESULT表示のすべてを同じ一本の軸（＝ミナさんの行動をどう読むか）で貫通させる。「思考力を測定します」
「事実と解釈を区別してください」という授業的な言い回しはCASE-001の新規コピーに一切使わない。

### Section 6: AI CHARACTER再評価（実装前の結論）

比較対象：A. 4キャラクター（DETECTIVE/DEVIL/OBSERVER/STRATEGIST）を維持 vs B. 1 companion +
可変intervention mode。

**重要な前提事実**：CASE-001は`characterOffered: ["DETECTIVE"]`・`characterChoiceAvailable: false`
であり、Ownerが実際にプレイして「画一的」と評価したのは**DETECTIVE1体の応答の変化のなさ**であって、
4キャラクター間の見た目の類似ではない（Ownerは他の3キャラクターを一度も見ていない）。したがって
「4キャラクターを1つに統合するかどうか」はOwnerが実際に体験した問題の直接の原因ではない。

**結論**：4キャラクターのインフラ（`AiCharacterKey`、`AI_CHARACTERS`定義）はそのまま維持する
（撤去のコストに見合う実益がなく、前Runの実測でDEVIL/OBSERVERは推論機能として明確に差別化できる
ことも確認済み）。その上で、Bが提案する「可変intervention mode」という発想をCASE-001が実際に使う
唯一のキャラクター（DETECTIVE）に適用し、応答が常に「根拠は／確認は」へ収束する画一性そのものを直接
解消する。すなわちA（インフラ維持）とB（可変モードによる多様性確保）のハイブリッドを採用する。

### Section 18: FINAL STATEの確認

このRunの目的はAIを賢くすることではなく、「状況を考える→AIに揺さぶられる→新しい手掛かりを見る→
考え直す」こと自体を面白いと感じる最小の1問（CASE-001）を作ることである。完成後はOwner自身が実際に
プレイして判断するまで、他ケースへの横展開もproduction公開も行わない。

## THINKING_GAME_REAL_AI_DIALOGUE_CORE_EXPERIENCE関連の意思決定（前Run）

### OWNER_PRODUCT_JUDGMENT_RECORDED / PREVIOUS_APPROACH_REJECTED

前Run（THINKING_GAME_PERSONALIZED_DIALOGUE_AND_VISUAL_EXPERIENCE）が実装した構造化シグナルのみに
よる個別化ダイアログについて、Ownerは実際にプレイした上で「この状態なら利用者が使用するとは思えない」
と明確に判断した。理由は前Run自身がKNOWN_LIMITとして記録した通りで、同じ選択肢であれば書いた理由の
内容が変わっても反証・問い返し本体が一切変わらないという制約が、実際に触ってみると致命的に感じられた
ため。この判断を受けて本Runでは、構造化シグナルへの追加のテンプレートや分岐を増やすアプローチを
明示的に放棄し、本物の生成AI（Vertex AI Gemini）による意味理解を伴う対話へ切り替えた。

BASELINE_GENERICITY_REPRODUCED：着手前に、CASE-001で同じ選択肢に対し意味的に大きく異なる3種類の
理由文（意図の帰属／慎重な不確実性／環境要因）を入力し、反証・問い返し本体が3パターンとも完全に
同一であることを再現・記録した（前Runと同じ結論の再確認）。

### なぜGoogle Cloud（Vertex AI Gemini）を選んだのか

DISCOVERの結果、この環境にはOwnerのGoogle Cloudアカウントがすでに認証済みで存在していた
（プロジェクト`gas-test-runner-20260620-wjxf`、本来はGoogle Apps Script/BigQuery用）。Vertex AI
経由でGeminiを呼ぶ場合、Cloud Functions自身のサービスアカウントIDでVertex AIへ認証できる
（Application Default Credentials）ため、**手入力・保存が必要なAPIキー文字列が一切存在しない**
という、他プロバイダのAPIキー方式より一段安全な構成が取れる。この点を理由に、OpenAI等の別プロバイダ
より優先してVertex AIを選んだ。

### 課金・請求先アカウントの壁（OWNER_ACTION_REQUIRED_FOR_REAL_AI）

上記GCPプロジェクトを実際に調べたところ、請求先アカウント（billing account）がそもそも一切
紐付けられていないことが判明した。Vertex AI・Cloud Functions・Cloud Run等の有料APIを有効化するには
Ownerご自身がGoogle Cloud Consoleで支払い方法を登録する必要があり、これは代行できない操作
（決済情報の入力）である。この点をOwnerに確認したところ、「既存GCPプロジェクトでVertex AIを
有効化して使う」との回答を得たが、請求先アカウントの登録自体はOwnerご自身の操作待ちとなっている。

この待機中、安全に進められる範囲（サーバー側Cloud Function本体のコード、フロントエンドの同意画面・
ローディング・リトライ・フォールバックの全機構、evaluation firewallの回帰テスト）はすべて実装・
テスト済みとした。`DIALOGUE_ENDPOINT_URL`が空文字列である現在のデプロイ状態では、この新しい機構は
完全に休眠状態であり、プレイヤー体験は前Run終了時点と一切変わらない（同意画面も表示されず、
ネットワーク呼び出しも一切発生しない）ことを`tests/aiDialogueGateDormant.test.tsx`で保証している。

### デプロイ後の実機テストで発見した2件の実バグ

1. **Cloud Functions Gen 2は`GCP_PROJECT`/`GOOGLE_CLOUD_PROJECT`環境変数を自動設定しない**（Gen 1の
   挙動を前提にしたコードの誤り）。結果、Vertex AIクライアントが`project: undefined`で初期化され、
   `"projects/undefined"`という文字列に対する403 Permission deniedが発生した。`--set-env-vars`で
   `GCP_PROJECT`を明示的に設定して解消。
2. **`gemini-2.5-flash`は`thinkingConfig.thinkingBudget: 0`を無視するという、Google側の既知かつ
   未解決のバグを持つ**（2025年10月に一度修正が展開されたと発表されたが、2025年12月時点でも
   構造化出力やループ実行時に再発するとの報告が複数あり）。実機で確認した症状：`maxOutputTokens`
   全量が内部の「thinking」に消費され、`finishReason: "MAX_TOKENS"`かつ可視の応答本文が0文字になる
   （`thoughtsTokenCount`が予算のほぼ全量を占めていた）。

### thinkingBudget: 0 の採用可否の検討（重要）

上記バグにより、`thinkingBudget: 0`で「thinkingを完全に切る」というアプローチ自体が実機で機能
しないことが判明した。したがって**本Runの最終実装はthinkingを無効化していない**——`thinkingConfig`
指定を削除し、代わりに`maxOutputTokens`を1024→2048へ引き上げて、thinkingとvisible answerの両方に
十分な余地を持たせる方式へ変更した。これは「応答を出すためだけにthinkingを切って意味理解の質を
落とす」という判断ではなく、**thinkingは常に有効なまま**という点を明記しておく。実際の5-input
semantic testで、同じ選択肢でも理由文の内容差（矛盾の指摘、声とチャットという媒体の不一致の指摘等）
に応じて反証の切り口が具体的に変わることを確認しており（詳細は`docs/TEST_PLAN.md`）、意味理解の
質がthinking有効のまま担保されていることを実測で確認済み。

### 429 Resource Exhaustedの分類（推測ではなく実測に基づく）

デプロイ直後の実機テストで2回連続の429 `RESOURCE_EXHAUSTED`（Vertex AI `generateContent`）が発生
した。分類のために行ったこと：

- Cloud Functions自身のログ（`gcloud functions logs read`）から、Vertex AI APIが返した生のエラー
  本文とタイムスタンプを直接確認した（推測ではなく実際のAPIレスポンス）。
- `gcloud alpha services quota list --service=aiplatform.googleapis.com`で静的なクォータ定義を
  確認したが、`gemini-2.5-flash`（`gemini-2.5-flash-ga`）は`generate_content_requests_per_minute_
  per_project_per_base_model`のリージョナル表にも`global_`表にも明示的なbase_modelエントリが存在
  せず、両方とも先頭の`- {}`（未列挙モデル向けの既定バケット）にフォールバックしていることを確認
  した。この既定バケットの具体的な数値上限はgcloudの静的出力からは読み取れなかった（正直に記録：
  ここは実測できなかった箇所）。
- 実測タイムスタンプ：1回目の429が00:43:20、2回目が00:44:16（約56秒後）。その後**約70秒待ってから
  1回だけ**リトライしたところ成功し、以降は数秒〜十秒程度の間隔を空けた15件連続の呼び出しがすべて
  成功した（MAX_TOKENS起因の空応答を除く）。
- この時系列から、**RPM（1分あたりリクエスト数）クォータであり、ローリングウィンドウで回復する
  タイプ**と分類した。token量ベースのクォータではない（後続のテストでより多くのトークンを消費した
  リクエストも問題なく成功したため）。shared capacity起因やprovider側の一時的スロットリングである
  可能性を完全には排除できないが、「一定時間待てば確実に回復する」という再現性のある挙動は、
  ランダムな一時障害よりもクォータウィンドウの方が説明として自然である。
- **正確な数値上限は未確認**であり、これ以上の特定にはCloud Consoleのクォータ画面での目視確認が
  必要。Ownerの指示に従い、この不確実性を理由にした有料クォータ増加申請やモデル変更は行っていない
  （現状のクォータでもOwner自身による低頻度の手動テスト用途には実測上十分機能している）。

### プライバシー境界の明示的な変更

これまで全Runを通じて維持してきた「完全ローカル・外部通信ゼロ」という不変条件を、CASE-001に限り
明示的に破る決定をした（Owner自身の明示的な製品判断、Section 0参照）。この変更をユーザーから隠さ
ないため、初回の実際のAI呼び出しの直前に、オンボーディングとは別の独立したバージョン管理キー
（`thinking-game:ai-dialogue-consent:v1`）で同意を取得する画面を追加した。同意しない選択（「AIなし
で続ける」）は今後もずっと有効な選択として保存され、毎回聞き直すことはしない。

### なぜ構造化個別化（前Run実装）をフォールバックとして残したのか

同意しなかった場合、およびAI呼び出しが失敗しリトライも失敗した場合に、何も表示しない・エラー画面の
ままにする、という選択肢もあったが、前Run実装した構造化個別化ダイアログ（プレイヤーの選択・選択した
情報・書いた理由の引用を反映する）は、real AIには及ばないとはいえ完全な固定文言よりは具体的であり、
すでに実装・テスト済みの安全な資産である。これをそのままフォールバックとして再利用した。

### 実装していないもの（レート制限）

`functions/dialogue/index.js`にはCORSオリジン制限とCloud Functionsの`--max-instances`設定以外の
レート制限を実装していない。認証なしの公開エンドポイントである以上、悪用や異常なアクセス増加による
予期しない課金のリスクが残る。Cloud Billingの予算アラート設定をOwnerに推奨する
（`functions/dialogue/README.md`参照）。より本格的なレート制限（IPベース・Firestoreベースのカウンタ
等）は次Run以降の課題として残す。

## THINKING_GAME_PERSONALIZED_DIALOGUE_AND_VISUAL_EXPERIENCE関連の意思決定（前Run）

### OWNER_OBSERVATION

Ownerから3点のフィードバックがあった：(1) AIの回答が画一的で面白みがない、(2) プレイヤーが書き込んだ
コメントに対する読み込みが一般化しすぎて刺さらない、(3) 設問ごとに何か画像があるとよい。

### ROOT_CAUSE

`src/engine/dialogueEngine.ts`の`getAiInterventionMessage`は、これまで`caseData.aiIntervention`
（事前に書かれた固定文言）をそのまま返すだけだった。プレイヤーが第一判断で選んだ選択肢・確認したい
情報・自由記述の理由は、AIの発言に一切反映されていなかった。これがOwner観測(1)(2)の直接の原因である。

### なぜ本物のLLM呼び出しを今回実装しなかったのか（BLOCKED_BY_SAFE_SERVER_ARCHITECTURE）

プレイヤーが実際に書いた自由記述を意味的に読み取り、その場で個別の反証・問い返しを生成するには、
生成AIモデルへのAPI呼び出しが必要になる。しかし現在の公開環境はGitHub Pagesの静的ホスティングのみで
あり、(a) APIキー等の秘密情報をブラウザ配信物に含めることはできず、(b) それを安全に扱うための
サーバー側プロキシ（Cloudflare Workers・Vercel Functions等）は存在しない。加えて、(c) プレイヤーが
書いた自由記述を外部AI APIへ送信すること自体が、これまで全Runで検証・維持してきた「完全ローカル・
外部通信ゼロ」というプライバシー上の不変条件を覆す決定であり、これはエンジニアリング判断の範囲を
超えた、Owner自身の承認が必要な意思決定（新規クラウドインフラの調達・費用・利用規約の受諾を含む）
である。本Runの指示（Section 8/19）自体が「安全でない回避策を作る前に止まり、必要な最小構成を報告
せよ」「fakeするな」と明示していたため、これに従い、本物のLLM統合は行わなかった。

### 代わりに何を実装したか（構造化シグナルによる個別化、実装済み・ローカル完結）

`CaseData`に任意フィールド`personalizedDialogue`を追加し、CASE-001についてのみ、選択肢×AIキャラクター
（DETECTIVE/DEVIL/OBSERVER/STRATEGIST）ごとに1本ずつ、計20本の反証・問い返し文を事前執筆した。
表示時のAIメッセージは、(1) プレイヤーが自由記述欄に書いた理由をそのまま引用（意味解釈はしない、
文字通りの引用）、(2) プレイヤーが実際に選んだ選択肢をラベルで明示、(3) 選んだ情報オプションを
ラベルで明示、(4) 選択肢×キャラクターに対応する事前執筆の反証、の4要素を組み立てて生成する。
外部通信・生成モデル・秘密情報は一切使わない（`tests/safety.test.ts`で自動検査済み）。他の6ケースは
`personalizedDialogue`が未定義のため、この機構は一切発火せず、これまで通り固定文言を返す
（`tests/dialogueEngine.test.ts`で回帰確認済み）。

### KNOWN_LIMIT（正直に記録する必要がある重要な制約）

Section 18の手順に従い、同じ選択肢に対して意味的に大きく異なる3種類の理由文（強い因果主張／慎重な
不確実性／別の仮説）を入力して比較した結果、**引用部分はプレイヤーごとに異なる（本物の個別化）が、
反証・問い返し本体の文面は選択肢が同じであれば完全に同一**であることを確認した。つまり、この実装は
「あなたが選んだ選択肢」には具体的に反応するが、「あなたが選んだ選択肢の中で、具体的に何を書いたか」
には反応しない。Ownerの観測(2)（書き込みへの反応が一般化しすぎている）が指しているのはまさにこの
後者であり、今回の実装はこの制約を完全には解消していない。これを解消するには意味理解＝生成AI統合が
必要であり、上記の理由でBLOCKED_BY_SAFE_SERVER_ARCHITECTUREのままである。

### NEW_HYPOTHESIS

選択肢・選択した情報・書いた理由の引用という「具体的な参照」を積み重ねることで、意味理解なしでも
「AIが自分を見て反応している」という感覚を一定程度作れるのではないか、というのが今回の弱い仮説。
ただし上記KNOWN_LIMITにより、この仮説は「選択肢が変わったときの体験差」しか実際には検証しておらず、
「同じ選択肢の中で書いた内容が変わったときの体験差」は検証していない。

### VISUAL_HYPOTHESIS と VISUAL_ASSET_AUDIT

Ownerの観測(3)、および過去に提供されたキャラクター/スタンプ/景色画像の活用について、ワークスペース内
（Downloads/Desktop直下、および本リポジトリ）を監査した。前Runで発見済みのフェルト調スタンプ2種
（HOME・SESSION_SUMMARYで使用中）以外に新規流用可能な素材は見つからなかった：(a) 「景色」を意図した
画像として`ChatGPT Image 2026年6月28日`の2点を発見したが、これは思考整理OS（別ブランド）の抽象的な
宇宙イメージのムードボードであり、フェルト調のゲーム内トーンと様式が全く異なり、かつモバイル画面には
情報密度が高すぎるため不採用とした。(b) AIキャラクター4種（探偵/悪魔/他者視点/参謀）の反応画像として
使えそうな新規素材もなかった——保有する唯一のキャラクター資産は単一の「気さくなおじいさん」ペルソナ
であり、特に「悪魔」役との組み合わせは意味的に破綻するため、4キャラクターの視覚差別化には使用しな
かった。よって本Runでは新規の画像追加は行わず、Section 11の指示通りASSET_NOT_FOUNDとして報告する。

## THINKING_GAME_FIRST_PLAY_COMPREHENSION_AND_RESULT_FEEDBACK関連の意思決定（前Run）

### OBSERVED_USER_FEEDBACK

実際のプレイヤーから2つの声が観測された：(A) 最初の設問で何を判断すればよいか分かりにくい、
(B) RESULT画面が採点済みの答案・通知表のように見え、ゲームの結果画面らしくない。

### HYPOTHESIS

H1（CASE-001完走者が次のケースをやりたくなるか）の測定値が、ゲームのルール自体を理解できていない
プレイヤーの離脱によって押し下げられている可能性がある。この交絡が解消されない限り、H1の数値を
「ゲームとして面白いか」の指標として素直に読むことはできない。

### CHANGE

- 初回プレイのみ表示される、ゲームルールだけを教えるONBOARDING画面を追加した（思考の戦略やAIへの
  疑い方は一切教えない。バージョン付きキーで初回1回のみ表示し、既存のTrajectoryLog/ゲームプレイ
  データとは完全に独立させた）。
- CASE-001の第一判断の設問文を、判断対象と時点がより明確になるよう言い換えた（rubric・正誤判定
  ロジックは一切変更していない）。
- RESULT画面を、rubricの良かった点／確認したい点を並べる採点表形式から、「最初の判断→新しい事実→
  再判断」という決定の推移＋その回のケース固有の根拠1点を主役にする構成へ全面的に作り直した。
  「変更しました／維持しました」という中立語のみを用い、「変わらなかった／失敗」のような枠組みは
  一切使っていない。rubricの良かった点／確認したい点は「振り返り」として縮小表示し、
  「次回のテーマ」は完全に削除した（次のケースを先取りで匂わせる要素をなくすため）。
- HOME画面とSESSION_SUMMARY（セッション完了）画面に、Ownerから提供された既存のフェルト調
  LINEスタンプキャラクター画像を1点ずつ追加した（詳細は本ファイル末尾の「VISUAL ASSET関連の
  意思決定」を参照）。

### RESULT

本Run終了時点ではまだ新規プレイヤーによる観察が行われていないため、「H1が改善したか」は
NOT_YET_MEASURED。

### IMPORTANT

この変更自体を「ゲームがより面白くなったことの証明」として扱ってはならない。今回行ったのは
あくまで「ゲームのルールを理解できないことによる離脱」という交絡要因の除去であり、次に必要なのは
新規プレイヤーによる実際の観察であって、追加の機能実装ではない。

### VISUAL ASSET関連の意思決定

Ownerから「既存キャラクター/スタンプ素材が提供された」との指示があったが、具体的なファイルの
場所は指示に含まれていなかったため、ワークスペース内を調査した。その結果、Ownerが直近で
ダウンロードしたLINEスタンプ制作物のZIPアーカイブ（`hokkori_daily_ojisan_LINE_16_upload.zip`、
`hokkori_autumn_LINE_16_upload.zip`ほか）がフェルト/ぬいぐるみ調の高齢男性キャラクターの
スタンプセットであり、指示の説明（"スタンプ素材"）と一致することを確認した。

一方、同時に見つかった`hameyo_16_stickers_images_only.zip`/`hamyo_LINE_16_submission_ready_
18images.zip`は同じOwnerの別の制作物だが、漫画調の懐疑的なキャラクターであり、かつ収録スタンプの
中に本Runで使用禁止と明示された「次いこ、次」という文言のスタンプが含まれていたため、この2点は
一切採用しなかった。

HOME用の「よろしくお願いします」画像について、指示は「男女2人」のバージョンを想定していたが、
実際に存在する提供素材には単独の男性キャラクターのバージョンしか存在しなかった（背景違いで
無地版・紅葉装飾版の2種）。人物構成が指示と異なる不一致だったため、画像を合成・改変することは
せず、Ownerに確認を取った。Ownerは無地・季節装飾なしのバージョンを選択した（通年で使えるため）。
SESSION_SUMMARY用の「おつかれさま」画像、および案内役候補として監査した「承知しました」画像は
指示どおりの単独男性キャラクターの素材がそのまま見つかったため、確認なしで採用（前者）・
監査のみで実装見送り（後者、Section 33で「OPTIONAL」と明示されていたため今回は最小限の
visual integrationの範囲外とした）とした。

## FIRST_CASE_AND_CALIBRATION_SEMANTICS関連の意思決定（前Run）

### なぜTRANSFER-001を「CLAIMへ書き換え」ではなく「null（QUESTION）へ訂正」したのか

監査の結果、TRANSFER-001の`aiIntervention`は「その数字から『みんな満足している』と考えるのは、事実です
か？それとも解釈ですか？」というCASE-001のDETECTIVEと同型のソクラテス式の問いであり、`initialSituation`
の通知文もAIへ明示的に帰属されていなかった。にもかかわらず`aiResponseGroundTruth: "CORRECT"`を設定し、
ACCEPT/VERIFY/HOLD/REJECTウィジェットを表示していたのは意味論上の誤りだった。

この誤りを直すのに2つの道があった：(1) `null`へ訂正する、(2) ケース文面を書き換えて本物のCLAIMにする。
(2)を選ばなかった理由は、TRANSFER-001の本来の目的（CASE-001/003のOBSERVATION/FALSIFICATION転移テスト）
はCalibration対象である必要が全くなく、書き換えは「AI品質のバランスを保つためだけにQUESTIONをCLAIMへ
強制する」という、本Runが明示的に禁止するアンチパターンそのものになってしまうため。(1)を選び、
「CORRECT品質のCalibration対象ケースが現在0件」という事実をKNOWN LIMITATIONとして正直に記録した
（`docs/AI_CALIBRATION.md`）。ケース数を増やして帳尻を合わせることもしなかった。

### なぜCASE-005のutteranceTypeをRECOMMENDATIONではなくCLAIMにしたのか

AIの発言は「背景色を変えたことで売上が3倍になった」という因果の主張と、「青系デザインを増やすことを
おすすめします」という推奨の両方を含む。本Runの明示的な指示（Section 19試験項目5）でCLAIMに固定する
ことが求められたため、これに従った。評価対象の核はrubric上も「因果関係の即断」という主張の誤りであり、
推奨はその主張に乗っかった修辞的な付け足しと位置づけている。

### なぜAI_INTERVENTION画面の「AIは常に正しいとは限りません」注記を削除したのか

この注記は全ケースの AI_INTERVENTION画面に常時表示されており、特にCalibration対象ケースでは
ACCEPT/VERIFY/HOLD/REJECTウィジェットのすぐ横に出ていた。判断の直前に「鵜呑みにするな」と促すのは、
H2（CASE-005経験後にCORRECT/UNCERTAIN主張まで過剰拒否しないか）の測定を汚すデマンド特性
（demand characteristic）になり得る。安全原則自体は削除せず、HOME画面（個別の判断の直前ではない場所）
に既存の同趣旨の注記が残っているため、そちらに一本化した（`docs/SAFETY_PRINCIPLES.md`）。

### なぜUser Test Q4を「confusion」から「clarity」へ反転・改名したのか

Q1・Q2・Q3・Q5は「高い評価＝肯定的」の向きで統一されていたが、Q4だけ「操作で迷ったか」という
「高い評価＝否定的」の向きだった。分析時に符号を反転し忘れるミスを誘発しやすく、フィールド名
`q4Confusion`のまま値の意味だけ反転させるのはさらに悪い（フィールド名と実際の意味がずれる、まさに
本Run全体が修正しようとしている類の意味論バグになる）。そのため質問文を「画面の操作は分かりやすかった
ですか？」と肯定的に言い換え、フィールド名も`q4Clarity`へ改名し、保存キーをv1→v2へ更新した
（旧v1データは互換性を保つ理由がないローカルの使い捨てテストデータのため、移行はしない）。

### なぜCASE-001に選択肢「e」を追加したのか

CASE-001は最初にプレイヤーが触れるケースであり、4つの原因仮説（a〜d）のいずれかを必ず選ばせる構造に
なっていた。観察・反証を訓練するケースが「必ず何かの原因を言い当てさせる」設計だと、不確実性を保持する
という本来の目的と矛盾する。「今の情報だけでは、まだ判断できない」を第5の主選択肢として追加し、
`rubric.uncertaintyChoiceId`で明示した。既存の選択肢a〜dのidは変更していないため、既存テストへの
影響は最小限。

## GITHUB_PAGES_TEST_DEPLOY関連の意思決定（前Run）

### なぜGitHub Pages + GitHub Actionsなのか

小規模ユーザーテストに必要なのは「第三者がスマートフォンから開ける公開URL」のみであり、
サーバーサイド処理は一切不要（`localStorage`のみで完結する設計、`docs/DATA_BOUNDARY.md`）。
GitHub Pagesは無料・追加インフラ不要でこれを満たす。デプロイ方式は、リポジトリの初期状態に
Pages設定がなかったため、現在推奨されるActionsベース（`build_type: "workflow"`）を新規に採用した
（既存の`kore-dousuru-nagoya`等が使っているレガシーなブランチ配信方式とは異なるが、両方とも
GitHub Pages上で共存可能であり、他リポジトリの設定には触れていない）。

### なぜmanifestとstart_urlを絶対パスから相対パスへ変えたのか

GitHub Pagesはプロジェクトページとして`/thinking-game/`というサブパス配下で配信される。
Viteの`base`設定でJS/CSSバンドルへの参照は自動的に書き換わるが、`<link rel="manifest">`の
`href`やmanifest内の`start_url`は素朴な絶対パス（`/manifest.json`、`/`）のままだと
ドメインルート（`https://<user>.github.io/`）を指してしまい、サブパス配信と食い違う。
相対パス（`manifest.json`、`.`）に変更することで、Vite側の書き換えに依存せず、
どのサブパスに配置されても正しく解決されるようにした。ビルド後の`dist/index.html`を実際に確認し、
JS/CSSバンドルは`/thinking-game/assets/...`に、manifestは相対のまま出力されることを確認済み。

### なぜHOMEに小さな注記を追加したのか

本Runの要求どおり、「思考力が向上することが証明されています」等の未検証な効果訴求は一切行わず、
「このアプリは現在、使いやすさやゲーム体験を確認するための試作版です。」という事実記述のみを追加した。
既存のAI依存を促さない注記（画面下部）とは別に、HOME上部に小さく配置し、既存UIのレイアウトを
崩さない範囲に留めている。

## PLAYABLE_VALIDATION_BUILD関連の意思決定（前Run）

### なぜAI応答の分岐条件を`caseType`から`rubric.aiResponseGroundTruth`へ切り替えたのか

前Runは「AI_CALIBRATION型のケースだけがACCEPT/VERIFY/HOLD/REJECTを表示する」設計だった。しかし本Run
のSection 2は「CASE-005だけでAIの品質バランスを作らない」ことを要求しており、TRANSFER-001/002にも
評価可能なAIの主張を持たせる必要があった。`caseType`はSection B/Mの教育的区分（TRAINING/MEASUREMENT/
AI_CALIBRATION/TRANSFER/OPEN_ENDED）であり、「AIの発言が主張か問いかけか」という内容面の性質とは
本来別の軸である。両者を1つのフィールドに畳み込んでいたのが前Runの簡略化であり、本Runでその2つを
分離した。結果として`caseType: "TRANSFER"`のケースも評価可能な主張を持てるようになった
（`docs/AI_CALIBRATION.md`）。

### なぜTRANSFERケースで`criticalErrorChoiceId`と`evidenceSupportsChoiceId`を同じ選択肢にしたのか

TRANSFER-001/002はどちらも「もっともらしいAIの主張を、検証前に鵜呑みにする」ことが批判的誤りであり、
かつ検証後にはその主張が（CORRECT／UNCERTAINだが結果的に妥当）だったと判明する構成にした。そのため、
「最初に選ぶと批判的誤り」「検証後に選ぶと妥当な結論」という、同じ選択肢が時点によって意味を変える
設計になっている。これは矛盾ではなく意図的な設計で、「たまたま最初から正しく言い当てたが、根拠なく
言い当てただけ」（`criticalErrorMade: true` かつ `updateAppropriateness: "appropriate_keep"`）を
明示的に区別できる、というこの評価モデルの利点を実証する例でもある。詳細は
`docs/TRANSFER_TEST_DESIGN.md` および `docs/RUBRIC_DESIGN.md`。

### なぜTRANSFERケースを「転移テスト」と明示せず、通常のケース選択に自然に混ぜたのか

Section 10の明示的な要求。転移テストの目的は「別文脈でも同じ思考構造を使えるか」を測ることであり、
利用者が「これは特別なテストだ」と認識した状態でプレイすると、通常のプレイと異なる心構えで
臨んでしまい、測定の妥当性が損なわれる。前Run時点のドキュメント（`docs/TRANSFER_TEST_DESIGN.md`旧版）
は逆に「隠しエントリーポイントで研究者だけがアクセスする」設計を提案していたが、本Runの明示的な
指示を優先し、`CASES`配列内に自然な順序で混在させる設計へ変更した。

### なぜセッション振り返り・ユーザーテストのダッシュボードを作らなかったのか

Section 15が「管理画面」をDO_NOT_IMPLEMENTとして明示している。計測データ（`localStorage`）自体は
記録するが、集計・可視化はテスト実施者がブラウザの開発者ツールから直接読み出す運用とした
（`docs/USER_TEST_GUIDE.md`）。将来、協力者数が増えて手動確認が非現実的になった時点で、
改めて集計手段を検討する。

### なぜPlaywrightを追加したのか

Claude in Chromeブラウザ拡張が3Run連続（前々回・前回・今回）で未接続だったため、モバイル幅での
実際の見た目確認という要件（Section 12/14）を満たす手段として、`playwright`をdevDependencyへ
一時的に追加し、320/375/390/430pxでのスクリーンショット取得と横スクロール自動検知に使った
（`docs/TEST_PLAN.md`）。製品機能には一切関係しないため`DO NOT IMPLEMENT`とは無関係であり、
今後のRunでも同様の視覚確認に使えるよう保持することにした。

### なぜGrowthScreenのラベルから英語の内部識別子を除いたのか

Section 4が「rubric/calibration matrix/trajectory/ground truth/falsificationなどの内部用語を
そのまま見せない」ことを明示的に要求している。前Runでは`abilityLabel`が
「OBSERVATION（事実と解釈の区別）」のように内部識別子を先頭に出していたが、本Runで
「事実と意見を区別する力」のような平易な日本語のみに変更した（`src/engine/growthAggregator.ts`）。

## SPEC AMENDMENT関連の意思決定（前Run）

### なぜCASE-002〜004はCASE-001/005より軽いrubricなのか

Section Bは「教育ケースと測定ケースを分離可能にする」ことを要求しており、Section Tは「最初に完全実装
するのはCASE-001のみでよい」と明示的に許容している。CASE-001（`caseType: "TRAINING"`）は新設計の
完全なワーキング例として全rubricフィールドを丁寧に埋め、CASE-005（`caseType: "AI_CALIBRATION"`）は
AI CALIBRATION MATRIXという新機構の唯一の実例なので同様に完全実装した。CASE-002〜004は既存の物語内容
を活かしつつrubric・infoOptionsを追加する軽量移行とし、`criticalErrorChoiceId` が `null` になるケース
（CASE-002）も許容した。これは手抜きではなく、TRAINING型には測定ケース相当の厳密さを要求しないという
Section Bの区分そのものである（`docs/RUBRIC_DESIGN.md`）。

### なぜコーチAIと物語内「AIアシスタント」を区別したのか

Section Iのゲームループ改訂は、AI発言に対してACCEPT/VERIFY/HOLD/REJECTを取るという構造を示しているが、
これは「評価可能な主張」に対してのみ意味を持つ。4人の既存コーチキャラクター（探偵・悪魔・他者視点・
参謀）はソクラテス式の問いかけをする設計であり、これを無理に「主張」に書き換えると元のAI CHARACTERS仕様
（各キャラクターの役割定義）と矛盾する。そこで、ACCEPT/VERIFY/HOLD/REJECTと trap taxonomy 判定は
`caseType: "AI_CALIBRATION"` のケース（評価可能な主張を含むケース）のみに適用し、それ以外のケースでは
「気になる点」の選択を自分自身の最初の判断への自己批評として転用することで、構造化アクションの原則
（Section D）を全ケースに広げつつ、既存のキャラクター設計とも矛盾しない設計にした
（`docs/AI_CALIBRATION.md` / `docs/AI_TRAP_TAXONOMY.md`）。

### なぜAI CALIBRATIONを単一スコアにしなかったのか

Section Gが明示的に「単一Trust Scoreにはしない」「AIを疑えば高得点、信じれば高得点、ではない」と定める
ため、AI_QUALITY×PLAYER_ACTIONの3×4マトリクスをカテゴリカルなラベル（`CalibrationLabel`、8種＋
`not_applicable`）として実装し、GrowthScreenには件数分布のみを表示する設計にした
（`docs/AI_CALIBRATION.md`）。

### なぜTRANSFERケースを実装せず設計のみにしたのか

Section Lは「MVP段階からTRANSFER CASEを最低2件設計する」ことを要求するが、Section Tは同時に
「最初に完全実装するのはCASE-001のみでよい」と許容している。TRANSFER CASEの価値は「表面テーマを変えた
ときに同じ思考構造を使えるか」を測ることにあり、既存5ケースの完成度を犠牲にしてまで急いで実装する
ものではないと判断した。設計は `docs/TRANSFER_TEST_DESIGN.md` に残し、`growthAggregator.ts` は
TRANSFER型ログを通常集計から除外する実装を先に入れてある（Section L）。

## MVP v0.1（初回Run）の意思決定

### なぜWeb Appなのか

スマートフォン最優先だが、ネイティブアプリ（iOS/Android）は審査・配布・保守のコストが高く、
「まずゲーム構造自体が面白いかを検証する」というMVPの目的に対して過剰な投資になる。
React + TypeScript + Vite によるWeb Appであれば、単純・保守しやすい・高速・小規模運営という
要件を満たしつつ、将来的に生成AI APIを追加する余地も残せる。バックエンドは作らず、
`localStorage` のみでMVPとして成立させる。

### なぜ生成AI APIをまだ使わないのか

AIキャラクターの発言をCASE DATAに事前定義したのは、「このゲーム構造自体が面白いか」を
先に検証したいためである。生成AIチャットの面白さ（会話としての面白さ）と、ゲーム構造そのものの
面白さ（判断→反論→再判断→振り返りというループの面白さ）を混同しないようにする。
また、生成AIを使わないことで、外部API通信・APIキー管理・利用料金・プロンプトインジェクション等の
リスクを本MVPの段階では完全に排除できる。

### なぜthinking-osと分離したのか

thinking-os は開発プロセス・組織運営に関するOS（Development OSの導入等）を扱う別プロジェクトであり、
本プロダクトはスマートフォン向け一般消費者ゲームという全く異なる性質を持つ。両者を同一リポジトリに
置くと、リリースサイクル・依存関係・関心事が混ざり、どちらの変更も難しくなる。
そのため `thinking-game` を独立したCANONICAL WORKSPACEとして新設した。thinking-os・development-os・
market-log-osなど他リポジトリには本Runで一切変更を加えていない。

### なぜAI信頼度を作らないのか

「AI信頼度」「AI親密度」「AI好感度」「AIとの絆レベル」のような数値化は、AIとの関係性を
擬似的な人間関係やゲーム的な蓄積要素として扱ってしまい、「AIを信じ込むゲーム」化するリスクが高い。
本プロダクトの目的はCALIBRATED TRUST（状況に応じてAIを適切に検証・活用できること）であり、
関係性の数値を増やすこととは逆方向の価値観である。CALIBRATIONという概念自体はSPEC AMENDMENTにより
カテゴリカルなCALIBRATION MATRIXとして実装済みだが（`docs/AI_CALIBRATION.md`）、信頼度スコアという
単一数値の形では実装しない（この方針そのものは変わっていない）。

### なぜREAL QUESTを後回しにするのか

REAL QUEST（利用者自身の現実の問題を事実→解釈→複数仮説→反証条件→確認方法→最小行動→現実結果へ
変換する機能）は価値が大きい一方、現実の問題を扱う分だけ安全性・UX・データ設計の難度が上がる。
MVPでは「ゲーム内の安全な題材」で思考整理ループそのものが機能し、続けたくなるかを先に検証すべきであり、
それが確認できてから現実の問題を扱う機能に投資する方が、手戻りが少ない。

### その他の小さな決定

- **PWA対応は最小限に留めた**：`manifest.json` とビューポート設定のみを追加し、Service Workerに
  よるオフラインキャッシュは実装していない。簡単に追加できる範囲を優先し、複雑になる部分は後回しにする、
  という技術選定の方針に沿った判断。
- **RESULT画面とREFLECTION画面を分離した**：仕様のCORE GAME LOOPおよびSCREENS節が「振り返り」と
  「RESULT」を別工程として列挙しているため、REFLECTION画面では確信度の変化の提示と任意の振り返り
  メモ入力のみを行い、良かった点／確認したい点／次回テーマの自動生成はRESULT画面に集約した。

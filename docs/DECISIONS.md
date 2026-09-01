# DECISIONS — 思考整理ゲーム MVP v0.1

## THINKING_GAME_FIRST_PLAY_COMPREHENSION_AND_RESULT_FEEDBACK関連の意思決定（本Run）

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

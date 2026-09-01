# DECISIONS — 思考整理ゲーム MVP v0.1

## GITHUB_PAGES_TEST_DEPLOY関連の意思決定（本Run）

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

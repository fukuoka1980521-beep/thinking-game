# DECISIONS — 思考整理ゲーム MVP v0.1

## SPEC AMENDMENT関連の意思決定（本Run）

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

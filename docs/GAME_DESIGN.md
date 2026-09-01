# GAME_DESIGN — 思考整理ゲーム MVP v0.1

## ゲームループと画面の対応

| ループ工程 | 画面 |
|---|---|
| CASE提示 | CASE INTRO |
| 第一判断・判断理由・確信度 | FIRST DECISION |
| AIキャラクターから反論・別視点 | AI INTERVENTION |
| 追加情報 | NEW FACT |
| 再判断・確信度 | SECOND DECISION |
| 振り返り | REFLECTION |
| RESULT | RESULT |
| 成長記録 | GROWTH |

トップレベルには HOME があり、「今日の1問」「ケースを選ぶ」「成長を見る」の3導線のみを提供する。

## FIRST DECISION 画面の構成

1つの画面内に、以下を縦積みで表示する（横スクロールなし、1画面1判断の原則のもと「第一判断」という
1つの意思決定単位にまとめている）。

1. 状況に対する判断（`availableChoices` から1つ選択）
2. 判断理由（自由記述）
3. 事実／解釈の分類（`factCheck.statement` が事実か解釈かを選択。OBSERVATIONの観測に使う）
4. 他の可能性（任意入力。HYPOTHESISの観測に使う）
5. 確信度スライダー（0〜100）

## AI INTERVENTION 画面

該当ケースのAIキャラクターが1つのメッセージ（`aiIntervention`）を発言する。
続けて `falsificationPrompt` に対する回答を自由記述で求める（FALSIFICATIONの観測に使う）。

画面には常に「AIは常に正しいとは限りません」という注記を表示し、AI依存を促す文言を用いない。

## NEW FACT 画面

`newFacts` を提示するのみ。判断は求めない。

## SECOND DECISION 画面

`finalQuestion` に対して再度 `availableChoices` から選択し、理由・確信度を入力する
（choiceIdまたはconfidenceの変化がUPDATINGの観測に使われる）。

## REFLECTION 画面

第一判断と再判断の確信度・判断の変化を提示し、任意の振り返りメモを入力できる。
ここではまだ良かった点／確認したい点は出さない（それはRESULTの役割）。

## RESULT 画面

正解・不正解の表示は行わない。代わりに、観測された思考行動（`AbilityObservations`）に基づいて、
ケースごとに事前定義された文章から「今回よかった点」「確認したい点」「次回のテーマ」を選択して表示する。
選定ロジックは `src/lib/reflection.ts` の `buildReflection` を参照。

CASE-005（AI TRAP）では、AIの提案に含まれていた論理的な問題点の解説をあわせて表示する。

## GROWTH 画面

4つの思考行動（OBSERVATION / HYPOTHESIS / FALSIFICATION / UPDATING）について、
「能力値」ではなく「観測された思考行動」として、完了ケース数に対する該当件数を表示する。

- 最近5ケース（タブ切り替え）
- 全期間

人格診断的な断定文（「あなたは〜な人です」等）は一切表示しない。

## AIキャラクター定義

`src/data/aiCharacters.ts` に4体を定義。キャラクターの追加・変更はこのファイルのみで完結する。

## AI TRAP（CASE-005）

CASE-005では、物語内でプレイヤーが相談した「AIアシスタント」自身の発言に、相関と因果の混同という
論理的な欠陥を意図的に含めている。この欠陥は事前に安全な教材として定義されたものであり、
生成AIにその場で誤情報を生成させているわけではない（`docs/SAFETY_PRINCIPLES.md` 参照）。

プレイヤーは、この物語内AIの発言を無条件に信じるか、検証するかを問われる。
ここでのゲーム内AI（探偵・悪魔・他者視点・参謀）はプレイヤーを導くコーチ役であり、
物語内で登場する「AIアシスタント」（誤った提案をする側）とは別の存在として設計している。

## ケース一覧（v0.1、5ケース固定）

| ID | テーマ | 主対象能力 | AIキャラクター |
|---|---|---|---|
| CASE-001 | 事実と解釈 | OBSERVATION | 探偵 |
| CASE-002 | 複数仮説 | HYPOTHESIS | 参謀 |
| CASE-003 | 反証 | FALSIFICATION | 悪魔 |
| CASE-004 | 新情報による判断更新 | UPDATING | 他者視点 |
| CASE-005 | AIの提案を疑う（AI TRAP） | FALSIFICATION, UPDATING | 参謀 |

5ケースの完成度を優先し、本MVPでは30ケースなどへの拡張は行わない（`docs/MVP_SCOPE.md`）。

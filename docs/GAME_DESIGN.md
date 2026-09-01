# GAME_DESIGN — 思考整理ゲーム MVP v0.1

> **SPEC AMENDMENT適用済み**：OBSERVED FACT画面の新設、構造化アクション優先（Section D）、
> CASE_TYPEによるAI応答の分岐（Section C）を反映。旧バージョンとの差分は `docs/DECISIONS.md` を参照。

## ゲームループと画面の対応

| ループ工程 | 画面 |
|---|---|
| CASE提示 | CASE INTRO |
| 観測された事実の確認 | OBSERVED FACT |
| 第一判断・確信度・（理由） | FIRST DECISION |
| AIキャラクターから反論・別視点・（PLAYER AI ACTION） | AI INTERVENTION |
| 追加情報（1枚） | NEW FACT |
| 再判断・確信度・（理由） | SECOND DECISION |
| 振り返り | REFLECTION |
| RESULT | RESULT |
| 成長記録 | GROWTH |

トップレベルには HOME があり、「今日の1問」「ケースを選ぶ」「成長を見る」の3導線のみを提供する。

## OBSERVED FACT 画面（新設）

`factCheck.statement` が事実か解釈かを、判断より前に確認する（`src/screens/ObservedFactScreen.tsx`）。
Section Iのゲームループ改訂に合わせ、事実確認と判断を明確に分離した。OBSERVATIONの観測に使う。

## FIRST DECISION 画面の構成

1つの画面内に、以下を縦積みで表示する（横スクロールなし）。

1. 状況に対する判断（`availableChoices` から1つ選択）— 必須
2. 確信度スライダー（0〜100）
3. どの情報を重要と考えたか（`infoOptions` から複数選択可）— HYPOTHESISの観測に使う構造化シグナル
   （Section D「structured action first」。自由記述の代わりに操作で取得する）
4. そう考えた理由（自由記述・任意）— 補助データとして保存するのみで、評価には使わない

## AI INTERVENTION 画面

該当ケースのAIキャラクターが1つのメッセージ（`aiIntervention`）を発言する。ここから先はケースの
`caseType` によって分岐する（`src/screens/AiInterventionScreen.tsx`）。

- **`caseType: "AI_CALIBRATION"`（CASE-005）**：AIの発言は評価可能な「主張」である。プレイヤーは
  採用する／検証する／保留する／拒否する（`PlayerAiAction`）を選択する（必須）。
- **それ以外（`caseType: "TRAINING"`）**：AIの発言はソクラテス式の問いかけであり、主張ではないため
  ACCEPT/VERIFY/HOLD/REJECTの選択肢は表示しない。

どちらの場合も、「気になる点」を7択＋「問題なし」（`AI_TRAP_TAXONOMY_OPTIONS`、
`docs/AI_TRAP_TAXONOMY.md`）から1つ選ぶ。AI_CALIBRATIONケースではAIの発言そのものへの評価、
TRAININGケースでは自分自身の最初の判断への自己批評として使う。これがFALSIFICATIONの構造化シグナルになる。

自由記述欄（`falsificationPrompt`）は補助データとして残すが、評価には使わない。

画面には常に「AIは常に正しいとは限りません」という注記を表示し、AI依存を促す文言を用いない。

## NEW FACT 画面

`newFacts` を提示するのみ。判断は求めない。SPEC AMENDMENTにより、初期測定では原則1枚のみとする
（Section I）。5ケースすべて `newFacts` は要素数1。

## SECOND DECISION 画面

`finalQuestion` に対して再度 `availableChoices` から選択し、確信度・理由（任意）を入力する
（choiceIdまたはconfidenceの変化がUPDATINGの観測に使われる）。

## REFLECTION 画面

第一判断と再判断の確信度・判断の変化を提示し、任意の振り返りメモを入力できる。
ここではまだ良かった点／確認したい点は出さない（それはRESULTの役割）。

## RESULT 画面

正解・不正解の表示は行わない。代わりに、観測された思考行動（`AbilityObservations`）と
rubricベースの評価結果（`RubricResult`）に基づいて、「今回よかった点」「確認したい点」「次回のテーマ」を
組み立てて表示する。選定ロジックは `src/engine/evaluationEngine.ts` の `buildReflection` を参照。

「変更 = 正しい」ではなく、合理的なKEEPも評価する（`updateAppropriateness`）。AI_CALIBRATIONケースでは
CALIBRATION MATRIX（`docs/AI_CALIBRATION.md`）の結果も反映する。

CASE-005（AI TRAP）では、AIの提案に含まれていた論理的な問題点の解説をあわせて表示する。

## GROWTH 画面

4つの思考行動（OBSERVATION / HYPOTHESIS / FALSIFICATION / UPDATING）について、
「能力値」ではなく「観測された思考行動」として、完了ケース数に対する該当件数を表示する。

- 最近10ケース（タブ切り替え。SPEC AMENDMENTによりSection G/Kの例に合わせ5→10へ変更）
- 全期間

加えて、AI_CALIBRATIONケースでの「最近10ケースでのAIとの付き合い方」として、
採用／検証／保留／拒否の件数分布を表示する（単一のTrust Scoreにはしない、Section G）。

人格診断的な断定文（「あなたは〜な人です」等）は一切表示しない。

## AIキャラクター定義

`src/data/aiCharacters.ts` に4体を定義。キャラクターの追加・変更はこのファイルのみで完結する。
Section Hにより、本MVPではすべてのケースでキャラクターをシステム側が割り当てる
（`characterChoiceAvailable: false`）。自由選択・部分選択への拡張は将来Runの検討事項。

## Dialogue EngineとEvaluation Engineの分離（Section C/V）

```
Case Content
     |
     v
Game Engine (CaseSession.tsx)
     |
     +---- Dialogue Engine   (src/engine/dialogueEngine.ts)      … ケース文面をそのまま返すだけ
     +---- Player Action Logger (src/engine/playerActionLogger.ts) … 構造化アクションを記録
     +---- Evaluation Engine (src/engine/evaluationEngine.ts)    … rubricとの照合のみ、対話内容に非依存
     +---- Growth Aggregator (src/engine/growthAggregator.ts)    … 集計済みシグナルのみ読む
```

Evaluation EngineはDialogue Engineの出力（`aiIntervention`のテキスト等）を評価根拠として使わない
（`tests/evaluationEngine.test.ts` の「dialogue outputがevaluation resultを直接決定しない」で検証）。
Growth Aggregatorは自由記述を直接読まない。詳細は `docs/RUBRIC_DESIGN.md`。

## AI TRAP（CASE-005）

CASE-005では、物語内でプレイヤーが相談した「AIアシスタント」自身の発言に、相関と因果の混同という
論理的な欠陥を意図的に含めている。この欠陥は事前に安全な教材として定義されたものであり、
生成AIにその場で誤情報を生成させているわけではない（`docs/SAFETY_PRINCIPLES.md` 参照）。

プレイヤーは、この物語内AIの発言を採用する／検証する／保留する／拒否するかを問われる
（`docs/AI_CALIBRATION.md`）。ここでのゲーム内AI（探偵・悪魔・他者視点・参謀）はプレイヤーを導くコーチ役
であり、物語内で登場する「AIアシスタント」（誤った提案をする側）とは別の存在として設計している。

## ケース一覧（v0.1、5ケース固定 + LEVEL構造）

| ID | LEVEL | CASE_TYPE | テーマ | 主対象能力 | AIキャラクター |
|---|---|---|---|---|---|
| CASE-001 | 1 | TRAINING | 事実と解釈 | OBSERVATION | 探偵 |
| CASE-002 | 2 | TRAINING | 複数仮説 | HYPOTHESIS | 参謀 |
| CASE-003 | 3 | TRAINING | 反証 | FALSIFICATION | 悪魔 |
| CASE-004 | 4 | TRAINING | 新情報による判断更新 | UPDATING | 他者視点 |
| CASE-005 | 5 | AI_CALIBRATION | AIの提案を疑う（AI TRAP） | FALSIFICATION, UPDATING | 参謀 |

LEVEL 1〜5は `docs/MVP_SCOPE.md` のSection M構造にそのまま対応する。LEVEL 6以降（PERSPECTIVE /
CAUSALITY拡張、REAL QUESTなど）は設計のみで実装しない。TRANSFER-001/002は`docs/TRANSFER_TEST_DESIGN.md`
で設計のみ行い、本Runでは実装しない。

5ケースの完成度を優先し、本MVPでは30ケースなどへの拡張は行わない（`docs/MVP_SCOPE.md`）。

# PRODUCT_SPEC — 思考整理ゲーム MVP v0.1

> **SPEC AMENDMENT適用済み**：本ゲームの正本価値は「思考能力を点数化すること」ではなく、
> 「証拠・AI介入・追加情報に対して人間の判断がどう変化したかを観測すること」である。ログは
> 判断軌跡（DECISION TRAJECTORY）であり、能力推定は事前定義されたrubricが存在する場合のみ行う。
> 詳細は `docs/RUBRIC_DESIGN.md` / `docs/TRAJECTORY_SCHEMA.md` を参照。

## 目的

「思考整理ゲーム」は単なるクイズゲームではなく、利用者が以下を訓練するためのスマートフォン向けゲームです。

- 観察（OBSERVATION）
- 仮説形成（HYPOTHESIS）
- 反証（FALSIFICATION）
- 判断更新（UPDATING）

将来的には視点変更（PERSPECTIVE）・因果理解（CAUSALITY）・不確実性下の判断（DECISION）を加えた7能力を想定するが、
本MVPでは上記4つのみを対象とする。

## 最重要方針：CALIBRATED TRUST

本ゲームは「AIを信じるようになるゲーム」ではない。目標は **CALIBRATED TRUST（AIへの適正信頼）** である。

利用者が以下をできるようになることを目指す。

- AIが得意な場面を理解する
- AIが間違う可能性を理解する
- AIの提案を検証する
- 必要ならAIへ反論する
- AIの意見を参考にしながら最終判断は自分で行う

## コアゲームループ

```
CASE提示 → OBSERVED FACT確認 → 第一判断 → 確信度(0-100) → （理由・任意）
→ AIキャラクターから反論・別視点 → PLAYER AI ACTION（AI_CALIBRATION型のみ）
→ 気になる点の選択 → 追加情報1枚 → 再判断 → 確信度(0-100) → 振り返り → RESULT → 成長記録
```

SPEC AMENDMENTにより、事実の確認（OBSERVED FACT）を第一判断より前に分離し、判断理由は構造化された
選択（どの情報を重要と考えたか・AIへの対応・気になる点）を優先する補助データとした（Section D「structured
action first」）。詳細な画面対応は `docs/GAME_DESIGN.md` を参照。

1ケースの所要時間は3〜7分を目標とする。

## スコアリング原則

単純な正解・不正解では評価しない。以下を評価対象とする。

- 事実と解釈を区別したか
- 別の可能性を考えたか
- 自分の仮説への反証を考えたか
- 根拠なく断定しなかったか
- 新しい情報で判断を再評価したか
- AIの意見を無条件採用しなかったか

特に「最初は間違っていたが、新しい証拠を受けて合理的に判断を更新した」ことを価値として扱う。
逆に「変更 = 常に正しい」でもない。証拠が支持しない方向へ変えた場合や、証拠があるのに変えなかった場合も
区別して記録する（`updateAppropriateness`、`docs/RUBRIC_DESIGN.md`）。

AIへの対応についても、単純に「疑えば高得点」「信じれば高得点」とはしない。AI提案の品質（正しい／不確実／
誤り）と、プレイヤーの対応（採用／検証／保留／拒否）を組み合わせたCALIBRATION MATRIXで評価する
（`docs/AI_CALIBRATION.md`）。

実装上の対応方法は `docs/TRAJECTORY_SCHEMA.md` の `RubricResult` / `AbilityObservations` を参照。

## AIキャラクター

4種類のAI役を、事前定義された発言として実装する（生成AI APIは使用しない）。

| キャラクター | 役割 | 例 |
|---|---|---|
| 探偵 (DETECTIVE) | 事実と解釈を分離する | 「それは確認された事実ですか？」 |
| 悪魔 (DEVIL) | 反証を促す | 「その考えが間違っているとしたら、どんな可能性がありますか？」 |
| 他者視点 (OBSERVER) | 別の立場から考えさせる | 「相手側から見ると、別の説明は考えられませんか？」 |
| 参謀 (STRATEGIST) | 現実で何を確認すればよいか考える | 「何を確認すれば、2つの仮説を区別できますか？」 |

AIは万能の先生として扱わない。CASE-005ではAIの発言自体に問題がある教材を用意する（`docs/GAME_DESIGN.md` 参照）。

この4キャラクターは、コーチとしてソクラテス式の問いかけをするだけで、正誤の判定対象となる「主張」は
行わない。主張を評価する対象（AIアシスタントの提案）は別に存在し、両者を混同しない設計としている
（`docs/AI_CALIBRATION.md`）。対話（Dialogue Engine）と評価（Evaluation Engine）はコード上も分離されて
おり、対話AIの発言内容が評価結果を直接左右することはない（`docs/RUBRIC_DESIGN.md` Architecture節）。

## 画面構成

HOME → CASE INTRO → OBSERVED FACT → FIRST DECISION → AI INTERVENTION → NEW FACT → SECOND DECISION
→ REFLECTION → RESULT → GROWTH

詳細は `docs/GAME_DESIGN.md` を参照。

## 成功条件

技術的成功条件は `docs/MVP_SCOPE.md` を参照。ただし技術的完成はプロダクト成功を意味しない。
最重要プロダクト仮説は「1ケース終了した利用者が、もう1ケースやりたいと思うか」であり、これは実利用者テストでのみ検証できる。

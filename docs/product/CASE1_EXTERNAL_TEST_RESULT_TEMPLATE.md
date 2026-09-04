# CASE1 EXTERNAL TEST RESULT TEMPLATE

`PHASE 4.6`（`OWNER_CASE1_EXTERNAL_TEST_PACKAGE_READY`）。テスター1名につきこのフォーマットで1件
記録する。`?case1results` の Owner result view（`src/case1c/Case1TestResultsScreen.tsx`）が表示する
生データと、`CASE1_EXTERNAL_TEST_OBSERVATION_SHEET.md` の手書き観察を、同じ枠へ合流させるための
テンプレート。集計（平均点等）はここでは作らない——3〜5名の段階では個々の違いを潰さず、1件ずつ読む
（Section14）。

コピーしてテスターの数だけ増やして使う。

---

## TESTER_CODE:

## TESTER_TYPE: (NEW / RETURNING)

## BEHAVIOR（`?case1results` から転記）

- start:
- complete: (YES / NO)
- duration:
- optional_object_count:
- optional_npc_count:
- investigation_order:
- human_prediction: (bow / grab / freeze)
- next_case_intent: (YES / NO)
- owner_assist:

## FEEDBACK（アプリの5問＋自由記述から転記）

- feedback_1_5 (面白かった):
- feedback_2_5 (真相を知りたいと思った):
- feedback_3_5 (自分で調べている感じ):
- feedback_4_5 (なるほどと思った):
- feedback_5_5 (別の事件もやりたい):
- character_memory:
- free_comment:

## GAME / CURIOSITY / INVESTIGATION / PREDICTION / AHA / NEXT / CHARACTER（Owner所見、Section23）

観察票と上記数値を踏まえた短い所見。1〜2行ずつでよい。

- GAME:
- CURIOSITY:
- INVESTIGATION:
- PREDICTION:
- AHA:
- NEXT:
- CHARACTER:

## FREE COMMENT（Owner自身の総括メモ、テスターの自由記述とは別枠）

## 分析時の分離（Section11）

同じ所見の中でも、次の4つを混同しない：

- GAMEPLAY（謎解き・調査・予想の構造）
- SCENARIO（もう一台の自転車、という題材）
- CHARACTER（おじさん・探偵等の人物設計）
- VISUAL QUALITY（現状は仮絵——おじさんのみOwner提供画像、他はSVGプレースホルダー）

「絵が仮っぽい」という感想が出ても、それをGAMEPLAY/SCENARIOの評価と混ぜない。

# USER_TEST_GUIDE — 思考整理ゲーム PLAYABLE_VALIDATION_BUILD_V0_1

このプロジェクトは「管理画面」を意図的に実装しない（Section 15 DO_NOT_IMPLEMENT）。
そのため、テスト協力者のプレイ結果は、テスト実施者がブラウザの開発者ツールから直接読み出す。

## 対象者への案内

1. `npm run dev` で起動したURL（またはビルド済みのURL）をスマートフォンまたはPCブラウザで開く。
2. 「今日の1問」から開始してもらう。
3. 5問終了すると「今回のプレイ」の振り返りが出て、続けて「感想を聞かせてください（30秒）」という
   任意アンケート（5問の1〜5評価＋自由記述）が出る。協力してもらえる場合はここで回答してもらう。
4. 回答後の「ありがとうございました」画面はスクリーンショットで共有してもらうこともできる
   （Section 11：本人が画面を見て手動で共有できるように、という要件への対応）。

## テスト実施者がデータを取り出す方法

すべてローカルの `localStorage` にのみ保存される。外部送信は一切ない。

ブラウザの開発者ツール（Console）で、プレイに使った端末上から以下を実行する。

```js
// 完了ケースの判断軌跡（TrajectoryLog）
JSON.parse(localStorage.getItem("thinking-game:completed-logs:v2"));

// 画面遷移のファネルイベント（CASE_START / CASE_COMPLETE / NEXT_CASE_CLICK / SESSION_COMPLETE / USER_TEST_SUBMITTED）
JSON.parse(localStorage.getItem("thinking-game:metrics:v1"));

// アンケート回答（Q1〜Q5 + 自由記述）
JSON.parse(localStorage.getItem("thinking-game:user-test-responses:v1"));
```

## NEXT_CASE_CLICK_RATEの求め方（Section 9の最重要指標）

```js
const events = JSON.parse(localStorage.getItem("thinking-game:metrics:v1"));
const count = (t) => events.filter((e) => e.type === t).length;
const rate = count("NEXT_CASE_CLICK") / count("CASE_COMPLETE");
```

`rate` が1に近いほど「1ケース終了後、自発的に次へ進みたいと思った」ことを示す
一次指標になる（`docs/VALIDATION_PLAN.md` H1）。ケース完走はしたが次へ進まなかった回数
（`CASE_COMPLETE - NEXT_CASE_CLICK`、ただし最後の1問は正常に完了として次に進まないため誤差が出る点に注意）
も合わせて見ること。

## AI_QUALITY_DISTRIBUTIONの求め方（Section 2/9）

```js
const logs = JSON.parse(localStorage.getItem("thinking-game:completed-logs:v2"));
logs
  .filter((l) => l.aiIntervention.playerAction !== null)
  .map((l) => ({ caseId: l.caseId, action: l.aiIntervention.playerAction, calibration: l.rubricResult.aiCalibration }));
```

## 複数端末・複数協力者からデータを集める場合

各協力者のブラウザに閉じたデータのため、上記のJSONを協力者自身にコピーしてもらい、
テスト実施者へ手動で共有してもらう必要がある（自動集約は行わない。`docs/DATA_BOUNDARY.md`）。

# DATA_MODEL — 思考整理ゲーム MVP v0.1

## CaseData（`src/types/case.ts`）

ケースはReactコンポーネントへ直接ハードコードせず、`src/data/cases/*.ts` に独立したデータとして定義する。
将来的にはCASE DATAの追加だけでケースを増やせる構造を優先している。

```ts
interface CaseData {
  caseId: string;               // 例: "CASE-001"
  title: string;
  category: string;             // 例: "事実と解釈"
  difficulty: "easy" | "medium" | "hard";
  version: string;              // 例: "1.0.0"
  riskLevel: "low";             // 本MVPでは常にlow
  abilityTargets: AbilityKey[]; // OBSERVATION / HYPOTHESIS / FALSIFICATION / UPDATING
  aiCharacter: AiCharacterKey;  // DETECTIVE / DEVIL / OBSERVER / STRATEGIST
  aiTrap: { present: boolean; flawType?: string; explanation?: string };

  initialSituation: string[];   // 状況の提示（複数行）
  initialQuestion: string;
  availableChoices: Choice[];   // 第一判断・再判断で共有する選択肢
  factCheck: { statement: string; correctAnswer: "fact" | "interpretation" };
  confidencePrompt: string;

  aiIntervention: string;
  falsificationPrompt: string;

  newFacts: string[];

  finalQuestion: string;

  reflectionPoints: ReflectionPoints; // RESULT画面で使う定型文（下記参照）
}
```

`ReflectionPoints` は、観測されたシグナルの正負それぞれに対応する事前定義文と、次回テーマの固定文を持つ。

```ts
interface ReflectionPoints {
  factCorrect: string;
  factIncorrect: string;
  hypothesisConsidered: string;
  hypothesisNotConsidered: string;
  falsificationConsidered: string;
  falsificationNotConsidered: string;
  updatingEngaged: string;
  updatingNotEngaged: string;
  nextTheme: string;
}
```

## セッション中の一時データ（`src/types/log.ts`）

- `FirstDecisionInput`: 第一判断（`choiceId` / `reason` / `confidence` / `factCheckAnswer` / `altHypothesis`）
- `InterventionInput`: AI介入への回答（`falsificationText`）
- `SecondDecisionInput`: 再判断（`choiceId` / `reason` / `confidence`）
- `InProgressSession`: 上記に加えて `sessionId` / `caseId` / `screen` / `startedAt` / `reflectionNote` を持ち、
  リロード耐性のために `localStorage` へ都度保存される。

## ThinkingLog（完了したケースの記録）

```ts
interface ThinkingLog {
  sessionId: string;
  caseId: string;
  timestamp: string;
  firstDecision: string;      // choiceId
  firstReason: string;
  firstConfidence: number;
  aiInterventionSeen: boolean;
  secondDecision: string;     // choiceId
  secondReason: string;
  secondConfidence: number;
  decisionChanged: boolean;
  reflectionNote: string;
  reflection: { goodPoints: string[]; checkPoints: string[]; nextTheme: string };
  abilityObservations: AbilityObservations;
  completed: true;
}
```

`AbilityObservations` は、能力の評価値ではなく、そのケースで観測された思考行動を表す真偽値の集合。

```ts
interface AbilityObservations {
  observationCorrect: boolean;      // factCheckAnswerが正解と一致したか
  hypothesisConsidered: boolean;    // altHypothesisに記入があったか
  falsificationConsidered: boolean; // falsificationTextに記入があったか
  updatingEngaged: boolean;         // 再判断でchoiceまたはconfidenceが変化したか
}
```

計算ロジックは `src/lib/reflection.ts` の `computeAbilityObservations` を参照。

## 保存先

- `thinking-game:in-progress:v1` — 未完了セッション1件（`InProgressSession`）
- `thinking-game:completed-logs:v1` — 完了済みログの配列（`ThinkingLog[]`）

いずれも `localStorage` にのみ保存し、外部送信は行わない（`src/lib/storage.ts`）。

## GROWTH集計

`src/lib/growth.ts` の `computeGrowthStats` / `computeRecentGrowthStats` が、完了ログ配列から
能力ごとの「該当件数 / 完了ケース数」を算出する。直近5件は `timestamp` 昇順に並べた末尾5件を対象とする。

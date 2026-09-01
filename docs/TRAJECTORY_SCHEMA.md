# TRAJECTORY_SCHEMA — SPEC AMENDMENT

## The reusable data asset is a trajectory, not a profile (Section Q)

The canonical unit this product produces is a **decision trajectory**:

```
CASE × FACT_ORDER × FIRST_DECISION × CONFIDENCE × AI_INTERVENTION
  × PLAYER_AI_ACTION × NEW_EVIDENCE × SECOND_DECISION × CONFIDENCE_CHANGE
  × RUBRIC_RESULT
```

This is implemented as `TrajectoryLog` in `src/types/log.ts`, and is what `src/lib/storage.ts` persists
under the `thinking-game:completed-logs:v2` key (local-only; see `docs/DATA_BOUNDARY.md`).

## Schema

```ts
interface TrajectoryLog {
  sessionId: string;
  caseId: string;
  caseType: CaseType;              // TRAINING | MEASUREMENT | AI_CALIBRATION | TRANSFER | OPEN_ENDED
  level: number;                    // 1-5 on the ladder, 0 for TRANSFER cases
  timestamp: string;
  factOrder: string[];              // presentation order; currently always ["situation", "new_fact"]
  playRunId: string;                 // groups cases played back-to-back in one sitting (validation build Section 5/7)

  characterOffered: AiCharacterKey[];
  characterUsed: AiCharacterKey;
  characterChoiceAvailable: boolean;

  firstDecision: {
    choiceId: string;
    confidence: number;
    reason: string;                 // optional, auxiliary — never read by the evaluation/growth engines
    factCheckAnswer: "fact" | "interpretation" | null;
    infoOptionsSelected: string[];  // structured "which info matters" signal
  };
  aiIntervention: {
    message: string;                // dialogue content, for record-keeping only
    playerAction: PlayerAiAction | null;   // ACCEPT/VERIFY/HOLD/REJECT, only when the case has an evaluable AI claim (independent of caseType — see docs/AI_CALIBRATION.md)
    problemTypeSelected: AiTrapType | null;
    freeText: string;               // optional, auxiliary
  };
  newEvidence: string[];
  secondDecision: { choiceId: string; confidence: number; reason: string };

  decisionChanged: boolean;
  confidenceChange: number;
  reflectionNote: string;           // optional, auxiliary

  rubricResult: RubricResult;       // see docs/RUBRIC_DESIGN.md
  experimentGroup: string;          // placeholder, see docs/AI_CALIBRATION.md
  transferTarget: string;

  abilityObservations: AbilityObservations; // bridge for the growth aggregator, derived from rubricResult
  completed: true;
}
```

`RubricResult` (also `src/types/log.ts`):

```ts
interface RubricResult {
  rubricVersion: string;
  observationCorrect: boolean;
  criticalErrorMade: boolean;
  infoOptionsConsidered: number;
  infoOptionsMatchedGroundTruth: number;
  updateAppropriateness: "appropriate_update" | "appropriate_keep" | "under_update" | "over_update" | "misaligned_change";
  aiCalibration: CalibrationLabel;  // see docs/AI_CALIBRATION.md
  trapDetection: { applicable: boolean; groundTruthType: AiTrapType; playerSelectedType: AiTrapType | null; correctDetection: boolean };
}
```

## Where each field comes from

| Producer | Fields |
|---|---|
| Dialogue Engine (`src/engine/dialogueEngine.ts`) | `aiIntervention.message`, `newEvidence` — read straight from `CaseData`, never mutated. |
| Player Action Logger (`src/engine/playerActionLogger.ts`) | Assembles the whole `TrajectoryLog` from the finished `InProgressSession` plus the `RubricResult` it's handed. |
| Evaluation Engine (`src/engine/evaluationEngine.ts`) | `rubricResult`, `abilityObservations` — computed only from structured fields (never `reason` / `freeText`). |
| Growth Aggregator (`src/engine/growthAggregator.ts`) | Reads `abilityObservations` and `aiIntervention.playerAction` only; never touches `reason`/`freeText`/`message`. |

## Versioning

`thinking-game:completed-logs:v1` (the pre-amendment `ThinkingLog` shape) is not migrated — this is
disposable local practice data, and the v1/v2 key split means an old browser profile simply starts a fresh
v2 history rather than crashing on a shape mismatch. `rubricResult.rubricVersion` similarly lets a future
rubric re-authoring for the same `caseId` be told apart from logs scored under an older rubric.

## Validation-build additions (Section 5/7/8/9)

Three more local-only schemas exist alongside `TrajectoryLog`, all in `src/types/log.ts`:

```ts
interface MetricEvent {
  type: "CASE_START" | "CASE_COMPLETE" | "NEXT_CASE_CLICK" | "SESSION_COMPLETE" | "USER_TEST_SUBMITTED";
  timestamp: string;
  playRunId: string;
  caseId?: string;
}

interface UserTestResponse {
  responseId: string;
  timestamp: string;
  playRunId: string;
  q1WantMore: number;   // 1-5
  q2Enjoyable: number;
  q3QuestionedAi: number;
  q4Confusion: number;
  q5WantReuse: number;
  freeText: string;
}

interface SessionSummary {
  totalCases: number;
  reconsidered: number;
  maintained: number;
  verifiedAi: number;
  rejectedAi: number;
  choseUncertain: number;
}
```

`MetricEvent[]` persists at `thinking-game:metrics:v1`, `UserTestResponse[]` at
`thinking-game:user-test-responses:v1` (`src/lib/metrics.ts`, `src/lib/userTestResponses.ts`).
`SessionSummary` is computed on demand (`src/engine/sessionSummary.ts`) from `TrajectoryLog[]` filtered by
`playRunId` — it is not itself persisted. See `docs/USER_TEST_GUIDE.md` for how a tester reads these back.

## What this schema explicitly is not

- Not a person profile (no cross-case identity beyond `sessionId`/`caseId`; see the rolling-window /
  no-permanent-profile principle in `docs/DATA_BOUNDARY.md`).
- Not a single number. Every evaluative field is categorical or a small structured count — there is no
  numeric "score" field anywhere in the schema.

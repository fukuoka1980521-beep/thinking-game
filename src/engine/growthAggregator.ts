import type { AbilityKey, PlayerAiAction } from "../types/case";
import type { AiActionDistribution, GrowthWindowStats, TrajectoryLog } from "../types/log";

/**
 * Growth Aggregator (Section V). Reads only pre-computed fields
 * (`abilityObservations`, `aiIntervention.playerAction`) — it never derives
 * an ability value from `firstDecision.reason` / `secondDecision.reason` /
 * `aiIntervention.freeText` directly. Those free-text fields are optional
 * auxiliary data and are not read here at all.
 */

const ABILITY_KEYS: AbilityKey[] = [
  "OBSERVATION",
  "HYPOTHESIS",
  "FALSIFICATION",
  "UPDATING",
];

/**
 * SPEC AMENDMENT Section G/K: examples throughout the amendment use a
 * 10-case window (vs. the original spec's 5), so recent-window displays are
 * unified on 10 here.
 */
export const RECENT_WINDOW_SIZE = 10;

function emptyByAbility(): GrowthWindowStats["byAbility"] {
  return {
    OBSERVATION: { count: 0, total: 0 },
    HYPOTHESIS: { count: 0, total: 0 },
    FALSIFICATION: { count: 0, total: 0 },
    UPDATING: { count: 0, total: 0 },
  };
}

function sortByTimestamp(logs: TrajectoryLog[]): TrajectoryLog[] {
  return [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

/**
 * Section L: TRANSFER-case results must not be mixed into the regular
 * training/measurement growth stats, even once TRANSFER cases exist. This
 * MVP does not ship playable TRANSFER cases (see docs/TRANSFER_TEST_DESIGN.md),
 * so this filter has no effect on shipped data yet, but the boundary is
 * enforced here rather than left to be remembered later.
 */
function excludeTransfer(logs: TrajectoryLog[]): TrajectoryLog[] {
  return logs.filter((l) => l.caseType !== "TRANSFER");
}

export function computeGrowthStats(logs: TrajectoryLog[]): GrowthWindowStats {
  const byAbility = emptyByAbility();
  const trainingLogs = excludeTransfer(logs);

  for (const log of trainingLogs) {
    byAbility.OBSERVATION.total += 1;
    byAbility.HYPOTHESIS.total += 1;
    byAbility.FALSIFICATION.total += 1;
    byAbility.UPDATING.total += 1;

    if (log.abilityObservations.observationCorrect) byAbility.OBSERVATION.count += 1;
    if (log.abilityObservations.hypothesisConsidered) byAbility.HYPOTHESIS.count += 1;
    if (log.abilityObservations.falsificationConsidered) byAbility.FALSIFICATION.count += 1;
    if (log.abilityObservations.updatingEngaged) byAbility.UPDATING.count += 1;
  }

  return { totalCases: trainingLogs.length, byAbility };
}

export function computeRecentGrowthStats(
  logs: TrajectoryLog[],
  windowSize: number = RECENT_WINDOW_SIZE,
): GrowthWindowStats {
  return computeGrowthStats(sortByTimestamp(logs).slice(-windowSize));
}

/**
 * Section G/K, corrected by the SEMANTICS FIX Run (Section 2/3/7):
 * player-action distribution over recent cases whose AI utterance was
 * `calibrationEligible` (a CLAIM/RECOMMENDATION with a non-null quality),
 * shown instead of a single trust score. This is independent of `caseType`
 * (a TRANSFER case can carry an eligible claim too; see docs/AI_CALIBRATION.md)
 * and, importantly, independent of whether `playerAction` happens to be
 * non-null — `calibrationEligible` is checked explicitly rather than
 * inferred from `playerAction`, so a case whose eligibility was
 * miscategorized can never silently count (this is exactly the bug
 * TRANSFER-001 had before this Run's audit). Logs written before this field
 * existed have `calibrationEligible` as `undefined`, which is falsy here —
 * they are excluded rather than guessed at (fail-safe, not a crash).
 */
export function computeAiActionDistribution(
  logs: TrajectoryLog[],
  windowSize: number = RECENT_WINDOW_SIZE,
): AiActionDistribution {
  const calibrationLogs = sortByTimestamp(
    logs.filter((l) => l.aiIntervention.calibrationEligible && l.aiIntervention.playerAction !== null),
  ).slice(-windowSize);

  const counts: Record<PlayerAiAction, number> = { ACCEPT: 0, VERIFY: 0, HOLD: 0, REJECT: 0 };
  for (const log of calibrationLogs) {
    const action = log.aiIntervention.playerAction;
    if (action) counts[action] += 1;
  }
  return { totalCases: calibrationLogs.length, counts };
}

/**
 * Player-facing label. Deliberately plain Japanese with no internal jargon
 * (rubric/calibration/OBSERVATION-the-key/falsification etc. — see this
 * Run's Section 4/6) even though the underlying AbilityKey is an English
 * internal identifier.
 */
export function abilityLabel(key: AbilityKey): string {
  switch (key) {
    case "OBSERVATION":
      return "事実と意見を区別する力";
    case "HYPOTHESIS":
      return "いろいろな可能性を考える力";
    case "FALSIFICATION":
      return "反対の可能性も考える力";
    case "UPDATING":
      return "新しい情報で考えを見直す力";
  }
}

export { ABILITY_KEYS };

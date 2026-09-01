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
 * Section G/K: player-action distribution over recent cases that had an
 * evaluable AI claim, shown instead of a single trust score. A case "has an
 * evaluable AI claim" iff `aiIntervention.playerAction` was recorded — this
 * is independent of `caseType` (a TRANSFER case can carry a claim too; see
 * docs/AI_CALIBRATION.md).
 */
export function computeAiActionDistribution(
  logs: TrajectoryLog[],
  windowSize: number = RECENT_WINDOW_SIZE,
): AiActionDistribution {
  const calibrationLogs = sortByTimestamp(
    logs.filter((l) => l.aiIntervention.playerAction !== null),
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

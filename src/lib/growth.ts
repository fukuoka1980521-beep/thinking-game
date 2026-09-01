import type { AbilityKey } from "../types/case";
import type { GrowthWindowStats, ThinkingLog } from "../types/log";

const ABILITY_KEYS: AbilityKey[] = [
  "OBSERVATION",
  "HYPOTHESIS",
  "FALSIFICATION",
  "UPDATING",
];

export const RECENT_WINDOW_SIZE = 5;

function emptyByAbility(): GrowthWindowStats["byAbility"] {
  return {
    OBSERVATION: { count: 0, total: 0 },
    HYPOTHESIS: { count: 0, total: 0 },
    FALSIFICATION: { count: 0, total: 0 },
    UPDATING: { count: 0, total: 0 },
  };
}

export function computeGrowthStats(logs: ThinkingLog[]): GrowthWindowStats {
  const byAbility = emptyByAbility();

  for (const log of logs) {
    byAbility.OBSERVATION.total += 1;
    byAbility.HYPOTHESIS.total += 1;
    byAbility.FALSIFICATION.total += 1;
    byAbility.UPDATING.total += 1;

    if (log.abilityObservations.observationCorrect) byAbility.OBSERVATION.count += 1;
    if (log.abilityObservations.hypothesisConsidered) byAbility.HYPOTHESIS.count += 1;
    if (log.abilityObservations.falsificationConsidered) byAbility.FALSIFICATION.count += 1;
    if (log.abilityObservations.updatingEngaged) byAbility.UPDATING.count += 1;
  }

  return { totalCases: logs.length, byAbility };
}

export function computeRecentGrowthStats(
  logs: ThinkingLog[],
  windowSize: number = RECENT_WINDOW_SIZE,
): GrowthWindowStats {
  const sorted = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  return computeGrowthStats(sorted.slice(-windowSize));
}

export function abilityLabel(key: AbilityKey): string {
  switch (key) {
    case "OBSERVATION":
      return "OBSERVATION（事実と解釈の区別）";
    case "HYPOTHESIS":
      return "HYPOTHESIS（複数仮説）";
    case "FALSIFICATION":
      return "FALSIFICATION（反証）";
    case "UPDATING":
      return "UPDATING（判断更新）";
  }
}

export { ABILITY_KEYS };

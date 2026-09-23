/**
 * PHASE 10.20 Section 25: research-only choice log + replay harness. PLAYER choices are stored as
 * stable ActionIds only -- never architecture labels, never free text. `replay` re-runs the exact
 * same action sequence against either variant, so a real playthrough of one variant can be
 * mechanically re-run against the other under identical decisions (directive Section 25's stated
 * purpose: A/B comparison under identical decisions).
 */

import type { ActionId } from "./types";
import { runTrajectoryVariantA, runTrajectoryVariantB } from "./trajectorySimulator";
import type { CausalTraceRow } from "./trajectorySimulator";

export interface ChoiceLog {
  actions: ActionId[]; // index 0 = day1, ... index 13 = day14
}

export function recordChoice(log: ChoiceLog, action: ActionId): ChoiceLog {
  if (log.actions.length >= 14) throw new Error("choice log already has 14 entries -- this experiment stops at DAY14");
  return { actions: [...log.actions, action] };
}

export function exportChoiceSequence(log: ChoiceLog): string {
  return JSON.stringify(log.actions);
}

export function importChoiceSequence(json: string): ChoiceLog {
  const actions = JSON.parse(json);
  if (!Array.isArray(actions)) throw new Error("invalid choice sequence: expected an array");
  return { actions };
}

/** Replays the SAME recorded action sequence against BOTH variants -- neither variant's engine is
 *  told which "opaque route" the player experienced; the replay is purely mechanical. */
export function replayAgainstBothVariants(log: ChoiceLog): { variantA: CausalTraceRow[]; variantB: CausalTraceRow[] } {
  if (log.actions.length !== 14) throw new Error(`choice log must have exactly 14 entries to replay a full experiment, got ${log.actions.length}`);
  return {
    variantA: runTrajectoryVariantA(log.actions),
    variantB: runTrajectoryVariantB(log.actions),
  };
}

import { DAY1_BEATS } from "./day1";
import { DAY2_BEATS } from "./day2";
import { DAY3_BEATS } from "./day3";
import { DAY4_BEATS } from "./day4";
import { DAY5_BEATS } from "./day5";
import { DAY6_BEATS } from "./day6";
import { DAY7_BEATS } from "./day7";
import type { V03Beat, V03State } from "../types";

export const BEATS: Record<string, (state: V03State) => V03Beat> = {
  ...DAY1_BEATS,
  ...DAY2_BEATS,
  ...DAY3_BEATS,
  ...DAY4_BEATS,
  ...DAY5_BEATS,
  ...DAY6_BEATS,
  ...DAY7_BEATS,
};

export function renderBeat(state: V03State): V03Beat {
  const builder = BEATS[state.beatId];
  if (!builder) throw new Error(`Unknown beat id: ${state.beatId}`);
  return builder(state);
}

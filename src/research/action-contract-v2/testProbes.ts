/**
 * PHASE 11.12: Test probe adapter -- the pattern PHASE 11.11 should have used for
 * `ASK_WEATHER_SCENE` instead of a real `ActionContractV2` wired into the UI.
 *
 * External pattern adopted (see EXTERNAL_ARCHITECTURE_RESEARCH_V1.md): Cockburn's Ports & Adapters
 * ("the core communicates over ports to external agencies... a test harness and a UI both drive
 * the core through the same port") and the directive's own worked example -- "TEST HARNESS -> test
 * adapter -> construct epistemic packet -> invoke language port -> inspect result", NOT "add a
 * button permanently to PLAYER product UI".
 *
 * `invokeTestProbe` below reuses the exact same reusable pieces `ASK_WEATHER_SCENE` reused
 * (`buildYoheiPacket`, `LanguageAdapter`) but never constructs an `ActionContractV2`, never calls
 * `resolveAction`, and is never imported by `NewlifePlayable11App.tsx` or any other UI component --
 * see `dependencyDirection.ts` / `tests/dependencyDirection.test.ts` for the mechanical enforcement
 * of that last point.
 */

import type { ContractV2State } from "./types";
import type { YoheiScenePacket } from "./playableSceneContracts";
import { buildYoheiPacket } from "./playableSceneContracts";
import type { LanguageAdapter } from "./languageAdapter";

export interface TestProbe {
  id: string;
  owner: "QA";
  /** Why this probe exists -- a regression concern, never a player-facing promise. */
  testPurpose: string;
  probeUtterance: string;
  authoritativeAction: string;
}

/** The probe that should have replaced `ASK_WEATHER_SCENE` as a product button. Same
 *  `authoritativeAction` string ("ASK_WEATHER") so it produces the same `packetKey` and hits the
 *  same captured line -- this is a wiring change, not a new epistemic scenario. */
export const WEATHER_EPISTEMIC_PROBE: TestProbe = {
  id: "WEATHER_EPISTEMIC_PROBE",
  owner: "QA",
  testPurpose: "regression-check that UNKNOWN weather never becomes an asserted fact in Yohei's firsthand/unknown packet fields",
  probeUtterance: "雨降ってた？",
  authoritativeAction: "ASK_WEATHER",
};

export interface TestProbeResult {
  packet: YoheiScenePacket;
  line: string;
}

/** Runs a QA probe directly through the language port -- construct packet, invoke adapter, inspect
 *  result. No `ActionContractV2`, no `resolveAction`, no eligibility, no UI. This is the ONLY
 *  function this module exposes for exercising a probe; there is deliberately no exported constant
 *  shaped like an `ActionContractV2` for a probe, so nothing here can be composed by a UI action
 *  list even by accident (the type itself doesn't fit). */
export function invokeTestProbe(state: ContractV2State, probe: TestProbe, adapter: LanguageAdapter): TestProbeResult {
  const packet = buildYoheiPacket(state, probe.probeUtterance, probe.authoritativeAction);
  const line = adapter(packet);
  return { packet, line };
}

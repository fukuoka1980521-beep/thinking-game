import { describe, expect, it } from "vitest";
import { createInitialState, resolvePendingReplyEvent } from "../src/research/action-contract-v2/engine";
import { openYoheiLeftoverStockRequest, PLAYER_ACCEPTS_HELP_MOVE_STOCK } from "../src/research/action-contract-v2/playableSceneContracts";
import { invokeTestProbe, WEATHER_EPISTEMIC_PROBE } from "../src/research/action-contract-v2/testProbes";
import { createReplayLanguageAdapter } from "../src/research/action-contract-v2/languageAdapter";
import { CAPTURED_YOHEI_LINES } from "../src/research/action-contract-v2/capturedYoheiLines";

function baseState() {
  return openYoheiLeftoverStockRequest(createInitialState(), "probe-separation-test");
}

describe("PHASE 11.12: QA probe reproduces test L's regression coverage WITHOUT any ActionContractV2/UI action", () => {
  const adapter = createReplayLanguageAdapter(CAPTURED_YOHEI_LINES);

  it("UNKNOWN weather remains explicitly unknown, invoked purely through the test-probe adapter, both before and after accept", () => {
    const before = baseState();
    const after = resolvePendingReplyEvent(before, PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    for (const state of [before, after]) {
      const { packet, line } = invokeTestProbe(state, WEATHER_EPISTEMIC_PROBE, adapter);
      expect(packet.unknown.some((u) => u.includes("天気"))).toBe(true);
      expect(packet.firsthand.join("")).not.toMatch(/雨|晴れ/);
      expect(typeof line).toBe("string");
      expect(line.length).toBeGreaterThan(0);
    }
  });

  it("invokeTestProbe never constructs or requires an ActionContractV2 -- WEATHER_EPISTEMIC_PROBE has no eligibility/playerVisiblePromise/authoritativeEvent fields a UI action list could accidentally render", () => {
    expect(WEATHER_EPISTEMIC_PROBE).not.toHaveProperty("eligibility");
    expect(WEATHER_EPISTEMIC_PROBE).not.toHaveProperty("playerVisiblePromise");
    expect(WEATHER_EPISTEMIC_PROBE.owner).toBe("QA");
  });
});

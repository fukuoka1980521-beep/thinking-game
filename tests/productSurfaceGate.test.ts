import { describe, expect, it } from "vitest";
import { composeProductSurface, ProductSurfaceViolation, ACTION_OWNERSHIP_REGISTRY } from "../src/research/action-contract-v2/productSurface";
import {
  ASK_WHAT_HELP_NEEDED,
  ASK_FESTIVAL_SCENE,
  ASK_SALES_SCENE,
  ASK_WEATHER_SCENE,
  ASK_ABOUT_LEFTOVER_STOCK,
} from "../src/research/action-contract-v2/playableSceneContracts";
import type { ActionContractV2 } from "../src/research/action-contract-v2/types";

describe("PHASE 11.12: composeProductSurface rejects the real PHASE 11.11 defect", () => {
  it("accepts the actual PRODUCT-owned actions unchanged", () => {
    const accepted = composeProductSurface([ASK_WHAT_HELP_NEEDED, ASK_FESTIVAL_SCENE, ASK_SALES_SCENE, ASK_ABOUT_LEFTOVER_STOCK]);
    expect(accepted.map((a) => a.actionId)).toEqual(["ASK_WHAT_HELP_NEEDED", "ASK_FESTIVAL_SCENE", "ASK_SALES_SCENE", "ASK_ABOUT_LEFTOVER_STOCK"]);
  });

  it("throws when the real ASK_WEATHER_SCENE (the actual historical leak) is included, citing its QA ownership", () => {
    expect(() => composeProductSurface([ASK_WHAT_HELP_NEEDED, ASK_WEATHER_SCENE])).toThrow(ProductSurfaceViolation);
    try {
      composeProductSurface([ASK_WEATHER_SCENE]);
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ProductSurfaceViolation);
      expect((e as Error).message).toMatch(/ASK_WEATHER_SCENE/);
      expect((e as Error).message).toMatch(/QA/);
    }
  });

  it("reproduces the exact set NewlifePlayable11App.tsx actually renders (accept/decline are PendingReplyEventSpec, not composed here) and confirms the gate would have caught the real leak had it existed at authoring time", () => {
    const actualRenderedAskActions: ActionContractV2[] = [ASK_WHAT_HELP_NEEDED, ASK_FESTIVAL_SCENE, ASK_SALES_SCENE, ASK_WEATHER_SCENE];
    expect(() => composeProductSurface(actualRenderedAskActions)).toThrow(/ASK_WEATHER_SCENE.*QA/);
  });

  it("fails closed for an unclassified action id (no ACTION_OWNERSHIP_REGISTRY entry) rather than defaulting to PRODUCT", () => {
    const unclassified: ActionContractV2 = { ...ASK_WHAT_HELP_NEEDED, actionId: "SOME_NEW_UNREVIEWED_ACTION" };
    expect(() => composeProductSurface([unclassified])).toThrow(/no ACTION_OWNERSHIP_REGISTRY entry/);
  });

  it("rejects a PRODUCT-owned entry with an empty sceneJustification (adversarial: relabel a QA action PRODUCT without stating a reason)", () => {
    expect(ACTION_OWNERSHIP_REGISTRY.ASK_WEATHER_SCENE.owner).toBe("QA");
    const adversarialRegistry = {
      ...ACTION_OWNERSHIP_REGISTRY,
      ASK_WEATHER_SCENE: { owner: "PRODUCT" as const, sceneJustification: "", testPurpose: null },
    };
    expect(() => composeProductSurface([ASK_WEATHER_SCENE], adversarialRegistry)).toThrow(/no sceneJustification/);
  });
});

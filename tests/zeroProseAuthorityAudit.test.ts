import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createInitialState, resolveAction, resolvePendingReplyEvent } from "../src/research/action-contract-v2/engine";
import {
  openYoheiLeftoverStockRequest,
  PLAYER_ACCEPTS_HELP_MOVE_STOCK,
  ASK_ABOUT_LEFTOVER_STOCK,
  LEFTOVER_RESPONSE_MATERIAL_IDS,
} from "../src/research/action-contract-v2/playableSceneContracts";
import { evaluateLeftoverQuestionPrerequisite, evaluateRealLeftoverStockCausalClaim, structuredFactsAssertedByRevealMaterial } from "../src/research/action-contract-v2/causalUnlockInvariant";
import { commitLeftoverQuestionResponse } from "../src/research/action-contract-v2/npcResponseCommit";
import type { ContractV2State } from "../src/research/action-contract-v2/types";
import type { LifeMaterial } from "../src/research/life-material-7day/types";

function baseState() {
  return openYoheiLeftoverStockRequest(createInitialState(), "zero-prose-authority-test");
}
function afterReveal() {
  return resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
}
function afterAsk() {
  return resolveAction(afterReveal(), ASK_ABOUT_LEFTOVER_STOCK).state;
}

describe("PHASE 11.13E: reveal prose-mutation invariant (directive Section 3) -- structured facts fixed, concreteContent varied", () => {
  const REVEAL_PROSE_VARIANTS = [
    "棚に置いて蓋を開けると、中には祭りの柄の手ぬぐいがたくさん入っていた。", // real text, contains "祭り"
    "祭りの残りだった。", // contains the historically-dangerous exact substring
    "中身は特に説明できない。", // no related words at all
    "", // empty audit prose
  ];

  it.each(REVEAL_PROSE_VARIANTS)("evaluateLeftoverQuestionPrerequisite is unaffected by reveal concreteContent variant (%s)", (prose) => {
    const state = afterReveal();
    const mutated: ContractV2State = { ...state, materials: [{ ...state.materials[0], concreteContent: prose }] };
    const result = evaluateLeftoverQuestionPrerequisite(mutated);
    expect(result.prerequisiteSatisfied).toBe(true);
    expect(result.targetFactKnown).toBe(false); // structurally still "does not leak", regardless of prose
    expect(result.eligible).toBe(true);
  });

  it.each(REVEAL_PROSE_VARIANTS)("evaluateRealLeftoverStockCausalClaim is unaffected by reveal concreteContent variant (%s)", (prose) => {
    const state = afterReveal();
    const mutated: ContractV2State = { ...state, materials: [{ ...state.materials[0], concreteContent: prose }] };
    const result = evaluateRealLeftoverStockCausalClaim(mutated);
    expect(result.verdict).toBe("CAUSAL_UNLOCK_VALID");
    expect(result.novelFacts).toEqual(["IS_FESTIVAL_LEFTOVER"]);
  });

  it("changing ONLY the structured fact registry (not prose) changes the result correctly -- reveal registered as leaking produces the opposite verdict with IDENTICAL prose", () => {
    const state = afterReveal();
    const sameProseMaterial: LifeMaterial = { ...state.materials[0], id: "leftover_stock_moved" };
    // Same id, same prose as the real scene -- structuredFactsAssertedByRevealMaterial reads the
    // registry by id, so this is the real, registered "does not leak" case:
    const notLeakingResult = structuredFactsAssertedByRevealMaterial(sameProseMaterial.id);
    expect(notLeakingResult).not.toContain("IS_FESTIVAL_LEFTOVER");

    // An id NOT in the registry falls back fail-closed to "asserts everything":
    const unregisteredResult = structuredFactsAssertedByRevealMaterial("some_hypothetical_other_reveal_id");
    expect(unregisteredResult).toContain("IS_FESTIVAL_LEFTOVER");
    expect(unregisteredResult).toContain("GOING_TO_DISCOUNT_SHELF");
  });
});

describe("PHASE 11.13E: response outcome lifetime consistency (directive Section 5) -- conflict detection, not silent tiebreaking", () => {
  it("same semantic committed twice (idempotent re-ask) remains harmless -- still exactly ONE outcome present, no conflict", () => {
    let state = afterAsk();
    state = commitLeftoverQuestionResponse(state, "CONFIRM");
    state = commitLeftoverQuestionResponse(state, "CONFIRM"); // re-ask, same real answer again
    const result = evaluateLeftoverQuestionPrerequisite(state);
    expect(result.targetStatus).toBe("KNOWN_TRUE");
    expect(state.materials.filter((m) => Object.values(LEFTOVER_RESPONSE_MATERIAL_IDS).includes(m.id))).toHaveLength(1);
  });

  it.each([
    ["CONFIRM", "CONFIRM"],
    ["CONFIRM", "DENY"],
    ["DENY", "CONFIRM"],
    ["UNKNOWN", "CONFIRM"],
    ["UNKNOWN", "DENY"],
  ] as const)("lifetime sequence %s -> %s: %s", (first, second) => {
    let state = afterAsk();
    state = commitLeftoverQuestionResponse(state, first);
    state = commitLeftoverQuestionResponse(state, second);
    const result = evaluateLeftoverQuestionPrerequisite(state);
    if (first === second) {
      expect(result.targetStatus).not.toBe("CONFLICTING");
    } else {
      // Two DIFFERENT outcome ids now coexist (mergeMaterials merges by id, distinct ids don't
      // overwrite each other) -- this must fail closed, never silently pick one.
      expect(result.targetStatus).toBe("CONFLICTING");
      expect(result.targetFactKnown).toBe(false);
      expect(result.reason).toMatch(/CONFLICTING_RESPONSE_SEMANTICS/);
    }
  });

  it("CONFLICTING is a distinct status, never silently collapsed into KNOWN_TRUE, KNOWN_FALSE, or UNRESOLVED", () => {
    let state = afterAsk();
    state = commitLeftoverQuestionResponse(state, "CONFIRM");
    state = commitLeftoverQuestionResponse(state, "DENY");
    const result = evaluateLeftoverQuestionPrerequisite(state);
    expect(["UNRESOLVED", "KNOWN_TRUE", "KNOWN_FALSE"]).not.toContain(result.targetStatus);
    expect(result.targetStatus).toBe("CONFLICTING");
  });
});

describe("PHASE 11.13E: real truth table, re-verified with zero prose dependency", () => {
  it("BEFORE REVEAL: prerequisite=false, target=UNRESOLVED", () => {
    const r = evaluateLeftoverQuestionPrerequisite(baseState());
    expect(r).toMatchObject({ prerequisiteSatisfied: false, targetStatus: "UNRESOLVED" });
  });

  it("AFTER STRUCTURED CLUE (reveal, before ask): prerequisite=true, target=UNRESOLVED", () => {
    const r = evaluateLeftoverQuestionPrerequisite(afterReveal());
    expect(r).toMatchObject({ prerequisiteSatisfied: true, questionAsked: false, targetStatus: "UNRESOLVED" });
  });

  it("CONFIRM: target=KNOWN_TRUE", () => {
    const state = commitLeftoverQuestionResponse(afterAsk(), "CONFIRM");
    expect(evaluateLeftoverQuestionPrerequisite(state).targetStatus).toBe("KNOWN_TRUE");
  });

  it("DENY: target=KNOWN_FALSE", () => {
    const state = commitLeftoverQuestionResponse(afterAsk(), "DENY");
    expect(evaluateLeftoverQuestionPrerequisite(state).targetStatus).toBe("KNOWN_FALSE");
  });

  it("UNKNOWN: answerReceived=true, target=UNRESOLVED", () => {
    const state = commitLeftoverQuestionResponse(afterAsk(), "UNKNOWN");
    const r = evaluateLeftoverQuestionPrerequisite(state);
    expect(r.answerReceived).toBe(true);
    expect(r.targetStatus).toBe("UNRESOLVED");
  });

  it("NO_RESPONSE: answerReceived=false, target=UNRESOLVED", () => {
    const r = evaluateLeftoverQuestionPrerequisite(afterAsk());
    expect(r.answerReceived).toBe(false);
    expect(r.targetStatus).toBe("UNRESOLVED");
  });
});

describe("PHASE 11.13E: PRODUCT_AUTHORITATIVE prose-parser count must be 0 (directive Section 4) -- regression guard", () => {
  it("factsAssertedByMaterialConcreteContent (the deprecated substring-based function) is never called by any Product-authoritative export", () => {
    const filePath = path.resolve(__dirname, "../src/research/action-contract-v2/causalUnlockInvariant.ts");
    const content = fs.readFileSync(filePath, "utf8");
    const callSites = content.match(/factsAssertedByMaterialConcreteContent\(/g) ?? [];
    // Exactly 1 occurrence expected: the function's OWN definition line. Zero call sites.
    expect(callSites.length).toBe(1);
  });

  it("no other file under src/ imports or calls factsAssertedByMaterialConcreteContent", () => {
    const srcDir = path.resolve(__dirname, "../src");
    function walk(dir: string): string[] {
      return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [full];
      });
    }
    const files = walk(srcDir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
    const offenders = files.filter((f) => {
      if (f.endsWith("causalUnlockInvariant.ts")) return false;
      return fs.readFileSync(f, "utf8").includes("factsAssertedByMaterialConcreteContent");
    });
    expect(offenders).toEqual([]);
  });
});

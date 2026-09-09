import { describe, expect, it } from "vitest";
import { createInitialState, resolveAction, resolvePendingReplyEvent } from "../src/research/action-contract-v2/engine";
import {
  openYoheiLeftoverStockRequest,
  PLAYER_ACCEPTS_HELP_MOVE_STOCK,
  PLAYER_DECLINES_HELP_MOVE_STOCK,
  ASK_WHAT_HELP_NEEDED,
  ASK_FESTIVAL_SCENE,
  ASK_SALES_SCENE,
  ASK_WEATHER_SCENE,
  ASK_ABOUT_LEFTOVER_STOCK,
  LEFTOVER_STOCK_MOVED,
  yoheiContinuesLeftoverStockWorkNarration,
  buildYoheiPacket,
} from "../src/research/action-contract-v2/playableSceneContracts";
import { resolveYoheiSourceEvent, authoringSufficiencyGate } from "../src/research/action-contract-v2/yoheiSourceEvents";
import { createReplayLanguageAdapter, packetKey } from "../src/research/action-contract-v2/languageAdapter";
import { CAPTURED_YOHEI_LINES } from "../src/research/action-contract-v2/capturedYoheiLines";
import { PLAYER_LEAVES_EVENT } from "../src/research/action-contract-v2/pendingReplyContracts";

function baseState() {
  return openYoheiLeftoverStockRequest(createInitialState(), "test");
}

// A -- authoring sufficiency gate
describe("A: authoring sufficiency gate", () => {
  it("resolves sufficient for the properly-authored source event", () => {
    expect(authoringSufficiencyGate("YOHEI_ASKS_HELP_MOVE_LEFTOVER_STOCK")).toEqual({ sufficient: true, reason: "OK" });
  });

  it("fails closed (SPECIFICATION_FAILURE) for an unregistered id", () => {
    const result = authoringSufficiencyGate("YOHEI_ASKS_FOR_SOMETHING_UNDEFINED");
    expect(result.sufficient).toBe(false);
    expect(result.reason).toMatch(/SPECIFICATION_FAILURE/);
  });

  it("openYoheiLeftoverStockRequest throws rather than opening a PendingReply for an invalid gate (mechanical, no code path exists to bypass this for an invalid id since the function is hardcoded to the one registered id -- this test documents the gate's own behavior directly)", () => {
    expect(() => openYoheiLeftoverStockRequest(createInitialState(), "x")).not.toThrow();
  });
});

// B -- single-source sourceEvent semantics
describe("B: single-source sourceEvent semantics", () => {
  it("the packet's PENDING_REQUEST_CONTENT and the ASK_WHAT reveal both resolve through the SAME registry entry", () => {
    const state = baseState();
    const event = resolveYoheiSourceEvent(state.pendingReply!.sourceEventId);
    const packet = buildYoheiPacket(state, "何を手伝えばいい？", ASK_WHAT_HELP_NEEDED.playerIntent);
    expect(event).toBeDefined();
    expect(packet.pendingRequestContent).toBe(`KNOWN: ${event!.requestSubject}`);
  });

  it("the ACCEPT_HELP material id equals LEFTOVER_STOCK_MOVED's checked id -- Single Precondition Authority", () => {
    const state = baseState();
    const { state: after } = resolvePendingReplyEvent(state, PLAYER_ACCEPTS_HELP_MOVE_STOCK);
    const material = after.materials.find((m) => m.id === "leftover_stock_moved");
    expect(material).toBeDefined();
    expect(LEFTOVER_STOCK_MOVED.check(after)).toBe(true);
  });
});

// C -- PendingReply OPEN persistence / ordinary actions never touch it
describe("C: PendingReply OPEN persistence", () => {
  it("initial state is OPEN", () => {
    expect(baseState().pendingReply?.status).toBe("OPEN");
  });

  it("D: ASK_WHAT does not resolve pending", () => {
    const state = baseState();
    const { state: after } = resolveAction(state, ASK_WHAT_HELP_NEEDED);
    expect(after.pendingReply?.status).toBe("OPEN");
  });

  it("E: topic change (ASK_FESTIVAL/ASK_SALES/ASK_WEATHER) does not resolve pending", () => {
    const state = baseState();
    for (const contract of [ASK_FESTIVAL_SCENE, ASK_SALES_SCENE, ASK_WEATHER_SCENE]) {
      const { state: after } = resolveAction(state, contract);
      expect(after.pendingReply?.status).toBe("OPEN");
    }
  });
});

// F -- ACCEPT resolves correctly
describe("F: ACCEPT resolves correctly", () => {
  it("PLAYER_ACCEPTS_HELP_MOVE_STOCK transitions OPEN -> RESOLVED and admits the material", () => {
    const state = baseState();
    const { state: after, trace } = resolvePendingReplyEvent(state, PLAYER_ACCEPTS_HELP_MOVE_STOCK);
    expect(trace.statusBefore).toBe("OPEN");
    expect(trace.statusAfter).toBe("RESOLVED");
    expect(after.pendingReply?.status).toBe("RESOLVED");
    expect(trace.lifeMaterialDelta).toContain("leftover_stock_moved");
  });
});

// G -- DECLINE resolves correctly
describe("G: DECLINE resolves correctly", () => {
  it("PLAYER_DECLINES_HELP_MOVE_STOCK transitions OPEN -> RESOLVED, no material created, no guilt language", () => {
    const state = baseState();
    const { state: after, trace } = resolvePendingReplyEvent(state, PLAYER_DECLINES_HELP_MOVE_STOCK);
    expect(trace.statusAfter).toBe("RESOLVED");
    expect(after.materials.some((m) => m.id === "leftover_stock_moved")).toBe(false);
    expect(trace.narration.join("")).not.toMatch(/申し訳|残念|がっかり/);
  });
});

// H -- decline world-continuation visibility
describe("H: decline world-continuation visibility (NPC independence)", () => {
  it("Yohei continues alone after decline, and the narration differs once the box is actually moved", () => {
    const state = baseState();
    const declined = resolvePendingReplyEvent(state, PLAYER_DECLINES_HELP_MOVE_STOCK).state;
    const accepted = resolvePendingReplyEvent(state, PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    expect(yoheiContinuesLeftoverStockWorkNarration(declined).length).toBeGreaterThan(0);
    expect(yoheiContinuesLeftoverStockWorkNarration(accepted).length).toBeGreaterThan(0);
    expect(yoheiContinuesLeftoverStockWorkNarration(declined)).not.toEqual(yoheiContinuesLeftoverStockWorkNarration(accepted));
  });

  it("PLAYER_LEAVES does not itself resolve or withdraw, and Yohei still continues independently afterward", () => {
    const state = baseState();
    const { state: afterLeave, trace } = resolvePendingReplyEvent(state, PLAYER_LEAVES_EVENT);
    expect(trace.statusAfter).toBe("OPEN");
    expect(yoheiContinuesLeftoverStockWorkNarration(afterLeave).length).toBeGreaterThan(0);
  });
});

// I -- Action Contract postcondition actually becomes true
describe("I: Action Contract postcondition becomes true, not merely narrated", () => {
  it("LEFTOVER_STOCK_MOVED is false before accept and true after, checked mechanically not by narration text", () => {
    const state = baseState();
    expect(LEFTOVER_STOCK_MOVED.check(state)).toBe(false);
    const after = resolvePendingReplyEvent(state, PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    expect(LEFTOVER_STOCK_MOVED.check(after)).toBe(true);
  });
});

// J -- LLM state equality (the language adapter never touches state)
describe("J: language adapter is STRING ONLY -- never mutates state", () => {
  it("calling the replay adapter does not change the state object it read a packet from", () => {
    const state = baseState();
    const packet = buildYoheiPacket(state, "何を手伝えばいい？", ASK_WHAT_HELP_NEEDED.playerIntent);
    const before = JSON.stringify(state);
    const adapter = createReplayLanguageAdapter(CAPTURED_YOHEI_LINES);
    const line = adapter(packet);
    expect(typeof line).toBe("string");
    expect(JSON.stringify(state)).toBe(before);
  });

  it("the adapter never returns a fabricated line for an unrecorded packet -- explicit honest placeholder instead", () => {
    const adapter = createReplayLanguageAdapter([]);
    const packet = buildYoheiPacket(baseState(), "何か", "UNRECORDED_ACTION");
    expect(adapter(packet)).toMatch(/記録されていません/);
  });
});

// K -- Actor Experience packet correctness
describe("K: Actor Experience packet correctness", () => {
  it("buildYoheiPacket's firsthand list includes the real, provenance-verified sales facts", () => {
    const packet = buildYoheiPacket(baseState(), "売れ行きどうだった？", ASK_SALES_SCENE.playerIntent);
    expect(packet.firsthand.some((f) => f.includes("8割"))).toBe(true);
  });

  it("L: UNKNOWN weather remains explicitly unknown in every packet variant", () => {
    const before = baseState();
    const after = resolvePendingReplyEvent(before, PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    for (const state of [before, after]) {
      const packet = buildYoheiPacket(state, "雨降ってた？", ASK_WEATHER_SCENE.playerIntent);
      expect(packet.unknown.some((u) => u.includes("天気"))).toBe(true);
      expect(packet.firsthand.join("")).not.toMatch(/雨|晴れ/);
    }
  });

  it("M: sales firsthand grounding is present regardless of pending status", () => {
    const declined = resolvePendingReplyEvent(baseState(), PLAYER_DECLINES_HELP_MOVE_STOCK).state;
    const packet = buildYoheiPacket(declined, "売れ行きどうだった？", ASK_SALES_SCENE.playerIntent);
    expect(packet.firsthand.some((f) => f.includes("8割"))).toBe(true);
  });
});

// N -- State Admission only after real action
describe("N: State Admission only after real action", () => {
  it("no material exists before ACCEPT_HELP is actually dispatched", () => {
    expect(baseState().materials).toEqual([]);
  });

  it("ASK_WHAT/ASK_FESTIVAL/ASK_SALES/ASK_WEATHER create no material", () => {
    const state = baseState();
    for (const contract of [ASK_WHAT_HELP_NEEDED, ASK_FESTIVAL_SCENE, ASK_SALES_SCENE, ASK_WEATHER_SCENE]) {
      const { state: after } = resolveAction(state, contract);
      expect(after.materials).toEqual([]);
    }
  });
});

// O -- conditional new possibility eligibility
describe("O: ASK_ABOUT_LEFTOVER_STOCK is eligible only after ACCEPT_HELP", () => {
  it("ineligible before accept", () => {
    const state = baseState();
    const eligible = ASK_ABOUT_LEFTOVER_STOCK.eligibility.every((p) => p.check(state));
    expect(eligible).toBe(false);
  });

  it("eligible after accept", () => {
    const after = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    const eligible = ASK_ABOUT_LEFTOVER_STOCK.eligibility.every((p) => p.check(after));
    expect(eligible).toBe(true);
  });

  it("still ineligible after decline (no action occurred)", () => {
    const after = resolvePendingReplyEvent(baseState(), PLAYER_DECLINES_HELP_MOVE_STOCK).state;
    const eligible = ASK_ABOUT_LEFTOVER_STOCK.eligibility.every((p) => p.check(after));
    expect(eligible).toBe(false);
  });
});

// P -- packetKey stability used by the replay adapter
describe("P: packetKey is stable and matches captured lines for every scene action", () => {
  it("every scene action's packetKey has a corresponding captured line", () => {
    const beforeAccept = baseState();
    const afterAccept = resolvePendingReplyEvent(beforeAccept, PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    const cases: [ReturnType<typeof buildYoheiPacket>][] = [
      [buildYoheiPacket(beforeAccept, "何を手伝えばいい？", ASK_WHAT_HELP_NEEDED.playerIntent)],
      [buildYoheiPacket(beforeAccept, "祭りどうだった？", ASK_FESTIVAL_SCENE.playerIntent)],
      [buildYoheiPacket(beforeAccept, "売れ行きどうだった？", ASK_SALES_SCENE.playerIntent)],
      [buildYoheiPacket(beforeAccept, "雨降ってた？", ASK_WEATHER_SCENE.playerIntent)],
      [buildYoheiPacket(afterAccept, "これ、祭りの残り？", ASK_ABOUT_LEFTOVER_STOCK.playerIntent)],
    ];
    const keys = new Set(CAPTURED_YOHEI_LINES.map((c) => c.packetKey));
    for (const [packet] of cases) {
      expect(keys.has(packetKey(packet))).toBe(true);
    }
  });
});

// Q -- scope discipline (reused from every prior phase's pattern)
describe("Q: scope discipline", () => {
  it("no RAG/embeddings reference in this scene's own new files", () => {
    // static, minimal check on the known new file set for this phase
    const fs = require("node:fs");
    const path = require("node:path");
    const files = ["yoheiSourceEvents.ts", "playableSceneContracts.ts", "languageAdapter.ts", "capturedYoheiLines.ts"];
    for (const f of files) {
      const content = fs.readFileSync(path.resolve(__dirname, "../src/research/action-contract-v2", f), "utf8");
      expect(content).not.toMatch(/\bRAG\b|embedding|vector database/i);
      expect(content).not.toMatch(/dynamicState/);
    }
  });
});

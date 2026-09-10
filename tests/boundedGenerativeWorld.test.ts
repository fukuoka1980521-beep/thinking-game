import { describe, expect, it } from "vitest";
import { createInitialBgwState, commitConsequence, npcsPresentAt, yoheiCurrentActivity, miyokoCurrentActivity, jinPresentAt, hasActiveMaterial, advanceWorldTick } from "../src/research/bounded-generative-world/worldState";
import { buildNpcDialoguePacket } from "../src/research/bounded-generative-world/packet";
import { deterministicTestAdapter } from "../src/research/bounded-generative-world/testAdapter";
import { validateEnvelope } from "../src/research/bounded-generative-world/envelope";
import { LOCATIONS, TRAVEL_EDGES } from "../src/research/bounded-generative-world/canonData";
import type { BgwWorldState } from "../src/research/bounded-generative-world/types";

describe("PHASE 12.1: world state -- NPC presence/activity is state-derived, never menu-derived", () => {
  it("initial state: Yohei has an active task, Jin is at Yohei's store (STATE B, covering)", () => {
    const state = createInitialBgwState();
    expect(state.flags.yoheiTaskActive).toBe(true);
    expect(jinPresentAt(state, "YOHEI_STORE")).toBe(true);
    expect(npcsPresentAt(state, "YOHEI_STORE")).toEqual(["yohei", "jin"]);
    expect(npcsPresentAt(state, "CAFE_NODOKA")).toEqual(["miyoko"]);
  });

  it("map has exactly 5 locations, hub-and-spoke shape (MAP_CANON_RECHECK_V1.md)", () => {
    expect(LOCATIONS.map((l) => l.id).sort()).toEqual(["CAFE_NODOKA", "COMMUNITY_HALL", "SHOPPING_STREET", "TRIAL_HOUSE", "YOHEI_STORE"]);
    expect(TRAVEL_EDGES.SHOPPING_STREET.length).toBe(4);
    expect(TRAVEL_EDGES.TRIAL_HOUSE).toEqual(["SHOPPING_STREET"]);
  });

  it("AI-necessity experiment STATE A/B/C are real, distinct world states (directive Section 8, PHASE 12.0)", () => {
    const stateA: BgwWorldState = { ...createInitialBgwState(), jinJobLocation: null }; // Yohei alone, task active
    const stateB: BgwWorldState = createInitialBgwState(); // Jin already covering
    const stateC: BgwWorldState = { ...createInitialBgwState(), flags: { yoheiTaskActive: false }, jinJobLocation: null }; // no task

    expect(yoheiCurrentActivity(stateA)).toMatch(/一人で運ぼう/);
    expect(yoheiCurrentActivity(stateB)).toMatch(/相馬/);
    expect(yoheiCurrentActivity(stateC)).toMatch(/いつも通り/);
    // Same NPC, same nothing-yet-asked utterance target -- three genuinely different activity
    // readings, none of them a separately-authored button/branch.
    const readings = new Set([yoheiCurrentActivity(stateA), yoheiCurrentActivity(stateB), yoheiCurrentActivity(stateC)]);
    expect(readings.size).toBe(3);
  });

  it("directive Section 10 (PHASE 12.1): Jin's job progresses across world ticks WITHOUT the player ever talking to him -- real before/after state, not a declaration", () => {
    const before = createInitialBgwState();
    expect(before.worldTick).toBe(0);
    expect(before.jinJobLocation).toBe("YOHEI_STORE");
    expect(npcsPresentAt(before, "YOHEI_STORE")).toContain("jin");

    // Simulate the PLAYER traveling around WITHOUT ever opening a conversation with Jin.
    const afterTwoTravels = advanceWorldTick(advanceWorldTick(before)); // tick 2
    const afterThreeTravels = advanceWorldTick(afterTwoTravels); // tick 3
    const afterFiveTravels = advanceWorldTick(advanceWorldTick(afterThreeTravels)); // tick 5

    expect(afterTwoTravels.jinJobLocation).toBe("YOHEI_STORE"); // still finishing the same job
    expect(afterThreeTravels.jinJobLocation).toBe("CAFE_NODOKA"); // moved on, unprompted by the player
    expect(afterFiveTravels.jinJobLocation).toBeNull(); // today's jobs done

    expect(npcsPresentAt(afterThreeTravels, "YOHEI_STORE")).not.toContain("jin");
    expect(npcsPresentAt(afterThreeTravels, "CAFE_NODOKA")).toContain("jin");
    // Never mutated by anything except the world tick -- no experienceLog entry was ever written.
    expect(afterFiveTravels.experienceLog).toEqual([]);
  });

  it("Miyoko's activity also reflects Jin's state-derived presence", () => {
    const withJinAtCafe: BgwWorldState = { ...createInitialBgwState(), jinJobLocation: "CAFE_NODOKA" };
    expect(miyokoCurrentActivity(withJinAtCafe)).toMatch(/相馬/);
    expect(miyokoCurrentActivity(createInitialBgwState())).toMatch(/いつも通り/);
  });
});

describe("PHASE 12.1: deterministic State Admission -- consequence commit never trusts a raw proposal", () => {
  it("a registered consequence id commits a real LifeMaterial via the existing admitMaterials/mergeMaterials pipeline", () => {
    const state: BgwWorldState = { ...createInitialBgwState(), jinJobLocation: null };
    expect(hasActiveMaterial(state, "yohei_help_promise")).toBe(false);
    const after = commitConsequence(state, "YOHEI_HELP_PROMISE");
    expect(hasActiveMaterial(after, "yohei_help_promise")).toBe(true);
    expect(yoheiCurrentActivity(after)).toMatch(/プレイヤーと一緒に/);
  });

  it("an UNREGISTERED consequence id commits nothing (fail-closed, directive Section 14)", () => {
    const state = createInitialBgwState();
    const after = commitConsequence(state, "SOMETHING_THE_MODEL_MADE_UP");
    expect(after.materials).toEqual(state.materials);
  });

  it("once committed, the same consequence id is no longer offered as allowed (packet.allowedConsequenceIds)", () => {
    const before = { ...createInitialBgwState(), jinJobLocation: null };
    const packetBefore = buildNpcDialoguePacket("yohei", before, "手伝おうか？");
    expect(packetBefore.allowedConsequenceIds).toContain("YOHEI_HELP_PROMISE");

    const after = commitConsequence(before, "YOHEI_HELP_PROMISE");
    const packetAfter = buildNpcDialoguePacket("yohei", after, "手伝おうか？");
    expect(packetAfter.allowedConsequenceIds).not.toContain("YOHEI_HELP_PROMISE");
  });

  it("STATE B (Jin already covering): YOHEI_HELP_PROMISE is not in the allowed-consequence boundary at all", () => {
    const stateB = createInitialBgwState(); // jinJobLocation: YOHEI_STORE
    const packet = buildNpcDialoguePacket("yohei", stateB, "手伝おうか？");
    expect(packet.allowedConsequenceIds).toEqual([]);
  });
});

describe("PHASE 12.1: hard structural validation -- never trusts raw adapter output", () => {
  it("an invalid classification fails closed to INSUFFICIENT_CONTEXT", () => {
    const state = createInitialBgwState();
    const packet = buildNpcDialoguePacket("yohei", state, "test");
    const result = validateEnvelope({ classification: "MADE_UP_CLASS" as never, npcResponseIntent: "x", proposedConsequenceId: null, visibleUtterance: "hi" }, packet);
    expect(result.classification).toBe("INSUFFICIENT_CONTEXT");
  });

  it("a proposedConsequenceId NOT in allowedConsequenceIds is dropped, never committed", () => {
    const stateB = createInitialBgwState(); // YOHEI_HELP_PROMISE not allowed here (Jin covering)
    const packet = buildNpcDialoguePacket("yohei", stateB, "手伝おうか？");
    const result = validateEnvelope({ classification: "IN_SCOPE", npcResponseIntent: "x", proposedConsequenceId: "YOHEI_HELP_PROMISE", visibleUtterance: "hi" }, packet);
    expect(result.proposedConsequenceId).toBeNull();
  });

  it("a null/malformed raw envelope fails closed with a non-empty fallback utterance, never throws", () => {
    const state = createInitialBgwState();
    const packet = buildNpcDialoguePacket("yohei", state, "test");
    const result = validateEnvelope(null, packet);
    expect(result.classification).toBe("INSUFFICIENT_CONTEXT");
    expect(result.visibleUtterance.length).toBeGreaterThan(0);
  });
});

describe("PHASE 12.1: bounded free-text evidence (directive Section 7) -- deterministic adapter, for pipeline regression only", () => {
  it("A. unauthored feasible suggestion -- commits the real consequence", async () => {
    const state = { ...createInitialBgwState(), jinJobLocation: null };
    const packet = buildNpcDialoguePacket("yohei", state, "手伝おうか？");
    const envelope = await deterministicTestAdapter(packet);
    expect(envelope.classification).toBe("IN_SCOPE");
    expect(envelope.proposedConsequenceId).toBe("YOHEI_HELP_PROMISE");
  });

  it("B. NPC does not know (Miyoko has no channel into Yohei's stock specifics)", async () => {
    const state = createInitialBgwState();
    const packet = buildNpcDialoguePacket("miyoko", state, "洋平さんの今日の仕入れの中身教えて");
    const envelope = await deterministicTestAdapter(packet);
    expect(envelope.classification).toBe("NPC_KNOWLEDGE_GAP");
  });

  it("C. outside NPC scope (administrative specifics Yohei has no reason to know)", async () => {
    const state = createInitialBgwState();
    const packet = buildNpcDialoguePacket("yohei", state, "チャレンジセンターの担当者は誰？");
    const envelope = await deterministicTestAdapter(packet);
    expect(envelope.classification).toBe("NPC_KNOWLEDGE_GAP");
  });

  it("D. outside world scope", async () => {
    const state = createInitialBgwState();
    const packet = buildNpcDialoguePacket("yohei", state, "今日の株価どうなった？");
    const envelope = await deterministicTestAdapter(packet);
    expect(envelope.classification).toBe("OUT_OF_WORLD_SCOPE");
  });

  it("E. false PLAYER world assertion -- does not commit anything", async () => {
    const state = createInitialBgwState();
    const packet = buildNpcDialoguePacket("yohei", state, "さっき手伝うって言ったよね？");
    const envelope = await deterministicTestAdapter(packet);
    expect(envelope.proposedConsequenceId).toBeNull();
    const after = envelope.proposedConsequenceId ? commitConsequence(state, envelope.proposedConsequenceId) : state;
    expect(after.materials).toEqual(state.materials);
  });
});

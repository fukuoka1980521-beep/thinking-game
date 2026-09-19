import { describe, expect, it } from "vitest";
import {
  advanceToDay2,
  canAdvanceToDay2,
  canEndSlice,
  canReach,
  endSlice,
  enterFreeTalk,
  moveTo,
  purchaseVegetables,
  recordConversationTurn,
  setKeptEyeOutForDelivery,
} from "../src/newlife7day/engine";
import { STARTING_MONEY, VEGETABLES_PRICE, canAffordFreeTalk, createInitial7DayState } from "../src/newlife7day/types";

describe("newlife7day engine -- 2-action budget", () => {
  it("starts at TRIAL_HOUSE with 0 actions used and both destinations reachable", () => {
    const s = createInitial7DayState();
    expect(s.playerLocation).toBe("TRIAL_HOUSE");
    expect(canReach(s, "YOHEI_STORE")).toBe(true);
    expect(canReach(s, "SHOPPING_STREET")).toBe(true);
  });

  it("spends one action per visit to a real destination, never for returning home", () => {
    let s = createInitial7DayState();
    s = moveTo(s, "YOHEI_STORE");
    expect(s.actionsUsedToday).toBe(1);
    s = moveTo(s, "TRIAL_HOUSE");
    expect(s.actionsUsedToday).toBe(1);
    s = moveTo(s, "SHOPPING_STREET");
    expect(s.actionsUsedToday).toBe(2);
  });

  it("blocks a 3rd destination visit once the day's 2 actions are spent", () => {
    let s = createInitial7DayState();
    s = moveTo(s, "YOHEI_STORE");
    s = moveTo(s, "TRIAL_HOUSE");
    s = moveTo(s, "SHOPPING_STREET");
    expect(canReach(s, "YOHEI_STORE")).toBe(false);
    const blocked = moveTo(s, "YOHEI_STORE");
    expect(blocked).toBe(s); // no-op, state unchanged
    expect(canReach(s, "TRIAL_HOUSE")).toBe(true);
  });

  it("never forces the player to visit both NPCs -- both actions can be spent at one location", () => {
    let s = createInitial7DayState();
    s = moveTo(s, "YOHEI_STORE");
    s = moveTo(s, "TRIAL_HOUSE");
    s = moveTo(s, "YOHEI_STORE");
    expect(s.actionsUsedToday).toBe(2);
    expect(s.visitedToday).toEqual(["YOHEI_STORE", "TRIAL_HOUSE"]);
    expect(s.visitedToday).not.toContain("SHOPPING_STREET");
  });

  it("only allows setKeptEyeOutForDelivery at Yohei's store on day 1", () => {
    let s = createInitial7DayState();
    s = moveTo(s, "YOHEI_STORE");
    s = setKeptEyeOutForDelivery(s, true);
    expect(s.keptEyeOutForDelivery).toBe(true);

    let s2 = createInitial7DayState();
    s2 = moveTo(s2, "SHOPPING_STREET");
    s2 = setKeptEyeOutForDelivery(s2, true);
    expect(s2.keptEyeOutForDelivery).toBe(null);
  });

  it("advances Day1 -> Day2 only from TRIAL_HOUSE, resetting the action budget and resolving the delivery unconditionally", () => {
    let s = createInitial7DayState();
    expect(canAdvanceToDay2(s)).toBe(true);
    s = moveTo(s, "YOHEI_STORE");
    expect(canAdvanceToDay2(s)).toBe(false); // not at TRIAL_HOUSE
    s = moveTo(s, "TRIAL_HOUSE");
    expect(canAdvanceToDay2(s)).toBe(true);
    s = advanceToDay2(s);
    expect(s.day).toBe(2);
    expect(s.actionsUsedToday).toBe(0);
    expect(s.visitedToday).toEqual([]);
    expect(s.deliveryArrived).toBe(true);
  });

  it("delivery resolves the same on day 2 whether or not the player engaged with the choice", () => {
    let engaged = createInitial7DayState();
    engaged = moveTo(engaged, "YOHEI_STORE");
    engaged = setKeptEyeOutForDelivery(engaged, true);
    engaged = moveTo(engaged, "TRIAL_HOUSE");
    engaged = advanceToDay2(engaged);

    let ignored = createInitial7DayState();
    ignored = moveTo(ignored, "TRIAL_HOUSE");
    ignored = advanceToDay2(ignored);

    let neverVisited = createInitial7DayState();
    neverVisited = advanceToDay2(neverVisited);

    expect(engaged.deliveryArrived).toBe(true);
    expect(ignored.deliveryArrived).toBe(true);
    expect(neverVisited.deliveryArrived).toBe(true);
  });

  it("does not advance past day 2, and only ends the slice from TRIAL_HOUSE on day 2", () => {
    let s = createInitial7DayState();
    s = moveTo(s, "TRIAL_HOUSE");
    s = advanceToDay2(s);
    expect(canEndSlice(s)).toBe(true);
    expect(canAdvanceToDay2(s)).toBe(false); // day 3 is never reachable from this engine
    s = endSlice(s);
    expect(s.ended).toBe(true);
    expect(canReach(s, "YOHEI_STORE")).toBe(false);
  });

  it("tracks whether the current arrival is the very first time at that location (regression: opening-line text must not read a first meeting as a return visit)", () => {
    let s = createInitial7DayState();
    s = moveTo(s, "SHOPPING_STREET");
    expect(s.firstTimeAtCurrentLocation).toBe(true);
    s = moveTo(s, "TRIAL_HOUSE");
    s = moveTo(s, "SHOPPING_STREET");
    expect(s.firstTimeAtCurrentLocation).toBe(false);
  });

  it("records conversation turns per-NPC without mixing memories", () => {
    let s = createInitial7DayState();
    s = recordConversationTurn(s, "yohei", { day: 1, time: 0, playerUtterance: "こんにちは", npcReply: "おう" });
    expect(s.npcMemory.yohei).toHaveLength(1);
    expect(s.npcMemory.hina).toHaveLength(0);
  });

  describe("PHASE_22_5 -- deep-talk cost (fixes '2 actions but both locations always reachable')", () => {
    it("entering free talk spends 1 action, on top of the visit that already cost 1", () => {
      let s = createInitial7DayState();
      s = moveTo(s, "YOHEI_STORE");
      expect(s.actionsUsedToday).toBe(1);
      expect(canAffordFreeTalk(s)).toBe(true);
      s = enterFreeTalk(s);
      expect(s.actionsUsedToday).toBe(2);
      expect(canAffordFreeTalk(s)).toBe(false);
    });

    it("going deep with one NPC (visit + free talk) leaves no budget for the other location", () => {
      let s = createInitial7DayState();
      s = moveTo(s, "SHOPPING_STREET");
      s = enterFreeTalk(s);
      expect(canReach(s, "YOHEI_STORE")).toBe(false);
      expect(canReach(s, "TRIAL_HOUSE")).toBe(true); // home is always free
    });

    it("entering free talk is a no-op once the day's budget is already spent", () => {
      let s = createInitial7DayState();
      s = moveTo(s, "YOHEI_STORE");
      s = moveTo(s, "TRIAL_HOUSE");
      s = moveTo(s, "SHOPPING_STREET");
      expect(s.actionsUsedToday).toBe(2);
      const blocked = enterFreeTalk(s);
      expect(blocked).toBe(s);
    });

    it("the broad path (structural-only visits to both locations) still costs exactly the 2 visits, no more", () => {
      let s = createInitial7DayState();
      s = moveTo(s, "YOHEI_STORE");
      s = moveTo(s, "TRIAL_HOUSE");
      s = moveTo(s, "SHOPPING_STREET");
      expect(s.actionsUsedToday).toBe(2);
      expect(s.everVisited).toEqual(expect.arrayContaining(["YOHEI_STORE", "SHOPPING_STREET"]));
    });
  });

  describe("PHASE_22_5 -- purchase has a real, persistent state change", () => {
    it("buying vegetables decreases money and records the item", () => {
      let s = createInitial7DayState();
      expect(s.money).toBe(STARTING_MONEY);
      s = purchaseVegetables(s);
      expect(s.money).toBe(STARTING_MONEY - VEGETABLES_PRICE);
      expect(s.boughtItems).toEqual(["野菜"]);
    });

    it("does not go negative -- a purchase beyond available money is a no-op", () => {
      let s = createInitial7DayState();
      s = { ...s, money: 100 }; // less than VEGETABLES_PRICE
      const blocked = purchaseVegetables(s);
      expect(blocked).toBe(s);
    });

    it("money and inventory persist across a day transition", () => {
      let s = createInitial7DayState();
      s = moveTo(s, "YOHEI_STORE");
      s = purchaseVegetables(s);
      s = moveTo(s, "TRIAL_HOUSE");
      s = advanceToDay2(s);
      expect(s.money).toBe(STARTING_MONEY - VEGETABLES_PRICE);
      expect(s.boughtItems).toEqual(["野菜"]);
    });
  });
});

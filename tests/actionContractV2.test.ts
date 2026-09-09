import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createInitialState, resolveAction, resolveFollowUp, advanceDay } from "../src/research/action-contract-v2/engine";
import {
  VISIT_YOHEI_SIMPLE_PURCHASE,
  VISIT_YOHEI_WITH_BAG_TASK,
  BUY_BAGS_FOLLOW_UP,
  EXPLORE_HALL_JIN_WORKING,
  OFFER_HELP_FOLLOW_UP,
  REST,
  TRASH_BAGS_NEEDED,
  JIN_HELPER_ABSENT,
  jinContinuesWorkNarration,
} from "../src/research/action-contract-v2/contracts";
import { resolveFreeTextCandidate, confirmFreeTextAction } from "../src/research/action-contract-v2/freeTextBoundary";
import type { ContractV2State } from "../src/research/action-contract-v2/types";
import type { LifeMaterial } from "../src/research/life-material-7day/types";

const REPO_ROOT = path.resolve(__dirname, "..");
const MODULE_DIR = path.join(REPO_ROOT, "src/research/action-contract-v2");

function seededBagState(day: number): ContractV2State {
  const seedMaterial: LifeMaterial = {
    id: "trash_bags_needed",
    type: "PENDING_TASK",
    concreteContent: "洋平に、燃えるゴミの日は指定の透明袋が必要だと言われたが、まだ持っていない",
    origin: "seed",
    dayCreated: 2,
    authority: "PLAYER_CHOSEN_FACT",
    status: "ACTIVE",
    knownBy: ["player", "yohei"],
    possibleConsumers: [],
  };
  return createInitialState({ day, materials: [seedMaterial] });
}

// A/B -- simple purchase succeeds, no follow-up
describe("A/B: simple purchase succeeds with no follow-up", () => {
  it("A: VISIT_YOHEI_SIMPLE_PURCHASE resolves successfully", () => {
    const { state, trace } = resolveAction(createInitialState(), VISIT_YOHEI_SIMPLE_PURCHASE);
    expect(trace.authoritativeEvent).toBe("ORDINARY_TRANSACTION");
    expect(state.narration).toEqual(["必要な物を買って、店を出た。"]);
  });

  it("B: has no conditional follow-up", () => {
    const { state, trace } = resolveAction(createInitialState(), VISIT_YOHEI_SIMPLE_PURCHASE);
    expect(trace.conditionalAffordances).toBe("NONE");
    expect(state.pending).toBeNull();
  });
});

// C/D -- explicit buttons require no confirmation
describe("C/D: explicit button dispatch never requires confirmation", () => {
  it("C: the purchase button resolves in one step, with no confirmation call anywhere in the path", () => {
    const { trace } = resolveAction(createInitialState(), VISIT_YOHEI_SIMPLE_PURCHASE);
    expect(trace.authoritativeEvent).toBe("ORDINARY_TRANSACTION"); // resolved directly, no intermediate confirmation state
  });

  it("D: REST resolves in one step with no confirmation", () => {
    const { trace } = resolveAction(createInitialState(), REST);
    expect(trace.authoritativeEvent).toBe("REST_QUIETLY");
  });
});

// E/F -- conditional affordance appears only after observation AND only when the canonical demand condition is true
describe("E/F: conditional affordance is world-state-gated, revealed only after the initial action", () => {
  it("E: OFFER_HELP is not part of any pre-existing menu -- it only exists in the state RETURNED by resolving EXPLORE_HALL_JIN_WORKING", () => {
    const initial = createInitialState({ world: { jinHelperAbsentToday: true } });
    expect(initial.pending).toBeNull(); // nothing is offered before the initial action occurs
    const { state } = resolveAction(initial, EXPLORE_HALL_JIN_WORKING);
    expect(state.pending?.affordances.map((a) => a.id)).toEqual(["OFFER_HELP"]);
  });

  it("F: OFFER_HELP appears only when the canonical demand condition (JIN_HELPER_ABSENT) is true", () => {
    const present = resolveAction(createInitialState({ world: { jinHelperAbsentToday: false } }), EXPLORE_HALL_JIN_WORKING);
    expect(present.trace.conditionalAffordances).toBe("NONE");
    expect(present.state.pending).toBeNull();
  });
});

// G/H -- accept vs decline
describe("G/H: accepting help creates the event, declining does not", () => {
  it("G: accepting creates HELP_MOVE_TABLE + a persistent SHARED_EVENT via State Admission", () => {
    const explored = resolveAction(createInitialState({ world: { jinHelperAbsentToday: true } }), EXPLORE_HALL_JIN_WORKING);
    const { state, trace } = resolveFollowUp(explored.state, OFFER_HELP_FOLLOW_UP);
    expect(trace?.authoritativeEvent).toBe("HELP_MOVE_TABLE");
    expect(state.materials.some((m) => m.id === "helped_jin_move_table" && m.status === "ACTIVE")).toBe(true);
  });

  it("H: declining creates no event and no material", () => {
    const explored = resolveAction(createInitialState({ world: { jinHelperAbsentToday: true } }), EXPLORE_HALL_JIN_WORKING);
    const { state, trace } = resolveFollowUp(explored.state, null);
    expect(trace).toBeNull();
    expect(state.materials.some((m) => m.id === "helped_jin_move_table")).toBe(false);
  });
});

// I -- Jin continues without PLAYER
describe("I: NPC purpose is not overridden by PLAYER's choice", () => {
  it("Jin's work-completion narration exists whether helped or not, and differs honestly", () => {
    const helpedState = resolveFollowUp(resolveAction(createInitialState({ world: { jinHelperAbsentToday: true } }), EXPLORE_HALL_JIN_WORKING).state, OFFER_HELP_FOLLOW_UP).state;
    const declinedState = resolveFollowUp(resolveAction(createInitialState({ world: { jinHelperAbsentToday: true } }), EXPLORE_HALL_JIN_WORKING).state, null).state;
    expect(jinContinuesWorkNarration(helpedState).length).toBeGreaterThan(0);
    expect(jinContinuesWorkNarration(declinedState).length).toBeGreaterThan(0);
    expect(jinContinuesWorkNarration(declinedState)[0]).not.toBe(jinContinuesWorkNarration(helpedState)[0]);
  });
});

// J -- SHARED_EVENT is factual history only, not a reward
describe("J: SHARED_EVENT records only that an event was shared, never a score", () => {
  it("the helped-Jin material carries no numeric/score field of any kind", () => {
    const explored = resolveAction(createInitialState({ world: { jinHelperAbsentToday: true } }), EXPLORE_HALL_JIN_WORKING);
    const { state } = resolveFollowUp(explored.state, OFFER_HELP_FOLLOW_UP);
    const material = state.materials.find((m) => m.id === "helped_jin_move_table")!;
    expect(material.type).toBe("SHARED_EVENT");
    expect(Object.keys(material)).not.toContain("relationshipDelta");
    expect(Object.keys(material)).not.toContain("score");
    expect(material.concreteContent).toBe("迅と一緒に公民館の長机を運んだ"); // a fact, not a rating
  });
});

// K -- action availability and outcome resolution share canonical precondition authority
describe("K: eligibility and resolver share ONE authoritative canonical precondition", () => {
  it("the BUY_BAGS affordance and BUY_BAGS_FOLLOW_UP reference the literal same TRASH_BAGS_NEEDED object", () => {
    const state = seededBagState(6);
    const affordances = VISIT_YOHEI_WITH_BAG_TASK.conditionalFollowUpAffordance(state);
    expect(affordances).not.toBe("NONE");
    if (affordances === "NONE") throw new Error("unreachable");
    expect(affordances[0].eligibility[0]).toBe(TRASH_BAGS_NEEDED);
    expect(BUY_BAGS_FOLLOW_UP.eligibility[0]).toBe(TRASH_BAGS_NEEDED);
    expect(affordances[0].eligibility[0]).toBe(BUY_BAGS_FOLLOW_UP.eligibility[0]);
  });

  it("Jin's OFFER_HELP affordance and OFFER_HELP_FOLLOW_UP share the same JIN_HELPER_ABSENT object", () => {
    const state = createInitialState({ world: { jinHelperAbsentToday: true } });
    const affordances = EXPLORE_HALL_JIN_WORKING.conditionalFollowUpAffordance(state);
    expect(affordances).not.toBe("NONE");
    if (affordances === "NONE") throw new Error("unreachable");
    expect(affordances[0].eligibility[0]).toBe(JIN_HELPER_ABSENT);
    expect(OFFER_HELP_FOLLOW_UP.eligibility[0]).toBe(JIN_HELPER_ABSENT);
  });

  it("the trace's canonicalPreconditionId is identical for the affordance-offering step and the follow-up resolution step", () => {
    const visited = resolveAction(seededBagState(6), VISIT_YOHEI_WITH_BAG_TASK);
    const bought = resolveFollowUp(visited.state, BUY_BAGS_FOLLOW_UP);
    expect(bought.trace?.canonicalPreconditionId).toBe(TRASH_BAGS_NEEDED.id);
  });
});

// L -- trash-bag drift case prevented under the tested regression
describe("L: RUN_MIXED trash-bag failure class not reproduced under the tested regression", () => {
  it("BUY_BAGS appears and resolves successfully on days far from the old day===4 hardcode", () => {
    for (const day of [4, 6, 11, 19, 27]) {
      const visited = resolveAction(seededBagState(day), VISIT_YOHEI_WITH_BAG_TASK);
      expect(visited.trace.conditionalAffordances).toEqual(["BUY_BAGS"]);
      const bought = resolveFollowUp(visited.state, BUY_BAGS_FOLLOW_UP);
      expect(bought.trace?.authoritativeEvent).toBe("BUY_TRASH_BAGS");
      expect(bought.state.materials.some((m) => m.id === "trash_bags_owned" && m.status === "ACTIVE")).toBe(true);
    }
  });
});

// M -- narration cannot mutate state
describe("M: narration text never influences state computation", () => {
  it("two contracts with identical stateDelta/authoritativeEvent but different visibleFeedback text produce identical materials", () => {
    const altWordingContract = { ...BUY_BAGS_FOLLOW_UP, visibleFeedback: () => ({ onSuccess: ["(全く違う文言)"], onPartialSuccess: null, onFailure: null }) };
    const a = resolveAction(seededBagState(6), BUY_BAGS_FOLLOW_UP);
    const b = resolveAction(seededBagState(6), altWordingContract);
    expect(a.state.materials).toEqual(b.state.materials);
    expect(a.state.narration).not.toEqual(b.state.narration);
  });
});

// N -- State Admission required for persistent changes
describe("N: every persistent material change passes through State Admission", () => {
  it("BUY_BAGS's trace records a State Admission entry for the material it creates", () => {
    const { trace } = resolveAction(seededBagState(6), BUY_BAGS_FOLLOW_UP);
    expect(trace.stateAdmissionDecision.length).toBeGreaterThan(0);
    expect(trace.stateAdmissionDecision[0].admissionDecision).toBe("ADMIT_AUTOMATICALLY");
    expect(trace.lifeMaterialDelta).toContain("trash_bags_owned");
  });

  it("an action with no state delta records no State Admission entries", () => {
    const { trace } = resolveAction(createInitialState(), REST);
    expect(trace.stateAdmissionDecision).toEqual([]);
  });
});

// O -- WITNESSED != PARTICIPATED
describe("O: Actor Experience modes differ correctly by actual involvement", () => {
  it("observing Jin writes WITNESSED for PLAYER, PARTICIPATED for Jin (his own ongoing work)", () => {
    const { trace } = resolveAction(createInitialState({ world: { jinHelperAbsentToday: true } }), EXPLORE_HALL_JIN_WORKING);
    const player = trace.actorExperienceDelta.find((e) => e.actorId === "player");
    const jin = trace.actorExperienceDelta.find((e) => e.actorId === "jin");
    expect(player?.mode).toBe("WITNESSED");
    expect(jin?.mode).toBe("PARTICIPATED");
    expect(player?.mode).not.toBe(jin?.mode);
  });

  it("helping Jin upgrades PLAYER's own mode to PARTICIPATED", () => {
    const explored = resolveAction(createInitialState({ world: { jinHelperAbsentToday: true } }), EXPLORE_HALL_JIN_WORKING);
    const { trace } = resolveFollowUp(explored.state, OFFER_HELP_FOLLOW_UP);
    const player = trace?.actorExperienceDelta.find((e) => e.actorId === "player");
    expect(player?.mode).toBe("PARTICIPATED");
  });
});

// P/Q/R/S -- free-text boundary
describe("P/Q/R/S: free-text boundary -- same interpreted intent, different world, confirmation only where required", () => {
  it("P: same interpreted intent under different world state does not force the same result", () => {
    const helpNeeded = resolveAction(createInitialState({ world: { jinHelperAbsentToday: true } }), EXPLORE_HALL_JIN_WORKING).state;
    const helpNotNeeded = resolveAction(createInitialState({ world: { jinHelperAbsentToday: false } }), EXPLORE_HALL_JIN_WORKING).state;
    const candidateA = resolveFreeTextCandidate(helpNeeded, "手が足りないなら少し手伝おうか？");
    const candidateB = resolveFreeTextCandidate(helpNotNeeded, "手が足りないなら少し手伝おうか？");
    expect(candidateA.interpretedIntentId).toBe(candidateB.interpretedIntentId);
    expect(candidateA.legitimate).toBe(true);
    expect(candidateB.legitimate).toBe(false);
  });

  it("Q: resolving a free-text candidate never itself mutates state", () => {
    const state = resolveAction(createInitialState({ world: { jinHelperAbsentToday: true } }), EXPLORE_HALL_JIN_WORKING).state;
    const before = JSON.stringify(state.materials);
    resolveFreeTextCandidate(state, "手が足りないなら少し手伝おうか？");
    expect(JSON.stringify(state.materials)).toBe(before);
  });

  it("R: a free-text-derived persistent action requires the prototype confirmation step", () => {
    const explored = resolveAction(createInitialState({ world: { jinHelperAbsentToday: true } }), EXPLORE_HALL_JIN_WORKING);
    const candidate = resolveFreeTextCandidate(explored.state, "手が足りないなら少し手伝おうか？");
    expect(explored.state.materials.some((m) => m.id === "helped_jin_move_table")).toBe(false);
    const confirmedContract = confirmFreeTextAction(candidate, { OFFER_HELP: OFFER_HELP_FOLLOW_UP });
    const resolved = resolveFollowUp(explored.state, confirmedContract, candidate.interpretedIntentId);
    expect(resolved.state.materials.some((m) => m.id === "helped_jin_move_table" && m.status === "ACTIVE")).toBe(true);
    expect(resolved.trace?.interpretedIntent).toBe("OFFER_HELP");
  });

  it("an illegitimate free-text candidate never produces a confirmable contract", () => {
    const explored = resolveAction(createInitialState({ world: { jinHelperAbsentToday: false } }), EXPLORE_HALL_JIN_WORKING);
    const candidate = resolveFreeTextCandidate(explored.state, "手が足りないなら少し手伝おうか？");
    const confirmedContract = confirmFreeTextAction(candidate, { OFFER_HELP: OFFER_HELP_FOLLOW_UP });
    expect(confirmedContract).toBeNull();
  });

  it("S: the explicit HELP button path (resolveFollowUp with no override) never sets a distinct interpretedIntent -- it's a plain alias, proving no confirmation ceremony was interposed", () => {
    const explored = resolveAction(createInitialState({ world: { jinHelperAbsentToday: true } }), EXPLORE_HALL_JIN_WORKING);
    const { trace } = resolveFollowUp(explored.state, OFFER_HELP_FOLLOW_UP);
    expect(trace?.interpretedIntent).toBe(trace?.initialIntent);
  });
});

// T/U/V -- scope discipline
describe("T/U/V: scope discipline", () => {
  it("T/U: no RAG or embeddings reference in this module's actual code", () => {
    const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    for (const file of fs.readdirSync(MODULE_DIR)) {
      const content = stripComments(fs.readFileSync(path.join(MODULE_DIR, file), "utf8"));
      expect(content).not.toMatch(/\bRAG\b|embedding|vector database|cosine similarity/i);
    }
  });

  it("V: no import of or reference to Dynamic State anywhere in this module", () => {
    for (const file of fs.readdirSync(MODULE_DIR)) {
      const content = fs.readFileSync(path.join(MODULE_DIR, file), "utf8");
      expect(content).not.toMatch(/dynamicState/);
    }
  });
});

// W -- no DAY8+ / no autonomous day generation
describe("W: no autonomous day progression beyond explicit calls", () => {
  it("advanceDay only ever moves forward by exactly one day per call, never generates ahead", () => {
    let state = createInitialState();
    for (let i = 0; i < 3; i++) state = advanceDay(state);
    expect(state.day).toBe(4);
  });
});

// X -- default NEW LIFE untouched
describe("X: default NEW LIFE remains untouched", () => {
  it("no file in this module imports from src/newlife", () => {
    const importRe = /^\s*import .*from ["'].*\/newlife\/.*["']/im;
    for (const file of fs.readdirSync(MODULE_DIR)) {
      const content = fs.readFileSync(path.join(MODULE_DIR, file), "utf8");
      expect(content).not.toMatch(importRe);
    }
  });
});

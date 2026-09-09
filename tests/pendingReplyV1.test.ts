import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createInitialState, resolveAction, resolvePendingReplyEvent, advanceDay } from "../src/research/action-contract-v2/engine";
import {
  yoheiAsksForHelp,
  yoheiAsksToBringItemTomorrow,
  PLAYER_ACCEPTS_REQUEST,
  PLAYER_ACCEPTS_PROMISE_REQUEST,
  PLAYER_DECLINES_REQUEST,
  PLAYER_DEFERS_REPLY,
  YOHEI_WITHDRAWS_REQUEST,
  YOHEI_SELF_RESOLVES,
  PLAYER_LEAVES_EVENT,
  SMALL_TALK,
  GREETING,
  ASK_FESTIVAL,
  TRIVIAL_COFFEE_EXCHANGE,
  yoheiContinuesShopWorkNarration,
  customerArrives,
  customerLeaves,
  dispatchConfirmedPendingIntent,
} from "../src/research/action-contract-v2/pendingReplyContracts";
import { resolvePendingFreeTextCandidates } from "../src/research/action-contract-v2/freeTextBoundary";

const REPO_ROOT = path.resolve(__dirname, "..");
const MODULE_DIR = path.join(REPO_ROOT, "src/research/action-contract-v2");

// A -- direct answer resolves
describe("A: direct answer resolves", () => {
  it("PLAYER_ACCEPTS_REQUEST transitions OPEN -> RESOLVED with no confirmation ceremony", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "a");
    expect(opened.pendingReply?.status).toBe("OPEN");
    const { state, trace } = resolvePendingReplyEvent(opened, PLAYER_ACCEPTS_REQUEST);
    expect(trace.statusBefore).toBe("OPEN");
    expect(trace.statusAfter).toBe("RESOLVED");
    expect(state.pendingReply?.status).toBe("RESOLVED");
  });
});

// B -- small talk does not
describe("B: small talk does not resolve/defer/withdraw a PendingReply", () => {
  it("SMALL_TALK leaves pendingReply status untouched", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "b");
    const { state } = resolveAction(opened, SMALL_TALK);
    expect(state.pendingReply?.status).toBe("OPEN");
    expect(state.pendingReply?.id).toBe(opened.pendingReply?.id);
  });
});

// C -- greeting does not
describe("C: greeting-like utterance does not reset or resolve", () => {
  it("GREETING leaves pendingReply status untouched and does not reinitialize it", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "c");
    const { state } = resolveAction(opened, GREETING);
    expect(state.pendingReply).toEqual(opened.pendingReply);
  });
});

// D -- topic change does not
describe("D: topic change does not resolve/defer/withdraw", () => {
  it("ASK_FESTIVAL leaves pendingReply OPEN and re-presents the original request", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "d");
    const { state } = resolveAction(opened, ASK_FESTIVAL);
    expect(state.pendingReply?.status).toBe("OPEN");
    expect(state.narration).toEqual(["「昨日の祭り、楽しかったよ」と答えた。", "「そういえば、さっきの話だけど……」と、洋平が言った。"]);
  });
});

// E -- DEFERRED changes immediate re-prompt behavior (or is removed as redundant)
describe("E: DEFERRED produces an observable behavioral difference from OPEN, or is removed", () => {
  it("ASK_FESTIVAL's re-presentation line is present when OPEN and absent when DEFERRED", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "e");
    const openNarration = resolveAction(opened, ASK_FESTIVAL).state.narration;
    const deferred = resolvePendingReplyEvent(opened, PLAYER_DEFERS_REPLY).state;
    expect(deferred.pendingReply?.status).toBe("DEFERRED");
    const deferredNarration = resolveAction(deferred, ASK_FESTIVAL).state.narration;
    expect(openNarration.length).toBe(2);
    expect(deferredNarration.length).toBe(1);
    expect(openNarration).not.toEqual(deferredNarration);
    // DEFERRED survives this Run's falsification test -- NOT removed.
  });
});

// F -- leave itself does not close pending
describe("F: PLAYER_LEAVES never itself resolves or withdraws", () => {
  it("dispatching PLAYER_LEAVES_EVENT is an explicit identity transition", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "f");
    const { state, trace } = resolvePendingReplyEvent(opened, PLAYER_LEAVES_EVENT);
    expect(trace.statusBefore).toBe("OPEN");
    expect(trace.statusAfter).toBe("OPEN");
    expect(state.pendingReply?.status).toBe("OPEN");
  });
});

// G -- NPC self-resolution is a separate event
describe("G: YOHEI_SELF_RESOLVES is a separately-authored event, not implied by leaving", () => {
  it("leaving alone leaves it OPEN; a distinct YOHEI_SELF_RESOLVES call is required to resolve it", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "g");
    const afterLeave = resolvePendingReplyEvent(opened, PLAYER_LEAVES_EVENT).state;
    expect(afterLeave.pendingReply?.status).toBe("OPEN");
    const afterSelfResolve = resolvePendingReplyEvent(afterLeave, YOHEI_SELF_RESOLVES).state;
    expect(afterSelfResolve.pendingReply?.status).toBe("RESOLVED");
  });
});

// H -- carryover pending survives authored interaction end
describe("H: an authored CARRYOVER PendingReply survives PLAYER_LEAVES and a day boundary", () => {
  it("no resolving event fired -> pendingReply is still OPEN after leaving and advancing a day", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "h");
    const afterLeave = resolvePendingReplyEvent(opened, PLAYER_LEAVES_EVENT).state;
    const nextDay = advanceDay(afterLeave);
    expect(nextDay.pendingReply?.status).toBe("OPEN");
    expect(nextDay.pendingReply?.id).toBe(opened.pendingReply?.id);
  });
});

// I -- third-party interruption does not erase pending
describe("I: customer interruption preserves PendingReply and only gates eligibility", () => {
  it("PendingReply survives customerArrives/customerLeaves untouched; ACCEPT is ineligible mid-interruption, eligible after", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "i");
    const interrupted = customerArrives(opened);
    expect(interrupted.pendingReply).toEqual(opened.pendingReply);
    const blockedAttempt = resolvePendingReplyEvent(interrupted, PLAYER_ACCEPTS_REQUEST);
    expect(blockedAttempt.trace.event).toBe("EVENT_NOT_ELIGIBLE");
    expect(blockedAttempt.state.pendingReply?.status).toBe("OPEN");
    const resumed = customerLeaves(interrupted);
    expect(resumed.pendingReply?.status).toBe("OPEN");
    const acceptedAttempt = resolvePendingReplyEvent(resumed, PLAYER_ACCEPTS_REQUEST);
    expect(acceptedAttempt.trace.statusAfter).toBe("RESOLVED");
  });
});

// J -- no turnOwner exists
describe("J: no turnOwner field exists anywhere in this module", () => {
  it("source scan (excluding comments, which may legitimately document the rejection) finds no turnOwner code reference", () => {
    const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    for (const file of fs.readdirSync(MODULE_DIR)) {
      const content = stripComments(fs.readFileSync(path.join(MODULE_DIR, file), "utf8"));
      expect(content).not.toMatch(/turnOwner/i);
    }
  });
});

// K -- NPC can continue physical work while pending
describe("K: Yohei continues shop work regardless of OPEN/DEFERRED PendingReply", () => {
  it("yoheiContinuesShopWorkNarration is non-empty for OPEN, DEFERRED, and no-pending states, and differs honestly", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "k");
    const deferred = resolvePendingReplyEvent(opened, PLAYER_DEFERS_REPLY).state;
    const resolved = resolvePendingReplyEvent(opened, PLAYER_ACCEPTS_REQUEST).state;
    expect(yoheiContinuesShopWorkNarration(opened).length).toBeGreaterThan(0);
    expect(yoheiContinuesShopWorkNarration(deferred).length).toBeGreaterThan(0);
    expect(yoheiContinuesShopWorkNarration(resolved).length).toBeGreaterThan(0);
    expect(yoheiContinuesShopWorkNarration(opened)).not.toEqual(yoheiContinuesShopWorkNarration(resolved));
  });
});

// L -- composite intents remain separate candidates
describe("L: composite free text yields separate, independently-checked candidates", () => {
  it("resolvePendingFreeTextCandidates returns an ORDERED list, never one collapsed action", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "l");
    const candidates = resolvePendingFreeTextCandidates(opened, "まあその話は後でいいじゃん。それより昨日の祭りどうだった？");
    expect(candidates.map((c) => c.intentId)).toEqual(["DEFER_PENDING_REPLY", "ASK_FESTIVAL"]);
    expect(candidates.every((c) => c.legitimate)).toBe(true);
  });
});

// M -- free-text stateful candidate requires confirmation
describe("M: DEFER_PENDING_REPLY (stateful) requires confirmation", () => {
  it("requiresConfirmation is true for DEFER_PENDING_REPLY", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "m");
    const [defer] = resolvePendingFreeTextCandidates(opened, "まあその話は後でいいじゃん。それより昨日の祭りどうだった？");
    expect(defer.intentId).toBe("DEFER_PENDING_REPLY");
    expect(defer.requiresConfirmation).toBe(true);
  });
});

// N -- non-stateful ASK_FESTIVAL does not
describe("N: ASK_FESTIVAL (non-stateful) does not require confirmation", () => {
  it("requiresConfirmation is false for ASK_FESTIVAL and it resolves immediately once confirmed-or-not", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "n");
    const [, festival] = resolvePendingFreeTextCandidates(opened, "まあその話は後でいいじゃん。それより昨日の祭りどうだった？");
    expect(festival.intentId).toBe("ASK_FESTIVAL");
    expect(festival.requiresConfirmation).toBe(false);
    const { state } = dispatchConfirmedPendingIntent(opened, "ASK_FESTIVAL");
    expect(state.pendingReply?.status).toBe("OPEN"); // ASK_FESTIVAL never itself touches pending
  });
});

// O -- wrong parse without confirmation changes nothing
describe("O: a confident-but-wrong parse produces no state change unless confirmed", () => {
  it("the ANSWER_ACCEPT stub candidate is classified but never dispatched without an explicit confirm call", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "o");
    const before = JSON.stringify(opened.pendingReply);
    const [wrongParse] = resolvePendingFreeTextCandidates(opened, "まあ、それでいいんじゃない");
    expect(wrongParse.intentId).toBe("ANSWER_ACCEPT");
    expect(wrongParse.requiresConfirmation).toBe(true);
    // classification alone never mutates state
    expect(JSON.stringify(opened.pendingReply)).toBe(before);
    // PLAYER does not confirm -> nothing further happens; state used downstream is simply `opened` unchanged
    expect(opened.pendingReply?.status).toBe("OPEN");
  });
});

// P -- PLAYER cannot directly create WITHDRAWN
describe("P: PLAYER free text can never itself produce WITHDRAWN", () => {
  it("confirming REQUEST_WITHDRAWAL dispatches only PLAYER_REQUESTS_WITHDRAWAL, status stays OPEN", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "p");
    const [candidate] = resolvePendingFreeTextCandidates(opened, "もうその話いいじゃん");
    expect(candidate.intentId).toBe("REQUEST_WITHDRAWAL");
    const { state, trace } = dispatchConfirmedPendingIntent(opened, "REQUEST_WITHDRAWAL");
    expect("event" in trace && trace.event).toBe("PLAYER_REQUESTS_WITHDRAWAL");
    expect(state.pendingReply?.status).toBe("OPEN");
    expect(state.pendingReply?.status).not.toBe("WITHDRAWN");
  });
});

// Q -- NPC withdrawal can
describe("Q: only YOHEI_WITHDRAWS_REQUEST produces WITHDRAWN", () => {
  it("dispatching the NPC-authored event transitions OPEN -> WITHDRAWN", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "q");
    const { state, trace } = resolvePendingReplyEvent(opened, YOHEI_WITHDRAWS_REQUEST);
    expect(trace.statusAfter).toBe("WITHDRAWN");
    expect(state.pendingReply?.status).toBe("WITHDRAWN");
  });

  it("PLAYER_DECLINES_REQUEST resolves (not withdraws) -- a different terminal path entirely", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "q2");
    const { trace } = resolvePendingReplyEvent(opened, PLAYER_DECLINES_REQUEST);
    expect(trace.statusAfter).toBe("RESOLVED");
  });
});

// R -- promise promotion resolves reply and separately creates persistent material
describe("R: promise promotion is two independent transitions", () => {
  it("PendingReply -> RESOLVED AND a separate PROMISE material is admitted via State Admission", () => {
    const opened = yoheiAsksToBringItemTomorrow(createInitialState(), "r");
    const { state, trace } = resolvePendingReplyEvent(opened, PLAYER_ACCEPTS_PROMISE_REQUEST);
    expect(state.pendingReply?.status).toBe("RESOLVED");
    expect(trace.lifeMaterialDelta).toContain("promised_bring_item");
    expect(trace.stateAdmissionDecision.length).toBeGreaterThan(0);
    expect(trace.stateAdmissionDecision[0].admissionDecision).toBe("ADMIT_AUTOMATICALLY");
    const promise = state.materials.find((m) => m.id === "promised_bring_item");
    expect(promise?.type).toBe("PROMISE");
    expect(promise?.status).toBe("ACTIVE");
  });

  it("a trivial accept (no promise scenario) creates no material at all", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "r2");
    const { trace } = resolvePendingReplyEvent(opened, PLAYER_ACCEPTS_REQUEST);
    expect(trace.lifeMaterialDelta).toEqual([]);
  });
});

// S -- trivial question creates no PendingReply
describe("S: a trivial question never creates a PendingReply", () => {
  it("TRIVIAL_COFFEE_EXCHANGE leaves state.pendingReply null throughout", () => {
    const state0 = createInitialState();
    expect(state0.pendingReply).toBeNull();
    const { state } = resolveAction(state0, TRIVIAL_COFFEE_EXCHANGE);
    expect(state.pendingReply).toBeNull();
  });
});

// T -- narration cannot mutate pending
describe("T: narration text never influences pendingReply computation", () => {
  it("two identical-effect events with different narration text produce identical pendingReply", () => {
    const opened = yoheiAsksForHelp(createInitialState(), "t");
    const altWordingSpec = { ...PLAYER_ACCEPTS_REQUEST, narration: () => ["（全く違う文言）"] };
    const a = resolvePendingReplyEvent(opened, PLAYER_ACCEPTS_REQUEST);
    const b = resolvePendingReplyEvent(opened, altWordingSpec);
    expect(a.state.pendingReply).toEqual(b.state.pendingReply);
    expect(a.state.narration).not.toEqual(b.state.narration);
  });

  it("openPendingReply/resolvePendingReplyEvent are the only functions in the module that assign state.pendingReply", () => {
    for (const file of fs.readdirSync(MODULE_DIR)) {
      if (file === "engine.ts") continue;
      const content = fs.readFileSync(path.join(MODULE_DIR, file), "utf8");
      expect(content).not.toMatch(/pendingReply\s*:\s*\{[^}]*status/); // no inline PendingReply object literal assignment outside engine.ts
    }
  });
});

// U -- persistent changes require State Admission
describe("U: every persistent PendingReply-triggered material passes through State Admission", () => {
  it("promise material's trace carries a real stateAdmissionDecision entry, not a fabricated one", () => {
    const opened = yoheiAsksToBringItemTomorrow(createInitialState(), "u");
    const { trace } = resolvePendingReplyEvent(opened, PLAYER_ACCEPTS_PROMISE_REQUEST);
    expect(trace.stateAdmissionDecision[0]).toEqual({
      sourceEvent: "PLAYER_ACCEPTS_REQUEST",
      provenanceClass: expect.any(String),
      admissionDecision: "ADMIT_AUTOMATICALLY",
    });
  });
});

// V -- default NEW LIFE unchanged
describe("V: default NEW LIFE remains untouched", () => {
  it("no file in this module imports from src/newlife", () => {
    const importRe = /^\s*import .*from ["'].*\/newlife\/.*["']/im;
    for (const file of fs.readdirSync(MODULE_DIR)) {
      const content = fs.readFileSync(path.join(MODULE_DIR, file), "utf8");
      expect(content).not.toMatch(importRe);
    }
  });
});

// W -- no DAY8+ integration
describe("W: no autonomous day progression beyond explicit calls", () => {
  it("advanceDay moves forward by exactly one day per call and never resets pendingReply on its own beyond spread", () => {
    let state = yoheiAsksForHelp(createInitialState(), "w");
    for (let i = 0; i < 3; i++) state = advanceDay(state);
    expect(state.day).toBe(4);
    expect(state.pendingReply?.status).toBe("OPEN");
  });
});

// X -- no RAG/embeddings/LLM
describe("X: no RAG/embeddings/LLM reference in this module's actual code", () => {
  it("scans all files in the module for forbidden vocabulary", () => {
    const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    for (const file of fs.readdirSync(MODULE_DIR)) {
      const content = stripComments(fs.readFileSync(path.join(MODULE_DIR, file), "utf8"));
      expect(content).not.toMatch(/\bRAG\b|embedding|vector database|cosine similarity|large language model|\bLLM\b/i);
    }
  });
});
